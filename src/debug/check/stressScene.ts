import "@babylonjs/core/Meshes/thinInstanceMesh"; // ergänzt Meshes um „Thin Instances“
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateCylinder } from "@babylonjs/core/Meshes/Builders/cylinderBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { Scene } from "@babylonjs/core/scene";

/** Kantenlänge der Fläche, auf der die Test-Bäume stehen (Meter). */
const FOREST_SIZE = 240;

/** Größe der Schatten-Karte in Bildpunkten (übliche mittlere Einstellung). */
export const SHADOW_MAP_SIZE = 1024;

const SKY_COLOR = new Color3(0.56, 0.8, 0.94);

export interface StressScene {
  readonly scene: Scene;
  /** Dreiecke eines einzelnen Test-Baums */
  readonly trianglesPerObject: number;
  /** Stellt Anzahl der Bäume und Schatten für die nächste Stufe ein. */
  configure(objectCount: number, shadows: boolean): void;
  dispose(): void;
}

/**
 * Einfacher Zufallsgenerator mit festem Startwert, damit jeder Testlauf dieselbe Anordnung hat.
 * (Der richtige Zufallsgenerator des Spiels kommt in Unterphase 1.6.)
 */
function createSeededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Ein einfacher Greybox-Baum aus Stamm und zwei Kegeln, als ein einziges Mesh mit Farben pro Ecke. */
function createTestTree(scene: Scene): Mesh {
  const brown = new Color4(0.45, 0.3, 0.18, 1);
  const green = new Color4(0.22, 0.5, 0.24, 1);
  const lightGreen = new Color4(0.3, 0.6, 0.28, 1);

  const trunk = CreateCylinder(
    "trunk",
    { height: 1.2, diameter: 0.35, tessellation: 6, faceColors: [brown, brown, brown] },
    scene,
  );
  trunk.position.y = 0.6;

  const lowerCrown = CreateCylinder(
    "lowerCrown",
    {
      height: 2,
      diameterTop: 0,
      diameterBottom: 1.8,
      tessellation: 8,
      faceColors: [green, green, green],
    },
    scene,
  );
  lowerCrown.position.y = 2;

  const upperCrown = CreateCylinder(
    "upperCrown",
    {
      height: 1.5,
      diameterTop: 0,
      diameterBottom: 1.3,
      tessellation: 8,
      faceColors: [lightGreen, lightGreen, lightGreen],
    },
    scene,
  );
  upperCrown.position.y = 3;

  const tree = Mesh.MergeMeshes([trunk, lowerCrown, upperCrown], true, true);
  if (tree === null) {
    throw new Error("Test-Baum konnte nicht zusammengesetzt werden.");
  }
  tree.name = "testTree";
  const material = new StandardMaterial("treeMaterial", scene);
  material.diffuseColor = Color3.White(); // die Farben kommen aus den Ecken des Baums
  material.specularColor = Color3.Black();
  tree.material = material;
  tree.isPickable = false;
  return tree;
}

/** Legt für bis zu maxObjects Bäume Position, Drehung und Größe fest (16 Zahlen pro Baum). */
function createTreeMatrices(maxObjects: number): Float32Array {
  const random = createSeededRandom(1701);
  const buffer = new Float32Array(maxObjects * 16);
  const matrix = new Matrix();
  const scale = new Vector3();
  const rotation = new Quaternion();
  const position = new Vector3();
  for (let index = 0; index < maxObjects; index += 1) {
    const size = 0.7 + random() * 0.6;
    scale.set(size, size, size);
    Quaternion.RotationYawPitchRollToRef(random() * Math.PI * 2, 0, 0, rotation);
    position.set((random() - 0.5) * FOREST_SIZE, 0, (random() - 0.5) * FOREST_SIZE);
    Matrix.ComposeToRef(scale, rotation, position, matrix);
    matrix.copyToArray(buffer, index * 16);
  }
  return buffer;
}

/**
 * Baut die Szene für den Belastungstest: Wiese, Meer, Sonne mit Schatten
 * und bis zu maxObjects Bäume als Thin Instances (ein Mesh, das die Grafikkarte vielfach zeichnet).
 * Die Kamera schaut schräg von oben auf den Wald und dreht sich langsam.
 */
export function createStressScene(engine: Engine, maxObjects: number): StressScene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(SKY_COLOR.r, SKY_COLOR.g, SKY_COLOR.b, 1);

  const skyLight = new HemisphericLight("skyLight", new Vector3(0, 1, 0), scene);
  skyLight.intensity = 0.6;
  skyLight.specular = Color3.Black();

  const sunDirection = new Vector3(-0.6, -1, -0.4);
  const sun = new DirectionalLight("sun", sunDirection, scene);
  sun.position = sunDirection.scale(-300);
  sun.intensity = 0.7;
  sun.diffuse = new Color3(1, 0.95, 0.84);

  const sea = CreateGround("sea", { width: 2000, height: 2000 }, scene);
  sea.position.y = -0.1;
  const seaMaterial = new StandardMaterial("seaMaterial", scene);
  seaMaterial.diffuseColor = new Color3(0.08, 0.62, 0.66);
  seaMaterial.specularColor = Color3.Black();
  sea.material = seaMaterial;

  const meadow = CreateGround(
    "meadow",
    { width: FOREST_SIZE + 20, height: FOREST_SIZE + 20 },
    scene,
  );
  const meadowMaterial = new StandardMaterial("meadowMaterial", scene);
  meadowMaterial.diffuseColor = new Color3(0.55, 0.7, 0.35);
  meadowMaterial.specularColor = Color3.Black();
  meadow.material = meadowMaterial;
  meadow.receiveShadows = true;

  const tree = createTestTree(scene);
  tree.thinInstanceSetBuffer("matrix", createTreeMatrices(maxObjects), 16, true);
  tree.thinInstanceRefreshBoundingInfo(false);
  // Nie wegschneiden: Alle Bäume sollen immer gezeichnet werden (ehrlicher Belastungstest).
  tree.alwaysSelectAsActiveMesh = true;
  const trianglesPerObject = tree.getTotalIndices() / 3;

  const shadowGenerator = new ShadowGenerator(SHADOW_MAP_SIZE, sun);
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.filteringQuality = ShadowGenerator.QUALITY_MEDIUM;
  shadowGenerator.addShadowCaster(tree);

  const camera = new ArcRotateCamera(
    "stressCamera",
    -Math.PI / 3,
    0.95,
    230,
    Vector3.Zero(),
    scene,
  );
  camera.minZ = 1;
  camera.maxZ = 3000;
  scene.activeCamera = camera;
  // Langsames Kreisen (eine Runde in ca. 2 Minuten), damit sich das Bild wie im Spiel ständig ändert.
  scene.onBeforeRenderObservable.add(() => {
    camera.alpha += engine.getDeltaTime() * 0.00005;
  });

  return {
    scene,
    trianglesPerObject,
    configure(objectCount: number, shadows: boolean): void {
      tree.thinInstanceCount = Math.min(objectCount, maxObjects);
      sun.shadowEnabled = shadows;
    },
    dispose(): void {
      scene.dispose();
    },
  };
}
