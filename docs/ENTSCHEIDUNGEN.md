# Entscheidungen

Hier steht jede Entscheidung mit Datum, Frage, gewählter Option, Vor- und Nachteilen und Begründung.
Neue Einträge kommen unten dazu. Eine Entscheidung wird nicht gelöscht, sondern bei Bedarf durch einen neuen Eintrag ersetzt („ersetzt E-00X“).

---

## E-001 · Vorab festgelegte Grundsätze

- **Datum:** 18.11.2026 (aus dem Gesamtplan übernommen)
- **Festgelegt:**
  - Plattform: Google Chrome im Querformat auf einem Android-Tablet (Budget-Modell, Hauptgerät für Touch) und einem sehr alten Windows-Laptop (schwächstes Gerät) **→ ersetzt durch E-012: nur noch das Tablet, der Laptop entfällt.**
  - Technik: Babylon.js + TypeScript, Build-Werkzeug Vite, Paketverwaltung npm
  - Arbeitsweise: Claude baut in der Cloud und speichert auf GitHub, jede Änderung wird automatisch veröffentlicht, getestet wird per Link. Auf den eigenen Geräten wird nichts installiert.
  - 3D-Grafik ab Phase 8 aus kostenlosen CC0-Paketen (z. B. KayKit, Quaternius, Kenney), bis dahin Platzhalter-Formen (Greybox)
  - Privater Eigengebrauch, keine Einnahmen, keine Store-Veröffentlichung
- **Begründung:** siehe [GESAMTPLAN.md](GESAMTPLAN.md), Abschnitt 1. Diese Punkte werden nur neu verhandelt, wenn der Nutzer es möchte.

---

## E-002 · Arbeitstitel des Spiels

- **Datum:** 18.11.2026 · Unterphase 1.1
- **Frage:** Welchen Arbeitstitel bekommt das Spiel?
- **Gewählt:** **Kontor & Krone**
- **Andere Optionen:** Inselbarock · Fortunas Archipel · Zepter & Zuckerrohr
- **Vorteile:** verbindet die zwei Säulen des Spiels: Handel (das Kontor als Herz jeder Insel) und Krone (Königin, Schlossbau, Unabhängigkeit als Finale). Klingt barock und ist gut zu merken.
- **Nachteile:** etwas länger als „Inselbarock“. Das „&“ kann nicht im Repository-Namen stehen, deshalb heißt es dort „und“.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung. Ein Arbeitstitel lässt sich später jederzeit ändern.

---

## E-003 · Name des Repositorys

- **Datum:** 18.11.2026 · Unterphase 1.1
- **Frage:** Wie heißt das Repository (nur Kleinbuchstaben und Bindestriche)?
- **Gewählt:** `kontor-und-krone`
- **Vorteile:** direkt aus dem Titel abgeleitet und gut lesbar. Er wird Teil des Spiel-Links.
- **Nachteile:** keine nennenswerten. Ein späteres Umbenennen ist möglich, würde aber den Spiel-Link ändern.
- **Begründung:** folgt aus E-002.

---

## E-004 · Sichtbarkeit des Codes und Weg der Veröffentlichung (Hosting)

- **Datum:** 18.11.2026 · Unterphase 1.1
- **Frage:** Ist das Repository öffentlich oder privat, und welcher Dienst stellt das Spiel online?
- **Gewählt:** **Öffentliches Repository + GitHub Pages**
- **Recherche (Stand 18.11.2026):**
  - GitHub Pages ist im kostenlosen Plan nur für öffentliche Repositories verfügbar. Für private Repositories wäre ein kostenpflichtiger Plan nötig (GitHub Pro, ca. 4 $/Monat). Das scheidet wegen „keine Kosten“ aus.
  - Eine GitHub-Pages-Seite ist immer öffentlich erreichbar, auch wenn der Code privat ist.
  - Cloudflare (Pages bzw. Workers): kostenlos, 500 Veröffentlichungen pro Monat, unbegrenzter Datenverkehr. Cloudflare empfiehlt für neue Projekte inzwischen „Workers“ statt „Pages“.
  - Netlify: kostenlos nur 300 „Credits“ pro Monat, eine Veröffentlichung kostet 15. Das reicht für ca. 20 Veröffentlichungen im Monat, danach wird die Seite pausiert.
- **Optionen mit Vor- und Nachteilen:**
  - *Öffentlich + GitHub Pages (gewählt):*
    - Vorteile: nur ein Konto, am einfachsten einzurichten, kostenlos, für öffentliche Repositories keine Begrenzung der Bau-Minuten.
    - Nachteile: Code und Planungs-Dokumente sind für jeden einsehbar.
  - *Privat + Cloudflare:*
    - Vorteile: Code bleibt privat, kostenlos, reichlich Veröffentlichungen.
    - Nachteile: zweites Konto, mehr Einrichtung, komplexere Oberfläche.
  - *Privat + Netlify:*
    - Vorteile: Code privat, einfache Oberfläche.
    - Nachteile: nur ca. 20 Veröffentlichungen pro Monat, danach pausiert die Seite. Für unsere Arbeitsweise (jede Änderung wird veröffentlicht) zu knapp.
