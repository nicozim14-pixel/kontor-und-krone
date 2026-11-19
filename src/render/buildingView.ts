import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { GameData } from "../data/gameData";
import type { SimEventBus } from "../sim/events";
import type { Footprint } from "../sim/footprint";
import { buildingKey, type BuildingState, type ReadonlyGameState } from "../sim/state";
import { TILE_SIZE, tileRectCenterToWorld } from "../sim/worldSpace";

/** Höhe des Platzhalter-Blocks (Greybox) für ein Gebäude in Metern. */
const BUILDING_HEIGHT = 3;

/** Der Block lässt am Rand der Grundfläche etwas Platz frei (Anteil der Kachelbreite). */
const BUILDING_INSET = 0.15;

/**
 * Zeigt gebaute Gebäude als Platzhalter-Blöcke (Greybox) in der Größe ihrer Grundfläche.
 *
 * Liest nur den Spielzustand und hört auf die Durchsage „buildingPlaced“.
 * Vorläufig (bis Unterphase 2.5): Gebäude haben noch keinen Platz auf der Karte. Sie stehen
 * deshalb auf dem Startplatz der größten Insel (sim/startArea.ts). Ab 2.5 entscheidet die
 * Position im Spielzustand.
 *
 * @param startArea Startplatz für Gebäude ohne eigene Position
 * @param groundHeight Höhe des Bodens am Startplatz in Metern
 * @param onChange wird nach jeder sichtbaren Änderung aufgerufen (für den Zeichen-Takt: `requestRender`)
 */
export function showBuildings(
  scene: Scene,
  state: ReadonlyGameState,
  data: GameData,
  events: SimEventBus,
  startArea: Footprint | undefined,
  groundHeight: number,
  onChange: () => void,
): void {
  const material = new StandardMaterial("buildingMaterial", scene);
  material.diffuseColor = new Color3(0.55, 0.35, 0.2);
  material.specularColor = Color3.Black();
  material.freeze();

  const addBuilding = (building: Readonly<BuildingState>): void => {
    const size = data.buildings.get(building.type)?.size ?? { width: 1, depth: 1 };
    const area = startArea ?? { x: 0, y: 0, ...size };
    const center = tileRectCenterToWorld(area.x, area.y, size.width, size.depth);
    const mesh = CreateBox(
      `building-${String(building.id)}`,
      {
        width: (size.width - BUILDING_INSET * 2) * TILE_SIZE,
        height: BUILDING_HEIGHT,
        depth: (size.depth - BUILDING_INSET * 2) * TILE_SIZE,
      },
      scene,
    );
    mesh.material = material;
    mesh.position.set(center.x, groundHeight + BUILDING_HEIGHT / 2, center.z);
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
