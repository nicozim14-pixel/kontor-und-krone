/**
 * Der Daten-Lader: prüft alle Spieldaten-Dateien und macht daraus nachschlagbare Tabellen.
 *
 * Ablauf: 1. jede Datei mit ihrem Schema prüfen, 2. doppelte Kennungen suchen,
 * 3. Querverweise prüfen, z. B. ob die Ware, die ein Gebäude herstellt, in goods.json steht.
 * Alle Fehler werden gesammelt und zusammen gemeldet, nicht nur der erste.
 */
import {
  buildingsFileSchema,
  goodsFileSchema,
  type BuildingDefinition,
  type BuildingTypeId,
  type GoodDefinition,
  type GoodId,
} from "./schemas";
import { checkWithSchema, findDuplicateIds, type CheckResult } from "./validation";

/** Inhalt der Datendateien, so wie er aus den JSON-Dateien kommt (noch ungeprüft). */
export interface RawGameDataFiles {
  readonly goods: unknown;
  readonly buildings: unknown;
}

/** Geprüfte Spieldaten. Sie ändern sich während des Spiels nie. */
export interface GameData {
  readonly goods: ReadonlyMap<GoodId, Readonly<GoodDefinition>>;
  readonly buildings: ReadonlyMap<BuildingTypeId, Readonly<BuildingDefinition>>;
}

/** Dateinamen für die Fehlermeldungen. */
export const DATA_FILE_NAMES = {
  goods: "goods.json",
  buildings: "buildings.json",
} as const satisfies Record<keyof RawGameDataFiles, string>;

/** Prüft alle Datendateien und baut daraus die Spieldaten. */
export function loadGameData(files: RawGameDataFiles): CheckResult<GameData> {
  const errors: string[] = [];

  const goodsResult = checkWithSchema(DATA_FILE_NAMES.goods, goodsFileSchema, files.goods);
  if (goodsResult.ok) {
    errors.push(...findDuplicateIds(DATA_FILE_NAMES.goods, goodsResult.value));
  } else {
    errors.push(...goodsResult.errors);
  }

  const buildingsResult = checkWithSchema(
    DATA_FILE_NAMES.buildings,
    buildingsFileSchema,
    files.buildings,
  );
  if (buildingsResult.ok) {
    errors.push(...findDuplicateIds(DATA_FILE_NAMES.buildings, buildingsResult.value));
  } else {
    errors.push(...buildingsResult.errors);
  }

  // Querverweise lassen sich erst prüfen, wenn beide Dateien für sich in Ordnung sind.
  if (!goodsResult.ok || !buildingsResult.ok) {
    return { ok: false, errors };
  }
  const goods = new Map(goodsResult.value.map((good) => [good.id, good]));
  errors.push(...findUnknownGoods(buildingsResult.value, goods));

  if (errors.length > 0) {
    return { ok: false, errors };
  }
  return {
    ok: true,
    value: {
      goods,
      buildings: new Map(buildingsResult.value.map((building) => [building.id, building])),
    },
  };
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
