import { describe, expect, it } from "vitest";
import { BUNDLED_DATA_FILES, loadBundledGameData } from "./bundledData";
import { loadGameData } from "./gameData";
import { REQUIRED_TERRAIN_IDS } from "./schemas";
import { testBuilding, testDataFiles } from "./testFixtures";
import invalidBuildings from "./testdata/buildings.invalid.json";
import invalidGoods from "./testdata/goods.invalid.json";
import invalidTerrain from "./testdata/terrain.invalid.json";
import invalidWorldGen from "./testdata/worldgen.invalid.json";

const WOOD = { id: "wood", name: "Holz" };
const WOODCUTTER = testBuilding({
  id: "test_woodcutter",
  name: "Test-Holzfäller",
  produces: { good: "wood", amountPerTick: 1 },
});

function loadBundled() {
  const result = loadBundledGameData();
  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
  return result.value;
}

describe("Daten-Lader", () => {
  it("lädt die mitgelieferten Spieldaten ohne Fehler", () => {
    const result = loadBundledGameData();
    expect(result.ok ? [] : result.errors).toEqual([]);
  });

  it("enthält die Test-Ware „Holz“ und den Test-Holzfäller (Durchstich, Unterphase 1.7)", () => {
    const data = loadBundled();
    expect(data.goods.get("wood")?.name).toBe("Holz");
    expect(data.buildings.get("test_woodcutter")?.produces).toEqual({
      good: "wood",
      amountPerTick: 1,
    });
  });

  it("baut aus gültigen Daten Nachschlage-Tabellen", () => {
    const result = loadGameData(
      testDataFiles({
        goods: [WOOD, { id: "tools", name: "Werkzeug" }],
        buildings: [WOODCUTTER, testBuilding({ id: "pioneer_house", name: "Pionierhaus" })],
      }),
    );
    if (!result.ok) {
      throw new Error(result.errors.join("\n"));
    }
    expect(result.value.goods.get("wood")?.name).toBe("Holz");
    expect(result.value.goods.get("tools")?.name).toBe("Werkzeug");
    expect(result.value.goods.size).toBe(2);
    expect(result.value.buildings.get("pioneer_house")?.produces).toBeUndefined();
    expect(result.value.buildings.size).toBe(2);
  });

  it("meldet alle Fehler einer absichtlich fehlerhaften Waren-Datei auf Deutsch", () => {
    const result = loadGameData(testDataFiles({ goods: invalidGoods, buildings: [] }));
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json → Eintrag 2 („Holz“) → Feld „id“: Nur Kleinbuchstaben (a–z), Ziffern und Unterstriche erlaubt, Beginn mit einem Buchstaben (z. B. „wood“).",
      "goods.json → Eintrag 3 („tools“) → Feld „name“: Erwartet einen Text, gefunden die Zahl 5.",
      "goods.json → Eintrag 4 („fish“) → Feld „name“: Pflichtfeld fehlt (erwartet einen Text).",
      "goods.json → Eintrag 5 („bricks“): Unbekanntes Feld „price“. Tippfehler?",
      "goods.json → Eintrag 6 („cloth“) → Feld „name“: Darf nicht leer sein.",
    ]);
  });

  it("meldet alle Fehler einer absichtlich fehlerhaften Gebäude-Datei auf Deutsch", () => {
    const result = loadGameData(testDataFiles({ goods: [WOOD], buildings: invalidBuildings }));
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual([
      "buildings.json → Eintrag 2 („fisher“) → Feld „produces“ → Feld „amountPerTick“: Muss mindestens 1 sein.",
      "buildings.json → Eintrag 3 („sawmill“) → Feld „produces“ → Feld „amountPerTick“: Erwartet eine ganze Zahl, gefunden die Zahl 1.5.",
      "buildings.json → Eintrag 4 („quarry“) → Feld „name“: Pflichtfeld fehlt (erwartet einen Text).",
      "buildings.json → Eintrag 5 („hunter“) → Feld „produces“ → Feld „amountPerTick“: Pflichtfeld fehlt (erwartet eine Zahl).",
      "buildings.json → Eintrag 5 („hunter“) → Feld „produces“: Unbekanntes Feld „amount“. Tippfehler?",
      "buildings.json → Eintrag 6 („Weber“) → Feld „id“: Nur Kleinbuchstaben (a–z), Ziffern und Unterstriche erlaubt, Beginn mit einem Buchstaben (z. B. „wood“).",
      "buildings.json → Eintrag 7 („chapel“) → Feld „size“ → Feld „width“: Muss mindestens 1 sein.",
      "buildings.json → Eintrag 8 („market“) → Feld „size“ → Feld „depth“: Darf höchstens 12 sein.",
      "buildings.json → Eintrag 8 („market“) → Feld „allowedTerrain“: Braucht mindestens einen Eintrag.",
      "buildings.json → Eintrag 9 („house“) → Feld „size“: Pflichtfeld fehlt (erwartet ein Objekt { … }).",
    ]);
  });

  it("meldet Fehler in mehreren Dateien zusammen", () => {
    const result = loadGameData(
      testDataFiles({ goods: invalidGoods, buildings: invalidBuildings, terrain: invalidTerrain }),
    );
    expect(result.ok ? 0 : result.errors.length).toBe(5 + 10 + 3);
  });

  it("findet Gebäude, die eine unbekannte Ware herstellen", () => {
    const result = loadGameData(
      testDataFiles({
        goods: [WOOD],
        buildings: [
          WOODCUTTER,
          testBuilding({
            id: "test_fisher",
            name: "Test-Fischer",
            produces: { good: "holz", amountPerTick: 2 },
          }),
        ],
      }),
    );
    expect(result.ok ? [] : result.errors).toEqual([
      "buildings.json → Eintrag 2 („test_fisher“) → Feld „produces“ → Feld „good“: Die Ware „holz“ gibt es nicht. Bekannte Waren: wood.",
    ]);
  });

  it("findet doppelt vergebene Kennungen", () => {
    const result = loadGameData(
      testDataFiles({
        goods: [WOOD, { id: "tools", name: "Werkzeug" }, { id: "wood", name: "Bauholz" }],
        buildings: [WOODCUTTER, WOODCUTTER],
        fertilities: [
          { id: "cocoa", name: "Kakao", color: "#6b3e26" },
          { id: "cocoa", name: "Kakao", color: "#6b3e26" },
        ],
      }),
    );
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json → Eintrag 3 („wood“): Die Kennung „wood“ ist schon an Eintrag 1 vergeben.",
      "buildings.json → Eintrag 2 („test_woodcutter“): Die Kennung „test_woodcutter“ ist schon an Eintrag 1 vergeben.",
      "fertilities.json → Eintrag 2 („cocoa“): Die Kennung „cocoa“ ist schon an Eintrag 1 vergeben.",
    ]);
  });

  it("erklärt, wenn eine Datei gar keine Liste enthält", () => {
    const result = loadGameData(testDataFiles({ goods: WOOD, buildings: [] }));
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json: Erwartet eine Liste [ … ], gefunden ein Objekt.",
    ]);
  });
});

