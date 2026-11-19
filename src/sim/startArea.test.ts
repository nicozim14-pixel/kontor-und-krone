import { describe, expect, it } from "vitest";
import { loadTestData } from "../data/testFixtures";
import { footprintTiles } from "./footprint";
import { createNewGame } from "./newGame";
import { findStartArea, largestIsland } from "./startArea";
import { createInitialState } from "./state";
import { FREE_TILE, NO_TREE } from "./world";

const data = loadTestData();

describe("Startplatz auf der größten Insel", () => {
  it("findet die Insel mit den meisten Land-Kacheln", () => {
    const { state } = createNewGame(1701, data);
    const sizes = state.islands.map(
      (island) => state.world.island.filter((id) => id === island.id).length,
    );
    expect(largestIsland(state)).toBe(sizes.indexOf(Math.max(...sizes)) + 1);
  });

  it("findet eine freie, flache Fläche ohne Bäume", () => {
    for (const seed of [1701, 42, 7]) {
      const { state } = createNewGame(seed, data);
      const area = findStartArea(state, data, 3, 3);
      expect(area).toBeDefined();
      if (area === undefined) {
        return;
      }
      const islandId = largestIsland(state);
      for (const tile of footprintTiles(area)) {
        const index = tile.y * state.world.width + tile.x;
        expect(state.world.island[index]).toBe(islandId);
        expect(state.world.terrain[index]).toBe(data.terrainCode.plain);
        expect(state.world.trees[index]).toBe(NO_TREE);
        expect(state.world.occupancy[index]).toBe(FREE_TILE);
      }
    }
  });

  it("meldet „keine Fläche“, wenn es keine Insel gibt", () => {
    const state = createInitialState(1);
    expect(largestIsland(state)).toBe(0);
    expect(findStartArea(state, data, 3, 3)).toBeUndefined();
  });
});
