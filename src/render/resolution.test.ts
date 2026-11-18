import { describe, expect, it } from "vitest";
import { computeHardwareScalingLevel, parseRenderScalePercent } from "./resolution";

describe("parseRenderScalePercent", () => {
  it("nimmt 100 %, wenn kein Link-Zusatz da ist", () => {
    expect(parseRenderScalePercent("")).toBe(100);
    expect(parseRenderScalePercent("?andereswert=3")).toBe(100);
  });

  it("liest den Wert aus dem Link-Zusatz", () => {
    expect(parseRenderScalePercent("?aufloesung=50")).toBe(50);
  });

  it("begrenzt auf 25 bis 100 %", () => {
    expect(parseRenderScalePercent("?aufloesung=5")).toBe(25);
    expect(parseRenderScalePercent("?aufloesung=300")).toBe(100);
  });

  it("ignoriert ungültige Werte", () => {
    expect(parseRenderScalePercent("?aufloesung=abc")).toBe(100);
  });
});

describe("computeHardwareScalingLevel", () => {
  it("zeichnet auf einem normalen Bildschirm mit einem Bildpunkt pro Punkt", () => {
    expect(computeHardwareScalingLevel(1, 100)).toBe(1);
  });

  it("nutzt doppelte Pixeldichte voll aus", () => {
    expect(computeHardwareScalingLevel(2, 100)).toBe(0.5);
  });

  it("begrenzt sehr hohe Pixeldichte auf das Doppelte", () => {
    expect(computeHardwareScalingLevel(3, 100)).toBe(0.5);
  });

  it("halbiert die Auflösung bei 50 %", () => {
    expect(computeHardwareScalingLevel(1, 50)).toBe(2);
    expect(computeHardwareScalingLevel(2, 50)).toBe(1);
  });

  it("behandelt ungültige Pixeldichte wie 1", () => {
    expect(computeHardwareScalingLevel(0, 100)).toBe(1);
    expect(computeHardwareScalingLevel(Number.NaN, 100)).toBe(1);
  });
});
