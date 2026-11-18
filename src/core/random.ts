/**
 * Reproduzierbarer Zufall: der „Würfel mit Startnummer“.
 *
 * Aus einer Startnummer (Seed) entsteht eine Zahlenfolge, die zufällig aussieht.
 * Gleicher Seed → gleiche Folge → gleiche Inselwelt.
 *
 * Verfahren: sfc32 („Small Fast Counting“), schnell und statistisch gut geprüft.
 * Sein Zustand besteht aus vier Zahlen. Er steht im Spielzustand und wird mitgespeichert,
 * damit es nach dem Laden exakt so weitergeht wie vorher.
 *
 * Die Funktionen ändern den übergebenen Zustand direkt („der Würfel rollt weiter“).
 */

/** Zustand eines Zufalls-Stroms: vier ganze Zahlen von 0 bis 4.294.967.295. */
export type RandomState = [number, number, number, number];

/** Größter erlaubter Seed (2^32 − 1). */
export const MAX_SEED = 0xffff_ffff;

/** So viele Zahlen werden nach dem Start verworfen, damit sich die Startwerte gut durchmischen. */
const WARM_UP_ROUNDS = 15;

/**
 * Wandelt einen Text in eine Zahl von 0 bis 2^32 − 1 um (Prüfsumme „cyrb53“, gekürzt).
 * Gleicher Text ergibt immer dieselbe Zahl.
 */
export function hashText(text: string): number {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ code, 2654435761);
    h2 = Math.imul(h2 ^ code, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}

/**
 * Macht aus einer Eingabe einen Seed: Eine ganze Zahl von 0 bis 4.294.967.295 wird direkt genommen,
 * jeder andere Text (z. B. „Barock“) wird in eine Zahl umgerechnet.
 */
export function parseSeed(input: string): number {
  const trimmed = input.trim();
  if (/^\d{1,10}$/.test(trimmed)) {
    const value = Number(trimmed);
    if (value <= MAX_SEED) {
      return value;
    }
  }
  return hashText(trimmed);
}

/**
 * Erzeugt den Startzustand eines Zufalls-Stroms.
 * @param seed Startnummer der Partie
 * @param stream Name des Stroms, z. B. "world" (Kartengenerator) oder "events" (Ereignisse).
 *   Getrennte Ströme beeinflussen sich nicht: Ein neues Ereignis ändert die Karte nicht.
 */
export function createRandomState(seed: number, stream: string): RandomState {
  if (!Number.isInteger(seed) || seed < 0 || seed > MAX_SEED) {
    throw new RangeError(
      `Ungültiger Seed ${String(seed)}: erlaubt sind ganze Zahlen von 0 bis ${String(MAX_SEED)}.`,
    );
  }
  const base = `${String(seed)}:${stream}`;
  const state: RandomState = [
    hashText(`${base}:a`),
    hashText(`${base}:b`),
    hashText(`${base}:c`),
    hashText(`${base}:d`),
  ];
  for (let i = 0; i < WARM_UP_ROUNDS; i++) {
    nextUint32(state);
  }
  return state;
}

/** Nächste Zufallszahl als ganze Zahl von 0 bis 4.294.967.295. */
export function nextUint32(state: RandomState): number {
  let [a, b, c, d] = state;
  const t = (((a + b) | 0) + d) | 0;
  d = (d + 1) | 0;
  a = b ^ (b >>> 9);
  b = (c + (c << 3)) | 0;
  c = (c << 21) | (c >>> 11);
  c = (c + t) | 0;
  state[0] = a >>> 0;
  state[1] = b >>> 0;
  state[2] = c >>> 0;
  state[3] = d >>> 0;
  return t >>> 0;
}

/** Nächste Zufallszahl von 0 (einschließlich) bis 1 (ausschließlich). */
export function nextFloat(state: RandomState): number {
  return nextUint32(state) / 0x1_0000_0000;
}

/** Ganze Zufallszahl von `min` bis `max`, beide einschließlich. */
export function nextInt(state: RandomState, min: number, max: number): number {
  if (!Number.isInteger(min) || !Number.isInteger(max) || max < min) {
    throw new RangeError(`Ungültiger Bereich ${String(min)} bis ${String(max)}.`);
  }
  return min + Math.floor(nextFloat(state) * (max - min + 1));
}

/** „Ja“ mit der Wahrscheinlichkeit `probability` (0 = nie, 1 = immer). */
export function nextChance(state: RandomState, probability: number): boolean {
  return nextFloat(state) < probability;
}

/** Wählt zufällig ein Element aus einer nicht leeren Liste. */
export function pickRandom<T>(state: RandomState, items: readonly T[]): T {
  const index = items.length === 0 ? -1 : nextInt(state, 0, items.length - 1);
  if (!(index in items)) {
    throw new RangeError("Aus einer leeren Liste kann nichts gewählt werden.");
  }
  return items[index] as T;
}
