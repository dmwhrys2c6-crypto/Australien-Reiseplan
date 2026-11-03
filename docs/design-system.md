# Design-System

Dieses Dokument regelt das Aussehen der App. Es ersetzt `css/app.css`, `design-system.css`, `hero-dock.css`, `management.css` und `trip.css`; die Verwaltungs- und Finanzansichten entfallen.

Zwei Ansichten: Startseite (`#dashboard`) und Reiseplan mit Karte (`#reise`). Die Routen verwaltet `js/shell.js`.
Thema "Kiln": fast schwarzer, warmer Grund, cremefarbene Schrift, eine glutorange Signalfarbe.

## Dateien

- `css/tokens.css`: alle Farben, Schriften, Abstände, Radien und Zeiten als Custom Properties. Neue Werte nur hier definieren; Regeln verwenden `var(--…)`. Alle Werte (Breiten, Radien, Schriftstufen, Blatt-Höhen) stehen dort, nicht in diesem Dokument. `npm run check` schlägt bei Farbliteralen in `base.css`, `site.css` und `js/trip/` fehl.
- `css/base.css`: Reset, Typografie, Fokus, Reduced-Motion.
- `css/site.css`: Shell, Landing, Reiseplan, Karte, Dialoge. Die ersten Zeilen sind der Hallmark-Stempel, ein Kommentar des Design-Werkzeugs mit Thema und Entscheidungen (Details in `.hallmark/`).

## Regeln

- Orange (`--color-accent`) ist nur eine Füllung: Hauptaktion, gewählter Tag, gewählter Stopp, Marker. Schrift bleibt creme.
- Eine Hauptaktion je Bildschirm, eine Containerbreite, ein Radius je Ebene.
- Keine verschachtelten Cards: Listen im Tagesplan werden durch Haarlinien getrennt, nicht durch Kacheln.
- Beschriftungen sind Fließtext eine Stufe kleiner, ohne Großbuchstaben und ohne Sperrung.
- Animiert werden nur `transform` und `opacity`; jede Animation hat einen Reduced-Motion-Fallback.
- Mobile First: Tippflächen mindestens 44px, Eingaben 16px, Bottom Sheet (`.trip-sheet`, Tagesplan) mit drei Höhen in `dvh`, Safe-Area-Abstände.

## Karte

Die Karte ist die einzige helle Fläche: OpenStreetMap-Standardkacheln (CARTO verlangt seit 2025 einen API-Key), die Seite darum bleibt dunkel. Dafür gibt es einen eigenen Block in `css/tokens.css`: `--route-blue` (Strecken), `--map-paper`, `--map-ink`, `--map-rule` (Marker, Popups, Chips) und `--map-ground` (Grund, bis Kacheln laden). Das bricht bewusst die Regel "ein Signalton": neben Creme und Orange kommt hier Blau vor.

`js/trip/map-adapter.js` liest die Routenfarbe aus `--route-blue`. Alle Routen haben eine Farbe. Das Verkehrsmittel zeigt ein Symbol in der Routenmitte; Flug und Gehen haben zusätzlich ein Strichmuster, die übrigen Linien sind durchgezogen. Der aktive Marker bleibt orange. Die Kartenquelle liegt auf dem Handy über dem Blatt (`--sheet-visible`).

## Landing

Unter dem Datum steht eine Textzeile: vor der Reise "Noch N Tage", während der Reise "Tag N von 20", danach entfällt sie. Sie rechnet mit dem Gerätedatum und den Reisetagen (`window.tripCountdown` in `js/shell.js`).
