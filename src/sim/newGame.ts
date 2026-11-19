/**
 * Eine neue Partie: Spielzustand anlegen und die Inselwelt erzeugen.
 */
import type { GameData } from "../data/gameData";
import { createInitialState, type GameState } from "./state";
import { generateWorld } from "./worldgen/generateWorld";

export interface NewGame {
  readonly state: GameState;
  /** Größenklasse je Insel (z. B. "large"), Insel n an Stelle n − 1; nur zur Anzeige */
  readonly islandSizeClasses: readonly string[];
}

/** Erzeugt eine neue Partie zum Seed. Gleicher Seed und gleiche Daten ergeben dieselbe Welt. */
export function createNewGame(seed: number, data: GameData): NewGame {
  const state = createInitialState(seed);
  const generated = generateWorld(data, state.random.world);
  state.world = generated.world;
  state.islands = generated.islands;
  return { state, islandSizeClasses: generated.sizeClasses };
}
