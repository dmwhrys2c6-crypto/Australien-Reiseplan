# Australien 2027: Startseite und Reiseplan mit Karte

*   **Author:** dmwhrys2c6-crypto
*   **Status:** Draft
*   **Date:** 2026-11-03

--------------------------------------------------------------------------------

## Overview

Die Seite ist ein privater Reiseplaner für vier Personen auf dem Roadtrip von
Wien über Sydney, Brisbane und die Whitsundays nach Melbourne (20. März bis
9. April 2027, 21 Reisetage von Tag 0 bis Tag 20). Sie besteht aus genau zwei
Ansichten:

*   **Startseite (`#dashboard`):** ein Vollbild-Video, der Titel, ein Satz und
    ein Button, der zum nächsten Reisetag springt.
*   **Reiseplan (`#reise`):** eine Vollbild-Karte mit Tagesleiste, Tagesplan und
    Bearbeitung der Stopps.

Alles läuft als statische Seite im Browser, ohne Server und ohne Build-Schritt
für die Laufzeit. Dieses Dokument beschreibt den Stand nach dem Umbau vom
2026-11-03. Es dokumentiert den Ist-Zustand und legt fest, was die beiden
Ansichten leisten müssen.

## The Problem

Die vorherige Version hatte sechs Tabs: Dashboard, Reise, Organisation,
Finanzen, Erlebnisse und Mehr. Daraus ergaben sich drei Probleme:

1.  **Überladen:** Budget, Packliste, Journal, Drohnenkarten, Wetter und eine
    globale Suche konkurrierten mit dem eigentlichen Zweck, dem Reiseplan.
    Gebraucht werden nur der Plan mit Karte und der Einstieg.
2.  **Schlecht auf dem Handy:** Die Seite wurde unterwegs im mobilen Browser
    genutzt, war dort aber unhandlich. Ursache waren unter anderem eine feste
    untere Navigationsleiste, Milchglas-Kacheln in Kacheln und Bedienelemente
    unter der empfohlenen Tippgröße.
3.  **Schwer zu pflegen:** Rund 33.000 Zeilen Code, davon allein 8.000 Zeilen
    in `js/app.js` und 6.000 Zeilen in `css/app.css`, mit mehreren
    konkurrierenden Farbquellen. Der größte Teil diente den gelöschten Tabs.

Die Lösung: Alles außer Startseite und Reiseplan entfällt. Die Gestaltung
läuft über ein einziges Farb- und Schriftsystem (`css/tokens.css`), und die
Reiseansicht ist zuerst für das Handy gebaut.

## Goals

*   **Zwei Ansichten, keine weiteren.** `index.html` enthält `#view-dashboard`
    und `#view-reise`. Jeder andere Hash (zum Beispiel `#mehr`) zeigt die
    Startseite. Direktlinks `#reise`, `#tag-N` und `#day-N` öffnen den
    Reiseplan.
*   **Landing-Video bleibt.** Ab 769px Breite spielt `assets/video/desktop.mp4`,
    bis 768px `assets/video/mobile.mp4`. Das Video pausiert, sobald die
    Startseite nicht sichtbar ist, der Tab im Hintergrund liegt oder die
    Systemeinstellung „Bewegung reduzieren“ aktiv ist.
*   **Nächster Reisetag in einem Tipp.** Der Hauptbutton der Startseite zeigt
    „Tag N“ mit Titel des ersten Tags, dessen Datum heute oder später liegt
    (nach der Reise: der letzte Tag), und öffnet ihn im Reiseplan.
*   **Reiseplan behält jede bisherige Bearbeitung:** Tag wählen, Stopps
    ansehen, Stopp und Tag anlegen, bearbeiten, löschen, Tag duplizieren,
    Stopps per Ziehen oder Pfeiltasten sortieren, Standort per Kartenklick
    setzen, Reise als JSON exportieren.
*   **Handy zuerst.** Alle Tippflächen messen mindestens 44px, Eingabefelder
    16px (iOS zoomt sonst beim Fokussieren), der Tagesplan ist ein Blatt mit
    drei Stufen (eingeklappt, Standard, erweitert), Abstände berücksichtigen
    Notch und Home-Leiste (`env(safe-area-inset-*)`, `viewport-fit=cover`).
*   **Countdown auf der Startseite (Variante A).** Eine Textzeile unter dem Datum
    zählt Kalendertage nach Gerätedatum. Vor der Reise steht dort „Noch N Tage“
    (bei 1: „Noch 1 Tag“), bis zum Beginn von Tag 0 am 2027-03-20. Von Tag 0 bis
    zum letzten Tag steht dort „Tag N von 20“. Nach dem letzten Tag entfällt die
    Zeile. Die Zeile tickt nicht, braucht keine Animation und ändert sich nur
    bei Datumswechsel. Start- und Enddatum kommen aus den Reisetagen, nicht aus
    dem Code.
*   **Karte im Apple-Maps-Stil.** Die Karte ist hell, mit ruhigen, farbig
    abgesetzten Flächen, Parks und Wasser und gut lesbaren Straßennamen. Dafür
    dienen die hellen CARTO-Voyager-Kacheln. Die Seite um die Karte bleibt
    dunkel (Kiln). Strecken sind blau (neues Token `--route-blue`, Kontrast gegen den
    Voyager-Grund mindestens 3:1, bei der Umsetzung zu messen), der aktive
    Marker bleibt orange, das Verkehrsmittel zeigt sich am Strichmuster. Marker,
    Popups und die Kartenquelle bleiben auf dem hellen Grund lesbar.
