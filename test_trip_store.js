// test_trip_store.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock localStorage for Node
const storage = {};
global.localStorage = {
  getItem: (k) => storage[k] || null,
  setItem: (k, v) => { storage[k] = String(v); },
  removeItem: (k) => { delete storage[k]; }
};

// Load master data
const masterDataCode = fs.readFileSync(path.join(__dirname, 'js/tripMasterData.js'), 'utf8');
const runMaster = new Function('root', 'self', masterDataCode);
const masterCtx = {};
runMaster(masterCtx, masterCtx);
const masterData = masterCtx.TRIP_MASTER_DATA;

// Load TripStore
const storeCode = fs.readFileSync(path.join(__dirname, 'js/trip-store.js'), 'utf8');
const runStore = new Function('root', 'self', 'require', storeCode);
const storeCtx = {};
runStore(storeCtx, storeCtx, () => masterData);
const TripStore = storeCtx.TripStore;

console.log('=== TESTING TRIP STORE CRUD & REACTIVITY ===\n');

let testsPassed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
  testsPassed++;
}

// 1. Init
console.log('1. Store Initialization:');
TripStore.init(masterData);
const days = TripStore.getDays();
assert(days.length === 20, `Store loaded exactly 20 days (got ${days.length})`);

// 2. Read Day with Relations
console.log('\n2. Read Day 14 with attached relations:');
const day14 = TripStore.getDay(14);
assert(day14 !== null, 'Day 14 exists');
assert(day14.title.includes('Whitsunday'), 'Day 14 title contains Whitsundays');
assert(Array.isArray(day14.activities) && day14.activities.length > 0, `Day 14 has activities (${day14.activities.length})`);
assert(Array.isArray(day14.spots) && day14.spots.length > 0, `Day 14 has spots (${day14.spots.length})`);
assert(day14.accommodationDetails !== null, `Day 14 has accommodation (${day14.accommodationDetails.name})`);

// 3. Activity CRUD
console.log('\n3. Activity CRUD:');
let activityEventFired = false;
const unsubAct = TripStore.subscribe('activity:created', (act) => {
  activityEventFired = true;
});

const newAct = TripStore.createActivity(14, {
  time: '18:30',
  title: 'Spektakuläre Sunset Cruise ab Airlie Beach',
  category: 'tour',
  notes: 'Mit Champagner & Tapas'
});
assert(newAct.id.startsWith('act-d14'), 'Generated valid activity ID');
assert(activityEventFired, 'Event activity:created was fired on subscribe()');
unsubAct();

// Read updated activities
const day14Acts = TripStore.getActivities(14);
const foundNewAct = day14Acts.find(a => a.id === newAct.id);
assert(foundNewAct !== undefined, 'New activity is listed in Day 14 activities');
assert(foundNewAct.time === '18:30', 'New activity time is 18:30');

// Update activity
const updatedAct = TripStore.updateActivity(newAct.id, {
  title: 'Exklusive Private Sunset Cruise',
  time: '19:00'
});
assert(updatedAct.title === 'Exklusive Private Sunset Cruise', 'Activity title updated');
assert(updatedAct.time === '19:00', 'Activity time updated to 19:00');

// Delete activity
const delRes = TripStore.deleteActivity(newAct.id);
assert(delRes === true, 'Activity deleted successfully');
const day14ActsAfterDel = TripStore.getActivities(14);
assert(!day14ActsAfterDel.some(a => a.id === newAct.id), 'Deleted activity is no longer in Day 14');

// 4. Day CRUD
console.log('\n4. Day CRUD:');
let dayUpdatedFired = false;
TripStore.subscribe('day:updated', () => { dayUpdatedFired = true; });

TripStore.updateDay(14, {
  title: 'Whitsundays – Paradies auf Erden'
});
assert(TripStore.getDay(14).title === 'Whitsundays – Paradies auf Erden', 'Day title successfully updated');
assert(dayUpdatedFired, 'Event day:updated was fired');

// Create Day 21 (Extension)
const newDay21 = TripStore.createDay({
  title: 'Zusatztag Sydney Relaxing & Souvenirs',
  location: 'Sydney (NSW)'
});
assert(TripStore.getDays().length === 21, 'Trip days extended to 21');
assert(newDay21.dayNumber === 21, 'New day has dayNumber 21');

// Delete Day 21
TripStore.deleteDay(21);
assert(TripStore.getDays().length === 20, 'Trip days cleanly restored to 20');

// 5. Spots CRUD
console.log('\n5. Spots CRUD:');
const newSpot = TripStore.createSpot({
  name: 'Boathaven Beach Sunset Point',
  category: 'Fotospot',
  day: 14,
  coords: [-20.268, 148.723]
});
assert(TripStore.getSpot(newSpot.id) !== null, 'New spot created and retrieved');
TripStore.updateSpot(newSpot.id, { highlight: 'Bester Blick auf die Yachten' });
assert(TripStore.getSpot(newSpot.id).highlight === 'Bester Blick auf die Yachten', 'Spot highlight updated');
TripStore.deleteSpot(newSpot.id);
assert(TripStore.getSpot(newSpot.id) === null, 'Spot successfully deleted');

// 6. JSON Export & Import
console.log('\n6. Backup & Restore (JSON Export / Import):');
const exportedJson = TripStore.exportMasterJSON();
assert(typeof exportedJson === 'string' && exportedJson.length > 5000, 'Exported valid JSON master file');
const importRes = TripStore.importMasterJSON(exportedJson);
assert(importRes === true, 'Master JSON import succeeded');
assert(TripStore.getDays().length === 20, 'Post-import day count verified');

console.log('\n======================================================');
console.log(`ALL ${testsPassed} TRIP STORE CRUD & REACTIVITY TESTS PASSED!`);
console.log('======================================================\n');
