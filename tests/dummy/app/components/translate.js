import Ember from 'ember';
import layout from '../templates/components/translate';

/**
 * Translate
 */
var TranslateComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['translate'],

  translation: Ember.computed('original', function() {
    return this.get('original') + ' dude';
  })

});

export default TranslateComponent;
