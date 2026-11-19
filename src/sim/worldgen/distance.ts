/**
 * Abstände auf dem Kachel-Raster: Wie weit ist jede Kachel von der nächsten „Quell-Kachel“ entfernt?
 * Beispiel: Quelle = alle Wasser-Kacheln → für jede Land-Kachel der Abstand zur Küste.
 * Damit bestimmt der Generator Strände (nah an der Küste), Flachwasser (nah am Land)
 * und die Form der Berge (weit weg vom Rand eines Gebirges).
 *
 * Verfahren („Chamfer-Abstand“): zwei Durchgänge über die Karte, einmal von Südwest nach Nordost
 * und einmal zurück. Ein gerader Schritt zählt 3, ein schräger 4; geteilt durch 3 ergibt das den
 * Abstand in Kacheln, nahe am echten Luftlinien-Abstand. Schnell und auf jedem Gerät gleich.
 */

/** Abstand für Kacheln, die keine Quelle erreichen (z. B. wenn es gar keine Quelle gibt). */
export const FAR_AWAY = 1e9;

const STRAIGHT = 3;
const DIAGONAL = 4;

/**
 * Berechnet für jede Kachel den Abstand zur nächsten Quell-Kachel in Kacheln.
 * @param isSource 1 (oder größer) = Quelle, 0 = keine Quelle; eine Zahl je Kachel, Zeile für Zeile
 * @returns Abstand je Kachel (0 auf den Quellen selbst)
 */
export function distanceToSources(
  width: number,
  height: number,
  isSource: ArrayLike<number>,
): Float32Array {
  const count = width * height;
  const steps = new Int32Array(count);
  const unreachable = 0x3fff_ffff;
  for (let index = 0; index < count; index++) {
    steps[index] = (isSource[index] ?? 0) > 0 ? 0 : unreachable;
  }
  const at = (x: number, y: number): number => steps[y * width + x] ?? unreachable;
  const relax = (index: number, candidate: number): void => {
    if (candidate < (steps[index] ?? unreachable)) {
      steps[index] = candidate;
    }
  };

  // Durchgang 1: von Südwest nach Nordost (schaut nach Westen und Süden)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      if (x > 0) relax(index, at(x - 1, y) + STRAIGHT);
      if (y > 0) {
        relax(index, at(x, y - 1) + STRAIGHT);
        if (x > 0) relax(index, at(x - 1, y - 1) + DIAGONAL);
        if (x < width - 1) relax(index, at(x + 1, y - 1) + DIAGONAL);
      }
    }
  }
  // Durchgang 2: von Nordost nach Südwest (schaut nach Osten und Norden)
  for (let y = height - 1; y >= 0; y--) {
    for (let x = width - 1; x >= 0; x--) {
      const index = y * width + x;
      if (x < width - 1) relax(index, at(x + 1, y) + STRAIGHT);
      if (y < height - 1) {
        relax(index, at(x, y + 1) + STRAIGHT);
        if (x < width - 1) relax(index, at(x + 1, y + 1) + DIAGONAL);
        if (x > 0) relax(index, at(x - 1, y + 1) + DIAGONAL);
      }
    }
  }

  const result = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    const value = steps[index] ?? unreachable;
    result[index] = value >= unreachable ? FAR_AWAY : value / STRAIGHT;
  }
  return result;
}
