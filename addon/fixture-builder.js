import Ember from 'ember';

export default Ember.Object.extend({
  init: function(store) {
    this.set('store', store);
  },
  convertFixture(modelName, fixture) {
    var ConverterClass   = this.get('converterClass');
    var converter = new ConverterClass(this.store);
    return converter.convert(modelName, fixture);
  },
  transformAttributes(modelName, fixture) {
    var TransformerClass   = this.get('transformerClass');
    var transformer = new TransformerClass(this.store);
    return transformer.transform(modelName, fixture);
  },
  /**
   Convert fixture for FactoryGuy.build

   @param modelName
   @param fixture
   */
  convertForBuild(modelName, fixture) {
    return fixture;
  },
  /**
   Convert fixture for FactoryGuy.make

   @param modelName
   @param fixture
   */
  convertForMake(modelName, fixture) {
    return fixture;
  },
  /**
   Convert fixture for handleFindAll

   @param modelName
   @param fixture
   */
  convertForFindAllRequest(modelName, fixture) {
    return fixture;
  },
  /**
   Convert fixture for handleFind / handleReload

   @param modelName
   @param fixture
   @returns {{}}
   */
  convertForFindRequest(modelName, fixture) {
    return this.convertForBuild(modelName, fixture);
  },
  /**
   Convert fixture for handleCreate

   @param modelName
   @param fixture
   @returns {{}}
   */
  convertForCreateRequest(modelName, fixture) {
    return this.convertForFindRequest(modelName, fixture);
  }
});