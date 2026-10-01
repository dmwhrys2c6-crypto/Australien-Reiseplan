# Gemeinsames Design-System

`css/design-system.css` besitzt alle gemeinsamen Oberflächen, Farben und Schatten.
Die übrigen Stylesheets liegen in `@layer legacy` und liefern bestehende Layouts.
Unlayered Regeln des Design-Systems haben Vorrang vor diesen Layout-Regeln.

## Komponenten

- `glass-container`: gemeinsamer Slate-Seitenhintergrund, auch auf der Startseite.
- `glass-card`: transparente Sektion mit Blur, Rahmen und zentralem Schatten.
- `glass-row-item`: einheitliche Listenzeile mit 16px Padding und 14px Rundung.
- `glass-pill`: Filter, Status und kompakte Aktionen.
- `glass-toolbar`, `glass-search`, `glass-filter-bar`: gemeinsame Suche und Filter.
- `glass-switch`: beschriftete native Checkbox mit sichtbarem Fokus.

`ManagementUI.row()` in `js/management/ui.js` erzeugt die Zeilenstruktur für
Buchungen, Ausgaben, Dokumente, Drohnen-Spots und Packliste.
`ManagementUI.filters()` erzeugt die gemeinsame Such- und Filterstruktur.
Die Datenfilterung, Speicherung und Pack-Fortschrittsberechnung bleiben in
`js/app.js`; die wiederverwendbare Zeilenstruktur gehört zum UI-Modul.

## Änderungen und Erweiterungen

Farben, Rundungen oder Schatten zentral über die `--glass-*` Variablen ändern.
Neue Oberflächen erhalten die gemeinsamen Klassen. Tab-spezifische Klassen
dürfen Anordnung und Abstände steuern, aber keine eigene Oberfläche erzeugen.
Keine Inline-Farben oder Inline-Schatten ergänzen. Dynamische Werte wie eine
Fortschrittsbreite dürfen weiterhin inline gesetzt werden.

Der Dunkelmodus überschreibt dieselben Tokens für alle Seiten gemeinsam.
Auf kleinen Bildschirmen umbrechen Zeilenaktionen; Filter scrollen innerhalb
ihrer Leiste. Suchfelder, Filter und Checkboxen bleiben per Tastatur bedienbar.

`test_phase2.js` prüft die zentrale CSS-Zuständigkeit, gemeinsame Zeilenstruktur,
Packlistenfilter und Fortschrittsberechnung. Zusätzlich die Darstellung im
Browser prüfen, wenn sich Layout oder responsive Regeln ändern.