*   **Ein Designsystem.** Jede Farbe und jede Schrift steht in
    `css/tokens.css`. In `css/site.css` kommt kein Farb- oder
    Schriftliteral vor.
*   **Offline lesbar.** Nach dem ersten Laden öffnet die Seite ohne Netz aus dem
    Service-Worker-Cache. Der Reiseplan liest aus `localStorage`.
*   **Qualitätstore grün.** `npm test`, `npm run check`, `npm run lint` und
    `npm run build` laufen ohne Fehler.

## Non-Goals

*   Budget, Ausgaben, Splitwise-Link, Packliste, Buchungen, Reisejournal,
    Fotogalerie, Drohnenkarten, Wetter, Notfallkontakte und Playlist. Diese
    Funktionen sind entfernt, nicht verschoben.
*   Globale Suche (⌘K) und Hell/Dunkel-Umschalter. Die Seite ist dunkel, nur die Karte ist hell.
*   Echte Apple-Karten (MapKit JS). Sie brauchen ein Apple-Developer-Konto und ein
    Token und lassen sich nicht in Leaflet einbinden. Die Karte ahmt den Stil
    nur nach.
*   Gruppen-Synchronisation über ntfy. Sie glich nur Inhalte der gelöschten
    Tabs ab. Der Reiseplan wurde nie synchronisiert und wird es auch jetzt
    nicht: Jedes Gerät hat seinen eigenen Stand in `localStorage`.
*   Geräteübergreifende Synchronisation des Reiseplans. Jedes Gerät hält seinen
    eigenen Stand in `localStorage`; Abweichungen zwischen den vier Geräten sind
    hingenommen (Entscheidung des Autors, 2026-11-03).
*   Konten, Anmeldung oder ein Server. Der optionale Express-Server
    (`server.js`, `login.html`) bleibt unberührt und ist kein Teil dieses
    Entwurfs.
*   Offline-Karten. Kartenkacheln werden nicht zwischengespeichert, siehe
    offene Fragen.
*   Neue Reisedaten. Titel, Tage und Stopps in `data/trip-days.json` und
    `js/tripMasterData.js` bleiben inhaltlich unverändert.

## Open Questions

*   **„Tag 0 von 20“:** Die Reise hat 21 Tage (Tag 0 bis Tag 20), der Titel sagt
    „20 Tage“. Die Zeile „Tag N von 20“ zeigt am 20.03.2027 „Tag 0 von 20“. Soll
    Tag 0 anders beschriftet werden?
*   **Poster-Bild:** Das Video hat kein `poster`. Bis es lädt, zeigt die
    Startseite nur den dunklen Grund. ffmpeg fehlt in der Entwicklungsumgebung.
    Das Standbild je Video (`poster-desktop.jpg`, `poster-mobile.jpg`, siehe
    Implementierungsplan, Eintrag 22) muss lokal mit ffmpeg erzeugt werden.
*   **Kartenkacheln offline:** Leaflet lädt Kacheln als `<img>` ohne CORS. Der
    Service Worker speichert nur Antworten mit Status 200, also keine. Mit
    `crossOrigin: true` ließe sich das ändern, aber nur, wenn CARTO
    CORS-Header sendet. Das ist ungeprüft. Reicht „Karte braucht Netz“ für
    eine Reise mit Funklöchern im Outback?
*   **Nicht im Browser gesehen:** Das Layout, besonders auf dem Handy, wurde nur
    per Code und Tests geprüft, nicht gerendert (Chrome läuft in der
    Entwicklungs-Sandbox nicht). Offen sind: Passt das eingeklappte Blatt
    (104px) Titel und Metazeile? Verdeckt das Blatt die Kartenquelle
    (Pflichtangabe von OpenStreetMap und CARTO)? Ist die Navigation über hellen
    Videobildern lesbar?
*   **`js/tripData.js`:** 4.800 Zeilen alte Daten, werden nicht mehr geladen.
    `test_phase4_dom_simulation.js` liest sie noch, `test_cleanup.js` nimmt sie
    aus. Löschen und den Test anpassen?
*   **`npm run test:server`:** schlägt in der Sandbox beim Öffnen des Ports fehl
    (EPERM). Ob der Test sonst besteht, ist ungeprüft.

## Critical User Journeys (CUJs)

### CUJ 1: Unterwegs den nächsten Tag öffnen

*   **Given**: Eine Person öffnet die Seite am Handy (390px Breite), die
    installierte PWA oder den Browser. Heute ist der 2027-03-23.
*   **When**: Die Startseite lädt und die Person tippt auf den Button
    „Nächster Reisetag“.
*   **Then**: Das Mobile-Video spielt im Hintergrund. Der Button trägt den
    Titel von Tag 3. Nach dem Tipp zeigt die Seite den Reiseplan mit Tag 3
    gewählt, der Tagesplan liegt als Blatt unten, die Karte zeigt die Stopps
    des Tages. Der Hash ist `#reise`.

### CUJ 2: Stopp ändern und Standort per Karte setzen

