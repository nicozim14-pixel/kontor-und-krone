import { describe, expect, it } from "vitest";
import { hashText } from "../core/random";
import { DEFAULT_SEED, readSeed } from "./urlOptions";

describe("Link-Zusätze", () => {
  it("liest den Seed aus dem Link, sonst gilt der Standard-Seed", () => {
    expect(readSeed("")).toBe(DEFAULT_SEED);
    expect(readSeed("?seed=")).toBe(DEFAULT_SEED);
    expect(readSeed("?seed=42")).toBe(42);
    expect(readSeed("?seed=Barock")).toBe(hashText("Barock"));
    expect(readSeed("?fps=45&seed=7")).toBe(7);
  });
});
