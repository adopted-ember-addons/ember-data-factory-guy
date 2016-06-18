
const scenarioFileRegExp = new RegExp('/scenarios/main');
import {requireFiles} from './helper-functions';
import Ember from 'ember';

/**
 * There is only one scenario file that is important here. 
 * And that is: scenarios/main.js file.
 * 
 * This file dictates what the scenario will be, since from 
 * there you can include other scenarios, and compose whatever
 * grand scheme you have in mind
 * 
 * NOTE: container.owner.resolveRegistration('config:environment') works as well  
 * 
 * @param container
 */
export default function (container) {
  let config = container.lookupFactory('config:environment') || {};
//  console.log('config', config, 'config.factoryGuy', config && config.factoryGuy);
  if (config.factoryGuy) {
    let [Scenario] = requireFiles(scenarioFileRegExp);
    Ember.assert(`[ember-data-factory-guy] No app/scenarios/main.js file was found. 
      If you have factoryGuy set to true in config/environment.js file, 
      then you should setup a file app/scenarios/main.js to control what data will 
      be like in the development application.`, Scenario);
    new Scenario['default']();
  }
}
