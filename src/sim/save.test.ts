import { describe, expect, it } from "vitest";
import { deserializeGameState, serializeGameState } from "./save";
import { createInitialState, SAVE_VERSION, type GameState } from "./state";
import { createEmptyWorld, tileIndex, TREE } from "./world";
import { metersToElevation } from "./worldSpace";

/** Eine kleine Test-Welt (8 × 6 Kacheln) mit einer Insel, Bäumen und Belegung. */
function createSmallWorldState(): GameState {
  const world = createEmptyWorld(8, 6, 0);
  for (let y = 1; y <= 4; y++) {
    for (let x = 2; x <= 6; x++) {
      const index = tileIndex(world, x, y);
      world.terrain[index] = x === 6 ? 4 : 3; // Ebene, am Ostrand Berg
      world.elevation[index] = metersToElevation(x === 6 ? 6.5 : 1);
      world.island[index] = 1;
    }
  }
  world.trees[tileIndex(world, 3, 3)] = TREE;
  world.trees[tileIndex(world, 4, 3)] = TREE;
  world.occupancy[tileIndex(world, 2, 1)] = 7; // Gebäude Nr. 7
  world.occupancy[tileIndex(world, 3, 1)] = -1; // Straße

  const state = createInitialState(42, world);
  state.islands.push({
    id: 1,
    fertilities: ["cocoa", "tobacco"],
    deposits: [{ resource: "iron_ore", x: 6, y: 2 }],
  });
  state.tick = 1234;
  state.nextEntityId = 8;
  state.buildings["7"] = { id: 7, type: "test_woodcutter" };
  state.storage.wood = 99;
  return state;
}

/** Spielstand als einfaches Objekt, um ihn in Tests gezielt zu verfälschen. */
function savedObject(state: GameState): Record<string, unknown> {
  return JSON.parse(serializeGameState(state)) as Record<string, unknown>;
}

describe("Spielzustand und Spielstand-Format", () => {
  it("beginnt eine neue Partie mit Takt 0, Versionsnummer und Seed", () => {
    const state = createInitialState(1701);
    expect(state.tick).toBe(0);
    expect(state.saveVersion).toBe(SAVE_VERSION);
    expect(state.seed).toBe(1701);
    expect(state.nextEntityId).toBe(1);
    expect(state.buildings).toEqual({});
    expect(state.storage).toEqual({});
    expect(state.islands).toEqual([]);
    expect(state.world.width * state.world.height).toBe(0);
  });

  it("Text hin und zurück ergibt exakt denselben Zustand, auch mit Kachel-Raster", () => {
    const state = createSmallWorldState();
    const result = deserializeGameState(serializeGameState(state));
    if (!result.ok) {
      throw new Error(result.errors.join("\n"));
    }
    expect(result.value).toEqual(state);
    expect(result.value.world.terrain).toBeInstanceOf(Uint8Array);
    expect(result.value.world.occupancy).toBeInstanceOf(Int32Array);
    expect(structuredClone(state)).toEqual(state);
  });

  it("schreibt das Kachel-Raster platzsparend (Lauflängen-Kodierung)", () => {
    const state = createInitialState(1, createEmptyWorld(256, 256, 0));
    const text = serializeGameState(state);
    // 65.536 Kacheln Meer pro Ebene werden zu je einem Paar „Wert, Anzahl“.
    expect(text.length).toBeLessThan(1000);
    const world = (JSON.parse(text) as { world: { terrain: number[] } }).world;
    expect(world.terrain).toEqual([0, 65_536]);
  });

  it("lehnt beschädigte Daten mit verständlicher Meldung ab", () => {
    const broken = deserializeGameState("{ kaputt");
    expect(broken.ok ? [] : broken.errors).toEqual([
      "Spielstand: Die Daten sind beschädigt (kein gültiges JSON).",
    ]);

    const notAState = deserializeGameState("[1, 2, 3]");
    expect(notAState.ok ? [] : notAState.errors).toEqual([
      "Spielstand: Die Daten sind kein Spielstand.",
    ]);

    const noVersion = deserializeGameState("{}");
    expect(noVersion.ok ? [] : noVersion.errors).toEqual([
      "Spielstand: Die Versionsnummer fehlt oder ist ungültig.",
    ]);
  });

  it("erkennt Spielstände aus einer neueren Spielversion", () => {
    const saved = { ...savedObject(createInitialState(1)), saveVersion: SAVE_VERSION + 1 };
    const result = deserializeGameState(JSON.stringify(saved));
    expect(result.ok ? "" : result.errors.join()).toMatch(/neuer als dieses Spiel/);
  });

  it("findet falsche Werte im Spielstand", () => {
    const tampered = { ...savedObject(createInitialState(1)), tick: -5, storage: { wood: 1.5 } };
    const result = deserializeGameState(JSON.stringify(tampered));
    expect(result.ok ? [] : result.errors).toEqual([
      "Spielstand → Feld „tick“: Muss mindestens 0 sein.",
      "Spielstand → Feld „storage“ → Feld „wood“: Erwartet eine ganze Zahl, gefunden die Zahl 1.5.",
    ]);
  });

  it("findet ein beschädigtes Kachel-Raster", () => {
    const saved = savedObject(createSmallWorldState());
    const world = saved.world as Record<string, unknown>;
    world.terrain = [0, 47]; // eine Kachel zu wenig (8 × 6 = 48)
    world.island = [0, 40, 300, 8]; // Inselnummer zu groß
    world.trees = [0, 48, 1]; // ungerade Länge
    const result = deserializeGameState(JSON.stringify(saved));
    expect(result.ok ? [] : result.errors).toEqual([
      "Spielstand → Feld „world“ → Feld „terrain“: Zu wenige Werte: 47 statt 48.",
      "Spielstand → Feld „world“ → Feld „island“: Paar 2: Der Wert 300 liegt nicht zwischen 0 und 255.",
      "Spielstand → Feld „world“ → Feld „trees“: Die Liste muss aus Paaren (Wert, Anzahl) bestehen, hat aber eine ungerade Länge.",
    ]);
  });

  it("lehnt zu große Karten und zu viele Inseln ab", () => {
    const saved = savedObject(createInitialState(1));
    (saved.world as Record<string, unknown>).width = 5000;
    saved.islands = Array.from({ length: 256 }, (_, index) => ({
      id: (index % 255) + 1,
      fertilities: [],
      deposits: [],
    }));
    const result = deserializeGameState(JSON.stringify(saved));
    expect(result.ok ? [] : result.errors).toEqual([
      "Spielstand → Feld „world“ → Feld „width“: Darf höchstens 1024 sein.",
      "Spielstand → Feld „islands“: Darf höchstens 255 Einträge haben.",
    ]);
  });
});
