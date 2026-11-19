# Architektur – der Bauplan von Kontor & Krone

Dieses Dokument beschreibt, wie die Teile des Spiels zusammenarbeiten.
Es gilt für alle Phasen. Wer Code schreibt, hält sich daran; Änderungen werden hier und in [ENTSCHEIDUNGEN.md](ENTSCHEIDUNGEN.md) festgehalten.

- **Stand:** 19.11.2026 · Unterphase 2.3
- **Status:** ✅ vom Nutzer bestätigt am 18.11.2026 (E-016, E-017, E-018). Grundgerüst umgesetzt in Unterphase 1.6, Durchstich in 1.7 (E-019), Welt-Datenmodell in 2.2 (E-025), Weltgenerator in 2.3 (E-027).

---

## 1. Auf einen Blick: das Spiel als Brettspiel

Stell dir Kontor & Krone als Brettspiel vor, das von einer Fernsehkamera gefilmt wird.

| Im Brettspiel | Im Code | Ordner |
| --- | --- | --- |
| **Spielbrett mit allen Figuren und Notizzetteln** – alles, was gerade gilt | **Spielzustand** | `sim/` |
| **Karopapier auf dem Spielbrett** – jedes Kästchen weiß, was darauf liegt | **Kachel-Raster der Welt** | `sim/` |
| **Spielleiter**, der die Regeln anwendet und das Brett verändert | **Simulation** (Spiellogik) | `sim/` |
| **Regelbuch und Kartenkatalog** – welche Waren und Gebäude es gibt | **Spieldaten** (JSON-Dateien) | `data/` |
| **Rundenglocke**, die alle 0,5 Sekunden läutet | **Wirtschafts-Takt** | `core/` |
| **Lautsprecher-Durchsagen** („Holz +2!“) | **Ereignis-Bus** | `core/` |
| **Würfel mit Startnummer**: gleiche Nummer, gleiche Würfe | **Zufallsgenerator mit Seed** | `core/` |
| **Bühnenbildner**, der vor Spielbeginn nach Bauplan die Inseln aufs Brett legt | **Weltgenerator** | `sim/worldgen/` |
| **Wunschzettel** des Spielers an den Spielleiter („Bitte baue hier einen Holzfäller“) | **Befehle** | `sim/` |
| **Hände des Spielers** | **Eingabe** (Touch) | `input/` |
| **Fernsehkamera**, die das Brett hübsch filmt – sie darf nichts verschieben | **Darstellung** (Babylon.js) | `render/` |
| **Anzeigetafel und Knöpfe** am Spieltisch | **Bedienoberfläche** | `ui/` |
| **Regie**, die vor Spielbeginn alles aufbaut und verbindet | **Start und Spiel-Schleife** | `app/` |
| **Prüfgeräte** des Technikers | **Debug-Werkzeuge** | `debug/` |

**Die wichtigste Regel:** Der Spielleiter (Simulation) weiß nichts von der Kamera (Grafik).
Die Kamera schaut nur zu und reagiert auf Durchsagen. Deshalb kann man die Spielregeln ohne Grafik testen, Spielstände einfach speichern und die Grafik später austauschen (Phase 8), ohne die Regeln anzufassen.

## 2. Diagramm

```mermaid
flowchart LR
  finger([Finger]) --> input[input: Eingabe]
  input -- "Befehle" --> sim
  ui[ui: Oberfläche] -- "Befehle" --> sim
  data[(data: Spieldaten)] -- "geprüft geladen" --> sim
  clock[core: Takt alle 0,5 s] --> sim[sim: Spielregeln]
  sim -- "verändert" --> state[(Spielzustand)]
  sim -- "Ereignisse" --> bus{{core: Ereignis-Bus}}
  bus --> render[render: Darstellung]
  bus --> ui
  state -. "nur lesen" .-> render
  state -. "nur lesen" .-> ui
  render --> screen([Bildschirm])
```

Kurz: **Befehle gehen hinein, Ereignisse kommen heraus.** Dazwischen liegt nur die Simulation.

## 3. Schichten und Ordner

