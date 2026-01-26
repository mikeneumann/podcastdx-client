import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import sonarjsPlugin from "eslint-plugin-sonarjs";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: [
      "dist/",
      "node_modules/",
      "docs/",
    ],
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.eslint.json",
        sourceType: "module",
      },
      globals: {
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      sonarjs: sonarjsPlugin,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      "import/prefer-default-export": "off",
      "import/no-unresolved": "off",
      "sonarjs/pseudo-random": "warn",
      "sonarjs/no-nested-template-literals": "warn",
      "sonarjs/hashing": "warn",
      "sonarjs/use-type-alias": "warn",
    },
  },
  {
    files: ["src/__test__/**/*.test.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.jest.json",
        sourceType: "module",
      },
      globals: {
        describe: "readonly",
        it: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        expect: "readonly",
        jest: "readonly",
        console: "readonly",
        process: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      sonarjs: sonarjsPlugin,
      import: importPlugin,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...tsPlugin.configs.recommended.rules,
      ...sonarjsPlugin.configs.recommended.rules,
      ...importPlugin.configs.recommended.rules,
      ...importPlugin.configs.typescript.rules,
      "import/prefer-default-export": "off",
      "import/no-unresolved": "off",
      "sonarjs/pseudo-random": "warn",
      "sonarjs/no-skipped-tests": "warn",
      "sonarjs/no-commented-code": "warn",
      "sonarjs/no-nested-functions": "warn",
      "sonarjs/todo-tag": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
];
