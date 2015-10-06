import JSONAPIFixtureConverter from './jsonapi-fixture-converter';

export default function(store) {
  /**
   Convert fixture for FactoryGuy.build

   @param modelName
   @param fixture
   */
  this.convertForBuild = function(modelName, fixture) {
    return fixture;
  };
  /**
   Convert to the ember-data JSONAPI adapter specification, since make pushes
   jsonapi data into the store

   @param {String} modelName
   @param {String} fixture
   @returns {*} new converted fixture
   */
  this.convertForMake = function (modelName, fixture) {
    return new JSONAPIFixtureConverter(store).convert(modelName, fixture);
  };
}