export default class TileMap {
    constructor(gl, tileset, width, height) {
        this.gl = gl;
        this.tileset = tileset;
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height * 4);
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

    set(x, y, index) {
        if(x >= 0 && y >= 0 && x < this.width && y < this.height) {
            let offset = (x + y * this.width) * 4;
            let data = this.data;
            index += this.tileset.tilesX - 1;
            data[offset+0] = index % this.tileset.tilesX;
            data[offset+1] = Math.floor(index / this.tileset.tilesX);
            this.dirty = true;
        }
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
