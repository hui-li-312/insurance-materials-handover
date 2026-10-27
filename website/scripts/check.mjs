import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import assert from 'node:assert/strict';
import {validateCatalog} from './catalog-model.mjs';
const root=fileURLToPath(new URL('../public/',import.meta.url));
const names=fs.readdirSync(root);assert(names.includes('index.html')&&names.includes('legacy.html'));
for(const name of names){const full=path.join(root,name);assert(fs.lstatSync(full).isFile(),'Public directory only accepts regular top-level files');assert(/\.(html|css|js|mjs|json)$/.test(name),'Unexpected public file');const text=fs.readFileSync(full,'utf8');assert(!/\/workspace\/|\/home\/agent\/|sediment:\/\/|library_file_id|Bearer\s|[?&](?:token|secret|signature|credential|authorization|access_key|sig)=|gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}/i.test(text),'Possible private metadata/credential in '+name);if(name.endsWith('.json'))JSON.parse(text);if(/\.(m?js)$/.test(name)){const check=spawnSync(process.execPath,['--check',full],{encoding:'utf8'});assert.equal(check.status,0,check.stderr);}
  if(name.endsWith('.html'))for(const match of text.matchAll(/(?:src|href)="([^"#?]+)(?:[?#][^"]*)?"/g)){const link=match[1];if(!/^(?:https?:|data:|mailto:)/.test(link))assert(fs.existsSync(path.join(root,link)),'Missing asset '+link);}
}
const summary=validateCatalog(JSON.parse(fs.readFileSync(path.join(root,'product-library.json'))));
console.log(JSON.stringify({check:'passed',publicFiles:names.length,...summary}));
