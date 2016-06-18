const factoryFileRegExp = new RegExp('/tests/factories');
import {requireFiles} from './helper-functions';

export default function() {
  requireFiles(factoryFileRegExp);
}
