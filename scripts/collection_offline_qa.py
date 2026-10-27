#!/usr/bin/env python3
"""Offline-only scope, cached-response and integrity triage; no acquisition code.

All triage/preflight results retain execution_permission=False. A positive result is not access,
privacy, legal, material-acceptance, product-identity or publication clearance.
"""

import argparse
from dataclasses import dataclass
import hashlib
from html.parser import HTMLParser
import ipaddress
import json
from pathlib import Path, PurePosixPath
import re
import subprocess
import sys
from urllib.parse import parse_qsl, urljoin, urlsplit

SCHEMA_VERSION = 1
MAX_INPUT_BYTES = 4_000_000
DENIAL_CODES = {401, 403, 407}
REDIRECT_CODES = {301, 302, 303, 307, 308}
ARTIFACT_FILES = (
    "docs/COLLECTION_QA_PROTOCOL.md",
    "scripts/collection_offline_qa.py",
    "tests/test_collection_offline_qa.py",
    "tests/fixtures/collection-offline-synthetic.json",
    "examples/offline-collection/scope.json",
    "examples/offline-collection/cached-response.json",
)
DENIAL_TEXT = re.compile(
    r"\b(?:forbidden|unauthori[sz]ed|access denied|proxy authentication required)\b", re.I
)
SENSITIVE_KEY = re.compile(
    r"token|auth|api.?key|password|secret|signature|session|credential|cookie|email", re.I
)


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def read_bounded(path):
    with path.open("rb") as stream:
        raw = stream.read(MAX_INPUT_BYTES + 1)
    if len(raw) > MAX_INPUT_BYTES:
        raise ValueError("local_input_size_cap")
    return raw


def strict_json(raw):
    if len(raw) > MAX_INPUT_BYTES:
        raise ValueError("local_input_size_cap")

    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError("duplicate_json_key")
            result[key] = value
        return result

    return json.loads(raw, object_pairs_hook=pairs,
                      parse_constant=lambda _: (_ for _ in ()).throw(ValueError("nonfinite_json")))


def exact_keys(value, expected):
    if not isinstance(value, dict) or set(value) != set(expected):
        raise ValueError("unexpected_schema_keys")


def url_origin(url):
    """Conservative lexical check, never resolves DNS or opens a URL."""
    if not isinstance(url, str) or not url or len(url) > 4096:
        raise ValueError("invalid_url")
    if any(ord(c) <= 32 or ord(c) == 127 for c in url) or "\\" in url:
        raise ValueError("url_controls_whitespace_or_backslash")
    p = urlsplit(url)
    if p.scheme != "https" or p.username is not None or p.password is not None:
        raise ValueError("https_without_userinfo_required")
    if not p.hostname or p.netloc != p.hostname or p.fragment:
        raise ValueError("canonical_host_no_port_or_fragment_required")
    host = p.hostname
    if (not host.isascii() or host != host.lower() or host.endswith(".")
            or "." not in host or host.endswith((".local", ".internal", ".localhost"))
            or not re.fullmatch(r"[a-z0-9-]+(?:\.[a-z0-9-]+)+", host)
            or any(part.startswith("-") or part.endswith("-") for part in host.split("."))):
        raise ValueError("nonpublic_or_noncanonical_host")
    try:
        ipaddress.ip_address(host)
    except ValueError:
        pass
    else:
        raise ValueError("ip_literal_not_allowed")
    if not p.path.startswith("/") or "//" in p.path or any(x in {".", ".."} for x in p.path.split("/")):
        raise ValueError("noncanonical_path")
    # Exact approval still applies. Encoded separators/dots, double encoding and
    # control bytes need separate human review rather than normalization guesses.
    if re.search(r"%(?:2f|5c|2e|25|0[0-9a-f]|1[0-9a-f]|7f)", url, re.I):
        raise ValueError("ambiguous_encoded_url")
    if re.search(r"%(?![0-9a-fA-F]{2})", url):
        raise ValueError("invalid_percent_escape")
    for key, _ in parse_qsl(p.query, keep_blank_values=True):
        if SENSITIVE_KEY.search(key) or key.lower() in {"key", "sig", "sid"}:
            raise ValueError("sensitive_query_requires_separate_review")
    return "https://" + host


