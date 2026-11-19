# Glossar

Fachbegriffe in Alltagssprache, alphabetisch sortiert. Neue Begriffe kommen hinzu, sobald sie im Projekt auftauchen.

---

**3D-Engine (Browser-3D-Engine)**
Ein fertiger Werkzeugkasten, der 3D-Bilder zeichnet: Licht, Kamera, Formen, Wasser. So muss man das Rad nicht neu erfinden. Eine *Browser*-3D-Engine läuft direkt in einer Webseite.

**Architektur**
Der Bauplan der Software: welche Teile es gibt, was jeder Teil darf und wie sie zusammenarbeiten. Unser Bauplan vergleicht das Spiel mit einem Brettspiel und steht in `docs/ARCHITEKTUR.md`.

**Aufhol-Lawine**
Hängt das Tablet kurz, würde eine einfache Spieluhr alle verpassten Takte auf einmal nachholen. Das kostet so viel Zeit, dass es wieder hängt, und so weiter. Unsere Uhr zählt deshalb pro Bild höchstens eine Viertelsekunde.

**Automatischer Test (Vitest)**
Ein kleines Prüfprogramm, das selbstständig kontrolliert, ob ein Stück Code richtig rechnet, z. B. „10 Takte ergeben 10 Holz“. Vitest ist das Werkzeug, das diese Tests ausführt. Wie eine Checkliste, die sich selbst abhakt.

**Babylon.js**
Die Browser-3D-Engine, die wir verwenden. Kostenlos, ausgereift und gut für Tablets geeignet.

**Bau-Werkzeug (Modus)**
Ein Knopf schaltet um, was ein Finger auf der Karte tut. Ohne Werkzeug verschiebt er die Karte, mit dem Straßen-Werkzeug zieht er Straßen, mit dem Abriss-Werkzeug reißt er ab. Wie beim Malprogramm: Erst wählt man Pinsel oder Radiergummi, dann malt man. Mit gewähltem Werkzeug bewegt man die Karte mit 2 Fingern (E-022).

**Befehl (Command)**
Ein kleines Datenpaket für eine Spieler-Aktion, z. B. „Baue hier einen Holzfäller“. Wie ein Wunschzettel an den Spielleiter: Er prüft ihn und erledigt ihn oder sagt, warum es nicht geht („Nicht genug Holz“).

**Belastungstest (Stresstest)**
Ein Test, der das Gerät absichtlich immer stärker fordert (z. B. immer mehr Bäume), um zu sehen, wo es anfängt zu ruckeln. Wie ein Probelauf mit immer schwererem Gepäck. Bei uns auf der Testseite `check.html`.

**Bildraten-Begrenzer**
Sorgt dafür, dass höchstens eine bestimmte Zahl von Bildern pro Sekunde gezeichnet wird (bei uns 60), auch wenn der Bildschirm mehr könnte. Schont Akku und hält das Tablet kühler.

**Bildwiederholrate**
Wie oft pro Sekunde der Bildschirm ein neues Bild anzeigen kann, meist 60-mal (60 Hz). Mehr Bilder pro Sekunde, als der Bildschirm zeigt, sind nicht möglich.

**Branch („Zweig“)**
Eine parallele Fassung des Codes im Repository. Der Hauptzweig heißt bei uns `main`. Man kann sich das wie eine Kopie eines Textes vorstellen, an der man in Ruhe arbeitet, bevor man sie übernimmt.

**Build (Bauen)**
Das Umwandeln unseres Codes in fertige Dateien, die ein Browser direkt laden kann. Dabei wird alles zusammengepackt, verkleinert und geprüft. Wie das Drucken eines Buches aus dem Manuskript.

**Build-Ziel**
Die älteste Browser-Version, für die gebaut wird. Neuere Sprachmittel werden beim Bauen automatisch in ältere „übersetzt“. Bei uns: Chrome 111 und neuer (E-013).

**Claude GitHub App**
Eine kleine Erweiterung bei GitHub, die Claude erlaubt, in ausgewählte Repositories zu schreiben. Die Verbindung im Claude-Konto ist wie ein Besucherausweis, die App ist der Schlüssel für ein bestimmtes Repository. Sie lässt sich bei GitHub jederzeit wieder entfernen.

**Commit**
Ein gespeicherter Zwischenstand des Codes mit einer kurzen Notiz, was sich geändert hat, z. B. „Meer hinzugefügt“. Wie ein Spielstand: Man kann jederzeit zu jedem früheren Commit zurück.

