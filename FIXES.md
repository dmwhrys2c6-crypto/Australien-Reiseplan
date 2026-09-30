# Fehlerbehebungen und Betrieb

Stand: 30. September 2026. Grundlage ist der lokale Projektstand, einschließlich der bereits vorhandenen Änderungen. Die Sicherung vor diesem Durchlauf liegt unter `/private/tmp/australien-before-fixes-20260930`. Es wurde nichts veröffentlicht.

## Aktueller Betrieb: GitHub Pages

Die Website läuft wieder als öffentliche statische Website ohne Anmeldeserver. Diese Änderung ersetzt die zuvor eingeführte Server-Anmeldung ausdrücklich auf Wunsch des Nutzers. Eine Browser-Passwortsperre wird nicht als Zugriffsschutz eingesetzt.

`npm ci` installiert die festgelegten Pakete. `npm start` startet eine statische lokale Vorschau auf Port 3000. `npm run build` exportiert die Website nach `dist`. Die GitHub-Pages-Workflowdatei `.github/workflows/pages.yml` prüft Tests und Build bei einem Push auf `main`. Die bestehende GitHub-Pages-Veröffentlichung aus dem Projektstamm von `main` bleibt erhalten. Der Export in `dist` steht alternativ für eine Veröffentlichung der reinen Laufzeitdateien bereit. Die lokale `.env` bleibt ausgeschlossen und ist für GitHub Pages nicht erforderlich.

Die Navigation verwendet Hash-URLs wie `#reise` und `#finanzen/onsite`. Dadurch bleiben Projektpfade und neu geladene Unteransichten auf statischem Hosting gültig. PWA-Shortcuts verwenden dieselben URLs. Der Service Worker lädt seine Offline-Startseite relativ zum jeweiligen Projektpfad.

Wetter und Wechselkurse werden direkt von den öffentlichen APIs geladen. Die bestehende Gruppensynchronisierung verwendet wieder ihren ursprünglichen Kanal und das ursprüngliche Verschlüsselungsformat. Diese öffentlich ausgelieferte Konfiguration bietet keinen privaten Zugriffsschutz. Lokal gespeicherte Nutzerdaten bleiben erhalten; nach dem ersten vollständigen Download funktioniert die Website auch offline, ohne vorherige Anmeldung.

Die Umstellung wurde zusätzlich unter `/Australien-Reiseplan/` mit einem rein statischen Testserver geprüft: Start ohne Anmeldung, Navigation zu einer Unteransicht, Neuladen derselben Unteransicht und Budgetbedienung funktionieren. Die Gruppensynchronisierung wurde dabei isoliert, damit die Prüfung keine echten Gruppendaten verändert. Die Veröffentlichung erfolgt über den bestehenden GitHub-Pages-Branch-Workflow nach dem Push auf `main`.

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
- **F-012/F-013:** Die anfänglich implementierte Server-Anmeldung wurde für GitHub Pages entfernt. Der aktuelle öffentliche Betrieb ist ausdrücklich gewählt; es gibt keine irreführende Passwortsperre. Der Pages-Build veröffentlicht keine Serverkonfiguration oder `.env`.
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
