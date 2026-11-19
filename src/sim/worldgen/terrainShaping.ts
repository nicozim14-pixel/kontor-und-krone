/**
 * Schritt 3 des Weltgenerators: Gelände und Höhen.
 *
 * - Wasser nahe der Küste wird Flachwasser, weiter draußen tiefes Wasser.
 * - Land direkt an der Küste wird Strand (1–3 Kacheln breit), der Rest Ebene.
 * - Auf den Ebenen entstehen Gebirge: mehrere runde Kuppen in einer Reihe. Eine Kuppe, nach der
 *   zu wenig bebaubare Ebene übrig bliebe, wird wieder entfernt; das Gebirge endet dann dort.
 * - Höhen: Ebenen sind ganz flach (E-023), Strände fallen sanft ins Wasser, der Meeresboden
 *   sinkt nach draußen ab, Berge steigen weich zu ihrem Gipfel an.
 */
import { nextFloat, nextInt, nextUint32, type RandomState } from "../../core/random";
import type { GameData } from "../../data/gameData";
import type { WorldGenRules } from "../../data/schemas";
import { NO_ISLAND, type WorldState } from "../world";
import { metersToElevation } from "../worldSpace";
import { distanceToSources } from "./distance";
import type { IslandPlan } from "./islandPlan";
import { createFractalNoise, smoothstep } from "./noise";

/** Ein Gebirge: welche Kacheln dazugehören und zu welcher Insel. */
export interface MountainRange {
  readonly islandId: number;
  /** Stellen der Kacheln in den Zahlenfeldern (world.ts) */
  readonly tiles: readonly number[];
}

/** Abstände, die auch spätere Schritte brauchen. */
export interface ShapedTerrain {
  readonly ranges: readonly MountainRange[];
  /** Abstand jeder Land-Kachel zum nächsten Wasser in Kacheln */
  readonly distanceToWater: Float32Array;
}

/** Berge halten mindestens so viele Kacheln Abstand zum Wasser (Platz für Strand und Weg). */
const MOUNTAIN_COAST_CLEARANCE = 3;

/** Ein Gebirge mit weniger Kacheln wird verworfen (sähe aus wie ein Krümel). */
const MIN_RANGE_TILES = 6;

/** Wie tief der Meeresboden direkt an der Küste und weit draußen liegt (Meter). */
const COAST_DEPTH = -0.3;
const DEEP_SEA_DEPTH = -4;

/** Acht Himmelsrichtungen als Schritt-Längen (fest eingetragen statt mit Winkelfunktionen). */
const DIAGONAL = Math.SQRT1_2;
const DIRECTIONS: readonly (readonly [number, number])[] = [
  [1, 0],
  [DIAGONAL, DIAGONAL],
  [0, 1],
  [-DIAGONAL, DIAGONAL],
  [-1, 0],
  [-DIAGONAL, -DIAGONAL],
  [0, -1],
  [DIAGONAL, -DIAGONAL],
];

export function shapeTerrain(
  world: WorldState,
  plans: readonly IslandPlan[],
  rules: WorldGenRules,
  data: GameData,
  random: RandomState,
): ShapedTerrain {
  const { width, height } = world;
  const count = width * height;
  const codes = data.terrainCode;

  const isWater = new Uint8Array(count);
  const isLand = new Uint8Array(count);
  for (let index = 0; index < count; index++) {
    const land = world.island[index] !== NO_ISLAND;
    isLand[index] = land ? 1 : 0;
    isWater[index] = land ? 0 : 1;
  }
  const distanceToWater = distanceToSources(width, height, isWater);
  const distanceToLand = distanceToSources(width, height, isLand);

  // ── Wasser, Strand, Ebene ──
  const beachNoise = createFractalNoise(nextUint32(random), 10, 2);
  const beachWidth = new Float32Array(count);
  const { min: beachMin, max: beachMax } = rules.coast.beachWidth;
  for (let index = 0; index < count; index++) {
    if (isWater[index] === 1) {
      world.terrain[index] =
        (distanceToLand[index] ?? 0) <= rules.coast.shallowWaterWidth
          ? codes.shallow_water
          : codes.deep_water;
      continue;
    }
    const x = index % width;
    const y = (index - x) / width;
    const widthHere = beachMin + ((beachMax - beachMin) * (beachNoise(x, y) + 1)) / 2;
    beachWidth[index] = widthHere;
    world.terrain[index] =
      (distanceToWater[index] ?? 0) < widthHere + 0.5 ? codes.beach : codes.plain;
  }

  // ── Gebirge ──
  const rangeOf = new Int16Array(count).fill(-1);
  const ranges: MountainRange[] = [];
  const shapeNoise = createFractalNoise(nextUint32(random), 5, 2);
  for (const plan of plans) {
    let landTiles = 0;
    let plainTiles = 0;
    for (let index = 0; index < count; index++) {
      if (world.island[index] === plan.id) {
        landTiles += 1;
        if (world.terrain[index] === codes.plain) {
          plainTiles += 1;
        }
      }
    }
    for (let r = 0; r < plan.mountainRanges; r++) {
      // So viele Kacheln dürfen noch Berg werden, ohne die Mindest-Baufläche zu unterschreiten
      const budget = plainTiles - Math.ceil(rules.minBuildableShare * landTiles);
      const tiles = raiseRange(
        world,
        plan,
        rules,
        codes,
        distanceToWater,
        random,
        shapeNoise,
        budget,
      );
      if (tiles.length < MIN_RANGE_TILES) {
        // Zu klein (sähe aus wie ein Krümel): wieder Ebene
        for (const index of tiles) {
          world.terrain[index] = codes.plain;
        }
        continue;
      }
      plainTiles -= tiles.length;
      for (const index of tiles) {
        rangeOf[index] = ranges.length;
      }
      ranges.push({ islandId: plan.id, tiles });
    }
  }

  // ── Höhen ──
  const notMountain = new Uint8Array(count);
  for (let index = 0; index < count; index++) {
    notMountain[index] = world.terrain[index] === codes.mountain ? 0 : 1;
  }
  const depthIntoMountain = distanceToSources(width, height, notMountain);
  const bumpNoise = createFractalNoise(nextUint32(random), 4, 2);
  const peaks = ranges.map((range) => {
    let deepest = 1;
    for (const index of range.tiles) {
      deepest = Math.max(deepest, depthIntoMountain[index] ?? 1);
    }
    const peak =
      rules.mountains.peakHeight.min +
      nextFloat(random) * (rules.mountains.peakHeight.max - rules.mountains.peakHeight.min);
    return { deepest, peak };
  });

  for (let index = 0; index < count; index++) {
    let meters: number;
    if (isWater[index] === 1) {
      const fromCoast = smoothstep(
        0.5,
        rules.coast.shallowWaterWidth + 2.5,
        distanceToLand[index] ?? 0,
      );
      meters = COAST_DEPTH + (DEEP_SEA_DEPTH - COAST_DEPTH) * fromCoast;
    } else if (world.terrain[index] === codes.beach) {
      const rise = ((distanceToWater[index] ?? 0) - 0.5) / ((beachWidth[index] ?? beachMin) + 0.5);
      meters = rules.plainHeight * Math.min(0.9, Math.max(0.15, rise));
    } else if (world.terrain[index] === codes.mountain) {
      const range = peaks[rangeOf[index] ?? -1] ?? { deepest: 1, peak: 0 };
      const x = index % width;
      const y = (index - x) / width;
      const shape = smoothstep(0, range.deepest, depthIntoMountain[index] ?? 0);
      meters = rules.plainHeight + range.peak * shape * (1 + 0.12 * bumpNoise(x, y));
    } else {
      meters = rules.plainHeight;
    }
    world.elevation[index] = metersToElevation(meters);
  }

  return { ranges, distanceToWater };
}

