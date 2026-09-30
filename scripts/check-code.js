import fs from 'node:fs';import path from 'node:path';import vm from 'node:vm';
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(x=>x.isDirectory()?files(path.join(dir,x.name)):[path.join(dir,x.name)]);}
const scripts=[...files('js').filter(f=>f.endsWith('.js')),'sw.js'];
for(const file of scripts)new vm.Script(fs.readFileSync(file,'utf8'),{filename:file});
const html=fs.readFileSync('index.html','utf8');
for(const match of html.matchAll(/\bon(?:click|change|input|submit|toggle|keydown|error)="([^"]*)"/g))new vm.Script('(function(event){'+match[1].replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#39;',"'")+'})');
if(process.argv.includes('--lint')){
 const managed=files('js/management').filter(f=>f.endsWith('.js'));
 for(const file of managed){const code=fs.readFileSync(file,'utf8');if(/\beval\s*\(/.test(code)||/new\s+Function\s*\(/.test(code))throw new Error(file+': dynamic code is not permitted');if(/[\t ]+$/m.test(code))throw new Error(file+': trailing whitespace');}
 console.log('Project lint: classic-script syntax, inline handlers, whitespace and dynamic-code checks passed.');
}else console.log('All browser scripts and inline handlers: syntax passed. No TypeScript sources are present.');
