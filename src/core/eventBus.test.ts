import { describe, expect, it } from "vitest";
import { EventBus, MAX_EVENTS_PER_FLUSH } from "./eventBus";

// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type TestEvents = {
  wood: { amount: number };
  tick: { tick: number };
};

describe("EventBus", () => {
  it("verteilt Durchsagen erst mit flush und in der richtigen Reihenfolge", () => {
    const bus = new EventBus<TestEvents>();
    const heard: string[] = [];
    bus.on("wood", ({ amount }) => heard.push(`Holz ${String(amount)}`));
    bus.on("tick", ({ tick }) => heard.push(`Takt ${String(tick)}`));

    bus.emit("wood", { amount: 2 });
    bus.emit("tick", { tick: 1 });
    bus.emit("wood", { amount: 4 });
    expect(heard).toEqual([]);
    expect(bus.pendingCount).toBe(3);

    bus.flush();
    expect(heard).toEqual(["Holz 2", "Takt 1", "Holz 4"]);
    expect(bus.pendingCount).toBe(0);
  });

  it("stellt nur an angemeldete Zuhörer der passenden Durchsage zu", () => {
    const bus = new EventBus<TestEvents>();
    const ticks: number[] = [];
    bus.on("tick", ({ tick }) => ticks.push(tick));
    bus.emit("wood", { amount: 1 });
    bus.emit("tick", { tick: 7 });
    bus.flush();
    expect(ticks).toEqual([7]);
  });

  it("erlaubt das Abmelden", () => {
    const bus = new EventBus<TestEvents>();
    const ticks: number[] = [];
    const unsubscribe = bus.on("tick", ({ tick }) => ticks.push(tick));
    bus.emit("tick", { tick: 1 });
    bus.flush();
    unsubscribe();
    bus.emit("tick", { tick: 2 });
    bus.flush();
    expect(ticks).toEqual([1]);
  });

  it("verteilt Durchsagen, die Zuhörer auslösen, im selben Durchgang", () => {
    const bus = new EventBus<TestEvents>();
    const heard: number[] = [];
    bus.on("tick", ({ tick }) => {
      heard.push(tick);
      if (tick < 3) {
        bus.emit("tick", { tick: tick + 1 });
      }
    });
    bus.emit("tick", { tick: 1 });
    bus.flush();
    expect(heard).toEqual([1, 2, 3]);
  });

  it("bricht endlose Durchsage-Ketten mit einer verständlichen Meldung ab", () => {
    const bus = new EventBus<TestEvents>();
    bus.on("tick", ({ tick }) => {
      bus.emit("tick", { tick: tick + 1 });
    });
    bus.emit("tick", { tick: 0 });
    expect(() => {
      bus.flush();
    }).toThrow(/endlos/);
    expect(bus.pendingCount).toBe(0);
    expect(MAX_EVENTS_PER_FLUSH).toBeGreaterThan(1000);
  });

  it("stellt trotz eines fehlerhaften Zuhörers allen anderen zu und meldet den Fehler danach", () => {
    const bus = new EventBus<TestEvents>();
    const heard: number[] = [];
    bus.on("tick", () => {
      throw new Error("kaputt");
    });
    bus.on("tick", ({ tick }) => heard.push(tick));
    bus.emit("tick", { tick: 1 });
    bus.emit("tick", { tick: 2 });
    expect(() => {
      bus.flush();
    }).toThrow("kaputt");
    expect(heard).toEqual([1, 2]);
  });

  it("verwirft wartende Durchsagen mit clear", () => {
    const bus = new EventBus<TestEvents>();
    const heard: number[] = [];
    bus.on("tick", ({ tick }) => heard.push(tick));
    bus.emit("tick", { tick: 1 });
    bus.clear();
    bus.flush();
    expect(heard).toEqual([]);
  });
});
