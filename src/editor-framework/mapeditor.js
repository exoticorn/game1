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
        this.brush = this.tileMap.copy(2, 1, 3, 2);
    }

    render() {
        this.renderer.render(this.tileSet, this.tileMap, this.scroll, this.zoom);
        this.shapes.scale = this.zoom * this.tileSet.tileSize;
        this.shapes.setOffset(this.scroll[0], this.scroll[1]);
        if(this.selection) {
            this.shapes.begin();
            this.shapes.fillRect(this.selection[0], this.selection[1], this.selection[2], this.selection[3], [1, 1, 1, 0.3]);
            this.shapes.drawRect(this.selection[0], this.selection[1], this.selection[2], this.selection[3], [0.5, 0.4, 0.2, 1]);
            this.shapes.end();
        } else if(this.brush) {
            let brushPos = this.brushPos();
            this.shapes.begin();
            this.shapes.fillRect(brushPos[0], brushPos[1], this.brush.width, this.brush.height, [0, 0, 0, 0.8]);
            this.shapes.end();
            if(!this.deleting) {
                let scrolledPos = M.vec2.create();
                M.vec2.sub(scrolledPos, this.scroll, brushPos);
                this.renderer.render(this.tileSet, this.brush, scrolledPos, this.zoom);
            }
            this.shapes.begin();
            this.shapes.drawRect(brushPos[0], brushPos[1], this.brush.width, this.brush.height, [0.4, 0.9, 0.2, 0.8]);
            this.shapes.end();
        }
    }

    brushPos() {
        let w = 1, h = 1;
        if(this.brush) {
            w = this.brush.width;
            h = this.brush.height;
        }
        let tileSize = this.tileSet.tileSize * this.zoom;
        return [
            Math.floor(this.mousePos[0] / tileSize + this.scroll[0] - w/2 + 0.5),
            Math.floor(this.mousePos[1] / tileSize + this.scroll[1] - h/2 + 0.5)
        ];
    }

    putBrush() {
        let brushPos = this.brushPos();
        if(this.deleting) {
            this.tileMap.clear(brushPos[0], brushPos[1], this.brush.width, this.brush.height);
        } else {
            this.tileMap.put(this.brush, brushPos[0], brushPos[1]);
        }
    }

    input(type, e) {
        if(type === 'mousedown' || type === 'mouseup' || type === 'mousemove') {
            M.vec2.set(this.mousePos, e.x, e.y);
        }
        let tileSize = this.tileSet.tileSize * this.zoom;
        let tilePos = [Math.floor(this.mousePos[0] / tileSize + this.scroll[0]), Math.floor(this.mousePos[1] / tileSize + this.scroll[1])];
        if(e.ctrlKey) {
            if(type === 'mousedown') {
                this.selectionStart = tilePos;
            } else if(type === 'mouseup') {
                delete this.selectionStart;
                if(this.selection) {
                    this.brush.destroy();
                    this.brush = this.tileMap.copy(this.selection[0], this.selection[1], this.selection[2], this.selection[3]);
                }
            }
            if(this.selectionStart) {
                let x0 = Math.min(this.selectionStart[0], tilePos[0]),
                    x1 = Math.max(this.selectionStart[0], tilePos[0]),
                    y0 = Math.min(this.selectionStart[1], tilePos[1]),
                    y1 = Math.max(this.selectionStart[1], tilePos[1]);
                this.selection = [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
            } else {
                this.selection = [tilePos[0], tilePos[1], 1, 1];
            }
            return;
        } else {
            delete this.selection;
        }
        this.deleting = e.shiftKey;
        if((type === 'mousedown' && this.button === 2) || (type === 'keydown' && e.keyCode === Keyboard.G)) {
            this.scrollDrag = [this.mousePos[0], this.mousePos[1]];
        } else if(type === 'mousedown') {
            this.putBrush();
            this.drawing = true;
        } else if(type === 'mousemove') {
            if(this.scrollDrag) {
                M.vec2.scaleAndAdd(this.scroll, this.scroll, this.mousePos, -0.125);
                M.vec2.scaleAndAdd(this.scroll, this.scroll, this.scrollDrag, 0.125);
                this.scrollDrag = M.vec2.clone(this.mousePos);
            } else if(this.drawing) {
                this.putBrush();
            }
        } else if(type === 'mouseup' || (type === 'keyup' && e.keyCode === Keyboard.G)) {
            delete this.scrollDrag;
            this.drawing = false;
        }
    }
}
