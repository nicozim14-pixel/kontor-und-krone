import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { SimEventBus } from "../sim/events";
import { buildingKey, type BuildingState, type ReadonlyGameState } from "../sim/state";
import { TEST_ISLAND_TOP_Y } from "./testScene";

/** Maße des Platzhalter-Würfels (Greybox) für ein Gebäude in Metern. */
const BUILDING_WIDTH = 3;
const BUILDING_HEIGHT = 2.4;

/** Abstand der Plätze auf der Test-Insel (3 × 3 Plätze). */
const SLOT_SPACING = 3.6;
const SLOTS_PER_ROW = 3;

/** Reihenfolge, in der die Plätze belegt werden: zuerst die Mitte (Platz 4), dann rundherum. */
const SLOT_ORDER = [4, 0, 1, 2, 5, 8, 7, 6, 3] as const;

/**
 * Zeigt gebaute Gebäude als Platzhalter-Würfel (Greybox) auf der Test-Insel.
 *
 * Liest nur den Spielzustand und hört auf die Durchsage „buildingPlaced“.
 * Vorläufig (Durchstich, Unterphase 1.7): Gebäude haben noch keinen Platz auf der Karte,
 * deshalb stehen sie der Reihe nach auf 9 festen Plätzen der Insel. Ab Phase 2 entscheidet
 * die Position im Spielzustand.
 *
 * @param onChange wird nach jeder sichtbaren Änderung aufgerufen (für den Zeichen-Takt: `requestRender`)
 */
export function showBuildings(
  scene: Scene,
  state: ReadonlyGameState,
  events: SimEventBus,
  onChange: () => void,
): void {
  const material = new StandardMaterial("buildingMaterial", scene);
  material.diffuseColor = new Color3(0.55, 0.35, 0.2);
  material.specularColor = Color3.Black();
  material.freeze();

  let placed = 0;
  const addBuilding = (building: Readonly<BuildingState>): void => {
    const slot = SLOT_ORDER[placed % SLOT_ORDER.length] ?? 0;
    placed += 1;
    const column = slot % SLOTS_PER_ROW;
    const row = Math.floor(slot / SLOTS_PER_ROW);

    const mesh = CreateBox(
      `building-${String(building.id)}`,
      { width: BUILDING_WIDTH, height: BUILDING_HEIGHT, depth: BUILDING_WIDTH },
      scene,
    );
    mesh.material = material;
    mesh.position.set(
      (column - 1) * SLOT_SPACING,
      TEST_ISLAND_TOP_Y + BUILDING_HEIGHT / 2,
      (row - 1) * SLOT_SPACING,
    );
    // Gebäude bewegen sich nicht: Babylon.js spart sich dann die Neuberechnung der Lage.
    mesh.freezeWorldMatrix();
    onChange();
  };

  // Schon vorhandene Gebäude (z. B. nach dem Laden eines Spielstands) …
  for (const building of Object.values(state.buildings)) {
    addBuilding(building);
  }
  // … und alle, die neu gebaut werden.
  events.on("buildingPlaced", ({ id }) => {
    const building = state.buildings[buildingKey(id)];
    if (building !== undefined) {
      addBuilding(building);
    }
  });
}
