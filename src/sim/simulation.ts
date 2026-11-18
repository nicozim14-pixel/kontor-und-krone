/**
 * Die Simulation: der „Spielleiter“.
 *
 * Sie besitzt den Spielzustand und ist die einzige, die ihn ändert:
 * - `step()` rechnet einen Wirtschafts-Takt (0,5 s Spielzeit),
 * - `execute()` führt einen Befehl des Spielers sofort aus.
 * Danach verteilt sie die gesammelten Durchsagen über den Ereignis-Bus.
 *
 * Sie weiß nichts von Grafik oder Browser (siehe docs/ARCHITEKTUR.md).
 */
import type { GameData } from "../data/gameData";
import { executeCommand, type Command, type CommandResult } from "./commands";
import type { SimEventBus } from "./events";
import type { GameState, ReadonlyGameState } from "./state";

/** Alles, was ein Teil der Spiellogik in einem Takt braucht. */
export interface SimContext {
  readonly data: GameData;
  readonly events: SimEventBus;
}

/**
 * Ein „System“ ist ein Teil der Spiellogik, der in jedem Takt einmal läuft,
 * z. B. Produktion, Verbrauch oder Steuern. Die Reihenfolge der Systeme ist fest.
 */
export type SimSystem = (state: GameState, context: SimContext) => void;

export class Simulation {
  private readonly gameState: GameState;
  private readonly context: SimContext;
  private readonly systems: readonly SimSystem[];

  /**
   * @param state Spielzustand; gehört ab jetzt der Simulation und darf von außen nicht mehr geändert werden
   * @param systems Teile der Spiellogik in der Reihenfolge, in der sie pro Takt laufen
   */
  constructor(
    state: GameState,
    data: GameData,
    events: SimEventBus,
    systems: readonly SimSystem[] = [],
  ) {
    this.gameState = state;
    this.context = { data, events };
    this.systems = systems;
  }

  /** Schreibgeschützte Sicht auf den Spielzustand. */
  get state(): ReadonlyGameState {
    return this.gameState;
  }

  /** Rechnet einen Wirtschafts-Takt und verteilt danach die Durchsagen. */
  step(): void {
    for (const system of this.systems) {
      system(this.gameState, this.context);
    }
    this.gameState.tick += 1;
    this.context.events.emit("tickCompleted", { tick: this.gameState.tick });
    this.context.events.flush();
  }

  /** Führt einen Befehl sofort aus (auch in der Pause) und verteilt danach die Durchsagen. */
  execute(command: Command): CommandResult {
    const result = executeCommand(command, { state: this.gameState, ...this.context });
    this.context.events.flush();
    return result;
  }
}
