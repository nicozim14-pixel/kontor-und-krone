/**
 * Startpunkt der Testseite check.html (Unterphase 1.5):
 * 1. liest die Geräte-Angaben aus,
 * 2. führt auf Knopfdruck den Belastungstest in Stufen durch,
 * 3. fasst alles als kopierbaren Text zusammen, den der Nutzer an Claude schickt.
 */
import "./check.css";
import { Engine } from "@babylonjs/core/Engines/engine";
import { formatBuildInfo, readBuildInfo } from "../../core/buildInfo";
import { computeHardwareScalingLevel } from "../../render/resolution";
import {
  collectDeviceInfo,
  describeLoad,
  formatInfoText,
  measureRefreshIntervals,
  type InfoEntry,
} from "./deviceInfo";
import {
  ABORT_BELOW_FPS,
  ABORT_FRAME_MS,
  buildStressPlan,
  describeOutcome,
  formatNumber,
  formatResultLine,
  IGNORED_START_FRAMES,
  NORMAL_TIMING,
  QUICK_TIMING,
  shouldSkipStage,
  summarizeFrames,
  type StageResult,
  type StageTiming,
  type StressStage,
} from "./stressPlan";
import { createStressScene, SHADOW_MAP_SIZE, type StressScene } from "./stressScene";

/** Zusätzliche Felder am Fenster für Claudes automatische Prüfung. */
interface CheckWindow {
  kkCheckInfoReady?: boolean;
  kkCheckDone?: boolean;
}

// Wird zuerst gemessen, damit die späteren Prüfungen die Ladezeit nicht verfälschen.
const loadDescription = describeLoad();
const timing: StageTiming = new URLSearchParams(window.location.search).has("schnell")
  ? QUICK_TIMING
  : NORMAL_TIMING;
const plan = buildStressPlan();
const maxObjects = Math.max(
  ...plan.filter((stage) => stage.kind === "gestempelt").map((stage) => stage.objectCount),
);
const maxSeparate = Math.max(
  ...plan.filter((stage) => stage.kind === "einzeln").map((stage) => stage.objectCount),
);
const estimatedSeconds = Math.ceil((plan.length * (timing.warmupMs + timing.measureMs)) / 1000);

let deviceEntries: InfoEntry[] = [];
let results: StageResult[] = [];
let trianglesPerObject = 0;
let testNote = "";

function getElement<T extends HTMLElement>(id: string, kind: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof kind)) {
    throw new Error(`Element #${id} fehlt in check.html.`);
  }
  return element;
}

const elements = {
  version: getElement("version", HTMLSpanElement),
  infoBody: getElement("info-body", HTMLTableSectionElement),
  infoStatus: getElement("info-status", HTMLParagraphElement),
  startButton: getElement("start-button", HTMLButtonElement),
  startHint: getElement("start-hint", HTMLParagraphElement),
  resultBody: getElement("result-body", HTMLTableSectionElement),
  resultNote: getElement("result-note", HTMLParagraphElement),
  copyButton: getElement("copy-button", HTMLButtonElement),
  copyStatus: getElement("copy-status", HTMLSpanElement),
  report: getElement("report", HTMLTextAreaElement),
  panel: getElement("panel", HTMLElement),
  canvas: getElement("stress-canvas", HTMLCanvasElement),
  overlay: getElement("stress-overlay", HTMLDivElement),
  progress: getElement("stress-progress", HTMLSpanElement),
  liveFps: getElement("stress-fps", HTMLSpanElement),
  cancelButton: getElement("cancel-button", HTMLButtonElement),
  errorBox: getElement("error-box", HTMLDivElement),
  errorText: getElement("error-text", HTMLParagraphElement),
};

const versionText = formatBuildInfo(readBuildInfo());

function showError(message: string): void {
  elements.errorText.textContent = message;
  elements.errorBox.hidden = false;
}

window.addEventListener("error", (event) => {
  showError(event.message);
});
window.addEventListener("unhandledrejection", (event) => {
  const reason: unknown = event.reason;
  showError(reason instanceof Error ? reason.message : String(reason));
});

// ---------------------------------------------------------------------------
// Anzeige
// ---------------------------------------------------------------------------

