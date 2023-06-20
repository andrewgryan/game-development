export const shaderCompiler = (gl, shaderType) => (shaderSource) => {
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

export const programCompiler = (gl) => (shaders) => {
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
