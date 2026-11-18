import { execSync } from "node:child_process";
import type { Plugin } from "vite";
import { defineConfig } from "vitest/config";

/**
 * Ältester Browser, für den gebaut wird (Entscheidung E-006).
 * Neuere Sprachmittel werden beim Bauen automatisch in ältere übersetzt.
 * Wird in Unterphase 1.5 mit dem echten Laptop-Browser abgeglichen.
 */
const BUILD_TARGET = ["chrome87", "edge88", "firefox78", "safari14"];

/** Kurzes Commit-Kürzel für die Versionsanzeige. */
function readCommitHash(): string {
  // Beim automatischen Bauen auf GitHub steht das Kürzel in einer Umgebungsvariablen.
  const fromCi = process.env.GITHUB_SHA;
  if (fromCi !== undefined && fromCi !== "") {
    return fromCi.slice(0, 7);
  }
  try {
    return execSync("git rev-parse --short=7 HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unbekannt";
  }
}

/**
 * Legt beim Bauen die Datei „version.json“ neben index.html.
 * Das laufende Spiel fragt sie regelmäßig ab und erkennt so neue Versionen (src/core/updateCheck.ts).
 */
function versionFilePlugin(builtAt: string, commit: string): Plugin {
  return {
    name: "kontor-und-krone:version-file",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "version.json",
        source: `${JSON.stringify({ builtAt, commit }, null, 2)}\n`,
      });
    },
  };
}

export default defineConfig(({ command }) => {
  const builtAt = new Date().toISOString();
  const commit = command === "serve" ? "dev" : readCommitHash();

  return {
    // Relative Pfade, damit das Spiel auch in einem Unterordner läuft (z. B. GitHub Pages).
    base: "./",
    define: {
      __BUILD_TIME__: JSON.stringify(builtAt),
      __COMMIT_HASH__: JSON.stringify(commit),
    },
    plugins: [versionFilePlugin(builtAt, commit)],
    build: {
      target: BUILD_TARGET,
      // Quellkarten helfen beim Fehlersuchen und werden nur bei geöffneten Entwicklerwerkzeugen geladen.
      sourcemap: true,
      // Babylon.js allein ist ca. 1,1 MB groß (ca. 265 kB komprimiert übertragen).
      // Warnung erst ab 1,4 MB; das verbindliche Download-Budget folgt in Unterphase 1.5.
      chunkSizeWarningLimit: 1400,
    },
    test: {
      include: ["src/**/*.test.ts"],
      environment: "node",
    },
  };
});
