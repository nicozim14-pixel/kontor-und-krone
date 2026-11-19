/**
 * Einstellungen per Link-Zusatz (z. B. „…/kontor-und-krone/?seed=42“), vor allem zum Testen.
 * Weitere Link-Zusätze: `?aufloesung=50` (render/resolution.ts) und `?fps=45` (render/frameScheduler.ts).
 */
import { parseSeed } from "../core/random";

/** Seed, wenn im Link keiner angegeben ist. Ein fester Wert macht Tests wiederholbar. */
export const DEFAULT_SEED = 1701;

/** Link-Zusatz für den Seed, z. B. "?seed=42" oder "?seed=Barock". */
export const SEED_URL_PARAMETER = "seed";

/** Liest den Seed aus dem Link-Zusatz; ohne Angabe gilt DEFAULT_SEED. */
export function readSeed(search: string): number {
  const raw = new URLSearchParams(search).get(SEED_URL_PARAMETER);
  return raw === null || raw.trim() === "" ? DEFAULT_SEED : parseSeed(raw);
}

/**
 * Derselbe Link mit einem anderen Seed (für „Neue Welt“ in der Debug-Anzeige).
 * Andere Link-Zusätze (z. B. `?fps=45`) bleiben erhalten.
 */
export function urlWithSeed(href: string, seed: string): string {
  const url = new URL(href);
  url.searchParams.set(SEED_URL_PARAMETER, seed.trim());
  return url.toString();
}
