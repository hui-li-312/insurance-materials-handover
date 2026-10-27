import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
const coverage=spawnSync(process.execPath,[fileURLToPath(new URL('coverage.mjs',import.meta.url)),'--check'],{stdio:'inherit'});if(coverage.status!==0)process.exit(coverage.status||1);
const result=spawnSync(process.execPath,[fileURLToPath(new URL('check.mjs',import.meta.url))],{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);
const source=fileURLToPath(new URL('../public/',import.meta.url)),output=fileURLToPath(new URL('../dist/',import.meta.url));
fs.rmSync(output,{recursive:true,force:true});fs.cpSync(source,output,{recursive:true});
console.log('Built dist/ by byte-for-byte copy of public/. No bundling, network, credentials or runtime secrets.');
