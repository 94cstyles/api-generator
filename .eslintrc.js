module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 7,
    sourceType: 'module',
    impliedStrict: true
  },
  env: {
    browser: true,
    node: true,
    es6: true
  },
  globals: {
    'CodeMirror': false
  },
  extends: 'standard',
  plugins: [
    'html'
  ],
  'rules': {
    'arrow-parens': 0,
    'prefer-const': ['error', {
      'destructuring': 'any',
      'ignoreReadBeforeAssign': false
    }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}