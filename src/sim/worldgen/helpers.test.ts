import { describe, expect, it } from "vitest";
import { distanceToSources, FAR_AWAY } from "./distance";
import { createFractalNoise, createValueNoise, smoothstep } from "./noise";

describe("Rauschen für den Weltgenerator", () => {
  it("liefert Werte von −1 bis 1, gleich für gleiche Eingaben", () => {
    const noise = createFractalNoise(1234, 10, 3);
    const again = createFractalNoise(1234, 10, 3);
    for (let i = 0; i < 500; i++) {
      const x = i * 0.73;
      const y = i * 1.31;
      const value = noise(x, y);
      expect(value).toBeGreaterThanOrEqual(-1);
      expect(value).toBeLessThanOrEqual(1);
      expect(again(x, y)).toBe(value);
    }
  });

  it("ist glatt: nahe Punkte haben ähnliche Werte", () => {
    const noise = createValueNoise(7);
    for (let i = 0; i < 200; i++) {
      const x = i * 0.37;
      expect(Math.abs(noise(x, 3) - noise(x + 0.01, 3))).toBeLessThan(0.05);
    }
  });

  it("ergibt mit anderem Startwert ein anderes Muster", () => {
    const a = createValueNoise(1);
    const b = createValueNoise(2);
    const differences = Array.from({ length: 50 }, (_, i) => a(i + 0.5, 0.5) - b(i + 0.5, 0.5));
    expect(differences.some((difference) => Math.abs(difference) > 0.1)).toBe(true);
  });

  it("blendet mit smoothstep weich von 0 nach 1", () => {
    expect(smoothstep(0, 10, -5)).toBe(0);
    expect(smoothstep(0, 10, 5)).toBe(0.5);
    expect(smoothstep(0, 10, 20)).toBe(1);
    expect(smoothstep(3, 3, 2)).toBe(0);
  });
});

describe("Abstände auf dem Kachel-Raster", () => {
  it("misst gerade Schritte als 1 und schräge als etwa 1,33 Kacheln", () => {
    // 5 × 5 Kacheln, Quelle in der Mitte
    const sources = new Uint8Array(25);
    sources[12] = 1;
    const distance = distanceToSources(5, 5, sources);
    expect(distance[12]).toBe(0);
    expect(distance[13]).toBe(1); // Osten
    expect(distance[7]).toBe(1); // Süden
    expect(distance[14]).toBe(2); // zwei nach Osten
    expect(distance[18]).toBeCloseTo(4 / 3); // Nordosten
    expect(distance[0]).toBeCloseTo(8 / 3); // Südwest-Ecke
  });

  it("nimmt die nächste von mehreren Quellen", () => {
    const sources = new Uint8Array(10);
    sources[0] = 1;
    sources[9] = 1;
    const distance = distanceToSources(10, 1, sources);
    expect(Array.from(distance)).toEqual([0, 1, 2, 3, 4, 4, 3, 2, 1, 0]);
  });

  it("meldet „sehr weit“, wenn es keine Quelle gibt", () => {
    const distance = distanceToSources(3, 3, new Uint8Array(9));
    expect(Array.from(distance).every((value) => value === FAR_AWAY)).toBe(true);
  });
});
