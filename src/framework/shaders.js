import io from './io.js';

export default function Shaders(gl, sources) {
    var shaders = {};
    var currentShader;
    var currentPart;
    var varyings;
    sources.split('\n').forEach(function(line) {
        var match = /^### (\w+)\s*$/.exec(line);
        if(match) {
            currentShader = {};
            currentPart = [];
            varyings = ['precision mediump float;'];
            currentShader.vertex = currentPart;
            shaders[match[1]] = currentShader;
        } else if(currentShader && !/^\s*$/.test(line)) {
            if(/^---\s*$/.test(line)) {
                currentPart = varyings;
                varyings = [];
                currentShader.fragment = currentPart;
            } else {
                if(/^\s*varying\s+/.test(line)) {
                    varyings.push(line);
                }
                currentPart.push(line);
            }
        }
    });
    
    var shaderObjs = {};
    this.get = function(name) {
        if(shaderObjs[name] !== undefined) {
            return shaderObjs[name];
        }
        
        var sources = shaders[name];
        if(sources === undefined) {
            io.error("No shader named '" + name + "' found!");
        }
        
        function compile(type, src) {
            var shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                var lines = [];
                src.split('\n').forEach(function(line) {
                    lines.push((lines.length + 1) + ': ' + line);
                });
                io.error("Shader '" + name + "' compile failed:\n" + gl.getShaderInfoLog(shader) + '\n' + lines.join('\n'));
            }
            return shader;
        }
        
        var program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, sources.vertex.join('\n')));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, sources.fragment.join('\n')));
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            io.error("Shader '" + name + "' link failed:\n" + gl.getProgramInfoLog(program));
        }
        var shader = new Shader(program);
        shaderObjs[name] = shader;
        return shader;
    };
    
    function Shader(program) {
        var i, numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for(i = 0; i < numAttributes; ++i) {
            this[gl.getActiveAttrib(program, i).name] = i;
        }
        for(i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); ++i) {
            var name = gl.getActiveUniform(program, i).name;
            this[name] = gl.getUniformLocation(program, name);
        }
        this.begin = function() {
            gl.useProgram(program);
            for(var i = 0; i < numAttributes; ++i) {
                gl.enableVertexAttribArray(i);
            }
        };
        this.end = function() {
            for(var i = 0; i < numAttributes; ++i) {
                gl.disableVertexAttribArray(i);
            }
        };
    }
};

Shaders.load = function(gl, url) {
    return io.load(url).then(function(src) {
        return new Shaders(gl, src);
    }).catch(function(err) {
        io.error('Loading shaders failed: ' + err);
    });
};
