// Fixed, approved Malaysia two-publisher metadata. No network, product-name joins,
// inherited materials, selector-card products or contractual-issuer assignments.
import assert from 'node:assert/strict';
import {safeURL} from '../public/coverage-core.mjs';
export const MY_TWO_FEED='my_two_publisher_catalog';
export const MY_TWO_PREFIX='coverage/2026-10-27/batch-10/my-two-catalog/';
export const MY_TWO_MANIFEST_SHA='548975cfaf4a1a14fed80543b28c38334329b5f7c865b02a842b3af8a69d79c3';
export const MY_TWO_FILES=['README.md','context-my-two-catalog.jsonl','context-only-named-mentions.json','frontier-summary.json','manifest.json','products-my-two-catalog.jsonl','public-metadata-allowlist.json','publisher-origin-evidence.json','source-level-unread-material-references.jsonl','sources.json','status.json'];
const OWNERS=new Map([
 ['MY-own-447346ca30a0a5f2',{name:'Prudential Assurance Malaysia Berhad',origin:'https://www.prudential.com.my',rows:80}],
 ['MY-own-cce842ed63b41679',{name:'Prudential BSN Takaful Berhad',origin:'https://www.prubsn.com.my',rows:49}]
]);
const ROLES={group_product:13,product:27,package:2,unknown:2,rider:80,variant:5};
const FACT_KEYS=['source_publisher','possible_source_issuer_ids','source_company_id','source_company_legal_name','contractual_entity','issuer_mapping_status','role_review_note','source_ids','source_urls','source_page_sha256','retrieval_method','language','language_aliases','source_date','publication_date','effective_date','checked_at','current_new_business_status','base_standalone_contract_status','verified_SKU_credit','formal_material_file_credit','verified_main_policy_wording_credit','catalog_membership_observations','parent_product_names','named_component_names','relationships','detail_status','source_literal_name','parent_observation_ids','public_page_underwriter_claims'];
const jsonLines=text=>text.trim().split('\n').filter(Boolean).map(JSON.parse);
const normalizedName=s=>s.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu,'');

