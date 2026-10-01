import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// Architecture guard: visual surfaces must have a single owner.
const system = fs.readFileSync('css/design-system.css', 'utf8');
for (const name of ['glass-container', 'glass-card', 'glass-row-item', 'glass-pill']) {
  assert.match(system, new RegExp('\\.' + name + ' \\{'));
}
for (const file of ['app', 'hero-dock', 'trip', 'management']) {
  const source = fs.readFileSync('css/' + file + '.css', 'utf8');
  assert.ok(source.startsWith('@layer legacy {'));
  assert.doesNotMatch(source, /--glass-[\w-]+\s*:/, file + ' redefines a design token');
  assert.doesNotMatch(source, /\bbox-shadow\s*:/, file + ' reintroduces a local shadow');
  assert.doesNotMatch(source, /\.packing-[\w-]+/, file + ' reintroduces packing skins');
}
const html = fs.readFileSync('index.html', 'utf8');
assert.ok(html.includes('css/design-system.css'));
for (const id of ['hero-cinematic', 'trip-workspace', 'organization']) {
  const element = html.match(new RegExp('<[^>]*id="' + id + '"[^>]*>'))?.[0];
  assert.ok(element?.includes('glass-container'), id + ' must use the shared page surface');
}

// Exercise actual packing filtering/rendering, rather than checking stylesheet strings alone.
const nodes = Object.fromEntries(['org-packing-list-container', 'org-packing-chips-container',
  'org-packing-progress-fill', 'org-packing-pct-text', 'org-badge-packing-progress', 'org-packing-status-badge']
  .map(id => [id, {innerHTML: '', style: {}, parentElement: {setAttribute() {}}}]));
let saved = 0;
const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
const context = vm.createContext({window: {}, console, Intl, document: {getElementById: id => nodes[id] || null, addEventListener() {}},
  escapeHtml: escape, saveUserPacking() { saved++; return true; },
  PACKING_CATEGORIES: [{key: 'docs', label: 'Dokumente', icon: 'fa-passport'}, {key: 'tech', label: 'Technik', icon: 'fa-plug'}],
  userPacking: [{id: 'a', name: 'Reisepass', category: 'docs', quantity: '4x', note: '<Notiz>', packed: false},
    {id: 'b', name: 'Adapter', category: 'tech', quantity: '2x', packed: true}],
  currentPackingQuery: '', currentPackingCatFilter: 'all', currentPackingStatus: 'all'});
context.window.TripModel = {escape, dateLabel: value => value};
context.window.ManagementModel = {STATUS: {confirmed: 'Bestätigt'}, EXP_STATUS: {paid: 'Bezahlt'}, BOOKING_TYPES: {flight: 'Flug'}};
vm.runInContext(fs.readFileSync('js/management/ui.js', 'utf8'), context);
const source = fs.readFileSync('js/app.js', 'utf8');
vm.runInContext(source.slice(source.indexOf('    function getFilteredPackingItems()'), source.indexOf('    function filterPackingByCategory(')), context);
context.renderPackingList();
assert.equal((nodes['org-packing-list-container'].innerHTML.match(/class="glass-row-item"/g) || []).length, 2);
assert.ok(nodes['org-packing-list-container'].innerHTML.includes('&lt;Notiz>'));
assert.ok(nodes['org-packing-list-container'].innerHTML.includes('class="glass-switch"'));
context.currentPackingQuery = 'adapter'; context.renderPackingList(true);
assert.ok(!nodes['org-packing-list-container'].innerHTML.includes('Reisepass'));
assert.ok(nodes['org-packing-list-container'].innerHTML.includes('Adapter'));
context.currentPackingStatus = 'open'; context.renderPackingList();
assert.ok(nodes['org-packing-list-container'].innerHTML.includes('Keine passenden Einträge.'));
context.currentPackingQuery = ''; context.currentPackingStatus = 'all'; context.currentPackingCatFilter = 'docs';
assert.equal(context.getFilteredPackingItems().length, 1);
context.togglePackingItem('a', true);
assert.equal(saved, 1); assert.equal(context.userPacking[0].packed, true);
assert.equal(nodes['org-packing-pct-text'].textContent, '2 / 2 (100%)');
const booking = context.window.ManagementUI.list('booking', [{id:'flight',title:'Flug',type:'flight',date:'2027-03-21',price:100,status:'confirmed',currency:'EUR'}], {trip:{getDays:()=>[]}});
assert.ok(booking.includes('class="glass-row-item"'));
for (const name of ['glass-row-main', 'glass-row-icon', 'glass-row-copy', 'glass-row-tail']) {
  assert.ok(booking.includes('class="' + name + '"'));
  assert.ok(nodes['org-packing-list-container'].innerHTML.includes('class="' + name + '"'));
}
console.log('Shared design: one surface/token/shadow owner; common booking/packing rows; packing search, category/status filters, escaping, switches and persistence passed.');
