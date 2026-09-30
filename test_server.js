import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createApp} from './server.js';
let calls=0;
const app=createApp({authCode:'test-code',sessionSecret:'test-secret',syncSecret:'test-sync',syncTopic:'',disableSync:true,fetch:async()=>{calls++;await new Promise(r=>setTimeout(r,15));return {ok:true,json:async()=>({rates:{EUR:0.62},time_last_update_utc:'2026-09-30'})};}});
const server=app.listen(0,'127.0.0.1');
await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
const base='http://127.0.0.1:'+server.address().port;
try {
  const get=(path,cookie)=>fetch(base+path,{redirect:'manual',headers:cookie?{cookie}:{}});
  assert.equal((await get('/dashboard')).status,302);
  assert.equal((await get('/api/session')).status,401);
  assert.equal((await get('/js/app.js')).status,401);
  const post=(path,body,cookie,origin)=>fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',...(cookie?{cookie}:{}),...(origin?{origin}:{})},body:JSON.stringify(body)});
  assert.equal((await post('/api/verify-auth',{code:'wrong'})).status,403);
  assert.equal((await post('/api/verify-auth',{code:'test-code'},null,'https://other.example')).status,403);
  const login=await post('/api/verify-auth',{code:'test-code'});
  assert.equal(login.status,200);
  const header=login.headers.get('set-cookie'),cookie=header.split(';')[0];
  assert.match(header,/HttpOnly/);assert.match(header,/SameSite=Strict/);
  assert.equal((await get('/dashboard',cookie)).status,200);
  const worker=fs.readFileSync('sw.js','utf8');
  const assets=JSON.parse(worker.match(/const PRECACHE_ASSETS = (\[[\s\S]*?\]);/)[1]);
  for(const asset of assets) assert.equal((await get('/'+asset.replace(/^\.\//,''),cookie)).status,200,'Missing offline asset '+asset);
  assert.equal((await get('/.env',cookie)).status,404);
  assert.equal((await get('/server.js',cookie)).status,404);
  assert.equal((await get('/not-a-route',cookie)).status,404);
  const missing=await get('/api/missing',cookie);assert.equal(missing.status,404);assert.match(missing.headers.get('content-type'),/json/);
  const responses=await Promise.all([get('/api/rates',cookie),get('/api/rates',cookie)]);
  assert.equal(calls,1);for(const response of responses){const value=await response.json();assert.equal(value.rate,0.62);assert.equal(value.stale,false);}
  await post('/api/logout',{},cookie);assert.equal((await get('/api/session',cookie)).status,401);
  console.log('HTTP tests: server login, protected assets, secret isolation, origin validation, cookies, API cache deduplication, 404 and logout passed.');
} finally {await new Promise(resolve=>server.close(resolve));}
const failing=createApp({authCode:'test-code',sessionSecret:'test-secret',syncSecret:'test-sync',disableSync:true,syncTopic:'',timeoutMs:20,
  fetch:async(url,{signal})=>new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}))});
const fallbackServer=failing.listen(0,'127.0.0.1');await new Promise(resolve=>fallbackServer.once('listening',resolve));
try {
  const target='http://127.0.0.1:'+fallbackServer.address().port;
  const response=await fetch(target+'/api/verify-auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:'test-code'})});
  const cookie=response.headers.get('set-cookie').split(';')[0];
  const start=Date.now();const rates=await (await fetch(target+'/api/rates',{headers:{cookie}})).json();
  assert.ok(Date.now()-start<1000);assert.equal(rates.stale,true);assert.equal(rates.source,'fallback');
  assert.equal((await fetch(target+'/api/weather',{headers:{cookie}})).status,503);
  console.log('HTTP timeout and complete offline asset checks passed.');
} finally {await new Promise(resolve=>fallbackServer.close(resolve));}
