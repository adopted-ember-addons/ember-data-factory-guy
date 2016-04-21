import Ember from 'ember';

function isEquivalent(a, b) {
  var type = Ember.typeOf(a);
  if(type !== Ember.typeOf(b)) { return false; }
  switch (type) {
    case 'object':
      return objectIsEquivalent(a, b);
    case 'array':
      return arrayIsEquivalent(a, b);
    default:
      return a === b;
  }
}

function arrayIsEquivalent(arrayA , arrayB) {
  if(arrayA.length !== arrayB.length) { return false; }
  return arrayA.every(function(item, index) {
    return isEquivalent(item, arrayB[index]);
  });
}

function objectIsEquivalent(objectA, objectB) {
  var aProps = Object.keys(objectA);
  var bProps = Object.keys(objectB);
  if (aProps.length !== bProps.length) { return false; }
  for (let i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    let aEntry   = objectA[propName];
    let bEntry   = objectB[propName];
    if(!isEquivalent(aEntry, bEntry)) { return false; }
  }
  return true;
}

export { isEquivalent };
