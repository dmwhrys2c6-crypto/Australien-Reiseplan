// test_countdown.js: unit test for window.tripCountdown in js/shell.js
import fs from 'fs';
import vm from 'vm';
import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const noop = () => {};
const element = () => ({ addEventListener: noop, classList: { toggle: noop }, setAttribute: noop, removeAttribute: noop });
const win = {
  document: { getElementById: () => null, querySelectorAll: () => [], body: element(), title: '' },
  location: { hash: '' }, navigator: { onLine: true }, scrollTo: noop, addEventListener: noop, setInterval: noop
};
win.window = win;
vm.runInNewContext(fs.readFileSync(path.join(dir, 'js/shell.js'), 'utf8'), win, { filename: 'js/shell.js' });

const days = Array.from({ length: 21 }, (_, i) => {
  const date = new Date(Date.UTC(2027, 2, 20 + i));
  return { dayNumber: i, date: date.toISOString().slice(0, 10) };
});

let passed = 0;
function expect(actual, expected, label) {
  if (actual !== expected) { console.error(`FAILED: ${label}: got "${actual}", expected "${expected}"`); process.exit(1); }
  console.log(`  ok ${label}`);
  passed++;
}

const c = (today, list = days) => win.tripCountdown(today, list);
expect(c('2026-11-03'), 'Noch 137 Tage', 'long before the trip');
expect(c('2027-03-19'), 'Noch 1 Tag', 'day before');
expect(c('2027-03-20'), 'Tag 0 von 20', 'first day');
expect(c('2027-04-09'), 'Tag 20 von 20', 'last day');
expect(c('2027-04-10'), '', 'after the trip');
expect(c('2027-03-25', []), '', 'empty day list');
expect(c('2027-03-25', days.filter(d => d.dayNumber !== 5)), '', 'gap in the plan');
expect(c('2027-03-28'), 'Tag 8 von 20', 'DST change day');
expect(c('2027-03-29'), 'Tag 9 von 20', 'day after DST change');
console.log(`ALL ${passed} COUNTDOWN CHECKS PASSED`);
