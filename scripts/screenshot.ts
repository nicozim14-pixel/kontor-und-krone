/**
 * Prüf-Skript für Claude: startet das gebaute Spiel in einem unsichtbaren Chrome,
 * macht Bildschirmfotos in mehreren Gerätegrößen und meldet Fehler.
 *
 * Aufruf (nach "npm run build"):  npm run screenshot
 * Ergebnis: Bilder im Ordner screenshots/ (wird nicht ins Repository gespeichert).
 * Der Pfad zu Chrome lässt sich mit der Umgebungsvariablen CHROME_PATH ändern.
 */
import { mkdir } from "node:fs/promises";
import { chromium, type Page } from "playwright-core";
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

interface LoopStats {
  readonly tick: number;
  readonly wood: number;
  readonly speed: number;
  readonly renderedFrames: number;
  readonly idle: boolean;
}

const READ_LOOP_STATS = `(() => {
  const s = window.kkStats;
  return s
    ? { tick: s.tick, wood: s.wood, speed: s.speed, renderedFrames: s.renderedFrames, idle: s.idle }
    : null;
})()`;

async function readLoopStats(page: Page): Promise<LoopStats> {
  const stats = await page.evaluate<LoopStats | null>(READ_LOOP_STATS);
  if (stats === null) {
    throw new Error("window.kkStats fehlt.");
  }
  return stats;
}

/**
 * Prüft die Spiel-Schleife im laufenden Spiel (Unterphase 1.6):
 * Wirtschafts-Takt (2 pro Sekunde), Ruhebild nach 2 Sekunden ohne Bewegung,
 * sofortiges Aufwachen bei Berührung, Bildraten-Begrenzer.
 */
async function checkGameLoop(page: Page): Promise<string[]> {
  const errors: string[] = [];
  const read = (): Promise<LoopStats> => readLoopStats(page);

  const start = await read();
  await page.waitForTimeout(3000);
  const afterWait = await read();
  const ticks = afterWait.tick - start.tick;
  if (ticks < 5 || ticks > 7) {
    errors.push(`In 3 Sekunden ${String(ticks)} Takte gerechnet, erwartet etwa 6.`);
  }
  if (!afterWait.idle) {
    errors.push("Nach 3 Sekunden ohne Bewegung ist kein Ruhebild aktiv.");
  }
  // Der Test-Holzfäller steht ab dem Start und legt pro Takt 1 Holz ins Lager.
  if (afterWait.wood !== afterWait.tick) {
    errors.push(
      `Holz ${String(afterWait.wood)} passt nicht zu ${String(afterWait.tick)} Takten (erwartet: gleich viel).`,
    );
  }

  await page.waitForTimeout(2000);
  const idleEnd = await read();
  const idleFrames = idleEnd.renderedFrames - afterWait.renderedFrames;
  if (idleFrames > 4) {
    errors.push(
      `Im Ruhebild ${String(idleFrames)} Bilder in 2 Sekunden gezeichnet, erwartet höchstens etwa 2.`,
    );
  }

  // Mit dem „Finger“ über die Spielfläche wischen (1 Sekunde lang)
  await page.mouse.move(640, 400);
  await page.mouse.down();
  const beforeDrag = await read();
  for (let i = 1; i <= 20; i++) {
    await page.mouse.move(640 + i * 10, 400);
    await page.waitForTimeout(50);
  }
  await page.mouse.up();
  const afterDrag = await read();
  const dragFrames = afterDrag.renderedFrames - beforeDrag.renderedFrames;
  if (afterDrag.idle) {
    errors.push("Nach dem Wischen ist immer noch Ruhebild.");
  }
  if (dragFrames < 10 || dragFrames > 70) {
    errors.push(`Beim Wischen ${String(dragFrames)} Bilder in ca. 1 Sekunde, erwartet 10 bis 60.`);
  }

  console.log(
    `      Schleife: ${String(ticks)} Takte in 3 s · Ruhebild: ${String(idleFrames)} Bilder in 2 s · ` +
      `beim Wischen: ${String(dragFrames)} Bilder in ca. 1 s`,
  );
  return errors;
}

/**
 * Prüft die Debug-Anzeige (Unterphase 1.7): Inhalt, Tempo-Knöpfe, Ein- und Ausklappen.
 */