*   **Given**: Der Reiseplan ist offen, ein Tag ist gewählt.
*   **When**: Die Person tippt am Stopp auf „Bearbeiten“, dann auf „Standort auf
    Karte wählen“, tippt auf die Karte und bestätigt.
*   **Then**: Der Editor schließt sich für die Kartenwahl und öffnet sich wieder
    mit gesetzten Koordinaten und vorgeschlagenem Ortsnamen. Nach „Speichern“
    ist der Stopp in `localStorage` abgelegt, der Marker liegt am neuen Ort,
    und die Route zeichnet sich neu. Ohne Koordinaten lehnt die Validierung das
    Speichern ab.

### CUJ 3: Ohne Netz den Plan lesen

*   **Given**: Die Seite wurde mindestens einmal online geladen, der Service
    Worker ist aktiv. Das Gerät ist offline.
*   **When**: Die Person öffnet die Seite.
*   **Then**: Ein Hinweis erklärt, dass der Plan aus dem Speicher kommt und
    Kartenkacheln Netz brauchen. Tage, Stopps und Bearbeitung funktionieren.
    Die Karte zeigt Marker und Routen ohne Hintergrundkacheln.

## Technical Plan (Architecture)

### Aufbau

Klassische Skripte ohne Bundler, geladen in fester Reihenfolge am Ende von
`index.html`. Jede Datei hängt ihre API an `window`.

```text
index.html
 ├─ css/tokens.css  Farben, Schriften, Abstände, Radien, Zeiten (:root)
 ├─ css/base.css    Reset, Typografie, Fokus, Reduced-Motion
 ├─ css/site.css    Shell, Landing, Reiseplan, Karte, Dialoge
 │
 ├─ js/persistence.js      localStorage-Schutz gegen veraltete Tabs; meldet Fehler in #manage-live
 ├─ js/trip-store.js       TripStore: Tage und Aktivitäten, lädt data/trip-days.json, Fallback eingebettet
 ├─ js/tripMasterData.js   TRIP_MASTER_DATA: Stammdaten für Migration und Vorbelegung
 ├─ js/trip/repository.js  TripModel + createTripRepository: Validierung, Tage/Stopps, Abos
 ├─ js/trip/map-adapter.js createTripMap: Leaflet, Marker, Routen, Standortwahl
 ├─ js/trip/components.js  TripComponents: reine HTML-Funktionen
 ├─ js/trip/editor.js      createTripEditor: Dialoge für Stopp, Tag, Reise, Löschen
 ├─ js/trip/page.js        TripPage: Zustand (Tag, Stopp, Blatt), Ereignisse, Verdrahtung
 ├─ js/home.js             Landing-Video: Quellenwahl, Abspielen und Pausieren
 └─ js/shell.js            Hash-Routing, nächster Tag, Offline-Hinweis, Service Worker
```

### Datenfluss

```text
data/trip-days.json ─┐
TRIP_MASTER_DATA ────┼─► TripStore ─► createTripRepository ─► TripPage ─► TripComponents ─► DOM
localStorage ◄───────┘   (aus_trip_days_v1)   (validiert, abonnierbar)  │
                                                                         └─► createTripMap ─► Leaflet
```

*   **Quelle der Wahrheit** ist `TripStore` mit dem Schlüssel
    `aus_trip_days_v1` in `localStorage`. Beim ersten Start füllt er sich aus
    `data/trip-days.json`, bei fehlendem Netz oder `file://` aus den
    eingebetteten Fallback-Daten (21 Tage).
*   **`createTripRepository`** kapselt Schreibzugriffe. Er prüft jeden Stopp
    (Titel, Typ, Verkehrsmittel, Region, Ort, Koordinaten im gültigen Bereich,
    Uhrzeit-Format, Endzeit nach Startzeit, Kosten, Währung, https-Links),
    migriert alte Daten einmalig und meldet Änderungen an `TripPage`.
*   **`TripPage`** hält den Anzeigezustand `{dayId, stopId, sheet}` und rendert
    bei jeder Änderung: Kopf, Tagesleiste, Blatt und Karte. Die Reisedaten
    selbst liegen nur im Repository.
*   **`TripComponents`** sind reine Funktionen: Daten rein, HTML-String raus.
    Alle Werte laufen durch `TripModel.escape`.
*   **`createTripMap`** zeichnet Marker und Routen. Alle Strecken haben eine
    Farbe (zur Laufzeit aus einem Token gelesen, weil der Canvas-Renderer keine
    CSS-Variablen auswertet). Die Karte ist hell (CARTO Voyager). Der bisherige
    Wert `--color-ink-2` ist ein heller Cremeton und auf diesem Grund kaum zu
    sehen. Die Strecken lesen deshalb `--route-blue`, ein neues Token in
    `css/tokens.css`. Marker und Popups bekommen helle Flächen mit dunkler
    Schrift, der aktive Marker bleibt orange. Das Verkehrsmittel erkennt man am Strichmuster:
    Flug gestrichelt und gebogen, Fähre gewellt, zu Fuß gepunktet.

### Shell und Routing (`js/shell.js`)

*   Zwei Ansichten: `#view-dashboard` und `#view-reise`, umgeschaltet über die
    Klasse `active`. `window.showView(name, skipHistory)` ist die einzige
    Schaltstelle. Jeder Name außer `dashboard` und `reise` wird aufgelöst
    (`#tag-N` und `#day-N` ergeben `reise`), alles andere ergibt `dashboard`.
