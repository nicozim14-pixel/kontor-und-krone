import type { Camera } from "@babylonjs/core/Cameras/camera";
import type { Scene } from "@babylonjs/core/scene";

/**
 * Meldet jede Bewegung der Kamera (Drehen, Zoomen, Nachschwingen nach dem Loslassen).
 * Der Zeichen-Takt bleibt dann flüssig und wechselt erst ins Ruhebild, wenn die Kamera still steht.
 */
export function trackCameraMovement(scene: Scene, onMove: () => void): void {
  const observe = (camera: Camera | null): void => {
    camera?.onViewMatrixChangedObservable.add(onMove);
  };
  observe(scene.activeCamera);
  scene.onActiveCameraChanged.add(() => {
    observe(scene.activeCamera);
  });
}