**Datengetrieben**
Spielinhalte wie Waren und Gebäude stehen in Datendateien statt im Programmcode. Neues lässt sich eintragen, ohne die Spielregeln umzuschreiben. Wie der Kartenkatalog eines Brettspiels.

**Debug-Anzeige**
Ein kleines Prüf-Fenster oben links im Spiel (Knopf mit den drei Balken). Es zeigt Messwerte wie Bildrate, Takt-Nummer, Holz, Dreiecke und Draw Calls und hat Knöpfe für die Spielgeschwindigkeit. „Debug“ heißt wörtlich „entwanzen“, also Fehler suchen. Wie die Anzeigen im Cockpit: Für die Fahrt selbst braucht man sie nicht, aber man sieht sofort, ob alles stimmt.

**Draw Call (Zeichenauftrag)**
Ein einzelner Auftrag des Prozessors an den Grafikchip: „Zeichne dieses Objekt.“ Jeder Auftrag kostet Verwaltungsaufwand, egal wie klein das Objekt ist. Thin Instances fassen viele gleiche Objekte zu einem einzigen Auftrag zusammen.

**Dreieck (Polygon)**
Jede 3D-Form besteht aus vielen kleinen Dreiecken, wie ein Fußball aus Flicken. Je mehr Dreiecke, desto feiner die Form, aber desto mehr Arbeit für den Grafikchip. Unser Test-Baum hat 88 Dreiecke.

**Durchstich**
Ein erster, ganz schmaler Weg durch alle Teile des Spiels, um zu beweisen, dass sie zusammenpassen. Wie beim Tunnelbau: Bevor der Tunnel breit ausgebaut wird, bohrt man einmal komplett durch. Bei uns: Holz steht in einer Datendatei, wird im Takt hergestellt und erscheint im Bild.

**Ereignis-Bus (Beobachter-Prinzip)**
Das „Lautsprecher-System“ des Spiels: Die Simulation macht Durchsagen („Holz jetzt 24“), Darstellung und Bedienoberfläche melden sich als Zuhörer für die Durchsagen an, die sie interessieren.

**ESLint (Lint)**
Ein „Rechtschreibprüfer“ für Code. Er findet typische Fehler und unsaubere Stellen, bevor das Spiel läuft. „Lint“ heißt diese Prüfung.

**Fahrplan-Prinzip**
Bewegungen (Karren, Schiffe) werden als Fahrplan gespeichert: Start, Ziel, Abfahrtszeit, Geschwindigkeit. Wie bei der Bahn weiß man damit jederzeit, wo etwas gerade ist, ohne ständig nachzusehen. Spart Rechenzeit.

**Fehler 403**
Eine Rückmeldung eines Servers, die „Zutritt verboten“ bedeutet: Man ist zwar bekannt, darf das Gewünschte aber nicht tun. Bei uns trat er auf, solange die Claude GitHub App noch fehlte.

**FPS (Bilder pro Sekunde)**
Wie viele Bilder das Spiel pro Sekunde zeichnet. Ab etwa 30 wirkt alles flüssig, darunter beginnt es zu ruckeln. Wie bei einem Daumenkino: Je schneller man blättert, desto flüssiger die Bewegung.

**Fruchtbarkeit**
Welche Pflanzen auf einer Insel wachsen, z. B. Kakao oder Tabak. Jede Insel hat nur einige davon, deshalb kann keine Insel alles selbst herstellen. Das macht Besiedlung und Handel nötig.

**Geist (Bau-Vorschau)**
Ein durchscheinendes Vorschau-Gebäude, das zeigt, wo ein Gebäude landen würde. Grün heißt „passt“, rot heißt „passt nicht“, mit Grund (z. B. „Berg“). Erst beim Bestätigen wird wirklich gebaut.

**Generator (Welt-Generator)**
Ein Programm, das nach festen Regeln eine Inselwelt erzeugt, statt dass jemand sie von Hand zeichnet („prozedural“). Mit dem Seed als Startnummer entsteht immer wieder dieselbe Welt. Wie ein Rezept: gleiche Zutaten, gleicher Kuchen.

**GitHub**
Eine Webseite, auf der Repositories gespeichert werden. Dort liegt unser gesamter Code mit allen früheren Fassungen.

**GitHub Actions (Workflow)**
Ein Dienst von GitHub, der bei bestimmten Ereignissen automatisch Arbeitsschritte ausführt, z. B. „bei jedem Hochladen: prüfen, bauen, veröffentlichen“. Die Liste dieser Schritte heißt Workflow. Wie eine Fertigungsstraße, die bei jeder Lieferung von selbst anläuft.

