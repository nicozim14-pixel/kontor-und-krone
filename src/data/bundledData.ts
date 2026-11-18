/**
 * Die Spieldaten, die beim Bauen fest ins Spiel gepackt werden.
 * Neue Datendateien hier einbinden und in `RawGameDataFiles` (gameData.ts) ergänzen.
 */
import { loadGameData, type GameData } from "./gameData";
import type { CheckResult } from "./validation";
import buildings from "./buildings.json";
import goods from "./goods.json";

/** Prüft und lädt die mitgelieferten Spieldaten. */
export function loadBundledGameData(): CheckResult<GameData> {
  return loadGameData({ goods, buildings });
}
