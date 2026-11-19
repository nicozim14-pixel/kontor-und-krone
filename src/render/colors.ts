import { Color3 } from "@babylonjs/core/Maths/math.color";

/** Wandelt eine Farbe wie "#8fb565" (aus den Datendateien) in eine Babylon-Farbe um. */
export function colorFromHex(hex: string): Color3 {
  return Color3.FromHexString(hex);
}

/** Mischt zwei Farben: `amount` 0 = nur `a`, 1 = nur `b`. */
export function mixColors(a: Color3, b: Color3, amount: number): Color3 {
  return Color3.Lerp(a, b, Math.min(1, Math.max(0, amount)));
}

/**
 * Kleine, feste „Zufallszahl“ von 0 bis 1 aus einer ganzen Zahl (z. B. der Stelle einer Kachel).
 * Nur für die Optik (leichte Farb- und Größenunterschiede); die Spiellogik würfelt mit core/random.ts.
 */
export function hashToUnit(value: number, salt = 0): number {
  let h = Math.imul(value ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(salt + 1, 0xc2b2ae35);
  h = Math.imul(h ^ (h >>> 13), 0x27d4eb2d);
  h ^= h >>> 16;
  return (h >>> 0) / 0x1_0000_0000;
}
