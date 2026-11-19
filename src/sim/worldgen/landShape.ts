/**
 * Schritt 2 des Weltgenerators: die Umrisse der Inseln.
 *
 * Jede Insel beginnt als Kreis um ihren Mittelpunkt. Zwei Rauschfelder (noise.ts) verbeulen
 * den Rand: ein grobes für Ausbuchtungen und Landzungen, ein feines für kleine Buchten.
 * Danach wird die Küste geglättet (einzelne Zacken verschwinden), nur das größte
 * zusammenhängende Landstück bleibt, und Seen im Inneren werden aufgefüllt
 * (Seen gibt es vorerst nicht, das vereinfacht das Bauen).
 *
 * Ergebnis: In der Ebene `island` steht für jede Land-Kachel die Inselnummer, sonst 0.
 */
import { nextUint32, type RandomState } from "../../core/random";
import type { WorldGenRules } from "../../data/schemas";
import { NO_ISLAND, type WorldState } from "../world";
import type { IslandPlan } from "./islandPlan";
import { createFractalNoise } from "./noise";

/** Rechteck aus Kacheln, in dem eine Insel liegt (beide Grenzen einschließlich). */
interface TileBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

/** Das Rechteck um eine geplante Insel, auf die Karte begrenzt. */
export function islandBox(plan: IslandPlan, world: WorldState, padding = 0): TileBox {
  const reach = Math.ceil(plan.radius) + padding;
  return {
    minX: Math.max(0, plan.centerX - reach),
    minY: Math.max(0, plan.centerY - reach),
    maxX: Math.min(world.width - 1, plan.centerX + reach),
    maxY: Math.min(world.height - 1, plan.centerY + reach),
  };
}

/** Zeichnet die Umrisse aller geplanten Inseln in die Ebene `island`. */
export function shapeIslands(
  world: WorldState,
  plans: readonly IslandPlan[],
  rules: WorldGenRules,
  random: RandomState,
): void {
  for (const plan of plans) {
    const coastNoise = createFractalNoise(nextUint32(random), Math.max(8, plan.radius * 0.7), 2);
    const bayNoise = createFractalNoise(nextUint32(random), 7, 2);
    drawOutline(world, plan, rules, (x, y) => {
      return rules.coast.roughness * coastNoise(x, y) + rules.coast.bayStrength * bayNoise(x, y);
    });
    smoothCoast(world, plan);
    keepLargestPiece(world, plan);
    fillLakes(world, plan);
  }
}

/** Erster Umriss: verbeulter Kreis, der nie über den geplanten Radius hinausragt. */
function drawOutline(
  world: WorldState,
  plan: IslandPlan,
  rules: WorldGenRules,
  wobble: (x: number, y: number) => number,
): void {
  const outer = plan.radius;
  // Grundradius so, dass auch kräftige Ausbuchtungen noch in den geplanten Radius passen
  const base = outer / (1 + 0.5 * (rules.coast.roughness + rules.coast.bayStrength));
  const box = islandBox(plan, world);
  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const distance = Math.sqrt((x - plan.centerX) ** 2 + (y - plan.centerY) ** 2);
      if (distance >= outer) {
        continue;
      }
      // Außerhalb des Grundradius wird die Verbeulung zum Rand hin schwächer: kein harter Schnitt
      const taper = distance <= base ? 1 : (outer - distance) / (outer - base);
      const land = 1 - distance / base + wobble(x, y) * taper;
      if (land > 0) {
        world.island[y * world.width + x] = plan.id;
      }
    }
  }
}

/** Glättet die Küste: Kacheln mit überwiegend Land ringsum werden Land, sonst Wasser. */
function smoothCoast(world: WorldState, plan: IslandPlan): void {
  const box = islandBox(plan, world, 1);
  const boxWidth = box.maxX - box.minX + 1;
  const next = new Uint8Array(boxWidth * (box.maxY - box.minY + 1));
  const isLand = (x: number, y: number): boolean =>
    x >= 0 &&
    y >= 0 &&
    x < world.width &&
    y < world.height &&
    world.island[y * world.width + x] === plan.id;

  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      let neighbours = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if ((dx !== 0 || dy !== 0) && isLand(x + dx, y + dy)) {
            neighbours += 1;
          }
        }
      }
      const land = isLand(x, y);
      next[(y - box.minY) * boxWidth + (x - box.minX)] =
        neighbours >= 5 || (land && neighbours >= 3) ? 1 : 0;
    }
  }
  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const index = y * world.width + x;
      const current = world.island[index] ?? NO_ISLAND;
      if (current !== NO_ISLAND && current !== plan.id) {
        continue; // gehört zu einer anderen Insel (kommt wegen des Abstands praktisch nie vor)
      }
      world.island[index] = next[(y - box.minY) * boxWidth + (x - box.minX)] === 1 ? plan.id : 0;
    }
  }
}

/** Alle Kacheln eines zusammenhängenden Gebiets (Nachbarn nur gerade, nicht schräg). */
function floodFill(
  world: WorldState,
  box: TileBox,
  start: number,
  belongs: (index: number) => boolean,
  visited: Uint8Array,
): number[] {
  const piece: number[] = [];
  const stack = [start];
  visited[start] = 1;
  while (stack.length > 0) {
    const index = stack.pop() ?? 0;
    piece.push(index);
    const x = index % world.width;
    const y = (index - x) / world.width;
    const neighbours = [
      x > box.minX ? index - 1 : -1,
      x < box.maxX ? index + 1 : -1,
      y > box.minY ? index - world.width : -1,
      y < box.maxY ? index + world.width : -1,
    ];
    for (const next of neighbours) {
      if (next >= 0 && visited[next] !== 1 && belongs(next)) {
        visited[next] = 1;
        stack.push(next);
      }
    }
  }
  return piece;
}

/** Entfernt kleine abgetrennte Landstücke; nur das größte bleibt als Insel. */
function keepLargestPiece(world: WorldState, plan: IslandPlan): void {
  const box = islandBox(plan, world);
  const visited = new Uint8Array(world.width * world.height);
  const isThisIsland = (index: number): boolean => world.island[index] === plan.id;
  let largest: number[] = [];
  const pieces: number[][] = [];
  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const index = y * world.width + x;
      if (isThisIsland(index) && visited[index] !== 1) {
        const piece = floodFill(world, box, index, isThisIsland, visited);
        pieces.push(piece);
        if (piece.length > largest.length) {
          largest = piece;
        }
      }
    }
  }
  for (const piece of pieces) {
    if (piece !== largest) {
      for (const index of piece) {
        world.island[index] = NO_ISLAND;
      }
    }
  }
}

/** Füllt Wasser auf, das ganz von der Insel umschlossen ist (Seen). */
function fillLakes(world: WorldState, plan: IslandPlan): void {
  const box = islandBox(plan, world, 1);
  const visited = new Uint8Array(world.width * world.height);
  const isOpenWater = (index: number): boolean => world.island[index] !== plan.id;
  // Alles Wasser, das vom Rand des Rechtecks aus erreichbar ist, ist offenes Meer.
  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const onEdge = x === box.minX || x === box.maxX || y === box.minY || y === box.maxY;
      const index = y * world.width + x;
      if (onEdge && isOpenWater(index) && visited[index] !== 1) {
        floodFill(world, box, index, isOpenWater, visited);
      }
    }
  }
  for (let y = box.minY; y <= box.maxY; y++) {
    for (let x = box.minX; x <= box.maxX; x++) {
      const index = y * world.width + x;
      if (visited[index] !== 1 && world.island[index] === NO_ISLAND) {
        world.island[index] = plan.id;
      }
    }
  }
}
