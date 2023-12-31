import mat3 from "https://cdn.jsdelivr.net/npm/gl-mat3@2.0.0/+esm";
import { shaderCompiler, programCompiler } from "./lib.js";

const el = document.getElementById("game");
const gl = el.getContext("webgl");

// Program
const compile = {
  vertex: shaderCompiler(gl, gl.VERTEX_SHADER),
  fragment: shaderCompiler(gl, gl.FRAGMENT_SHADER),
  program: programCompiler(gl),
};

const shaders = {
  tractor: {
    vertex: compile.vertex(`
attribute vec4 a_position;
attribute vec2 a_texcoord;

uniform mat4 u_model;
uniform mat3 u_transform;
varying vec2 v_texcoord;

void main() {
    gl_Position = u_model * a_position;
    v_texcoord = vec2((u_transform * vec3(a_texcoord, 1.)).xy);
}`),
    fragment: compile.fragment(`
precision mediump float;
varying vec2 v_texcoord;
uniform sampler2D u_texture;

void main() {
    if (v_texcoord.x < 0.0 ||
        v_texcoord.y < 0.0 ||
        v_texcoord.x > 1.0 ||
        v_texcoord.y > 1.0) {
      discard;
    }

    gl_FragColor = texture2D(u_texture, v_texcoord);     
}`),
  },
  field: {
    vertex: compile.vertex(`
      attribute vec4 a_position;
      void main() {
        gl_Position = a_position;
      }
      `),
    fragment: compile.fragment(`
      precision mediump float;
      void main() {
        gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);
      }
      `),
  },
};

const programs = {
  tractor: compile.program(shaders.tractor),
  field: compile.program(shaders.field),
};

// Uniform
const uniform = (gl, program, name) => {
  const location = gl.getUniformLocation(program, name);
  return {
    location,
  };
};

const u_model = uniform(gl, programs.tractor, "u_model");
const u_transform = uniform(gl, programs.tractor, "u_transform");

/**
 * Attribute
 * @param {string} name
 * @param {Array.<number>} data
 */
const attribute = (gl, program, name, data) => {
  const location = gl.getAttribLocation(program, name);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  return {
    location,
    buffer,
  };
};

const entity = {
  data: [-1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1],
  uv: [0, 1, 0, 0, 1, 0, 0, 1, 1, 1, 1, 0],
  size: 2,
  count: 6,
};
const a_position = attribute(gl, programs.tractor, "a_position", entity.data);
const a_texcoord = attribute(gl, programs.tractor, "a_texcoord", entity.uv);

// Match canvas size to CSS size
gl.canvas.width = gl.canvas.clientWidth;
gl.canvas.height = gl.canvas.clientHeight;
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Render
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(programs.tractor);

// Uniforms
const pixel = 32;
gl.uniformMatrix4fv(
  u_model.location,
  false,
  new Float32Array([
    pixel / gl.canvas.clientWidth,
    0,
    0,
    0,
    0,
    pixel / gl.canvas.clientHeight,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
  ])
);

let transform = mat3.create();
mat3.scale(transform, transform, [1 / 7, 1 / 4]);
mat3.translate(transform, transform, [0, 1]);

gl.uniformMatrix3fv(u_transform.location, false, transform);

// Textures
const pixels = new Uint8Array([0, 0, 0, 0]); // Single pixel
const texture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, texture);
gl.texImage2D(
  gl.TEXTURE_2D,
  0,
  gl.RGBA,
  1,
  1,
  0,
  gl.RGBA,
  gl.UNSIGNED_BYTE,
  pixels
);
const image = new Image();
image.addEventListener("load", () => {
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
});
image.src = "tractor.png";

// Attributes

// Texcoord
gl.enableVertexAttribArray(a_texcoord.location);
gl.bindBuffer(gl.ARRAY_BUFFER, a_texcoord.buffer);

gl.vertexAttribPointer(a_texcoord.location, entity.size, gl.FLOAT, false, 0, 0);

// Position
gl.enableVertexAttribArray(a_position.location);
gl.bindBuffer(gl.ARRAY_BUFFER, a_position.buffer);

const pointer = {
  size: entity.size,
  type: gl.FLOAT,
  normalized: false,
  stride: 0,
  offset: 0,
};
gl.vertexAttribPointer(
  a_position.location,
  pointer.size,
  pointer.type,
  pointer.normalized,
  pointer.stride,
  pointer.offset
);

const draw = {
  mode: gl.TRIANGLES,
  first: 0,
  count: entity.count,
};

// Game
let sprite = 0;
let frame = 0;
document.addEventListener("keypress", (ev) => {
  if (ev.key == "k") {
    sprite = (sprite + 1) % 4;
    frame = 0;
  }
});

const sprites = {
  0: [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
  ],
  1: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [6, 1],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
  ],
  2: [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [4, 3],
  ],
  3: [
    [0, 1],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [6, 1],
    [0, 3],
    [1, 3],
    [2, 3],
    [3, 3],
  ],
};

const render = () => {
  const [i, j] = sprites[sprite][frame];

  let transform = mat3.create();

  // Scale and rotate
  mat3.scale(transform, transform, [1 / 7, 1 / 4]);
  mat3.translate(transform, transform, [i % 7, j % 4]);

  // Flip about y-axis
  if (sprite === 3) {
    mat3.translate(transform, transform, [0.5, 0]);
    mat3.scale(transform, transform, [-1, 1]);
    mat3.translate(transform, transform, [-0.5, 0]);
  }

  gl.uniformMatrix3fv(u_transform.location, false, transform);

  gl.drawArrays(draw.mode, draw.first, draw.count);

  // Advance animation by one frame
  frame = (frame + 1) % sprites[sprite].length;
};

setInterval(render, 1000 / 7);
render();

// const render = () => {
//   requestAnimationFrame(render);
//   gl.drawArrays(draw.mode, draw.first, draw.count);
// };
// requestAnimationFrame(render);
