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

/**
 * Was ein Gebäude in jedem Wirtschafts-Takt herstellt.
 * Vorläufig für den Durchstich (Unterphase 1.7); echte Produktionsketten mit
 * Arbeitszeit und Rohstoffen kommen in Phase 3.
 */
export const productionSchema = z.strictObject({
  /** Kennung der hergestellten Ware, z. B. "wood". Muss in goods.json stehen. */
  good: idSchema(),
  /** Menge pro Takt (ganze Zahl, mindestens 1) */
  amountPerTick: z.int().check(z.gte(1)),
});

/** Eine Gebäudeart, z. B. der Test-Holzfäller. Datei: buildings.json */
export const buildingSchema = z.strictObject({
  /** Feste englische Kennung, z. B. "test_woodcutter" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "Test-Holzfäller" */
  name: displayTextSchema(),
  /** Was das Gebäude herstellt. Fehlt bei Gebäuden, die nichts herstellen (z. B. Wohnhäusern). */
  produces: z.optional(productionSchema),
});

export const buildingsFileSchema = z.array(buildingSchema);

export type BuildingDefinition = z.infer<typeof buildingSchema>;

/** Kennung einer Gebäudeart, z. B. "test_woodcutter". */
export type BuildingTypeId = BuildingDefinition["id"];