| Ordner | Aufgabe | darf benutzen |
| --- | --- | --- |
| `core/` | Takt (Uhr), Ereignis-Bus, Zufall, Versionsangaben, Lauflängen-Kodierung | nichts anderes |
| `data/` | Spieldaten (JSON), Prüfschemas, Daten-Lader | `core` |
| `sim/` | Spielzustand, Spielregeln, Befehle, Spielstand-Format | `core`, `data` |
| `render/` | 3D-Darstellung mit Babylon.js | `core`, `data`, `sim` (nur lesen) |
| `input/` | Finger-Eingaben in Befehle übersetzen | `core`, `sim`, `render` (um angetippte 3D-Objekte zu finden) |
| `ui/` | Bedienoberfläche (HTML) | `core`, `data`, `sim` – **kein** Babylon.js |
| `debug/` | Prüfhilfen (Geräte-Check, Debug-Anzeige) | alles |
| `app/` | Start, Spiel-Schleife, Versionsprüfung, Link-Zusätze, später Speichern im Browser: verbindet alle Teile | alles |

`main.ts` ruft nur `app/` auf. `updateCheck.ts` ist von `core/` nach `app/` umgezogen, weil es den Browser braucht.

**Automatische Kontrolle:** ESLint (der „Rechtschreibprüfer“ für Code) prüft diese Tabelle bei jedem Bauen.
Ein verbotener Import, z. B. Babylon.js in `sim/`, ist ein Fehler. Dann wird auch nichts veröffentlicht.
Zusätzlich sind in `core/`, `data/` und `sim/` verboten: Browser-Zugriffe (`window`, `document` …), `Math.random()` und die Uhrzeit (`Date.now()`).
Dadurch rechnet die Simulation auf jedem Gerät exakt gleich (siehe Abschnitt 8).

## 4. Der Spielzustand

Alles, was ein Spielstand enthalten muss, steht in **einem** Objekt: dem Spielzustand.

- **Nur einfache Daten:** Zahlen, Texte, Ja/Nein, Listen und einfache Objekte. Keine 3D-Objekte, keine Funktionen.
  Dadurch lässt er sich jederzeit 1 : 1 als Text (JSON) speichern und wieder laden.
  Einzige Besonderheit: Das Kachel-Raster (Abschnitt 4.1) besteht aus **Zahlenfeldern**, langen Listen aus lauter Zahlen. Sie werden beim Speichern platzsparend als Text geschrieben (Lauflängen-Kodierung).
- **Verweise über Nummern (IDs):** Ein Marktkarren merkt sich nicht „das Lagerhaus-Objekt“, sondern „Gebäude Nr. 17“.
  Wie Hausnummern statt Wegbeschreibungen: Nach dem Laden stimmen die Nummern immer noch.
  - Dinge auf der Karte (Gebäude, Karren, Schiffe) bekommen fortlaufende Nummern.
  - Dinge aus den Spieldaten (Waren, Gebäudearten) haben feste englische Namen, z. B. `wood`.
- **Versionsnummer:** Jeder Spielstand trägt eine Versionsnummer (`saveVersion`). Ändert sich später der Aufbau, wandelt ein kleines Umbau-Programm alte Spielstände automatisch um („Migration“).
- **Nur die Simulation darf ihn ändern.** Darstellung und Oberfläche bekommen eine schreibgeschützte Sicht; TypeScript meldet jeden Änderungsversuch als Fehler.

Beispiel als Spielstand-Text (Stand Unterphase 2.2, Zahlen gekürzt):

```json
{
  "saveVersion": 1,
  "seed": 1701,
  "random": { "world": [1, 2, 3, 4], "events": [5, 6, 7, 8] },
  "world": {
    "width": 256,
    "height": 256,
    "terrain": [0, 9120, 1, 4, 2, 3, 3, 11, "…"],
    "elevation": ["…"],
    "island": ["…"],
    "trees": ["…"],
    "occupancy": [0, 65536]
  },
  "islands": [{ "id": 1, "fertilities": ["cocoa", "tobacco"], "deposits": [{ "resource": "iron_ore", "x": 40, "y": 12 }] }],
  "tick": 1240,
  "nextEntityId": 2,
  "buildings": { "1": { "id": 1, "type": "test_woodcutter" } },
  "storage": { "wood": 1240 }
}
```

Die Spielgeschwindigkeit gehört nicht zum Spielzustand, sondern zur Uhr (Abschnitt 5).
Das Spielstand-Format (Text hin und zurück, Prüfung beim Einlesen, Umwandlung alter Versionen) steht in `sim/save.ts`; das Ablegen im Browser-Speicher kommt in Phase 3.
Die Versionsnummer bleibt bis zum ersten echten Speichern in Phase 3 bei 1, auch wenn sich der Aufbau ändert: Es gibt noch keine alten Spielstände, die umgewandelt werden müssten (E-025).

### 4.1 Die Welt als Kachel-Raster

