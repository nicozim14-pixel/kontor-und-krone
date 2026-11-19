# render – die Darstellung

Alles, was mit Babylon.js gezeichnet wird: Szene, Licht, Kamera, Meer, Insel, später Gebäude und Figuren. Im Brettspiel-Vergleich die Fernsehkamera.

- Liest den Spielzustand nur und reagiert auf Durchsagen. Spielregeln gehören nicht hierher, sondern nach `sim/`.
- `engine.ts` – erstellt die Babylon.js-Engine und regelt die Auflösung
- `resolution.ts` – berechnet die Bildschärfe (Pixeldichte, Link-Zusatz `?aufloesung=50`)
- `frameScheduler.ts` – der Zeichen-Takt: höchstens 60 Bilder pro Sekunde (Link-Zusatz `?fps=45` zum Vergleich), Ruhebild zum Akku-Sparen
- `activity.ts` – meldet Kamera-Bewegungen an den Zeichen-Takt
- `worldScene.ts` – baut die Szene der Inselwelt: Himmel, Licht, Meer, Inseln, Wälder, Kamera (ersetzt die Test-Szene aus Phase 1)
- `terrainView.ts` – Gelände: ein Netz pro Insel, weiche Höhen und Farben
- `seaView.ts` – Meeresboden und durchscheinendes Wasser
- `treeView.ts` – Bäume als Thin Instances
- `previewCamera.ts` – vorläufige Kamera, bis die Spiel-Kamera in Unterphase 2.4 kommt
- `gridOverlay.ts`, `depositMarkers.ts` – Einblendungen „Raster“ und „Rohstoffe“ für die Debug-Anzeige
- `colors.ts` – Farben aus den Datendateien, Mischen, kleine Abweichungen für die Optik
- `buildingView.ts` – zeigt gebaute Gebäude als Platzhalter-Blöcke (bis 2.5 auf dem Startplatz der größten Insel)
- `renderStats.ts` – misst Dreiecke und Draw Calls für die Debug-Anzeige

**Regel für alles, was sich bewegt:** Bewegung dem Zeichen-Takt melden (`markActivity`), einmalige sichtbare Änderungen mit `requestRender`. Sonst wird im Ruhebild nur einmal pro Sekunde gezeichnet.
