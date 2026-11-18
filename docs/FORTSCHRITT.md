# Fortschritt

Diese Datei ist das Gedächtnis des Projekts. Ein neuer Chat liest sie zuerst und macht dort weiter, wo der letzte aufgehört hat.

## Aktueller Stand

- **Phase:** 1 von 10 – Fundament & Setup
- **Gerät:** **reines Tablet-Spiel** (Android-Tablet, Chrome, Querformat, Touch). Der alte Laptop entfällt seit 18.11.2026 (E-012, E-013).
- **Erledigt:** 1.1, 1.2, 1.3, 1.4, 1.5, 1.6.
- **Nächster Schritt:** Unterphase **1.7 – Durchstich, Abnahme & Übergabe** abschließen. Gebaut und selbst geprüft ist der Durchstich (E-019): „Holz“ in `goods.json`, Test-Holzfäller in `buildings.json` (1 Holz pro Takt), Bau per Befehl `debugPlaceBuilding`, System „Produktion“, Platzhalter-Würfel, Debug-Anzeige oben links. Offen: Tablet-Test durch den Nutzer (Holz zählt, Tempo-Knöpfe, Ein-/Ausklappen, 60 FPS bei 90 Hz gleichmäßig? sonst `?fps=45` vergleichen, E-015), Leistungs-Check gegen LEISTUNGSBUDGET.md, Abnahme-Checkliste, Rückschau, Git-Tag `phase-1`.

## Unterphasen von Phase 1

| Nr. | Unterphase | Status | Erledigt am |
| --- | --- | --- | --- |
| 1.1 | Start, Überblick & Grundentscheidungen | ✅ erledigt | 18.11.2026 |
| 1.2 | Konten, Repository & Verbindung zu Claude | ✅ erledigt | 18.11.2026 |
| 1.3 | Projektgerüst & leere 3D-Szene | ✅ erledigt | 18.11.2026 |
| 1.4 | Automatische Veröffentlichung (Hosting) | ✅ erledigt (Tablet-Test bestätigt, Laptop entfällt) | 18.11.2026 |
| 1.5 | Geräte-Check & Leistungsbudget | ✅ erledigt | 18.11.2026 |
| 1.6 | Kern-Architektur | ✅ erledigt | 18.11.2026 |
| 1.7 | Durchstich, Abnahme & Übergabe | 🔧 in Arbeit (gebaut und selbst geprüft, Tablet-Test offen) | – |

## Wichtige Eckdaten

- **Arbeitstitel:** Kontor & Krone (siehe [ENTSCHEIDUNGEN.md](ENTSCHEIDUNGEN.md), E-002)
- **Repository:** https://github.com/nicozim14-pixel/kontor-und-krone (öffentlich, Hauptzweig `main`; E-003, E-004)
- **Hosting:** GitHub Pages über GitHub Actions (E-004, E-010). Der Nutzer hat die Pages-Quelle auf „GitHub Actions“ gestellt.
- **Spiel-Link:** https://nicozim14-pixel.github.io/kontor-und-krone/ (eingerichtet und auf dem Tablet bestätigt)
- **Geräte-Check:** https://nicozim14-pixel.github.io/kontor-und-krone/check.html (Testseite aus 1.5; `?schnell` = Schnelldurchlauf für Claudes Prüfung)
- **Tablet:** Samsung SM-X210R (vermutlich Galaxy Tab A9+), Android 16, Chrome 157, Adreno 619, ca. 4 GB, 1920 × 1200, Pixeldichte 1,5, 90 Hz. Budget siehe [LEISTUNGSBUDGET.md](LEISTUNGSBUDGET.md).

## Hinweise für den nächsten Chat

- **Verbindung zu GitHub ist eingerichtet:**
  1. Claude-Connector „GitHub Integration“ ist verbunden (eingerichtet im Browser über claude.ai/customize/connectors; in der Claude-App fand der Nutzer diesen Punkt nicht).
  2. Die Claude GitHub App ist installiert und hat Zugriff auf `kontor-und-krone`. Ohne sie kann Claude das Repository nur lesen, und das Hochladen scheitert mit Fehler 403.
