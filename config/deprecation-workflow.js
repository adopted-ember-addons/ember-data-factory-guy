'use strict';
/* global self */

self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-inflector.globals' },
    { handler: 'silence', matchId: 'ember-env.old-extend-prototypes' },
    { handler: 'silence', matchId: 'ember-runtime.deprecate-copy-copyable' },
    { handler: 'silence', matchId: 'array.new-array-wrapper' },
    { handler: 'silence', matchId: 'object.new-constructor' },
    {
      handler: 'silence',
      matchId: 'deprecated-run-loop-and-computed-dot-access',
    },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-for' },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-since' },
    { handler: 'silence', matchId: 'deprecate-fetch-ember-data-support' },
    { handler: 'silence', matchId: 'this-property-fallback' },
    { handler: 'silence', matchId: 'implicit-injections' },
    {
      handler: 'silence',
      matchId: 'ember.built-in-components.legacy-arguments',
    },
    { handler: 'silence', matchId: 'routing.transition-methods' },
  ],
};
