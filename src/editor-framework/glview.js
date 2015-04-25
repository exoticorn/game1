import React from 'react';

export default class GlView extends React.Component {
    componentDidMount() {
        this.canvas = this.refs.canvas.getDOMNode();
        this.gl = this.canvas.getContext('webgl', {alpha: false});
        this.handleResize();
        if(this.props.onInit) {
            this.props.onInit(this.gl);
        }
        window.requestAnimationFrame(this.update.bind(this));
    }
    handleResize() {
        let width = this.canvas.clientWidth;
        let height = this.canvas.clientHeight;
        if(this.canvas.width != width || this.canvas.height != height) {
            this.canvas.width = width;
            this.canvas.height = height;
        }
    }
    update() {
        let gl = this.gl;
        this.handleResize();
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
        if(this.props.onFrame) {
            this.props.onFrame(gl);
        }
        window.requestAnimationFrame(this.update.bind(this));
    }
    render() {
        return <canvas className={this.props.className} style={this.props.style || {width: '100%', height: '100%'}} ref='canvas' />;
    }
}
