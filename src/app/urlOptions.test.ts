import { describe, expect, it } from "vitest";
import { hashText } from "../core/random";
import { DEFAULT_SEED, readSeed, urlWithSeed } from "./urlOptions";

describe("Link-Zusätze", () => {
  it("liest den Seed aus dem Link, sonst gilt der Standard-Seed", () => {
    expect(readSeed("")).toBe(DEFAULT_SEED);
    expect(readSeed("?seed=")).toBe(DEFAULT_SEED);
    expect(readSeed("?seed=42")).toBe(42);
    expect(readSeed("?seed=Barock")).toBe(hashText("Barock"));
    expect(readSeed("?fps=45&seed=7")).toBe(7);
  });

  it("baut für „Neue Welt“ den Link mit neuem Seed und behält andere Zusätze", () => {
    const base = "https://nicozim14-pixel.github.io/kontor-und-krone/";
    expect(urlWithSeed(base, "42")).toBe(`${base}?seed=42`);
    expect(urlWithSeed(`${base}?fps=45&seed=7`, " Barock ")).toBe(`${base}?fps=45&seed=Barock`);
    expect(readSeed(new URL(urlWithSeed(base, "Schloss Sanssouci")).search)).toBe(
      hashText("Schloss Sanssouci"),
    );
  });
});
