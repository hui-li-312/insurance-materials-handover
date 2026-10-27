import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {createServer} from '../scripts/serve.mjs';
// Ephemeral loopback integration test, not a browser preview or deployed-host check.
const root=fileURLToPath(new URL('../public/',import.meta.url)),server=createServer(root);
await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
const base=`http://127.0.0.1:${server.address().port}`;
try{
  for(const name of fs.readdirSync(root)){const response=await fetch(`${base}/${name}`);assert.equal(response.status,200,name);assert.deepEqual(Buffer.from(await response.arrayBuffer()),fs.readFileSync(new URL('../public/'+name,import.meta.url)),name);if(/\.m?js$/.test(name))assert.match(response.headers.get('content-type'),/javascript/);}
  assert.equal((await fetch(base+'/')).status,200);assert.equal((await fetch(base+'/missing.json')).status,404);
  assert.equal((await fetch(base+'/.env')).status,404);assert.equal((await fetch(base+'/package.json')).status,404);
  assert.equal((await fetch(base+'/%2e%2e%2fpackage.json')).status,404);assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
  const head=await fetch(base+'/product-library.json',{method:'HEAD'});assert.equal(head.status,200);assert.equal((await head.arrayBuffer()).byteLength,0);
  console.log('PASS HTTP smoke: all runtime assets byte-equal, root, MIME, HEAD, missing/private/traversal paths, unsupported method.');
}finally{await new Promise(resolve=>server.close(resolve));}
