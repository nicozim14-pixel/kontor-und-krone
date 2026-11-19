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

// ─── Regeln des Weltgenerators (ab Unterphase 2.3) ──────────────────────────────────

/** Höchstens so viele Inseln: Jede Kachel speichert ihre Insel als Zahl von 0 bis 255. */
export const MAX_TOTAL_ISLANDS = 255;

/** Ein Bereich „von … bis …“ aus ganzen Zahlen, z. B. { "min": 2, "max": 3 }. */
function intRangeSchema(min: number, max: number) {
  const value = z.int().check(z.gte(min), z.lte(max));
  return z.strictObject({ min: value, max: value }).check(
    z.refine((range) => range.min <= range.max, {
      error: "„min“ darf nicht größer als „max“ sein.",
    }),
  );
}

/** Ein Bereich „von … bis …“ aus Kommazahlen, z. B. { "min": 7, "max": 16 }. */
function numberRangeSchema(min: number, max: number) {
  const value = z.number().check(z.gte(min), z.lte(max));
  return z.strictObject({ min: value, max: value }).check(
    z.refine((range) => range.min <= range.max, {
      error: "„min“ darf nicht größer als „max“ sein.",
    }),
  );
}

/** Ein Anteil von 0 (nichts) bis 1 (alles), z. B. 0,35 = 35 %. */
function shareSchema() {
  return z.number().check(z.gte(0), z.lte(1));
}

/** Eine Größenklasse von Inseln, z. B. „groß“: wie viele, wie breit, wie viele Gebirge. */
export const islandClassSchema = z.strictObject({
  /** Feste englische Kennung, z. B. "large" */
  id: idSchema(),
  /** Deutscher Anzeigename, z. B. "groß" */
  name: displayTextSchema(),
  /** Wie viele Inseln dieser Klasse entstehen */
  count: intRangeSchema(0, 64),
  /** Größte Breite der Insel in Kacheln (die Küste ist unregelmäßig, im Mittel etwas schmaler) */
  diameter: intRangeSchema(12, 400),
  /** Wie viele Gebirge die Insel bekommt (0 = keine Berge, also auch keine Rohstoffe) */
  mountainRanges: intRangeSchema(0, 8),
});

/** Häufigkeit einer Rohstoff-Art beim Verteilen der Vorkommen (größere Zahl = häufiger). */
export const depositWeightSchema = z.strictObject({
  /** Kennung aus resources.json, z. B. "iron_ore" */
  resource: idSchema(),
  /** Gewicht, z. B. 4 bei Eisenerz und 1 bei Gold: Eisenerz kommt etwa viermal so oft vor */
  weight: z.number().check(z.gt(0), z.lte(1000)),
});

/**
 * Die Regeln, nach denen der Weltgenerator aus einem Seed eine Inselwelt baut. Datei: worldgen.json
 * Alle Längen in Kacheln (1 Kachel = 2 m), Höhen in Metern über dem Meeresspiegel.
 */
export const worldGenSchema = z.strictObject({
  /** Größe der Karte und Abstände */
  map: z.strictObject({
    /** Breite und Höhe der Karte in Kacheln (E-021: 256 × 256) */
    width: z.int().check(z.gte(64), z.lte(1024)),
    height: z.int().check(z.gte(64), z.lte(1024)),
    /** So viele Kacheln Meer bleiben mindestens am Kartenrand frei */
    edgeMargin: z.int().check(z.gte(2), z.lte(64)),
    /** Mindestabstand zwischen zwei Inseln in Kacheln (Platz für Schiffe ab Phase 4) */
    islandGap: z.int().check(z.gte(4), z.lte(64)),
  }),
  /** Größenklassen der Inseln, die größte zuerst (sie wird zuerst platziert) */
  islandClasses: z.array(islandClassSchema).check(z.minLength(1)),
  /** Küsten und Wasser */
  coast: z.strictObject({
    /** Wie stark die Küste ausfranst: 0 = kreisrund, 0,4 = sehr unregelmäßig */
    roughness: z.number().check(z.gte(0), z.lte(0.5)),
    /** Stärke kleiner Buchten und Landzungen: 0 = keine */
    bayStrength: z.number().check(z.gte(0), z.lte(0.4)),
    /** Breite der Strände in Kacheln */
    beachWidth: intRangeSchema(1, 6),
    /** Breite des hellen Flachwassers vor der Küste in Kacheln */
    shallowWaterWidth: z.int().check(z.gte(1), z.lte(12)),
  }),
  /** Berge (unbebaubar); jedes Gebirge besteht aus mehreren runden „Kuppen“ in einer Reihe */
  mountains: z.strictObject({
    /** Kuppen pro Gebirge */
    blobsPerRange: intRangeSchema(1, 6),
    /** Radius einer Kuppe in Kacheln */
    blobRadius: intRangeSchema(2, 16),
    /** Höhe des Gipfels in Metern über der Ebene */
    peakHeight: numberRangeSchema(2, 24),
    /** So viele Kacheln bleiben zwischen Gebirgsmitte und Küste mindestens frei */
    minCoastDistance: z.int().check(z.gte(1), z.lte(32)),
  }),
  /** Höhe der flachen Bauflächen (Ebenen) in Metern über dem Meeresspiegel */
  plainHeight: z.number().check(z.gte(0.25), z.lte(4)),
  /** Mindestanteil der Ebene an der Landfläche jeder Insel (bebaubare Fläche) */
  minBuildableShare: shareSchema(),
  /** Wie viele Fruchtbarkeiten jede Insel bekommt (immer weniger als es insgesamt gibt) */
  fertilitiesPerIsland: intRangeSchema(1, 32),
  /** Wie viele Rohstoffvorkommen jedes Gebirge bekommt */
  depositsPerRange: intRangeSchema(0, 4),
  /** Häufigkeit der Rohstoff-Arten; jede Art aus resources.json braucht einen Eintrag */
  deposits: z.array(depositWeightSchema).check(z.minLength(1)),
  /** Wälder auf den Ebenen (E-024) */
  forests: z.strictObject({
    /** Anteil der Ebene, der in Waldgebieten liegt, z. B. 0,35 = 35 % */
    coverage: shareSchema(),
    /** Wie dicht die Bäume in einem Waldgebiet stehen (Anteil der Kacheln mit Baum) */
    density: shareSchema(),
    /** Einzelne Bäume außerhalb der Wälder (Anteil der Kacheln) */
    scatter: shareSchema(),
  }),
});

export type WorldGenRules = z.infer<typeof worldGenSchema>;

export type IslandClassDefinition = z.infer<typeof islandClassSchema>;

/** Ein Bereich „von … bis …“, z. B. { min: 2, max: 3 }. */
export interface Range {
  readonly min: number;
  readonly max: number;
}

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
