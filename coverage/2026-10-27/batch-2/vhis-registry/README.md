# Hong Kong VHIS — redacted public registry observation snapshot

Frozen 2026-10-27T11:04:43.710940+00:00.

## Closed scope, not whole-market completion
The official Hong Kong government's VHIS provider and certified-plan public arrays were read in full. This is a **scheme-scoped registry inventory**, not Hong Kong's entire insurer population, not all issuer product catalogs, and not proof of new-business eligibility.

- 33 scheme providers: 30 registered and 3 de-registered. Scheme de-registration is not insurer-wide licence revocation.
- 32 provider entities link conservatively to the primary issuer queue: 31 existing HKFI names and one additional entity, AXA China Region Insurance Company Limited (安盛金融有限公司). It remains distinct from the other AXA legal entities. The old de-registered Chubb Life Insurance Company Ltd. (00015) remains a separate historical entity from current Chubb Life Insurance Hong Kong Limited (00044).
- The working HK primary union is now 120 = 119 HKFI association members + 1 VHIS provider. **The full IA authorised-insurer denominator remains open** because the IA source returned403 and remains stopped. The previous approved 390-row HK/SG/MY snapshot is not overwritten; this package supplies its one-row issuer delta separately.

## Counts and meanings
- 103 latest registry group records (33 standard + 70 flexi); 326 historical group/version records (82 standard + 244 flexi).
- 2,589 variant/version records: 579 latest and 2,010 historical. These preserve official certification numbers and product identifiers, **not independently verified unique SKUs or base contracts**. Version, currency, plan-level and language distinctions must not be summed as new products.
- Of the 103 latest records, 89 have no explicit de-registration/renewal-only group flag; 4 retain de-registered providers; 8 are renewal-only; 2 include some renewal-only variants. The seven renewal-only variants in those latter two groups reconcile exactly with the official display code. Even the 89 unflagged records are not independently confirmed eligible for new sales.
- 12 separate supplementary records: 3 endorsement references and 9 dated regulatory-transition variant references. They earn zero product count credit.
- 7,323 source-observed government material-reference URLs, including37 additional supplementary/transition references. This public package exposes7,299 unique URLs and withholds24 known historical-held locators as null; all7,323 reference records remain accounted. **0 PDFs downloaded, 0 accepted formal material files, 0 independently verified SKUs.** Plan-document links are classified as content unverified, not asserted full policy contracts. Premium schedules, tax information and hospital-definition references remain separate types.
- Every plan/product observation has unknown standalone/base status. Latest and historical files remain separate, and this package is not merged into the earlier 435 issuer-page observations. Cross-channel overlap has not been deduplicated.

## Evidence and date interpretation
The official list pages load `load-list-providers.js` and `load-certified-plans.js`; these explicitly request complete public JSON arrays, without server pagination. Every array parses in full and group/child/provider/material-reference totals reconcile. `source-provenance.json` records the visited government pages/scripts/arrays, content hashes, timestamps and failures. One mistaken list-page URL returned404; no denial or protected-content bypass occurred.

Effective dates are the government's plan-version or supplementary-information effective dates/periods, not publication dates or an individual policy's inception. Unknown source/publication dates are null. Government language keys are preserved as link labels, not claims that PDF contents were independently inspected. Historical issuer lineage and certification-prefix grouping do not silently merge legal entities.

Public-safe structured metadata only: no raw source bodies, contacts, addresses, personal data, credentials or local evidence paths. The historical/source limitations remain open; issuer-wide catalog traversal and material-content verification are separate unfinished work.

## Historical-held locator publication safeguard
This redacted v2 supersedes the unredacted candidate for publication. Exactly24 source-observed material locators match known historically held file identities. Every matching raw locator is null throughout material, plan-group and variant records; stable reference IDs, official government/provider/product pages and known historical SHA256 identifiers are retained with pending fresh-source/reuse-review status. No current PDF bytes have been fetched, so this is **not** an assertion that a presently hosted file is definitely confidential. A public government listing or publicly visible repository does not itself authorize release of a historically held locator.

Counts are separate:7,323 original source-observed unique references =7,299 publicly visible unique URLs +24 withheld reference identities. Language/version/product counts are unchanged. The private locator registry, raw matching URLs, private archive/member names and redaction before-values are not included. No held locator was fetched.
