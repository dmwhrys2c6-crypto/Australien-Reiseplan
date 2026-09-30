import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
let grant,online=true,authorized=true,logout=false;
// Transaction fixture preserves the same key object as IndexedDB structured cloning.
const indexedDB={open(){const request={};queueMicrotask(()=>{request.result={close(){},transaction(){const tx={objectStore(){return {
  get(){const result={};queueMicrotask(()=>{result.result=grant;result.onsuccess();tx.oncomplete();});return result;},
  put(value){grant=value;const result={};queueMicrotask(()=>{result.onsuccess();tx.oncomplete();});return result;},
  delete(){grant=undefined;const result={};queueMicrotask(()=>{result.onsuccess();tx.oncomplete();});return result;}
};}};return tx;}};request.onsuccess();});return request;}};
const body={classList:{contains:()=>true},children:[{id:'content',tagName:'MAIN'},{id:'security-gate',tagName:'DIV'}]};
let redirect;
const context=vm.createContext({console,crypto:webcrypto,indexedDB,TextEncoder,AbortSignal,
  document:{body,addEventListener(){}},location:{pathname:'/reise',hash:'',replace:value=>{redirect=value;}},
  fetch:async path=>{if(!online)throw new TypeError('Offline');if(path==='/api/logout')logout=true;return {status:authorized?200:401,ok:authorized,json:async()=>({syncSecret:'test-secret',syncTopic:'',resources:{photos:'https://example.com'}})};}});
context.window=context;
vm.runInContext(fs.readFileSync('js/session.js','utf8'),context);
assert.equal(body.children[0].inert,true);assert.equal(body.children[1].inert,undefined);
const access=await context.AppSession.restore();assert.equal(access.key.extractable,false);assert.ok(grant);
online=false;const offline=await context.AppSession.restore();assert.equal(offline.key,access.key);
await context.AppSession.logout();assert.equal(grant,undefined);
await assert.rejects(context.AppSession.restore(),/einmal online/);
online=true;await context.AppSession.restore();authorized=false;
await assert.rejects(context.AppSession.restore(),/erneut anmelden/);assert.equal(grant,undefined);assert.match(redirect,/\/login/);
authorized=true;await context.AppSession.restore();await context.AppSession.logout();assert.equal(logout,true);
console.log('Session tests: online grant, non-extractable device key, offline restore, offline logout, expired online session and focus lock passed.');
