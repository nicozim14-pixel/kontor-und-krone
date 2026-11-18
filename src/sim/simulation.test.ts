import { describe, expect, it } from "vitest";
import { EventBus } from "../core/eventBus";
import { nextInt } from "../core/random";
import { loadGameData, type GameData } from "../data/gameData";
import type { Command } from "./commands";
import type { SimEvents } from "./events";
import { serializeGameState } from "./save";
import { Simulation, type SimSystem } from "./simulation";
import { createInitialState } from "./state";

function testData(): GameData {
  const result = loadGameData({
    goods: [{ id: "wood", name: "Holz" }],
    buildings: [{ id: "test_woodcutter", name: "Test-Holzfäller" }],
  });
  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
  return result.value;
}

function createSimulation(seed = 1701, systems: readonly SimSystem[] = []) {
  const events = new EventBus<SimEvents>();
  const simulation = new Simulation(createInitialState(seed), testData(), events, systems);
  return { simulation, events };
}

describe("Simulation", () => {
  it("zählt mit jedem Takt weiter und sagt ihn danach durch", () => {
    const { simulation, events } = createSimulation();
    const heard: number[] = [];
    events.on("tickCompleted", ({ tick }) => heard.push(tick));
    for (let i = 0; i < 10; i++) {
      simulation.step();
    }
    expect(simulation.state.tick).toBe(10);
    expect(heard).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(events.pendingCount).toBe(0);
  });

  it("lässt die Systeme in fester Reihenfolge einmal pro Takt laufen", () => {
    const order: string[] = [];
    const first: SimSystem = (state) => order.push(`A${String(state.tick)}`);
    const second: SimSystem = (state) => order.push(`B${String(state.tick)}`);
    const { simulation } = createSimulation(1, [first, second]);
    simulation.step();
    simulation.step();
    expect(order).toEqual(["A0", "B0", "A1", "B1"]);
  });

  it("führt Befehle sofort aus und sagt die Änderung durch", () => {
    const { simulation, events } = createSimulation();
    const heard: string[] = [];
    events.on("storageChanged", ({ good, amount, delta }) =>
      heard.push(`${good} ${String(amount)} (${String(delta)})`),
    );

    expect(simulation.execute({ type: "debugAddGoods", good: "wood", amount: 10 })).toEqual({
      ok: true,
    });
    expect(simulation.execute({ type: "debugAddGoods", good: "wood", amount: -4 })).toEqual({
      ok: true,
    });
    expect(simulation.state.storage.wood).toBe(6);
    expect(heard).toEqual(["wood 10 (10)", "wood 6 (-4)"]);
  });

  it("lehnt ungültige Befehle mit deutschem Grund ab und ändert dann nichts", () => {
    const { simulation, events } = createSimulation();
    let changes = 0;
    events.on("storageChanged", () => (changes += 1));

    expect(simulation.execute({ type: "debugAddGoods", good: "gold", amount: 1 })).toEqual({
      ok: false,
      reason: "Die Ware „gold“ gibt es nicht.",
    });
    expect(simulation.execute({ type: "debugAddGoods", good: "wood", amount: -1 })).toEqual({
      ok: false,
      reason: "Nicht genug Holz im Lager (vorhanden: 0).",
    });
    expect(simulation.execute({ type: "debugAddGoods", good: "wood", amount: 0.5 })).toEqual({
      ok: false,
      reason: "Die Menge muss eine ganze Zahl ungleich 0 sein.",
    });
    expect(simulation.state.storage).toEqual({});
    expect(changes).toBe(0);
  });

  it("baut Gebäude per Befehl mit fortlaufender Nummer und sagt es durch", () => {
    const { simulation, events } = createSimulation();
    const heard: string[] = [];
    events.on("buildingPlaced", ({ id, type }) => heard.push(`${String(id)} ${type}`));

    const command: Command = { type: "debugPlaceBuilding", building: "test_woodcutter" };
    expect(simulation.execute(command)).toEqual({ ok: true });
    expect(simulation.execute(command)).toEqual({ ok: true });

    expect(heard).toEqual(["1 test_woodcutter", "2 test_woodcutter"]);
    expect(simulation.state.buildings).toEqual({
      "1": { id: 1, type: "test_woodcutter" },
      "2": { id: 2, type: "test_woodcutter" },
    });
    expect(simulation.state.nextEntityId).toBe(3);
  });

  it("lehnt unbekannte Gebäudearten ab und vergibt dann keine Nummer", () => {
    const { simulation } = createSimulation();
    expect(simulation.execute({ type: "debugPlaceBuilding", building: "castle" })).toEqual({
      ok: false,
      reason: "Die Gebäudeart „castle“ gibt es nicht.",
    });
    expect(simulation.state.buildings).toEqual({});
    expect(simulation.state.nextEntityId).toBe(1);
  });

  it("rechnet reproduzierbar: gleicher Seed und gleiche Befehle ergeben dasselbe Ergebnis", () => {
    // Ein Test-System, das in jedem Takt würfelt (wie später Ereignisse)
    const dice: SimSystem = (state) => {
      const roll = nextInt(state.random.events, 1, 6);
      state.storage.wood = (state.storage.wood ?? 0) + roll;
    };
    const play = (seed: number): string => {
      const { simulation } = createSimulation(seed, [dice]);
      const commands: Command[] = [
        { type: "debugAddGoods", good: "wood", amount: 5 },
        { type: "debugAddGoods", good: "wood", amount: -2 },
      ];
      for (let i = 0; i < 50; i++) {
        simulation.step();
        const command = commands[i % 7];
        if (command !== undefined) {
          simulation.execute(command);
        }
      }
      return serializeGameState(simulation.state);
    };
    expect(play(1701)).toBe(play(1701));
    expect(play(1701)).not.toBe(play(1702));
  });
});
