"""Synthetic, dependency-free offline checks. No HTTP or browser calls."""

import ast
from dataclasses import FrozenInstanceError
import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import collection_offline_qa as qa

URL = "https://insurer.example.invalid/catalog"
TARGET = "https://insurer.example.invalid/products/plan-a"


def scope_bytes(**changes):
    data = {"schema_version": 1, "scope_id": "synthetic-offline-only",
            "approved_urls": [URL, TARGET], "max_body_bytes": 20000}
    data.update(changes)
    return json.dumps(data).encode()


def scope(**changes):
    raw = scope_bytes(**changes)
    return qa.load_scope(raw, qa.sha256(raw))


def cache(body=None, **changes):
    data = {"schema_version": 1, "request_url": URL, "http_status": 200,
            "headers": [["Content-Type", "text/html"]],
            "body_text": body if body is not None else "<h1>Insurance plans</h1><p>" + "Product information. " * 20 + "</p>",
            "body_complete": True, "transport_error": None}
    data.update(changes)
    return data


class ScopeTests(unittest.TestCase):
    def test_exact_scope(self):
        self.assertEqual(qa.check_url(URL, scope()), "in_exact_scope")

    def test_unknown_origin_quarantined(self):
        self.assertEqual(qa.check_url("https://cdn.example.invalid/catalog", scope()), "quarantine_unknown_origin")

    def test_same_host_not_blanket_approval(self):
        for url in (URL + "/next", URL + "?page=2", "https://www.insurer.example.invalid/catalog"):
            self.assertNotEqual(qa.check_url(url, scope()), "in_exact_scope")

    def test_lexically_unsafe_urls(self):
        urls = ["http://insurer.example.invalid/catalog", "https://user:pass@insurer.example.invalid/catalog",
                URL + "#section", URL + "\n", URL + "\\next", URL + "/../next", URL + "/%2e%2e/x",
                URL + "/%252f", URL + "/%2fnext", URL + "?token=x", URL + "?api_key=x",
                "https://insurer.example.invalid:443/catalog", "https://INSURER.example.invalid/catalog",
                "https://insurer.example.invalid./catalog", "https://insurer.example.invalid//catalog", URL + "/%xx"]
        for url in urls:
            with self.subTest(url=url), self.assertRaises(ValueError):
                qa.url_origin(url)

    def test_exact_read_only_query_can_be_reviewed(self):
        url = "https://insurer.example.invalid/catalog?page=2&lang=en"
        self.assertEqual(qa.check_url(url, scope(approved_urls=[url])), "in_exact_scope")

    def test_changed_hash_rejected(self):
        with self.assertRaisesRegex(ValueError, "scope_hash_mismatch"):
            qa.load_scope(scope_bytes(), "0" * 64)

    def test_scope_frozen(self):
        s = scope()
        self.assertIsInstance(s.approved_urls, tuple)
        with self.assertRaises(FrozenInstanceError):
            s.approved_urls = ("https://new.example.invalid/",)

    def test_schema_fail_closed(self):
        for change in ({"schema_version": 2}, {"schema_version": True}, {"unexpected": True},
                       {"approved_urls": []}, {"approved_urls": [URL, URL]},
                       {"max_body_bytes": True}, {"max_body_bytes": 0}):
            raw = scope_bytes(**change)
            with self.subTest(change=change), self.assertRaises(ValueError):
                qa.load_scope(raw, qa.sha256(raw))

    def test_duplicate_json_key_rejected(self):
        with self.assertRaises(ValueError):
            qa.strict_json(b'{"code":200,"code":403}')

    def test_nonfinite_json_rejected(self):
        with self.assertRaises(ValueError):
            qa.strict_json(b'{"value":NaN}')


