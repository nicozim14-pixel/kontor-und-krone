# Fortschritt

Diese Datei ist das Gedächtnis des Projekts. Ein neuer Chat liest sie zuerst und macht dort weiter, wo der letzte aufgehört hat.

## Aktueller Stand

- **Phase:** 2 von 10 – Greybox-Prototyp: Welt, Kamera & Bauen (Prompt: Projekt-Dokument „Phasen/Phase_02_Welt_Kamera_Bauen.txt“)
- **Phase 1 abgeschlossen** am 19.11.2026 (Abschluss-Commit `06f83f4`; der Git-Tag `phase-1` ist noch offen, siehe „Bekannte Probleme“).
- **Gerät:** **reines Tablet-Spiel** (Android-Tablet, Chrome, Querformat, Touch). Der alte Laptop entfällt seit 18.11.2026 (E-012, E-013).
- **Erledigt in Phase 2:** 2.1, 2.2. **2.3 ist gebaut und veröffentlicht, der Tablet-Test des Nutzers steht aus.**
- **Nächster Schritt:** Rückmeldung des Nutzers zum Tablet-Test von 2.3 (Checkliste siehe „Hinweise für den nächsten Chat“). Gefallen die Welten und liegt die Bildrate im Budget, ist 2.3 erledigt (dann Status in der Tabelle setzen und Bildrate in LEISTUNGSBUDGET.md, Abschnitt 9, eintragen). Änderungswünsche betreffen meist nur Zahlen in `src/data/worldgen.json` (E-027). Danach 2.4 „Spiel-Kamera per Touch“ (ersetzt `render/previewCamera.ts`).

## Unterphasen von Phase 2

| Nr. | Unterphase | Status | Erledigt am |
| --- | --- | --- | --- |
| 2.1 | Start, Überblick & Grundentscheidungen | ✅ erledigt (E-021 bis E-024) | 19.11.2026 |
| 2.2 | Raster & Welt-Datenmodell | ✅ erledigt (E-025) | 19.11.2026 |
| 2.3 | Insel- & Weltgenerator | 🔶 gebaut (E-027), Tablet-Test durch den Nutzer steht aus | – |
| 2.4 | Spiel-Kamera per Touch | offen | – |
| 2.5 | Bausystem: Platzieren, Drehen, Abriss | offen | – |
| 2.6 | Straßen, automatische Ausrichtung & Pipette | offen | – |
| 2.7 | Spielgefühl, Leistungs-Check, Abnahme & Übergabe | offen | – |

**Grundentscheidungen von Phase 2 (2.1):** Test-Welt 256 × 256 Kacheln mit 6–8 Inseln, 1 Kachel = 2 m (E-021) · Bau-Werkzeug per Knopf, mit Werkzeug bewegen 2 Finger die Karte (E-022) · Gelände weich und natürlich, Ebenen flach, Raster nur beim Bauen (E-023) · Wälder ab Phase 2, Bauen räumt Bäume weg (E-024).

## Unterphasen von Phase 1

| Nr. | Unterphase | Status | Erledigt am |
| --- | --- | --- | --- |
| 1.1 | Start, Überblick & Grundentscheidungen | ✅ erledigt | 18.11.2026 |
| 1.2 | Konten, Repository & Verbindung zu Claude | ✅ erledigt | 18.11.2026 |
| 1.3 | Projektgerüst & leere 3D-Szene | ✅ erledigt | 18.11.2026 |
| 1.4 | Automatische Veröffentlichung (Hosting) | ✅ erledigt (Tablet-Test bestätigt, Laptop entfällt) | 18.11.2026 |
| 1.5 | Geräte-Check & Leistungsbudget | ✅ erledigt | 18.11.2026 |
| 1.6 | Kern-Architektur | ✅ erledigt | 18.11.2026 |
| 1.7 | Durchstich, Abnahme & Übergabe | ✅ erledigt (Tablet-Test Schritte 1–6 vom Nutzer bestätigt) | 19.11.2026 |

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
- **Git-Tags am Phasenende (E-026):** Claude kann keine Tags hochladen. Der Nutzer legt sie mit Claudes Klick-Anleitung über die GitHub-Webseite an (Releases → Draft a new release → Choose a tag → Target → Publish release).
- **Selbst prüfen:** `npm run check` (lint, test, build), danach `npm run screenshot` (Bildschirmfotos in `screenshots/`, Chrome liegt in der Cloud-Umgebung unter `/usr/bin/google-chrome`).
- **Veröffentlichung prüfen:** Jedes Hochladen auf `main` startet den Ablauf „Veröffentlichen“ (`.github/workflows/deploy.yml`, ca. 1 Minute). Den Status liest Claude mit `gh api repos/nicozim14-pixel/kontor-und-krone/actions/runs?per_page=1` (auch `…/runs/<id>/jobs` und `…/deployments` funktionieren).
  - **Nicht möglich aus der Cloud-Umgebung:** die Live-Seite auf github.io öffnen (curl und WebFetch werden blockiert) und die Pages-Einstellungen per API lesen/ändern (`/pages` gesperrt). Die Live-Seite prüft deshalb der Nutzer.
  - Claude darf Workflow-Dateien hochladen (getestet).
