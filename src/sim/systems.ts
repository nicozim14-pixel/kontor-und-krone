/**
 * Alle Teile der Spiellogik („Systeme“) in der Reihenfolge, in der sie pro Takt laufen.
 * Neue Systeme hier eintragen. Die Reihenfolge ist fest, damit jedes Gerät gleich rechnet.
 */
import { productionSystem } from "./production";
import type { SimSystem } from "./simulation";

export const GAME_SYSTEMS: readonly SimSystem[] = [productionSystem];
