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
    
    this.update = function(ctx) {
        player.update(ctx);
    };
    
    this.render = function() {
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        spriteRenderer.begin();
        
        player.render(spriteRenderer);

        spriteRenderer.end();

        testRenderer.begin();
        gl.uniform1f(testRenderer.time, 0);
        testRenderer.beginPrimitive();
        testRenderer.pos(0.25, -0.5, 1).done();
        testRenderer.pos(0.75, -0.5, 1).done();
        testRenderer.pos(0.5, 0.5, 1).done();
        testRenderer.endPrimitive();
        testRenderer.end();
    };

    return this;
};
