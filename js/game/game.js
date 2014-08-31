'use strict';
/* global define */

define(['framework/spriterenderer'], function(SpriteRenderer) {
  return function(gl, shaders) {
    gl.clearColor(0, 0, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var spriteRenderer = new SpriteRenderer(gl, shaders);

    var starShader = shaders.get('stars');
    
    var numStars = 3000;
    
    var points = new Float32Array(numStars*3);
    for(var i = 0; i < numStars; ++i) {
      points[i*3+0] = Math.random();
      points[i*3+1] = Math.random() * 2 - 1;
      points[i*3+2] = Math.random() * 5 + 1;
    }
    var pointBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, points, gl.STATIC_DRAW);
    
    var time = 0;
    this.update = function(timeStep) {
      time += timeStep;
    };
    
    this.render = function() {
      gl.clear(gl.COLOR_BUFFER_BIT);
      starShader.begin();
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
      gl.vertexAttribPointer(starShader.pos, 3, gl.FLOAT, false, 12, 0);
      gl.uniform1f(starShader.time, time / 20);
      gl.drawArrays(gl.POINTS, 0, numStars);
      starShader.end();
      
      var cx = gl.drawingBufferWidth / 2;
      var cy = gl.drawingBufferHeight / 2;
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      spriteRenderer.begin();
      for(var i = 0; i < 1000; ++i) {
        var x = Math.sin(time * 4.7 + i * 0.02) + Math.sin(time * 3.68 + i * 0.026);
        var y = Math.sin(time * 3.91+ i * 0.0128) + Math.sin(time * 5.32 + i * 0.017);
        spriteRenderer.drawPlain(cx + x * 200 - 5, cy + y* 200 - 5, 10, 10, 0.5 + Math.sin(i * 0.0214) * 0.3, 0.5 + Math.sin(i * 0.047) * 0.3, 0.5 + Math.sin(i * 0.03) * 0.3, 0.3);
      }
      spriteRenderer.end();
      gl.disable(gl.BLEND);
    };
  };
});