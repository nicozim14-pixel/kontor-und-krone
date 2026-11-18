/**
 * Werte, die Vite beim Bauen fest in den Code schreibt (siehe vite.config.ts).
 */
declare const __BUILD_TIME__: string;
declare const __COMMIT_HASH__: string;

/**
 * Zusätzliche Felder am Browser-Fenster.
 * Sie verbinden den Spielcode mit der Startprüfung in index.html und mit dem Prüf-Skript.
 */
interface Window {
  /** Wird gesetzt, sobald der Browser den Spielcode verstanden hat. */
  kkBooted?: boolean;
  /** Wird gesetzt, sobald das erste Bild der 3D-Szene gezeichnet ist. */
  kkSceneReady?: boolean;
  /** Zeigt einen deutschen Fehler-Hinweis (definiert in index.html). */
  kkShowError?: (title: string, details: string) => void;
}
