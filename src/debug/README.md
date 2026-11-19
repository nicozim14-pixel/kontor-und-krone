# debug – Hilfen zum Prüfen und Fehlersuchen

Werkzeuge nur für die Entwicklung.

- `check/` – die Testseite `check.html` aus Unterphase 1.5: liest Geräte-Angaben aus (Browser, WebGL, Grafikchip, Bildschirm …) und führt einen Belastungstest mit Thin Instances durch. Ergebnis als kopierbarer Text für Claude. Mit dem Link-Zusatz `?schnell` laufen die Stufen nur kurz (für Claudes automatische Prüfung).
- `debugPanel.ts` (+ `debugPanel.css`) – die ein- und ausklappbare Debug-Anzeige oben links: FPS, Takt-Nummer mit Spielzeit, Lagerbestände, Dreiecke, Draw Calls, Seed, Knöpfe für die Spielgeschwindigkeit und Welt-Werkzeuge (Seed laden, „Neue Welt“, Einblendungen Raster/Rohstoffe/Inseln)
- `islandLabels.ts` – Schilder über den Inseln mit Größe, Fruchtbarkeiten und Rohstoffen
- `fpsMeter.ts` – misst die Bildrate über die letzte Sekunde
- `format.ts` – deutsche Schreibweise für Zahlen und Spielzeit
