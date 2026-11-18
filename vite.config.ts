import { execSync } from "node:child_process";
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

export default defineConfig(({ command }) => ({
  // Relative Pfade, damit das Spiel auch in einem Unterordner läuft (z. B. GitHub Pages).
  base: "./",
  define: {
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_HASH__: JSON.stringify(command === "serve" ? "dev" : readCommitHash()),
  },
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
}));
