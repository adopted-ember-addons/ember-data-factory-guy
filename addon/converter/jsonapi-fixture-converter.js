import Ember from 'ember';
import Converter from './fixture-converter';
const { String: { dasherize, pluralize } } = Ember;

class JSONAPIFixtureConverter extends Converter {

  constructor(store, transformKeys = true) {
    super(store, transformKeys);
    this.defaultKeyTransformFn = dasherize;
    this.polymorphicTypeTransformFn = dasherize;
    this.included = [];
  }

  /**
   Convert an initial fixture into JSONAPI document
   This raw fixture can contain other json in relationships that were
   built by FacoryGuy ( build, buildList ) methods

   @param {String} modelName
   @param {Object} fixture initial raw fixture
   @returns {{data: {type: *, id: *, attributes}: Array}}
   */
  convert(modelName, fixture) {
    let data;

    if (Ember.typeOf(fixture) === 'array') {
      this.listType = true;
      data = fixture.map((single)=> {
        return this.convertSingle(modelName, single);
      });
    } else {
      data = this.convertSingle(modelName, fixture);
    }

    let jsonApiData = { data: data };

    if (!Ember.isEmpty(this.included)) {
      jsonApiData.included = this.included;
    }

    return jsonApiData;
  }

  /**
   In order to conform to the way ember data expects to handle relationships
   in a json payload ( during deserialization ), convert a record ( model instance )
   into an object with type and id.

   @param {Object} record
   @param {Object} relationship
   */
  normalizeAssociation(record, relationship) {
    if (Ember.typeOf(record) === 'object') {
      if (relationship.options.polymorphic) {
        return { type: dasherize(record.type), id: record.id };
      } else {
        return { type: record.type, id: record.id };
      }
    } else {
      return { type: record.constructor.modelName, id: record.id };
    }
  }

  /**
   Recursively descend into the fixture json, looking for relationships that are
   either record instances or other fixture objects that need to be normalized
   and/or included in the 'included' hash

   @param modelName
   @param fixture
   @param included
   @returns {{type: *, id: *, attributes}}
   */
  convertSingle(modelName, fixture) {
    let data = {
      type: modelName,
      id: fixture.id,
      attributes: this.extractAttributes(modelName, fixture),
    };
    let relationships = this.extractRelationships(modelName, fixture);
    if (Object.getOwnPropertyNames(relationships).length > 0) {
      data.relationships = relationships;
    }
    return data;
  }
  /*
   Add the model to included array unless it's already there.
   */
  addToIncluded(data) {
    let found = Ember.A(this.included).find((model)=> {
      return model.id === data.id && model.type === data.type;
    });
    if (!found) {
      this.included.push(data);
    }
  }

  addToIncludedFromProxy(proxy) {
    proxy.includes().forEach((data)=> {
      this.addToIncluded(data);
    });
  }

  assignBelongsToRecord(record) {
    return { data: record };
  }

  assignHasManyRecords(records) {
    return { data: records };
  }

  //extractBelongsTo(fixture, relationship, relationships) {
  //let belongsToRecord = fixture[relationship.key];
  //
  //let relationshipKey = this.transformRelationshipKey(relationship);
  //
  //if (Ember.typeOf(belongsToRecord) === 'object') {
  //  relationships[relationship.key] = this.addData(belongsToRecord, relationship);
  //} else if (Ember.typeOf(belongsToRecord) === 'instance') {
  //  relationships[relationship.key] = { data: this.normalizeAssociation(belongsToRecord, relationship) };
  //}

  //if (Ember.typeOf(belongsToRecord) === 'object') {
  //  if (belongsToRecord.isProxy) {
  //    relationships[relationshipKey] = this.addProxyData(belongsToRecord, relationship);
  //  } else {
  //    relationships[relationshipKey] = this.addData(belongsToRecord, relationship);
  //  }
  //} else if (Ember.typeOf(belongsToRecord) === 'instance') {
  //  relationships[relationshipKey] = this.normalizeAssociation(belongsToRecord, relationship);
  //}
  //}

