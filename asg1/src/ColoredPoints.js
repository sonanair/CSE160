// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    //gl_PointSize = 10.0;
    gl_PointSize = u_Size;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

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

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegment = 10;

function addActionsForHtmlUI(){
  //Button Events (Shape Type)
  //document.getElementById('green').onclick = function() { g_selectedColor = [0.0,1.0,0.0,1.0]; }
  document.getElementById('undo').onclick = function() { undo(); };
  document.getElementById('redo').onclick = function() { redo(); };
  document.getElementById('clearButton').onclick = function() { g_shapesList = []; renderAllShapes(); };

  document.getElementById('pointButton').onclick = function() {g_selectedType = POINT; };
  document.getElementById('triButton').onclick = function() {g_selectedType = TRIANGLE};
  document.getElementById('circleButton').onclick = function() {g_selectedType = CIRCLE};


  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSegment = this.value; });

  document.getElementById('crabButton').onclick = function() { paintCrab(); };
}


function main() {
  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];
var redoStack = [];

function undo() {
  if (g_shapesList.length > 0) {
    const lastShape = g_shapesList.pop(); // Remove the last shape
    redoStack.push(lastShape); // Save it in redoStack
    renderAllShapes();
  }
}

function redo() {
  if (redoStack.length > 0) {
    const shapeToRedo = redoStack.pop(); // Get the last undone shape
    g_shapesList.push(shapeToRedo); // Restore it to the shapes list
    renderAllShapes();
  }
}

function click(ev) {
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType==POINT){
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else{
    point = new Circle();
    point.segments = g_selectedSegment;
  }

  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  g_shapesList.push(point);
  // Store the coordinates to g_points array
  // g_points.push([x, y]);
  // // Store the coordinates to g_colors array
  // //g_colors.push(g_selectedColor);
  // g_colors.push(g_selectedColor.slice());
  // Store the coordinates to g_sizes array
  // g_sizes.push(g_selectedSize);
  // if (x >= 0.0 && y >= 0.0) {      // First quadrant
  //   g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  // } else if (x < 0.0 && y < 0.0) { // Third quadrant
  //   g_colors.push([0.0, 1.0, 0.0, 1.0]);  // Green
  // } else {                         // Others
  //   g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  // }

  renderAllShapes();
}

function renderAllShapes(){

  var startTime = performance.now();
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // var len = g_points.length;
  var len = g_shapesList.length;
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");
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


function uniqueTriangle(vertices, color) {
  // Bind vertex data
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  // Set the vertex attribute
  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  // Set the color
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);

  // Draw the triangle
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}

const red = [1.0, 0.0, 0.0, 1.0];
const black = [0.0, 0.0, 0.0, 1.0];
const white = [1.0, 1.0, 1.0, 1.0];
const orange = [1.0, 0.3, 0.0, 1.0];

