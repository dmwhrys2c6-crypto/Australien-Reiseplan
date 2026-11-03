# Zoom-Out Report (Stage 5): docs/design-system.md

Verdict: passes the Zoom-Out standard with minor findings. No Blocker.

## Verification
- `css/tokens.css`, `css/base.css`, `css/site.css` exist and use `--color-accent` and `--color-ink-2`.
- `js/trip/map-adapter.js` reads `--color-ink-2` via `token()` (line 65) with hardcoded fallback `'#d8c9b8'`, and uses CARTO `dark_all` tiles (line 4). Both Karte claims are accurate.
- `dashArray` is set only for plane and walk (line 65).
- Not checked: the "Hallmark-Stempel" in the first lines of `css/site.css`, and the other rules in the document against the CSS.

## Findings

1. **Major, whole document (Context Sufficiency, Root Problem Focus).** The document is a rulebook with no stated problem. It does not say why the Kiln theme exists, what it replaces, or what goal it serves. Git status shows `css/app.css`, `css/design-system.css`, `css/hero-dock.css`, `css/management.css`, `css/trip.css` and much of `js/` deleted, with no migration or rationale note. A fresh reader cannot tell whether this is a rewrite, a consolidation, or a removal of features such as management and journal. Add 2-3 sentences: purpose, replaced system, scope decision (for example, management view dropped).

2. **Major, Dateien, third bullet.** `site.css` is one catch-all file for "Shell, Landing, Reiseplan, Karte, Dialoge". The old `app.css`, `trip.css` and `management.css` grew the same way. State the rule for when `site.css` gets split, or it becomes a dumping ground.

3. **Minor, Karte (line 23).** All routes share one color, but the map-adapter fallback `'#d8c9b8'` is a hardcoded literal. That breaks line 8 ("nie als Literal"). Line 129 of the adapter also uses a color function returning a CSS var, which suggests two parallel paths for the same color. Fix the code or relax the rule for JS fallbacks.

4. **Minor, Karte (line 23).** The document says transport type shows via "Strichmuster und Symbol". Code sets dashes only for plane and walk; other modes are solid. Make the document match the code, or confirm the symbol carries the rest.

5. **Nit, Regeln (lines 14-19).** Rules are specific, but some drift into implementation detail ("Blatt mit drei Stufen (dvh)", "Eingaben 16px"). Nothing enforces them. `scripts/check-code.js` is modified; consider a lint check for literals outside `tokens.css`, or note that it exists.

6. **Nit, whole document.** The document is German while code and tooling are English-named. Acceptable if intended; state the language convention once.

Reuse and YAGNI: nothing speculative proposed. The three-file CSS split is minimal.
