import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('=== SCHRITT 1 REFACTORING VERIFICATION TEST ===\n');

let passed = 0;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
  passed++;
}

// 1. Directory Structure
console.log('1. Checking Directory Structure:');
assert(fs.existsSync(path.join(rootDir, 'data')), '/data directory exists');
assert(fs.existsSync(path.join(rootDir, 'js')), '/js directory exists');
assert(fs.existsSync(path.join(rootDir, 'css')), '/css directory exists');

// 2. data/trip-days.json Content & Schema
console.log('\n2. Checking data/trip-days.json:');
const daysJsonPath = path.join(rootDir, 'data/trip-days.json');
assert(fs.existsSync(daysJsonPath), 'data/trip-days.json exists');

const tripDays = JSON.parse(fs.readFileSync(daysJsonPath, 'utf8'));
assert(Array.isArray(tripDays), 'tripDays is an array');
assert(tripDays.length === 20, `Contains exactly 20 days (got ${tripDays.length})`);

// Validate every single day
for (let d = 1; d <= 20; d++) {
  const day = tripDays[d - 1];
  assert(day.dayNumber === d, `Tag ${d}: dayNumber is ${d}`);
  assert(/^\d{4}-\d{2}-\d{2}$/.test(day.date), `Tag ${d}: valid ISO date (${day.date})`);
  assert(typeof day.dayOfWeek === 'string' && day.dayOfWeek.length > 0, `Tag ${d}: dayOfWeek present (${day.dayOfWeek})`);
  assert(typeof day.title === 'string' && day.title.length > 0, `Tag ${d}: title present (${day.title.substring(0, 25)})`);
  assert(typeof day.routeBadge === 'string' && day.routeBadge.length > 0, `Tag ${d}: routeBadge present (${day.routeBadge.substring(0, 25)})`);
  assert(['plane', 'car', 'ferry', 'walk', 'bus', 'train', 'helicopter'].includes(day.transportType), `Tag ${d}: valid transportType (${day.transportType})`);
  assert(Array.isArray(day.highlights) && day.highlights.length > 0, `Tag ${d}: highlights present (${day.highlights.length})`);
  assert(typeof day.summary === 'string' && day.summary.length > 0, `Tag ${d}: summary present`);
  assert(Array.isArray(day.activities) && day.activities.length > 0, `Tag ${d}: activities present (${day.activities.length})`);
  assert(Array.isArray(day.sights), `Tag ${d}: sights array present (${day.sights.length})`);
  assert(typeof day.accommodation === 'object' && day.accommodation !== null, `Tag ${d}: accommodation present (${day.accommodation.name})`);
  assert(Array.isArray(day.budgetItems) && day.budgetItems.length > 0, `Tag ${d}: budgetItems present (${day.budgetItems.length})`);
}

// Check total sights count
const totalSights = tripDays.reduce((acc, d) => acc + d.sights.length, 0);
assert(totalSights === 27, `Total 27 sightseeing spots across all days (got ${totalSights})`);

// 3. js/trip-store.js Loader & Store
console.log('\n3. Checking js/trip-store.js:');
const storePath = path.join(rootDir, 'js/trip-store.js');
assert(fs.existsSync(storePath), 'js/trip-store.js exists');

const storeCode = fs.readFileSync(storePath, 'utf8');
assert(storeCode.includes('loadTripDays'), 'Contains loadTripDays() function');
assert(storeCode.includes('fetch("data/trip-days.json"') || storeCode.includes("fetch('data/trip-days.json'"), 'Performs async fetch() for data/trip-days.json');
assert(storeCode.includes('FALLBACK_TRIP_DAYS'), 'Contains fallback data for offline / file:// protocol');
assert(storeCode.includes('renderTimeline'), 'Contains renderTimeline() function');
assert(storeCode.includes('renderDayItem'), 'Contains renderDayItem() function');

