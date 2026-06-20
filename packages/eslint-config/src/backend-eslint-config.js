import globals from "globals";
import { baseEslintConfig } from "./base-eslint-config.js";

export const backendEslintConfig = [
    ...baseEslintConfig,
    {
        languageOptions: {
            globals: globals.node,
        },
    },
];