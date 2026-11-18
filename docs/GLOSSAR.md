# Glossar

Fachbegriffe in Alltagssprache, alphabetisch sortiert. Neue Begriffe kommen hinzu, sobald sie im Projekt auftauchen.

---

**3D-Engine (Browser-3D-Engine)**
Ein fertiger Werkzeugkasten, der 3D-Bilder zeichnet: Licht, Kamera, Formen, Wasser. So muss man das Rad nicht neu erfinden. Eine *Browser*-3D-Engine läuft direkt in einer Webseite.

**Automatischer Test (Vitest)**
Ein kleines Prüfprogramm, das selbstständig kontrolliert, ob ein Stück Code richtig rechnet, z. B. „10 Takte ergeben 10 Holz“. Vitest ist das Werkzeug, das diese Tests ausführt. Wie eine Checkliste, die sich selbst abhakt.

**Babylon.js**
Die Browser-3D-Engine, die wir verwenden. Kostenlos, ausgereift und gut für Tablets geeignet.

**Branch („Zweig“)**
Eine parallele Fassung des Codes im Repository. Der Hauptzweig heißt bei uns `main`. Man kann sich das wie eine Kopie eines Textes vorstellen, an der man in Ruhe arbeitet, bevor man sie übernimmt.

**Build (Bauen)**
Das Umwandeln unseres Codes in fertige Dateien, die ein Browser direkt laden kann. Dabei wird alles zusammengepackt, verkleinert und geprüft. Wie das Drucken eines Buches aus dem Manuskript.

**Build-Ziel**
Die älteste Browser-Version, für die gebaut wird. Neuere Sprachmittel werden beim Bauen automatisch in ältere „übersetzt“. Bei uns: Chrome 87 und neuer.

**Claude GitHub App**
Eine kleine Erweiterung bei GitHub, die Claude erlaubt, in ausgewählte Repositories zu schreiben. Die Verbindung im Claude-Konto ist wie ein Besucherausweis, die App ist der Schlüssel für ein bestimmtes Repository. Sie lässt sich bei GitHub jederzeit wieder entfernen.

**Commit**
Ein gespeicherter Zwischenstand des Codes mit einer kurzen Notiz, was sich geändert hat, z. B. „Meer hinzugefügt“. Wie ein Spielstand: Man kann jederzeit zu jedem früheren Commit zurück.

**ESLint (Lint)**
Ein „Rechtschreibprüfer“ für Code. Er findet typische Fehler und unsaubere Stellen, bevor das Spiel läuft. „Lint“ heißt diese Prüfung.

**Fehler 403**
Eine Rückmeldung eines Servers, die „Zutritt verboten“ bedeutet: Man ist zwar bekannt, darf das Gewünschte aber nicht tun. Bei uns trat er auf, solange die Claude GitHub App noch fehlte.

**GitHub**
Eine Webseite, auf der Repositories gespeichert werden. Dort liegt unser gesamter Code mit allen früheren Fassungen.

**GitHub Pages**
Ein kostenloser Dienst von GitHub, der eine Webseite direkt aus einem Repository ins Internet stellt. Über ihn wird unser Spiel unter einem festen Link erreichbar.

**.gitignore**
Eine Liste von Dateien, die das Repository absichtlich *nicht* speichern soll, z. B. automatisch erzeugte Dateien oder geheime Einstellungen. Wie ein Schild „Bitte nicht einpacken“ beim Umzug.

**Greybox (Platzhalter-Grafik)**
Einfache graue Formen wie Würfel oder Zylinder anstelle fertiger 3D-Modelle. So kann man das Spiel bauen und testen, bevor die schöne Grafik kommt (bei uns ab Phase 8).

**Hochladen (Push)**
Das Übertragen neuer Commits aus der Arbeitsumgebung zu GitHub. Erst danach sind sie dort gespeichert und können veröffentlicht werden.

**Hosting**
Ein Dienst, der eine Webseite ins Internet stellt, damit man sie über einen Link öffnen kann. Wie ein Schaufenster, in das das fertige Spiel gestellt wird.

**Kreisel-Kamera (ArcRotateCamera)**
Eine einfache Kamera von Babylon.js, die immer auf einen Punkt schaut und darum herumkreist, wie man um ein Modell auf dem Tisch herumgeht. Unsere vorläufige Kamera bis Phase 2.

**Link-Zusatz (URL-Parameter)**
Ein Anhängsel am Ende eines Links nach einem Fragezeichen, z. B. `?aufloesung=50`. Damit kann man einer Webseite eine Einstellung mitgeben, ohne etwas zu installieren.

**npm (Paket)**
npm ist ein Online-Verzeichnis für fertige Code-Bausteine, die „Pakete“ heißen (z. B. Babylon.js). Es lädt sie auch herunter. Wie ein App-Store für Programmierer.

**Öffentlich / privat (Repository)**
Ein *öffentliches* Repository kann jeder lesen, aber nur der Besitzer und von ihm Berechtigte können etwas ändern. Ein *privates* Repository sehen nur Berechtigte.

**Pixeldichte**
Wie viele winzige Bildpunkte (Pixel) ein Bildschirm auf derselben Fläche hat. Tablets haben oft 2–3-mal so viele wie alte Monitore. Mehr Pixel bedeutet ein schärferes Bild, aber auch mehr Arbeit für den Grafikchip.

**Prettier**
Ein Werkzeug, das den Code automatisch einheitlich formatiert (Einrückungen, Zeilenumbrüche). Wie eine automatische Textformatierung.

**README**
Die „Visitenkarte“ eines Repositorys: eine Textdatei, die GitHub auf der Startseite des Repositorys anzeigt. Sie erklärt, worum es geht.

**Repository („Repo“)**
Ein Online-Ordner für den gesamten Code eines Projekts, der sich jede frühere Fassung merkt. Ein Ordner mit eingebauter Zeitmaschine.

**Szene**
Alles, was in der 3D-Welt existiert: Meer, Insel, Licht, Kamera. Wie eine Theaterbühne mit Kulissen und Scheinwerfern.

**TypeScript**
Die Programmiersprache, in der Claude den Code schreibt. Sie ist eine strengere Form von JavaScript (der Sprache aller Webseiten) und findet viele Fehler schon beim Schreiben. Vor dem Veröffentlichen wird sie in JavaScript übersetzt.

**Unsichtbarer Chrome (Headless)**
Ein Chrome-Browser ohne Fenster, den Claude in der Cloud-Umgebung startet, um das Spiel selbst zu prüfen und Bildschirmfotos zu machen.

**Versionsanzeige**
Die kleine Angabe unten rechts im Spiel (Bauzeitpunkt + Commit-Kürzel). Daran erkennt man, ob man die neueste Version sieht.

**Vite**
Das Bau-Werkzeug: Es macht aus unserem Code die fertigen Dateien für den Browser (siehe „Build“) und startet beim Entwickeln eine Vorschau.

**WebGL**
Die Technik, mit der ein Browser 3D-Grafik über den Grafikchip zeichnet. Babylon.js nutzt sie. WebGL2 ist die neuere, leistungsfähigere Fassung.

**Zwei-Faktor-Anmeldung (2FA)**
Ein zweites Schloss für ein Konto: Zusätzlich zum Passwort braucht man einen Code, z. B. aus einer App auf dem Handy. Selbst wer das Passwort kennt, kommt dann nicht hinein.
