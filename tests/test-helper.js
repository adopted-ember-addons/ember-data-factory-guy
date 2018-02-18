import Application from '../app';
import { setApplication } from '@ember/test-helpers';
//import resolver from './helpers/resolver';
//import { setResolver } from '@ember/test-helpers';
import { start } from 'ember-cli-qunit';

setApplication(Application.create({autoboot: false, rootElement: '#ember-testing'}));
//setResolver(resolver);
start();
