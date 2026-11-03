# Intermediate Zoom-Out Report (Stage 8): docs/design-system.md

Verdict: passes at this altitude. No Blocker. Scope is right for a 23-line style reference; the level of detail is uneven. The later stages mostly pushed the document toward over-specification, so only a small subset of their changes is recommended.

New check: `scripts/check-code.js` has no rule for color literals, `tokens.css` or hex values.

## Findings

1. **Major, lines 1-4: purpose and scope missing.** One sentence should say what the document governs and what it replaced (deleted `app.css`, `design-system.css`, `hero-dock.css`, `management.css`, `trip.css`). This also settles the two conditional Blockers from Stage 7 (Alternatives Considered, Risks & Limits): they came from applying the feature-spec standard to a reference document. Waive them; adding those sections would be YAGNI. The same sentence can cover the "Kiln" explanation and the language convention.
2. **Major, line 8 / Regeln: rules not enforced.** `scripts/check-code.js` does not enforce "nie als Literal". Either add a small check for color literals outside `tokens.css`, or soften the rule to "Neue Werte nur hier definieren". The map-adapter fallback `'#d8c9b8'` already breaks the rule; add a carve-out or fix the code.
3. **Nit, lines 14-19: do not add the measurements requested earlier** (container width, radius per level, type scale, sheet stops, contrast ratios). They would duplicate `tokens.css` and drift. Add one line saying values live in `tokens.css` and keep the rules as principles. Exception: define "Blatt mit drei Stufen (`dvh`)" in one clause (bottom sheet, and where it lives).
4. **Nit, line 10: "Hallmark-Stempel" undefined.** Add a half-sentence or a pointer to `.hallmark/`. No edit procedure.
5. **Minor, line 23: Karte claim does not match the code.** Dashes are set only for plane and walk. Soften ("Strichmuster und Symbol, wo vorhanden") or confirm symbols cover the rest. Renaming `--color-ink-2` to `--color-route` is a code change for little gain; skip unless the name causes confusion.
6. **Nit, line 6: `js/shell.js` not listed.** Add one line so a reader can find the hash routes `#dashboard` and `#reise`. No load-order detail.

## What the later stages added

- Useful: undefined terms ("Hallmark-Stempel", "Blatt", "Ebene"); the Karte claim contradicting the code.
- Mostly noise at this altitude: alternatives, risks and limits, accessibility analysis, per-rule rationale, CARTO links and attribution detail (belongs in the map code or a README).
- Wording nits: "Karte" (UI card vs. map) and "Kacheln" (UI tile vs. map tile) each carry two meanings. One-word fixes.

## Recommended next edit

Keep the document under about 30 lines. Add: a purpose and replaced-system sentence; a pointer that values live in `tokens.css`; definitions of "Blatt" and "Hallmark-Stempel"; a corrected Karte sentence; a `js/shell.js` line. Resolve the line-8 enforcement question in code, or soften the rule.
