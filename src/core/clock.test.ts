import { describe, expect, it } from "vitest";
import { GameClock, isGameSpeed, MAX_COUNTED_FRAME_MS, TICK_MS } from "./clock";

/** Lässt die Uhr wie bei echten Bildern laufen und zählt die Takte. */
function runFrames(clock: GameClock, frames: number, frameMs: number): number {
  let ticks = 0;
  for (let i = 0; i < frames; i++) {
    ticks += clock.advance(frameMs);
  }
  return ticks;
}

describe("GameClock", () => {
  it("rechnet bei 1× alle 0,5 s einen Takt: 10 Takte dauern 5 Sekunden", () => {
    const clock = new GameClock(1);
    // 5 Sekunden bei 60 Bildern pro Sekunde
    expect(runFrames(clock, 300, 1000 / 60)).toBe(10);
  });

  it("ist unabhängig von der Bildrate", () => {
    const at30 = runFrames(new GameClock(1), 150, 1000 / 30);
    const at60 = runFrames(new GameClock(1), 300, 1000 / 60);
    const at90 = runFrames(new GameClock(1), 450, 1000 / 90);
    expect([at30, at60, at90]).toEqual([10, 10, 10]);
  });

  it("erzeugt in der Pause keine Takte", () => {
    const clock = new GameClock(0);
    expect(clock.isPaused).toBe(true);
    expect(runFrames(clock, 600, 1000 / 60)).toBe(0);
  });

  it("läuft bei 2× doppelt und bei 4× viermal so schnell", () => {
    expect(runFrames(new GameClock(2), 300, 1000 / 60)).toBe(20);
    expect(runFrames(new GameClock(4), 300, 1000 / 60)).toBe(40);
  });

  it("setzt nach der Pause genau dort fort, wo es aufgehört hat", () => {
    const clock = new GameClock(1);
    expect(clock.advance(200)).toBe(0);
    expect(clock.advance(200)).toBe(0);
    clock.setSpeed(0);
    expect(clock.advance(10_000)).toBe(0);
    expect(clock.tickProgress).toBeCloseTo(0.8);
    clock.setSpeed(1);
    expect(clock.advance(100)).toBe(1);
  });

  it("holt nach einem langen Hänger nicht alles auf einmal nach (keine Aufhol-Lawine)", () => {
    const clock = new GameClock(4);
    // 10 Sekunden ohne Bild: gezählt wird höchstens eine Viertelsekunde
    const ticks = clock.advance(10_000);
    expect(ticks).toBe(Math.floor((MAX_COUNTED_FRAME_MS * 4) / TICK_MS));
    expect(ticks).toBeLessThanOrEqual(2);
  });

  it("ignoriert ungültige Zeitangaben", () => {
    const clock = new GameClock(1);
    expect(clock.advance(-500)).toBe(0);
    expect(clock.advance(Number.NaN)).toBe(0);
    expect(clock.tickProgress).toBe(0);
  });

  it("meldet den Fortschritt bis zum nächsten Takt für weiche Bewegungen", () => {
    const clock = new GameClock(1);
    clock.advance(125);
    expect(clock.tickProgress).toBeCloseTo(0.25);
    clock.advance(125);
    expect(clock.tickProgress).toBeCloseTo(0.5);
  });

  it("kennt nur die erlaubten Geschwindigkeiten", () => {
    expect([0, 1, 2, 4].every(isGameSpeed)).toBe(true);
    expect([3, 8, -1, 0.5].some(isGameSpeed)).toBe(false);
  });
});
