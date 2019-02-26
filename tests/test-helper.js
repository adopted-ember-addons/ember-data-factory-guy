import Application from '../app';
import { setApplication } from '@ember/test-helpers';
import { start } from 'ember-qunit';

setApplication(Application.create({autoboot: false, rootElement: '#ember-testing'}));

start();
