/**
 * Der Daten-Lader: prüft alle Spieldaten-Dateien und macht daraus nachschlagbare Tabellen.
 *
 * Ablauf: 1. jede Datei mit ihrem Schema prüfen, 2. doppelte Kennungen suchen,
 * 3. Querverweise prüfen, z. B. ob die Ware, die ein Gebäude herstellt, in goods.json steht.
 * Alle Fehler werden gesammelt und zusammen gemeldet, nicht nur der erste.
 */
import type * as z from "zod/mini";
import {
  buildingsFileSchema,
  fertilitiesFileSchema,
  goodsFileSchema,
  MAX_TERRAIN_TYPES,
  REQUIRED_TERRAIN_IDS,
  resourcesFileSchema,
  terrainFileSchema,
  type BuildingDefinition,
  type BuildingTypeId,
  type FertilityDefinition,
  type FertilityId,
  type GoodDefinition,
  type GoodId,
  type RequiredTerrainId,
  type ResourceDefinition,
  type ResourceId,
  type TerrainDefinition,
  type TerrainId,
} from "./schemas";
import { checkWithSchema, findDuplicateIds, type CheckResult } from "./validation";

/** Inhalt der Datendateien, so wie er aus den JSON-Dateien kommt (noch ungeprüft). */
export interface RawGameDataFiles {
  readonly goods: unknown;
  readonly buildings: unknown;
  readonly terrain: unknown;
  readonly resources: unknown;
  readonly fertilities: unknown;
}

/** Geprüfte Spieldaten. Sie ändern sich während des Spiels nie. */
export interface GameData {
  readonly goods: ReadonlyMap<GoodId, Readonly<GoodDefinition>>;
  readonly buildings: ReadonlyMap<BuildingTypeId, Readonly<BuildingDefinition>>;
  /**
   * Alle Geländearten in der Reihenfolge von terrain.json.
   * Die Position ist die Nummer, die jede Kachel im Spielzustand speichert (`WorldState.terrain`).
   */
  readonly terrains: readonly Readonly<TerrainDefinition>[];
  /** Nummer einer Geländeart über ihre Kennung, z. B. "plain" → 3. */
  readonly terrainCodes: ReadonlyMap<TerrainId, number>;
  /** Die Nummern der Geländearten, die das Spiel selbst kennt (siehe REQUIRED_TERRAIN_IDS). */
  readonly terrainCode: Readonly<Record<RequiredTerrainId, number>>;
  readonly resources: ReadonlyMap<ResourceId, Readonly<ResourceDefinition>>;
  readonly fertilities: ReadonlyMap<FertilityId, Readonly<FertilityDefinition>>;
}

/** Dateinamen für die Fehlermeldungen. */
export const DATA_FILE_NAMES = {
  goods: "goods.json",
  buildings: "buildings.json",
  terrain: "terrain.json",
  resources: "resources.json",
  fertilities: "fertilities.json",
} as const satisfies Record<keyof RawGameDataFiles, string>;

/**
 * Prüft eine Datei mit ihrem Schema und sucht doppelte Kennungen.
 * Fehler landen in `errors`; zurück kommt der geprüfte Inhalt oder `undefined`.
 */
function checkFile<S extends z.ZodMiniType<{ readonly id: string }[]>>(
  source: string,
  schema: S,
  data: unknown,
  errors: string[],
): z.infer<S> | undefined {
  const result = checkWithSchema(source, schema, data);
  if (!result.ok) {
    errors.push(...result.errors);
    return undefined;
  }
  errors.push(...findDuplicateIds(source, result.value));
  return result.value;
}

/** Baut eine Nachschlage-Tabelle „Kennung → Eintrag“. */
function byId<T extends { readonly id: string }>(entries: readonly T[]): Map<T["id"], T> {
  return new Map(entries.map((entry) => [entry.id, entry]));
}

