/**
 * Der Daten-Lader: prüft alle Spieldaten-Dateien und macht daraus nachschlagbare Tabellen.
 *
 * Ablauf: 1. jede Datei mit ihrem Schema prüfen, 2. doppelte Kennungen suchen,
 * 3. (ab Unterphase 1.7) Querverweise prüfen, z. B. ob die Ware eines Gebäudes existiert.
 * Alle Fehler werden gesammelt und zusammen gemeldet, nicht nur der erste.
 */
import { goodsFileSchema, type GoodDefinition, type GoodId } from "./schemas";
import { checkWithSchema, findDuplicateIds, type CheckResult } from "./validation";

/** Inhalt der Datendateien, so wie er aus den JSON-Dateien kommt (noch ungeprüft). */
export interface RawGameDataFiles {
  readonly goods: unknown;
}

/** Geprüfte Spieldaten. Sie ändern sich während des Spiels nie. */
export interface GameData {
  readonly goods: ReadonlyMap<GoodId, Readonly<GoodDefinition>>;
}

/** Dateinamen für die Fehlermeldungen. */
export const DATA_FILE_NAMES = {
  goods: "goods.json",
} as const satisfies Record<keyof RawGameDataFiles, string>;

/** Prüft alle Datendateien und baut daraus die Spieldaten. */
export function loadGameData(files: RawGameDataFiles): CheckResult<GameData> {
  const errors: string[] = [];

  const goodsResult = checkWithSchema(DATA_FILE_NAMES.goods, goodsFileSchema, files.goods);
  if (!goodsResult.ok) {
    errors.push(...goodsResult.errors);
  } else {
    errors.push(...findDuplicateIds(DATA_FILE_NAMES.goods, goodsResult.value));
  }

  if (!goodsResult.ok || errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      goods: new Map(goodsResult.value.map((good) => [good.id, good])),
    },
  };
}
