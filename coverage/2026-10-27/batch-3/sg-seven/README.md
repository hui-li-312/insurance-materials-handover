# Singapore: seven-insurer public catalog candidate

This snapshot contains structured source observations, not verified unique insurance SKUs or downloaded contract files. All seven issuers remain `products_status=partial`: bounded, manually reviewed public queues were attempted; partner, bank, legacy, non-English and unlinked channels remain unclosed.

## Interpretation
- `product` means a named offering observation, not a confirmed standalone/base contract. Categories, coverage classes, services, brochure pages, plan families and riders retain separate roles.
- Repeated names across channels or parent products remain source observations. AIA has 56 JSON paths/47 exact product names and 56 inline rider-parent observations/26 exact rider names. These must not be added as unique SKUs.
- Material counts are link references, not downloads; application/fact-finding forms, consumer guides and brochure/policy candidates are separated by type. No complete contract package is claimed.
- Explicit information-as-of dates and server card-update timestamps have their own scope. Unknown publication/effective dates remain null. Earlier dates do not establish that an offering has closed.
- Taiping Hospital Safe and Accident & Health links return 404. Chubb Jewellery & Watch Cover explicitly cannot currently be newly purchased. Neither is counted as confirmed currently purchasable coverage.

## Scope and provenance
Per-issuer traversal files contain exact public source URLs, observed timestamps, failed requests, finite-queue dispositions, role/material counts and limitations. The AIA initial HTTP200 telemetry false-positive and narrow evidence-bound correction are retained. Taiping's unverified AWS redirect destination was not followed. No login, purchase, quote, contact submission, bypass, raw HTML, credentials or personal contacts are included.

## v2 correction and audit
The v1 candidate is superseded. A cached-only audit reviewed 402 product/plan/group/rider/coverage-class observations across337 unique source URLs across all7 files. It corrected Singlife Group Critical Illness from group to named optional-rider family and added51 text-confirmed rider-parent observations. No network or PDFs were accessed. Generic/unnamed add-ons and ambiguous shared footnotes were not invented as standalone products; `cached-rider-audit.json` preserves the bounded scope. Retail/Pinnacle versions and ReadyMummy conditional post-birth attachment contexts remain separate.

## Merge rule
`merge-replacement-map.json` is authoritative. The EQ file replaces the existing 33 EQ observations (same keys; zero net-new EQ rows), rather than appending duplicates. Existing material-file indexes are unchanged. Other six files are candidates for issuer-scoped integration after QA.

## v3 narrow correction
The v2 inventory rows, observation keys and material URLs are unchanged. Seven external statistical/research or consumer-information citations (three Manulife and four Singlife occurrences) now have explicit `cited_external_research` or `general_consumer_information` roles and zero individual-product-material coverage credit. These are not product-specific policy files. Counts remain 604 observations, 761 references and 656 unique material URLs; no network or PDF access was performed for this correction. `v3-corrections.json` records the exact changes. This v3 candidate supersedes v2 after review.
