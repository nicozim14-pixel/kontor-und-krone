import { describe, expect, it } from "vitest";
import {
  describeBuildTargetFit,
  describeMemory,
  describeScreen,
  estimateRefreshRate,
  findChromeBrand,
  formatInfoText,
  parseChromeMajorFromUserAgent,
} from "./deviceInfo";

describe("parseChromeMajorFromUserAgent", () => {
  it("liest die Chrome-Hauptversion eines Android-Tablets", () => {
    const userAgent =
      "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36";
    expect(parseChromeMajorFromUserAgent(userAgent)).toBe(142);
  });

  it("liefert nichts für Browser ohne Chrome-Kennung", () => {
    expect(parseChromeMajorFromUserAgent("Mozilla/5.0 Firefox/140.0")).toBeUndefined();
  });
});

describe("findChromeBrand", () => {
  it("bevorzugt „Google Chrome“ vor „Chromium“ und ignoriert Platzhalter-Marken", () => {
    const brands = [
      { brand: "Not_A Brand", version: "24.0.0.0" },
      { brand: "Chromium", version: "142.0.7444.10" },
      { brand: "Google Chrome", version: "142.0.7444.10" },
    ];
    expect(findChromeBrand(brands)).toEqual({ name: "Google Chrome", version: "142.0.7444.10" });
  });

  it("liefert nichts ohne bekannte Marke", () => {
    expect(findChromeBrand([{ brand: "Not_A Brand", version: "8" }])).toBeUndefined();
  });
});

describe("describeBuildTargetFit", () => {
  it("meldet, ob die Chrome-Version für das Spiel reicht (ab 111)", () => {
    expect(describeBuildTargetFit(142)).toBe("ja ✅ (Chrome 142, nötig ab 111)");
    expect(describeBuildTargetFit(111)).toBe("ja ✅ (Chrome 111, nötig ab 111)");
    expect(describeBuildTargetFit(110)).toBe("nein ❌ (Chrome 110, nötig ab 111)");
    expect(describeBuildTargetFit(undefined)).toBe("unbekannt (Chrome ab Version 111 nötig)");
  });
});

describe("describeMemory", () => {
  it("weist auf die Rundung und die Obergrenze von Chrome hin", () => {
    expect(describeMemory(4)).toBe("ca. 4 GB (gerundet)");
    expect(describeMemory(0.5)).toBe("ca. 0,5 GB (gerundet)");
    expect(describeMemory(8)).toBe("mindestens 8 GB");
    expect(describeMemory(undefined)).toBe("nicht auslesbar");
  });
});

describe("describeScreen", () => {
  it("rechnet Punkte in echte Bildpunkte um", () => {
    expect(describeScreen(1280, 800, 1.5)).toBe("1280 × 800 Punkte = 1920 × 1200 Bildpunkte");
  });
});

describe("estimateRefreshRate", () => {
  it("schätzt 60 Hz aus Abständen um 16,7 ms, auch mit Ausreißern", () => {
    expect(estimateRefreshRate([16.6, 16.7, 33.4, 16.7, 16.8, 2])).toBe(60);
  });

  it("liefert nichts ohne Messwerte", () => {
    expect(estimateRefreshRate([])).toBeUndefined();
  });
});

describe("formatInfoText", () => {
  it("schreibt eine Zeile pro Angabe", () => {
    expect(
      formatInfoText([
        { label: "WebGL2", value: "ja" },
        { label: "Touch", value: "ja (bis zu 10 Finger)" },
      ]),
    ).toBe("WebGL2: ja\nTouch: ja (bis zu 10 Finger)");
  });
});
