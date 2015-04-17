import Ember from 'ember';
import layout from '../templates/components/translate';

/**
 * Translate
 */
var TranslateComponent = Ember.Component.extend({
  layout: layout,
  classNames: ['translate'],

  translation: function() {
    return this.get('original') + ' dude';
  }.property('original')

});

export default TranslateComponent;
