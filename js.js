const canvas = document.getElementById("webglCanvas");
const gl =
  canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

if (!gl) {
  console.log("WebGL not supported");
}

// Vertex shader
const vertexShaderSource = `
  attribute vec3 coordinates;
  attribute vec3 color;
  varying vec3 vColor;
  uniform mat4 transformMatrix;
  uniform mat4 perspectiveMatrix;
  void main(void) {
    gl_Position = perspectiveMatrix * transformMatrix * vec4(coordinates, 1.0);
    vColor = color;
  }
`;

// Fragment shader
const fragmentShaderSource = `
  precision mediump float;
  varying vec3 vColor;
  void main(void) {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

// Compile shader functions
function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compilation error:", gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Compile shaders and link program
const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
const shaderProgram = gl.createProgram();
gl.attachShader(shaderProgram, vertexShader);
gl.attachShader(shaderProgram, fragmentShader);
gl.linkProgram(shaderProgram);
gl.useProgram(shaderProgram);

// Define cube vertices and colors
const vertices = new Float32Array([
  -0.5, -0.5, 0.5, 1, 0, 0, 0.5, -0.5, 0.5, 0, 1, 0, 0.5, 0.5, 0.5, 0, 0, 1,
  -0.5, 0.5, 0.5, 1, 1, 0, -0.5, -0.5, -0.5, 1, 0, 1, 0.5, -0.5, -0.5, 0, 1, 1,
  0.5, 0.5, -0.5, 1, 0, 1, -0.5, 0.5, -0.5, 0, 0, 1,
]);

const indices = new Uint16Array([
  0,
  1,
  2,
  0,
  2,
  3, // Front
  4,
  5,
  6,
  4,
  6,
  7, // Back
  0,
  1,
  5,
  0,
  5,
  4, // Bottom
  2,
  3,
  7,
  2,
  7,
  6, // Top
  0,
  3,
  7,
  0,
  7,
  4, // Left
  1,
  2,
  6,
  1,
  6,
  5, // Right
]);

// Create buffers
const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Link vertex positions
const coord = gl.getAttribLocation(shaderProgram, "coordinates");
gl.vertexAttribPointer(
  coord,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  0
);
gl.enableVertexAttribArray(coord);

// Link vertex colors
const color = gl.getAttribLocation(shaderProgram, "color");
gl.vertexAttribPointer(
  color,
  3,
  gl.FLOAT,
  false,
  6 * Float32Array.BYTES_PER_ELEMENT,
  3 * Float32Array.BYTES_PER_ELEMENT
);
gl.enableVertexAttribArray(color);

// Perspective matrix setup
const fov = (45 * Math.PI) / 180; // Field of view in radians
const aspect = canvas.width / canvas.height;
const near = 0.1;
const far = 100.0;
const perspectiveMatrix = new Float32Array([
  1 / (aspect * Math.tan(fov / 2)),
  0,
  0,
  0,
  0,
  1 / Math.tan(fov / 2),
  0,
  0,
  0,
  0,
  -(far + near) / (far - near),
  -1,
  0,
  0,
  -(2 * far * near) / (far - near),
  0,
]);

const perspectiveMatrixLocation = gl.getUniformLocation(
  shaderProgram,
  "perspectiveMatrix"
);
gl.uniformMatrix4fv(perspectiveMatrixLocation, false, perspectiveMatrix);

// Rotation setup
let angle = 0;
function getRotationMatrix(angleX, angleY) {
  const cosX = Math.cos(angleX);
  const sinX = Math.sin(angleX);
  const cosY = Math.cos(angleY);
  const sinY = Math.sin(angleY);

  return new Float32Array([
    cosY,
    0,
    sinY,
    0,
    sinX * sinY,
    cosX,
    -sinX * cosY,
    0,
    -cosX * sinY,
    sinX,
    cosX * cosY,
    0,
    0,
    0,
    -5,
    1, // Moves the cube backward for better perspective
  ]);
}

function draw() {
  angle += 0.01;
  const transformMatrix = getRotationMatrix(angle, angle / 2);
  const transformMatrixLocation = gl.getUniformLocation(
    shaderProgram,
    "transformMatrix"
  );
  gl.uniformMatrix4fv(transformMatrixLocation, false, transformMatrix);

  // Clear and draw
  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

  requestAnimationFrame(draw);
}

draw();
