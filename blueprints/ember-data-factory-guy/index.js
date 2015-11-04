module.exports = {
  // Hack for previous versions of Ember CLI
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject('jquery-mockjax', '2.0.1');
  }

};
