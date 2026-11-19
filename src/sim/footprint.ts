/**
 * Grundfläche eines Gebäudes: welche Kacheln es belegt, auch gedreht.
 *
 * Drehung in 90°-Schritten im Uhrzeigersinn, von oben gesehen:
 * 0 = wie in buildings.json, 1 = 90°, 2 = 180°, 3 = 270°.
 * Bei 90° und 270° tauschen Breite und Tiefe die Rollen.
 *
 * Eine Grundfläche ist immer ein Rechteck aus Kacheln. Ihre Lage wird über die
 * südwestliche Kachel (kleinstes x und y) angegeben.
 */
import type { BuildingSize } from "../data/schemas";
import type { TilePosition } from "./worldSpace";

/** Drehung in 90°-Schritten im Uhrzeigersinn (0 bis 3). */
export type Rotation = 0 | 1 | 2 | 3;

/** Alle Drehungen der Reihe nach. */
export const ROTATIONS: readonly Rotation[] = [0, 1, 2, 3];

/** Ist der Wert eine erlaubte Drehung? */
export function isRotation(value: unknown): value is Rotation {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

/** Die nächste Drehung im Uhrzeigersinn (nach 270° kommt wieder 0°). */
export function rotateClockwise(rotation: Rotation): Rotation {
  return ((rotation + 1) % 4) as Rotation;
}

/** Größe der Grundfläche nach der Drehung. */
export function rotatedSize(size: BuildingSize, rotation: Rotation): BuildingSize {
  return rotation % 2 === 0 ? size : { width: size.depth, depth: size.width };
}

/** Ein Rechteck aus Kacheln. */
export interface Footprint {
  /** südwestliche Kachel */
  readonly x: number;
  readonly y: number;
  /** Ausdehnung nach Osten bzw. Norden in Kacheln */
  readonly width: number;
  readonly depth: number;
}

/** Die Grundfläche eines Gebäudes mit südwestlicher Kachel (x, y). */
export function footprintAt(
  x: number,
  y: number,
  size: BuildingSize,
  rotation: Rotation,
): Footprint {
  return { x, y, ...rotatedSize(size, rotation) };
}

/**
 * Die Grundfläche eines Gebäudes, das möglichst mittig auf der Kachel `center` steht.
 * So landet ein Gebäude „unter dem Finger“. Bei gerader Kantenlänge gibt es keine genaue
 * Mitte; dann liegt die Kachel `center` in der südwestlichen der beiden mittleren Reihen.
 */
export function footprintAround(
  center: TilePosition,
  size: BuildingSize,
  rotation: Rotation,
): Footprint {
  const rotated = rotatedSize(size, rotation);
  return {
    x: center.x - Math.floor((rotated.width - 1) / 2),
    y: center.y - Math.floor((rotated.depth - 1) / 2),
    ...rotated,
  };
}

/** Alle Kacheln einer Grundfläche, Zeile für Zeile von Südwesten aus. */
export function footprintTiles(footprint: Footprint): TilePosition[] {
  const tiles: TilePosition[] = [];
  for (let dy = 0; dy < footprint.depth; dy++) {
    for (let dx = 0; dx < footprint.width; dx++) {
      tiles.push({ x: footprint.x + dx, y: footprint.y + dy });
    }
  }
  return tiles;
}
