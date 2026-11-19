# sim – die Spiellogik (Simulation)

Hier wird das Spiel „gerechnet“: Waren, Gebäude, Produktion, Bevölkerung, Handel. Im Brettspiel-Vergleich der Spielleiter mit dem Spielbrett.

- `state.ts` – der Spielzustand: ein Datenpaket aus einfachen Daten, mit Versionsnummer
- `world.ts` – das Kachel-Raster der Welt (Gelände, Höhe, Insel, Baum, Belegung je Kachel) und die Inseln
- `worldSpace.ts` – Umrechnung Kachel ↔ Position in der 3D-Welt und Höhe in Meter (die einzige Stelle dafür)
- `footprint.ts` – Grundfläche und Drehung von Gebäuden
- `worldgen/` – der Weltgenerator: macht aus dem Seed die Inselwelt (Inseln, Küsten, Strände, Berge, Rohstoffe, Fruchtbarkeiten, Wälder), Regeln aus `data/worldgen.json`
- `newGame.ts` – neue Partie: Spielzustand anlegen und Welt erzeugen
- `islandStats.ts` – Größe und Mitte jeder Insel
- `startArea.ts` – Startplatz auf der größten Insel (vorläufig für den Test-Holzfäller)
- `save.ts` – das Spielstand-Format: Text hin und zurück, Prüfung, Umwandlung alter Versionen
- `simulation.ts` – der Spielleiter: `step()` rechnet einen Takt, `execute()` führt einen Befehl aus
- `systems.ts` – Liste aller Systeme (Teile der Spiellogik), die pro Takt in fester Reihenfolge laufen
- `production.ts` – System „Produktion“: Gebäude legen pro Takt ihre Ware ins Test-Lager (vorläufig, echte Ketten in Phase 3)
- `commands.ts` – die Befehle (Spieler-Aktionen); bisher die Test-Befehle `debugAddGoods` und `debugPlaceBuilding`
- `events.ts` – die Liste aller Durchsagen der Simulation
- `readonly.ts` – schreibgeschützte Sicht für Darstellung und Oberfläche

**Wichtigste Regel (ESLint prüft sie):** Die Simulation weiß nichts von der Grafik. Kein Babylon.js, keine Browser-Zugriffe, kein `Math.random()` (nur Zufall mit Seed aus `core/random.ts`), keine Uhrzeit (Spielzeit kommt aus dem Takt).
So bleibt sie schnell, leicht zu testen und rechnet auf jedem Gerät gleich.
