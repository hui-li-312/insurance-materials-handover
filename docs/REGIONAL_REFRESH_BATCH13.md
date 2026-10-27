# Batch 13 — Great Eastern source-label correction

## Scope and evidence

This batch corrects source metadata only. The generic filename prefix `gels-pdt-pd-` is not semantic evidence of policy wording. The frozen batch-10 acquisition files remain unchanged; their original labels, candidate kinds, status, source HTML hashes and acquisition times remain historical facts.

The independent source-label review, frozen at **2026-10-27T22:28:28Z**, changes 18 associations / 12 exact URLs from the old generic wording heuristic to:

| Source-label candidate | Associations | Distinct URLs |
|---|---:|---:|
| Brochure | 13 | 10 |
| Benefit schedule and premium rates | 4 | 1 |
| User guide | 1 | 1 |

These are source anchor/context/path classifications: **正文未读 — file bodies were not read in this review**. They are not 18 complete main contracts. No later PDF capture or body-review conclusion is included.

Eight sample-policy-wording associations / seven URLs remain unchanged and body-unread in this review. One five-year URL retains both the base-plan and Critical Care-combination sample labels; document identity and contract composition remain unresolved.

## Binding, history and reproducibility

The byte-preserved review lives in `coverage/2026-10-27/batch-13/great-eastern-source-label-review/`:

- `manifest.json`: SHA-256 `272fd2400494d01e66df84293530cb23e46e12964f91c1eeb4603b01f07f4bf4`
- `material-role-reviews.json`: SHA-256 `b4f0efc260bf200681b1c79109be1fc300e8f1dc8842078c6be53ff1428467af`

The manifest's basename remains relative to this review directory. Each `sourceCollection` remains rooted at the original batch-10 repository path; it is not rebased. `website/config/coverage-approved-inputs.json` and the generated `sourceInputs` declare consumed byte counts and hashes.

An associated `sourceLabelReview`, not a new feed or product row, attaches a distinct `materialRoleReview` to each exact material. The adapter validates the full pinned collection before applying any change. Source collection/hash, source observation, zero-based material index, exact URL, source HTML hash, issuer/publisher, product/parent identity, runtime IDs and document-reference association must all agree. There is no URL-only or display-name fallback.

Only the candidate `kind`, `materialRole` and attached review change. Original kinds, acquisition status, unread status, labels and acquisition time remain in review history and frozen sources; metadata-review time is separate. Unknown document-version, publication and effective dates stay unknown. The renderer exposes the original role and source evidence separately from any document-body review. A future body overlay needs independently approved evidence and explicit precedence; this adapter rejects a body-review collision rather than overwriting it.

## Unchanged boundaries

- 6,115 observation rows; 17,820 material references; 43 feed descriptors, of which 39 contribute rows.
- Great Eastern: 272 observations, 544 associations, 357 URL/document references; all 28 original source files remain immutable.
- Formal baselines: 2,360 directory entries / 4,713 originals / 426 strict verifications. Zero added formal originals, verified SKUs or main-wording credit.
- Actual-contract issuer claims, parent/rider credit and the existing eight current deployment/frontier handover documents remain unchanged.

Run `cd website && npm test && npm run build`; the focused suite is `node tests/ge-source-label.mjs`. It covers atomic identity/hash/index rejection, reversible reconstruction of all 6,115 baseline rows, protected samples, source-history/date separation, escaped Unicode/XSS rendering and deterministic generation. Offline DOM tests exercise filtering, detail/history and navigation. These are not live browser, mobile/touch, PDF-body or publication verification. This source change does not itself claim a new deployment.
