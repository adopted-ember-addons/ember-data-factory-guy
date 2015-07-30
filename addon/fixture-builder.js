import Ember from 'ember';

export default Ember.Object.extend({
  init: function(store) {
    this.set('store', store);
  },
  /**
   Convert fixture for FactoryGuy.build

   @param modelName
   @param fixture
   */
  convertForBuild: function (modelName, fixture) {
    return fixture;
  },
  /**
   Convert fixture for FactoryGuy.make

   @param modelName
   @param fixture
   */
  convertForMake: function (modelName, fixture) {
    return fixture;
  },
  /**

   @param modelName
   @param fixture
   */
  convertForRequest: function (modelName, fixture) {
    return fixture;
  },
  /**
   Convert fixture for handleReload / handleCreate

   @param modelName
   @param fixture
   @returns {{}}
   */
  convertForCreateRequest: function (modelName, fixture) {
    var convertedFixture = this.convertForBuild(modelName, fixture);
    var transformedFixture = this.convertForRequest(modelName, convertedFixture);
    return transformedFixture;
  }
});