describe("Daten der Welt: Gelände, Rohstoffe, Fruchtbarkeiten (Unterphase 2.2)", () => {
  it("kennt alle Geländearten, die das Spiel braucht, mit ihrer Nummer", () => {
    const data = loadBundled();
    for (const id of REQUIRED_TERRAIN_IDS) {
      const code = data.terrainCode[id];
      expect(data.terrains[code]?.id).toBe(id);
      expect(data.terrainCodes.get(id)).toBe(code);
    }
    expect(data.terrains[data.terrainCode.plain]?.water).toBe(false);
    expect(data.terrains[data.terrainCode.deep_water]?.water).toBe(true);
  });

  it("enthält Rohstoffvorkommen und Fruchtbarkeiten mit deutschen Namen", () => {
    const data = loadBundled();
    expect(data.resources.get("iron_ore")?.name).toBe("Eisenerz");
    expect(data.resources.get("marble")?.name).toBe("Marmor");
    expect(data.resources.get("gold")?.name).toBe("Gold");
    expect(data.resources.get("gems")?.name).toBe("Edelsteine");
    expect(data.fertilities.get("cocoa")?.name).toBe("Kakao");
    expect(data.fertilities.get("tobacco")?.name).toBe("Tabak");
    expect(data.fertilities.get("sugarcane")?.name).toBe("Zuckerrohr");
    // Genug Fruchtbarkeiten, damit 6–8 Inseln sie so aufteilen können, dass keine alle hat
    expect(data.fertilities.size).toBeGreaterThanOrEqual(4);
  });

  it("gibt jeder Gebäudeart eine Größe in Kacheln und einen erlaubten Untergrund", () => {
    const data = loadBundled();
    const woodcutter = data.buildings.get("test_woodcutter");
    expect(woodcutter?.size).toEqual({ width: 3, depth: 3 });
    expect(woodcutter?.allowedTerrain).toEqual(["plain"]);
  });

  it("meldet alle Fehler einer absichtlich fehlerhaften Gelände-Datei auf Deutsch", () => {
    const result = loadGameData(testDataFiles({ terrain: invalidTerrain }));
    expect(result.ok ? [] : result.errors).toEqual([
      "terrain.json → Eintrag 2 („shallow_water“) → Feld „water“: Erwartet ja oder nein (true/false), gefunden den Text „ja“.",
      "terrain.json → Eintrag 3 („beach“) → Feld „color“: Erwartet eine Farbe wie „#8fb565“ (# und sechs Zeichen aus 0–9 und a–f).",
      "terrain.json → Eintrag 4 („plain“) → Feld „color“: Pflichtfeld fehlt (erwartet einen Text).",
    ]);
  });

  it("verlangt die Geländearten, die das Spiel selbst kennt", () => {
    const result = loadGameData(
      testDataFiles({
        terrain: [
          { id: "deep_water", name: "Tiefes Wasser", water: true, color: "#1f7f94" },
          { id: "plain", name: "Ebene", water: false, color: "#93b86a" },
        ],
      }),
    );
    expect(result.ok ? [] : result.errors).toEqual([
      "terrain.json: Es fehlen Geländearten, die das Spiel braucht: shallow_water, beach, mountain.",
    ]);
  });

  it("erlaubt höchstens 256 Geländearten (eine Kachel speichert ihre Art als Zahl bis 255)", () => {
    const required = REQUIRED_TERRAIN_IDS.map((id) => ({
      id,
      name: id,
      water: false,
      color: "#000000",
    }));
    const extra = Array.from({ length: 256 - required.length + 1 }, (_, index) => ({
      id: `extra_${String(index)}`,
      name: "Extra",
      water: false,
      color: "#000000",
    }));
    const result = loadGameData(testDataFiles({ terrain: [...required, ...extra] }));
    expect(result.ok ? [] : result.errors).toEqual([
      "terrain.json: Höchstens 256 Geländearten erlaubt (gefunden: 257).",
    ]);
  });

  it("findet Gebäude, die auf einer unbekannten Geländeart stehen sollen", () => {
    const result = loadGameData(
      testDataFiles({
        buildings: [
          WOODCUTTER,
          testBuilding({ id: "test_mine", name: "Test-Mine", allowedTerrain: ["berg"] }),
        ],
      }),
    );
    expect(result.ok ? [] : result.errors).toEqual([
      "buildings.json → Eintrag 2 („test_mine“) → Feld „allowedTerrain“: Die Geländeart „berg“ gibt es nicht. Bekannte Geländearten: deep_water, shallow_water, beach, plain, mountain.",
    ]);
  });

  it("prüft Farben und Kennungen von Rohstoffen", () => {
    const result = loadGameData(
      testDataFiles({ resources: [{ id: "Gold", name: "Gold", color: "gelb" }] }),
    );
    expect(result.ok ? [] : result.errors).toEqual([
      "resources.json → Eintrag 1 („Gold“) → Feld „id“: Nur Kleinbuchstaben (a–z), Ziffern und Unterstriche erlaubt, Beginn mit einem Buchstaben (z. B. „wood“).",
      "resources.json → Eintrag 1 („Gold“) → Feld „color“: Erwartet eine Farbe wie „#8fb565“ (# und sechs Zeichen aus 0–9 und a–f).",
    ]);
  });
});

