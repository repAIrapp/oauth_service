// eslint.config.cjs
const js = require("@eslint/js");

/** @type {import('eslint').Linter.Config[]} */
module.exports = [
  js.configs.recommended,
  {
    name: "oauth-service",
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        // éviter no-undef pour Node
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
      // si tu as des uploads temporaires
      "uploads/",
    ],
    rules: {
      // adapte si besoin
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];
