// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
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
let u_ModelMatrix;

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

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

//Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//Globals related to UI elements
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_globalAngle = 0;
let g_brownAngle = 0;
let g_greenAngle = 0;
let g_yellowAngle = 0;
let g_redAngle = 0;
let g_whiteAngle = 0;
let brown_r = 0;
let green_r = 0;
let red_r = 0;
let yellow_r = 0;
let white_r = 0;
let twist = 0;
let head = 0;
let g_brownAnimation = false;
let isVineBent = false;
let vineBendProgress = 0;

let g_globalAngleX = 0; // Rotation around X-axis (up/down)
let g_globalAngleY = 0; // Rotation around Y-axis (left/right)
let mouseDown = false;
let lastMouseX = 0;
let lastMouseY = 0;


function addActionsForHtmlUI(){
  //Button Events (Shape Type)
  document.getElementById('animationBrownOnButton').onclick = function() { g_brownAnimation = true; };
  document.getElementById('animationBrownOffButton').onclick = function() { g_brownAnimation = false; };

  document.getElementById('shoulderSlide').addEventListener('mousemove', function() { g_brownAngle = this.value; renderAllShapes(); });
  document.getElementById('elbowSlide').addEventListener('mousemove', function() { g_greenAngle = this.value; renderAllShapes(); });
  document.getElementById('wristSlide').addEventListener('mousemove', function() { g_redAngle = this.value; renderAllShapes(); });
  
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });

}


function main() {
  setupWebGL();
  connectVariableToGLSL();
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  canvas.addEventListener("click", function(event) {
    if (event.shiftKey) {
      isVineBent = !isVineBent;
    }
  });

  canvas.onmousedown = function(event) { 
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  };

  canvas.onmousemove = function(event) { 
    if (mouseDown) {
      let deltaX = event.clientX - lastMouseX;
      let deltaY = event.clientY - lastMouseY;

      g_globalAngleY += deltaX * 0.5; // Rotate left/right
      g_globalAngleX += deltaY * 0.5; // Rotate up/down

      lastMouseX = event.clientX;
      lastMouseY = event.clientY;

      renderAllShapes();
    }
  };

  canvas.onmouseup = function() { 
    mouseDown = false; 
  };

  canvas.onmouseleave = function() { 
    mouseDown = false; 
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);

  //renderAllShapes();
  requestAnimationFrame(tick);
}

var g_startTime = performance.now()/1000.0;
var g_seconds = performance.now()/1000.0 - g_startTime;

function tick(){
  g_seconds = performance.now()/1000.0 - g_startTime;
  updateAnimationAngles();
  renderAllShapes();
  requestAnimationFrame(tick);
}

var g_shapesList = [];

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
  renderAllShapes();
}

function updateAnimationAngles(){
  if (g_brownAnimation){
    g_brownAngle = (25*Math.sin(g_seconds));
    g_whiteAngle = (35*Math.cos(g_seconds));
    brown_r = (-25*Math.sin(g_seconds));
    white_r = (-35*Math.cos(g_seconds));
    twist = (25*Math.sin(g_seconds));
    head = (5*Math.sin(1.5*g_seconds));
    g_greenAngle = (25*Math.cos(g_seconds));
    green_r = (-25*Math.cos(g_seconds));
    g_redAngle = (35*Math.sin(1.25*g_seconds));
    red_r = (-35*Math.sin(1.25*g_seconds));
    g_yellowAngle = (45*Math.sin(1.25*g_seconds));
    yellow_r = (-45*Math.sin(1.25*g_seconds));
  }
}

