'use strict';

require(['game/game', 'framework/shaders', 'framework/io', 'framework/async', 'framework/keyboard'],
  function(newGame, Shaders, io, async, Keyboard) {
  var screen = document.getElementById('screen');
  var gl = screen.getContext('webgl', {alpha: false}) || screen.getContext('experimental-webgl');
  if(!gl) {
    io.error('Failed to create WebGL context!\n\nDoes your browser support WebGL?\nTry a recent version of Firefox, Chrome or Opera.\nIE >= 11 and Safari >= 8 should also work.');
  }
  setTimeout(start, 100);
  function start() {
    async(function*() {
      var shaders = yield Shaders.load(gl, 'js/framework/shaders.glsl');
      var game = yield* newGame(gl, shaders);
      
      function resizeScreen() {
        screen.width = window.innerWidth;
        screen.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        game.render();
      }
      resizeScreen();
      window.addEventListener('resize', resizeScreen, false);
      
      var updateContext = {
        timeStep: 0,
        keyboard: new Keyboard()
      };
      
      var isPaused = false;
      var lastTime = Date.now();
      function requestFrame() {
        if(!isPaused) {
          window.requestAnimationFrame(update);
        }
      }
  
      function onKey(e) {
        var pressed = e.type === 'keydown';
        if(e.keyCode === 80 && e.type === 'keydown') {
          isPaused = !isPaused;
          lastTime = Date.now();
          requestFrame();
          e.preventDefault();
        } else {
          updateContext.keyboard.handleEvent(e);
        }
      }
      
      document.addEventListener('keydown', onKey, false);
      document.addEventListener('keyup', onKey, false);
      
      function update() {
        var time = Date.now();
        updateContext.timeStep = Math.min(1 / 10, (time - lastTime) / 1000);
        lastTime =time;
        if(updateContext.timeStep > 0) {
          game.update(updateContext);
          updateContext.keyboard.endFrame();
        }
        game.render();
        requestFrame();
      }
      
      update();
    });
  }
});