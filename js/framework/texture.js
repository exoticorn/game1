'use strict';
/* global define */

define(function() {
  return function(url, gl, config) {
    config = config || {};
    return new Promise(function(resolve, reject) {
      var image = new Image();
      image.onload = function() {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        if(config.filtered) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIMAP_NEAREST);
          gl.generateMipmap(gl.TEXTURE_2D);
        } else {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        }
        if(config.repeat) {
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        }
        var result = {texture: texture, width: image.width, height: image.height, frameWidth: image.width, frameHeight: image.height};
        if(config.frames) {
          result.frames = new Float32Array(4 * config.frames);
          for(var i = 0; i < config.frames; ++i) {
            result.frames[i*4+0] = i / config.frames;
            result.frames[i*4+1] = 0;
            result.frames[i*4+2] = (i + 1) / config.frames;
            result.frames[i*4+3] = 1;
          }
          result.frameWidth /= config.frames;
        }
        if(config.scale) {
          result.frameWidth *= config.scale;
          result.frameHeight *= config.scale;
        }
        resolve(result);
      };
      image.onerror = function() {
        reject('image load failed');
      };
      image.src = url;
    });
  };
});