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
import { formatNumber } from "../debug/format";
import { createIslandLabels } from "../debug/islandLabels";
import { preventBrowserGestures } from "../input/browserGestures";
import { trackCameraMovement } from "../render/activity";
import { createDepositMarkers } from "../render/depositMarkers";
import { createGridOverlay } from "../render/gridOverlay";
import { showBuildings } from "../render/buildingView";
import { createRenderEngine } from "../render/engine";
import {
  DEFAULT_FRAME_SCHEDULER_OPTIONS,
  FrameScheduler,
  parseMaxFps,
} from "../render/frameScheduler";
import { trackRenderStats } from "../render/renderStats";
import { parseRenderScalePercent } from "../render/resolution";
import { createWorldScene } from "../render/worldScene";
import type { SimEvents } from "../sim/events";
import { createNewGame } from "../sim/newGame";
import { Simulation } from "../sim/simulation";
import { findStartArea } from "../sim/startArea";
import { GAME_SYSTEMS } from "../sim/systems";
import { setupFullscreenButton } from "../ui/fullscreenButton";
import { showUpdateBanner } from "../ui/updateBanner";
import { showVersionBadge } from "../ui/versionBadge";
import { browserLoopPlatform, GameLoop } from "./gameLoop";
import { watchForNewerBuild } from "./updateCheck";
import { readSeed, urlWithSeed } from "./urlOptions";

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

  // 2. Simulation: neue Partie mit Inselwelt aus dem Seed, Durchsagen, Uhr
  const data = dataResult.value;
  const seed = readSeed(window.location.search);
  const generationStart = performance.now();
  const newGame = createNewGame(seed, data);
  const generationMs = performance.now() - generationStart;
  const events = new EventBus<SimEvents>();
  const simulation = new Simulation(newGame.state, data, events, GAME_SYSTEMS);
  const clock = new GameClock(1);
  const testBuilding = data.buildings.get(TEST_BUILDING);
  const startArea =
    testBuilding === undefined
      ? undefined
      : findStartArea(simulation.state, data, testBuilding.size.width, testBuilding.size.depth);

  // 3. Darstellung mit Zeichen-Takt (höchstens 60 Bilder pro Sekunde, Ruhebild)
  const canvas = getElement("game-canvas", HTMLCanvasElement);
  const engine = createRenderEngine(canvas, parseRenderScalePercent(window.location.search));
  const sceneStart = performance.now();
  const world = createWorldScene(engine, simulation.state, data, startArea);
  const { scene } = world;
  const sceneMs = performance.now() - sceneStart;
  const scheduler = new FrameScheduler({
    ...DEFAULT_FRAME_SCHEDULER_OPTIONS,
    maxFps: parseMaxFps(window.location.search),
  });
  showBuildings(scene, simulation.state, data, events, startArea, data.worldGen.plainHeight, () => {
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

  // 4. Test-Holzfäller, der pro Takt 1 Holz herstellt (Werte aus buildings.json).
  //    Bis Unterphase 2.5 steht er auf dem Startplatz der größten Insel.
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

  // 6. Debug-Anzeige oben links, mit Welt-Werkzeugen
  const sizeClassNames = newGame.islandSizeClasses.map(
    (id) => data.worldGen.islandClasses.find((entry) => entry.id === id)?.name ?? id,
  );
  const withRedraw = (setVisible: (visible: boolean) => void) => (visible: boolean) => {
    setVisible(visible);
    scheduler.requestRender();
    loop.wake();
  };
  const grid = createGridOverlay(scene, simulation.state, world.terrain);
  const deposits = createDepositMarkers(scene, simulation.state, data, world.terrain);
  const labels = createIslandLabels(scene, canvas, simulation.state, data, sizeClassNames);
  createDebugPanel({
    state: simulation.state,
    data,
    clock,
    renderedFrames: () => loop.renderedFrames,
    isIdle: () => scheduler.isIdle(performance.now()),
    renderStats: readRenderStats,
    world: {
      summary:
        `${String(simulation.state.islands.length)} Inseln · ${formatNumber(world.trees.count)} Bäume · ` +
        `${formatNumber(Math.round(generationMs))} ms`,
      overlays: [
        { id: "grid", label: "Raster", setVisible: withRedraw(grid.setVisible) },
        { id: "deposits", label: "Rohstoffe", setVisible: withRedraw(deposits.setVisible) },
        { id: "islands", label: "Inseln", setVisible: withRedraw(labels.setVisible) },
      ],
      loadSeed: (text) => {
        window.location.assign(urlWithSeed(window.location.href, text));
      },
      loadRandomSeed: () => {
        // Eine gut abtippbare Zahl; echter Zufall ist hier (außerhalb der Simulation) erlaubt.
        const seed = 1 + Math.floor(Math.random() * 999_999);
        window.location.assign(urlWithSeed(window.location.href, String(seed)));
      },
    },
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
    islands: simulation.state.islands.length,
    trees: world.trees.count,
    generationMs,
    sceneMs,
  };

  loop.start();
}
