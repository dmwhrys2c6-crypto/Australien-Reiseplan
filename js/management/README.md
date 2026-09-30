# Verwaltung der Reise

Die sechs Haupttabs und der bestehende Router bleiben erhalten. Ausflüge ergänzen Erlebnisse; Buchungen, Packliste und Dokumente liegen unter Organisation; die Drohnenkarte bleibt unter Mehr. Untertabs haben Direktlinks, etwa `/erlebnisse#activities`, `/organisation#bookings`, `/organisation#documents`, `/finanzen#expenses` und `/mehr#drone`.

## Module

- `repository.js`: Migration, Datenmodelle, Validierung, Relations, CRUD und berechnete Finanzsummen.
- `ui.js`: reine HTML-Renderer, Filter, Listen, Summary und Activity Cards; Texte werden escaped, URLs geprüft.
- `editor.js`: ein konsistenter nativer Dialog für alle Editoren und Details. Desktop-Drawer und mobile Sheets verwenden die Reise-Stile. Separate Löschbestätigung, Fehler und Submit-Sperre.
- `drone-map.js`: Leaflet-Adapter mit Reiseroute, Spots, Drag-Verschiebung und Provider-Schnittstelle für Flugzonen.
- `page.js`: Auswahl, Filter, Suche, Routing-Integration und Verbindungen zu Tagesplan und Dashboard.
- `css/management.css`: auf die neuen Bereiche begrenzte Erweiterung der vorhandenen Fonts, Akzentfarbe und Glass-Flächen. Dashboard bleibt visuell unverändert.

## Daten und Beziehungen

Expense: id, tripId, dayId, stopId, bookingId, activityId, title, category, amount, currency, date, notes, status, createdAt, updatedAt.

Booking: gemeinsame Basis mit id, tripId, dayId, stopId, title, type, provider, date, startTime, status, price, currency, bookingReference, url, notes, createdAt, updatedAt. Optionale Felder: departureAirport, arrivalAirport, flightNumber, arrivalTime, checkOut, room, guests, attachmentUrl.

Geplante Activities sind Projektionen der kanonischen TripStore-Stops. `activityMeta` enthält nur die zusätzliche Kategorie, Adresse, den Buchungsstatus und eine stabile Activity-ID. Titel, Ort, Zeiten, Koordinaten, Bild, Notizen und Kosten werden aus dem Stop gelesen. Unzugeordnete Ideen liegen in der Activity-Sammlung. Bei Zuordnung entsteht ein Stop; die stabile Activity-ID bleibt erhalten. Bestehende Stops können im Editor verknüpft werden; dabei werden die angezeigten Ausflugsdaten übernommen. Löschen eines zugeordneten Ausflugs entfernt seinen Stop nach Bestätigung.

DroneSpot: id, tripId, dayId, stopId, title, category, latitude, longitude, date, notes, image, favorite, createdAt, updatedAt. Koordinaten sind editierbar und Marker verschiebbar.

Document: nur Metadaten und geprüfte HTTP(S)-Links, keine Dateiuploads oder erfundenen sensiblen Unterlagen.

Beziehungen sind IDs. Das Repository prüft ihre Existenz. Gelöschte Stops löschen Buchungen/Ausgaben nicht mit; fehlende Beziehungen werden in Details markiert und können neu zugeordnet werden. Beim Verschieben eines Stops lesen verknüpfte Einträge seinen aktuellen Tag. `expenseFrom()` übernimmt Preise ausdrücklich auf Nutzeraktion und verwendet bereits verknüpfte Ausgaben erneut. Kosten werden niemals durch das bloße Anlegen eines Stops automatisch abgebucht.

## Persistenz und Datenquellen

Echte lokale Persistenz: vorhandene `aus_roadtrip_expenses_2027` und `aus_roadtrip_bookings_2027`; `aus_management_v1` für Gesamtbudget, unzugeordnete Aktivitäten, Drohnen-Spots und Dokumentlinks; Stops weiterhin `aus_trip_days_v1`. Vorhandene Bestände werden übernommen und normalisiert. Voreingestellte Buchungen/Ausgaben sind die bisherigen Projektbestände; sie werden nicht als extern verifiziert ausgegeben. Das initiale Gruppenbudget wird aus der bisherigen Budgetplanung abgeleitet und ist editierbar.

Es gibt weiterhin keine persistente Server-Datenbank. Der vorhandene Express-Server liefert Auth-, Wetter- und Wechselkurs-Endpunkte. Diese neue Datenebene führt keine automatische Veröffentlichung, Cloud-Synchronisierung oder Drittanbieterübertragung von CRUD-Daten aus. Auf einem anderen Gerät stehen lokale Einträge nicht automatisch zur Verfügung. Das Repository kann später durch eine API ersetzt werden; Renderer erwarten einen geladenen Snapshot, Editoren awaiten Schreibvorgänge.

Finanzsummen verwenden ausschließlich die Budgetwährung. Andere Währungen werden separat gelistet und ausdrücklich nicht mit einem stillschweigend angenommenen Kurs addiert. Das Umrechnungswerkzeug der App bleibt verfügbar.

Flugzonen: `FlightZoneProvider.load({tripId})` liefert `{available, zones, source, message}`. Der Standardprovider liefert keine Zonen und keine Flugfreigabe. Die frühere statische Luftraum-Demodarstellung bleibt verborgen. Ein zukünftiger Anbieter muss aktuelle, nachvollziehbare Daten liefern; erst dann wird der Layer verfügbar. Reiseverbindungen bleiben Luftlinien.

## Integration und Prüfungen

Die vorhandene globale Suchroutine verwendet den aktuellen Repository-Index für Reise, Tage, Stops, Ausflüge, Buchungen, Ausgaben und Drohnen-Spots. Zusätzliche Dokumentlinks liegen in der bestehenden Dokument-Suchkategorie. Die bildbasierte Startseite hat keine sichtbaren Finanz-KPI-Karten; ihr nächstes Ereignis liest die aktuellen Reisetage. Künftige Dashboard-Kennzahlen können dieselbe `summary()`-Datenquelle verwenden.

`npm run check`: klassische Browser-JavaScript-Syntax und Inline-Handler. Kein TypeScript vorhanden; daher kein TypeScript-Typecheck.

`npm run lint`: lokale Syntax-/Whitespace-/Dynamic-Code-Prüfung ohne neue Dependency, kein ESLint.

`npm test`: vorhandene Store-, DOM-, Architektur- und Integritätsprüfungen plus Repository- und Integrationsprüfungen.

`npm run build`: exportiert öffentliche Runtime-Assets nach `dist/`. Für Direktlinks und die vorhandenen API-Endpunkte weiterhin Express oder einen Host mit SPA-Fallback verwenden. Externe Kartenkacheln und CDN-Libraries benötigen beim ersten Abruf Netzwerk; der bestehende Service Worker cacht verfügbare Assets.
