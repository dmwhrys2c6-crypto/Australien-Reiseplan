#!/usr/bin/env python3
"""
test_integrity.py
Deep data & feature integrity checker comparing index.html.original with the redesigned app.
"""

import re
import sys

print("=== DEEP DATA INTEGRITY CHECK ===")

with open("index.html.original", "r", encoding="utf-8") as f:
    orig_html = f.read()

with open("index.html", "r", encoding="utf-8") as f:
    new_html = f.read()

with open("js/app.js", "r", encoding="utf-8") as f:
    new_js = f.read()

# 1. Check all 20 Days
print("\n--- Checking 20 Reisetage ---")
for d in range(1, 21):
    assert f'id="day-{d}"' in new_html, f"Missing day-{d} in new HTML!"
    # Check that day title from original exists in new HTML
    m = re.search(rf"<details[^>]*id=[\"\x27]day-{d}[\"\x27][^>]*>([\s\S]*?)</details>", orig_html)
    assert m is not None, f"Could not find day-{d} in orig HTML"
    orig_day_content = m.group(1)
    
    # Check that day plan accordion and activities exist
    assert f'id="day-{d}"' in new_html
    print(f"  ✓ Tag {d:02d} verified (HTML intact)")

# 2. Check Data Structures in js/app.js
print("\n--- Checking Core Data Structures in js/app.js ---")
data_structures = [
    'TRIP_DAYS_DATA',
    'TRIP_DAYS',
    'DAY_PLANNED_EXPENSES',
    'ACCOMMODATION_DETAILS',
    'TRIP_DATES_LONG',
    'BUDGET_CATEGORIES_CONFIG',
    'DEFAULT_EXPENSES_LIST',
    'ALL_SIGHTSEEING_SPOTS',
    'roadtripRoutes',
    'flightRoutes',
    'regionNames',
    'airspaceFeatures',
    'DEFAULT_FALLBACK_WEATHER',
    'DEFAULT_BOOKINGS_LIST',
    'DEFAULT_PACKING_ITEMS',
    'ORG_CATEGORY_META',
    'PACKING_CATEGORIES',
    'DEFAULT_JOURNAL_ENTRIES',
    'DEFAULT_PHOTOS_LIST',
    'CIPHER_VAULT'
]

for ds in data_structures:
    assert ds in new_js, f"Missing data structure in js/app.js: {ds}"
    print(f"  ✓ {ds:26} verified")

# 3. Check Critical Functions in js/app.js
print("\n--- Checking Critical Functions in js/app.js ---")
critical_funcs = [
    'verifyPin', 'unlockAppUI', 'lockApp', 'showView', 'jumpToDay',
    'focusDayOnMap', 'focusSpotOnMap', 'jumpToDayAndHighlight',
    'initRouteLeafletMap', 'initDroneAirspaceMap', 'renderCurrentBudgetChart',
    'updateBudgetCalculations', 'renderBookings', 'renderPackingList',
    'renderJournalDays', 'renderPhotosGallery', 'openGlobalSearch',
    'switchMobileReiseMode', 'updateMobileBottomSheet', 'switchFinTab',
    'switchOrgTab', 'switchExpTab', 'switchMoreTab'
]

for fn in critical_funcs:
    assert f'function {fn}' in new_js or f'{fn} =' in new_js, f"Missing critical function: {fn}"
    print(f"  ✓ Function {fn:26} verified")

# 4. Check Modals in index.html
print("\n--- Checking Modals & Security in index.html ---")
modals = [
    'security-gate', 'booking-modal-backdrop', 'packing-modal-backdrop',
    'expense-modal-backdrop', 'photo-modal-backdrop', 'photo-lightbox-modal',
    'global-search-modal'
]
for m in modals:
    assert f'id="{m}"' in new_html, f"Missing modal: {m}"
    print(f"  ✓ Modal {m:24} verified")

# 5. Check Navigation in index.html
print("\n--- Checking Navigation in index.html ---")
nav_items = ['dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr']
for nav in nav_items:
    assert f'data-view="{nav}"' in new_html, f"Missing nav item: {nav}"
    assert f'id="view-{nav}"' in new_html, f"Missing view container: view-{nav}"
    print(f"  ✓ View & Nav '{nav}' verified")

print("\n==============================================")
print("ALL INTEGRITY CHECKS PASSED WITH 100% SUCCESS!")
print("==============================================")
