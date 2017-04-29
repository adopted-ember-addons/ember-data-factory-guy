import require from 'require';
import DS from 'ember-data';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';
import JSONFixtureBuilder from './json-fixture-builder';
import DRFFixtureBuilder from './drf-fixture-builder';
import ActiveModelFixtureBuilder from './active-model-fixture-builder';

let ActiveModelSerializer, DjangoSerializer;
try {
  let activeModel = require('active-model-adapter');
  ActiveModelSerializer = activeModel.ActiveModelSerializer;
} catch (e) {
  // do nothing
}

try {
  let drf = require('ember-django-adapter/serializers/drf');
  DjangoSerializer = drf && drf.default;
} catch (e) {
  // do nothing
}

export default class {

  constructor(store) {
    this.store = store;
  }

  /**
   Return appropriate FixtureBuilder for the model's serializer type
   */
  fixtureBuilder(modelName) {
    let serializer = this.store.serializerFor(modelName);
    if (!serializer) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingJSONAPISerializer(serializer)) {
      return new JSONAPIFixtureBuilder(this.store);
    }
    if (this.usingDRFSerializer(serializer)) {
      return new DRFFixtureBuilder(this.store);
    }
    if (this.usingActiveModelSerializer(serializer)) {
      return new ActiveModelFixtureBuilder(this.store);
    }
    if (this.usingRESTSerializer(serializer)) {
      return new RESTFixtureBuilder(this.store);
    }
    if (this.usingJSONSerializer(serializer)) {
      return new JSONFixtureBuilder(this.store);
    }
    return new JSONAPIFixtureBuilder(this.store);
  }

  usingJSONAPISerializer(serializer) {
    return serializer instanceof DS.JSONAPISerializer;
  }

  usingDRFSerializer(serializer) {
    return DjangoSerializer && serializer instanceof DjangoSerializer;
  }

  usingActiveModelSerializer(serializer) {
    return ActiveModelSerializer && serializer instanceof ActiveModelSerializer;
  }

  usingRESTSerializer(serializer) {
    return serializer instanceof DS.RESTSerializer;
  }

  usingJSONSerializer(serializer) {
    return serializer instanceof DS.JSONSerializer;
  }
}
