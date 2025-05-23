import RESTFixtureConverter from './rest-fixture-converter';

/**
 Convert base fixture to the ActiveModel Serializer expected payload.
 */
export default class AMSFixtureConverter extends RESTFixtureConverter {
  /**
   * In `serializeMode` use convert a relationship from "company" to "company_id"
   * which REST / JSON converters override to strip that _id
   *
   * @param relationship
   * @returns {*}
   */
  transformRelationshipKey(relationship, parentModelName) {
    if (this.serializeMode) {
      let transformFn = this.getTransformKeyFunction(
        relationship.type,
        'Relationship',
      );
      return transformFn(relationship.name, relationship.kind);
    } else {
      return super.transformRelationshipKey(relationship, parentModelName);
    }
  }
}
