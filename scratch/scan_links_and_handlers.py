#!/usr/bin/env python3
"""
scan_links_and_handlers.py
Scans index.html for all onclick handlers, href anchors, and data-view references
to ensure there are no dead links, missing IDs, or missing functions.
"""

import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

with open("js/app.js", "r", encoding="utf-8") as f:
    js = f.read()

print("=== CHECKING ONCLICK HANDLERS ===")
onclicks = re.findall(r'onclick="([^"]+)"', html)
missing_funcs = []
for oc in onclicks:
    # Extract function names e.g. showView('reise'), filterOrgCategory('flights')
    func_matches = re.findall(r'([a-zA-Z0-9_$]+)\s*\(', oc)
    for fn in func_matches:
        if fn in ['alert', 'confirm', 'parseInt', 'parseFloat', 'event', 'stopProp']:
            continue
        # Check if function exists in js or html inline scripts
        pattern = rf'(?:function\s+{fn}|(?:window\.)?{fn}\s*=|const\s+{fn}\s*=|let\s+{fn}\s*=|var\s+{fn}\s*=)'
        if not re.search(pattern, js) and not re.search(pattern, html):
            missing_funcs.append((fn, oc))

if missing_funcs:
    print(f"❌ Found {len(missing_funcs)} potentially missing functions in onclicks:")
    for fn, oc in set(missing_funcs):
        print(f"   - {fn} in '{oc}'")
else:
    print(f"✓ All {len(onclicks)} onclick handlers map to existing functions!")

print("\n=== CHECKING ANCHOR LINKS (HREF='#...') ===")
hrefs = re.findall(r'href="(#[a-zA-Z0-9_\-]+)"', html)
all_ids = set(re.findall(r'id="([a-zA-Z0-9_\-]+)"', html))
missing_anchors = []
for h in hrefs:
    target_id = h[1:]
    if target_id not in all_ids:
        missing_anchors.append(h)

if missing_anchors:
    print(f"❌ Found missing anchor targets:")
    for ma in set(missing_anchors):
        print(f"   - {ma}")
else:
    print(f"✓ All {len(hrefs)} anchor hrefs map to existing DOM IDs!")

print("\n=== CHECKING DATA-VIEW REFERENCES ===")
data_views = set(re.findall(r'data-view="([^"]+)"', html))
valid_views = {'dashboard', 'reise', 'organisation', 'finanzen', 'erlebnisse', 'mehr'}
diff = data_views - valid_views
if diff:
    print(f"❌ Invalid data-view values: {diff}")
else:
    print(f"✓ All data-views {data_views} are valid!")

print("\n=== CHECKING ALL 6 VIEW CONTAINERS ===")
for v in valid_views:
    container_id = f"view-{v}"
    assert container_id in all_ids, f"Missing container: {container_id}"
    print(f"  ✓ #{container_id} exists")

print("\nSummary check completed.")
