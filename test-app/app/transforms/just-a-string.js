import Transform from '@ember-data/serializer/transform';

export default class extends Transform {
  serialize(/*value*/) {
    return 'failed';
  }
  deserialize(/*value*/) {
    return 'failed';
  }
}