- **Wichtig:** Der Spiel-Link ist bei jeder Option für jeden erreichbar, der ihn kennt. Privat bliebe nur der Code.
- **Folge:** Im Repository dürfen niemals Passwörter, Zugangsschlüssel oder persönliche Daten stehen. Das gilt ohnehin immer.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung: einfachster Weg für ein privates Hobbyprojekt ohne geheime Inhalte.

---

## E-005 · Paketversionen und TypeScript 6.0 statt 7.0

- **Datum:** 18.11.2026 · Unterphase 1.3
- **Frage:** Welche Versionen der Werkzeuge nutzen wir?
- **Gewählt:** Vite 8.3, Babylon.js 9.37 (modulares Paket `@babylonjs/core`), **TypeScript 6.0.3**, Prettier 3.10, ESLint 10.15 mit typescript-eslint 8.73, Vitest 5.1. Alle Versionen fest eingetragen (keine automatischen Updates).
- **Vorteile:** Alle Werkzeuge passen nachweislich zusammen. Feste Versionen verhindern Überraschungen durch Updates.
- **Nachteile:** TypeScript 7 (neu geschriebener, deutlich schnellerer Übersetzer) wird noch nicht genutzt. Für das Spiel selbst macht das keinen Unterschied.
- **Alternative:** TypeScript 7 ohne die gründliche, typbasierte Fehlersuche von ESLint.
- **Begründung:** typescript-eslint unterstützt laut npm (Stand 18.11.2026) nur TypeScript bis 6.0. Wechsel auf 7, sobald das möglich ist (siehe IDEEN-SPAETER.md). Teil des technischen Bündels, vom Nutzer bestätigt („Einverstanden“).

---

## E-006 · Build-Ziel: Chrome 87 und neuer, mit Startprüfung

> **Ersetzt durch E-013** (Build-Ziel Chrome 111, weil der Laptop entfällt). Die Startprüfung bleibt.

- **Datum:** 18.11.2026 · Unterphase 1.3 (Überprüfung in 1.5)
- **Frage:** Wie alt darf der Browser höchstens sein?
- **Gewählt:** Gebaut wird für Chrome 87 (Ende 2020) und neuer (`build.target` in `vite.config.ts`). Zusätzlich darf der Spielcode nur Funktionen von JavaScript-Stand 2020 benutzen (`lib: ES2020` in `tsconfig.app.json`). Eine Startprüfung in `index.html` zeigt einen deutschen Hinweis, wenn der Browser zu alt ist.
- **Vorteile:** Läuft auch auf einem alten Laptop, dessen Chrome nicht mehr ganz aktuell ist (Windows 7/8.1 bekommen z. B. höchstens Chrome 109). Statt einer weißen Seite gibt es eine verständliche Meldung.
- **Nachteile:** Etwas größere Dateien, weil neue Sprachmittel umgeschrieben werden. Neueste JavaScript-Funktionen stehen im Spielcode nicht zur Verfügung.
- **Alternative:** Vite-Standard (etwa ab Chrome 111): etwas kleiner, könnte aber den alten Laptop ausschließen.
- **Prüfung:** Der gebaute Code wurde nach Funktionen durchsucht, die Chrome 87 nicht kennt. Keine gefunden (nur `WeakRef`, das Chrome seit Version 84 kennt). Endgültige Prüfung mit dem echten Laptop in 1.5.
- **Begründung:** Teil des technischen Bündels, vom Nutzer bestätigt.

---

## E-007 · Vorläufige Kamera: „Kreisel-Kamera“

- **Datum:** 18.11.2026 · Unterphase 1.3
- **Frage:** Welche Kamera bekommt die leere Test-Szene?
- **Gewählt:** Babylons ArcRotateCamera („Kreisel-Kamera“): Sie kreist um die Mitte. 1 Finger bzw. Maus ziehen = drehen, 2 Finger spreizen bzw. Mausrad = zoomen. Verschieben ist abgeschaltet.
- **Vorteile:** Fertig eingebaut, stabil, reicht zum Testen von Touch und Maus.
- **Nachteile:** Kein Verschieben, keine Anno-typische Steuerung.
- **Alternative:** Gleich eine eigene Spiel-Kamera bauen. Das gehört aber zu Phase 2 (braucht Insel und Raster).
- **Begründung:** Teil des technischen Bündels, vom Nutzer bestätigt. Wird in Phase 2 ersetzt.

---

## E-008 · Bildschärfe: höchstens doppelte Pixeldichte

