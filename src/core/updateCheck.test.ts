import { describe, expect, it } from "vitest";
import { isNewerBuild, parseBuildInfo } from "./updateCheck";

const current = { builtAt: "2026-11-18T18:00:00.000Z", commit: "aaaaaaa" };

describe("parseBuildInfo", () => {
  it("erkennt gültige Versionsangaben", () => {
    expect(parseBuildInfo({ builtAt: "2026-11-18T19:00:00.000Z", commit: "bbbbbbb" })).toEqual({
      builtAt: "2026-11-18T19:00:00.000Z",
      commit: "bbbbbbb",
    });
  });

  it("lehnt kaputte Daten ab", () => {
    expect(parseBuildInfo(null)).toBeNull();
    expect(parseBuildInfo("text")).toBeNull();
    expect(parseBuildInfo({ commit: "bbbbbbb" })).toBeNull();
    expect(parseBuildInfo({ builtAt: "kein Datum", commit: "bbbbbbb" })).toBeNull();
    expect(parseBuildInfo({ builtAt: "2026-11-18T19:00:00.000Z", commit: "" })).toBeNull();
  });
});

describe("isNewerBuild", () => {
  it("meldet eine später gebaute Version mit anderem Commit", () => {
    expect(isNewerBuild(current, { builtAt: "2026-11-18T19:00:00.000Z", commit: "bbbbbbb" })).toBe(
      true,
    );
  });

  it("meldet nichts bei gleichem Commit", () => {
    expect(isNewerBuild(current, { builtAt: "2026-11-18T19:00:00.000Z", commit: "aaaaaaa" })).toBe(
      false,
    );
  });

  it("meldet nichts, wenn die Online-Version älter ist", () => {
    expect(isNewerBuild(current, { builtAt: "2026-11-18T17:00:00.000Z", commit: "bbbbbbb" })).toBe(
      false,
    );
  });
});