*   Der Hash ist der Zustand: `hashchange` ruft `showView` mit
    `skipHistory = true`. Zurück-Taste und Neuladen funktionieren, auch unter
    einem Projektpfad wie `/Australien-Reiseplan/` (GitHub Pages).
*   Der Countdown (`#hero-countdown`) rechnet aus dem Datum des ersten und des
    letzten Reisetags (`TripPage.dateRange()`) und dem Gerätedatum. Er läuft
    bei `trip:ready` und im Minutentakt, damit er nach Mitternacht umspringt.
*   `trip:ready` (von `TripPage`) und ein Minutentakt aktualisieren die
    Beschriftung des Hauptbuttons. `TripPage.nextDay()` liefert den ersten Tag
    mit `date >= heute`.
*   Der Service Worker (`sw.js`) lädt HTML zuerst aus dem Netz und fällt auf den
    Cache zurück, alle übrigen statischen Dateien kommen zuerst aus dem Cache.
    `scripts/version-assets.js` hängt `?v=<hash>` an CSS- und JS-Links, baut die
    Vorab-Cacheliste neu und ändert den Cache-Namen bei jeder Änderung. Eine
    neue Version lädt die Seite beim ersten Besuch danach einmal neu.

### Reiseplan-Layout

*   **Desktop (ab 760px):** Die Karte füllt die Fläche unter der Kopfzeile.
    Links liegen zwei Wells über der Karte: Reisekopf mit Tagesleiste, darunter
    der Tagesplan. Das Blatt hat Breite 440px und im Zustand „erweitert“ 680px.
*   **Handy (bis 760px):** Karte oben, Reisekopf oben als schmale Leiste, der
    Tagesplan als Blatt von unten. Das Blatt ist immer `84dvh` hoch und wird per
    `translate` verschoben (eingeklappt 104px, Standard 46dvh, erweitert 84dvh).
    Nur `transform`-artige Eigenschaften werden animiert, nie Höhe oder
    Position. Kartensteuerung und Statusmeldung folgen der sichtbaren Höhe.
*   **Dialoge** nutzen `<dialog>`: auf dem Handy als Vollbild mit festem Fuß
    (Speichern, Abbrechen), auf dem Desktop als zentrierte Karte.

### Gestaltung

Thema „Kiln“: sehr dunkler, warmer Grund, cremefarbene Schrift, Boska für
Überschriften und Zahlen, Geist für Fließtext. Die Signalfarbe Orange ist nur
eine Füllung (Hauptaktion, gewählter Tag und Stopp, aktiver Marker); Text
darauf bleibt dunkel. Trennung durch Haarlinien statt Kacheln in Kacheln.
Die Karte ist die Ausnahme: Sie ist hell und im Apple-Maps-Stil, und nur dort
gibt es mit `--route-blue` einen dritten Farbton neben Creme und Orange. Das
bricht bewusst die Kiln-Regel „kein dritter Farbton“. Regeln im
Detail: `docs/design-system.md`.

### Fehlerzustände

Jeder Bereich mit Daten hat vier Zustände: Laden („Reiseplan wird geladen …“),
leer („Ein Tag voller Möglichkeiten.“ mit Button), Fehler (Meldung mit „Erneut
laden“; Karte: „Erneut versuchen“) und voll. Speicherfehler erscheinen in
`#manage-live`; Validierungsfehler im Editor unter dem Formular.

## Alternatives Considered

### Alternative A: Alle sechs Tabs und das Layout behalten, nur neu gestalten

*   **Pros**: Weniger Umbauaufwand, alle Funktionen (Budget, Packliste, Journal,
    Drohnenkarten, Wetter) bleiben verfügbar.
*   **Cons**: Die Seite bleibt überladen und auf dem Handy schlecht bedienbar.
    Rund 33.000 Zeilen Code müssten weiter gepflegt werden.
*   **Reason for Rejection**: Rejected by author: Die Seite wirkte zu überladen.
    Der Autor könnte sich die anderen Tabs bei sehr schlichter Gestaltung
    vorstellen, hat sie aber trotzdem gestrichen.

### Alternative B: Die anderen Tabs nur ausblenden statt löschen

*   **Pros**: Die Funktionen ließen sich später wieder einschalten. Die
    Bedienoberfläche wäre trotzdem schlank.
*   **Cons**: Der Code für die ausgeblendeten Tabs bliebe im Repository, würde
    weiter geladen und gepflegt, samt seiner Fehler.
*   **Reason for Rejection**: Rejected by author: Vieles im bestehenden Code war
    fehlerhaft. Der Autor wollte ihn los sein.

### Alternative C: Echte Apple-Karte über MapKit JS

*   **Pros**: Das Original statt einer Nachahmung. Gleiche Straßen, Beschriftung
    und Gebäude wie in der Apple-Karten-App.
*   **Cons**: Braucht ein Apple-Developer-Konto und ein Token im Browser. Läuft
    nicht in Leaflet, also müsste der gesamte Karten-Adapter
    (`js/trip/map-adapter.js`) neu geschrieben werden, auch die Standortwahl
    und die Marker.
