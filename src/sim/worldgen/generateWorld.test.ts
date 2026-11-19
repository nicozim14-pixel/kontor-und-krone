import { describe, expect, it } from "vitest";
import { createRandomState } from "../../core/random";
import type { GameData } from "../../data/gameData";
import { loadTestData } from "../../data/testFixtures";
import { createNewGame } from "../newGame";
import { deserializeGameState, serializeGameState } from "../save";
import type { GameState } from "../state";
import { NO_ISLAND, TREE } from "../world";
import { metersToElevation, SEA_LEVEL_CODE } from "../worldSpace";
import { distanceToSources } from "./distance";

const data = loadTestData();
const rules = data.worldGen;
const minIslands = rules.islandClasses.reduce((sum, entry) => sum + entry.count.min, 0);
const maxIslands = rules.islandClasses.reduce((sum, entry) => sum + entry.count.max, 0);

/** Seeds für die Regel-Prüfungen: Zahlen und Wörter, bunt gemischt. */
const SEEDS = [1701, 42, 7, 1, 2, 3, 99_999, 123_456, 4_000_000_000, 31_337, 8, 2026];

/** Alle Ebenen und Inseln einer Welt, zum Vergleichen. */
function snapshot(state: GameState) {
  const { world, islands } = state;
  return {
    terrain: Array.from(world.terrain),
    elevation: Array.from(world.elevation),
    island: Array.from(world.island),
    trees: Array.from(world.trees),
    islands,
  };
}

