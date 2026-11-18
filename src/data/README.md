# data – die Spieldaten

Waren, Gebäude, Produktionsketten, Bevölkerungsstufen usw. stehen als JSON-Dateien hier, nicht im Code („datengetrieben“, entspricht den ScriptableObjects aus dem Unity-Masterplan).

- `goods.json` – die Waren (bisher nur die Test-Ware „Holz“)
- `buildings.json` – die Gebäudearten (bisher nur der Test-Holzfäller: 1 Holz pro Takt)
- `schemas.ts` – die Prüfschemas: welche Felder es gibt und was darin stehen darf
- `validation.ts` – prüft mit zod und übersetzt Fehler in verständliches Deutsch
- `gameData.ts` – der Daten-Lader: prüft alle Dateien, sucht doppelte Kennungen, prüft Querverweise (z. B. ob die Ware eines Gebäudes existiert), baut Nachschlage-Tabellen
- `bundledData.ts` – bindet die JSON-Dateien ins Spiel ein
- `testdata/` – absichtlich fehlerhafte Dateien für die automatischen Tests

**Neue Datendatei:** Schema in `schemas.ts`, Prüfung in `gameData.ts`, Einbinden in `bundledData.ts`, Test ergänzen.
Kennungen (`id`) auf Englisch in Kleinbuchstaben mit Unterstrichen (z. B. `test_woodcutter`), Anzeigenamen auf Deutsch.

**Regeln (ESLint prüft sie):** benutzt nur `core/`, kein Babylon.js, keine Browser-Zugriffe.
