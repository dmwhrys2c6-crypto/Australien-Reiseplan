#!/usr/bin/env python3
"""
generate_app.py
Comprehensive builder for the Australien Roadtrip 2027 Redesign.
Produces:
- css/app.css
- js/app.js
- index.html
"""

import os
import re

print("Starting complete generation of Australien Roadtrip 2027 Redesign...")

with open("index.html.original", "r", encoding="utf-8") as f:
    orig = f.read()

# -----------------------------------------------------------------------------
# 1. EXTRACT DATA & ELEMENTS
# -----------------------------------------------------------------------------
script_match = re.findall(r"<script(.*?)>([\s\S]*?)</script>", orig, re.I)[-1]
orig_script = script_match[1]

style_match = re.search(r"<style[^>]*>([\s\S]*?)</style>", orig, re.I)
orig_style = style_match.group(1) if style_match else ""

def extract_section(section_id):
    pos = orig.find(f'id="{section_id}"')
    if pos == -1:
        pos = orig.find(f"id='{section_id}'")
    if pos == -1:
        raise ValueError(f"Section {section_id} not found!")
    start = orig.rfind("<section", 0, pos)
    end = orig.find("</section>", pos) + len("</section>")
    return orig[start:end]

def extract_div_by_id(element_id):
    pos = orig.find(f'id="{element_id}"')
    if pos == -1:
        pos = orig.find(f"id='{element_id}'")
    if pos == -1:
        return ""
    start = orig.rfind("<div", 0, pos)
    depth = 0
    curr = start
    while curr < len(orig):
        tag_m = re.search(r"<\/?div[^>]*>", orig[curr:])
        if not tag_m:
            break
        tag = tag_m.group(0)
        tag_pos = curr + tag_m.start()
        if tag.startswith("</div>"):
            depth -= 1
            if depth == 0:
                return orig[start:tag_pos + len(tag)]
        else:
            depth += 1
        curr = tag_pos + len(tag)
    return ""

sec_dashboard = extract_section("dashboard")
sec_map = extract_section("map")
sec_route = extract_section("route")
sec_budget = extract_section("budget")
sec_organization = extract_section("organization")
sec_journal = extract_section("journal")
sec_hub = extract_section("hub")
sec_drone = extract_section("drone-hub")
sec_bucketlist = extract_section("bucketlist")
sec_emergency = extract_section("emergency")
sec_weather = extract_section("weather")
sec_playlist = extract_section("playlist")

modal_gate = extract_div_by_id("security-gate")
modal_offline = extract_div_by_id("offline-status-banner")
modal_trip_status = extract_div_by_id("trip-status-banner")
modal_booking = extract_div_by_id("booking-modal-backdrop")
modal_packing = extract_div_by_id("packing-modal-backdrop")
modal_expense = extract_div_by_id("expense-modal-backdrop")
modal_photo = extract_div_by_id("photo-modal-backdrop")
modal_lightbox = extract_div_by_id("photo-lightbox-modal")
modal_search = extract_div_by_id("global-search-modal")

