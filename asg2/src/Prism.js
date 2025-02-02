class Prism {
    constructor(){
        this.type = 'prism';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }

    render(){
        var rgba = this.color;
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Define trapezoidal prism vertices
        let v0 = [-0.5, -0.5,  0.5];  // Bottom-left front
        let v1 = [ 0.5, -0.5,  0.5];  // Bottom-right front
        let v2 = [-0.3,  0.5,  0.5];  // Top-left front
        let v3 = [ 0.3,  0.5,  0.5];  // Top-right front
        let v4 = [-0.5, -0.5, -0.5];  // Bottom-left back
        let v5 = [ 0.5, -0.5, -0.5];  // Bottom-right back
        let v6 = [-0.3,  0.5, -0.5];  // Top-left back
        let v7 = [ 0.3,  0.5, -0.5];  // Top-right back

        // Front trapezoid
        drawTriangle3D(v0.concat(v1, v2));
        drawTriangle3D(v1.concat(v3, v2));

        // Back trapezoid
        drawTriangle3D(v4.concat(v5, v6));
        drawTriangle3D(v5.concat(v7, v6));

        // Lighting adjustment
        gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);

        // Bottom face
        drawTriangle3D(v0.concat(v1, v5));
        drawTriangle3D(v0.concat(v5, v4));

        // Top face
        drawTriangle3D(v2.concat(v3, v7));
        drawTriangle3D(v2.concat(v7, v6));

        // Left face
        drawTriangle3D(v0.concat(v2, v6));
        drawTriangle3D(v0.concat(v6, v4));

        // Right face
        drawTriangle3D(v1.concat(v3, v7));
        drawTriangle3D(v1.concat(v7, v5));
    }
}
