/**
 * Der Spielzustand: das „Spielbrett mit allen Figuren und Notizzetteln“.
 *
 * Regeln (docs/ARCHITEKTUR.md, Abschnitt 4):
 * - Nur einfache Daten (Zahlen, Texte, Listen, einfache Objekte), damit er sich 1 : 1 speichern lässt.
 * - Verweise über Kennungen bzw. Nummern, nie über direkte Objekt-Verweise.
 * - Nur die Simulation darf ihn ändern; alle anderen bekommen eine schreibgeschützte Sicht.
 */
import { createRandomState, type RandomState } from "../core/random";
import type { BuildingTypeId, GoodId } from "../data/schemas";
import type { DeepReadonly } from "./readonly";
import { createEmptyWorld, type IslandState, type WorldState } from "./world";

/**
 * Version des Spielstand-Formats. Bei jeder Änderung am Aufbau des Spielzustands erhöhen
 * und in save.ts eine Umwandlung („Migration“) für die vorige Version ergänzen.
 * Solange es noch kein Speichern gibt (bis Phase 3), bleibt sie bei 1, auch wenn sich der
 * Aufbau ändert (wie in Unterphase 2.2 durch das Kachel-Raster): Es gibt noch keine alten
 * Spielstände, die umgewandelt werden müssten (E-025).
 */
export const SAVE_VERSION = 1;

/** Fortlaufende Nummer für Dinge auf der Karte (Gebäude, Karren, Schiffe …). */
export type EntityId = number;

/** Ein gebautes Gebäude auf der Karte. Ab Phase 2 kommen Position und Drehung dazu. */
export interface BuildingState {
  /** Nummer des Gebäudes (Hausnummer) */
  id: EntityId;
  /** Gebäudeart aus buildings.json, z. B. "test_woodcutter" */
  type: BuildingTypeId;
}

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
  /** Das Kachel-Raster der Welt: Gelände, Höhe, Inseln, Bäume, Belegung (world.ts) */
  world: WorldState;
  /** Alle Inseln mit Fruchtbarkeiten und Rohstoffvorkommen; Insel n steht an Stelle n − 1 */
  islands: IslandState[];
  /** Anzahl der bisher gerechneten Wirtschafts-Takte (1 Takt = 0,5 s Spielzeit) */
  tick: number;
  /** Nächste freie Nummer für ein neues Ding auf der Karte */
  nextEntityId: EntityId;
  /**
   * Alle gebauten Gebäude, nachschlagbar über ihre Nummer.
   * Die Nummer steht als Text im Schlüssel (z. B. "1"), weil JSON nur Text-Schlüssel kennt.
   * Zum Nachschlagen `buildingKey(id)` benutzen.
   */
  buildings: Record<string, BuildingState>;
  /** Vorläufiges Test-Lager: Menge je Ware. Wird in Phase 3 durch echte Insellager ersetzt. */
  storage: Record<GoodId, number>;
}

/** Schlüssel eines Gebäudes in `GameState.buildings`. */
export function buildingKey(id: EntityId): string {
  return String(id);
}

/** Schreibgeschützte Sicht für Darstellung und Oberfläche. */
export type ReadonlyGameState = DeepReadonly<GameState>;

/**
 * Erzeugt den Zustand einer neuen Partie.
 * @param world Kachel-Raster; ohne Angabe eine leere Welt (0 × 0 Kacheln), z. B. für Tests,
 *   die keine Karte brauchen. Die Inselwelt erzeugt der Weltgenerator (ab Unterphase 2.3).
 */
export function createInitialState(
  seed: number,
  world: WorldState = createEmptyWorld(0, 0),
): GameState {
  return {
    saveVersion: SAVE_VERSION,
    seed,
    random: {
      world: createRandomState(seed, "world"),
      events: createRandomState(seed, "events"),
    },
    world,
    islands: [],
    tick: 0,
    nextEntityId: 1,
    buildings: {},
    storage: {},
  };
}
