import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Hash routing of the shell: project-prefix hosting, reload and back navigation, PWA shortcuts, server-free bootstrap.
const listeners = {}, location = {protocol: 'https:', pathname: '/Australien-Reiseplan/', hash: ''};
const noop = () => {};
const element = () => ({classList: {toggle: noop, add: noop, remove: noop}, setAttribute: noop, removeAttribute: noop, addEventListener: noop, dataset: {}});
const window = {location, navigator: {onLine: true}, scrollTo: noop, addEventListener(name, cb) { listeners[name] = cb; }};
window.document = {title: '', body: element(), querySelectorAll: () => [], getElementById: () => null};
const ctx = vm.createContext({window, console, setInterval: noop, URL});
vm.runInContext(fs.readFileSync('js/shell.js', 'utf8'), ctx);
for (const [hash, view] of [['', 'dashboard'], ['#dashboard', 'dashboard'], ['#reise', 'reise'], ['#reise/tag-3', 'reise'], ['#tag-3', 'reise'], ['#day-12', 'reise'], ['#unbekannt', 'dashboard']]) {
  location.hash = hash;
  listeners.hashchange();
  assert.equal(window.document.title, view === 'reise' ? 'Reiseplan und Karte, Australien 2027' : 'Australien 2027', 'hash ' + hash);
}
window.showView('reise');
assert.equal(location.hash, '#reise');
assert.equal(location.pathname, '/Australien-Reiseplan/');
window.showView('dashboard');
assert.equal(location.hash, '#dashboard');
const manifest = JSON.parse(fs.readFileSync('manifest.json'));
assert.ok(manifest.shortcuts.length >= 1);
for (const shortcut of manifest.shortcuts) assert.match(shortcut.url, /^\.\/#(?:reise|dashboard)/);
assert.equal(manifest.id, './');
const html = fs.readFileSync('index.html', 'utf8');
assert.doesNotMatch(html, /id="security-gate"|onclick="lockApp/);
assert.doesNotMatch(fs.readFileSync('js/shell.js', 'utf8'), /fetch\(/);
console.log('GitHub Pages: project-prefix hash navigation, reload/back state, PWA shortcuts and server-free bootstrap passed.');
