module.exports = {
  // Hack for previous versions of Ember CLI
  normalizeEntityName: function() {},

  afterInstall: function() {
    return this.addBowerPackageToProject('jquery-mockjax', '2.1.1');
    return this.addBowerPackageToProject('urijs', '1.18.1');
  }

};
