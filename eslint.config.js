// Einstellungen für ESLint, den „Rechtschreibprüfer“ für Code.
import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import { defineConfig, globalIgnores } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

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
