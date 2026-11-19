/**
 * Glattes „Rauschen“ für den Weltgenerator: eine Landschaft aus sanften Hügeln und Tälern
 * in Zahlenform. Daraus entstehen unregelmäßige Küsten, Buchten, Bergformen und Waldgebiete.
 *
 * Vergleich: Man legt ein grobes Gitter über die Karte und würfelt für jeden Gitterpunkt eine
 * Zahl. Dazwischen wird weich übergeblendet. Mehrere solcher Schichten in feiner werdenden
 * Gittern übereinander („Oktaven“) ergeben große Formen mit kleinen Details.
 *
 * Die Zahlen hängen nur vom Startwert (`seed`) und der Position ab: gleiche Eingabe, gleiches
 * Ergebnis, auf jedem Gerät. Es werden nur Grundrechenarten benutzt (keine Winkelfunktionen),
 * deren Ergebnis überall exakt gleich ist.
 */

/** Ein Rauschfeld: liefert für jede Position eine Zahl von −1 bis 1. */
export type Noise2D = (x: number, y: number) => number;

/** Würfelt eine Zahl von 0 bis 1 für den Gitterpunkt (ix, iy); immer dieselbe für dieselbe Eingabe. */
function latticeValue(ix: number, iy: number, seed: number): number {
  let h = seed ^ Math.imul(ix, 0x27d4eb2d) ^ Math.imul(iy, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 0x1_0000_0000;
}

/** Weiche Überblendung von 0 nach 1 (flach am Anfang und am Ende). */
export function smoothstep(edge0: number, edge1: number, value: number): number {
  if (edge1 === edge0) {
    return value < edge0 ? 0 : 1;
  }
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Einfaches Rauschen mit Gitterabstand 1: Werte von −1 bis 1, weich zwischen den Gitterpunkten.
 * @param seed ganze Zahl; verschiedene Seeds ergeben verschiedene Muster
 */
export function createValueNoise(seed: number): Noise2D {
  const s = seed | 0;
  return (x, y) => {
    const x0 = Math.floor(x);
    const y0 = Math.floor(y);
    const sx = smoothstep(0, 1, x - x0);
    const sy = smoothstep(0, 1, y - y0);
    const v00 = latticeValue(x0, y0, s);
    const v10 = latticeValue(x0 + 1, y0, s);
    const v01 = latticeValue(x0, y0 + 1, s);
    const v11 = latticeValue(x0 + 1, y0 + 1, s);
    const south = v00 + (v10 - v00) * sx;
    const north = v01 + (v11 - v01) * sx;
    return (south + (north - south) * sy) * 2 - 1;
  };
}

/**
 * Mehrschichtiges Rauschen („fraktal“): große Formen plus feinere Details.
 * @param scale Größe der größten Formen in Kacheln (z. B. 20 = Hügel etwa 20 Kacheln breit)
 * @param octaves Anzahl der Schichten; jede ist halb so groß und halb so stark wie die vorige
 * @returns Rauschfeld mit Werten von −1 bis 1
 */
export function createFractalNoise(seed: number, scale: number, octaves = 3): Noise2D {
  const layers: Noise2D[] = [];
  let totalAmplitude = 0;
  for (let octave = 0; octave < octaves; octave++) {
    layers.push(createValueNoise((seed + Math.imul(octave + 1, 0x3c6ef372)) | 0));
    totalAmplitude += 0.5 ** octave;
  }
  return (x, y) => {
    let sum = 0;
    let frequency = 1 / scale;
    let amplitude = 1;
    for (const layer of layers) {
      sum += layer(x * frequency, y * frequency) * amplitude;
      frequency *= 2;
      amplitude *= 0.5;
    }
    return sum / totalAmplitude;
  };
}