# -----------------------------------------------------------------------------
# 2. GENERATE CSS (css/app.css)
# -----------------------------------------------------------------------------
new_design_css = """/* =========================================================================
   AUSTRALIEN ROADTRIP 2027 – REDESIGN DESIGN SYSTEM
   Modernes AI-Travel-Cockpit / TripIt-Klarheit & Übersicht
   ========================================================================= */

:root {
  --primary: #006d68;
  --primary-dark: #004b47;
  --primary-light: #e6f4f3;
  --primary-rgb: 0, 109, 104;
  --secondary: #d96b27;
  --secondary-dark: #b85419;
  --secondary-light: #fff3ec;
  --accent-gold: #f5a623;
  --bg-main: #f8fafc;
  --card-bg: #ffffff;
  --card-sub-bg: #f1f5f9;
  --text-main: #0f172a;
  --text-muted: #64748b;
  --border-color: #e2e8f0;
  --nav-bg: rgba(255, 255, 255, 0.92);
  --status-paid: #16a34a;
  --status-paid-bg: #dcfce7;
  --status-open: #ea580c;
  --status-open-bg: #ffedd5;
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02);
  --shadow-md: 0 4px 14px rgba(0, 0, 0, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02);
  --shadow-lg: 0 12px 28px rgba(0, 0, 0, 0.07), 0 4px 10px rgba(0, 0, 0, 0.03);
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  --font-heading: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

body.dark-theme {
  --primary: #14b8a6;
  --primary-dark: #0d9488;
  --primary-light: #134e4a;
  --primary-rgb: 20, 184, 166;
  --secondary: #f97316;
  --secondary-dark: #ea580c;
  --secondary-light: #431407;
  --accent-gold: #fbbf24;
  --bg-main: #090d16;
  --card-bg: #131b2a;
  --card-sub-bg: #1c2638;
  --text-main: #f1f5f9;
  --text-muted: #94a3b8;
  --border-color: #233045;
  --nav-bg: rgba(19, 27, 42, 0.92);
  --status-paid: #4ade80;
  --status-paid-bg: #064e3b;
  --status-open: #fb923c;
  --status-open-bg: #7c2d12;
  --shadow-sm: 0 2px 10px rgba(0, 0, 0, 0.25);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 16px 36px rgba(0, 0, 0, 0.5);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  background-color: var(--bg-main);
  color: var(--text-main);
  line-height: 1.55;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* App Header (Desktop) */
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.header-inner {
  max-width: 1600px;
  margin: 0 auto;
  padding: 0.65rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
  text-decoration: none;
}

.brand-flag {
  font-size: 1.65rem;
  line-height: 1;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: var(--font-heading);
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  color: var(--primary);
  line-height: 1.15;
}

.brand-subtitle {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

/* Desktop Navigation */
.desktop-nav {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.nav-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.95rem;
  border-radius: 9999px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.nav-tab i {
  font-size: 0.95rem;
  transition: transform 0.18s ease;
}

.nav-tab:hover {
  color: var(--text-main);
  background: rgba(var(--primary-rgb), 0.06);
}

.nav-tab:hover i {
  transform: translateY(-1px);
}

.nav-tab.active {
  background: var(--primary);
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 8px rgba(var(--primary-rgb), 0.3);
}

/* Header Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  height: 38px;
  padding: 0 0.75rem;
  border-radius: 9999px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.18s ease;
}

.btn-icon-action:hover {
  color: var(--primary);
  border-color: var(--primary);
  background: var(--card-sub-bg);
}

.btn-icon-action kbd {
  font-family: inherit;
  font-size: 0.7rem;
  padding: 0.15rem 0.35rem;
  background: var(--card-sub-bg);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

/* Mobile Bottom Navigation Bar */
.mobile-bottom-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 64px;
  background: var(--nav-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-color);
  padding: 0 0.5rem;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  justify-content: space-around;
  align-items: center;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.25rem 0;
  transition: all 0.18s ease;
  font-family: var(--font-body);
}

.bottom-nav-item i {
  font-size: 1.15rem;
  margin-bottom: 2px;
  transition: transform 0.18s ease;
}

.bottom-nav-item span {
  font-size: 0.68rem;
  font-weight: 600;
}

.bottom-nav-item:hover,
.bottom-nav-item.active {
  color: var(--primary);
}

.bottom-nav-item.active i {
  transform: translateY(-2px);
}

/* App Main Container */
.app-main {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1.5rem 1.5rem 5rem;
}

/* App Views System */
.app-view {
  display: none;
  opacity: 0;
}

.app-view.active {
  display: block;
  opacity: 1;
  animation: fadeInView 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeInView {
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
}

/* View Section Headers */
.view-header {
  margin-bottom: 1.5rem;
}

.view-header-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-main);
  margin-bottom: 0.25rem;
  letter-spacing: -0.01em;
}

.view-header-subtitle {
  font-size: 0.92rem;
  color: var(--text-muted);
  margin: 0;
}

/* Dashboard Cockpit Cards */
.dash-hero-card {
  background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.08) 0%, rgba(217, 107, 39, 0.08) 100%), var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: 1.75rem 2rem;
  margin-bottom: 1.75rem;
  box-shadow: var(--shadow-sm);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.dash-hero-text h1 {
  font-size: 1.85rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
  letter-spacing: 0.02em;
  color: var(--primary);
}

.dash-hero-dates {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-muted);
}

.dash-next-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.75rem;
}

.dash-next-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.dash-next-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.3rem 0.75rem;
  border-radius: 9999px;
  background: var(--secondary-light);
  color: var(--secondary);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.hub-cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.25rem;
  margin-top: 1.25rem;
  margin-bottom: 2rem;
}

.hub-card-cockpit {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.hub-card-cockpit::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: transparent;
  transition: background 0.2s ease;
}

.hub-card-cockpit:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-md);
  border-color: rgba(var(--primary-rgb), 0.3);
}

.hub-card-cockpit:hover::before {
  background: var(--primary);
}

.hub-card-cockpit .card-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-md);
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  margin-bottom: 0.9rem;
}

.hub-card-cockpit .card-title {
  font-family: var(--font-heading);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-main);
  margin-bottom: 0.3rem;
}

.hub-card-cockpit .card-meta {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 1.2rem;
  flex: 1;
}

.hub-card-cockpit .card-action {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--primary);
}

/* Reise 2-Column Split Layout */
.reise-split-layout {
  display: grid;
  grid-template-columns: minmax(460px, 1.15fr) minmax(440px, 1fr);
  gap: 1.5rem;
  align-items: start;
}

.timeline-column {
  min-width: 0;
}

.map-sticky-column {
  position: sticky;
  top: 76px;
  height: calc(100vh - 96px);
  display: flex;
  flex-direction: column;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.map-sticky-column .route-map-container-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  border: none;
  box-shadow: none;
}

.map-sticky-column #view-leaflet-map {
  flex: 1;
  min-height: 250px;
  height: 100% !important;
}

/* Mobile Segmented Switcher for Reise */
.mobile-reise-switcher {
  display: none;
  margin-bottom: 1rem;
  background: var(--card-sub-bg);
  border: 1px solid var(--border-color);
  border-radius: 9999px;
  padding: 4px;
}

.mobile-switch-btn {
  flex: 1;
  padding: 0.6rem 1rem;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 0.88rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.mobile-switch-btn.active {
  background: var(--card-bg);
  color: var(--text-main);
  box-shadow: var(--shadow-sm);
  font-weight: 700;
}

/* Mobile Map Bottom Sheet */
.mobile-map-bottom-sheet {
  display: none;
  position: fixed;
  bottom: 64px;
  left: 0;
  right: 0;
  background: var(--card-bg);
  border-top: 1px solid var(--border-color);
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.12);
  z-index: 900;
  padding: 0.75rem 1.25rem 1rem;
  transition: transform 0.25s ease;
}

.sheet-drag-handle {
  width: 36px;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  margin: 0 auto 0.75rem;
}

.sheet-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.6rem;
}

.sheet-day-title {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-main);
}

.sheet-spots-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 0.75rem;
  max-height: 80px;
  overflow-y: auto;
}

.spot-sheet-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.6rem;
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  border-radius: 9999px;
  font-size: 0.76rem;
  font-weight: 600;
  cursor: pointer;
}

/* Sub-Navigation Pills (Organisation, Finanzen, Erlebnisse, Mehr) */
.subnav-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-bottom: 1.5rem;
  background: var(--card-bg);
  padding: 0.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}

.subnav-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.9rem;
  border-radius: 9999px;
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-muted);
  font-family: var(--font-body);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.subnav-pill:hover {
  color: var(--text-main);
  background: var(--card-sub-bg);
}

.subnav-pill.active {
  background: var(--primary);
  color: #ffffff !important;
  font-weight: 700;
  box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.25);
}

/* Category Quick-Tiles for Organisation */
.category-quick-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.5rem;
}

.category-quick-tile {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0.9rem 0.75rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.category-quick-tile:hover {
  transform: translateY(-2px);
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.category-quick-tile .tile-icon {
  font-size: 1.35rem;
  margin-bottom: 0.35rem;
}

.category-quick-tile .tile-title {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-main);
}

.category-quick-tile .tile-badge {
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-top: 2px;
}

/* Ensure original sections fit seamlessly in the views */
.app-view section {
  padding: 0;
  margin-bottom: 2rem;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .hub-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .category-quick-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 960px) {
  .desktop-nav {
    display: none;
  }
  .mobile-bottom-nav {
    display: flex;
  }
  .mobile-reise-switcher {
    display: flex;
  }
  .reise-split-layout {
    grid-template-columns: 1fr;
  }
  .map-sticky-column {
    position: relative;
    top: 0;
    height: 480px;
    display: none;
  }
  .category-quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .app-main {
    padding: 1rem 1rem 5.5rem;
  }
}

@media (max-width: 600px) {
  .hub-cards-grid {
    grid-template-columns: 1fr;
  }
  .category-quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
"""

combined_css = new_design_css + "\n\n/* === PRESERVED ORIGINAL COMPONENT STYLES === */\n" + orig_style

with open("css/app.css", "w", encoding="utf-8") as f:
    f.write(combined_css)

print("Generated css/app.css successfully.")

