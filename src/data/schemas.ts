/**
 * Prüfschemas für die Spieldaten-Dateien.
 * Aus jedem Schema leitet TypeScript automatisch den passenden Datentyp ab (eine Quelle statt zwei).
 *
 * Neue Felder: hier im Schema ergänzen, dann in der JSON-Datei eintragen.
 * Unbekannte Felder in einer Datei sind ein Fehler (meist ein Tippfehler).
 */
import * as z from "zod/mini";
import { colorSchema, displayTextSchema, idSchema } from "./validation";

// ─── Welt: Gelände, Rohstoffe, Fruchtbarkeiten (ab Unterphase 2.2) ──────────────────

/**
 * Geländearten, die das Spiel selbst kennt und deshalb in terrain.json stehen müssen.
 * Der Weltgenerator und die Bauregeln benutzen sie. Weitere Arten dürfen dazukommen.
 */
export const REQUIRED_TERRAIN_IDS = [
  "deep_water",
  "shallow_water",
  "beach",
  "plain",
  "mountain",
] as const;

export type RequiredTerrainId = (typeof REQUIRED_TERRAIN_IDS)[number];

/** Höchstens so viele Geländearten: Jede Kachel speichert ihre Art als Zahl von 0 bis 255. */
export const MAX_TERRAIN_TYPES = 256;

/**
 * Eine Geländeart, z. B. Ebene oder Berg. Datei: terrain.json
 * Die Position in der Liste ist die Nummer, unter der die Kacheln die Art speichern
 * (erster Eintrag = 0). Deshalb neue Arten nur hinten anhängen, nicht umsortieren.
 */
export const terrainSchema = z.strictObject({
  /** Feste englische Kennung, z. B. "plain" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "Ebene" */
  name: displayTextSchema(),
  /** Ist es Wasser? (Wasser bekommt kein Land-Gelände, später fahren dort Schiffe.) */
  water: z.boolean(),
  /** Farbe im Platzhalter-Look (Greybox), z. B. "#8fb565" */
  color: colorSchema(),
});

export const terrainFileSchema = z.array(terrainSchema);

export type TerrainDefinition = z.infer<typeof terrainSchema>;

/** Kennung einer Geländeart, z. B. "plain". */
export type TerrainId = TerrainDefinition["id"];

/** Eine Rohstoff-Art, die in den Bergen vorkommt, z. B. Eisenerz. Datei: resources.json */
export const resourceSchema = z.strictObject({
  /** Feste englische Kennung, z. B. "iron_ore" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "Eisenerz" */
  name: displayTextSchema(),
  /** Farbe für die Anzeige der Vorkommen (Debug-Anzeige, Greybox) */
  color: colorSchema(),
});

export const resourcesFileSchema = z.array(resourceSchema);

export type ResourceDefinition = z.infer<typeof resourceSchema>;

/** Kennung einer Rohstoff-Art, z. B. "iron_ore". */
export type ResourceId = ResourceDefinition["id"];

/** Eine Fruchtbarkeit (was auf einer Insel wächst), z. B. Kakao. Datei: fertilities.json */
export const fertilitySchema = z.strictObject({
  /** Feste englische Kennung, z. B. "cocoa" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "Kakao" */
  name: displayTextSchema(),
  /** Farbe für die Anzeige (Debug-Anzeige, Greybox) */
  color: colorSchema(),
});

export const fertilitiesFileSchema = z.array(fertilitySchema);

export type FertilityDefinition = z.infer<typeof fertilitySchema>;

/** Kennung einer Fruchtbarkeit, z. B. "cocoa". */
export type FertilityId = FertilityDefinition["id"];

// ─── Waren und Gebäude ──────────────────────────────────────────────────────────────

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

/** Größte Kantenlänge eines Gebäudes in Kacheln. */
export const MAX_BUILDING_EDGE = 12;

/** Eine Kantenlänge in Kacheln (ganze Zahl von 1 bis MAX_BUILDING_EDGE). */
const tileCountSchema = z.int().check(z.gte(1), z.lte(MAX_BUILDING_EDGE));

/**
 * Grundfläche eines Gebäudes in Kacheln, so wie es ungedreht steht:
 * `width` = Breite von West nach Ost, `depth` = Tiefe von Süd nach Nord.
 * Bei einer Drehung um 90° tauschen die beiden die Rollen (sim/footprint.ts).
 */
export const buildingSizeSchema = z.strictObject({
  width: tileCountSchema,
  depth: tileCountSchema,
});

export type BuildingSize = z.infer<typeof buildingSizeSchema>;

/** Eine Gebäudeart, z. B. der Test-Holzfäller. Datei: buildings.json */
export const buildingSchema = z.strictObject({
  /** Feste englische Kennung, z. B. "test_woodcutter" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "Test-Holzfäller" */
  name: displayTextSchema(),
  /** Grundfläche in Kacheln (ungedreht), z. B. { "width": 3, "depth": 3 } */
  size: buildingSizeSchema,
  /**
   * Auf welchen Geländearten das Gebäude stehen darf (Kennungen aus terrain.json),
   * z. B. ["plain"]. Jede Kachel der Grundfläche muss eine davon sein.
   */
  allowedTerrain: z.array(idSchema()).check(z.minLength(1)),
  /** Was das Gebäude herstellt. Fehlt bei Gebäuden, die nichts herstellen (z. B. Wohnhäusern). */
  produces: z.optional(productionSchema),
});

export const buildingsFileSchema = z.array(buildingSchema);

export type BuildingDefinition = z.infer<typeof buildingSchema>;

/** Kennung einer Gebäudeart, z. B. "test_woodcutter". */
export type BuildingTypeId = BuildingDefinition["id"];
