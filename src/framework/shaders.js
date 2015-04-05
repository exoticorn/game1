import io from './io';
import async from './async';

export default function Shaders(gl, sources) {
    let shaders = {};
    let currentShader;
    let currentPart;
    let varyings;
    sources.split('\n').forEach(line => {
        let match = /^### (\w+)\s*$/.exec(line);
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
    
    let shaderObjs = {};
    this.get = function(name) {
        if(shaderObjs[name] !== undefined) {
            return shaderObjs[name];
        }
        
        let sources = shaders[name];
        if(sources === undefined) {
            io.error("No shader named '" + name + "' found!");
        }
        
        function compile(type, src) {
            let shader = gl.createShader(type);
            gl.shaderSource(shader, src);
            gl.compileShader(shader);
            if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                let lines = [];
                src.split('\n').forEach(function(line) {
                    lines.push((lines.length + 1) + ': ' + line);
                });
                io.error("Shader '" + name + "' compile failed:\n" + gl.getShaderInfoLog(shader) + '\n' + lines.join('\n'));
            }
            return shader;
        }
        
        let program = gl.createProgram();
        gl.attachShader(program, compile(gl.VERTEX_SHADER, sources.vertex.join('\n')));
        gl.attachShader(program, compile(gl.FRAGMENT_SHADER, sources.fragment.join('\n')));
        gl.linkProgram(program);
        if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            io.error("Shader '" + name + "' link failed:\n" + gl.getProgramInfoLog(program));
        }
        let shader = new Shader(program);
        shaderObjs[name] = shader;
        return shader;
    };
    
    function Shader(program) {
        let numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        this.attributes = [];
        for(let i = 0; i < numAttributes; ++i) {
            let attribute = gl.getActiveAttrib(program, i);
            this[attribute.name] = i;
            this.attributes.push({name: attribute.name, type: attribute.type, size: attribute.size, index: i});
        }
        this.uniforms = [];
        for(let i = 0; i < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); ++i) {
            let name = gl.getActiveUniform(program, i).name;
            this[name] = gl.getUniformLocation(program, name);
            this.uniforms.push({name: name, location: this[name]});
        }
        this.begin = function() {
            gl.useProgram(program);
            for(let i = 0; i < numAttributes; ++i) {
                gl.enableVertexAttribArray(i);
            }
        };
        this.end = function() {
            for(let i = 0; i < numAttributes; ++i) {
                gl.disableVertexAttribArray(i);
            }
        };
    }
};

Shaders.load = async(function*(gl, url) {
    try {
        return new Shaders(gl, yield io.load(url));
    } catch(err) {
        io.error('Loading shaders failed: ' + err);
    }
});
