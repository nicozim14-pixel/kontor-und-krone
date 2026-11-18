/**
 * Der Spielzustand: das „Spielbrett mit allen Figuren und Notizzetteln“.
 *
 * Regeln (docs/ARCHITEKTUR.md, Abschnitt 4):
 * - Nur einfache Daten (Zahlen, Texte, Listen, einfache Objekte), damit er sich 1 : 1 speichern lässt.
 * - Verweise über Kennungen bzw. Nummern, nie über direkte Objekt-Verweise.
 * - Nur die Simulation darf ihn ändern; alle anderen bekommen eine schreibgeschützte Sicht.
 */
import { createRandomState, type RandomState } from "../core/random";
import type { GoodId } from "../data/schemas";
import type { DeepReadonly } from "./readonly";

/**
 * Version des Spielstand-Formats. Bei jeder Änderung am Aufbau des Spielzustands erhöhen
 * und in save.ts eine Umwandlung („Migration“) für die vorige Version ergänzen.
 * Solange es noch kein Speichern gibt (bis Phase 3), bleibt sie bei 1.
 */
export const SAVE_VERSION = 1;

/** Fortlaufende Nummer für Dinge auf der Karte (Gebäude, Karren, Schiffe …). */
export type EntityId = number;

export interface GameState {
  /** Version des Spielstand-Formats, siehe SAVE_VERSION */
  saveVersion: typeof SAVE_VERSION;
  /** Startnummer der Partie für den Zufall (gleicher Seed = gleiche Welt) */
  seed: number;
  /** Getrennte Zufalls-Ströme, damit sich Kartengenerator und Ereignisse nicht gegenseitig verändern */
  random: {
    /** für den Kartengenerator (ab Phase 2) */
    world: RandomState;
    /** für Ereignisse während des Spiels */
    events: RandomState;
  };
  /** Anzahl der bisher gerechneten Wirtschafts-Takte (1 Takt = 0,5 s Spielzeit) */
  tick: number;
  /** Nächste freie Nummer für ein neues Ding auf der Karte */
  nextEntityId: EntityId;
  /** Vorläufiges Test-Lager: Menge je Ware. Wird in Phase 3 durch echte Insellager ersetzt. */
  storage: Record<GoodId, number>;
}

/** Schreibgeschützte Sicht für Darstellung und Oberfläche. */
export type ReadonlyGameState = DeepReadonly<GameState>;

/** Erzeugt den Zustand einer neuen Partie. */
export function createInitialState(seed: number): GameState {
  return {
    saveVersion: SAVE_VERSION,
    seed,
    random: {
      world: createRandomState(seed, "world"),
      events: createRandomState(seed, "events"),
    },
    tick: 0,
    nextEntityId: 1,
    storage: {},
  };
}
