import { describe, expect, it } from "vitest";
import {
  footprintAround,
  footprintAt,
  footprintTiles,
  isRotation,
  rotateClockwise,
  rotatedSize,
  ROTATIONS,
} from "./footprint";

const SIZE_2_BY_3 = { width: 2, depth: 3 };

describe("Grundfläche und Drehung von Gebäuden", () => {
  it("dreht im Uhrzeigersinn in 90°-Schritten und landet nach vier Schritten wieder bei 0", () => {
    expect(ROTATIONS).toEqual([0, 1, 2, 3]);
    expect(rotateClockwise(0)).toBe(1);
    expect(rotateClockwise(3)).toBe(0);
    expect(isRotation(2)).toBe(true);
    expect(isRotation(4)).toBe(false);
    expect(isRotation(1.5)).toBe(false);
    expect(isRotation("1")).toBe(false);
  });

  it("tauscht bei 90° und 270° Breite und Tiefe", () => {
    expect(rotatedSize(SIZE_2_BY_3, 0)).toEqual({ width: 2, depth: 3 });
    expect(rotatedSize(SIZE_2_BY_3, 1)).toEqual({ width: 3, depth: 2 });
    expect(rotatedSize(SIZE_2_BY_3, 2)).toEqual({ width: 2, depth: 3 });
    expect(rotatedSize(SIZE_2_BY_3, 3)).toEqual({ width: 3, depth: 2 });
  });

  it("listet alle belegten Kacheln auf", () => {
    expect(footprintTiles(footprintAt(10, 5, SIZE_2_BY_3, 0))).toEqual([
      { x: 10, y: 5 },
      { x: 11, y: 5 },
      { x: 10, y: 6 },
      { x: 11, y: 6 },
      { x: 10, y: 7 },
      { x: 11, y: 7 },
    ]);
    expect(footprintTiles(footprintAt(10, 5, SIZE_2_BY_3, 1))).toHaveLength(6);
    expect(footprintAt(10, 5, SIZE_2_BY_3, 1)).toEqual({ x: 10, y: 5, width: 3, depth: 2 });
  });

  it("stellt ein Gebäude mittig auf die Kachel unter dem Finger", () => {
    // 3 × 3: die Kachel 20/20 ist genau die Mitte
    expect(footprintAround({ x: 20, y: 20 }, { width: 3, depth: 3 }, 0)).toEqual({
      x: 19,
      y: 19,
      width: 3,
      depth: 3,
    });
    // 1 × 1: genau die Kachel selbst
    expect(footprintAround({ x: 4, y: 9 }, { width: 1, depth: 1 }, 2)).toEqual({
      x: 4,
      y: 9,
      width: 1,
      depth: 1,
    });
    // 2 × 3 um 90° gedreht wird 3 × 2: die Kachel liegt in der Mitte bzw. südwestlichen Mitte
    const rotated = footprintAround({ x: 20, y: 20 }, SIZE_2_BY_3, 1);
    expect(rotated).toEqual({ x: 19, y: 20, width: 3, depth: 2 });
    expect(footprintTiles(rotated)).toContainEqual({ x: 20, y: 20 });
  });

  it("die Kachel unter dem Finger gehört bei jeder Drehung und Größe zur Grundfläche", () => {
    for (let width = 1; width <= 5; width++) {
      for (let depth = 1; depth <= 5; depth++) {
        for (const rotation of ROTATIONS) {
          const footprint = footprintAround({ x: 50, y: 60 }, { width, depth }, rotation);
          expect(footprintTiles(footprint)).toContainEqual({ x: 50, y: 60 });
        }
      }
    }
  });
});
