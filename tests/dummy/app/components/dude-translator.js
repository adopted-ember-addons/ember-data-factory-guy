import Ember from 'ember';

/**
 * Dude Translator
 */
export default Ember.Component.extend({
  classNames: ['translator'],
  dummy: Ember.inject.service(),
  translation: Ember.computed('original', function() {
    return this.get('original') + ' dude';
  })

});