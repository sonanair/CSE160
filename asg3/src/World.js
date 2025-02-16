// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform bool u_Clicked;
  void main() {
    if (u_Clicked){
      vec4(1,1,1,1);
    }
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1){
      vec3 startColor = vec3(0.220, 0.431, 0.412);
      vec3 endColor = vec3(0.486, 0.749, 0.678);
      gl_FragColor = vec4(mix(startColor, endColor, v_UV.y), 1.0);
    } else if (u_whichTexture == 0) {
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2) {
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3) {
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4) {
      gl_FragColor = texture2D(u_Sampler4, v_UV);
    } else if (u_whichTexture == 5) {
      gl_FragColor = texture2D(u_Sampler5, v_UV);
    } else {
      gl_FragColor = vec4(1,.2,.2,1);
    }
    
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_Clicked;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;
let u_Sampler4;
let u_whichTexture;

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariableToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // // Get the storage location of a_Position
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
    return;
  }

  // Get the storage location of u_Sampler
  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}


//Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_globalAngle = 0;

function addActionsForHtmlUI(){
  //Button Events (Shape Type)
  
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

}

function initTextures() {
  var sky = new Image();  // Create the image object
  if (!sky) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  sky.onload = function(){ sendImageToTEXTURE0(sky); };
  // Tell the browser to load an image
  sky.src = 'sky.jpg';

  var pillar = new Image();
  if(!pillar){
    console.log('Failed to create the image object');
    return false;
  }
  pillar.onload = function(){ sendImageToTEXTURE2(pillar); };
  pillar.src = 'pill.jpg';

  var room = new Image();
  if(!room){
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  room.onload = function(){ sendImageToTEXTURE1(room); };
  // Tell the browser to load an image
  room.src = 'room.jpg';

  var floor = new Image();
  if(!floor){
    console.log('Failed to create the image object');
    return false;
  }
  floor.onload = function(){ sendImageToTEXTURE3(floor); };
  floor.src = 'floor.jpg';

  var ocean = new Image();
  if(!ocean){
    console.log('Failed to create the image object');
    return false;
  }
  ocean.onload = function(){ sendImageToTEXTURE4(ocean); };
  ocean.src = 'ocean.jpg';

  var marble = new Image();
  if(!marble){
    console.log('Failed to create the image object');
    return false;
  }
  marble.onload = function(){ sendImageToTEXTURE5(marble); };
  marble.src = 'marble.jpg';

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE2(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler2, 2);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE3(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE3);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler3, 3);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE4(image) {
  var texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE4);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler4, 4);
  
  //gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('finished loadTexture');
}

function sendImageToTEXTURE5(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE5);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  gl.uniform1i(u_Sampler5, 5);
  console.log('finished loadTexture');
}

function main() {
  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();

  document.onkeydown = keydown;
  initTextures();

  setupMouseControls();
  
  canvas.addEventListener("click", function(event) {
    let { x, z } = getClickedPosition(event);
    
    // Check if cube already exists at this position
    let existingIndex = cubes.findIndex(c => c.x === x && c.z === z);
    if (existingIndex === -1) {
        cubes.push({ x, z }); // Add new cube
    }
  });

  canvas.addEventListener("dblclick", function(event) {
    let { x, z } = getClickedPosition(event);
    
    // Remove cube if it exists
    cubes = cubes.filter(c => c.x !== x || c.z !== z);
  });

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  //renderAllShapes();
  g_eye = new Vector3([0, 0, 0]);
  g_at = new Vector3([0, 0, 100]);
  g_up = new Vector3([0, 20, 0]);
  //g_camera = new Camera();
  requestAnimationFrame(tick);
}


