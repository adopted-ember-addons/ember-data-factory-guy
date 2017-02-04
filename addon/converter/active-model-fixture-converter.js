import RESTFixtureConverter from './rest-fixture-converter';

/**
 Convert base fixture to the ActiveModel Serializer expected payload.
 */
export default class extends RESTFixtureConverter {
  /**
   * In `serializeMode` use convert a relationship from "company" to "company_id"
   * which REST / JSON converters override to strip that _id
   *
   * @param relationship
   * @returns {*}
   */
  transformRelationshipKey(relationship) {
    if (this.serializeMode) {
      let transformFn = this.getTransformKeyFunction(relationship.type, 'Relationship');
      return transformFn(relationship.key, relationship.kind);
    } else {
      return super.transformRelationshipKey(relationship);
    }
  }
}
