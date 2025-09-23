import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginRouter from "@tanstack/eslint-plugin-router";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    ...pluginRouter.configs["flat/recommended"],
    globalIgnores(["**/dist/**", "**/node_modules/**", "**/build/**"]),
    {
        files: ["**/*.{js,mjs,cjs,jsx}"],
        plugins: { js },
        extends: ["js/recommended"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
    },
    {
        files: ["apps/frontend/**/*.{ts,tsx}"],
        settings: {
            react: { version: "detect" },
        },
        extends: [
            tseslint.configs.recommendedTypeChecked,
            pluginReact.configs.flat.recommended,
            reactHooks.configs["recommended-latest"],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                project: [
                    "apps/frontend/tsconfig.app.json",
                    "apps/frontend/tsconfig.node.json",
                ],
                tsconfigRootDir: process.cwd(),
            },
        },
        rules: {
            "react/react-in-jsx-scope": "off",
            "@tanstack/router/create-route-property-order": "error",
            "@typescript-eslint/only-throw-error": [
                "error",
                {
                    allow: [
                        {
                            from: "package",
                            package: "@tanstack/router-core",
                            name: "Redirect",
                        },
                    ],
                },
            ],
        },
    },
    {
        files: ["apps/backend/**/*.{ts}"],
        extends: [tseslint.configs.recommendedTypeChecked],
        languageOptions: {
            globals: globals.node,
            parserOptions: {
                project: ["apps/backend/tsconfig.json"],
                tsconfigRootDir: process.cwd(),
            },
        },
    },
]);
