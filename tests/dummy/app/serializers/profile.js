import JSONAPISerializer from '@ember-data/serializer/json-api';

export default JSONAPISerializer.extend({
  transformFor: function (attributeType) {
    if (attributeType === 'just-a-string') {
      return this.container.lookup('transform:string');
    } else {
      return this._super.apply(this, arguments);
    }
  },
});
