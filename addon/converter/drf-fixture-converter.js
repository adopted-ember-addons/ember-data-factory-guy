import JSONFixtureConverter from './json-fixture-converter';

/**
 Convert base fixture to the Ember Django Serializer expected payload.

 */
export default class extends JSONFixtureConverter {
  /**
   * All lists will use "results" as payload key
   *
   * @param _
   * @param fixture
   * @returns {*}
   */
  createPayload(_, fixture) {
    if (this.listType) {
      return { results: fixture, next: null, previous: null, count: fixture.length };
    }
    return fixture;
  }

}