function setupMouseControls() {
  let g_lastX = null;
  let g_lastY = null;
  let g_sensitivity = 0.5; // Adjust sensitivity as needed

  canvas.addEventListener("mousedown", (event) => {
    g_lastX = event.clientX;
    g_lastY = event.clientY;
    canvas.addEventListener("mousemove", rotateCamera);
  });

  canvas.addEventListener("mouseup", () => {
    canvas.removeEventListener("mousemove", rotateCamera);
  });


  function rotateCamera(event) {
    if (g_lastX === null || g_lastY === null) return;

    let deltaX = event.clientX - g_lastX;
    let deltaY = event.clientY - g_lastY;

    g_lastX = event.clientX;
    g_lastY = event.clientY;

    let angleX = deltaX * g_sensitivity;
    let angleY = deltaY * g_sensitivity;

    let eye = new Vector3(g_eye.elements);
    let at = new Vector3(g_at.elements);
    let up = new Vector3(g_up.elements);

    let forward = at.sub(eye);
    forward.normalize();

    // Rotate around the Y-axis (left/right rotation)
    let rotationX = new Matrix4();
    rotationX.setRotate(angleX, 0, 1, 0);
    forward = rotationX.multiplyVector3(forward);

    // Rotate around the X-axis (up/down rotation)
    let right = Vector3.cross(forward, up);
    right.normalize();
    let rotationY = new Matrix4();
    rotationY.setRotate(-angleY, right.elements[0], right.elements[1], right.elements[2]);
    forward = rotationY.multiplyVector3(forward);

    g_at = eye.add(forward);
    renderAllShapes();
  }
}

let cubes = []; // Stores cube positions

// Converts screen coordinates to world coordinates (simplified for grid snapping)
function getClickedPosition(event) {
    let rect = canvas.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / canvas.width) * 2 - 1;
    let y = 1 - ((event.clientY - rect.top) / canvas.height) * 2;
    
    // Simple conversion assuming a flat grid
    let worldX = Math.round(x * 8);
    let worldZ = Math.round(y * 8);
    console.log("Clicked Position", worldX, worldZ);
    return { x: worldX, z: worldZ };
}


var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_startTime;
  renderAllShapes();
  requestAnimationFrame(tick);
}

function keydown(ev){
  if (ev.keyCode==68){
    right();
  } else if (ev.keyCode==65){
    left();
  } else if (ev.keyCode==87){
    forward();
  } else if (ev.keyCode==83){
    backward();
  } else if (ev.keyCode==69){
    rotateLeft();
  } else if (ev.keyCode==81){
    rotateRight();
  }
  renderAllShapes();
} // add w, a, etc














var g_map = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

function renderCubes() {
  for (let cube of cubes) {
      let newCube = new Cube();
      newCube.color = [1, 1, 1, 1]; // White color
      //newCube.matrix.transl
      newCube.matrix.translate(cube.x * 0.5, -0.75, cube.z * 0.5);
      newCube.render();
  }
}

let initialScale = 10;
function drawMap(){
  for (x=0;x<32;x++){
    let scale = initialScale;
    let step = 11;
    let depth = 0;
    for (y=0;y<32;y++){
      scale = buildBrokenWall1(x,y,scale);
      buildColumn1(x,y);
      scale = buildBrokenWall2(x,y,scale);
      //water(x,y);
      brokenColumn1(x,y);
      brokenColumn2(x,y);
      buildColumn2(x,y);
      roof(x,y);
      let staircase = stairs(x,y,step,depth);
      step = staircase.step;
      depth = staircase.depth;
    }
  }
}

function brokenColumn2(x,y){
  if((y==9) && (x==16) && g_map[x][y]== 1){
    var body = new Cube();
    body.color =[0.5,1,1,1];
    body.textureNum = 2;
    body.matrix.rotate(5,0,0,1);
    body.matrix.scale(.6,6,.6);
    body.matrix.translate(x-16, -0.4, y-16);
    body.render();
  }
  if((y==12) && (x==20) && g_map[x][y]== 1){
    var body = new Cube();
    body.color =[0.5,1,1,1];
    body.textureNum = 2;
    body.matrix.rotate(-5,0,0,1);
    body.matrix.scale(.6,9,.6);
    body.matrix.translate(x-16, -0.4, y-16);
    body.render();
  }
  if((y==16) && (x==3) && g_map[x][y]== 1){
    var body = new Cube();
    body.color =[0.5,1,1,1];
    body.textureNum = 2;
    body.matrix.rotate(-5,0,0,1);
    body.matrix.translate(1, 0, 0);
    body.matrix.scale(.6,2,.6);
    body.matrix.translate(x-16, -0.6, y-16);
    body.render();
  }
}

