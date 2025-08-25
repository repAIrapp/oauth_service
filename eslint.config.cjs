const js = require("@eslint/js");
const globals = require("globals"); 

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

  {
    files: ["tests/**/*.{js,cjs,mjs,ts}"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      // "no-console": "off",
    },
  },
];
