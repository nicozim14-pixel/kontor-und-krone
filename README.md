# Kontor & Krone

Ein barockes Insel-Aufbauspiel im Browser, inspiriert von Anno 1701:
Wirtschaft, Schönbauen und Handel, ganz ohne Militär, als Endlosspiel.

- **Geräte:** Google Chrome im Querformat auf einem Android-Tablet (Touch) und einem älteren Windows-Laptop (Maus)
- **Technik:** Babylon.js (3D im Browser), TypeScript, Vite
- **Zweck:** privates Hobbyprojekt, keine Veröffentlichung in App-Stores

## Spiel-Link

Folgt in Unterphase 1.4, sobald die automatische Veröffentlichung eingerichtet ist.

## Aktueller Stand

Phase 1 von 10: Fundament & Setup.
Was erledigt ist und was als Nächstes kommt, steht in [docs/FORTSCHRITT.md](docs/FORTSCHRITT.md).

## Dokumente

| Datei | Inhalt |
| --- | --- |
| [docs/FORTSCHRITT.md](docs/FORTSCHRITT.md) | Wo wir stehen, nächster Schritt, offene Fragen |
| [docs/ENTSCHEIDUNGEN.md](docs/ENTSCHEIDUNGEN.md) | Alle Entscheidungen mit Vor- und Nachteilen |
| [docs/GLOSSAR.md](docs/GLOSSAR.md) | Fachbegriffe in Alltagssprache |
| [docs/IDEEN-SPAETER.md](docs/IDEEN-SPAETER.md) | Ideen für spätere Phasen |
| [docs/MASTERPLAN.md](docs/MASTERPLAN.md) | Die vollständige Spielidee |
| [docs/GESAMTPLAN.md](docs/GESAMTPLAN.md) | Grundsatzentscheidungen und die 10 Phasen |

## Für Entwickler

Voraussetzung: Node.js ab Version 22.12. Einmalig `npm install`, danach:

| Befehl | Was er tut |
| --- | --- |
| `npm run dev` | Startet eine Vorschau zum Entwickeln |
| `npm run build` | Prüft die Typen und baut das Spiel in den Ordner `dist/` |
| `npm run test` | Führt die automatischen Tests aus |
| `npm run lint` | Prüft Code-Qualität (ESLint) und Formatierung (Prettier) |
| `npm run check` | Alles zusammen: lint, test, build |
| `npm run format` | Formatiert den Code einheitlich |
| `npm run screenshot` | Bildschirmfotos im unsichtbaren Chrome (nach `build`; Chrome-Pfad über `CHROME_PATH`) |

Aufbau des Codes: siehe die READMEs in den Ordnern unter `src/`.

Der gesamte Code wird von Claude geschrieben.
