import { describe, expect, it } from "vitest";
import { FpsMeter } from "./fpsMeter";
import { formatGameTime, formatNumber } from "./format";

describe("Debug-Anzeige: Schreibweise", () => {
  it("schreibt Zahlen mit Tausenderpunkt", () => {
    expect(formatNumber(0)).toBe("0");
    expect(formatNumber(999)).toBe("999");
    expect(formatNumber(12345)).toBe("12.345");
    expect(formatNumber(1_000_000)).toBe("1.000.000");
  });

  it("rechnet Takte in Spielzeit um (1 Takt = 0,5 s)", () => {
    expect(formatGameTime(0)).toBe("0:00");
    expect(formatGameTime(1)).toBe("0:00");
    expect(formatGameTime(2)).toBe("0:01");
    expect(formatGameTime(124)).toBe("1:02");
    expect(formatGameTime(7199)).toBe("59:59");
    expect(formatGameTime(7200)).toBe("1:00:00");
    expect(formatGameTime(7322)).toBe("1:01:01");
  });
});

describe("Bildraten-Messung", () => {
  it("braucht mindestens zwei Messpunkte", () => {
    const meter = new FpsMeter();
    expect(meter.fps).toBeUndefined();
    meter.add(0, 0);
    expect(meter.fps).toBeUndefined();
  });

  it("misst 60 Bilder pro Sekunde", () => {
    const meter = new FpsMeter();
    for (let time = 0; time <= 2000; time += 250) {
      meter.add(time, (time / 1000) * 60);
    }
    expect(meter.fps).toBeCloseTo(60);
  });

  it("schaut nur auf die letzte Sekunde", () => {
    const meter = new FpsMeter();
    // 2 Sekunden lang 60 Bilder pro Sekunde, dann 2 Sekunden Ruhebild mit 1 Bild pro Sekunde
    let frames = 0;
    for (let time = 0; time <= 4000; time += 250) {
      meter.add(time, frames);
      frames += time < 2000 ? 15 : 0.25;
    }
    expect(meter.fps).toBeCloseTo(1);
  });

  it("beginnt nach reset() von vorn", () => {
    const meter = new FpsMeter();
    meter.add(0, 0);
    meter.add(1000, 60);
    meter.reset();
    expect(meter.fps).toBeUndefined();
  });
});