- **Datum:** 18.11.2026 · Unterphase 1.3 (Überprüfung in 1.5)
- **Frage:** Wie scharf wird die 3D-Szene gezeichnet?
- **Gewählt:** Die Pixeldichte des Geräts wird genutzt, aber auf das Doppelte begrenzt (`src/render/resolution.ts`). Zum Testen lässt sich die Auflösung per Link-Zusatz senken, z. B. `?aufloesung=50` (erlaubt: 25–100 %).
- **Vorteile:** Bei dreifacher Pixeldichte müsste der Grafikchip 9-mal so viele Bildpunkte malen wie bei einfacher, bei doppelter nur 4-mal so viele. Das schont das Budget-Tablet deutlich.
- **Nachteile:** Auf Bildschirmen mit sehr hoher Pixeldichte minimal weniger scharf.
- **Alternative:** Immer volle Geräte-Auflösung: schärfer, aber langsamer.
- **Begründung:** Teil des technischen Bündels, vom Nutzer bestätigt. Endgültige Werte nach den Messungen in 1.5.

---

## E-009 · Technische Kleinigkeiten aus 1.3

- **Datum:** 18.11.2026 · Unterphase 1.3
- **Festgelegt (von Claude, ohne spürbare Folgen für den Nutzer):**
  - **Vorläufige Ordnerstruktur** unter `src/`: core, sim, data, render, input, ui, debug, je mit kurzer README. Endgültig in 1.6.
  - **Automatische Tests** liegen direkt neben dem geprüften Code (`name.test.ts`). So findet man sie leicht.
  - **Prettier** formatiert Code, aber keine Markdown-Dokumente. Die Kopie des Masterplans bleibt so unverändert.
  - **ESLint-Ausnahme:** Die Regel `no-unsafe-class-instance-assignment` ist für `src/render/` abgeschaltet. Babylon.js baut manche Klassen über „Mixins“ zusammen, und die Regel meldet dort Fehlalarme.
  - **Fehler-Hinweis auf dem Bildschirm:** Tritt ein Fehler auf, zeigt das Spiel ihn als deutschen Hinweis mit der Bitte um ein Bildschirmfoto. Grund: Auf dem Tablet gibt es keine Entwicklerwerkzeuge, mit denen man Fehler sonst sehen könnte.
  - **Prüf-Skript** `npm run screenshot`: Claude startet das Spiel in einem unsichtbaren Chrome, macht Bildschirmfotos (Laptop, Tablet quer, Tablet hoch) und meldet Fehler. Die Bilder werden nicht ins Repository gespeichert.
- **Vorteile:** Einheitlich, gut prüfbar, Fehler werden auch auf dem Tablet sichtbar.
- **Nachteile:** keine nennenswerten.

---

## E-010 · Veröffentlichung über GitHub Actions

- **Datum:** 18.11.2026 · Unterphase 1.4
- **Frage:** Wie kommt jede Änderung automatisch online?
- **Gewählt:** Ein GitHub-Actions-Ablauf (`.github/workflows/deploy.yml`) startet bei jedem Hochladen auf `main`. Er prüft (lint, test), baut und veröffentlicht auf GitHub Pages. Schlägt eine Prüfung fehl, bleibt die alte Version online. Zusätzlich lässt er sich von Hand starten.
- **Prüfung:** Claude darf Workflow-Dateien hochladen (getestet am 18.11.2026). Der Ausweg aus dem Phase-Prompt (gebauter Ordner im Repository oder Hosting-Dienst baut selbst) ist deshalb nicht nötig.
- **Vorteile:** Kein Zutun nötig. Kaputte Versionen werden nicht veröffentlicht. Für öffentliche Repositories kostenlos.
- **Nachteile:** Eine Veröffentlichung dauert etwa 1–2 Minuten. GitHub-Pages-Einstellungen kann Claude nicht selbst ändern; der Nutzer hat einmalig die Quelle „GitHub Actions“ eingestellt.
- **Alternative:** Den gebauten Ordner mit ins Repository speichern und „Deploy from a branch“ nutzen. Das ist unübersichtlicher und bläht das Repository auf.
- **Verwendete Bausteine (Stand 18.11.2026):** actions/checkout v7, actions/setup-node v7 (Node.js 22), actions/configure-pages v6, actions/upload-pages-artifact v5, actions/deploy-pages v5.

---

## E-011 · Schutz vor alten Versionen: Update-Hinweis

- **Datum:** 18.11.2026 · Unterphase 1.4
- **Frage:** Soll das Spiel selbst merken, wenn online eine neuere Version liegt?
- **Gewählt:** **Ja, mit Hinweis.** Beim Bauen entsteht `version.json`. Das Spiel fragt sie beim Start, alle 2 Minuten und beim Zurückkehren zum Tab ab. Ist online eine neuere Version, erscheint oben „Neue Version verfügbar – tippen zum Laden“.
- **Weitere Schutzmaßnahmen:** Alle Code-Dateien tragen ein Prüfkürzel (Hash) im Namen, z. B. `index-CfjoKiQ4.js`. Eine geänderte Datei hat dadurch immer einen neuen Namen, und der Browser kann keine alte Fassung erwischen. Die Versionsanzeige unten rechts zeigt Bauzeitpunkt und Commit-Kürzel.
- **Vorteile:** Man testet nie aus Versehen eine alte Version. Ein Tipp genügt, auch ohne „Herunterziehen zum Neuladen“ (das ist auf der Spielfläche abgeschaltet).
- **Nachteile:** Etwas mehr Code. Alle 2 Minuten eine winzige Abfrage (ca. 100 Byte).
- **Alternative:** Nur von Hand neu laden (Chrome-Menü ⋮ → ↻).
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-012 · Reines Tablet-Spiel: Der Laptop entfällt

