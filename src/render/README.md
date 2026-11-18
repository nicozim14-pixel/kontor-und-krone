# render – die Darstellung

Alles, was mit Babylon.js gezeichnet wird: Szene, Licht, Kamera, Meer, Insel, später Gebäude und Figuren.

- Liest den Spielzustand nur und reagiert auf Ereignisse. Spielregeln gehören nicht hierher, sondern nach `sim/`.
- Bereits hier:
  - `engine.ts` – erstellt die Babylon.js-Engine und regelt die Auflösung
  - `resolution.ts` – berechnet die Bildschärfe (Pixeldichte, Link-Zusatz `?aufloesung=50`)
  - `testScene.ts` – die leere Test-Szene aus Unterphase 1.3 (wird in Phase 2 ersetzt)
