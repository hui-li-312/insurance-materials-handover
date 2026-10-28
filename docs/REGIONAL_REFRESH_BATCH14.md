# Batch 14 — exact-version PDF wording metadata

## What changes, and what does not

An additive `pdfWordingReview` layer records **16 distinct acquired file SHA-256 identities / 271 physical pages**, attached to **17 exact existing source-material bindings**: Great Eastern 7 files / 132 pages / 8 bindings; HLAS and UOI 9 files / 139 pages / 9 bindings. The shared five-year GE file still has two different official source labels, not two files.

No observation, product, material slot, feed, independent SKU or formal original is added. The projection retains 6,115 observations, 17,820 material references and 43 feed descriptors. Formal baselines remain 2,360 directory entries / 4,713 originals / 426 strict verifications. All new count credits are zero. Reading a source document does not verify a whole product's issuer, every variant's insurer, present sale status or an individualized signed contract.

This source change is not a publication claim. Current deployment documents remain tied to the separately verified released baseline.

## Exact approved inputs and derived scope

All paths below are relative to `coverage/2026-10-27/batch-14/pdf-wording-review/`.

| File | SHA-256 | Purpose |
|---|---|---|
| `ge-sample-wording-metadata.json` | `bd3f4ba32c455978e02ae53055543af9ed94825f80a06e880d5465b808559d69` | Byte-preserved GE safe metadata, eight source associations |
| `hlas-uoi-wording-metadata.json` | `c3690fd5627a290a6c51633daa6c43038b739ab45c6401fdea0062fd3f020e0c` | Byte-preserved nine-file safe metadata |
| `ge-review-visual-scope.json` | `0c21001e67b7c1d9c9aeb614e3cec62a2125da3501f9f53505b051fac5d7ef65` | Seven-SHA public-only scope companion derived from the verified review decision |
| `integration-bindings.json` | `d79916cb42e2f79edc546571b8080a1914ac05404df0312ddc8bf51545fcfa34` | Exact original source/runtime identity and history pins |

The companion records original meaningful native-text coverage, actual recorded contact-sheet / structural-thumbnail / detailed visual pages separately, and the independent QA's **16 targeted detailed visual pages**. Null visual fields mean the original record did not separately enumerate that class; they are not filled with inferred all-page coverage. Original full-text reading is not claimed to be a second full semantic read by independent QA. The companion's source decision is identified by SHA, without internal authors or private paths. All four public inputs remain subject to final independent release QA; derived integration metadata is not a fresh permission to publish raw files.

`website/config/coverage-approved-inputs.json` and generated `sourceInputs` record actual byte sizes and hashes. The adapter independently pins all four input hashes. Browser registry content must reproduce the exact generated overlays; a test compares it to the generated runtime. No raw PDF, extracted full text, page image, personal filled sample value, Library identifier or execution location is part of this layer.

## Fail-closed source binding and reversible history

The adapter validates the entire collection before attaching any review. Each binding checks:

- Frozen source collection bytes/SHA, source observation, original JSONL line, zero-based material index, full source-record and material hashes.
- Exact material URL, source page URL and exact source HTML hash. UOI's HTML hash is taken from the frozen source registry entry with the exact URL **and acquisition time**, not a same-domain or same-name fallback.
- Source publisher, issuer, product/parent identity and original type; full pre-overlay runtime row and material hashes, runtime observation/material IDs, source path/line/feed, and GE document-reference ID.
- Exact safe-metadata entry, acquired-file SHA, physical-page count, source label and binding; no date, formal credit, body-role or issuer inference is accepted.

Only the new property is attached. Original `kind`, `materialRole`, `sourceStatus`, `checked_at`, URLs, original acquisition facts and all historical unread states remain unchanged. The UI calls these **historical acquisition** facts and displays the new exact-version reading status separately, rather than continuing to call a reviewed GE sample unconditionally body-unread.

UOI Business Property is the exact existing product observation `SG-UOI-observation-bab84984c8b4bdcc5ba8`, material index 0. Its separate 16 document-directory contexts remain unchanged. None currently has the exact BPI URL; a synthetic same-URL negative case verifies that a future directory reference cannot receive this review by URL alone. HLAS variants and parents cannot inherit review or document-issuer evidence.

Removing the validated additive layer reconstructs all 6,115 prior rows byte-exactly. The 18 GE source-label corrections, all eight original GE sample material objects, old AIA reviews, Tugu HTML reviews, context search/history behavior and formal files are protected by regression checks.

## Content-specific limits

- **GE five-year with-CI label:** the acquired shared file is a base-only sample. The CI combination's attribution is unverified; this does not show that the option does not exist or that diseases are excluded.
- **Life II CI70/CI85:** named 715/717 references remain unresolved; TPD/TI is already in the main wording and 143/642 are present. Do not infer missing benefits, legal invalidity or equivalence. CI physical spans retain their terminal clauses. The Term CI file has its distinct 714/716 appendices.
- **Life II 70/85 and SAMPLE:** names are plan labels, not inferred termination ages. Filled names, dates, financial amounts or policy values are not product facts and are not exported.
- **HLAS versions:** the six distinct acquired versions do not replace older formal versions. Form codes and URL dates are not legal dates, latest-version evidence or product-version equivalence.
- **Corporate / UOI:** initial ages versus renewal, and different premium-payment contexts, are described neutrally; no contradiction or individual coverage ruling is made.
- **COVID / Family:** the exclusion preambles' express-provision/extension reservations remain in the summaries. A section-number omission is not a claim that coverage is absent or a claim will fail.
- **Maid:** optional sections 13/14 are within multi-risk main wording, not a rider-only document. DY022401 and DY012306 remain separate; conditions from one do not migrate to the other.
- **Fraud:** only basic metadata and short original summaries are included. The insured/representative confidentiality condition is not automatically a document-wide internal designation; equally, it is not redistribution permission. Existing links and the finite held-locator registry are not expanded or removed.

## Verification and privacy boundary

Run offline from `website/`:

```sh
# Execute the declared test sequence directly; do not invoke a package manager.
python - <<'PYTEST'
import json, pathlib, shlex, subprocess
scripts = json.loads(pathlib.Path('package.json').read_text())['scripts']
for command in scripts['test'].split(' && '):
    argv = shlex.split(command)
    assert argv[0] == 'node' and len(argv) == 2
    subprocess.run(argv, check=True)
PYTEST
node scripts/build.mjs
(cd .. && python -m unittest discover -s tests -v)
```

The full suite includes every binding, atomic negative cases, exact reverse reconstruction, old review protection, interrupted/rapid filter and context/history behavior, date and issuer/body-role escalation rejection, escaped UI text and deterministic regeneration. Loopback HTTP asset checks are local only. DOM-stub/CSS tests are not real-browser, mobile/touch or screenshot validation; no PDF was reread during integration.

The release gate scans the full source, delta, static asset archive and XLSX XML parts against the finite known-61 locator registry. Historical held-SHA metadata and historical plain-text filenames remain unchanged: **504 historical SHA occurrences and 21 historical private-name text references** are not claimed to be erased. New delta/runtime additions must contain zero held locators, held SHA occurrences or private artifact markers. Ordinary reviewed raw-file SHA metadata is allowed; it is not a raw-file upload. These finite checks do not establish universal unknown-content privacy or redistribution clearance.
