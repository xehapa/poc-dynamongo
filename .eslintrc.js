module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: ["@typescript-eslint"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    "ecmaFeatures": {
      jsx: false
    },
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  rules: {
    "@typescript-eslint/no-for-in-array": "error"
  },
  ignorePatterns: [".eslintrc.js"]
}
