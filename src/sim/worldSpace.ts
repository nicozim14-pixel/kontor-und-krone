/**
 * Umrechnung zwischen Kacheln und Positionen in der 3D-Welt. Nur hier, an genau einer Stelle.
 *
 * Achsen (Blick von oben, Karte „ausgenordet“):
 *
 *        Norden (+y bei Kacheln, +z in der 3D-Welt)
 *          ▲
 *          │   Kachel (x, y) liegt zwischen den Ecken (x, y) und (x + 1, y + 1)
 *          │
 *   (0, 0) └──────────▶ Osten (+x)
 *
 * - Kachel 0/0 ist die südwestliche Ecke der Karte, die 3D-Welt beginnt dort bei 0/0.
 * - Eine Kachel ist TILE_SIZE Meter breit (E-021: so breit wie ein Feldweg).
 * - Die Höhe (y in Babylon.js) zeigt nach oben; der Meeresspiegel liegt bei 0.
 *
 * Diese Datei gehört zur Simulation, weil sie reine Rechnung ist; die Darstellung (render/)
 * und die Eingabe (input/) benutzen sie, damit alle mit denselben Zahlen rechnen.
 */

/** Kantenlänge einer Kachel in Metern (= Einheiten der 3D-Welt). */
export const TILE_SIZE = 2;

/** Position einer Kachel im Raster: Spalte `x` (nach Osten), Zeile `y` (nach Norden). */
export interface TilePosition {
  readonly x: number;
  readonly y: number;
}

/** Punkt auf dem Boden der 3D-Welt in Metern: `x` nach Osten, `z` nach Norden. */
export interface WorldPoint {
  readonly x: number;
  readonly z: number;
}

/** Mittelpunkt einer Kachel in der 3D-Welt. */
export function tileCenterToWorld(x: number, y: number): WorldPoint {
  return { x: (x + 0.5) * TILE_SIZE, z: (y + 0.5) * TILE_SIZE };
}

/**
 * Eckpunkt des Rasters in der 3D-Welt. Ecke (x, y) ist die südwestliche Ecke von Kachel (x, y).
 * Gebraucht z. B. für das Gelände-Netz, das an den Ecken seine Höhenpunkte hat.
 */
export function tileCornerToWorld(x: number, y: number): WorldPoint {
  return { x: x * TILE_SIZE, z: y * TILE_SIZE };
}

/**
 * Die Kachel, in der ein Punkt der 3D-Welt liegt, z. B. dort, wo der Finger den Boden trifft.
 * Liegt der Punkt genau auf einer Kachelgrenze, zählt die Kachel nördlich bzw. östlich davon.
 * Das Ergebnis kann außerhalb der Karte liegen; das prüft `isInsideWorld` (world.ts).
 */
export function worldToTile(point: WorldPoint): TilePosition {
  return { x: Math.floor(point.x / TILE_SIZE), y: Math.floor(point.z / TILE_SIZE) };
}

/**
 * Mittelpunkt eines Rechtecks aus Kacheln (z. B. der Grundfläche eines Gebäudes) in der 3D-Welt.
 * @param x, y südwestliche Kachel des Rechtecks
 * @param width, depth Größe in Kacheln (Ost–West bzw. Süd–Nord)
 */
export function tileRectCenterToWorld(
  x: number,
  y: number,
  width: number,
  depth: number,
): WorldPoint {
  return { x: (x + width / 2) * TILE_SIZE, z: (y + depth / 2) * TILE_SIZE };
}

// ─── Höhe ──────────────────────────────────────────────────────────────────────────

/**
 * Die Höhe jeder Kachel wird als ganze Zahl von 0 bis 255 gespeichert (ein Byte pro Kachel).
 * Eine Stufe entspricht ELEVATION_STEP Metern, die Zahl SEA_LEVEL_CODE ist der Meeresspiegel.
 * Damit reicht der Bereich von −4 m (Meeresgrund) bis knapp 28 m (Berggipfel).
 * 0,125 m ist eine „glatte“ Zahl für den Computer: Es entstehen keine Rundungsfehler.
 */
export const ELEVATION_STEP = 0.125;

/** Gespeicherte Zahl für die Höhe des Meeresspiegels (0 Meter). */
export const SEA_LEVEL_CODE = 32;

/** Größte gespeicherte Höhe (ein Byte). */
export const MAX_ELEVATION_CODE = 255;

/** Wandelt eine gespeicherte Höhe in Meter über dem Meeresspiegel um. */
export function elevationToMeters(code: number): number {
  return (code - SEA_LEVEL_CODE) * ELEVATION_STEP;
}

/** Wandelt Meter über dem Meeresspiegel in die gespeicherte Höhe um (gerundet, begrenzt). */
export function metersToElevation(meters: number): number {
  const code = Math.round(meters / ELEVATION_STEP) + SEA_LEVEL_CODE;
  return Math.min(MAX_ELEVATION_CODE, Math.max(0, code));
}
