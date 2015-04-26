### spritePlain

varying lowp vec4 vColor;

attribute vec2 pos;
attribute vec4 color;

uniform vec4 transform;

void main() {
  vColor = color;
  gl_Position = vec4(pos * transform.xy + transform.zw, 0.0, 1.0);
}
---
void main() {
  gl_FragColor = vColor;
}

### sprite

varying lowp vec4 vColor;
varying mediump vec2 vUV;

attribute vec2 pos;
attribute vec4 color;
attribute vec2 uv;

uniform vec4 transform;

void main() {
  vColor = color;
  vUV = uv;
  gl_Position = vec4(pos * transform.xy + transform.zw, 0.0, 1.0);
}
---
uniform sampler2D texture;

void main() {
  gl_FragColor = texture2D(texture, vUV) * vColor;
}
### vscreen

varying highp vec2 vpos;
varying mediump vec2 pixelSize;
varying highp vec2 uvScale;

attribute vec2 pos;

uniform vec2 psize;
uniform vec2 vsize;

void main() {
  vpos = (pos - 0.5) * vsize;
  float scale = min(psize.x / vsize.x, psize.y / vsize.y);
  vec2 ppos = vpos * scale;
  gl_Position = vec4(ppos / psize * 2.0, 0.0, 1.0);
  pixelSize = vsize / psize;
  uvScale = 1.0 / vsize;
}
---
uniform sampler2D texture;

vec4 sample(vec2 pos) {
  vec2 pfrac = fract(pos);
  vec2 alpha2 = pfrac * (1.0 - pfrac);
  float alpha = min(alpha2.x * alpha2.y * 32.0, 1.0);
  return texture2D(texture, pos * uvScale + 0.5) * alpha;
}

vec4 sampleBlur(vec2 pos) {
  vec4 color = sample(pos + vec2(-0.3, -0.15));
  color += sample(pos + vec2(-0.15, 0.3));
  color += sample(pos + vec2(0.3, 0.15));
  color += sample(pos + vec2(0.15, -0.5));
  return min(color * 0.4, 1.0);
}

void main() {
  vec4 color = sampleBlur(vpos + vec2(-0.3, -0.15) * pixelSize);
  color += sampleBlur(vpos + vec2(-0.15, 0.3) * pixelSize);
  color += sampleBlur(vpos + vec2(0.3, 0.15) * pixelSize);
  color += sampleBlur(vpos + vec2(0.15, -0.5) * pixelSize);
  color += sampleBlur(vpos + vec2(-1.5 + sin(vpos.y * 4.0) * 0.25, 0.0)) * 0.5;
  gl_FragColor = color * 0.25;
}

### tilemap
varying highp vec2 vUv;

attribute vec2 pos;
attribute vec2 uv;

void main() {
     gl_Position = vec4(pos, 0.0, 1.0);
     vUv = uv;
}
---
uniform sampler2D tileMap;
uniform sampler2D tileSet;
uniform vec4 color;
uniform vec2 mapScale;
uniform vec2 setScale;

void main() {
     vec2 mapUv = (floor(vUv) + 0.5) * mapScale;
     vec2 mask = step(0.0, mapUv) * step(-1.0, -mapUv);
     vec2 tile = texture2D(tileMap, mapUv).xy * 255.0;
     vec2 uv = tile - vec2(0.0, 1.0) + fract(vUv);
     gl_FragColor = texture2D(tileSet, uv * setScale) * color * (step(1.0, tile.y) * mask.x * mask.y);
}
