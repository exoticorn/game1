import TileMap from '../framework/tilemap';
import TileRenderer from '../framework/tilerenderer';
import ShapeRenderer from '../framework/shaperenderer';
import Keyboard from '../framework/keyboard';
import M from '../3rd-party/gl-matrix-min';

export default class MapEditor {
    constructor(context, tileSet) {
        this.gl = context.gl;
        this.tileSet = tileSet;
        this.renderer = new TileRenderer(this.gl, context.shaders.get('tilemap'));
        this.shapes = new ShapeRenderer(context);
        this.tileMap = new TileMap(this.gl, tileSet, 40, 20);
        this.scroll = M.vec2.clone([0, 0]);
        this.mousePos = M.vec2.clone([0, 0]);
        this.zoom = 8;
        for(let y = 0; y < 20; ++y) {
            for(let x = 0; x < 40; ++x) {
                this.tileMap.set(x, y, Math.floor(Math.random() * 5));
            }
        }
    }

    render() {
        this.renderer.render(this.tileSet, this.tileMap, this.scroll, this.zoom);
        this.shapes.scale = this.zoom * this.tileSet.tileSize;
        this.shapes.setOffset(this.scroll[0], this.scroll[1]);
        this.shapes.begin();
        if(this.selection) {
            this.shapes.fillRect(this.selection[0], this.selection[1], 1, 1, [1, 1, 1, 0.3]);
            this.shapes.drawRect(this.selection[0], this.selection[1], 1, 1, [0.2, 0.1, 0, 1]);
        }
        this.shapes.end();
    }

    input(type, e) {
        if(type === 'mousedown' || type === 'mouseup' || type === 'mousemove') {
            M.vec2.set(this.mousePos, e.x, e.y);
        }
        let tileSize = this.tileSet.tileSize * this.zoom;
        let tilePos = [Math.floor(this.mousePos[0] / tileSize + this.scroll[0]), Math.floor(this.mousePos[1] / tileSize + this.scroll[1])];
        this.selection = tilePos;
        if(type === 'mousedown' || (type === 'keydown' && e.keyCode === Keyboard.G)) {
            this.scrollDrag = [this.mousePos[0], this.mousePos[1]];
        } else if(type === 'mousemove') {
            if(this.scrollDrag) {
                M.vec2.scaleAndAdd(this.scroll, this.scroll, this.mousePos, -0.125);
                M.vec2.scaleAndAdd(this.scroll, this.scroll, this.scrollDrag, 0.125);
                this.scrollDrag = M.vec2.clone(this.mousePos);
            }
        } else if(type === 'mouseup' || (type === 'keyup' && e.keyCode === Keyboard.G)) {
            delete this.scrollDrag;
        }
    }
}
