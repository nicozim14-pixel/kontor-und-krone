import { describe, expect, it } from "vitest";
import { deserializeGameState, serializeGameState } from "./save";
import { createInitialState, SAVE_VERSION } from "./state";

describe("Spielzustand und Spielstand-Format", () => {
  it("beginnt eine neue Partie mit Takt 0, Versionsnummer und Seed", () => {
    const state = createInitialState(1701);
    expect(state.tick).toBe(0);
    expect(state.saveVersion).toBe(SAVE_VERSION);
    expect(state.seed).toBe(1701);
    expect(state.nextEntityId).toBe(1);
    expect(state.storage).toEqual({});
  });

  it("besteht nur aus einfachen Daten: Text hin und zurück ergibt exakt denselben Zustand", () => {
    const state = createInitialState(42);
    state.tick = 1234;
    state.storage.wood = 99;
    const result = deserializeGameState(serializeGameState(state));
    if (!result.ok) {
      throw new Error(result.errors.join("\n"));
    }
    expect(result.value).toEqual(state);
    expect(structuredClone(state)).toEqual(state);
  });

  it("lehnt beschädigte Daten mit verständlicher Meldung ab", () => {
    const broken = deserializeGameState("{ kaputt");
    expect(broken.ok ? [] : broken.errors).toEqual([
      "Spielstand: Die Daten sind beschädigt (kein gültiges JSON).",
    ]);

    const notAState = deserializeGameState("[1, 2, 3]");
    expect(notAState.ok ? [] : notAState.errors).toEqual([
      "Spielstand: Die Daten sind kein Spielstand.",
    ]);

    const noVersion = deserializeGameState("{}");
    expect(noVersion.ok ? [] : noVersion.errors).toEqual([
      "Spielstand: Die Versionsnummer fehlt oder ist ungültig.",
    ]);
  });

  it("erkennt Spielstände aus einer neueren Spielversion", () => {
    const state = { ...createInitialState(1), saveVersion: SAVE_VERSION + 1 };
    const result = deserializeGameState(JSON.stringify(state));
    expect(result.ok ? "" : result.errors.join()).toMatch(/neuer als dieses Spiel/);
  });

  it("findet falsche Werte im Spielstand", () => {
    const state = createInitialState(1);
    const tampered = { ...state, tick: -5, storage: { wood: 1.5 } };
    const result = deserializeGameState(JSON.stringify(tampered));
    expect(result.ok ? [] : result.errors).toEqual([
      "Spielstand → Feld „tick“: Muss mindestens 0 sein.",
      "Spielstand → Feld „storage“ → Feld „wood“: Erwartet eine ganze Zahl, gefunden die Zahl 1.5.",
    ]);
  });
});
