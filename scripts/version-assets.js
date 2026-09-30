import fs from 'node:fs';
import {createHash} from 'node:crypto';
export function versionAssets() {
  const hash = file => createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0,12);
  let html = fs.readFileSync('index.html','utf8');
  html = html.replace(/((?:src|href)=["'])((?:js|css)\/[^"'?]+)(?:\?[^"']*)?(["'])/g, (all,prefix,file,end) => prefix+file+'?v='+hash(file)+end);
  fs.writeFileSync('index.html',html);
  const assets = ['./','./index.html',...Array.from(html.matchAll(/(?:src|href)=["']((?:js|css)\/[^"']+)["']/g),m=>'./'+m[1]),'./data/trip-days.json','./manifest.json','./favicon.svg','./icon-192.png','./icon-512.png'];
  let worker = fs.readFileSync('sw.js','utf8');
  worker = worker.replace(/const CACHE_NAME = '[^']+';/, "const CACHE_NAME = 'aus-roadtrip-"+createHash('sha256').update(html + assets.filter(a => fs.existsSync(a.split('?')[0]) && fs.statSync(a.split('?')[0]).isFile()).map(a => hash(a.split('?')[0])).join('')).digest('hex').slice(0,12)+"';");
  worker = worker.replace(/const PRECACHE_ASSETS = \[[\s\S]*?\];/, 'const PRECACHE_ASSETS = '+JSON.stringify([...new Set(assets)],null,2)+';');
  fs.writeFileSync('sw.js',worker);
}
if (process.argv[1]?.endsWith('version-assets.js')) versionAssets();