function renderAllShapes(){

  var startTime = performance.now();

  var mouseRotMat = new Matrix4()
    .rotate(g_globalAngleY, 0, 1, 0)  // Left/Right rotation
    .rotate(g_globalAngleX, 1, 0, 0); // Up/Down rotation

  // Create the slider-based rotation matrix
  var sliderRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0); // Left/Right rotation from slider

  // Combine both rotations by multiplying them together
  var combinedRotMat = new Matrix4().multiply(mouseRotMat).multiply(sliderRotMat);

  // Pass the combined rotation matrix to the shader
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, combinedRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // var body = new Cube();
  // body.color = [1.0,0.0,0.0,1.0];
  // body.matrix.setTranslate(-.25,-0.75,0);
  // body.matrix.rotate(-5,1,0,0);
  // body.matrix.scale(0.5,.3,0.5);
  // body.render();

  // var yellow = new Cube();
  // yellow.color = [1,1,0,1];
  // yellow.matrix.setTranslate(0,-0.5,0.0);
  // yellow.matrix.rotate(-5,1,0,0);
  // yellow.matrix.rotate(-g_yellowAngle,0,0,1);
  // var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  // yellow.matrix.scale(0.25,.7,0.5);
  // yellow.matrix.translate(-.5,0,0);
  // yellow.render();

  // var box = new Cube();
  // box.color = [1,0,1,1];
  // box.matrix = yellowCoordinatesMat;
  // box.matrix.translate(0,0.65,0);
  // box.matrix.rotate(-g_magentaAngle,0,0,1);
  // box.matrix.scale(.3,.3,.3);
  // box.matrix.translate(-.5,0,-0.001);
  // box.render();

  var sphere = new Sphere();
  sphere.color = [1,0.5,0,1];
  sphere.matrix.translate(0,0.5,0);
  sphere.matrix.rotate(-5,1,0,0);
  sphere.matrix.rotate(head,0,1,0);
  var sphereCoordinatesMat=new Matrix4(sphere.matrix);
  sphere.matrix.scale(.4,.3,.4);
  sphere.render();

  var eye = new Sphere();
  eye.color = [1,1,0.5,1];
  eye.matrix = sphereCoordinatesMat;
  eye.matrix.translate(-0.1,0,-.3);
  eye.matrix.rotate(0,90,0,1);
  var blackCoordinatesMat = new Matrix4(eye.matrix);
  eye.matrix.scale(0.15,0.1,.1);
  eye.render();

  var eyes = new Sphere();
  eyes.color = [1,1,0.5,1];
  eyes.matrix = sphereCoordinatesMat;
  eyes.matrix.translate(1.5,0,0);
  eyes.matrix.scale(1,1,1);
  //eyes.matrix.scale(0.15,0.1,.1);
  eyes.render();

  var mouth = new Sphere();
  mouth.color = [1,1,0.5,1];
  mouth.matrix = sphereCoordinatesMat;
  mouth.matrix.translate(-0.8,-1.2,0.15);
  mouth.matrix.scale(1.3,0.8,1);
  mouth.render();

  var black = new Sphere();
  black.color = [0,0,0,1];
  black.matrix = blackCoordinatesMat;
  black.matrix.translate(-0.02,0,0.005);
  black.matrix.rotate(0,90,0,1);
  black.matrix.scale(0.12,0.09,.12);
  black.render();

  var blackeye = new Sphere();
  blackeye.color =[0,0,0,1];
  blackeye.matrix = blackCoordinatesMat;
  blackeye.matrix.translate(2.2,0,0.005);
  // blackeye.matrix.scale(0.12,0.09,.12);
  blackeye.render();

  var smile = new Sphere();
  smile.color = [0,0,0,1];
  smile.matrix = blackCoordinatesMat;
  smile.matrix.translate(-1.15,-1.4,0.3);
  smile.matrix.scale(1.6,0.7,1.2);
  smile.render();

  var twistAngle = -twist;  // Control the twist

  // Create a shared transformation matrix
  var baseMatrix = new Matrix4();
  baseMatrix.setTranslate(0, -0.7, 0);  
  baseMatrix.rotate(twistAngle, 0, 1, 0);  
 
  var upper = new Prism();
  upper.color = [0.27, 0.22, 0.14, 1];
  upper.matrix = new Matrix4(baseMatrix); 
  upper.matrix.scale(0.45, 0.4, 0.24);
  upper.render();

  var lower = new Cube();
  lower.color = [0.27, 0.22, 0.14, 1];
  lower.matrix = new Matrix4(baseMatrix);  
  lower.matrix.translate(-0.135, 0.19, -0.118);
  var lowerMat_l = new Matrix4(lower.matrix);
  var lowerMat_r = new Matrix4(lower.matrix);
  var vine = new Matrix4(lower.matrix);
  var second = new Matrix4(lower.matrix);
  var third = new Matrix4(lower.matrix);
  var fourth = new Matrix4(lower.matrix);
  var fifth = new Matrix4(lower.matrix);
  var sixth = new Matrix4(lower.matrix);
  var seventh = new Matrix4(lower.matrix);
  lower.matrix.scale(0.27, 1, 0.24);
  lower.render();

  var shoulder_l = new Cube();
  shoulder_l.color = [0.27, 0.22, 0.14, 1];
  shoulder_l.matrix = lowerMat_l;
  shoulder_l.matrix.translate(0,0.72,0.05);
  shoulder_l.matrix.rotate(120,0,0,1);
  shoulder_l.matrix.rotate(-g_brownAngle,0,0,1);
  var shoulder_lMat=new Matrix4(shoulder_l.matrix);
  shoulder_l.matrix.scale(0.02,.2,0.1);
  shoulder_l.matrix.translate(-.6,0,0);
  shoulder_l.render();

  var shoulder_r = new Cube();
  shoulder_r.color = [0.27, 0.22, 0.14, 1];
  shoulder_r.matrix = lowerMat_r;
  shoulder_r.matrix.translate(0.27,0.73,0.05);
  shoulder_r.matrix.rotate(235,0,0,1);
  shoulder_r.matrix.rotate(brown_r,0,0,1);
  var shoulder_rMat=new Matrix4(shoulder_r.matrix);
  shoulder_r.matrix.scale(0.02,.2,0.1);
  shoulder_r.matrix.translate(-.6,0,0);
  shoulder_r.render();

  var elbow_l = new Cube();
  elbow_l.color = [0.27, 0.22, 0.14, 1];
  elbow_l.matrix = shoulder_lMat;
  elbow_l.matrix.translate(0,0.2,0);
  elbow_l.matrix.rotate(-g_whiteAngle,0,0,1);
  var elbow_lMat=new Matrix4(elbow_l.matrix);
  elbow_l.matrix.scale(.02,.05,.1);
  elbow_l.matrix.translate(-.5,0,-0.001);
  elbow_l.render();

  var elbow_r = new Cube();
  elbow_r.color = [0.27, 0.22, 0.14, 1];
  elbow_r.matrix = shoulder_rMat;
  elbow_r.matrix.translate(0,0.2,0);
  elbow_r.matrix.rotate(white_r,0,0,1);
  var elbow_rMat=new Matrix4(elbow_r.matrix);
  elbow_r.matrix.scale(.02,.05,.1);
  elbow_r.matrix.translate(-.5,0,-0.001);
  elbow_r.render();

  var forearm_l = new Cube();
  forearm_l.color = [0.27, 0.22, 0.14, 1];
  forearm_l.matrix = elbow_lMat;
  forearm_l.matrix.translate(0,0.05,0);
  forearm_l.matrix.rotate(-g_greenAngle,0,0,1);
  var forearm_lMat=new Matrix4(forearm_l.matrix);
  forearm_l.matrix.scale(.02,.3,.1);
  forearm_l.matrix.translate(-.5,0,-0.001);
  forearm_l.render();

  var forearm_r = new Cube();
  forearm_r.color = [0.27, 0.22, 0.14, 1];
  forearm_r.matrix = elbow_rMat;
  forearm_r.matrix.translate(0,0.05,0);
  forearm_r.matrix.rotate(green_r,0,0,1);
  var forearm_rMat=new Matrix4(forearm_r.matrix);
  forearm_r.matrix.scale(.02,.3,.1);
  forearm_r.matrix.translate(-.5,0,-0.001);
  forearm_r.render();

  var hand_l = new Cube();
  hand_l.color = [0.27, 0.22, 0.14, 1];
  hand_l.matrix = forearm_lMat;
  hand_l.matrix.translate(0,0.3,0);
  hand_l.matrix.rotate(-g_redAngle,0,0,1);
  var hand_lMat=new Matrix4(hand_l.matrix);
  hand_l.matrix.scale(.02,.1,.1);
  hand_l.matrix.translate(-.5,0,-0.001);
  hand_l.render();

  var hand_r = new Cube();
  hand_r.color = [0.27, 0.22, 0.14, 1];
  hand_r.matrix = forearm_rMat;
  hand_r.matrix.translate(0,0.3,0);
  hand_r.matrix.rotate(red_r,0,0,1);
  var hand_rMat=new Matrix4(hand_r.matrix);
  hand_r.matrix.scale(.02,.1,.1);
  hand_r.matrix.translate(-.5,0,-0.001);
  hand_r.render();

  var finger_l = new Cube();
  finger_l.color = [0.27, 0.22, 0.14, 1];
  finger_l.matrix = hand_lMat;
  finger_l.matrix.translate(0,0.1,0);
  finger_l.matrix.rotate(-g_yellowAngle,0,0,1);
  var finger_lMat=new Matrix4(finger_l.matrix);
  finger_l.matrix.scale(.02,.1,.1);
  finger_l.matrix.translate(-.5,0,-0.001);
  finger_l.render();

  var finger_r = new Cube();
  finger_r.color = [0.27, 0.22, 0.14, 1];
  finger_r.matrix = hand_rMat;
  finger_r.matrix.translate(0,0.1,0);
  finger_r.matrix.rotate(yellow_r,0,0,1);
  var finger_rMat=new Matrix4(finger_r.matrix);
  finger_r.matrix.scale(.02,.1,.1);
  finger_r.matrix.translate(-.5,0,-0.001);
  finger_r.render();

  var vine1 = new Cube();
  vine1.color = [0.49,0.57,0.29,1];
  vine1.matrix = vine;
  vine1.matrix.translate(0.07,0.78,-.04);
  vine1.matrix.rotate(180,0,0,1);
  var vinePart = new Matrix4(vine1.matrix);
  vine1.matrix.scale(0.03,1.17,0.03);
  vine1.render();

  var vine2 = new Cube();
  vine2.color = [0.49,0.57,0.29,1];
  vine2.matrix = second;
  vine2.matrix.translate(0.15,0.75,-0.05);
  vine2.matrix.rotate(180,0,0,1);
  vine2.matrix.scale(0.03,1.14,0.03);
  vine2.render();

  var vine3 = new Cube();
  vine3.color = [0.49,0.57,0.29,1];
  vine3.matrix = third;
  vine3.matrix.translate(0.24,0.75,-0.04);
  vine3.matrix.rotate(180,0,0,1);
  vine3.matrix.scale(0.03,1.14,0.03);
  vine3.render();

  if (isVineBent && vineBendProgress < 1) {
    vineBendProgress += 0.01;  // Speed of animation
  } else if (!isVineBent && vineBendProgress > 0) {
      vineBendProgress -= 0.01;
  }

  let fifteen = isVineBent ? 15 * vineBendProgress : 0;
  let twenty = isVineBent ? 20 * vineBendProgress : 0;
  let twentyfive = isVineBent ? 25 * vineBendProgress : 0;
  let thirtyfive = isVineBent ? 35 * vineBendProgress : 0;
  let fortyfive = isVineBent ? 45 * vineBendProgress : 0;

  var vine4 = new Cube();
  vine4.color = [0.49,0.57,0.29,1];
  vine4.matrix = fourth;
  vine4.matrix.translate(0.24,0.78,.24);
  vine4.matrix.rotate(180,0,0,1);
  vine4.matrix.rotate(fifteen,0,0,1);
  var vine4Part = new Matrix4(vine4.matrix);
  vine4.matrix.scale(0.03,0.08,0.03);
  vine4.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vine4Part;
  part1.matrix.translate(0,0.06,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.05,0.03);
  part1.render();

  var part2 = new Cube();
  part2.color = [0.49,0.57,0.29,1];
  part2.matrix = vine4Part;
  part2.matrix.translate(0,0.04,0);
  part2.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part2.matrix);
  part2.matrix.scale(0.03,0.07,0.03);
  part2.render();

  var part3 = new Cube();
  part3.color = [0.49,0.57,0.29,1];
  part3.matrix = vine4Part;
  part3.matrix.translate(0,0.04,0);
  part3.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part3.matrix);
  part3.matrix.scale(0.03,0.07,0.03);
  part3.render();

  var part4 = new Cube();
  part4.color = [0.49,0.57,0.29,1];
  part4.matrix = vine4Part;
  part4.matrix.translate(0,0.04,0);
  part4.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part4.matrix);
  part4.matrix.scale(0.03,0.07,0.03);
  part4.render();

  var part5 = new Cube();
  part5.color = [0.49,0.57,0.29,1];
  part5.matrix = vine4Part;
  part5.matrix.translate(0,0.04,0);
  part5.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part5.matrix);
  part5.matrix.scale(0.03,0.07,0.03);
  part5.render();

  var part6 = new Cube();
  part6.color = [0.49,0.57,0.29,1];
  part6.matrix = vine4Part;
  part6.matrix.translate(0,0.04,0);
  part6.matrix.rotate(fifteen,0,0,1);
  var vine4Part = new Matrix4(part6.matrix);
  part6.matrix.scale(0.03,0.4,0.03);
  part6.render();

  var part7 = new Cube();
  part7.color = [0.49,0.57,0.29,1];
  part7.matrix = vine4Part;
  part7.matrix.translate(0,0.38,0);
  part7.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part7.matrix);
  part7.matrix.scale(0.03,0.07,0.03);
  part7.render();

  var part8 = new Cube();
  part8.color = [0.49,0.57,0.29,1];
  part8.matrix = vine4Part;
  part8.matrix.translate(0,0.05,0);
  part8.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part8.matrix);
  part8.matrix.scale(0.03,0.07,0.03);
  part8.render();

  var part9 = new Cube();
  part9.color = [0.49,0.57,0.29,1];
  part9.matrix = vine4Part;
  part9.matrix.translate(0,0.05,0);
  part9.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part9.matrix);
  part9.matrix.scale(0.03,0.07,0.03);
  part9.render();

  var part10 = new Cube();
  part10.color = [0.49,0.57,0.29,1];
  part10.matrix = vine4Part;
  part10.matrix.translate(0,0.05,0);
  part10.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part10.matrix);
  part10.matrix.scale(0.03,0.07,0.03);
  part10.render();

  var part11 = new Cube();
  part11.color = [0.49,0.57,0.29,1];
  part11.matrix = vine4Part;
  part11.matrix.translate(0,0.05,0);
  part11.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part11.matrix);
  part11.matrix.scale(0.03,0.07,0.03);
  part11.render();

  var part12 = new Cube();
  part12.color = [0.49,0.57,0.29,1];
  part12.matrix = vine4Part;
  part12.matrix.translate(0,0.05,0);
  part12.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part12.matrix);
  part12.matrix.scale(0.03,0.07,0.03);
  part12.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(-thirtyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(-thirtyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(-thirtyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(-fortyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var vine5 = new Cube();
  vine5.color = [0.49,0.57,0.29,1];
  vine5.matrix = fifth;
  vine5.matrix.translate(0.07,0.78,.24);
  vine5.matrix.rotate(180,0,0,1);
  vine5.matrix.rotate(-fifteen,0,0,1);
  var vine5Part = new Matrix4(vine5.matrix);
  vine5.matrix.scale(0.03,0.08,0.03);
  vine5.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vine5Part;
  part1.matrix.translate(0,0.08,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.05,0.03);
  part1.render();

  var part2 = new Cube();
  part2.color = [0.49,0.57,0.29,1];
  part2.matrix = vine4Part;
  part2.matrix.translate(0,0.04,0);
  part2.matrix.rotate(-fifteen,0,0,1);
  var vine4Part = new Matrix4(part2.matrix);
  part2.matrix.scale(0.03,0.07,0.03);
  part2.render();

  var part3 = new Cube();
  part3.color = [0.49,0.57,0.29,1];
  part3.matrix = vine4Part;
  part3.matrix.translate(0,0.04,0);
  part3.matrix.rotate(-twenty,0,0,1);
  var vine4Part = new Matrix4(part3.matrix);
  part3.matrix.scale(0.03,0.07,0.03);
  part3.render();

  var part4 = new Cube();
  part4.color = [0.49,0.57,0.29,1];
  part4.matrix = vine4Part;
  part4.matrix.translate(0,0.04,0);
  part4.matrix.rotate(-twenty,0,0,1);
  var vine4Part = new Matrix4(part4.matrix);
  part4.matrix.scale(0.03,0.07,0.03);
  part4.render();

  var part5 = new Cube();
  part5.color = [0.49,0.57,0.29,1];
  part5.matrix = vine4Part;
  part5.matrix.translate(0,0.04,0);
  part5.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part5.matrix);
  part5.matrix.scale(0.03,0.07,0.03);
  part5.render();

  var part6 = new Cube();
  part6.color = [0.49,0.57,0.29,1];
  part6.matrix = vine4Part;
  part6.matrix.translate(0,0.04,0);
  part6.matrix.rotate(-twentyfive,0,0,1);
  var vine4Part = new Matrix4(part6.matrix);
  part6.matrix.scale(0.03,0.4,0.03);
  part6.render();

  var part7 = new Cube();
  part7.color = [0.49,0.57,0.29,1];
  part7.matrix = vine4Part;
  part7.matrix.translate(0,0.38,0);
  part7.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part7.matrix);
  part7.matrix.scale(0.03,0.07,0.03);
  part7.render();

  var part8 = new Cube();
  part8.color = [0.49,0.57,0.29,1];
  part8.matrix = vine4Part;
  part8.matrix.translate(0,0.05,0);
  part8.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part8.matrix);
  part8.matrix.scale(0.03,0.07,0.03);
  part8.render();

  var part9 = new Cube();
  part9.color = [0.49,0.57,0.29,1];
  part9.matrix = vine4Part;
  part9.matrix.translate(0,0.05,0);
  part9.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part9.matrix);
  part9.matrix.scale(0.03,0.07,0.03);
  part9.render();

  var part10 = new Cube();
  part10.color = [0.49,0.57,0.29,1];
  part10.matrix = vine4Part;
  part10.matrix.translate(0,0.05,0);
  part10.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part10.matrix);
  part10.matrix.scale(0.03,0.07,0.03);
  part10.render();

  var part11 = new Cube();
  part11.color = [0.49,0.57,0.29,1];
  part11.matrix = vine4Part;
  part11.matrix.translate(0,0.05,0);
  part11.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part11.matrix);
  part11.matrix.scale(0.03,0.07,0.03);
  part11.render();

  var part12 = new Cube();
  part12.color = [0.49,0.57,0.29,1];
  part12.matrix = vine4Part;
  part12.matrix.translate(0,0.05,0);
  part12.matrix.rotate(twentyfive,0,0,1);
  var vine4Part = new Matrix4(part12.matrix);
  part12.matrix.scale(0.03,0.07,0.03);
  part12.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(thirtyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(thirtyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(thirtyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var part13 = new Cube();
  part13.color = [0.49,0.57,0.29,1];
  part13.matrix = vine4Part;
  part13.matrix.translate(0,0.05,0);
  part13.matrix.rotate(fortyfive,0,0,1);
  var vine4Part = new Matrix4(part13.matrix);
  part13.matrix.scale(0.03,0.07,0.03);
  part13.render();

  var vine6 = new Cube();
  vine6.color = [0.49,0.57,0.29,1];
  vine6.matrix = sixth;
  vine6.matrix.translate(0.18,0.78,.24);
  vine6.matrix.rotate(180,0,0,1);
  var vinePart = new Matrix4(vine6.matrix);
  vine6.matrix.scale(0.03,0.28,0.03);
  vine6.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.27,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.06,0);
  part1.matrix.rotate(0,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.1,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.1,0);
  part1.matrix.rotate(-fifteen,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twenty,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.1,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.1,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1]; 
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-thirtyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-thirtyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(-fortyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();


  var vine7 = new Cube();
  vine7.color = [0.49,0.57,0.29,1];
  vine7.matrix = seventh;
  vine7.matrix.translate(0.12,0.78,.24);
  vine7.matrix.rotate(180,0,0,1);
  var vinePart = new Matrix4(vine7.matrix);
  vine7.matrix.scale(0.03,0.28,0.03);
  vine7.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.27,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(-twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(0,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.1,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.09,0);
  part1.matrix.rotate(fifteen,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(twenty,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.1,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.09,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(fifteen,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(fifteen,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(thirtyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.05,0);
  part1.matrix.rotate(twentyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(thirtyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();

  var part1 = new Cube();
  part1.color = [0.49,0.57,0.29,1];
  part1.matrix = vinePart;
  part1.matrix.translate(0,0.04,0);
  part1.matrix.rotate(fortyfive,0,0,1);
  var vinePart = new Matrix4(part1.matrix);
  part1.matrix.scale(0.03,0.06,0.03);
  part1.render();







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



