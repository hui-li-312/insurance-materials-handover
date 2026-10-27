import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateCatalog,recount} from './catalog-model.mjs';
const target=fileURLToPath(new URL('../public/product-library.json',import.meta.url));
const [operation,file,...args]=process.argv.slice(2);
if(!file||!['export','import'].includes(operation))throw Error('Usage: catalog.mjs export FILE | import FILE --snapshot LABEL --source-records N');
if(operation==='export'){
  if(args.length)throw Error('Unexpected export arguments');
  const data=JSON.parse(fs.readFileSync(target));validateCatalog(data);
  fs.writeFileSync(path.resolve(file),JSON.stringify(data,null,2)+'\n',{flag:'wx'});
  console.log('Exported editable public catalog; destination must not already exist.');
}else{
  if(args.length!==4||args[0]!=='--snapshot'||!args[1]||args[2]!=='--source-records'||!/^\d+$/.test(args[3]))throw Error('Import requires --snapshot LABEL --source-records N');
  const data=JSON.parse(fs.readFileSync(path.resolve(file)));data.snapshot=args[1];data.counts.sourceRecords=Number(args[3]);
  validateCatalog(data,{derived:false});const updated=recount(data);const summary=validateCatalog(updated);
  const temp=target+'.tmp';fs.writeFileSync(temp,JSON.stringify(updated)+'\n',{flag:'wx'});fs.renameSync(temp,target);
  console.log(JSON.stringify({...summary,snapshot:updated.snapshot,warning:'Only homepage catalog updated; legacy datasets are unchanged. Review the Git diff and evidence before deployment.'},null,2));
}
