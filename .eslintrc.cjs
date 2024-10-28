module.exports = {
  extends: ["@cybozu/eslint-config/presets/react-typescript-prettier"],
  plugins: ["import"],
  settings: {
    "import/resolver": {
      typescript: true,
      node: true,
    },
    "import/extensions": [".js", ".ts", ".jsx", ".tsx"],
  },
  rules: {
    "sort-imports": [
      "error",
      { ignoreCase: true, ignoreDeclarationSort: true },
    ],
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object",
          "type",
        ],
        pathGroups: [
          {
            pattern:
              "{react,react-dom/**,react-redux/**,react-redux, styled-components}",
            group: "builtin",
            position: "before",
          },

          {
            pattern: "@desktop/**",
            group: "external",
            position: "after",
          },
          {
            pattern: "@assets/**",
            group: "external",
            position: "after",
          },
        ],
        pathGroupsExcludedImportTypes: ["builtin"],
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
        "newlines-between": "always",
      },
    ],
  },
};
