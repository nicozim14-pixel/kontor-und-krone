/**
 * Prüf-Skript für Claude: startet das gebaute Spiel in einem unsichtbaren Chrome,
 * macht Bildschirmfotos in mehreren Gerätegrößen und meldet Fehler.
 *
 * Aufruf (nach "npm run build"):  npm run screenshot
 * Ergebnis: Bilder im Ordner screenshots/ (wird nicht ins Repository gespeichert).
 * Der Pfad zu Chrome lässt sich mit der Umgebungsvariablen CHROME_PATH ändern.
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";
import { preview } from "vite";

const CHROME_PATH = process.env.CHROME_PATH ?? "/usr/bin/google-chrome";
const OUTPUT_DIR = "screenshots";

interface DeviceCase {
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly deviceScaleFactor: number;
  readonly touch: boolean;
  /** Erwartet, dass der Hinweis „Bitte ins Querformat drehen“ sichtbar ist. */
  readonly expectRotateHint: boolean;
}

const DEVICES: readonly DeviceCase[] = [
  {
    name: "laptop",
    width: 1366,
    height: 768,
    deviceScaleFactor: 1,
    touch: false,
    expectRotateHint: false,
  },
  {
    name: "tablet-quer",
    width: 1280,
    height: 800,
    deviceScaleFactor: 1.5,
    touch: true,
    expectRotateHint: false,
  },
  {
    name: "tablet-hoch",
    width: 800,
    height: 1280,
    deviceScaleFactor: 1.5,
    touch: true,
    expectRotateHint: true,
  },
];

interface PageReport {
  readonly version: string;
  readonly canvasSize: string;
  readonly rotateHintVisible: boolean;
  readonly bootErrorVisible: boolean;
}

// Wird im Browser ausgeführt (deshalb als Text, nicht als Node-Code)
const READ_PAGE_REPORT = `(() => {
  const isVisible = (id) => {
    const el = document.getElementById(id);
    return el !== null && getComputedStyle(el).display !== "none";
  };
  const canvas = document.getElementById("game-canvas");
  return {
    version: document.getElementById("version")?.textContent ?? "",
    canvasSize: canvas ? canvas.width + "x" + canvas.height : "fehlt",
    rotateHintVisible: isVisible("rotate-hint"),
    bootErrorVisible: isVisible("boot-error"),
  };
})()`;

const server = await preview({ logLevel: "warn", preview: { port: 4173 } });
const url = server.resolvedUrls?.local[0] ?? "http://localhost:4173/";
const browser = await chromium.launch({
  executablePath: CHROME_PATH,
  // Software-Grafik, weil die Cloud-Umgebung keinen Grafikchip hat
  args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
});

let problems = 0;
try {
  await mkdir(OUTPUT_DIR, { recursive: true });
  for (const device of DEVICES) {
    const context = await browser.newContext({
      viewport: { width: device.width, height: device.height },
      deviceScaleFactor: device.deviceScaleFactor,
      isMobile: device.touch,
      hasTouch: device.touch,
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") {
        errors.push(message.text());
      }
    });

    await page.goto(url, { waitUntil: "load" });
    try {
      await page.waitForFunction("window.kkSceneReady === true", null, { timeout: 30_000 });
    } catch {
      errors.push("Szene wurde nicht innerhalb von 30 Sekunden fertig.");
    }
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${OUTPUT_DIR}/${device.name}.png` });
    const report = await page.evaluate<PageReport>(READ_PAGE_REPORT);

    if (report.bootErrorVisible) {
      errors.push("Fehler-Hinweis ist sichtbar.");
    }
    if (report.rotateHintVisible !== device.expectRotateHint) {
      errors.push(
        `Querformat-Hinweis ist ${report.rotateHintVisible ? "sichtbar" : "unsichtbar"}, erwartet: ${device.expectRotateHint ? "sichtbar" : "unsichtbar"}.`,
      );
    }

    const status = errors.length === 0 ? "OK" : "PROBLEM";
    console.log(
      `${status}  ${device.name}: Leinwand ${report.canvasSize}, Version „${report.version}“`,
    );
    for (const error of errors) {
      console.log(`      - ${error}`);
    }
    if (errors.length > 0) {
      problems += 1;
    }
    await context.close();
  }
} finally {
  await browser.close();
  await server.close();
}

process.exitCode = problems > 0 ? 1 : 0;
