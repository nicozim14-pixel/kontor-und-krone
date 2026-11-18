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

Bereits bekannte offene Entscheidungen für später stehen im [GESAMTPLAN.md](GESAMTPLAN.md), Abschnitt 5.
