import React from 'react';
import GlView from './editor-framework/glview';

class Editor extends React.Component {
    update(gl) {
        gl.clearColor(1, 0, 1, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }

    render() {
        return <GlView onFrame={this.update.bind(this)} />;
    }
}

React.render(<Editor />, document.body);
