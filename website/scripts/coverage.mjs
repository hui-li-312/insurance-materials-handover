import {addTHIDFourCatalogs} from './th-id-four-catalog-adapter.mjs';
// Explicit, offline adapter for the approved 2026-10-27 public metadata snapshot.
// No network, glob-discovered input, name-based joins, private registry, or raw files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {safeURL} from '../public/coverage-core.mjs';
import {addThaiLifeCatalogs} from './thai-life-adapter.mjs';
import {prepareDocumentReview} from './document-review-adapter.mjs';
import {addMyTwoCatalog} from './my-two-catalog-adapter.mjs';
import {addGreatEasternCatalog} from './great-eastern-adapter.mjs';
import {readGreatEasternSourceLabels} from './ge-source-label-adapter.mjs';
import {addSGThreeCatalogs} from './sg-three-catalog-adapter.mjs';
import {addHKMYCatalogs} from './hk-my-catalog-adapter.mjs';
import {addPhilippineMajorCatalogs} from './ph-major-catalog-adapter.mjs';
import {addIndonesianCatalogs} from './id-two-catalog-adapter.mjs';
import {REVIEW_TARGET} from '../public/document-review.mjs';
const website=fileURLToPath(new URL('../',import.meta.url));
const repo=path.dirname(website.replace(/\/$/,''));
const approved=JSON.parse(fs.readFileSync(path.join(website,'config/coverage-approved-inputs.json')));
const expected=new Map(approved.map(x=>[x.path,x]));
const consumed=new Map();
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
function read(relative){
 const e=expected.get(relative);assert(e,`Unapproved input: ${relative}`);
 const b=fs.readFileSync(path.join(repo,relative));assert.equal(b.length,e.bytes,`Size changed: ${relative}`);assert.equal(sha(b),e.sha256,`Hash changed: ${relative}`);consumed.set(relative,e);return b.toString('utf8');
}
function lines(relative){return read(relative).trim().split('\n').filter(Boolean).map((x,i)=>({row:JSON.parse(x),line:i+1,path:relative}));}
const scalar=x=>typeof x==='string'||typeof x==='number'||typeof x==='boolean'?x:null;
const list=x=>Array.isArray(x)?x.filter(y=>typeof y==='string'):[];
function facts(row,keys){return Object.fromEntries(keys.filter(k=>row[k]!==undefined).map(k=>[k,row[k]]));}
const materialFactKeys=['association_basis','association_evidence','applicability_basis','current_vs_historical','policy_issue_date_boundary','policy_issue_date_scope','source_language_labels','source_language_hint','source_product_ids','product_material_coverage_credit','individual_product_material_credit','product_material_count_credit','formal_material_file_count_credit','locator_publication_status','download_url_disclosure','document_role_evidence','completeness_limits','printed_revision_label','classification_review_scope','is_full_policy_wording','version_as_stated','full_read','pages','document_scope_limit','all_pages_visual_review_complete','full_individualized_contract_complete','page_role_map','printed_date_observation','review_level','specimen_visual_evidence','document_form_status','variant_context','source_availability','body_review_scope','content_review_scope','full_contract_review_status','body_review_status','source_link_label_role','body_observed_role','body_role_evidence_pages','section_date_literal','section_date','section_date_scope'];
function material(m,index,kind,{sourceUrl=null,title=null,status=null,doc=null}={}){
 const d=doc||m; const specimenKind=['sample_master_policy_wording','sample_master_policy_with_accident_agreement_and_endorsement'].includes(kind); const raw=m.url;const url=safeURL(raw)||null;
 return {id:m.document_id||m.material_record_id||`reference-${index+1}`,title:title||m.label||m.title||m.published_link_label||m.published_alt_text||kind||'未标注名称的来源引用',kind:kind||'unclassified',materialRole:specimenKind?kind.replace('sample_',''):kind||'unclassified',specimen:d.document_form_status==='public_SAMPLE_specimen_policy_terms_not_issued_customer_contract'||specimenKind?true:null,url,sourceUrl:safeURL(sourceUrl)||null,urlStatus:raw===null?'withheld_in_public_source':url?'public_source_reference':raw?'invalid_or_non_http_reference':'not_provided',language:scalar(d.language),publicationDate:scalar(d.publication_date??d.source_publication_date??d.document_date),effectiveDate:scalar(d.effective_date),sourceStatus:scalar(status??d.download_status??d.retrieval_status??d.status),formalOriginalCredit:0,notes:list(d.notes),facts:facts(d,materialFactKeys)};
}
const observationFactKeys=['channel','catalog_scope','locale','source_date','source_publication_date','publication_date','effective_date','effective_end_date','effective_date_scope','current_sale_status','sale_status','current_legacy_status','standalone_or_base_status','contract_role_status','role_scope_note','role_semantics','issuer_mapping_status','issuer_mapping_evidence_scope','policy_issue_applicability','source_status_flags','provider_scheme_status','variant_record_count','vhis_certification_numbers','vhis_product_ids','displayed_variant_labels','parent_official_name','parent_product_id','same_offering_group','same_offering_relationship','offering_family_id','relationship','material_association_scope','directory_group','directory_product_label','line_of_business','plan_options','plan_variants','named_subplans','referenced_components','referenced_optional_riders','role_evidence_scope','contractual_rider_status','renewal_scope_note','variant_scope','same_name_observation_group_id','same_name_group_scope','source_mapping_before_document_correction','document_identity_evidence','hideInProductListing','fetch_status','date_scope','parent_inventory_id','base_plan_attachment_status','observed_components','observed_eligible_base_plan_names','observed_numbered_riders','observed_option_labels','material_access_gates','observed_options'];
function observation(r,{feed,path:sourcePath,line},fields){
 assert(fields.region&&fields.issuer&&(fields.name===null||typeof fields.name==='string'),`Unsupported source record ${sourcePath}:${line}`);
 return {id:`obs-${sha(`${sourcePath}:${line}`).slice(0,20)}`,sourceId:r.observation_id||r.inventory_id||r.product_record_id||r.product_id||null,region:fields.region,issuer:fields.issuer,legalIssuer:fields.legalIssuer??null,issuerId:fields.issuerId??null,name:fields.name||'来源未标注名称',alternateName:r.official_name_zh_hant||null,kind:fields.kind||r.role||'unclassified',historical:r.historical_version===true,sourceUrl:safeURL(fields.sourceUrl)||null,catalogUrl:safeURL(fields.catalogUrl)||null,materials:fields.materials||[],notes:list(r.notes),facts:facts(r,observationFactKeys),provenance:{feed,path:sourcePath,line},formalOriginalCredit:0,verifiedSkuCredit:0};
}
export function buildCoverage(){
 consumed.clear();
 const latest=JSON.parse(read('coverage/LATEST.json'));
 const feeds=new Map(latest.feeds.map(f=>[f.id,f]));
 const rows=[];const replacements=[];const feedSummaries=[];
 function add(feedId,files,convert){
  const feed=feeds.get(feedId);assert(feed,`Inactive feed: ${feedId}`);let input=0,shown=0;
  for(const file of files){const p='coverage/'+feed.path+file;for(const item of lines(p)){input++;const result=convert(item.row,{...item,feed:feedId});if(result){rows.push(result);shown++;}}}
  feedSummaries.push({...feed,inputRows:input,displayRows:shown,files:files.map(f=>'coverage/'+feed.path+f)});
 }
 function common(r,ctx){
  const source=r.product_url||null;
  return observation(r,ctx,{region:r.jurisdiction,issuer:r.issuer||`${r.source_brand}（法定承保人待核）`,legalIssuer:r.issuer,issuerId:r.issuer_id,name:r.official_name,sourceUrl:source,catalogUrl:r.source_catalog_url,materials:(r.material_links||[]).map((m,i)=>material(m,i,m.type,{sourceUrl:r.source_catalog_url||source}))});
 }
 add('hk_sg_my_catalog',['observed-products.jsonl'],(r,c)=>{
  const replace=r.issuer==='EQ INSURANCE COMPANY LTD.'?'sg_seven_catalog':r.issuer==='Trinity General Insurance Company Limited'?'hk_my_four_catalog':null;
  if(replace){replacements.push({feed:c.feed,path:c.path,line:c.line,issuer:r.issuer,replacedBy:replace});return null;}return common(r,c);
 });
 assert.equal(replacements.filter(x=>x.replacedBy==='sg_seven_catalog').length,33);
 assert.equal(replacements.filter(x=>x.replacedBy==='hk_my_four_catalog').length,3);
 // Read the superseded source only as a stable-identity seed, never as extra observations.
 const regionalPredecessor='coverage/2026-10-27/batch-2/bn-kh/products.jsonl';
 const regionalPrevious=new Map(lines(regionalPredecessor).map(c=>[c.row.inventory_id,{id:`obs-${sha(`${c.path}:${c.line}`).slice(0,20)}`,name:c.row.official_name,region:c.row.region}]));
 assert.equal(regionalPrevious.size,428);
 const regionalBatch5Path='coverage/2026-10-27/batch-5/bn-kh-la-mm/products.jsonl';
 const regionalBatch5=new Map(lines(regionalBatch5Path).map(c=>[c.row.inventory_id,c.row]));
 assert.equal(regionalBatch5.size,706);
 let regionalBatch5Retained=0;
 let regionalRetained=0;
 const reviewPath='coverage/2026-10-27/batch-10/aia-kh-document-review/';
 const reviewManifest=JSON.parse(read(reviewPath+'hash-manifest.json'));read(reviewPath+'README.md');
 for(const file of reviewManifest.files){const approvedFile=expected.get(reviewPath+file.path);assert(approvedFile);assert.equal(approvedFile.bytes,file.bytes);assert.equal(approvedFile.sha256,file.sha256);}
 assert.equal(expected.get(REVIEW_TARGET.sourceMetadataPath).sha256,REVIEW_TARGET.sourceMetadataSha256,'Unapproved review version');
 const reviewBinding=prepareDocumentReview({review:JSON.parse(read(REVIEW_TARGET.sourceMetadataPath)),sourceRecords:lines('coverage/'+feeds.get('bn_kh_catalog_and_regional_queues').path+'products.jsonl'),legacyDocuments:JSON.parse(read('website/public/sea.json')).documents});
 add('bn_kh_catalog_and_regional_queues',['products.jsonl'],(r,c)=>{
  assert(typeof r.inventory_id==='string','Regional stable source identity missing');
  const converted=r.materials.map((m,i)=>{const output=material(m,i,m.document_role,{sourceUrl:m.source_page_url||r.url});Object.assign(output.facts,facts(m,['association_scope','document_role_basis','source_visibility_status','source_visibility_evidence','visible_product_material_credit','current_visible_offer_status','visibility_privacy_interpretation','target_origin_approval','target_access_status','role_conflict','applicable_product_match','current_bytes_status','reuse_review_status','withholding_reason','public_direct_locator_status','contract_content_verified','additional_source_page_urls','source_page_urls','observed_labels','context_heading','preliminary_or_specimen_status','final_current_wording_status','product_association_status','version_relationship_status','current_issued_contract_applicability','full_content_safety_review_complete','acquisition_status_as_of','acquisition_status']));reviewBinding.apply(r,m,output);return output;});
  const visible=converted.filter((m,i)=>r.materials[i].source_visibility_status!=='hidden_source_markup_inline_display_none');
  const hidden=converted.filter((m,i)=>r.materials[i].source_visibility_status==='hidden_source_markup_inline_display_none');
  const row=observation(r,c,{region:r.region,issuer:r.legal_entity,legalIssuer:r.legal_entity,issuerId:r.issuer_id,name:r.official_name,sourceUrl:r.url,catalogUrl:r.source_urls?.[0],materials:visible});
  if(hidden.length)row.hiddenMaterials=hidden;
  Object.assign(row.facts,facts(r,['checked_at','official_name_basis','unique_current_sku_verified','all_market_product_catalog_complete','observation_scope','same_offering_context_review','unique_sku_status','language_variant_of_observed_same_route','issuer_mapping_basis','parent_inventory_ids','source_role','issuer_origin_access_status','related_contexts','unique_current_sku_credit','same_observed_name_contexts','observed_plan_variants','observed_risk_classifications_not_products','observed_resource_sections','relationship_note','language']));
  const batch5=regionalBatch5.get(r.inventory_id);
  if(batch5){
   for(const key of ['official_name','region','role','url','source_date','checked_at'])assert.deepEqual(r[key],batch5[key],`Prior regional field changed: ${key}`);
   assert.equal(r.materials.length,batch5.materials.length,'Prior regional associations changed');
   for(const [i,m]of r.materials.entries())for(const key of ['url','label','document_role','source_visibility_status'])assert.deepEqual(m[key],batch5.materials[i][key],`Prior regional material changed: ${key}`);
   regionalBatch5Retained++;
  }
  const previous=regionalPrevious.get(r.inventory_id);
  if(previous){assert.equal(previous.name,r.official_name);assert.equal(previous.region,r.region);row.id=previous.id;regionalRetained++;}
  else row.id=`obs-${sha(c.feed+':'+r.inventory_id).slice(0,20)}`;
  return row;
 });
 reviewBinding.finish();
 assert.equal(regionalRetained,428,'The cumulative replacement must retain all 428 predecessor identities');
 assert.equal(regionalBatch5Retained,706,'The cumulative replacement must retain all 706 batch-5 identities');
 const regionalRows=rows.filter(r=>r.provenance.feed==='bn_kh_catalog_and_regional_queues');
 assert.equal(regionalRows.length,872);assert.equal(new Set(regionalRows.map(r=>r.sourceId)).size,872);assert.equal(regionalRows.reduce((n,r)=>n+(r.hiddenMaterials?.length||0),0),16);
 // Source-only links stay in their approved sidecar, not invented product cards.
 const regionalSourceOnlyPath='coverage/'+feeds.get('bn_kh_catalog_and_regional_queues').path+'source-only-material-observations.jsonl';
 const regionalSourceOnly=lines(regionalSourceOnlyPath);assert.equal(regionalSourceOnly.length,21);
 const regionalSummary=feedSummaries.find(f=>f.id==='bn_kh_catalog_and_regional_queues');
 regionalSummary.files.push(regionalSourceOnlyPath);regionalSummary.sourceOnlyMaterialContexts=21;regionalSummary.sourceOnlyDisplayRows=0;

 function simple(r,c){return observation(r,c,{region:r.region,issuer:r.issuer,legalIssuer:r.issuer,issuerId:r.issuer_id,name:r.official_name,sourceUrl:r.url,catalogUrl:r.catalog_url,materials:r.material_links.map((m,i)=>material(m,i,m.document_type,{sourceUrl:r.url}))});}
 add('ocean_life_selected_catalog',['products.jsonl'],simple);
 add('ocean_life_group_supplement',['products.jsonl'],simple);
 add('hk_vhis_scheme_registry',['hk-vhis-latest-plan-observations.jsonl','hk-vhis-historical-plan-observations.jsonl','hk-vhis-supplementary-information.jsonl'],(r,c)=>{
  const item=common(r,c);if(r.role==='plan')item.kind=r.historical_version?'registry_historical_group':'registry_latest_group';return item;
 });
 const kfeed=feeds.get('krungthai_axa_catalog');
 const documents=new Map(lines('coverage/'+kfeed.path+'documents.jsonl').map(x=>[x.row.document_id,x.row]));
 add('krungthai_axa_catalog',['products.jsonl'],(r,c)=>observation(r,c,{region:r.region,issuer:r.issuer_legal_name,legalIssuer:r.issuer_legal_name,name:r.official_name,sourceUrl:r.product_url,catalogUrl:r.source_catalog_url,materials:r.material_links.map((m,i)=>{
  const d=documents.get(m.document_id);assert(d,`Unresolved explicit document ID ${m.document_id}`);
  // Join only the source's explicit document ID. Null product locator remains null.
  return material(m,i,d.type,{sourceUrl:r.product_url,doc:d,title:d.source_associations?.find(a=>a.source_page_url===r.product_url)?.label,status:d.status});
 })}));
 add('th_id_ph_initial_observations',['products.jsonl'],simple);
 // Two classifications enrich exact Ocean product IDs and exact URL associations.
 // They are not new offerings or independent catalogue additions.
 const oceanFeed=feeds.get('ocean_material_probe');let enriched=0;
 for(const c of lines('coverage/'+oceanFeed.path+'materials.jsonl')){
  const r=c.row;const p=rows.find(x=>x.provenance.feed==='ocean_life_selected_catalog'&&x.sourceId===r.product_record_id);assert(p,'Ocean product relationship missing');
  const index=p.materials.findIndex(m=>m.url===r.url);assert(index>=0,'Ocean exact source material relationship missing');
  const m=material(r,index,r.document_type,{sourceUrl:r.product_url});m.provenance={feed:'ocean_material_probe',path:c.path,line:c.line};p.materials[index]=m;enriched++;
 }
 assert.equal(enriched,2);feedSummaries.push({...oceanFeed,inputRows:2,displayRows:0,enrichedExistingMaterials:2,files:['coverage/'+oceanFeed.path+'materials.jsonl']});
 add('samsung_life_catalog',['products.jsonl'],simple);
 add('samsung888_supplement',['products.jsonl'],simple);
 add('sg_seven_catalog',['products-sg-aia.jsonl','products-sg-chubb.jsonl','products-sg-eq.jsonl','products-sg-hsbc.jsonl','products-sg-manulife.jsonl','products-sg-singlife.jsonl','products-sg-taiping.jsonl'],common);
 add('manulife_my_catalog',['products-manulife-my.jsonl'],common);
 add('hk_my_four_catalog',['products-liberty-my.jsonl','products-progressive-my.jsonl','products-tahoe-hk.jsonl','products-trinity-hk.jsonl'],common);
 add('sunlife_my_shared_catalog',['products-sunlife-my.jsonl','documents-sunlife-my.jsonl'],common);
 add('generali_my_shared_catalog',['products-generali-my.jsonl','documents-generali-my.jsonl'],common);
 add('aia_my_catalog',['products-aia-my.jsonl','documents-aia-my.jsonl','hidden-source-metadata.jsonl'],(r,c)=>r.role==='unlisted_source_metadata'?observation(r,c,{region:r.jurisdiction,issuer:`${r.source_brand}（法定承保人待核）`,legalIssuer:null,name:r.official_name,sourceUrl:r.url,catalogUrl:r.source_url,materials:[]}):common(r,c));
 add('chinalife_hk_catalog',['products-chinalife-hk.jsonl'],common);
 function enrichReview(feedId,parentFeed,file){
  const f=feeds.get(feedId),p='coverage/'+f.path+file,materials=JSON.parse(read(p));let count=0;
  for(const [i,r]of materials.entries()){
   const parent=rows.find(x=>x.provenance.feed===parentFeed&&x.sourceId===r.observation_id);assert(parent,`Review exact parent missing: ${feedId}`);
   const j=parent.materials.findIndex(m=>m.url===r.material_url);assert(j>=0,`Review exact material relationship missing: ${feedId}`);
   const source={...r,url:r.material_url,publication_date:r.source_publication_date??null,effective_date:r.source_effective_date??null,pages:Number(r.pdf_permissions_and_structure.Pages)};
   const m=material(source,j,r.body_observed_role||r.material_type,{sourceUrl:r.source_product_url,title:parent.materials[j].title,status:r.intake_status||r.status});
   m.provenance={feed:feedId,path:p,index:i};parent.materials[j]=m;count++;
  }
  assert.equal(count,feedId==='aia_my_material_review'?4:6);
  feedSummaries.push({...f,inputRows:materials.length,displayRows:0,enrichedExistingMaterials:count,files:[p]});
 }
 enrichReview('aia_my_material_review','aia_my_catalog','private-original-intake-metadata.json');
 enrichReview('chinalife_hk_material_review','chinalife_hk_catalog','private-intake-metadata.json');
 // These two PH sample associations remain material-only observations, separate
 // from the later AIA company-source catalogue; no invented verified products.
 add('ph_master_policy_samples',['materials.jsonl'],(r,c)=>{
  const row=observation(r,c,{region:r.region,issuer:r.issuer,legalIssuer:r.issuer,issuerId:r.issuer_id,name:`${r.official_product_name} — ${r.official_document_title}`,kind:'document_page',sourceUrl:r.product_url,catalogUrl:r.product_url,materials:[material(r,0,r.document_type,{sourceUrl:r.product_url,title:r.official_document_title})]});
  row.facts.association_scope='explicit_source_product_page_and_material_only_not_product_census';return row;
 });
 // Batch 6 is an explicit fixed-schema import; indexes/intakes never add duplicate product rows.
 const batch6MaterialKeys=['source_visibility_status','source_visibility_classes','current_visible_product_material_credit','current_offering_association_status','association_visibility_scope','parent_main_policy_wording_credit','parent_product_material_coverage_credit','complete_parent_contract_credit','full_policy_wording_credit','main_policy_wording_credit','product_material_credit','material_for_named_component','material_for_named_related_offering','association_role','different_offering_name','source_association_context','association_scope','material_role_scope','role_scope','version_applicability_label','all_version_applicability_labels','date_scope','version_scope','application_date_from','application_date_before','applicable_until','specimen_status','content_review_status','visibility_status','contract_content_verified','product_specific_main_contract_verified','full_content_safety_review_complete','source_role_conflict','role_basis','additional_observed_labels','source_stated_update_date','source_stated_update_date_scope','applicability_date','applicability_date_scope','applicability_date_basis','acquisition_as_of','acquisition_status'];
 const batch6ObservationKeys=['source_publisher','issuer_mapping_status','underwriter_identity_evidence','identity_review_scope','issuer_identity_evidence','candidate_legal_entity_evidence','source_visibility_status','current_product_coverage_credit','availability_evidence_limit','directory_label_applicability_scope','parent_observation_id','component_role_basis','role_evidence','catalog_limit','product_count_credit','observation_class','official_name_basis','unique_sku_status','unique_current_sku_verified','all_public_catalog_complete','source_origin_now_closed','source_origin_scope','embedded_context_label','same_observed_name_context_group','related_inventory_ids_shared_material_context','same_offering_context_review','related_route_context_group','related_route_identity','role_basis'];
 const sgHidden='ancestor_explicitly_hidden_on_desktop_tablet_and_mobile';
 function batch6Material(m,i,kind,sourceUrl){const out=material(m,i,kind,{sourceUrl});Object.assign(out.facts,facts(m,batch6MaterialKeys));if(m.material_ref_id)out.id=m.material_ref_id;return out;}
 function etiqa(r,c){
  const isSG=r.jurisdiction==='SG';
  const publisherOnly=isSG&&r.issuer_mapping_status==='official_source_publisher_confirmed_policy_contract_underwriter_not_independently_verified';
  const legal=publisherOnly?null:r.issuer;
  const ms=r.material_links.map((m,i)=>batch6Material(m,i,m.type,r.product_url));
  const row=observation(r,c,{region:r.jurisdiction,issuer:legal||`${isSG?'Etiqa Singapore / Tiq':r.source_brand}（法定承保人待核）`,legalIssuer:legal,issuerId:r.issuer_id,name:r.official_name,sourceUrl:r.product_url,catalogUrl:r.source_catalog_url,materials:ms.filter(m=>m.facts.source_visibility_status!==sgHidden)});
  const hidden=ms.filter(m=>m.facts.source_visibility_status===sgHidden);if(hidden.length)row.hiddenMaterials=hidden;
  Object.assign(row.facts,facts(r,batch6ObservationKeys));return row;
 }
 assert.equal(rows.filter(r=>r.provenance.feed==='hk_sg_my_catalog'&&/etiqa/i.test(r.issuer)).length,0,'Unexpected Etiqa predecessor overlap requires explicit replacement review');
 add('etiqa_sg_catalog',['products-sg-etiqa-expanded.jsonl','documents-sg-etiqa-expanded.jsonl'],etiqa);
 add('etiqa_my_catalog',['products-etiqa-my.jsonl'],etiqa);
 // Exact-ID and exact-null-safe-URL enrichments only. Preserve source visibility and association limitations.
 function etiqaReview(feedId,parentFeed,file,separate){
  const f=feeds.get(feedId),p='coverage/'+f.path+file,rs=JSON.parse(read(p));let count=0;
  for(const [i,r]of rs.entries()){
   const parent=rows.find(x=>x.provenance.feed===parentFeed&&x.sourceId===r.observation_id);assert(parent,'Etiqa exact review parent missing');
   assert(safeURL(r.material_url),'Review locator must be a safe non-held exact URL');
   const all=[...parent.materials,...(parent.hiddenMaterials||[])],matches=all.filter(m=>m.url!==null&&m.url===r.material_url);assert.equal(matches.length,1,'Review must match one exact non-held source reference');
   const m=matches[0];m.kind=r.material_type;m.materialRole=r.material_type;m.sourceStatus=r.status;
   Object.assign(m.facts,facts(r,['body_review_status','document_form_status','sample_marking_scope','document_version_label_from_reviewed_page','version_scope','version_caution','date_scope','source_application_applicability_label','application_date_from','visual_review_scope','narrow_legal_identity_evidence','narrow_identity_evidence','full_contract_acceptance','full_contract_review','raw_release_authorized']));
   m.facts.pages=Number(r.pdf_permissions_and_structure.Pages);m.publicationDate=r.publication_date??null;m.effectiveDate=r.effective_date??null;
   m.provenance={feed:feedId,path:p,index:i};count++;
  }
  assert.equal(count,separate?4:7);
  if(separate)feedSummaries.push({...f,inputRows:count,displayRows:0,enrichedExistingMaterials:count,files:[p]});
  else {const summary=feedSummaries.find(x=>x.id===parentFeed);summary.enrichedExistingMaterials=count;summary.files.push(p);}
 }
 etiqaReview('etiqa_sg_material_review','etiqa_sg_catalog','private-intake-metadata.json',true);
 etiqaReview('etiqa_my_catalog','etiqa_my_catalog','private-intake-metadata.json',false);
 const vnFeed=feeds.get('vn_catalog_contexts');
 const vnIdentities=new Map(JSON.parse(read('coverage/'+vnFeed.path+'identity-resolution.json')).map(x=>[x.issuer_id,x]));assert.equal(vnIdentities.size,60);
 add('vn_catalog_contexts',['products.jsonl'],(r,c)=>{
  const identity=vnIdentities.get(r.issuer_id);assert(identity,'VN explicit issuer identity missing');
  const row=observation(r,c,{region:r.region,issuer:r.legal_entity,legalIssuer:r.legal_entity,issuerId:r.issuer_id,name:r.official_name,sourceUrl:r.url,catalogUrl:r.source_urls?.[0],materials:r.materials.map((m,i)=>batch6Material(m,i,m.document_role,m.source_page_url||r.url))});
  Object.assign(row.facts,facts(r,batch6ObservationKeys));row.facts.issuer_identity_context=facts(identity,['identity_resolution','source_roster_scope','current_license_status','current_sale_or_runoff_status','brand_name_observed','current_legal_name_observed']);
  return row;
 });
 const sgRows=rows.filter(r=>r.provenance.feed==='etiqa_sg_catalog'),myRows=rows.filter(r=>r.provenance.feed==='etiqa_my_catalog'),vnRows=rows.filter(r=>r.provenance.feed==='vn_catalog_contexts');
 assert.equal(sgRows.length,185);assert.equal(sgRows.reduce((n,r)=>n+(r.hiddenMaterials?.length||0),0),29);assert.equal(myRows.length,89);assert.equal(vnRows.length,933);
 assert.equal(vnRows.filter(r=>r.kind.startsWith('resource_only_')).length,368);
 // Batch 8: exact source-scoped Prudential schema. Index/card sidecars never add rows.
 const pruFeed=feeds.get('prudential_sg_catalog'),pruPath='coverage/'+pruFeed.path;
 const pruDates=JSON.parse(read(pruPath+'prudential-sg-source-scoped-dates.json'));
 assert.equal(pruDates.length,46);const pruDateById=new Map(pruDates.map(x=>[x.evidence_id,x]));assert.equal(pruDateById.size,46);
 const pruDocs=lines(pruPath+'documents-prudential-sg.jsonl').map(x=>x.row),pruCards=JSON.parse(read(pruPath+'prudential-sg-selector-source-card-observations.json'));
 assert.equal(pruDocs.length,69);assert.equal(pruCards.length,49);
 const pruObservationKeys=['checked_at','language','source_publisher','source_publisher_issuer_id','catalog_coverage_owner_issuer_id','catalog_scope_note','distributor','distributor_issuer_id','possible_source_issuer_ids','issuer_mapping_status','issuer_evidence','source_catalog_urls','source_card_ids','source_card_titles','source_card_categories','official_page_title','source_page_sha256','base_standalone_contract_status','current_new_business_status','parent_observation_id','source_component_evidence','source_role_evidence','source_named_members','member_count_additional_observation_credit','current_product_coverage_credit','attachment_target_name','attachment_target_context','source_body_status','source_status_note','source_scoped_date_note','source_card_link_conflict','source_eligibility_conflict','source_page_information_as_of_evidence_ids'];
 const pruMaterialKeys=['source_date','source_anchor_xpath','source_markup_visibility_hints','visibility_status','content_review_status','formal_material_file_credit','verified_main_policy_wording_credit','association_role','external_origin_not_requested','product_specific_material_credit'];
 const beforePru=new Set(rows.map(r=>r.sourceId));
 assert.equal(rows.filter(r=>r.region==='SG'&&r.provenance.feed==='hk_sg_my_catalog'&&/prudential|income/i.test(r.issuer)).length,0,'Unexpected predecessor overlap requires an explicit replacement decision');
 add('prudential_sg_catalog',['products-prudential-sg.jsonl'],(r,c)=>{
  assert(!beforePru.has(r.observation_id),'Prudential source ID overlaps an existing feed');
  assert.equal(r.catalog_coverage_owner_issuer_id,'SG-own-40bf6a1dd276af06');assert.equal(r.source_publisher_issuer_id,r.catalog_coverage_owner_issuer_id);
  const row=observation(r,c,{region:r.jurisdiction,issuer:r.issuer||r.source_publisher+'（法定承保人待核）',legalIssuer:r.issuer,issuerId:r.issuer_id,name:r.official_name,sourceUrl:r.product_url,catalogUrl:r.source_catalog_urls?.[0],materials:r.material_links.map((m,i)=>{const out=material(m,i,m.type,{sourceUrl:m.source_url});Object.assign(out.facts,facts(m,pruMaterialKeys));return out;})});
  row.id='obs-'+sha(c.feed+':'+r.observation_id).slice(0,20);Object.assign(row.facts,facts(r,pruObservationKeys));
  if(r.source_page_information_as_of_evidence_ids){row.facts.source_page_information_as_of=r.source_page_information_as_of_evidence_ids.map(id=>{const d=pruDateById.get(id);assert(d,'Unknown explicit scoped date ID');assert.equal(d.source_url,r.product_url);assert.equal(d.source_sha256,r.source_page_sha256);assert.equal(d.source_checked_at,r.checked_at);return d;});}
  return row;
 });
 const pruRows=rows.filter(r=>r.provenance.feed==='prudential_sg_catalog'),pruById=new Map(pruRows.map(r=>[r.sourceId,r]));assert.equal(pruRows.length,128);assert.equal(pruById.size,128);
 for(const row of pruRows){const id=row.facts.parent_observation_id;if(id){const parent=pruById.get(id);assert(parent,'Prudential exact component parent missing');assert.equal(row.materials.length,0,'Do not inherit parent materials');row.parentObservation={id:parent.id,sourceId:parent.sourceId,name:parent.name,kind:parent.kind,region:parent.region,issuer:parent.issuer};}}
 assert.equal(pruRows.filter(r=>r.parentObservation).length,74);
 assert.equal(pruRows.filter(r=>r.facts.source_page_information_as_of).length,117);
 assert.equal(pruRows.filter(r=>r.legalIssuer).length,1);const care=pruRows.find(r=>r.legalIssuer);assert.equal(care.legalIssuer,'INCOME INSURANCE LIMITED');assert.equal(care.facts.distributor,'PRUDENTIAL ASSURANCE COMPANY SINGAPORE (PTE) LIMITED');assert.notEqual(care.issuerId,care.facts.catalog_coverage_owner_issuer_id);
 const pruMaterials=pruRows.flatMap(r=>r.materials);assert.equal(pruMaterials.length,75);assert.equal(new Set(pruMaterials.map(m=>m.url)).size,69);
 let pruAssociations=0;for(const d of pruDocs){assert(safeURL(d.url));for(const a of d.associations){const r=pruById.get(a.observation_id);assert(r);assert.equal(r.name,a.official_name);assert.equal(r.sourceUrl,a.source_url);const m=r.materials[a.material_index];assert(m);assert.equal(m.url,safeURL(d.url));assert.equal(m.facts.association_role,a.association_role);pruAssociations++;}}assert.equal(pruAssociations,75);
 const pruSummary=feedSummaries.find(f=>f.id==='prudential_sg_catalog');pruSummary.files.push(pruPath+'documents-prudential-sg.jsonl',pruPath+'prudential-sg-selector-source-card-observations.json',pruPath+'prudential-sg-source-scoped-dates.json');pruSummary.nonadditiveDocumentIndexRows=69;pruSummary.nonadditiveRendererCards=49;
 // AIA PH is an explicit company-source feed, not a legal-underwriter assignment.
 const aiaPHFeed=feeds.get('aia_ph_source_catalog'),aiaPHPath='coverage/'+aiaPHFeed.path;
 const aiaPHIdentity=JSON.parse(read(aiaPHPath+'identity-evidence.json')),aiaPHSources=JSON.parse(read(aiaPHPath+'sources.json')),aiaPHSourceById=new Map(aiaPHSources.map(r=>[r.source_id,r]));
 assert.equal(aiaPHIdentity.contractual_issuer_id,null);assert.equal(aiaPHIdentity.contractual_issuer_name,null);assert.equal(aiaPHIdentity.own_exact_full_legal_name_confirmed,false);
 const aiaPHMentions=lines(aiaPHPath+'material-links.jsonl');assert.equal(aiaPHMentions.length,11);const mentionsByParent=new Map();for(const c of aiaPHMentions){const r=c.row;assert.equal(r.url,null);assert.equal(r.document_type,'brochure_candidate_from_link_label_only');(mentionsByParent.get(r.product_record_id)||mentionsByParent.set(r.product_record_id,[]).get(r.product_record_id)).push(c);}
 const aiaPHObservationKeys=['record_kind','parent_offering_record_id','source_company_brand','source_company_issuer_id','roster_associated_issuer_id','roster_legal_name','contractual_issuer_id','contractual_issuer_name','contractual_issuer_status','own_exact_legal_name_confirmed','source_id','source_element_locator','source_sha256','source_sha256_kind','page_sha256','verification_level','detail_status','checked_at','language','hidden_or_discontinued_status','observation_granularity','all_wordings_complete','all_SKUs_complete','product_form','published_issue_age','published_coverage_period','standalone_product','role_evidence','published_name_is_parent_context_label','cross_parent_rider_deduplication_status','formal_rider_name_status','payment_options_not_standalone_products','parent_relationship_status','same_name_family_record_id','same_name_family_status','web_crawl_currency_caution','published_medical_benefit_amount_options_not_named_products','detail_visit_source_id','published_claims_not_verified_against_current_contract','attachment_status','not_available_for_this_variant','insurance_contract_status'];
 const aiaPHCaptureKeys=['source_id','url','final_url','capture_method','capture_sha256','raw_html_sha256','checked_at','web_crawl_freshness_label','http_status','source_live_http_status','status','capture_completeness','captured_line_ranges','captured_line_count','reported_total_source_lines','missing_line_ranges_in_original_capture','supplemental_source_id','combined_declared_line_coverage','combined_missing_line_ranges','supplements_source_id','newly_covered_line_ranges','overlapping_line_count','overlap_line_conflicts','source_line_coverage_caveat'];
 const aiaPHBefore=new Set(rows.map(r=>r.sourceId));assert.equal(rows.filter(r=>r.region==='PH'&&/aia/i.test(r.issuer)).length,0,'Unexpected AIA PH predecessor requires reviewed overlap handling');
 add('aia_ph_source_catalog',['products.jsonl'],(r,c)=>{
  assert(!aiaPHBefore.has(r.product_record_id));assert.equal(r.issuer,null);assert.equal(r.contractual_issuer_name,null);const source=aiaPHSourceById.get(r.source_id);assert(source);assert.equal(source.capture_sha256,r.source_sha256);assert.equal(source.checked_at,r.checked_at);assert([source.url,source.final_url].includes(r.source_url));
  const row=observation(r,c,{region:r.region,issuer:r.source_company_brand+'（法定承保人待核）',legalIssuer:null,issuerId:null,name:r.official_name,sourceUrl:r.source_url,catalogUrl:null,materials:(mentionsByParent.get(r.product_record_id)||[]).map((mc,i)=>{const m=mc.row;assert.equal(m.source_id,r.source_id);assert.equal(m.source_capture_sha256,r.source_sha256);assert.equal(m.source_url,r.source_url);const out=material(m,i,m.document_type,{sourceUrl:m.source_url});out.id=m.material_id;out.urlStatus='unresolved_source_target';Object.assign(out.facts,facts(m,['source_id','source_capture_sha256','source_element_locator','url_status','document_type_verified','source_date','material_sha256','policy_wording_status','formal_original_count_credit']));out.provenance={feed:c.feed,path:mc.path,line:mc.line};return out;})});
  row.id='obs-'+sha(c.feed+':'+r.product_record_id).slice(0,20);Object.assign(row.facts,facts(r,aiaPHObservationKeys));row.facts.source_capture=facts(source,aiaPHCaptureKeys);
  if(source.supplemental_source_id){const supplement=aiaPHSourceById.get(source.supplemental_source_id);assert(supplement);assert.equal(supplement.supplements_source_id,source.source_id);row.facts.supplemental_source_capture=facts(supplement,aiaPHCaptureKeys);}
  if(r.detail_visit_source_id){const detail=aiaPHSourceById.get(r.detail_visit_source_id);assert(detail);row.facts.separate_detail_visit=facts(detail,aiaPHCaptureKeys);}
  return row;
 });
 const aiaPHRows=rows.filter(r=>r.provenance.feed==='aia_ph_source_catalog'),aiaPHById=new Map(aiaPHRows.map(r=>[r.sourceId,r]));assert.equal(aiaPHRows.length,56);assert.equal(aiaPHById.size,56);assert.equal(aiaPHRows.flatMap(r=>r.materials).length,11);
 for(const row of aiaPHRows){const id=row.facts.parent_offering_record_id;if(id){const parent=aiaPHById.get(id);assert(parent,'AIA PH exact parent missing');row.parentObservation={id:parent.id,sourceId:parent.sourceId,name:parent.name,kind:parent.kind,region:parent.region,issuer:parent.issuer};}if(['rider','supplementary_benefit','included_benefit','currency_variant','package_configuration'].includes(row.kind))assert.equal(row.materials.length,0,'Do not inherit AIA PH parent materials');}
 assert.equal(aiaPHRows.filter(r=>r.parentObservation).length,43);for(const id of mentionsByParent.keys())assert(aiaPHById.has(id),'Orphan AIA PH material mention');
 const aiaPHSummary=feedSummaries.find(f=>f.id==='aia_ph_source_catalog');aiaPHSummary.files.push(aiaPHPath+'material-links.jsonl',aiaPHPath+'identity-evidence.json',aiaPHPath+'sources.json');aiaPHSummary.materialLabelMentions=11;aiaPHSummary.unresolvedMaterialTargets=11;
 const myTwoContext=addMyTwoCatalog({feeds,rows,feedSummaries,add,read,lines,observation,facts,sha});
 const greatEasternContexts=addGreatEasternCatalog({feeds,rows,feedSummaries,add,read,lines,observation,material,facts,sha});
 const geSourceLabelReview=readGreatEasternSourceLabels({read,rows});
 feedSummaries.find(f=>f.id==='great_eastern_sg_my_catalog').associatedReviews=[geSourceLabelReview];
 const thaiLifeContexts=addThaiLifeCatalogs({feeds,rows,feedSummaries,add,read,lines,observation,material,facts,sha});
 const idTwoContext=addIndonesianCatalogs({feeds,rows,feedSummaries,add,read,observation,material,facts,sha});
 const phMajorContexts=addPhilippineMajorCatalogs({feeds,rows,feedSummaries,add,read,observation,material,facts,sha});
 const thIdFourContexts=addTHIDFourCatalogs({feeds,rows,feedSummaries,add,read,observation,material,sha});
 const sgThreeContext=addSGThreeCatalogs({feeds,rows,feedSummaries,add,read,observation,material,sha});
 const hkMyContexts=addHKMYCatalogs({feeds,rows,feedSummaries,add,read,observation,material,sha});
 assert.equal(feedSummaries.length,latest.feeds.length,'An active feed has no explicit adapter');
 // Preserve variant identities as subordinate facts, never add them as products.
 const vfeed=feeds.get('hk_vhis_scheme_registry');let variantCount=0;
 const bySource=new Map(rows.filter(x=>x.provenance.feed===vfeed.id).map(x=>[x.sourceId,x]));
 for(const c of lines('coverage/'+vfeed.path+'hk-vhis-plan-variants.jsonl')){
  const r=c.row,p=bySource.get(r.parent_observation_id);assert(p,'VHIS variant parent missing');
  (p.variants??=[]).push({id:r.vhis_product_id,certification:r.vhis_certification_no,level:r.plan_level,levelZh:r.plan_level_zh_hant,currency:r.currency,renewalOnlyFlag:r.source_variant_renewal_only_flag,effectiveDate:r.effective_date,effectiveEndDate:r.effective_end_date});variantCount++;
 }
 assert.equal(variantCount,2589);
 const visibleMaterials=rows.flatMap(x=>x.materials),hiddenMaterials=rows.flatMap(x=>x.hiddenMaterials||[]),materials=[...visibleMaterials,...hiddenMaterials];
 const regionalPath='coverage/'+feeds.get('bn_kh_catalog_and_regional_queues').path+'run-status.json';
 const regional=JSON.parse(read(regionalPath));
 const initialPath='coverage/'+feeds.get('th_id_ph_initial_observations').path+'run-status.json';
 const initial=JSON.parse(read(initialPath));
 const regionContext={};
 for(const id of ['BN','KH','LA','MM'])regionContext[id]={sourcePath:regionalPath,sourceCheckedAt:regional.frozen_at,scope:'frozen_four_region_snapshot_not_current_market_completion',facts:{region:regional.regions[id],fourRegionC1:regional.C1,fourRegionC2:regional.C2,fourRegionC3:regional.C3,fourRegionC4:regional.C4},blocks:[]};
 const vnStatusPath='coverage/'+vnFeed.path+'run-status.json',vnStatus=JSON.parse(read(vnStatusPath));
 regionContext.VN={sourcePath:vnStatusPath,sourceCheckedAt:vnStatus.frozen_at,scope:'VN_finite_source_contexts_not_current_market_or_contract_completion',facts:{C1:vnStatus.C1,C2:vnStatus.C2,C3:vnStatus.C3,C4:vnStatus.C4},blocks:[]};
 const pruStatusPath=pruPath+'issuer-specific-status.json',pruStatus=JSON.parse(read(pruStatusPath));assert.equal(pruStatus.length,1);assert.equal(pruStatus[0].C2.whole_issuer_catalog_closed,false);
 regionContext.SG={sourcePath:pruStatusPath,sourceCheckedAt:null,scope:'Prudential_selected_source_frontier_only_not_SG_market_or_Income_catalog_completion',facts:{catalogOwnerIssuerId:'SG-own-40bf6a1dd276af06',sourceScopedCatalog:pruStatus[0],otherSGFeeds:'Separate unchanged feeds; no market or other-issuer catalog closure inferred.'},blocks:[]};
 for(const id of ['TH','ID','PH'])regionContext[id]={sourcePath:initialPath,sourceCheckedAt:initial.snapshot_at,scope:'initial_roster_snapshot_later_catalog_observations_are_separate',facts:facts(initial.regions[id],['whole_region_current_licensed_denominator_complete','all_products_obtained']),blocks:[]};
 const aiaPHStatusPath=aiaPHPath+'run-status.json',aiaPHStatus=JSON.parse(read(aiaPHStatusPath));assert.equal(aiaPHStatus.total_named_source_observations,56);assert.equal(aiaPHStatus.public_web_tool_operations,30);assert.equal(aiaPHStatus.unique_requested_web_urls,29);
 regionContext.PH.facts.aiaPHSourceCatalog={sourcePath:aiaPHStatusPath,sourceSnapshotAt:aiaPHStatus.snapshot_at,qaRevisionAt:aiaPHStatus.qa_revision_at,scope:'AIA_Philippines_crawled_text_only_not_live_origin_or_whole_market_completion',identity:aiaPHIdentity,status:aiaPHStatus};

 regionContext.ID.facts.aiaGeneraliCatalog=idTwoContext;
 regionContext.PH.facts.majorCompanyCatalogs=phMajorContexts;
 regionContext.TH.facts.thaiLifeCatalogs=thaiLifeContexts;
 regionContext.TH.facts.reviewedCatalog=thIdFourContexts.TH;
 regionContext.ID.facts.reviewedCatalog=thIdFourContexts.ID;
 regionContext.MY={sourcePath:myTwoContext.sourcePath+'status.json',sourceCheckedAt:null,scope:'selected_MY_source_catalogs_not_market_census_or_contractual_issuer_verification',facts:{myTwoCatalog:myTwoContext,greatEastern:greatEasternContexts.MY},blocks:[]};
 regionContext.SG.facts.greatEastern=greatEasternContexts.SG;
 regionContext.SG.facts.reviewedCatalog=sgThreeContext;
 regionContext.HK={sourcePath:hkMyContexts.HK.sourcePath,sourceCheckedAt:null,scope:'selected_public_catalog_and_separate_unmatched_document_contexts_not_market_completion',facts:{reviewedCatalog:hkMyContexts.HK},blocks:[]};
 regionContext.MY.facts.reviewedCatalog=hkMyContexts.MY;

 return {schemaVersion:1,snapshot:'2026-10-27',compiledFrom:latest.compiled_at,limitations:['泰国 Thai Life47／Phillip24、印尼四来源33 共104条具名观察；84个材料槽位含1个隔离目标 null，不替代为来源网页或普通下载队列。另列泰国73条分销／类别／设计语境、印尼9目录／2养老金计划／4养老金引用／5未读图片，不增加保险产品／材料覆盖；来源公司不等于合同承保人。固定8快照／15公司审查不是市场或全部渠道完成。','新加坡 UOI32／HLAS48／China Life36 共 116 条类型观察，另列 16 条 UOI 文件目录；124 条材料引用不是 PDF 下载。6 个 HLAS 网页承保声明不升级实际合同核验；COVIDSafe 无对应具名声明，3 个服务不计保险产品；RMB 详情两次 502 保持未读。','香港四家来源新增 81 条类型观察（含保障／目录类别），85 条文件目录语境另列；马来西亚 Hong Leong 两主体新增 94 条，214 条披露目录及 61 条 PIDM 通用引用另列，不计产品或主条款。来源机构不等于已核合同承保人；文件未读、当前在售和完整市场范围仍未核。','印尼新增 77 个来源命名聚类、82 条详情路线；135 条材料引用／134 个 URL／144 个页面关联均未读 PDF，不是文件下载或核验 SKU。AIA 共享页两家公司不推定合同承保人；单个 diterbitkan oleh 仅是网页签发公司声明。Generali 后续语言队列 1 次工具 403、41 条未请求，AIA 不受影响；旧 6 次 301 不等于目标 404。','菲律宾新增 141 条来源观察（MCBL24／BPI AIA45／Pru Life PH72），含计划变体、附加险和内置保障语境，不是 141 个独立产品。来源公司不是经合同核验承保人；47 条未读文件候选不增加原件或主条款。共享页面不证明附加险适用于全部计划；目录壳、可见 404、重定向及结构化名称缺口均保留。','Great Eastern 新增 SG126／MY146 条类型观察：6 个官网 underwritten-by 声明与 58 个官网 policy-issuer 声明不混同为实际合同核验，79 个 MY 子观察不继承主体或材料。544 个未读关联不增加原件；141 rider／10 package 引用无父主条款信用。91 个 as-of 标签及 5 个范围日期不是发布／法律生效日期；既有资料重合不合并产品或复用 PDF 审核。','马来西亚两来源新增 129 条明确类型观察，含 80 条 rider 和 5 条 variant，不是 129 个独立产品；20 条来源语境、64 个 selector membership 和 95 条来源级未读文件引用均不额外计产品。合同承保人全部未核，文件不继承到产品；CMS、未读目标、语言与当前在售缺口保留。','AIA Cambodia 一条已有材料新增独立有限审读：含基本主保单、健康附加险及服务条款。91 页视觉查看与 41 页英文 OCR/语义审读不是高棉文法律全文审校；冻结来源角色/C4/时间和全部计数不变，同 URL/SHA 仅去重，不合并产品。','泰国两家寿险公司新增 115 条命名观察（Muang Thai Life 56／Bangkok Life 59），不是核验 SKU；44 条组件／变体、通用类别、比较页及受众路线不另计产品。118 条文件候选和另列 227 条未审图片引用均未下载、渲染或 OCR，不计全文／正式原件；目录、渠道和合同分母未闭合。', 'AIA Philippines 56 条观察仅为公司来源语境，法律承保人全部未核；30 次 web 操作／29 个请求 URL／29 个文本捕获加 1 次缓存缺失不是实时 HTTP 数。11 个宣传册标签未暴露目标 URL，保持 null 但不是 HOLD；9 处目录壳缺口保留。', 'Prudential SG 新增 128 条来源观察仅导入一次；49 张目录卡及 69 条文件索引不再计行。Care Secure 承保人为 Income、分销人为 Prudential，目录采集归属 Prudential，不代表 Income 自有目录完成。46 处 information-as-of 仅为来源免责声明日期，不是发布／合同生效日期。', '这是公开来源观察，不是已核验独立 SKU、当前在售清单或全市场完成证明。','目录类别、附加险、保障组件、版本、登记组及文件目录记录分别标注；不能把它们相加当作产品数。','法定承保人待核的共享品牌不分配到候选公司，不复制为多家公司产品。','材料是来源引用；被隐去的链接保持 null。链接、文件抓取、正式入库及全文核验是不同状态。','原目录 2,360 条、正式原件 4,713 份及严格核验 426 份均保持不变；本视图新增正式原件和核验 SKU 均为 0。','VHIS 最新登记不等于当前可投保；历史组、登记变体与补充资料保留原有范围。','区域累计 872 条替代旧 706 条（净增 166）；21 条仅来源材料语境不增加产品行。16 条 GGI 隐藏源码材料引用单独保留，不计可见／当前提供；候选 URL 与隐私 HOLD 分别处理。','Etiqa SG 127 条目录与 58 条材料目录只导入一次；另 29 条隐藏材料引用、1 个隐藏组件、5 条隐藏目录行不证明当前展示或在售。MY 89 条中 85 条法定承保人待核，8 条汽车相关引用不计父产品主条款。','越南 933 条观察中 368 条仅资料语境，不是独立产品；来源身份、品牌别名与当前牌照／合同承保人核验不同，不作模糊合并。Cathay 目录差异未闭合；重复嵌入 PDF 不增加原件。'],baselines:{directoryEntries:2360,formalOriginals:4713,strictVerified:426,newFormalOriginals:0,newVerifiedSkus:0},regionContext,aggregationRule:latest.aggregation_rule,publicProjectionRule:latest.public_projection_rule,feeds:feedSummaries,replacements,regions:[['HK','香港'],['SG','新加坡'],['MY','马来西亚'],['TH','泰国'],['ID','印度尼西亚'],['PH','菲律宾'],['VN','越南'],['BN','文莱'],['KH','柬埔寨'],['LA','老挝'],['MM','缅甸'],['TL','东帝汶']].map(([id,name])=>({id,name})),summary:{observationRows:rows.length,materialReferences:materials.length,displayedMaterialReferences:visibleMaterials.length,hiddenMarkupMaterialReferences:hiddenMaterials.length,exposedMaterialOccurrences:materials.filter(m=>m.url).length,withheldMaterialOccurrences:materials.filter(m=>m.urlStatus==='withheld_in_public_source').length,unresolvedMaterialOccurrences:materials.filter(m=>m.urlStatus==='unresolved_source_target').length,subordinateRegistryVariants:variantCount},sourceInputs:[...consumed.values()].sort((a,b)=>a.path.localeCompare(b.path)),observations:rows};
}
export function serializeCoverage(payload){
 const {observations,...index}=payload;
 index.regionFiles=Object.fromEntries(payload.regions.map(r=>[r.id,`coverage-observations-${r.id}.json`]));
 index.regionCounts=Object.fromEntries(payload.regions.map(r=>[r.id,observations.filter(x=>x.region===r.id).length]));
 return new Map([['coverage-observations.json',JSON.stringify(index)+'\n'],...payload.regions.map(r=>[index.regionFiles[r.id],JSON.stringify({schemaVersion:1,snapshot:payload.snapshot,region:r.id,observations:observations.filter(x=>x.region===r.id)})+'\n'])]);
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===path.resolve(process.argv[1])){
 const payload=buildCoverage();
 for(const [name,out] of serializeCoverage(payload)){
  const target=path.join(website,'public',name);
  if(process.argv.includes('--check'))assert.equal(fs.readFileSync(target,'utf8'),out,'Coverage projection is stale: '+name+'; run npm run coverage:import');else fs.writeFileSync(target,out);
 }
 console.log(JSON.stringify({coverage:process.argv.includes('--check')?'verified':'generated',...payload.summary}));
}
