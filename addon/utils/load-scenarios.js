import Ember from 'ember';
import {requireFiles} from './helper-functions';

const scenarioFileRegExp = new RegExp('/scenarios/main$');
/**
 * There is only one scenario file that is important here.
 * And that is: scenarios/main.js file.
 *
 * This file dictates what the scenario will be, since from
 * there you can include other scenarios, and compose whatever
 * grand scheme you have in mind
 *
 * @param container
 */
export default function(container) {
  let config         = container.owner.resolveRegistration('config:environment') || {},
      { factoryGuy } = config;
  if (factoryGuy && factoryGuy.useScenarios) {
    let [Scenario] = requireFiles(scenarioFileRegExp);
    Ember.assert(`[ember-data-factory-guy] No app/scenarios/main.js file was found.
      If you have factoryGuy set to true in config/environment.js file,
      then you should setup a file app/scenarios/main.js to control what data will
      be like in the application.`, Scenario);
    (new Scenario['default']()).run();
  }
}
