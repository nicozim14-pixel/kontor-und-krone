import { SceneInstrumentation } from "@babylonjs/core/Instrumentation/sceneInstrumentation";
import type { Scene } from "@babylonjs/core/scene";

/** Messwerte des zuletzt gezeichneten Bildes (für die Debug-Anzeige und das Leistungsbudget). */
export interface RenderStats {
  /** Anzahl der gezeichneten Dreiecke */
  readonly triangles: number;
  /** Anzahl der Zeichenaufträge an den Grafikchip */
  readonly drawCalls: number;
}

/**
 * Misst bei jedem Bild Dreiecke und Draw Calls (siehe docs/LEISTUNGSBUDGET.md, Abschnitt 4).
 * @returns Funktion, die die Werte des zuletzt gezeichneten Bildes liefert
 */
export function trackRenderStats(scene: Scene): () => RenderStats {
  // Ohne diese Mess-Hilfe zählt Babylon.js die Draw Calls nicht pro Bild.
  // Sie misst nur die Draw Calls; Zeitmessungen bleiben aus und kosten deshalb nichts.
  const instrumentation = new SceneInstrumentation(scene);
  return () => ({
    triangles: Math.round(scene.getActiveIndices() / 3),
    drawCalls: instrumentation.drawCallsCounter.current,
  });
}