- **Technik-Stand (E-005 bis E-011):** TypeScript 6.0.3 (nicht 7, wegen typescript-eslint), Build-Ziel Chrome 111 (E-013), Bildschärfe max. doppelte Pixeldichte, Link-Zusatz `?aufloesung=50`, Update-Hinweis über `version.json`. Babylon.js 9 hat „.pure“-Module; wir importieren bewusst die normalen Module (z. B. `@babylonjs/core/Engines/engine`), weil diese ihre Zusatzfunktionen selbst einbinden.
- **Debug-Anzeige:** zeigt auch **Dreiecke und Draw Calls** (Prüfverfahren aus LEISTUNGSBUDGET.md, Abschnitt 7). Leere Szene mit Holzfäller: 26 Dreiecke, 3 Draw Calls.
- **Weltgenerator (2.3, E-027):** `sim/worldgen/` in sechs Schritten (ARCHITEKTUR.md, Abschnitt 4.2), Regeln in `src/data/worldgen.json`. Neue Partie über `sim/newGame.ts` (`createNewGame(seed, data)`). Darstellung: `render/worldScene.ts` (ersetzt die Test-Szene), ein Netz pro Insel, Meeresboden + durchscheinendes Wasser, Bäume als Thin Instances. **Vorläufig:** Kreisel-Kamera für die ganze Karte (`render/previewCamera.ts`, bis 2.4); Test-Holzfäller auf dem Startplatz der größten Insel (`sim/startArea.ts`, bis 2.5). Debug-Anzeige: Seed eingeben / „Neue Welt (Zufall)“ (lädt die Seite mit `?seed=…`), Einblendungen Raster, Rohstoffe, Inseln (merkt sich ihren Zustand). Prüf-Skript: Inselwelt, Überblick, Einblendungen, Seed laden, Download-Größe; Takt und Ruhebild werden bei `?aufloesung=25` geprüft (Software-Grafik der Cloud bremst sonst die Uhr).
- **Testanleitung 2.3 für den Nutzer** (falls noch nicht erledigt): Link kopieren und in der Chrome-App öffnen; 1. Insel mit Stränden, Wiesen, grauen Bergen, Wäldern und braunem Holzfäller-Block sichtbar; 2. mit 1 Finger drehen, mit 2 Fingern zoomen und verschieben, ganz herauszoomen (6–8 Inseln); 3. Debug-Anzeige: „Raster“, „Rohstoffe“, „Inseln“ antippen (Gitter, leuchtende Kristalle, Schilder); 4. „Neue Welt (Zufall)“ 3–4-mal, außerdem einen Seed als Wort eingeben (z. B. „Barock“) und „Laden“; 5. FPS in der Debug-Anzeige beim Drehen und Zoomen ablesen (Ziel um 60, nie unter 30); 6. Rückmeldung: Gefallen die Welten? Was soll anders sein (Inselgröße, Berge, Wald, Strände, Farben)?
- **Welt-Datenmodell (2.2, E-025):** Kachel-Raster in `sim/world.ts` (Zahlenfelder `terrain`, `elevation`, `island`, `trees`, `occupancy`; Inseln mit Fruchtbarkeiten und Vorkommen in `state.islands`), Umrechnung Kachel ↔ 3D nur in `sim/worldSpace.ts` (Kachel 0/0 = Südwest, x Ost, y Nord, 2 m pro Kachel), Grundfläche/Drehung in `sim/footprint.ts`. Beschreibung: ARCHITEKTUR.md, Abschnitt 4.1. `createInitialState(seed)` erzeugt eine leere 0 × 0-Welt (für Tests ohne Karte); eine Partie mit Inselwelt kommt aus `createNewGame` (2.3). Tests geben Daten über `data/testFixtures.ts` an (`loadTestData`, `testBuilding`).
- **Architektur (E-016):** Bauplan in [ARCHITEKTUR.md](ARCHITEKTUR.md), Abschnitt 14 listet alle Dateien. ESLint überwacht die Schichten-Regeln (wer wen importieren darf; in `core/`, `data/`, `sim/` keine Browser-Zugriffe, kein `Math.random()`, keine Uhrzeit). Alles, was sich bewegt, muss dem Zeichen-Takt `markActivity` melden, sonst greift das Ruhebild.
- **Prüf-Skript:** `npm run screenshot` prüft auch die Spiel-Schleife (Takte pro Sekunde, Ruhebild, Aufwachen beim Wischen) und die Debug-Anzeige (Holz = Takte, Pause, 4×, Ein-/Ausklappen) über `window.kkStats`.
- **Links in der Claude-App** öffnen sich in deren eingebautem Browser, nicht in Chrome. Für Tests den Nutzer bitten, den Link zu kopieren und in der Chrome-App zu öffnen.
- **Nutzer-Vorlieben:** Rückfragen immer als anklickbare Auswahl. Prompts zum Einfügen (z. B. für den nächsten Chat) immer in einem eigenen Code-Block, damit es einen Kopieren-Knopf gibt. Kurze Antworten, da oft auf Tablet/Handy gelesen.

