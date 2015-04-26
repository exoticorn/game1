import React from 'react';
import GlView from './editor-framework/glview';
import async from './framework/async';
import GameResources from './game/resources';
import TileMap from './framework/tilemap';
import TileRenderer from './framework/tilerenderer';
import Shaders from './framework/shaders';

class Editor extends React.Component {
    init(gl) {
        async.go(function*() {
            this.gameResources = yield new GameResources(gl);
            this.shaders = yield Shaders.load(gl, 'src/framework/shaders.glsl');
            this.tileMap = new TileMap(gl, this.gameResources.tileSet, 10, 10);
            for(let y = 0; y < 10; ++y) {
                for(let x = 0; x < 10; ++x) {
                    this.tileMap.set(x, y, Math.floor(Math.random() * 5));
                }
            }
            this.renderer = new TileRenderer(gl, this.shaders.get('tilemap'));
        }, this);
    }

    update(gl) {
        gl.clearColor(1, 0, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(this.renderer) {
            this.renderer.render(this.gameResources.tileSet, this.tileMap, [0, 0]);
        }
    }

    render() {
        return <GlView onInit={this.init.bind(this)} onFrame={this.update.bind(this)} />;
    }
}

React.render(<Editor />, document.body);
