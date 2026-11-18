/**
 * Plan und Auswertung des Belastungstests (Stresstest) auf der Testseite check.html.
 * Diese Datei enthält nur reine Rechen-Logik ohne Babylon.js, damit sie automatisch getestet werden kann.
 */

/** Anzahl der Objekte pro Stufe (so wie später Bäume und Häuser). */
export const OBJECT_COUNTS: readonly number[] = [500, 2000, 10_000, 30_000];

/**
 * Anzahl einzeln gezeichneter Objekte (jedes ein eigener „Draw Call“, also ein eigener Zeichenauftrag).
 * Misst, wie viele getrennte Objekte der Prozessor pro Bild an den Grafikchip schicken kann.
 */
export const SEPARATE_COUNTS: readonly number[] = [100, 300, 1000];

/** Auflösungen in Prozent: volle Schärfe und halbe Schärfe (pro Seite). */
export const RESOLUTION_PERCENTS: readonly number[] = [100, 50];

/** Ab dieser Bildrate gilt eine Stufe als „gut“ (Vorschlag aus dem Phasenplan). */
export const GOOD_FPS = 30;

/** Ab dieser Bildrate gilt eine Stufe als „knapp“, darunter als „zu langsam“. */
export const OK_FPS = 20;

/**
 * Schutz gegen Einfrieren: Ist die Bildrate nach dem Aufwärmen niedriger,
 * wird die Stufe sofort beendet und die größeren Stufen derselben Einstellung werden übersprungen.
 */
export const ABORT_BELOW_FPS = 8;

/** Schutz gegen Einfrieren: Dauert ein einzelnes Bild länger, wird die Stufe beendet. */
export const ABORT_FRAME_MS = 1000;

/** Die ersten Bilder einer Stufe dürfen lange dauern (Grafik-Programme werden vorbereitet). */
export const IGNORED_START_FRAMES = 3;

export interface StageTiming {
  /** Aufwärmzeit: Die Szene läuft, wird aber noch nicht gemessen. */
  readonly warmupMs: number;
  /** Messzeit pro Stufe (zugleich das Zeitlimit der Messung). */
  readonly measureMs: number;
}

/** Normale Zeiten: 19 Stufen × 5 s ≈ 1½ Minuten. */
export const NORMAL_TIMING: StageTiming = { warmupMs: 1000, measureMs: 4000 };

/** Kurze Zeiten für Claudes automatische Prüfung (Link-Zusatz „?schnell“). */
export const QUICK_TIMING: StageTiming = { warmupMs: 300, measureMs: 700 };

/**
 * Art der Objekte:
 * - "gestempelt": alle als Thin Instances in einem einzigen Zeichenauftrag (so werden später Bäume und Häuser gezeichnet)
 * - "einzeln": jedes Objekt als eigener Zeichenauftrag (Draw Call)
 */
export type StageKind = "gestempelt" | "einzeln";

export interface StressStage {
  /** Laufende Nummer ab 1 */
  readonly number: number;
  readonly kind: StageKind;
  readonly objectCount: number;
  readonly shadows: boolean;
  readonly resolutionPercent: number;
}

/**
 * Erstellt die Reihenfolge der Stufen: erst volle, dann halbe Auflösung;
 * jeweils erst ohne, dann mit Schatten; jeweils von wenigen zu vielen Objekten.
 * Zum Schluss die einzeln gezeichneten Objekte (ohne Schatten, volle Auflösung).
 */
export function buildStressPlan(
  counts: readonly number[] = OBJECT_COUNTS,
  resolutions: readonly number[] = RESOLUTION_PERCENTS,
  separateCounts: readonly number[] = SEPARATE_COUNTS,
): StressStage[] {
  const stages: StressStage[] = [];
  for (const resolutionPercent of resolutions) {
    for (const shadows of [false, true]) {
      for (const objectCount of counts) {
        stages.push({
          number: stages.length + 1,
          kind: "gestempelt",
          objectCount,
          shadows,
          resolutionPercent,
        });
      }
    }
  }
  for (const objectCount of separateCounts) {
    stages.push({
      number: stages.length + 1,
      kind: "einzeln",
      objectCount,
      shadows: false,
      resolutionPercent: 100,
    });
  }
  return stages;
}

export type StageStatus = "gemessen" | "zu langsam" | "übersprungen" | "abgebrochen";

