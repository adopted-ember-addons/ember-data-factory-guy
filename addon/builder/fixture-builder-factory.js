import JSONSerializer from '@ember-data/serializer/json';
import RESTSerializer from '@ember-data/serializer/rest';
import JSONAPISerializer from '@ember-data/serializer/json-api';
import JSONAPIFixtureBuilder from './jsonapi-fixture-builder';
import RESTFixtureBuilder from './rest-fixture-builder';
import JSONFixtureBuilder from './json-fixture-builder';
import DRFFixtureBuilder from './drf-fixture-builder';
import ActiveModelFixtureBuilder from './active-model-fixture-builder';
import {
  macroCondition,
  dependencySatisfies,
  importSync,
} from '@embroider/macros';

let ActiveModelSerializer;
if (macroCondition(dependencySatisfies('active-model-adapter', '*'))) {
  ActiveModelSerializer = importSync(
    'active-model-adapter'
  ).ActiveModelSerializer;
}

let DjangoSerializer;
if (macroCondition(dependencySatisfies('ember-django-adapter', '*'))) {
  DjangoSerializer = importSync('ember-django-adapter/serializers/drf').default;
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
    return serializer instanceof JSONAPISerializer;
  }

  usingDRFSerializer(serializer) {
    return DjangoSerializer && serializer instanceof DjangoSerializer;
  }

  usingActiveModelSerializer(serializer) {
    return ActiveModelSerializer && serializer instanceof ActiveModelSerializer;
  }

  usingRESTSerializer(serializer) {
    return serializer instanceof RESTSerializer;
  }

  usingJSONSerializer(serializer) {
    return serializer instanceof JSONSerializer;
  }
}
