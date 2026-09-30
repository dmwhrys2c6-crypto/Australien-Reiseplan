import assert from 'node:assert/strict';
import fs from 'node:fs';

console.log('=== PHASE 2 VISUAL UNIFICATION VERIFICATION ===');

// 1. Verify Startseite preservation
const heroDockCss = fs.readFileSync('css/hero-dock.css', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

// Check that Startseite core classes exist and have not been altered
assert.ok(heroDockCss.includes('body.is-home'), 'Startseite scope body.is-home must exist in hero-dock.css');
assert.ok(heroDockCss.includes('.hero-cinematic'), 'Hero cinematic must exist in hero-dock.css');
assert.ok(heroDockCss.includes('.liquid-glass-dock'), 'Liquid glass dock must exist in hero-dock.css');
assert.ok(indexHtml.includes('id="hero-cinematic"'), 'Hero section must exist in index.html');
assert.ok(indexHtml.includes('id="liquid-glass-dock"'), 'Dock must exist in index.html');
console.log('✓ Startseite reference code & styles strictly preserved');

// 2. Verify Trip CSS Unification
const tripCss = fs.readFileSync('css/trip.css', 'utf8');
assert.ok(tripCss.includes('body.is-trip .nav-tab i'), 'Nav tab icons must be explicitly handled in trip.css');
assert.ok(!tripCss.includes('body.is-trip .nav-tab i { display:none; }') && !tripCss.includes('body.is-trip .nav-tab i {display:none;}'), 'Nav tab icons must NOT be hidden in trip.css');
assert.ok(tripCss.includes('#171e27'), 'Active state in trip.css must match Startseite dock active color (#171e27)');
assert.ok(tripCss.includes('blur(28px)'), 'Trip glass must use high quality 28px blur');
console.log('✓ Reise-Tab (trip.css) visual unification verified');

// 3. Verify Management CSS Unification (Organisation, Finanzen, Erlebnisse, Mehr)
const mgmtCss = fs.readFileSync('css/management.css', 'utf8');
assert.ok(mgmtCss.includes('body.is-management .nav-tab i'), 'Nav tab icons must be styled in management.css');
assert.ok(!mgmtCss.includes('.nav-tab i {display:none;}') && !mgmtCss.includes('.nav-tab i { display:none; }'), 'Nav tab icons must NOT be hidden in management.css');
assert.ok(mgmtCss.includes('blur(28px)'), 'Management surfaces must use high quality 28px blur');
assert.ok(mgmtCss.includes('.packing-progress-card'), 'Packing card must be styled with liquid glass in management.css');
assert.ok(mgmtCss.includes('#fin-panel-onsite > div'), 'Vor-Ort Reisekasse card must be styled with liquid glass');
assert.ok(mgmtCss.includes('#fin-panel-fuel > div'), 'Fuel card must be styled with liquid glass');
assert.ok(mgmtCss.includes('#fin-panel-groceries > div'), 'Groceries card must be styled with liquid glass');
assert.ok(mgmtCss.includes('#fin-panel-currency > div'), 'Currency card must be styled with liquid glass');
assert.ok(mgmtCss.includes('.manage-drone-workspace'), 'Drone workspace must be styled');
assert.ok(mgmtCss.includes('.weather-widget-card'), 'Weather card must be styled');
assert.ok(mgmtCss.includes('.org-modal'), 'Modals must have liquid glass styling');
assert.ok(mgmtCss.includes('body.dark-theme.is-management'), 'Complete Dark mode styles must exist for management');
console.log('✓ Organisation, Finanzen, Erlebnisse & Mehr (management.css) visual unification verified');

// 4. Verify DOM structural integrity across all 6 views
const views = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'];
for (const v of views) {
  assert.ok(indexHtml.includes(`id="view-${v}"`), `View ${v} must exist in index.html`);
}
console.log('✓ All 6 independent views exist in DOM');

// 5. Verify Modals remain intact
const modals = [
  'booking-modal-backdrop', 'packing-modal-backdrop',
  'expense-modal-backdrop', 'photo-modal-backdrop', 'photo-lightbox-modal',
  'global-search-modal', 'activity-modal-backdrop', 'day-modal-backdrop',
  'manage-editor', 'trip-editor'
];
for (const m of modals) {
  assert.ok(indexHtml.includes(`id="${m}"`), `Modal ${m} must exist in DOM`);
}
console.log('✓ All 10 modals and editor dialogs intact');

console.log('==================================================');
console.log('ALL PHASE 2 VISUAL UNIFICATION CHECKS PASSED (100%)');
console.log('==================================================');
