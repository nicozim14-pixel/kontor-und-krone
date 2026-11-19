/**
 * Die Spieldaten, die beim Bauen fest ins Spiel gepackt werden.
 * Neue Datendateien hier einbinden und in `RawGameDataFiles` (gameData.ts) ergänzen.
 */
import { loadGameData, type GameData, type RawGameDataFiles } from "./gameData";
import type { CheckResult } from "./validation";
import buildings from "./buildings.json";
import fertilities from "./fertilities.json";
import goods from "./goods.json";
import resources from "./resources.json";
import terrain from "./terrain.json";
import worldGen from "./worldgen.json";

/** Die mitgelieferten Datendateien, noch ungeprüft. */
export const BUNDLED_DATA_FILES: RawGameDataFiles = {
  goods,
  buildings,
  terrain,
  resources,
  fertilities,
  worldGen,
};

/** Prüft und lädt die mitgelieferten Spieldaten. */
export function loadBundledGameData(): CheckResult<GameData> {
  return loadGameData(BUNDLED_DATA_FILES);
}