function buildBrokenWall1(x,y,scale){
  if ((x==0) && g_map[x][y]== 1){
    if (y % 12 == 0 && y !== 0) { 
      scale = scale + 0.7; // Reset scale at every multiple of 8 (except y = 0)
    }
    var body = new Cube();
    body.color =[1,1,1,1];
    body.textureNum = -2;
    //body.matrix.translate(1,0,1);
    body.matrix.scale(.5,scale,.5);
    let adjustedY = ((scale - initialScale) * 0.4 *0.4)-0.1;
    body.matrix.translate(x-16, adjustedY, y-16);
    if ((y % 11 == 0 ||y % 10 == 0) && y !== 0){
      scale = scale + 0.5;
    }else{
      scale = Math.max(0.5, scale - 0.4);
    }
    body.render();
  }
  return scale;
}


function buildBrokenWall2(x,y,scale){
  if ((x==31) && g_map[x][y]== 1){
    if (y == 6) { 
      scale = scale + 0.4; // Reset scale at every multiple of 8 (except y = 0)
    }
    else if (y > 18){scale = 0;}
    var body = new Cube();
    body.color =[1,1,1,1];
    body.textureNum = -2;
    body.matrix.scale(.5,scale,.5);
    let adjustedY = ((scale - initialScale) * 0.4 *0.4)-0.1;
    body.matrix.translate(x-16, adjustedY, y-16);
    if ((y == 5 ||y == 4)){
      scale = scale + 0.1;
    }else{
      scale = Math.max(0.5, scale - 0.3);
    }
    body.render();
  }
  return scale;
}

function roof(x,y){
  var body = new Cube();
  if ((y==0) && g_map[x][y]== 1){
    if (x < 3){
    body.color =[1,1,1,1];
    body.textureNum = -2;
    body.matrix.rotate(90,1,0,0);
    body.matrix.scale(.42,6,.4);
    body.matrix.translate(x-18, -1.2, y-20);
    body.render();
    } else if (x < 6){
      body.color =[1,1,1,1];
      body.textureNum = -2;
      body.matrix.rotate(90,1,0,0);
      body.matrix.scale(.42,5,.4);
      body.matrix.translate(x-18, -1.5, y-20);
      body.render();
    } else if (x < 9){
      body.color =[1,1,1,1];
      body.textureNum = -2;
      body.matrix.rotate(90,1,0,0);
      body.matrix.scale(.42,4,.4);
      body.matrix.translate(x-18, -1.8, y-20);
      body.render();
    } else if (x < 12){
      body.color =[1,1,1,1];
      body.textureNum = -2;
      body.matrix.rotate(90,1,0,0);
      body.matrix.scale(.42,3,.4);
      body.matrix.translate(x-18, -2.3, y-20);
      body.render();
    } else if (x < 15){
      body.color =[1,1,1,1];
      body.textureNum = -2;
      body.matrix.rotate(90,1,0,0);
      body.matrix.scale(.42,2,.4);
      body.matrix.translate(x-18, -3.5, y-20);
      body.render();
    } else {
      body.color =[1,1,1,1];
      body.textureNum = -2;
      body.matrix.rotate(90,1,0,0);
      body.matrix.scale(.42,1,.4);
      body.matrix.translate(x-18, -7, y-20);
      body.render();
    }
  }
}

