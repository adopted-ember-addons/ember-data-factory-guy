'use strict';

module.exports = {
  singleQuote: true,
  overrides: [
    {
      files: '*.{js,ts,mjs,mts,cjs,cts,gjs,gts}',
      options: {
        singleQuote: true,
        templateSingleQuote: false,
      },
    },
  ],
  plugins: ['prettier-plugin-ember-template-tag'],
};
