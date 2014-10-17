define(function() {
  'use strict';
  
  function step(iter, resolve, value) {
    var result = iter.next(value);
    if(result.done) {
      resolve(result.value);
    } else {
      result.value.then(function(value) {
        step(iter, resolve, value);
      });
    }
  }
  
  return function(iter) {
    if(typeof iter === 'function') {
      iter = iter();
    }
    return new Promise(function(resolve, reject) {
      try {
        step(iter, resolve);
      } catch(e) {
        reject(e);
      }
    });
  };
});