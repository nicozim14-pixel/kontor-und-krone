/**
 * Das Spielstand-Format: Spielzustand → Text und zurück.
 * Das eigentliche Ablegen im Browser-Speicher kommt in Phase 3 (Ordner app/).
 *
 * Beim Einlesen wird alles geprüft, denn ein Spielstand kann beschädigt oder zu alt sein.
 * Ältere Versionen werden Schritt für Schritt umgewandelt („Migration“).
 *
 * Das Kachel-Raster (world.ts) besteht aus Zahlenfeldern. Im Text steht jede Ebene
 * lauflängen-kodiert (core/runLength.ts): „Wert, Anzahl, Wert, Anzahl …“. Das Meer aus
 * Tausenden gleicher Kacheln schrumpft so auf wenige Zahlen.
 */
import * as z from "zod/mini";
import { decodeRuns, encodeRuns } from "../core/runLength";
import { checkWithSchema, type CheckResult } from "../data/validation";
import type { DeepReadonly } from "./readonly";
import { SAVE_VERSION, type GameState, type ReadonlyGameState } from "./state";
import { MAX_ISLANDS, MAX_WORLD_EDGE, type WorldState } from "./world";

const uint32 = z.int().check(z.gte(0), z.lte(0xffff_ffff));
const randomStateSchema = z.tuple([uint32, uint32, uint32, uint32]);
const count = z.int().check(z.gte(0));
const entityId = z.int().check(z.gte(1));
const worldEdge = z.int().check(z.gte(0), z.lte(MAX_WORLD_EDGE));
/** Eine Ebene des Kachel-Rasters, lauflängen-kodiert: [Wert, Anzahl, Wert, Anzahl, …] */
const runsSchema = z.array(z.int());

const buildingStateSchema = z.strictObject({
  id: entityId,
  type: z.string(),
});

const worldSaveSchema = z.strictObject({
  width: worldEdge,
  height: worldEdge,
  terrain: runsSchema,
  elevation: runsSchema,
  island: runsSchema,
  trees: runsSchema,
  occupancy: runsSchema,
});

const islandStateSchema = z.strictObject({
  id: z.int().check(z.gte(1), z.lte(MAX_ISLANDS)),
  fertilities: z.array(z.string()),
  deposits: z.array(z.strictObject({ resource: z.string(), x: count, y: count })),
});

/** Prüfschema für den Spielstand der aktuellen Version (so, wie er als Text vorliegt). */
const saveSchema = z.strictObject({
  saveVersion: z.literal(SAVE_VERSION),
  seed: uint32,
  random: z.strictObject({ world: randomStateSchema, events: randomStateSchema }),
  world: worldSaveSchema,
  islands: z.array(islandStateSchema).check(z.maxLength(MAX_ISLANDS)),
  tick: count,
  nextEntityId: entityId,
  buildings: z.record(z.string(), buildingStateSchema),
  storage: z.record(z.string(), count),
});

/**
 * Form des Spielstands laut Schema. Er gleicht dem Spielzustand, nur das Kachel-Raster ist kodiert.
 * Beim Einlesen prüft TypeScript, dass aus dem Spielstand ein vollständiger `GameState` wird.
 * Ein Feld, das nur im Spielzustand ergänzt wurde, fällt beim Test „Text hin und zurück“ auf.
 */
type SaveData = z.infer<typeof saveSchema>;
type WorldSaveData = z.infer<typeof worldSaveSchema>;

/**
 * Umwandlungen alter Spielstände: Eintrag n wandelt Version n in Version n + 1 um.
 * Noch leer, weil es erst ab Phase 3 gespeicherte Spielstände gibt.
 */
const MIGRATIONS: Readonly<
  Record<number, (old: Record<string, unknown>) => Record<string, unknown>>
> = {};

/** Name der Quelle in Fehlermeldungen. */
const SOURCE = "Spielstand";

/** Kodiert das Kachel-Raster für den Spielstand. */
function encodeWorld(world: DeepReadonly<WorldState>): WorldSaveData {
  return {
    width: world.width,
    height: world.height,
    terrain: encodeRuns(world.terrain),
    elevation: encodeRuns(world.elevation),
    island: encodeRuns(world.island),
    trees: encodeRuns(world.trees),
    occupancy: encodeRuns(world.occupancy),
  };
}

/** Entpackt und prüft das Kachel-Raster aus dem Spielstand. */
function decodeWorld(saved: WorldSaveData): CheckResult<WorldState> {
  const tileCount = saved.width * saved.height;
  const errors: string[] = [];
  /** Entpackt eine Ebene in `target`; Fehler landen in `errors`. */
  const decode = <T extends Uint8Array | Int32Array>(
    layer: Exclude<keyof WorldSaveData, "width" | "height">,
    target: T,
    min: number,
    max: number,
  ): T => {
    const problem = decodeRuns(saved[layer], target, min, max);
    if (problem !== undefined) {
      errors.push(`${SOURCE} → Feld „world“ → Feld „${layer}“: ${problem}`);
    }
    return target;
  };
  const world: WorldState = {
    width: saved.width,
    height: saved.height,
    terrain: decode("terrain", new Uint8Array(tileCount), 0, 0xff),
    elevation: decode("elevation", new Uint8Array(tileCount), 0, 0xff),
    island: decode("island", new Uint8Array(tileCount), 0, MAX_ISLANDS),
    trees: decode("trees", new Uint8Array(tileCount), 0, 0xff),
    occupancy: decode("occupancy", new Int32Array(tileCount), -0x8000_0000, 0x7fff_ffff),
  };
  return errors.length > 0 ? { ok: false, errors } : { ok: true, value: world };
}

/** Wandelt den Spielzustand in Text (JSON) um. */
export function serializeGameState(state: ReadonlyGameState): string {
  const { world, ...rest } = state;
  const saveData: DeepReadonly<SaveData> = { ...rest, world: encodeWorld(world) };
  return JSON.stringify(saveData);
}

/** Liest einen Spielstand aus Text, wandelt alte Versionen um und prüft das Ergebnis. */
export function deserializeGameState(text: string): CheckResult<GameState> {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, errors: [`${SOURCE}: Die Daten sind beschädigt (kein gültiges JSON).`] };
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return { ok: false, errors: [`${SOURCE}: Die Daten sind kein Spielstand.`] };
  }

  let migrated = data as Record<string, unknown>;
  const version = migrated.saveVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return { ok: false, errors: [`${SOURCE}: Die Versionsnummer fehlt oder ist ungültig.`] };
  }
  if (version > SAVE_VERSION) {
    return {
      ok: false,
      errors: [
        `${SOURCE}: Version ${String(version)} ist neuer als dieses Spiel (Version ${String(SAVE_VERSION)}). ` +
          "Bitte das Spiel neu laden, um die neueste Version zu bekommen.",
      ],
    };
  }
  for (let from = version; from < SAVE_VERSION; from++) {
    const migrate = MIGRATIONS[from];
    if (migrate === undefined) {
      return {
        ok: false,
        errors: [
          `${SOURCE}: Version ${String(from)} kann nicht umgewandelt werden (Umwandlung fehlt).`,
        ],
      };
    }
    migrated = { ...migrate(migrated), saveVersion: from + 1 };
  }

  const checked = checkWithSchema(SOURCE, saveSchema, migrated);
  if (!checked.ok) {
    return checked;
  }
  const { world: savedWorld, ...rest } = checked.value;
  const world = decodeWorld(savedWorld);
  if (!world.ok) {
    return world;
  }
  const state: GameState = { ...rest, world: world.value };
  return { ok: true, value: state };
}