describe("Regeln des Weltgenerators: worldgen.json (Unterphase 2.3)", () => {
  const validRules = (): Record<string, unknown> =>
    JSON.parse(JSON.stringify(BUNDLED_DATA_FILES.worldGen)) as Record<string, unknown>;

  it("lädt die mitgelieferten Regeln mit 6 bis 8 Inseln auf 256 × 256 Kacheln (E-021)", () => {
    const rules = loadBundled().worldGen;
    expect(rules.map).toMatchObject({ width: 256, height: 256 });
    const min = rules.islandClasses.reduce((sum, entry) => sum + entry.count.min, 0);
    const max = rules.islandClasses.reduce((sum, entry) => sum + entry.count.max, 0);
    expect([min, max]).toEqual([6, 8]);
  });

  it("meldet alle Fehler einer absichtlich fehlerhaften Regel-Datei auf Deutsch", () => {
    const result = loadGameData(testDataFiles({ worldGen: invalidWorldGen }));
    expect(result.ok ? [] : result.errors).toEqual([
      "worldgen.json → Feld „map“ → Feld „width“: Muss mindestens 64 sein.",
      "worldgen.json → Feld „islandClasses“ → Eintrag 1 („large“) → Feld „count“: „min“ darf nicht größer als „max“ sein.",
      "worldgen.json → Feld „coast“ → Feld „roughness“: Darf höchstens 0.5 sein.",
      "worldgen.json → Feld „forests“ → Feld „coverage“: Erwartet eine Zahl, gefunden den Text „viel“.",
      "worldgen.json: Unbekanntes Feld „seaLevel“. Tippfehler?",
    ]);
  });

  it("findet unbekannte und fehlende Rohstoffe", () => {
    const rules = validRules();
    rules.deposits = [
      { resource: "iron_ore", weight: 4 },
      { resource: "silber", weight: 1 },
      { resource: "iron_ore", weight: 2 },
    ];
    const result = loadGameData(testDataFiles({ worldGen: rules }));
    expect(result.ok ? [] : result.errors).toEqual([
      "worldgen.json → Feld „deposits“ → Eintrag 2: Den Rohstoff „silber“ gibt es nicht. Bekannte Rohstoffe: iron_ore, marble, gold, gems.",
      "worldgen.json → Feld „deposits“ → Eintrag 3: Der Rohstoff „iron_ore“ steht doppelt in der Liste.",
      "worldgen.json → Feld „deposits“: Es fehlt die Häufigkeit für marble, gold, gems.",
    ]);
  });

  it("verhindert, dass eine Insel alle Fruchtbarkeiten bekommen kann", () => {
    const rules = validRules();
    rules.fertilitiesPerIsland = { min: 2, max: 6 };
    const result = loadGameData(testDataFiles({ worldGen: rules }));
    expect(result.ok ? [] : result.errors).toEqual([
      "worldgen.json → Feld „fertilitiesPerIsland“ → Feld „max“: Muss kleiner als die Zahl aller Fruchtbarkeiten (6) sein, damit keine Insel alles hat.",
    ]);
  });

  it("prüft, dass die Inseln auf die Karte passen und es mindestens eine gibt", () => {
    const rules = validRules();
    rules.islandClasses = [
      {
        id: "huge",
        name: "riesig",
        count: { min: 0, max: 1 },
        diameter: { min: 200, max: 250 },
        mountainRanges: { min: 0, max: 0 },
      },
    ];
    const result = loadGameData(testDataFiles({ worldGen: rules }));
    expect(result.ok ? [] : result.errors).toEqual([
      "worldgen.json → Feld „islandClasses“: Es muss mindestens eine Insel entstehen.",
      "worldgen.json → Feld „islandClasses“ → Eintrag 1 („huge“) → Feld „diameter“: Inseln mit 250 Kacheln passen mit dem Rand („edgeMargin“) nicht auf eine Karte mit 256 Kacheln.",
    ]);
  });
});