  /**
   Descend into relationships looking for records to transform to jsonapi standard, or
   record instances to convert to json

   @param modelName
   @param fixture
   @param included
   @returns {{}}
   */
  //extractRelationships(modelName, fixture) {
  //  let relationships = {};
  //
  //  this.store.modelFor(modelName).eachRelationship((key, relationship)=> {
  //    let isPolymorphic = relationship.options.polymorphic;
  //    if (fixture.hasOwnProperty(key)) {
  //      if (relationship.kind === 'belongsTo') {
  //        let belongsToRecord = fixture[relationship.key];
  //      } else if (relationship.kind === 'hasMany') {
  //        let hasManyRecords = fixture[relationship.key];
  //        if (Ember.typeOf(hasManyRecords) === 'array') {
  //          let records = hasManyRecords.map((hasManyRecord)=> {
  //            if (Ember.typeOf(hasManyRecord) === 'object') {
  //              let embeddedFixture = hasManyRecord;
  //              let relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
  //              let data = this.convertSingle(relationshipType, embeddedFixture);
  //              this.addToIncluded(included, data);
  //              return this.normalizeAssociation(data, relationship);
  //            } else if (Ember.typeOf(hasManyRecord) === 'instance') {
  //              return this.normalizeAssociation(hasManyRecord, relationship);
  //            } else if (typeof hasManyRecord === 'string' || typeof hasManyRecord === 'number') {
  //              Ember.assert('Polymorphic relationships cannot be specified by ID', !isPolymorphic);
  //              return this.normalizeAssociation({ id: hasManyRecord, type: relationship.type }, relationship);
  //            }
  //          });
  //          relationships[relationship.key] = { data: records };
  //        }
  //      }
  //    }
  //  });
  //  return relationships;
  //}

  //addData(embeddedFixture, relationship) {
  //  let relationshipType = this.getRelationshipType(relationship, embeddedFixture);
  //  // find possibly more embedded fixtures
  //  let data = this.convertSingle(relationshipType, embeddedFixture);
  //  this.addToIncluded(data, relationshipType);
  //  return this.normalizeAssociation(data, relationship);
  //}

  //addProxyData(jsonProxy, relationship) {
  //  let data = jsonProxy.get();
  //  let relationshipType = this.getRelationshipType(relationship, data);
  //  this.addToIncluded(relationshipType, data);
  //  this.addToIncludedFromProxy(jsonProxy);
  //  return this.normalizeAssociation(data, relationship);
  //}
  //
  //addListProxyData(jsonProxy, relationship, relationships) {
  //  let relationshipKey = this.transformRelationshipKey(relationship);
  //  let records = jsonProxy.get().map((data)=> {
  //    let relationshipType = this.getRelationshipType(relationship, data);
  //    this.addToIncluded(relationshipType, data);
  //    return this.normalizeAssociation(data, relationship);
  //  });
  //  this.addToIncludedFromProxy(jsonProxy);
  //  relationships[relationshipKey] = records;
  //}
  //
}

export default JSONAPIFixtureConverter;

//
//extractRelationships(modelName, fixture, included) {
//  let relationships = {};
//
//  this.store.modelFor(modelName).eachRelationship((key, relationship)=> {
//    let isPolymorphic = relationship.options.polymorphic;
//    if (fixture.hasOwnProperty(key)) {
//      if (relationship.kind === 'belongsTo') {
//        let belongsToRecord = fixture[relationship.key];
//        if (Ember.typeOf(belongsToRecord) === 'object') {
//          let embeddedFixture = belongsToRecord;
//          // find possibly more embedded fixtures
//          let relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
//          let data = this.convertSingle(relationshipType, embeddedFixture, included);
//          this.addToIncluded(included, data);
//          relationships[relationship.key] = {data: this.normalizeAssociation(data, relationship)};
//        } else if (Ember.typeOf(belongsToRecord) === 'instance') {
//          relationships[relationship.key] = {data: this.normalizeAssociation(belongsToRecord, relationship)};
//        } else if (typeof belongsToRecord === 'string' || typeof belongsToRecord === 'number') {
//          Ember.assert('Polymorphic relationships cannot be specified by ID', !isPolymorphic);
//          relationships[relationship.key] = {data: this.normalizeAssociation({id: belongsToRecord, type: relationship.type}, relationship)};
//        }
//      } else if (relationship.kind === 'hasMany') {
//        let hasManyRecords = fixture[relationship.key];
//        if (Ember.typeOf(hasManyRecords) === 'array') {
//          let records = hasManyRecords.map((hasManyRecord)=> {
//            if (Ember.typeOf(hasManyRecord) === 'object') {
//              let embeddedFixture = hasManyRecord;
//              let relationshipType = isPolymorphic ? Ember.String.dasherize(embeddedFixture.type) : relationship.type;
//              let data = this.convertSingle(relationshipType, embeddedFixture, included);
//              this.addToIncluded(included, data);
//              return this.normalizeAssociation(data, relationship);
//            } else if (Ember.typeOf(hasManyRecord) === 'instance') {
//              return this.normalizeAssociation(hasManyRecord, relationship);
//            } else if (typeof hasManyRecord === 'string' || typeof hasManyRecord === 'number') {
//              Ember.assert('Polymorphic relationships cannot be specified by ID', !isPolymorphic);
//              return this.normalizeAssociation({id: hasManyRecord, type: relationship.type}, relationship);
//            }
//          });
//          relationships[relationship.key] = {data: records};
//        }
//      }
//    }
//  });
//  return relationships;
//}
