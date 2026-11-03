# Comprehension Report (Stage 6): docs/design-system.md

## What this proposes

The document describes a visual design system called "Kiln" for a two-view app. The theme is a near-black warm background, cream text, and a single glowing-orange accent color. It sets rules: orange is used only as a fill, never for text. There is one primary action per screen. Lists use hairlines instead of cards. Labels are plain text one size smaller. Only transform and opacity are animated, with reduced-motion fallbacks. Layout is mobile-first. It also says how the map gets its route color and how transport types are told apart.

## How the existing system works, per this document

The app has two views: a start page (`#dashboard`) and a trip plan with a map (`#reise`). Styling lives in three CSS files. `tokens.css` holds all values as custom properties. `base.css` holds reset, typography, focus and reduced-motion. `site.css` holds everything else (shell, landing, trip plan, map, dialogs), and its first lines are a "Hallmark stamp". The map module `js/trip/map-adapter.js` reads the route color from `--color-ink-2`. All routes share that color. Transport type is shown by dash pattern and symbol. Map tiles come from CARTO Dark.

## Findings

1. **Major**, line 10, "Hallmark-Stempel": project-specific term, never defined. Unclear what the stamp is, what it contains, why it sits at the top of `site.css`, or whether it must be maintained.
2. **Major**, lines 14 and 23, `--color-accent` and `--color-ink-2`: two tokens are named but the token set is not listed. `--color-ink-2` is never explained; "ink" implies text color, yet it is the route color. Unclear whether that is deliberate, and how "all routes one color" fits with the orange-only-as-fill rule and the highlight on the selected stop.
3. **Major**, line 19, "Blatt mit drei Stufen (`dvh`)": "Blatt" (a bottom sheet, presumably) is not defined, its three stops are not specified, and it is not said which component or where it appears.
4. **Nit**, line 3, `#dashboard` and `#reise`: no mapping from hash routes to files or code; the router or shell location is not named. The Files section lists only CSS.
5. **Nit**, line 15, "Tag", "Stopp" (and "Tagesplan", line 16): trip-domain terms used without definition; the relation (a day contains stops) is not stated.
6. **Nit**, line 15, "ein Radius je Ebene" / "eine Containerbreite": "Ebene" is not defined; no layers, radii, or width values or tokens are named.
7. **Nit**, line 17, "Beschriftungen": "eine Stufe kleiner" cannot be applied without the type scale or token names.
8. **Nit**, line 8, "Neue Werte gehören hierher": no enforcement or check described (lint, script).
9. **Nit**, line 23, "CARTO Dark": no link, no mention of the library consuming the tiles, the adapter's role is not explained, attribution requirements not mentioned.