*   **Reason for Rejection**: Rejected by author: Gewünscht ist der Stil, nicht
    die Apple-Karte selbst. Das Konto und das Token wären ein Mehraufwand
    ohne Nutzen für den Plan. (Begründung vom Entwurfsverfasser zusammengefasst,
    vom Autor nicht wörtlich geäußert: bitte bestätigen.)

### Alternative D: Streckenfarbe in Glutorange oder warmem Fast-Schwarz

*   **Pros**: Orange hielte das System bei zwei Farben. Fast-Schwarz liefert
    hohen Kontrast auf dem hellen Grund.
*   **Cons**: Orange verwischt den aktiven Marker und hat auf Voyager wenig
    Kontrast. Fast-Schwarz geht zwischen Straßenbeschriftungen unter und wirkt
    weniger nach Apple Maps.
*   **Reason for Rejection**: Rejected by author: Der Autor wählte Blau. Die
    Abwägung (Apple-Maps-Eindruck, klarer Abstand zum orangen Marker) stammt
    aus der Vorlage der Optionen.

### Alternative E: Live-Countdown bis zum Abflug oder nur Tage ohne Reisetag-Anzeige

*   **Pros**: Der Live-Countdown wirkt lebendiger. Die Variante nur mit Tagen
    ist die kleinste.
*   **Cons**: Der Live-Countdown tickt jede Sekunde, braucht einen Ersatz bei
    „Bewegung reduzieren“ und hängt an der Uhrzeit eines Aktivitätseintrags.
    Die Tage-Variante zeigt auf der Reise selbst keine Zählung.
*   **Reason for Rejection**: Rejected by author: Der Autor wählte „Tage bis zur
    Abreise, danach Reisetag“ (Variante A).

### Future Improvements

*   **Helleres Seitenthema:** Der Autor kann sich helle Themes für die gesamte
    Seite vorstellen (zum Beispiel „Refract“ oder „Bloom“). Entschieden ist nur
    die helle Karte.
*   **Framework:** Der Autor kann sich ein Framework (React, Vue) statt
    klassischer Skripte vorstellen. Das ist keine verworfene, sondern eine
    ungewählte Alternative. Auslöser könnte wachsender Zustand oder mehr
    Ansichten sein.


--------------------------------------------------------------------------------

## Detailed Implementation Plan

Der Plan hat zwei Teile. Jeder Eintrag trägt einen Stand:

*   **Erledigt:** im Build vom 2026-11-03 umgesetzt und durch `npm test` abgedeckt.
*   **Offen:** durch diesen Entwurf neu gefordert (helle Karte, blaue Strecken,
    Countdown, Poster) und noch nicht umgesetzt.

### Target Files to Create/Modify

#### 1. `index.html` (Modify)

*   **Type / Scope**: Seitengerüst mit zwei Ansichten.
*   **Erledigt**: Von rund 2.800 auf rund 150 Zeilen gekürzt. Enthält die
    Kopfzeile mit Schriftzug und zwei Links, `#view-dashboard` (Video,
    Titel, Satz, Datum, Buttons „Nächster Reisetag“ und „Alle Tage“),
    `#view-reise` (Karte, Reisekopf, Tagesleiste, Kartensteuerung, Blatt),
    Dialoge `#trip-editor` und `#trip-confirm`, die Statuszone `#manage-live`
    und den Offline-Hinweis. Viewport mit `viewport-fit=cover`. Skripte in
    fester Reihenfolge, Stylesheets einzeln verlinkt, damit
    `scripts/version-assets.js` jeden Hash setzt.
*   **Offen**: (a) Ein Element `<p id="hero-countdown" class="hero-countdown"
    hidden>` direkt nach `.hero-dates`. (b) Nach Freigabe der Poster-Bilder
    (Eintrag 22): Attribute `data-desktop-poster` und `data-mobile-poster` am
    `<video>`. (c) `<meta name="theme-color">` bleibt dunkel, weil die Seite
    dunkel bleibt.

#### 2. `css/tokens.css` (Create, erledigt; Modify, offen)

*   **Type / Scope**: Alle Designwerte als Custom Properties in `:root`.
*   **Erledigt**: Kiln-Tokens (Grund, Schrift, Akzent, Wärmeskala, Schriften,
    Radien, Schatten) und die gemeinsame Skala (Abstände, Schriftgrößen,
    Zeiten, Ebenen).
*   **Offen**: Neue Tokens für die helle Karte, alle in einem eigenen,
    kommentierten Block „Karte“: `--route-blue` (Strecken, Kontrast mindestens
    3:1 gegen den Voyager-Grund, an einem Screenshot zu messen),
    `--map-paper` (helle Fläche für Popups und Streckenchips), `--map-ink`
    (dunkle Schrift darauf), `--map-rule` (Haarlinie auf Hell) und
    `--map-ground` (Hintergrund des Karten-Containers, entspricht dem
    Voyager-Landton, damit nicht geladene Kacheln nicht schwarz aufblitzen).

#### 3. `css/base.css` (Create, erledigt)

*   **Type / Scope**: Reset, Typografie, Fokus, Reduced-Motion.
*   **Erledigt**: Von `theme.mjs scaffold` erzeugt, keine Änderung nötig.

#### 4. `css/site.css` (Create, erledigt; Modify, offen)

