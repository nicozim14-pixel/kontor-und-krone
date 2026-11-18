# Leistungsbudget

Das Leistungsbudget legt fest, wie viel das Spiel dem Tablet höchstens zumuten darf, damit es flüssig bleibt.
Wie ein Haushaltsbudget: Jede neue Funktion „kostet“ etwas, und die Summe darf den Rahmen nicht sprengen.

- **Stand:** 18.11.2026 · Unterphase 1.5
- **Status:** ✅ vom Nutzer bestätigt am 18.11.2026 (E-014, E-015)
- **Grundlage:** Geräte-Check `check.html` auf dem Tablet in Google Chrome (Version 8ae23c2)

---

## 1. Das Gerät

| Angabe | Wert |
| --- | --- |
| Modell | Samsung SM-X210R (vermutlich Galaxy Tab A9+) |
| Betriebssystem | Android 16 |
| Browser | Google Chrome 157 → Build-Ziel Chrome 111 passt ✅ (E-013) |
| Grafikchip | Qualcomm Adreno 619 (Mittelklasse) |
| 3D-Technik | WebGL2 ✅, WebGPU ✅ |
| Prozessorkerne | 8 |
| Arbeitsspeicher | ca. 4 GB |
| Bildschirm | 1920 × 1200 Bildpunkte, Pixeldichte 1,5, ca. 90 Hz |
| Spielfläche im Vollbild | 1920 × 1200 Bildpunkte (ohne Vollbild nur 1920 × 939, weil die Adressleiste Platz braucht) |
| Ladezeit der Testseite | 0,9 s, 309 kB übertragen |

**Was das heißt:** Ein solides Mittelklasse-Tablet. Die Pixeldichte 1,5 liegt unter unserer Grenze von 2 (E-008), das Spiel nutzt also die volle Bildschirmschärfe.
Der Bildschirm zeigt bis zu 90 Bilder pro Sekunde, deshalb enden die Messwerte bei etwa 90 FPS.

## 2. Messergebnisse des Belastungstests

1 Objekt = einfacher Greybox-Baum mit 88 Dreiecken. Schatten-Karte 1024 × 1024. Je 4 Sekunden gemessen.

**Gestempelte Objekte (Thin Instances, so werden später Bäume und Häuser gezeichnet):**

| Objekte | Dreiecke | ohne Schatten, 100 % | mit Schatten, 100 % | ohne Schatten, 50 % | mit Schatten, 50 % |
| --- | --- | --- | --- | --- | --- |
| 500 | 44.000 | 90 ✅ | 90 ✅ | 90 ✅ | 90 ✅ |
| 2.000 | 176.000 | 90 ✅ | 90 ✅ | 90 ✅ | 90 ✅ |
| 10.000 | 880.000 | 64 ✅ | 49 ✅ | 90 ✅ | 73 ✅ |
| 30.000 | 2.640.000 | 34 ✅ | 24 ⚠️ | 48 ✅ | 31 ✅ |

**Einzeln gezeichnete Objekte (jedes ein eigener Draw Call):**

| Einzelobjekte | FPS |
| --- | --- |
| 100 | 89 ✅ |
| 300 | 90 ✅ |
| 1.000 | 90 ✅ |

Ein erster Testlauf im eingebauten Browser der Claude-App ergab fast dieselben Werte (z. B. 10.000 Bäume mit Schatten: 51 statt 49 FPS).

**Was das heißt:**
- Bis etwa 2.000 Objekte merkt das Tablet gar nichts. Erst ab rund 10.000 Objekten (knapp 1 Million Dreiecke) wird es langsamer.
- **Schatten kosten etwa ein Viertel der Leistung** (10.000 Bäume: 64 → 49 FPS).
- **Halbe Auflösung hilft deutlich** bei sehr vielen Objekten (30.000 Bäume: 34 → 48 FPS), sieht aber unschärfer aus.
- **Draw Calls sind kein Engpass:** 1.000 einzeln gezeichnete Bäume laufen noch mit vollen 90 FPS.

## 3. Warum wir nicht bis an die Grenze gehen

Die Testszene ist absichtlich einfach: eine Farbe, keine Bilder auf den Oberflächen (Texturen), kein Wasser-Effekt, keine Spiellogik.
Das echte Spiel braucht zusätzlich Rechenzeit für Gelände, Wasser, Texturen, laufende Figuren, Bedienoberfläche und die Wirtschafts-Simulation.
Außerdem wird ein Tablet bei langem Spielen warm und drosselt sich dann selbst. Der Test lief nur 1½ Minuten.
**Deshalb planen wir mit etwa 40 % Reserve.**

## 4. Das Budget