- **Datum:** 18.11.2026 · zwischen Unterphase 1.4 und 1.5
- **Frage:** Für welche Geräte bauen wir das Spiel? (Anlass: Der Laptop war für den offenen Laptop-Test aus 1.4 nicht zur Hand.)
- **Gewählt:** **Nur das Android-Tablet** (Google Chrome, Querformat, Touch). Der alte Windows-Laptop ist kein Zielgerät mehr. Ersetzt den Laptop-Teil von E-001.
- **Andere Optionen:** 1.5 vorerst nur am Tablet testen und den Laptop später nachholen · direkt mit 1.6 weitermachen · warten, bis der Laptop da ist
- **Vorteile:**
  - Das Tablet legt jetzt allein die Leistungsgrenzen fest. Ein relativ neues Tablet ist meist deutlich stärker als ein sehr alter Laptop. Dadurch ist mehr Grafik und mehr „Gewusel“ möglich.
  - Weniger Testaufwand: In jeder Phase gibt es nur noch einen Geräte-Test.
  - Bedienung, Bildschirmaufteilung und Optimierung können ganz auf Finger und Tablet zugeschnitten werden.
- **Nachteile:**
  - Gespielt werden kann nur noch auf dem Tablet. Auf einem PC startet das Spiel zwar meist trotzdem, wird dafür aber weder getestet noch optimiert.
  - Kommt der Laptop später doch zurück, müsste man Leistung und Bedienung dafür nachträglich prüfen.
- **Folgen:** 1.4 ist abgeschlossen (der Tablet-Test war bestätigt). Geräte-Check und Leistungsbudget in 1.5 nur für das Tablet. Alle Dokumente (README, Fortschritt, Gesamtplan, Phase-1-Prompt) wurden angepasst. Technische Folgen siehe E-013.
- **Begründung:** Wahl des Nutzers.

---

## E-013 · Technische Folgen des reinen Tablet-Spiels

- **Datum:** 18.11.2026 · nach E-012
- **Festgelegt (technisches Bündel, vom Nutzer bestätigt: „Einverstanden“):**
  1. **Build-Ziel Chrome 111 und neuer** (Vite-Standard „baseline-widely-available“: Chrome/Edge 111, Firefox 114, Safari 16.4; Stand März 2023) statt Chrome 87. Ersetzt E-006. Der Spielcode darf JavaScript-Stand 2022 nutzen (`lib: ES2022`). Die Startprüfung in `index.html` bleibt und nennt jetzt Chrome 111.
     - *Vorteil:* etwas kleinere und schnellere Dateien, weil weniger umgeschrieben werden muss. Ein aktuelles Android-Tablet bekommt Chrome automatisch aktualisiert und ist weit darüber.
     - *Nachteil:* Für ein aktuelles Tablet keiner. Sehr alte Browser bekommen den Hinweis „Dein Browser ist zu alt“.
     - *Alternative:* bei Chrome 87 bleiben (größer, ohne Nutzen).
     - *Prüfung:* Die Testseite in 1.5 liest die echte Chrome-Version des Tablets aus.
  2. **Maus bleibt technisch erhalten.** Babylon.js unterstützt Maus und Finger automatisch über dieselben „Zeiger-Ereignisse“. Claude braucht die Maus für die eigenen Tests im unsichtbaren Chrome.
     - *Vorteil:* kostet nichts, erleichtert die automatischen Prüfungen.
     - *Nachteil:* keiner. Geplant, getestet und optimiert wird aber nur für das Tablet.
     - *Alternative:* Maus abschalten. Das bringt keinen Nutzen und erschwert die Tests.
  3. **Geräte-Check und Leistungsbudget (1.5) nur für das Tablet.** Das Prüf-Skript `npm run screenshot` macht keine Laptop-Bildschirmfotos mehr, sondern nur noch Tablet quer und hoch.

---

## E-014 · Leistungsbudget für das Tablet

