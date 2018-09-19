import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';

export default Model.extend({
  created_at: attr('date'),
  description: attr('string'),
  camelCaseDescription: attr('string'),
  snake_case_description: attr('string'),
  aBooleanField: attr('boolean'),
  foo: attr('just-a-string'),
  superHero: belongsTo('super-hero', { async: false }),
  company: belongsTo('company', { async: false }),
  group: belongsTo('group', { async: false, polymorphic: true, inverse: 'profiles' })
});
