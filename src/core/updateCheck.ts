import type { BuildInfo } from "./buildInfo";

/**
 * Erkennt, ob online eine neuere Version des Spiels liegt.
 *
 * Beim Bauen entsteht die kleine Datei „version.json“ mit Bauzeitpunkt und Commit-Kürzel
 * (siehe vite.config.ts). Das laufende Spiel lädt sie regelmäßig neu und vergleicht.
 */

/** Dateiname der Versionsdatei neben index.html. */
export const VERSION_FILE_NAME = "version.json";

/** Wie oft nachgefragt wird (2 Minuten). */
export const UPDATE_CHECK_INTERVAL_MS = 2 * 60 * 1000;

/** Prüft, ob unbekannte Daten (z. B. aus dem Netz) wie Versionsangaben aussehen. */
export function parseBuildInfo(data: unknown): BuildInfo | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const { builtAt, commit } = data as Record<string, unknown>;
  if (typeof builtAt !== "string" || typeof commit !== "string" || commit === "") {
    return null;
  }
  if (Number.isNaN(new Date(builtAt).getTime())) {
    return null;
  }
  return { builtAt, commit };
}

/**
 * Ist die Online-Version neuer als die laufende?
 * Neuer heißt: anderer Commit UND später gebaut. So gibt es keinen Hinweis,
 * falls ein Zwischenspeicher im Netz kurzzeitig noch eine ältere Versionsdatei liefert.
 */
export function isNewerBuild(current: BuildInfo, online: BuildInfo): boolean {
  if (online.commit === current.commit) {
    return false;
  }
  return new Date(online.builtAt).getTime() > new Date(current.builtAt).getTime();
}

/**
 * Fragt regelmäßig nach einer neueren Version und ruft dann einmalig `onNewerBuild` auf.
 * Zusätzlich wird sofort nachgefragt, wenn man zum Spiel zurückkehrt (z. B. Tab wieder geöffnet).
 * Beim lokalen Entwickeln ("dev") passiert nichts.
 */
export function watchForNewerBuild(current: BuildInfo, onNewerBuild: () => void): void {
  if (current.commit === "dev") {
    return;
  }

  let found = false;
  const check = async (): Promise<void> => {
    if (found) {
      return;
    }
    try {
      // Der Zeitstempel im Link umgeht alle Zwischenspeicher.
      const response = await fetch(`./${VERSION_FILE_NAME}?t=${String(Date.now())}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        return;
      }
      const online = parseBuildInfo(await response.json());
      if (online !== null && isNewerBuild(current, online)) {
        found = true;
        window.clearInterval(timer);
        onNewerBuild();
      }
    } catch {
      // Kein Netz oder kurzzeitiger Fehler: beim nächsten Mal wieder versuchen.
    }
  };

  const timer = window.setInterval(() => void check(), UPDATE_CHECK_INTERVAL_MS);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
      void check();
    }
  });
  void check();
}
