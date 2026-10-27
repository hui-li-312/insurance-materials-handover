# Krungthai-AXA Life: bounded public catalog collection

Checked **2026-10-27**. Issuer: **Krungthai-AXA Life Insurance Public Company Limited**, Thailand, life insurance. This is not AXA general insurance and not a claim to cover the whole Thai market.

## Coverage and counts

- **29 / 29 Thai root cards** resolved and visited: 18 life/accident/critical illness, 6 health, 3 retirement, 1 legacy, 1 online.
- **29 / 29 English root card targets** also visited, plus explicit language-switch alternatives; 3 English card names are empty, and 3 observed `/undefined/` category aliases return 200. These are not extra products.
- All 12 TH/EN category pages checked (including “plan right for you”); no additional current cards beyond the root inventory. Every PDF reference in the locale-specific public individual-product content is represented in the material inventory.
- The 29 cards are **21 products, 4 riders, 1 PA product family, 3 sales bundles**; card count is not a count of independent base policies.
- Separate additional scope: **4 group families/packages**, **6 subordinate group riders/plans**, and **4 separately linked iLink riders**. Named plan variants stay subordinate.
- `products.jsonl`: **86 locale records / 43 distinct IDs**, including all above scopes. Do not report 43 as 43 root cards or 43 independent primary products.
- `documents.jsonl`: **100 unique hrefs**; **98 original PDF responses** downloaded, **85 unique SHA256 byte hashes**, 1 invalid blob link, 1 known Internal hold not downloaded. Total bytes retained per downloaded URL: **429,210,089**.
- **0 full policy wordings verified; 0 primary-verified documents added.** `full_read=false` throughout. Collection and classification are not full legal/semantic review.

## Files

- `products.jsonl`: stable product IDs, role, locale, channel evidence, official URL, exact root-card URL, material associations, subordinate plans and gaps.
- `documents.jsonl`: original URL, document ID, original-byte SHA256/size, page count, language evidence, document type, issue/as-of statement when observed, source-page associations and rights flags.
- `source-checks.json`: all root-card URL inventory, issuer check, individual/group/category/download-center checks, failures and completeness QA.
- `summary.json`: machine-readable totals, known gaps and validation.

Original HTML/JSON/PDF evidence is retained privately **outside Git and this publication payload**.

No original PDFs, full extracted PDF text, thumbnails, or quarantined files are in this metadata directory. Private filesystem paths and PDF body excerpts are omitted from this publication payload.

## Material types and important gaps

Brochures, rider brochures, index information, benefit schedules, exclusion excerpts, coverage summaries and blank application/service forms are distinct types. Neither an “exclusions” PDF nor webpage headings such as “policy terms” establish a complete contract wording.

- **Super Save 16/5 TH:** official brochure href is an invalid `blob:` URL. EN brochure was downloaded. No reliable public TH replacement found; no guessed URL used.
- **Health Extra / Health Ultra:** TH/EN pages have no separate public document download links; page content is retained as evidence, not renamed as a brochure or wording.
- **WealthPlus Ready 90/8 / RetireReady 85/6 EN:** 200 pages but no product name/downloads. TH materials retained. Worldclass Ready EN has empty title/name but accessible materials.
- **MEA Extra:** TH benefit/exclusion link labels are reversed relative to PDF content. Final types follow the content, retaining mismatch evidence.
- **Current root brochure versions can differ by language.** Issue/as-of dates are captured separately; no URL filename, CMS timestamp, footer issue date or “as of” date is silently promoted to policy effective date. Unknown source publication dates stay `null`.
- Four sitemap-only individual candidates (`global-index-16-6`, `life-super-save-14-5`, `ultimate-growth`, `bumnan-ready`) return TH 404 / EN 500 and are excluded from current counts.
- Krungthai bank origin returned **403** on observed public catalog/product URLs. Stopped without bypass; **WealthReady 99/5** remains discovery-only and bank-channel completeness is not claimed.
- Public download centers contained investment reports/general forms, not a verified wording library for the 29 cards. Private Emma/e-policy and distributor portals were not entered.

## Publication / quarantine gate

**No raw document is authorized for public rehosting.** Every document has `publication_payload_eligible=false`; ordinary public availability is not a redistribution license.

- The known 3-page **iHealthy Ultra exclusions** file marked Internal was retained as metadata only and **not requested/downloaded**.
- The newly inspected **MEA Extra exclusions** PDF also says **Internal** on its 3 pages; original is in `quarantine/` and excluded from publication.
- Three English BNP-linked brochures include a confidential-material/reproduction restriction. Two English Citi-linked brochures refer to proprietary/confidential index rights. Originals were conservatively quarantined; the latter flag concerns third-party index rights, not an unsupported assertion that the entire brochure is internal.
- Other originals require copyright and personal-data review before any rehosting. Blank public group forms are templates, not submitted customer records; selected image-based forms were visually checked as blank.

This collection does not change existing website/index counts, write to GitHub, publish a site, merge old records, claim every historical/closed/private SKU, or enumerate all configurable insurance/premium combinations. Those remain separate review and authorization steps.

## Method

Official TH and EN root/category cards first, then every observed detail URL and download. Additional group components were read using exact IDs publicly linked by the official page and the same unauthenticated read pattern shipped in its JavaScript. No API keys or private endpoints.

Ordinary public GET only; original bytes preserved and SHA256 rechecked. Native PDF metadata/text read only where permitted, with normal rendering for selected unreadable-text pages. **No OCR, unlock, print bypass, login, CAPTCHA circumvention, outreach or purchase.** Raw full documents have not been exhaustively read; extraction is not represented as full reading.

## Public metadata v2 withholding

All **7 HOLD document download locators are intentionally withheld** (null in document and product-material URL fields). Official product-page sources, document IDs, hashes/sizes where measured, and generic restriction reasons remain. The 100-locator count describes the private collection inventory, not 100 disclosed public download URLs. This version discloses 92 HTTP download URLs plus 1 broken non-HTTP blob reference; the remaining 7 are withheld. No held files were re-downloaded for this revision.
