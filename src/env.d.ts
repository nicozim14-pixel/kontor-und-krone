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
  /** Messwerte des laufenden Spiels für das Prüf-Skript (gesetzt in app/startGame.ts). */
  kkStats?: {
    /** Anzahl der gerechneten Wirtschafts-Takte */
    readonly tick: number;
    /** Holz im Test-Lager */
    readonly wood: number;
    /** Spielgeschwindigkeit (0 = Pause) */
    readonly speed: number;
    /** Anzahl der gezeichneten Bilder */
    readonly renderedFrames: number;
    /** Ist gerade Ruhebild? */
    readonly idle: boolean;
    readonly seed: number;
    readonly maxFps: number;
  };
}
