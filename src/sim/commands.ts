/**
 * Befehle: die „Wunschzettel“ des Spielers an die Simulation.
 *
 * Jede Spieler-Aktion wird ein kleines Datenpaket. Die Simulation prüft es, führt es sofort aus
 * (auch in der Pause) und antwortet mit „erledigt“ oder einem deutschen Grund.
 * Neue Befehle: hier ergänzen und in `executeCommand` behandeln. TypeScript meldet,
 * wenn ein Befehl nicht behandelt wird.
 */
import type { GameData } from "../data/gameData";
import type { BuildingTypeId, GoodId } from "../data/schemas";
import type { SimEventBus } from "./events";
import { buildingKey, type GameState } from "./state";

/** Test-Befehl: Waren ins Test-Lager legen oder (mit negativer Menge) herausnehmen. */
export interface DebugAddGoodsCommand {
  readonly type: "debugAddGoods";
  readonly good: GoodId;
  readonly amount: number;
}

/**
 * Test-Befehl: ein Gebäude bauen, vorerst ohne Platz auf der Karte und ohne Baukosten
 * (Durchstich, Unterphase 1.7). Das richtige Bauen mit Raster folgt in Phase 2.
 */
export interface DebugPlaceBuildingCommand {
  readonly type: "debugPlaceBuilding";
  readonly building: BuildingTypeId;
}

export type Command = DebugAddGoodsCommand | DebugPlaceBuildingCommand;

export type CommandResult = { readonly ok: true } | { readonly ok: false; readonly reason: string };

const OK: CommandResult = { ok: true };

function fail(reason: string): CommandResult {
  return { ok: false, reason };
}

/** Alles, was ein Befehl zum Ausführen braucht. */
export interface CommandContext {
  readonly state: GameState;
  readonly data: GameData;
  readonly events: SimEventBus;
}

/** Führt einen Befehl aus. Die Durchsagen werden gesammelt, verteilt werden sie von der Simulation. */
export function executeCommand(command: Command, context: CommandContext): CommandResult {
  switch (command.type) {
    case "debugAddGoods":
      return debugAddGoods(command, context);
    case "debugPlaceBuilding":
      return debugPlaceBuilding(command, context);
  }
}

function debugAddGoods(
  command: DebugAddGoodsCommand,
  { state, data, events }: CommandContext,
): CommandResult {
  const good = data.goods.get(command.good);
  if (good === undefined) {
    return fail(`Die Ware „${command.good}“ gibt es nicht.`);
  }
  if (!Number.isInteger(command.amount) || command.amount === 0) {
    return fail("Die Menge muss eine ganze Zahl ungleich 0 sein.");
  }
  const current = state.storage[good.id] ?? 0;
  const next = current + command.amount;
  if (next < 0) {
    return fail(`Nicht genug ${good.name} im Lager (vorhanden: ${String(current)}).`);
  }
  state.storage[good.id] = next;
  events.emit("storageChanged", { good: good.id, amount: next, delta: command.amount });
  return OK;
}

function debugPlaceBuilding(
  command: DebugPlaceBuildingCommand,
  { state, data, events }: CommandContext,
): CommandResult {
  const definition = data.buildings.get(command.building);
  if (definition === undefined) {
    return fail(`Die Gebäudeart „${command.building}“ gibt es nicht.`);
  }
  const id = state.nextEntityId;
  state.nextEntityId += 1;
  state.buildings[buildingKey(id)] = { id, type: definition.id };
  events.emit("buildingPlaced", { id, type: definition.id });
  return OK;
}
