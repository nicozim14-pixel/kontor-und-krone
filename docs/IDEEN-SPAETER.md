# Ideen für später

Ideen, die während der Arbeit auftauchen, aber nicht in die aktuelle Phase gehören.
Jede Idee bekommt ein Datum und, wenn klar, die passende Phase.

| Datum | Idee | Passende Phase |
| --- | --- | --- |
| 18.11.2026 | Auf TypeScript 7 umsteigen, sobald typescript-eslint es unterstützt (siehe E-005). | jederzeit |
| 18.11.2026 | Download-Größe senken: Babylon.js bietet seit Version 9 „pure“-Module, mit denen nur wirklich genutzte Teile geladen werden. Das Spiel lädt aktuell ca. 265 kB (komprimiert) für die leere Szene. | 1.5 (Budget) bzw. Phase 10 |
| 18.11.2026 | Fehler-Hinweis um einen Knopf „Fehlerbericht kopieren“ erweitern (mit Browser-Version und Versionsanzeige), damit Fehler leichter gemeldet werden können. | Phase 9 |
| 18.11.2026 | Das Tablet kann WebGPU (Nachfolger von WebGL). Babylon.js unterstützt es. Prüfen, ob das Spiel damit schneller läuft. | Phase 10 |
| 18.11.2026 | Automatisch eine Grafikstufe heruntergehen (oder die Auflösung senken), wenn die Bildrate längere Zeit unter 30 fällt. | Phase 9/10 |
| 18.11.2026 | Automatische Prüfung der Download-Größe beim Bauen (Abbruch, wenn der Programmcode über 1,5 MB komprimiert wächst). | Phase 8 |
| 18.11.2026 | Akku-Modus nach längerer Untätigkeit: Wenn viel „Gewusel“ läuft, greift das Ruhebild kaum. Nach z. B. 2 Minuten ohne Berührung die Bildrate auf 30 senken. | Phase 9/10 |
| 18.11.2026 | Simulation in einen eigenen Rechenstrang (Web Worker) verlegen, falls große Städte den Hauptstrang bremsen. Möglich, weil sie nichts von der Grafik weiß. | Phase 10 |
| 18.11.2026 | „Rückgängig“ für Bauaktionen: Befehle sind schon als Datenpakete aufgebaut, daraus lässt sich eine Rückgängig-Funktion ableiten. | Phase 3 bzw. 9 |
| 18.11.2026 | Einstellung „Automatische Pause beim Zurückkehren“ anbieten (derzeit läuft das Spiel sofort weiter, E-018). | Phase 9 |
| 19.11.2026 | Test-Befehle `debugAddGoods` und `debugPlaceBuilding` durch echte Befehle ersetzen (Bauen mit Raster-Position, Drehung und später Baukosten). Der Test-Holzfäller wird dann nicht mehr automatisch beim Start gebaut. | Phase 2 (Bauen) bzw. 3 (Kosten) |
| 19.11.2026 | Debug-Anzeige im fertigen Spiel ausblenden und nur noch über einen Link-Zusatz (z. B. `?debug`) oder das Optionsmenü einschalten. | Phase 3 bzw. 9 |
| 19.11.2026 | Spielstand-Prüfung ergänzen: Der Schlüssel in `buildings` muss zur Nummer des Gebäudes passen, und die Gebäudeart muss in `buildings.json` stehen. | Phase 3 (Speichern/Laden) |
| 19.11.2026 | Fehlermeldung verfeinern: Fehlt eine ganze Zahl, meldet die Prüfung „erwartet eine Zahl“ statt „erwartet eine ganze Zahl“. | Phase 9 |
| 19.11.2026 | Prüf-Skript misst die Download-Größe beim Start automatisch (Messweise aus LEISTUNGSBUDGET.md, Abschnitt 8). | Phase 2 oder 8 |
| 19.11.2026 | Spielstand mit „Legende“: Neben den Gelände-Nummern die Kennungen in ihrer Reihenfolge speichern (z. B. `["deep_water", "shallow_water", …]`) und beim Laden umrechnen. Dann darf `terrain.json` auch umsortiert werden. | Phase 3 (Speichern/Laden) |
| 19.11.2026 | Spielstand-Prüfung der Welt ergänzen: Inselnummern eindeutig und passend zur Ebene `island`, Fruchtbarkeiten und Rohstoffe aus den Datendateien, Vorkommen auf der Karte, Gebäudenummern in `occupancy` vorhanden. | Phase 3 (Speichern/Laden) |
| 19.11.2026 | Schatten für Bäume, Berge und Gebäude (eine Sonne, Schatten-Karte 1024, siehe LEISTUNGSBUDGET.md). In Phase 2 noch ohne Schatten; sie würden die Tiefe besser zeigen. | Phase 8 (oder früher, wenn das Bauen davon profitiert) |
| 19.11.2026 | Seen und Flüsse auf den Inseln (der Generator füllt Seen derzeit auf). | Phase 8 bzw. Endlosspiel-Konfigurator (Phase 7) |
| 19.11.2026 | Inseln mit Namen (z. B. barocke Namen aus einer Datendatei) statt „Insel 3“. | Phase 3 bzw. 4 |
| 19.11.2026 | Verschiedene Baumarten (Laub- und Nadelbäume, je nach Fruchtbarkeit oder Klima der Insel). | Phase 8 |
| 19.11.2026 | Insel-Schilder der Debug-Anzeige überlappen sich im weiten Überblick; die richtige Anzeige im Spiel braucht eine Lösung dafür. | Phase 3 (Oberfläche) |

Bereits bekannte offene Entscheidungen für später stehen im [GESAMTPLAN.md](GESAMTPLAN.md), Abschnitt 5.