function buildColumn1(x,y){
  if((x!=0 && x!=31) && (y==1) && g_map[x][y]== 1){
    var body = new Cube();
    body.color =[0.5,1,1,1];
    body.textureNum = 2;
    if (x==1){
      body.matrix.translate(6,0,6);
    }
    else {
      body.matrix.translate(-6,0,6);
    }
    body.matrix.scale(.9,10,.9);
    body.matrix.translate(x-16, -0.1, y-16);
    body.render();
  }
}

function buildColumn2(x,y){
  if((x!=0 && x!=31) && (y==30) && g_map[x][y]== 1){
    var angle = 10;
    var body = new Cube();
    body.color =[0.5,1,1,1];
    body.textureNum = 2;
    body.matrix.rotate(angle,0,0,1);
    if (x==1){
      body.matrix.translate(6,0,-6);
    }
    else {
      body.matrix.translate(-6,0,-6);
    }

    body.matrix.scale(.9,10,.9);
    body.matrix.translate(x-16, -0.2, y-16);
    body.render();
  }
}

function brokenColumn1(x,y){
  if((y!=0 && y!=31) && (x==14) && g_map[x][y]== 1){
    var body = new Cube();
    body.color =[0.5,1,1,1];
    body.textureNum = 2;
    body.matrix.rotate(25,0,0,1);
    body.matrix.scale(.6,2,.6);
    body.matrix.translate(x-16, -0.4, y-16);
    body.render();
  }
}


function stairs(x,y,step,depth){
  if ((x==10) && g_map[x][y]== 1){
    var body = new Cube();
    body.color =[.7,0.7,0.7,1];
    body.textureNum = -2;

    var rail = new Cube();
    rail.color = [.7,0.7,0.7,1];
    rail.textureNum = -2;
    if (y > 4 && y < 13){
      body.matrix.translate(1,0,5);
      body.matrix.scale(3,.5, 1);
      body.matrix.translate(x-12, step, y-16-depth);
      body.render();

      rail.matrix.set(body.matrix);
      rail.matrix.translate(0.01, 0.9, 0.9);
      rail.matrix.scale(0.03, 3, 0.1);
      rail.render();

      var rail2 = new Cube();
      rail2.color = [.7,0.7,0.7,1];
      rail2.textureNum = -2;
      rail2.matrix.set(body.matrix);
      rail2.matrix.translate(0.9, 0.9, 0.9);
      rail2.matrix.scale(.03, 3, .1);
      rail2.render();

    }
    else if (y == 13){
      body.matrix.translate(1,0,5);
      body.matrix.scale(2,.5, 1);
      body.matrix.translate(x-12.5, step, y-16-depth);
      body.render();

      rail.matrix.set(body.matrix);
      rail.matrix.translate(0.9, 0.9, 0.9);
      rail.matrix.scale(0.05, 3, 0.08);
      rail.render();
    }
    else if (y == 14){
      body.matrix.translate(1,0,5);
      body.matrix.scale(1.5,.5, 1);
      body.matrix.translate(x-13, step, y-16-depth);
      body.render();

      rail.matrix.set(body.matrix);
      rail.matrix.translate(0.9, 0.9, 0.9);
      rail.matrix.scale(0.05, 3, 0.08);
      rail.render();
    }
    else {
      body.matrix.translate(1,0,5);
      body.matrix.scale(1,.5, 1);
      body.matrix.translate(x-14, step, y-16-depth);
      body.render();

      rail.matrix.set(body.matrix);
      rail.matrix.translate(0.9, 0.9, 0.9);
      rail.matrix.scale(0.1, 3, 0.08);
      rail.render();
    }

    step -= 1;
    depth += 0.5;
  }
  return {step,depth};
}


function canMoveTo(newX, newZ) {
  let gridX = Math.floor((newX + 8) * 2);  // Scale down world position
  let gridZ = Math.floor((newZ + 8) * 2);
  console.log("Actual Position: ", gridX, gridZ); 
  
  let size = 32;

  // Prevent out-of-bounds access
  if (gridX < 0 || gridX >= size || gridZ < 0 || gridZ >= size) {
      return false;  // Out of bounds
  }

  return g_map[gridX][gridZ] === 0 //|| g_map[gridX][gridZ] === 1;
  // Only allow movement if it's an empty space
}


