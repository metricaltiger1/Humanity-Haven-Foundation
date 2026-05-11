module.exports = {
  env: {
    es6: true,
    node: true,
  },
  parserOptions: {
    ecmaVersion: 2020,
  },
  extends: [
    'eslint:recommended',
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'off',
    'indent': 'off',
    'quotes': 'off',
    'semi': 'off',
    'comma-dangle': 'off',
    'object-curly-spacing': 'off',
    'no-trailing-spaces': 'off',
    'eol-last': 'off',
  },
  ignorePatterns: ['/node_modules', '/.eslintrc.js'],
};