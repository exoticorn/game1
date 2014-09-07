'use strict';
/* global define */

define(['framework/spriterenderer', 'framework/resourcemanager', 'framework/texture'],
    function(SpriteRenderer, ResourceManager, Texture) {
  return function(gl, shaders) {
    gl.clearColor(0, 0, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    var spriteRenderer = new SpriteRenderer(gl, shaders);
    var resourceManager = new ResourceManager(gl);
    var texture;
    resourceManager.load(Texture, 'gfx/pulse.png', { frames: 4, scale: 2 }).then(function(tex) {
      texture = tex;
    });

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
      gl.enable(gl.BLEND);
      gl.blendEquation(gl.FUNC_ADD);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
      starShader.begin();
      gl.bindBuffer(gl.ARRAY_BUFFER, pointBuffer);
      gl.vertexAttribPointer(starShader.pos, 3, gl.FLOAT, false, 12, 0);
      gl.uniform1f(starShader.time, time / 20);
      gl.drawArrays(gl.POINTS, 0, numStars);
      starShader.end();
      
      if(texture) {
        var cx = gl.drawingBufferWidth / 2;
        var cy = gl.drawingBufferHeight / 2;
        spriteRenderer.begin();
        for(var i = 0; i < 200; ++i) {
          var x = Math.sin(time * 1.23 + i * 0.2) + Math.sin(time * 1.023 + i * 0.26);
          var y = Math.sin(time * 0.785+ i * 0.128) + Math.sin(time * 0.847 + i * 0.17);
          spriteRenderer.drawFrame(cx + x * 200 - 16, cy + y* 200 - 16, texture, Math.floor(time * 8 + i * 0.75) & 3, 0.5 + Math.sin(i * 0.214) * 0.3, 0.5 + Math.sin(i * 0.47) * 0.3, 0.5 + Math.sin(i * 0.3) * 0.3, 1);
        }
        spriteRenderer.end();
      }
      gl.disable(gl.BLEND);
    };
  };
});