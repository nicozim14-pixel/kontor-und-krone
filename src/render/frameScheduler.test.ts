import { describe, expect, it } from "vitest";
import { DEFAULT_FRAME_SCHEDULER_OPTIONS, FrameScheduler, parseMaxFps } from "./frameScheduler";

/**
 * Spielt Bildschirm-Auffrischungen mit einer festen Bildwiederholrate durch und zählt die gezeichneten Bilder.
 * Mit `active` meldet bei jeder Auffrischung „etwas bewegt sich“ (wie ein Finger auf dem Bildschirm).
 */
function simulate(
  scheduler: FrameScheduler,
  { hz, fromMs, toMs, active }: { hz: number; fromMs: number; toMs: number; active: boolean },
): number {
  let drawn = 0;
  const refreshMs = 1000 / hz;
  for (let now = fromMs; now < toMs; now += refreshMs) {
    if (active) {
      scheduler.markActivity(now);
    }
    if (scheduler.shouldRender(now)) {
      drawn += 1;
    }
  }
  return drawn;
}

function newScheduler(maxFps = 60): FrameScheduler {
  return new FrameScheduler({ ...DEFAULT_FRAME_SCHEDULER_OPTIONS, maxFps });
}

describe("Zeichen-Takt", () => {
  it("zeichnet auf dem 90-Hz-Bildschirm des Tablets im Schnitt 60 Bilder pro Sekunde", () => {
    const drawn = simulate(newScheduler(), { hz: 90, fromMs: 0, toMs: 10_000, active: true });
    expect(drawn / 10).toBeGreaterThanOrEqual(59);
    expect(drawn / 10).toBeLessThanOrEqual(61);
  });

  it("zeichnet auf 60-Hz-Bildschirmen jedes Bild und auf 120 Hz jedes zweite", () => {
    expect(
      simulate(newScheduler(), { hz: 60, fromMs: 0, toMs: 10_000, active: true }),
    ).toBeGreaterThanOrEqual(599);
    const at120 = simulate(newScheduler(), { hz: 120, fromMs: 0, toMs: 10_000, active: true });
    expect(at120 / 10).toBeGreaterThanOrEqual(59);
    expect(at120 / 10).toBeLessThanOrEqual(61);
  });

  it("verkraftet ungenaue Bildschirm-Auffrischungen ohne Bilder zu verlieren", () => {
    const scheduler = newScheduler();
    let drawn = 0;
    let now = 0;
    for (let i = 0; i < 600; i++) {
      now += 1000 / 60 + (i % 2 === 0 ? 0.9 : -0.9); // 60 Hz mit Zittern
      scheduler.markActivity(now);
      if (scheduler.shouldRender(now)) {
        drawn += 1;
      }
    }
    expect(drawn).toBeGreaterThanOrEqual(598);
  });

  it("lässt sich per Link-Zusatz auf 45 Bilder pro Sekunde stellen", () => {
    const drawn = simulate(newScheduler(45), { hz: 90, fromMs: 0, toMs: 10_000, active: true });
    expect(drawn / 10).toBeGreaterThanOrEqual(44);
    expect(drawn / 10).toBeLessThanOrEqual(46);
    expect(parseMaxFps("?fps=45")).toBe(45);
    expect(parseMaxFps("")).toBe(60);
    expect(parseMaxFps("?fps=abc")).toBe(60);
    expect(parseMaxFps("?fps=500")).toBe(120);
    expect(parseMaxFps("?fps=1")).toBe(10);
  });

  it("wechselt ins Ruhebild, wenn sich 2 Sekunden nichts bewegt: dann nur noch ein Kontrollbild pro Sekunde", () => {
    const scheduler = newScheduler();
    simulate(scheduler, { hz: 90, fromMs: 0, toMs: 1000, active: true });
    expect(scheduler.isIdle(2500)).toBe(false);
    expect(scheduler.isIdle(3100)).toBe(true);
    // 10 Sekunden Ruhe ab dem Beginn des Ruhebilds
    const drawn = simulate(scheduler, { hz: 90, fromMs: 3100, toMs: 13_100, active: false });
    expect(drawn).toBeGreaterThanOrEqual(9);
    expect(drawn).toBeLessThanOrEqual(11);
  });

  it("zeichnet im Ruhebild sofort, wenn sich etwas Sichtbares ändert", () => {
    const scheduler = newScheduler();
    expect(scheduler.shouldRender(10_000)).toBe(true); // Kontrollbild
    expect(scheduler.shouldRender(10_100)).toBe(false);
    scheduler.requestRender();
    expect(scheduler.shouldRender(10_200)).toBe(true);
    expect(scheduler.shouldRender(10_300)).toBe(false);
  });

  it("wird bei Bewegung sofort wieder flüssig", () => {
    const scheduler = newScheduler();
    simulate(scheduler, { hz: 90, fromMs: 0, toMs: 5000, active: false });
    expect(scheduler.isIdle(5000)).toBe(true);
    scheduler.markActivity(5000);
    expect(scheduler.isIdle(5000)).toBe(false);
    const drawn = simulate(scheduler, { hz: 90, fromMs: 5000, toMs: 6000, active: true });
    expect(drawn).toBeGreaterThanOrEqual(59);
    expect(drawn).toBeLessThanOrEqual(61);
  });
});
