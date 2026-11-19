/**
 * Zeigt die Bäume der Wälder (E-024) als Platzhalter-Tannen: Stamm und zwei Kegel.
 *
 * Alle Bäume sind „Thin Instances“ eines einzigen Baum-Modells: Der Grafikchip bekommt das
 * Modell einmal und dazu eine Liste mit Position, Drehung, Größe und Farbton jedes Baums.
 * Tausende Bäume kosten so nur einen Zeichenauftrag.
 * Jeder Baum steht leicht versetzt in seiner Kachel und ist etwas anders groß und gefärbt,
 * damit der Wald nicht wie ein Raster aussieht.
 */
import "@babylonjs/core/Meshes/thinInstanceMesh"; // ergänzt Meshes um „Thin Instances“
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import type { Scene } from "@babylonjs/core/scene";
import type { ReadonlyGameState } from "../sim/state";
import { TREE } from "../sim/world";
import { elevationToMeters, TILE_SIZE, tileCenterToWorld } from "../sim/worldSpace";
import { hashToUnit } from "./colors";

/** Die Bäume als ein Modell mit vielen Stempel-Abdrücken. */
export interface TreeView {
  readonly mesh: Mesh;
  /** Anzahl der gezeigten Bäume */
  readonly count: number;
  /** Dreiecke eines Baums */
  readonly trianglesPerTree: number;
}

function createTreeModel(scene: Scene): Mesh {
  const trunkColor = new Color4(0.42, 0.29, 0.18, 1);
  const lowerColor = new Color4(0.2, 0.42, 0.2, 1);
  const upperColor = new Color4(0.26, 0.5, 0.24, 1);
  const noCap = Mesh.NO_CAP;

  const trunk = CreateCylinder(
    "treeTrunk",
    {
      height: 1,
      diameter: 0.32,
      tessellation: 5,
      cap: noCap,
      faceColors: [trunkColor, trunkColor, trunkColor],
    },
    scene,
  );
  trunk.position.y = 0.5;
  const lower = CreateCylinder(
    "treeLower",
    {
      height: 2.2,
      diameterTop: 0,
      diameterBottom: 1.9,
      tessellation: 6,
      cap: noCap,
      faceColors: [lowerColor, lowerColor, lowerColor],
    },
    scene,
  );
  lower.position.y = 1.9;
  const upper = CreateCylinder(
    "treeUpper",
    {
      height: 1.6,
      diameterTop: 0,
      diameterBottom: 1.35,
      tessellation: 6,
      cap: noCap,
      faceColors: [upperColor, upperColor, upperColor],
    },
    scene,
  );
  upper.position.y = 3.05;

  const tree = Mesh.MergeMeshes([trunk, lower, upper], true, true);
  if (tree === null) {
    throw new Error("Platzhalter-Baum konnte nicht zusammengesetzt werden.");
  }
  tree.name = "trees";
  const material = new StandardMaterial("treeMaterial", scene);
  material.diffuseColor = Color3.White(); // Farben kommen aus den Ecken und dem Farbton je Baum
  material.specularColor = Color3.Black();
  material.freeze();
  tree.material = material;
  tree.isPickable = false;
  return tree;
}

export function showTrees(scene: Scene, state: ReadonlyGameState): TreeView {
  const { world } = state;
  const tiles: number[] = [];
  for (let index = 0; index < world.trees.length; index++) {
    if (world.trees[index] === TREE) {
      tiles.push(index);
    }
  }

  const mesh = createTreeModel(scene);
  const matrices = new Float32Array(tiles.length * 16);
  const colors = new Float32Array(tiles.length * 4);
  const jitter = TILE_SIZE * 0.22;
  tiles.forEach((index, i) => {
    const x = index % world.width;
    const center = tileCenterToWorld(x, (index - x) / world.width);
    const angle = hashToUnit(index, 1) * Math.PI * 2;
    const size = 0.8 + hashToUnit(index, 2) * 0.45;
    const tall = size * (0.9 + hashToUnit(index, 3) * 0.25);
    const cos = Math.cos(angle) * size;
    const sin = Math.sin(angle) * size;
    // Matrix für Drehung um die Hochachse, Größe und Position (16 Zahlen, Babylon-Reihenfolge)
    // prettier-ignore
    matrices.set(
      [
        cos, 0, -sin, 0,
        0, tall, 0, 0,
        sin, 0, cos, 0,
        center.x + (hashToUnit(index, 4) - 0.5) * 2 * jitter,
        elevationToMeters(world.elevation[index] ?? 0),
        center.z + (hashToUnit(index, 5) - 0.5) * 2 * jitter,
        1,
      ],
      i * 16,
    );
    const shade = 0.82 + hashToUnit(index, 6) * 0.3;
    colors.set([shade * (0.92 + hashToUnit(index, 7) * 0.16), shade, shade * 0.95, 1], i * 4);
  });
  mesh.thinInstanceSetBuffer("matrix", matrices, 16, true);
  mesh.thinInstanceSetBuffer("color", colors, 4, true);
  mesh.thinInstanceRefreshBoundingInfo(false);
  mesh.freezeWorldMatrix();

  const indices = mesh.getTotalIndices();
  return { mesh, count: tiles.length, trianglesPerTree: indices / 3 };
}
