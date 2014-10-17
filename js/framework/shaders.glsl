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
