import SpriteRenderer from '../framework/spriterenderer';
import ResourceManager from '../framework/resourcemanager';
import Texture from '../framework/texture';
import TxtGfx from '../framework/txtgfx';
import Shaders from '../framework/shaders';
import Player from './player.js';
import ImmediateRenderer from '../framework/immediaterenderer';
import VirtualScreen from '../framework/virtualscreen';

export default function* Game(gl, frameworkShaders) {
    let resourceManager = new ResourceManager(gl);
    let texture = yield resourceManager.load(Texture, 'gfx/pulse.png', { frames: 4 });
    let gfx = yield resourceManager.load(TxtGfx, 'src/game/gfx.txt');
    let shaders = yield Shaders.load(gl, 'src/game/shaders.glsl');
    let player = new Player(gl);
    let testRenderer = new ImmediateRenderer(gl, shaders.get('stars'));
    let screen = new VirtualScreen(gl, 160, 100, frameworkShaders);
    
    gl.clearColor(0, 0, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.enable(gl.BLEND);
    gl.blendEquation(gl.FUNC_ADD);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    
    let spriteRenderer = new SpriteRenderer(gl, frameworkShaders);

    let time = 0;
    
    this.update = function(ctx) {
        player.update(ctx);
        time += ctx.timeStep;
    };
    
    this.render = function() {
        screen.begin();

        gl.clear(gl.COLOR_BUFFER_BIT);
        
        testRenderer.begin();
        gl.uniform1f(testRenderer.shader.time, time);
        testRenderer.beginPrimitive(gl.TRIANGLES);
        for(let i = 0; i < 100; ++i) {
            let y = -1 + i / 50;
            testRenderer.pos(0.1, y, 1).done();
            testRenderer.pos(0.2, y, 1).done();
            testRenderer.pos(0.15, y + 0.08, 1).done();
        }
        testRenderer.endPrimitive();
        testRenderer.end();

        spriteRenderer.begin(screen);
        player.render(spriteRenderer, gfx.hero);
        spriteRenderer.end();

        screen.end();
    };

    return this;
};
