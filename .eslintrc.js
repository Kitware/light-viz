module.exports = {
  extends: 'airbnb',
  rules: {
  'no-console': 0,
  'no-multi-spaces': 0,
  'no-nested-ternary': 0,
  'no-param-reassign': [2, {"props": false}],
  'no-unused-vars': [2, { args: 'none' }],
  'react/jsx-closing-bracket-location': 1,
  'react/jsx-indent-props': 1,
  'react/jsx-space-before-closing': 1,
  'react/no-is-mounted': 1,
  'react/prefer-es6-class': 0,
  'react/prefer-stateless-function': 0,
  'one-var': 1,
  },
  'settings': {
    'import/resolver': 'webpack'
  }
};
