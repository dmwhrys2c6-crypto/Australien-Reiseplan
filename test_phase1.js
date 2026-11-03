import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
// Shell views: exactly one active view, matching nav state, body classes and history behaviour.
function node(id, view) {
  const classes = new Set(), attrs = {};
  return {id, dataset: view ? {view} : {}, attrs, classList: {
    contains: x => classes.has(x), add: x => classes.add(x), remove: x => classes.delete(x),
    toggle(x, force) { const value = force ?? !classes.has(x); if (value) classes.add(x); else classes.delete(x); return value; }
  }, setAttribute(k, v) { attrs[k] = v; }, removeAttribute(k) { delete attrs[k]; }, addEventListener() {}};
}
const views = [node('view-dashboard'), node('view-reise')];
const links = [node('nav-dashboard', 'dashboard'), node('nav-reise', 'reise')];
const body = node('body'), location = {pathname: '/Australien-Reiseplan/', hash: ''};
const scrolls = [];
const window = {location, navigator: {onLine: true}, scrollTo: (...args) => scrolls.push(args), addEventListener() {}};
window.document = {title: '', body, getElementById: () => null, querySelectorAll: selector => selector === '.app-view' ? views : selector === '.app-nav .nav-link' ? links : []};
const ctx = vm.createContext({window, console, setInterval() {}, URL});
vm.runInContext(fs.readFileSync('js/shell.js', 'utf8'), ctx);
for (const route of ['reise', 'dashboard', 'reise']) {
  window.showView(route, true);
  assert.equal(views.filter(v => v.classList.contains('active')).length, 1);
  assert.equal(views.find(v => v.classList.contains('active')).id, 'view-' + route);
  assert.equal(links.find(l => l.attrs['aria-current'] === 'page').dataset.view, route);
  assert.equal(body.classList.contains('is-home'), route === 'dashboard');
  assert.equal(body.classList.contains('is-trip'), route === 'reise');
}
location.hash = '#reise'; window.showView('reise'); assert.equal(location.hash, '#reise');
window.showView('mehr', true);
assert.equal(views.find(v => v.classList.contains('active')).id, 'view-dashboard', 'unknown views fall back to the start page');
console.log('Phase 1: view visibility, active navigation, body state and history handling passed.');
