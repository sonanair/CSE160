class Sphere {
    constructor() {
      this.type = 'sphere';
      this.position = [0.0, 0.0, 0.0];
      this.color = [1.0, 1.0, 1.0, 1.0];  // Default white color
      this.size = 1.0;  // Default size
      this.segments = 12;  // Number of segments to divide the sphere into
      this.matrix = new Matrix4();  // Transformation matrix
    }
  
    // Function to generate vertices for the sphere
    generateVertices() {
      let vertices = [];
      let indices = [];
      const SPHERE_DIV = this.segments;  // Divisions for the sphere
  
      // Generate vertices using spherical coordinates
      for (let j = 0; j <= SPHERE_DIV; j++) {
        let aj = j * Math.PI / SPHERE_DIV;  // Angle around the vertical axis
        let sj = Math.sin(aj);  // Sin of the angle
        let cj = Math.cos(aj);  // Cosine of the angle
  
        for (let i = 0; i <= SPHERE_DIV; i++) {
          let ai = i * 2 * Math.PI / SPHERE_DIV;  // Angle around the horizontal axis
          let si = Math.sin(ai);  // Sin of the angle
          let ci = Math.cos(ai);  // Cosine of the angle
  
          // Vertex positions in 3D space
          let x = si * sj;
          let y = cj;
          let z = ci * sj;
  
          vertices.push(x);  // X
          vertices.push(y);  // Y
          vertices.push(z);  // Z
        }
      }
  
      // Generate indices to form the triangles
      for (let j = 0; j < SPHERE_DIV; j++) {
        for (let i = 0; i < SPHERE_DIV; i++) {
          let p1 = j * (SPHERE_DIV + 1) + i;
          let p2 = p1 + (SPHERE_DIV + 1);
          // Make sure we are wrapping the sphere around
          indices.push(p1); indices.push(p2); indices.push(p1 + 1);  // First triangle
          indices.push(p1 + 1); indices.push(p2); indices.push(p2 + 1);  // Second triangle
        }
      }
  
      return { vertices: vertices, indices: indices };
    }
  
    render() {
      let { vertices, indices } = this.generateVertices();
      let vertexBuffer = gl.createBuffer();
      if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
      }
  
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  
      let indexBuffer = gl.createBuffer();
      if (!indexBuffer) {
        console.log('Failed to create the index buffer object');
        return -1;
      }
  
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  
      // Bind and enable position attribute
      let a_Position = gl.getAttribLocation(gl.program, 'a_Position');
      if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
      }
      gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(a_Position);
  
      // Pass the transformation matrix to the shader
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
  
      // Set the color for the sphere
      gl.uniform4f(u_FragColor, this.color[0]*.9, this.color[1]*.9, this.color[2], this.color[3]);
  
      // Draw the sphere using the indices
      gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    }
  }
  