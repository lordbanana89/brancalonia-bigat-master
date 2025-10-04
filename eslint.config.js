import js from "@eslint/js";
import globals from "globals";

const foundryGlobals = {
  game: "readonly",
  ui: "readonly",
  Hooks: "readonly",
  CONFIG: "readonly",
  canvas: "readonly",
  Actor: "readonly",
  Item: "readonly",
  ChatMessage: "readonly",
  Macro: "readonly",
  Roll: "readonly",
  TextEditor: "readonly",
  Handlebars: "readonly",
  Application: "readonly",
  FormApplication: "readonly",
  FormData: "readonly",
  Dialog: "readonly",
  CONST: "readonly",
  foundry: "readonly",
  mergeObject: "readonly",
  duplicate: "readonly",
  renderTemplate: "readonly"
};

export default [
  {
    ignores: [
      "node_modules/**",
      "Data/**",
      "packs/**",
      "assets/**",
      "fonts/**",
      "styles/**/*.min.css",
      "**/dist/**"
    ]
  },
  {
    files: ["**/*.js", "**/*.mjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...foundryGlobals
      }
    },
    rules: {
      "no-console": "off"
    },
    ...js.configs.recommended
  },
  {
    files: ["tests/**/*.{js,mjs}", "**/*.test.js", "**/*.spec.js"],
    languageOptions: {
      globals: {
        ...globals.vitest
      }
    }
  }
];

