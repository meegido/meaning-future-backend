module.exports = {
  env: {
    es6: true,
    node: true,
  },
  plugins: ["@typescript-eslint"],
  root: true,
  parser: "@typescript-eslint/parser",
  // parserOptions: {
  //   "ecmaVersion": 2018,
  //   "sourceType": "module",
  // },
  extends: [
    "eslint:recommended", "plugin:@typescript-eslint/recommended"
  ],
  // rules: {
  //   "no-restricted-globals": ["error", "name", "length"],
  //   "prefer-arrow-callback": "error",
  //   "quotes": ["error", "double", {"allowTemplateLiterals": true}],
  // },
  ignorePatterns: ["lib/", "node_modules/"],
  overrides: [
    {
      files: ["**/*.spec.*"],
      env: {
        mocha: true,
      },
      rules: {},
    },
  ],
  globals: {},
};
