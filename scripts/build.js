import {versionAssets} from './version-assets.js';
versionAssets();
/* Vanilla app: production export includes only public runtime assets. */
import fs from 'node:fs';import path from 'node:path';
const output=path.resolve('dist');
// dist is generated: recreate it so removed source assets cannot survive a build.
fs.rmSync(output,{recursive:true,force:true});fs.mkdirSync(output,{recursive:true});
const assets=['index.html','css','js','data','sw.js','manifest.json','favicon.svg','icon-192.png','icon-512.png'];
for(const asset of assets)fs.cpSync(asset,path.join(output,asset),{recursive:true});
for (const obsolete of ['login.html','js/login.js']) fs.rmSync(path.join(output,obsolete),{force:true});
fs.writeFileSync(path.join(output,'.nojekyll'),'');
console.log('Production assets exported to '+output+'. GitHub Pages: publish the dist folder or use the Pages workflow.');
