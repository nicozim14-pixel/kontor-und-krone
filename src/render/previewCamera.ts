/**
 * Vorläufige Kamera für die Inselwelt (Unterphase 2.3), bis die Spiel-Kamera in 2.4 kommt.
 *
 * Eine „Kreisel-Kamera“ wie in Phase 1 (E-007), jetzt mit Platz für die ganze Karte:
 * 1 Finger dreht, 2 Finger zoomen und verschieben. Sie schaut beim Start auf den Startplatz.
 */
import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera";
import { Vector3 } from "@babylonjs/core/Maths/math.vector";
import type { Scene } from "@babylonjs/core/scene";
import type { WorldPoint } from "../sim/worldSpace";

/** Abstände der Kamera zum Blickpunkt in Metern: ganz nah bis ganze Karte. */
const MIN_DISTANCE = 12;
const MAX_DISTANCE = 700;

export function createPreviewCamera(
  scene: Scene,
  focus: WorldPoint,
  focusHeight: number,
  mapCenter: WorldPoint,
  mapRadius: number,
): ArcRotateCamera {
  const camera = new ArcRotateCamera(
    "previewCamera",
    -Math.PI / 2, // Blick nach Norden
    0.95, // Neigung (0 = senkrecht von oben)
    110, // Abstand zum Blickpunkt
    new Vector3(focus.x, focusHeight, focus.z),
    scene,
  );
  camera.lowerRadiusLimit = MIN_DISTANCE;
  camera.upperRadiusLimit = MAX_DISTANCE;
  camera.lowerBetaLimit = 0.1;
  camera.upperBetaLimit = Math.PI / 2 - 0.12; // nie unter die Wasseroberfläche
  camera.minZ = 0.5;
  camera.maxZ = 5000;
  camera.wheelDeltaPercentage = 0.01;
  camera.useNaturalPinchZoom = true;
  // Verschieben mit 2 Fingern, immer waagerecht über den Boden, nicht über den Kartenrand hinaus
  camera.mapPanning = true;
  camera.panningOriginTarget = new Vector3(mapCenter.x, focusHeight, mapCenter.z);
  camera.panningDistanceLimit = mapRadius;
  // Verschieben soll sich in jeder Höhe ähnlich anfühlen: aus der Ferne schneller
  const updatePanningSpeed = (): void => {
    camera.panningSensibility = 60_000 / Math.max(MIN_DISTANCE, camera.radius);
  };
  updatePanningSpeed();
  camera.onViewMatrixChangedObservable.add(updatePanningSpeed);
  camera.attachControl();
  scene.activeCamera = camera;
  return camera;
}
