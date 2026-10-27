// Explicit, offline adapter for the approved 2026-10-27 public metadata snapshot.
// No network, glob-discovered input, name-based joins, private registry, or raw files.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {safeURL} from '../public/coverage-core.mjs';
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
 let regionalRetained=0;
 add('bn_kh_catalog_and_regional_queues',['products.jsonl'],(r,c)=>{
  assert(typeof r.inventory_id==='string','Regional stable source identity missing');
  const converted=r.materials.map((m,i)=>{const output=material(m,i,m.document_role,{sourceUrl:m.source_page_url||r.url});Object.assign(output.facts,facts(m,['association_scope','document_role_basis','source_visibility_status','source_visibility_evidence','visible_product_material_credit','current_visible_offer_status','visibility_privacy_interpretation','target_origin_approval','target_access_status','role_conflict','applicable_product_match','current_bytes_status','reuse_review_status','withholding_reason','public_direct_locator_status','contract_content_verified','additional_source_page_urls','source_page_urls']));return output;});
  const visible=converted.filter((m,i)=>r.materials[i].source_visibility_status!=='hidden_source_markup_inline_display_none');
  const hidden=converted.filter((m,i)=>r.materials[i].source_visibility_status==='hidden_source_markup_inline_display_none');
  const row=observation(r,c,{region:r.region,issuer:r.legal_entity,legalIssuer:r.legal_entity,issuerId:r.issuer_id,name:r.official_name,sourceUrl:r.url,catalogUrl:r.source_urls?.[0],materials:visible});
  if(hidden.length)row.hiddenMaterials=hidden;
  const previous=regionalPrevious.get(r.inventory_id);
  if(previous){assert.equal(previous.name,r.official_name);assert.equal(previous.region,r.region);row.id=previous.id;regionalRetained++;}
  else row.id=`obs-${sha(c.feed+':'+r.inventory_id).slice(0,20)}`;
  return row;
 });
 assert.equal(regionalRetained,428,'The cumulative replacement must retain all 428 predecessor identities');
 const regionalRows=rows.filter(r=>r.provenance.feed==='bn_kh_catalog_and_regional_queues');
 assert.equal(regionalRows.length,706);assert.equal(regionalRows.reduce((n,r)=>n+(r.hiddenMaterials?.length||0),0),16);

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
 // No approved PH offering catalogue is present. Each explicit source association
 // becomes one material-only observation, not an invented independently verified product.
 add('ph_master_policy_samples',['materials.jsonl'],(r,c)=>{
  const row=observation(r,c,{region:r.region,issuer:r.issuer,legalIssuer:r.issuer,issuerId:r.issuer_id,name:`${r.official_product_name} — ${r.official_document_title}`,kind:'document_page',sourceUrl:r.product_url,catalogUrl:r.product_url,materials:[material(r,0,r.document_type,{sourceUrl:r.product_url,title:r.official_document_title})]});
  row.facts.association_scope='explicit_source_product_page_and_material_only_not_product_census';return row;
 });
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
 for(const id of ['VN','BN','KH','LA','MM'])regionContext[id]={sourcePath:regionalPath,sourceCheckedAt:regional.checked_at,scope:'regional_queue_snapshot_not_market_completion',facts:facts(regional.regions[id],['census_status','product_status','issuer_catalog_status_counts']),blocks:regional.blocks.filter(b=>b.region===id).map(b=>({result:b.result,reason:b.reason}))};
 for(const id of ['TH','ID','PH'])regionContext[id]={sourcePath:initialPath,sourceCheckedAt:initial.snapshot_at,scope:'initial_roster_snapshot_later_catalog_observations_are_separate',facts:facts(initial.regions[id],['whole_region_current_licensed_denominator_complete','all_products_obtained']),blocks:[]};

 return {schemaVersion:1,snapshot:'2026-10-27',compiledFrom:latest.compiled_at,limitations:['这是公开来源观察，不是已核验独立 SKU、当前在售清单或全市场完成证明。','目录类别、附加险、保障组件、版本、登记组及文件目录记录分别标注；不能把它们相加当作产品数。','法定承保人待核的共享品牌不分配到候选公司，不复制为多家公司产品。','材料是来源引用；被隐去的链接保持 null。链接、文件抓取、正式入库及全文核验是不同状态。','原目录 2,360 条、正式原件 4,713 份及严格核验 426 份均保持不变；本视图新增正式原件和核验 SKU 均为 0。','VHIS 最新登记不等于当前可投保；历史组、登记变体与补充资料保留原有范围。','区域累计 706 条替代旧 428 条；16 条 GGI 隐藏源码材料引用单独保留，不计可见／当前提供；候选 URL 与隐私 HOLD 分别处理。'],baselines:{directoryEntries:2360,formalOriginals:4713,strictVerified:426,newFormalOriginals:0,newVerifiedSkus:0},regionContext,aggregationRule:latest.aggregation_rule,publicProjectionRule:latest.public_projection_rule,feeds:feedSummaries,replacements,regions:[['HK','香港'],['SG','新加坡'],['MY','马来西亚'],['TH','泰国'],['ID','印度尼西亚'],['PH','菲律宾'],['VN','越南'],['BN','文莱'],['KH','柬埔寨'],['LA','老挝'],['MM','缅甸'],['TL','东帝汶']].map(([id,name])=>({id,name})),summary:{observationRows:rows.length,materialReferences:materials.length,displayedMaterialReferences:visibleMaterials.length,hiddenMarkupMaterialReferences:hiddenMaterials.length,exposedMaterialOccurrences:materials.filter(m=>m.url).length,withheldMaterialOccurrences:materials.filter(m=>m.urlStatus==='withheld_in_public_source').length,subordinateRegistryVariants:variantCount},sourceInputs:[...consumed.values()].sort((a,b)=>a.path.localeCompare(b.path)),observations:rows};
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
