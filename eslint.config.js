// Einstellungen für ESLint, den „Rechtschreibprüfer“ für Code.
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

// ─── Schichten-Regeln (docs/ARCHITEKTUR.md, Abschnitt 3) ───────────────────────────
// Jede Schicht darf nur bestimmte andere Schichten benutzen. Verstöße sind Fehler,
// dann wird auch nichts veröffentlicht.

const ARCHITECTURE_HINT = "Siehe docs/ARCHITEKTUR.md, Abschnitt 3.";

/** Verbietet Importe aus den genannten Ordnern (Schichten) von src/. */
function forbidLayers(layers, { babylon = false } = {}) {
  const patterns = layers.map((layer) => ({
    regex: `(^|/)${layer}(/|$)`,
    message: `Diese Schicht darf „${layer}/“ nicht benutzen. ${ARCHITECTURE_HINT}`,
  }));
  if (babylon) {
    patterns.push({
      regex: "^@babylonjs/",
      message: `Kein Babylon.js in dieser Schicht: Die Spiellogik weiß nichts von der Grafik. ${ARCHITECTURE_HINT}`,
    });
  }
  return { "no-restricted-imports": ["error", { patterns }] };
}

const PURE_LOGIC_HINT = `In core/, data/ und sim/ muss alles ohne Browser und auf jedem Gerät gleich laufen. ${ARCHITECTURE_HINT}`;

/** Spiellogik ohne Browser, ohne Uhrzeit und ohne „echten“ Zufall. */
const pureLogicRules = {
  "no-restricted-globals": [
    "error",
    ...[
      "window",
      "document",
      "navigator",
      "location",
      "localStorage",
      "sessionStorage",
      "indexedDB",
      "fetch",
      "XMLHttpRequest",
      "performance",
      "requestAnimationFrame",
      "cancelAnimationFrame",
      "setTimeout",
      "setInterval",
      "clearTimeout",
      "clearInterval",
    ].map((name) => ({ name, message: `„${name}“ ist hier verboten. ${PURE_LOGIC_HINT}` })),
  ],
  "no-restricted-properties": [
    "error",
    {
      object: "Math",
      property: "random",
      message: `Math.random() ist hier verboten: Zufall nur mit Seed (core/random.ts). ${ARCHITECTURE_HINT}`,
    },
    {
      object: "Date",
      property: "now",
      message: `Die Uhrzeit ist hier verboten: Spielzeit kommt aus dem Takt. ${ARCHITECTURE_HINT}`,
    },
  ],
  "no-restricted-syntax": [
    "error",
    {
      selector: "NewExpression[callee.name='Date'][arguments.length=0]",
      message: `Die Uhrzeit ist hier verboten: Spielzeit kommt aus dem Takt. ${ARCHITECTURE_HINT}`,
    },
  ],
};

export default defineConfig(
  globalIgnores(["dist/", "coverage/", "screenshots/", "node_modules/"]),

  js.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Spielcode läuft im Browser.
  {
    files: ["src/**/*.ts"],
    languageOptions: { globals: globals.browser },
  },

  // Babylon.js baut manche Klassen (z. B. StandardMaterial) über „Mixins“ zusammen.
  // Diese Regel erkennt das nicht und meldet Fehlalarme, deshalb ist sie für render/ und debug/ aus.
  {
    files: ["src/render/**/*.ts", "src/debug/**/*.ts"],
    rules: { "@typescript-eslint/no-unsafe-class-instance-assignment": "off" },
  },

  // Schichten-Regeln: wer wen benutzen darf
  {
    files: ["src/core/**/*.ts"],
    rules: {
      ...forbidLayers(["data", "sim", "render", "input", "ui", "debug", "app"], { babylon: true }),
      ...pureLogicRules,
    },
  },
  {
    files: ["src/data/**/*.ts"],
    rules: {
      ...forbidLayers(["sim", "render", "input", "ui", "debug", "app"], { babylon: true }),
      ...pureLogicRules,
    },
  },
  {
    files: ["src/sim/**/*.ts"],
    rules: {
      ...forbidLayers(["render", "input", "ui", "debug", "app"], { babylon: true }),
      ...pureLogicRules,
    },
  },
  { files: ["src/render/**/*.ts"], rules: forbidLayers(["input", "ui", "debug", "app"]) },
  { files: ["src/input/**/*.ts"], rules: forbidLayers(["ui", "debug", "app"]) },
  {
    files: ["src/ui/**/*.ts"],
    rules: forbidLayers(["render", "input", "debug", "app"], { babylon: true }),
  },

  // Werkzeug-Skripte laufen in Node.js.
  {
    files: ["vite.config.ts", "scripts/**/*.ts"],
    languageOptions: { globals: globals.node },
  },

  // Reine JavaScript-Dateien (z. B. diese hier) ohne Typprüfung.
  {
    files: ["**/*.js"],
    extends: [tseslint.configs.disableTypeChecked],
    languageOptions: { globals: globals.node },
  },

  // Muss am Ende stehen: schaltet Regeln ab, die sich mit Prettier überschneiden.
  prettierConfig,
);
