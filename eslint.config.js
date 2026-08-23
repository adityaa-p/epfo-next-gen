export default [
  {
    files: ["**/*.{js,jsx,mjs}"],
    ignores: ["node_modules/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { document: "readonly", URL: "readonly", process: "readonly" },
    },
    rules: {
      "no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          // Core ESLint does not treat a component rendered in JSX as a variable use.
          varsIgnorePattern: "^[A-Z]",
        },
      ],
      "no-undef": "error",
      "no-var": "error",
      "prefer-const": "error",
    },
  },
];
