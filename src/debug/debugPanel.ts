/**
 * Die Debug-Anzeige (Unterphase 1.7): ein ein- und ausklappbares Prüf-Fenster oben links.
 *
 * Zeigt Bildrate (FPS), Takt-Nummer mit Spielzeit, Lagerbestände, Dreiecke, Draw Calls und Seed.
 * Mit den Knöpfen Pause / 1× / 2× / 4× lässt sich die Spielgeschwindigkeit einstellen.
 * Die Werte werden 4-mal pro Sekunde aufgefrischt und nur, solange die Anzeige offen ist.
 * Sie merkt sich im Browser, ob sie offen oder zu ist (beim ersten Start: offen).
 */
import "./debugPanel.css";
import { GAME_SPEEDS, isGameSpeed, type GameClock, type GameSpeed } from "../core/clock";
import type { GameData } from "../data/gameData";
import type { RenderStats } from "../render/renderStats";
import type { ReadonlyGameState } from "../sim/state";
import { FpsMeter } from "./fpsMeter";
import { formatGameTime, formatNumber } from "./format";

export interface DebugPanelOptions {
  readonly state: ReadonlyGameState;
  readonly data: GameData;
  /** Die Uhr: Spielgeschwindigkeit lesen und einstellen */
  readonly clock: GameClock;
  /** Gesamtzahl der bisher gezeichneten Bilder */
  readonly renderedFrames: () => number;
  /** Ist gerade Ruhebild? */
  readonly isIdle: () => boolean;
  /** Dreiecke und Draw Calls des zuletzt gezeichneten Bildes */
  readonly renderStats: () => RenderStats;
}

/** So oft werden die Werte aufgefrischt (4-mal pro Sekunde). */
const UPDATE_INTERVAL_MS = 250;

/** Name des Eintrags im Browser-Speicher, der sich „offen“ oder „zu“ merkt. */
const STORAGE_KEY = "kontor-und-krone.debugPanelOpen";

const SPEED_LABELS: Readonly<Record<GameSpeed, string>> = {
  0: "Pause",
  1: "1×",
  2: "2×",
  4: "4×",
};

/** Liest, ob die Anzeige beim letzten Mal offen war. Ohne Eintrag: offen. */
function readOpenState(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== "0";
  } catch {
    // Browser-Speicher nicht verfügbar (z. B. gesperrt): dann einfach offen.
    return true;
  }
}

function saveOpenState(open: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
  } catch {
    // Nicht schlimm: Dann wird es eben nicht gemerkt.
  }
}

/** Eine Zeile „Name … Wert“ in der Anzeige. */
function addRow(list: HTMLDListElement, label: string): HTMLElement {
  const term = document.createElement("dt");
  term.textContent = label;
  const value = document.createElement("dd");
  list.append(term, value);
  return value;
}

export function createDebugPanel(options: DebugPanelOptions): void {
  const { state, data, clock } = options;

  // ── Knopf zum Ein- und Ausklappen (oben links) ──
  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.id = "debug-toggle";
  toggle.className = "hud-button";
  toggle.setAttribute("aria-controls", "debug-panel");
  toggle.innerHTML =
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 20V11M12 20V4M19 20v-6" /></svg>';

  // ── Das Fenster mit den Werten ──
  const panel = document.createElement("section");
  panel.id = "debug-panel";
  panel.setAttribute("aria-label", "Debug-Anzeige");

  const list = document.createElement("dl");
  const fpsValue = addRow(list, "FPS");
  const tickValue = addRow(list, "Takt");
  const goodValues = Array.from(data.goods.values(), (good) => ({
    id: good.id,
    element: addRow(list, good.name),
  }));
  const trianglesValue = addRow(list, "Dreiecke");
  const drawCallsValue = addRow(list, "Draw Calls");
  const seedValue = addRow(list, "Seed");
  seedValue.textContent = String(state.seed);

  const speedGroup = document.createElement("div");
  speedGroup.className = "debug-speed";
  speedGroup.setAttribute("role", "group");
  speedGroup.setAttribute("aria-label", "Spielgeschwindigkeit");
  const speedButtons = GAME_SPEEDS.map((speed) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.speed = String(speed);
    button.textContent = SPEED_LABELS[speed];
    speedGroup.append(button);
    return button;
  });

  panel.append(list, speedGroup);
  document.body.append(toggle, panel);

  // ── Werte auffrischen ──
  const fpsMeter = new FpsMeter();
  const update = (): void => {
    fpsMeter.add(performance.now(), options.renderedFrames());
    const fps = fpsMeter.fps;
    const fpsText = fps === undefined ? "–" : formatNumber(Math.round(fps));
    fpsValue.textContent = options.isIdle() ? `${fpsText} · Ruhebild` : fpsText;

    tickValue.textContent = `${formatNumber(state.tick)} · ${formatGameTime(state.tick)}`;
    for (const { id, element } of goodValues) {
      element.textContent = formatNumber(state.storage[id] ?? 0);
    }
    const stats = options.renderStats();
    trianglesValue.textContent = formatNumber(stats.triangles);
    drawCallsValue.textContent = formatNumber(stats.drawCalls);

    for (const button of speedButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.speed === String(clock.speed)));
    }
  };

  // ── Spielgeschwindigkeit ──
  speedGroup.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement)) {
      return;
    }
    const speed = Number(target.dataset.speed);
    if (isGameSpeed(speed)) {
      clock.setSpeed(speed);
      update();
    }
  });

  // ── Ein- und Ausklappen ──
  let timer: number | undefined;
  let isOpen = false;
  const setOpen = (open: boolean): void => {
    isOpen = open;
    panel.hidden = !open;
    toggle.classList.toggle("is-active", open);
    toggle.setAttribute("aria-expanded", String(open));
    const label = open ? "Debug-Anzeige ausblenden" : "Debug-Anzeige einblenden";
    toggle.setAttribute("aria-label", label);
    toggle.title = label;
    window.clearInterval(timer);
    timer = undefined;
    if (open) {
      fpsMeter.reset();
      update();
      timer = window.setInterval(update, UPDATE_INTERVAL_MS);
    }
  };
  toggle.addEventListener("click", () => {
    setOpen(!isOpen);
    saveOpenState(isOpen);
  });

  // Nach dem Zurückkehren aus dem Hintergrund neu messen, sonst stimmt die Bildrate kurz nicht.
  document.addEventListener("visibilitychange", () => {
    fpsMeter.reset();
  });

  setOpen(readOpenState());
}
