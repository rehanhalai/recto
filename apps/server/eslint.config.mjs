import { backendEslintConfig } from "@recto/eslint-config/backend"

// @type {import("eslint").Linter.Config[]}
export default [
    ...backendEslintConfig,
    {
        ignores: ["dist/**", "build/**", "node_modules/**"]
    }
]