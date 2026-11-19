/**
 * Die Welt als Kachel-Raster: wie Karopapier über der Karte (docs/ARCHITEKTUR.md, Abschnitt 4.1).
 *
 * Jede Kachel hat einen „Notizzettel“ mit mehreren Angaben. Damit das bei 256 × 256 = 65.536
 * Kacheln sparsam bleibt, gibt es nicht ein Objekt pro Kachel, sondern pro Angabe ein langes
 * Zahlenfeld („Ebene“) mit einer Zahl pro Kachel. Die Zahl für Kachel (x, y) steht an der
 * Stelle `tileIndex(world, x, y)`, also Zeile für Zeile von Süden nach Norden.
 *
 * Die Ebenen:
 * - `terrain`   Geländeart: Nummer in terrain.json (0 = erster Eintrag)
 * - `elevation` Höhe als ganze Zahl, Umrechnung in Meter in worldSpace.ts
 * - `island`    zu welcher Insel die Kachel gehört (0 = keine, also Meer)
 * - `trees`     Baum auf der Kachel (0 = kein Baum, 1 = Baum)
 * - `occupancy` Belegung: 0 = frei, positive Zahl = Nummer des Gebäudes, das hier steht,
 *               negative Zahl = Straße (−1 − Nummer der Straßenart, ab Unterphase 2.6)
 */
import { MAX_TOTAL_ISLANDS, type FertilityId, type ResourceId } from "../data/schemas";
import { SEA_LEVEL_CODE } from "./worldSpace";

/** Größte erlaubte Kantenlänge der Karte in Kacheln (Schutz vor riesigen Spielständen). */
export const MAX_WORLD_EDGE = 1024;

/** Höchstens so viele Inseln: Jede Kachel speichert ihre Insel als Zahl von 0 bis 255. */
export const MAX_ISLANDS = MAX_TOTAL_ISLANDS;

/** Inselnummer für Kacheln, die zu keiner Insel gehören (Meer). */
export const NO_ISLAND = 0;

/** Wert in der Ebene `trees` für „kein Baum“. */
export const NO_TREE = 0;

/** Wert in der Ebene `trees` für „ein Baum“. */
export const TREE = 1;

/** Wert in der Ebene `occupancy` für „frei“. */
export const FREE_TILE = 0;

/** Das Kachel-Raster der Welt. */
export interface WorldState {
  /** Breite in Kacheln (von West nach Ost) */
  width: number;
  /** Höhe in Kacheln (von Süd nach Nord) */
  height: number;
  /** Geländeart je Kachel (Nummer in terrain.json) */
  terrain: Uint8Array;
  /** Höhe je Kachel (siehe worldSpace.ts) */
  elevation: Uint8Array;
  /** Inselnummer je Kachel (0 = Meer) */
  island: Uint8Array;
  /** Baum je Kachel (0 = kein Baum) */
  trees: Uint8Array;
  /** Belegung je Kachel: 0 frei, > 0 Gebäudenummer, < 0 Straße */
  occupancy: Int32Array;
}

/** Ein Rohstoffvorkommen in den Bergen, z. B. Eisenerz auf Kachel 40/12. */
export interface DepositState {
  /** Rohstoff-Art aus resources.json */
  resource: ResourceId;
  /** Kachel des Vorkommens */
  x: number;
  y: number;
}

/** Eine Insel mit ihren Eigenschaften. Welche Kacheln dazugehören, steht in `WorldState.island`. */
export interface IslandState {
  /** Inselnummer (1 bis 255), dieselbe Zahl wie in `WorldState.island` */
  id: number;
  /** Was auf der Insel wächst (Kennungen aus fertilities.json) */
  fertilities: FertilityId[];
  /** Rohstoffvorkommen in den Bergen der Insel */
  deposits: DepositState[];
}

/**
 * Erzeugt eine Welt aus lauter gleichen Kacheln (z. B. nur Meer), ohne Inseln, Bäume und Gebäude.
 * @param fillTerrain Geländeart aller Kacheln (Nummer in terrain.json)
 */
export function createEmptyWorld(width: number, height: number, fillTerrain = 0): WorldState {
  for (const [name, value] of [
    ["Breite", width],
    ["Höhe", height],
  ] as const) {
    if (!Number.isInteger(value) || value < 0 || value > MAX_WORLD_EDGE) {
      throw new RangeError(
        `Ungültige ${name} der Welt: ${String(value)} (erlaubt 0 bis ${String(MAX_WORLD_EDGE)}).`,
      );
    }
  }
  const tileCount = width * height;
  return {
    width,
    height,
    terrain: new Uint8Array(tileCount).fill(fillTerrain),
    elevation: new Uint8Array(tileCount).fill(SEA_LEVEL_CODE),
    island: new Uint8Array(tileCount),
    trees: new Uint8Array(tileCount),
    occupancy: new Int32Array(tileCount),
  };
}

/** Größe der Welt; Kurzform, damit auch die schreibgeschützte Sicht passt. */
interface WorldSize {
  readonly width: number;
  readonly height: number;
}

/** Liegt die Kachel (x, y) auf der Karte? */
export function isInsideWorld(world: WorldSize, x: number, y: number): boolean {
  return (
    Number.isInteger(x) &&
    Number.isInteger(y) &&
    x >= 0 &&
    y >= 0 &&
    x < world.width &&
    y < world.height
  );
}

/**
 * Stelle der Kachel (x, y) in den Zahlenfeldern.
 * Vorher mit `isInsideWorld` prüfen; außerhalb der Karte ist das Ergebnis bedeutungslos.
 */
export function tileIndex(world: WorldSize, x: number, y: number): number {
  return y * world.width + x;
}

/** Kachel-Position zu einer Stelle in den Zahlenfeldern (Umkehrung von `tileIndex`). */
export function tileAt(world: WorldSize, index: number): { x: number; y: number } {
  return { x: index % world.width, y: Math.floor(index / world.width) };
}
