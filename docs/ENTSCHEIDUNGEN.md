# Entscheidungen

Hier steht jede Entscheidung mit Datum, Frage, gewählter Option, Vor- und Nachteilen und Begründung.
Neue Einträge kommen unten dazu. Eine Entscheidung wird nicht gelöscht, sondern bei Bedarf durch einen neuen Eintrag ersetzt („ersetzt E-00X“).

---

## E-001 · Vorab festgelegte Grundsätze

- **Datum:** 18.11.2026 (aus dem Gesamtplan übernommen)
- **Festgelegt:**
  - Plattform: Google Chrome im Querformat auf einem Android-Tablet (Budget-Modell, Hauptgerät für Touch) und einem sehr alten Windows-Laptop (schwächstes Gerät)
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
