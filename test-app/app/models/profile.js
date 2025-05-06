import Model, { attr, belongsTo } from '@ember-data/model';

export default class extends Model {
  @attr('date') created_at;
  @attr('string') description;
  @attr('string') camelCaseDescription;
  @attr('string') snake_case_description;
  @attr('boolean') aBooleanField;
  @attr('just-a-string') foo;
  @belongsTo('super-hero', { async: false }) superHero;
  @belongsTo('company', { async: false }) company;
  @belongsTo('group', {
    async: false,
    polymorphic: true,
    inverse: 'profiles',
  })
  group;
}