export interface StageResult {
  readonly stage: StressStage;
  readonly status: StageStatus;
  /** Durchschnittliche Bilder pro Sekunde während der Messzeit */
  readonly averageFps?: number;
  /** Längste Zeit für ein einzelnes Bild in Millisekunden (zeigt Ruckler) */
  readonly worstFrameMs?: number;
  /** Gezeichnete Dreiecke pro Bild (ohne Schatten-Durchgang) */
  readonly triangles: number;
  /** Tatsächliche Größe der Zeichenfläche in Bildpunkten, z. B. "1920×1200" */
  readonly canvasSize?: string;
}

/** War eine Stufe so langsam, dass größere Stufen derselben Einstellung sinnlos sind? */
function isHopeless(result: StageResult): boolean {
  if (result.status === "zu langsam" || result.status === "übersprungen") {
    return true;
  }
  return (
    result.status === "gemessen" &&
    result.averageFps !== undefined &&
    result.averageFps < ABORT_BELOW_FPS
  );
}

/**
 * Prüft, ob eine Stufe übersprungen werden soll, weil eine kleinere Stufe
 * mit denselben Einstellungen schon zu langsam war (Schutz gegen Einfrieren).
 */
export function shouldSkipStage(stage: StressStage, previous: readonly StageResult[]): boolean {
  return previous.some(
    (result) =>
      isHopeless(result) &&
      result.stage.kind === stage.kind &&
      result.stage.shadows === stage.shadows &&
      result.stage.resolutionPercent === stage.resolutionPercent &&
      result.stage.objectCount < stage.objectCount,
  );
}

export interface FrameSummary {
  readonly averageFps: number;
  readonly worstFrameMs: number;
}

/**
 * Fasst die gemessenen Bildzeiten zusammen.
 * @param frameTimesMs Dauer jedes Bildes in Millisekunden
 * @param durationMs Gesamtdauer der Messung in Millisekunden
 */
export function summarizeFrames(frameTimesMs: readonly number[], durationMs: number): FrameSummary {
  if (frameTimesMs.length === 0 || durationMs <= 0) {
    return { averageFps: 0, worstFrameMs: 0 };
  }
  return {
    averageFps: frameTimesMs.length / (durationMs / 1000),
    worstFrameMs: Math.max(...frameTimesMs),
  };
}

export type FpsRating = "gut" | "knapp" | "zu langsam";

/** Bewertet eine Bildrate: ab 30 gut, ab 20 knapp, darunter zu langsam. */
export function rateFps(fps: number): FpsRating {
  if (fps >= GOOD_FPS) {
    return "gut";
  }
  if (fps >= OK_FPS) {
    return "knapp";
  }
  return "zu langsam";
}

const RATING_SYMBOL: Record<FpsRating, string> = {
  gut: "✅",
  knapp: "⚠️",
  "zu langsam": "❌",
};

/** Zahl im deutschen Format, z. B. 30000 → "30.000". */
export function formatNumber(value: number, fractionDigits = 0): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/** Kurze Beschreibung einer Stufe, z. B. "10.000 Objekte · mit Schatten · 50 % Auflösung". */
export function describeStage(stage: StressStage): string {
  return [
    stage.kind === "einzeln"
      ? `${formatNumber(stage.objectCount)} Einzelobjekte (Draw Calls)`
      : `${formatNumber(stage.objectCount)} Objekte`,
    stage.shadows ? "mit Schatten" : "ohne Schatten",
    `${String(stage.resolutionPercent)} % Auflösung`,
  ].join(" · ");
}

/** Bewertung als Text mit Symbol, z. B. "✅ gut" oder "– übersprungen". */
export function describeOutcome(result: StageResult): string {
  if (result.status === "gemessen" && result.averageFps !== undefined) {
    const rating = rateFps(result.averageFps);
    return `${RATING_SYMBOL[rating]} ${rating}`;
  }
  if (result.status === "zu langsam") {
    return `${RATING_SYMBOL["zu langsam"]} zu langsam (vorzeitig beendet)`;
  }
  return `– ${result.status}`;
}

/** Eine Ergebniszeile als Text, z. B. für die kopierbare Zusammenfassung. */
export function formatResultLine(result: StageResult): string {
  const parts = [`${String(result.stage.number).padStart(2, " ")}. ${describeStage(result.stage)}`];
  if (result.averageFps !== undefined) {
    parts.push(`${formatNumber(result.averageFps, 1)} FPS`);
  }
  if (result.worstFrameMs !== undefined) {
    parts.push(`langsamstes Bild ${formatNumber(result.worstFrameMs)} ms`);
  }
  if (result.canvasSize !== undefined) {
    parts.push(result.canvasSize);
  }
  parts.push(`${formatNumber(result.triangles)} Dreiecke`);
  parts.push(describeOutcome(result));
  return parts.join(" | ");
}
