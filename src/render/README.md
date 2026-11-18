# render – die Darstellung

Alles, was mit Babylon.js gezeichnet wird: Szene, Licht, Kamera, Meer, Insel, später Gebäude und Figuren. Im Brettspiel-Vergleich die Fernsehkamera.

- Liest den Spielzustand nur und reagiert auf Durchsagen. Spielregeln gehören nicht hierher, sondern nach `sim/`.
- `engine.ts` – erstellt die Babylon.js-Engine und regelt die Auflösung
- `resolution.ts` – berechnet die Bildschärfe (Pixeldichte, Link-Zusatz `?aufloesung=50`)
- `frameScheduler.ts` – der Zeichen-Takt: höchstens 60 Bilder pro Sekunde (Link-Zusatz `?fps=45` zum Vergleich), Ruhebild zum Akku-Sparen
- `activity.ts` – meldet Kamera-Bewegungen an den Zeichen-Takt
- `testScene.ts` – die leere Test-Szene aus Unterphase 1.3 (wird in Phase 2 ersetzt)

**Regel für alles, was sich bewegt:** Bewegung dem Zeichen-Takt melden (`markActivity`), einmalige sichtbare Änderungen mit `requestRender`. Sonst wird im Ruhebild nur einmal pro Sekunde gezeichnet.