function forward(){
  var at = new Vector3(g_at.elements);
  var eye = new Vector3(g_eye.elements);
  var d = at.sub(eye);
  d.normalize();
  d.mul(0.2)
  let newX = g_eye.elements[0] + d.elements[0];
  let newZ = g_eye.elements[2] + d.elements[2];
  if (canMoveTo(newX, newZ)) { 
    g_at.add(d);
    g_eye.add(d);
  }  
}

function backward(){
  var at = new Vector3(g_at.elements);
  var eye = new Vector3(g_eye.elements);
  var d = at.sub(eye);
  d.normalize();
  d.mul(0.2);

  let newX = g_eye.elements[0] - d.elements[0];
  let newZ = g_eye.elements[2] - d.elements[2];

  if (canMoveTo(newX, newZ)) {  
    g_at.sub(d);
    g_eye.sub(d);
  }
}

function left(){
  var at = new Vector3(g_at.elements);
  var eye = new Vector3(g_eye.elements);
  var d = at.sub(eye);
  var left = Vector3.cross(g_up, d);
  left.normalize();
  left.mul(0.2);
  let newX = g_eye.elements[0] + left.elements[0];
  let newZ = g_eye.elements[2] + left.elements[2];
  if (canMoveTo(newX, newZ)) {  
    g_at.add(left);
    g_eye.add(left);
  }
}

function right(){
  var at = new Vector3(g_at.elements);
  var eye = new Vector3(g_eye.elements);
  var d = at.sub(eye);
  var right = Vector3.cross(d, g_up);
  right.normalize();
  right.mul(0.2);
  let newX = g_eye.elements[0] + right.elements[0];
  let newZ = g_eye.elements[2] + right.elements[2];
  if (canMoveTo(newX, newZ)) { 
    g_at.add(right);
    g_eye.add(right);
  }
}

function rotateLeft(){
  var at = new Vector3(g_at.elements);
  var eye = new Vector3(g_eye.elements);
  var d = at.sub(eye);
  d.normalize();
  var rotation = new Matrix4();
  rotation.setRotate(-15, g_up.elements[0], g_up.elements[1], g_up.elements[2]);
  d = rotation.multiplyVector3(d);
  d.mul(0.1);
  g_at = eye.add(d);
}

function rotateRight(){
  var at = new Vector3(g_at.elements);
  var eye = new Vector3(g_eye.elements);
  var d = at.sub(eye);
  d.normalize();
  var rotation = new Matrix4();
  rotation.setRotate(15, g_up.elements[0], g_up.elements[1], g_up.elements[2]);
  d = rotation.multiplyVector3(d);
  d.mul(0.1);
  g_at = eye.add(d);
}


