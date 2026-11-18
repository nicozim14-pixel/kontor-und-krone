/**
 * Versionsangaben des aktuellen Builds: wann gebaut und aus welchem Commit.
 * Damit sieht man auf dem Gerät, ob die neueste Version geladen ist.
 */
export interface BuildInfo {
  /** Bauzeitpunkt als ISO-Zeitangabe, z. B. "2026-11-18T18:42:00.000Z" */
  readonly builtAt: string;
  /** Kurzes Commit-Kürzel, z. B. "1b91c9f" ("dev" beim lokalen Entwickeln) */
  readonly commit: string;
}

export function readBuildInfo(): BuildInfo {
  return { builtAt: __BUILD_TIME__, commit: __COMMIT_HASH__ };
}

/**
 * Formatiert die Versionsangaben für die Anzeige, z. B. "18.11.2026, 19:42 · 1b91c9f".
 * @param timeZone Zeitzone für die Anzeige; ohne Angabe die des Geräts.
 */
export function formatBuildInfo(info: BuildInfo, timeZone?: string): string {
  const date = new Date(info.builtAt);
  if (Number.isNaN(date.getTime())) {
    return info.commit;
  }
  const formatted = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(date);
  return `${formatted} · ${info.commit}`;
}
