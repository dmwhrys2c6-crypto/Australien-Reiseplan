# Fehlerbehebungen und Betrieb

Stand: 30. September 2026. Grundlage ist der lokale Projektstand, einschließlich der bereits vorhandenen Änderungen. Die Sicherung vor diesem Durchlauf liegt unter `/private/tmp/australien-before-fixes-20260930`. Es wurde nichts veröffentlicht.

## Anmeldung und Start

`npm ci` installiert die durch `package-lock.json` festgelegten Pakete. `npm start` startet den Express-Server auf Port 3000. Die lokal angelegte und von Git ausgeschlossene `.env` enthält den neuen `AUTH_CODE`, `SESSION_SECRET`, `SYNC_SECRET` und `SYNC_TOPIC`. Der bisher öffentlich enthaltene Code funktioniert nicht mehr. Zugangscode und Sync-Konfiguration werden vom Server verwaltet.

Für den privaten Betrieb muss die Website über diesen Server bereitgestellt werden; ein öffentlicher statischer Export von `dist` schützt die Dateien nicht. Bei Hosting hinter einem HTTPS-Reverse-Proxy wird `TRUST_PROXY=1` nur verwendet, wenn tatsächlich ein vertrauenswürdiger Proxy vorgeschaltet ist. Die lokale Entwicklung läuft ohne Proxy.

Nach erfolgreicher Online-Anmeldung speichert der Browser die Gerätefreigabe in IndexedDB. Damit funktioniert der bereits heruntergeladene Reiseplan offline. Abmelden entfernt Freigabe und App-Caches, lässt Reise-, Journal-, Foto- und sonstige lokale Nutzerdaten bestehen. Eine abgelaufene Online-Sitzung verlangt eine neue Anmeldung. Server-Neustarts beenden bestehende Online-Sitzungen.

Die neue private Sync-Konfiguration verwendet einen neuen Kanal und Schlüssel. Vorhandene lokale Daten bleiben erhalten; alte Cloud-Nachrichten werden nicht automatisch in den neuen Kanal übernommen. Alle Teilnehmer müssen dieselbe Serverinstallation beziehungsweise Sync-Konfiguration verwenden.

## Zuordnung zum Fehlerbericht

