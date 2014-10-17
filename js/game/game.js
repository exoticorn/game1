'use strict';
/* global define */

define(['framework/spriterenderer', 'framework/resourcemanager', 'framework/texture', 'framework/shaders', 'game/player'],
    function(SpriteRenderer, ResourceManager, Texture, Shaders, newPlayer) {
  return function*(gl, frameworkShaders) {
    var resourceManager = new ResourceManager(gl);
    var texture = yield resourceManager.load(Texture, 'gfx/pulse.png', { frames: 4, scale: 2 });
    var shaders = yield Shaders.load(gl, 'js/game/shaders.glsl');
    var player = newPlayer(gl);
    
    function Game() {
      gl.clearColor(0, 0, 0.1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      
      var spriteRenderer = new SpriteRenderer(gl, frameworkShaders);
  
      this.update = function(ctx) {
        player.update(ctx);
      };
      
      this.render = function() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        spriteRenderer.begin();
        
        player.render(spriteRenderer);

        spriteRenderer.end();
      };
    }
    return new Game();
  };
});