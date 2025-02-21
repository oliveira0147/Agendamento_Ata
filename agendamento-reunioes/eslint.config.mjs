import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
export default [
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn", // Apenas warning, não erro
      "react-hooks/exhaustive-deps": "warn",
      "no-var": "warn"
    }
  }
];
