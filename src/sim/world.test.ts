import { describe, expect, expectTypeOf, it } from "vitest";
import { createInitialState, type ReadonlyGameState } from "./state";
import {
  createEmptyWorld,
  FREE_TILE,
  isInsideWorld,
  MAX_WORLD_EDGE,
  NO_ISLAND,
  NO_TREE,
  tileAt,
  tileIndex,
} from "./world";
import { SEA_LEVEL_CODE } from "./worldSpace";

describe("Kachel-Raster der Welt", () => {
  it("legt pro Angabe ein Zahlenfeld mit einer Zahl pro Kachel an", () => {
    const world = createEmptyWorld(256, 256, 0);
    expect(world.width).toBe(256);
    expect(world.height).toBe(256);
    for (const layer of [world.terrain, world.elevation, world.island, world.trees]) {
      expect(layer).toBeInstanceOf(Uint8Array);
      expect(layer.length).toBe(65_536);
    }
    expect(world.occupancy).toBeInstanceOf(Int32Array);
    expect(world.occupancy.length).toBe(65_536);
  });

  it("ist sparsam: 256 × 256 Kacheln brauchen weniger als 1 MB", () => {
    const world = createEmptyWorld(256, 256, 0);
    const bytes =
      world.terrain.byteLength +
      world.elevation.byteLength +
      world.island.byteLength +
      world.trees.byteLength +
      world.occupancy.byteLength;
    expect(bytes).toBe(65_536 * 8);
    expect(bytes).toBeLessThan(1024 * 1024);
  });

  it("beginnt leer: überall dieselbe Geländeart, Meereshöhe, keine Insel, kein Baum, frei", () => {
    const world = createEmptyWorld(5, 4, 2);
    expect(Array.from(world.terrain)).toEqual(new Array(20).fill(2));
    expect(Array.from(world.elevation)).toEqual(new Array(20).fill(SEA_LEVEL_CODE));
    expect(Array.from(world.island)).toEqual(new Array(20).fill(NO_ISLAND));
    expect(Array.from(world.trees)).toEqual(new Array(20).fill(NO_TREE));
    expect(Array.from(world.occupancy)).toEqual(new Array(20).fill(FREE_TILE));
  });

  it("findet jede Kachel an genau einer Stelle, Zeile für Zeile von Süden nach Norden", () => {
    const world = createEmptyWorld(5, 4);
    expect(tileIndex(world, 0, 0)).toBe(0);
    expect(tileIndex(world, 4, 0)).toBe(4);
    expect(tileIndex(world, 0, 1)).toBe(5);
    expect(tileIndex(world, 4, 3)).toBe(19);
    const seen = new Set<number>();
    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const index = tileIndex(world, x, y);
        seen.add(index);
        expect(tileAt(world, index)).toEqual({ x, y });
      }
    }
    expect(seen.size).toBe(20);
  });

  it("erkennt Kacheln außerhalb der Karte", () => {
    const world = createEmptyWorld(5, 4);
    expect(isInsideWorld(world, 0, 0)).toBe(true);
    expect(isInsideWorld(world, 4, 3)).toBe(true);
    expect(isInsideWorld(world, 5, 0)).toBe(false);
    expect(isInsideWorld(world, 0, 4)).toBe(false);
    expect(isInsideWorld(world, -1, 2)).toBe(false);
    expect(isInsideWorld(world, 1.5, 2)).toBe(false);
  });

  it("lehnt unsinnige Kartengrößen ab", () => {
    expect(() => createEmptyWorld(-1, 4)).toThrow("Ungültige Breite der Welt: -1");
    expect(() => createEmptyWorld(4, MAX_WORLD_EDGE + 1)).toThrow("Ungültige Höhe der Welt");
    expect(() => createEmptyWorld(2.5, 4)).toThrow(RangeError);
  });

  it("gehört zum Spielzustand und ist für Darstellung und Oberfläche schreibgeschützt", () => {
    const state: ReadonlyGameState = createInitialState(1, createEmptyWorld(3, 3));
    expect(state.world.terrain[4]).toBe(0);
    // @ts-expect-error Die Darstellung darf das Kachel-Raster nicht ändern.
    state.world.terrain[4] = 3;
    /* eslint-disable @typescript-eslint/no-unsafe-call -- absichtlich gesperrter Aufruf */
    // @ts-expect-error Auch Zahlenfeld-Funktionen zum Ändern sind gesperrt.
    state.world.trees.fill(1);
    /* eslint-enable @typescript-eslint/no-unsafe-call */
    expectTypeOf(state.world.occupancy[0]).toEqualTypeOf<number | undefined>();
  });
});
