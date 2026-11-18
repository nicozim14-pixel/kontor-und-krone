# app – die Regie

Baut beim Start alle Teile auf und verbindet sie. Nur hier (und in `debug/`) dürfen alle Schichten zusammenkommen.

- `startGame.ts` – der Start: Spieldaten laden, Simulation, Darstellung, Test-Welt (ein Test-Holzfäller), Spiel-Schleife, Debug-Anzeige und Oberfläche verbinden
- `gameLoop.ts` – die Spiel-Schleife: Uhr → Wirtschafts-Takte → Zeichnen; im Ruhebild langsamer, im Hintergrund angehalten
- `urlOptions.ts` – Link-Zusätze zum Testen, z. B. `?seed=42`
- `updateCheck.ts` – erkennt, ob online eine neuere Version liegt
- Später (Phase 3): Speichern und Laden im Browser-Speicher
