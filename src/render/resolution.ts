/**
 * Berechnet, wie scharf (in wie vielen Bildpunkten) die 3D-Szene gezeichnet wird.
 *
 * Hintergrund: Tablets haben oft 2–3 Bildpunkte pro „normalem“ Punkt (Pixeldichte).
 * Jeder Bildpunkt kostet Rechenzeit. Deshalb begrenzen wir die Pixeldichte (Entscheidung E-008)
 * und erlauben zum Testen eine weitere Verkleinerung per Link-Zusatz, z. B. "?aufloesung=50".
 */

/** Höchste Pixeldichte, mit der gezeichnet wird. */
export const MAX_DEVICE_PIXEL_RATIO = 2;

/** Kleinste erlaubte Auflösung in Prozent. */
export const MIN_RENDER_SCALE_PERCENT = 25;

/** Name des Link-Zusatzes für die Auflösung, z. B. "?aufloesung=50". */
export const RENDER_SCALE_URL_PARAMETER = "aufloesung";

/**
 * Liest die gewünschte Auflösung in Prozent aus dem Link-Zusatz.
 * Fehlt er oder ist er ungültig, gilt 100 %. Werte werden auf 25–100 % begrenzt.
 */
export function parseRenderScalePercent(search: string): number {
  const raw = new URLSearchParams(search).get(RENDER_SCALE_URL_PARAMETER);
  if (raw === null) {
    return 100;
  }
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) {
    return 100;
  }
  return Math.min(100, Math.max(MIN_RENDER_SCALE_PERCENT, value));
}

/**
 * Babylon.js erwartet einen „Hardware-Skalierungsfaktor“:
 * 1 = ein Bildpunkt pro CSS-Punkt, 0,5 = doppelt so scharf, 2 = halb so scharf.
 */
export function computeHardwareScalingLevel(
  devicePixelRatio: number,
  renderScalePercent: number,
  maxDevicePixelRatio: number = MAX_DEVICE_PIXEL_RATIO,
): number {
  const ratio = Number.isFinite(devicePixelRatio) && devicePixelRatio > 0 ? devicePixelRatio : 1;
  const scale = Math.min(100, Math.max(MIN_RENDER_SCALE_PERCENT, renderScalePercent)) / 100;
  return 1 / (Math.min(ratio, maxDevicePixelRatio) * scale);
}
