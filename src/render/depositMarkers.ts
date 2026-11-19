/**
 * Markierungen der Rohstoffvorkommen (Debug-Anzeige): ein schwebender, leuchtender Kristall
 * in der Farbe des Rohstoffs (resources.json) über jedem Vorkommen.
 * Die richtige Anzeige im Spiel kommt später (Phase 3/5, Bergbau).
 */
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { TransformNode } from "@babylonjs/core/Meshes/transformNode";
import type { Scene } from "@babylonjs/core/scene";
import type { GameData } from "../data/gameData";
import type { ReadonlyGameState } from "../sim/state";
import { tileCenterToWorld } from "../sim/worldSpace";
import { colorFromHex } from "./colors";
import type { Overlay } from "./gridOverlay";
import type { TerrainView } from "./terrainView";

/** So hoch schwebt der Kristall über dem Boden (Meter). */
const HOVER = 4;

export function createDepositMarkers(
  scene: Scene,
  state: ReadonlyGameState,
  data: GameData,
  terrain: TerrainView,
): Overlay {
  let root: TransformNode | undefined;

  const build = (): TransformNode => {
    const parent = new TransformNode("depositMarkers", scene);
    const materials = new Map<string, StandardMaterial>();
    for (const resource of data.resources.values()) {
      const material = new StandardMaterial(`deposit-${resource.id}`, scene);
      const color = colorFromHex(resource.color);
      material.diffuseColor = color;
      material.emissiveColor = color.scale(0.6);
      material.specularColor = Color3.Black();
      material.freeze();
      materials.set(resource.id, material);
    }
    for (const island of state.islands) {
      for (const deposit of island.deposits) {
        const center = tileCenterToWorld(deposit.x, deposit.y);
        const ground = Math.max(
          terrain.cornerHeight(deposit.x, deposit.y),
          terrain.cornerHeight(deposit.x + 1, deposit.y + 1),
        );
        // Zwei Pyramiden Spitze an Spitze ergeben einen Kristall
        for (const [name, y, top, bottom] of [
          ["top", 0.9, 0, 1.6],
          ["bottom", -0.9, 1.6, 0],
        ] as const) {
          const part = CreateCylinder(
            `deposit-${String(deposit.x)}-${String(deposit.y)}-${name}`,
            { height: 1.8, diameterTop: top, diameterBottom: bottom, tessellation: 4 },
            scene,
          );
          part.material = materials.get(deposit.resource) ?? null;
          part.position.set(center.x, ground + HOVER + y, center.z);
          part.isPickable = false;
          part.parent = parent;
          part.freezeWorldMatrix();
        }
      }
    }
    return parent;
  };

  return {
    setVisible: (visible) => {
      if (visible && root === undefined) {
        root = build();
      }
      root?.setEnabled(visible);
    },
  };
}
