'use strict';

module.exports = function(/* environment, appConfig */) {
  //return { };
  var ENV = {};

  ENV.contentSecurityPolicy = {
    'style-src': "'self' 'unsafe-inline' 'unsave-eval'"
  }
  return ENV;

};