- **F-001:** Alle HTML-IDs sind eindeutig. Versteckte Legacy-Felder haben eigene IDs; wiederholte aktive Anzeigen verweisen auf ihre gemeinsame Quelle. Zusätzliche Prüfung verhindert selbstreferenzielle Anzeige-Beobachter.
- **F-002:** Beide Fotogalerien werden aus derselben Sammlung gerendert. Ihre Karten besitzen unterschiedliche DOM-IDs.
- **F-003/F-004:** Das Vor-Ort-Budget ist ein täglicher Betrag pro Person. Tages- und Gesamtsummen berücksichtigen vier Personen und die aktuelle Tagesanzahl. Null bleibt nach erneutem Laden erhalten. Bestehende Gesamtbeträge werden beim Lesen in Tagesbeträge umgerechnet.
- **F-005:** Ein Tageswechsel speichert einen offenen Journal-Entwurf vor dem Wechsel. Bei Speicherfehlern bleibt die Eingabe erhalten. Löschen beendet offene Autosave-Timer; vor dem Schließen wird ein offener Entwurf gespeichert.
- **F-006:** Speicherfehler werden angezeigt; betroffene Dialogaktionen brechen vor Erfolgsmeldungen ab. Zusammengehörige Sync-Schreibvorgänge prüfen vorherige Werte und setzen bereits geschriebene Werte bei einem fehlgeschlagenen Schreibvorgang zurück.
- **F-007:** Kopierte Aktivitäten erhalten neue IDs einschließlich ihrer `activityMeta`-IDs.
- **F-008:** Explizit gelöschte Koordinaten bleiben leer; veraltete `coords` überschreiben sie nicht.
- **F-009:** Repository-Zugriffe auf denselben Store teilen den Zustand der Reisemetadaten.
- **F-010:** Journal- und Foto-Tagesauswahl folgen dem aktuellen TripStore. Unterkunftsobjekte werden als Namen angezeigt. Neu angelegte Tagesnummern werden nicht wiederverwendet, damit alte Erinnerungen nicht einem neuen Tag zugeordnet werden.
- **F-011:** JSON-Importe prüfen Tagesnummern, Titel, Aktivitäten und doppelte Nummern und werden dauerhaft gespeichert. Ungültige Importe verändern den gespeicherten Stand nicht.
- **F-012/F-013:** Server-Anmeldung, signierte HttpOnly-Sitzungscookies, begrenzte Anmeldeversuche und geschützte App-Dateien ersetzen das öffentliche Frontend-Passwort. Projektdateien und `.env` werden nicht ausgeliefert. Gesperrte Inhalte sind nicht per Tastatur bedienbar.
- **F-014:** Ein Tab mit veraltetem Speicherstand darf neuere Daten nicht still überschreiben; stattdessen erscheint eine Aufforderung zum Neuladen. Dies schützt gewöhnliche aufeinanderfolgende Änderungen. Extrem zeitgleiche Schreibvorgänge sind mit synchronem localStorage nicht vollständig transaktional abgesichert.
- **F-015:** Veraltete oder bereits übernommene Cloud-Snapshots werden verworfen. Auch reine Änderungen an Tankdaten werden erkannt. Bei abweichenden lokalen Daten muss die Übernahme bestätigt werden; empfangene und vorherige Version werden lokal gesichert.
- **F-016/F-017:** Proxy und direkte Wetter-/Kursabfragen haben unabhängige Zeitlimits. Gespeicherte, veraltete und Fallback-Daten werden entsprechend gekennzeichnet; Offline-API-Antworten tragen Stale-Metadaten.
- **F-018:** Externe Backend-Abfragen besitzen Zeitlimits, Validierung, Cache und gemeinsame laufende Anfragen. Ein ausgefallener Dienst blockiert den Endpunkt nicht unbegrenzt.
- **F-019/F-020:** Unbekannte Routen liefern 404; unbekannte APIs liefern JSON mit Status 404. PWA-Shortcuts verwenden vorhandene Routen.
- **F-021:** Lokale Assets besitzen Inhaltsversionen. Der Offline-Cache berücksichtigt auch die Reisedaten; eine Version wird erst vollständig installiert. App-Updates werden aktiv geprüft. Bereits installierte alte Versionen müssen einmal online aktualisiert werden, bevor der neue Offline-Stand verfügbar ist.
- **F-022/F-023:** Foto-Links erlauben nur HTTP/HTTPS. Ein fehlgeschlagenes Ersatzbild löst keine wiederholte Fehlerkette aus.
- **F-024/F-025/F-027:** Debugger und Server verwenden Port 3000. Express ist installiert; ein Lockfile legt die Paketversionen fest.
- **F-026:** Zusätzliche ausführbare Tests decken die behobenen Speicher-, Modell-, Journal-, Budget-, Sync-, Session- und HTTP-Probleme ab.
- **F-028:** Neue Supermarkt-Einträge speichern den bei der Erfassung verwendeten Wechselkurs; die Darstellung nutzt diesen Kurs. Ältere Einträge ohne gespeicherten Kurs verwenden den aktuellen Kurs.

## Verifikation

`npm run check`, `npm run lint`, `npm test`, `npm run test:server` und `npm run build` sind die Prüfkommandos. Die HTTP-Tests verwenden ausschließlich Test-Zugangsdaten und simulierte externe Dienste; sie prüfen auch sämtliche Offline-Dateien und Zeitlimit-Fallbacks.

Im Browser wurden Anmeldung, Navigation, Journal-Tageswechsel mit Rückkehr zum erhaltenen Text, beide Galerie-Datenquellen, die Tagesbudgetrechnung sowie eine mobile Ansicht geprüft. Im frischen Browser-Cache wurde der Testserver gestoppt: Die Website ließ sich offline erneut laden und das Budget weiterhin bedienen. Die mobile Budgetansicht zeigte keinen horizontalen Seitenüberlauf. Die Prüfaufnahme liegt in `fixes-mobile-proof.jpg`.

Eine echte Synchronisierung zwischen mehreren Geräten und reale Gruppen-Cloud-Schreibvorgänge wurden nicht ausgeführt. Die vorhandene Windy-Einbettung meldete in einer Browserrunde Fehler ihrer externen EventSource-Verbindung; die App-eigenen geprüften Abläufe funktionierten. Die Prüfungen sind keine vollständige Simulation sämtlicher Geräte, Netzwerkzustände oder gleichzeitiger Browser-Schreibvorgänge.
