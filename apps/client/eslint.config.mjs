import { nextEslintConfig } from "@recto/eslint-config/next";

/** @type {import("eslint").Linter.Config[]} */
const eslintConfig = [
  ...nextEslintConfig,
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