Die Welt ist mit einem Raster aus quadratischen **Kacheln** überzogen, wie Karopapier.
Gebäude, Straßen und Bäume stehen immer genau auf Kacheln. Die Test-Welt hat 256 × 256 Kacheln, eine Kachel ist 2 × 2 Meter groß (so breit wie ein Feldweg), die Karte also 512 × 512 Meter (E-021).

**Achsen** (Blick von oben, Karte ausgenordet):

```
        Norden (+y bei Kacheln, +z in der 3D-Welt)
          ▲
          │   Kachel (x, y) liegt zwischen den Ecken (x, y) und (x + 1, y + 1)
          │
   (0, 0) └──────────▶ Osten (+x)
```

Kachel 0/0 ist die südwestliche Ecke der Karte. In der 3D-Welt zeigt die dritte Achse (bei Babylon.js „y“) nach oben; der Meeresspiegel liegt bei 0.

**Der „Notizzettel“ jeder Kachel** besteht aus fünf Angaben. Statt eines Objekts pro Kachel (65.536 Stück!) gibt es pro Angabe ein langes **Zahlenfeld** mit einer Zahl pro Kachel, Zeile für Zeile von Süden nach Norden. Das braucht für die ganze Karte nur 512 kB und ist schnell.

| Ebene | Zahl je Kachel | Bedeutung |
| --- | --- | --- |
| `terrain` | 0–255 | Geländeart: Position in `terrain.json` (0 = erster Eintrag, z. B. tiefes Wasser, 3 = Ebene) |
| `elevation` | 0–255 | Höhe in Stufen zu 0,125 m; 32 = Meeresspiegel, also −4 m bis knapp 28 m |
| `island` | 0–255 | Inselnummer, 0 = Meer |
| `trees` | 0–255 | 0 = kein Baum, 1 = Baum (E-024: Bauen räumt Bäume weg) |
| `occupancy` | ganze Zahl | Belegung: 0 = frei, positive Zahl = Nummer des Gebäudes, negative Zahl = Straße (ab 2.6) |

Dazu kommt eine kurze Liste der **Inseln** (`islands`): Nummer, Fruchtbarkeiten (z. B. Kakao, Tabak) und Rohstoffvorkommen in den Bergen (Art und Kachel).

**Wichtige Regeln:**
- **Umrechnung Kachel ↔ 3D-Position an genau einer Stelle:** `sim/worldSpace.ts`. Darstellung (`render/`) und Eingabe (`input/`) benutzen sie, z. B. um aus dem Punkt unter dem Finger die Kachel zu bestimmen. So rechnen alle mit denselben Zahlen.
- **Grundfläche und Drehung** eines Gebäudes berechnet `sim/footprint.ts`: Jede Gebäudeart hat in `buildings.json` eine Größe in Kacheln (z. B. 3 × 3) und den erlaubten Untergrund (z. B. nur Ebene). Gedreht wird in 90°-Schritten; dabei tauschen Breite und Tiefe die Rollen.
- **Schreibschutz:** Darstellung und Oberfläche sehen die Zahlenfelder nur lesend; jeder Änderungsversuch ist ein TypeScript-Fehler.
- **Reihenfolge in `terrain.json` nicht ändern,** neue Geländearten nur hinten anhängen: Die Kacheln speichern die Position in dieser Liste. Ab Phase 3 bekommt der Spielstand eine „Legende“, dann ist auch Umsortieren sicher (IDEEN-SPAETER.md).
- **Im Spielstand** steht jede Ebene **lauflängen-kodiert** (`core/runLength.ts`): statt „0, 0, 0, 0, 0“ steht dort „0, 5“ (Wert, Anzahl). Eine Ebene nur aus Meer schrumpft so von 65.536 Zahlen auf 2. Beim Einlesen wird jede Ebene geprüft (Länge, erlaubte Werte).

### 4.2 Der Weltgenerator

Bei einer neuen Partie baut der Weltgenerator (`sim/worldgen/`) aus dem Seed die Inselwelt, wie ein Bühnenbildner in sechs Schritten (E-027):

1. **Inseln planen** (`islandPlan.ts`): wie viele, wie groß, wo. Die größten zuerst, jeweils auf den Platz mit dem meisten Freiraum.
2. **Umrisse zeichnen** (`landShape.ts`): ein Kreis, dessen Rand ein „Rauschen“ (sanftes Zufallsfeld, `noise.ts`) verbeult; danach glätten, Krümel entfernen, Seen auffüllen.
3. **Gelände und Höhen** (`terrainShaping.ts`): Flachwasser und tiefes Wasser, Strand an der Küste, Ebene, Gebirge aus mehreren Kuppen. Ebenen sind ganz flach. Abstände (z. B. „wie weit bis zur Küste?“) misst `distance.ts`.
4. **Rohstoffvorkommen** (`deposits.ts`) am Fuß der Berge.
5. **Fruchtbarkeiten** (`fertilities.ts`) je Insel, keine Insel hat alle.
6. **Wälder** (`forests.ts`) auf den Ebenen.

