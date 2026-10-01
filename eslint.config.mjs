import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig(
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/coverage/",
    "**/test-results/",
    "**/playwright-report/",
    "packages/blocks/src/**/sources/",
    "packages/stimulus/templates/",
    "packages/mcp/data/",
  ]),
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },
  {
    files: [
      "packages/{blocks,react,core}/src/**/*.{ts,tsx}",
      "packages/stimulus/{src,test}/**/*.js",
      "apps/gallery/src/**/*.{ts,tsx}",
    ],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ["**/*.tsx", "packages/react/src/**/*.ts"],
    ...reactHooks.configs.flat.recommended,
  },
  {
    files: ["**/*.tsx"],
    ...jsxA11y.flatConfigs.recommended,
  },
  {
    // Next.js lints copied blocks with react/jsx-key: keep the sources clean for it
    files: ["packages/*/src/**/*.tsx", "apps/gallery/src/**/*.tsx"],
    plugins: { react },
    settings: { react: { version: "detect" } },
    rules: { "react/jsx-key": ["error", { checkFragmentShorthand: true }] },
  },
  {
    // Blocks render aria-hidden preview compositions whose markup is locked by golden
    // parity; their a11y findings are tracked as warnings until the markup is reworked.
    files: ["packages/blocks/src/**/*.tsx"],
    rules: Object.fromEntries(
      Object.entries(jsxA11y.flatConfigs.recommended.rules)
        .filter(([, level]) => (Array.isArray(level) ? level[0] : level) !== "off")
        .map(([rule, level]) => [
          rule,
          Array.isArray(level) ? ["warn", ...level.slice(1)] : "warn",
        ]),
    ),
  },
  {
    // AGENTS.md invariant 6, and deterministic server/client renders.
    files: ["packages/blocks/src/**/*.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
          message: "Render text as JSX: blocks never inject HTML (AGENTS.md invariant 6).",
        },
        {
          selector: "NewExpression[callee.name='Date'][arguments.length=0]",
          message:
            "Do not read the clock while rendering: take a prop with a fixed default (server and client must render the same markup).",
        },
      ],
    },
  },
  {
    files: ["**/test/**", "**/e2e/**", "**/*.test.*", "**/*.spec.*"],
    languageOptions: { globals: { ...globals.vitest } },
  },
);
