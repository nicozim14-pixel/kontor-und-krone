import { formatBuildInfo, readBuildInfo } from "../core/buildInfo";

/** Zeigt Bauzeitpunkt und Commit-Kürzel klein in der Ecke an. */
export function showVersionBadge(element: HTMLElement): void {
  element.textContent = formatBuildInfo(readBuildInfo());
}
