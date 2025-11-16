import stylistic from "@stylistic/eslint-plugin";
import typescriptEslint from "typescript-eslint";


export default [
    // Base rules for source and tests
    {
        plugins: {
            "@stylistic": stylistic,
            "@typescript-eslint": typescriptEslint.plugin,
        },

        files: ["src/**/*.ts", "tests/**/*.ts"],

        languageOptions: {
            parser: typescriptEslint.parser,
            ecmaVersion: 2022,
            sourceType: "module",
        },

        rules: {
            // General best-practices
            "curly": ["warn", "multi-or-nest", "consistent"],
            "eqeqeq": ["error", "always"],
            "no-throw-literal": "error",

            // Safety / code quality
            "no-var": "error",
            "prefer-const": "error",
            "consistent-return": "error",
            //"no-duplicate-imports": "error",

            // Stylistic rules (delegated to @stylistic)
            "@stylistic/brace-style": ["warn", "allman", {
                "allowSingleLine": true,
            }],
            "@stylistic/indent": ["warn", 4, {
                "ignoredNodes": ["ConditionalExpression"],
                "SwitchCase": 1,
                "VariableDeclarator": "first",
                "MemberExpression": 2,
                "FunctionDeclaration": {
                    "parameters": 2,
                },
                "FunctionExpression": {
                    "parameters": 2,
                },
                "CallExpression": {
                    "arguments": 2,
                },
            }],
            "@stylistic/multiline-ternary": ["error", "always-multiline"],
            "@stylistic/nonblock-statement-body-position": ["error", "any"],
            "@stylistic/semi": ["error", "always"],

            // TypeScript specifics
            "@typescript-eslint/consistent-type-imports": ["error", {
                prefer: "type-imports",
            }],
            "@typescript-eslint/naming-convention": ["warn", {
                selector: "import",
                format: ["camelCase", "PascalCase"],
            }],
            "@typescript-eslint/no-unused-vars": ["warn"],
        },
    },
    // Separate overrides for tests
    {
        files: ["tests/**/*.ts"],

        rules: {
            // Tests often use any or more flexible patterns
            "@typescript-eslint/no-explicit-any": "off",
            "no-console": "off",
        },
    },
];
