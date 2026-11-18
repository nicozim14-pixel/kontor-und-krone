# Fortschritt

Diese Datei ist das Gedächtnis des Projekts. Ein neuer Chat liest sie zuerst und macht dort weiter, wo der letzte aufgehört hat.

## Aktueller Stand

- **Phase:** 1 von 10 – Fundament & Setup
- **Erledigt:** 1.1 und 1.2. Das Repository existiert, ist mit Claude verbunden, und der erste Commit ist hochgeladen.
- **Nächster Schritt:** Unterphase **1.3 – Projektgerüst & leere 3D-Szene**
  (aktuelle Versionen von Vite, TypeScript und den modularen `@babylonjs/…`-Paketen auf npm prüfen, Prettier/ESLint/Vitest einrichten, leere Szene mit Meer, Test-Würfel, Licht und einfacher Kamera, Tablet-Grundlagen, Versionsanzeige)

## Unterphasen von Phase 1

| Nr. | Unterphase | Status | Erledigt am |
| --- | --- | --- | --- |
| 1.1 | Start, Überblick & Grundentscheidungen | ✅ erledigt | 18.11.2026 |
| 1.2 | Konten, Repository & Verbindung zu Claude | ✅ erledigt | 18.11.2026 |
| 1.3 | Projektgerüst & leere 3D-Szene | ⏳ offen | – |
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
- **Sitzungsstart:** Repository `nicozim14-pixel/kontor-und-krone` mit Schreibzugriff an die Sitzung anhängen, klonen, dann diese Datei lesen.
- **Für 1.4 prüfen:** ob Claude Workflow-Dateien (`.github/workflows/…`) hochladen darf. Falls nicht, Ausweg wählen (siehe Phase-1-Prompt, Abschnitt 1.4).
- **Nutzer-Vorlieben:** Rückfragen immer als anklickbare Auswahl; kurze Antworten, da oft auf Tablet/Handy gelesen.

## Offene Fragen

- Keine.

## Bekannte Probleme

- Keine.

## Verlauf

- **18.11.2026 (Chat 1):** Phase 1 gestartet. 1.1 abgeschlossen: Grundbegriffe erklärt, Arbeitstitel „Kontor & Krone“, Repository-Name `kontor-und-krone` und Hosting-Weg (öffentlich + GitHub Pages) entschieden. 1.2 abgeschlossen: Nutzer hat das Repository angelegt, GitHub mit Claude verbunden und die Claude GitHub App installiert. Erster Commit (README, .gitignore, docs/) ist hochgeladen, die README ist auf github.com sichtbar.
