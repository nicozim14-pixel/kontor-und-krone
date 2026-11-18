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
