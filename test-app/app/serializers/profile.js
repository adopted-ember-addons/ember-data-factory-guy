import JSONAPISerializer from '@ember-data/serializer/json-api';

export default class extends JSONAPISerializer {
  transformFor(attributeType, ...args) {
    if (attributeType === 'just-a-string') {
      return this.container.lookup('transform:string');
    } else {
      return super.transformFor(attributeType, ...args);
    }
  }
}
