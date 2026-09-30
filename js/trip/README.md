# Reisebereich

Der bestehende Router, die Fonts, CSS-Variablen und Leaflet bleiben erhalten. Die Startseite wird durch die Reise-Styles nicht verändert.

- `repository.js`: Stop-Modell, Validierung, Migration und CRUD-Fassade über `TripStore`. Die Aktivitäten eines Tages sind die kanonischen Stops. Vorhandene Fotospots werden einmalig übernommen; bekannte Koordinaten werden zugeordnet, fehlende bleiben `null`.
- `map-adapter.js`: einzige Leaflet-Abhängigkeit der neuen Ansicht. Render, Focus, Fit, Zoom und Resize können später von einem anderen Provider implementiert werden. Linien verbinden bekannte Standorte direkt; sie sind keine Straßenrouten. Distanzen sind Luftlinie, Fahrzeiten werden nicht geschätzt.
- `components.js`: reine HTML-Renderer, escaped Texte und geprüfte HTTP(S)-URLs.
- `editor.js`: native Dialoge für Fokusbegrenzung und Löschbestätigung, Drawer am Desktop und Sheet auf dem Handy.
- `page.js`: Auswahlzustand, Bottom-Sheet-Zustände, Sortierung und Verbindung zwischen Karte und Timeline. Sortieren funktioniert per Drag-and-drop, Touch-Griff oder Pfeiltasten am Griff.

## Speicherung und spätere Serveranbindung

Reisetage inklusive Stops werden durch `TripStore.replaceDays()` im vorhandenen LocalStorage-Key `aus_trip_days_v1` gespeichert; Reise-Metadaten liegen in `aus_trip_meta_v1`. Keine Server-Datenbank oder Gruppen-Synchronisierung ist derzeit vorhanden. Das Repository verwaltet die eine aktive Reise dieser App; `createTrip`, `getTrip`, `updateTrip`, `deleteTrip` stellen den CRUD-Vertrag bereit. Reise-Erstellung wird im leeren Zustand angeboten, eine globale Reise-Löschaktion wird nicht prominent exponiert.

Ein späteres Backend kann die Repository-Methoden ersetzen. Im Editor werden Schreibvorgänge bereits awaited. Für eine vollständig asynchrone Datenbankanbindung muss das Repository weiterhin einen geladenen Snapshot für synchrone Renderer bereitstellen und Änderungen über `subscribe` veröffentlichen. Die Leaflet-Integration bleibt davon unabhängig.

Tages-IDs und Stop-IDs bleiben beim Sortieren stabil. Die bisherige `dayNumber` bleibt für Links aus Buchungen und Suche erhalten; sichtbare Tagesnummern folgen der aktuellen Reihenfolge. Originale Budgets/Buchungszuordnungen werden nicht automatisch verschoben oder neu berechnet.

Der versteckte `trip-legacy`-Container hält bestehende DOM-Verträge für Suche, Datendarstellung und ältere Tests aufrecht. Das alte Karten-Rendering ist deaktiviert, sobald `TripPage` verfügbar ist. Navigationslinks zu Tagen werden an die neue Ansicht weitergeleitet.

## Prüfen

`node test_trip_repository.js` prüft Migration, CRUD, dauerhafte Speicherung einschließlich leerer Reisen, Sortierung, Validierung und das Verhalten bei vollem Speicher. Die bisherigen Store-/Interaktions-/Integritätstests bleiben verwendbar. Die App verwendet klassische Browser-Scripts, kein TypeScript und keinen konfigurierten Linter; Syntaxprüfungen sollten daher mit `vm.Script` als klassische Scripts erfolgen.
