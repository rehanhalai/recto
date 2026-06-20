import reactEslint from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import { baseEslintConfig } from "./base-eslint-config.js"

export const reactEslintConfig = [
    ...baseEslintConfig,
    reactEslint.configs.flat.recommended,
    reactHooks.configs["recommended-latest"],
    reactRefresh.configs.recommended,
    {
        settings: {
            react: { version: "19.1.0" },
        },
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "react/prop-types": "off",
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
        },
    },
];