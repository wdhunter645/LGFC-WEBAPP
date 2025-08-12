module.exports = {
  root: true,
  env: { browser: true, es2022: true, node: true },
  extends: [
    'eslint:recommended',
    'prettier'
  ],
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
  settings: { react: { version: 'detect' } },
  overrides: [
    {
      files: ['*.astro'],
      parser: 'astro-eslint-parser',
      parserOptions: { parser: '@typescript-eslint/parser', extraFileExtensions: ['.astro'] },
      extends: ['plugin:astro/recommended'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/no-unknown-property': 'off'
      }
    },
    {
      files: ['**/*.{js,jsx}'],
      extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended', 'prettier'],
      plugins: ['react', 'react-hooks'],
      rules: {
        'react/react-in-jsx-scope': 'off',
        'react/no-unescaped-entities': 'off'
      }
    },
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      extends: ['prettier'],
      rules: {}
    }
  ],
};