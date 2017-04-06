module.exports = {
  // Hack for previous versions of Ember CLI
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addPackageToProject('jquery-mockjax', '2.2.1');
  }

};
