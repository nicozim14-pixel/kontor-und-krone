/**
 * Misst die Bildrate (FPS = gezeichnete Bilder pro Sekunde) über ein gleitendes Zeitfenster.
 *
 * Die Debug-Anzeige meldet regelmäßig (z. B. 4-mal pro Sekunde) die Uhrzeit und die Zahl der
 * bisher gezeichneten Bilder. Daraus wird die Bildrate der letzten Sekunde berechnet.
 * Reine Rechenlogik ohne Browser, damit sie sich testen lässt.
 */

interface Sample {
  readonly timeMs: number;
  readonly frames: number;
}

/** Standard-Zeitfenster: die letzte Sekunde. */
export const FPS_WINDOW_MS = 1000;

export class FpsMeter {
  private readonly windowMs: number;
  private samples: Sample[] = [];

  constructor(windowMs = FPS_WINDOW_MS) {
    this.windowMs = windowMs;
  }

  /** Neuer Messpunkt: Uhrzeit in Millisekunden und Gesamtzahl der bisher gezeichneten Bilder. */
  add(timeMs: number, frames: number): void {
    this.samples.push({ timeMs, frames });
    // Alte Messpunkte verwerfen, aber einen behalten, der mindestens das Zeitfenster zurückliegt.
    while (
      this.samples.length > 2 &&
      (this.samples[1]?.timeMs ?? timeMs) <= timeMs - this.windowMs
    ) {
      this.samples.shift();
    }
  }

  /** Alle Messpunkte verwerfen (z. B. nach dem Zurückkehren aus dem Hintergrund). */
  reset(): void {
    this.samples = [];
  }

  /** Bildrate im Zeitfenster, oder `undefined`, solange noch zu wenige Messpunkte da sind. */
  get fps(): number | undefined {
    const first = this.samples[0];
    const last = this.samples[this.samples.length - 1];
    if (first === undefined || last === undefined || last.timeMs <= first.timeMs) {
      return undefined;
    }
    return ((last.frames - first.frames) * 1000) / (last.timeMs - first.timeMs);
  }
}
