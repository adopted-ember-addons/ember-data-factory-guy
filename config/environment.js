/* eslint-env node */
'use strict';

module.exports = function(/* environment, appConfig */) {
  var ENV = {};

  ENV.contentSecurityPolicy = {
    'style-src': "'self' 'unsafe-inline' 'unsave-eval'"
  };
  return ENV;

};
