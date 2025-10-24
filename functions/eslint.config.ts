import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import ts from "typescript";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
    plugins: { js, tseslint, ts },
    extends: [
      "js/recommended",
    ],
    languageOptions: { globals: globals.browser },
    rules: {
      quotes: ["error", "double"],
      "import/no-unresolved": 0,
      indent: ["error", 2],
    },
    ignores: [
      "./lib/**/*", // Ignore built files.
      "/generated/**/*", // Ignore generated files.
    ],
  },
  tseslint.configs.recommended,
]);
