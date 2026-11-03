# Critic Report (Stage 7): docs/design-system.md, lines 1-23

Reviewers: egm-design, egm-structural, egm-style. All three completed.

Scope note: both the design and structural reviewers failed the file against `feature-spec-standard.md` because it is a style reference, not a feature spec. The two Blockers below only hold if the document is meant to be a spec. If it is a reference document, waive them; findings 3-9 still apply.

## Blockers (conditional on "document is a feature spec")

1. **No Alternatives Considered** (whole doc; design, structural). One theme, one token architecture, one rule set, no rejected options. Examples: CSS custom properties vs. a build-time token tool, one stylesheet vs. per-view files, other tile providers than CARTO Dark.
2. **No Risks & Limits** (whole doc; design, structural). Not covered: token drift (line 8 has no enforcement), CARTO availability/licence/attribution/offline behavior with `sw.js`, `dvh` browser support, `tokens.css` failing to load.

## Major

3. **No problem statement, goals or non-goals** (lines 1-4; design, structural). Does not say why the system exists, what it replaces, or what is out of scope. Deleted files (`app.css`, `design-system.css`, `hero-dock.css`, `management.css`, `trip.css`) get no migration note.
4. **Architecture is a file list** (lines 6-10, 21-23; design, structural). No load order (tokens, base, site), no interaction of `js/shell.js` and `js/trip/*` with the CSS. `--color-ink-2` as route color is semantic overload; consider a `--color-route` token.
5. **"Hallmark-Stempel" undefined** (line 10; structural, style). Unexplained jargon; "die ersten Zeilen" gives no count and no edit rule.
6. **Rules unmeasurable or unjustified** (lines 14-19; design, style). "Containerbreite", "Radius je Ebene", "eine Stufe kleiner", "Blatt mit drei Stufen (`dvh`)" have no values, levels or tokens. No rationale or verification per rule. No contrast check for cream labels on orange fill. Line 18 (only `transform`/`opacity`) vs. the three-step sheet height is unclear.
7. **Line 8 rule not verifiable** (style, design). "nie als Literal" is absolute with no named check. Suggest "Neue Werte nur hier definieren; Regeln verwenden `var(--…)`" and name `scripts/check-code.js` if it enforces this.
8. **Colors not tied to tokens** (line 4; style, design). Only `--color-accent` is named. Name the others or point to `tokens.css`.
9. **Karte section ambiguous** (line 23; design, style). Fact and rule are mixed; "one color" vs. "dash pattern and symbol" is unexplained; no accessibility analysis. Zoom-Out check: code sets dashes only for plane and walk.
10. **"Karte in der Karte" ambiguous** (line 16; style). "Karte" means a card UI here but the map elsewhere. The word order of "trennen Haarlinien" is hard to parse; no line width given.

## Nits

11. No status/scope header saying what the document governs (structural, style, lines 1-4).
12. German headings vs. English standard; no language convention stated (structural, design).
13. "Buchstaben" should be "Text"/"Schrift" (line 14); "Handy zuerst" is colloquial (line 19); "Reduced-Motion" vs. `prefers-reduced-motion` (line 18).
14. "Kacheln" means UI tiles on line 16 and map tiles on line 23; tile source/version not given (line 23).
15. "Dateien" before "Regeln" puts files before rationale; `js/shell.js` is not listed (design).
16. "Kiln" is used without explanation (line 4).

## Traceability

| Item | Reviewer source |
|---|---|
| 1, 2 | design #1-2, structural #1-2 |
| 3 | design #3, structural #3-4 |
| 4 | design #4, structural #5 |
| 5 | structural #8, style #2, design #4 |
| 6 | design #5, style #4 |
| 7 | style #1, design #2 |
| 8 | style #3, design #7 |
| 9 | design #6, style #6, zoom-out #4 |
| 10 | style #5 |
| 11-16 | structural #6-7, style #7-11, design #8-9, style #3 |
