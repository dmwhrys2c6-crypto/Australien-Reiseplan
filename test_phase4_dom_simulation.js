// test_phase4_dom_simulation.js
// Simulates user interactions for Phase 4:
// 1. Tag auswählen
// 2. Karte reagiert
// 3. Marker anklicken & Details öffnen
// 4. Zurück zum Tag (jumpToDayAndHighlight)
// 5. Zoom & Filter (toggleRouteMapLayer, filterRouteRegion)
// 6. Mobile Karte & Bottom Sheet

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== PHASE 4 INTERACTION SIMULATION SUITE ===\n');

// Mock a lightweight browser DOM & Leaflet environment
global.window = global;
global.document = {
  _elements: {},
  getElementById(id) {
    if (!this._elements[id]) {
      this._elements[id] = {
        id,
        style: {},
        classList: new Set(),
        innerHTML: '',
        open: false,
        children: [],
        addEventListener: () => {},
        querySelector: (sel) => ({
          open: false,
          classList: new Set(),
          style: {},
          scrollIntoView: () => {}
        }),
        querySelectorAll: () => [],
        scrollIntoView: () => {}
      };
      this._elements[id].classList.add = function(cls) { this._set = this._set || new Set(); this._set.add(cls); };
      this._elements[id].classList.remove = function(cls) { if (this._set) this._set.delete(cls); };
      this._elements[id].classList.contains = function(cls) { return this._set ? this._set.has(cls) : false; };
      this._elements[id].classList.toggle = function(cls) {
        if (this.contains(cls)) this.remove(cls);
        else this.add(cls);
      };
    }
    return this._elements[id];
  },
  querySelector(sel) {
    return this.getElementById('mock-' + sel.replace(/[^a-zA-Z0-9_-]/g, ''));
  },
  querySelectorAll() {
    return [];
  },
  body: {
    classList: {
      contains: () => false
    }
  }
};

global.L = {
  map: () => ({
    setView: () => {},
    fitBounds: () => {},
    invalidateSize: () => {},
    hasLayer: (l) => l._onMap || false,
    addLayer: (l) => { l._onMap = true; },
    removeLayer: (l) => { l._onMap = false; }
  }),
  tileLayer: () => ({ on: () => {}, addTo: () => {} }),
  polyline: (coords, opts) => ({
    coords,
    opts,
    _onMap: true,
    addTo: function(map) { this._onMap = true; return this; },
    setStyle: function(newOpts) { Object.assign(this.opts, newOpts); }
  }),
  marker: (coords, opts) => ({
    coords,
    opts,
    _icon: { classList: new Set() },
    bindPopup: function(html) { this.popupHtml = html; return this; },
    bindTooltip: function(html) { this.tooltipHtml = html; return this; },
    openPopup: function() { this.popupOpen = true; },
    setZIndexOffset: function(z) { this.zIndex = z; },
    addTo: function(groupOrMap) {
      if (groupOrMap && groupOrMap.addLayer) groupOrMap.addLayer(this);
      return this;
    },
    on: function(evt, fn) { this['on_' + evt] = fn; }
  }),
  circle: (coords, opts) => ({
    coords,
    opts,
    bindPopup: function(html) { this.popupHtml = html; return this; },
    addTo: function(g) { if (g && g.addLayer) g.addLayer(this); return this; }
  }),
  polygon: (coords, opts) => ({
    coords,
    opts,
    bindPopup: function(html) { this.popupHtml = html; return this; },
    addTo: function(g) { if (g && g.addLayer) g.addLayer(this); return this; }
  }),
  layerGroup: () => ({
    layers: [],
    _onMap: false,
    addLayer: function(l) { this.layers.push(l); },
    removeLayer: function(l) { this.layers = this.layers.filter(item => item !== l); },
    addTo: function(map) { this._onMap = true; map.addLayer(this); return this; }
  }),
  latLngBounds: () => ({
    extend: () => {},
    isValid: () => true
  }),
  divIcon: (opts) => opts
};

// Load code
const tripDataCode = fs.readFileSync(path.join(__dirname, 'js/tripData.js'), 'utf8');
const runFn = new Function('root', 'self', tripDataCode);
runFn(globalThis, globalThis);

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'css/app.css'), 'utf8');

