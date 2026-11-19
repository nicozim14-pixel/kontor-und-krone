/**
 * Lauflängen-Kodierung: ein einfaches Verfahren, um lange Zahlenlisten mit vielen
 * Wiederholungen kurz aufzuschreiben.
 *
 * Statt „0, 0, 0, 0, 0, 3, 3“ steht dort „0 kommt 5-mal, 3 kommt 2-mal“, also [0, 5, 3, 2].
 * Für das Kachel-Raster ist das sehr wirksam: Das Meer besteht aus Tausenden gleicher Kacheln.
 * Gebraucht wird es im Spielstand-Format (sim/save.ts).
 */

/**
 * Kodiert eine Zahlenliste als Paare [Wert, Anzahl, Wert, Anzahl, …].
 * Eine leere Liste ergibt eine leere Liste.
 */
export function encodeRuns(values: ArrayLike<number>): number[] {
  const runs: number[] = [];
  let index = 0;
  while (index < values.length) {
    const value = values[index] ?? 0;
    let end = index + 1;
    while (end < values.length && values[end] === value) {
      end++;
    }
    runs.push(value, end - index);
    index = end;
  }
  return runs;
}

/** Ziel für `decodeRuns`, z. B. ein Zahlenfeld (Uint8Array) der passenden Länge. */
interface WritableNumbers {
  readonly length: number;
  [index: number]: number;
}

/**
 * Entpackt Paare [Wert, Anzahl, …] in `target` und prüft dabei alles.
 * @param min, max erlaubter Bereich der Werte (z. B. 0 bis 255 für ein Byte)
 * @returns `undefined`, wenn alles stimmt, sonst eine deutsche Fehlermeldung
 */
export function decodeRuns(
  runs: readonly number[],
  target: WritableNumbers,
  min: number,
  max: number,
): string | undefined {
  if (runs.length % 2 !== 0) {
    return "Die Liste muss aus Paaren (Wert, Anzahl) bestehen, hat aber eine ungerade Länge.";
  }
  let position = 0;
  for (let i = 0; i < runs.length; i += 2) {
    const value = runs[i] ?? Number.NaN;
    const count = runs[i + 1] ?? Number.NaN;
    const pair = String(i / 2 + 1);
    if (!Number.isInteger(value) || value < min || value > max) {
      return `Paar ${pair}: Der Wert ${String(value)} liegt nicht zwischen ${String(min)} und ${String(max)}.`;
    }
    if (!Number.isInteger(count) || count < 1) {
      return `Paar ${pair}: Die Anzahl muss eine ganze Zahl ab 1 sein, gefunden ${String(count)}.`;
    }
    if (position + count > target.length) {
      return `Zu viele Werte: erwartet genau ${String(target.length)}.`;
    }
    for (let k = 0; k < count; k++) {
      target[position + k] = value;
    }
    position += count;
  }
  if (position !== target.length) {
    return `Zu wenige Werte: ${String(position)} statt ${String(target.length)}.`;
  }
  return undefined;
}
