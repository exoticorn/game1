import ResourceManager from '../framework/resourcemanager';
import TxtGfx from '../framework/txtgfx';
import async from '../framework/async';
import TileSet from '../framework/tileset';

export default async(function*(gl) {
    this.resourceManager = new ResourceManager(gl);
    this.tiles = yield this.resourceManager.load(TxtGfx, 'src/game/tiles.txt');
    this.tileSet = new TileSet(this.tiles.tileset, 2, 2);
    return this;
});