**GitHub Pages**
Ein kostenloser Dienst von GitHub, der eine Webseite direkt aus einem Repository ins Internet stellt. Über ihn wird unser Spiel unter einem festen Link erreichbar.

**.gitignore**
Eine Liste von Dateien, die das Repository absichtlich *nicht* speichern soll, z. B. automatisch erzeugte Dateien oder geheime Einstellungen. Wie ein Schild „Bitte nicht einpacken“ beim Umzug.

**Git-Tag (Markierung)**
Ein fester Name für einen bestimmten Stand im Repository, z. B. „phase-1“. Wie ein Lesezeichen im Buch: Man findet diesen Stand jederzeit wieder, auch wenn später viel dazukommt.

**Greybox (Platzhalter-Grafik)**
Einfache graue Formen wie Würfel oder Zylinder anstelle fertiger 3D-Modelle. So kann man das Spiel bauen und testen, bevor die schöne Grafik kommt (bei uns ab Phase 8).

**Grundfläche (Footprint)**
Die Kacheln, die ein Gebäude auf dem Boden belegt, z. B. 3 × 3. Wird ein Gebäude um 90° gedreht, tauschen Breite und Tiefe die Rollen.

**Hochladen (Push)**
Das Übertragen neuer Commits aus der Arbeitsumgebung zu GitHub. Erst danach sind sie dort gespeichert und können veröffentlicht werden.

**Hosting**
Ein Dienst, der eine Webseite ins Internet stellt, damit man sie über einen Link öffnen kann. Wie ein Schaufenster, in das das fertige Spiel gestellt wird.

**ID (Kennung)**
Ein eindeutiger Name oder eine Nummer, über die man etwas wiederfindet, z. B. die Ware „wood“ oder Gebäude Nr. 17. Wie eine Hausnummer.

**Interpolation**
Zwischenwerte ausrechnen. Die Simulation rechnet nur zweimal pro Sekunde; die Darstellung berechnet für jedes Bild, wo ein Karren *zwischen* zwei Takten gerade ist. So gleitet er weich.

**JSON**
Ein einfaches Textformat für Daten, z. B. `{ "id": "wood", "name": "Holz" }`. Menschen und Computer können es gleichermaßen lesen. Unsere Spieldaten und später die Spielstände sind JSON.

**Kachel und Raster**
Das Raster ist wie Karopapier über der Welt, eine Kachel ist ein Kästchen davon (bei uns 2 × 2 Meter, so breit wie ein Feldweg). Jede Kachel hat eine Nummer aus Spalte und Zeile, z. B. 12/7, und einen „Notizzettel“: Geländeart, Insel, Baum, Gebäude oder Straße. Gebäude und Straßen werden immer genau auf Kacheln gesetzt.

**Kreisel-Kamera (ArcRotateCamera)**
Eine einfache Kamera von Babylon.js, die immer auf einen Punkt schaut und darum herumkreist, wie man um ein Modell auf dem Tisch herumgeht. Unsere vorläufige Kamera bis Phase 2.

**Leistungsbudget**
Verbindliche Obergrenzen dafür, wie viel das Spiel dem Tablet zumuten darf (Bildrate, Dreiecke, Draw Calls, Ladezeit). Wie ein Haushaltsbudget: Jede neue Funktion kostet etwas, und die Summe muss in den Rahmen passen. Steht in `docs/LEISTUNGSBUDGET.md`.

**Link-Zusatz (URL-Parameter)**
Ein Anhängsel am Ende eines Links nach einem Fragezeichen, z. B. `?aufloesung=50`. Damit kann man einer Webseite eine Einstellung mitgeben, ohne etwas zu installieren.

**Migration (Spielstand-Umwandlung)**
Ein kleines Umbau-Programm, das einen alten Spielstand an eine neue Spielversion anpasst. Dafür trägt jeder Spielstand eine Versionsnummer.

**npm (Paket)**
npm ist ein Online-Verzeichnis für fertige Code-Bausteine, die „Pakete“ heißen (z. B. Babylon.js). Es lädt sie auch herunter. Wie ein App-Store für Programmierer.

**Öffentlich / privat (Repository)**
Ein *öffentliches* Repository kann jeder lesen, aber nur der Besitzer und von ihm Berechtigte können etwas ändern. Ein *privates* Repository sehen nur Berechtigte.

