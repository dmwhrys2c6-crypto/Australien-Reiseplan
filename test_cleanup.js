import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';

const read = file => fs.readFileSync(file, 'utf8');
const html = read('index.html');
const walk = dir => fs.readdirSync(dir, {withFileTypes: true}).flatMap(entry =>
  entry.isDirectory() ? walk(path.join(dir, entry.name)) : [path.join(dir, entry.name)]);
const files = [...walk('css'), ...walk('js')].filter(file => /\.(css|js)$/.test(file));
const runtime = [html, ...files.map(read)].join('\n');

for (const match of html.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
  const file = match[1].split(/[?#]/)[0];
  if (!file || /^(?:https?:|data:|mailto:|tel:|\/)/.test(file)) continue;
  assert.ok(fs.existsSync(file), 'Missing local HTML asset: ' + file);
}
for (const file of files) {
  // Login belongs to the optional private Express server, not the static app.
  const entry = file === 'js/login.js' ? read('login.html') : html;
  assert.ok(entry.includes(file), 'Unreferenced runtime file: ' + file);
}
for (const marker of ['exp-panel-bucketlist', 'exp-panel-wildlife', 'Wildlife Tracker',
  'initDroneAirspaceMap', 'handleDroneMapToggle', 'droneAirspaceMap',
  'legacy-drone-map-slide', 'legacy-drone-airspace-map', 'airspaceFeatures']) {
  assert.ok(!runtime.includes(marker), 'Removed feature returned: ' + marker);
}
for (const comment of html.matchAll(/<!--[\s\S]*?-->/g)) {
  assert.ok(!/<\/?(?:div|section|script|style|button)\b/.test(comment[0]), 'Commented layout remains');
}
const hashes = new Map();
for (const file of files) {
  const hash = createHash('sha256').update(read(file)).digest('hex');
  assert.ok(!hashes.has(hash), 'Duplicate runtime files: ' + file + ' / ' + hashes.get(hash));
  hashes.set(hash, file);
}
console.log('Cleanup: local assets exist, runtime entry points accounted for, removed features absent, no commented layouts or duplicate runtime files.');
