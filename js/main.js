'use strict';

require(['game/game', 'framework/shaders', 'framework/io'], function(Game, Shaders, io) {
  var screen = document.getElementById('screen');
  var gl = screen.getContext('webgl', {alpha: false}) || screen.getContext('experimental-webgl');
  if(!gl) {
    io.error('Failed to create WebGL context!\n\nDoes your browser support WebGL?\nTry a recent version of Firefox, Chrome or Opera.\nIE >= 11 and Safari >= 8 should also work.');
  }
  setTimeout(start, 250);
  function start() {
    Shaders.load(gl, 'shaders.glsl').then(function(shaders) {
      var game = new Game(gl, shaders);
      
      function resizeScreen() {
        screen.width = window.innerWidth;
        screen.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        game.render();
      }
      resizeScreen();
      window.addEventListener('resize', resizeScreen, false);
      
      var isPaused = false;
      var lastTime = Date.now();
      function requestFrame() {
        if(!isPaused) {
          window.requestAnimationFrame(update);
        }
      }
  
      function onKey(e) {
        var pressed = e.type === 'keydown';
        if(e.keyCode === 80 && pressed) {
          isPaused = !isPaused;
          lastTime = Date.now();
          requestFrame();
          e.preventDefault();
        }
      }
      
      document.addEventListener('keydown', onKey, false);
      document.addEventListener('keyup', onKey, false);
      
      function update() {
        var time = Date.now();
        var timeStep = Math.min(1 / 10, (time - lastTime) / 1000);
        lastTime =time;
        if(timeStep > 0) {
          game.update(timeStep);
        }
        game.render();
        requestFrame();
      }
      
      update();
    });
  }
});