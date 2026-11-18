/**
 * Liest aus, was das Gerät und der Browser können (für die Testseite check.html).
 * Die reinen Hilfsfunktionen oben sind automatisch getestet, das Auslesen unten läuft nur im Browser.
 */

/**
 * Älteste Chrome-Version, für die das Spiel gebaut wird.
 * Muss zu BUILD_TARGET in vite.config.ts und zur Startprüfung in index.html passen (E-013).
 */
export const MIN_CHROME_VERSION = 111;

export interface InfoEntry {
  readonly label: string;
  readonly value: string;
}

export interface BrandVersion {
  readonly brand: string;
  readonly version: string;
}

/** Liest die Chrome-Hauptversion aus dem Kennungstext des Browsers, z. B. "… Chrome/131.0.0.0 …" → 131. */
export function parseChromeMajorFromUserAgent(userAgent: string): number | undefined {
  const match = /Chrome\/(\d+)/.exec(userAgent);
  return match?.[1] === undefined ? undefined : Number.parseInt(match[1], 10);
}

/**
 * Sucht in der Markenliste des Browsers (User-Agent Client Hints) nach Chrome.
 * Bevorzugt „Google Chrome“, sonst „Chromium“. Gibt z. B. { name: "Google Chrome", version: "131.0.6778.135" } zurück.
 */
export function findChromeBrand(
  brands: readonly BrandVersion[],
): { readonly name: string; readonly version: string } | undefined {
  const preferred = ["Google Chrome", "Chromium", "Microsoft Edge"];
  for (const name of preferred) {
    const match = brands.find((entry) => entry.brand === name);
    if (match !== undefined) {
      return { name, version: match.version };
    }
  }
  return undefined;
}

/** Prüft, ob eine Chrome-Version für das Spiel reicht, mit verständlichem Text. */
export function describeBuildTargetFit(chromeMajor: number | undefined): string {
  if (chromeMajor === undefined) {
    return `unbekannt (Chrome ab Version ${String(MIN_CHROME_VERSION)} nötig)`;
  }
  return chromeMajor >= MIN_CHROME_VERSION
    ? `ja ✅ (Chrome ${String(chromeMajor)}, nötig ab ${String(MIN_CHROME_VERSION)})`
    : `nein ❌ (Chrome ${String(chromeMajor)}, nötig ab ${String(MIN_CHROME_VERSION)})`;
}

/**
 * Beschreibt den Arbeitsspeicher. Chrome rundet die Angabe absichtlich
 * und meldet höchstens 8 GB (Schutz der Privatsphäre).
 */
export function describeMemory(deviceMemoryGb: number | undefined): string {
  if (deviceMemoryGb === undefined) {
    return "nicht auslesbar";
  }
  const amount = deviceMemoryGb.toLocaleString("de-DE");
  return deviceMemoryGb >= 8 ? `mindestens ${amount} GB` : `ca. ${amount} GB (gerundet)`;
}

/** Beschreibt den Bildschirm in Punkten und echten Bildpunkten, z. B. "1280 × 800 Punkte = 1920 × 1200 Bildpunkte". */
export function describeScreen(width: number, height: number, pixelRatio: number): string {
  const physicalWidth = Math.round(width * pixelRatio);
  const physicalHeight = Math.round(height * pixelRatio);
  return `${String(width)} × ${String(height)} Punkte = ${String(physicalWidth)} × ${String(physicalHeight)} Bildpunkte`;
}

/** Schätzt die Bildwiederholrate aus gemessenen Abständen zwischen zwei Bildern (Median, gerundet). */
export function estimateRefreshRate(intervalsMs: readonly number[]): number | undefined {
  const valid = intervalsMs.filter((value) => value > 0).sort((a, b) => a - b);
  if (valid.length === 0) {
    return undefined;
  }
  const median = valid[Math.floor(valid.length / 2)] ?? 0;
  return Math.round(1000 / median);
}

/** Listet alle Marken auf, die der Browser von sich meldet, z. B. "Google Chrome 142, Chromium 142". */
export function describeBrands(brands: readonly BrandVersion[]): string {
  const real = brands.filter((entry) => !/not.?a.?brand/i.test(entry.brand));
  return real.length === 0
    ? "keine Angabe"
    : real.map((entry) => `${entry.brand} ${entry.version}`).join(", ");
}

