import { describe, expect, it } from "vitest";
import { decodeRuns, encodeRuns } from "./runLength";

describe("Lauflängen-Kodierung", () => {
  it("fasst Wiederholungen zu Paaren „Wert, Anzahl“ zusammen", () => {
    expect(encodeRuns([0, 0, 0, 0, 0, 3, 3])).toEqual([0, 5, 3, 2]);
    expect(encodeRuns(new Uint8Array([7]))).toEqual([7, 1]);
    expect(encodeRuns([])).toEqual([]);
    expect(encodeRuns(new Int32Array([-1, -1, 5, -1]))).toEqual([-1, 2, 5, 1, -1, 1]);
  });

  it("hin und zurück ergibt dieselben Zahlen", () => {
    const values = new Uint8Array(1000);
    for (let i = 0; i < values.length; i++) {
      values[i] = (i * 7919) % 13 < 9 ? 0 : i % 256;
    }
    const target = new Uint8Array(values.length);
    expect(decodeRuns(encodeRuns(values), target, 0, 255)).toBeUndefined();
    expect(target).toEqual(values);
  });

  it("meldet kaputte Daten auf Deutsch", () => {
    const target = new Uint8Array(4);
    expect(decodeRuns([1, 2, 3], target, 0, 255)).toBe(
      "Die Liste muss aus Paaren (Wert, Anzahl) bestehen, hat aber eine ungerade Länge.",
    );
    expect(decodeRuns([1, 2, 256, 2], target, 0, 255)).toBe(
      "Paar 2: Der Wert 256 liegt nicht zwischen 0 und 255.",
    );
    expect(decodeRuns([1, 0, 1, 4], target, 0, 255)).toBe(
      "Paar 1: Die Anzahl muss eine ganze Zahl ab 1 sein, gefunden 0.",
    );
    expect(decodeRuns([1, 5], target, 0, 255)).toBe("Zu viele Werte: erwartet genau 4.");
    expect(decodeRuns([1, 3], target, 0, 255)).toBe("Zu wenige Werte: 3 statt 4.");
    expect(decodeRuns([1.5, 4], target, 0, 255)).toBe(
      "Paar 1: Der Wert 1.5 liegt nicht zwischen 0 und 255.",
    );
  });
});
