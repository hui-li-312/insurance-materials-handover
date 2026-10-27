import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {buildCoverage,serializeCoverage} from '../scripts/coverage.mjs';
import {prepareDocumentReview} from '../scripts/document-review-adapter.mjs';
import {REVIEW_TARGET,validateReviewData} from '../public/document-review.mjs';
import {validateRegion,materialHTML,filterObservations,scopeOf} from '../public/coverage-core.mjs';
const root=new URL('../../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root))),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const results=[];function check(name,fn){fn();results.push(name);}
const payload=buildCoverage(),all=payload.observations,kh=all.filter(r=>r.region==='KH'),target=kh.find(r=>r.sourceId===REVIEW_TARGET.sourceParentInventoryId),material=target.materials.find(m=>m.originalMaterialRefId===REVIEW_TARGET.sourceMaterialRefId);
const sidecar=read(REVIEW_TARGET.sourceMetadataPath),sourceRecord=sidecar.binding.sourceRepositoryRecord;
const sourceRows=fs.readFileSync(new URL(sourceRecord.path,root),'utf8').trim().split('\n').map((r,i)=>({row:JSON.parse(r),path:sourceRecord.path,line:i+1}));
const fixture={review:sidecar,sourceRecords:[sourceRows[sourceRecord.jsonlLine-1]],legacyDocuments:read('website/public/sea.json').documents.filter(x=>x.id===REVIEW_TARGET.legacyDocumentId)};
const original=f=>f.sourceRecords[0].row.materials[sourceRecord.materialArrayIndexZeroBased];
check('Exactly one separate review keeps the historical generic material ID and every original classification/status/date',()=>{
 assert.equal(all.flatMap(r=>[...r.materials,...(r.hiddenMaterials||[])]).filter(m=>m.documentReview).length,1);
 assert.equal(material.id,'reference-3');assert.equal(material.kind,'unclassified_document_link');assert.equal(material.materialRole,'unclassified_document_link');assert.equal(material.sourceStatus,'size_limit_not_retained');assert.equal(material.facts.acquisition_status,'size_limit_not_retained');assert.equal(material.facts.acquisition_status_as_of,'2026-10-27T16:11:11.532978+00:00');assert.equal(material.facts.contract_content_verified,false);assert.equal(material.facts.full_content_safety_review_complete,false);assert.equal(material.publicationDate,null);assert.equal(material.effectiveDate,null);
 assert.equal(material.documentReview.documentIdentity.legalEffectiveDate,null);assert.equal(material.documentReview.documentIdentity.editionDate,null);assert.equal(material.documentReview.reviewScope.fullContentSemanticReviewComplete,false);assert.equal(material.documentReview.reviewScope.fullContentSafetyReviewComplete,false);assert.equal(material.documentReview.preservedBoundaries.rawDocumentReleaseAuthorized,false);
});
check('All 5,101 pre-existing rows except one overlay remain byte-equivalent; MY two-publisher adds 129 and GE adds 272 separate rows; 7 other region assets are byte-preserved after PH/ID additions',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('./fixtures/batch9-document-review-baseline.json',import.meta.url)));
 for(const [name,expected]of Object.entries(baseline.projections)){
  const originalBytes=fs.readFileSync(new URL('website/public/'+name,root));const value=JSON.parse(originalBytes);
  if(name==='coverage-observations-KH.json'){
   let removed=0;for(const row of value.observations)for(const m of row.materials)if(m.documentReview){delete m.originalMaterialRefId;delete m.documentReview;removed++;}assert.equal(removed,1);assert.equal(sha(JSON.stringify(value)+'\n'),expected);
  }else if(['coverage-observations-MY.json','coverage-observations-SG.json','coverage-observations-ID.json','coverage-observations-PH.json'].includes(name)){
   const before=value.observations.length;value.observations=value.observations.filter(r=>!['aia_id_source_catalog','generali_id_source_catalog','mcbl_ph_source_catalog','bpi_aia_ph_source_catalog','pru_life_ph_source_catalog','my_two_publisher_catalog','great_eastern_sg_my_catalog'].includes(r.provenance.feed));assert.equal(before-value.observations.length,name.includes('-MY')?275:name.includes('-SG')?126:name.includes('-ID')?77:141);assert.equal(sha(JSON.stringify(value)+'\n'),expected);
  }else if(name==='coverage-observations.json'){
   for(const [region,hash]of Object.entries(baseline.baselineIndex.regionContextHashes)){const context=structuredClone(value.regionContext[region]);if(region==='MY')delete context.facts.myTwoCatalog;if(region==='SG')delete context.facts.greatEastern;if(region==='ID')delete context.facts.aiaGeneraliCatalog;if(region==='PH')delete context.facts.majorCompanyCatalogs;assert.equal(sha(JSON.stringify(context)),hash,'Old region context changed: '+region);}
   assert.equal(sha(JSON.stringify(value.feeds.filter(f=>!['aia_id_source_catalog','generali_id_source_catalog','mcbl_ph_source_catalog','bpi_aia_ph_source_catalog','pru_life_ph_source_catalog','my_two_publisher_catalog','great_eastern_sg_my_catalog'].includes(f.id)))),baseline.baselineIndex.feedSummariesHash);assert.equal(sha(JSON.stringify(value.replacements)),baseline.baselineIndex.replacementsHash);assert.deepEqual(value.baselines,baseline.baselineIndex.baselines);
  }else assert.equal(sha(originalBytes),expected,name+' changed');
 }
 for(const [p,expected]of Object.entries(baseline.frozenFiles).filter(([p])=>!['coverage/LATEST.json','coverage/README.md'].includes(p)))assert.equal(sha(fs.readFileSync(new URL(p,root))),expected,'Frozen file changed: '+p);
 assert.equal(all.length,5720);assert.equal(all.filter(r=>!['aia_id_source_catalog','generali_id_source_catalog','mcbl_ph_source_catalog','bpi_aia_ph_source_catalog','pru_life_ph_source_catalog','my_two_publisher_catalog','great_eastern_sg_my_catalog'].includes(r.provenance.feed)).length,5101);assert.deepEqual(payload.baselines,{directoryEntries:2360,formalOriginals:4713,strictVerified:426,newFormalOriginals:0,newVerifiedSkus:0});assert.deepEqual(payload.summary,{observationRows:5720,materialReferences:17370,displayedMaterialReferences:17325,hiddenMarkupMaterialReferences:45,exposedMaterialOccurrences:17289,withheldMaterialOccurrences:69,unresolvedMaterialOccurrences:11,subordinateRegistryVariants:2589});
});
check('Exact join rejects wrong/missing ID, URL, parent, issuer, SHA, duplicate/ambiguous keys and stale source metadata',()=>{
 const mutations=[
  ['missing ID',f=>delete original(f).material_ref_id],['wrong ID',f=>original(f).material_ref_id='reference-3'],
  ['missing URL',f=>original(f).url=null],['wrong URL',f=>original(f).url+='?version=other'],
  ['wrong parent',f=>f.sourceRecords[0].row.inventory_id='KH-product-other'],['wrong issuer',f=>f.sourceRecords[0].row.issuer_id='KH-issuer-other'],
  ['wrong reviewed SHA',f=>f.review.documentIdentity.sha256='0'.repeat(64)],['missing reviewed SHA',f=>delete f.review.documentIdentity.sha256],
  ['conflicting source SHA',f=>original(f).private_capture_metadata={sha256:'0'.repeat(64)}],
  ['wrong legacy SHA',f=>f.legacyDocuments[0].sha256='0'.repeat(64)],['missing legacy',f=>f.legacyDocuments=[]],
  ['duplicate legacy',f=>f.legacyDocuments.push(structuredClone(f.legacyDocuments[0]))],['duplicate parent',f=>f.sourceRecords.push(structuredClone(f.sourceRecords[0]))],
  ['duplicate material',f=>f.sourceRecords[0].row.materials.push(structuredClone(original(f)))],
  ['hidden reference',f=>original(f).source_visibility_status='hidden_source_markup_inline_display_none'],
  ['stale C4 time',f=>original(f).acquisition_status_as_of='2026-10-26'],['changed C4',f=>original(f).acquisition_status='downloaded'],
  ['wrong source line',f=>f.sourceRecords[0].line--],['wrong sidecar source ID',f=>f.review.binding.sourceMaterialRefId='reference-3'],
  ['wrong sidecar parent',f=>f.review.binding.sourceParentInventoryId='other'],['wrong sidecar issuer',f=>f.review.binding.sourceIssuerId='other'],['wrong sidecar URL',f=>f.review.binding.exactOfficialDocumentUrl+='?v=2']
 ];for(const [name,mutate]of mutations){const f=structuredClone(fixture);mutate(f);assert.throws(()=>prepareDocumentReview(f),undefined,name);}
 const binding=prepareDocumentReview(structuredClone(fixture));assert.throws(()=>binding.finish(),/not applied exactly once/);
 const f=structuredClone(fixture),prepared=prepareDocumentReview(f),m=original(f),out={url:m.url};prepared.apply(f.sourceRecords[0].row,m,out);assert.equal(out.originalMaterialRefId,m.material_ref_id);prepared.finish();assert.throws(()=>prepared.apply(f.sourceRecords[0].row,m,out),/Duplicate/);
});
check('Published-region validation rejects held/null targets, stale/missing overlays, wrong identity and duplicate reviews',()=>{
 const tests=[x=>delete x[0].materials[2].documentReview,x=>delete x[0].materials[2].originalMaterialRefId,x=>x[0].materials[2].url=null,x=>x[0].materials[2].urlStatus='withheld_in_public_source',x=>x[0].issuerId='other',x=>x[0].sourceId='other',x=>x[0].materials[2].documentReview.documentIdentity.sha256='0'.repeat(64),x=>x[0].materials[2].documentReview.sourceMetadataSha256='0'.repeat(64),x=>x[0].materials[2].documentReview.reviewScope.fullContentSafetyReviewComplete=true,x=>x[0].materials[2].documentReview.preservedBoundaries.strictVerifiedIncrement=1,x=>x[0].materials.push(structuredClone(x[0].materials[2]))];
 for(const mutate of tests){const rows=[structuredClone(target)];mutate(rows);assert.throws(()=>validateRegion({schemaVersion:1,region:'KH',observations:rows},'KH'));}
 assert.throws(()=>validateRegion({schemaVersion:1,region:'KH',observations:[]},'KH'));assert.equal(validateRegion({schemaVersion:1,region:'KH',observations:kh},'KH').length,386);
});
check('Visible review gives physical-page evidence, limited language coverage, unknown dates, frozen-state and zero-count notices',()=>{
 const html=materialHTML(material);for(const term of ['独立文档审读补充','基本／主保单条款 + 健康附加险 + 补充服务','53–55','66','84–85','87–88','91 页','41 页','仅视觉初筛','以高棉文为准','未知','完整个人签发保单包','4,713','426','不合并产品','不是法律','size_limit_not_retained'])assert.ok(html.includes(term),term);
 assert.doesNotMatch(html,/全文核验通过|raw_pdf|<iframe|<object|<embed/);assert.equal(scopeOf(target),'offering');assert.ok(filterObservations(kh,{region:'KH',issuer:target.issuer,q:'AIA Samrab Sokapheap',scope:'offering'}).some(x=>x.id===target.id));assert.equal(filterObservations(kh,{region:'KH',issuer:target.issuer,q:'AIA Samrab Sokapheap',scope:'component'}).some(x=>x.id===target.id),false);
 const malicious=structuredClone(material);malicious.documentReview.reviewedAt='<img src=x onerror=alert(1)>';const safe=materialHTML(malicious);assert.match(safe,/&lt;img/);assert.doesNotMatch(safe,/<img/);
});
check('All approved sidecar hashes remain exact and repeated offline builds are deterministic',()=>{
 const approved=read('website/config/coverage-approved-inputs.json');const files=approved.filter(x=>x.path.startsWith('coverage/2026-10-27/batch-10/aia-kh-document-review/'));assert.equal(files.length,3);assert.equal(files.reduce((n,x)=>n+x.bytes,0),10637);for(const f of files){const b=fs.readFileSync(new URL(f.path,root));assert.equal(b.length,f.bytes);assert.equal(sha(b),f.sha256);assert.doesNotMatch(b.toString(),/\/workspace\/|\/home\/agent\/|sediment:\/\/|library_file_id|Bearer\s|[?&](?:token|secret|signature)=/i);}
 validateReviewData(material.documentReview);for(const [name,text]of serializeCoverage(buildCoverage()))assert.equal(fs.readFileSync(new URL('website/public/'+name,root),'utf8'),text);
});
console.log(JSON.stringify({passed:results.length,checks:results},null,2));
