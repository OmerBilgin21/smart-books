import { FlatCompat } from '@eslint/eslintrc';
import path from 'path';
import { fileURLToPath } from 'url';
import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import ests from '@typescript-eslint/eslint-plugin';
import jestPlugin from 'eslint-plugin-jest';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

export default [
  {
    rules: {
      curly: 'error',
      'prettier/prettier': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        {
          allowExpressions: false,
          allowTypedFunctionExpressions: false,
          allowHigherOrderFunctions: true,
          allowDirectConstAssertionInArrowFunctions: true,
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': ['error'],
      'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
      'no-magic-numbers': 'off',
    },
  },
  {
    ignores: ['node_modules'],
  },
  {
    languageOptions: {
      parser: '@typescript-eslint/parser',
    },
  },
  {
    plugins: {
      prettier: prettier,
      typescript: ests,
      jest: jestPlugin,
    },
  },
  ...compat.extends('eslint:recommended'),
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
  ...compat.extends('plugin:prettier/recommended'),
];