Alle Regeln und Häufigkeiten stehen in `data/worldgen.json`. Gewürfelt wird nur mit dem Zufalls-Strom „world“, deshalb ergibt der gleiche Seed auf jedem Gerät die gleiche Welt. `sim/newGame.ts` legt eine neue Partie an und ruft den Generator auf.

Die Darstellung liest nur das Ergebnis: ein Netz pro Insel (`render/terrainView.ts`), Meeresboden und durchscheinendes Wasser (`render/seaView.ts`), Bäume als Thin Instances (`render/treeView.ts`).

## 5. Die Uhr: Wirtschafts-Takt und Zeichen-Takt

Das Spiel hat zwei getrennte Takte, wie ein Uhrwerk mit zwei Rädern:

**Wirtschafts-Takt (Simulation):** genau alle 0,5 Sekunden Spielzeit, egal wie schnell das Tablet zeichnet.
Pro Takt rechnet die Simulation einmal alles durch: Produktion, Verbrauch, Steuern.

| Tempo | Takte pro Sekunde |
| --- | --- |
| Pause | 0 |
| 1× | 2 |
| 2× | 4 |
| 4× | 8 |

**Schutz vor der „Aufhol-Lawine“:** Hängt das Tablet kurz oder war das Spiel im Hintergrund, würde eine einfache Uhr alle verpassten Takte auf einmal nachholen – das Spiel friert ein, holt auf, friert wieder ein.
Deshalb zählt pro Bild höchstens eine Viertelsekunde echte Zeit. Was darüber liegt, verfällt: Das Spiel läuft dann kurz langsamer, statt zu ruckeln.
Im Hintergrund (andere App, Bildschirm aus) hält die Spiel-Schleife ganz an, das Spiel steht still und verpasst nichts. Beim Zurückkehren läuft es sofort im eingestellten Tempo weiter (E-018).

**Zeichen-Takt (Darstellung):** höchstens 60 Bilder pro Sekunde (E-015), siehe Abschnitt 9.

**Bewegungen (Karren, Schiffe, Figuren) – das „Fahrplan-Prinzip“:**
Die Simulation speichert nicht laufend die Position, sondern einen Fahrplan: „Karren 5 fährt in Takt 1200 von A nach B, Geschwindigkeit 2 Felder pro Takt.“
Wie bei der Bahn: Mit dem Fahrplan weiß man jederzeit, wo der Zug gerade ist, ohne nachzusehen.
Die Darstellung rechnet daraus bei jedem Bild die genaue Position aus, auch zwischen zwei Takten („Interpolation“). So gleiten Karren weich mit 60 Bildern pro Sekunde, obwohl die Simulation nur 2-mal pro Sekunde rechnet.
**Ein feinerer Takt für Bewegungen ist deshalb nicht nötig.** Das spart viel Rechenzeit, und Ankünfte passieren trotzdem genau im richtigen Takt.

## 6. Befehle und Ereignisse

**Befehle (Spieler → Simulation):** Jede Spieler-Aktion wird ein kleines Datenpaket, z. B. `{ type: "placeBuilding", building: "woodcutter", x: 10, y: 4 }`.
- Die Simulation prüft und führt ihn **sofort** aus, auch in der Pause (man soll in Ruhe planen können).
- Antwort: „erledigt“ oder ein deutscher Grund, z. B. „Nicht genug Holz“.
- Vorteile: Jede Aktion ist automatisch testbar. Später lässt sich daraus „Rückgängig“ bauen.

**Ereignisse (Simulation → Darstellung und Oberfläche):** Die Simulation macht Durchsagen über den Ereignis-Bus, z. B. „Takt 1240 fertig“, „Lager: Holz jetzt 2480“, „Gebäude 17 gebaut“.
- Wer sich für eine Durchsage interessiert, meldet sich dafür an („Beobachter-Prinzip“).
- Durchsagen werden gesammelt und erst **nach** einem Takt oder Befehl verteilt. So sieht jeder Zuhörer einen fertigen, stimmigen Spielzustand.
- Typisiert: TypeScript kennt jede Durchsage und ihren Inhalt; ein Tippfehler im Namen fällt sofort auf.
- Durchsagen sind nur Hinweise. Die Wahrheit steht immer im Spielzustand.

