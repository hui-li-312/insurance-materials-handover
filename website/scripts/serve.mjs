// Local QA/convenience server only. Use a maintained static host for production.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
export function createServer(directory){
  const root=fs.realpathSync(directory);
  return http.createServer((req,res)=>{
    if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});return res.end();}
    let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);return res.end();}
    if(pathname==='/' )pathname='/index.html';
    const target=path.resolve(root,'.'+pathname);
    try{const real=fs.realpathSync(target);if(!real.startsWith(root+path.sep)||pathname.split('/').some(p=>p.startsWith('.'))||!fs.statSync(real).isFile())throw Error('not public');const type=mime[path.extname(real)];if(!type)throw Error('unsupported');res.writeHead(200,{'Content-Type':type,'Content-Length':fs.statSync(real).size,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});if(req.method==='HEAD')return res.end();fs.createReadStream(real).pipe(res);}catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('Not found');}
  });
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const args=process.argv.slice(2);let dir='public',host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||8080);
  for(let i=0;i<args.length;i+=2){if(!args[i+1])throw Error('Missing argument value');if(args[i]==='--dir')dir=args[i+1];else if(args[i]==='--host')host=args[i+1];else if(args[i]==='--port')port=Number(args[i+1]);else throw Error('Unknown argument '+args[i]);}
  if(!Number.isInteger(port)||port<0||port>65535)throw Error('Invalid port');
  const root=path.resolve(fileURLToPath(new URL('../',import.meta.url)),dir),server=createServer(root);
  server.on('error',error=>{console.error(error.message);process.exitCode=1;});server.listen(port,host,()=>console.log(`Serving ${dir} at http://${host}:${server.address().port}`));
}
