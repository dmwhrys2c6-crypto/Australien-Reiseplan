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
console.log('1. Fullscreen Map & Floating Overlay DOM Structure:');
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

assert(html.includes('id="reise-canvas"'), 'Fullscreen Canvas #reise-canvas exists in index.html');
assert(html.includes('id="route-interactive-map"'), 'Fullscreen Map Surface #route-interactive-map exists');
assert(html.includes('id="floating-days-bar"'), 'Floating Days Bar #floating-days-bar exists');
assert(html.includes('id="floating-day-plan-overlay"'), 'Floating Day Plan Overlay #floating-day-plan-overlay exists');
assert(html.includes('id="floating-map-controls"'), 'Floating Map Controls #floating-map-controls exists');
assert(html.includes('id="fab-zoom-in"'), 'Zoom In FAB #fab-zoom-in exists');
assert(html.includes('id="fab-zoom-out"'), 'Zoom Out FAB #fab-zoom-out exists');
assert(html.includes('id="fab-reset-view"'), 'Reset View FAB #fab-reset-view exists');
assert(html.includes('id="fab-layers-toggle"'), 'Layers Toggle FAB #fab-layers-toggle exists');
assert(html.includes('id="floating-layers-popover"'), 'Floating Layers Popover #floating-layers-popover exists');
assert(html.includes('id="mobile-map-bottom-sheet"'), 'Mobile Bottom Sheet #mobile-map-bottom-sheet exists');

// 2. Check In-Place CRUD Modals
console.log('\n2. In-Place CRUD Modals:');
assert(html.includes('id="activity-modal-backdrop"'), 'Activity Modal #activity-modal-backdrop exists');
assert(html.includes('id="activity-modal-form"'), 'Activity Modal Form #activity-modal-form exists');
assert(html.includes('id="day-modal-backdrop"'), 'Day Modal #day-modal-backdrop exists');
assert(html.includes('id="day-modal-form"'), 'Day Modal Form #day-modal-form exists');

// 3. Check Script Inclusions
console.log('\n3. Script Inclusions in index.html:');
assert(html.includes('js/tripMasterData.js'), 'Script js/tripMasterData.js is linked');
assert(html.includes('js/tripStore.js'), 'Script js/tripStore.js is linked');
assert(html.includes('js/reiseApp.js'), 'Script js/reiseApp.js is linked');

// 4. Check CSS Styles
console.log('\n4. CSS Zielarchitektur Styles:');
const css = fs.readFileSync(path.join(__dirname, 'css/app.css'), 'utf8');
assert(css.includes('.reise-fullscreen-canvas'), 'CSS .reise-fullscreen-canvas defined');
assert(css.includes('.fullscreen-map-surface'), 'CSS .fullscreen-map-surface defined');
assert(css.includes('.floating-days-bar'), 'CSS .floating-days-bar defined');
assert(css.includes('.floating-day-plan-overlay'), 'CSS .floating-day-plan-overlay defined');
assert(css.includes('.map-fab-btn'), 'CSS .map-fab-btn defined');
assert(css.includes('.crud-modal-backdrop'), 'CSS .crud-modal-backdrop defined');
assert(css.includes('.crud-modal-card'), 'CSS .crud-modal-card defined');

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

const storeCode = fs.readFileSync(path.join(__dirname, 'js/tripStore.js'), 'utf8');
const runStore = new Function('root', 'self', 'require', storeCode);
const storeCtx = {};
runStore(storeCtx, storeCtx, () => masterCtx.TRIP_MASTER_DATA);
const TripStore = storeCtx.TripStore;
TripStore.init(masterCtx.TRIP_MASTER_DATA);

const days = TripStore.getDays();
assert(days.length === 20, 'TripStore loaded 20 days');
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

console.log('\n======================================================');
console.log(`ALL ${passed} ZIELARCHITEKTUR VERIFICATION CHECKS PASSED!`);
console.log('======================================================\n');
