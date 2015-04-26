import TileMap from '../framework/tilemap';
import TileRenderer from '../framework/tilerenderer';

export default class TileEditor {
    constructor(context, tileSet) {
        this.gl = context.gl;
        this.tileSet = tileSet;
        this.renderer = new TileRenderer(this.gl, context.shaders.get('tilemap'));
        this.tileMap = new TileMap(this.gl, tileSet, 40, 20);
        for(let y = 0; y < 20; ++y) {
            for(let x = 0; x < 40; ++x) {
                this.tileMap.set(x, y, Math.floor(Math.random() * 5));
            }
        }
    }

    render() {
        this.renderer.render(this.tileSet, this.tileMap, [-2, -2], 8);        
    }
}
