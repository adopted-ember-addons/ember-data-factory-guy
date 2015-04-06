module.exports = {
  // Hack for previous versions of Ember CLI
  normalizeEntityName: function() {},

  afterInstall: function(options) {
    return this.addBowerPackageToProject('jquery-mockjax', 'latest');
  },

  initialize: function(container, application) {
    console.log('IN -->  blueprints/ember-data-factory-guy/index.js')
  }
};