/** Wandelt die Einträge in kopierbaren Text um, eine Zeile pro Eintrag. */
export function formatInfoText(entries: readonly InfoEntry[]): string {
  return entries.map((entry) => `${entry.label}: ${entry.value}`).join("\n");
}

// ---------------------------------------------------------------------------
// Auslesen im Browser
// ---------------------------------------------------------------------------

/** Felder, die nicht in allen Browsern existieren und deshalb in den Standard-Typen fehlen. */
interface HighEntropyValues {
  readonly platform?: string;
  readonly platformVersion?: string;
  readonly model?: string;
  readonly fullVersionList?: readonly BrandVersion[];
}

interface UserAgentDataLike {
  readonly brands: readonly BrandVersion[];
  readonly platform: string;
  getHighEntropyValues(hints: readonly string[]): Promise<HighEntropyValues>;
}

interface NavigatorExtras {
  readonly userAgentData?: UserAgentDataLike;
  readonly deviceMemory?: number;
}

interface WebGlInfo {
  readonly version: "WebGL2" | "WebGL1" | "keins";
  readonly renderer: string;
  readonly vendor: string;
  readonly maxTextureSize: number | undefined;
}

function readString(value: unknown): string {
  return typeof value === "string" && value !== "" ? value : "unbekannt";
}

/** Öffnet kurz einen unsichtbaren Grafik-Zugang und liest den Grafikchip aus. */
function readWebGlInfo(): WebGlInfo {
  const canvas2 = document.createElement("canvas");
  const gl2 = canvas2.getContext("webgl2");
  const gl = gl2 ?? document.createElement("canvas").getContext("webgl");
  if (gl === null) {
    return {
      version: "keins",
      renderer: "unbekannt",
      vendor: "unbekannt",
      maxTextureSize: undefined,
    };
  }
  // Chrome gibt den echten Namen des Grafikchips nur über diese Erweiterung heraus.
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  const renderer: unknown = gl.getParameter(
    debugInfo === null ? gl.RENDERER : debugInfo.UNMASKED_RENDERER_WEBGL,
  );
  const vendor: unknown = gl.getParameter(
    debugInfo === null ? gl.VENDOR : debugInfo.UNMASKED_VENDOR_WEBGL,
  );
  const maxTextureSize: unknown = gl.getParameter(gl.MAX_TEXTURE_SIZE);
  const info: WebGlInfo = {
    version: gl2 === null ? "WebGL1" : "WebGL2",
    renderer: readString(renderer),
    vendor: readString(vendor),
    maxTextureSize: typeof maxTextureSize === "number" ? maxTextureSize : undefined,
  };
  // Grafik-Zugang wieder freigeben, damit er den späteren Test nicht stört.
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return info;
}

async function readWebGpuInfo(): Promise<string> {
  // Die Standard-Typen versprechen „navigator.gpu“ immer, ältere Browser haben es aber nicht.
  if (!("gpu" in navigator)) {
    return "nein";
  }
  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (adapter === null) {
      return "nein (vorhanden, aber kein Grafikchip freigegeben)";
    }
    // „info“ gibt es erst in neueren Chrome-Versionen, deshalb vorsichtig auslesen.
    const info = (adapter as { readonly info?: Partial<GPUAdapterInfo> }).info;
    const details = [info?.vendor, info?.architecture].filter(
      (part): part is string => part !== undefined && part !== "",
    );
    return details.length > 0 ? `ja (${details.join(", ")})` : "ja";
  } catch {
    return "nein (Fehler beim Abfragen)";
  }
}

async function readHighEntropyValues(
  data: UserAgentDataLike | undefined,
): Promise<HighEntropyValues | undefined> {
  if (data === undefined) {
    return undefined;
  }
  try {
    return await data.getHighEntropyValues(["platformVersion", "model", "fullVersionList"]);
  } catch {
    return undefined;
  }
}

/** Misst etwa eine Sekunde lang die Abstände zwischen zwei Bildern des Bildschirms. */
export function measureRefreshIntervals(durationMs = 1000): Promise<number[]> {
  return new Promise((resolve) => {
    const intervals: number[] = [];
    const start = performance.now();
    let last = start;
    const step = (now: number): void => {
      intervals.push(now - last);
      last = now;
      if (now - start < durationMs) {
        requestAnimationFrame(step);
      } else {
        resolve(intervals.slice(1));
      }
    };
    requestAnimationFrame(step);
  });
}

