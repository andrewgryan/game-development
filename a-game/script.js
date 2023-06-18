import { initBuffers } from "./init-buffers.js";
import { drawScene, makeModelViewMatrix, worldBox } from "./draw-scene.js";
import { loadTexture } from "./load-texture.js";

const main = () => {
  // Canvas set-up
  const canvas = document.getElementById("app", { premultipliedAlpha: false });
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;

  const gl = canvas.getContext("webgl");
  if (gl === null) {
    alert("Unable to start WebGL");
    return;
  }

  // Clear canvas
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Vertex shader program
  const vsSource = `
    attribute vec4 aVertexPosition;
    attribute vec2 aTextureCoord;
  
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;

    varying highp vec2 vTextureCoord;

    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
      vTextureCoord = aTextureCoord;
    }
  `;

  const fsSource = `
    varying highp vec2 vTextureCoord;

    uniform sampler2D uSampler;
  
    void main() {
      gl_FragColor = texture2D(uSampler, vTextureCoord);
      gl_FragColor.rgb *= gl_FragColor.a;
    }
  `;

  //
  // Initialize a shader program, so WebGL knows how to draw our data
  //
  function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    // Create the shader program

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // If creating the shader program failed, alert

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
          shaderProgram
        )}`
      );
      return null;
    }

    return shaderProgram;
  }

  //
  // creates a shader of the given type, uploads the source and
  // compiles it.
  //
  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);

    // Send the source to the shader object

    gl.shaderSource(shader, source);

    // Compile the shader program

    gl.compileShader(shader);

    // See if it compiled successfully

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(
          shader
        )}`
      );
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }

  // Initialize a shader program; this is where all the lighting
  // for the vertices and so forth is established.
  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);

  // Collect all the info needed to use the shader program.
  // Look up which attribute our shader program is using
  // for aVertexPosition and look up uniform locations.
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
      textureCoord: gl.getAttribLocation(shaderProgram, "aTextureCoord"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(
        shaderProgram,
        "uProjectionMatrix"
      ),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
      uSampler: gl.getUniformLocation(shaderProgram, "uSampler"),
    },
  };

  // Here's where we call the routine that builds all the
  // objects we'll be drawing.
  const buffers = initBuffers(gl);

  // Load texture
  const texture = loadTexture(gl, "ship.png");
  // Flip image pixels into the bottom-to-top order that WebGL expects.
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // Rotation settings
  let z = 40;
  let box = worldBox(gl, z);
  let x = box.xMin;
  let y = box.yMax;
  let vx = 0.0;
  let vy = 0.0;
  let dv = box.xWidth / 1000;
  let rotation = 0.0;
  let deltaTime = 0;

  document.addEventListener("keypress", (ev) => {
    if (ev.key == "k") {
      rotation += 5 * (Math.PI / 180);
    } else if (ev.key == "j") {
      rotation -= 5 * (Math.PI / 180);
    } else if (ev.key == "l") {
      vx += dv * Math.cos(rotation);
      vy += dv * Math.sin(rotation);
    }
  });

  // Draw the scene
  let then = 0;

  // Draw the scene repeatedly
  function render(now) {
    now *= 0.001; // convert to seconds
    deltaTime = now - then;
    then = now;

    // Move spaceship
    x += vx;
    y += vy;

    // Loop dimension
    if (x > box.xMax) {
      x -= box.xWidth;
    }
    if (x < box.xMin) {
      x += box.xWidth;
    }
    if (y > box.yMax) {
      y -= box.yWidth;
    }
    if (y < box.yMin) {
      y += box.yWidth;
    }

    const squareRotation = rotation - Math.PI / 2;
    const modelViewMatrix = makeModelViewMatrix(squareRotation, x, y, z);

    drawScene(gl, programInfo, buffers, modelViewMatrix, texture);
    // squareRotation += deltaTime;

    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
};

main();
