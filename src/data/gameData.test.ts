import { describe, expect, it } from "vitest";
import { loadBundledGameData } from "./bundledData";
import { loadGameData } from "./gameData";
import invalidGoods from "./testdata/goods.invalid.json";

describe("Daten-Lader", () => {
  it("lädt die mitgelieferten Spieldaten ohne Fehler", () => {
    const result = loadBundledGameData();
    expect(result.ok ? [] : result.errors).toEqual([]);
  });

  it("baut aus gültigen Daten eine Nachschlage-Tabelle", () => {
    const result = loadGameData({
      goods: [
        { id: "wood", name: "Holz" },
        { id: "tools", name: "Werkzeug" },
      ],
    });
    if (!result.ok) {
      throw new Error(result.errors.join("\n"));
    }
    expect(result.value.goods.get("wood")?.name).toBe("Holz");
    expect(result.value.goods.get("tools")?.name).toBe("Werkzeug");
    expect(result.value.goods.size).toBe(2);
  });

  it("meldet alle Fehler einer absichtlich fehlerhaften Datei auf Deutsch", () => {
    const result = loadGameData({ goods: invalidGoods });
    expect(result.ok).toBe(false);
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json → Eintrag 2 („Holz“) → Feld „id“: Nur Kleinbuchstaben (a–z), Ziffern und Unterstriche erlaubt, Beginn mit einem Buchstaben (z. B. „wood“).",
      "goods.json → Eintrag 3 („tools“) → Feld „name“: Erwartet einen Text, gefunden die Zahl 5.",
      "goods.json → Eintrag 4 („fish“) → Feld „name“: Pflichtfeld fehlt (erwartet einen Text).",
      "goods.json → Eintrag 5 („bricks“): Unbekanntes Feld „price“. Tippfehler?",
      "goods.json → Eintrag 6 („cloth“) → Feld „name“: Darf nicht leer sein.",
    ]);
  });

  it("findet doppelt vergebene Kennungen", () => {
    const result = loadGameData({
      goods: [
        { id: "wood", name: "Holz" },
        { id: "tools", name: "Werkzeug" },
        { id: "wood", name: "Bauholz" },
      ],
    });
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json → Eintrag 3 („wood“): Die Kennung „wood“ ist schon an Eintrag 1 vergeben.",
    ]);
  });

  it("erklärt, wenn eine Datei gar keine Liste enthält", () => {
    const result = loadGameData({ goods: { id: "wood", name: "Holz" } });
    expect(result.ok ? [] : result.errors).toEqual([
      "goods.json: Erwartet eine Liste [ … ], gefunden ein Objekt.",
    ]);
  });
});