## Abnahme-Checkliste Phase 1 (Stand 19.11.2026)

- ✅ Repository auf GitHub, mit Claude verbunden, README mit Spiel-Link
- ✅ Jede Änderung erscheint automatisch online; die Versionsanzeige stimmt (zuletzt 8f4d13e, vom Nutzer am Tablet gesehen)
- ✅ Die leere 3D-Szene läuft stabil auf dem Tablet (Touch), ca. 60 FPS beim Drehen
- ✅ Keine störenden Browser-Gesten; Vollbild und Querformat-Hinweis funktionieren (Nutzer, 19.11.2026)
- ✅ Geräte-Check durchgeführt; Leistungsbudget dokumentiert und bestätigt (E-014), Leistungs-Check Phase 1 in LEISTUNGSBUDGET.md, Abschnitt 8
- ✅ docs/ARCHITEKTUR.md erklärt den Aufbau verständlich; Nutzer hat zugestimmt (E-016)
- ✅ „Holz“ wird aus einer JSON-Datei geladen, im 0,5-s-Takt verrechnet und in der Debug-Anzeige gezeigt; Pause und Geschwindigkeit funktionieren (automatisch geprüft und vom Nutzer am Tablet bestätigt, 19.11.2026)
- ✅ build, test und lint fehlerfrei (116 Tests); Tests decken Takt und Datenprüfung ab
- ✅ docs/ENTSCHEIDUNGEN.md, GLOSSAR.md, FORTSCHRITT.md und IDEEN-SPAETER.md sind aktuell
- ⏳ Git-Tag „phase-1“: lokal gesetzt, aber das Hochladen von Tags ist aus Claudes Umgebung gesperrt (siehe „Bekannte Probleme“)
- ✅ Phase 2 starten: neuer Chat mit dem Prompt aus „Phasen/Phase_02_Welt_Kamera_Bauen.txt“

## Rückschau Phase 1 (19.11.2026)

- **Lief gut:** Auswahlfragen zum Anklicken; kleine Schritte.
- **Ändern ab Phase 2:** weniger Rückfragen. Rein technische Details entscheidet Claude selbst und nennt sie danach kurz (E-020). Alles mit spürbaren Folgen (Kosten, Spielgefühl, Aussehen, Bedienung, Aufwand) bleibt eine Auswahlfrage.

## Offene Punkte und Ideen für Phase 2

- Test-Insel, Kreisel-Kamera und automatisch gebauter Test-Holzfäller werden durch Inselgenerator, Spiel-Kamera und Bausystem ersetzt.
- Die Debug-Anzeige wird weiter genutzt (z. B. Seed wechseln, Raster einblenden).
- Leistungs-Check und `check.html` am Ende von Phase 2 wiederholen; dann erstmals mit vielen Objekten aussagekräftig.
- Weitere Ideen mit Datum in [IDEEN-SPAETER.md](IDEEN-SPAETER.md).

## Offene Fragen

