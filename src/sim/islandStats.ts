/**
 * Kennzahlen der Inseln: Größe (Land-Kacheln) und Schwerpunkt (Mitte der Landfläche).
 * Gebraucht für den Startplatz und die Debug-Anzeige (Insel-Beschriftungen).
 */
import type { ReadonlyGameState } from "./state";
import { NO_ISLAND } from "./world";

export interface IslandStats {
  /** Inselnummer */
  readonly id: number;
  /** Anzahl der Land-Kacheln */
  readonly landTiles: number;
  /** Schwerpunkt der Landfläche in Kacheln (Kommazahlen) */
  readonly centerX: number;
  readonly centerY: number;
}

/** Misst alle Inseln; Insel n steht an Stelle n − 1. */
export function measureIslands(state: ReadonlyGameState): IslandStats[] {
  const { world } = state;
  const sums = state.islands.map(() => ({ tiles: 0, x: 0, y: 0 }));
  for (let index = 0; index < world.island.length; index++) {
    const id = world.island[index] ?? NO_ISLAND;
    const sum = sums[id - 1];
    if (id !== NO_ISLAND && sum !== undefined) {
      const x = index % world.width;
      sum.tiles += 1;
      sum.x += x;
      sum.y += (index - x) / world.width;
    }
  }
  return state.islands.map((island, i) => {
    const sum = sums[i] ?? { tiles: 0, x: 0, y: 0 };
    const tiles = Math.max(1, sum.tiles);
    return { id: island.id, landTiles: sum.tiles, centerX: sum.x / tiles, centerY: sum.y / tiles };
  });
}
