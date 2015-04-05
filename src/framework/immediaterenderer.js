export default function ImmediateRenderer(gl, shader) {
    function setup(index, size, offset, stride) {
        return () => {
            gl.vertexAttribPointer(index, size, gl.FLOAT, false, stride, offset);
        };
    }

    function add1(offset) {
        return function(x) {
            this.vertexData[this.offset + offset] = x;
            return this;
        };
    }

    function add2(offset) {
        return function(x, y) {
            let o = this.offset + offset;
            this.vertexData[o] = x;
            this.vertexData[o+1] = y;
            return this;
        };
    }

    function add3(offset) {
        return function(x, y, z) {
            let o = this.offset + offset;
            this.vertexData[o] = x;
            this.vertexData[o+1] = y;
            this.vertexData[o+2] = z;
            return this;
        };
    }

    function add4(offset) {
        return (x, y, z, w) => {
            let o = self.offset + offset;
            self.vertexData[o] = x;
            self.vertexData[o+1] = y;
            self.vertexData[o+2] = z;
            self.vertexData[o+3] = w;
        };
    }

    let config = new Map([
        [ gl.FLOAT, { size: 1, add: add1 } ],
        [ gl.FLOAT_VEC2, { size: 2, add: add2 } ],
        [ gl.FLOAT_VEC3, { size: 3, add: add3 } ],
        [ gl.FLOAT_VEC4, { size: 4, add: add4 } ]
    ]);
    
    let vertexSize = 0;
    for(let attr of shader.attributes) {
        vertexSize += config.get(attr.type).size;
    }

    let offset = 0;
    let setups = [];
    for(let attr of shader.attributes) {
        let c = config.get(attr.type);
        this[attr.name] = c.add(offset);
        setups.push(setup(attr.index, c.size, offset * 4, vertexSize * 4));
        offset += c.size;
    }

    let maxVertices = 256;
    this.vertexData = new Float32Array(maxVertices * vertexSize);
    this.vertexData128 = this.vertexData.subarray(0, 128 * vertexSize);
    this.vertexData64 = this.vertexData.subarray(0, 64 * vertexSize);
    this.vertexData32 = this.vertexData.subarray(0, 32 * vertexSize);
    this.vertexData16 = this.vertexData.subarray(0, 16 * vertexSize);
    this.vertexData8 = this.vertexData.subarray(0, 8 * vertexSize);
    this.vertexBuffer = gl.createBuffer();

    this.shader = shader;
    this.offset = 0;
    this.numVertices = 0;

    this.begin = function() {
        shader.begin();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        for(let s of setups) {
            s();
        }
    };

    this.beginPrimitive = function() {
        this.offset = 0;
        this.numVertices = 0;
    };

    this.done = function() {
        this.offset += vertexSize;
        this.numVertices += 1;
    };

    this.endPrimitive = function() {
        if(this.numVertices <= 8) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData8, gl.DYNAMIC_DRAW);
        } else if(this.numVertices <= 16) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData16, gl.DYNAMIC_DRAW);
        } else if(this.numVertices <= 32) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData32, gl.DYNAMIC_DRAW);
        } else if(this.numVertices <= 64) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData64, gl.DYNAMIC_DRAW);
        } else if(this.numVertices <= 128) {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData128, gl.DYNAMIC_DRAW);
        } else {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.DYNAMIC_DRAW);
        }
        gl.drawArrays(gl.TRIANGLES, 0, this.numVertices);
    };

    this.end = function() {
        shader.end;
    };
}