- Keine.

## Bekannte Probleme

- **Git-Tags lassen sich aus Claudes Umgebung nicht hochladen** (Fehler 403). Lösung (E-026): Der Nutzer legt Tags über die GitHub-Webseite an („Releases → Draft a new release“). Für `phase-1` liegt der Hilfs-Zweig `stand-phase-1` auf dem Abschluss-Commit `06f83f4`; der Nutzer wählt ihn als „Target“. **Offen:** Bestätigung des Nutzers, dass `phase-1` angelegt ist (prüfen mit `git ls-remote origin`); danach den Hilfs-Zweig löschen (`git push origin :refs/heads/stand-phase-1`; falls gesperrt, stehen lassen, er stört nicht).
- Download beim Start: 337 kB komprimiert, Budget 1 MB (misst jetzt `npm run screenshot` automatisch; Messweise in LEISTUNGSBUDGET.md, Abschnitt 8).
- Insel-Schilder der Debug-Anzeige überlappen sich im weiten Überblick (nur Debug, siehe IDEEN-SPAETER.md).

## Verlauf

- **18.11.2026 (Chat 1):** Phase 1 gestartet. 1.1 abgeschlossen: Grundbegriffe erklärt, Arbeitstitel „Kontor & Krone“, Repository-Name `kontor-und-krone` und Hosting-Weg (öffentlich + GitHub Pages) entschieden. 1.2 abgeschlossen: Nutzer hat das Repository angelegt, GitHub mit Claude verbunden und die Claude GitHub App installiert. Erster Commit (README, .gitignore, docs/) ist hochgeladen, die README ist auf github.com sichtbar.
- **18.11.2026 (Chat 2):** 1.3 abgeschlossen: Technik-Bündel (E-005 bis E-008) nach Erklärung bestätigt. Projektgerüst mit Vite 8, TypeScript 6, Babylon.js 9, Prettier, ESLint, Vitest. Leere Szene mit Himmel, Dunst-Horizont, türkisem Meer, Sandwürfel, Sonne und Kreisel-Kamera. Tablet-Grundlagen (Gesten-Sperre, Vollbild-Knopf, Querformat-Hinweis, Auflösungs-Begrenzung), Versionsanzeige, Startprüfung mit deutschem Fehler-Hinweis. Selbst geprüft: 13 Tests grün, Bildschirmfotos und simulierte Maus-/Finger-Bedienung im unsichtbaren Chrome in Ordnung.
  1.4 weitgehend erledigt: Veröffentlichungs-Ablauf mit GitHub Actions (prüft, baut, veröffentlicht), Nutzer hat die Pages-Quelle eingestellt, erste Veröffentlichung erfolgreich. Update-Hinweis „Neue Version verfügbar“ auf Wunsch des Nutzers eingebaut (E-011). Spiel-Link in der README. Tablet-Test vom Nutzer bestätigt; Laptop-Test folgt im nächsten Chat.
- **18.11.2026 (Chat 3):** Auf Wunsch des Nutzers ist das Spiel jetzt ein **reines Tablet-Spiel**, der Laptop entfällt (E-012). Damit ist 1.4 abgeschlossen. Technische Folgen (E-013): Build-Ziel Chrome 111 statt 87, Maus nur noch für Claudes Tests, 1.5 nur für das Tablet. Alle Dokumente angepasst, auch die Projekt-Dokumente „Grundlagen/Gesamtplan.txt“ und „Phasen/Phase_01_Fundament_und_Setup.txt“ (Prompt-Version 1.1).
  1.5 begonnen: Testseite `check.html` (Geräte-Angaben + Belastungstest mit 16 Stufen: 500/2.000/10.000/30.000 Greybox-Bäume als Thin Instances, mit/ohne Schatten, volle/halbe Auflösung; Zeitlimit, Abbrechen, Schutz gegen Einfrieren, kopierbarer Ergebnistext). Selbst geprüft im unsichtbaren Chrome (Schnelldurchlauf `?schnell`), 39 Tests grün.
  1.5 abgeschlossen: Messfehler beim Start des Tests behoben (Vollbild-Wechsel abwarten, Vorwärmen), Draw-Call-Stufen ergänzt. Test in Google Chrome 157 auf dem Tablet: 10.000 Bäume mit Schatten bei voller Auflösung = 49 FPS, 1.000 Draw Calls = 90 FPS. docs/LEISTUNGSBUDGET.md geschrieben und vom Nutzer bestätigt (E-014); Bildraten-Begrenzer 60 FPS gewählt (E-015). Projekt in claude.ai vom Nutzer in „Anno 1701 like Browser Game Tablet“ umbenannt.
