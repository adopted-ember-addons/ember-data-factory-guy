import js from '@eslint/js';
import ember from 'eslint-plugin-ember/recommended';
import n from 'eslint-plugin-n';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import qunit from 'eslint-plugin-qunit';
import babelParser from '@babel/eslint-parser';
import globals from 'globals';

export default [
  {
    ignores: [
      'blueprints/*/files/',
      'vendor/',
      '**/dist/**',
      '**/tmp/**',
      'bower_components/',
      'node_modules/',
      'coverage/',
      '.node_modules.ember-try/',
      'bower.json.ember-try',
      'package.json.ember-try',
      'CHANGELOG.md',
      'pnpm-lock.yaml',
      '**/public/mockServiceWorker.js',
    ],
  },

  js.configs.recommended,

  // Ember rules for JS/TS files
  ember.configs.base,

  // Language options for JS files
  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          plugins: [
            ['@babel/plugin-proposal-decorators', { legacy: true }],
            '@babel/plugin-transform-class-properties',
          ],
        },
      },
      globals: {
        ...globals.browser,
      },
    },
  },

  // Ember rules for GJS files
  ember.configs.gjs,

  // Node files
  {
    files: [
      './.prettierrc.js',
      './.template-lintrc.js',
      './**/config/**/*.js',
      './addon/addon-main.js',
      './addon/blueprints/*/index.js',
      './test-app/ember-cli-build.js',
      './test-app/testem.js',
    ],
    languageOptions: {
      sourceType: 'script',
      globals: {
        ...globals.node,
      },
    },
    plugins: { n },
    rules: {
      ...n.configs['flat/recommended-script'].rules,
    },
  },

  // Test files
  {
    files: ['test-app/tests/**/*-test.{js,ts}'],
    plugins: { qunit },
    rules: {
      ...qunit.configs.recommended.rules,
      'qunit/require-expect': ['error', 'except-simple'],
    },
  },

  prettierRecommended,
];