## 7. Spieldaten in Datendateien

Waren, Gebäude, Produktionsketten, Bevölkerungsstufen usw. stehen in **JSON-Dateien** in `src/data/`, nicht im Code:

| Datei | Inhalt |
| --- | --- |
| `goods.json` | Waren (bisher: Holz) |
| `buildings.json` | Gebäudearten mit Größe in Kacheln, erlaubtem Untergrund und (vorläufig) Produktion |
| `terrain.json` | Geländearten (tiefes Wasser, Flachwasser, Strand, Ebene, Berg) mit Greybox-Farbe; die fünf sind Pflicht, weil Weltgenerator und Bauregeln sie kennen |
| `resources.json` | Rohstoffvorkommen in den Bergen (Eisenerz, Marmor, Gold, Edelsteine) |
| `fertilities.json` | Fruchtbarkeiten der Inseln (Kakao, Tabak, Zuckerrohr, Gewürze, Baumwolle, Weinreben) |
| `worldgen.json` | Regeln des Weltgenerators: Kartengröße, Inselklassen, Küsten, Berge, Häufigkeit der Rohstoffe, Fruchtbarkeiten pro Insel, Wälder (Abschnitt 4.2) |

Englische Namen als feste Kennung, deutsche Texte für die Anzeige:

```json
[{ "id": "wood", "name": "Holz" }]
```

**Prüfschema:** Für jede Datei gibt es ein Schema, eine Art Formular-Vorlage: Welche Felder gibt es, welche Art von Wert, welche Grenzen?
Beim Laden wird jede Datei damit kontrolliert, danach die Querverweise (Gibt es die Ware, die ein Gebäude herstellt? Gibt es die Geländeart, auf der es stehen darf? Ist jede Kennung nur einmal vergeben? Sind alle Pflicht-Geländearten da?).
Fehler kommen als klare deutsche Meldung, z. B.:

> buildings.json → Eintrag 1 („test_woodcutter“) → Feld „produces“ → Feld „good“: Die Ware „holz“ gibt es nicht. Bekannte Waren: wood.

Geprüft wird **zweimal:** in den automatischen Tests (fehlerhafte Daten werden gar nicht erst veröffentlicht) und beim Spielstart (Sicherheitsnetz, später auch für geladene Spielstände).
Die Dateien werden beim Bauen ins Spiel gepackt; es gibt keine zusätzlichen Downloads.

**Werkzeug: zod** (Version 4, schlanke Variante „zod/mini“), siehe Abschnitt 12.

## 8. Zufall mit Seed

Ein Computer kann nicht wirklich würfeln. Ein Zufallsgenerator erzeugt aus einer Startnummer (dem **Seed**) eine Zahlenfolge, die zufällig aussieht.
Gleicher Seed → gleiche Folge → gleiche Inselwelt. So kann man eine schöne Karte per Nummer wiederholen oder weitergeben.

- Verfahren: „sfc32“, schnell und gut erprobt. Der Seed darf eine Zahl oder ein Wort sein („Barock“ wird in eine Zahl umgerechnet).
- **Getrennte Zufalls-Ströme** für Kartengenerator und Ereignisse. Kommt später ein neues Ereignis dazu, ändert sich die Karte zum selben Seed trotzdem nicht.
- Der Zustand der Generatoren steht im Spielstand. Nach dem Laden geht es exakt so weiter wie vorher.
- In der Simulation ist `Math.random()` verboten (ESLint), damit niemand versehentlich „echten“ Zufall nutzt.

## 9. Leistung (für das Budget-Tablet)

Grundlage sind die Zahlen in [LEISTUNGSBUDGET.md](LEISTUNGSBUDGET.md).

