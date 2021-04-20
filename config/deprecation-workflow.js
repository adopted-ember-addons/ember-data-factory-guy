window.deprecationWorkflow = window.deprecationWorkflow || {};
window.deprecationWorkflow.config = {
  workflow: [
    { handler: 'silence', matchId: 'ember-inflector.globals' },
    { handler: 'silence', matchId: 'ember-env.old-extend-prototypes' },
    { handler: 'silence', matchId: 'ember-runtime.deprecate-copy-copyable' },
    { handler: 'silence', matchId: 'array.new-array-wrapper' },
    { handler: 'silence', matchId: 'object.new-constructor' },
  ],
};
