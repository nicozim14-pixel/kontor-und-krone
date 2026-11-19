/**
 * Ein guter Startplatz: eine freie, flache Fläche auf der größten Insel, möglichst in ihrer Mitte.
 *
 * Vorläufig (bis Unterphase 2.5) steht dort der Test-Holzfäller, und die Kamera schaut beim Start
 * dorthin. Später (Phase 3/7) kann hier z. B. das erste Kontor stehen.
 */
import type { GameData } from "../data/gameData";
import type { Footprint } from "./footprint";
import { measureIslands, type IslandStats } from "./islandStats";
import type { ReadonlyGameState } from "./state";
import { FREE_TILE, NO_ISLAND, NO_TREE } from "./world";

/** Die Insel mit den meisten Land-Kacheln (bei Gleichstand die mit der kleineren Nummer). */
function findLargest(state: ReadonlyGameState): IslandStats | undefined {
  let best: IslandStats | undefined;
  for (const island of measureIslands(state)) {
    if (best === undefined || island.landTiles > best.landTiles) {
      best = island;
    }
  }
  return best;
}

/** Die Inselnummer mit den meisten Land-Kacheln (oder 0, wenn es keine Insel gibt). */
export function largestIsland(state: ReadonlyGameState): number {
  return findLargest(state)?.id ?? NO_ISLAND;
}

/**
 * Sucht auf der größten Insel ein Rechteck aus freien Ebene-Kacheln ohne Bäume,
 * so nah wie möglich am Schwerpunkt der Insel.
 * @returns die Fläche oder `undefined`, wenn es keine gibt
 */
export function findStartArea(
  state: ReadonlyGameState,
  data: GameData,
  width: number,
  depth: number,
): Footprint | undefined {
  const { world } = state;
  const island = findLargest(state);
  if (island === undefined) {
    return undefined;
  }
  const isUsable = (x: number, y: number): boolean => {
    const index = y * world.width + x;
    return (
      world.island[index] === island.id &&
      world.terrain[index] === data.terrainCode.plain &&
      world.trees[index] === NO_TREE &&
      world.occupancy[index] === FREE_TILE
    );
  };

  let best: Footprint | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let y = 0; y + depth <= world.height; y++) {
    for (let x = 0; x + width <= world.width; x++) {
      const distance =
        (x + width / 2 - island.centerX) ** 2 + (y + depth / 2 - island.centerY) ** 2;
      if (distance >= bestDistance) {
        continue;
      }
      let fits = true;
      for (let dy = 0; dy < depth && fits; dy++) {
        for (let dx = 0; dx < width && fits; dx++) {
          fits = isUsable(x + dx, y + dy);
        }
      }
      if (fits) {
        best = { x, y, width, depth };
        bestDistance = distance;
      }
    }
  }
  return best;
}
