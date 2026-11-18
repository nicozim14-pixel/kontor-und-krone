/**
 * Zahlen und Zeiten für die Debug-Anzeige in deutscher Schreibweise.
 */
import { TICK_MS } from "../core/clock";

const NUMBER_FORMAT = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 0 });

/** Ganze Zahl mit Tausenderpunkt, z. B. 12345 → „12.345“. */
export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

/**
 * Spielzeit aus der Zahl der Takte (1 Takt = 0,5 s), z. B. 124 Takte → „1:02“,
 * ab einer Stunde mit Stunden: „1:00:00“.
 */
export function formatGameTime(tick: number): string {
  const totalSeconds = Math.floor((tick * TICK_MS) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const ss = String(seconds).padStart(2, "0");
  if (hours > 0) {
    return `${String(hours)}:${String(minutes).padStart(2, "0")}:${ss}`;
  }
  return `${String(minutes)}:${ss}`;
}
