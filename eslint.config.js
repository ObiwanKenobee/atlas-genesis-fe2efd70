import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default tseslint.config(
  { ignores: ["dist", "src/layers", "src/architecture", "src/sanctum-ai", "src/sanctum", "src/crypto"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommendedTypeChecked],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        project: ["./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "unused-imports": unusedImports,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      // Auto-fixable unused import removal + unused var flagging
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": ["warn", { args: "after-used", argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      // Allow explicit any only when truly unavoidable (flag it as a warning, not silent)
      "@typescript-eslint/no-explicit-any": "warn",
      // Prevent floating promises (common async bug source)
      "@typescript-eslint/no-floating-promises": "error",
      // Catch misused promises in conditionals / event handlers
      "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
      // Enforce consistent type imports for tree-shaking
      "@typescript-eslint/consistent-type-imports": ["warn", { prefer: "type-imports" }],
      // No non-null assertions that hide nullability bugs
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
);
