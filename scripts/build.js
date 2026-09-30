import {versionAssets} from './version-assets.js';
versionAssets();
/* Vanilla app: production export includes only public runtime assets. */
import fs from 'node:fs';import path from 'node:path';
const output=path.resolve('dist');fs.mkdirSync(output,{recursive:true});
const assets=['index.html','login.html','css','js','data','sw.js','manifest.json','favicon.svg','icon-192.png','icon-512.png'];
for(const asset of assets)fs.cpSync(asset,path.join(output,asset),{recursive:true});
console.log('Production assets exported to '+output+'. Private site: run the Express server with .env configuration. Static hosting does not enforce authentication.');