# -----------------------------------------------------------------------------
# 3. GENERATE JS (js/app.js)
# -----------------------------------------------------------------------------
router_js = """
// =========================================================================
// VIEW ROUTER & REDESIGN NAVIGATION CONTROLLER (6 HAUPTBEREICHE)
// =========================================================================

function showView(viewName, skipHistory) {
  const validViews = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'];
  
  const aliasMap = {
    'home': 'dashboard',
    'route': 'reise',
    'map': 'reise',
    'budget': 'finanzen',
    'organization': 'organisation',
    'journal': 'erlebnisse',
    'photos': 'erlebnisse',
    'bucketlist': 'erlebnisse',
    'wildlife': 'erlebnisse',
    'taste': 'erlebnisse',
    'drone-hub': 'mehr',
    'drone': 'mehr',
    'weather': 'mehr',
    'emergency': 'mehr',
    'playlist': 'mehr',
    'hub': 'mehr',
    'tools': 'mehr'
  };

  const target = aliasMap[viewName] || (validViews.includes(viewName) ? viewName : 'dashboard');

  // Hide all views, activate target
  document.querySelectorAll('.app-view').forEach(v => {
    v.classList.remove('active');
  });
  const viewEl = document.getElementById('view-' + target);
  if (viewEl) {
    viewEl.classList.add('active');
  }

  // Update desktop navigation
  document.querySelectorAll('.desktop-nav .nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.getAttribute('data-view') === target);
  });

  // Update mobile bottom navigation
  document.querySelectorAll('.mobile-bottom-nav .bottom-nav-item').forEach(item => {
    item.classList.toggle('active', item.getAttribute('data-view') === target);
  });

  // Trigger view hooks
  if (target === 'reise') {
    ensureRouteMapReady(true);
    setTimeout(() => {
      if (routeInteractiveMap) {
        routeInteractiveMap.invalidateSize({ pan: false });
      }
    }, 120);
    const hash = window.location.hash;
    const dayMatch = hash.match(/#(?:day|tag)-(\d+)/i);
    if (dayMatch) {
      setTimeout(() => jumpToDay(parseInt(dayMatch[1], 10)), 150);
    }
  } else if (target === 'finanzen') {
    setTimeout(() => {
      renderCurrentBudgetChart();
      updateBudgetCalculations();
    }, 100);
  } else if (target === 'organisation') {
    renderBookings();
    renderPackingList();
  } else if (target === 'erlebnisse') {
    renderJournalDays();
    renderPhotosGallery();
    if (viewName === 'photos') switchExpTab('photos');
    else if (viewName === 'bucketlist') switchExpTab('bucketlist');
    else if (viewName === 'wildlife') switchExpTab('wildlife');
    else if (viewName === 'taste') switchExpTab('taste');
  } else if (target === 'mehr') {
    if (viewName === 'drone-hub' || viewName === 'drone') {
      switchMoreTab('drone');
    } else if (viewName === 'weather') {
      switchMoreTab('weather');
    } else if (viewName === 'emergency') {
      switchMoreTab('emergency');
    } else if (viewName === 'playlist') {
      switchMoreTab('playlist');
    } else if (viewName === 'hub' || viewName === 'tools') {
      switchMoreTab('tools');
    }
  }

  if (!skipHistory && window.location.hash !== '#' + target && !window.location.hash.startsWith('#day-')) {
    history.replaceState(null, '', '#' + target);
  }
}

// Enhance jumpToDay for Seamless Navigation
function jumpToDay(dayNum) {
  showView('reise', true);
  
  if (window.innerWidth <= 960) {
    switchMobileReiseMode('plan');
  }

  const dayEl = document.getElementById('day-' + dayNum);
  if (dayEl) {
    dayEl.classList.add('revealed');
    dayEl.open = true;
    const plan = dayEl.querySelector('.day-plan-accordion');
    if (plan) plan.open = true;
    dayEl.classList.add('highlight-glow');
    setTimeout(() => dayEl.classList.remove('highlight-glow'), 2500);
    dayEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  focusDayOnMap(dayNum, null, false);
  updateMobileBottomSheet(dayNum);
}

// Mobile Reise Mode Switcher
function switchMobileReiseMode(mode) {
  const planCol = document.querySelector('.timeline-column');
  const mapCol = document.querySelector('.map-sticky-column');
  const btnPlan = document.getElementById('mobile-reise-btn-plan');
  const btnMap = document.getElementById('mobile-reise-btn-map');
  const bottomSheet = document.getElementById('mobile-map-bottom-sheet');

  if (mode === 'plan') {
    if (planCol) planCol.style.display = 'block';
    if (mapCol) mapCol.style.display = 'none';
    if (btnPlan) btnPlan.classList.add('active');
    if (btnMap) btnMap.classList.remove('active');
    if (bottomSheet) bottomSheet.style.display = 'none';
  } else {
    if (planCol) planCol.style.display = 'none';
    if (mapCol) {
      mapCol.style.display = 'flex';
      mapCol.style.height = 'calc(100vh - 145px)';
    }
    if (btnPlan) btnPlan.classList.remove('active');
    if (btnMap) btnMap.classList.add('active');
    if (bottomSheet) {
      bottomSheet.style.display = 'block';
      updateMobileBottomSheet(activeFocusedDay || 1);
    }
    ensureRouteMapReady(true);
    setTimeout(() => {
      if (routeInteractiveMap) routeInteractiveMap.invalidateSize({ pan: false });
    }, 120);
  }
}

// Mobile Map Bottom Sheet Updater
function updateMobileBottomSheet(dayNum) {
  const sheet = document.getElementById('mobile-map-bottom-sheet');
  if (!sheet) return;
  const dayData = (typeof TRIP_DAYS_DATA !== 'undefined' ? TRIP_DAYS_DATA : []).find(d => d.day === dayNum) || { day: dayNum, title: 'Reisetag', date: '' };
  const spots = (typeof ALL_SIGHTSEEING_SPOTS !== 'undefined' ? ALL_SIGHTSEEING_SPOTS : []).filter(s => s.day === dayNum);
  
  const titleEl = document.getElementById('bottom-sheet-day-title');
  const spotsEl = document.getElementById('bottom-sheet-spots-list');
  const actionBtn = document.getElementById('bottom-sheet-plan-btn');

  if (titleEl) {
    titleEl.innerHTML = `<strong>Tag ${dayData.day} · ${escapeHtml(dayData.title)}</strong> <span style="font-size:0.75rem; color:var(--text-muted); margin-left:0.5rem;">${dayData.date}</span>`;
  }
  if (spotsEl) {
    if (spots.length > 0) {
      spotsEl.innerHTML = spots.map(s => `
        <span class="spot-sheet-chip" onclick="focusSpotOnMap('${s.id}', event)">
          <i class="fa-solid fa-location-dot"></i> ${escapeHtml(s.name)}
        </span>
      `).join('');
    } else {
      spotsEl.innerHTML = `<span style="font-size:0.8rem; color:var(--text-muted);">${escapeHtml(dayData.drive || 'Reisetag')}</span>`;
    }
  }
  if (actionBtn) {
    actionBtn.onclick = () => jumpToDay(dayData.day);
  }
}

// Organisation Shortcuts
function filterOrgCategory(catKey) {
  showView('organisation');
  switchOrgTab('bookings');
  const filterSelect = document.getElementById('org-booking-filter-cat');
  if (filterSelect) {
    filterSelect.value = catKey;
    renderBookings();
    document.getElementById('org-panel-bookings')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

// Finanzen Sub-Tabs
function switchFinTab(tabKey) {
  document.querySelectorAll('.fin-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.fin-panel').forEach(panel => {
    panel.style.display = panel.id === 'fin-panel-' + tabKey ? 'block' : 'none';
  });
  if (tabKey === 'overview') {
    setTimeout(() => {
      renderCurrentBudgetChart();
      updateBudgetCalculations();
    }, 60);
  }
}

// Erlebnisse Sub-Tabs
function switchExpTab(tabKey) {
  document.querySelectorAll('.exp-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.exp-panel').forEach(panel => {
    panel.style.display = panel.id === 'exp-panel-' + tabKey ? 'block' : 'none';
  });
  if (tabKey === 'journal') renderJournalDays();
  if (tabKey === 'photos') renderPhotosGallery();
}

// Mehr Sub-Tabs
function switchMoreTab(tabKey) {
  document.querySelectorAll('.more-subnav-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === tabKey);
  });
  document.querySelectorAll('.more-panel').forEach(panel => {
    panel.style.display = panel.id === 'more-panel-' + tabKey ? 'block' : 'none';
  });
  if (tabKey === 'drone') {
    setTimeout(() => {
      const droneDetails = document.getElementById('drone-map-slide');
      if (droneDetails) droneDetails.open = true;
      initDroneAirspaceMap();
      if (droneAirspaceMap) droneAirspaceMap.invalidateSize();
    }, 150);
  }
}

// Global Hash Router
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.replace('#', '').trim();
  if (hash.startsWith('day-') || hash.startsWith('tag-')) {
    const num = parseInt(hash.replace(/^(?:day|tag)-/, ''), 10);
    if (num) jumpToDay(num);
  } else if (hash) {
    showView(hash, true);
  }
});

// Setup Initial View on Load
window.addEventListener('DOMContentLoaded', () => {
  const initialHash = window.location.hash.replace('#', '').trim();
  if (initialHash.startsWith('day-') || initialHash.startsWith('tag-')) {
    const num = parseInt(initialHash.replace(/^(?:day|tag)-/, ''), 10);
    if (num) setTimeout(() => jumpToDay(num), 300);
  } else if (initialHash) {
    showView(initialHash, true);
  } else {
    showView('dashboard', true);
  }
});
"""

