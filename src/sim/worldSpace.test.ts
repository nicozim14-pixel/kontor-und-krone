import { describe, expect, it } from "vitest";
import {
  elevationToMeters,
  MAX_ELEVATION_CODE,
  metersToElevation,
  SEA_LEVEL_CODE,
  TILE_SIZE,
  tileCenterToWorld,
  tileCornerToWorld,
  tileRectCenterToWorld,
  worldToTile,
} from "./worldSpace";

describe("Umrechnung Kachel ↔ 3D-Welt", () => {
  it("eine Kachel ist 2 Meter breit, so breit wie ein Feldweg (E-021)", () => {
    expect(TILE_SIZE).toBe(2);
  });

  it("findet den Mittelpunkt und die Ecke einer Kachel", () => {
    expect(tileCenterToWorld(0, 0)).toEqual({ x: 1, z: 1 });
    expect(tileCenterToWorld(12, 7)).toEqual({ x: 25, z: 15 });
    expect(tileCornerToWorld(12, 7)).toEqual({ x: 24, z: 14 });
    // Die Karte mit 256 × 256 Kacheln ist 512 × 512 Meter groß.
    expect(tileCornerToWorld(256, 256)).toEqual({ x: 512, z: 512 });
  });

  it("findet die Kachel unter einem Punkt (z. B. dort, wo der Finger den Boden trifft)", () => {
    expect(worldToTile({ x: 25, z: 15 })).toEqual({ x: 12, y: 7 });
    expect(worldToTile({ x: 24.01, z: 15.99 })).toEqual({ x: 12, y: 7 });
    // Genau auf der Grenze zählt die Kachel östlich bzw. nördlich davon.
    expect(worldToTile({ x: 24, z: 14 })).toEqual({ x: 12, y: 7 });
    // Außerhalb der Karte entstehen negative Kacheln (isInsideWorld prüft das).
    expect(worldToTile({ x: -0.5, z: -3 })).toEqual({ x: -1, y: -2 });
  });

  it("Kachel → Mittelpunkt → Kachel ergibt wieder dieselbe Kachel", () => {
    for (let y = 0; y < 256; y += 17) {
      for (let x = 0; x < 256; x += 13) {
        expect(worldToTile(tileCenterToWorld(x, y))).toEqual({ x, y });
      }
    }
  });

  it("findet die Mitte eines Gebäudes aus mehreren Kacheln", () => {
    // 3 × 3 Kacheln ab Kachel 10/20: Mitte ist der Mittelpunkt von Kachel 11/21.
    expect(tileRectCenterToWorld(10, 20, 3, 3)).toEqual(tileCenterToWorld(11, 21));
    // 2 × 1 Kacheln ab 0/0: Mitte auf der Grenze zwischen beiden Kacheln.
    expect(tileRectCenterToWorld(0, 0, 2, 1)).toEqual({ x: 2, z: 1 });
  });
});

describe("Höhe einer Kachel", () => {
  it("rechnet die gespeicherte Zahl in Meter um und zurück", () => {
    expect(elevationToMeters(SEA_LEVEL_CODE)).toBe(0);
    expect(metersToElevation(0)).toBe(SEA_LEVEL_CODE);
    expect(elevationToMeters(metersToElevation(1))).toBe(1);
    expect(elevationToMeters(metersToElevation(-2.5))).toBe(-2.5);
    expect(elevationToMeters(metersToElevation(12.375))).toBe(12.375);
  });

  it("deckt Meeresgrund bis Berggipfel ab und begrenzt Ausreißer", () => {
    expect(elevationToMeters(0)).toBe(-4);
    expect(elevationToMeters(MAX_ELEVATION_CODE)).toBeGreaterThan(27);
    expect(metersToElevation(-100)).toBe(0);
    expect(metersToElevation(1000)).toBe(MAX_ELEVATION_CODE);
    // Zwischenwerte werden auf die nächste Stufe (0,125 m) gerundet.
    expect(elevationToMeters(metersToElevation(1.1))).toBe(1.125);
    expect(elevationToMeters(metersToElevation(1.05))).toBe(1);
  });
});