- **Sitzungsstart:** Repository `nicozim14-pixel/kontor-und-krone` mit Schreibzugriff an die Sitzung anhängen, klonen, dann diese Datei lesen. Danach `npm install`.
- **Selbst prüfen:** `npm run check` (lint, test, build), danach `npm run screenshot` (Bildschirmfotos in `screenshots/`, Chrome liegt in der Cloud-Umgebung unter `/usr/bin/google-chrome`).
- **Veröffentlichung prüfen:** Jedes Hochladen auf `main` startet den Ablauf „Veröffentlichen“ (`.github/workflows/deploy.yml`, ca. 1 Minute). Den Status liest Claude mit `gh api repos/nicozim14-pixel/kontor-und-krone/actions/runs?per_page=1` (auch `…/runs/<id>/jobs` und `…/deployments` funktionieren).
  - **Nicht möglich aus der Cloud-Umgebung:** die Live-Seite auf github.io öffnen (curl und WebFetch werden blockiert) und die Pages-Einstellungen per API lesen/ändern (`/pages` gesperrt). Die Live-Seite prüft deshalb der Nutzer.
  - Claude darf Workflow-Dateien hochladen (getestet).
- **Technik-Stand (E-005 bis E-011):** TypeScript 6.0.3 (nicht 7, wegen typescript-eslint), Build-Ziel Chrome 111 (E-013), Bildschärfe max. doppelte Pixeldichte, Link-Zusatz `?aufloesung=50`, Update-Hinweis über `version.json`. Babylon.js 9 hat „.pure“-Module; wir importieren bewusst die normalen Module (z. B. `@babylonjs/core/Engines/engine`), weil diese ihre Zusatzfunktionen selbst einbinden.
- **Debug-Anzeige:** zeigt auch **Dreiecke und Draw Calls** (Prüfverfahren aus LEISTUNGSBUDGET.md, Abschnitt 7). Leere Szene mit Holzfäller: 26 Dreiecke, 3 Draw Calls.
- **Architektur (E-016):** Bauplan in [ARCHITEKTUR.md](ARCHITEKTUR.md), Abschnitt 14 listet alle Dateien. ESLint überwacht die Schichten-Regeln (wer wen importieren darf; in `core/`, `data/`, `sim/` keine Browser-Zugriffe, kein `Math.random()`, keine Uhrzeit). Alles, was sich bewegt, muss dem Zeichen-Takt `markActivity` melden, sonst greift das Ruhebild.
- **Prüf-Skript:** `npm run screenshot` prüft auch die Spiel-Schleife (Takte pro Sekunde, Ruhebild, Aufwachen beim Wischen) und die Debug-Anzeige (Holz = Takte, Pause, 4×, Ein-/Ausklappen) über `window.kkStats`.
- **Links in der Claude-App** öffnen sich in deren eingebautem Browser, nicht in Chrome. Für Tests den Nutzer bitten, den Link zu kopieren und in der Chrome-App zu öffnen.
- **Nutzer-Vorlieben:** Rückfragen immer als anklickbare Auswahl. Prompts zum Einfügen (z. B. für den nächsten Chat) immer in einem eigenen Code-Block, damit es einen Kopieren-Knopf gibt. Kurze Antworten, da oft auf Tablet/Handy gelesen.

## Offene Fragen

- Keine.

## Bekannte Probleme

- Keine. (Download beim Start: ca. 271 kB komprimiert, Budget 1 MB.)

## Verlauf

- **18.11.2026 (Chat 1):** Phase 1 gestartet. 1.1 abgeschlossen: Grundbegriffe erklärt, Arbeitstitel „Kontor & Krone“, Repository-Name `kontor-und-krone` und Hosting-Weg (öffentlich + GitHub Pages) entschieden. 1.2 abgeschlossen: Nutzer hat das Repository angelegt, GitHub mit Claude verbunden und die Claude GitHub App installiert. Erster Commit (README, .gitignore, docs/) ist hochgeladen, die README ist auf github.com sichtbar.
- **18.11.2026 (Chat 2):** 1.3 abgeschlossen: Technik-Bündel (E-005 bis E-008) nach Erklärung bestätigt. Projektgerüst mit Vite 8, TypeScript 6, Babylon.js 9, Prettier, ESLint, Vitest. Leere Szene mit Himmel, Dunst-Horizont, türkisem Meer, Sandwürfel, Sonne und Kreisel-Kamera. Tablet-Grundlagen (Gesten-Sperre, Vollbild-Knopf, Querformat-Hinweis, Auflösungs-Begrenzung), Versionsanzeige, Startprüfung mit deutschem Fehler-Hinweis. Selbst geprüft: 13 Tests grün, Bildschirmfotos und simulierte Maus-/Finger-Bedienung im unsichtbaren Chrome in Ordnung.
  1.4 weitgehend erledigt: Veröffentlichungs-Ablauf mit GitHub Actions (prüft, baut, veröffentlicht), Nutzer hat die Pages-Quelle eingestellt, erste Veröffentlichung erfolgreich. Update-Hinweis „Neue Version verfügbar“ auf Wunsch des Nutzers eingebaut (E-011). Spiel-Link in der README. Tablet-Test vom Nutzer bestätigt; Laptop-Test folgt im nächsten Chat.