- **Viele gleiche Objekte → Thin Instances** (ein Zeichenauftrag pro Modell-Art), ab ca. 20 Stück: Bäume, Häuser, Felder, Zäune.
- **Wiederverwenden statt neu erzeugen („Pooling“):** Karren, Figuren, Schiffe und Effekte kommen aus einem Vorrat und gehen danach zurück. Wie Leihfahrräder: Ständiges Neukaufen und Wegwerfen kostet Zeit und führt zu kleinen Rucklern beim „Aufräumen“ des Arbeitsspeichers.
- **Unbewegliches einfrieren:** Gebäude und Gelände werden als „unbeweglich“ markiert; Babylon.js spart sich dann Rechenarbeit.
- **Bildraten-Begrenzer:** höchstens 60 Bilder pro Sekunde (E-015). Zum Vergleich am Tablet lässt sich per Link-Zusatz `?fps=45` ein anderer Wert testen.
- **Ruhebild (Akku schonen):** Bewegt sich 2 Sekunden lang nichts im Bild (kein Finger, Kamera steht, keine Animation), wird nur noch gezeichnet, wenn sich etwas ändert, plus ein Kontrollbild pro Sekunde. Die Spiel-Schleife schlägt dann nur 10-mal pro Sekunde statt bei jeder Bildschirm-Auffrischung; die Simulation rechnet trotzdem im richtigen Tempo. Sobald ein Finger den Bildschirm berührt oder sich etwas bewegt, sofort wieder bis zu 60 Bilder pro Sekunde.
  **Regel für später:** Alles, was sich bewegt (Animationen, Karren, Wasser), muss das dem Zeichen-Takt melden (`markActivity`), sonst wird es im Ruhebild nur einmal pro Sekunde gezeichnet. Einmalige sichtbare Änderungen melden sich mit `requestRender`.
  Mit viel „Gewusel“ (ab Phase 3) bewegt sich fast immer etwas. Ob es dann zusätzlich einen Akku-Modus nach längerer Untätigkeit gibt, entscheiden wir in Phase 9/10.
- **Simulation im Haupt-Programm:** Bei 2–8 Takten pro Sekunde ist sie sehr sparsam. Weil sie nichts von der Grafik weiß, könnte sie später in einen eigenen Rechenstrang („Web Worker“) umziehen, falls große Städte das nötig machen (Phase 10).

## 10. Bedienoberfläche: HTML/CSS über der 3D-Szene

Entschieden (E-017). Umgesetzt wird die Oberfläche erst in Phase 3.

| | **HTML/CSS über der Szene** (gewählt) | **Babylon GUI** (in der 3D-Szene gezeichnet) |
| --- | --- | --- |
| Schrift | gestochen scharf in jeder Größe | wird als Bild gezeichnet, kann leicht unscharf wirken |
| Gestaltung | mit CSS sehr flexibel, barocke Rahmen, Schriften, Schatten | aufwendiger, weniger Möglichkeiten |
| Leistung | belastet die 3D-Zeichnung nicht | jedes Element kostet Zeichenzeit |
| Download | kostet nichts extra | ca. 100 kB zusätzlich |
| Beschriftungen an 3D-Objekten (z. B. Sprechblasen) | Position muss umgerechnet werden (kleiner Zusatz-Code) | eingebaut |
| Touch | der Browser regelt alles, auch Scrollen in Listen | muss Babylon.js übernehmen |

Ein Hilfs-Baukasten für die Oberfläche (z. B. Preact oder Lit) wird erst in Phase 3 gewählt.

## 11. Ablauf eines Bildes

1. Ein Finger tippt → `input/` übersetzt das in einen Befehl → die Simulation führt ihn sofort aus.
2. Die Uhr misst die vergangene Zeit × Tempo und sagt: 0, 1 oder 2 Wirtschafts-Takte fällig.
3. Für jeden fälligen Takt rechnet die Simulation einmal durch.
4. Die gesammelten Durchsagen werden verteilt; Darstellung und Oberfläche passen sich an.
5. Der Bildraten-Begrenzer entscheidet: Ist ein neues Bild dran? Wenn ja, zeichnet die Darstellung es, Bewegungen weich zwischen zwei Takten.

## 12. Werkzeug für die Prüfschemas: zod

- **Gewählt (E-016):** zod 4.6.7, schlanke Variante `zod/mini`, ca. 6 kB komprimiert.
- **Vorteile:** sehr verbreitet und gut gepflegt; eingebaute deutsche Fehlermeldungen; das Schema liefert gleichzeitig die TypeScript-Typen (eine Quelle statt zwei).
- **Nachteile:** Die schlanke Variante schreibt sich etwas umständlicher als die volle (27 kB). Die eingebauten Meldungen sind teils holprig („erwartet string“); wir übersetzen die häufigsten selbst in Alltagssprache.
- **Alternativen:** valibot (ähnlich klein, weniger verbreitet) · ajv mit JSON-Schema (Industriestandard, aber größer und mit englischen Meldungen).

## 13. Automatische Tests

