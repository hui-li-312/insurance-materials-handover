// Fixed approved Thai life schemas only. No network, raw bodies, filename naming,
// name-based product merges, or cross-issuer/document-layer identity joins.
import assert from 'node:assert/strict';
import {safeURL} from '../public/coverage-core.mjs';
const SPECS=[
 {id:'muangthai_life_th_catalog',issuer:'own-th-1489116e8845',host:'muangthai.co.th',count:56,visits:60,materialCount:109,componentFile:'component-and-variant-references.jsonl',components:16,extras:['alternate-audience-pages.jsonl','coverage-classes.jsonl'],manifest:'5592414568f50b56f3bcd1c3d66239a1a3dd9c5894529fbec6d2977a25163044'},
 {id:'bangkok_life_th_catalog',issuer:'own-th-0b8588486bb9',host:'bangkoklife.com',count:59,visits:74,materialCount:9,componentFile:'components.jsonl',components:28,extras:['comparison-pages.jsonl','coverage-classes.jsonl','unvisited-channel-references.jsonl'],manifest:'ae78cc9edfebfb44744334bdb12f55c5977d103b4c4008e4ca0f2c78805bb976'}
];
const OBSERVATION_KEYS=['catalog_name_observed','contract_role_status','role_evidence','role_source_title','channel','source_date','source_occurrences','sale_status','all_wordings_complete','formal_original_count_credit','own_h1_labels','page_sha256','checked_at','verification_level','observation_granularity','detail_url','detail_status','observed_routes'];
const MATERIAL_KEYS=['official_link_label','type_evidence','source_page_url','source_page_sha256','language','publication_date','effective_date','document_date','download_status','formal_original_count_credit'];
const COMPONENT_KEYS=['region','issuer_id','parent_product_record_id','official_name','role','source_page_url','source_page_sha256','source_date','standalone_sale_status','additional_product_count_credit','additional_standalone_product_count_credit','formal_original_count_credit'];
const IMAGE_KEYS=['region','issuer_id','parent_product_record_id','material_record_id','url','official_alt_text','role','document_type','source_pages','language','document_date','download_status','formal_original_count_credit'];
const OPTIONAL_PARENTS=new Set(['prod-867740bed4ade05f','prod-29608e7cef3d940e','prod-b549022c70ff6ffa','prod-13f750f40462a642']);
export function addThaiLifeCatalogs({feeds,rows,feedSummaries,add,read,lines,observation,material,facts,sha}){
 const contexts=[];let optionalReferences=0;
 for(const spec of SPECS){
  const feed=feeds.get(spec.id);assert(feed,`Inactive Thai feed: ${spec.id}`);const prefix='coverage/'+feed.path;
  assert.equal(feed.accepted_source_manifest_sha256,spec.manifest);
  const manifestText=read(prefix+'freeze-manifest.json');assert.equal(sha(manifestText),spec.manifest,'Only the independently approved Thai source manifest is accepted');read(prefix+'README.md');
  const identity=JSON.parse(read(prefix+'sources.json')),status=JSON.parse(read(prefix+'run-status.json')),frontier=lines(prefix+'issuer-frontier.jsonl').map(x=>x.row);
  assert.equal(identity.issuer_id,spec.issuer);assert.equal(identity.source_date,null);assert.equal(status.all_public_catalogs_complete,false);assert.equal(status.all_wordings_complete,false);assert.equal(status.material_files_requested,0);
  const visited=lines(prefix+'visited-pages.jsonl').map(x=>x.row),visitByURL=new Map(visited.map(x=>[x.url,x]));assert.equal(visited.length,spec.visits);assert.equal(visitByURL.size,spec.visits);
  function source(url,hash,time){const v=visitByURL.get(url);assert(v,'Thai source association missing exact visited URL');assert.equal(v.html_sha256,hash,'Thai source association hash mismatch');if(time!==undefined)assert.equal(v.checked_at,time,'Thai actual retrieval time changed');return v;}
  // Overlap requires a separately reviewed replacement decision; do not append blindly.
  assert.equal(rows.filter(r=>r.region==='TH'&&(r.issuerId===spec.issuer||[r.sourceUrl,r.catalogUrl].some(u=>u&&new URL(u).hostname.replace(/^www\./,'')===spec.host))).length,0,'Existing Thai issuer/domain overlap requires explicit replacement review');
  const oldIds=new Set(rows.map(r=>r.sourceId));
  add(spec.id,['products.jsonl'],(r,c)=>{
   assert.equal(r.region,'TH');assert.equal(r.issuer_id,spec.issuer);assert.equal(r.issuer,identity.legal_name);assert(!oldIds.has(r.product_record_id),'Thai source identity overlaps an existing observation');assert.equal(r.source_date,null);assert.equal(r.all_wordings_complete,false);assert.equal(r.formal_original_count_credit,0);source(r.url,r.page_sha256,r.checked_at);
   const ownSources=new Set([r.url,...(r.observed_routes||[]).map(x=>x.url)]);
   for(const occurrence of r.source_occurrences||[])source(occurrence.source_page_url,occurrence.source_page_sha256);
   for(const route of r.observed_routes||[]){source(route.url,route.page_sha256,route.source_fetched_at);for(const occurrence of route.source_occurrences||[])source(occurrence.source_url,occurrence.source_page_sha256);}
   const out=observation(r,c,{region:'TH',issuer:r.issuer,legalIssuer:r.issuer,issuerId:r.issuer_id,name:r.official_name,kind:r.role,sourceUrl:r.url,catalogUrl:r.source_occurrences?.[0]?.source_page_url,materials:r.material_links.map((m,i)=>{
    assert(ownSources.has(m.source_page_url),'Thai material must preserve its own parent source-page association');source(m.source_page_url,m.source_page_sha256);assert.equal(m.formal_original_count_credit,0);assert.equal(m.download_status,'not_downloaded');assert(safeURL(m.url),'Approved Thai material URL must remain a safe explicit locator');
    const result=material(m,i,m.document_type,{sourceUrl:m.source_page_url,title:m.official_link_label||'未标注名称的来源引用'});
    Object.assign(result.facts,facts(m,MATERIAL_KEYS),{content_review_status:'unreviewed_not_downloaded',parent_main_policy_wording_credit:0,full_policy_wording_credit:0,material_MIME_confirmed:false});
    if(OPTIONAL_PARENTS.has(r.product_record_id)&&/^สัญญาเพิ่มเติม/.test(m.official_link_label||'')){result.facts.association_role='source_label_optional_rider_reference_not_parent_base_wording';optionalReferences++;}
    return result;
   })});
   out.id='obs-'+sha(spec.issuer+':'+r.product_record_id).slice(0,20);Object.assign(out.facts,facts(r,OBSERVATION_KEYS),{publication_date:null,effective_date:null,source_snapshot_at:status.snapshot_at,issuer_directory_source_date:null,whole_issuer_catalog_closed:false});return out;
  });
  const added=rows.filter(r=>r.provenance.feed===spec.id),byId=new Map(added.map(r=>[r.sourceId,r]));assert.equal(added.length,spec.count);assert.equal(byId.size,spec.count);assert.equal(added.flatMap(r=>r.materials).length,spec.materialCount);
  const components=lines(prefix+spec.componentFile);assert.equal(components.length,spec.components);
  for(const c of components){const r=c.row,parent=byId.get(r.parent_product_record_id);assert(parent,'Thai subordinate reference has no exact parent');assert.equal(r.issuer_id,parent.issuerId);assert([parent.sourceUrl,...(parent.facts.observed_routes||[]).map(x=>x.url)].includes(r.source_page_url),'Thai component source does not belong to its exact parent');source(r.source_page_url,r.source_page_sha256);assert.equal(r.formal_original_count_credit,0);assert.equal(r.additional_product_count_credit??r.additional_standalone_product_count_credit,0);(parent.subordinateReferences??=[]).push({...facts(r,COMPONENT_KEYS),provenance:{feed:spec.id,path:c.path,line:c.line}});}
  const extras=Object.fromEntries(spec.extras.map(file=>[file,lines(prefix+file).map(x=>x.row)]));
  const summary=feedSummaries.find(f=>f.id===spec.id);summary.files.push(...['freeze-manifest.json','README.md','sources.json','run-status.json','issuer-frontier.jsonl','visited-pages.jsonl',spec.componentFile,...spec.extras].map(f=>prefix+f));summary.subordinateNonadditiveReferences=spec.components;
  if(spec.id==='bangkok_life_th_catalog'){
   const images=lines(prefix+'image-candidates.jsonl');assert.equal(images.length,227);assert.equal(new Set(images.map(c=>c.row.url)).size,183);
   for(const c of images){const r=c.row,parent=byId.get(r.parent_product_record_id);assert(parent,'Thai image reference has no exact parent');assert.equal(r.issuer_id,parent.issuerId);assert(safeURL(r.url));assert.equal(r.document_type,'image_candidate_not_verified_wording');assert.equal(r.download_status,'not_downloaded');assert.equal(r.formal_original_count_credit,0);for(const s of r.source_pages){assert([parent.sourceUrl,...(parent.facts.observed_routes||[]).map(x=>x.url)].includes(s.url),'Thai image source does not belong to its exact parent');source(s.url,s.page_sha256);}(parent.imageCandidates??=[]).push({...facts(r,IMAGE_KEYS),content_review_status:'unreviewed_no_render_or_OCR',provenance:{feed:spec.id,path:c.path,line:c.line}});}
   summary.files.push(prefix+'image-candidates.jsonl');summary.unreviewedImageReferences=227;summary.uniqueUnreviewedImageURLs=183;assert.equal(added.flatMap(r=>r.facts.observed_routes).length,61);
  }else{assert.equal(added.filter(r=>r.facts.detail_status==='document_target_not_requested').length,8);assert.equal(added.filter(r=>r.facts.detail_status==='separate_origin_unvisited_not_independently_authorized_for_fetch').length,2);}
  contexts.push({feed:spec.id,sourcePath:prefix+'run-status.json',sourceSnapshotAt:status.snapshot_at,scope:'fixed_life_issuer_source_frontier_not_current_market_or_contract_completion',identity,status,frontier,nonadditiveSourceContexts:extras});
 }
 assert.equal(optionalReferences,52,'Preserve the 52 source-labelled optional-rider references without upgrading parent roles');
 return contexts;
}
