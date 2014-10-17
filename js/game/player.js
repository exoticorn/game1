define(['3rd-party/gl-matrix-min', 'framework/keyboard'], function(M, Keyboard) {
  'use strict';
  
  return function(gl) {
    function Player() {
      this.pos = M.vec2.clone([0, 0]);
      this.movement = M.vec2.clone([0, -500]);
      
      this.update = function(ctx) {
        if(ctx.keyboard.isPressed(Keyboard.LEFT)) {
          this.movement[0] = -200;
        } else if(ctx.keyboard.isPressed(Keyboard.RIGHT)) {
          this.movement[0] = 200;
        } else {
          this.movement[0] = 0;
        }
        
        this.movement[1] += 1000 * ctx.timeStep;
        M.vec2.scaleAndAdd(this.pos, this.pos, this.movement, ctx.timeStep);
        if(this.pos[1] > 0) {
          this.pos[1] = 0;
          this.movement[1] = 0;
          if(ctx.keyboard.isTriggered(Keyboard.UP)) {
            this.movement[1] = -500;
          }
        }
      };
      
      this.render = function(renderer) {
        renderer.drawPlain(this.pos[0] - 16, this.pos[1] - 16 + 500, 32, 32, 1, 1, 1, 1);
      };
    }
    return new Player();
  };
});