class Cube{
    constructor(){
        this.type='cube';
        //this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        //this.size = 5.0; 
        //this.segments = 10;
        this.matrix = new Matrix4();
        this.textureNum = -2;
        this.cubeVerts32= new Float32Array([
            0,0,0,  1,1,0,  1,0,0,
            0,0,0,  0,1,0,  1,1,0,

            0,1,0,  1,1,1,  1,1,0,
            0,1,0,  0,1,1,  1,1,1,

            1,0,1,  0,1,1,  0,0,1,
            1,0,1,  1,1,1,  0,1,1,

            0,0,1,  1,0,0,  1,0,1,
            0,0,1,  0,0,0,  1,0,0,

            0,0,1,  0,1,0,  0,0,0,
            0,0,1,  0,1,1,  0,1,0,

            1,0,0,  1,1,1,  1,0,1,
            1,0,0,  1,1,0,  1,1,1
        ]);
    }
  
    render(){
        //var xy = this.position;
        var rgba = this.color;
        //var size = this.size;

        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);


        //front of the cube
        drawTriangle3DUV( [0,0,0,  1,1,0,  1,0,0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV( [0,0,0,  0,1,0,  1,1,0 ], [0,0, 0,1, 1,1]);

        //lighting
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        //top of the cube
        drawTriangle3DUV( [0,1,0,  1,1,1,  1,1,0 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV( [0,1,0,  0,1,1,  1,1,1 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);

        //back of the cube
        drawTriangle3DUV( [1,0,1,  0,1,1,  0,0,1 ], [0,0, 1,1, 1,0]);
        drawTriangle3DUV( [1,0,1,  1,1,1,  0,1,1 ], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.7, rgba[1]*.7, rgba[2]*.7, rgba[3]);

        // // Draw the bottom face
        drawTriangle3DUV([0,0,1,  1,0,0,  1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1, 0,0,0, 1,0,0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);

        // Draw the left face
        drawTriangle3DUV([0,0,1, 0,1,0, 0,0,0], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([0,0,1, 0,1,1, 0,1,0], [0,0, 0,1, 1,1]);

        gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);

        // Draw the right face
        drawTriangle3DUV([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0]);
        drawTriangle3DUV([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1]);
       

    }

    renderfast() {
        var rgba = this.color;

        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        var allverts = [];
        // Front of Cube
        allverts = allverts.concat(0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0.0,0.0 );
        allverts = allverts.concat(0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0 );
        // Back
        allverts = allverts.concat(0.0,0.0,1.0, 1.0,1.0,1.0, 1.0,0.0,1.0 );
        allverts = allverts.concat(0.0,0.0,1.0, 0.0,1.0,1.0, 1.0,1.0,1.0);
        // Top
        allverts = allverts.concat(0.0,1.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 );
        allverts = allverts.concat(0.0,1.0,1.0, 0.0,1.0,0.0, 1.0,1.0,1.0 );
        // Bottom
        allverts = allverts.concat(0.0,0.0,0.0, 0.0,0.0,1.0, 1.0,0.0,0.0 );
        allverts = allverts.concat(1.0,0.0,0.0, 1.0,0.0,1.0, 0.0,0.0,1.0 );

        // Left
        allverts = allverts.concat(0.0,0.0,0.0, 0.0,1.0,0.0, 0.0,1.0,1.0 );
        allverts = allverts.concat(0.0,1.0,1.0, 0.0,0.0,0.0, 0.0,0.0,1.0 );
        // Right
        allverts = allverts.concat(1.0,0.0,0.0, 1.0,1.0,0.0, 1.0,1.0,1.0 );
        allverts = allverts.concat(1.0,1.0,1.0, 1.0,0.0,0.0, 1.0,0.0,1.0 );

        drawTriangle3D(allverts);
    }

    renderfaster() {
        var rgba = this.color;

        gl.uniform1i(u_whichTexture, this.textureNum);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        //if (g_vertexBuffer==null){
            initTriangle3D();
        //}
        
        gl.bufferData(gl.ARRAY_BUFFER, this.cubeVerts32, gl.DYNAMIC_DRAW);

        gl.drawArrays(gl.TRIANGLES, 0, 36);
    }
}