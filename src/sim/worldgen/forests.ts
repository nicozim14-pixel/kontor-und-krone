/**
 * Schritt 6 des Weltgenerators: Wälder (E-024).
 *
 * Ein Rauschfeld bestimmt Waldgebiete auf den Ebenen: Die „höchsten“ Stellen des Feldes werden
 * Wald, und zwar genau so viel, dass der gewünschte Anteil der Ebene (z. B. 35 %) bewaldet ist.
 * Im Wald steht auf den meisten Kacheln ein Baum, außerhalb nur hier und da ein einzelner.
 * Bäume wachsen nur auf Ebenen (nicht auf Strand, Berg oder Wasser).
 */
import { nextFloat, nextUint32, type RandomState } from "../../core/random";
import type { GameData } from "../../data/gameData";
import type { WorldGenRules } from "../../data/schemas";
import { NO_TREE, TREE, type WorldState } from "../world";
import { createFractalNoise } from "./noise";

/** Größe der Waldgebiete in Kacheln. */
const FOREST_SCALE = 14;

export function plantForests(
  world: WorldState,
  rules: WorldGenRules,
  data: GameData,
  random: RandomState,
): void {
  const { width } = world;
  const plain = data.terrainCode.plain;
  const field = createFractalNoise(nextUint32(random), FOREST_SCALE, 3);

  const plainTiles: number[] = [];
  for (let index = 0; index < world.terrain.length; index++) {
    world.trees[index] = NO_TREE;
    if (world.terrain[index] === plain) {
      plainTiles.push(index);
    }
  }
  const values = new Float32Array(plainTiles.length);
  plainTiles.forEach((index, i) => {
    const x = index % width;
    values[i] = field(x, (index - x) / width);
  });

  // Schwelle so wählen, dass genau der gewünschte Anteil der Ebene Waldgebiet ist
  const sorted = Float32Array.from(values).sort();
  const cut = Math.floor(sorted.length * (1 - rules.forests.coverage));
  const threshold = cut >= sorted.length ? Number.POSITIVE_INFINITY : (sorted[cut] ?? 0);

  plainTiles.forEach((index, i) => {
    const inForest = (values[i] ?? 0) >= threshold;
    const chance = inForest ? rules.forests.density : rules.forests.scatter;
    if (nextFloat(random) < chance) {
      world.trees[index] = TREE;
    }
  });
}
