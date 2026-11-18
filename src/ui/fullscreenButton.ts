/**
 * Vollbild-Knopf: blendet Adressleiste und Bedienleisten des Browsers aus.
 * Auf dem Tablet wird im Vollbild zusätzlich das Querformat festgehalten (falls möglich).
 */
export function setupFullscreenButton(button: HTMLButtonElement): void {
  if (!document.fullscreenEnabled) {
    button.hidden = true;
    return;
  }

  const updateButton = (): void => {
    const active = document.fullscreenElement !== null;
    const label = active ? "Vollbild beenden" : "Vollbild";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-label", label);
    button.title = label;
  };

  button.addEventListener("click", () => {
    void toggleFullscreen();
  });
  document.addEventListener("fullscreenchange", updateButton);
  updateButton();
}

async function toggleFullscreen(): Promise<void> {
  try {
    if (document.fullscreenElement !== null) {
      await document.exitFullscreen();
      return;
    }
    await document.documentElement.requestFullscreen({ navigationUI: "hide" });
  } catch {
    // Der Browser hat Vollbild abgelehnt (z. B. ohne direkten Tipp). Dann bleibt alles, wie es ist.
    return;
  }

  try {
    await screen.orientation.lock("landscape");
  } catch {
    // Festhalten des Querformats geht nicht überall (z. B. in manchen Browsern am PC). Das ist kein Problem.
  }
}