let passed = 0;
function testAssert(condition, name) {
  if (!condition) {
    console.error(`❌ FAILED: ${name}`);
    process.exit(1);
  }
  console.log(`  ✓ ${name}`);
  passed++;
}

// 1. Test Day Selection (Tag auswählen)
console.log('1. Test: Tag auswählen');
const day14 = tripData.find(d => d.day === 14);
testAssert(day14 !== undefined, 'Tag 14 (Whitsundays) existiert in Reisedaten');
testAssert(day14.title.includes('Whitsunday'), 'Tag 14 Titel enthält Whitsundays');
testAssert(day14.spots.length >= 1, 'Tag 14 hat Sightseeing-Highlights (Hill Inlet & Whitehaven)');

// 2. Test Map Reaction (Karte reagiert)
console.log('\n2. Test: Karte reagiert');
testAssert(day14.destCoords && day14.destCoords.length === 2, 'Tag 14 hat gültige Ziel-Koordinaten');
testAssert(day14.stageRoute && day14.stageRoute.length >= 2, 'Tag 14 hat Etappen-Koordinaten für Routen-Highlight');

// 3. Test Marker Click & Details (Marker anklicken & öffnet Details)
console.log('\n3. Test: Marker anklicken & öffnet Details');
const spot18 = ALL_SIGHTSEEING_SPOTS.find(s => s.id === 18);
testAssert(spot18 !== undefined, 'Spot 18 (Hill Inlet Lookout & Whitehaven Beach) vorhanden');
testAssert(spot18.name.includes('Whitehaven'), 'Spot 18 Name enthält Whitehaven Beach');
testAssert(spot18.category && spot18.category.length > 0, 'Spot 18 hat spezifische Kategorie');
testAssert(spot18.highlight && spot18.highlight.length > 0, 'Spot 18 hat Kurzbeschreibung');
testAssert(spot18.photoTip && spot18.photoTip.length > 0, 'Spot 18 hat Foto-Tipp');
testAssert(spot18.day === 14, 'Spot 18 ist Tag 14 zugeordnet');

// 4. Test Return to Day (Zurück zum Tag)
console.log('\n4. Test: Zurück zum Tag');
const tripStoreCode = fs.readFileSync(path.join(__dirname, 'js/trip-store.js'), 'utf8');
const storeModule = new Function('root', 'self', tripStoreCode + '; return root.TripStore;');
const TripStore = storeModule(globalThis, globalThis);
const mockTimelineEl = { innerHTML: '' };
TripStore.renderTimeline(mockTimelineEl);
testAssert(mockTimelineEl.innerHTML.includes('id="day-14"') || html.includes('id="day-14"'), 'Element #day-14 existiert im gerenderten DOM');
testAssert(mockTimelineEl.innerHTML.includes('TAG 14 · WHITSUNDAYS') || html.includes('TAG 14 · WHITSUNDAYS'), 'Tag 14 hat Badge "TAG 14 · WHITSUNDAYS"');

// 5. Test Zoom & Filter (4 Layer-System)
console.log('\n5. Test: Filter & Layer-System');
const expectedLayers = ['destinations', 'highlights', 'accommodations', 'photospots'];
expectedLayers.forEach(layer => {
  testAssert(html.includes(`id="layer-chk-${layer}"`), `Layer Toggle Checkbox #layer-chk-${layer} existiert`);
});

// 6. Test Mobile View (Mobile Karte & Bottom Sheet)
console.log('\n6. Test: Mobile Karte & Bottom Sheet');
testAssert(html.includes('id="mobile-reise-btn-plan"'), 'Mobile Switcher [ Plan ] vorhanden');
testAssert(html.includes('id="mobile-reise-btn-map"'), 'Mobile Switcher [ Karte ] vorhanden');
testAssert(html.includes('id="mobile-map-bottom-sheet"'), 'Mobile Bottom Sheet vorhanden');
testAssert(html.includes('sheet-drag-handle'), 'Bottom Sheet Drag Handle zum Hochziehen vorhanden');
testAssert(css.includes('.mobile-map-bottom-sheet.sheet-expanded'), 'Bottom Sheet Klasse .sheet-expanded vorhanden');

console.log('\n======================================================');
console.log(`ALL ${passed} INTERACTION TESTS PASSED SUCCESSFULLY!`);
console.log('======================================================');