function renderAllShapes(){

  var startTime = performance.now();

  var projMat = new Matrix4();
  projMat.setPerspective(70, 1*canvas.width/canvas.height, .2, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  var viewMat = new Matrix4();
  viewMat.setLookAt(
    g_eye.elements[0], g_eye.elements[1], g_eye.elements[2],
    g_at.elements[0], g_at.elements[1], g_at.elements[2],
    g_up.elements[0], g_up.elements[1], g_up.elements[2]
    // g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2],
    // g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2],
    // g_camera.up.elements[0], g_camera.up.elements[1], g_camera.up.elements[2]
  );
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  var globalRotMat = new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //renderCubesFromMap();
  drawMap();
  renderCubes();

  var floor = new Cube();
  floor.color = [0.0,0.0,0.5,1.0];
  floor.textureNum = 3;
  floor.matrix.translate(0,-.75,0.0);
  floor.matrix.scale(16,0,16);
  floor.matrix.translate(-.5,0,-0.5);
  floor.render();

  var backWall = new Cube();
  backWall.color = [1,1,1,1.0];
  backWall.textureNum = 1;
  backWall.matrix.translate(0,-.75,-1);
  backWall.matrix.rotate(90,1,0,0);
  backWall.matrix.rotate(180,1,0,0);
  backWall.matrix.rotate(180,0,1,0);
  backWall.matrix.scale(14,0.5,9);
  backWall.matrix.translate(-0.51, 14,-1);
  backWall.render();

  var frontWall = new Cube();
  frontWall.color = [1,1,1,1.0];
  frontWall.textureNum = 4;
  frontWall.matrix.translate(0,-.75,1);
  frontWall.matrix.rotate(90,1,0,0);
  frontWall.matrix.rotate(180,1,0,0);
  //frontWall.matrix.rotate(180,0,1,0);
  frontWall.matrix.scale(16,0.5,11);
  frontWall.matrix.translate(-0.51, -14, 0);
  frontWall.render();

  var railing = new Cube();
  railing.color = [.7,.7,.7,1.0];
  railing.textureNum = -2;
  railing.matrix.translate(0,1.45,-.1);
  railing.matrix.rotate(-45,1,0,0);
  railing.matrix.scale(0.1,7.6,0.1);
  railing.matrix.translate(-21.5,0,0);
  railing.render();

  var railing2 = new Cube();
  railing2.color = [.7,.7,.7,1.0];
  railing2.textureNum = -2;
  railing2.matrix.translate(0,1.45,-.1);
  railing2.matrix.rotate(-45,1,0,0);
  railing2.matrix.scale(0.1,5.5,0.1);
  railing2.matrix.translate(-50,0.45,0);
  railing2.render();

  var water = new Cube();
  water.color =[1,1,1,1];
  water.textureNum = -1;
  water.matrix.scale(14,.8,1);
  water.matrix.translate(-.5, -1, 6);
  water.render();

  var water = new Cube();
  water.color =[1,1,1,1];
  water.textureNum = -1;
  water.matrix.scale(14,.5,1);
  water.matrix.translate(-.5, -1.5, 5);
  water.render();

  var water = new Cube();
  water.color =[1,1,1,1];
  water.textureNum = -1;
  water.matrix.scale(14,.2,1);
  water.matrix.translate(-.5, -3.5, 4);
  water.render();

  var water = new Cube();
  water.color =[1,1,1,1];
  water.textureNum = -1;
  water.matrix.scale(14,.1,1);
  water.matrix.translate(-.5, -7, 3);
  water.render();

  var water = new Cube();
  water.color =[1,1,1,1];
  water.textureNum = -1;
  water.matrix.scale(14,.05,1);
  water.matrix.translate(-.5, -14, 2);
  water.render();

  var statue = new Cube();
  statue.color = [1,1,1,1];
  statue.textureNum = -2;
  
  statue.matrix.scale(1.5,.5,1.5);
  statue.matrix.translate(2,-1.5,-0.6);
  statue.matrix.rotate(45,0,1,0);
  statue.render();

  var leg1 = new Cube();
  leg1.color = [1, 1, 1, 1];
  leg1.textureNum = -2;
  leg1.matrix.translate(2.75,0,-0.75);
  leg1.matrix.scale(0.25, 1.5, 0.25);  // Smaller scale
  leg1.matrix.translate(4, -0.25, -1);  // Adjust Y position to stack on top
  leg1.render();

  var leg2 = new Cube();
  leg2.color = [1, 1, 1, 1];
  leg2.textureNum = -2;
  leg2.matrix.translate(3.15,0,-0.75);
  leg2.matrix.scale(0.25, 1.5, 0.25);  // Smaller scale
  leg2.matrix.translate(4, -0.25, -1);  // Adjust Y position to stack on top
  leg2.render();

  var body = new Cube();
  body.color = [1,1,1,1];
  body.textureNum = -2;
  body.textureNum = -2;
  body.matrix.translate(1,0.25,-0.75);
  body.matrix.scale(0.75, 0.85, 0.5);  // Smaller scale
  body.matrix.translate(3.6, 0.5, -0.75);  // Adjust Y position to stack on top
  body.render();

  var neck = new Cube();
  neck.color = [1,1,1,1];
  neck.textureNum = -2;
  neck.textureNum = -2;
  neck.matrix.translate(3,1.35,-0.75);
  neck.matrix.scale(0.25, 0.25, 0.25);  // Smaller scale
  neck.matrix.translate(3.75, 0.5, -0.75);  // Adjust Y position to stack on top
  neck.render();

  var head = new Cube();
  head.color = [1,1,1,1];
  head.textureNum = -2;
  head.textureNum = -2;
  head.matrix.translate(2.85,1.65,-0.75);
  head.matrix.scale(0.35, 0.5, 0.35);  // Smaller scale
  head.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  head.render();

  var shoulder1 = new Cube();
  shoulder1.color = [1,1,1,1];
  shoulder1.textureNum = -2;
  shoulder1.textureNum = -2;
  shoulder1.matrix.translate(2.95,1.25,-.85);
  shoulder1.matrix.scale(0.2, 0.15, 0.15);  // Smaller scale
  shoulder1.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  shoulder1.render();

  var shoulder2 = new Cube();
  shoulder2.color = [1,1,1,1];
  shoulder2.textureNum = -2;
  shoulder2.textureNum = -2;
  shoulder2.matrix.translate(3.8,1.25,-.85);
  shoulder2.matrix.scale(0.2, 0.15, 0.15);  // Smaller scale
  shoulder2.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  shoulder2.render();


  var arm1 = new Cube();
  arm1.color = [1,1,1,1];
  arm1.textureNum = -2;
  arm1.matrix.translate(2.95,1.25,-.85);
  arm1.matrix.scale(0.15, 0.5, 0.15);  // Smaller scale
  arm1.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  arm1.render();

  var arm2 = new Cube();
  arm2.color = [1,1,1,1];
  arm2.textureNum = -2;
  arm2.matrix.translate(4.15,0.9,-.85);
  arm2.matrix.scale(0.15, 0.5, 0.15);  // Smaller scale
  arm2.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  arm2.render();

  var nose = new Cube();
  nose.color = [0.8,.8,.8,1];
  nose.textureNum = -2;
  nose.matrix.translate(3.72,1.75,-.6);
  nose.matrix.scale(0.1, 0.15, 0.1);  // Smaller scale
  nose.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  nose.render();

  var horn1 = new Cube();
  horn1.color = [0.8,.8,.8,1];
  horn1.textureNum = -2;
  horn1.matrix.translate(3.3,2,-.75);
  horn1.matrix.scale(0.15, 0.1, 0.1);  // Smaller scale
  horn1.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  horn1.render();

  var horn2 = new Cube();
  horn2.color = [0.8,.8,.8,1];
  horn2.textureNum = -2;
  horn2.matrix.translate(3.8,2,-.75);
  horn2.matrix.scale(0.15, 0.1, 0.1);  // Smaller scale
  horn2.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  horn2.render();

  var horn1 = new Cube();
  horn1.color = [0.8,.8,.8,1];
  horn1.textureNum = -2;
  horn1.matrix.translate(3.6,2,-.75);
  horn1.matrix.scale(0.05, 0.2, 0.1);  // Smaller scale
  horn1.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  horn1.render();

  var horn2 = new Cube();
  horn2.color = [0.8,.8,.8,1];
  horn2.textureNum = -2;
  horn2.matrix.translate(4.2,2,-.75);
  horn2.matrix.scale(0.05, 0.2, 0.1);  // Smaller scale
  horn2.matrix.translate(3, 0, -0.75);  // Adjust Y position to stack on top
  horn2.render();


  var sky = new Cube();
  sky.color = [1,0,0,1];
  sky.textureNum = 0;
  sky.matrix.scale(50,50,50);
  sky.matrix.rotate(180,0,1,0);
  sky.matrix.translate(-.5,-.3,-.5);
  sky.render();


  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
}

function sendTextToHTML(text, htmlID){
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm){
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
  
}

function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

