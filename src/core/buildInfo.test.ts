import { describe, expect, it } from "vitest";
import { formatBuildInfo, readBuildInfo } from "./buildInfo";

describe("formatBuildInfo", () => {
  it("zeigt Datum, Uhrzeit (deutsche Zeit) und Commit-Kürzel", () => {
    const text = formatBuildInfo(
      { builtAt: "2026-11-18T18:42:00.000Z", commit: "1b91c9f" },
      "Europe/Berlin",
    );
    expect(text).toBe("18.11.2026, 19:42 · 1b91c9f");
  });

  it("beachtet die Sommerzeit", () => {
    const text = formatBuildInfo(
      { builtAt: "2026-07-01T10:05:00.000Z", commit: "abc1234" },
      "Europe/Berlin",
    );
    expect(text).toBe("01.07.2026, 12:05 · abc1234");
  });

  it("zeigt bei ungültigem Datum nur das Commit-Kürzel", () => {
    expect(formatBuildInfo({ builtAt: "kaputt", commit: "abc1234" })).toBe("abc1234");
  });
});

describe("readBuildInfo", () => {
  it("liefert die beim Bauen eingesetzten Werte", () => {
    const info = readBuildInfo();
    expect(Number.isNaN(new Date(info.builtAt).getTime())).toBe(false);
    expect(info.commit.length).toBeGreaterThan(0);
  });
});