**Pixeldichte**
Wie viele winzige Bildpunkte (Pixel) ein Bildschirm auf derselben Fläche hat. Tablets haben oft 2–3-mal so viele wie alte Monitore. Mehr Pixel bedeutet ein schärferes Bild, aber auch mehr Arbeit für den Grafikchip.

**Pooling (Wiederverwenden)**
Häufig gebrauchte Objekte (Karren, Figuren) kommen aus einem Vorrat und gehen danach dorthin zurück, statt jedes Mal neu erzeugt und weggeworfen zu werden. Wie Leihfahrräder. Vermeidet kleine Ruckler.

**Prettier**
Ein Werkzeug, das den Code automatisch einheitlich formatiert (Einrückungen, Zeilenumbrüche). Wie eine automatische Textformatierung.

**Prüfkürzel (Hash)**
Eine kurze Buchstabenfolge, die aus dem Inhalt einer Datei berechnet wird, z. B. `CfjoKiQ4` in `index-CfjoKiQ4.js`. Ändert sich der Inhalt, ändert sich das Kürzel und damit der Dateiname. So kann der Browser keine veraltete Datei verwenden.

**Prüfschema (Schema)**
Eine Art Formular-Vorlage für Daten: Welche Felder gibt es, welche Art von Wert gehört hinein, welche Grenzen gelten? Daten werden beim Laden damit kontrolliert, Fehler kommen als deutsche Meldung.

**Qualitätsstufe (Grafik)**
Eine Sammel-Einstellung für die Bildqualität, bei uns Hoch, Mittel und Niedrig. Niedrigere Stufen sehen etwas schlichter aus, laufen aber flüssiger und sparen Akku.

**Querverweis**
Eine Angabe in einer Datendatei, die auf einen Eintrag in einer anderen Datei zeigt. Beispiel: Der Test-Holzfäller in `buildings.json` stellt die Ware „wood“ her, die in `goods.json` stehen muss. Der Daten-Lader prüft, ob jeder Querverweis ein Ziel hat.

**README**
Die „Visitenkarte“ eines Repositorys: eine Textdatei, die GitHub auf der Startseite des Repositorys anzeigt. Sie erklärt, worum es geht.

**Repository („Repo“)**
Ein Online-Ordner für den gesamten Code eines Projekts, der sich jede frühere Fassung merkt. Ein Ordner mit eingebauter Zeitmaschine.

**Rohstoffvorkommen**
Eine Stelle in den Bergen, an der ein Rohstoff liegt, z. B. Eisenerz, Marmor, Gold oder Edelsteine. Später baut man dort eine Mine. Nicht jede Insel hat jedes Vorkommen.

**Ruhebild**
Akku-Sparmodus des Zeichnens: Bewegt sich 2 Sekunden lang nichts im Bild, wird nur noch gezeichnet, wenn sich etwas ändert, plus ein Kontrollbild pro Sekunde. Bei Berührung sofort wieder flüssig.

**Schatten-Karte**
Ein unsichtbares Hilfsbild, auf dem die Sonne „sieht“, was im Schatten liegt. Je größer (z. B. 1024 × 1024 Bildpunkte), desto schärfer die Schatten, aber desto mehr Arbeit. Schatten kosten deshalb spürbar Leistung.

**Schicht (Layer)**
Ein Teil der Architektur mit einer klaren Aufgabe, bei uns ein Ordner unter `src/` (z. B. `sim/` für die Spiellogik). Jede Schicht darf nur bestimmte andere benutzen; ESLint prüft das automatisch.

**Seed (Startnummer) und Zufallsgenerator**
Ein Computer kann nicht wirklich würfeln. Ein Zufallsgenerator macht aus einer Startnummer (dem Seed) eine Zahlenfolge, die zufällig aussieht. Gleicher Seed, gleiche Folge, gleiche Inselwelt.

**Simulation (Spiellogik)**
Der Teil des Programms, der das Spiel „rechnet“: Waren, Produktion, Bevölkerung, Handel. Er weiß nichts von der Grafik. Im Brettspiel-Vergleich der Spielleiter.

**Spielzustand und Spielstand**
Der Spielzustand ist alles, was in einer Partie gerade gilt, in einem einzigen Datenpaket. Ein Spielstand ist dieser Zustand als gespeicherter Text, wie ein Foto vom Spielbrett.

