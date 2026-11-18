/**
 * Unterbindet Browser-Gesten, die beim Spielen stören würden.
 * Ergänzt die CSS-Regeln in styles.css (touch-action, overscroll-behavior, user-select).
 */
export function preventBrowserGestures(): void {
  // Langes Drücken öffnet kein Browser-Menü (am PC ebenso wenig ein Rechtsklick)
  document.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  // Strg + Mausrad (Tablet mit Tastatur oder Claudes Tests am PC) würde die ganze Seite vergrößern
  window.addEventListener(
    "wheel",
    (event) => {
      if (event.ctrlKey) {
        event.preventDefault();
      }
    },
    { passive: false },
  );

  // Strg + Plus / Minus / 0 würde die Seite vergrößern oder verkleinern
  window.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && ["+", "-", "=", "0"].includes(event.key)) {
      event.preventDefault();
    }
  });

  // Mehrere Finger dürfen auch außerhalb der Spielfläche (z. B. auf Knöpfen) nicht zoomen
  document.addEventListener(
    "touchmove",
    (event) => {
      if (event.touches.length > 1) {
        event.preventDefault();
      }
    },
    { passive: false },
  );
}
