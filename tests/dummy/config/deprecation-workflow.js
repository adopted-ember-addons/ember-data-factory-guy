'use strict';
/* global self */

self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  workflow: [
    {
      handler: 'silence',
      matchId: 'deprecated-run-loop-and-computed-dot-access',
    },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-for' },
    { handler: 'silence', matchId: 'ember-source.deprecation-without-since' },
  ],
};
