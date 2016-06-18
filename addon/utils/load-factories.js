import {requireFiles} from './helper-functions';

const factoryFileRegExp = new RegExp('/tests/factories');

export default function() {
  requireFiles(factoryFileRegExp);
}