- **Datum:** 18.11.2026 · Unterphase 1.5
- **Frage:** Welche Grenzen gelten für Grafik, Ladezeit und Download, damit das Spiel auf dem Tablet flüssig bleibt?
- **Gewählt:** das Budget in [LEISTUNGSBUDGET.md](LEISTUNGSBUDGET.md): normal 60 FPS, nie unter 30; sichtbare Dreiecke Richtwert 750.000 / Obergrenze 1 Mio.; Draw Calls 300 / 600; eine Sonne mit Schatten-Karte 1024; Qualitätsstufen Hoch (100 %, Schatten), Mittel (75 %, Schatten), Niedrig (50 %, ohne Schatten); erster Start ≤ 5 s, Programmcode ≤ 1 MB komprimiert, Gesamt-Download ≤ 20 MB.
- **Grundlage:** Geräte-Check in Google Chrome 157 auf dem Tablet (Samsung SM-X210R, Adreno 619, ca. 4 GB, 1920 × 1200, 90 Hz). Beispiel: 10.000 Bäume (880.000 Dreiecke) mit Schatten bei voller Auflösung = 49 FPS.
- **Vorteile:** klare Zahlen, gegen die jede neue Funktion geprüft wird. Ca. 40 % Reserve für Wasser, Gelände, Texturen, Figuren, Simulation und Wärme-Drosselung.
- **Nachteile:** Die Reserve verschenkt etwas mögliche Pracht. Animierte Figuren und Karren sind noch nicht gemessen (folgt in Phase 3 bzw. 8).
- **Alternative:** knapper an die gemessene Grenze gehen (mehr Objekte, aber Ruckelgefahr in großen Städten und bei warmem Gerät).
- **Weitere Folgen:** Die Pixeldichte-Grenze 2 aus E-008 bleibt (das Tablet hat 1,5, also volle Schärfe). Das Build-Ziel Chrome 111 aus E-013 passt nachweislich (Tablet: Chrome 157).
- **Begründung:** Vom Nutzer bestätigt („Einverstanden“), entsprach der Empfehlung.

---

## E-015 · Bildraten-Begrenzer: höchstens 60 Bilder pro Sekunde

- **Datum:** 18.11.2026 · Unterphase 1.5
- **Frage:** Der Bildschirm des Tablets kann 90 Bilder pro Sekunde. Wie viele soll das Spiel höchstens zeichnen?
- **Gewählt:** **höchstens 60**
- **Andere Optionen:** bis zu 90 (am flüssigsten, aber mehr Akku und Wärme) · höchstens 30 (längste Akkulaufzeit, aber spürbar weniger flüssig)
- **Vorteile:** sehr flüssig, schont Akku, hält das Tablet kühler und verzögert die Wärme-Drosselung.
- **Nachteile:** minimal weniger flüssig als 90. Bei 90 Hz passt 60 nicht glatt hinein; das kann minimal ungleichmäßig wirken.
- **Umsetzung:** im Zeichen-Takt (Unterphase 1.6/1.7), zusammen mit der gedrosselten Bildrate im Leerlauf. Claude prüft die Gleichmäßigkeit mit dem Nutzer am Tablet; wirkt es unruhig, wird 45 FPS als Alternative vorgeschlagen.
- **Prüfung (19.11.2026, Unterphase 1.7):** Der Nutzer hat am Tablet 60 und 45 FPS verglichen. 60 wirkt gleichmäßig; es bleibt bei 60.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-016 · Kern-Architektur

- **Datum:** 18.11.2026 · Unterphase 1.6
- **Frage:** Nach welchem Bauplan arbeiten die Teile des Spiels zusammen?
- **Gewählt:** der Bauplan in [ARCHITEKTUR.md](ARCHITEKTUR.md) (technisches Bündel, vom Nutzer bestätigt: „Einverstanden“). Kernpunkte:
  1. **Schichten als Ordner** (`core`, `data`, `sim`, `render`, `input`, `ui`, `debug`, neu `app` für Start und Spiel-Schleife). Die Simulation weiß nichts von der Grafik. ESLint prüft automatisch, wer wen benutzen darf. In `core/`, `data/` und `sim/` sind Browser-Zugriffe, `Math.random()` und die Uhrzeit verboten.
     - *Vorteil:* Spielregeln ohne Grafik testbar, Grafik später austauschbar, Fehler in der Aufteilung fallen sofort auf. *Nachteil:* etwas mehr Ordnung nötig, manchmal ein Umweg über Ereignisse.
  2. **Ein Spielzustand aus einfachen Daten**, Verweise über Kennungen und Nummern, Versionsnummer `saveVersion` mit Umwandlungen für alte Spielstände. Das Spielstand-Format (Text hin und zurück, Prüfung beim Einlesen) liegt in `sim/save.ts`, das Ablegen im Browser-Speicher kommt in Phase 3.
     - *Vorteil:* Speichern und Laden werden einfach. *Nachteil:* keine bequemen Objekt-Verweise, man schlägt über Nummern nach.
  3. **Wirtschafts-Takt 0,5 s** mit Tempo Pause/1×/2×/4×; pro Bild zählt höchstens 0,25 s echte Zeit (Schutz vor der Aufhol-Lawine).
  4. **Bewegungen nach dem Fahrplan-Prinzip** mit weicher Interpolation in der Darstellung, **kein** feinerer Takt.
     - *Vorteil:* sehr sparsam und trotzdem flüssig. *Nachteil:* Bewegungen müssen als Fahrplan beschreibbar sein (für Karren und Schiffe der Fall).
  5. **Befehle** werden sofort ausgeführt (auch in der Pause), **Ereignisse** über einen typisierten Ereignis-Bus erst nach einem Takt oder Befehl verteilt.
  6. **Spieldaten als JSON-Dateien** in `src/data/`, beim Bauen ins Spiel gepackt, geprüft in den Tests und beim Start.
  7. **Prüfwerkzeug zod 4.6.7**, schlanke Variante `zod/mini` (ca. 6 kB komprimiert), mit eigenen deutschen Fehlermeldungen für die häufigsten Fälle.
     - *Vorteile:* verbreitet und gepflegt, eingebaute deutsche Meldungen, Schema liefert zugleich die TypeScript-Typen. *Nachteile:* die schlanke Variante schreibt sich etwas umständlicher. *Alternativen:* valibot (ähnlich klein, weniger verbreitet), ajv mit JSON-Schema (größer, englische Meldungen).
  8. **Zufall:** Verfahren sfc32, Seed als Zahl oder Wort, getrennte Ströme für Kartengenerator und Ereignisse, Zustand im Spielstand.
  9. **Zeichen-Takt:** Bildraten-Begrenzer 60 FPS (E-015) und **Ruhebild** nach 2 Sekunden ohne Bewegung (nur noch Zeichnen bei Änderungen plus 1 Kontrollbild pro Sekunde; die Spiel-Schleife schlägt dann nur 10-mal pro Sekunde).
     - *Vorteil:* spart Akku, ohne das Bild beim Zuschauen ruckelig zu machen. *Nachteil:* Was sich bewegt, muss sich als „Bewegung“ melden, sonst würde es im Ruhebild nur einmal pro Sekunde gezeichnet.
