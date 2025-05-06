import RESTSerializer from '@ember-data/serializer/rest';
import { decamelize } from '@ember/string';

export default class extends RESTSerializer {
  keyForAttribute(attr) {
    return decamelize(attr);
  }
}
