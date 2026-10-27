// New portable handover helper. Not the private historical acquisition pipeline.
import assert from 'node:assert/strict';
import {isIP} from 'node:net';

export const roles=['brochure','main','pending','rider','support'];
const shape={
  root: ['schemaVersion','snapshot','scopeNote','counts','regions','products'],
  counts: ['sourceRecords','uniqueMaterials','savedMaterials','directoryEntries','independentProducts','currentOnSaleProducts','sharedMaterials','identityKinds'],
  region: ['id','name','entryCount','materialCount','savedMaterialCount','countLabel','emptyNote'],
  product: ['id','region','name','insurer','category','identityKind','identityStatus','identityNote','scope','materials','materialCount','savedMaterialCount','materialCounts'],
  material: ['id','title','role','roleLabel','language','version','variant','status','statusLabel','reviewStatus','allPagesReviewed','fullContentReviewComplete','url','sourceUrl','note','referenceOnly','fileFormat','publicationDate','effectiveDate','shared','mainCandidate']
};
const statuses=new Set(['downloaded','failed','verified_link','verified_link_raw_download_403','skipped_non_document','discovered','skipped','unavailable']);
const reviews=new Set(['pending','verified','needs_review','partial']);
function objectKeys(x,kind,optional=[]){
  assert(x && typeof x==='object'&&!Array.isArray(x),kind+' must be an object');
  for(const k of Object.keys(x))assert(shape[kind].includes(k),`Unknown ${kind} key: ${k}`);
  for(const k of shape[kind])if(!optional.includes(k))assert(k in x,`Missing ${kind}.${k}`);
}
function string(x,label){assert.equal(typeof x,'string',label+' must be a string');assert(x.length<=10000,label+' too long');assert(!/\/workspace\/|\/home\/agent\/|sediment:\/\/|library_file_id|Bearer\s/i.test(x),label+' contains private metadata');}
function integer(x,label){assert(Number.isSafeInteger(x)&&x>=0,label+' must be a nonnegative integer');}
function url(value,label){
  string(value,label);if(!value)return;
  const u=new URL(value);assert(['https:','http:'].includes(u.protocol),label+' must use HTTP(S)');
  assert(!u.username&&!u.password,label+' contains credentials');
  assert(!isIP(u.hostname.replace(/^\[|\]$/g,''))&&!/^(localhost)$|\.(local|internal)$|oaiusercontent|blob\.core\.windows\.net|amazonaws\.com|(^|\.)chatgpt\.com$/i.test(u.hostname),label+' must be a public official-source hostname');
  for(const key of u.searchParams.keys())assert(!/token|secret|signature|credential|authorization|access.?key|^sig$/i.test(key),label+' contains a sensitive query parameter');
}
export function validateCatalog(d,{derived=true}={}){
  objectKeys(d,'root');assert.equal(d.schemaVersion,1);string(d.snapshot,'snapshot');assert(d.snapshot);string(d.scopeNote,'scopeNote');objectKeys(d.counts,'counts');
  integer(d.counts.sourceRecords,'sourceRecords');assert.equal(d.counts.independentProducts,null);assert.equal(d.counts.currentOnSaleProducts,null);
  assert(Array.isArray(d.regions)&&Array.isArray(d.products));const regionIds=new Set();const productIds=new Set();const materialBodies=new Map();
  for(const r of d.regions){objectKeys(r,'region');for(const k of ['id','name','countLabel','emptyNote'])string(r[k],'region.'+k);assert(r.id&&!regionIds.has(r.id),'Duplicate/empty region');regionIds.add(r.id);}
  for(const p of d.products){objectKeys(p,'product');for(const k of shape.product.filter(k=>!['materials','materialCount','savedMaterialCount','materialCounts'].includes(k)))string(p[k],'product.'+k);
    assert(p.id&&p.name&&!productIds.has(p.id),'Duplicate/empty product ID or name');productIds.add(p.id);assert(regionIds.has(p.region),'Unknown region');assert(['confirmed','provisional','candidate','unresolved'].includes(p.identityStatus));assert(Array.isArray(p.materials));const localIds=new Set();
    for(const m of p.materials){objectKeys(m,'material',['mainCandidate']);for(const k of shape.material.filter(k=>!['allPagesReviewed','fullContentReviewComplete','referenceOnly','shared','mainCandidate'].includes(k)))string(m[k],'material.'+k);
      for(const k of ['allPagesReviewed','fullContentReviewComplete','referenceOnly','shared'])assert.equal(typeof m[k],'boolean','material.'+k);
      if('mainCandidate'in m)assert.equal(typeof m.mainCandidate,'boolean');assert(m.id&&!localIds.has(m.id),'Duplicate/empty material within product');localIds.add(m.id);
      assert(roles.includes(m.role),'Unknown material role');assert(statuses.has(m.status),'Unknown acquisition status');assert(reviews.has(m.reviewStatus),'Unknown review status');url(m.url,'material.url');url(m.sourceUrl,'material.sourceUrl');
      assert(!m.fullContentReviewComplete||m.allPagesReviewed,'Full content requires all pages reviewed');
      if(m.reviewStatus==='verified')assert(m.status==='downloaded'&&m.allPagesReviewed&&m.fullContentReviewComplete,'Verified requires a saved original and both full-review flags');
      if(m.mainCandidate)assert(m.role==='pending'&&m.status==='downloaded','Main candidate cannot be promoted to confirmed main');
      const body=Object.fromEntries(Object.entries(m).filter(([k])=>!['note','shared'].includes(k)));
      if(materialBodies.has(m.id))assert.deepEqual(body,materialBodies.get(m.id),'Shared material facts disagree: '+m.id);else materialBodies.set(m.id,body);
    }
  }
  assert(d.counts.sourceRecords>=materialBodies.size,'Source-record total cannot be below unique mapped materials');
  if(derived){const expected=recount(d);assert.deepEqual(d.counts,expected.counts,'Stale global counts');assert.deepEqual(d.regions,expected.regions,'Stale regional counts');for(let i=0;i<d.products.length;i++){const p=d.products[i],e=expected.products[i];for(const k of ['materialCount','savedMaterialCount','materialCounts'])assert.deepEqual(p[k],e[k],'Stale product '+k);for(let j=0;j<p.materials.length;j++)assert.equal(p.materials[j].shared,e.materials[j].shared,'Stale shared flag');}}
  return {products:d.products.length,uniqueMaterials:materialBodies.size,materialReferences:d.products.reduce((n,p)=>n+p.materials.length,0)};
}
export function recount(input){
  const d=structuredClone(input),members=new Map(),unique=new Map();
  for(const p of d.products)for(const m of p.materials){if(!members.has(m.id))members.set(m.id,new Set());members.get(m.id).add(p.id);unique.set(m.id,m);}
  for(const p of d.products){p.materialCount=p.materials.length;p.savedMaterialCount=p.materials.filter(m=>m.status==='downloaded').length;p.materialCounts=Object.fromEntries(roles.map(role=>[role,p.materials.filter(m=>m.role===role).length]));for(const m of p.materials)m.shared=members.get(m.id).size>1;}
  for(const r of d.regions){const ps=d.products.filter(p=>p.region===r.id),ms=new Map(ps.flatMap(p=>p.materials).map(m=>[m.id,m]));r.entryCount=ps.length;r.materialCount=ms.size;r.savedMaterialCount=[...ms.values()].filter(m=>m.status==='downloaded').length;}
  const kinds={};for(const p of d.products)kinds[p.identityKind]=(kinds[p.identityKind]||0)+1;
  d.counts={sourceRecords:d.counts.sourceRecords,uniqueMaterials:unique.size,savedMaterials:[...unique.values()].filter(m=>m.status==='downloaded').length,directoryEntries:d.products.length,independentProducts:null,currentOnSaleProducts:null,sharedMaterials:[...members.values()].filter(v=>v.size>1).length,identityKinds:Object.fromEntries(Object.entries(kinds).sort(([a],[b])=>a.localeCompare(b)))};
  return d;
}
