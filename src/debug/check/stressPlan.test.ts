import { describe, expect, it } from "vitest";
import {
  buildStressPlan,
  describeOutcome,
  describeStage,
  formatResultLine,
  rateFps,
  shouldSkipStage,
  summarizeFrames,
  type StageResult,
} from "./stressPlan";

describe("buildStressPlan", () => {
  it("erstellt 19 Stufen: 4 Mengen × mit/ohne Schatten × 2 Auflösungen + 3 Draw-Call-Stufen", () => {
    const plan = buildStressPlan();
    expect(plan).toHaveLength(19);
    expect(plan.map((stage) => stage.number)).toEqual(
      Array.from({ length: 19 }, (_, index) => index + 1),
    );
    expect(plan.slice(16).map((stage) => [stage.kind, stage.objectCount])).toEqual([
      ["einzeln", 100],
      ["einzeln", 300],
      ["einzeln", 1000],
    ]);
  });

  it("beginnt leicht und wird schwerer", () => {
    const plan = buildStressPlan([500, 2000], [100, 50], []);
    expect(plan.map((s) => [s.resolutionPercent, s.shadows, s.objectCount])).toEqual([
      [100, false, 500],
      [100, false, 2000],
      [100, true, 500],
      [100, true, 2000],
      [50, false, 500],
      [50, false, 2000],
      [50, true, 500],
      [50, true, 2000],
    ]);
  });
});

describe("shouldSkipStage", () => {
  const plan = buildStressPlan([500, 2000, 10_000], [100], []);
  const [small, medium, large, smallShadow] = plan;
  if (!small || !medium || !large || !smallShadow) {
    throw new Error("Testplan unvollständig");
  }
  const tooSlow: StageResult = { stage: medium, status: "zu langsam", triangles: 0 };

  it("überspringt größere Stufen derselben Einstellung nach „zu langsam“", () => {
    expect(shouldSkipStage(large, [tooSlow])).toBe(true);
  });

  it("überspringt keine Stufen mit anderen Einstellungen", () => {
    expect(shouldSkipStage(smallShadow, [tooSlow])).toBe(false);
  });

  it("überspringt auch nach einer gemessenen Stufe unter 8 FPS", () => {
    const crawling: StageResult = {
      stage: medium,
      status: "gemessen",
      averageFps: 5,
      triangles: 0,
    };
    expect(shouldSkipStage(large, [crawling])).toBe(true);
  });

  it("trennt gestempelte und einzeln gezeichnete Objekte", () => {
    const [separate] = buildStressPlan([], [100], [5000]);
    if (!separate) {
      throw new Error("Testplan unvollständig");
    }
    expect(shouldSkipStage(separate, [tooSlow])).toBe(false);
  });

  it("überspringt nichts, wenn alles gemessen wurde", () => {
    const fine: StageResult = { stage: medium, status: "gemessen", averageFps: 60, triangles: 0 };
    expect(shouldSkipStage(large, [fine])).toBe(false);
  });
});

describe("summarizeFrames", () => {
  it("berechnet die durchschnittliche Bildrate und das langsamste Bild", () => {
    // 120 Bilder in 4 Sekunden = 30 Bilder pro Sekunde
    const frames = Array.from({ length: 120 }, (_, index) => (index === 10 ? 80 : 33));
    expect(summarizeFrames(frames, 4000)).toEqual({ averageFps: 30, worstFrameMs: 80 });
  });

  it("liefert 0 ohne Messwerte", () => {
    expect(summarizeFrames([], 4000)).toEqual({ averageFps: 0, worstFrameMs: 0 });
  });
});

describe("rateFps", () => {
  it("bewertet ab 30 als gut, ab 20 als knapp, darunter als zu langsam", () => {
    expect(rateFps(60)).toBe("gut");
    expect(rateFps(30)).toBe("gut");
    expect(rateFps(29.9)).toBe("knapp");
    expect(rateFps(20)).toBe("knapp");
    expect(rateFps(19.9)).toBe("zu langsam");
  });
});

describe("formatResultLine", () => {
  it("schreibt eine verständliche Zeile im deutschen Zahlenformat", () => {
    const stage = {
      number: 3,
      kind: "gestempelt" as const,
      objectCount: 10_000,
      shadows: true,
      resolutionPercent: 50,
    };
    const result: StageResult = {
      stage,
      status: "gemessen",
      averageFps: 42.25,
      worstFrameMs: 51.4,
      triangles: 640_000,
      canvasSize: "960×600",
    };
    expect(formatResultLine(result)).toBe(
      " 3. 10.000 Objekte · mit Schatten · 50 % Auflösung | 42,3 FPS | langsamstes Bild 51 ms | 960×600 | 640.000 Dreiecke | ✅ gut",
    );
  });

  it("kennzeichnet übersprungene Stufen", () => {
    const stage = {
      number: 4,
      kind: "gestempelt" as const,
      objectCount: 30_000,
      shadows: true,
      resolutionPercent: 50,
    };
    expect(describeOutcome({ stage, status: "übersprungen", triangles: 0 })).toBe("– übersprungen");
  });
});

describe("describeStage", () => {
  it("kennzeichnet einzeln gezeichnete Objekte als Draw Calls", () => {
    const [separate] = buildStressPlan([], [100], [1000]);
    if (!separate) {
      throw new Error("Testplan unvollständig");
    }
    expect(describeStage(separate)).toBe(
      "1.000 Einzelobjekte (Draw Calls) · ohne Schatten · 100 % Auflösung",
    );
  });
});