- **Technische Kleinigkeiten (von Claude festgelegt):**
  - Link-Zusätze zum Testen: `?seed=42` bzw. `?seed=Barock` (ohne Angabe gilt der Seed 1701) und `?fps=45` (erlaubt 10–120) zum Vergleich am Tablet.
  - `core/updateCheck.ts` ist nach `app/` umgezogen, weil es den Browser braucht. `core/buildInfo.ts` bleibt in `core/`.
  - Die Spiel-Schleife ist eine eigene (statt Babylons `runRenderLoop`), damit Begrenzer, Ruhebild und Stillstand im Hintergrund zusammenpassen.
  - Vorläufiges Test-Lager im Spielzustand und der Test-Befehl `debugAddGoods`, um Befehle schon jetzt prüfen zu können.
- **Begründung:** Vom Nutzer bestätigt, entsprach der Empfehlung.

---

## E-017 · Bedienoberfläche mit HTML/CSS über der 3D-Szene

- **Datum:** 18.11.2026 · Unterphase 1.6 (Umsetzung ab Phase 3)
- **Frage:** Womit wird die Bedienoberfläche (Knöpfe, Menüs, Infoleiste) gebaut?
- **Gewählt:** **HTML/CSS über der 3D-Szene**
- **Andere Option:** Babylon GUI (in der 3D-Szene gezeichnet)
- **Vorteile:** gestochen scharfe Schrift, barocke Gestaltung mit CSS leicht möglich, belastet die 3D-Zeichnung nicht, kein zusätzlicher Download, der Browser regelt Touch und Scrollen.
- **Nachteile:** Beschriftungen direkt an 3D-Objekten (z. B. Sprechblasen über Gebäuden) brauchen etwas Zusatz-Code zur Umrechnung der Position.
- **Alternative mit Vor- und Nachteilen:** Babylon GUI: alles in einem Bild, Beschriftungen an 3D-Objekten eingebaut; aber Schrift teils unscharf, ca. 100 kB mehr Download, jedes Element kostet Zeichenleistung.
- **Offen für Phase 3:** ob ein Hilfs-Baukasten (z. B. Preact oder Lit) dazukommt.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-018 · Verhalten beim Zurückkehren zum Spiel

- **Datum:** 18.11.2026 · Unterphase 1.6
- **Frage:** Im Hintergrund (andere App, Bildschirm aus) steht die Spielzeit still. Was passiert beim Zurückkehren?
- **Gewählt:** **Das Spiel läuft sofort weiter** (im eingestellten Tempo). Verpasste Zeit wird nicht nachgeholt.
- **Andere Option:** automatische Pause, weiter erst nach Tippen auf „Weiter“
- **Vorteile:** kein zusätzliches Tippen; man verpasst trotzdem nichts, weil die Zeit im Hintergrund stand.
- **Nachteile:** kein ruhiger Moment zum Orientieren, bevor die Zeit weiterläuft.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung. Lässt sich später leicht als Einstellung anbieten.

---

## E-019 · Durchstich mit Test-Holzfäller und Debug-Anzeige