async function checkDebugPanel(page: Page): Promise<string[]> {
  const errors: string[] = [];
  if (await page.isHidden("#debug-panel")) {
    errors.push("Debug-Anzeige ist beim ersten Start nicht sichtbar.");
    return errors;
  }
  const text = await page.innerText("#debug-panel");
  for (const label of ["FPS", "Takt", "Holz", "Dreiecke", "Draw Calls", "Seed", "Pause", "4×"]) {
    if (!text.includes(label)) {
      errors.push(`Debug-Anzeige: „${label}“ fehlt.`);
    }
  }
  const triangles = /Dreiecke\s+([\d.]+)/.exec(text)?.[1];
  const drawCalls = /Draw Calls\s+([\d.]+)/.exec(text)?.[1];
  if (triangles === undefined || Number(triangles.replace(/\./g, "")) <= 0) {
    errors.push(`Debug-Anzeige: keine Dreiecke gemessen („${String(triangles)}“).`);
  }
  if (drawCalls === undefined || Number(drawCalls) <= 0) {
    errors.push(`Debug-Anzeige: keine Draw Calls gemessen („${String(drawCalls)}“).`);
  }

  // Pause: Es entstehen keine Takte und kein Holz.
  await page.tap('#debug-panel button[data-speed="0"]');
  const paused = await readLoopStats(page);
  await page.waitForTimeout(1500);
  const afterPause = await readLoopStats(page);
  if (paused.speed !== 0 || afterPause.tick !== paused.tick || afterPause.wood !== paused.wood) {
    errors.push(
      `Pause wirkt nicht: Tempo ${String(paused.speed)}, Takte ${String(paused.tick)} → ${String(afterPause.tick)}.`,
    );
  }
  if ((await page.getAttribute('#debug-panel button[data-speed="0"]', "aria-pressed")) !== "true") {
    errors.push("Der Pause-Knopf ist nicht als gedrückt markiert.");
  }

  // 4×: 8 Takte pro Sekunde
  await page.tap('#debug-panel button[data-speed="4"]');
  const fast = await readLoopStats(page);
  await page.waitForTimeout(2000);
  const afterFast = await readLoopStats(page);
  const fastTicks = afterFast.tick - fast.tick;
  if (fastTicks < 14 || fastTicks > 18) {
    errors.push(`Bei 4× ${String(fastTicks)} Takte in 2 Sekunden, erwartet etwa 16.`);
  }
  if (afterFast.wood !== afterFast.tick) {
    errors.push("Bei 4× passt das Holz nicht mehr zu den Takten.");
  }
  await page.screenshot({ path: `${OUTPUT_DIR}/tablet-quer-debug.png` });
  await page.tap('#debug-panel button[data-speed="1"]');

  // Ein- und Ausklappen
  await page.tap("#debug-toggle");
  if (!(await page.isHidden("#debug-panel"))) {
    errors.push("Debug-Anzeige lässt sich nicht einklappen.");
  }
  await page.tap("#debug-toggle");
  if (await page.isHidden("#debug-panel")) {
    errors.push("Debug-Anzeige lässt sich nicht wieder aufklappen.");
  }

  console.log(
    `      Debug-Anzeige: Pause hält an · 4×: ${String(fastTicks)} Takte in 2 s · ` +
      `Dreiecke ${String(triangles)} · Draw Calls ${String(drawCalls)}`,
  );
  return errors;
}

/**
 * Spielt die Testseite check.html einmal im Schnelldurchlauf durch („?schnell“):
 * Geräte-Angaben, Belastungstest mit allen Stufen, kopierbarer Ergebnistext.
 */
async function checkDeviceCheckPage(): Promise<number> {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1.5,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(`${url}check.html?schnell`, { waitUntil: "load" });
  await page.waitForFunction("window.kkCheckInfoReady === true", null, { timeout: 30_000 });
  await page.screenshot({ path: `${OUTPUT_DIR}/check-info.png`, fullPage: true });

  await page.click("#start-button");
  // Der Schnelldurchlauf dauert nur wenige Sekunden, deshalb früh fotografieren.
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUTPUT_DIR}/check-belastung.png` });
  if (!(await page.isHidden("#panel"))) {
    errors.push("Während des Tests ist die Info-Seite noch sichtbar.");
  }
  await page.waitForFunction("window.kkCheckDone === true", null, { timeout: 300_000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUTPUT_DIR}/check-ergebnis.png`, fullPage: true });

  const report = await page.inputValue("#report");
  const resultLines = report.split("\n").filter((line) => /^\s?\d+\. /.test(line));
  if (resultLines.length !== 19) {
    errors.push(`Erwartet 19 Ergebniszeilen, gefunden: ${String(resultLines.length)}.`);
  }
  if (!(await page.isHidden("#error-box"))) {
    errors.push("Fehler-Hinweis ist sichtbar.");
  }

  console.log(`${errors.length === 0 ? "OK" : "PROBLEM"}  check.html (Schnelldurchlauf):`);
  console.log(report.replace(/^/gm, "      "));
  for (const error of errors) {
    console.log(`      - ${error}`);
  }
  await context.close();
  return errors.length > 0 ? 1 : 0;
}

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

    if (device.name === "tablet-quer") {
      errors.push(...(await checkGameLoop(page)));
      errors.push(...(await checkDebugPanel(page)));
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

  problems += await checkDeviceCheckPage();
} finally {
  await browser.close();
  await server.close();
}

process.exitCode = problems > 0 ? 1 : 0;
