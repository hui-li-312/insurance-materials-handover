// Separately approved metadata review. This identity is not a product merge key.
export const REVIEW_TARGET=Object.freeze({
 reviewId:'document-review-aia-kh-4b414b3c8f4df54f-20261027',
 sourceMaterialRefId:'material-e61979cc666bb329f725',
 exactOfficialDocumentUrl:'https://www.aia.com.kh/content/dam/kh-wise/policy-contract/AIA-PolicyContract-SamrabSokapheab-AIA-Chambong.pdf',
 sourceParentInventoryId:'KH-product-7d437a2f7cb81eab',
 sourceIssuerId:'KH-issuer-638d516b466f',
 sha256:'4b414b3c8f4df54fd38b15069402ca2cd358672fae61ad83cb7e3465aa34c02a',
 sourceMetadataSha256:'ea36923a161234e49125c860e47074010b1c0a776ef8f9cdb447a15543190fbd',
 sourceMetadataPath:'coverage/2026-10-27/batch-10/aia-kh-document-review/document-review.json',
 legacyDocumentId:'regional-20261025-4b414b3c8f4df54f'
});
const requireReview=(value,message)=>{if(!value)throw Error('Invalid document review: '+message);};
export function validateReviewData(d){
 requireReview(d&&d.reviewId===REVIEW_TARGET.reviewId,'review identity');
 requireReview(d.sourceMetadataSha256===REVIEW_TARGET.sourceMetadataSha256&&d.sourceMetadataPath===REVIEW_TARGET.sourceMetadataPath,'approved metadata version');
 for(const k of ['sourceMaterialRefId','exactOfficialDocumentUrl','sourceParentInventoryId','sourceIssuerId'])requireReview(d.binding?.[k]===REVIEW_TARGET[k],'exact '+k);
 requireReview(d.documentIdentity?.sha256===REVIEW_TARGET.sha256&&d.documentIdentity.byteCount===73454222&&d.documentIdentity.pageCount===91,'reviewed PDF identity');
 requireReview(d.documentIdentity.legalEffectiveDate===null&&d.documentIdentity.editionDate===null,'unknown dates');
 const c=d.reviewConclusion,s=d.reviewScope,b=d.preservedBoundaries;
 requireReview(c?.documentRole==='basic_main_policy_wording_plus_health_rider_and_supplementary_services_bundle'&&c.basicMainPolicyWordingPresent===true,'separate role finding');
 requireReview(c.currentSaleStatus==='not_independently_verified'&&c.legalApplicabilityConclusion===null&&c.parts?.length===6,'role limits');
 requireReview(s?.allPhysicalPagesVisuallyViewed?.count===91&&s.englishPagesLocallyOcredAndSemanticallyReviewed?.count===41&&s.khmerPagesVisualTriageOnly?.count===50,'review scope');
 for(const k of ['fullContentSemanticReviewComplete','fullContentSafetyReviewComplete','khmerLineByLineLegalTranslationCompleted','englishKhmerLegalEquivalenceVerified'])requireReview(s[k]===false,'limited review '+k);
 requireReview(s.languagePriorityEvidencePhysicalPage===64,'language priority');
 requireReview(b?.formalOriginalBaseline===4713&&b.strictVerifiedBaseline===426,'frozen baselines');
 for(const k of ['formalOriginalCreditIncrement','strictVerifiedIncrement','independentProductCountIncrement'])requireReview(b[k]===0,'zero credit '+k);
 for(const k of ['frozenSourceRecordsModified','frozenSourceTimestampsModified','frozenC4AcquisitionStatusModified','rawDocumentReleaseAuthorized','rawDocumentRehostingPermissionConfirmed','fullContractPackageVerified'])requireReview(b[k]===false,'preserved boundary '+k);
 requireReview(d.deduplication?.existingLegacyDocumentId===REVIEW_TARGET.legacyDocumentId&&d.deduplication.existingLegacyExactUrlAndSha256Match===true&&d.deduplication.legacyMatchDoesNotAuthorizeProductMerge===true,'deduplication only');
 return d;
}
export function validateDocumentReview(row,m){
 const d=validateReviewData(m.documentReview);
 requireReview(row.region==='KH'&&row.sourceId===d.binding.sourceParentInventoryId&&row.issuerId===d.binding.sourceIssuerId,'source parent and issuer');
 requireReview(m.originalMaterialRefId===d.binding.sourceMaterialRefId&&m.url===d.binding.exactOfficialDocumentUrl&&m.urlStatus==='public_source_reference','original ID and exact non-held URL');
 requireReview(m.formalOriginalCredit===0&&row.formalOriginalCredit===0&&row.verifiedSkuCredit===0,'no new counts');
 return d;
}
export function validateReviewRegion(rows,region){
 let reviews=0;
 for(const row of rows)for(const m of [...row.materials,...(row.hiddenMaterials||[])]){
  if(m.documentReview!==undefined||m.originalMaterialRefId!==undefined){validateDocumentReview(row,m);reviews++;requireReview(!row.hiddenMaterials?.includes(m),'not a hidden-material enrichment');}
 }
 // Old/missing KH overlays must not silently render as the current reviewed data.
 requireReview(reviews===(region==='KH'?1:0),'missing, duplicate or wrong-region overlay');
}
export function documentReviewHTML(m,esc){
 if(!m.documentReview)return '';
 const d=validateReviewData(m.documentReview),s=d.reviewScope;
 requireReview(m.originalMaterialRefId===REVIEW_TARGET.sourceMaterialRefId&&m.url===REVIEW_TARGET.exactOfficialDocumentUrl&&m.urlStatus==='public_source_reference','display material identity');
 return `<section class="identity-note document-review-overlay"><h6>独立文档审读补充（不改写冻结来源状态）</h6><p>已辨认：基本／主保单条款 + 健康附加险 + 补充服务条款组合，不只是宣传册；这些部分不是新增独立产品。</p><p>物理页证据：主保单第 53–55 页；附加险与基本保单关系第 66 页；补充服务第 84–85、87–88 页。</p><p>逐页视觉查看 91 页；英文第 51–91 页（41 页）经本地 OCR 与语义审读；高棉文第 1–50 页仅视觉初筛，未完成逐条法律翻译或双语法律等同性核验。OCR 可能出错；这不是全文语义／安全审查完成。</p><p>第 ${esc(s.languagePriorityEvidencePhysicalPage)} 页：英高棉文冲突时以高棉文为准。法律生效日／版本日期未知；当前在售和完整个人签发保单包均未确认，不是法律或个人适用建议。</p><p>相同 URL 与 SHA 已见于既有原件：仅用于原件去重，不合并产品或改认父产品。正式原件 4,713、严格核验 426 及独立产品数均不增加；未授权原件重托管或再发布。</p><p>审读时间：${esc(d.reviewedAt)}。冻结来源分类、获取／C4 状态及原时间仍保留在本材料中。</p><details class="source-facts"><summary>审读证据、物理页范围与精确绑定</summary><p>原始材料 ID：<code>${esc(m.originalMaterialRefId)}</code>；审读 PDF SHA-256：<code>${esc(d.documentIdentity.sha256)}</code></p><p>公开元数据：<code>${esc(d.sourceMetadataPath)}</code></p><pre>${esc(JSON.stringify(d,null,2))}</pre></details></section>`;
}