/**
 * Hebt ein Gebirge aus mehreren Kuppen in einer Reihe an.
 * @param budget höchstens so viele Kacheln dürfen Berg werden
 * @returns die Kacheln, die jetzt Berg sind (leer, wenn kein Platz war)
 */
function raiseRange(
  world: WorldState,
  plan: IslandPlan,
  rules: WorldGenRules,
  codes: Readonly<Record<"plain" | "mountain", number>>,
  distanceToWater: Float32Array,
  random: RandomState,
  noise: (x: number, y: number) => number,
  budget: number,
): number[] {
  const { width } = world;
  const plainCode = codes.plain;
  const starts: number[] = [];
  for (let index = 0; index < world.island.length; index++) {
    if (
      world.island[index] === plan.id &&
      world.terrain[index] === plainCode &&
      (distanceToWater[index] ?? 0) >= rules.mountains.minCoastDistance
    ) {
      starts.push(index);
    }
  }
  if (starts.length === 0) {
    return [];
  }
  const start = starts[nextInt(random, 0, starts.length - 1)] ?? 0;
  const direction = DIRECTIONS[nextInt(random, 0, DIRECTIONS.length - 1)] ?? [1, 0];
  const blobs = nextInt(
    random,
    rules.mountains.blobsPerRange.min,
    rules.mountains.blobsPerRange.max,
  );

  const raised: number[] = [];
  if (budget <= 0) {
    return raised;
  }
  let centerX = start % width;
  let centerY = (start - centerX) / width;
  for (let blob = 0; blob < blobs; blob++) {
    // Kleine Inseln bekommen kleinere Kuppen (höchstens ein Fünftel des Inselradius)
    const radius = Math.min(
      nextInt(random, rules.mountains.blobRadius.min, rules.mountains.blobRadius.max),
      Math.max(2, Math.round(plan.radius * 0.2)),
    );
    if (blob > 0) {
      centerX = Math.round(centerX + direction[0] * radius * 1.3);
      centerY = Math.round(centerY + direction[1] * radius * 1.3);
    }
    const centerIndex = centerY * width + centerX;
    if (
      centerX < 0 ||
      centerY < 0 ||
      centerX >= width ||
      centerY >= world.height ||
      world.island[centerIndex] !== plan.id ||
      (distanceToWater[centerIndex] ?? 0) < MOUNTAIN_COAST_CLEARANCE + 1
    ) {
      break;
    }
    const reach = radius + 2;
    const blobStart = raised.length;
    for (let y = centerY - reach; y <= centerY + reach; y++) {
      for (let x = centerX - reach; x <= centerX + reach; x++) {
        if (x < 0 || y < 0 || x >= width || y >= world.height) {
          continue;
        }
        const index = y * width + x;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (
          distance <= radius * (1 + 0.3 * noise(x, y)) &&
          world.island[index] === plan.id &&
          world.terrain[index] === plainCode &&
          (distanceToWater[index] ?? 0) >= MOUNTAIN_COAST_CLEARANCE
        ) {
          world.terrain[index] = codes.mountain;
          raised.push(index);
        }
      }
    }
    if (raised.length > budget) {
      // Diese Kuppe wäre zu viel: zurücknehmen, das Gebirge endet hier.
      for (const index of raised.splice(blobStart)) {
        world.terrain[index] = codes.plain;
      }
      break;
    }
  }
  return raised;
}
