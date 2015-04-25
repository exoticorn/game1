import ImmediateRenderer from './immediaterenderer';

export default function VirtualScreen(gl, width, height, shaders) {
    this.width = width;
    this.height = height;
    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    
    let framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    let renderer = new ImmediateRenderer(gl, shaders.get('vscreen'));

    this.destroy = function() {
        gl.deleteTexture(texture);
    };

    this.begin = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
        gl.viewport(0, 0, width, height);
    };

    this.end = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.begin();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(renderer.shader.texture, 0);
        gl.uniform2f(renderer.shader.vsize, width, height);
        gl.uniform2f(renderer.shader.psize, gl.drawingBufferWidth, gl.drawingBufferHeight);
        renderer.beginPrimitive(gl.TRIANGLE_STRIP);
        renderer.pos(0, 0).done();
        renderer.pos(1, 0).done();
        renderer.pos(0, 1).done();
        renderer.pos(1, 1).done();
        renderer.endPrimitive();
        renderer.end();
    };
};
