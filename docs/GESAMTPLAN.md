> **Hinweis:** Kopie des Projekt-Dokuments „Grundlagen/Gesamtplan.txt“, Stand 18.11.2026.
> Für die Anzeige auf GitHub als Markdown formatiert. Am 18.11.2026 angepasst: reines Tablet-Spiel, der Laptop entfällt (E-012).

# GESAMTPLAN – Barockes Insel-Aufbauspiel im Browser

Stand: 18.11.2026 · Ergänzt den Masterplan (Projekt-Dokument „Grundlagen/Masterplan.md“)
Bei Widersprüchen gilt dieser Gesamtplan (er ersetzt die Unity-Vorgaben des Masterplans).

## 1. GRUNDSATZENTSCHEIDUNGEN

- Plattform: reines Tablet-Spiel. Browser (Google Chrome) im Querformat auf
  einem Android-Tablet (Budget-Modell, relativ neu), Bedienung per Touch.
  Das Tablet legt die Leistungsgrenzen fest. (Der ursprünglich zusätzlich
  geplante alte Windows-Laptop entfällt seit 18.11.2026, siehe E-012.)
- Technik: Babylon.js (3D-Engine für den Browser) + TypeScript + Vite.
  Ersetzt Unity/C# aus dem Masterplan.
- Arbeitsweise: Claude schreibt den gesamten Code in der Cloud und speichert
  ihn auf GitHub. Jede Änderung wird automatisch veröffentlicht; getestet
  wird per Link. Auf den eigenen Geräten wird nichts installiert.
- 3D-Grafik: kostenlose, frei nutzbare (CC0) Asset-Pakete, z. B. KayKit,
  Quaternius, Kenney. Bis Phase 8 einfache Platzhalter-Formen (Greybox).
- Zweck: privater Eigengebrauch, keine Veröffentlichung in App-Stores.
- Vorerfahrung des Nutzers: keine. Alles wird einfach erklärt, Rückfragen
  kommen als anklickbare Auswahl, Entscheidungen immer mit Vor-/Nachteilen.

## 2. ÜBERSETZUNG DER MASTERPLAN-BEGRIFFE

| Masterplan | Browser-Umsetzung |
| --- | --- |
| Unity URP / C# | Babylon.js / TypeScript |
| ScriptableObjects | JSON-Datendateien mit Prüfschema |
| Unity New Input System | Babylon.js-Zeigerereignisse (Touch) |
| GPU Instancing | Thin Instances |
| Object Pooling | bleibt gleich |
| Spielstände JSON/Binary | Browser-Speicher (IndexedDB) + Export/Import als Datei |
| 60 FPS | höchstens 60 FPS, nie unter 30 (festgelegt in Phase 1, siehe LEISTUNGSBUDGET.md) |
| Simulations-Takt 0,5 s | bleibt gleich |
| iPadOS / Android-App | Webseite in Chrome, später als App-Symbol installierbar (PWA) |

## 3. DIE 10 PHASEN

**Phase 1 – Fundament & Setup**
GitHub & automatische Veröffentlichung, Projektgerüst, Geräte-Check &
Leistungsbudget, Kern-Architektur, Durchstich mit einer Test-Ware.
*Masterplan: Phase 0*

**Phase 2 – Greybox-Prototyp: Welt, Kamera & Bauen**
Insel- und Weltgenerator per Seed (inkl. Fruchtbarkeiten, Berge,
Rohstoffvorkommen), Touch-Kamera (Verschieben, Zoomen, Drehen, Ausnorden),
Raster, Bausystem, Straßen-Ziehwerkzeug, Pipette, Abriss.
Kernfrage: Fühlt sich das Bauen auf dem Tablet gut an?
*Masterplan: Phase 1 (ohne Nebel des Krieges → Phase 4)*

**Phase 3 – Vertical Slice: Kern-Wirtschaft**
Kontor & Markthäuser mit gemeinsamem Lager, Marktkarren mit Wegfindung,
erste Produktionsketten, Pioniere & Siedler mit Aufstieg und
Baumaterial-Sperre, Stadt- und Handelsbilanz, UI-Grundgerüst
(Infoleiste, Baumenü, Radialmenü), einfaches Speichern/Laden.
*Masterplan: Phase 2 + Teile von 8.1 und 8.3*

**Phase 4 – Schifffahrt & Expansion**
Werften, Schiffsklassen, Touch-Steuerung auf dem Wasser, Nebel des
Krieges, Minimap, Besiedlung weiterer Inseln, Handelsrouten-Planer.
*Masterplan: Phase 3 + Nebel aus 1.2*

**Phase 5 – Lategame-Tiefe**
Stufen 3–5 (Bürger, Kaufleute, Aristokraten), Luxusketten, Bergbau,
Kolonialwaren, Bildung & Forschungsbaum, Schönbau, Ehrengäste.
*Masterplan: Phase 4*

**Phase 6 – Lebendige Welt**
KI-Gegner mit Persönlichkeit, freie Händler, fremde Völker &
Spezialaktionen, Loge der Wissenschaften, Ereignisse & Naturgewalten.
*Masterplan: Phase 5*

**Phase 7 – Finale & Endlosspiel**
Modularer Schlossbau, Weg zur Unabhängigkeit, Endlosspiel-Konfigurator,
Siegbedingungen, Spielstand-Slots & Autosave.
*Masterplan: Phase 7 + 8.2 + 8.3*

**Phase 8 – Grafik, Wuselfaktor & Klang**
Asset-Pakete einbinden und barock einfärben, Wasser & Licht, Animationen
der Mikrowelt, Musik, Geräusche, Erzählerstimme.
*Masterplan: Phase 6*

**Phase 9 – Feature-Freeze & Feinschliff**
Keine neuen Funktionen mehr. Barockes Interface, kontextsensitive
Direkthilfe, „Juice“ (Rückmeldungen, Übergänge), Balancing,
Fehlerbehebung, Aufräumen des Codes.
*Masterplan: 8.1 + Feinschliff*

**Phase 10 – Optimierung & Abschluss**
Messen und Optimieren auf dem Tablet, Ladezeiten, Offline-Fähigkeit
und App-Symbol (PWA), finale Version.
*Masterplan: 8.3 + Release*

## 4. DURCHGEHENDE REGELN

- Jede Phase hat einen eigenen Prompt (Projekt-Dokument „Phasen/Phase_XX_….txt“).
  Er wird in einen neuen Chat in diesem Claude-Projekt eingefügt.
- Größere Phasen brauchen mehrere Chats: einfach denselben Prompt erneut
  einfügen. Der Fortschritt steht in docs/FORTSCHRITT.md im Repository.
- Am Ende jeder Phase: Leistungs-Check auf dem Tablet,
  Abnahme-Checkliste, Git-Tag (z. B. „phase-1“).
- Alle Entscheidungen werden mit Vor- und Nachteilen in
  docs/ENTSCHEIDUNGEN.md festgehalten.

## 5. OFFENE ENTSCHEIDUNGEN FÜR SPÄTER

- Spielstände außerhalb des Tablets sichern, z. B. für ein neues Tablet
  (Datei-Export/Import oder Online-Speicher) → Phase 3 bzw. 7
- Herkunft der Musik (z. B. gemeinfreie Barock-Aufnahmen) und der
  Erzählerstimme → Phase 8
- Wie viel Barock-Umbau die Gratis-Assets brauchen → Phase 8
