/**
 * Die „Regie“: baut beim Start alle Teile auf und verbindet sie (docs/ARCHITEKTUR.md).
 * Nur hier (und in debug/) dürfen alle Schichten zusammenkommen.
 */
import { Engine } from "@babylonjs/core/Engines/engine";
import { readBuildInfo } from "../core/buildInfo";
import { GameClock } from "../core/clock";
import { EventBus } from "../core/eventBus";
import { loadBundledGameData } from "../data/bundledData";
import { createDebugPanel } from "../debug/debugPanel";
import { preventBrowserGestures } from "../input/browserGestures";
import { trackCameraMovement } from "../render/activity";
import { showBuildings } from "../render/buildingView";
import { createRenderEngine } from "../render/engine";
import {
  DEFAULT_FRAME_SCHEDULER_OPTIONS,
  FrameScheduler,
  parseMaxFps,
} from "../render/frameScheduler";
import { trackRenderStats } from "../render/renderStats";
import { parseRenderScalePercent } from "../render/resolution";
import { createTestScene } from "../render/testScene";
import type { SimEvents } from "../sim/events";
import { Simulation } from "../sim/simulation";
import { createInitialState } from "../sim/state";
import { GAME_SYSTEMS } from "../sim/systems";
import { setupFullscreenButton } from "../ui/fullscreenButton";
import { showUpdateBanner } from "../ui/updateBanner";
import { showVersionBadge } from "../ui/versionBadge";
import { browserLoopPlatform, GameLoop } from "./gameLoop";
import { watchForNewerBuild } from "./updateCheck";
import { readSeed } from "./urlOptions";

/**
 * Gebäudeart, die beim Start als Test gebaut wird (Durchstich, Unterphase 1.7).
 * Ab Phase 2 baut der Spieler selbst.
 */
const TEST_BUILDING = "test_woodcutter";

/** Holt ein Element aus index.html und prüft, dass es die erwartete Art hat. */
function getElement<T extends HTMLElement>(id: string, kind: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof kind)) {
    throw new Error(`Element #${id} fehlt in index.html.`);
  }
  return element;
}

export function startGame(): void {
  preventBrowserGestures();
  showVersionBadge(getElement("version", HTMLDivElement));
  setupFullscreenButton(getElement("fullscreen-button", HTMLButtonElement));
  const updateBanner = getElement("update-banner", HTMLButtonElement);
  watchForNewerBuild(readBuildInfo(), () => {
    showUpdateBanner(updateBanner);
  });

  // 1. Spieldaten prüfen und laden
  const dataResult = loadBundledGameData();
  if (!dataResult.ok) {
    window.kkShowError?.("Fehler in den Spieldaten", dataResult.errors.join("\n"));
    return;
  }

  if (!Engine.isSupported()) {
    window.kkShowError?.(
      "3D-Grafik nicht verfügbar",
      "Dieser Browser kann kein WebGL (die Technik für 3D-Grafik im Browser). " +
        "Bitte Chrome aktualisieren und in den Chrome-Einstellungen die Hardware-Beschleunigung einschalten.",
    );
    return;
  }

  // 2. Simulation: Spielzustand, Durchsagen, Uhr
  const seed = readSeed(window.location.search);
  const events = new EventBus<SimEvents>();
  const simulation = new Simulation(
    createInitialState(seed),
    dataResult.value,
    events,
    GAME_SYSTEMS,
  );
  const clock = new GameClock(1);

  // 3. Darstellung mit Zeichen-Takt (höchstens 60 Bilder pro Sekunde, Ruhebild)
  const canvas = getElement("game-canvas", HTMLCanvasElement);
  const engine = createRenderEngine(canvas, parseRenderScalePercent(window.location.search));
  const scene = createTestScene(engine);
  const scheduler = new FrameScheduler({
    ...DEFAULT_FRAME_SCHEDULER_OPTIONS,
    maxFps: parseMaxFps(window.location.search),
  });
  showBuildings(scene, simulation.state, events, () => {
    scheduler.requestRender();
  });
  const readRenderStats = trackRenderStats(scene);
  let contextLost = false;
  engine.onContextLostObservable.add(() => {
    contextLost = true;
  });
  engine.onContextRestoredObservable.add(() => {
    contextLost = false;
  });

  // 4. Test-Welt: ein Test-Holzfäller, der pro Takt 1 Holz herstellt (Werte aus buildings.json)
  const placed = simulation.execute({ type: "debugPlaceBuilding", building: TEST_BUILDING });
  if (!placed.ok) {
    window.kkShowError?.("Fehler beim Aufbau der Test-Welt", placed.reason);
    return;
  }

  // 5. Spiel-Schleife
  const loop = new GameLoop({
    clock,
    scheduler,
    platform: browserLoopPlatform(),
    onTick: () => {
      simulation.step();
    },
    onRender: () => {
      if (contextLost) {
        return;
      }
      engine.beginFrame();
      scene.render();
      engine.endFrame();
    },
  });

  // Bewegung erkannt → sofort wieder flüssig zeichnen
  const onActivity = (): void => {
    scheduler.markActivity(performance.now());
    loop.wake();
  };
  for (const type of ["pointerdown", "pointermove", "wheel"] as const) {
    canvas.addEventListener(type, onActivity, { passive: true });
  }
  trackCameraMovement(scene, onActivity);
  engine.onResizeObservable.add(() => {
    scheduler.requestRender();
    onActivity();
  });

  // Im Hintergrund (andere App, Bildschirm aus) steht das Spiel still.
  // Beim Zurückkehren läuft es sofort weiter (E-018); verpasste Zeit wird nicht nachgeholt.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      loop.stop();
    } else {
      loop.start();
    }
  });

  scene.onAfterRenderObservable.addOnce(() => {
    window.kkSceneReady = true;
  });

  // 6. Debug-Anzeige oben links
  createDebugPanel({
    state: simulation.state,
    data: dataResult.value,
    clock,
    renderedFrames: () => loop.renderedFrames,
    isIdle: () => scheduler.isIdle(performance.now()),
    renderStats: readRenderStats,
  });

  // Messwerte für Claudes automatische Prüfung (scripts/screenshot.ts)
  window.kkStats = {
    get tick() {
      return simulation.state.tick;
    },
    get wood() {
      return simulation.state.storage.wood ?? 0;
    },
    get speed() {
      return clock.speed;
    },
    get renderedFrames() {
      return loop.renderedFrames;
    },
    get idle() {
      return scheduler.isIdle(performance.now());
    },
    seed,
    maxFps: scheduler.maxFps,
  };

  loop.start();
}
