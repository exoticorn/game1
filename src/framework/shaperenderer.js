import ImmediateRenderer from './immediaterenderer';

export default class ShapeRenderer {
    constructor(context) {
        this.renderer = new ImmediateRenderer(context.gl, context.shaders.get('shape'));
        this.gl = context.gl;
        this.offset = new Float32Array(2);
        this.scale = 1;
    }

    setOffset(x, y) {
        this.offset[0] = x;
        this.offset[1] = y;
    }

    begin(screen) {
        let gl = this.gl;
        let width, height;
        if(screen) {
            width = screen.width;
            height = screen.height;
        } else {
            width = gl.drawingBufferWidth;
            height = gl.drawingBufferHeight;
        }
        this.renderer.begin();
        let scaleX = 2 * this.scale / width;
        let scaleY = -2 * this.scale / height;
        gl.uniform4f(this.renderer.shader.transform, scaleX, scaleY, -this.offset[0] * scaleX - 1, -this.offset[1] * scaleY + 1);
    }

    end() {
        this.renderer.end();
    }

    drawRect(x0, y0, width, height, color) {
        let r = this.renderer;
        let gl = this.gl;
        gl.uniform4fv(r.shader.color, color);
        r.beginPrimitive(gl.LINE_STRIP);
        let x1 = x0 + width;
        let y1 = y0 + height;
        r.pos(x0, y0).done();
        r.pos(x1, y0).done();
        r.pos(x1, y1).done();
        r.pos(x0, y1).done();
        r.pos(x0, y0).done();
        r.endPrimitive();
    }

    fillRect(x0, y0, width, height, color) {
        let r = this.renderer;
        let gl = this.gl;
        gl.uniform4fv(r.shader.color, color);
        r.beginPrimitive(gl.TRIANGLE_STRIP);
        let x1 = x0 + width;
        let y1 = y0 + height;
        r.pos(x0, y0).done();
        r.pos(x1, y0).done();
        r.pos(x0, y1).done();
        r.pos(x1, y1).done();
        r.endPrimitive();
    }
}
