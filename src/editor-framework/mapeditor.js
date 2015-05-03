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
        this.tileSetMap = new TileMap(this.gl, tileSet, tileSet.tilesX, tileSet.tilesY);
        for(let y = 0; y < tileSet.tilesY; ++y) {
            for(let x = 0; x < tileSet.tilesX; ++x) {
                this.tileSetMap.set(x, y, 1 + x + y * tileSet.tilesX);
            }
        }
        this.tileSetScroll = M.vec2.clone([0, 0]);
        this.brush = this.tileSetMap.copy(0, 0, 1, 1);
        this.tileSetMode = false;
    }

    render() {
        let scroll = this.tileSetMode ? this.tileSetScroll : this.scroll;
        let map = this.tileSetMode ? this.tileSetMap : this.tileMap;
        this.renderer.render(this.tileSet, map, scroll, this.zoom);
        this.shapes.scale = this.zoom * this.tileSet.tileSize;
        this.shapes.setOffset(scroll[0], scroll[1]);
        this.shapes.begin();
        this.shapes.drawRect(0, 0, map.width, map.height, [0.7, 0.7, 0.9, 1]);
        if(this.selection) {
            this.shapes.fillRect(this.selection[0], this.selection[1], this.selection[2], this.selection[3], [1, 1, 1, 0.3]);
            this.shapes.drawRect(this.selection[0], this.selection[1], this.selection[2], this.selection[3], [0.5, 0.4, 0.2, 1]);
            this.shapes.end();
        } else if(this.brush) {
            let brushPos = this.brushPos();
            this.shapes.fillRect(brushPos[0], brushPos[1], this.brush.width, this.brush.height, [0, 0, 0, 0.8]);
            this.shapes.end();
            if(!this.deleting) {
                let scrolledPos = M.vec2.create();
                M.vec2.sub(scrolledPos, scroll, brushPos);
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
        if(!this.brush) {
            return;
        }
        let brushPos = this.brushPos();
        if(this.deleting) {
            this.tileMap.clear(brushPos[0], brushPos[1], this.brush.width, this.brush.height);
        } else {
            this.tileMap.put(this.brush, brushPos[0], brushPos[1]);
        }
    }

    input(type, e) {
        // wow, what a mess. please re-write me...
        if(type === 'mousedown' || type === 'mouseup' || type === 'mousemove') {
            M.vec2.set(this.mousePos, e.x, e.y);
        }
        let tileSize = this.tileSet.tileSize * this.zoom;
        this.tileSetMode = e.ctrlKey && e.shiftKey;
        let scroll = this.tileSetMode ? this.tileSetScroll : this.scroll;
        let tilePos = [Math.floor(this.mousePos[0] / tileSize + scroll[0]), Math.floor(this.mousePos[1] / tileSize + scroll[1])];
        if(e.ctrlKey && !e.altKey && !this.scrollDrag) {
            if(type === 'mousedown') {
                this.selectionStart = tilePos;
            } else if(type === 'mouseup') {
                delete this.selectionStart;
                if(this.selection) {
                    if(this.brush) {
                        this.brush.destroy();
                    }
                    let map = this.tileSetMode ? this.tileSetMap : this.tileMap;
                    this.brush = map.copy(this.selection[0], this.selection[1], this.selection[2], this.selection[3]);
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
        if((type === 'mousedown' && this.button === 2) || (type === 'keydown' && e.keyCode === Keyboard.ALT)) {
            this.scrollDrag = [this.mousePos[0], this.mousePos[1]];
        } else if(type === 'mousedown') {
            this.putBrush();
            this.drawing = true;
        } else if(type === 'mousemove') {
            if(this.scrollDrag) {
                M.vec2.scaleAndAdd(scroll, scroll, this.mousePos, -0.125);
                M.vec2.scaleAndAdd(scroll, scroll, this.scrollDrag, 0.125);
                this.scrollDrag = M.vec2.clone(this.mousePos);
            } else if(this.drawing) {
                this.putBrush();
            }
        } else if(type === 'mouseup' || (type === 'keyup' && e.keyCode === Keyboard.ALT)) {
            delete this.scrollDrag;
            this.drawing = false;
        }
    }
}