- **Datum:** 18.11.2026 · Unterphase 1.7
- **Frage:** Wie bauen wir den Beweis, dass alle Teile zusammenspielen?
- **Gewählt (technisches Bündel, vom Nutzer bestätigt: „Einverstanden“):**
  1. **Holz als Datendatei, Test-Holzfäller mit 1 Holz pro Takt.** „Holz“ (`wood`) steht in `goods.json`. Neue Datendatei `buildings.json` für Gebäudearten mit Prüfschema; darin der Test-Holzfäller (`test_woodcutter`), der pro Takt 1 Holz herstellt (bei 1× also 2 Holz pro Sekunde). Der Daten-Lader prüft auch Querverweise (Gibt es die hergestellte Ware?).
     - *Vorteil:* leicht nachzurechnen (10 Takte = 10 Holz). *Nachteil:* viel schneller als später im echten Spiel. *Alternative:* realistischer, z. B. 1 Holz alle 10 Takte; beim Testen sähe man dann kaum etwas.
  2. **Gebäude per Befehl.** Beim Start baut die Regie den Test-Holzfäller mit dem Test-Befehl `debugPlaceBuilding`. Der Spielzustand bekommt dafür eine Gebäudeliste (`buildings`, nachschlagbar über die Nummer). Das System „Produktion“ legt in jedem Takt die Menge ins Test-Lager. Die Darstellung hört die Durchsage `buildingPlaced` und stellt einen braunen Platzhalter-Würfel in die Mitte der Test-Insel.
     - *Vorteil:* Der ganze Weg (Befehl → Spielzustand → Takt → Durchsage → Bild) wird schon jetzt benutzt und getestet. *Nachteil:* etwas mehr Code. *Alternative:* Würfel und Lager fest einbauen: schneller, beweist aber weniger.
  3. **Debug-Anzeige oben links** mit Knopf zum Ein- und Ausklappen: FPS (mit Hinweis „Ruhebild“), Takt-Nummer mit Spielzeit, Lagerbestände (Holz), Dreiecke, Draw Calls, Seed, Knöpfe Pause / 1× / 2× / 4×. Frischt ihre Werte 4-mal pro Sekunde auf, nur solange sie offen ist. Merkt sich im Browser, ob sie offen ist; beim ersten Start offen.
     - *Vorteil:* Der Platz oben links ist frei, die Anzeige kostet kaum Leistung. *Nachteil:* verdeckt eine kleine Ecke der Szene. *Alternative:* unten links.
  4. **Automatische Tests:** echte Datendateien gültig; absichtlich fehlerhafte `buildings.json` liefert deutsche Meldungen; unbekannte Ware wird erkannt; 10 Takte = 10 Holz; Pause erzeugt nichts; 2× und 4× ergeben in derselben Zeit doppelt bzw. viermal so viel Holz.
- **Technische Kleinigkeiten (von Claude festgelegt):** Draw Calls werden mit Babylons Mess-Hilfe `SceneInstrumentation` gezählt (nur der Zähler, keine Zeitmessung), Dreiecke über die Zahl der gezeichneten Eckpunkt-Verweise. Die Spielstand-Versionsnummer bleibt bei 1, weil es bis Phase 3 noch keine gespeicherten Spielstände gibt.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-020 · Zusammenarbeit ab Phase 2: weniger Rückfragen bei Technik

- **Datum:** 19.11.2026 · Rückschau am Ende von Phase 1 (Unterphase 1.7)
- **Frage:** Was lief in Phase 1 gut, was ändern wir?
- **Lief gut (Nutzer):** Auswahlfragen zum Anklicken; kleine Schritte.
- **Gewählt:** **Weniger Rückfragen.** Rein technische Detailentscheidungen (Werkzeuge, Dateiaufbau, Zahlen ohne spürbare Folgen) trifft Claude ab Phase 2 selbst. Claude nennt sie in der Nachricht kurz mit Begründung und trägt sie hier ein. Der Nutzer kann jederzeit widersprechen.
- **Bleibt unverändert:** Entscheidungen mit spürbaren Folgen für den Nutzer (Kosten, Privatsphäre, Aufwand für den Nutzer, Spielgefühl, Aussehen, Bedienung) kommen weiterhin einzeln als Auswahlfrage mit Vor- und Nachteilen.
- **Vorteile:** weniger Unterbrechungen, schnellerer Fortschritt; der Nutzer entscheidet dort, wo es ihn wirklich betrifft.
- **Nachteile:** Der Nutzer sieht technische Entscheidungen erst hinterher. Eine Fehlentscheidung fällt eventuell später auf (lässt sich dank der gespeicherten Versionen aber zurücknehmen).
- **Umsetzung:** eingearbeitet in den Prompt für Phase 2 (Projekt-Dokument „Phasen/Phase_02_…“), Regel C.3.
- **Begründung:** Wunsch des Nutzers.

---

## E-021 · Größe der Test-Welt in Phase 2

