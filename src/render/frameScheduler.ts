/**
 * Der Zeichen-Takt: entscheidet bei jeder Bildschirm-Auffrischung, ob ein neues Bild gezeichnet wird.
 *
 * 1. Bildraten-Begrenzer (E-015): höchstens 60 Bilder pro Sekunde, auch auf dem 90-Hz-Bildschirm
 *    des Tablets. Das schont Akku und hält das Gerät kühler.
 * 2. Ruhebild (Akku schonen): Bewegt sich eine Weile nichts (kein Finger, Kamera steht, keine
 *    Animation), wird nur noch gezeichnet, wenn sich etwas ändert, plus ein Kontrollbild pro Sekunde.
 *
 * Reine Rechenlogik ohne Browser und ohne Babylon.js, damit sie sich testen lässt.
 */

export interface FrameSchedulerOptions {
  /** Höchstens so viele Bilder pro Sekunde */
  readonly maxFps: number;
  /** Nach so vielen Millisekunden ohne Bewegung beginnt das Ruhebild */
  readonly idleAfterMs: number;
  /** Im Ruhebild: spätestens nach so vielen Millisekunden ein Kontrollbild */
  readonly heartbeatMs: number;
}

/** Bildraten-Begrenzer (E-015). */
export const DEFAULT_MAX_FPS = 60;

export const DEFAULT_FRAME_SCHEDULER_OPTIONS: FrameSchedulerOptions = {
  maxFps: DEFAULT_MAX_FPS,
  idleAfterMs: 2000,
  heartbeatMs: 1000,
};

/** Erlaubter Bereich für den Link-Zusatz `?fps=…`. */
export const MIN_FPS = 10;
export const MAX_FPS = 120;

/** Name des Link-Zusatzes, z. B. "?fps=45" zum Vergleichen am Tablet. */
export const FPS_URL_PARAMETER = "fps";

/**
 * Spielraum in Millisekunden: Bildschirm-Auffrischungen kommen nie auf die Millisekunde genau.
 * Ohne ihn würde manches fällige Bild knapp verpasst.
 */
const TIMING_TOLERANCE_MS = 2;

/** Liest die gewünschte Höchst-Bildrate aus dem Link-Zusatz; sonst 60. */
export function parseMaxFps(search: string): number {
  const raw = new URLSearchParams(search).get(FPS_URL_PARAMETER);
  if (raw === null) {
    return DEFAULT_MAX_FPS;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) {
    return DEFAULT_MAX_FPS;
  }
  return Math.min(MAX_FPS, Math.max(MIN_FPS, value));
}

export class FrameScheduler {
  private readonly frameIntervalMs: number;
  private readonly options: FrameSchedulerOptions;
  /** Zeitpunkt, ab dem das nächste Bild fällig ist (Begrenzer) */
  private nextDueMs: number | undefined = undefined;
  private lastActivityMs = Number.NEGATIVE_INFINITY;
  private lastRenderMs = Number.NEGATIVE_INFINITY;
  private renderRequested = true;

  constructor(options: FrameSchedulerOptions = DEFAULT_FRAME_SCHEDULER_OPTIONS) {
    this.options = options;
    this.frameIntervalMs = 1000 / options.maxFps;
  }

  get maxFps(): number {
    return this.options.maxFps;
  }

  /** Etwas bewegt sich (Finger, Kamera, Animation): sofort wieder flüssig zeichnen. */
  markActivity(nowMs: number): void {
    this.lastActivityMs = Math.max(this.lastActivityMs, nowMs);
  }

  /** Etwas Sichtbares hat sich einmalig geändert: beim nächsten Mal sicher ein Bild zeichnen. */
  requestRender(): void {
    this.renderRequested = true;
  }

  /** Ist gerade Ruhebild? */
  isIdle(nowMs: number): boolean {
    return nowMs - this.lastActivityMs >= this.options.idleAfterMs;
  }

  /**
   * Wird bei jeder Bildschirm-Auffrischung gefragt. Antwortet `true`, wenn jetzt gezeichnet werden soll.
   * Das Zeichnen gilt damit als erledigt.
   */
  shouldRender(nowMs: number): boolean {
    if (this.isIdle(nowMs)) {
      if (this.renderRequested || nowMs - this.lastRenderMs >= this.options.heartbeatMs) {
        this.recordRender(nowMs);
        return true;
      }
      return false;
    }

    if (this.nextDueMs !== undefined && nowMs < this.nextDueMs - TIMING_TOLERANCE_MS) {
      return false;
    }
    this.recordRender(nowMs);
    return true;
  }

  private recordRender(nowMs: number): void {
    // Der nächste Termin rückt um genau ein Intervall weiter. So entstehen auch bei 90 Hz
    // im Schnitt 60 Bilder pro Sekunde (2 von 3 Auffrischungen). Lag das letzte Bild weit
    // zurück (Ruhebild, Hänger), wird nicht nachgeholt, sondern ab jetzt neu gezählt.
    this.nextDueMs =
      this.nextDueMs === undefined
        ? nowMs + this.frameIntervalMs
        : Math.max(this.nextDueMs + this.frameIntervalMs, nowMs);
    this.lastRenderMs = nowMs;
    this.renderRequested = false;
  }
}
