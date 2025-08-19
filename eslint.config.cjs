// eslint.config.cjs
const js = require("@eslint/js");
const globals = require("globals"); // 👈 ajoute ça

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  {
    name: "oauth-service",
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        process: "readonly",
        console: "readonly",
        module: "readonly",
        __dirname: "readonly",
        require: "readonly",
      },
    },
    ignores: [
      "node_modules/",
      "coverage/",
      "dist/",
      "build/",
      "uploads/",
    ],
    rules: {
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },

  // ✅ Override pour les tests (Jest)
  {
    files: ["tests/**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      // Déclare les globals Jest: describe, test, expect, jest, beforeEach, etc.
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // (optionnel) Des règles spécifiques aux tests
      // "no-console": "off",
    },
  },
];