// Run store code in Node sandbox
const storeFn = new Function('root', 'self', storeCode);
const mockRoot = {};
storeFn(mockRoot, mockRoot);
const TripStore = mockRoot.TripStore;
assert(typeof TripStore === 'object', 'TripStore exported as an object');
assert(typeof TripStore.getDays === 'function', 'TripStore.getDays is a function');
assert(typeof TripStore.getDay === 'function', 'TripStore.getDay is a function');
assert(typeof TripStore.renderTimeline === 'function', 'TripStore.renderTimeline is a function');

// Initialize with fallback
TripStore.init();
const loadedDays = TripStore.getDays();
assert(loadedDays.length === 20, `TripStore loaded 20 days via fallback/init (got ${loadedDays.length})`);

// 4. Test renderTimeline in Mock DOM
console.log('\n4. Testing renderTimeline() DOM generation:');
let renderedHtml = '';
const mockContainer = {
  nodeType: 1,
  querySelectorAll: (sel) => [],
  set innerHTML(val) {
    renderedHtml = val;
  },
  get innerHTML() {
    return renderedHtml;
  }
};

TripStore.renderTimeline(mockContainer);
assert(renderedHtml.length > 50000, `Rendered HTML substantial size (${renderedHtml.length} chars)`);

for (let d = 1; d <= 20; d++) {
  assert(renderedHtml.includes(`id="day-${d}"`), `Rendered HTML contains id="day-${d}"`);
  assert(renderedHtml.includes(`id="act-list-day-${d}"`), `Rendered HTML contains id="act-list-day-${d}"`);
  assert(renderedHtml.includes(`focusDayOnMap(${d}, event)`), `Rendered HTML contains focusDayOnMap(${d}, event)`);
  assert(renderedHtml.includes(`addCustomActivity(${d})`), `Rendered HTML contains addCustomActivity(${d})`);
}

for (let s = 1; s <= 27; s++) {
  assert(renderedHtml.includes(`id="spot-card-${s}"`), `Rendered HTML contains spot-card-${s}`);
  assert(renderedHtml.includes(`focusSpotOnMap(${s}, event)`), `Rendered HTML contains focusSpotOnMap(${s}, event)`);
}

// 5. Checking index.html Streamlining
console.log('\n5. Checking index.html:');
const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');

// Hardcoded days removed
assert(!html.includes('id="day-1"'), 'Hardcoded id="day-1" removed from index.html');
assert(!html.includes('id="day-14"'), 'Hardcoded id="day-14" removed from index.html');
assert(!html.includes('id="day-20"'), 'Hardcoded id="day-20" removed from index.html');

// Template containers intact
assert(html.includes('id="route"'), 'Section #route exists');
assert(html.includes('class="timeline-wrapper"'), '.timeline-wrapper exists');
assert(html.includes('class="timeline"'), '.timeline container exists');
assert(html.includes('class="reise-split-layout"'), '.reise-split-layout exists and is unhidden');
assert(!html.includes('<div class="reise-split-layout" style="display:none;"'), '.reise-split-layout does not have display:none');

// Scripts included
assert(html.includes('src="js/trip-store.js"'), '<script src="js/trip-store.js"></script> included in index.html');

// Navigation and Views intact
const views = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'];
for (const v of views) {
  assert(html.includes(`id="view-${v}"`), `View #view-${v} exists`);
}

// Modals intact
const modals = [
  'security-gate', 'booking-modal-backdrop', 'packing-modal-backdrop',
  'expense-modal-backdrop', 'photo-modal-backdrop', 'photo-lightbox-modal',
  'global-search-modal', 'activity-modal-backdrop', 'day-modal-backdrop'
];
for (const m of modals) {
  assert(html.includes(`id="${m}"`), `Modal #${m} exists`);
}

console.log('\n================================================================');
console.log(`ALL ${passed} VERIFICATION CHECKS PASSED WITH 100% SUCCESS!`);
console.log('================================================================\n');
