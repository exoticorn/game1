export default class TileMap {
    constructor(gl, tileset, width, height) {
        this.gl = gl;
        this.tileset = tileset;
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height * 4);
        this.map = new Uint16Array(width * height);
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        this.uvScale = new Float32Array(2);
        this.uvScale[0] = 1 / width;
        this.uvScale[1] = 1 / height;
        this.dirty = true;
    }

    destroy() {
        this.gl.deleteTexture(this.texture);
    }

    copy(x, y, width, height) {
        let x2 = Math.min(x + width, this.width);
        let y2 = Math.min(y + height, this.height);
        x = Math.max(x, 0);
        y = Math.max(y, 0);
        width = x2 - x;
        height = y2 - y;
        if(width < 1 || height < 1) {
            return null;
        }
        let map = new TileMap(this.gl, this.tileset, width, height);
        for(let yi = 0; yi < height; ++yi) {
            for(let xi = 0; xi < width; ++xi) {
                map.set(xi, yi, this.get(x + xi, y + yi));
            }
        }
        return map;
    }

    put(brush, x, y) {
        let w = brush.width, h = brush.height;
        for(let yi = 0; yi < h; ++yi) {
            for(let xi = 0; xi < w; ++xi) {
                this.set(x + xi, y + yi, brush.get(xi, yi));
            }
        }
    }

    clear(x, y, w, h) {
        for(let yi = 0; yi < h; ++yi) {
            for(let xi = 0; xi < w; ++xi) {
                this.set(x + xi, y + yi, 0);
            }
        }
    }

    set(x, y, index) {
        if(x >= 0 && y >= 0 && x < this.width && y < this.height) {
            let offset = x + y * this.width;
            let data = this.data;
            let i = index + this.tileset.tilesX - 1;
            data[offset*4+0] = i % this.tileset.tilesX;
            data[offset*4+1] = Math.floor(i / this.tileset.tilesX);
            this.map[offset] = index;
            this.dirty = true;
        }
    }

    get(x, y) {
        if(x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return 0;
        }
        return this.map[x + y * this.width];
    }

    use() {
        let gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        if(this.dirty) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
            this.dirty = false;
        }
    }
}
