import assert from 'node:assert/strict';
import {REVIEW_TARGET,validateDocumentReview} from '../public/document-review.mjs';

// Resolve against original source material IDs BEFORE the regional adapter loses
// them. Never bind on reference-3, titles, product names, or the legacy parent.
export function prepareDocumentReview({review,sourceRecords,legacyDocuments}){
 assert.equal(review.schemaVersion,1);assert.equal(review.reviewId,REVIEW_TARGET.reviewId);
 for(const key of ['sourceMaterialRefId','exactOfficialDocumentUrl','sourceParentInventoryId','sourceIssuerId'])assert.equal(review.binding?.[key],REVIEW_TARGET[key],'Review binding changed: '+key);
 assert.equal(review.documentIdentity?.sha256,REVIEW_TARGET.sha256,'Reviewed PDF SHA mismatch');
 const parents=sourceRecords.filter(x=>x.row.inventory_id===REVIEW_TARGET.sourceParentInventoryId);assert.equal(parents.length,1,'Missing or ambiguous review parent');
 const candidates=sourceRecords.flatMap(c=>c.row.materials.map((m,index)=>({c,m,index}))).filter(x=>x.m.material_ref_id===REVIEW_TARGET.sourceMaterialRefId);
 assert.equal(candidates.length,1,'Missing or ambiguous original material ID');
 const {c,m,index}=candidates[0];assert.equal(c.row.inventory_id,REVIEW_TARGET.sourceParentInventoryId,'Review parent conflict');assert.equal(c.row.issuer_id,REVIEW_TARGET.sourceIssuerId,'Review issuer conflict');
 assert.equal(m.url,REVIEW_TARGET.exactOfficialDocumentUrl,'Review URL missing or conflicting');
 if(m.private_capture_metadata?.sha256!==undefined)assert.equal(m.private_capture_metadata.sha256,REVIEW_TARGET.sha256,'Conflicting source PDF SHA');
 assert.equal(c.path,review.binding.sourceRepositoryRecord.path);assert.equal(c.line,review.binding.sourceRepositoryRecord.jsonlLine);assert.equal(index,review.binding.sourceRepositoryRecord.materialArrayIndexZeroBased);
 assert.equal(c.row.url,review.binding.sourceProductPageUrl);assert.notEqual(m.source_visibility_status,'hidden_source_markup_inline_display_none');
 assert.equal(m.retrieval_status,'size_limit_not_retained');assert.equal(m.acquisition_status,'size_limit_not_retained');assert.equal(m.acquisition_status_as_of,'2026-10-27T16:11:11.532978+00:00');
 assert.equal(m.contract_content_verified,false);assert.equal(m.full_content_safety_review_complete,false);
 const matches=legacyDocuments.filter(x=>x.url===m.url&&x.sha256===REVIEW_TARGET.sha256),legacyIds=legacyDocuments.filter(x=>x.id===REVIEW_TARGET.legacyDocumentId);
 assert.equal(matches.length,1,'Missing or ambiguous exact legacy URL/SHA identity');assert.equal(legacyIds.length,1,'Missing or duplicate legacy ID');
 const legacy=matches[0];assert.equal(legacy.id,REVIEW_TARGET.legacyDocumentId);assert.equal(legacy.bytes,review.documentIdentity.byteCount);assert.equal(legacy.pages,review.documentIdentity.pageCount);
 const overlay={reviewId:review.reviewId,reviewedAt:review.reviewedAt,sourceMetadataPath:REVIEW_TARGET.sourceMetadataPath,sourceMetadataSha256:REVIEW_TARGET.sourceMetadataSha256,binding:Object.fromEntries(['sourceMaterialRefId','exactOfficialDocumentUrl','sourceParentInventoryId','sourceIssuerId','sourceProductPageUrl','sourceRepositoryRecord'].map(k=>[k,review.binding[k]])),documentIdentity:review.documentIdentity,reviewConclusion:review.reviewConclusion,reviewScope:review.reviewScope,deduplication:review.deduplication,preservedBoundaries:review.preservedBoundaries};
 validateDocumentReview({region:c.row.region,sourceId:c.row.inventory_id,issuerId:c.row.issuer_id,formalOriginalCredit:0,verifiedSkuCredit:0},{originalMaterialRefId:m.material_ref_id,url:m.url,urlStatus:'public_source_reference',formalOriginalCredit:0,documentReview:overlay});
 let applied=0;
 return {
  apply(source,original,output){
   if(original.material_ref_id!==REVIEW_TARGET.sourceMaterialRefId)return;
   assert.equal(source.inventory_id,REVIEW_TARGET.sourceParentInventoryId);assert.equal(source.issuer_id,REVIEW_TARGET.sourceIssuerId);assert.equal(original.url,REVIEW_TARGET.exactOfficialDocumentUrl);assert.equal(output.url,original.url);
   assert.equal(++applied,1,'Duplicate review application');
   output.originalMaterialRefId=original.material_ref_id;output.documentReview=structuredClone(overlay);
  },
  finish(){assert.equal(applied,1,'Review was not applied exactly once');}
 };
}