function addCell(row: HTMLTableRowElement, text: string): void {
  const cell = row.insertCell();
  cell.textContent = text;
}

function renderDeviceInfo(): void {
  elements.infoBody.replaceChildren();
  for (const entry of deviceEntries) {
    const row = elements.infoBody.insertRow();
    const label = document.createElement("th");
    label.scope = "row";
    label.textContent = entry.label;
    row.append(label);
    addCell(row, entry.value);
  }
}

function renderResults(): void {
  elements.resultBody.replaceChildren();
  for (const result of results) {
    const row = elements.resultBody.insertRow();
    addCell(row, String(result.stage.number));
    addCell(
      row,
      result.stage.kind === "einzeln"
        ? `${formatNumber(result.stage.objectCount)} einzeln`
        : formatNumber(result.stage.objectCount),
    );
    addCell(row, result.stage.shadows ? "ja" : "nein");
    addCell(row, `${String(result.stage.resolutionPercent)} %`);
    addCell(row, result.averageFps === undefined ? "–" : formatNumber(result.averageFps, 1));
    addCell(
      row,
      result.worstFrameMs === undefined ? "–" : `${formatNumber(result.worstFrameMs)} ms`,
    );
    addCell(row, describeOutcome(result));
  }
  elements.resultNote.textContent = testNote;
}

function buildReport(): string {
  const lines = [
    "Kontor & Krone – Geräte-Check",
    `Version: ${versionText}`,
    `Datum: ${new Date().toLocaleString("de-DE")}`,
    "",
    "GERÄT",
    formatInfoText(deviceEntries),
    "",
  ];
  if (results.length === 0) {
    lines.push("BELASTUNGSTEST: noch nicht durchgeführt");
  } else {
    lines.push(
      `BELASTUNGSTEST (1 Objekt = Greybox-Baum mit ${String(trianglesPerObject)} Dreiecken, ` +
        `Schatten-Karte ${String(SHADOW_MAP_SIZE)} Bildpunkte, ` +
        `je ${formatNumber(timing.measureMs / 1000, 1)} s gemessen)`,
      ...results.map(formatResultLine),
    );
    if (testNote !== "") {
      lines.push(`Hinweis: ${testNote}`);
    }
  }
  return lines.join("\n");
}

function updateReport(): void {
  elements.report.value = buildReport();
}

// ---------------------------------------------------------------------------
// Belastungstest
// ---------------------------------------------------------------------------

let abortReason: string | undefined;

/** Liest den Abbruchgrund (als Funktion, weil er sich während des Tests ändern kann). */
function getAbortReason(): string | undefined {
  return abortReason;
}

function isAborted(): boolean {
  if (abortReason === undefined && document.hidden) {
    abortReason = "Die Seite war während des Tests im Hintergrund. Bitte erneut starten.";
  }
  return abortReason !== undefined;
}

interface Measurement {
  readonly status: "gemessen" | "zu langsam" | "abgebrochen";
  readonly averageFps?: number;
  readonly worstFrameMs?: number;
}

/** Wartet, bis sich die Fenstergröße nicht mehr ändert (z. B. nach dem Wechsel ins Vollbild). */
async function waitForStableSize(stableMs = 500, maxMs = 3000): Promise<void> {
  const start = performance.now();
  let lastSize = "";
  let stableSince = start;
  while (performance.now() - start < maxMs) {
    const size = `${String(window.innerWidth)}x${String(window.innerHeight)}`;
    const now = performance.now();
    if (size !== lastSize) {
      lastSize = size;
      stableSince = now;
    } else if (now - stableSince >= stableMs) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

/** Lässt die Szene eine Weile ungemessen laufen. */
function renderFor(engine: Engine, stress: StressScene, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    function loop(): void {
      stress.scene.render();
      if (performance.now() - start >= durationMs || isAborted()) {
        engine.stopRenderLoop(loop);
        resolve();
      }
    }
    engine.runRenderLoop(loop);
  });
}

/**
 * Vorbereitung vor der ersten Stufe: Jede Einstellung wird einmal gezeichnet,
 * damit der Grafikchip seine Programme (Shader) schon vorher übersetzt und die Messung nicht stört.
 */
