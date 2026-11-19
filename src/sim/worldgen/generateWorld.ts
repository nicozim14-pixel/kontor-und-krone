/**
 * Der Weltgenerator: macht aus einem Seed eine Inselwelt (Unterphase 2.3).
 *
 * Er arbeitet wie ein Bühnenbildner in sechs Schritten:
 * 1. Inseln planen: wie viele, wie groß, wo (islandPlan.ts)
 * 2. Umrisse zeichnen: unregelmäßige, geglättete Küsten (landShape.ts)
 * 3. Gelände und Höhen: Wasser, Strand, Ebene, Berge (terrainShaping.ts)
 * 4. Rohstoffvorkommen am Fuß der Berge (deposits.ts)
 * 5. Fruchtbarkeiten je Insel (fertilities.ts)
 * 6. Wälder auf den Ebenen (forests.ts)
 *
 * Alle Regeln und Häufigkeiten stehen in worldgen.json. Gewürfelt wird nur mit dem
 * Zufalls-Strom „world“ (core/random.ts): gleicher Seed, gleiche Welt, auf jedem Gerät.
 * Der Generator weiß nichts von der Grafik; die Darstellung liest nur das Ergebnis.
 */
import type { RandomState } from "../../core/random";
import type { GameData } from "../../data/gameData";
import { createEmptyWorld, type IslandState, type WorldState } from "../world";
import { placeDeposits } from "./deposits";
import { assignFertilities } from "./fertilities";
import { plantForests } from "./forests";
import { planIslands, type IslandPlan } from "./islandPlan";
import { shapeIslands } from "./landShape";
import { shapeTerrain } from "./terrainShaping";

/** Ergebnis des Generators: das Kachel-Raster und die Inseln. */
export interface GeneratedWorld {
  readonly world: WorldState;
  readonly islands: IslandState[];
  /** Größenklasse je Insel (Kennung aus worldgen.json), Insel n an Stelle n − 1; nur zur Anzeige */
  readonly sizeClasses: readonly string[];
}

/**
 * Erzeugt eine neue Inselwelt.
 * @param random Zufalls-Strom „world“ des Spielzustands; er rollt dabei weiter
 */
export function generateWorld(data: GameData, random: RandomState): GeneratedWorld {
  const rules = data.worldGen;
  const world = createEmptyWorld(rules.map.width, rules.map.height, data.terrainCode.deep_water);

  const plans = planIslands(rules, random);
  shapeIslands(world, plans, rules, random);
  const usable = renumberIslands(world, plans);
  const islands: IslandState[] = usable.map((plan) => ({
    id: plan.id,
    fertilities: [],
    deposits: [],
  }));

  const { ranges } = shapeTerrain(world, usable, rules, data, random);
  placeDeposits(world, islands, ranges, rules, data, random);
  assignFertilities(islands, rules, data, random);
  plantForests(world, rules, data, random);

  return { world, islands, sizeClasses: usable.map((plan) => plan.sizeClass) };
}

/**
 * Sorgt dafür, dass die Inselnummern lückenlos 1, 2, 3 … sind, auch wenn eine geplante Insel
 * beim Zeichnen ganz verschwunden ist (kommt praktisch nicht vor, wird aber abgefangen).
 */
function renumberIslands(world: WorldState, plans: readonly IslandPlan[]): IslandPlan[] {
  const landTiles = new Map<number, number>();
  for (const id of world.island) {
    if (id !== 0) {
      landTiles.set(id, (landTiles.get(id) ?? 0) + 1);
    }
  }
  const usable: IslandPlan[] = [];
  const newId = new Map<number, number>();
  for (const plan of plans) {
    if ((landTiles.get(plan.id) ?? 0) > 0) {
      newId.set(plan.id, usable.length + 1);
      usable.push({ ...plan, id: usable.length + 1 });
    }
  }
  if (usable.length !== plans.length) {
    for (let index = 0; index < world.island.length; index++) {
      const id = world.island[index] ?? 0;
      world.island[index] = id === 0 ? 0 : (newId.get(id) ?? 0);
    }
  }
  return usable;
}
