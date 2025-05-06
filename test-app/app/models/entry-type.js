import Model, { attr, hasMany } from '@ember-data/model';

export default class extends Model {
  @attr('string') name;
  @hasMany('entry') entries;
}
