/**
 * Baut die 3D-Szene der Inselwelt (ersetzt die Test-Szene aus Phase 1):
 * Himmel mit Dunst am Horizont, Licht, Meer, Inseln, Wälder und die vorläufige Kamera.
 * Liest nur den Spielzustand; ändern kann sie nichts.
 */
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { Scene } from "@babylonjs/core/scene";
import type { GameData } from "../data/gameData";
import type { Footprint } from "../sim/footprint";
import type { ReadonlyGameState } from "../sim/state";
import { tileCornerToWorld, tileRectCenterToWorld, type WorldPoint } from "../sim/worldSpace";
import { createPreviewCamera } from "./previewCamera";
import { showSea } from "./seaView";
import { showTerrain, type TerrainView } from "./terrainView";
import { showTrees, type TreeView } from "./treeView";

/** Himmelsfarbe; der Horizont verschwimmt im Dunst in derselben Farbe. */
const SKY_COLOR = new Color3(0.56, 0.8, 0.94);

export interface WorldScene {
  readonly scene: Scene;
  readonly terrain: TerrainView;
  readonly trees: TreeView;
  /** Mitte der Karte in der 3D-Welt */
  readonly mapCenter: WorldPoint;
}

export function createWorldScene(
  engine: Engine,
  state: ReadonlyGameState,
  data: GameData,
  startArea: Footprint | undefined,
): WorldScene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(SKY_COLOR.r, SKY_COLOR.g, SKY_COLOR.b, 1);
  // Nichts in der Szene bewegt sich von selbst; Babylon.js muss nicht jedes Bild alles neu prüfen.
  scene.skipPointerMovePicking = true;

  // Dunst: Weit entfernte Flächen gehen sanft in die Himmelsfarbe über (weicher Horizont).
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = SKY_COLOR.clone();
  scene.fogStart = 700;
  scene.fogEnd = 2000;

  createLights(scene);

  const { world } = state;
  const mapCorner = tileCornerToWorld(world.width, world.height);
  const mapCenter = { x: mapCorner.x / 2, z: mapCorner.z / 2 };
  showSea(scene, data, mapCenter);
  const terrain = showTerrain(scene, state, data);
  const trees = showTrees(scene, state);

  const focus =
    startArea === undefined
      ? mapCenter
      : tileRectCenterToWorld(startArea.x, startArea.y, startArea.width, startArea.depth);
  const focusHeight = startArea === undefined ? 0 : terrain.cornerHeight(startArea.x, startArea.y);
  createPreviewCamera(scene, focus, focusHeight, mapCenter, Math.max(mapCenter.x, mapCenter.z));

  return { scene, terrain, trees, mapCenter };
}

function createLights(scene: Scene): void {
  // Grundhelligkeit von oben (Himmel) und leicht bläulich von unten (Meer)
  const skyLight = new HemisphericLight("skyLight", new Vector3(0, 1, 0), scene);
  skyLight.intensity = 0.62;
  skyLight.diffuse = new Color3(0.9, 0.95, 1);
  skyLight.groundColor = new Color3(0.5, 0.58, 0.62);
  skyLight.specular = Color3.Black();

  // Die Sonne: warmes, gerichtetes Licht schräg von oben
  const sun = new DirectionalLight("sun", new Vector3(-0.6, -1, -0.4), scene);
  sun.intensity = 0.62;
  sun.diffuse = new Color3(1, 0.95, 0.84);
  sun.specular = new Color3(1, 0.96, 0.85);
}