| Bereich | Richtwert (normal) | Obergrenze (nie überschreiten) | Erklärung |
| --- | --- | --- | --- |
| **Bildrate** | 60 FPS im normalen Spiel | nie unter 30 FPS, auch in der vollsten Szene | Ab 30 wirkt es flüssig. Siehe auch „Bildraten-Begrenzer“ unten. |
| **Dreiecke pro Bild** (sichtbar) | 750.000 | 1.000.000 | Gemessen: 880.000 mit Schatten ergab 49 FPS in der einfachen Testszene. Beispiel: 5.000 Bäume à 100 + 1.000 Häuser à 250 Dreiecke = 750.000. |
| **Gleiche Objekte** | alles, was öfter als ca. 20-mal vorkommt, als Thin Instances | – | Bäume, Häuser, Felder, Zäune: ein Zeichenauftrag pro Modell-Art statt pro Objekt. |
| **Draw Calls pro Bild** | 300 | 600 | Gemessen gehen 1.000 einfache. Echte Draw Calls sind teurer (Texturen, verschiedene Materialien), und der Prozessor braucht Zeit für die Simulation. |
| **Schatten** | eine Sonne, Schatten-Karte 1024 × 1024, weiche Kanten | Schatten-Karte höchstens 2048 × 2048 | Nur Gebäude, Bäume und Figuren werfen Schatten. In der Stufe „Niedrig“ aus. |
| **Auflösung** | 100 % (1920 × 1200) | mindestens 50 % | Pixeldichte-Grenze 2 bleibt (E-008). |
| **Ladezeit** | erster Start ≤ 5 s im WLAN, danach ≤ 2 s | 10 s | Heute: 0,9 s. |
| **Programmcode (Download)** | ≤ 1 MB komprimiert | 1,5 MB | Heute: ca. 0,3 MB. |
| **Gesamt-Download beim ersten Start** | ≤ 20 MB | 40 MB | Wird ab Phase 8 wichtig (3D-Modelle). Musik wird erst beim Spielen nachgeladen. |
| **Grafikspeicher für Texturen** | ≤ 256 MB | 384 MB | Das Tablet hat nur ca. 4 GB für alles. Prüfung ab Phase 8. |

Noch **nicht gemessen** und deshalb noch ohne Zahl: viele gleichzeitig laufende Figuren und Karren (Animation). Das messen wir in Phase 3 bzw. 8 nach.

## 5. Grafikqualitäts-Stufen

| Stufe | Auflösung | Schatten | Wofür |
| --- | --- | --- | --- |
| **Hoch** (Standard) | 100 % | an | normales Spielen |
| **Mittel** | 75 % | an | sehr große Städte, wenn es zu ruckeln beginnt |
| **Niedrig** | 50 % | aus | Notfall, Akku sparen |

Die Umschaltung im Spiel kommt mit dem Optionsmenü (spätestens Phase 9). Ob das Spiel bei Ruckeln selbst eine Stufe heruntergeht, entscheiden wir dann.

## 6. Bildraten-Begrenzer

Der Bildschirm kann 90 Bilder pro Sekunde. Mehr Bilder bedeuten etwas flüssigere Bewegungen, aber auch mehr Akkuverbrauch und Wärme.
**Entschieden (E-015): Das Spiel zeichnet höchstens 60 Bilder pro Sekunde.** Das schont Akku und hält das Tablet kühler.

Technischer Hinweis: Bei einem 90-Hz-Bildschirm passt 60 nicht glatt hinein (jedes dritte Bild des Bildschirms wird ausgelassen). Das kann minimal ungleichmäßig wirken. Claude prüft das bei der Umsetzung (Unterphase 1.6/1.7) mit dem Nutzer am Tablet. Wirkt es unruhig, wird eine Alternative (z. B. 45 FPS, das passt glatt in 90) zur Wahl gestellt.

Unabhängig davon: Im Leerlauf (nichts bewegt sich, kein Finger auf dem Bildschirm) wird die Bildrate stark gesenkt, um den Akku zu schonen. Das wird in Unterphase 1.6 geplant.

## 7. So prüfen wir das Budget künftig

1. **Debug-Anzeige im Spiel** (ab Unterphase 1.7): zeigt laufend FPS, Dreiecke und Draw Calls. Claude ergänzt dafür Dreiecke und Draw Calls zur geplanten Anzeige.
2. **Am Ende jeder Phase:** Der Nutzer öffnet die vollste Spielszene und den Geräte-Check `check.html` auf dem Tablet und schickt die Werte. Claude vergleicht sie mit diesem Budget.
3. **Download-Größe:** Claude kontrolliert sie bei jedem Bauen (Vite zeigt die Größen an).
4. **Dauertest gegen Wärme:** ab Phase 3 einmal 15 Minuten spielen und die Bildrate am Anfang und Ende vergleichen.
5. Wird eine Obergrenze überschritten, wird das sofort gemeldet und vor neuen Funktionen behoben.

Messungen lassen sich jederzeit wiederholen: https://nicozim14-pixel.github.io/kontor-und-krone/check.html
