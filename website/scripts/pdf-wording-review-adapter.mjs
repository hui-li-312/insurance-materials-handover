// Exact, offline metadata overlay. Original source/runtime records are never rewritten.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
export const PDF_REVIEW_PATH='coverage/2026-10-27/batch-14/pdf-wording-review/';
export const PDF_REVIEW_PINS=Object.freeze({'ge-sample-wording-metadata.json':'bd3f4ba32c455978e02ae53055543af9ed94825f80a06e880d5465b808559d69','hlas-uoi-wording-metadata.json':'c3690fd5627a290a6c51633daa6c43038b739ab45c6401fdea0062fd3f020e0c','ge-review-visual-scope.json':'0c21001e67b7c1d9c9aeb614e3cec62a2125da3501f9f53505b051fac5d7ef65','integration-bindings.json':'d79916cb42e2f79edc546571b8080a1914ac05404df0312ddc8bf51545fcfa34'});
const sha=s=>crypto.createHash('sha256').update(s).digest('hex'),digest=o=>sha(JSON.stringify(o));
export function applyPdfWordingReviews({read,rows,documentContexts=[]}){
 const inputs=Object.fromEntries(Object.entries(PDF_REVIEW_PINS).map(([f,h])=>{const t=read(PDF_REVIEW_PATH+f);assert.equal(sha(t),h,'Unapproved PDF metadata bytes: '+f);return[f,JSON.parse(t)];}));
 const manifest=inputs['integration-bindings.json'];assert.equal(manifest.bindings.length,17);
 const byId=new Map(rows.map(o=>[o.id,o]));assert.equal(byId.size,rows.length,'Duplicate runtime observation');
 const bySource=new Map(rows.map(o=>[o.sourceId,o]));const pending=[],used=new Set(),files=new Map();
 const sourceTexts=new Map();function source(p,h){if(!sourceTexts.has(p))sourceTexts.set(p,read(p));const t=sourceTexts.get(p);assert.equal(sha(t),h,'Frozen source SHA mismatch');return t;}
 for(const e of manifest.bindings){
  const b=e.binding;assert.equal(b.targetScope,'observation','Context cannot be promoted into a product');assert(!used.has(e.reviewId));used.add(e.reviewId);
  const original=source(b.sourceCollection,b.sourceCollectionSha256).trim().split('\n').map(JSON.parse),matches=original.filter(r=>r.observation_id===b.sourceObservationId);assert.equal(matches.length,1,'Ambiguous source observation');const s=matches[0],sm=s.material_links[b.sourceMaterialIndex];assert.equal(original[b.sourceRecordLine-1],s,'Source line mismatch');assert.equal(digest(s),b.sourceRecordSha256,'Source record changed');assert.equal(digest(sm),b.sourceMaterialSha256,'Source material changed');
  const htmlText=source(b.sourceHtmlEvidencePath,b.sourceHtmlEvidenceSha256);const html=s.source_page_sha256||s.source_content_sha256||JSON.parse(htmlText).filter(r=>r.source_url===s.product_url&&r.checked_at===s.checked_at).map(r=>r.content_sha256);assert.deepEqual(Array.isArray(html)?html:[html],[b.sourceHtmlSha256],'Exact source HTML evidence mismatch');
  const o=byId.get(b.runtimeObservationId);assert(o,'Missing runtime observation');assert.equal(bySource.get(b.sourceObservationId),o,'Wrong runtime source');assert.equal(rows.filter(r=>r.sourceId===b.sourceObservationId).length,1,'Duplicate source binding');assert.equal(digest(o),b.runtimeObservationSha256,'Runtime parent/issuer/source/history changed');const m=o.materials[b.sourceMaterialIndex];assert(m,'Missing indexed material');assert.equal(digest(m),b.runtimeMaterialSha256,'Runtime material changed');
  assert.equal(m.pdfWordingReview,undefined,'Overlay cannot replace a review');assert.equal(m.documentReview,undefined,'Do not overwrite legacy AIA review');assert.equal(m.htmlWordingReview,undefined,'Do not overwrite HTML review');assert.equal(m.materialRoleReview,undefined,'Do not overwrite the 18 source-label corrections');
  assert.equal(m.url,b.exactMaterialUrl);assert.equal(m.kind,b.originalKind);assert.equal(m.sourceStatus,b.originalSourceStatus);assert.equal(m.publicationDate,null);assert.equal(m.effectiveDate,null);assert.equal(o.formalOriginalCredit,0);assert.equal(o.verifiedSkuCredit,0);assert.equal(m.formalOriginalCredit,0);
  const name=e.metadataPath.slice(PDF_REVIEW_PATH.length);assert.equal(e.metadataSha256,PDF_REVIEW_PINS[name]);const metadata=inputs[name][e.metadataArray][e.metadataIndex];assert(metadata,'Missing exact metadata entry');
  const ge=e.metadataArray==='entries';
  if(ge){assert.deepEqual(metadata.source_binding,{source_collection:b.sourceCollection,source_collection_sha256:b.sourceCollectionSha256,observation_id:b.sourceObservationId,official_name:b.sourceProductName,label:m.title,source_url:b.sourcePageUrl,source_html_sha256:b.sourceHtmlSha256,material_index:b.sourceMaterialIndex,runtime_observation_id:b.runtimeObservationId,runtime_material_id:b.runtimeMaterialId,document_reference_id:b.documentReferenceId});assert.equal(metadata.material_url,m.url);assert.equal(metadata.captured_sha256,e.rawSha256);assert.equal(metadata.physical_pages,e.physicalPages);}
  else{assert.deepEqual(metadata.sourceBindings,[{observationId:b.sourceObservationId,materialIndex:b.sourceMaterialIndex,sourcePageUrl:b.sourcePageUrl}]);assert.equal(metadata.rawSha256,e.rawSha256);assert.equal(metadata.physicalPageCount,e.physicalPages);}
  if(files.has(e.rawSha256))assert.equal(files.get(e.rawSha256),e.physicalPages);else files.set(e.rawSha256,e.physicalPages);
  pending.push([m,{reviewType:'pdfWordingReview',reviewId:e.reviewId,sourceMetadataPath:e.metadataPath,sourceMetadataSha256:e.metadataSha256,rawSha256:e.rawSha256,physicalPages:e.physicalPages,binding:structuredClone(b),metadata:structuredClone(metadata),visualScope:ge?structuredClone(inputs['ge-review-visual-scope.json'].entries.find(v=>v.rawSha256===e.rawSha256)):null}]);
 }
 assert.equal(files.size,16);assert.equal([...files.values()].reduce((n,p)=>n+p,0),271);assert.equal(pending.length,17);
 // No URL-only or filename/title search is ever used. Same-URL directory references stay untouched.
 for(const c of documentContexts)for(const m of c.materials)assert.equal(m.pdfWordingReview,undefined,'No approved directory binding in this batch');
 for(const [m,r]of pending)m.pdfWordingReview=r;
 return {reviewType:'pdfWordingReview',uniqueFiles:16,physicalPages:271,exactSourceBindings:17,geFiles:7,geBindings:8,hlasUoiFiles:9,hlasUoiBindings:9,formalOriginalCredit:0,verifiedSkuCredit:0,formalMainWordingCredit:0,sourceMetadataFiles:Object.keys(PDF_REVIEW_PINS).map(f=>PDF_REVIEW_PATH+f)};
}