- **18.11.2026 (Chat 4):** 1.6 abgeschlossen. docs/ARCHITEKTUR.md mit Brettspiel-Vergleich und Diagramm geschrieben; Nutzer hat zugestimmt (E-016), dazu Bedienoberfläche mit HTML/CSS (E-017) und „läuft beim Zurückkehren sofort weiter“ (E-018). Grundgerüst gebaut: Uhr mit Tempo und Schutz vor der Aufhol-Lawine, Ereignis-Bus, Zufall mit Seed (sfc32, getrennte Ströme), Spielzustand mit Versionsnummer und Spielstand-Format, Befehle (Test-Befehl `debugAddGoods`), Daten-Lader mit zod und deutschen Fehlermeldungen, eigene Spiel-Schleife mit Bildraten-Begrenzer 60 FPS und Ruhebild, Schichten-Regeln in ESLint (mit Probedateien geprüft). 95 Tests grün; im unsichtbaren Chrome: 6 Takte in 3 s, Ruhebild 2 Bilder in 2 s, beim Wischen 60 Bilder pro Sekunde.
- **18.11.2026 (Chat 5):** 1.7 begonnen. Durchstich nach Bestätigung des Nutzers gebaut (E-019): Holz und Test-Holzfäller als Datendateien mit Querverweis-Prüfung, Gebäude per Befehl, System „Produktion“, Platzhalter-Würfel in der Inselmitte, Debug-Anzeige mit FPS, Takt, Holz, Dreiecken, Draw Calls, Seed und Tempo-Knöpfen. 116 Tests grün; im unsichtbaren Chrome: Holz = Takte, Pause hält an, 4× = ca. 16 Takte in 2 s.
  Tablet-Test teilweise: Nutzer bestätigt ca. 60 FPS beim Drehen, 60 FPS wirkt gleichmäßiger als 45 (E-015 bleibt), Vollbild, Querformat-Hinweis und Gesten-Sperre funktionieren. Schritte 1–6 testet er später. Leistungs-Check Phase 1 eingetragen (LEISTUNGSBUDGET.md, Abschnitt 8). Rückschau: weniger Rückfragen ab Phase 2 (E-020). Prompt für Phase 2 als Projekt-Dokument entworfen.
- **19.11.2026 (Chat 6):** Nutzer bestätigt den Tablet-Test des Durchstichs („Test alle ok“). **Phase 1 abgeschlossen** (Git-Tag konnte nicht hochgeladen werden, siehe „Bekannte Probleme“). **Phase 2 begonnen:** 2.1 erledigt; Grundbegriffe erklärt, Entscheidungen E-021 bis E-024 (alle wie empfohlen). 2.2 erledigt: Kachel-Raster im Spielzustand, Datendateien `terrain.json`, `resources.json`, `fertilities.json`, Gebäude mit Größe und Untergrund, Umrechnung Kachel ↔ 3D, Grundfläche und Drehung, Lauflängen-Kodierung im Spielstand (E-025). 149 Tests grün; im unsichtbaren Chrome läuft das Spiel unverändert (für den Nutzer noch nichts Neues sichtbar).
- **19.11.2026 (Chat 7):** 2.3 gebaut: Regeln des Weltgenerators als Datendatei `worldgen.json` mit Prüfschema und Querverweisen; Generator in `sim/worldgen/` (Inselplanung, Küsten mit Rauschen, Strände, flache Ebenen, Gebirge, Rohstoffe am Bergfuß, Fruchtbarkeiten, Wälder); Greybox-Darstellung mit einem Netz pro Insel, durchscheinendem Wasser über hellem Sandboden und Bäumen als Thin Instances; vorläufige Kamera für die ganze Karte; Test-Holzfäller auf dem Startplatz der größten Insel; Debug-Werkzeuge (Seed, Neue Welt, Raster, Rohstoffe, Inseln). Entscheidung E-027. 188 Tests grün; im unsichtbaren Chrome: Seed 1701 = 7 Inseln, 2.320 Bäume, Generator 115 ms, 90.000–130.000 Dreiecke, 8–28 Draw Calls, Download 337 kB. Tablet-Test durch den Nutzer steht aus.
