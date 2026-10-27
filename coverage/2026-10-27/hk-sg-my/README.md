# HK / SG / MY coverage expansion — 2026-10-27 (ongoing)

## Meaning of the data
- `issuers.jsonl` is an enumerated-company work queue, not a claim of all products collected. Local issuer IDs are explicitly not regulator IDs.
- `observed-products.jsonl` separates named product/card/plan/rider/group observations from the existing raw-document catalogue. These are **not independently verified unique SKUs**, current sale eligibility or complete personal contract packages.
- `issuer-attempts.jsonl` records every enumerated issuer, including untouched and blocked entries, next actions, exact observed card/detail/material-role counts. Having old files is never marked company/product complete.
- `sources.json` and `blocked-origins.json` record successful/failed source reads and access restrictions. No retry/bypass of 401/403/challenge origins is authorized.
- No product PDFs have been downloaded in this expansion batch; material URLs are observed references only. Government census PDFs are evidence, not product-material additions.

## Census boundary
### Singapore
MAS's public Print/Download List was fully read through the exact public endpoint exposed by its export page/script. All 434 licence/activity rows were parsed into 388 unique entities, exactly matching the directory's displayed total. Of these, **76 direct insurers** are the direct-public-catalog target set (16 life, 51 general, 9 composite). A further 147 rows are separately classified as 86 captives, 41 licensed/authorised reinsurers and 20 Lloyd's Asia service companies. The 165 broker/holding/representative ancillary entities are retained in `sg-ancillary-entities.jsonl`. Not 223 consumer sellers. Approved MAT category absent from displayed insurance facets; no wider off-directory MAT census is claimed. Run-off is not inferred from licence membership.

### Hong Kong
IA official register was attempted first and returned HTTP 403; the origin is stopped. **No closed HK regulator denominator.** Independent HKFI published member-filter data was fully read: 119 published entities, 78 general plus 52 life memberships with 11 overlaps. Its 78 general members cross-check the rendered HTML. The public CMS binary contained 119 records and was parsed to the exact 94,415-byte end. Membership is not a licence class and can exclude non-members. General/life membership and reinsurance name flags do not establish consumer/current-new-business status.

### Malaysia
BNM directory was attempted first; tool content was navigation/partial and the direct origin later returned 403. PIDM full official member modal was read before its subsequent direct fetch returned 403: **48 member entities (33 insurers and 15 takaful operators)**. PIDM excludes reinsurance/retakaful, international takaful, financial guarantee and offshore; the wider Malaysian denominator remains open.

`my-labuan-licensees.jsonl` separately retains **222 numbered Labuan insurance/insurance-related licensees** from the Gazette published 30 March 2026, expressly valid **as at 31 December 2025**, not October 2026. All 222 rows/14 pages were read and serials reconcile. Licence prefixes are preserved but not silently converted into insurer/intermediary classes. The live directory's published public API returned 403. `my-labuan-surrendered-revoked.jsonl` retains 181 surrender and 33 revocation observations, as at 16 April 2026, without shareholder/director/contact data. The source prints serial 114 twice and omits 113; visual inspection confirms this source anomaly. A malformed date is retained raw with normalized date null. Same-name historical surrender and current-other-licence coexistence are flagged, not automatically merged into revoked company status. The listed takaful Gazette link appears to point to Islamic-bank licensees; it is not substituted as a takaful roster.

## Product work in progress
Initial detailed issuer traversals: MCIS Malaysia (base/group cards and separately listed riders); AmMetLife Malaysia (public navigation plus legacy linked-page failures distinguished); AIG Hong Kong (personal cards and explicitly flagged business solution/category cards). Material-role labels are candidates based on official link labels; no full wording-content review is asserted. Parallel homepage/catalog discovery is advancing company by company through unmatched issuers, not stopping at these examples. See generated run status and issuer queue for current counts.

## Publishing safety
This snapshot contains sanitized structured data and methodology/status files. **Do not publish `evidence/` wholesale**: official source pages/PDFs contain public contacts and some director/shareholder names that are unnecessary to this catalogue. No private history, credentials, cookies, headers, outreach, purchase, live-Site edits or GitHub writes were used.

## Immutable first-batch freeze, corrected role revision
This snapshot is fixed at 2026-10-27 10:01 UTC for independent QA. Subsequent work continues outside this directory. No raw source HTML, JavaScript, full census PDFs, addresses, telephone numbers, email/contact lists, cookies, auth headers, or internal filesystem paths are included here. Source URLs remain public evidence pointers. Product material URLs are not downloaded files.

Role QA revision: MCIS duplicate detail/list observations and rider-family variants remain separate source observations, explicitly related rather than summed as distinct products. AIG business categories/services and the MCIS educational category receive zero product/SKU credit. No independently verified SKU count is asserted. Revision made 2026-10-27T10:07:38.401248+00:00.
