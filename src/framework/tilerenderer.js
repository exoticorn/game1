import ImmediateRenderer from './immediaterenderer';

export default class TileRenderer {
    constructor(gl, shader) {
        this.gl = gl;
        this.renderer = new ImmediateRenderer(gl, shader);
    }

    render(tileSet, tileMap, offset, zoom, screen) {
        let gl = this.gl;
        if(zoom === undefined) {
            zoom = 1;
        }
        let screenWidth, screenHeight;
        if(screen) {
            screenWidth = screen.width;
            screenHeight = screen.height;
        } else {
            screenWidth = gl.drawingBufferWidth;
            screenHeight = gl.drawingBufferHeight;
        }
        let renderer = this.renderer;
        let shader = renderer.shader;

        renderer.begin();

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, tileSet.texture.texture);
        gl.uniform1i(shader.tileSet, 1);
        gl.activeTexture(gl.TEXTURE0);
        tileMap.use();
        gl.uniform1i(shader.tileMap, 0);
        gl.uniform4f(shader.color, 1, 1, 1, 1);
        gl.uniform2fv(shader.mapScale, tileMap.uvScale);
        gl.uniform2fv(shader.setScale, tileSet.uvScale);

        renderer.beginPrimitive(gl.TRIANGLE_STRIP);
        renderer.pos(-1, -1).uv(0, 10).done();
        renderer.pos(1, -1).uv(10, 10).done();
        renderer.pos(-1, 1).uv(0, 0).done();
        renderer.pos(1, 1).uv(10, 0).done();
        renderer.endPrimitive();
        
        renderer.end();
    }
}
