/**
 * Startpunkt des Spiels: Hier wird alles zusammengesteckt.
 */
import "./styles.css";
import { Engine } from "@babylonjs/core/Engines/engine";
import { preventBrowserGestures } from "./input/browserGestures";
import { createRenderEngine } from "./render/engine";
import { parseRenderScalePercent } from "./render/resolution";
import { createTestScene } from "./render/testScene";
import { setupFullscreenButton } from "./ui/fullscreenButton";
import { showVersionBadge } from "./ui/versionBadge";

// Signal an die Startprüfung in index.html: Der Browser hat den Spielcode verstanden.
window.kkBooted = true;

/** Holt ein Element aus index.html und prüft, dass es die erwartete Art hat. */
function getElement<T extends HTMLElement>(id: string, kind: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof kind)) {
    throw new Error(`Element #${id} fehlt in index.html.`);
  }
  return element;
}

function start(): void {
  preventBrowserGestures();
  showVersionBadge(getElement("version", HTMLDivElement));
  setupFullscreenButton(getElement("fullscreen-button", HTMLButtonElement));

  if (!Engine.isSupported()) {
    window.kkShowError?.(
      "3D-Grafik nicht verfügbar",
      "Dieser Browser kann kein WebGL (die Technik für 3D-Grafik im Browser). " +
        "Bitte Chrome aktualisieren und in den Chrome-Einstellungen die Hardware-Beschleunigung einschalten.",
    );
    return;
  }

  const canvas = getElement("game-canvas", HTMLCanvasElement);
  const engine = createRenderEngine(canvas, parseRenderScalePercent(window.location.search));
  const scene = createTestScene(engine);

  scene.onAfterRenderObservable.addOnce(() => {
    window.kkSceneReady = true;
  });
  engine.runRenderLoop(() => {
    scene.render();
  });
}

start();