@dataclass(frozen=True)
class Scope:
    scope_id: str
    approved_urls: tuple
    max_body_bytes: int
    sha256: str


def load_scope(raw, expected_sha256):
    if not re.fullmatch(r"[a-f0-9]{64}", expected_sha256 or "") or sha256(raw) != expected_sha256:
        raise ValueError("scope_hash_mismatch")
    data = strict_json(raw)
    exact_keys(data, {"schema_version", "scope_id", "approved_urls", "max_body_bytes"})
    if type(data["schema_version"]) is not int or data["schema_version"] != SCHEMA_VERSION:
        raise ValueError("unsupported_scope_schema")
    if not isinstance(data["scope_id"], str) or not re.fullmatch(r"[a-z0-9-]{1,80}", data["scope_id"]):
        raise ValueError("invalid_scope_id")
    urls = data["approved_urls"]
    if not isinstance(urls, list) or not 1 <= len(urls) <= 1000:
        raise ValueError("finite_nonempty_allowlist_required")
    for url in urls:
        url_origin(url)
    if len(set(urls)) != len(urls):
        raise ValueError("duplicate_scope_url")
    cap = data["max_body_bytes"]
    if type(cap) is not int or not 1 <= cap <= 2_000_000:
        raise ValueError("invalid_body_cap")
    return Scope(data["scope_id"], tuple(urls), cap, expected_sha256)


def check_url(url, scope):
    try:
        origin = url_origin(url)
    except (ValueError, TypeError):
        return "quarantine_invalid_url"
    if origin not in {url_origin(u) for u in scope.approved_urls}:
        return "quarantine_unknown_origin"
    if url not in scope.approved_urls:
        return "quarantine_out_of_scope"
    return "in_exact_scope"


def decision(category, reason, **extra):
    return dict(category=category, reason=reason,
                execution_permission=False, next_request_allowed=False,
                requires_human_review=True, **extra)


class VisibleText(HTMLParser):
    """Static heuristic, not a renderer and not proof of browser visibility."""
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.text = []
        self.headings = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        hidden = (tag in {"script", "style", "template"}
                  or "hidden" in attrs or attrs.get("aria-hidden", "").lower() == "true"
                  or bool(re.search(r"display\s*:\s*none|visibility\s*:\s*hidden", attrs.get("style", ""), re.I)))
        if tag not in self.VOID:
            self.stack.append((tag, hidden))

    def handle_startendtag(self, tag, attrs):
        return

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                del self.stack[i:]
                return

    def handle_data(self, value):
        if not any(hidden for _, hidden in self.stack):
            self.text.append(value)
            if any(tag in {"title", "h1", "h2"} for tag, _ in self.stack):
                self.headings.append(value)


def json_signal(value):
    """Return denial / ambiguous / none; code=403 in product data is not HTTP."""
    found = set()
    status_keys = {"status", "statuscode", "httpstatus", "httpstatuscode", "code"}

    def walk(node, path=(), error_context=False):
        if len(path) > 40:
            found.add("ambiguous")
            return
        if isinstance(node, dict):
            normalized = {re.sub(r"[_-]", "", str(k)).lower(): v for k, v in node.items()}
            if len(normalized) != len(node):
                found.add("ambiguous")
            denial_fields = {k for k, v in normalized.items() if k in status_keys
                             and str(v).strip() in {"401", "403", "407"}}
            numeric = bool(denial_fields)
            message = " ".join(str(normalized.get(k, "")) for k in ("message", "detail", "reason", "title"))
            combined_status = any(re.fullmatch(r"(?:401|403|407)\s+(?:unauthori[sz]ed|forbidden|access denied|proxy authentication required)", str(v).strip(), re.I)
                                  for k, v in normalized.items() if k in status_keys)
            product_code = (denial_fields == {"code"} and not error_context
                            and (path[-1:] == ("product",) or path[-2:] == ("products", "[]")))
            if combined_status:
                found.add("denial" if error_context or not path else "ambiguous")
            if numeric and (error_context or (not path and DENIAL_TEXT.search(message))):
                found.add("denial")
            elif numeric and not path and any(str(normalized.get(k, "")) in {"401", "403", "407"}
                                               for k in ("httpstatus", "httpstatuscode", "statuscode")):
                found.add("denial")
            elif numeric and not product_code:
                found.add("ambiguous")
            if error_context and DENIAL_TEXT.search(message):
                found.add("denial")
            for key, child in node.items():
                key = str(key).lower()
                is_error = error_context or key in {"error", "errors", "fault"}
                if key in {"error", "errors", "fault"} and child not in (None, False, "", [], {}):
                    found.add("ambiguous")
                walk(child, path + (key,), is_error)
        elif isinstance(node, list):
            for child in node:
                walk(child, path + ("[]",), error_context)
        elif error_context and (str(node).strip() in {"401", "403", "407"} or DENIAL_TEXT.search(str(node))):
            found.add("denial")
        elif isinstance(node, str) and DENIAL_TEXT.fullmatch(node.strip()):
            found.add("ambiguous")

    walk(value)
    if "denial" in found:
        return "denial"
    if "ambiguous" in found:
        return "ambiguous"
    if isinstance(value, dict) and DENIAL_TEXT.search(str(value.get("message", ""))):
        return "ambiguous"
    return "none"