| Was | Wie |
| --- | --- |
| Uhr | 10 Takte bei 1× dauern 5 s; Pause erzeugt keine Takte; 4× ist 4-mal so schnell; keine Aufhol-Lawine nach langer Pause |
| Ereignis-Bus | Durchsagen kommen beim richtigen Zuhörer an, erst nach dem Verteilen, Abmelden funktioniert |
| Zufall | gleicher Seed → gleiche Zahlen; getrennte Ströme beeinflussen sich nicht; Speichern und Fortsetzen ergibt dieselbe Folge |
| Spielzustand | Speichern als Text und Zurücklesen ergibt exakt denselben Zustand, auch mit Kachel-Raster; beschädigte Ebenen, zu große Karten und zu viele Inseln werden erkannt |
| Kachel-Raster | jede Kachel an genau einer Stelle; leere Welt richtig gefüllt; Kacheln außerhalb der Karte erkannt; schreibgeschützt für die Darstellung (TypeScript-Prüfung) |
| Umrechnung Kachel ↔ 3D | Mittelpunkt, Ecke, Kachel unter einem Punkt, hin und zurück; Höhe in Meter und zurück |
| Grundfläche | Drehung in 90°-Schritten, Breite/Tiefe tauschen, belegte Kacheln, Gebäude mittig unter dem Finger |
| Lauflängen-Kodierung | hin und zurück gleich; kaputte Daten mit deutscher Meldung |
| Spieldaten | die echten Dateien sind gültig; absichtlich fehlerhafte Beispiel-Dateien (Waren, Gebäude, Gelände) liefern die erwartete deutsche Meldung; Pflicht-Geländearten, unbekannter Untergrund, Farben, höchstens 256 Geländearten |
| Weltgenerator | gleicher Seed → gleiche Welt, anderer Seed → andere Welt; nur der Strom „world“ wird benutzt; für 12 Seeds alle Regeln (6–8 Inseln, Abstand zum Rand und zwischen Inseln, Küste immer Strand, Ebenen flach, Wasser unter und Land über dem Meeresspiegel, Bäume nur auf Ebenen, genug Baufläche, Fruchtbarkeiten und Vorkommen richtig verteilt); Spielstand hin und zurück; Laufzeit unter 1 s |
| Rauschen und Abstände | Werte im erlaubten Bereich, gleich für gleiche Eingabe, glatt; Abstände gerade/schräg richtig |
| Startplatz | freie, flache Fläche ohne Bäume auf der größten Insel |
| Regeln in worldgen.json | absichtlich fehlerhafte Datei liefert deutsche Meldungen; unbekannte oder fehlende Rohstoffe; keine Insel darf alle Fruchtbarkeiten bekommen können; Inseln müssen auf die Karte passen |
| Simulation | gleicher Seed + gleiche Befehle → gleiches Ergebnis; Gebäude per Befehl; Produktion pro Takt stimmt |
| Durchstich | echte Datendateien + Uhr + Simulation: 10 Takte = 10 Holz; Pause erzeugt nichts; 2× und 4× doppelt bzw. viermal so viel |
| Bildraten-Begrenzer | bei 90 Hz entstehen im Schnitt 60 Bilder pro Sekunde; Ruhebild greift und endet richtig |
| Schichten-Regeln | ESLint (Abschnitt 3) |

Darstellung und Oberfläche prüft Claude mit dem Bildschirmfoto-Skript im unsichtbaren Chrome (u. a. Holz = Takte, Pause, 4×, Debug-Anzeige ein- und ausklappen, Inselwelt mit Überblick und Einblendungen, Seed laden, „Neue Welt“, Download-Größe beim Start); das Gefühl am Tablet prüft der Nutzer.
Alle Tests laufen vor jeder Veröffentlichung. Schlägt einer fehl, bleibt die alte Version online.

## 14. Wo steht was im Code

