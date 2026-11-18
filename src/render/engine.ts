import { Engine } from "@babylonjs/core/Engines/engine";
import { computeHardwareScalingLevel } from "./resolution";

/**
 * Erstellt die Babylon.js-Engine (den „Zeichner“ der 3D-Szene) für die Spielfläche
 * und hält die Auflösung bei Größenänderungen aktuell.
 */
export function createRenderEngine(canvas: HTMLCanvasElement, renderScalePercent: number): Engine {
  const engine = new Engine(
    canvas,
    true, // Kantenglättung
    {
      // Auf Laptops mit zwei Grafikchips den stärkeren wählen
      powerPreference: "high-performance",
      preserveDrawingBuffer: false,
      stencil: true,
    },
    false, // Pixeldichte regeln wir selbst (siehe resolution.ts)
  );

  const applyResolution = (): void => {
    engine.setHardwareScalingLevel(
      computeHardwareScalingLevel(window.devicePixelRatio, renderScalePercent),
    );
    engine.resize();
  };

  applyResolution();
  window.addEventListener("resize", applyResolution);
  window.addEventListener("orientationchange", applyResolution);

  return engine;
}