const neighbours4 = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/** Prüft alle Regeln für eine erzeugte Welt; gibt die gefundenen Verstöße zurück. */
function findRuleViolations(state: GameState, gameData: GameData): string[] {
  const { world, islands } = state;
  const codes = gameData.terrainCode;
  const problems: string[] = [];
  const { width, height } = world;
  const plainCode = metersToElevation(gameData.worldGen.plainHeight);

  if (islands.length < minIslands || islands.length > maxIslands) {
    problems.push(
      `${String(islands.length)} Inseln (erlaubt ${String(minIslands)}–${String(maxIslands)})`,
    );
  }
  islands.forEach((island, index) => {
    if (island.id !== index + 1) {
      problems.push(`Insel an Stelle ${String(index)} hat Nummer ${String(island.id)}`);
    }
  });

  const land = new Map<number, number>();
  const plain = new Map<number, number>();
  for (let index = 0; index < world.island.length; index++) {
    const id = world.island[index] ?? 0;
    const terrain = world.terrain[index] ?? -1;
    const elevation = world.elevation[index] ?? -1;
    const x = index % width;
    const y = (index - x) / width;
    if (id === NO_ISLAND) {
      if (terrain !== codes.shallow_water && terrain !== codes.deep_water) {
        problems.push(`Meer-Kachel ${String(x)}/${String(y)} ist kein Wasser`);
      }
      if (elevation >= SEA_LEVEL_CODE) {
        problems.push(`Wasser ${String(x)}/${String(y)} liegt nicht unter dem Meeresspiegel`);
      }
      if (world.trees[index] === TREE) {
        problems.push(`Baum im Wasser ${String(x)}/${String(y)}`);
      }
      continue;
    }
    land.set(id, (land.get(id) ?? 0) + 1);
    if (id > islands.length) {
      problems.push(`unbekannte Inselnummer ${String(id)}`);
    }
    if (terrain !== codes.beach && terrain !== codes.plain && terrain !== codes.mountain) {
      problems.push(`Land-Kachel ${String(x)}/${String(y)} hat Gelände ${String(terrain)}`);
    }
    if (elevation <= SEA_LEVEL_CODE) {
      problems.push(`Land ${String(x)}/${String(y)} liegt nicht über dem Meeresspiegel`);
    }
    const margin = gameData.worldGen.map.edgeMargin - 2;
    if (x < margin || y < margin || x >= width - margin || y >= height - margin) {
      problems.push(`Land ${String(x)}/${String(y)} zu nah am Kartenrand`);
    }
    if (terrain === codes.plain) {
      plain.set(id, (plain.get(id) ?? 0) + 1);
      if (elevation !== plainCode) {
        problems.push(`Ebene ${String(x)}/${String(y)} ist nicht flach`);
      }
    } else if (world.trees[index] === TREE) {
      problems.push(`Baum außerhalb der Ebene ${String(x)}/${String(y)}`);
    }
    if (terrain === codes.mountain && elevation <= plainCode) {
      problems.push(`Berg ${String(x)}/${String(y)} ist nicht höher als die Ebene`);
    }
    for (const [dx, dy] of neighbours4) {
      const nx = x + dx;
      const ny = y + dy;
      const neighbour = world.island[ny * width + nx] ?? NO_ISLAND;
      if (neighbour === NO_ISLAND && terrain !== codes.beach) {
        problems.push(`Küste ${String(x)}/${String(y)} ist kein Strand`);
      }
      if (neighbour !== NO_ISLAND && neighbour !== id) {
        problems.push(`Inseln ${String(id)} und ${String(neighbour)} berühren sich`);
      }
    }
  }

  for (const island of islands) {
    const landTiles = land.get(island.id) ?? 0;
    const plainTiles = plain.get(island.id) ?? 0;
    if (landTiles === 0) {
      problems.push(`Insel ${String(island.id)} hat kein Land`);
    }
    if (plainTiles / Math.max(1, landTiles) < gameData.worldGen.minBuildableShare) {
      problems.push(`Insel ${String(island.id)} hat zu wenig Baufläche`);
    }
    const { min, max } = gameData.worldGen.fertilitiesPerIsland;
    if (island.fertilities.length < min || island.fertilities.length > max) {
      problems.push(
        `Insel ${String(island.id)} hat ${String(island.fertilities.length)} Fruchtbarkeiten`,
      );
    }
    if (new Set(island.fertilities).size !== island.fertilities.length) {
      problems.push(`Insel ${String(island.id)} hat doppelte Fruchtbarkeiten`);
    }
    for (const fertility of island.fertilities) {
      if (!gameData.fertilities.has(fertility)) {
        problems.push(`unbekannte Fruchtbarkeit ${fertility}`);
      }
    }
    for (const deposit of island.deposits) {
      const index = deposit.y * width + deposit.x;
      if (!gameData.resources.has(deposit.resource)) {
        problems.push(`unbekannter Rohstoff ${deposit.resource}`);
      }
      if (world.island[index] !== island.id || world.terrain[index] !== codes.mountain) {
        problems.push(
          `Vorkommen ${String(deposit.x)}/${String(deposit.y)} liegt nicht im Berg der Insel`,
        );
      }
      const atFoot = neighbours4.some(
        ([dx, dy]) => world.terrain[(deposit.y + dy) * width + deposit.x + dx] === codes.plain,
      );
      if (!atFoot) {
        problems.push(
          `Vorkommen ${String(deposit.x)}/${String(deposit.y)} liegt nicht am Fuß des Berges`,
        );
      }
    }
  }
  return problems;
}

