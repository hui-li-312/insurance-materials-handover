#!/usr/bin/env python3
"""Verify and restore only manifest-authorized original bytes; no network."""
import argparse, hashlib, json, pathlib, zipfile

def digest(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for b in iter(lambda:f.read(1024*1024),b''):h.update(b)
    return h.hexdigest()

def main():
    a=argparse.ArgumentParser();a.add_argument('--assets',type=pathlib.Path,required=True);a.add_argument('--output',type=pathlib.Path,required=True);a.add_argument('--include-quarantine',action='store_true',help='Explicitly include held materials in a separate quarantine directory');args=a.parse_args()
    root=pathlib.Path(__file__).resolve().parents[1]
    release=json.loads((root/'manifests/release-assets.json').read_text())
    if args.include_quarantine and release.get('quarantine_release_status')=='not_for_upload_pending_privacy_review':raise ValueError('Quarantine originals are not published; privacy review and separate authorization required.')
    assets=release['assets'];files=json.loads((root/'manifests/raw-files.json').read_text())['files'];assets=[x for x in assets if args.include_quarantine or not x['quarantined']]; files=[x for x in files if args.include_quarantine or not x['quarantined']];by={x['path']:x for x in files};seen=set();out=args.output.resolve()
    for item in assets:
        p=args.assets/item['name']
        if p.stat().st_size!=item['bytes'] or digest(p)!=item['sha256']:raise ValueError('Asset hash/size mismatch: '+item['name'])
        with zipfile.ZipFile(p) as z:
            for info in z.infolist():
                name=info.filename; rel=pathlib.PurePosixPath(name)
                if name not in by or rel.is_absolute() or '..' in rel.parts or name in seen:raise ValueError('Unexpected or duplicate ZIP entry: '+name)
                r=by[name];b=z.read(info)
                if len(b)!=r['bytes'] or hashlib.sha256(b).hexdigest()!=r['sha256']:raise ValueError('Original hash mismatch: '+name)
                dest=out/rel
                if not dest.resolve().is_relative_to(out):raise ValueError('Unsafe output path')
                dest.parent.mkdir(parents=True,exist_ok=True)
                if dest.exists():
                    if digest(dest)!=r['sha256']:raise ValueError('Refusing to replace different file: '+name)
                else:dest.write_bytes(b)
                seen.add(name)
    if seen!=set(by):raise ValueError('Missing originals: '+str(len(set(by)-seen)))
    print('Verified and restored',len(seen),'original files.')
if __name__=='__main__':main()