*   **Type / Scope**: Shell, Landing, Reiseplan, Karte, Dialoge.
*   **Erledigt**: Kopfzeile fest oben (transparent auf der Startseite, deckend
    im Reiseplan), Landing-Raster, Arbeitsbereich mit Spalte links (Desktop)
    und Blatt mit drei Stufen (Handy), Dialoge als Vollbild am Handy,
    Safe-Area-Abstände, Hover nur bei Geräten mit Hover.
*   **Offen**: (a) `.leaflet-container` bekommt `--map-ground`. (b) Popups,
    Streckenchips (`.trip-route-mode`) und Marker (`.trip-marker`) wechseln auf
    helle Flächen mit `--map-ink`; der aktive Marker bleibt orange mit dunklem
    Symbol. (c) Kartenquelle (`.leaflet-control-attribution`) auf hellem
    Grund mit dunkler Schrift. Auf dem Handy wird sie um die sichtbare Höhe des
    Blatts nach oben verschoben (gleiche Variable `--sheet-visible` wie die
    Kartensteuerung), damit sie nie verdeckt ist. (d) `.hero-countdown`:
    Fließtext eine Stufe kleiner als das Datum, creme, Ziffern tabellarisch,
    kein Großbuchstaben-Label. (e) Die Kartensteuerung bleibt dunkel und
    liegt als dunkle Insel auf der hellen Karte.

#### 5. `js/shell.js` (Create, erledigt; Modify, offen)

*   **Type / Scope**: Routing, Hauptbutton, Offline-Hinweis, Service Worker.
*   **Erledigt**: `showView`, Hash-Auflösung, `jumpToCurrentOrNextDay`,
    Offline-Banner, Registrierung des Service Workers mit Neuladen nach
    Update.
*   **Offen**: Eine reine Funktion `window.tripCountdown(todayIso, days)`, wobei
    `days` die Liste `{dayNumber, date}` ist. Pseudocode:

    ```text
    first = Tag mit frühestem Datum, last = Tag mit spätestem Datum
    wenn days leer: gib '' zurück
    diff(a, b) = ganze Kalendertage zwischen zwei ISO-Daten, gerechnet über UTC-Mitternacht
    wenn today < first.date:
        n = diff(today, first.date)
        gib n == 1 ? 'Noch 1 Tag' : 'Noch ' + n + ' Tage'
    wenn today <= last.date:
        tag = Tag mit date == today
        wenn tag: gib 'Tag ' + tag.dayNumber + ' von ' + last.dayNumber
        sonst: gib ''          (Lücke im Plan: nichts anzeigen)
    sonst: gib ''
    ```

    Eine zweite Funktion schreibt das Ergebnis in `#hero-countdown` und setzt
    `hidden`, wenn der Text leer ist. Sie läuft bei `trip:ready` und im
    bestehenden Minutentakt. `todayIso` stammt aus dem lokalen Gerätedatum
    (`Jahr-Monat-Tag` aus `Date` in lokaler Zeit, nicht `toISOString()`).

#### 6. `js/home.js` (Modify)

*   **Type / Scope**: Landing-Video.
*   **Erledigt**: Quellenwahl nach Breite (768px), Abspielen nur bei sichtbarer
    Startseite und sichtbarem Tab, Pausieren bei „Bewegung reduzieren“,
    Start nach der ersten Berührung, wenn Autoplay blockiert ist.
*   **Offen**: Nach Freigabe der Poster-Bilder setzt `selectVideoSource` auch
    `video.poster` aus `data-desktop-poster` oder `data-mobile-poster`. Fehlt
    das Attribut, bleibt `poster` leer.

#### 7. `js/trip/page.js` (Modify)

*   **Type / Scope**: Zustand und Ereignisse des Reiseplans.
*   **Erledigt**: Kommas statt Mittelpunkte in Meldungen, `TripPage.nextDay()`,
    Ereignis `trip:ready` nach dem Start.
*   **Offen**: `TripPage.days()` liefert eine Kopie der Tage als
    `{dayNumber, date}`, bevor das Repository bereit ist ein leeres Array.
    Der Countdown (Eintrag 5) liest daraus.

#### 8. `js/trip/map-adapter.js` (Modify)

*   **Type / Scope**: Leaflet-Adapter.
*   **Erledigt**: CARTO Dark, ein Farbton für alle Strecken mit Strichmustern,
    Marker ohne Kategoriefarben, neue Zuschnitte für `fit()` und `focus()`.
*   **Offen**: (a) `TILE_URL` auf die Voyager-Kacheln
    (`.../rastertiles/voyager/{z}/{x}/{y}{r}.png`, Unterdomains `abcd`),
    Quellenangabe bleibt OpenStreetMap und CARTO. (b) Die Streckenfarbe liest
    `--route-blue` statt `--color-ink-2`. Das Fallback-Literal im Code ist ein
    Blau, nicht Creme. (c) Weitere Änderungen in diesem Adapter sind nicht
    nötig: Marker und Chips bekommen ihr helles Aussehen über CSS (Eintrag 4).

#### 9. `js/trip/components.js` (Modify, erledigt)

*   **Type / Scope**: Reine HTML-Funktionen.
*   **Erledigt**: Ohne Überzeilen, ohne Mittelpunkt-Ketten (Metazeilen als
    `<span>`s mit CSS-Abstand), „bis“ statt Gedankenstrich, Klassen
    `btn btn-primary` und `btn btn-ghost` statt Glas-Klassen. Alle
    `data-action`-Hooks bleiben.

