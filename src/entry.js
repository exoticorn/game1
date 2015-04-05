import Game from './game/game';
import Shaders from './framework/shaders';
import io from './framework/io';
import async from './framework/async';
import Keyboard from './framework/keyboard';

let screen = document.getElementById('screen');
let gl = screen.getContext('webgl', {alpha: false}) || screen.getContext('experimental-webgl');
if(!gl) {
    io.error('Failed to create WebGL context!\n\nDoes your browser support WebGL?\nTry a recent version of Firefox, Chrome or Opera.\nIE >= 11 and Safari >= 8 should also work.');
}

let start = async.proc(function* () {
    let shaders = yield Shaders.load(gl, 'src/framework/shaders.glsl');
    let game = yield* new Game(gl, shaders);
    
    function resizeScreen() {
        screen.width = window.innerWidth;
        screen.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        game.render();
    }
    resizeScreen();
    window.addEventListener('resize', resizeScreen, false);
    
    let updateContext = {
        timeStep: 0,
        keyboard: new Keyboard()
    };
    
    let isPaused = false;
    let lastTime = Date.now();
    function requestFrame() {
        if(!isPaused) {
            window.requestAnimationFrame(update);
        }
    }
    
    function onKey(e) {
        let pressed = e.type === 'keydown';
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
        let time = Date.now();
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

setTimeout(start, 1000);
