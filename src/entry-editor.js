import React from 'react';
import GlView from './editor-framework/glview';
import async from './framework/async';
import GameResources from './game/resources';
import Shaders from './framework/shaders';
import MapEditor from './editor-framework/mapeditor';

class Editor extends React.Component {
    init(gl) {
        gl.enable(gl.BLEND);
        gl.blendEquation(gl.FUNC_ADD);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        async.go(function*() {
            this.gameResources = yield new GameResources(gl);
            this.shaders = yield Shaders.load(gl, 'src/framework/shaders.glsl');
            this.context = { gl: gl, shaders: this.shaders };
            this.mapEditor = new MapEditor(this.context, this.gameResources.tileSet);
        }, this);
    }

    update(gl) {
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(this.mapEditor) {
            this.mapEditor.render();
        }
    }

    input(type, e) {
        if(this.mapEditor) {
            this.mapEditor.input(type, e);
        }
    }

    render() {
        return <GlView onInit={this.init.bind(this)} onFrame={this.update.bind(this)} onInput={this.input.bind(this)} />;
    }
}

React.render(<Editor />, document.body);