def triage_cached(record, scope):
    """Inspect supplied cached text only. Never fetch, retry or follow redirects."""
    try:
        exact_keys(record, {"schema_version", "request_url", "http_status", "headers", "body_text", "body_complete", "transport_error"})
        if type(record["schema_version"]) is not int or record["schema_version"] != SCHEMA_VERSION:
            raise ValueError("unsupported_cache_schema")
        status = record["http_status"]
        if status is not None and (type(status) is not int or not 100 <= status <= 599):
            raise ValueError("invalid_http_status")
        headers = record["headers"]
        if not isinstance(headers, list) or any(not isinstance(p, list) or len(p) != 2 or
                any(not isinstance(v, str) for v in p) for p in headers):
            raise ValueError("headers_must_preserve_pairs")
        if not isinstance(record["body_text"], str) or type(record["body_complete"]) is not bool:
            raise ValueError("invalid_cached_body")
        error = record["transport_error"]
        if error is not None:
            exact_keys(error, {"kind", "status", "message"})
            if error["kind"] not in {"tool_policy", "permission_denial", "resource_cap", "timeout", "other"}:
                raise ValueError("unknown_transport_error_kind")
            if error["status"] is not None and (type(error["status"]) is not int or not 100 <= error["status"] <= 599):
                raise ValueError("invalid_transport_status")
            if not isinstance(error["message"], str):
                raise ValueError("invalid_transport_message")
    except (ValueError, TypeError) as exc:
        return decision("review_required", str(exc))

    # Positive denial evidence wins even when source scope is also invalid.
    if status in DENIAL_CODES or (error and (error["status"] in DENIAL_CODES or error["kind"] == "permission_denial")):
        return decision("stop_access_denial", "recorded_http_or_transport_permission_denial")
    if error and error["kind"] == "tool_policy":
        return decision("stop_tool_policy", "recorded_tool_policy_denial")
    if error and re.search(r"\b(?:401\s+unauthori[sz]ed|403\s+forbidden|407\s+proxy authentication required|(?:tunnel connection failed|http status|http error|http response)\s*:?\s*(?:401|403|407)\b)", error["message"], re.I):
        return decision("stop_access_denial", "explicit_transport_denial_message")
    scope_result = check_url(record["request_url"], scope)
    if scope_result != "in_exact_scope":
        return decision(scope_result, "source_not_in_frozen_exact_allowlist")
    if error:
        return decision("resource_cap" if error["kind"] == "resource_cap" else "review_required",
                        "local_resource_limit" if error["kind"] == "resource_cap" else "transport_failure_no_automatic_retry")

    body = record["body_text"]
    body_bytes = body.encode("utf-8")
    if len(body_bytes) > scope.max_body_bytes or not record["body_complete"]:
        return decision("resource_cap", "oversized_or_incomplete_cache_not_permission_denial")
    evidence = {"cached_text_sha256": sha256(body_bytes), "cached_text_bytes": len(body_bytes)}
    # This hash identifies supplied UTF-8 text, NOT original network/PDF bytes.
    signal = "none"
    stripped = body.strip()
    if stripped.startswith(("{", "[")):
        try:
            signal = json_signal(strict_json(body_bytes))
        except (ValueError, TypeError, RecursionError):
            return decision("review_required", "malformed_or_ambiguous_json", **evidence)
        if signal == "denial":
            return decision("stop_access_denial", "application_error_context_denial", **evidence)
        if signal == "ambiguous":
            return decision("review_required", "ambiguous_application_status", **evidence)
    else:
        parser = VisibleText()
        parser.feed(body)
        visible = " ".join(" ".join(parser.text).split())
        headings = " ".join(parser.headings)
        protection = bool(re.search(r"_incapsula_resource|cf-chl-|/cdn-cgi/challenge-platform", body, re.I))
        challenge = re.search(r"request unsuccessful|request rejected|verify (?:that )?you are human|checking your browser|complete the security check|just a moment|(?:sign in|log in|login) to (?:continue|access|view)|authentication required", visible, re.I)
        denial_heading = DENIAL_TEXT.search(headings)
        bare_denial = DENIAL_TEXT.fullmatch(visible.strip(" .:!"))
        if challenge or denial_heading or bare_denial:
            return decision("stop_challenge", "visible_denial_or_challenge", **evidence)
        if protection and len(visible) < 200:
            return decision("stop_challenge", "sparse_protection_response_not_product_evidence", **evidence)
        if re.search(r"\b(?:401\s+unauthori[sz]ed|403\s+forbidden|407\s+proxy authentication required)\b", visible, re.I) and len(visible) < 500:
            return decision("stop_access_denial", "short_explicit_denial_response", **evidence)
        if re.search(r"404|page not found", headings, re.I):
            return decision("not_found", "visible_not_found_heading", **evidence)
        if len(visible) < 200:
            signal = "sparse"

    if status in REDIRECT_CODES:
        locations = [(i, value) for i, (key, value) in enumerate(headers) if key.lower() == "location"]
        if len(locations) != 1:
            return decision("review_required", "redirect_requires_one_exact_location_header", **evidence)
        index, location = locations[0]
        if not location or any(ord(c) <= 32 or ord(c) == 127 for c in location) or "\\" in location:
            return decision("review_required", "unsafe_or_empty_location", **evidence)
        target = urljoin(record["request_url"], location)
        target_scope = check_url(target, scope)
        return decision("redirect_review_required" if target_scope == "in_exact_scope" else target_scope,
                        "location_preserved_no_follow_performed", redirect_provenance={
                            "from_url": record["request_url"], "http_status": status,
                            "header_index": index, "raw_location": location,
                            "resolved_target": target, "target_scope": target_scope,
                            "cached_record_sha256": sha256(json.dumps(record, sort_keys=True, ensure_ascii=False).encode())
                        }, **evidence)
    if any(key.lower() == "location" for key, _ in headers):
        return decision("review_required", "location_without_supported_redirect_status", **evidence)
    if status == 404:
        return decision("not_found", "http_404_not_permission_denial", **evidence)
    if status is not None and 500 <= status <= 599:
        return decision("transient_server_error", "server_failure_no_automatic_retry", **evidence)
    if status != 200 or signal == "sparse" or not stripped:
        return decision("review_required", "insufficient_or_nonstandard_response", **evidence)
    return decision("content_candidate", "no_detected_denial_manual_content_review_still_required", **evidence)