/** Prüft alle Datendateien und baut daraus die Spieldaten. */
export function loadGameData(files: RawGameDataFiles): CheckResult<GameData> {
  const errors: string[] = [];
  const goods = checkFile(DATA_FILE_NAMES.goods, goodsFileSchema, files.goods, errors);
  const buildings = checkFile(
    DATA_FILE_NAMES.buildings,
    buildingsFileSchema,
    files.buildings,
    errors,
  );
  const terrains = checkFile(DATA_FILE_NAMES.terrain, terrainFileSchema, files.terrain, errors);
  const resources = checkFile(
    DATA_FILE_NAMES.resources,
    resourcesFileSchema,
    files.resources,
    errors,
  );
  const fertilities = checkFile(
    DATA_FILE_NAMES.fertilities,
    fertilitiesFileSchema,
    files.fertilities,
    errors,
  );

  if (terrains !== undefined) {
    errors.push(...checkTerrainList(terrains));
  }

  // Querverweise lassen sich erst prüfen, wenn die beteiligten Dateien für sich in Ordnung sind.
  if (
    goods === undefined ||
    buildings === undefined ||
    terrains === undefined ||
    resources === undefined ||
    fertilities === undefined
  ) {
    return { ok: false, errors };
  }
  const goodsById = byId(goods);
  const terrainCodes = new Map(terrains.map((terrain, index) => [terrain.id, index]));
  errors.push(...findUnknownGoods(buildings, goodsById));
  errors.push(...findUnknownTerrain(buildings, terrainCodes));

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      goods: goodsById,
      buildings: byId(buildings),
      terrains,
      terrainCodes,
      terrainCode: requiredTerrainCodes(terrainCodes),
      resources: byId(resources),
      fertilities: byId(fertilities),
    },
  };
}

/** Prüft, dass alle Pflicht-Geländearten vorhanden sind und die Liste nicht zu lang ist. */
function checkTerrainList(terrains: readonly TerrainDefinition[]): string[] {
  const errors: string[] = [];
  const known = new Set(terrains.map((terrain) => terrain.id));
  const missing = REQUIRED_TERRAIN_IDS.filter((id) => !known.has(id));
  if (missing.length > 0) {
    errors.push(
      `${DATA_FILE_NAMES.terrain}: Es fehlen Geländearten, die das Spiel braucht: ` +
        `${missing.join(", ")}.`,
    );
  }
  if (terrains.length > MAX_TERRAIN_TYPES) {
    errors.push(
      `${DATA_FILE_NAMES.terrain}: Höchstens ${String(MAX_TERRAIN_TYPES)} Geländearten erlaubt ` +
        `(gefunden: ${String(terrains.length)}).`,
    );
  }
  return errors;
}

/** Die Nummern der Pflicht-Geländearten. Nur aufrufen, wenn checkTerrainList keine Fehler fand. */
function requiredTerrainCodes(
  terrainCodes: ReadonlyMap<TerrainId, number>,
): Record<RequiredTerrainId, number> {
  const codes: Partial<Record<RequiredTerrainId, number>> = {};
  for (const id of REQUIRED_TERRAIN_IDS) {
    codes[id] = terrainCodes.get(id) ?? 0;
  }
  return codes as Record<RequiredTerrainId, number>;
}

/** Findet Gebäude, die eine Ware herstellen, die es in goods.json nicht gibt. */
function findUnknownGoods(
  buildings: readonly BuildingDefinition[],
  goods: ReadonlyMap<GoodId, GoodDefinition>,
): string[] {
  const known = goods.size === 0 ? "keine" : Array.from(goods.keys()).join(", ");
  const errors: string[] = [];
  buildings.forEach((building, index) => {
    const good = building.produces?.good;
    if (good !== undefined && !goods.has(good)) {
      errors.push(
        `${DATA_FILE_NAMES.buildings} → Eintrag ${String(index + 1)} („${building.id}“) → ` +
          `Feld „produces“ → Feld „good“: Die Ware „${good}“ gibt es nicht. ` +
          `Bekannte Waren: ${known}.`,
      );
    }
  });
  return errors;
}

/** Findet Gebäude, die auf einer Geländeart stehen sollen, die es in terrain.json nicht gibt. */
function findUnknownTerrain(
  buildings: readonly BuildingDefinition[],
  terrainCodes: ReadonlyMap<TerrainId, number>,
): string[] {
  const known = Array.from(terrainCodes.keys()).join(", ");
  const errors: string[] = [];
  buildings.forEach((building, index) => {
    for (const terrain of building.allowedTerrain) {
      if (!terrainCodes.has(terrain)) {
        errors.push(
          `${DATA_FILE_NAMES.buildings} → Eintrag ${String(index + 1)} („${building.id}“) → ` +
            `Feld „allowedTerrain“: Die Geländeart „${terrain}“ gibt es nicht. ` +
            `Bekannte Geländearten: ${known}.`,
        );
      }
    }
  });
  return errors;
}