| Datei | Inhalt |
| --- | --- |
| `core/clock.ts` | die Uhr: Wirtschafts-Takt, Tempo, Schutz vor der Aufhol-Lawine |
| `core/eventBus.ts` | der Ereignis-Bus |
| `core/random.ts` | Zufall mit Seed (sfc32), Seed aus Zahl oder Wort |
| `core/runLength.ts` | Lauflängen-Kodierung für den Spielstand |
| `data/validation.ts` | Prüfen mit zod, deutsche Fehlermeldungen |
| `data/schemas.ts` | die Prüfschemas der Datendateien |
| `data/gameData.ts` | der Daten-Lader |
| `data/*.json` | die Spieldaten (Abschnitt 7); `testdata/` enthält absichtlich fehlerhafte Beispiele für die Tests |
| `data/bundledData.ts` | bindet die JSON-Dateien ins Spiel ein |
| `data/testFixtures.ts` | Hilfen für Tests (nur die Daten angeben, um die es geht); landet nicht im Spiel |
| `sim/state.ts` | der Spielzustand und seine Versionsnummer |
| `sim/world.ts` | das Kachel-Raster der Welt und die Inseln (Abschnitt 4.1) |
| `sim/worldSpace.ts` | Umrechnung Kachel ↔ 3D-Position und Höhe in Meter (die einzige Stelle dafür) |
| `sim/footprint.ts` | Grundfläche und Drehung von Gebäuden |
| `sim/readonly.ts` | schreibgeschützte Sicht für Darstellung und Oberfläche |
| `sim/save.ts` | das Spielstand-Format |
| `sim/newGame.ts` | neue Partie: Spielzustand anlegen und Welt erzeugen |
| `sim/worldgen/` | der Weltgenerator (Abschnitt 4.2) mit seinen Schritten und Tests |
| `sim/islandStats.ts` | Größe und Mitte jeder Insel |
| `sim/startArea.ts` | Startplatz auf der größten Insel (vorläufig für den Test-Holzfäller) |
| `sim/commands.ts` | die Befehle |
| `sim/events.ts` | die Liste aller Durchsagen |
| `sim/simulation.ts` | der Spielleiter: `step()` und `execute()` |
| `sim/systems.ts` | Liste aller Systeme in fester Reihenfolge |
| `sim/production.ts` | System „Produktion“ (vorläufig: feste Menge pro Takt) |
| `render/frameScheduler.ts` | der Zeichen-Takt: Bildraten-Begrenzer und Ruhebild |
| `render/activity.ts` | meldet Kamera-Bewegungen an den Zeichen-Takt |
| `render/worldScene.ts` | baut die 3D-Szene der Inselwelt (Himmel, Licht, Meer, Inseln, Wälder, Kamera) |
| `render/terrainView.ts` | Gelände: ein Netz pro Insel |
| `render/seaView.ts` | Meeresboden und durchscheinendes Wasser |
| `render/treeView.ts` | Bäume als Thin Instances |
| `render/previewCamera.ts` | vorläufige Kamera bis Unterphase 2.4 |
| `render/gridOverlay.ts`, `render/depositMarkers.ts` | Einblendungen Raster und Rohstoffe (Debug-Anzeige) |
| `render/colors.ts` | Farben aus den Datendateien, Mischen, kleine Abweichungen für die Optik |
| `render/buildingView.ts` | zeigt Gebäude als Platzhalter-Blöcke in der Größe ihrer Grundfläche |
| `render/renderStats.ts` | misst Dreiecke und Draw Calls |
| `debug/debugPanel.ts` | die Debug-Anzeige oben links, mit Welt-Werkzeugen |
| `debug/islandLabels.ts` | Insel-Schilder mit Größe, Fruchtbarkeiten und Rohstoffen (Debug-Anzeige) |
| `app/gameLoop.ts` | die Spiel-Schleife |
| `app/startGame.ts` | die Regie: baut alles auf und verbindet es |
| `app/urlOptions.ts` | Link-Zusätze wie `?seed=42` |

## 15. Was wann gebaut wird

- **Unterphase 1.6 (erledigt):** Uhr mit Tempo, Ereignis-Bus, Zufallsgenerator, Spielzustand mit Versionsnummer, Spielstand-Format, Befehls-Grundgerüst, Daten-Lader mit Prüfschema, Bildraten-Begrenzer und Ruhebild, Schichten-Regeln in ESLint – alles mit Tests.
- **Unterphase 1.7 (erledigt):** Test-Ware „Holz“ als echte Datendatei, Gebäudearten mit Querverweis-Prüfung, Test-Holzfäller per Befehl, System „Produktion“, Test-Lager, Debug-Anzeige.
- **Unterphase 2.2 (erledigt):** Kachel-Raster im Spielzustand (Abschnitt 4.1), Datendateien für Gelände, Rohstoffe und Fruchtbarkeiten, Gebäudegröße und Untergrund, Umrechnung Kachel ↔ 3D, Grundfläche und Drehung, Lauflängen-Kodierung im Spielstand.
- **Unterphase 2.3 (gebaut, Tablet-Test steht aus):** Weltgenerator mit Regeln in worldgen.json, Greybox-Darstellung von Inseln, Meer und Wäldern, Debug-Werkzeuge (Seed, Raster, Rohstoffe, Inseln).
- **Phase 2, weiter:** Spiel-Kamera (2.4), Bausystem mit Platzierungsregeln (2.5), Straßen und Pipette (2.6).
- **Später:** Speichern/Laden im Browser-Speicher (Phase 3), Rückgängig (bei Bedarf), Oberflächen-Baukasten (Phase 3).
