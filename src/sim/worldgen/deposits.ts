/**
 * Schritt 4 des Weltgenerators: Rohstoffvorkommen in den Bergen.
 *
 * Jedes Gebirge bekommt Vorkommen (Anzahl aus worldgen.json) am Fuß des Berges, also auf einer
 * Berg-Kachel direkt neben einer Ebene: Dort kann später eine Mine stehen.
 * Welcher Rohstoff es wird, entscheidet ein gewichteter Würfel (Eisenerz häufig, Gold selten).
 * Auf einer Insel kommt jeder Rohstoff höchstens einmal vor, solange noch andere frei sind.
 * Zum Schluss wird nachgebessert, damit jeder Rohstoff irgendwo auf der Karte vorkommt
 * (sofern es genug Gebirge gibt).
 */
import { nextFloat, nextInt, type RandomState } from "../../core/random";
import type { GameData } from "../../data/gameData";
import type { ResourceId, WorldGenRules } from "../../data/schemas";
import type { DepositState, IslandState, WorldState } from "../world";
import type { MountainRange } from "./terrainShaping";

/** Zwei Vorkommen liegen mindestens so weit auseinander (in Kacheln). */
const MIN_DEPOSIT_SPACING = 4;

export function placeDeposits(
  world: WorldState,
  islands: readonly IslandState[],
  ranges: readonly MountainRange[],
  rules: WorldGenRules,
  data: GameData,
  random: RandomState,
): void {
  const { width, height } = world;
  const plain = data.terrainCode.plain;
  const islandById = new Map(islands.map((island) => [island.id, island]));

  for (const range of ranges) {
    const island = islandById.get(range.islandId);
    if (island === undefined) {
      continue;
    }
    // Fuß des Berges: Berg-Kacheln mit einer Ebene als direktem Nachbarn
    const foot = range.tiles.filter((index) => {
      const x = index % width;
      const y = (index - x) / width;
      return [
        [x - 1, y],
        [x + 1, y],
        [x, y - 1],
        [x, y + 1],
      ].some(
        ([nx = -1, ny = -1]) =>
          nx >= 0 &&
          ny >= 0 &&
          nx < width &&
          ny < height &&
          world.terrain[ny * width + nx] === plain,
      );
    });
    const wanted = nextInt(random, rules.depositsPerRange.min, rules.depositsPerRange.max);
    for (let n = 0; n < wanted; n++) {
      const free = foot.filter((index) => {
        const x = index % width;
        const y = (index - x) / width;
        return island.deposits.every(
          (deposit) =>
            Math.max(Math.abs(deposit.x - x), Math.abs(deposit.y - y)) >= MIN_DEPOSIT_SPACING,
        );
      });
      if (free.length === 0) {
        break;
      }
      const index = free[nextInt(random, 0, free.length - 1)] ?? 0;
      const x = index % width;
      island.deposits.push({
        resource: pickResource(rules, island, random),
        x,
        y: (index - x) / width,
      });
    }
  }

  ensureEveryResource(islands, rules);
  for (const island of islands) {
    island.deposits.sort((a, b) => a.y - b.y || a.x - b.x);
  }
}

/** Gewichteter Würfel; Rohstoffe, die die Insel schon hat, nur wenn nichts anderes übrig ist. */
function pickResource(rules: WorldGenRules, island: IslandState, random: RandomState): ResourceId {
  const present = new Set(island.deposits.map((deposit) => deposit.resource));
  const fresh = rules.deposits.filter((entry) => !present.has(entry.resource));
  const choices = fresh.length > 0 ? fresh : rules.deposits;
  const total = choices.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = nextFloat(random) * total;
  for (const entry of choices) {
    roll -= entry.weight;
    if (roll < 0) {
      return entry.resource;
    }
  }
  return choices[choices.length - 1]?.resource ?? "";
}

/**
 * Nachbesserung: Fehlt ein Rohstoff ganz, wird ein mehrfach vorhandener Rohstoff ersetzt
 * (auf einer Insel, die den fehlenden noch nicht hat). So gibt es z. B. immer Gold irgendwo.
 */
function ensureEveryResource(islands: readonly IslandState[], rules: WorldGenRules): void {
  const all: { island: IslandState; deposit: DepositState }[] = islands.flatMap((island) =>
    island.deposits.map((deposit) => ({ island, deposit })),
  );
  const countOf = (resource: ResourceId): number =>
    all.filter((entry) => entry.deposit.resource === resource).length;

  for (const { resource: missing } of rules.deposits) {
    if (countOf(missing) > 0) {
      continue;
    }
    // Häufigster Rohstoff zuerst ersetzen, bei Gleichstand der erste in der Liste
    const candidates = all
      .filter(
        (entry) =>
          countOf(entry.deposit.resource) > 1 &&
          entry.island.deposits.every((deposit) => deposit.resource !== missing),
      )
      .sort((a, b) => countOf(b.deposit.resource) - countOf(a.deposit.resource));
    const chosen = candidates[0];
    if (chosen !== undefined) {
      chosen.deposit.resource = missing;
    }
  }
}
