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
        return function(x, y, z, w) {
            let o = this.offset + offset;
            this.vertexData[o] = x;
            this.vertexData[o+1] = y;
            this.vertexData[o+2] = z;
            this.vertexData[o+3] = w;
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
    let vertexData128 = this.vertexData.subarray(0, 128 * vertexSize);
    let vertexData64 = this.vertexData.subarray(0, 64 * vertexSize);
    let vertexData32 = this.vertexData.subarray(0, 32 * vertexSize);
    let vertexData16 = this.vertexData.subarray(0, 16 * vertexSize);
    let vertexData8 = this.vertexData.subarray(0, 8 * vertexSize);
    let vertexBuffer = gl.createBuffer();

    this.shader = shader;
    let numVertices = 0;
    let primitiveType;

    this.begin = function() {
        shader.begin();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        for(let s of setups) {
            s();
        }
    };

    this.beginPrimitive = function(type) {
        this.offset = 0;
        numVertices = 0;
        primitiveType = type;
    };

    this.done = function() {
        this.offset += vertexSize;
        numVertices += 1;
        if(numVertices >= maxVertices) {
            let draw = numVertices;
            let copy = 0;
            switch(primitiveType) {
            case gl.TRIANGLES:
                draw = Math.floor(draw / 3) * 3;
                copy = numVertices - draw;
                break;
            case gl.TRIANGLE_STRIP:
                copy = 2;
                break;
            }
            let copyStart = (numVertices - copy) * vertexSize;
            numVertices = draw;
            this.endPrimitive();
            this.beginPrimitive(primitiveType);
            let copyCount = copy * vertexSize;
            for(let i = 0; i < copyCount; ++i) {
                this.vertexData[i] = this.vertexData[copyStart + i];
            }
            this.offset = copyCount;
            numVertices = copy;
        }
    };

    this.endPrimitive = function() {
        if(numVertices <= 8) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData8, gl.DYNAMIC_DRAW);
        } else if(numVertices <= 16) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData16, gl.DYNAMIC_DRAW);
        } else if(numVertices <= 32) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData32, gl.DYNAMIC_DRAW);
        } else if(numVertices <= 64) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData64, gl.DYNAMIC_DRAW);
        } else if(numVertices <= 128) {
            gl.bufferData(gl.ARRAY_BUFFER, vertexData128, gl.DYNAMIC_DRAW);
        } else {
            gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.DYNAMIC_DRAW);
        }
        gl.drawArrays(primitiveType, 0, numVertices);
    };

    this.end = function() {
        shader.end;
    };
}
