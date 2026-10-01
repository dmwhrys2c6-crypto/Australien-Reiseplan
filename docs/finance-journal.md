# Finanzen und Erinnerungen

## Finanzansicht

`js/management/finance.js` hält den flüchtigen Anzeigemodus. Standard ist ein
Viertel der Gruppenkosten. Das Repository speichert weiterhin volle Beträge;
Bearbeitungsformulare verlangen ausdrücklich den Gruppenbetrag. KPIs,
Ausgabenzeilen, Details, Sprit, Einkäufe und Vor-Ort-Budgets nutzen denselben
Anzeigemodus. Der Währungsrechner konvertiert den tatsächlich eingegebenen
Betrag; er ändert keine gespeicherten Ausgaben.

Der SVG-Donut verwendet `repo.summary()`: bezahlte Ausgaben in der Budgetwährung.
Offene Beträge sind separat angegeben. Fremdwährungen bleiben in ihren eigenen
Ausgabenzeilen und werden ohne festgelegten Kurs nicht in den Donut addiert.
Alle sieben Kategorien stehen zusätzlich als Text in der Legende. Ein leeres
Budget erzeugt einen neutralen Ring und keine ungültigen Prozentwerte.

## Journal

`js/journal/repository.js` verwaltet die IndexedDB-Datenbank und Validierung.
`js/journal/upload.js` verwaltet Dateiauswahl, Drag-and-Drop, Bildverarbeitung,
Formularstatus und Raster. Layout und Oberflächen liegen im Design-System.

Fotos werden auf diesem Gerät gespeichert, nicht auf einem Server. Unterstützt
werden JPG, PNG und WebP, bis 10 Dateien pro Vorgang und 20 MB pro Datei. Sie
werden auf maximal 1600 Pixel Kantenlänge verkleinert und als JPEG gespeichert.
Ein Vorgang wird atomar gespeichert: alle Fotos oder keines. Bei einem Fehler
bleiben die ausgewählten Dateien und Formulareingaben verfügbar.

Alte Journal- und Foto-Sammlungen werden beim ersten Öffnen übernommen. Texte,
Stimmungen, Notizen, Highlights und Links bleiben erhalten. Die alten
localStorage-Sammlungen bleiben zusätzlich unangetastet. Die Migration wird
nicht bei jedem Reload wiederholt. Bestehende externe Fotos bleiben externe
Links; neue Fotos sind lokale Blob-Dateien.

## Mehr

Die Karteninitialisierung und das Skript der Drohnenkarte sind entfernt.
Gespeicherte Spot-Datensätze bleiben im Repository erhalten. Die Oberfläche
führt zu OpenSky/Wing, CASA und Sphere Airspace Advisory. Die vorhandene
Spotify-Playlist ist als eigenes Widget außerhalb der wechselnden Unterbereiche
sichtbar und besitzt einen Direktlink als Alternative zum Embed.
