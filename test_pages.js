import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const listeners={},location={protocol:'https:',pathname:'/Australien-Reiseplan/',hash:''},urls=[];
const ctx=vm.createContext({console,setTimeout:()=>{},CustomEvent:class{},document:{querySelectorAll:()=>[],title:''},window:{location,history:{pushState(state,title,url){urls.push(url);location.hash=url;}},dispatchEvent(){},scrollTo(){},addEventListener(name,cb){listeners[name]=cb;}}});
vm.runInContext(fs.readFileSync('js/router.js','utf8'),ctx);ctx.Router.init();
for(const route of ['reise','organisation','finanzen','erlebnisse','mehr','dashboard']){
 ctx.Router.navigate(route,{sub:route==='erlebnisse'?'journal':''});assert.ok(urls.at(-1).startsWith('#'));
 assert.equal(location.pathname,'/Australien-Reiseplan/');assert.equal(ctx.Router.resolveRoute().route,route);
 listeners.popstate();assert.equal(ctx.Router.getCurrentRoute(),route);
}
location.hash='#erlebnisse/journal';assert.equal(ctx.Router.resolveRoute().sub,'journal');
const manifest=JSON.parse(fs.readFileSync('manifest.json'));
for(const shortcut of manifest.shortcuts)assert.match(shortcut.url,/^\.\/#/);
assert.equal(manifest.id,'./');
assert.doesNotMatch(fs.readFileSync('js/session.js','utf8'),/fetch\(/);
assert.doesNotMatch(fs.readFileSync('js/app.js','utf8'),/fetch\(['"]\/api\//);
assert.doesNotMatch(fs.readFileSync('index.html','utf8'),/id="security-gate"|onclick="lockApp/);
console.log('GitHub Pages: project-prefix hash navigation, reload/back state, PWA shortcuts and server-free bootstrap passed.');
