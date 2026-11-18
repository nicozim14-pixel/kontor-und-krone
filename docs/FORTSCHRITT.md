# Fortschritt

Diese Datei ist das Gedächtnis des Projekts. Ein neuer Chat liest sie zuerst und macht dort weiter, wo der letzte aufgehört hat.

## Aktueller Stand

- **Phase:** 1 von 10 – Fundament & Setup
- **Erledigt:** 1.1, 1.2 und 1.3. Das Projektgerüst steht, die leere 3D-Szene baut und läuft im unsichtbaren Chrome (Laptop- und Tablet-Größe). build, test und lint sind fehlerfrei.
- **Nächster Schritt:** Unterphase **1.4 – Automatische Veröffentlichung (Hosting)**
  (GitHub-Actions-Workflow für GitHub Pages, Nutzer stellt in den Repository-Einstellungen die Pages-Quelle ein, Spiel-Link in README eintragen, Test auf Tablet und Laptop)

## Unterphasen von Phase 1

| Nr. | Unterphase | Status | Erledigt am |
| --- | --- | --- | --- |
| 1.1 | Start, Überblick & Grundentscheidungen | ✅ erledigt | 18.11.2026 |
| 1.2 | Konten, Repository & Verbindung zu Claude | ✅ erledigt | 18.11.2026 |
| 1.3 | Projektgerüst & leere 3D-Szene | ✅ erledigt | 18.11.2026 |
| 1.4 | Automatische Veröffentlichung (Hosting) | ⏳ offen | – |
| 1.5 | Geräte-Check & Leistungsbudget | ⏳ offen | – |
| 1.6 | Kern-Architektur | ⏳ offen | – |
| 1.7 | Durchstich, Abnahme & Übergabe | ⏳ offen | – |

## Wichtige Eckdaten

- **Arbeitstitel:** Kontor & Krone (siehe [ENTSCHEIDUNGEN.md](ENTSCHEIDUNGEN.md), E-002)
- **Repository:** https://github.com/nicozim14-pixel/kontor-und-krone (öffentlich, Hauptzweig `main`; E-003, E-004)
- **Hosting:** GitHub Pages (E-004), Einrichtung in 1.4
- **Spiel-Link:** voraussichtlich https://nicozim14-pixel.github.io/kontor-und-krone/ (wird in 1.4 eingerichtet und bestätigt)

## Hinweise für den nächsten Chat

- **Verbindung zu GitHub ist eingerichtet:**
  1. Claude-Connector „GitHub Integration“ ist verbunden (eingerichtet im Browser über claude.ai/customize/connectors; in der Claude-App fand der Nutzer diesen Punkt nicht).
  2. Die Claude GitHub App ist installiert und hat Zugriff auf `kontor-und-krone`. Ohne sie kann Claude das Repository nur lesen, und das Hochladen scheitert mit Fehler 403.
- **Sitzungsstart:** Repository `nicozim14-pixel/kontor-und-krone` mit Schreibzugriff an die Sitzung anhängen, klonen, dann diese Datei lesen. Danach `npm install`.
- **Selbst prüfen:** `npm run check` (lint, test, build), danach `npm run screenshot` (Bildschirmfotos in `screenshots/`, Chrome liegt in der Cloud-Umgebung unter `/usr/bin/google-chrome`).
- **Technik-Stand (E-005 bis E-009):** TypeScript 6.0.3 (nicht 7, wegen typescript-eslint), Build-Ziel Chrome 87, Bildschärfe max. doppelte Pixeldichte, Link-Zusatz `?aufloesung=50`. Babylon.js 9 hat „.pure“-Module; wir importieren bewusst die normalen Module (z. B. `@babylonjs/core/Engines/engine`), weil diese ihre Zusatzfunktionen selbst einbinden.
- **Für 1.4 prüfen:** ob Claude Workflow-Dateien (`.github/workflows/…`) hochladen darf. Falls nicht, Ausweg wählen (siehe Phase-1-Prompt, Abschnitt 1.4).
- **Nutzer-Vorlieben:** Rückfragen immer als anklickbare Auswahl. Prompts zum Einfügen (z. B. für den nächsten Chat) immer in einem eigenen Code-Block, damit es einen Kopieren-Knopf gibt. Kurze Antworten, da oft auf Tablet/Handy gelesen.

## Offene Fragen

- Keine.

## Bekannte Probleme

- Keine. (Hinweis: Das Spiel lädt für die leere Szene ca. 265 kB komprimiert; das Budget dafür wird in 1.5 festgelegt.)

## Verlauf

- **18.11.2026 (Chat 1):** Phase 1 gestartet. 1.1 abgeschlossen: Grundbegriffe erklärt, Arbeitstitel „Kontor & Krone“, Repository-Name `kontor-und-krone` und Hosting-Weg (öffentlich + GitHub Pages) entschieden. 1.2 abgeschlossen: Nutzer hat das Repository angelegt, GitHub mit Claude verbunden und die Claude GitHub App installiert. Erster Commit (README, .gitignore, docs/) ist hochgeladen, die README ist auf github.com sichtbar.
- **18.11.2026 (Chat 2):** 1.3 abgeschlossen: Technik-Bündel (E-005 bis E-008) nach Erklärung bestätigt. Projektgerüst mit Vite 8, TypeScript 6, Babylon.js 9, Prettier, ESLint, Vitest. Leere Szene mit Himmel, Dunst-Horizont, türkisem Meer, Sandwürfel, Sonne und Kreisel-Kamera. Tablet-Grundlagen (Gesten-Sperre, Vollbild-Knopf, Querformat-Hinweis, Auflösungs-Begrenzung), Versionsanzeige, Startprüfung mit deutschem Fehler-Hinweis. Selbst geprüft: 13 Tests grün, Bildschirmfotos und simulierte Maus-/Finger-Bedienung im unsichtbaren Chrome in Ordnung.
