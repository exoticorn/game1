'use strict';
/* global define */

define(function() {
  var io = {
    load: function(url, responseType) {
      return new Promise(function(resolve, reject) {
        var request = new XMLHttpRequest();
        request.onreadystatechange = function() {
          if(request.readyState === 4) {
            if(request.status !== 200) {
              reject(request.statusText);
            } else {
              resolve(request.response);
            }
          }
        };
        request.responseType = responseType || '';
        request.open('GET', url);
        request.send();
      });
    },
    error: function(msg) {
      var e = document.createElement('pre');
      e.className = 'error';
      e.appendChild(document.createTextNode(msg));
      document.body.appendChild(e);
      throw msg;
    }
  };
  return io;
});