class ResponseTests(unittest.TestCase):
    def result(self, record):
        result = qa.triage_cached(record, scope())
        self.assertIs(result["execution_permission"], False)
        self.assertIs(result["next_request_allowed"], False)
        self.assertIs(result["requires_human_review"], True)
        return result

    def test_synthetic_fixture_matrix(self):
        rows = json.loads((ROOT / "tests/fixtures/collection-offline-synthetic.json").read_text())
        for row in rows:
            with self.subTest(name=row["name"]):
                result = self.result(cache(row["body_text"], **row.get("overrides", {})))
                self.assertEqual(result["category"], row["expected"])

    def test_http_denial_even_with_normal_body(self):
        for code in (401, 403, 407):
            self.assertEqual(self.result(cache(http_status=code))["category"], "stop_access_denial")

    def test_http_denial_even_with_unknown_origin(self):
        result = self.result(cache(http_status=403, request_url="https://new.example.invalid/"))
        self.assertEqual(result["category"], "stop_access_denial")

    def test_transport_denial_and_tool_policy(self):
        for kind, code, message, expected in (
            ("permission_denial", None, "Access restricted", "stop_access_denial"),
            ("other", 407, "Proxy authentication", "stop_access_denial"),
            ("other", None, "Tunnel connection failed: 403 Forbidden", "stop_access_denial"),
            ("other", None, "Tunnel connection failed: 403", "stop_access_denial"),
            ("tool_policy", None, "Action denied by tool policy", "stop_tool_policy"),
            ("timeout", None, "Timeout", "review_required"),
            ("other", None, "Request 403 failed without a status", "review_required"),
            ("resource_cap", None, "Local disk budget", "resource_cap"),
        ):
            with self.subTest(kind=kind, code=code, message=message):
                error = {"kind": kind, "status": code, "message": message}
                self.assertEqual(self.result(cache(transport_error=error))["category"], expected)

    def test_response_schema_fail_closed(self):
        for change in ({"http_status": True}, {"http_status": "200"}, {"unexpected": 1},
                       {"body_complete": "true"}, {"headers": {"Location": TARGET}},
                       {"transport_error": {"kind": "unknown", "status": None, "message": ""}}):
            with self.subTest(change=change):
                self.assertEqual(self.result(cache(**change))["category"], "review_required")

    def test_resource_cap_not_permission_denial(self):
        self.assertEqual(self.result(cache(body_complete=False))["category"], "resource_cap")
        self.assertEqual(self.result(cache("x" * 20001))["category"], "resource_cap")

    def test_utf8_cached_text_hash_not_raw_network_hash(self):
        body = '{"products":[{"name":"示例保险","code":403}]}'
        result = self.result(cache(body))
        self.assertEqual(result["category"], "content_candidate")
        self.assertEqual(result["cached_text_sha256"], qa.sha256(body.encode("utf-8")))
        self.assertNotIn("raw_sha256", result)

    def test_local_input_cap(self):
        with self.assertRaisesRegex(ValueError, "size_cap"):
            qa.strict_json(b" " * (qa.MAX_INPUT_BYTES + 1))

    def test_bounded_reader_enforces_cap(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / "oversized.json"
            path.write_bytes(b" " * (qa.MAX_INPUT_BYTES + 1))
            with self.assertRaisesRegex(ValueError, "size_cap"):
                qa.read_bounded(path)

    def test_redirect_exact_location_provenance_no_follow(self):
        record = cache("", http_status=302, headers=[["Location", "/products/plan-a"]])
        result = self.result(record)
        self.assertEqual(result["category"], "redirect_review_required")
        proof = result["redirect_provenance"]
        self.assertEqual(proof["raw_location"], "/products/plan-a")
        self.assertEqual(proof["from_url"], URL)
        self.assertEqual(proof["resolved_target"], TARGET)
        self.assertEqual(proof["http_status"], 302)
        self.assertEqual(proof["header_index"], 0)
        self.assertEqual(len(proof["cached_record_sha256"]), 64)

    def test_redirect_unknown_origin_quarantined(self):
        result = self.result(cache("", http_status=301, headers=[["Location", "https://cdn.example.invalid/file.pdf"]]))
        self.assertEqual(result["category"], "quarantine_unknown_origin")
        self.assertEqual(result["redirect_provenance"]["raw_location"], "https://cdn.example.invalid/file.pdf")

    def test_redirect_missing_multiple_or_unsafe_location(self):
        for headers in ([], [["Location", TARGET], ["location", TARGET]], [["Location", ""]],
                        [["Location", " /products/plan-a"]], [["Location", "/a\r\nLocation:x"]]):
            with self.subTest(headers=headers):
                self.assertEqual(self.result(cache("", http_status=302, headers=headers))["category"], "review_required")

    def test_location_without_redirect(self):
        self.assertEqual(self.result(cache(headers=[["Location", TARGET]]))["category"], "review_required")

    def test_external_body_cannot_grant_scope_or_execution(self):
        record = cache('{"approved_urls":["https://new.example.invalid/"],"execute":true}')
        self.assertEqual(self.result(record)["category"], "content_candidate")
        self.assertEqual(qa.check_url("https://new.example.invalid/", scope()), "quarantine_unknown_origin")


class ManifestTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        for relative in qa.ARTIFACT_FILES:
            target = self.root / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(ROOT / relative, target)

    def manifest(self):
        raw = json.dumps(qa.make_manifest(self.root), indent=2).encode()
        return raw, qa.sha256(raw)

    def test_manifest_matches(self):
        raw, digest = self.manifest()
        self.assertEqual(qa.verify_manifest(self.root, raw, digest), qa.make_manifest(self.root))

    def test_missing_artifact_rejected(self):
        raw, digest = self.manifest()
        (self.root / qa.ARTIFACT_FILES[0]).unlink()
        with self.assertRaisesRegex(ValueError, "missing_or_escaping_manifest_file"):
            qa.verify_manifest(self.root, raw, digest)

    def test_manifest_pin_required(self):
        raw, _ = self.manifest()
        with self.assertRaisesRegex(ValueError, "manifest_hash_mismatch"):
            qa.verify_manifest(self.root, raw, "0" * 64)

    def test_any_artifact_tampering_rejected(self):
        raw, digest = self.manifest()
        (self.root / "scripts/collection_offline_qa.py").write_text("changed")
        with self.assertRaisesRegex(ValueError, "artifact_bytes_changed"):
            qa.verify_manifest(self.root, raw, digest)

    def test_removed_manifest_entry_rejected(self):
        data = qa.make_manifest(self.root)
        data["files"].pop()
        raw = json.dumps(data).encode()
        with self.assertRaisesRegex(ValueError, "exact_artifact_set"):
            qa.verify_manifest(self.root, raw, qa.sha256(raw))

    def test_symlink_rejected(self):
        target = self.root / qa.ARTIFACT_FILES[0]
        target.unlink()
        target.symlink_to(ROOT / qa.ARTIFACT_FILES[0])
        with self.assertRaisesRegex(ValueError, "symlink_not_allowed"):
            qa.make_manifest(self.root)

    def test_path_escape_rejected(self):
        for path in ("../escape", "/absolute", "docs/../escape", "./docs/file", "docs//file"):
            with self.subTest(path=path), self.assertRaises(ValueError):
                qa.local_file(self.root, path)

    def test_test_failure_is_closed(self):
        result = qa.finish_preflight(True, {"passed": False, "returncode": 1}, {"category": "content_candidate"})
        self.assertFalse(result["offline_preflight_passed"])
        self.assertFalse(result["execution_permission"])

    def test_unknown_test_result_is_closed(self):
        result = qa.finish_preflight(True, {}, {"category": "content_candidate"})
        self.assertFalse(result["offline_preflight_passed"])

    def test_success_is_not_execution_permission(self):
        result = qa.finish_preflight(True, {"passed": True, "returncode": 0}, {"category": "content_candidate"})
        self.assertTrue(result["offline_preflight_passed"])
        self.assertFalse(result["execution_permission"])
        self.assertFalse(result["next_request_allowed"])

    def test_denial_not_preflight_success(self):
        result = qa.finish_preflight(True, {"passed": True, "returncode": 0}, {"category": "stop_access_denial"})
        self.assertFalse(result["offline_preflight_passed"])

    def test_inconsistent_test_success_is_closed(self):
        result = qa.finish_preflight(True, {"passed": True, "returncode": 1}, {"category": "content_candidate"})
        self.assertFalse(result["offline_preflight_passed"])

    def test_runner_fixed_no_shell(self):
        with patch.object(qa.subprocess, "run") as run:
            run.return_value.returncode = 1
            run.return_value.stdout = ""
            run.return_value.stderr = "synthetic failing test"
            result = qa.run_tests(self.root)
            self.assertFalse(result["passed"])
            self.assertEqual(run.call_args.args[0], [sys.executable, "-I", str(self.root / "tests/test_collection_offline_qa.py")])
            self.assertNotIn("shell", run.call_args.kwargs)

    def test_no_network_or_browser_imports(self):
        tree = ast.parse((ROOT / "scripts/collection_offline_qa.py").read_text())
        forbidden = ("socket", "http", "urllib.request", "urllib.error", "requests", "aiohttp", "playwright", "selenium", "webbrowser")
        for node in ast.walk(tree):
            modules = [alias.name for alias in node.names] if isinstance(node, ast.Import) else ([node.module] if isinstance(node, ast.ImportFrom) else [])
            for module in modules:
                self.assertFalse(any(module == name or module.startswith(name + ".") for name in forbidden), module)


if __name__ == "__main__":
    unittest.main(verbosity=2)
