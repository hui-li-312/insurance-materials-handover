# HK / SG / MY — public coverage snapshot, 2026-10-27T10:41:48.313509+00:00

This ongoing work is an issuer coverage queue plus **source observations**, not a claim that all products or whole markets are collected.

## Counts and meaning
- 390 primary issuer queue rows: SG223 (76 direct /147 separately scoped non-direct), HK119 association members, MY48 domestic PIDM members. The separate Labuan/ancillary files retain their narrower and historical scopes.
- 435 product/catalog/material-directory observations across 13 issuers; 711 unique material-reference URLs. Role counts: {'product': 165, 'catalog_category': 56, 'service': 9, 'group': 10, 'rider_family': 5, 'coverage_class': 61, 'document_page': 62, 'plan': 19, 'rider': 40, 'coverage_component': 8}.
- **0 independently verified unique SKUs; 0 new canonical/formal material files.** Six public PDFs were fetched as unreviewed raw evidence while resolving AmMetLife Takaful document links; only safe metadata appears in this snapshot, not their contents.
- 21 observations are explicitly historical/not-currently-marketed/run-off (19 Heng An disclaimer-listed plans; two LIC Singapore old product-page sections). They are not current-sale product credit.
- Same-named detail/rider-list paths and family/variant observations are explicitly related where confirmed, never automatically counted as distinct products. Category, coverage-class, service, rider-family, group-component and document-directory observations are not extra standalone products.
- Per-issuer status is still unchecked/partial/blocked, never complete because an existing raw-file name matched. Unknown websites and non-direct scopes remain explicit.

## Census boundary
### Singapore
MAS's public Print/Download List was fully read through the exact public endpoint exposed by its export page/script. All 434 licence/activity rows were parsed into 388 unique entities, exactly matching the directory's displayed total. Of these, **76 direct insurers** are the direct-public-catalog target set (16 life, 51 general, 9 composite). A further 147 rows are separately classified as 86 captives, 41 licensed/authorised reinsurers and 20 Lloyd's Asia service companies. The 165 broker/holding/representative ancillary entities are retained in `sg-ancillary-entities.jsonl`. Not 223 consumer sellers. Approved MAT category absent from displayed insurance facets; no wider off-directory MAT census is claimed. Run-off is not inferred from licence membership.

### Hong Kong
IA official register was attempted first and returned HTTP 403; the origin is stopped. **No closed HK regulator denominator.** Independent HKFI published member-filter data was fully read: 119 published entities, 78 general plus 52 life memberships with 11 overlaps. Its 78 general members cross-check the rendered HTML. The public CMS binary contained 119 records and was parsed to the exact 94,415-byte end. Membership is not a licence class and can exclude non-members. General/life membership and reinsurance name flags do not establish consumer/current-new-business status.

### Malaysia
BNM directory was attempted first; tool content was navigation/partial and the direct origin later returned 403. PIDM full official member modal was read before its subsequent direct fetch returned 403: **48 member entities (33 insurers and 15 takaful operators)**. PIDM excludes reinsurance/retakaful, international takaful, financial guarantee and offshore; the wider Malaysian denominator remains open.

`my-labuan-licensees.jsonl` separately retains **222 numbered Labuan insurance/insurance-related licensees** from the Gazette published 30 March 2026, expressly valid **as at 31 December 2025**, not October 2026. All 222 rows/14 pages were read and serials reconcile. Licence prefixes are preserved but not silently converted into insurer/intermediary classes. The live directory's published public API returned 403. `my-labuan-surrendered-revoked.jsonl` retains 181 surrender and 33 revocation observations, as at 16 April 2026, without shareholder/director/contact data. The source prints serial 114 twice and omits 113; visual inspection confirms this source anomaly. A malformed date is retained raw with normalized date null. Same-name historical surrender and current-other-licence coexistence are flagged, not automatically merged into revoked company status. The listed takaful Gazette link appears to point to Islamic-bank licensees; it is not substituted as a takaful roster.


## Bounded product work
- MCIS: root product cards, rider list and four inline group riders. Confirmed rider-family/detail duplicates retain relationships.
- AmMetLife Takaful: six public category roots;20 URL observations/13 display names, including shared bancatakaful/category paths. Generic quote/calculator/forms excluded as products.
- PICC HK:20 named product/coverage navigation pages, with generic insurance lines classified separately from branded plans.
- Heng An:two expressly marketed plans plus19 expressly non-marketed historical names from its disclaimer, not individual archived contract retrievals.
- Pacific Life HK:24 observations after removing language-toggle URL duplicates;8 named product observations (standalone/base status unconfirmed),5 riders,8 group coverage components,3 category pages.
- Chubb MY:113 bounded public path-page attempts,94 retained catalog/coverage/service observations and62 named disclosure-directory rows.14 help/vendor/information pages excluded. Broad website path traversal is not partner-channel or unique-product closure.
- MSIG MY:37 personal and17 business cards from the official site's public unfiltered catalog arrays, reconciled to54 navigation URLs.37 detail pages read;17 unavailable after transport403, origin stopped. No full-detail traversal closure is claimed.
- EQ SG:three public roots expose30 named child URLs, all accounted for, plus3 category observations.26 product/3group/1rider/3category rows;64 unique material URLs, no downloads. Partner/unlinked channels remain open. Wording-version date labels stay attached to one offering, not extra products.
- Other SG issuer checkpoints are deliberately excluded until their separate review.

## Access and evidence limitations
Every visited source failure is retained in source metadata. The corrected collector now enforces401/403/407 and genuine challenge stops plus exact-origin redirect gates. No credentials, challenge solving or alternate-host bypass is used. `collection-incidents.json` transparently records a transport403 stop-classification defect:34 failure-log records, not a proven count of origin requests; no successful detail response followed, and the origin remains stopped. The append-only AIA correction concerns a hash-verified HTTP200 catalog where a telemetry JavaScript phrase was misclassified; no actual access denial was overridden.18 offline guard fixtures passed.

Dates are null when not published/verified. Current public visibility does not establish eligibility, availability through every channel, or complete policy wording. Source material URLs are evidence references, not downloaded/accepted policy packages.

Only sanitized structured data is included: no raw HTML/JavaScript/PDF bodies, contacts, addresses, directors/shareholders, private paths, cookies, authorization headers or private conversation history.

## Role-semantic QA revision
All named product/group/plan observations explicitly retain standalone_or_base_status=unconfirmed. Their role labels are not proof of standalone/base contracts. Seventeen AmMetLife PIDM TIPS links remain visible as general consumer information, with zero product-brochure/material coverage credit. Counts remain435 observations and711 unique material URLs. The underlying observation snapshot remains2026-10-27T10:41:48Z; this revision is 2026-10-27T10:51:37.813194+00:00.
