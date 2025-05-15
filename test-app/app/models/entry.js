import Model, { attr, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @belongsTo('entry-type', { async: true, inverse: 'entries' }) entryType;
}
