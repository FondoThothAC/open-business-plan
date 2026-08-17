import js from '@eslint/js';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'dist_electron/**',
      'public/**',
      'proyectos/**',
      'scratch/**',
      'server/data/**',
      'server/swarm/agent_store/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
        chrome: 'readonly',
      },
    },
    rules: {
      'no-undef': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-constant-condition': ['error', { checkLoops: false }],
      'no-prototype-builtins': 'off',
    },
  },
];
