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
            "no-console": ["warn", {
                allow: ["warn", "error", "log", "info", "debug"],
            }],
            "no-debugger": "error",
            "no-throw-literal": "error",

            // Safety / code quality
            "consistent-return": "error",
            "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
            "no-empty-function": ["error", { allow: ["constructors"] }],
            "no-implicit-coercion": ["error", {
                boolean: true,
                number: true,
                string: true,
                disallowTemplateShorthand: true,
                allow: ["!!"],
            }],
            "no-param-reassign": ["error", { props: false }],
            "no-shadow": ["warn", {
                builtinGlobals: true,
                hoist: "all",
                allow: ["done", "err", "error", "event", "reject", "resolve", "result", "self"],
                ignoreOnInitialization: true,
                ignoreTypeValueShadow: false,
                ignoreFunctionTypeParameterNameValueShadow: false,
            }],
            "no-unused-expressions": ["error", {
                allowShortCircuit: true,
                allowTernary: false,
            }],
            "no-var": "error",
            "prefer-const": ["error", { destructuring: "all" }],

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
            "@stylistic/max-len": ["warn", {
                code: 100,
                comments: 103,
                tabWidth: 8,
                ignoreTrailingComments: true,
                ignoreUrls: true,
                ignoreStrings: true,
                ignoreTemplateLiterals: true,
                ignoreRegExpLiterals: true,
            }],
            "@stylistic/multiline-ternary": ["error", "always-multiline"],
            "@stylistic/nonblock-statement-body-position": ["error", "any"],
            "@stylistic/quotes": ["error", "double", {
                avoidEscape: true,
                allowTemplateLiterals: "avoidEscape",
                ignoreStringLiterals: true,
            }],
            "@stylistic/semi": ["error", "always"],

            // TypeScript specifics
            "@typescript-eslint/consistent-type-imports": ["error", {
                prefer: "type-imports",
            }],
            "@typescript-eslint/explicit-function-return-type": ["warn", {
                allowExpressions: true,
                allowTypedFunctionExpressions: true,
                allowHigherOrderFunctions: true,
                allowDirectConstAssertionInArrowFunctions: true,
                allowConciseArrowFunctionExpressionsStartingWithVoid: true,
                allowFunctionsWithoutTypeParameters: false,
                allowIIFEs: true,
            }],
            "@typescript-eslint/naming-convention": ["warn", {
                selector: "import",
                format: ["camelCase", "PascalCase"],
            }],
            "@typescript-eslint/no-explicit-any": ["warn", {
                fixToUnknown: true,
                ignoreRestArgs: false,
            }],
            "@typescript-eslint/no-non-null-assertion": "warn",
            "@typescript-eslint/no-unused-vars": ["warn", {
                vars: "all",
                varsIgnorePattern: "^_+$|UNUSED|[Uu]nused",
                args: "all",
                argsIgnorePattern: "^_+$|UNUSED|[Uu]nused",
                caughtErrors: "all",
                caughtErrorsIgnorePattern: "^_+$|UNUSED|[Uu]nused",
                destructuredArrayIgnorePattern: "^_+$|UNUSED|[Uu]nused",
                ignoreRestSiblings: false,
                ignoreClassWithStaticInitBlock: false,
                ignoreUsingDeclarations: true,
                reportUsedIgnorePattern: true,
            }],
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
