export default function(gl, shaders) {
    let BUFFER_SIZE = 1024;
    let MAX_QUADS = Math.floor(BUFFER_SIZE / 6 / 4);
    let STATE_NONE = 0;
    let STATE_PLAIN = 1;
    let STATE_TEXTURED = 2;
    
    let plainShader = shaders.get('spritePlain');
    let spriteShader = shaders.get('sprite');

    let state = STATE_NONE;
    let shader;
    let currentTexture = -1;
    let vertexData = new Float32Array(BUFFER_SIZE);
    let vertexData512 = vertexData.subarray(0, 512);
    let vertexData256 = vertexData.subarray(0, 256);
    let vertexData128 = vertexData.subarray(0, 128);
    let vertexData64 = vertexData.subarray(0, 64);
    let vertexData32 = vertexData.subarray(0, 32);
    let vertexBuffer = gl.createBuffer();
    let indexData = new Uint8Array(MAX_QUADS * 6);
    for(let i = 0; i < MAX_QUADS; ++i) {
        indexData[i*6+0] = i*4+0;
        indexData[i*6+1] = i*4+1;
        indexData[i*6+2] = i*4+2;
        indexData[i*6+3] = i*4+1;
        indexData[i*6+4] = i*4+3;
        indexData[i*6+5] = i*4+2;
    }
    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
    
    let offset = 0;
    let screenWidth = 1;
    let screenHeight = 1;
    
    function bufferData() {
        if(offset > 128) {
            if(offset > 512) {
                gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.DYNAMIC_DRAW);
            } else if(offset > 256) {
                gl.bufferData(gl.ARRAY_BUFFER, vertexData512, gl.DYNAMIC_DRAW);
            } else {
                gl.bufferData(gl.ARRAY_BUFFER, vertexData256, gl.DYNAMIC_DRAW);
            }
        } else if(offset > 64) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData128, gl.DYNAMIC_DRAW);
        } else if(offset > 32) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData64, gl.DYNAMIC_DRAW);
        } else {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData32, gl.DYNAMIC_DRAW);
        }
    }

    this.begin = function(screen) {
        screenWidth = screen && screen.width || gl.drawingBufferWidth;
        screenHeight = screen && screen.height || gl.drawingBufferHeight;
        state = STATE_NONE;
        offset = 0;
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    };
    
    this.end = function() {
        this.flush();
        if(shader) {
            shader.end();
        }
    };
    
    this.flush = function() {
        if(offset === 0) {
            return;
        }
        bufferData();
        switch(state) {
        case STATE_PLAIN:
            gl.drawElements(gl.TRIANGLES, Math.floor(offset / 24) * 6, gl.UNSIGNED_BYTE, 0);
            break;
        case STATE_TEXTURED:
            gl.drawElements(gl.TRIANGLES, Math.floor(offset / 32) * 6, gl.UNSIGNED_BYTE, 0);
            break;
        }
        offset = 0;
    };
    
    this.drawPlain = function(x, y, w, h, r, g, b, a) {
        if(g === undefined) {
            a = r[3];
            b = r[2];
            g = r[1];
            r = r[0];
        }
        if(state !== STATE_PLAIN || offset + 24 > BUFFER_SIZE) {
            this.flush();
        }
        if(state !== STATE_PLAIN) {
            if(shader) {
                shader.end();
            }
            shader = plainShader;
            plainShader.begin();
            gl.uniform4f(plainShader.transform, 2 / screenWidth, -2 / screenHeight, -1, 1);
            gl.vertexAttribPointer(plainShader.pos, 2, gl.FLOAT, false, 24, 0);
            gl.vertexAttribPointer(plainShader.color, 4, gl.FLOAT, false, 24, 8);
            state = STATE_PLAIN;
        }
        vertexData[offset++] = x;
        vertexData[offset++] = y;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = x+w;
        vertexData[offset++] = y;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = x;
        vertexData[offset++] = y+h;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = x+w;
        vertexData[offset++] = y+h;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
    };
    
    this.draw = function(x, y, texture, r, g, b, a) {
        this.drawFrame(x, y, texture, 0, r, g, b, a);
    };
    this.drawFrame = function(x, y, texture, frame, r, g, b, a) {
        if(r === undefined) {
            r = g = b = a = 1;
        } else if(g === undefined) {
            a = r[3];
            b = r[2];
            g = r[1];
            r = r[0];
        }
        x = Math.floor(x);
        y = Math.floor(y);
        let u0, v0, u1, v1;
        if(texture.frames === undefined) {
            u0 = 0, v0 = 0, u1 = 1, v1 = 1;
        } else {
            let o = frame * 4;
            u0 = texture.frames[o];
            v0 = texture.frames[o+1];
            u1 = texture.frames[o+2];
            v1 = texture.frames[o+3];
        }
        let w = texture.frameWidth, h = texture.frameHeight;
        if(state !== STATE_TEXTURED || currentTexture !== texture.texture || offset + 32 > BUFFER_SIZE) {
            this.flush();
        }
        if(state !== STATE_TEXTURED) {
            if(shader) {
                shader.end();
            }
            shader = spriteShader;
            spriteShader.begin();
            gl.uniform4f(spriteShader.transform, 2 / screenWidth, -2 / screenHeight, -1, 1);
            gl.vertexAttribPointer(spriteShader.pos, 2, gl.FLOAT, false, 32, 0);
            gl.vertexAttribPointer(spriteShader.color, 4, gl.FLOAT, false, 32, 8);
            gl.vertexAttribPointer(spriteShader.uv, 2, gl.FLOAT, false, 32, 24);
            state = STATE_TEXTURED;
        }
        if(currentTexture !== texture.texture) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, texture.texture);
            gl.uniform1i(spriteShader.texture, 0);
        }
        vertexData[offset++] = x;
        vertexData[offset++] = y;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = u0;
        vertexData[offset++] = v0;
        vertexData[offset++] = x+w;
        vertexData[offset++] = y;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = u1;
        vertexData[offset++] = v0;
        vertexData[offset++] = x;
        vertexData[offset++] = y+h;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = u0;
        vertexData[offset++] = v1;
        vertexData[offset++] = x+w;
        vertexData[offset++] = y+h;
        vertexData[offset++] = r;
        vertexData[offset++] = g;
        vertexData[offset++] = b;
        vertexData[offset++] = a;
        vertexData[offset++] = u1;
        vertexData[offset++] = v1;
    };
};
