import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import { baseEslintConfig } from "./base-eslint-config.js";

export const nextEslintConfig = [
    ...baseEslintConfig,
    ...nextVitals,
    ...nextTs,
];