**Strahl-Test (Picking)**
So findet das Spiel heraus, was der Finger getroffen hat: Es schickt einen unsichtbaren Strahl von der Kamera durch die Fingerspitze in die 3D-Szene, wie einen Laserpointer. Wo der Strahl den Boden trifft, liegt die gesuchte Kachel.

**System (Teil der Spiellogik)**
Ein Baustein der Simulation, der in jedem Wirtschafts-Takt einmal läuft, z. B. die Produktion. Später kommen Verbrauch, Steuern, Marktkarren usw. dazu. Die Systeme laufen immer in derselben Reihenfolge, wie die Stationen an einem Fließband.

**Szene**
Alles, was in der 3D-Welt existiert: Meer, Insel, Licht, Kamera. Wie eine Theaterbühne mit Kulissen und Scheinwerfern.

**Takt (Wirtschafts-Takt, Tick)**
Alle 0,5 Sekunden Spielzeit rechnet die Simulation einmal alles durch: Produktion, Verbrauch, Steuern. Wie die Rundenglocke bei einem Brettspiel. Bei 2× Tempo läutet sie doppelt so oft.

**Thin Instances**
Ein Trick von Babylon.js: Ein Objekt (z. B. ein Baum) wird nur einmal an den Grafikchip geschickt, zusammen mit einer Liste von Positionen. Der Grafikchip zeichnet es dann tausendfach auf einmal. Wie ein Stempel statt tausend einzelner Zeichnungen.

**TypeScript**
Die Programmiersprache, in der Claude den Code schreibt. Sie ist eine strengere Form von JavaScript (der Sprache aller Webseiten) und findet viele Fehler schon beim Schreiben. Vor dem Veröffentlichen wird sie in JavaScript übersetzt.

**Unsichtbarer Chrome (Headless)**
Ein Chrome-Browser ohne Fenster, den Claude in der Cloud-Umgebung startet, um das Spiel selbst zu prüfen und Bildschirmfotos zu machen.

**Veröffentlichen (Deploy)**
Das Hochladen des gebauten Spiels zum Hosting-Dienst, damit es unter dem Spiel-Link erreichbar ist.

**Versionsanzeige**
Die kleine Angabe unten rechts im Spiel (Bauzeitpunkt + Commit-Kürzel). Daran erkennt man, ob man die neueste Version sieht.

**Vite**
Das Bau-Werkzeug: Es macht aus unserem Code die fertigen Dateien für den Browser (siehe „Build“) und startet beim Entwickeln eine Vorschau.

**Web Worker**
Ein zweiter Rechenstrang im Browser, der parallel zum Hauptprogramm arbeitet. Könnte später die Simulation übernehmen, falls große Städte viel Rechenzeit brauchen.

**WebGL**
Die Technik, mit der ein Browser 3D-Grafik über den Grafikchip zeichnet. Babylon.js nutzt sie. WebGL2 ist die neuere, leistungsfähigere Fassung.

**WebGPU**
Eine neuere Technik für 3D-Grafik im Browser, der Nachfolger von WebGL. Schneller, aber noch nicht auf allen Geräten verfügbar. Unsere Testseite prüft, ob das Tablet sie kann.

**Zahlenfeld (Typed Array)**
Eine lange, platzsparende Liste aus lauter Zahlen derselben Art, z. B. eine Zahl pro Kachel für die Geländeart. Bei 256 × 256 Kacheln sind das 65.536 Zahlen. Viel sparsamer und schneller als ein eigener „Notizzettel“ pro Kachel.

**Zeichen-Takt**
Wie oft die Darstellung ein neues Bild zeichnet (bei uns höchstens 60-mal pro Sekunde). Er ist vom Wirtschafts-Takt getrennt: Das Spiel rechnet gleich schnell, egal wie flüssig das Bild ist.

**zod**
Ein Werkzeug, das Daten mit einem Prüfschema kontrolliert. Wir nutzen die schlanke Variante (ca. 6 kB). Aus dem Schema entsteht zugleich die Typ-Beschreibung für TypeScript.

**Zwei-Faktor-Anmeldung (2FA)**
Ein zweites Schloss für ein Konto: Zusätzlich zum Passwort braucht man einen Code, z. B. aus einer App auf dem Handy. Selbst wer das Passwort kennt, kommt dann nicht hinein.

**Zwischenspeicher (Cache)**
Ein Vorrat an kürzlich geladenen Dateien im Browser oder im Netz, damit Seiten schneller laden. Nachteil: Man sieht manchmal kurz eine alte Fassung. Deshalb gibt es Prüfkürzel und den Update-Hinweis.
