import { describe, expect, it } from "vitest";
import {
  createRandomState,
  hashText,
  MAX_SEED,
  nextChance,
  nextFloat,
  nextInt,
  nextUint32,
  parseSeed,
  pickRandom,
  type RandomState,
} from "./random";

function firstNumbers(state: RandomState, count: number): number[] {
  return Array.from({ length: count }, () => nextUint32(state));
}

describe("Zufall mit Seed", () => {
  it("liefert bei gleichem Seed exakt dieselbe Folge", () => {
    expect(firstNumbers(createRandomState(1701, "world"), 50)).toEqual(
      firstNumbers(createRandomState(1701, "world"), 50),
    );
  });

  it("liefert bei anderem Seed eine andere Folge", () => {
    expect(firstNumbers(createRandomState(1701, "world"), 10)).not.toEqual(
      firstNumbers(createRandomState(1702, "world"), 10),
    );
  });

  it("hält getrennte Ströme unabhängig: Würfeln im einen ändert den anderen nicht", () => {
    const world = createRandomState(42, "world");
    const events = createRandomState(42, "events");
    expect(firstNumbers(world, 5)).not.toEqual(firstNumbers(events, 5));

    const untouched = firstNumbers(createRandomState(42, "world"), 20);
    const worldAgain = createRandomState(42, "world");
    const eventsAgain = createRandomState(42, "events");
    firstNumbers(eventsAgain, 1000); // viele Ereignis-Würfe …
    expect(firstNumbers(worldAgain, 20)).toEqual(untouched); // … ändern die Karte nicht
  });

  it("macht nach Speichern und Laden exakt so weiter", () => {
    const state = createRandomState(7, "events");
    firstNumbers(state, 100);
    const saved = JSON.stringify(state);
    const expected = firstNumbers(state, 20);
    const loaded = JSON.parse(saved) as RandomState;
    expect(firstNumbers(loaded, 20)).toEqual(expected);
  });

  it("speichert seinen Zustand als vier ganze Zahlen im erlaubten Bereich", () => {
    const state = createRandomState(MAX_SEED, "world");
    firstNumbers(state, 10);
    expect(state).toHaveLength(4);
    for (const value of state) {
      expect(Number.isInteger(value) && value >= 0 && value <= MAX_SEED).toBe(true);
    }
  });

  it("verteilt Kommazahlen gleichmäßig zwischen 0 und 1", () => {
    const state = createRandomState(123, "test");
    const buckets = new Array<number>(10).fill(0);
    const count = 20_000;
    for (let i = 0; i < count; i++) {
      const value = nextFloat(state);
      expect(value >= 0 && value < 1).toBe(true);
      const bucket = Math.floor(value * 10);
      buckets[bucket] = (buckets[bucket] ?? 0) + 1;
    }
    for (const filled of buckets) {
      // jedes Zehntel bekommt ungefähr 10 % (2.000 ± 10 %)
      expect(filled).toBeGreaterThan(1800);
      expect(filled).toBeLessThan(2200);
    }
  });

  it("würfelt ganze Zahlen innerhalb der Grenzen und trifft beide Ränder", () => {
    const state = createRandomState(5, "dice");
    const seen = new Set<number>();
    for (let i = 0; i < 1000; i++) {
      const value = nextInt(state, 1, 6);
      expect(value >= 1 && value <= 6).toBe(true);
      seen.add(value);
    }
    expect([...seen].sort()).toEqual([1, 2, 3, 4, 5, 6]);
    expect(() => nextInt(state, 6, 1)).toThrow(RangeError);
  });

  it("wählt aus Listen und trifft Wahrscheinlichkeiten ungefähr", () => {
    const state = createRandomState(9, "pick");
    expect(["a", "b", "c"]).toContain(pickRandom(state, ["a", "b", "c"]));
    expect(() => pickRandom(state, [])).toThrow(RangeError);
    let hits = 0;
    for (let i = 0; i < 10_000; i++) {
      if (nextChance(state, 0.25)) {
        hits += 1;
      }
    }
    expect(hits).toBeGreaterThan(2300);
    expect(hits).toBeLessThan(2700);
  });

  it("macht aus Zahlen und Wörtern einen Seed", () => {
    expect(parseSeed("1701")).toBe(1701);
    expect(parseSeed(" 42 ")).toBe(42);
    expect(parseSeed("Barock")).toBe(hashText("Barock"));
    expect(parseSeed("Barock")).toBe(parseSeed("Barock"));
    expect(parseSeed("Barock")).not.toBe(parseSeed("barock"));
    // zu groß für einen Seed → wird wie ein Wort umgerechnet
    expect(parseSeed("99999999999")).toBe(hashText("99999999999"));
    expect(() => createRandomState(-1, "world")).toThrow(RangeError);
    expect(() => createRandomState(1.5, "world")).toThrow(RangeError);
  });
});