export function addMyTwoCatalog({feeds,rows,feedSummaries,add,read,lines,observation,facts,sha}){
 const feed=feeds.get(MY_TWO_FEED);assert(feed,'Missing approved MY two-publisher feed');assert.equal('coverage/'+feed.path,MY_TWO_PREFIX);
 const inputs=new Map(MY_TWO_FILES.map(file=>[file,read(MY_TWO_PREFIX+file)]));
 assert.equal(sha(inputs.get('manifest.json')),MY_TWO_MANIFEST_SHA,'Only corrected T1934Z MY export is approved');
 const manifest=JSON.parse(inputs.get('manifest.json'));assert.deepEqual([...manifest.public_file_allowlist].sort(),[...MY_TWO_FILES].sort());
 for(const [file,entry]of Object.entries(manifest.files)){assert(inputs.has(file),'Unapproved MY manifest input');const text=inputs.get(file);assert.equal(Buffer.byteLength(text),entry.bytes);assert.equal(sha(text),entry.sha256,'MY frozen input hash changed: '+file);}
 assert.equal(Object.keys(manifest.files).length,10);
 const raw=jsonLines(inputs.get('products-my-two-catalog.jsonl')),contexts=jsonLines(inputs.get('context-my-two-catalog.jsonl')),refs=jsonLines(inputs.get('source-level-unread-material-references.jsonl'));
 const sources=JSON.parse(inputs.get('sources.json')),status=JSON.parse(inputs.get('status.json')),frontier=JSON.parse(inputs.get('frontier-summary.json')),publishers=JSON.parse(inputs.get('publisher-origin-evidence.json')),mentions=JSON.parse(inputs.get('context-only-named-mentions.json'));
 assert.equal(raw.length,129);assert.equal(contexts.length,20);assert.equal(refs.length,95);assert.equal(sources.length,149);assert.equal(publishers.length,2);
 const sourceById=new Map(sources.map(s=>[s.source_id,s]));assert.equal(sourceById.size,149,'Duplicate MY source ID');
 const allRaw=[...raw,...contexts],byRawId=new Map(allRaw.map(r=>[r.observation_id,r]));assert.equal(byRawId.size,149,'Duplicate MY observation/context ID');
 const priorMY=rows.filter(r=>r.region==='MY'),priorIds=new Set(rows.map(r=>r.sourceId));
 assert.equal(priorMY.length,1334,'MY adapter must follow the audited 1,334-row predecessor before any later additions');
 const ownerOrigins=new Set([...OWNERS.values()].map(x=>x.origin)),priorURLs=new Set(priorMY.flatMap(r=>[r.sourceUrl,r.catalogUrl,...(r.facts.source_urls||[])]).filter(Boolean));
 assert.equal(priorMY.filter(r=>OWNERS.has(r.facts.source_company_id)||[...OWNERS.values()].some(x=>r.issuer.includes(x.name))||[r.sourceUrl,r.catalogUrl].filter(Boolean).some(url=>ownerOrigins.has(new URL(url).origin))).length,0,'Existing MY publisher/origin requires explicit predecessor handling');
 const oldNames=new Set(priorMY.map(r=>normalizedName(r.name)));
 // Overlap checks never authorize a name-based merge or silently drop a row.
 for(const r of raw){assert(!priorIds.has(r.observation_id),'MY source ID overlaps existing rows');assert(!oldNames.has(normalizedName(r.official_name)),'MY normalized-name overlap needs explicit review');if(r.product_url)assert(!priorURLs.has(r.product_url),'MY exact URL overlap needs explicit review');}
 const memberships=new Map();
 for(const r of allRaw){
  const owner=OWNERS.get(r.source_company_id);assert(owner,'Unknown MY source-company ID');assert.equal(r.source_publisher,owner.name);assert.equal(r.source_company_legal_name,owner.name);assert.deepEqual(r.possible_source_issuer_ids,[r.source_company_id]);
  assert.equal(r.jurisdiction,'MY');for(const key of ['issuer','issuer_id','contractual_entity'])assert.equal(r[key],null,'Source publisher cannot become contractual issuer');assert.equal(r.issuer_mapping_status,'publisher_origin_verified_contractual_entity_not_independently_established');
  assert.deepEqual(r.material_links,[],'Source-level material references cannot become product attachments');for(const key of ['verified_SKU_credit','formal_material_file_credit','verified_main_policy_wording_credit'])assert.equal(r[key],0);
  for(const key of ['source_date','publication_date','effective_date'])assert.equal(r[key],null,'Unknown source dates remain null');
  assert(r.source_ids.length>0);assert.equal(new Set(r.source_ids).size,r.source_ids.length);
  for(const id of r.source_ids){const s=sourceById.get(id);assert(s,'Unknown explicit MY source ID');assert(r.source_urls.includes(s.source_url),'MY source URL/ID conflict');assert.equal(new URL(s.source_url).origin,owner.origin,'MY source publisher origin conflict');}
  if(r.product_url!==null){assert(safeURL(r.product_url));assert.equal(new URL(r.product_url).origin,owner.origin);}
  if(r.source_page_sha256!==null)assert(r.source_ids.some(id=>sourceById.get(id).raw_HTML_sha256===r.source_page_sha256),'MY HTML hash does not match explicit source');
  for(const membership of r.catalog_membership_observations||[]){const s=sourceById.get(membership.source_id);assert(s);assert.equal(s.retrieval_method,'ordinary_cloud_browser_UI_visible_JSON_text_not_raw_HTTP');assert.equal(membership.checked_at,s.checked_at);assert.equal(membership.source_catalog_url,s.source_catalog_url);const old=memberships.get(membership.membership_id);if(old)assert.deepEqual(membership,old,'Conflicting shared membership ID');else memberships.set(membership.membership_id,membership);}
  for(const id of r.parent_observation_ids||[]){const parent=byRawId.get(id);assert(parent,'MY explicit parent is missing');assert.notEqual(parent.role,'context','Context does not become a parent product');assert.equal(parent.source_company_id,r.source_company_id);assert(r.parent_product_names.includes(parent.official_name),'MY exact parent name/ID conflict');}
  if(r.parent_observation_ids)assert.equal(r.parent_product_names.length,r.parent_observation_ids.length);
  for(const relation of r.relationships||[]){const target=byRawId.get(relation.target_observation_id);assert(target,'MY exact relationship target missing');assert.equal(target.source_company_id,r.source_company_id);}
 }
 for(const r of contexts)assert.equal(r.role,'context');
 assert.deepEqual(Object.fromEntries(Object.keys(ROLES).map(role=>[role,raw.filter(r=>r.role===role).length])),ROLES);
 assert.equal(memberships.size,64);assert.equal(new Set([...memberships.values()].map(m=>new URL(m.resolved_link_url).origin+'|'+m.link_raw)).size,63);
 for(const [id,owner]of OWNERS)assert.equal(raw.filter(r=>r.source_company_id===id).length,owner.rows);
 const selectors=sources.filter(s=>s.retrieval_method==='ordinary_cloud_browser_UI_visible_JSON_text_not_raw_HTTP');assert.equal(selectors.length,10);assert.equal(selectors.reduce((n,s)=>n+s.catalog_card_memberships,0),64);
 for(const s of sources){if(s.retrieval_method!=='retained_anonymous_HTTP_GET_HTML'){assert.equal(s.http_status,null);assert.equal(s.raw_HTML_sha256,null);}if(s.retrieval_method==='ordinary_cloud_browser_UI_visible_JSON_text_not_raw_HTTP'){assert.equal(s.hash_scope,'UTF8_rendered_body_innerText_not_raw_HTTP_bytes');assert(s.visible_text_sha256);const html=sourceById.get(s.source_HTML_id);assert(html);assert.equal(html.raw_HTML_sha256,s.source_HTML_sha256);}}
 for(const p of publishers){assert(OWNERS.has(p.issuer_id));assert.deepEqual(p.legal_names,[OWNERS.get(p.issuer_id).name]);assert(sources.some(s=>s.source_url===p.evidence_url&&s.raw_HTML_sha256===p.source_sha256&&s.checked_at===p.source_observed_at));}
 for(const ref of refs){const s=sourceById.get(ref.source_id);assert(s);assert([s.source_url,s.observed_effective_url,s.tool_presented_url].includes(ref.source_url),'Source reference must match explicit observed source URL');if(ref.target_url!==null)assert(safeURL(ref.target_url));assert.equal(ref.target_body_requested,false);assert.equal(ref.body_status,'unread');for(const key of ['formal_material_file_credit','verified_main_policy_wording_credit','product_specific_material_credit'])assert.equal(ref[key],0);}
 add(MY_TWO_FEED,['products-my-two-catalog.jsonl'],(r,c)=>{
  const row=observation(r,c,{region:'MY',issuer:r.source_publisher+'（法定承保人待核）',legalIssuer:null,issuerId:null,name:r.official_name,kind:r.role,sourceUrl:r.product_url,catalogUrl:r.source_catalog_url,materials:[]});
  row.id='obs-'+sha(MY_TWO_FEED+':'+r.observation_id).slice(0,20);Object.assign(row.facts,facts(r,FACT_KEYS));
  row.facts.source_captures=r.source_ids.map(id=>structuredClone(sourceById.get(id)));
  return row;
 });
 const added=rows.filter(r=>r.provenance.feed===MY_TWO_FEED),byId=new Map(added.map(r=>[r.sourceId,r]));assert.equal(added.length,129);assert.equal(byId.size,129);
 const link=r=>({id:r.id,sourceId:r.sourceId,name:r.name,kind:r.kind,region:r.region,issuer:r.issuer});
 for(const row of added){if(row.facts.parent_observation_ids)row.parentObservations=row.facts.parent_observation_ids.map(id=>{const parent=byId.get(id);assert(parent);return link(parent);});if(row.facts.relationships)row.sourceRelationships=row.facts.relationships.map(relation=>{const target=byRawId.get(relation.target_observation_id),product=byId.get(relation.target_observation_id);return {...relation,targetName:target.official_name,targetRole:target.role,targetSourceUrl:target.product_url,productObservation:product?link(product):null,sourceContextOnly:target.role==='context'};});}
 const summary=feedSummaries.find(f=>f.id===MY_TWO_FEED);summary.files=MY_TWO_FILES.map(file=>MY_TWO_PREFIX+file);summary.nonadditiveSourceContexts=20;summary.nonadditiveUnreadSourceReferences=95;summary.nonadditiveUniqueSelectorMemberships=64;summary.contractualIssuerConfirmedRows=0;
 assert.equal(status.counts.observation_rows,129);assert.equal(status.counts.context_rows,20);assert.equal(frontier.master_policy_empty_component_not_empty_directory_or_insurer,true);
 return {sourcePath:MY_TWO_PREFIX,scope:'two_source_publishers_not_contractual_issuer_or_whole_market_completion',status,frontier,publishers,contexts:contexts.map((r,i)=>({...r,provenance:{feed:MY_TWO_FEED,path:MY_TWO_PREFIX+'context-my-two-catalog.jsonl',line:i+1},independentProductCountCredit:0})),contextOnlyNamedMentions:mentions,sourceLevelUnreadMaterialReferences:refs,sources,counts:{typedObservationRows:129,sourceContexts:20,unreadSourceLevelReferences:95,uniqueSelectorMemberships:64,distinctSelectorOriginRawLinkPairs:63,contractualIssuerConfirmedRows:0,formalOriginalCredit:0,verifiedSkuCredit:0}};
}
