import io from './io';
import async from './async';
import { createTexture } from './texture';

export default async(function*(url, gl, config) {
    let txt = yield io.load(url);

    let colors = {' ': 0};
    let current;
    let textures = {};

    function makeTexture() {
        if(!current) {
            return;
        }
        current.data = new Uint8Array(current.data.buffer);
        textures[current.name] = createTexture(gl, current, config);
        current = undefined;
    }
    
    for(let line of txt.split(/\n/)) {
        let match = line.match(/^\s*(.)\s*=\s([0-9a-fA-F]+)\s*$/);
        
        if(match) {
            let color = match[2];
            if(color.length < 4) {
                color += 'f';
            }
            color = parseInt(color.split('').reverse().map(c => c + c).join(''), 16);
            colors[match[1]] = color;
        } else {
            let match = line.match(/^>\s*(\w+)\s*(,\s*(\d+)x(\d+)\s*)?$/);
            if(match) {
                makeTexture();
                if(match[1] === 'EOF') {
                    current = undefined;
                } else {
                    let w = match[3]|0 || 8, h = match[4]|0 || 8;
                    current = {name: match[1], width: w, height: h, data: new Uint32Array(w * h), y: 0};
                }
            } else if(current && current.y < current.height) {
                line.split('').forEach((c, x) => {
                    if(x < current.width) {
                        current.data[x + current.y * current.width] = colors[c];
                    }
                });
                current.y++;
            }
        }
    }
    makeTexture();
    return textures;
});
