/**
 * Das Kachel-Raster als Linien auf dem Land (Debug-Anzeige; beim Bauen ab Unterphase 2.5).
 * Die Linien liegen knapp über dem Boden und folgen seiner Höhe.
 * Alle Linien bilden ein einziges Netz (ein Zeichenauftrag). Es wird erst gebaut, wenn es
 * zum ersten Mal eingeblendet wird.
 */
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateLineSystem } from "@babylonjs/core/Meshes/Builders/linesBuilder";
import type { LinesMesh } from "@babylonjs/core/Meshes/linesMesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ReadonlyGameState } from "../sim/state";
import { NO_ISLAND } from "../sim/world";
import { tileCornerToWorld } from "../sim/worldSpace";
import type { TerrainView } from "./terrainView";

/** So hoch schweben die Linien über dem Boden (Meter), damit sie nicht flackern. */
const LIFT = 0.06;

/** Eine Einblendung, die sich ein- und ausschalten lässt. */
export interface Overlay {
  readonly setVisible: (visible: boolean) => void;
}

export function createGridOverlay(
  scene: Scene,
  state: ReadonlyGameState,
  terrain: TerrainView,
): Overlay {
  let mesh: LinesMesh | undefined;

  const build = (): LinesMesh => {
    const { world } = state;
    const { width, height } = world;
    const isLand = (x: number, y: number): boolean =>
      x >= 0 && y >= 0 && x < width && y < height && world.island[y * width + x] !== NO_ISLAND;
    const point = (cx: number, cy: number): Vector3 => {
      const p = tileCornerToWorld(cx, cy);
      return new Vector3(p.x, terrain.cornerHeight(cx, cy) + LIFT, p.z);
    };
    const lines: Vector3[][] = [];
    // Waagerechte Kanten (West–Ost) und senkrechte Kanten (Süd–Nord), jede nur einmal
    for (let cy = 0; cy <= height; cy++) {
      for (let x = 0; x < width; x++) {
        if (isLand(x, cy - 1) || isLand(x, cy)) {
          lines.push([point(x, cy), point(x + 1, cy)]);
        }
      }
    }
    for (let cx = 0; cx <= width; cx++) {
      for (let y = 0; y < height; y++) {
        if (isLand(cx - 1, y) || isLand(cx, y)) {
          lines.push([point(cx, y), point(cx, y + 1)]);
        }
      }
    }
    const grid = CreateLineSystem("tileGrid", { lines }, scene);
    grid.color = new Color3(0.05, 0.08, 0.04);
    grid.alpha = 0.45;
    grid.isPickable = false;
    grid.freezeWorldMatrix();
    return grid;
  };

  return {
    setVisible: (visible) => {
      if (visible && mesh === undefined) {
        mesh = build();
      }
      mesh?.setEnabled(visible);
    },
  };
}
