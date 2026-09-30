/* Isolated manual browser testing: never contacts the real cloud sync topic. */
import {createApp} from '../server.js';
const weather = [15,24,17].map(temp => ({current:{temperature_2m:temp,apparent_temperature:temp,weather_code:0,wind_speed_10m:10,relative_humidity_2m:50,time:'2026-09-30T12:00'}}));
createApp({authCode:'test-access-only',sessionSecret:'fixture-session-secret',syncSecret:'fixture-sync-secret',syncTopic:'',disableSync:true,
  fetch:async url=>({ok:true,json:async()=>url.includes('open-meteo')?weather:{rates:{EUR:0.62},time_last_update_utc:'2026-09-30T12:00:00Z'}})
}).listen(Number(process.argv[2] || 8765),'127.0.0.1',()=>console.log('Isolated browser fixture started; code: test-access-only'));
