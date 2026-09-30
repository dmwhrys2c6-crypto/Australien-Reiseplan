import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {randomBytes, timingSafeEqual, createHmac} from 'node:crypto';

const directory = path.dirname(fileURLToPath(import.meta.url));
if (fs.existsSync(path.join(directory, '.env')) && process.loadEnvFile) process.loadEnvFile(path.join(directory, '.env'));
const resources = {splitwise:'https://secure.splitwise.com/#/groups/101615495',photos:'https://photos.app.goo.gl/c8Bkr97b1hc8QrKP7'};
const routes = new Set(['/', '/index.html', '/dashboard', '/reise', '/organisation', '/finanzen', '/erlebnisse', '/mehr']);

export function createApp(options = {}) {
  const app = express(), request = options.fetch || globalThis.fetch;
  const code = options.authCode ?? process.env.AUTH_CODE;
  const secret = options.sessionSecret ?? process.env.SESSION_SECRET;
  const syncSecret = options.syncSecret ?? process.env.SYNC_SECRET;
  const syncTopic = options.syncTopic ?? process.env.SYNC_TOPIC;
  const sessions = new Map(), attempts = new Map();
  const ttl = 7 * 24 * 60 * 60 * 1000;
  app.disable('x-powered-by');
  if (process.env.TRUST_PROXY === '1') app.set('trust proxy', 1);
  app.use(express.json({limit:'8kb'}));
  app.use((req,res,next) => {
    res.set('X-Content-Type-Options','nosniff');
    res.set('Referrer-Policy','same-origin');
    res.set('Cache-Control','private, no-store');
    if (req.method === 'POST' && req.get('origin')) {
      try { if (new URL(req.get('origin')).host !== req.get('host')) return res.status(403).json({message:'Ungültige Anfragequelle.'}); }
      catch { return res.status(403).json({message:'Ungültige Anfragequelle.'}); }
    }
    next();
  });
  const sign = value => createHmac('sha256', secret || '').update(value).digest('hex');
  function session(req) {
    const cookie = (req.headers.cookie || '').split(';').map(x=>x.trim()).find(x=>x.startsWith('aus_session='));
    if (!cookie || !secret) return null;
    const [id, signature] = cookie.slice(12).split('.');
    if (!id || !signature || signature.length !== 64 || !/^[a-f0-9]+$/.test(signature)) return null;
    if (!timingSafeEqual(Buffer.from(signature), Buffer.from(sign(id)))) return null;
    const expiry = sessions.get(id);
    if (!expiry || expiry < Date.now()) { sessions.delete(id); return null; }
    return id;
  }
  const cookieOptions = req => ({httpOnly:true, sameSite:'strict', secure:req.secure, path:'/'});
  app.get('/login', (req,res) => res.sendFile(path.join(directory,'login.html')));
  app.get('/js/login.js', (req,res) => res.sendFile(path.join(directory,'js/login.js')));
  for (const file of ['favicon.svg','icon-192.png','icon-512.png','sw.js']) app.get('/'+file,(req,res)=>res.sendFile(path.join(directory,file)));
  app.post('/api/verify-auth',(req,res) => {
    if (!code || !secret || !syncSecret || (!syncTopic && !options.disableSync)) return res.status(503).json({message:'Die Server-Anmeldung ist noch nicht konfiguriert.'});
    const now=Date.now(), previous=attempts.get(req.ip), entry=previous && now-previous.start<60000 ? previous : {start:now,count:0};
    attempts.set(req.ip,entry);
    if (++entry.count > 20) return res.status(429).json({message:'Zu viele Versuche. Bitte eine Minute warten.'});
    const entered=req.body?.code;
    if (typeof entered !== 'string' || !entered.trim()) return res.status(400).json({message:'Bitte den Zugangscode eingeben.'});
    const a=Buffer.from(entered.trim()),b=Buffer.from(code);
    if (a.length !== b.length || !timingSafeEqual(a,b)) return res.status(403).json({success:false,message:'Ungültiger Zugangscode.'});
    const id=randomBytes(32).toString('hex');sessions.set(id,now+ttl);
    for (const [key,expiry] of sessions) if (expiry<now) sessions.delete(key);
    for (const [key,value] of attempts) if (now-value.start>60000) attempts.delete(key);
    res.cookie('aus_session',id+'.'+sign(id),{...cookieOptions(req),maxAge:ttl});
    res.json({success:true,authenticated:true});
  });
  app.post('/api/logout',(req,res) => {const id=session(req);if(id)sessions.delete(id);res.clearCookie('aus_session',cookieOptions(req));res.json({success:true});});
  app.use((req,res,next) => {
    if(session(req)) return next();
    if(req.path.startsWith('/api/') || !req.accepts('html')) return res.status(401).json({message:'Anmeldung erforderlich.'});
    if(routes.has(req.path)) return res.redirect('/login?next='+encodeURIComponent(req.originalUrl));
    return res.status(401).send('Anmeldung erforderlich.');
  });
  app.get('/api/session',(req,res)=>res.json({resources,syncSecret,syncTopic}));

  async function json(url) {
    const response=await request(url,{signal:AbortSignal.timeout(options.timeoutMs || 3500)});
    if(!response.ok) throw new Error('Externer Dienst: '+response.status);
    return response.json();
  }
  function cachedEndpoint(load,initial,maxAge) {
    let cached=initial,lastSuccess=0,lastAttempt=0,pending=null;
    return async(req,res) => {
      const now=Date.now();
      if(now-lastSuccess>maxAge && now-lastAttempt>30000 && !pending) {
        lastAttempt=now;
        pending=load().then(value=>{cached={...value,source:'live',stale:false};lastSuccess=Date.now();}).catch(error=>console.warn('Externe Daten nicht verfügbar:',error.message)).finally(()=>{pending=null;});
      }
      if(pending) await pending;
      if(!cached) return res.status(503).json({message:'Aktuelle Daten sind nicht verfügbar.',offline:true});
      res.json({...cached,stale:!lastSuccess || Date.now()-lastSuccess>maxAge});
    };
  }
  app.get('/api/rates',cachedEndpoint(async()=>{
    const data=await json('https://open.er-api.com/v6/latest/AUD'),rate=Number(data.rates?.EUR);
    if(!Number.isFinite(rate)||rate<=0)throw new Error('Ungültiger Wechselkurs');
    return {rate,inverseRate:Number((1/rate).toFixed(4)),updatedAt:data.time_last_update_utc || null};
  },{rate:0.621,inverseRate:1/0.621,updatedAt:null,source:'fallback'},30*60*1000));
  app.get('/api/weather',cachedEndpoint(async()=>{
    const raw=await json('https://api.open-meteo.com/v1/forecast?latitude=-33.8688,-27.4698,-37.8136&longitude=151.2093,153.0251,144.9631&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto');
    if(!Array.isArray(raw)||raw.length!==3||raw.some(x=>!x.current||!Number.isFinite(x.current.temperature_2m)))throw new Error('Ungültige Wetterdaten');
    const data={updatedAt:new Date().toISOString()};
    ['sydney','brisbane','melbourne'].forEach((city,i)=>{const c=raw[i].current;data[city]={temp:c.temperature_2m,apparentTemp:c.apparent_temperature,weatherCode:c.weather_code,windSpeed:c.wind_speed_10m,humidity:c.relative_humidity_2m,time:c.time};});
    return data;
  },null,10*60*1000));
  app.use('/api',(req,res)=>res.status(404).json({message:'API-Endpunkt nicht gefunden.'}));
  for (const folder of ['css','js','data']) app.use('/'+folder,express.static(path.join(directory,folder),{index:false,dotfiles:'deny',etag:true,maxAge:0,setHeaders:res=>res.set('Cache-Control','private, no-cache')}));
  app.get('/manifest.json',(req,res)=>res.sendFile(path.join(directory,'manifest.json')));
  app.get('*',(req,res)=>routes.has(req.path)?res.sendFile(path.join(directory,'index.html')):res.status(404).send('Nicht gefunden.'));
  app.use((error,req,res,next)=>{if(res.headersSent)return next(error);res.status(error.type==='entity.parse.failed'?400:500).json({message:error.type==='entity.parse.failed'?'Ungültiges JSON.':'Anfrage fehlgeschlagen.'});});
  return app;
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const port=process.env.PORT || 3000;
  createApp().listen(port,'0.0.0.0',()=>console.log(`Australien Roadtrip läuft auf Port ${port}. Zugangscode: lokale .env-Datei.`));
}