function paintCrab(){
  gl.clear(gl.COLOR_BUFFER_BIT);
  uniqueTriangle([0.15, -0.2, 0.2, -0.15, 0.25, -0.3], orange);
  uniqueTriangle([0.2, -0.15, 0.25, -0.3, 0.3, -0.25], orange);
  uniqueTriangle([0.3, -0.25, 0.3, -0.3, 0.25, -0.3], orange);
  uniqueTriangle([0.25, -0.3, 0.3, -0.3, 0.25, -0.4], orange);
  uniqueTriangle([0.3, -0.3, 0.3, -0.4, 0.25, -0.4], orange);
  uniqueTriangle([0.25, -0.4, 0.3, -0.4, 0.2, -0.5], orange);

  uniqueTriangle([-0.15, -0.2, -0.2, -0.15, -0.25, -0.3], orange);
  uniqueTriangle([-0.2, -0.15, -0.25, -0.3, -0.3, -0.25], orange);
  uniqueTriangle([-0.3, -0.25, -0.3, -0.3, -0.25, -0.3], orange);
  uniqueTriangle([-0.25, -0.3, -0.3, -0.3, -0.25, -0.4], orange);
  uniqueTriangle([-0.3, -0.3, -0.3, -0.4, -0.25, -0.4], orange);
  uniqueTriangle([-0.25, -0.4, -0.3, -0.4, -0.2, -0.5], orange);

  uniqueTriangle([0.2, -0.1, 0.25, -0.05, 0.4, -0.2], orange);
  uniqueTriangle([0.4, -0.2, 0.25, -0.05, 0.45, -0.15], orange);
  uniqueTriangle([0.4, -0.2, 0.45, -0.15, 0.45, -0.2], orange);
  uniqueTriangle([0.45, -0.15, 0.45, -0.2, 0.55, -0.2], orange);
  uniqueTriangle([0.45, -0.15, 0.55, -0.2, 0.55, -0.15], orange);
  uniqueTriangle([0.55, -0.15, 0.55, -0.2, 0.65, -0.1], orange);

  uniqueTriangle([-0.2, -0.1, -0.25, -0.05, -0.4, -0.2], orange);
  uniqueTriangle([-0.4, -0.2, -0.25, -0.05, -0.45, -0.15], orange);
  uniqueTriangle([-0.4, -0.2, -0.45, -0.15, -0.45, -0.2], orange);
  uniqueTriangle([-0.45, -0.15, -0.45, -0.2, -0.55, -0.2], orange);
  uniqueTriangle([-0.45, -0.15, -0.55, -0.2, -0.55, -0.15], orange);
  uniqueTriangle([-0.55, -0.15, -0.55, -0.2, -0.65, -0.1], orange);

  uniqueTriangle([0.35, 0, 0.3, -0.05, 0.35, -0.05], orange);
  uniqueTriangle([0.35, 0, 0.35, -0.05, 0.45, -0.05], orange);
  uniqueTriangle([0.35, 0, 0.45, -0.05, 0.55, 0], orange);
  uniqueTriangle([0.45, 0, 0.55, 0, 0.55, 0.05], orange);
  uniqueTriangle([0.55, 0, 0.55, 0.05, 0.6, 0.05], orange);
  uniqueTriangle([0.55, 0.05, 0.6, 0.05, 0.6, 0.15], orange);

  uniqueTriangle([-0.35, 0, -0.3, -0.05, -0.35, -0.05], orange);
  uniqueTriangle([-0.35, 0, -0.35, -0.05, -0.45, -0.05], orange);
  uniqueTriangle([-0.35, 0, -0.45, -0.05, -0.55, 0], orange);
  uniqueTriangle([-0.45, 0, -0.55, 0, -0.55, 0.05], orange);
  uniqueTriangle([-0.55, 0, -0.55, 0.05, -0.6, 0.05], orange);
  uniqueTriangle([-0.55, 0.05, -0.6, 0.05, -0.6, 0.15], orange);

  uniqueTriangle([0.25, 0, 0.2, 0.1, 0.35, 0.1], orange);
  uniqueTriangle([0.2, 0.1, 0.35, 0.1, 0.3, 0.2], orange);
  uniqueTriangle([0.3, 0.2, 0.35, 0.1, 0.4, 0.2], orange);
  uniqueTriangle([0.3, 0.2, 0.4, 0.2, 0.4, 0.25], orange);
  uniqueTriangle([0.3, 0.2, 0.4, 0.25, 0.35, 0.4], orange);
  uniqueTriangle([0.3, 0.2, 0.35, 0.4, 0.25, 0.3], orange);
  uniqueTriangle([0.25, 0.3, 0.35, 0.4, 0.25, 0.5], orange);
  uniqueTriangle([0.25, 0.5, 0.25, 0.4, 0.1, 0.55], orange);
  uniqueTriangle([0.25, 0.4, 0.25, 0.3, 0.1, 0.4], orange);
  uniqueTriangle([0.1, 0.4, 0.15, 0.4, 0.05, 0.5], orange);
  
  uniqueTriangle([-0.25, 0, -0.2, 0.1, -0.35, 0.1], orange);
  uniqueTriangle([-0.2, 0.1, -0.35, 0.1, -0.3, 0.2], orange);
  uniqueTriangle([-0.3, 0.2, -0.35, 0.1, -0.4, 0.2], orange);
  uniqueTriangle([-0.3, 0.2, -0.4, 0.2, -0.4, 0.25], orange);
  uniqueTriangle([-0.3, 0.2, -0.4, 0.25, -0.35, 0.4], orange);
  uniqueTriangle([-0.3, 0.2, -0.35, 0.4, -0.25, 0.3], orange);
  uniqueTriangle([-0.25, 0.3, -0.35, 0.4, -0.25, 0.5], orange);
  uniqueTriangle([-0.25, 0.5, -0.25, 0.4, -0.1, 0.55], orange);
  uniqueTriangle([-0.25, 0.4, -0.25, 0.3, -0.1, 0.4], orange);
  uniqueTriangle([-0.1, 0.4, -0.15, 0.4, -0.05, 0.5], orange);

  uniqueTriangle([0, 0, 0.35, 0, 0.2, 0.2], red);
  uniqueTriangle([0, 0, 0.2, 0.2, 0, 0.25], red);
  uniqueTriangle([0, 0, 0, 0.25, -0.2, 0.2], red);
  uniqueTriangle([0, 0, -0.2, 0.2,-0.35, 0], red);
  uniqueTriangle([0, 0, -0.35, 0, -0.15, -0.2], red);
  uniqueTriangle([0, 0, -0.15, -0.2, 0.15, -0.2], red);
  uniqueTriangle([0, 0, 0.15, -0.2, 0.35, 0], red)
  
  uniqueTriangle([0.1, 0.2, 0.05, 0.2, 0.1, 0.25], red);
  uniqueTriangle([0.05, 0.2, 0.05, 0.25, 0.1, 0.25], red);
  uniqueTriangle([0.05, 0.25, 0.05, 0.3, 0.1, 0.3], white);
  uniqueTriangle([0.05, 0.25, 0.1, 0.25, 0.1, 0.3], white);

  uniqueTriangle([0.06, 0.26, 0.06, 0.29, 0.09, 0.29], black);
  uniqueTriangle([0.06, 0.26, 0.09, 0.26, 0.09, 0.29], black);

  uniqueTriangle([-0.1, 0.2, -0.05, 0.2, -0.1, 0.25], red);
  uniqueTriangle([-0.05, 0.2, -0.05, 0.25, -0.1, 0.25], red);
  uniqueTriangle([-0.05, 0.25, -0.05, 0.3, -0.1, 0.3], white);
  uniqueTriangle([-0.05, 0.25, -0.1, 0.25, -0.1, 0.3], white);

  uniqueTriangle([-0.06, 0.26, -0.06, 0.29, -0.09, 0.29], black);
  uniqueTriangle([-0.06, 0.26, -0.09, 0.26, -0.09, 0.29], black);


} 
