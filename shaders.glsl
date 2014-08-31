### stars
varying lowp float alpha;

attribute vec3 pos;

uniform float time;

void main() {
  float s = pos.z * (0.4 + pos.y * pos.y * 0.6);
  gl_Position = vec4(fract(pos.x - time * s) * 2.0 - 1.0, pos.y, 0.0, 1.0);
  gl_PointSize = s;
  alpha = clamp(s / 4.0, 0.0, 1.0);
}
---
void main() {
  gl_FragColor = vec4(alpha, alpha, alpha, alpha);
}

### sprite

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