- **Datum:** 19.11.2026 · Unterphase 2.1
- **Frage:** Wie groß ist die Test-Welt (Inseln, Kartengröße, Kachelgröße)?
- **Gewählt:** **Mittel: 6–8 Inseln auf 256 × 256 Kacheln**, Inseln etwa 30–80 Kacheln breit. **Eine Kachel ist so breit wie ein Feldweg (2 Meter)**; ein Wohnhaus belegt später etwa 3 × 3 Kacheln. Die ganze Karte ist damit 512 × 512 Meter groß.
- **Andere Optionen:**
  - *Klein (4 Inseln, 128 × 128):* am schnellsten und sofort überschaubar, aber zu klein, um Zoom und Leistung ehrlich zu prüfen; die Verteilung der Fruchtbarkeiten wäre kaum testbar.
  - *Groß (10–14 Inseln, 512 × 512):* nah an einer echten Endlos-Karte, aber über 500.000 Dreiecke allein für das Gelände; bräuchte schon jetzt eine Vereinfachung in der Ferne und mehr Aufwand.
- **Vorteile:** genug Inseln, damit keine alles herstellen kann; lädt schnell; das Gelände braucht nur etwa 150.000 Dreiecke und lässt viel Luft im Budget (E-014) für Bäume und Gebäude.
- **Nachteile:** kleiner als die großen Karten, die der Endlosspiel-Konfigurator in Phase 7 anbieten wird. Ob große Karten flüssig laufen, zeigt sich erst dort.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-022 · Gesten: Bau-Werkzeug per Knopf

- **Datum:** 19.11.2026 · Unterphase 2.1
- **Frage:** „Karte verschieben“ und „Straße ziehen“ gehen beide mit einem Finger. Wie werden sie unterschieden?
- **Gewählt:** **Bau-Werkzeug per Knopf.** Ohne Werkzeug verschiebt 1 Finger die Karte. Ist ein Werkzeug gewählt (Straße, Gebäude, Abriss), baut 1 Finger; die Karte bewegt man dann mit 2 Fingern (verschieben, zoomen, drehen) oder legt das Werkzeug wieder ab.
- **Andere Option:** *Lang drücken, dann ziehen:* kein Umschalten nötig, aber jedes Mal eine halbe Sekunde warten, Straßen aus Versehen möglich, und es kollidiert mit dem geplanten Schnellmenü per langem Drücken (Phase 3).
- **Vorteile:** eindeutig, keine Wartezeit, keine Straße aus Versehen.
- **Nachteile:** Mit gewähltem Werkzeug braucht das Verschieben 2 Finger (oder das Werkzeug wird abgelegt).
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-023 · Aussehen des Platzhalter-Geländes: weich und natürlich

- **Datum:** 19.11.2026 · Unterphase 2.1
- **Frage:** Wie sieht das Greybox-Gelände aus?
- **Gewählt:** **Weich und natürlich.** Bauflächen (Ebenen) sind ganz flach, Strände fallen sanft ins Wasser, Berge sind weiche Kuppen. Das Raster erscheint nur beim Bauen (und auf Wunsch in der Debug-Anzeige).
- **Andere Optionen:**
  - *Klare Kacheln und Stufen:* jede Kachel sofort erkennbar, wirkt aber klötzchenhaft und hat nichts mit dem späteren Aussehen zu tun.
  - *Flache Landkarte:* am wenigsten Aufwand, aber kaum 3D-Gefühl; die Kamera-Neigung ließe sich schlecht beurteilen.
- **Vorteile:** sieht schon wie eine Insel aus; Kamera, Zoom und Stimmung lassen sich gut beurteilen.
- **Nachteile:** Die Kachelgrenzen sieht man nur mit eingeblendetem Raster.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.

---

## E-024 · Wälder schon in Phase 2, Bauen räumt Bäume weg

- **Datum:** 19.11.2026 · Unterphase 2.1
- **Frage:** Wachsen schon in Phase 2 Wälder (Platzhalter-Bäume)?
- **Gewählt:** **Ja. Der Generator pflanzt Wälder; wo gebaut wird (Gebäude oder Straße), verschwinden die Bäume darunter automatisch.**
- **Andere Optionen:**
  - *Ja, aber Bäume blockieren das Bauen:* Wald bliebe wertvoll, aber man müsste um Wälder herumbauen, und einen Fäll-Befehl gibt es noch nicht.
  - *Nein, erst in Phase 3:* Phase 2 ginge schneller, aber der Leistungs-Check am Ende wäre weniger aussagekräftig, und die Bauregeln müssten in Phase 3 angepasst werden.
- **Vorteile:** realistischerer Leistungs-Test (Tausende Bäume), Inseln wirken lebendig, Bauen bleibt flüssig.
- **Nachteile:** etwas mehr Aufwand in Unterphase 2.3. Holzfäller, die Bäume tatsächlich brauchen, kommen erst in Phase 3.
- **Begründung:** Wahl des Nutzers, entsprach der Empfehlung.
