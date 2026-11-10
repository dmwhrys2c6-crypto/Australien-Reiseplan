# Design: Australien 2027

Ruhig, clean, neutral. Weiß, Grau und Fast-Schwarz tragen die Seite, ein einziges Blau markiert, was man anklicken kann oder was gerade aktiv ist. Kein Farbstich, keine Verläufe, keine Fotofilter.

Alle Werte stehen in `css/tokens.css`. Neue Farben nur dort anlegen, nie direkt in `site.css`.

## Farben

| Token | Hell | Dunkel | Wofür |
|---|---|---|---|
| `--color-paper` | `#ffffff` | `#111111` | Seitenhintergrund |
| `--color-paper-2` | `#f5f5f5` | `#1b1b1b` | Ruhige Fläche, Eingabefelder |
| `--color-paper-3` | `#ebebeb` | `#262626` | Hover, ausgewählte Zeile |
| `--color-panel` | `#ffffff` | `#1b1b1b` | Schwebende Panels über der Karte |
| `--color-ink` | `#111111` | `#f2f2f2` | Text, Icons |
| `--color-ink-2` | `#3d3d3d` | `#d0d0d0` | Zweitrangiger Text |
| `--color-muted` | `#6b6b6b` | `#a0a0a0` | Metadaten, Hinweise |
| `--color-rule` | Schwarz 10 % | Weiß 12 % | Linien, Rahmen |
| `--color-accent` | `#1f5fd1` | `#5b8def` | Primärbutton, aktiver Tag, aktiver Marker, Route |
| `--color-accent-hover` / `-active` | `#1a50b3` / `#154296` | `#7aa3f2` / `#4a7be0` | Zustände des Akzents |
| `--color-accent-ink` | `#ffffff` | `#0b0b0b` | Text auf dem Akzent |
| `--color-focus` | `#1f5fd1` | `#7aa3f2` | Fokusrahmen (2 px) |
| `--color-error` / `--color-success` | `#c62828` / `#2e7d32` | `#ef6b6b` / `#6cc070` | Nur Statusmeldungen |

Regeln:

- Blau ist die einzige Farbe. Sie markiert Aktion oder Auswahl, nie Dekoration.
- Die Routenlinie der Karte (`--route-blue`) ist dasselbe Blau.
- Hell ist Standard. Dunkel folgt der Systemeinstellung (`prefers-color-scheme`). `.theme-light` und `.theme-dark` erzwingen ein Schema.
- Der Hero über dem Video und die Kopfzeile der Startseite sind immer dunkel, damit weiße Schrift auf dem Video lesbar bleibt.
- Fotos und Videos zeigen ihre echten Farben, ohne Filter.
- Die Tagesfarben in `js/tripData.js` sind Inhalt, nicht Teil dieser Palette.

## Kontrast (WCAG AA)

- Text `#111111` auf Weiß: 18,9 : 1
- Muted `#6b6b6b` auf Weiß: 5,3 : 1, auf `#f5f5f5`: 4,9 : 1
- Weiß auf Akzent `#1f5fd1`: 5,9 : 1
- `#0b0b0b` auf Akzent dunkel `#5b8def`: 6,6 : 1

## Schrift, Abstände, Formen

Unverändert: Boska für Überschriften, Geist für Text. Abstände, Radien und Bewegung siehe `css/tokens.css`.

Panels über der Karte: weiße Fläche, Haarlinie, weicher Schatten (`--shadow-panel`). Im Dunkelmodus ohne Schatten.
