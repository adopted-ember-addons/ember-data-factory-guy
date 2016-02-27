import Ember from 'ember';

// compare to object for loose equality
let isEquivalent = function(a, b) {

  let aProps = Object.keys(a);
  let bProps = Object.keys(b);

  if (aProps.length !== bProps.length) {
    return false;
  }

  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    let aEntry = a[propName];
    let bEntry = b[propName];
    if (Ember.typeOf(aEntry) === 'object' && Ember.typeOf(bEntry) === 'object') {
      return isEquivalent(aEntry, bEntry);
    }

    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
};

export { isEquivalent };
