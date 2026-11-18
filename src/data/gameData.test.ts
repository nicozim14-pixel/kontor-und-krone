import { describe, expect, it } from "vitest";
import { loadBundledGameData } from "./bundledData";
import { loadGameData } from "./gameData";
import invalidBuildings from "./testdata/buildings.invalid.json";
import invalidGoods from "./testdata/goods.invalid.json";

const WOOD = { id: "wood", name: "Holz" };
const WOODCUTTER = {
  id: "test_woodcutter",
  name: "Test-Holzfäller",
  produces: { good: "wood", amountPerTick: 1 },
};

describe("Daten-Lader", () => {
  it("lädt die mitgelieferten Spieldaten ohne Fehler", () => {
    const result = loadBundledGameData();
    expect(result.ok ? [] : result.errors).toEqual([]);
  });

  it("enthält die Test-Ware „Holz“ und den Test-Holzfäller (Durchstich, Unterphase 1.7)", () => {
    const result = loadBundledGameData();
    if (!result.ok) {
      throw new Error(result.errors.join("\n"));
    }
    expect(result.value.goods.get("wood")?.name).toBe("Holz");
    expect(result.value.buildings.get("test_woodcutter")?.produces).toEqual({
      good: "wood",
      amountPerTick: 1,
    });
  });

  it("baut aus gültigen Daten Nachschlage-Tabellen", () => {
    const result = loadGameData({
      goods: [WOOD, { id: "tools", name: "Werkzeug" }],
      buildings: [WOODCUTTER, { id: "pioneer_house", name: "Pionierhaus" }],
    });
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
    const result = loadGameData({ goods: invalidGoods, buildings: [] });
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
    const result = loadGameData({ goods: [WOOD], buildings: invalidBuildings });
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual([
      "buildings.json → Eintrag 2 („fisher“) → Feld „produces“ → Feld „amountPerTick“: Muss mindestens 1 sein.",
      "buildings.json → Eintrag 3 („sawmill“) → Feld „produces“ → Feld „amountPerTick“: Erwartet eine ganze Zahl, gefunden die Zahl 1.5.",
      "buildings.json → Eintrag 4 („quarry“) → Feld „name“: Pflichtfeld fehlt (erwartet einen Text).",
      "buildings.json → Eintrag 5 („hunter“) → Feld „produces“ → Feld „amountPerTick“: Pflichtfeld fehlt (erwartet eine Zahl).",
      "buildings.json → Eintrag 5 („hunter“) → Feld „produces“: Unbekanntes Feld „amount“. Tippfehler?",
      "buildings.json → Eintrag 6 („Weber“) → Feld „id“: Nur Kleinbuchstaben (a–z), Ziffern und Unterstriche erlaubt, Beginn mit einem Buchstaben (z. B. „wood“).",
    ]);
  });

  it("meldet Fehler in beiden Dateien zusammen", () => {
    const result = loadGameData({ goods: invalidGoods, buildings: invalidBuildings });
    expect(result.ok ? 0 : result.errors.length).toBe(11);
  });

  it("findet Gebäude, die eine unbekannte Ware herstellen", () => {
    const result = loadGameData({
      goods: [WOOD],
      buildings: [
        WOODCUTTER,
        { id: "test_fisher", name: "Test-Fischer", produces: { good: "holz", amountPerTick: 2 } },
      ],
    });
    expect(result.ok ? [] : result.errors).toEqual([
      "buildings.json → Eintrag 2 („test_fisher“) → Feld „produces“ → Feld „good“: Die Ware „holz“ gibt es nicht. Bekannte Waren: wood.",
    ]);
  });

  it("findet doppelt vergebene Kennungen", () => {
    const result = loadGameData({
      goods: [WOOD, { id: "tools", name: "Werkzeug" }, { id: "wood", name: "Bauholz" }],
      buildings: [WOODCUTTER, WOODCUTTER],
    });
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json → Eintrag 3 („wood“): Die Kennung „wood“ ist schon an Eintrag 1 vergeben.",
      "buildings.json → Eintrag 2 („test_woodcutter“): Die Kennung „test_woodcutter“ ist schon an Eintrag 1 vergeben.",
    ]);
  });

  it("erklärt, wenn eine Datei gar keine Liste enthält", () => {
    const result = loadGameData({ goods: WOOD, buildings: [] });
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json: Erwartet eine Liste [ … ], gefunden ein Objekt.",
    ]);
  });
});
