import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import type { Engine } from "@babylonjs/core/Engines/engine";
import { DirectionalLight } from "@babylonjs/core/Lights/directionalLight";
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4 } from "@babylonjs/core/Maths/math.color";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import { CreateBox } from "@babylonjs/core/Meshes/Builders/boxBuilder";
import { CreateGround } from "@babylonjs/core/Meshes/Builders/groundBuilder";
import { Scene } from "@babylonjs/core/scene";

/** Größe der Meeresfläche (Kantenlänge in Metern). */
const SEA_SIZE = 2000;

/** Kantenlänge des Test-Würfels, der vorerst die Insel darstellt. */
const ISLAND_SIZE = 12;

/** Himmelsfarbe; der Horizont verschwimmt im Dunst in derselben Farbe. */
const SKY_COLOR = new Color3(0.56, 0.8, 0.94);

/**
 * Baut die leere Test-Szene aus Unterphase 1.3:
 * Himmel, türkises Meer, ein Würfel als „Insel“, Sonnenlicht und eine einfache Kreisel-Kamera.
 * Die richtige Spiel-Kamera und der Inselgenerator folgen in Phase 2.
 */
export function createTestScene(engine: Engine): Scene {
  const scene = new Scene(engine);
  scene.clearColor = new Color4(SKY_COLOR.r, SKY_COLOR.g, SKY_COLOR.b, 1);

  // Dunst: Weit entfernte Flächen gehen sanft in die Himmelsfarbe über (weicher Horizont).
  scene.fogMode = Scene.FOGMODE_LINEAR;
  scene.fogColor = SKY_COLOR.clone();
  scene.fogStart = 250;
  scene.fogEnd = 900;

  createLights(scene);
  createSea(scene);
  createTestIsland(scene);
  createPreviewCamera(scene);

  return scene;
}

function createLights(scene: Scene): void {
  // Grundhelligkeit von oben (Himmel) und leicht bläulich von unten (Meer)
  const skyLight = new HemisphericLight("skyLight", new Vector3(0, 1, 0), scene);
  skyLight.intensity = 0.6;
  skyLight.diffuse = new Color3(0.9, 0.95, 1);
  skyLight.groundColor = new Color3(0.5, 0.58, 0.62);
  skyLight.specular = Color3.Black();

  // Die Sonne: warmes, gerichtetes Licht schräg von oben
  const sun = new DirectionalLight("sun", new Vector3(-0.6, -1, -0.4), scene);
  sun.intensity = 0.6;
  sun.diffuse = new Color3(1, 0.95, 0.84);
  sun.specular = new Color3(1, 0.96, 0.85);
}

function createSea(scene: Scene): void {
  const sea = CreateGround("sea", { width: SEA_SIZE, height: SEA_SIZE }, scene);
  const material = new StandardMaterial("seaMaterial", scene);
  material.diffuseColor = new Color3(0.08, 0.62, 0.66);
  material.specularColor = new Color3(0.5, 0.5, 0.45);
  material.specularPower = 48;
  sea.material = material;
  sea.isPickable = false;
}

function createTestIsland(scene: Scene): void {
  const island = CreateBox("testIsland", { size: ISLAND_SIZE }, scene);
  // Zu einem Viertel im Wasser versenkt, damit er wie eine kleine Insel aus dem Meer ragt
  island.position.y = ISLAND_SIZE / 4;
  const material = new StandardMaterial("sandMaterial", scene);
  material.diffuseColor = new Color3(0.84, 0.72, 0.5);
  material.specularColor = Color3.Black();
  island.material = material;
}

function createPreviewCamera(scene: Scene): void {
  // Kreist um die Mitte der Szene: 1 Finger / Maus ziehen = drehen, 2 Finger / Mausrad = zoomen
  const camera = new ArcRotateCamera(
    "previewCamera",
    -Math.PI / 3, // Blickrichtung rundherum
    1.22, // Neigung (0 = senkrecht von oben); so ist oben noch Himmel zu sehen
    70, // Abstand zur Mitte
    Vector3.Zero(),
    scene,
  );
  camera.lowerRadiusLimit = 18;
  camera.upperRadiusLimit = 450;
  camera.lowerBetaLimit = 0.15;
  camera.upperBetaLimit = Math.PI / 2 - 0.08; // nie unter die Wasseroberfläche
  camera.minZ = 0.5;
  camera.maxZ = 3000;
  camera.wheelDeltaPercentage = 0.01; // gleichmäßiges Zoomen mit dem Mausrad
  camera.useNaturalPinchZoom = true; // Zoomen mit 2 Fingern folgt den Fingern
  camera.panningSensibility = 0; // Verschieben kommt erst mit der Spiel-Kamera (Phase 2)
  // Empfängt Maus- und Finger-Eingaben auf der Spielfläche der Engine
  camera.attachControl();
  scene.activeCamera = camera;
}
