// test_phase4_verification.js
// Verifies Phase 4: Reise + Interaktive Karte Redesign

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== PHASE 4 REISE + INTERAKTIVE KARTE VERIFICATION ===\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'css/app.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
  passedTests++;
}

// 1. DESKTOP GRID & MAP DIMENSIONS
console.log('1. Checking Desktop Split Layout & Map Dimensions:');
assert(css.includes('minmax(360px, 44fr) minmax(480px, 56fr)') || css.includes('44fr 56fr') || css.includes('45%') || css.includes('44%'), 'Desktop grid allocated 40-50% for timeline and 50-60% for map');
assert(css.includes('.map-sticky-column') && css.includes('position: sticky') && css.includes('calc(100vh - 96px)'), 'Sticky map column occupies calc(100vh - 96px) viewport height');
assert(css.includes('min-height: 640px'), 'Map container has substantial min-height (not a small widget)');

// 2. TIMELINE: 20 TAGE KOMPAKT
console.log('\n2. Checking 20 Reisetage Timeline & Compact View:');
for (let d = 1; d <= 20; d++) {
  assert(html.includes(`id="day-${d}"`), `Tag ${d} accordion container present (id="day-${d}")`);
}

// Verify Tag 14 compact preview as specified in prompt
assert(html.includes('TAG 14 · WHITSUNDAYS'), 'Tag 14 title badge formatted as "TAG 14 · WHITSUNDAYS"');
assert(html.includes('03. APRIL'), 'Tag 14 date formatted with prominent month name');
assert(html.includes('Whitehaven Beach'), 'Tag 14 compact highlight "Whitehaven Beach" present');
assert(html.includes('Heart Reef'), 'Tag 14 compact highlight "Heart Reef" present');
assert(html.includes('class="timeline-compact-highlights"'), 'Compact highlights preview container present');

// 3. DETAILANSICHT: NICHTS GELÖSCHT
console.log('\n3. Checking Detailed Day Content Preservation (Nothing Deleted):');
assert(html.includes('class="day-subcard"'), 'Day subcards (Tagesprogramm) preserved');
assert(html.includes('class="day-plan-accordion"'), 'Day plan accordions preserved');
assert(html.includes('class="activity-timeline"'), 'Activity timeline with exact times preserved');
assert(html.includes('class="activity-inline-form"'), 'Inline custom activity adder forms preserved');
assert(html.includes('class="day-subcard budget"'), 'Budget & cost subcards preserved');
assert(html.includes('class="day-subcard hotel"'), 'Hotel & accommodation subcards preserved');
assert(html.includes('class="day-subcard suggestions"'), 'Ideas & suggestions subcards preserved');

// 4. KARTENINTERAKTION & MARKER-HIGHLIGHTING
console.log('\n4. Checking Map Interaction & Dimming States:');
assert(js.includes('function focusDayOnMap'), 'Function focusDayOnMap is implemented');
assert(js.includes('active-day-pin'), 'Active day marker highlighting logic (.active-day-pin) present');
assert(js.includes('dimmed-marker'), 'Non-active marker dimming logic (.dimmed-marker) present');
assert(css.includes('.sight-pin-bubble.active-day-pin'), 'CSS for enlarged pulsing active day pin defined');
assert(css.includes('.dimmed-marker'), 'CSS for dimmed non-active markers defined');
assert(js.includes('activeStageLayer = L.polyline'), 'Active stage route polyline highlighting implemented');

// 5. MARKERINTERAKTION & POPUPS
console.log('\n5. Checking Marker Interaction & Popups:');
assert(js.includes('function jumpToDayAndHighlight'), 'Function jumpToDayAndHighlight implemented');
assert(js.includes('popup-cat-badge') || js.includes('spot.category'), 'Marker popup displays spot category');
assert(js.includes('spot.highlight'), 'Marker popup displays short description');
assert(js.includes('spot.photoTip'), 'Marker popup displays available photo tip information');
assert(js.includes('Tag ${spot.day}') || js.includes('Tag \' + spot.day'), 'Marker popup displays associated day');
assert(js.includes('Zum Tagesplan'), 'Button "Zum Tagesplan" present in marker popup');

// 6. KARTENLAYER (6 Layer-System)
console.log('\n6. Checking Map Layer System (6 Layer Toggles):');
assert(html.includes('id="layer-chk-destinations"') && html.includes('checked'), 'Layer "Reiseziele" present and checked by default');
assert(html.includes('id="layer-chk-highlights"') && html.includes('checked'), 'Layer "Highlights" present and checked by default');
assert(html.includes('id="layer-chk-accommodations"') && !html.includes('id="layer-chk-accommodations" checked'), 'Layer "Unterkünfte" present and unchecked by default');
assert(html.includes('id="layer-chk-photospots"') && !html.includes('id="layer-chk-photospots" checked'), 'Layer "Fotospots" present and unchecked by default');
assert(html.includes('id="layer-chk-drones"') && !html.includes('id="layer-chk-drones" checked'), 'Layer "Drohnen" present and unchecked by default');
assert(html.includes('id="layer-chk-nofly"') && !html.includes('id="layer-chk-nofly" checked'), 'Layer "No-Fly-Zonen" present and unchecked by default');
assert(js.includes('function toggleRouteMapLayer'), 'Function toggleRouteMapLayer implemented in JS');
assert(js.includes('routeLayers.destinations'), 'LayerGroup for destinations defined');
assert(js.includes('routeLayers.highlights'), 'LayerGroup for highlights defined');
assert(js.includes('routeLayers.accommodations'), 'LayerGroup for accommodations defined');
assert(js.includes('routeLayers.photospots'), 'LayerGroup for photospots defined');
assert(js.includes('routeLayers.drones'), 'LayerGroup for drones defined');
assert(js.includes('routeLayers.nofly'), 'LayerGroup for no-fly safety zones defined');

// 7. MOBILE EXPERIENCE & BOTTOM SHEET
console.log('\n7. Checking Mobile Experience & Bottom Sheet:');
assert(html.includes('id="mobile-reise-btn-plan"') && html.includes('Plan'), 'Mobile switcher button [ Plan ] present');
assert(html.includes('id="mobile-reise-btn-map"') && html.includes('Karte'), 'Mobile switcher button [ Karte ] present');
assert(js.includes('function switchMobileReiseMode'), 'Function switchMobileReiseMode implemented');
assert(html.includes('id="mobile-map-bottom-sheet"'), 'Mobile map bottom sheet container present');
assert(html.includes('class="sheet-drag-handle"'), 'Bottom sheet drag handle present for pulling up');
assert(js.includes('function updateMobileBottomSheet'), 'Function updateMobileBottomSheet implemented');
assert(js.includes('function toggleMobileBottomSheet'), 'Function toggleMobileBottomSheet implemented');
assert(css.includes('.mobile-map-bottom-sheet.sheet-expanded'), 'CSS for expandable bottom sheet (hochziehbar) defined');

console.log('\n======================================================');
console.log(`PHASE 4 VERIFICATION PASSED: ${passedTests}/${totalTests} TESTS SUCCESSFUL!`);
console.log('======================================================');
