/**
 * Hinweis „Neue Version verfügbar – tippen zum Laden“.
 * Ein Tipp lädt die Seite neu; der Browser holt dabei die neueste index.html.
 */
export function showUpdateBanner(banner: HTMLButtonElement): void {
  banner.addEventListener("click", () => {
    window.location.reload();
  });
  banner.hidden = false;
}
