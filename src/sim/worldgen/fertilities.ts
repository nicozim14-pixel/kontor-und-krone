/**
 * Schritt 5 des Weltgenerators: Was wächst auf welcher Insel (Fruchtbarkeiten)?
 *
 * Jede Insel bekommt eine ausgewürfelte Zahl von Fruchtbarkeiten (z. B. 2 bis 3 von 6).
 * Zuerst wird jede Fruchtbarkeit mindestens einer Insel zugeteilt, damit alles irgendwo wächst.
 * Dann wird aufgefüllt. Weil keine Insel alle bekommt (geprüft beim Laden von worldgen.json),
 * muss man später Inseln besiedeln oder handeln.
 */
import { nextInt, type RandomState } from "../../core/random";
import type { GameData } from "../../data/gameData";
import type { FertilityId, WorldGenRules } from "../../data/schemas";
import type { IslandState } from "../world";

/** Mischt eine Liste mit dem Zufalls-Strom (Fisher-Yates, wie Karten mischen). */
function shuffle<T>(items: T[], random: RandomState): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = nextInt(random, 0, i);
    const a = items[i] as T;
    items[i] = items[j] as T;
    items[j] = a;
  }
  return items;
}

export function assignFertilities(
  islands: readonly IslandState[],
  rules: WorldGenRules,
  data: GameData,
  random: RandomState,
): void {
  const allIds = Array.from(data.fertilities.keys());
  const wanted = islands.map(() =>
    nextInt(random, rules.fertilitiesPerIsland.min, rules.fertilitiesPerIsland.max),
  );
  const sets = islands.map(() => new Set<FertilityId>());

  // 1. Jede Fruchtbarkeit auf mindestens eine Insel, reihum in zufälliger Reihenfolge
  const order = shuffle([...allIds], random);
  const islandOrder = shuffle(
    islands.map((_, index) => index),
    random,
  );
  let turn = 0;
  for (const id of order) {
    // Nächste Insel, die noch Platz hat
    for (let attempt = 0; attempt < islands.length; attempt++) {
      const islandIndex = islandOrder[(turn + attempt) % islands.length] ?? 0;
      const set = sets[islandIndex];
      if (set !== undefined && set.size < (wanted[islandIndex] ?? 0)) {
        set.add(id);
        turn += attempt + 1;
        break;
      }
    }
  }

  // 2. Auffüllen bis zur gewünschten Zahl
  sets.forEach((set, islandIndex) => {
    const missing = shuffle(
      allIds.filter((id) => !set.has(id)),
      random,
    );
    while (set.size < (wanted[islandIndex] ?? 0) && missing.length > 0) {
      set.add(missing.pop() ?? "");
    }
  });

  // In der Reihenfolge von fertilities.json speichern (ordentliche Anzeige)
  islands.forEach((island, islandIndex) => {
    const set = sets[islandIndex] ?? new Set<FertilityId>();
    island.fertilities = allIds.filter((id) => set.has(id));
  });
}
