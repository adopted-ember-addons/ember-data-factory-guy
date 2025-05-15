import JSONAPISerializer from '@ember-data/serializer/json-api';
import { getOwner } from '@ember/application';

export default class ProfileSerializer extends JSONAPISerializer {
  transformFor(attributeType, ...args) {
    if (attributeType === 'just-a-string') {
      return getOwner(this).lookup('transform:string');
    } else {
      return super.transformFor(attributeType, ...args);
    }
  }
}