- **18.11.2026 (Chat 3):** Auf Wunsch des Nutzers ist das Spiel jetzt ein **reines Tablet-Spiel**, der Laptop entfällt (E-012). Damit ist 1.4 abgeschlossen. Technische Folgen (E-013): Build-Ziel Chrome 111 statt 87, Maus nur noch für Claudes Tests, 1.5 nur für das Tablet. Alle Dokumente angepasst, auch die Projekt-Dokumente „Grundlagen/Gesamtplan.txt“ und „Phasen/Phase_01_Fundament_und_Setup.txt“ (Prompt-Version 1.1).
  1.5 begonnen: Testseite `check.html` (Geräte-Angaben + Belastungstest mit 16 Stufen: 500/2.000/10.000/30.000 Greybox-Bäume als Thin Instances, mit/ohne Schatten, volle/halbe Auflösung; Zeitlimit, Abbrechen, Schutz gegen Einfrieren, kopierbarer Ergebnistext). Selbst geprüft im unsichtbaren Chrome (Schnelldurchlauf `?schnell`), 39 Tests grün.
  1.5 abgeschlossen: Messfehler beim Start des Tests behoben (Vollbild-Wechsel abwarten, Vorwärmen), Draw-Call-Stufen ergänzt. Test in Google Chrome 157 auf dem Tablet: 10.000 Bäume mit Schatten bei voller Auflösung = 49 FPS, 1.000 Draw Calls = 90 FPS. docs/LEISTUNGSBUDGET.md geschrieben und vom Nutzer bestätigt (E-014); Bildraten-Begrenzer 60 FPS gewählt (E-015). Projekt in claude.ai vom Nutzer in „Anno 1701 like Browser Game Tablet“ umbenannt.
- **18.11.2026 (Chat 4):** 1.6 abgeschlossen. docs/ARCHITEKTUR.md mit Brettspiel-Vergleich und Diagramm geschrieben; Nutzer hat zugestimmt (E-016), dazu Bedienoberfläche mit HTML/CSS (E-017) und „läuft beim Zurückkehren sofort weiter“ (E-018). Grundgerüst gebaut: Uhr mit Tempo und Schutz vor der Aufhol-Lawine, Ereignis-Bus, Zufall mit Seed (sfc32, getrennte Ströme), Spielzustand mit Versionsnummer und Spielstand-Format, Befehle (Test-Befehl `debugAddGoods`), Daten-Lader mit zod und deutschen Fehlermeldungen, eigene Spiel-Schleife mit Bildraten-Begrenzer 60 FPS und Ruhebild, Schichten-Regeln in ESLint (mit Probedateien geprüft). 95 Tests grün; im unsichtbaren Chrome: 6 Takte in 3 s, Ruhebild 2 Bilder in 2 s, beim Wischen 60 Bilder pro Sekunde.
- **18.11.2026 (Chat 5):** 1.7 begonnen. Durchstich nach Bestätigung des Nutzers gebaut (E-019): Holz und Test-Holzfäller als Datendateien mit Querverweis-Prüfung, Gebäude per Befehl, System „Produktion“, Platzhalter-Würfel in der Inselmitte, Debug-Anzeige mit FPS, Takt, Holz, Dreiecken, Draw Calls, Seed und Tempo-Knöpfen. 116 Tests grün; im unsichtbaren Chrome: Holz = Takte, Pause hält an, 4× = ca. 16 Takte in 2 s.