async function prewarm(engine: Engine, stress: StressScene): Promise<void> {
  elements.progress.textContent = "Vorbereitung …";
  elements.liveFps.textContent = "";
  const duration = timing.warmupMs / 2;
  stress.configure("gestempelt", 500, false);
  await renderFor(engine, stress, duration);
  stress.configure("gestempelt", 500, true);
  await renderFor(engine, stress, duration);
  stress.configure("einzeln", 100, false);
  await renderFor(engine, stress, duration);
}

/**
 * Lässt die Szene eine Stufe lang laufen: erst Aufwärmen, dann Messen.
 * Die ersten Bilder zählen beim Aufwärmen nicht mit (Vorbereitung im Grafikchip).
 * Schutz gegen Einfrieren: Ist sie zu langsam oder dauert ein Bild zu lange, endet die Stufe sofort.
 */
function measureStage(engine: Engine, stress: StressScene): Promise<Measurement> {
  return new Promise((resolve) => {
    const start = performance.now();
    let last = start;
    let warmupFrames = 0;
    let warmupStart = 0;
    let measureStart = 0;
    let lastLiveUpdate = start;
    const frameTimes: number[] = [];

    const finish = (measurement: Measurement): void => {
      engine.stopRenderLoop(loop);
      resolve(measurement);
    };

    function loop(): void {
      stress.scene.render();
      const now = performance.now();
      const frameMs = now - last;
      last = now;

      if (isAborted()) {
        finish({ status: "abgebrochen" });
        return;
      }

      if (measureStart === 0) {
        warmupFrames += 1;
        if (warmupFrames <= IGNORED_START_FRAMES) {
          // Die ersten Bilder dürfen lange dauern, aber nicht ewig (Schutz gegen Einfrieren).
          if (now - start > timing.warmupMs + 10_000) {
            finish({ status: "zu langsam" });
          }
          warmupStart = now;
          return;
        }
        if (frameMs > ABORT_FRAME_MS) {
          finish({ status: "zu langsam", worstFrameMs: frameMs });
          return;
        }
        const elapsed = now - warmupStart;
        if (elapsed >= timing.warmupMs) {
          const warmupFps = (warmupFrames - IGNORED_START_FRAMES) / (elapsed / 1000);
          if (warmupFps < ABORT_BELOW_FPS) {
            finish({ status: "zu langsam", averageFps: warmupFps });
            return;
          }
          measureStart = now;
        }
        return;
      }

      frameTimes.push(frameMs);
      if (frameMs > ABORT_FRAME_MS) {
        finish({ status: "zu langsam", worstFrameMs: frameMs });
        return;
      }
      if (now - lastLiveUpdate > 500) {
        lastLiveUpdate = now;
        const live = summarizeFrames(frameTimes, now - measureStart);
        elements.liveFps.textContent = `${formatNumber(live.averageFps)} FPS`;
      }
      if (now - measureStart >= timing.measureMs) {
        finish({ status: "gemessen", ...summarizeFrames(frameTimes, now - measureStart) });
      }
    }

    engine.runRenderLoop(loop);
  });
}

function showProgress(stage: StressStage): void {
  elements.progress.textContent =
    `Stufe ${String(stage.number)} von ${String(plan.length)}: ` +
    `${formatNumber(stage.objectCount)} ${stage.kind === "einzeln" ? "Einzelobjekte" : "Objekte"} · ` +
    `${stage.shadows ? "mit" : "ohne"} Schatten · ${String(stage.resolutionPercent)} %`;
  elements.liveFps.textContent = "…";
}

/** Höchstens so lange wird auf das Vollbild gewartet, danach startet der Test trotzdem. */
const FULLSCREEN_WAIT_MS = 1500;

async function enterFullscreen(): Promise<void> {
  try {
    await Promise.race([
      document.documentElement.requestFullscreen({ navigationUI: "hide" }),
      new Promise((resolve) => setTimeout(resolve, FULLSCREEN_WAIT_MS)),
    ]);
  } catch {
    // Ohne Vollbild geht der Test trotzdem.
  }
}

async function exitFullscreen(): Promise<void> {
  if (document.fullscreenElement === null) {
    return;
  }
  try {
    await document.exitFullscreen();
  } catch {
    // Nicht schlimm.
  }
}

