/**
 * Das Spielstand-Format: Spielzustand → Text und zurück.
 * Das eigentliche Ablegen im Browser-Speicher kommt in Phase 3 (Ordner app/).
 *
 * Beim Einlesen wird alles geprüft, denn ein Spielstand kann beschädigt oder zu alt sein.
 * Ältere Versionen werden Schritt für Schritt umgewandelt („Migration“).
 */
import * as z from "zod/mini";
import { checkWithSchema, type CheckResult } from "../data/validation";
import type { DeepReadonly } from "./readonly";
import { SAVE_VERSION, type GameState, type ReadonlyGameState } from "./state";

const uint32 = z.int().check(z.gte(0), z.lte(0xffff_ffff));
const randomStateSchema = z.tuple([uint32, uint32, uint32, uint32]);
const count = z.int().check(z.gte(0));
const entityId = z.int().check(z.gte(1));

const buildingStateSchema = z.strictObject({
  id: entityId,
  type: z.string(),
});

/** Prüfschema für den Spielzustand der aktuellen Version. */
const gameStateSchema = z.strictObject({
  saveVersion: z.literal(SAVE_VERSION),
  seed: uint32,
  random: z.strictObject({ world: randomStateSchema, events: randomStateSchema }),
  tick: count,
  nextEntityId: entityId,
  buildings: z.record(z.string(), buildingStateSchema),
  storage: z.record(z.string(), count),
});

/**
 * Form des Spielzustands laut Schema. Schema und `GameState` müssen zusammenpassen:
 * `serializeGameState` und `deserializeGameState` prüfen das beim Übersetzen in beide Richtungen.
 * Wird ein Feld nur an einer Stelle ergänzt, meldet TypeScript dort einen Fehler.
 */
type SchemaState = z.infer<typeof gameStateSchema>;

/**
 * Umwandlungen alter Spielstände: Eintrag n wandelt Version n in Version n + 1 um.
 * Noch leer, weil es erst ab Phase 3 gespeicherte Spielstände gibt.
 */
const MIGRATIONS: Readonly<
  Record<number, (old: Record<string, unknown>) => Record<string, unknown>>
> = {};

/** Name der Quelle in Fehlermeldungen. */
const SOURCE = "Spielstand";

/** Wandelt den Spielzustand in Text (JSON) um. */
export function serializeGameState(state: ReadonlyGameState): string {
  const checkedShape: DeepReadonly<SchemaState> = state;
  return JSON.stringify(checkedShape);
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

  return checkWithSchema(SOURCE, gameStateSchema, migrated);
}
