/**
 * Die Spiel-Schleife: das „Herz“, das bei jeder Bildschirm-Auffrischung schlägt.
 *
 * Bei jedem Schlag:
 * 1. Die Uhr bekommt die vergangene Zeit und meldet fällige Wirtschafts-Takte → die Simulation rechnet.
 * 2. Der Zeichen-Takt entscheidet, ob ein neues Bild gezeichnet wird (höchstens 60 pro Sekunde).
 *
 * Im Ruhebild schlägt das Herz langsamer (10-mal pro Sekunde über einen Zeitgeber statt bei jeder
 * Bildschirm-Auffrischung). Das spart Akku; die Simulation läuft trotzdem im richtigen Tempo weiter.
 * `stop()` hält die Schleife ganz an (Spiel im Hintergrund). Nach `start()` wird nichts nachgeholt.
 *
 * Die Browser-Funktionen kommen von außen (`LoopPlatform`), damit sich die Schleife testen lässt.
 */
import type { GameClock } from "../core/clock";
import type { FrameScheduler } from "../render/frameScheduler";

/** Die benötigten Browser-Funktionen (im Spiel: requestAnimationFrame, setTimeout, performance.now). */
export interface LoopPlatform {
  now(): number;
  requestFrame(callback: (timeMs: number) => void): number;
  cancelFrame(id: number): void;
  setTimer(callback: () => void, delayMs: number): number;
  clearTimer(id: number): void;
}

export interface GameLoopOptions {
  readonly clock: GameClock;
  readonly scheduler: FrameScheduler;
  /** Einen Wirtschafts-Takt rechnen */
  readonly onTick: () => void;
  /** Ein Bild zeichnen. `tickProgress` (0 bis 1) dient für weiche Bewegungen zwischen zwei Takten. */
  readonly onRender: (tickProgress: number) => void;
  readonly platform: LoopPlatform;
  /** Abstand der Herzschläge im Ruhebild (Standard: 100 ms) */
  readonly idleIntervalMs?: number;
}

/** Herzschlag im Ruhebild: 10-mal pro Sekunde. */
export const IDLE_LOOP_INTERVAL_MS = 100;

export function browserLoopPlatform(): LoopPlatform {
  return {
    now: () => performance.now(),
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (id) => {
      cancelAnimationFrame(id);
    },
    setTimer: (callback, delayMs) => window.setTimeout(callback, delayMs),
    clearTimer: (id) => {
      window.clearTimeout(id);
    },
  };
}

type Pending =
  { readonly kind: "frame"; readonly id: number } | { readonly kind: "timer"; readonly id: number };

export class GameLoop {
  private readonly options: GameLoopOptions;
  private readonly idleIntervalMs: number;
  private pending: Pending | undefined = undefined;
  private lastTimeMs: number | undefined = undefined;
  private isRunning = false;
  private framesDrawn = 0;

  constructor(options: GameLoopOptions) {
    this.options = options;
    this.idleIntervalMs = options.idleIntervalMs ?? IDLE_LOOP_INTERVAL_MS;
  }

  get running(): boolean {
    return this.isRunning;
  }

  /** Anzahl der bisher gezeichneten Bilder (für die Bildraten-Anzeige). */
  get renderedFrames(): number {
    return this.framesDrawn;
  }

  start(): void {
    if (this.isRunning) {
      return;
    }
    this.isRunning = true;
    this.lastTimeMs = undefined;
    this.options.scheduler.markActivity(this.options.platform.now());
    this.options.scheduler.requestRender();
    this.scheduleFrame();
  }

  stop(): void {
    this.isRunning = false;
    this.cancelPending();
    this.lastTimeMs = undefined;
  }

  /** Aus dem Ruhebild aufwecken: sofort wieder bei jeder Bildschirm-Auffrischung schlagen. */
  wake(): void {
    if (this.isRunning && this.pending?.kind === "timer") {
      this.cancelPending();
      this.scheduleFrame();
    }
  }

  private beat(timeMs: number): void {
    this.pending = undefined;
    if (!this.isRunning) {
      return;
    }
    const { clock, scheduler, onTick, onRender } = this.options;

    const elapsedMs = this.lastTimeMs === undefined ? 0 : timeMs - this.lastTimeMs;
    this.lastTimeMs = timeMs;

    const dueTicks = clock.advance(elapsedMs);
    for (let i = 0; i < dueTicks; i++) {
      onTick();
    }

    if (scheduler.shouldRender(timeMs)) {
      onRender(clock.tickProgress);
      this.framesDrawn += 1;
    }

    if (scheduler.isIdle(timeMs)) {
      this.scheduleTimer();
    } else {
      this.scheduleFrame();
    }
  }

  private scheduleFrame(): void {
    const id = this.options.platform.requestFrame((timeMs) => {
      this.beat(timeMs);
    });
    this.pending = { kind: "frame", id };
  }

  private scheduleTimer(): void {
    const { platform } = this.options;
    const id = platform.setTimer(() => {
      this.beat(platform.now());
    }, this.idleIntervalMs);
    this.pending = { kind: "timer", id };
  }

  private cancelPending(): void {
    const pending = this.pending;
    if (pending === undefined) {
      return;
    }
    if (pending.kind === "frame") {
      this.options.platform.cancelFrame(pending.id);
    } else {
      this.options.platform.clearTimer(pending.id);
    }
    this.pending = undefined;
  }
}