combined_js = orig_script + "\n\n" + router_js

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(combined_js)

print("Generated js/app.js successfully.")

# -----------------------------------------------------------------------------
# 4. GENERATE HTML (index.html)
# -----------------------------------------------------------------------------
html_content = f"""<!DOCTYPE html>
<html lang="de">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes">
  <title>Australien Roadtrip 2027 · Persönliches Reise-Cockpit</title>
  <meta name="description" content="Persönliches Reise-Cockpit für den 4-Personen Australien Roadtrip 2027 (Wien bis Melbourne). 20 Reisetage, Live-Karte, Budget, Buchungen, Drohne und Journal.">
  <link rel="manifest" href="manifest.json">
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="icon" type="image/png" sizes="192x192" href="icon-192.png">
  <link rel="apple-touch-icon" sizes="192x192" href="icon-192.png">
  <link rel="apple-touch-icon" sizes="512x512" href="icon-512.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
  <link rel="stylesheet" href="css/app.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"></script>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
</head>

<body class="is-locked">

  {modal_gate}
  {modal_offline}
  {modal_trip_status}

  <!-- =========================================================================
       DESKTOP HEADER & HAUPTNAVIGATION
       ========================================================================= -->
  <header class="app-header">
    <div class="header-inner">
      <div class="app-brand" onclick="showView('dashboard')">
        <span class="brand-flag">🇦🇺</span>
        <div class="brand-text">
          <span class="brand-title">AUSTRALIEN 2027</span>
          <span class="brand-subtitle">21.03. – 09.04.2027</span>
        </div>
      </div>

      <nav class="desktop-nav">
        <button type="button" class="nav-tab active" data-view="dashboard" onclick="showView('dashboard')">
          <i class="fa-solid fa-house"></i>
          <span>Dashboard</span>
        </button>
        <button type="button" class="nav-tab" data-view="reise" onclick="showView('reise')">
          <i class="fa-solid fa-map-location-dot"></i>
          <span>Reise</span>
        </button>
        <button type="button" class="nav-tab" data-view="organisation" onclick="showView('organisation')">
          <i class="fa-solid fa-clipboard-list"></i>
          <span>Organisation</span>
        </button>
        <button type="button" class="nav-tab" data-view="finanzen" onclick="showView('finanzen')">
          <i class="fa-solid fa-wallet"></i>
          <span>Finanzen</span>
        </button>
        <button type="button" class="nav-tab" data-view="erlebnisse" onclick="showView('erlebnisse')">
          <i class="fa-solid fa-compass"></i>
          <span>Erlebnisse</span>
        </button>
        <button type="button" class="nav-tab" data-view="mehr" onclick="showView('mehr')">
          <i class="fa-solid fa-ellipsis"></i>
          <span>Mehr</span>
        </button>
      </nav>

      <div class="header-actions">
        <button type="button" class="btn-icon-action" onclick="openGlobalSearch()" title="Globale Suche (Taste / oder ⌘K)">
          <i class="fa-solid fa-magnifying-glass"></i>
          <span>Suchen</span>
          <kbd>⌘K</kbd>
        </button>
        <button type="button" class="btn-icon-action" id="theme-toggle-btn" onclick="toggleDarkMode()" title="Design-Modus wechseln">
          <i class="fa-solid fa-moon"></i>
        </button>
        <button type="button" class="btn-icon-action" onclick="lockApp()" title="App sperren">
          <i class="fa-solid fa-lock"></i>
        </button>
      </div>
    </div>
  </header>

  <!-- =========================================================================
       MOBILE BOTTOM NAVIGATION BAR (FIXED)
       ========================================================================= -->
  <nav class="mobile-bottom-nav">
    <button type="button" class="bottom-nav-item active" data-view="dashboard" onclick="showView('dashboard')">
      <i class="fa-solid fa-house"></i>
      <span>Home</span>
    </button>
    <button type="button" class="bottom-nav-item" data-view="reise" onclick="showView('reise')">
      <i class="fa-solid fa-map-location-dot"></i>
      <span>Reise</span>
    </button>
    <button type="button" class="bottom-nav-item" data-view="organisation" onclick="showView('organisation')">
      <i class="fa-solid fa-clipboard-list"></i>
      <span>Orga</span>
    </button>
    <button type="button" class="bottom-nav-item" data-view="finanzen" onclick="showView('finanzen')">
      <i class="fa-solid fa-wallet"></i>
      <span>Finanzen</span>
    </button>
    <button type="button" class="bottom-nav-item" data-view="erlebnisse" onclick="showView('erlebnisse')">
      <i class="fa-solid fa-compass"></i>
      <span>Erlebnisse</span>
    </button>
    <button type="button" class="bottom-nav-item" data-view="mehr" onclick="showView('mehr')">
      <i class="fa-solid fa-ellipsis"></i>
      <span>Mehr</span>
    </button>
  </nav>

  <!-- =========================================================================
       HAUPTBEREICHE (APP VIEWS)
       ========================================================================= -->
  <main class="app-main">

    <!-- VIEW 1: 🏠 DASHBOARD -->
    <div id="view-dashboard" class="app-view active">
      <div class="dash-hero-card">
        <div class="dash-hero-text">
          <h1>AUSTRALIEN ROADTRIP 2027</h1>
          <div class="dash-hero-dates">
            <i class="fa-regular fa-calendar" style="color:var(--primary); margin-right:0.4rem;"></i>
            21. März 2027 – 09. April 2027 · 20 Reisetage · Wien → Melbourne
          </div>
        </div>

        <div class="countdown-card" style="margin:0; padding:0.75rem 1.25rem;">
          <div class="countdown-grid" style="gap:0.75rem;">
            <div class="cd-box"><span class="cd-number" id="cd-days">--</span><span class="cd-label">Tage</span></div>
            <div class="cd-box"><span class="cd-number" id="cd-hours">--</span><span class="cd-label">Std</span></div>
            <div class="cd-box"><span class="cd-number" id="cd-minutes">--</span><span class="cd-label">Min</span></div>
            <div class="cd-box"><span class="cd-number" id="cd-seconds">--</span><span class="cd-label">Sek</span></div>
          </div>
        </div>
      </div>

      <!-- Hero Trip Status Banner & Countdown -->
      <div id="hero-trip-status-widget" class="hero-trip-status-widget" style="margin-bottom:1.5rem;">
        <!-- Dynamically populated by updateLiveTripStatus() -->
      </div>

      <!-- ALS NÄCHSTES / DYNAMISCHER REISESTATUS -->
      <div class="dash-next-card">
        <div class="dash-next-header">
          <span class="dash-next-badge"><i class="fa-solid fa-compass"></i> Als Nächstes</span>
          <div style="font-size:0.82rem; color:var(--text-muted);">
            <i class="fa-solid fa-clock"></i> Nächste Etappe
          </div>
        </div>
        <div id="trip-dashboard-content">
          <!-- Dynamically populated by updateTripDashboard() -->
        </div>
      </div>

      <!-- 4 COCKPIT KACHELN -->
      <div class="hub-cards-grid">
        <div class="hub-card-cockpit" onclick="showView('reise')">
          <div class="card-icon-wrap"><i class="fa-solid fa-map-location-dot"></i></div>
          <div class="card-title">🗺️ REISE</div>
          <div class="card-meta">20 Reisetage · 27 Highlights · Interaktive Karte &amp; Timeline</div>
          <div class="card-action">Reise öffnen <i class="fa-solid fa-arrow-right"></i></div>
        </div>

        <div class="hub-card-cockpit" onclick="showView('organisation')">
          <div class="card-icon-wrap"><i class="fa-solid fa-clipboard-list"></i></div>
          <div class="card-title">📋 ORGANISATION</div>
          <div class="card-meta">18+ Buchungen · Flüge, Unterkünfte &amp; interaktive Packliste</div>
          <div class="card-action">Organisation öffnen <i class="fa-solid fa-arrow-right"></i></div>
        </div>

        <div class="hub-card-cockpit" onclick="showView('finanzen')">
          <div class="card-icon-wrap"><i class="fa-solid fa-wallet"></i></div>
          <div class="card-title">💰 FINANZEN</div>
          <div class="card-meta">Gesamtbudget 4.375 € / Person · D3 Charts, Sprit &amp; Ausgaben</div>
          <div class="card-action">Budget öffnen <i class="fa-solid fa-arrow-right"></i></div>
        </div>

        <div class="hub-card-cockpit" onclick="showView('erlebnisse')">
          <div class="card-icon-wrap"><i class="fa-solid fa-compass"></i></div>
          <div class="card-title">📖 ERLEBNISSE</div>
          <div class="card-meta">Reisejournal · Fotogalerie · Bucket List &amp; Wildlife Tracker</div>
          <div class="card-action">Erlebnisse öffnen <i class="fa-solid fa-arrow-right"></i></div>
        </div>
      </div>

      <!-- QUICK STATS & LIVE CLOCKS -->
      <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.25rem; display:flex; flex-wrap:wrap; gap:1.5rem; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm); margin-bottom:2rem;">
        <div style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Wien (UTC+2)</div>
            <div id="vienna-time" style="font-family:var(--font-heading); font-size:1.25rem; font-weight:700;">--:--:--</div>
          </div>
          <div style="border-left:1px solid var(--border-color); padding-left:1.5rem;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; display:flex; align-items:center; gap:0.4rem;">
              Australien 
              <select id="timezone-select" onchange="changeTimezone(this.value)" style="border:none; background:transparent; font-size:0.75rem; font-weight:700; color:var(--primary); cursor:pointer;">
                <option value="AEST">AEST (Sydney/Melbourne)</option>
                <option value="QLD">QLD (Brisbane/Cairns)</option>
              </select>
            </div>
            <div id="aussie-time" style="font-family:var(--font-heading); font-size:1.25rem; font-weight:700; color:var(--primary);">--:--:--</div>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
          <div>
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Live Wechselkurs</div>
            <div style="font-size:0.95rem; font-weight:700;">
              <span id="currency-rate-text">1 AUD = ~0.62 EUR</span>
              <button type="button" class="btn-icon-action" style="height:26px; width:26px; padding:0; margin-left:0.35rem;" onclick="fetchExchangeRates(true)" title="Aktualisieren">
                <i class="fa-solid fa-arrows-rotate" id="currency-refresh-icon"></i>
              </button>
            </div>
            <span id="currency-update-time" style="display:none;"></span>
          </div>

          <div style="border-left:1px solid var(--border-color); padding-left:1.5rem;">
            <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Sydney Wetter</div>
            <div style="font-size:0.95rem; font-weight:700; display:flex; align-items:center; gap:0.4rem;">
              <span id="weather-temp-sydney">--°C</span>
              <span id="weather-cond-sydney" style="font-size:0.8rem; color:var(--text-muted); font-weight:500;">--</span>
              <button type="button" class="btn-icon-action" style="height:26px; width:26px; padding:0;" onclick="fetchLiveWeather(true)" title="Wetter aktualisieren">
                <i class="fa-solid fa-arrows-rotate" id="weather-refresh-icon"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Simulation Controller for Previewing Days -->
      <div style="opacity:0.9; margin-bottom:2rem;">
        {sec_dashboard}
      </div>
    </div>


    <!-- VIEW 2: 🗺️ REISE (TIMELINE + STICKY INTERAKTIVE KARTE) -->
    <div id="view-reise" class="app-view">
      <div class="view-header">
        <h2 class="view-header-title">🗺️ Unser Reiseplan &amp; Interaktive Karte</h2>
        <p class="view-header-subtitle">20 Reisetage von Sydney über Brisbane &amp; Whitsundays bis nach Melbourne &amp; Great Ocean Road</p>
      </div>

      <!-- Mobile Plan / Map Toggle Switcher -->
      <div class="mobile-reise-switcher">
        <button type="button" class="mobile-switch-btn active" id="mobile-reise-btn-plan" onclick="switchMobileReiseMode('plan')">
          <i class="fa-solid fa-calendar-days"></i> Tagesplan (20 Tage)
        </button>
        <button type="button" class="mobile-switch-btn" id="mobile-reise-btn-map" onclick="switchMobileReiseMode('map')">
          <i class="fa-solid fa-map-location-dot"></i> Interaktive Karte
        </button>
      </div>

      <!-- 2-Spalten-Layout (Links: Timeline, Rechts: Sticky Map) -->
      <div class="reise-split-layout">
        
        <!-- LINKE SPALTE: 20 TAGE TIMELINE -->
        <div class="timeline-column">
          {sec_route}
        </div>

        <!-- RECHTE SPALTE: STICKY MAP CONTAINER -->
        <div class="map-sticky-column">
          {sec_map}
        </div>

      </div>

      <!-- MOBILE BOTTOM SHEET FÜR KARTENANSICHT -->
      <div id="mobile-map-bottom-sheet" class="mobile-map-bottom-sheet">
        <div class="sheet-drag-handle"></div>
        <div class="sheet-header-row">
          <div id="bottom-sheet-day-title" class="sheet-day-title">Tag 1 · Ankunft in Sydney</div>
          <button type="button" id="bottom-sheet-plan-btn" class="btn-org-action primary" style="padding:0.4rem 0.85rem; font-size:0.8rem;">
            <i class="fa-solid fa-calendar-day"></i> Tagesplan öffnen
          </button>
        </div>
        <div id="bottom-sheet-spots-list" class="sheet-spots-chips">
          <!-- Dynamically populated by updateMobileBottomSheet() -->
        </div>
      </div>
    </div>


    <!-- VIEW 3: 📋 ORGANISATION -->
    <div id="view-organisation" class="app-view">
      <div class="view-header">
        <h2 class="view-header-title">📋 Reiseorganisation &amp; Buchungs-Zentrale</h2>
        <p class="view-header-subtitle">Zentrale Übersicht aller Flüge, Unterkünfte, Mietwagen, Touren &amp; deiner interaktiven Australien-Packliste</p>
      </div>

      <!-- 6 Category Quick Tiles -->
      <div class="category-quick-grid">
        <div class="category-quick-tile" onclick="filterOrgCategory('flights')">
          <span class="tile-icon">✈️</span>
          <span class="tile-title">Flüge</span>
          <span class="tile-badge">3 Etappen</span>
        </div>
        <div class="category-quick-tile" onclick="filterOrgCategory('hotels')">
          <span class="tile-icon">🏨</span>
          <span class="tile-title">Unterkünfte</span>
          <span class="tile-badge">20/20 gebucht</span>
        </div>
        <div class="category-quick-tile" onclick="filterOrgCategory('car')">
          <span class="tile-icon">🚗</span>
          <span class="tile-title">Mietwagen</span>
          <span class="tile-badge">3 Fahrzeuge</span>
        </div>
        <div class="category-quick-tile" onclick="filterOrgCategory('tours')">
          <span class="tile-icon">🎟️</span>
          <span class="tile-title">Touren</span>
          <span class="tile-badge">Whitsundays &amp; GBR</span>
        </div>
        <div class="category-quick-tile" onclick="switchOrgTab('packing')">
          <span class="tile-icon">🎒</span>
          <span class="tile-title">Packliste</span>
          <span class="tile-badge" id="org-badge-packing-progress">0% gepackt</span>
        </div>
        <div class="category-quick-tile" onclick="switchOrgTab('bookings')">
          <span class="tile-icon">📑</span>
          <span class="tile-title">Voucher &amp; Codes</span>
          <span class="tile-badge">Alle Buchungen</span>
        </div>
      </div>

      <!-- Section Organisation (Panels Bookings & Packing) -->
      {sec_organization}
    </div>


    <!-- VIEW 4: 💰 FINANZEN -->
    <div id="view-finanzen" class="app-view">
      <div class="view-header">
        <h2 class="view-header-title">💰 Kosten- &amp; Budgetübersicht</h2>
        <p class="view-header-subtitle">Transparente Kalkulation für 4 Personen, Vor-Ort-Reisekasse, Spritkosten &amp; Ausgaben-Tracker</p>
      </div>

      <!-- Subnav Navigation Tabs für Finanzen -->
      <div class="subnav-pills">
        <button type="button" class="subnav-pill fin-subnav-btn active" data-tab="overview" onclick="switchFinTab('overview')">
          <i class="fa-solid fa-chart-pie"></i> Budgetübersicht &amp; D3 Charts
        </button>
        <button type="button" class="subnav-pill fin-subnav-btn" data-tab="expenses" onclick="switchFinTab('expenses')">
          <i class="fa-solid fa-receipt"></i> Ausgaben &amp; Belege
        </button>
        <button type="button" class="subnav-pill fin-subnav-btn" data-tab="onsite" onclick="switchFinTab('onsite')">
          <i class="fa-solid fa-hand-holding-dollar"></i> Vor-Ort-Reisekasse
        </button>
        <button type="button" class="subnav-pill fin-subnav-btn" data-tab="splitwise" onclick="switchFinTab('splitwise')">
          <i class="fa-solid fa-arrow-right-arrow-left"></i> Splitwise Gruppe
        </button>
        <button type="button" class="subnav-pill fin-subnav-btn" data-tab="fuel" onclick="switchFinTab('fuel')">
          <i class="fa-solid fa-gas-pump"></i> Mietwagen &amp; Sprit
        </button>
        <button type="button" class="subnav-pill fin-subnav-btn" data-tab="groceries" onclick="switchFinTab('groceries')">
          <i class="fa-solid fa-cart-shopping"></i> Supermarkt-Einkäufe
        </button>
        <button type="button" class="subnav-pill fin-subnav-btn" data-tab="currency" onclick="switchFinTab('currency')">
          <i class="fa-solid fa-money-bill-transfer"></i> Währungsrechner
        </button>
      </div>

      <!-- Finanzen Panels -->
      <div id="fin-panel-overview" class="fin-panel">
        {sec_budget}
      </div>

      <div id="fin-panel-expenses" class="fin-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem;">
            <h3 style="margin:0;"><i class="fa-solid fa-receipt" style="color:var(--primary);"></i> Erfasste Ausgaben der Reisegruppe</h3>
            <button type="button" class="btn-org-action primary" onclick="openExpenseModal()">
              <i class="fa-solid fa-plus"></i> Ausgabe hinzufügen
            </button>
          </div>
          <div id="expense-items-list">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>

      <div id="fin-panel-onsite" class="fin-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <h3 style="margin-top:0;"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--primary);"></i> Vor-Ort Reisekasse (Taschengeld Australien)</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">Kalkulation der täglichen Ausgaben vor Ort für Verpflegung, Kaffee &amp; Eintritte.</p>
          <div style="max-width:550px; margin-top:1rem;">
            <label for="onsite-spend-slider" style="font-weight:700; font-size:0.9rem; display:block; margin-bottom:0.5rem;">Tägliches Budget / Person (EUR):</label>
            <div style="display:flex; align-items:center; gap:1rem;">
              <input type="range" id="onsite-spend-slider" min="30" max="150" step="5" value="65" oninput="updateOnsiteSpend(this.value, 'slider')" style="flex:1;">
              <input type="number" id="onsite-spend-input" value="65" min="30" max="150" onchange="updateOnsiteSpend(this.value, 'input')" style="width:75px; padding:0.4rem; border:1px solid var(--border-color); border-radius:6px; font-weight:700; text-align:center;">
              <span>€ / Tag</span>
            </div>
            <div style="margin-top:1.25rem; padding:1rem; background:var(--card-sub-bg); border-radius:var(--radius-md);">
              <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
                <span style="color:var(--text-muted);">Ausgaben pro Tag (4 Personen):</span>
                <strong id="onsite-daily-eur">260 €</strong>
              </div>
              <div style="display:flex; justify-content:space-between; font-size:1.05rem;">
                <span><strong>Gesamtbudget 20 Tage:</strong></span>
                <strong id="onsite-total-trip" style="color:var(--primary);">5.200 € (~8.374 AUD)</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="fin-panel-splitwise" class="fin-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:2rem; box-shadow:var(--shadow-sm); text-align:center; max-width:650px; margin:0 auto;">
          <div style="font-size:3rem; margin-bottom:1rem;">🔀</div>
          <h3 style="margin-top:0;">Splitwise Gruppenausgaben</h3>
          <p style="color:var(--text-muted); margin-bottom:1.5rem;">
            Alle gemeinsamen Reisekosten werden bequem in der offiziellen Splitwise-Gruppe geteilt.
          </p>
          <a id="link-splitwise-budget" href="#" target="_blank" rel="noopener noreferrer" class="btn-org-action primary" style="display:inline-flex; font-size:1rem; padding:0.75rem 1.5rem;">
            <i class="fa-solid fa-arrow-right-arrow-left"></i> Splitwise Gruppe öffnen
          </a>
          <a id="link-splitwise" href="#" target="_blank" rel="noopener noreferrer" style="display:none;"></a>
        </div>
      </div>

      <div id="fin-panel-fuel" class="fin-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <h3 style="margin-top:0;"><i class="fa-solid fa-gas-pump" style="color:var(--primary);"></i> Spritrechner &amp; Tankbelege</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            Erfasse Tankfüllungen in AUD. Die Kosten werden live in EUR umgerechnet und gerecht durch 4 Personen geteilt.
          </p>
          <div style="display:flex; gap:1rem; flex-wrap:wrap; margin-bottom:1rem;">
            <input type="number" id="fuel-cost-aud" placeholder="Betrag in AUD (z.B. 110.50)" step="0.5" style="padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); width:200px;" oninput="updateFuelEurPreview()">
            <input type="text" id="fuel-location" placeholder="Ort / Tankstelle (z.B. Coffs Harbour)" style="padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-sm); flex:1; min-width:200px;">
            <select id="fuel-payer" style="padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <option value="Tobi">Gezahlt von: Tobi</option>
              <option value="Flo">Gezahlt von: Flo</option>
              <option value="Kerstin">Gezahlt von: Kerstin</option>
              <option value="Lara">Gezahlt von: Lara</option>
            </select>
            <button type="button" class="btn-org-action primary" onclick="addFuelEntry()">
              <i class="fa-solid fa-plus"></i> Beleg speichern
            </button>
          </div>
          <div id="fuel-eur-preview" style="font-size:0.85rem; color:var(--text-muted); margin-bottom:1.25rem;"></div>
          <div id="fuel-list-container">
            <!-- Dynamically populated -->
          </div>
          <div style="margin-top:1.25rem; padding:1rem; background:var(--card-sub-bg); border-radius:var(--radius-md); display:flex; justify-content:space-between; align-items:center;">
            <span><strong id="fuel-entry-count">0</strong> Tankvorgänge erfasst</span>
            <div>
              <span>Gesamtsumme Sprit: <strong id="fuel-total-sum">0 €</strong></span>
              <span style="margin-left:1rem; color:var(--primary); font-weight:700;">(<span id="fuel-per-person">0 €</span> / Person)</span>
            </div>
          </div>
        </div>
      </div>

      <div id="fin-panel-groceries" class="fin-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <h3 style="margin-top:0;"><i class="fa-solid fa-cart-shopping" style="color:var(--primary);"></i> Supermarkt &amp; Einkaufsliste</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">Gemeinsame Einkaufsliste für Woolworths &amp; Coles mit Schnell-Hinzufügen-Chips.</p>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:1rem;">
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('Wasser 10L')">+ Wasser 10L</button>
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('Toastbrot & Marmelade')">+ Toastbrot</button>
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('Kaffee & Milch')">+ Kaffee &amp; Milch</button>
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('Bananen & Äpfel')">+ Obst</button>
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('BBQ Würstchen & Steaks')">+ BBQ Fleisch</button>
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('Sonnencreme SPF 50+')">+ Sonnencreme</button>
            <button type="button" class="btn-icon-action" onclick="quickAddGrocery('Mückenspray (Bushman)')">+ Bushman Spray</button>
          </div>
          <div style="display:flex; gap:0.5rem; margin-bottom:1rem;">
            <input type="text" id="grocery-item-input" placeholder="Artikel eingeben..." style="flex:1; padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-sm);" onkeypress="if(event.key==='Enter') addGroceryItem()">
            <input type="number" id="grocery-price-aud" placeholder="Preis AUD" step="0.5" style="width:100px; padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
            <select id="grocery-payer" style="padding:0.6rem; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
              <option value="Gemeinsam">Gemeinsam</option>
              <option value="Tobi">Tobi</option>
              <option value="Flo">Flo</option>
              <option value="Kerstin">Kerstin</option>
              <option value="Lara">Lara</option>
            </select>
            <button type="button" class="btn-org-action primary" onclick="addGroceryItem()"><i class="fa-solid fa-plus"></i></button>
          </div>
          <div id="grocery-list-container">
            <!-- Dynamically populated -->
          </div>
          <div style="display:none;">
            <span id="grocery-tobi-sum">0</span>
            <span id="grocery-flo-sum">0</span>
            <span id="grocery-ker-sum">0</span>
            <span id="grocery-lara-sum">0</span>
          </div>
        </div>
      </div>

      <div id="fin-panel-currency" class="fin-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm); max-width:550px;">
          <h3 style="margin-top:0;"><i class="fa-solid fa-money-bill-transfer" style="color:var(--primary);"></i> Währungsrechner (AUD ↔ EUR)</h3>
          <div style="display:flex; flex-direction:column; gap:1rem; margin-top:1.25rem;">
            <div>
              <label for="conv-aud-input" style="font-size:0.85rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Australische Dollar (AUD):</label>
              <input type="number" id="conv-aud-input" value="100" step="1" oninput="recalcEurFromAud()" style="width:100%; padding:0.75rem; font-size:1.15rem; font-weight:700; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
            </div>
            <div style="text-align:center;">
              <button type="button" class="btn-icon-action" onclick="swapCurrencies()" title="Währungen tauschen">
                <i class="fa-solid fa-arrows-up-down"></i>
              </button>
            </div>
            <div>
              <label for="conv-eur-input" style="font-size:0.85rem; font-weight:700; color:var(--text-muted); display:block; margin-bottom:0.3rem;">Euro (EUR):</label>
              <input type="number" id="conv-eur-input" value="62.10" step="0.5" oninput="recalcAudFromEur()" style="width:100%; padding:0.75rem; font-size:1.15rem; font-weight:700; border:1px solid var(--border-color); border-radius:var(--radius-sm);">
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- VIEW 5: 📖 ERLEBNISSE -->
    <div id="view-erlebnisse" class="app-view">
      <div class="view-header">
        <h2 class="view-header-title">📖 Reiseerlebnisse, Journal &amp; Erinnerungen</h2>
        <p class="view-header-subtitle">Persönliches Reisetagebuch, Fotogalerie, Outback Bucket List &amp; Wildlife Tracker</p>
      </div>

      <!-- Subnav Navigation Tabs für Erlebnisse -->
      <div class="subnav-pills">
        <button type="button" class="subnav-pill exp-subnav-btn active" data-tab="journal" onclick="switchExpTab('journal')">
          <i class="fa-solid fa-book-open"></i> Reisejournal (Tage 1–20)
        </button>
        <button type="button" class="subnav-pill exp-subnav-btn" data-tab="photos" onclick="switchExpTab('photos')">
          <i class="fa-solid fa-camera"></i> Fotogalerie &amp; Alben
        </button>
        <button type="button" class="subnav-pill exp-subnav-btn" data-tab="bucketlist" onclick="switchExpTab('bucketlist')">
          <i class="fa-solid fa-list-check"></i> Aussie Bucket List
        </button>
        <button type="button" class="subnav-pill exp-subnav-btn" data-tab="wildlife" onclick="switchExpTab('wildlife')">
          <i class="fa-solid fa-paw"></i> Wildlife Tracker
        </button>
        <button type="button" class="subnav-pill exp-subnav-btn" data-tab="taste" onclick="switchExpTab('taste')">
          <i class="fa-solid fa-utensils"></i> Taste Challenge
        </button>
      </div>

      <!-- Erlebnisse Panels -->
      <div id="exp-panel-journal" class="exp-panel">
        {sec_journal}
      </div>

      <div id="exp-panel-photos" class="exp-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.25rem; flex-wrap:wrap; gap:1rem;">
            <div>
              <h3 style="margin:0;"><i class="fa-solid fa-camera-retro" style="color:var(--secondary);"></i> Roadtrip Fotogalerie</h3>
              <p style="color:var(--text-muted); font-size:0.85rem; margin:0;">Bilder nach Reisetagen gefiltert mit Lightbox-Viewer</p>
            </div>
            <div style="display:flex; gap:0.5rem;">
              <button type="button" class="btn-org-action primary" onclick="openPhotoModal()">
                <i class="fa-solid fa-plus"></i> Foto hinzufügen
              </button>
              <a id="link-photos" href="#" target="_blank" rel="noopener noreferrer" class="btn-org-action secondary" title="Google Photos öffnen">
                <i class="fa-solid fa-images"></i> Google Photos
              </a>
            </div>
          </div>

          <div style="margin-bottom:1.25rem;">
            <select id="photos-filter-day" class="org-form-select" onchange="filterPhotosByDay(this.value)" style="max-width:280px;">
              <option value="all">Alle Fotos anzeigen</option>
              <!-- Populated by JS -->
            </select>
          </div>

          <div id="photos-grid" class="photos-grid">
            <!-- Dynamically populated -->
          </div>
        </div>
      </div>

      <div id="exp-panel-bucketlist" class="exp-panel" style="display:none;">
        {sec_bucketlist}
      </div>

      <div id="exp-panel-wildlife" class="exp-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <h3 style="margin-top:0;"><i class="fa-solid fa-paw" style="color:var(--secondary);"></i> Wildlife Tracker 🦘🐨</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            Zähle gesichtete australische Wildtiere entlang des Roadtrips!
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1.25rem;">
            <div class="category-quick-tile" style="padding:1.25rem;">
              <span style="font-size:2.5rem;">🦘</span>
              <span class="tile-title" style="font-size:1.05rem; margin-top:0.4rem;">Kängurus</span>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); margin:0.4rem 0;">12+</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Gesichtet in NSW &amp; QLD</span>
            </div>
            <div class="category-quick-tile" style="padding:1.25rem;">
              <span style="font-size:2.5rem;">🐨</span>
              <span class="tile-title" style="font-size:1.05rem; margin-top:0.4rem;">Koalas</span>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); margin:0.4rem 0;">4</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Kennett River &amp; Noosa</span>
            </div>
            <div class="category-quick-tile" style="padding:1.25rem;">
              <span style="font-size:2.5rem;">🐢</span>
              <span class="tile-title" style="font-size:1.05rem; margin-top:0.4rem;">Meeresschildkröten</span>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); margin:0.4rem 0;">6</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Great Barrier Reef</span>
            </div>
            <div class="category-quick-tile" style="padding:1.25rem;">
              <span style="font-size:2.5rem;">🦇</span>
              <span class="tile-title" style="font-size:1.05rem; margin-top:0.4rem;">Flughunde</span>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); margin:0.4rem 0;">100+</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Sydney Botanic Gardens</span>
            </div>
            <div class="category-quick-tile" style="padding:1.25rem;">
              <span style="font-size:2.5rem;">🐊</span>
              <span class="tile-title" style="font-size:1.05rem; margin-top:0.4rem;">Salzwasserkrokodile</span>
              <div style="font-size:1.5rem; font-weight:800; color:var(--primary); margin:0.4rem 0;">2</div>
              <span style="font-size:0.75rem; color:var(--text-muted);">Daintree Rainforest</span>
            </div>
          </div>
        </div>
      </div>

      <div id="exp-panel-taste" class="exp-panel" style="display:none;">
        <div style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:1.5rem; box-shadow:var(--shadow-sm);">
          <h3 style="margin-top:0;"><i class="fa-solid fa-utensils" style="color:var(--secondary);"></i> Aussie Taste Challenge 🥧☕</h3>
          <p style="color:var(--text-muted); font-size:0.9rem;">
            Typische australische Spezialitäten, die während des Roadtrips probiert werden müssen!
          </p>
          <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; margin-top:1.25rem;">
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; background:var(--card-sub-bg); border-radius:var(--radius-md); cursor:pointer;">
              <input type="checkbox" class="sync-checkbox" id="taste-timtam">
              <div>
                <strong>Tim Tam Slam</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Keks-Ecken abbeißen &amp; heißen Kaffee durchsaugen</div>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; background:var(--card-sub-bg); border-radius:var(--radius-md); cursor:pointer;">
              <input type="checkbox" class="sync-checkbox" id="taste-vegemite">
              <div>
                <strong>Vegemite Toast</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Viel Butter, hauchdünn bestrichen!</div>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; background:var(--card-sub-bg); border-radius:var(--radius-md); cursor:pointer;">
              <input type="checkbox" class="sync-checkbox" id="taste-meatpie">
              <div>
                <strong>Aussie Meat Pie</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Klassische Fleischpastete mit Tomatensauce</div>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; background:var(--card-sub-bg); border-radius:var(--radius-md); cursor:pointer;">
              <input type="checkbox" class="sync-checkbox" id="taste-flatwhite">
              <div>
                <strong>Melbourne Flat White</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Kaffeekultur in Melbourne probieren</div>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; background:var(--card-sub-bg); border-radius:var(--radius-md); cursor:pointer;">
              <input type="checkbox" class="sync-checkbox" id="taste-lamington">
              <div>
                <strong>Lamington Kuchen</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Biskuitkuchen in Schokolade &amp; Kokosraspeln</div>
              </div>
            </label>
            <label style="display:flex; align-items:center; gap:0.75rem; padding:0.85rem; background:var(--card-sub-bg); border-radius:var(--radius-md); cursor:pointer;">
              <input type="checkbox" class="sync-checkbox" id="taste-bundaberg">
              <div>
                <strong>Bundaberg Ginger Beer</strong>
                <div style="font-size:0.75rem; color:var(--text-muted);">Erfrischendes Ingwerbier aus Queensland</div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>


    <!-- VIEW 6: ⋮ MEHR -->
    <div id="view-mehr" class="app-view">
      <div class="view-header">
        <h2 class="view-header-title">⋮ Spezialbereiche, Drohne, Wetter &amp; Tools</h2>
        <p class="view-header-subtitle">Drone Pilot Hub, Live-Wetterberichte, 000-Notfallkontakte, Roadtrip-Playlist &amp; Aussie-Helfer</p>
      </div>

      <!-- Subnav Navigation Tabs für Mehr -->
      <div class="subnav-pills">
        <button type="button" class="subnav-pill more-subnav-btn active" data-tab="drone" onclick="switchMoreTab('drone')">
          <i class="fa-solid fa-paper-plane"></i> Drone Pilot Hub 🛸
        </button>
        <button type="button" class="subnav-pill more-subnav-btn" data-tab="weather" onclick="switchMoreTab('weather')">
          <i class="fa-solid fa-cloud-sun"></i> Live-Wetter &amp; Regenradar ☀️
        </button>
        <button type="button" class="subnav-pill more-subnav-btn" data-tab="emergency" onclick="switchMoreTab('emergency')">
          <i class="fa-solid fa-truck-medical"></i> Notfall, Admin &amp; Regeln 🚨
        </button>
        <button type="button" class="subnav-pill more-subnav-btn" data-tab="playlist" onclick="switchMoreTab('playlist')">
          <i class="fa-solid fa-music"></i> Roadtrip Playlist 🎵
        </button>
        <button type="button" class="subnav-pill more-subnav-btn" data-tab="tools" onclick="switchMoreTab('tools')">
          <i class="fa-solid fa-toolbox"></i> Reise-Tools &amp; Slang 🧰
        </button>
      </div>

      <!-- Mehr Panels -->
      <div id="more-panel-drone" class="more-panel">
        {sec_drone}
      </div>

      <div id="more-panel-weather" class="more-panel" style="display:none;">
        {sec_weather}
      </div>

      <div id="more-panel-emergency" class="more-panel" style="display:none;">
        {sec_emergency}
      </div>

      <div id="more-panel-playlist" class="more-panel" style="display:none;">
        {sec_playlist}
      </div>

      <div id="more-panel-tools" class="more-panel" style="display:none;">
        {sec_hub}
      </div>
    </div>

  </main>

  <footer style="text-align:center; padding:2rem 1rem 6rem; color:var(--text-muted); font-size:0.85rem; border-top:1px solid var(--border-color); margin-top:4rem;">
    <p>Gute Reise! 🦘🇦🇺 Erstellt für den 4-Personen Australien Roadtrip 2027.</p>
  </footer>

  <!-- =========================================================================
       MODALS & OVERLAYS
       ========================================================================= -->
  {modal_booking}
  {modal_packing}
  {modal_expense}
  {modal_photo}
  {modal_lightbox}
  {modal_search}

  <!-- Scripts -->
  <script src="js/app.js"></script>
</body>

</html>
"""

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html_content)

print("Generated index.html successfully.")
print("Build complete!")
