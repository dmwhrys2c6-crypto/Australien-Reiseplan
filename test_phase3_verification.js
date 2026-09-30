// test_phase3_verification.js
// Verifies Phase 3: Dashboard Redesign (Travel-Cockpit)

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== PHASE 3 DASHBOARD REDESIGN VERIFICATION ===\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(__dirname, 'css/app.css'), 'utf8');
const js = fs.readFileSync(path.join(__dirname, 'js/app.js'), 'utf8');

// 1. Extract #view-dashboard content
const startIndex = html.indexOf('id="view-dashboard"');
const endIndex = html.indexOf('id="view-reise"');
if (startIndex === -1 || endIndex === -1) {
  console.error('❌ Could not isolate #view-dashboard!');
  process.exit(1);
}
const dashHtml = html.substring(startIndex, endIndex);

// 2. Verify Section 1 & 2: Header & Clean Countdown
console.log('1. Checking Header & Clean Countdown:');
if (dashHtml.includes('AUSTRALIEN 2027') && dashHtml.includes('21.03.2027 – 09.04.2027')) {
  console.log('  ✓ Clean Header text present: AUSTRALIEN 2027 · 21.03.2027 – 09.04.2027');
} else {
  console.error('  ❌ Header title or dates missing in dashboard!');
  process.exit(1);
}

const countdownIds = ['cd-days', 'cd-hours', 'cd-minutes', 'cd-seconds'];
for (const cid of countdownIds) {
  if (dashHtml.includes(`id="${cid}"`)) {
    console.log(`  ✓ Countdown unit #${cid} present`);
  } else {
    console.error(`  ❌ Countdown unit #${cid} missing in dashboard!`);
    process.exit(1);
  }
}

// Check that oversized hero photograph or oversized hero status banner are removed from dashboard
if (dashHtml.includes('hero-trip-status-widget') || dashHtml.includes('dash-hero-card')) {
  console.error('  ❌ Obsolete oversized hero elements found in dashboard!');
  process.exit(1);
} else {
  console.log('  ✓ Oversized hero elements successfully removed from dashboard');
}

// 3. Verify Section 3: "ALS NÄCHSTES"
console.log('\n2. Checking "ALS NÄCHSTES" Section:');
if (dashHtml.includes('ALS NÄCHSTES')) {
  console.log('  ✓ Prominent "ALS NÄCHSTES" section found');
} else {
  console.error('  ❌ "ALS NÄCHSTES" badge or section missing!');
  process.exit(1);
}

const nextElements = [
  { id: 'cockpit-next-daynum', desc: 'Day counter / badge' },
  { id: 'cockpit-next-title', desc: 'Next stage title' },
  { id: 'cockpit-next-destination', desc: 'Destination info' },
  { id: 'cockpit-next-activities', desc: 'Activities info' },
  { id: 'cockpit-btn-open-day', desc: 'Action button' }
];

for (const el of nextElements) {
  if (dashHtml.includes(`id="${el.id}"`)) {
    console.log(`  ✓ ${el.desc} (#${el.id}) present`);
  } else {
    console.error(`  ❌ ${el.desc} (#${el.id}) missing!`);
    process.exit(1);
  }
}

if (dashHtml.includes('Tagesplan öffnen')) {
  console.log('  ✓ Button "Tagesplan öffnen" present');
} else {
  console.error('  ❌ Button "Tagesplan öffnen" missing!');
  process.exit(1);
}

// 4. Verify Section 4: 4 SCHNELLZUGRIFFE
console.log('\n3. Checking 4 Schnellzugriffe (Quicklinks):');
const expectedCards = [
  { name: 'REISE', action: "showView('reise')" },
  { name: 'ORGANISATION', action: "showView('organisation')" },
  { name: 'FINANZEN', action: "showView('finanzen')" },
  { name: 'ERLEBNISSE', action: "showView('erlebnisse')" }
];

for (const card of expectedCards) {
  if (dashHtml.includes(card.name) && dashHtml.includes(card.action)) {
    console.log(`  ✓ Schnellzugriff '${card.name}' -> ${card.action} verified`);
  } else {
    console.error(`  ❌ Schnellzugriff '${card.name}' missing or incorrect onclick!`);
    process.exit(1);
  }
}

// Verify no more than 4 cockpit quick cards
const quickCardMatches = dashHtml.match(/class="[^"]*cockpit-quick-card[^"]*"/g) || [];
if (quickCardMatches.length === 4) {
  console.log(`  ✓ Exactly 4 quick cards present (found ${quickCardMatches.length})`);
} else {
  console.error(`  ❌ Expected 4 quick cards, but found ${quickCardMatches.length}`);
  process.exit(1);
}

// 5. Verify Relocated Information
console.log('\n4. Checking Relocated Elements (Information preservation):');
const relocatedIds = [
  { id: 'vienna-time', name: 'Wien Uhrzeit' },
  { id: 'aussie-time', name: 'Australien Uhrzeit' },
  { id: 'timezone-select', name: 'Zeitzonen-Auswahl' },
  { id: 'currency-rate-text', name: 'Live Wechselkurs' },
  { id: 'weather-temp-sydney', name: 'Sydney Wetter' },
  { id: 'sim-btn-auto', name: 'Simulations-Controller' }
];

for (const r of relocatedIds) {
  if (html.includes(`id="${r.id}"`)) {
    console.log(`  ✓ Relocated element '${r.name}' (#${r.id}) safely preserved in app`);
  } else {
    console.error(`  ❌ Relocated element '${r.name}' (#${r.id}) missing in DOM!`);
    process.exit(1);
  }
}

// 6. Verify Cockpit CSS Rules
console.log('\n5. Checking Cockpit CSS Design Rules:');
const requiredCssSelectors = [
  '.cockpit-container',
  '.cockpit-header',
  '.cockpit-countdown',
  '.cockpit-next-card',
  '.btn-cockpit-primary',
  '.cockpit-quicklinks-grid',
  '.cockpit-quick-card'
];

for (const sel of requiredCssSelectors) {
  if (css.includes(sel)) {
    console.log(`  ✓ CSS selector '${sel}' present`);
  } else {
    console.error(`  ❌ CSS selector '${sel}' missing in css/app.css!`);
    process.exit(1);
  }
}

console.log('\n==============================================');
console.log('ALL PHASE 3 VERIFICATIONS PASSED WITH 100% SUCCESS!');
console.log('==============================================');
