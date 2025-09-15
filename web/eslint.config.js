import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import reactRecommended from "eslint-plugin-react/configs/recommended.js";


export default [
    {
        files: ["src/**/*.js", "src/**/*.jsx", "src/**/*.ts", "src/**/*.tsx"],
        ...reactRecommended,
        ignores: ["dist/"],
        languageOptions: {
            ...reactRecommended.languageOptions,
            globals: {
                ...globals.browser,
            },
            parser: tsParser,
        },
        rules: {
        },
    },
];
