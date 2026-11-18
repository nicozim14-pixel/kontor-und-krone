/**
 * Prüfschemas für die Spieldaten-Dateien.
 * Aus jedem Schema leitet TypeScript automatisch den passenden Datentyp ab (eine Quelle statt zwei).
 *
 * Neue Felder: hier im Schema ergänzen, dann in der JSON-Datei eintragen.
 * Unbekannte Felder in einer Datei sind ein Fehler (meist ein Tippfehler).
 */
import * as z from "zod/mini";
import { displayTextSchema, idSchema } from "./validation";

/** Eine Ware, z. B. Holz. Datei: goods.json */
export const goodSchema = z.strictObject({
  /** Feste englische Kennung, z. B. "wood" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "Holz" */
  name: displayTextSchema(),
});

export const goodsFileSchema = z.array(goodSchema);

export type GoodDefinition = z.infer<typeof goodSchema>;

/** Kennung einer Ware, z. B. "wood". */
export type GoodId = GoodDefinition["id"];
