// test_zielarchitektur.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== ZIELARCHITEKTUR VERIFICATION TEST ===\n');

let passed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
  passed++;
}

// 1. Check HTML Elements
console.log('1. Map workspace DOM structure:');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
for (const id of ['trip-workspace', 'trip-map', 'trip-day-selector', 'trip-sheet', 'trip-sheet-handle', 'trip-sheet-body', 'trip-location-picker', 'view-dashboard', 'view-reise', 'hero-video-player']) {
  assert(html.includes(`id="${id}"`), `#${id} exists in index.html`);
}
for (const action of ['zoom-in', 'zoom-out', 'fit-map']) assert(html.includes(`data-action="${action}"`), `Map control ${action} exists`);

// 2. Editor dialogs
console.log('\n2. Editor dialogs:');
for (const id of ['trip-editor', 'trip-editor-form', 'trip-confirm', 'manage-live']) assert(html.includes(`id="${id}"`), `#${id} exists`);

// 3. Script inclusions
console.log('\n3. Script inclusions in index.html:');
for (const file of ['js/persistence.js', 'js/tripMasterData.js', 'js/trip-store.js', 'js/trip/repository.js', 'js/trip/map-adapter.js', 'js/trip/page.js', 'js/home.js', 'js/shell.js']) assert(html.includes(file), `Script ${file} is linked`);
assert(!html.includes('js/app.js'), 'Legacy js/app.js is gone');

// 4. CSS
console.log('\n4. Stylesheet:');
const css = fs.readFileSync(path.join(__dirname, 'css/site.css'), 'utf8');
for (const selector of ['.trip-workspace', '.trip-sheet', '.trip-day-pill', '.hero-bg-video']) assert(css.includes(selector), `CSS ${selector} defined`);
assert(css.includes('safe-area-inset-bottom'), 'Safe-area insets are respected');
assert(/viewport-fit=cover/.test(html), 'Viewport covers the notch area');

// 5. TripStore Functionality & Single Source of Truth
console.log('\n5. TripStore Single Source of Truth:');
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

const masterDataCode = fs.readFileSync(path.join(__dirname, 'js/tripMasterData.js'), 'utf8');
const runMaster = new Function('root', 'self', masterDataCode);
const masterCtx = {};
runMaster(masterCtx, masterCtx);

const storeCode = fs.readFileSync(path.join(__dirname, 'js/trip-store.js'), 'utf8');
const runStore = new Function('root', 'self', 'require', storeCode);
const storeCtx = {};
runStore(storeCtx, storeCtx, () => masterCtx.TRIP_MASTER_DATA);
const TripStore = storeCtx.TripStore;
TripStore.init(masterCtx.TRIP_MASTER_DATA);

const days = TripStore.getDays();
assert(days.length === 21, 'TripStore loaded 21 days including Tag 0');
const allActs = TripStore.getActivities();
assert(allActs.length >= 75, `TripStore loaded ${allActs.length} activities (>= 75)`);

// 6. Test Live In-Place CRUD
console.log('\n6. Test Live In-Place CRUD:');
// Create
const testAct = TripStore.createActivity(14, {
  time: '15:30',
  title: 'Helikopter Rundflug Heart Reef',
  category: 'tour',
  notes: 'Sonnenschutz mitnehmen'
});
assert(testAct.id !== undefined, 'Activity created with unique ID');
assert(TripStore.getDay(14).activities.some(a => a.id === testAct.id), 'Activity present in Day 14');

// Update
TripStore.updateActivity(testAct.id, { title: 'VIP Helikopter Rundflug Heart Reef' });
assert(TripStore.getActivity(testAct.id).title === 'VIP Helikopter Rundflug Heart Reef', 'Activity updated');

// Delete
TripStore.deleteActivity(testAct.id);
assert(TripStore.getActivity(testAct.id) === null, 'Activity deleted');

console.log('\n3. Light map (OpenStreetMap, blue routes):');
const mapAdapter = fs.readFileSync(path.join(__dirname, 'js/trip/map-adapter.js'), 'utf8');
const tokensCss = fs.readFileSync(path.join(__dirname, 'css/tokens.css'), 'utf8');
assert(mapAdapter.includes('tile.openstreetmap.org'), 'map adapter uses the OpenStreetMap tiles');
assert(!mapAdapter.includes('dark_all'), 'map adapter no longer uses dark_all');
assert(mapAdapter.includes("'--route-blue'"), 'map adapter reads --route-blue');
assert(tokensCss.includes('--route-blue:'), 'tokens.css defines --route-blue');

console.log('\n======================================================');
console.log(`ALL ${passed} ZIELARCHITEKTUR VERIFICATION CHECKS PASSED!`);
console.log('======================================================\n');
