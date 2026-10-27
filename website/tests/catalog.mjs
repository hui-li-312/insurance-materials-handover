import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {validateCatalog,recount} from '../scripts/catalog-model.mjs';
const data=JSON.parse(fs.readFileSync(new URL('../public/product-library.json',import.meta.url)));
const counts=validateCatalog(data);assert.deepEqual(recount(data),data);
const bad=fn=>{const x=structuredClone(data);fn(x);assert.throws(()=>validateCatalog(x));};
bad(x=>x.products.push(x.products[0]));bad(x=>x.products[0].materials.push(x.products[0].materials[0]));
bad(x=>x.products[0].materials[0].url='javascript:alert(1)');
bad(x=>x.products[0].materials[0].url='https://example.com/?token=secret');
bad(x=>x.products[0].materials[0].url='https://127.0.0.1/private');
bad(x=>x.products[0].materials[0].allPagesReviewed='true');
bad(x=>{x.products[0].materials[0].reviewStatus='verified';x.products[0].materials[0].status='failed';});
bad(x=>x.products[0].materials[0].internalNotes='Not publishable');
bad(x=>x.products[0].materials[0].sourceUrl='sediment://file_test');
bad(x=>x.counts.savedMaterials++);bad(x=>x.counts.independentProducts=2360);
const stale=structuredClone(data);stale.products[0].materialCount=999;assert.equal(recount(stale).products[0].materialCount,data.products[0].materialCount);
// Test export/import end-to-end in a small isolated fixture, not against the deliverable.
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'insurance-catalog-'));
try{
  fs.mkdirSync(path.join(temp,'scripts'));fs.mkdirSync(path.join(temp,'public'));
  for(const name of ['catalog.mjs','catalog-model.mjs'])fs.copyFileSync(new URL('../scripts/'+name,import.meta.url),path.join(temp,'scripts',name));
  fs.copyFileSync(new URL('../public/product-library.json',import.meta.url),path.join(temp,'public','product-library.json'));
  const cli=path.join(temp,'scripts','catalog.mjs'),exported=path.join(temp,'editable.json');
  let run=spawnSync(process.execPath,[cli,'export',exported],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  const update=JSON.parse(fs.readFileSync(exported));update.products[0].identityNote+=' 测试说明';fs.writeFileSync(exported,JSON.stringify(update));
  run=spawnSync(process.execPath,[cli,'import',exported,'--snapshot','test-only','--source-records',String(data.counts.sourceRecords)],{encoding:'utf8'});assert.equal(run.status,0,run.stderr);
  const written=JSON.parse(fs.readFileSync(path.join(temp,'public','product-library.json')));assert.equal(written.snapshot,'test-only');assert.equal(written.products[0].identityNote,update.products[0].identityNote);validateCatalog(written);
  const before=fs.readFileSync(path.join(temp,'public','product-library.json'));update.products[0].materials[0].url='https://example.com/?sig=secret';fs.writeFileSync(exported,JSON.stringify(update));
  run=spawnSync(process.execPath,[cli,'import',exported,'--snapshot','bad','--source-records',String(data.counts.sourceRecords)],{encoding:'utf8'});assert.notEqual(run.status,0);assert.deepEqual(fs.readFileSync(path.join(temp,'public','product-library.json')),before);
}finally{fs.rmSync(temp,{recursive:true,force:true});}
console.log(JSON.stringify({catalogTests:'passed',...counts,guards:11,cliRoundtrip:true,failedImportIsNonMutating:true}));
