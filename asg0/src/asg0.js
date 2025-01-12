// DrawTriangle.js (c) 2012 matsuda
function main() {  
    // Retrieve <canvas> element
    var canvas = document.getElementById('example');  
    if (!canvas) { 
      console.log('Failed to retrieve the <canvas> element');
      return false; 
    } 
  
    // Get the rendering context for 2DCG
    var ctx = canvas.getContext('2d');

    // Draw a blue rectangle
    ctx.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Set color to black
    ctx.fillRect(0, 0, canvas.width, canvas.height);        // Fill a rectangle with the color

    var btn = document.getElementById('btn');
    btn.addEventListener('click', handleDrawEvent)

    var btn2 = document.getElementById('btn2')
    btn2.addEventListener('click', handleDrawOperationEvent)

    function vectorInputs(){
      var v1x = parseFloat(document.getElementById('x-coord').value);
      var v1y = parseFloat(document.getElementById('y-coord').value);
      var v2x = parseFloat(document.getElementById('x-v2').value);
      var v2y = parseFloat(document.getElementById('y-v2').value);

      if (isNaN(v1x) || isNaN(v1y) || isNaN(v2x) || isNaN(v2y)) {
        console.error("Invalid input. Please enter numbers for x and y coordinates.");
        return null;
      }
      var v1 = new Vector3([v1x, v1y, 0]) //initialize z = 0
      var v2 = new Vector3([v2x, v2y, 0]) //initialize z = 0
      return { v1, v2 };
    }

    function drawHelper(v1,v2){
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Redraw the background
      ctx.fillStyle = 'rgba(0, 0, 0, 1.0)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      drawVector(v1, "red");
      drawVector(v2, "blue");
    }

    function handleDrawEvent() {
      const vectors = vectorInputs();
      if (!vectors) return;

      drawHelper(vectors.v1, vectors.v2);
    }

    function handleDrawOperationEvent(){
      const vectors = vectorInputs();
      if (!vectors) return;

      drawHelper(vectors.v1, vectors.v2);

      var operation = document.getElementById('operation').value;
      var scalar = document.getElementById('scalar').value;

      var v3, v4;
      switch (operation){
        case "add":
          v3 = vectors.v1.add(vectors.v2)
          drawVector(v3, "green");
          break;
        case "sub":
          v3 = vectors.v1.sub(vectors.v2)
          drawVector(v3, "green");
          break;
        case "mul":
          v3 = vectors.v1.mul(scalar);
          v4 = vectors.v2.mul(scalar);
          drawVector(v3, "green"); // Draw the result of v1 * scalar
          drawVector(v4, "green"); // Draw the result of v2 * scalar
          break;
        case "div":
          if (scalar == 0) {
            console.error("Cannot divide by zero.");
            return;
          }
          v3 = vectors.v1.div(scalar);
          v4 = vectors.v2.div(scalar);
          drawVector(v3, "green"); // Draw the result of v1 / scalar
          drawVector(v4, "green"); // Draw the result of v2 / scalar
          break;
        case "mag":
          var magv1 = vectors.v1.magnitude();
          var magv2 = vectors.v2.magnitude();
          console.log("Magnitude of v1:", magv1); 
          console.log("Magnitude of v2:", magv2);
          break;
        case "norm":
          v3 = vectors.v1.normalize(scalar);
          v4 = vectors.v2.normalize(scalar);
          drawVector(v3, "green"); 
          drawVector(v4, "green"); 
          break;
        case "angle":
          angleBetween(vectors.v1, vectors.v2)
          break;
        case "area":
          areaTriangle(vectors.v1, vectors.v2)
          break;
        default:
          console.error("Invalid operation");
          break;
      }
    }

    function areaTriangle(v1, v2){
      let v3 = Vector3.cross(v1, v2);
      let mag = v3.magnitude();
      triangle = mag / 2

      console.log("Area of the triangle: " + triangle)
      return triangle
    }

    function angleBetween(v1, v2){
      let d = Vector3.dot(v1,v2)
      let magv1 = v1.magnitude();
      let magv2 = v2.magnitude();

      let cosTheta = d / (magv1 * magv2)
      let angleRad = Math.acos(cosTheta)
      let angleDeg = angleRad * (180 / Math.PI)

      console.log("Angle: " + angleDeg)
      return angleDeg
    }

    function drawVector(v, color) {
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;

      //always starts from the center
      ctx.beginPath(); 
      var ogX = canvas.width / 2;
      var ogY = canvas.height / 2;
      ctx.moveTo(ogX, ogY)

      //find scaled endpoints of vector
      var endX = ogX + v.elements[0] * 20;
      var endY = ogY - v.elements[1] * 20;
      ctx.lineTo(endX, endY); //draw vector to this point

      //render line
      ctx.stroke();
    }
  }