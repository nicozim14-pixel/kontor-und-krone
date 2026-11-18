/**
 * Alle Durchsagen der Simulation mit ihrem Inhalt.
 * Darstellung und Oberfläche melden sich über den Ereignis-Bus dafür an.
 * Durchsagen sind nur Hinweise; die Wahrheit steht immer im Spielzustand.
 */
import type { EventBus } from "../core/eventBus";
import type { BuildingTypeId, GoodId } from "../data/schemas";
import type { EntityId } from "./state";

// Bewusst ein „type“ und kein „interface“, damit der Ereignis-Bus die Namen sicher erkennt.
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export type SimEvents = {
  /** Ein Wirtschafts-Takt ist fertig gerechnet. `tick` = Anzahl aller bisherigen Takte. */
  tickCompleted: { readonly tick: number };
  /** Der Bestand einer Ware im Lager hat sich geändert. */
  storageChanged: { readonly good: GoodId; readonly amount: number; readonly delta: number };
  /** Ein Gebäude wurde gebaut. Einzelheiten stehen im Spielzustand unter seiner Nummer. */
  buildingPlaced: { readonly id: EntityId; readonly type: BuildingTypeId };
};

export type SimEventBus = EventBus<SimEvents>;
