# Public insurer census and partial catalog metadata — BN/KH v4

Frozen: 2026-10-27T10:47:04.712866+00:00

**In progress, not a complete all-region/all-product catalog.** This snapshot supersedes the v3 for progress reporting, but does not change verified-original document totals. It includes 139 issuer/candidate records and 428 metadata observations: BN 144 and KH 284. **Zero new downloaded/verified originals.**

## Denominator scope
- BN: 11 entities; all four observed BDCB life/non-life/family/general-takaful filters exhausted. Effective date and new-business/run-off flags absent; not a legal current-status certification.
- KH: 39 insurer entities in official IRC directory: 18 general, 13 life, 7 micro and 1 reinsurer. Brokers/associations excluded. Effective date absent; directory UUID is not a licence number.
- VN: 54 entities from the official 2024 report plus 6 later supplemental candidates. Historical baseline plus updates, not a reconciled 2026 denominator.
- MM: 27-entity March/June 2023 baseline; not reconciled to 2026.
- LA: 2 transfer-related legal entities, not a market denominator. lis.gov.la returned 403 and stays closed. Independent ministry department pages at soe.mof.gov.la are accessible but have not established a named insurer roster. Prudential/Trust transfer evidence does not justify merging their legal entities.

## Catalog scope and counts
- BN: 11 issuers attempted; 6 partial and 5 blocked. 144 metadata rows, 202 linked-material occurrences. Standard's former transient 503 product pages now return normal 200; its two resource-only candidates retain product-specific links, not all resource-directory documents.
- KH: all 39 entities have company-name discovery/queue records. 23 partial, 10 blocked and 6 unchecked/quarantined. 16 entities have metadata observations, not complete catalogs. 284 rows include 13 category directories, 33 named coverage classes, 28 riders, 5 benefit/rider candidates, 4 base-and-rider packages, 2 group umbrella packages, 17 group products, 69 named products and 113 product families. This is **not 284 unique current products**.
- KH 379 linked-material occurrences; BN+KH total 581 occurrences. Materials remain links only and may cover embedded riders/options; document content, terms, currentness and original provenance are unverified.
- No market is marked complete_public_catalog. Source dates unknown are null. Language/category/channel duplicate contexts are flagged, not blindly counted as unique contracts. Exact existing `insurer` labels are compared literally, without fuzzy cross-entity merging.

## Important distinctions
Daiichi Cambodia: nine public detail pages plus seven named embedded riders; direct HTTP redirects loop, normal public web parser supplied observed content. SMARTCare Medical is a rider, not a standalone base plan. CREDITCare/SECURECare Plus and plan tiers are variants. LoanShield is present in navigation but detail/target remains unresolved. Document labels are visible, but unseen document target URLs are not guessed.

AIA Cambodia: insurer's public category model mislabels a loan-repayment route as cancer cover; observed detail title retained with conflict note. WorkWell wellness and Corporate Cup football pages excluded as insurance products. Riders, bundles, group packages and language/category aliases are explicitly marked.

Etiqa Cambodia: issuer origin denied, remains blocked. Fourteen independently published Maybank distribution pages add seven life base/rider and seven general family observations; not whole-issuer completeness. No denied Etiqa material URL was fetched. Short general-family names Home/Fire/Travel are exact headings of insurance detail pages, not site homepage/navigation rows.

Ly Hour SBI: 11 category directories and 33 named coverage-class children are separate roles, not 44 policy SKUs. National Brunei Domestic Helper / Employees Package Protector remain personal/business contexts with same-offering/shared-material flags. No forced entity merge.

## Safety and remaining work
Only public-safe metadata is included. No raw HTML/JavaScript/PDF, personal contacts, credentials, headers, internal logs or private paths. Nine early accidental public social-share GETs were not submissions; excluded from product/queue data. Continued requests use positive exact-origin approval, no automatic redirects, per-origin serial requests and a cooperative STOP marker. First 401/403/407, nested transport denial or soft-WAF denial stops same/equivalent origin. Uncertain company-host mappings are quarantined.

Remaining work: inaccessible/JavaScript-only/unresolved company catalogs, independent ownership/current-sales evidence, all riders/channel/legacy versions, material-target resolution and verification, current VN/MM roster deltas and a separately public official LA denominator. See per-issuer pending/denied/uncertain reasons. Category/navigation/news/support/coming-soon pages are not promoted to individual insurance products.

## v4 local QA reconciliation
Four same-brand non-/life/ Forte routes are attributed to Forte Life from observed Life navigation/body, not to Forte general. Each is flagged against the same-named /life/ route; rows are URL/context observations, not extra SKUs. Exact-name CVI route/channel duplicates and AIA AccidentCare category contexts are similarly flagged. Twelve terms/contract-labeled material occurrences are now policy-wording/contract candidates based on label, including ten formerly mislabeled brochures; content/full-contract status remains unverified. Five Cambodia blocked-origin records are corrected from BN to KH. Great Eastern is now blocked for continuation due the shared-origin 10:10 soft-WAF, while earlier BN metadata stays retained. Total 428 rows and 581 link occurrences are unchanged. No network was needed for these corrections.


## Historical-held material locator projection

This derivative is pending independent QA. All source metadata rows and material occurrences remain; 22 product-linked material occurrences have their direct locators withheld. Stable references and historical held SHA-256 values preserve lineage without publishing the locator registry. Current bytes were not retrieved or verified; reuse review is pending. A historical hold does not establish current confidentiality. No new verified originals are counted. Earlier source snapshots must not be published unchanged.
