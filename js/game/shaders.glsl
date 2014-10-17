### stars
varying lowp float alpha;

attribute vec3 pos;

uniform float time;

void main() {
  float s = pos.z * (0.4 + pos.y * pos.y * 0.6);
  gl_Position = vec4(fract(pos.x - time * s) * 2.0 - 1.0, pos.y, 0.0, 1.0);
  gl_PointSize = s;
  alpha = clamp(s / 4.0, 0.0, 0.75);
}
---
void main() {
  gl_FragColor = vec4(alpha, alpha, alpha, alpha);
}

