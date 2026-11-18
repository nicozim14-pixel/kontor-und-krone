# ui – die Bedienoberfläche

Knöpfe, Menüs, Anzeigen und Hinweise über der 3D-Szene, gebaut mit HTML/CSS (E-017).

- Bereits hier: Vollbild-Knopf (`fullscreenButton.ts`), Versionsanzeige (`versionBadge.ts`) und Update-Hinweis (`updateBanner.ts`).
- Die richtige Oberfläche (Infoleiste, Baumenü, Radialmenü) kommt in Phase 3. Ob ein Hilfs-Baukasten (z. B. Preact oder Lit) dazukommt, entscheiden wir dann.

**Regeln (ESLint prüft sie):** kein Babylon.js; liest den Spielzustand nur und schickt Spieler-Aktionen als Befehle an die Simulation.
