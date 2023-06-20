const el = document.getElementById("game");
const gl = el.getContext("webgl");

// Program
const compiler = (gl, shaderType) => (shaderSource) => {
  // Create the shader object
  var shader = gl.createShader(shaderType);

  // Set the shader source code.
  gl.shaderSource(shader, shaderSource);

  // Compile the shader
  gl.compileShader(shader);

  // Check if it compiled
  var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    // Something went wrong during compilation; get the error
    throw "could not compile shader:" + gl.getShaderInfoLog(shader);
  }

  return shader;
};

const programCompiler = (gl) => (shaders) => {
  // create a program.
  var program = gl.createProgram();

  // attach the shaders.
  gl.attachShader(program, shaders.vertex);
  gl.attachShader(program, shaders.fragment);

  // link the program.
  gl.linkProgram(program);

  // Check if it linked.
  var success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    // something went wrong with the link
    throw "program failed to link:" + gl.getProgramInfoLog(program);
  }

  return program;
};

const compile = {
  vertex: compiler(gl, gl.VERTEX_SHADER),
  fragment: compiler(gl, gl.FRAGMENT_SHADER),
  program: programCompiler(gl),
};

const shaders = {
  vertex: compile.vertex(`
attribute vec4 a_position;
uniform mat4 u_model;

void main() {
    gl_Position = u_model * a_position;
}`),
  fragment: compile.fragment(`
precision mediump float;

void main() {
    gl_FragColor = vec4(0.2, 0.9, 0.0, 1.0);     
}`),
};

const program = compile.program(shaders);

// Uniform
const uniform = (gl, program, name) => {
  const location = gl.getUniformLocation(program, name);
  return {
    location,
  };
};

const u_model = uniform(gl, program, "u_model");

// Attribute
const attribute = (gl, program, name, entity) => {
  const location = gl.getAttribLocation(program, name);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(entity.data), gl.STATIC_DRAW);
  return {
    location,
    buffer,
  };
};

const entity = {
  data: [-1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1],
  size: 2,
  count: 6,
};
const a_position = attribute(gl, program, "a_position", entity);

// Match canvas size to CSS size
gl.canvas.width = gl.canvas.clientWidth;
gl.canvas.height = gl.canvas.clientHeight;
gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Render
gl.clearColor(0.25, 0.5, 0.75, 1);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

// Uniforms
gl.uniformMatrix4fv(
  u_model.location,
  false,
  new Float32Array([0.2, 0, 0, 0, 0, 0.1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])
);

// Attributes
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
gl.drawArrays(draw.mode, draw.first, draw.count);