def local_file(root, relative):
    p = PurePosixPath(relative)
    if not isinstance(relative, str) or p.is_absolute() or ".." in p.parts or p.as_posix() != relative:
        raise ValueError("unsafe_manifest_path")
    current = root
    for part in p.parts:
        current = current / part
        if current.is_symlink():
            raise ValueError("symlink_not_allowed")
    if not current.is_file() or not current.resolve().is_relative_to(root.resolve()):
        raise ValueError("missing_or_escaping_manifest_file")
    return current


def make_manifest(root):
    files = []
    for relative in ARTIFACT_FILES:
        raw = read_bounded(local_file(root, relative))
        files.append({"path": relative, "bytes": len(raw), "sha256": sha256(raw)})
    return {"schema_version": SCHEMA_VERSION, "purpose": "offline-collection-qa", "files": files}


def verify_manifest(root, raw, expected_sha256):
    if sha256(raw) != expected_sha256:
        raise ValueError("manifest_hash_mismatch")
    manifest = strict_json(raw)
    exact_keys(manifest, {"schema_version", "purpose", "files"})
    if type(manifest["schema_version"]) is not int or manifest["schema_version"] != SCHEMA_VERSION or manifest["purpose"] != "offline-collection-qa":
        raise ValueError("unsupported_manifest_schema")
    rows = manifest["files"]
    if not isinstance(rows, list):
        raise ValueError("manifest_files_not_list")
    for row in rows:
        exact_keys(row, {"path", "bytes", "sha256"})
        if not isinstance(row["path"], str) or type(row["bytes"]) is not int or row["bytes"] < 0 or not isinstance(row["sha256"], str) or not re.fullmatch(r"[a-f0-9]{64}", row["sha256"]):
            raise ValueError("invalid_manifest_entry")
    if sorted(r["path"] for r in rows) != sorted(ARTIFACT_FILES):
        raise ValueError("manifest_must_cover_exact_artifact_set")
    if manifest != make_manifest(root):
        raise ValueError("artifact_bytes_changed")
    return manifest


