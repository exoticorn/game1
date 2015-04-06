import SpriteRenderer from '../framework/spriterenderer';
import ResourceManager from '../framework/resourcemanager';
import Texture from '../framework/texture';
import Shaders from '../framework/shaders';
import Player from './player.js';
import ImmediateRenderer from '../framework/immediaterenderer';

export default function* Game(gl, frameworkShaders) {
    let resourceManager = new ResourceManager(gl);
    let texture = yield resourceManager.load(Texture, 'gfx/pulse.png', { frames: 4, scale: 2 });
    let shaders = yield Shaders.load(gl, 'src/game/shaders.glsl');
    let player = new Player(gl);
    let testRenderer = new ImmediateRenderer(gl, shaders.get('stars'));
    
    gl.clearColor(0, 0, 0.1, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    
    let spriteRenderer = new SpriteRenderer(gl, frameworkShaders);

    let time = 0;
    
    this.update = function(ctx) {
        player.update(ctx);
        time += ctx.timeStep;
    };
    
    this.render = function() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        spriteRenderer.begin();
        
        player.render(spriteRenderer);

        spriteRenderer.end();

        testRenderer.begin();
        gl.uniform1f(testRenderer.shader.time, time);
        testRenderer.beginPrimitive(gl.TRIANGLES);
        for(let i = 0; i < 100; ++i) {
            let y = -1 + i / 50;
            testRenderer.pos(0.1, y, 1).done();
            testRenderer.pos(0.2, y, 1).done();
            testRenderer.pos(0.15, y + 0.01, 1).done();
        }
        testRenderer.endPrimitive();
        testRenderer.end();
    };

    return this;
};
