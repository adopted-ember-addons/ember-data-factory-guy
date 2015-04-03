module.exports = {
  // Hack for previous versions of Ember CLI
  normalizeEntityName: function() {},

  afterInstall: function(options) {
    return this.addBowerPackageToProject('ember-data-factory-guy', '^1.0.0');
  },

  initialize: function(container, application) {
    console.log('IN -->  blueprints/ember-data-factory-guy/index.js')
  }
};
