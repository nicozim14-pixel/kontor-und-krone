/**
 * Das Meer: ein dunkler Meeresboden ganz unten und darüber eine durchscheinende Wasserfläche.
 *
 * Durch das durchscheinende Wasser sieht man den Boden: Nahe der Küste liegt er hoch und ist
 * sandig hell (die Inselnetze aus terrainView.ts reichen bis dorthin), das Wasser wirkt hell
 * türkis. Draußen liegt der Boden tief, das Wasser wirkt dunkel. Zwei einfache Flächen,
 * zusammen nur vier Dreiecke.
 */
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3 } from "@babylonjs/core/Maths/math.color";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import type { Scene } from "@babylonjs/core/scene";
import type { GameData } from "../data/gameData";
import type { WorldPoint } from "../sim/worldSpace";
import { colorFromHex } from "./colors";

/** Kantenlänge der Meeresflächen in Metern (weit über die Karte hinaus bis zum Horizont). */
const SEA_SIZE = 4000;

/** Der Meeresboden liegt knapp unter dem tiefsten Punkt der Inselnetze (−4 m). */
const SEA_FLOOR_Y = -4.05;

/** Wie stark das Wasser deckt: 0 = klar, 1 = undurchsichtig. */
const WATER_ALPHA = 0.55;

export function showSea(scene: Scene, data: GameData, center: WorldPoint): void {
  const deepColor = colorFromHex(data.terrains[data.terrainCode.deep_water]?.color ?? "#1f7f94");

  const floor = CreateGround("seaFloor", { width: SEA_SIZE, height: SEA_SIZE }, scene);
  floor.position.set(center.x, SEA_FLOOR_Y, center.z);
  const floorMaterial = new StandardMaterial("seaFloorMaterial", scene);
  floorMaterial.diffuseColor = deepColor;
  floorMaterial.specularColor = Color3.Black();
  floorMaterial.freeze();
  floor.material = floorMaterial;

  const water = CreateGround("seaSurface", { width: SEA_SIZE, height: SEA_SIZE }, scene);
  water.position.set(center.x, 0, center.z);
  const waterMaterial = new StandardMaterial("seaSurfaceMaterial", scene);
  waterMaterial.diffuseColor = new Color3(0.12, 0.62, 0.68);
  waterMaterial.specularColor = new Color3(0.55, 0.55, 0.5);
  waterMaterial.specularPower = 64;
  waterMaterial.alpha = WATER_ALPHA;
  waterMaterial.freeze();
  water.material = waterMaterial;

  for (const mesh of [floor, water]) {
    mesh.isPickable = false;
    mesh.freezeWorldMatrix();
  }
}