/**
 * Ladezeit dieser Seite und übertragene Datenmenge (0 kB = alles kam aus dem Zwischenspeicher).
 * Gleich beim Start aufrufen, sonst zählt die Wartezeit danach mit.
 */
export function describeLoad(): string {
  const seconds = performance.now() / 1000;
  const entries = [
    ...performance.getEntriesByType("navigation"),
    ...performance.getEntriesByType("resource"),
  ];
  let bytes = 0;
  for (const entry of entries) {
    if (entry instanceof PerformanceResourceTiming) {
      bytes += entry.transferSize;
    }
  }
  const kilobytes = Math.round(bytes / 1024);
  return `${seconds.toLocaleString("de-DE", { maximumFractionDigits: 1 })} s, ${String(kilobytes)} kB übertragen${kilobytes === 0 ? " (aus dem Zwischenspeicher)" : ""}`;
}

/** Sammelt alle Geräte-Angaben für die Anzeige und den kopierbaren Text. */
export async function collectDeviceInfo(
  refreshIntervalsMs: readonly number[],
  loadDescription: string,
): Promise<InfoEntry[]> {
  const extras = navigator as Navigator & NavigatorExtras;
  const highEntropy = await readHighEntropyValues(extras.userAgentData);
  const webGl = readWebGlInfo();
  const webGpu = await readWebGpuInfo();

  const chrome = findChromeBrand(
    highEntropy?.fullVersionList ?? extras.userAgentData?.brands ?? [],
  );
  const chromeMajor =
    chrome === undefined
      ? parseChromeMajorFromUserAgent(navigator.userAgent)
      : Number.parseInt(chrome.version, 10);
  const browser =
    chrome === undefined
      ? chromeMajor === undefined
        ? navigator.userAgent
        : `Chrome ${String(chromeMajor)}`
      : `${chrome.name} ${chrome.version}`;

  const platform = highEntropy?.platform ?? extras.userAgentData?.platform;
  const operatingSystem =
    platform === undefined || platform === ""
      ? navigator.userAgent
      : `${platform} ${highEntropy?.platformVersion ?? ""}`.trim();

  const refreshRate = estimateRefreshRate(refreshIntervalsMs);
  const touchPoints = navigator.maxTouchPoints;

  return [
    { label: "Gerät (Modell)", value: readString(highEntropy?.model) },
    { label: "Betriebssystem", value: operatingSystem },
    { label: "Browser", value: browser },
    { label: "Build-Ziel passt", value: describeBuildTargetFit(chromeMajor) },
    { label: "WebGL2", value: webGl.version === "WebGL2" ? "ja" : "nein" },
    {
      label: "WebGL1",
      value: webGl.version === "keins" ? "nein" : "ja",
    },
    { label: "WebGPU", value: webGpu },
    { label: "Grafikchip", value: `${webGl.renderer} (${webGl.vendor})` },
    {
      label: "Größte Textur",
      value:
        webGl.maxTextureSize === undefined
          ? "unbekannt"
          : `${String(webGl.maxTextureSize)} × ${String(webGl.maxTextureSize)} Bildpunkte`,
    },
    { label: "Prozessorkerne", value: String(navigator.hardwareConcurrency) },
    { label: "Arbeitsspeicher", value: describeMemory(extras.deviceMemory) },
    {
      label: "Bildschirm",
      value: describeScreen(screen.width, screen.height, window.devicePixelRatio),
    },
    {
      label: "Fenster",
      value: describeScreen(window.innerWidth, window.innerHeight, window.devicePixelRatio),
    },
    { label: "Pixeldichte", value: window.devicePixelRatio.toLocaleString("de-DE") },
    {
      label: "Bildwiederholrate",
      value: refreshRate === undefined ? "unbekannt" : `ca. ${String(refreshRate)} Hz`,
    },
    {
      label: "Touch",
      value: touchPoints > 0 ? `ja (bis zu ${String(touchPoints)} Finger)` : "nein",
    },
    {
      label: "Ausrichtung",
      value: screen.orientation.type.startsWith("landscape") ? "quer" : "hoch",
    },
    { label: "Ladezeit dieser Seite", value: loadDescription },
    {
      label: "Browser-Marken",
      value: describeBrands(highEntropy?.fullVersionList ?? extras.userAgentData?.brands ?? []),
    },
    { label: "Browser-Kennung", value: navigator.userAgent },
  ];
}
