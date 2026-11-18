/**
 * Durchstich (Unterphase 1.7): Alle Teile spielen zusammen.
 * Die echten Spieldaten werden geladen, der Test-Holzfäller per Befehl gebaut,
 * und die Uhr bekommt „echte“ Zeit wie in der Spiel-Schleife (60 Bilder pro Sekunde).
 */
import { describe, expect, it } from "vitest";
import { GameClock, type GameSpeed } from "../core/clock";
import { EventBus } from "../core/eventBus";
import { loadBundledGameData } from "../data/bundledData";
import type { SimEvents } from "./events";
import { Simulation } from "./simulation";
import { createInitialState } from "./state";
import { GAME_SYSTEMS } from "./systems";

const FRAME_MS = 1000 / 60;

function startDurchstich() {
  const data = loadBundledGameData();
  if (!data.ok) {
    throw new Error(data.errors.join("\n"));
  }
  const events = new EventBus<SimEvents>();
  const simulation = new Simulation(createInitialState(1701), data.value, events, GAME_SYSTEMS);
  const clock = new GameClock(1);
  expect(simulation.execute({ type: "debugPlaceBuilding", building: "test_woodcutter" })).toEqual({
    ok: true,
  });

  let woodHeard = 0;
  events.on("storageChanged", ({ good, amount }) => {
    if (good === "wood") {
      woodHeard = amount;
    }
  });

  /** Lässt `seconds` Sekunden echte Zeit im Tempo `speed` vergehen, Bild für Bild. */
  const play = (seconds: number, speed: GameSpeed): void => {
    clock.setSpeed(speed);
    for (let frame = 0; frame < seconds * 60; frame++) {
      const dueTicks = clock.advance(FRAME_MS);
      for (let i = 0; i < dueTicks; i++) {
        simulation.step();
      }
    }
  };
  const wood = (): number => simulation.state.storage.wood ?? 0;
  return { simulation, play, wood, heard: () => woodHeard };
}

describe("Durchstich: Holz aus der Datendatei im 0,5-s-Takt", () => {
  it("10 Takte ergeben 10 Holz", () => {
    const { simulation, wood } = startDurchstich();
    for (let i = 0; i < 10; i++) {
      simulation.step();
    }
    expect(simulation.state.tick).toBe(10);
    expect(wood()).toBe(10);
  });

  it("bei 1× entstehen in 5 Sekunden 10 Takte und 10 Holz, die Durchsage stimmt", () => {
    const { simulation, play, wood, heard } = startDurchstich();
    play(5, 1);
    expect(simulation.state.tick).toBe(10);
    expect(wood()).toBe(10);
    expect(heard()).toBe(10);
  });

  it("in der Pause entsteht nichts", () => {
    const { simulation, play, wood } = startDurchstich();
    play(2, 1);
    play(10, 0);
    expect(simulation.state.tick).toBe(4);
    expect(wood()).toBe(4);
  });

  it("2× und 4× ergeben in derselben Zeit doppelt bzw. viermal so viel Holz", () => {
    const normal = startDurchstich();
    normal.play(5, 1);
    const double = startDurchstich();
    double.play(5, 2);
    const quadruple = startDurchstich();
    quadruple.play(5, 4);
    expect([normal.wood(), double.wood(), quadruple.wood()]).toEqual([10, 20, 40]);
  });

  it("Tempowechsel mitten im Spiel: 1× → Pause → 4× → 1×", () => {
    const { play, wood } = startDurchstich();
    play(3, 1); // 6 Takte
    play(5, 0); // nichts
    play(2, 4); // 16 Takte
    play(1, 1); // 2 Takte
    expect(wood()).toBe(24);
  });
});