#### 10. `js/trip/editor.js` (Modify, erledigt)

*   **Type / Scope**: Editor-Dialoge.
*   **Erledigt**: Klassen der Standortwahl-Schaltfläche, Kommas statt
    Mittelpunkte im Tag-Auswahlfeld. Die Logik bleibt unverändert.

#### 11. `js/trip/README.md` (Modify, offen)

*   **Type / Scope**: Dokumentation des Reisebereichs.
*   **Proposed Changes**: Der Text verweist auf den „bestehenden Router“, den
    versteckten `trip-legacy`-Container und die Startseite „durch die
    Reise-Styles unverändert“. Alles drei gilt nicht mehr. Umschreiben auf den
    aktuellen Aufbau: `shell.js` als Router, kein Legacy-Container, Karte
    Voyager mit `--route-blue`.

#### 12. `sw.js` (Modify, erledigt)

*   **Type / Scope**: Service Worker.
*   **Erledigt**: Kachel-Zweig prüft `basemaps.cartocdn.com`. Die
    Vorab-Cacheliste und der Cache-Name werden bei jedem Build neu erzeugt.
    Die Voyager-Kacheln liegen auf derselben Domain, hier ist keine Änderung
    nötig.

#### 13. `manifest.json` (Modify, erledigt)

*   **Type / Scope**: PWA-Manifest.
*   **Erledigt**: Kürzere Beschreibung, dunkle Hintergrund- und Themenfarbe,
    ein einziger Shortcut `./#reise`.

#### 14. `server.js` (Modify, erledigt)

*   **Type / Scope**: Optionaler Express-Server.
*   **Erledigt**: Die erlaubten Routen sind nur noch `/`, `/index.html`,
    `/dashboard` und `/reise`.

#### 15. `scripts/check-code.js` (Modify, erledigt)

*   **Type / Scope**: Syntax- und Lint-Prüfung.
*   **Erledigt**: `--lint` prüft jetzt `js/trip/` statt `js/management/` auf
    dynamischen Code und Leerzeichen am Zeilenende.

#### 16. `package.json` (Modify)

*   **Type / Scope**: Skripte und Beschreibung.
*   **Erledigt**: Fünf gelöschte Tests aus `npm test` entfernt, Beschreibung
    gekürzt.
*   **Offen**: `node test_countdown.js` an `npm test` anhängen (Eintrag 19).

#### 17. `docs/design-system.md` (Modify)

*   **Type / Scope**: Beschreibung des Designsystems.
*   **Erledigt**: Auf Kiln, die drei Stylesheets und die Regeln umgeschrieben.
*   **Offen**: Abschnitt „Karte“ auf Voyager, `--route-blue`, helle Chips und
    die Ausnahme von der Zwei-Farben-Regel erweitern. Abschnitt „Landing“
    mit Countdown ergänzen.

#### 18. Bestehende Tests (Modify, erledigt)

*   **Type / Scope**: Anpassung an die zwei Ansichten. Die Prüfungen zu Hash,
    Neuladen, Zurück, Offline-Start und Daten bleiben.
*   **Proposed Changes** (Stand erledigt):
    *   `test_pages.js`: Prüft `js/shell.js` per `vm` (Hash-Auflösung,
        Projektpfad, Fallback) und die Manifest-Shortcuts.
    *   `test_phase1.js`: Genau eine aktive Ansicht, Navigationszustand,
        Body-Klassen, Verlauf.
    *   `test_cleanup.js`: Ausnahme für `js/tripData.js`, sonst unverändert.
    *   `test_zielarchitektur.js`: Prüft neue IDs, Skripte und Selektoren statt
        der alten Fullscreen-IDs. Der TripStore-Teil bleibt.
    *   `test_phase4_dom_simulation.js`: Datenprüfungen bleiben, Abschnitte 5
        und 6 prüfen neue IDs und Blatt-Zustände.
    *   `test_integrity.py`: Prüft 21 Tage, `renderTimeline`, Shell-Funktionen,
        beide Ansichten und beide Videos.
    *   `test_fixes.js`: Budget- und Sync-Prüfungen entfernt (die Funktionen
        sind gelöscht), Reparaturen am Store bleiben.
    *   `test_server.js`: Pfad `/js/shell.js` statt `/js/app.js`.
*   **Offen**: `test_zielarchitektur.js` ergänzt vier Prüfungen:
    `js/trip/map-adapter.js` nennt `rastertiles/voyager`, nennt nicht
    `dark_all`, liest `--route-blue`, und `css/tokens.css` definiert
    `--route-blue`.

#### 19. `test_countdown.js` (Create, offen)

*   **Type / Scope**: Unit-Test für `tripCountdown`.
*   **Proposed Changes**: Lädt `js/shell.js` in einem `vm`-Kontext. Prüft:
    „Noch 142 Tage“, „Noch 1 Tag“ am Vortag, „Tag 0 von 20“ am 2027-03-20,
    „Tag 20 von 20“ am 2027-04-09, leere Zeichenkette am 2027-04-10 und bei
    leerer Tagesliste, leere Zeichenkette in einer Datumslücke, und gleiche
    Ergebnisse über die Zeitumstellung (zwei Tage rund um 2027-03-28).

