import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source = fs.readFileSync('js/app.js', 'utf8');
function node(id, view) {
  const classes = new Set();
  return {id, style: {}, attrs: {}, classList: {
    contains: x => classes.has(x), add: x => classes.add(x), remove: x => classes.delete(x),
    toggle(x, force) { const value = force ?? !classes.has(x); if (value) classes.add(x); else classes.delete(x); return value; }
  }, getAttribute: k => k === 'data-view' ? view : null,
  setAttribute(k, v) { this.attrs[k] = v; }, scrollIntoView() {}};
}
const routes = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'];
const views = routes.map(r => node('view-' + r));
const desktop = routes.map(r => node('desktop-' + r, r));
const mobile = routes.filter(r => r !== 'erlebnisse').map(r => { const n = node('mobile-' + r, r); n.classList.add('bottom-nav-item'); return n; });
const dock = routes.slice(1, 5).map(r => node('dock-' + r, r));
const nodes = Object.fromEntries([...views, node('theme-toggle-btn'), node('organization'), node('journal')].map(n => [n.id, n]));
const body = node('body'), html = node('html'), location = {pathname: '/Australien-Reiseplan/', hash: ''};
const data = new Map(); let blocked = false; const calls = [];
const rawStorage = {getItem: k => { if (blocked) throw Error('blocked'); return data.get(k); }, setItem(k, v) { if (blocked) throw Error('blocked'); data.set(k, v); }};
const document = {body, documentElement: html, title: '', getElementById: id => nodes[id] || null,
  querySelectorAll(selector) { if (selector === '.app-view') return views; if (selector.startsWith('.desktop-nav')) return selector.includes('mobile-bottom-nav') ? [...desktop, ...mobile, ...dock] : [...desktop, ...dock]; if (selector.startsWith('.mobile-bottom-nav')) return mobile; return []; }};
const window = {location, localStorage: rawStorage, history: {pushState(state, title, hash) { location.hash = hash; }}, dispatchEvent() {}, scrollTo() {}};
const ctx = vm.createContext({document, window, history: window.history, console: {warn() {}}, CustomEvent: class {}, setTimeout() {},
  ensureRouteMapReady() {}, renderBookings() {}, renderPackingList() {}, renderJournalDays() {}, renderPhotosGallery() {},
  switchExpTab: key => calls.push(['exp', key]), switchJournalTab: key => calls.push(['journal', key]), selectJournalDay: day => calls.push(['day', day]),
  switchOrgTab: key => calls.push(['org', key]), filterPackingByCategory: key => calls.push(['packing', key])});
vm.runInContext(fs.readFileSync('js/router.js', 'utf8'), ctx); window.Router = ctx.Router;
vm.runInContext(source.slice(source.indexOf('    function updateThemeUI('), source.indexOf('    // =========================================================================', source.indexOf('    function initTheme('))), ctx);
vm.runInContext(source.slice(source.indexOf('function showView(viewName'), source.indexOf('// Enhance jumpToDay')), ctx);
for (const name of ['openPackingList', 'openBookingsForDay', 'jumpToJournalDay']) {
 const start = source.indexOf('    function ' + name + '('); const end = source.indexOf('\n    function ', start + 1);
 vm.runInContext(source.slice(start, end), ctx);
}
ctx.initTheme(); assert.equal(html.attrs['data-theme'], 'light');
ctx.toggleDarkMode(); assert.equal(data.get('aus_theme'), 'dark'); assert.equal(nodes['theme-toggle-btn'].attrs['aria-pressed'], 'true');
body.classList.remove('dark-theme'); ctx.initTheme(); assert.ok(body.classList.contains('dark-theme'));
blocked = true; ctx.toggleDarkMode(); assert.equal(html.attrs['data-theme'], 'light'); ctx.initTheme(); blocked = false;
for (const route of routes) {
 ctx.Router.navigate('dashboard'); ctx.showView(route, true);
 assert.equal(ctx.Router.getCurrentRoute(), route);
 assert.equal(views.filter(v => v.style.display === 'block').length, 1);
 assert.equal(views.find(v => v.style.display === 'block').id, 'view-' + route);
 assert.equal(desktop.filter(n => n.classList.contains('active'))[0].getAttribute('data-view'), route);
 assert.equal(mobile.filter(n => n.classList.contains('active'))[0].getAttribute('data-view'), route === 'erlebnisse' ? 'mehr' : route);
}
ctx.Router.navigate('organisation', {sub: 'packing'}); ctx.showView('organisation'); assert.equal(location.hash, '#organisation/packing');
ctx.Router.navigate('dashboard'); ctx.openPackingList('docs'); assert.equal(ctx.Router.getCurrentRoute(), 'organisation'); assert.deepEqual(calls.at(-1), ['packing', 'docs']);
ctx.Router.navigate('dashboard'); ctx.openBookingsForDay(2); assert.equal(ctx.Router.getCurrentRoute(), 'organisation');
ctx.Router.navigate('dashboard'); ctx.jumpToJournalDay(4); assert.equal(ctx.Router.getCurrentRoute(), 'erlebnisse'); assert.deepEqual(calls.slice(-2), [['exp', 'journal'], ['day', 4]]);
ctx.showView('dashboard'); assert.equal(dock.filter(n => n.classList.contains('active')).length, 0);
console.log('Phase 1: actual theme handlers, blocked storage, view visibility, active navigation, subroute preservation and search helpers passed.');
