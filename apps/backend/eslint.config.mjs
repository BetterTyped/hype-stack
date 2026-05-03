import baseConfig from "../../eslint.config.mjs";

// eslint-disable-next-line import/no-default-export
export default [
  ...baseConfig,
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    // Override or add rules here
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error"],
    },
  },
];
