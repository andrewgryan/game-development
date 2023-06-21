// @ts-check

console.log("Loaded");

/**
 * @param {WebGLRenderingContext} gl
 * @param {string} source
 * @param {number} type
 * @returns {WebGLShader}
 */
const compileShader = (gl, source, type) => {
  const shader = gl.createShader(type);
  if (shader == null) {
    throw "Could not create a shader";
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (!success) {
    throw "Could not compile source:" + gl.getShaderInfoLog(shader);
  }
  return shader;
};

/**
 * @param {{ gl: WebGLRenderingContext, vertex: string, fragment: string }} shaders source
 */
const compile = ({ gl, vertex, fragment }) => {
  // Shaders
  const vertexShader = compileShader(gl, vertex, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragment, gl.FRAGMENT_SHADER);

  // Program
  const program = gl.createProgram();
  if (program == null) {
    throw "Could not create program";
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  const success = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!success) {
    throw "Failed to link program:" + gl.getProgramInfoLog(program);
  }

  return program;
};

const main = () => {
  /**
   * @type {HTMLElement | null}
   */
  const el = document.getElementById("app");
  if (el == null) {
    return;
  }

  /**
   * @type {HTMLCanvasElement}
   */
  const canvas = document.createElement("canvas");
  canvas.id = "game";
  el.appendChild(canvas);

  /**
   * @type {WebGLRenderingContext | null}
   */
  const gl = canvas.getContext("webgl");
  if (gl == null) {
    return;
  }

  const program = compile({
    gl,
    vertex: `
      void main() {
        gl_Position = vec4(0., 0., 0., 1.);
        gl_PointSize = 120.0;
      }
    `,
    fragment: `
      precision mediump float;

      void main() {
        gl_FragColor = vec4(0.4, 0.4, 0.1, 1.0);
      }
    `,
  });
  console.log({ program });
  // Canvas ratio
  gl.canvas.width = gl.canvas.clientWidth;
  gl.canvas.height = gl.canvas.clientHeight;
  gl.viewport(0, 0, gl.canvas.clientWidth, gl.canvas.clientHeight);

  // Clear
  gl.clearColor(0, 0.1, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Render
  gl.useProgram(program);
  gl.drawArrays(gl.POINTS, 0, 1);
};

main();
