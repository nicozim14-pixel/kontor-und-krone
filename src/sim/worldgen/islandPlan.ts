/**
 * Schritt 1 des Weltgenerators: Wo liegen die Inseln, und wie groß sind sie?
 *
 * Für jede Größenklasse aus worldgen.json wird ausgewürfelt, wie viele Inseln entstehen und wie
 * breit jede wird. Dann bekommt jede Insel einen Platz: Die größten zuerst, jeweils mit
 * genug Abstand zu den anderen Inseln und zum Kartenrand. Von mehreren zufälligen Vorschlägen
 * gewinnt der mit dem meisten Platz drumherum (zu anderen Inseln und zum Rand); so verteilen
 * sich die Inseln gleichmäßig über die Karte.
 * Findet sich kein Platz, wird die Insel etwas kleiner versucht.
 */
import { nextInt, type RandomState } from "../../core/random";
import type { WorldGenRules } from "../../data/schemas";

/** Plan einer Insel: Mittelpunkt und Größe, noch ohne Form. */
export interface IslandPlan {
  /** Inselnummer (1, 2, 3 …) */
  readonly id: number;
  /** Kennung der Größenklasse aus worldgen.json, z. B. "large" */
  readonly sizeClass: string;
  /** Mittelpunkt (Kachel) */
  readonly centerX: number;
  readonly centerY: number;
  /** Größter Abstand der Küste vom Mittelpunkt in Kacheln (halbe Breite) */
  readonly radius: number;
  /** Anzahl der Gebirge */
  readonly mountainRanges: number;
}

/** So viele Vorschläge werden für jeden Inselplatz gewürfelt. */
const CANDIDATES_PER_ISLAND = 16;

/** So oft wird eine Insel verkleinert, wenn sie nicht passt (jeweils um 12 %). */
const SHRINK_STEPS = 4;
const SHRINK_FACTOR = 0.12;

/** Plant alle Inseln. Benutzt nur den übergebenen Zufalls-Strom. */
export function planIslands(rules: WorldGenRules, random: RandomState): IslandPlan[] {
  // Erst alle Größen auswürfeln, dann platzieren (die größten stehen in den Regeln zuerst).
  const wishes: { sizeClass: string; radius: number; mountainRanges: number }[] = [];
  for (const islandClass of rules.islandClasses) {
    const count = nextInt(random, islandClass.count.min, islandClass.count.max);
    for (let i = 0; i < count; i++) {
      const diameter = nextInt(random, islandClass.diameter.min, islandClass.diameter.max);
      wishes.push({
        sizeClass: islandClass.id,
        radius: diameter / 2,
        mountainRanges: nextInt(
          random,
          islandClass.mountainRanges.min,
          islandClass.mountainRanges.max,
        ),
      });
    }
  }

  const plans: IslandPlan[] = [];
  for (const wish of wishes) {
    const spot = findSpot(rules, random, plans, wish.radius);
    if (spot !== undefined) {
      plans.push({
        id: plans.length + 1,
        sizeClass: wish.sizeClass,
        centerX: spot.x,
        centerY: spot.y,
        radius: spot.radius,
        mountainRanges: wish.mountainRanges,
      });
    }
  }
  return plans;
}

/** Sucht einen freien Platz für eine Insel; verkleinert sie notfalls. */
function findSpot(
  rules: WorldGenRules,
  random: RandomState,
  placed: readonly IslandPlan[],
  radius: number,
): { x: number; y: number; radius: number } | undefined {
  const { width, height, edgeMargin, islandGap } = rules.map;
  for (let step = 0; step <= SHRINK_STEPS; step++) {
    const r = Math.max(4, radius * (1 - SHRINK_FACTOR * step));
    const reach = Math.ceil(r);
    const minX = edgeMargin + reach;
    const maxX = width - 1 - edgeMargin - reach;
    const minY = edgeMargin + reach;
    const maxY = height - 1 - edgeMargin - reach;
    if (minX > maxX || minY > maxY) {
      continue;
    }
    let best: { x: number; y: number; score: number } | undefined;
    for (let candidate = 0; candidate < CANDIDATES_PER_ISLAND; candidate++) {
      const x = nextInt(random, minX, maxX);
      const y = nextInt(random, minY, maxY);
      // Freiraum: kleinster Abstand zu den anderen Inseln (abzüglich Radien und Mindestabstand)
      // und zum Kartenrand. So verteilen sich die Inseln gleichmäßig über die ganze Karte.
      let score = Math.min(x - minX, maxX - x, y - minY, maxY - y);
      for (const other of placed) {
        const distance = Math.sqrt((x - other.centerX) ** 2 + (y - other.centerY) ** 2);
        score = Math.min(score, distance - r - other.radius - islandGap);
      }
      if (score >= 0 && (best === undefined || score > best.score)) {
        best = { x, y, score };
      }
    }
    if (best !== undefined) {
      return { x: best.x, y: best.y, radius: r };
    }
  }
  return undefined;
}
