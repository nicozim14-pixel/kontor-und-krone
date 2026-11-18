import { describe, expect, it } from "vitest";
import { EventBus } from "../core/eventBus";
import { loadGameData, type GameData } from "../data/gameData";
import type { SimEvents } from "./events";
import { Simulation } from "./simulation";
import { createInitialState } from "./state";
import { GAME_SYSTEMS } from "./systems";

function testData(): GameData {
  const result = loadGameData({
    goods: [
      { id: "wood", name: "Holz" },
      { id: "fish", name: "Fisch" },
    ],
    buildings: [
      {
        id: "test_woodcutter",
        name: "Test-Holzfäller",
        produces: { good: "wood", amountPerTick: 1 },
      },
      { id: "test_fisher", name: "Test-Fischer", produces: { good: "fish", amountPerTick: 3 } },
      { id: "test_house", name: "Test-Wohnhaus" },
    ],
  });
  if (!result.ok) {
    throw new Error(result.errors.join("\n"));
  }
  return result.value;
}

function createSimulation(...buildings: string[]) {
  const events = new EventBus<SimEvents>();
  const simulation = new Simulation(createInitialState(1701), testData(), events, GAME_SYSTEMS);
  for (const building of buildings) {
    const result = simulation.execute({ type: "debugPlaceBuilding", building });
    if (!result.ok) {
      throw new Error(result.reason);
    }
  }
  return { simulation, events };
}

describe("Produktion", () => {
  it("ohne Gebäude entsteht nichts", () => {
    const { simulation } = createSimulation();
    simulation.step();
    expect(simulation.state.storage).toEqual({});
  });

  it("ein Test-Holzfäller legt pro Takt 1 Holz ins Lager", () => {
    const { simulation } = createSimulation("test_woodcutter");
    for (let i = 0; i < 10; i++) {
      simulation.step();
    }
    expect(simulation.state.storage).toEqual({ wood: 10 });
  });

  it("zählt mehrere Gebäude zusammen und lässt Gebäude ohne Produktion aus", () => {
    const { simulation } = createSimulation(
      "test_woodcutter",
      "test_house",
      "test_fisher",
      "test_woodcutter",
    );
    for (let i = 0; i < 5; i++) {
      simulation.step();
    }
    expect(simulation.state.storage).toEqual({ wood: 10, fish: 15 });
  });

  it("sagt pro Takt und Ware einmal den neuen Bestand durch", () => {
    const { simulation, events } = createSimulation("test_woodcutter", "test_woodcutter");
    const heard: string[] = [];
    events.on("storageChanged", ({ good, amount, delta }) =>
      heard.push(`${good} ${String(amount)} (+${String(delta)})`),
    );
    simulation.step();
    simulation.step();
    expect(heard).toEqual(["wood 2 (+2)", "wood 4 (+2)"]);
  });
});