async function runStressTest(): Promise<void> {
  if (window.innerWidth < window.innerHeight) {
    elements.startHint.textContent = "Bitte zuerst ins Querformat drehen, dann erneut starten.";
    return;
  }
  if (!Engine.isSupported()) {
    elements.startHint.textContent = "Dieser Browser kann kein WebGL. Der Test ist nicht möglich.";
    return;
  }

  elements.startButton.disabled = true;
  abortReason = undefined;
  results = [];
  testNote = "";
  await enterFullscreen();
  elements.panel.hidden = true;
  elements.canvas.hidden = false;
  elements.overlay.hidden = false;

  const engine = new Engine(
    elements.canvas,
    true,
    { powerPreference: "high-performance", preserveDrawingBuffer: false, stencil: true },
    false,
  );
  await waitForStableSize();
  const stress = createStressScene(engine, maxObjects, maxSeparate);
  trianglesPerObject = stress.trianglesPerObject;
  // Ändert sich die Fenstergröße (z. B. weil das Vollbild verspätet kommt), Zeichenfläche anpassen.
  const onResize = (): void => {
    engine.resize();
  };
  window.addEventListener("resize", onResize);
  engine.resize();

  try {
    await prewarm(engine, stress);
    for (const stage of plan) {
      const triangles = stage.objectCount * trianglesPerObject;
      if (isAborted()) {
        results.push({ stage, status: "abgebrochen", triangles });
        continue;
      }
      if (shouldSkipStage(stage, results)) {
        results.push({ stage, status: "übersprungen", triangles });
        continue;
      }
      showProgress(stage);
      stress.configure(stage.kind, stage.objectCount, stage.shadows);
      engine.setHardwareScalingLevel(
        computeHardwareScalingLevel(window.devicePixelRatio, stage.resolutionPercent),
      );
      engine.resize();
      const canvasSize = `${String(engine.getRenderWidth())}×${String(engine.getRenderHeight())}`;
      const measurement = await measureStage(engine, stress);
      results.push({ stage, triangles, canvasSize, ...measurement });
    }
  } finally {
    window.removeEventListener("resize", onResize);
    stress.dispose();
    engine.dispose();
    elements.canvas.hidden = true;
    elements.overlay.hidden = true;
    elements.panel.hidden = false;
    await exitFullscreen();
  }

  testNote = getAbortReason() ?? "";
  elements.startButton.disabled = false;
  elements.startButton.textContent = "Test wiederholen";
  renderResults();
  updateReport();
  elements.resultBody.closest("section")?.scrollIntoView({ behavior: "smooth" });
  (window as Window & CheckWindow).kkCheckDone = true;
}

// ---------------------------------------------------------------------------
// Kopieren
// ---------------------------------------------------------------------------

async function copyReport(): Promise<void> {
  updateReport();
  try {
    await navigator.clipboard.writeText(elements.report.value);
    elements.copyStatus.textContent = "Kopiert ✅ – jetzt im Chat mit Claude einfügen.";
  } catch {
    // Ersatzweg: Text markieren, damit man ihn von Hand kopieren kann.
    elements.report.focus();
    elements.report.select();
    elements.copyStatus.textContent =
      "Automatisches Kopieren ging nicht. Der Text ist markiert: lange drücken → „Kopieren“.";
  }
}

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

async function start(): Promise<void> {
  elements.version.textContent = versionText;
  elements.startButton.textContent = `Test starten (ca. ${String(Math.round(estimatedSeconds / 10) * 10)} Sekunden)`;
  elements.startButton.addEventListener("click", () => {
    void runStressTest();
  });
  elements.cancelButton.addEventListener("click", () => {
    abortReason = "Der Test wurde abgebrochen.";
  });
  elements.copyButton.addEventListener("click", () => {
    void copyReport();
  });

  const refreshIntervals = await measureRefreshIntervals();
  deviceEntries = await collectDeviceInfo(refreshIntervals, loadDescription);
  renderDeviceInfo();
  updateReport();
  elements.infoStatus.textContent = "";
  elements.startButton.disabled = false;
  (window as Window & CheckWindow).kkCheckInfoReady = true;
}

void start();
