/**
 * Insel-Beschriftungen (Debug-Anzeige): über jeder Insel ein kleines Schild mit Nummer, Größe,
 * Fruchtbarkeiten und Rohstoffen. Schlichte HTML-Schilder, die bei jedem Bild an die Stelle der
 * Insel auf dem Bildschirm geschoben werden. Die richtige Anzeige im Spiel kommt in Phase 3.
 */
import { Matrix, Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { GameData } from "../data/gameData";
import type { Overlay } from "../render/gridOverlay";
import { measureIslands } from "../sim/islandStats";
import type { ReadonlyGameState } from "../sim/state";
import { TILE_SIZE } from "../sim/worldSpace";

/** So hoch über der Ebene schwebt das Schild (Meter). */
const LABEL_HEIGHT = 10;

export function createIslandLabels(
  scene: Scene,
  canvas: HTMLCanvasElement,
  state: ReadonlyGameState,
  data: GameData,
  sizeClassNames: readonly string[],
): Overlay {
  const layer = document.createElement("div");
  layer.className = "island-labels";
  layer.hidden = true;
  document.body.append(layer);

  const islands = measureIslands(state).map((stats, i) => {
    const island = state.islands[i];
    const label = document.createElement("div");
    label.className = "island-label";

    const title = document.createElement("strong");
    const sizeName = sizeClassNames[i];
    title.textContent =
      sizeName === undefined
        ? `Insel ${String(stats.id)}`
        : `Insel ${String(stats.id)} · ${sizeName}`;
    label.append(title);

    const fertilities = document.createElement("div");
    for (const id of island?.fertilities ?? []) {
      const fertility = data.fertilities.get(id);
      const item = document.createElement("span");
      item.className = "island-label-item";
      const dot = document.createElement("i");
      dot.style.background = fertility?.color ?? "#999";
      item.append(dot, fertility?.name ?? id);
      fertilities.append(item);
    }
    label.append(fertilities);

    const resources = document.createElement("div");
    resources.className = "island-label-resources";
    const deposits = island?.deposits ?? [];
    resources.textContent =
      deposits.length === 0
        ? "keine Rohstoffe"
        : deposits
            .map((deposit) => data.resources.get(deposit.resource)?.name ?? deposit.resource)
            .join(", ");
    label.append(resources);

    layer.append(label);
    return {
      label,
      position: new Vector3(
        (stats.centerX + 0.5) * TILE_SIZE,
        data.worldGen.plainHeight + LABEL_HEIGHT,
        (stats.centerY + 0.5) * TILE_SIZE,
      ),
    };
  });

  const projected = new Vector3();
  const place = (): void => {
    const camera = scene.activeCamera;
    if (layer.hidden || camera === null) {
      return;
    }
    const engine = scene.getEngine();
    const renderWidth = engine.getRenderWidth();
    const renderHeight = engine.getRenderHeight();
    const viewport = camera.viewport.toGlobal(renderWidth, renderHeight);
    const toCss = canvas.clientWidth / Math.max(1, renderWidth);
    const transform = scene.getTransformMatrix();
    for (const { label, position } of islands) {
      Vector3.ProjectToRef(position, Matrix.IdentityReadOnly, transform, viewport, projected);
      const inFront = projected.z > 0 && projected.z < 1;
      label.hidden = !inFront;
      if (inFront) {
        label.style.transform = `translate(${String(projected.x * toCss)}px, ${String(projected.y * toCss)}px) translate(-50%, -100%)`;
      }
    }
  };
  scene.onAfterRenderObservable.add(place);

  return {
    setVisible: (visible) => {
      layer.hidden = !visible;
      place();
    },
  };
}
