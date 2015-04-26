export default class TileSet {
    constructor(texture, tilesX, tilesY) {
        this.texture = texture;
        this.tilesX = tilesX;
        this.tilesY = tilesY;
        this.uvScale = new Float32Array(2);
        this.uvScale[0] = 1 / tilesX;
        this.uvScale[1] = 1 / tilesY;
    }
}
