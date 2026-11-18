/**
 * Die Uhr des Spiels: Sie sagt, wann der nächste Wirtschafts-Takt fällig ist.
 *
 * Ein Takt dauert 0,5 Sekunden Spielzeit (Masterplan), egal wie schnell das Tablet zeichnet.
 * Die Uhr bekommt bei jedem Bild die vergangene echte Zeit und antwortet mit der Zahl
 * der fälligen Takte (meist 0 oder 1). Sie misst die Zeit nicht selbst, damit sie sich
 * ohne Browser testen lässt.
 */

/** Dauer eines Wirtschafts-Takts in Millisekunden Spielzeit. */
export const TICK_MS = 500;

/**
 * Höchstens so viel echte Zeit (in Millisekunden) wird pro Bild gezählt.
 * Schutz vor der „Aufhol-Lawine“: Nach einem Hänger werden nicht alle verpassten Takte
 * auf einmal nachgeholt. Der Rest verfällt; das Spiel läuft dann kurz langsamer.
 */
export const MAX_COUNTED_FRAME_MS = 250;

/**
 * Winziger Spielraum gegen Rundungsfehler: 300 Bilder à 1000/60 ms ergeben im Computer
 * 4999,999… statt genau 5000 ms. Ohne Spielraum fehlte dann ein Takt.
 */
const ROUNDING_TOLERANCE_MS = 1e-6;

/** Erlaubte Spielgeschwindigkeiten: 0 = Pause, sonst Vielfaches der Normalgeschwindigkeit. */
export const GAME_SPEEDS = [0, 1, 2, 4] as const;

export type GameSpeed = (typeof GAME_SPEEDS)[number];

export class GameClock {
  private currentSpeed: GameSpeed;
  /** Gesammelte Spielzeit seit dem letzten Takt (immer kleiner als TICK_MS). */
  private accumulatedMs = 0;

  constructor(speed: GameSpeed = 1) {
    this.currentSpeed = speed;
  }

  get speed(): GameSpeed {
    return this.currentSpeed;
  }

  get isPaused(): boolean {
    return this.currentSpeed === 0;
  }

  setSpeed(speed: GameSpeed): void {
    this.currentSpeed = speed;
  }

  /**
   * Wie weit ist der nächste Takt schon fortgeschritten? 0 = gerade erst begonnen, knapp 1 = gleich fällig.
   * Die Darstellung braucht das, um Bewegungen zwischen zwei Takten weich zu zeichnen.
   */
  get tickProgress(): number {
    return this.accumulatedMs / TICK_MS;
  }

  /**
   * Meldet der Uhr die seit dem letzten Bild vergangene echte Zeit.
   * @returns Anzahl der jetzt fälligen Wirtschafts-Takte
   */
  advance(realElapsedMs: number): number {
    // Ungültige oder negative Zeitangaben (z. B. nach einer Uhr-Umstellung) werden ignoriert.
    if (!(realElapsedMs > 0) || this.currentSpeed === 0) {
      return 0;
    }
    const countedMs = Math.min(realElapsedMs, MAX_COUNTED_FRAME_MS);
    this.accumulatedMs += countedMs * this.currentSpeed;
    const dueTicks = Math.floor((this.accumulatedMs + ROUNDING_TOLERANCE_MS) / TICK_MS);
    this.accumulatedMs = Math.max(0, this.accumulatedMs - dueTicks * TICK_MS);
    return dueTicks;
  }
}

/** Prüft, ob eine Zahl eine erlaubte Spielgeschwindigkeit ist. */
export function isGameSpeed(value: number): value is GameSpeed {
  return (GAME_SPEEDS as readonly number[]).includes(value);
}
