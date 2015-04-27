import TileMap from '../framework/tilemap';
import TileRenderer from '../framework/tilerenderer';
import M from '../3rd-party/gl-matrix-min';

export default class MapEditor {
    constructor(context, tileSet) {
        this.gl = context.gl;
        this.tileSet = tileSet;
        this.renderer = new TileRenderer(this.gl, context.shaders.get('tilemap'));
        this.tileMap = new TileMap(this.gl, tileSet, 40, 20);
        this.scroll = M.vec2.clone([0, 0]);
        for(let y = 0; y < 20; ++y) {
            for(let x = 0; x < 40; ++x) {
                this.tileMap.set(x, y, Math.floor(Math.random() * 5));
            }
        }
    }

    render() {
        this.renderer.render(this.tileSet, this.tileMap, this.scroll, 8);
    }

    input(type, e) {
        let pos = [e.x, e.y];
        if(type === 'mousedown') {
            this.drag = [e.x, e.y];
        } else if(type === 'mousemove') {
            if(this.drag) {
                M.vec2.scaleAndAdd(this.scroll, this.scroll, pos, -0.125);
                M.vec2.scaleAndAdd(this.scroll, this.scroll, this.drag, 0.125);
                this.drag = pos;
            }
        } else if(type === 'mouseup') {
            delete this.drag;
        }
    }
}