def run_tests(root):
    result = subprocess.run([sys.executable, "-I", str(root / "tests/test_collection_offline_qa.py")],
                            cwd=root, capture_output=True, text=True, timeout=60, check=False)
    return {"passed": result.returncode == 0, "returncode": result.returncode,
            "stdout": result.stdout, "stderr": result.stderr}


def finish_preflight(manifest_ok, test_result, response_result):
    passed = (manifest_ok is True and test_result.get("passed") is True
              and type(test_result.get("returncode")) is int and test_result["returncode"] == 0
              and response_result.get("category") == "content_candidate")
    return {"offline_preflight_passed": passed, "execution_permission": False,
            "next_request_allowed": False, "tests": test_result,
            "cached_response": response_result,
            "meaning": "Integrity and offline examples only; no acquisition or publication authority."}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    m = commands.add_parser("manifest", help="Print hashes; independently review and pin them before use")
    m.add_argument("--root", type=Path, default=Path("."))
    t = commands.add_parser("triage", help="Read a cached JSON record only")
    t.add_argument("--scope", type=Path, required=True)
    t.add_argument("--scope-sha256", required=True)
    t.add_argument("--cache", type=Path, required=True)
    p = commands.add_parser("preflight", help="Verify pinned files, run offline tests and check synthetic example")
    p.add_argument("--root", type=Path, default=Path("."))
    p.add_argument("--manifest", type=Path, required=True)
    p.add_argument("--manifest-sha256", required=True)
    args = parser.parse_args()
    try:
        if args.command == "manifest":
            result = make_manifest(args.root.resolve())
        elif args.command == "triage":
            scope = load_scope(read_bounded(args.scope), args.scope_sha256)
            result = triage_cached(strict_json(read_bounded(args.cache)), scope)
        else:
            root = args.root.resolve()
            verify_manifest(root, read_bounded(args.manifest), args.manifest_sha256)
            scope_raw = read_bounded(local_file(root, "examples/offline-collection/scope.json"))
            scope = load_scope(scope_raw, sha256(scope_raw))  # Bytes already pinned by manifest above.
            cache = strict_json(read_bounded(local_file(root, "examples/offline-collection/cached-response.json")))
            result = finish_preflight(True, run_tests(root), triage_cached(cache, scope))
        print(json.dumps(result, ensure_ascii=False, indent=2))
        if args.command == "preflight":
            return 0 if result["offline_preflight_passed"] else 2
        return 0 if args.command == "manifest" or result["category"] == "content_candidate" else 2
    except (ValueError, TypeError, OSError, RecursionError, subprocess.TimeoutExpired) as exc:
        print(json.dumps(decision("review_required", "offline_check_failed", error_type=type(exc).__name__, error=str(exc))))
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
