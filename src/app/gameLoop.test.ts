import { describe, expect, it } from "vitest";
import { GameClock } from "../core/clock";
import { DEFAULT_FRAME_SCHEDULER_OPTIONS, FrameScheduler } from "../render/frameScheduler";
import { GameLoop, IDLE_LOOP_INTERVAL_MS, type LoopPlatform } from "./gameLoop";

/**
 * Ein nachgebauter Browser mit eigener Uhr: Bildschirm-Auffrischungen (90 Hz) und Zeitgeber
 * laufen nur, wenn der Test die Zeit mit `advance` vorspult.
 */
class FakePlatform implements LoopPlatform {
  time = 0;
  private nextId = 1;
  private frames = new Map<number, (timeMs: number) => void>();
  private timers = new Map<number, { at: number; callback: () => void }>();
  private nextRefresh = 0;
  readonly refreshMs = 1000 / 90;

  now(): number {
    return this.time;
  }
  requestFrame(callback: (timeMs: number) => void): number {
    const id = this.nextId++;
    this.frames.set(id, callback);
    return id;
  }
  cancelFrame(id: number): void {
    this.frames.delete(id);
  }
  setTimer(callback: () => void, delayMs: number): number {
    const id = this.nextId++;
    this.timers.set(id, { at: this.time + delayMs, callback });
    return id;
  }
  clearTimer(id: number): void {
    this.timers.delete(id);
  }

  /** Spult die Zeit vor und löst fällige Auffrischungen und Zeitgeber aus. */
  advance(durationMs: number): void {
    const end = this.time + durationMs;
    while (this.time < end) {
      const nextTimer = Math.min(
        ...[...this.timers.values()].map((timer) => timer.at),
        Number.POSITIVE_INFINITY,
      );
      const nextEvent = Math.min(this.nextRefresh, nextTimer);
      if (nextEvent > end) {
        this.time = end;
        break;
      }
      this.time = nextEvent;
      if (nextEvent === this.nextRefresh) {
        this.nextRefresh += this.refreshMs;
        const callbacks = [...this.frames.values()];
        this.frames.clear();
        for (const callback of callbacks) {
          callback(this.time);
        }
      } else {
        for (const [id, timer] of [...this.timers]) {
          if (timer.at <= this.time) {
            this.timers.delete(id);
            timer.callback();
          }
        }
      }
    }
  }

  get waitingForTimer(): boolean {
    return this.timers.size > 0;
  }
}

function setup(speed: 0 | 1 | 2 | 4 = 1) {
  const platform = new FakePlatform();
  const clock = new GameClock(speed);
  const scheduler = new FrameScheduler(DEFAULT_FRAME_SCHEDULER_OPTIONS);
  let ticks = 0;
  let renders = 0;
  const loop = new GameLoop({
    clock,
    scheduler,
    platform,
    onTick: () => (ticks += 1),
    onRender: () => (renders += 1),
  });
  return {
    platform,
    clock,
    scheduler,
    loop,
    get ticks() {
      return ticks;
    },
    get renders() {
      return renders;
    },
  };
}

describe("Spiel-Schleife", () => {
  it("rechnet 2 Takte pro Sekunde und zeichnet bei Bewegung bis zu 60 Bilder pro Sekunde", () => {
    const game = setup();
    game.loop.start();
    for (let i = 0; i < 5; i++) {
      game.scheduler.markActivity(game.platform.time);
      game.platform.advance(1000);
    }
    game.platform.advance(5); // die Auffrischung genau an der Sekundengrenze mitnehmen
    expect(game.ticks).toBe(10);
    expect(game.renders / 5).toBeGreaterThanOrEqual(58);
    expect(game.renders / 5).toBeLessThanOrEqual(61);
    expect(game.loop.renderedFrames).toBe(game.renders);
  });

  it("schlägt im Ruhebild langsamer, rechnet aber im richtigen Tempo weiter", () => {
    const game = setup();
    game.loop.start();
    game.platform.advance(3000); // ohne Bewegung → Ruhebild
    expect(game.platform.waitingForTimer).toBe(true);
    const rendersBefore = game.renders;
    game.platform.advance(10_050);
    expect(game.ticks).toBe(26); // 13 Sekunden × 2 Takte
    expect(game.renders - rendersBefore).toBeLessThanOrEqual(11); // etwa ein Kontrollbild pro Sekunde
    expect(IDLE_LOOP_INTERVAL_MS).toBeLessThanOrEqual(250);
  });

  it("wacht bei Bewegung sofort aus dem Ruhebild auf", () => {
    const game = setup();
    game.loop.start();
    game.platform.advance(5000);
    expect(game.platform.waitingForTimer).toBe(true);
    game.scheduler.markActivity(game.platform.time);
    game.loop.wake();
    expect(game.platform.waitingForTimer).toBe(false);
    const rendersBefore = game.renders;
    game.platform.advance(20);
    expect(game.renders).toBeGreaterThan(rendersBefore);
  });

  it("rechnet in der Pause keine Takte, zeichnet aber weiter", () => {
    const game = setup(0);
    game.loop.start();
    game.scheduler.markActivity(0);
    game.platform.advance(1000);
    expect(game.ticks).toBe(0);
    expect(game.renders).toBeGreaterThan(0);
  });

  it("steht im Hintergrund still und holt danach nichts nach", () => {
    const game = setup();
    game.loop.start();
    game.platform.advance(1005);
    expect(game.ticks).toBe(2);

    game.loop.stop(); // App gewechselt
    game.platform.advance(60_000);
    expect(game.ticks).toBe(2);
    expect(game.loop.running).toBe(false);

    game.loop.start(); // zurück: läuft sofort weiter (E-018)
    // Gezählt wird ab der ersten Bildschirm-Auffrischung nach der Rückkehr (bis zu 11 ms später)
    game.platform.advance(1020);
    expect(game.ticks).toBe(4);
  });
});