#### 20. Gelöschte Dateien (Delete, erledigt)

*   **Type / Scope**: Alles, was nur die entfernten Tabs bediente.
*   **Proposed Changes**: Gelöscht wurden:
    *   `css/app.css`, `css/hero-dock.css`, `css/management.css`,
        `css/design-system.css`, `css/trip.css`: ersetzt durch Eintrag 2 bis 4.
    *   `js/app.js` (8.046 Zeilen: Budget, Packliste, Journal, Drohnenkarten,
        Wetter, Suche, Sync, alter Router), `js/router.js`, `js/reiseApp.js`,
        `js/components.js`, `js/session.js`: gehören zu den gelöschten Tabs
        oder zum Gruppen-Sync.
    *   `js/management/` (`README.md`, `editor.js`, `finance.js`, `page.js`,
        `repository.js`, `ui.js`) und `js/journal/` (`repository.js`,
        `upload.js`): Verwaltung, Finanzen und Journal.
    *   `docs/finance-journal.md`: beschreibt gelöschte Funktionen.
    *   `test_management_repository.js`, `test_finance_journal.js`,
        `test_management_dom.py`, `test_phase2.js`, `test_session.js`: prüften
        nur gelöschte Funktionen.

#### 21. `.gitignore` (Modify, offen)

*   **Type / Scope**: Ausschlussliste.
*   **Proposed Changes**: Zeile `.hallmark/` ergänzen. Der Ordner enthält
    Messprotokolle und Screenshots des Umbaus und gehört nicht ins
    Repository.

#### 22. `assets/video/poster-desktop.jpg` und `assets/video/poster-mobile.jpg` (Create, offen, abhängig von dir)

*   **Type / Scope**: Standbilder, die erscheinen, solange das Video lädt.
*   **Proposed Changes**: Ein Bild je Video, aus einem Frame bei etwa 0,2
    Sekunden: `ffmpeg -i assets/video/desktop.mp4 -frames:v 1 -q:v 3
    assets/video/poster-desktop.jpg`, entsprechend für `mobile.mp4`. In der
    Entwicklungs-Sandbox ist ffmpeg nicht installiert, das Erzeugen muss lokal
    geschehen. Bis die Dateien vorliegen, entfallen die Attribute in
    Eintrag 1 und 6, und die Startseite zeigt den dunklen Grund.

### Dateien ohne Änderung

*   `js/persistence.js`, `js/trip-store.js`, `js/tripMasterData.js`,
    `js/trip/repository.js`, `data/trip-days.json`: Daten- und Speicherschicht
    bleibt unverändert.
*   `js/tripData.js`: wird nicht mehr geladen. Löschen oder behalten ist offen
    (Open Questions).
*   `login.html`, `js/login.js`: Teil des optionalen Express-Servers.
*   `scripts/build.js`, `scripts/version-assets.js`, `scripts/pages-preview.js`,
    `scripts/browser-fixture.js`, `.github/workflows/pages.yml`: Build und
    Prüfung bleiben, sie lesen die Dateiliste aus `index.html`.
*   `assets/video/desktop.mp4`, `assets/video/mobile.mp4`: die Videos der
    Startseite.
*   `FIXES.md`: Protokoll vom 2026-09-30. Es beschreibt Funktionen der
    gelöschten Tabs und ist insoweit überholt. Es bleibt als Verlauf stehen.
*   `Hintergrund Video Desktop.mp4`, `Hintergrund Video Mobile.mp4` im
    Hauptordner (zusammen rund 120 MB): von keiner Datei eingebunden. Löschen
    ist nicht Teil dieses Entwurfs.

### Verification Plan

*   **Compilation/Build**: `npm run build` (erzeugt `dist/`, setzt die
    `?v=`-Hashes in `index.html`, schreibt Cacheliste und Cache-Namen in
    `sw.js`).
*   **Unit Tests**: `npm test` (aktuell 9 Tests, plus `test_countdown.js`
    nach Umsetzung).
*   **Static Analysis & Linting**: `npm run check` (Syntax aller Skripte und
    Inline-Handler) und `npm run lint` (kein dynamischer Code, keine
    Leerzeichen am Zeilenende in `js/trip/`). Zusätzlich
    `node ~/.claude/skills/hallmark/scripts/sloplint.mjs index.html css/site.css
    --genre atmospheric --scope app --kept`: erwartet keine neuen Verstöße
    außer den dokumentierten „kept“-Einträgen der entfernten Tabs.
*   **Test Coverage Requirement**: Keine Prozentvorgabe. Jede reine Funktion
    (`tripCountdown`, Hash-Auflösung) hat einen eigenen Test.
*   **E2E/Integration (manuell, bisher nicht durchgeführt)**: Screenshots bei
    390 × 844 und 1440 × 900 (`#dashboard`, `#reise`, Tag gewählt,
    Editor offen). Prüfen: Blatt-Stufen auf dem Handy, Kartenquelle nicht
    verdeckt, Kontrast von `--route-blue` gegen den Kartengrund (mindestens
    3:1) und von Text auf der Landing, Fokus sichtbar, Video startet und
    pausiert, Tippflächen mindestens 44px. Auf dem Gerät: Seite offline
    öffnen, Plan lesen, Stopp bearbeiten.

--------------------------------------------------------------------------------

*Drafted with EGM*
