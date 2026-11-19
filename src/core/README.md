# core – das Fundament

Grundbausteine, die alle anderen Teile brauchen. Im Brettspiel-Vergleich (docs/ARCHITEKTUR.md): Rundenglocke, Lautsprecher und Würfel.

- `clock.ts` – die Uhr: Wirtschafts-Takt alle 0,5 s, Tempo Pause/1×/2×/4×, Schutz vor der „Aufhol-Lawine“
- `eventBus.ts` – der Ereignis-Bus (das „Lautsprecher-System“): Durchsagen sammeln und verteilen
- `random.ts` – Zufall mit Seed (gleiche Startnummer, gleiche Würfe), getrennte Zufalls-Ströme
- `buildInfo.ts` – Versionsangaben für die Versionsanzeige
- `runLength.ts` – Lauflängen-Kodierung: lange Zahlenlisten mit Wiederholungen kurz aufschreiben (für den Spielstand)

**Regeln (ESLint prüft sie):** benutzt keine andere Schicht, kein Babylon.js, keine Browser-Zugriffe, kein `Math.random()`, keine Uhrzeit.
