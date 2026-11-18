> **Hinweis:** Kopie des Projekt-Dokuments „Grundlagen/Masterplan.md“, Stand 18.11.2026.
> Der Masterplan wurde ursprünglich für Unity geschrieben. Verbindlich ist die Browser-Umsetzung aus dem [GESAMTPLAN.md](GESAMTPLAN.md); bei Widersprüchen gilt der Gesamtplan.

# Gesamt-Masterplan: Barockes Insel-Aufbauspiel (Tablet / Unity 3D)

## Projekt-Rahmenbedingungen & Vision
* **Plattform & Engine:** Tablet (iPadOS / Android) im Querformat, entwickelt in **Unity (URP / C#)** als Solo-Projekt für den privaten Eigengebrauch.
* **Grafik & Atmosphäre:** Echtes, frei dreh- und zoombares 3D in warmer, farbenfroher Barock-Ästhetik mit maximalem „Wuselfaktor“ und opulentem Orchester-Soundtrack.
* **Spielmodus:** Hochgradig konfigurierbares **Endlosspiel als einziger Spielmodus** (kein Kampagnen-/Szenario-Overhead, Einstieg über kontextsensitive Direkthilfe).
* **Spielprinzip (Pazifistischer Fokus):** Kein klassisches Militär – stattdessen entspannter Wirtschafts-Flow, intuitives Schönbauen, charakterstarke KI-Persönlichkeiten, Handel mit fremden Kulturen, Naturkatastrophen und die schelmische **Loge der Wissenschaften** (Spionage/Sabotage) sowie das emotionale Endgame rund um **Schlossbau & Unabhängigkeit**.

---

## Überphase I: Das spielbare Kern-Fundament (Core-Gameplay & Flow)
**Makro-Ziel:** Ein technisch sauberer, voll spielbarer Greybox-Prototyp auf dem Tablet. Die wirtschaftlichen Uhrwerk-Mechaniken, der Siedlungsaufbau sowie die inselübergreifende Schifffahrt funktionieren reibungslos.

### Phase 0: Fundament, Architektur & KI-Workflow
* **0.1 Engine & Tablet-Setup:**
  * Unity-Projekt mit **URP (Universal Render Pipeline)** im Querformat (16:9 / 4:3) anlegen.
  * **Unity New Input System** mit Touch-Simulation für schnelles Testen am PC und direktes Bauen auf dem Tablet einrichten.
* **0.2 Datengetriebenes Design (ScriptableObjects):**
  * Trennung von Code und Spieldaten: Alle Waren, Gebäude, Produktionsketten, Zivilisationsstufen, Logen-Aktionen und Forschungen werden als modulare **ScriptableObjects** angelegt.
* **0.3 Entkoppelter Simulations-Tick:**
  * Trennung zwischen Grafik-Framerate (60 FPS) und Simulations-Logik (fester Wirtschafts-Tick alle 0,5 Sekunden) zur Akku- und Performance-Schonung.
* **Abnahmekriterium:** Eine leere 3D-Szene läuft stabil auf dem Tablet; eine Test-Ware wird über ein ScriptableObject definiert und im Tick-System verrechnet.

### Phase 1: Die 3D-Inselwelt, Raster & Touch-Kamera
* **1.1 Prozeduraler Insel- & Weltgenerator:**
  * Türkisblauer Ozean mit sanften Küstenlinien, Stränden, bebaubaren Ebenen und unpassierbaren Bergen (inkl. Rohstoffvorkommen wie Eisenerz, Marmor, Gold, Edelsteine).
  * Zuweisung von **Inselfruchtbarkeiten** (z. B. Kakao, Tabak, Zuckerrohr), sodass keine Insel alles allein produzieren kann.
* **1.2 Stufenlose 3D-Kamera & Nebel des Krieges:**
  * *1-Finger-Pan* (Verschieben), *Pinch-to-Zoom* (stufenlos vom weiten Überblick bis ganz nah an die Straßen) und *2-Finger-Rotation* (3D-Drehung) plus Ausnordungs-Button.
  * **Fog of War:** Weicher, kartenartiger Nebel über unerkundeten Gebieten, der sich durch Schiffe lichtet.
* **1.3 Flow-orientiertes Bausystem:**
  * Raster-Platzierung mit automatischer Straßenausrichtung und manueller 90°-Drehung.
  * **Straßen-Ziehwerkzeug:** Feldwege und Pflasterstraßen bequem per Fingerwisch ziehen.
  * **Komfort-Funktionen:** *Pipettenmodus* (Antippen eines Gebäudes dupliziert es direkt in den Baumodus) und Abriss-Tool.
* **Abnahmekriterium:** Du kannst auf dem Tablet eine per Seed generierte Inselwelt erkunden, stufenlos hineinzoomen sowie Straßen und Greybox-Gebäude im Flow platzieren.

### Phase 2: Kern-Wirtschaft, Uhrwerk-Logistik & Bevölkerung (Stufe 1–2)
* **2.1 Inselweites Lager & Marktkarren-System:**
  * **Kontor** (Küste) und **Markthäuser** (Landesinneres) teilen ein gemeinsames Warenlager und vergrößern die Kapazität.
  * **A*-Straßen-Wegfindung:** Marktkarren fahren eigenständig von Markthäusern zu Produktionsbetrieben, holen fertige Waren ab und bringen sie ins Lager (inkl. Sofortabholungs-Button).
* **2.2 Intuitive Produktionsketten (Grundversorgung):**
  * Aufbau der ersten Ketten (Holzfäller, Fischer, Jagdhütte, Schafzucht/Webstube, Werkzeugschmiede).
  * Klare Auslastungsanzeigen (in Prozent) und grüne Hervorhebung zusammengehöriger Zulieferbetriebe beim Bauen.
* **2.3 Bevölkerung & Zufriedenheit (Pioniere & Siedler):**
  * Wohnhäuser im Einflussradius von Dorfzentrum und Kapelle.
  * **Automatisches Aufstiegssystem:** Sind materielle und soziale Bedürfnisse erfüllt, steigen Häuser auf (mehr Einwohner, höhere Steuern).
  * **Baumaterial-Sperre:** Ein Schalter im UI pausiert den Aufstieg, um Baumaterialien für neue Produktionsbetriebe zu reservieren.
* **2.4 Transparente Finanzbilanz:**
  * Trennung von laufender **Stadtbilanz** (Steuern via Schieberegler minus Gebäudeunterhalt) und **Handelsbilanz**.
* **Abnahmekriterium:** Ein autarker Wirtschaftskreislauf läuft ruhig und stabil: Waren fließen über Karren ins Lager, Pioniere steigen zu Siedlern auf und die Stadtbilanz ist positiv.

### Phase 3: Schifffahrt, Expansion & Automatisierter Handel
* **3.1 Werften & Schiffssteuerung:**
  * Kleine und große Werften an der Küste zum Bau und zur Reparatur von Schiffen (Flottenlimit gekoppelt an die Gesamteinwohnerzahl).
  * Verschiedene Handelsschiff-Klassen (klein & groß) mit unterschiedlichen Laderäumen und Geschwindigkeiten.
  * Intuitive Touch-Steuerung auf dem Wasser mit automatischer Umfahrung von Inseln.
* **3.2 Insel-Besiedlung & Manueller Warentransfer:**
  * Beladen von Schiffen mit Holz und Werkzeugen, Ansteuern neuer Inseln und Gründung weiterer Kontore.
* **3.3 Automatisierte Handelsrouten:**
  * Strategiekarten-Ansicht mit visuellem Routenplaner: Festlegen von Häfen (eigene Kontore, fremde Völker, KI-Partner), Ein-/Auslademengen pro Ware und Zuweisen von Schiffen.
* **Abnahmekriterium:** Zwei Inseln mit unterschiedlichen Fruchtbarkeiten sind besiedelt, und deine Schiffe versorgen die Hauptinsel vollautomatisch über Handelsrouten.

---

## Überphase II: Spieltiefe, Intrigen & Lebendige Welt (Lategame & KI)
**Makro-Ziel:** Das Spiel wächst zu einer tiefgreifenden Endlosspiel-Simulation heran. Alle 5 Zivilisationsstufen, Forschung, charakterstarke KI-Konkurrenten, die Loge der Wissenschaften sowie dynamische Naturgewalten greifen ineinander.

### Phase 4: Lategame-Tiefe (Stufen 3–5 & Barocke Pracht)
* **4.1 Zivilisationsstufen 3 bis 5 (Bürger, Kaufleute, Aristokraten):**
  * Komplexe, mehrstufige Luxusketten (Tabakwaren, Pralinen, Parfüm, Lampenöl, Schmuck).
  * **Bergbau:** Erschließung von Erz-, Marmor-, Gold- und Edelsteinvorkommen in den Bergen.
  * **Exotische Kolonialwaren:** Einbindung von Elfenbein, Jade, Pelzen und Talismanen, die nur über fremde Völker und Händler beschafft werden können.
* **4.2 Bildung & Globaler Forschungsbaum:**
  * Bau von Schule, Universität und Senat.
  * Erforschung globaler Verbesserungen (z. B. *Großes Segel* für schnellere Schiffe, *Dolmetscher* für bessere Handelspreise, *Stadtschlüssel* zum erneuten Einladen von Ehrengästen).
* **4.3 Schönbau-Elemente & Ehrengäste:**
  * Zieranlagen (Parks, Brunnen, Alleen, Statuen) für den perfekten Barock-Look.
  * **Ehrengäste:** Eine hohe Stadtattraktivität lockt besondere Persönlichkeiten an, die wertvolle Boni oder seltene Waren mitbringen.
* **Abnahmekriterium:** Du kannst eine Metropole bis zur 5. Zivilisationsstufe (Aristokraten) ausbauen, Technologien erforschen und Ehrengäste empfangen.

### Phase 5: Charakterstarke KI, Fremde Völker & Loge der Wissenschaften
* **5.1 Charakterstarke KI-Gegner & Persönlichkeiten:**
  * Implementierung von bis zu 3 KI-Mitspielern mit klaren Archetypen (z. B. die warmherzige Aristokratin, der vorsichtige Händler, der gerissene Geschäftsmann, der ruppige Haudegen).
  * Humorvolle Text- und Portrait-Reaktionen auf deine Baufortschritte, Handelsangebote und deinen Ruf.
* **5.2 Freie Händler & Fremde Kulturen:**
  * **Freier Händler & Orient-Händler:** Besuchen regelmäßig dein Kontor für passiven Handel oder verkaufen Schatz- und Seekarten.
  * **Fremde Völker (Azteken, Irokesen, Inder, Chinesen):** Verbrüderung durch Handel schaltet Kolonialwaren sowie mächtige **Spezialaktionen** frei (z. B. den *Regentanz* gegen Dürren oder einen Produktions-Segen).
* **5.3 Die Loge der Wissenschaften (Gewaltfreie Intrigen):**
  * Bau der **Loge** im Lategame für schelmische Hofstaat-Intrigen gegen Konkurrenten:
    * *Spion:* Forschungsergebnisse stehlen oder Lagerbestände auskundschaften.
    * *Saboteur / Brunnenvergifter:* Produktionsbetriebe vorübergehend lahmlegen oder kleine Brände/Seuchen auslösen.
    * *Demagoge / Falschmünzer:* Unzufriedenheit schüren oder den Gegner finanziell schröpfen.
* **5.4 Dynamische Ereignisse & Naturgewalten:**
  * Optional zuschaltbare Herausforderungen wie Brände (Feuerwehr), Pest (Arzt/Hospital), Dürren und Naturkatastrophen (Wirbelstürme, Vulkanausbrüche, Erdbeben).
* **Abnahmekriterium:** KI-Gegner besiedeln parallel Inseln, Handel mit fremden Völkern schaltet Spezialaktionen frei und Logen-Agenten lassen sich erfolgreich gegen KI-Städte einsetzen.

---

## Überphase III: Barock-Ästhetik, Triumphales Finale & Tablet-Polishing
**Makro-Ziel:** Die Verwandlung vom funktionalen Prototyp in ein atmosphärisches Meisterwerk mit dem unverwechselbaren „Anno-1701-Wuselfaktor“, Orchester-Soundtrack, einem emotionalen Endgame-Finale und maßgeschneidertem Tablet-Komfort.

### Phase 6: 3D-Grafik-Ausbau, „Wuselfaktor“ & Barock-Atmosphäre
* **6.1 Märchenhafte Barock-3D-Welt:**
  * Austausch aller Greybox-Blöcke durch farbenfrohe 3D-Gebäude (vom einfachen Pionierzelt über Fachwerkhäuser bis zum goldverzierten Aristokraten-Palast).
  * **Wasser- & Lichtstimmung:** Türkisblaues Wasser mit Shader-Wellen und Küstengischt, warme Sonnenuntergänge und sanfte Schatten.
* **6.2 Der volle „Wuselfaktor“:**
  * Sichtbare Animationen in der Mikrowelt: Holzfäller schlagen echte Bäume, Marktkarren rattern über Pflasterstraßen, Bürger flanieren, tanzen auf dem Marktplatz oder schwenken bei Unzufriedenheit Fackeln.
* **6.3 Opulenter Barock-Soundtrack & Sounddesign:**
  * Majestätische Streicher, verspielte Flöten und Cembalo-Klänge, die sich nie aufdrängen.
  * Liebevolle Detail-Sounds beim Heranzoomen (Möwen, Wellen, Hämmern, Marktgemurmel) sowie eine freundliche Erzählerstimme (inkl. der charmanten 2-Stunden-Pausen-Erinnerung).
* **Abnahmekriterium:** Beim nahen Heranzoomen an den Marktplatz pulsiert das Leben in warmen Barockfarben, untermalt von einem stimmigen Orchester-Soundtrack.

### Phase 7: Das Triumphale Finale – Schlossbau & Unabhängigkeit
* **7.1 Der modulare Schlossbau:**
  * Sobald du genügend Aristokraten hast, schaltest du das **Schloss** frei.
  * Es besteht aus einem Hauptgebäude und frei kombinierbaren Modulen (Flügel, Türme, Prunkgärten, Triumphbögen), die große Mengen an Marmor, Gold, Werkzeug und Geld verschlingen.
* **7.2 Der Weg zur Unabhängigkeit (Friedliches Finale):**
  * Mit wachsendem Prunk fordert die **Königin** höhere Tribute und stellt dich vor Ultimaten.
  * Erklärst du deine **Unabhängigkeit**, verhängt die Krone eine Handelsblockade und stellt dir ein Zeitlimit, um deine wirtschaftliche Autarkie zu beweisen (Vollenden des Schlosses, Schatzkammer-Polster, Bündnisse mit fremden Völkern).
  * Gelingt dies, erkennt die Königin deine Souveränität feierlich an – gekrönt von einem großen Feuerwerk über deiner Hauptstadt.
* **Abnahmekriterium:** Ein komplettes Spiel lässt sich vom ersten Holzfäller bis zum fertigen Prunkschloss und der anerkannten Unabhängigkeit durchspielen.

### Phase 8: Tablet-UI, Endlosspiel-Konfigurator & Feinschliff
* **8.1 Barockes Tablet-Interface & Direkthilfe:**
  * **Obere Infoleiste:** Kontostand, Bilanz, Einwohnerzahl, Inselfruchtbarkeiten und Lagerbestände.
  * **Zentrales Menü (unten links):** Minimap mit Nebel des Krieges und Spielerfarben, umrahmt von großen Touch-Buttons.
  * **Touch-Radialmenü:** Langes Gedrückthalten öffnet ein Schnellmenü für Pipette, Abriss, Straßenbau und Drehen.
  * **Kontextsensitive Direkthilfe:** Kleine Info-Icons erklären neue Mechaniken direkt im Spiel.
* **8.2 Der Endlosspiel-Konfigurator (Einziger Spielmodus):**
  * Startmenü zum freien Gestalten jeder Partie: Kartengröße, Insel-Schwierigkeit, Rohstoffhäufigkeit, Karten-Seed, Start mit Kontor vs. Schiff, Auswahl der KI-Persönlichkeiten, Katastrophen-Regler und optionale Siegbedingungen (z. B. *Unabhängigkeit*, *Schlossherr*, *Handelsmonopol* oder *Endlos ohne Ziel*).
* **8.3 Savegame-System & Tablet-Optimierung:**
  * Schnellspeichern, Autosave (30/60 Min.) und mehrere Spielstand-Slots (JSON/Binary).
  * Performance-Optimierung für dein Tablet (GPU Instancing für Bäume/Häuser, Object Pooling für Bürger und Karren).
