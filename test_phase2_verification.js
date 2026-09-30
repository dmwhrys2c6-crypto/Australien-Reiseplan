import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== PHASE 2 NAVIGATION & SEITENSTRUKTUR VERIFICATION ===\n');

const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// 1. Verify Desktop Navigation items
console.log('1. Checking Desktop Navigation:');
const expectedDesktopTabs = [
  { view: 'dashboard', label: 'Dashboard' },
  { view: 'reise', label: 'Reise' },
  { view: 'organisation', label: 'Organisation' },
  { view: 'finanzen', label: 'Finanzen' },
  { view: 'erlebnisse', label: 'Erlebnisse' },
  { view: 'mehr', label: 'Mehr' }
];

for (const tab of expectedDesktopTabs) {
  const regex = new RegExp(`<button[^>]*class="[^"]*nav-tab[^"]*"[^>]*data-view="${tab.view}"[^>]*>[\\s\\S]*?<span>${tab.label}</span>`, 'i');
  if (regex.test(html)) {
    console.log(`  ✓ Desktop Tab '${tab.label}' (${tab.view}) present`);
  } else {
    console.error(`  ❌ Desktop Tab '${tab.label}' (${tab.view}) missing!`);
    process.exit(1);
  }
}

// 2. Verify Mobile Navigation items (Exactly 5: Home, Reise, Organisation, Finanzen, Mehr)
console.log('\n2. Checking Mobile Bottom Navigation:');
const expectedMobileItems = [
  { view: 'dashboard', label: 'Home' },
  { view: 'reise', label: 'Reise' },
  { view: 'organisation', label: 'Organisation' },
  { view: 'finanzen', label: 'Finanzen' },
  { view: 'mehr', label: 'Mehr' }
];

const mobileNavMatch = html.match(/<nav\s+class="mobile-bottom-nav"[^>]*>([\s\S]*?)<\/nav>/);
if (!mobileNavMatch) {
  console.error('  ❌ <nav class="mobile-bottom-nav"> missing!');
  process.exit(1);
}
const mobileNavHtml = mobileNavMatch[1];
const mobileButtons = [...mobileNavHtml.matchAll(/<button[^>]*data-view="([^"]+)"[^>]*>[\s\S]*?<span>([^<]+)<\/span>/g)];

console.log(`  ✓ Found ${mobileButtons.length} mobile navigation buttons (expected: 5)`);
if (mobileButtons.length !== 5) {
  console.error(`  ❌ Expected 5 mobile nav buttons, but found ${mobileButtons.length}`);
  process.exit(1);
}

expectedMobileItems.forEach((expected, idx) => {
  const actual = mobileButtons[idx];
  if (actual && actual[1] === expected.view && actual[2].trim() === expected.label) {
    console.log(`  ✓ Mobile Item ${idx + 1}: ${actual[2].trim()} (${actual[1]})`);
  } else {
    console.error(`  ❌ Mobile Item ${idx + 1} mismatch: expected ${expected.label} (${expected.view}), got ${actual ? actual[2].trim() + ' (' + actual[1] + ')' : 'none'}`);
    process.exit(1);
  }
});

// 3. Verify Organisation Categories
console.log('\n3. Checking Organisation Categories:');
const expectedOrgCats = ['flights', 'hotels', 'car', 'activities', 'packing', 'bookings'];
for (const cat of expectedOrgCats) {
  const regex = new RegExp(`data-org-cat="${cat}"`, 'i');
  if (regex.test(html)) {
    console.log(`  ✓ Organisation Category '${cat}' present`);
  } else {
    console.error(`  ❌ Organisation Category '${cat}' missing!`);
    process.exit(1);
  }
}

// 4. Verify Erlebnisse Categories & Subnav
console.log('\n4. Checking Erlebnisse Categories:');
const expectedExpTabs = ['journal', 'photos', 'bucketlist', 'wildlife', 'taste'];
for (const tab of expectedExpTabs) {
  if (html.includes(`data-tab="${tab}"`) && html.includes(`id="exp-panel-${tab}"`)) {
    console.log(`  ✓ Erlebnisse Tab & Panel '${tab}' present`);
  } else {
    console.error(`  ❌ Erlebnisse Tab or Panel '${tab}' missing!`);
    process.exit(1);
  }
}

// 5. Verify Finanzen Categories & Subnav
console.log('\n5. Checking Finanzen Categories:');
const expectedFinTabs = ['overview', 'expenses', 'onsite', 'splitwise', 'fuel', 'groceries', 'currency'];
for (const tab of expectedFinTabs) {
  if (html.includes(`data-tab="${tab}"`) && html.includes(`id="fin-panel-${tab}"`)) {
    console.log(`  ✓ Finanzen Tab & Panel '${tab}' present`);
  } else {
    console.error(`  ❌ Finanzen Tab or Panel '${tab}' missing!`);
    process.exit(1);
  }
}

// 6. Verify Mehr Categories & Subnav
console.log('\n6. Checking Mehr Categories:');
const expectedMoreTabs = ['drone', 'weather', 'emergency', 'playlist', 'tools'];
for (const tab of expectedMoreTabs) {
  if (html.includes(`data-tab="${tab}"`) && html.includes(`id="more-panel-${tab}"`)) {
    console.log(`  ✓ Mehr Tab & Panel '${tab}' present`);
  } else {
    console.error(`  ❌ Mehr Tab or Panel '${tab}' missing!`);
    process.exit(1);
  }
}

// 7. Verify All 6 Views Exist
console.log('\n7. Checking All 6 View Containers:');
const views = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'];
for (const v of views) {
  if (html.includes(`id="view-${v}"`)) {
    console.log(`  ✓ #view-${v} exists`);
  } else {
    console.error(`  ❌ #view-${v} missing!`);
    process.exit(1);
  }
}

console.log('\n==============================================');
console.log('ALL PHASE 2 VERIFICATIONS PASSED WITH 100% SUCCESS!');
console.log('==============================================');