describe("Weltgenerator (Unterphase 2.3)", () => {
  it("gleicher Seed ergibt die gleiche Welt", () => {
    const first = createNewGame(1701, data).state;
    const second = createNewGame(1701, data).state;
    expect(snapshot(second)).toEqual(snapshot(first));
    expect(second.random.world).toEqual(first.random.world);
  });

  it("anderer Seed ergibt eine andere Welt", () => {
    const a = snapshot(createNewGame(1701, data).state);
    const b = snapshot(createNewGame(1702, data).state);
    expect(b.island).not.toEqual(a.island);
    expect(b.islands).not.toEqual(a.islands);
  });

  it("würfelt nur mit dem Zufalls-Strom „world“, der Strom „events“ bleibt unberührt", () => {
    const { state } = createNewGame(1701, data);
    expect(state.random.events).toEqual(createRandomState(1701, "events"));
    expect(state.random.world).not.toEqual(createRandomState(1701, "world"));
  });

  it("erzeugt eine Karte in der Größe aus worldgen.json (256 × 256 Kacheln)", () => {
    const { world } = createNewGame(1701, data).state;
    expect([world.width, world.height]).toEqual([rules.map.width, rules.map.height]);
  });

  it.each(SEEDS)("hält alle Regeln ein (Seed %s)", (seed) => {
    const { state } = createNewGame(seed, data);
    expect(findRuleViolations(state, data)).toEqual([]);
  });

  it("lässt zwischen den Inseln genug Wasser für Schiffe", () => {
    for (const seed of SEEDS.slice(0, 4)) {
      const { world, islands } = createNewGame(seed, data).state;
      for (const island of islands) {
        const own = Uint8Array.from(world.island, (id) => (id === island.id ? 1 : 0));
        const distance = distanceToSources(world.width, world.height, own);
        let closest = Number.POSITIVE_INFINITY;
        world.island.forEach((id, index) => {
          if (id !== NO_ISLAND && id !== island.id) {
            closest = Math.min(closest, distance[index] ?? 0);
          }
        });
        expect(closest).toBeGreaterThanOrEqual(rules.map.islandGap - 2);
      }
    }
  });

  it("verteilt die Fruchtbarkeiten so, dass keine Insel alles hat, aber alles irgendwo wächst", () => {
    for (const seed of SEEDS) {
      const { islands } = createNewGame(seed, data).state;
      const everywhere = new Set(islands.flatMap((island) => island.fertilities));
      expect(everywhere.size).toBe(data.fertilities.size);
      for (const island of islands) {
        expect(island.fertilities.length).toBeLessThan(data.fertilities.size);
      }
    }
  });

  it("legt Rohstoffvorkommen in die Berge, und jeder Rohstoff kommt irgendwo vor", () => {
    for (const seed of SEEDS) {
      const { islands } = createNewGame(seed, data).state;
      const deposits = islands.flatMap((island) => island.deposits);
      expect(deposits.length).toBeGreaterThanOrEqual(data.resources.size);
      expect(new Set(deposits.map((deposit) => deposit.resource)).size).toBe(data.resources.size);
    }
  });

  it("hat Inseln verschiedener Größe, Berge und Wälder", () => {
    const { state, islandSizeClasses } = createNewGame(1701, data);
    expect(new Set(islandSizeClasses)).toEqual(new Set(["large", "medium", "small"]));
    const mountains = state.world.terrain.filter((code) => code === data.terrainCode.mountain);
    const trees = state.world.trees.filter((tree) => tree === TREE);
    expect(mountains.length).toBeGreaterThan(200);
    expect(trees.length).toBeGreaterThan(1000);
  });

  it("baut keine Berge und keine Vorkommen, wenn die Regeln keine Gebirge vorsehen", () => {
    const flat = loadTestData({
      worldGen: {
        ...rules,
        islandClasses: rules.islandClasses.map((entry) => ({
          ...entry,
          mountainRanges: { min: 0, max: 0 },
        })),
      },
    });
    const { islands, world } = createNewGame(5, flat).state;
    expect(islands.every((island) => island.deposits.length === 0)).toBe(true);
    expect(world.terrain.includes(flat.terrainCode.mountain)).toBe(false);
  });

  it("lässt sich als Spielstand speichern und unverändert wieder einlesen", () => {
    const { state } = createNewGame(1701, data);
    const text = serializeGameState(state);
    const result = deserializeGameState(text);
    if (!result.ok) {
      throw new Error(result.errors.join("\n"));
    }
    expect(result.value).toEqual(state);
    // Lauflängen-Kodierung: deutlich kleiner als eine Zahl pro Kachel und Ebene
    expect(text.length).toBeLessThan(400_000);
  });

  it("ist schnell genug für das Ladezeit-Budget (erster Start ≤ 5 s)", () => {
    // eslint-disable-next-line no-restricted-globals -- Laufzeitmessung nur im Test
    const start = performance.now();
    const runs = 5;
    for (let seed = 0; seed < runs; seed++) {
      createNewGame(seed, data);
    }
    // eslint-disable-next-line no-restricted-globals -- Laufzeitmessung nur im Test
    const perWorld = (performance.now() - start) / runs;
    console.log(`Weltgenerator: ${perWorld.toFixed(0)} ms pro Welt`);
    // Großzügige Grenze, weil die Test-Rechner unterschiedlich schnell sind;
    // gemessen werden in der Cloud-Umgebung etwa 40–120 ms.
    expect(perWorld).toBeLessThan(1000);
  });
});
