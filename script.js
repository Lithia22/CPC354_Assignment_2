// Common variables
var canvas, gl, program;
var pBuffer, nBuffer, vPosition, vNormal;
var modelViewMatrixLoc, projectionMatrixLoc, normalMatrixLoc;
var modelViewMatrix, projectionMatrix, nMatrix;
var isAnimating = false;
let lastTime = 0;

// Variables referencing HTML elements
// theta = [x, y, z]
const X_AXIS = 0;
const Y_AXIS = 1;
const Z_AXIS = 2;
var cylinderX, cylinderY, cylinderZ, cylinderAxis = X_AXIS, cylinderBtn;
var cubeX, cubeY, cubeZ, cubeAxis = X_AXIS, cubeBtn;
var sphereX, sphereY, sphereZ, sphereAxis = X_AXIS, sphereBtn;
var cylinderObj, cubeObj, sphereObj;
var cylinderFlag = false, cubeFlag = false, sphereFlag = false;
var cylinderTheta = [0,0,0], cubeTheta = [0,0,0], sphereTheta = [0,0,0], animFrame = 0;
var pointsArray = [], normalsArray = [], cylinderV, cubeV, sphereV, totalV;

// Variables for lighting control
var ambientProduct, diffuseProduct, specularProduct;
var ambient = 0.5, diffuse = 0.5, specular = 0.5, shininess = 60;
var lightPos = vec4(1.0, 1.0, 1.0, 0.0);
var lightAmbient = vec4(ambient, ambient, ambient, 1.0);
var lightDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
var lightSpecular = vec4(specular, specular, specular, 1.0);

var materialAmbient = vec4(0.5, 0.5, 1.0, 1.0);
var materialDiffuse = vec4(0.0, 0.9, 1.0, 1.0);
var materialSpecular = vec4(1.0, 1.0, 1.0, 1.0);

var pointLightPos = vec4(2.0, 2.0, 2.0, 1.0);
var pointAmbient = vec4(0.8, 0.8, 0.8, 1.0);
var pointDiffuse = vec4(0.8, 0.8, 0.8, 1.0);
var pointSpecular = vec4(1.0, 1.0, 1.0, 1.0);
var pointLightOn = true;
var isDirectional = false;

// Material Properties
var cylinderMaterial = {
    ambient: vec4(0.2, 0.4, 0.8, 1.0),
    diffuse: vec4(0.2, 0.4, 0.8, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0)
};

var cubeMaterial = {
    ambient: vec4(0.8, 0.4, 0.2, 1.0),
    diffuse: vec4(0.8, 0.4, 0.2, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0)
};

var sphereMaterial = {
    ambient: vec4(0.4, 0.8, 0.2, 1.0),
    diffuse: vec4(0.4, 0.8, 0.2, 1.0),
    specular: vec4(1.0, 1.0, 1.0, 1.0)
};

// Variables for spotlight control
var spotLightPos = vec4(0.0, 2.0, 0.0, 1.0);
var spotLightDir = vec4(0.0, -1.0, 0.0, 0.0);
var spotLightCutoff = 20.0;  // degrees
var spotLightOn = true;

// Variables for shading control
var isFlatShading = false;
var nonPhotorealisticBands = 0.0;

// Variables for camera control
var cameraPosition = vec3(0.0, 0.0, 5.0);
var cameraTarget = vec3(0.0, 0.0, 0.0);
var cameraUp = vec3(0.0, 1.0, 0.0);
var isDragging = false;
var lastMouseX = 0, lastMouseY = 0;
var cameraRadius = 5.0;
var cameraTheta = Math.PI / 4;  // Initial horizontal angle
var cameraPhi = Math.PI / 4;    // Initial vertical angle

/*-----------------------------------------------------------------------------------*/
// WebGL Utilities
/*-----------------------------------------------------------------------------------*/

// Execute the init() function when the web page has fully loaded
window.onload = function init()
{
    // Initialize three distinct 3D geometric primitives with unique characteristics
    // Objects & Symbols
    cylinderObj = cylinder(72, 3, true);
    cylinderObj.Rotate(45, [1, 1, 0]);
    cylinderObj.Scale(1.8, 1.8, 1.8);
    concatData(cylinderObj.Point, cylinderObj.Normal);

    cubeObj = cube();
    cubeObj.Rotate(45, [1, 1, 0]);
    cubeObj.Scale(1.2, 1.2, 1.2);
    concatData(cubeObj.Point, cubeObj.Normal);
    
    sphereObj = sphere(4);
    sphereObj.Rotate(45, [1, 1, 0]);
    sphereObj.Scale(0.5, 0.5, 0.5);
    concatData(sphereObj.Point, sphereObj.Normal);

    cylinderV = (cylinderObj.Point).length;
    cubeV = (cubeObj.Point).length;
    sphereV = (sphereObj.Point).length;
    totalV = pointsArray.length;

    // WebGL setups
    getUIElement();
    configWebGL();
    render();
}

function getUIElement()
{
    canvas = document.getElementById("gl-canvas");

    cylinderX = document.getElementById("cylinder-x");
    cylinderY = document.getElementById("cylinder-y");
    cylinderZ = document.getElementById("cylinder-z");
    cylinderBtn = document.getElementById("cylinder-btn");

    cubeX = document.getElementById("cube-x");
    cubeY = document.getElementById("cube-y");
    cubeZ = document.getElementById("cube-z");
    cubeBtn = document.getElementById("cube-btn");

    sphereX = document.getElementById("sphere-x");
    sphereY = document.getElementById("sphere-y");
    sphereZ = document.getElementById("sphere-z");
    sphereBtn = document.getElementById("sphere-btn");

    cylinderX.onchange = function() 
    {
        if(cylinderX.checked) cylinderAxis = X_AXIS;
    };

    cylinderY.onchange = function() 
    {
        if(cylinderY.checked) cylinderAxis = Y_AXIS;
    };

    cylinderZ.onchange = function() 
    {
        if(cylinderZ.checked) cylinderAxis = Z_AXIS;
    };

    cylinderBtn.onclick = function()
    {
        cylinderFlag = !cylinderFlag;
    };

    cubeX.onchange = function() 
    {
        if(cubeX.checked) cubeAxis = X_AXIS;
    };

    cubeY.onchange = function() 
    {
        if(cubeY.checked) cubeAxis = Y_AXIS;
    };

    cubeZ.onchange = function() 
    {
        if(cubeZ.checked) cubeAxis = Z_AXIS;
    };

    cubeBtn.onclick = function()
    {
        cubeFlag = !cubeFlag;
    };

    sphereX.onchange = function() 
    {
        if(sphereX.checked) sphereAxis = X_AXIS;
    };

    sphereY.onchange = function() 
    {
        if(sphereY.checked) sphereAxis = Y_AXIS;
    };

    sphereZ.onchange = function() 
    {
        if(sphereZ.checked) sphereAxis = Z_AXIS;
    };

    sphereBtn.onclick = function()
    {
        sphereFlag = !sphereFlag;
    };

    // Light Sources
    // Point Light Toggle and Type Change
    document.getElementById('pointLightToggle').onchange = function() {
        pointLightOn = this.checked;
        gl.uniform1i(gl.getUniformLocation(program, "pointLightOn"), pointLightOn);
    };

    document.getElementById('lightTypeToggle').onchange = function() {
        isDirectional = this.checked;
        gl.uniform1i(gl.getUniformLocation(program, "isDirectional"), isDirectional);
    };

    // Light Source
    // Light position sliders
    document.getElementById('pointLightX').oninput = 
    document.getElementById('pointLightY').oninput = 
    document.getElementById('pointLightZ').oninput = function() {
        pointLightPos = vec4(
            parseFloat(document.getElementById('pointLightX').value),
            parseFloat(document.getElementById('pointLightY').value),
            parseFloat(document.getElementById('pointLightZ').value),
            1.0
        );
        gl.uniform4fv(gl.getUniformLocation(program, "pointLightPos"), flatten(pointLightPos));
    };

    // Light intensity sliders
    document.getElementById('ambientLight').oninput = function() {
        ambient = parseFloat(this.value);
        pointAmbient = vec4(ambient, ambient, ambient, 1.0);
        gl.uniform4fv(gl.getUniformLocation(program, "pointAmbient"), flatten(pointAmbient));
    };

    document.getElementById('diffuseLight').oninput = function() {
        diffuse = parseFloat(this.value);
        pointDiffuse = vec4(diffuse, diffuse, diffuse, 1.0);
        gl.uniform4fv(gl.getUniformLocation(program, "pointDiffuse"), flatten(pointDiffuse));
    };

    document.getElementById('specularLight').oninput = function() {
        specular = parseFloat(this.value);
        pointSpecular = vec4(specular, specular, specular, 1.0);
        gl.uniform4fv(gl.getUniformLocation(program, "pointSpecular"), flatten(pointSpecular));
    };

    // Material properties event listeners
    document.getElementById('objectSelector').onchange = updateMaterialProperties;
    document.getElementById('ambientCoef').oninput = updateMaterialProperties;
    document.getElementById('diffuseCoef').oninput = updateMaterialProperties;
    document.getElementById('specularCoef').oninput = updateMaterialProperties;
    document.getElementById('shininess').oninput = function() {
        shininess = parseFloat(this.value);
        gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);
    };

    // Material Properties
    // diffuse, specular and ambient colour components.
    // Interactive Material Property Modification
    function updateMaterialProperties() {
        const selectedObject = document.getElementById('objectSelector').value;
        const ambientCoef = parseFloat(document.getElementById('ambientCoef').value);
        const diffuseCoef = parseFloat(document.getElementById('diffuseCoef').value);
        const specularCoef = parseFloat(document.getElementById('specularCoef').value);

        let materialToUpdate;
        let baseMaterial;
        switch(selectedObject) {
            case 'cylinder':
                materialToUpdate = cylinderMaterial;
                baseMaterial = {
                    ambient: vec4(0.2, 0.4, 0.8, 1.0),
                    diffuse: vec4(0.2, 0.4, 0.8, 1.0),
                    specular: vec4(1.0, 1.0, 1.0, 1.0)
                };
                break;
            case 'cube':
                materialToUpdate = cubeMaterial;
                baseMaterial = {
                    ambient: vec4(0.8, 0.4, 0.2, 1.0),
                    diffuse: vec4(0.8, 0.4, 0.2, 1.0),
                    specular: vec4(1.0, 1.0, 1.0, 1.0)
                };
                break;
            case 'sphere':
                materialToUpdate = sphereMaterial;
                baseMaterial = {
                    ambient: vec4(0.4, 0.8, 0.2, 1.0),
                    diffuse: vec4(0.4, 0.8, 0.2, 1.0),
                    specular: vec4(1.0, 1.0, 1.0, 1.0)
                };
                break;
        }

        materialToUpdate.ambient = vec4(
            baseMaterial.ambient[0] * ambientCoef,
            baseMaterial.ambient[1] * ambientCoef,
            baseMaterial.ambient[2] * ambientCoef,
            1.0
        );
        materialToUpdate.diffuse = vec4(
            baseMaterial.diffuse[0] * diffuseCoef,
            baseMaterial.diffuse[1] * diffuseCoef,
            baseMaterial.diffuse[2] * diffuseCoef,
            1.0
        );
        materialToUpdate.specular = vec4(
            baseMaterial.specular[0] * specularCoef,
            baseMaterial.specular[1] * specularCoef,
            baseMaterial.specular[2] * specularCoef,
            1.0
        );
        
    }

    // Light Source
    // Sharpness of the spot light by manipulating the cutoff angle
    document.getElementById('spotLightToggle').onchange = function() {
        spotLightOn = this.checked;
        gl.uniform1i(gl.getUniformLocation(program, "spotLightOn"), spotLightOn);
    };

    document.getElementById('spotLightCutoff').oninput = function() {
        spotLightCutoff = parseFloat(this.value);
        gl.uniform1f(gl.getUniformLocation(program, "spotLightCutoff"), Math.cos(radians(spotLightCutoff)));
    };

    document.getElementById('spotLightX').oninput = 
    document.getElementById('spotLightY').oninput = 
    document.getElementById('spotLightZ').oninput = function() {
        spotLightPos = vec4(
            parseFloat(document.getElementById('spotLightX').value),
            parseFloat(document.getElementById('spotLightY').value),
            parseFloat(document.getElementById('spotLightZ').value),
            1.0
        );
        gl.uniform4fv(gl.getUniformLocation(program, "spotLightPos"), flatten(spotLightPos));
    };


    // Shading
    var shadingModeCheckbox = document.createElement('input');
    shadingModeCheckbox.type = 'checkbox';
    shadingModeCheckbox.onchange = function() {
        isFlatShading = this.checked;
        gl.uniform1i(gl.getUniformLocation(program, "isFlatShading"), isFlatShading);
        render();
    };

    // Non-Photorealistic Rendering Slider
    var nprSlider = document.createElement('input');
    nprSlider.type = 'range';
    nprSlider.min = '0';
    nprSlider.max = '5';
    nprSlider.step = '0.5';
    nprSlider.value = nonPhotorealisticBands;
    nprSlider.onchange = function() {
        nonPhotorealisticBands = parseFloat(this.value);
        gl.uniform1f(gl.getUniformLocation(program, "nonPhotorealisticBands"), nonPhotorealisticBands);
        render();
    };

    var lowerControlsSection = document.querySelector('.lower-controls');

    var shadingSection = document.createElement('div');
    shadingSection.classList.add('control-group');
    shadingSection.innerHTML = '<h4 class="section-title">Shading Controls</h4>';

    var shadingPanel = document.createElement('div');
    shadingPanel.classList.add('param-panel');

    var flatShadingContainer = document.createElement('div');
    flatShadingContainer.classList.add('horizontal-align', 'mg-top-bottom');
    flatShadingContainer.innerHTML = '<div class="checkText">Flat Shading</div>';
    flatShadingContainer.appendChild(shadingModeCheckbox);

    var nprContainer = document.createElement('div');
    nprContainer.classList.add('mg-top-bottom');
    nprContainer.innerHTML = '<label>NPR Bands:</label><br>';
    nprContainer.appendChild(nprSlider);

    shadingPanel.appendChild(flatShadingContainer);
    shadingPanel.appendChild(nprContainer);
    shadingSection.appendChild(shadingPanel);

    lowerControlsSection.appendChild(shadingSection);

    // Viewing
    // Camera Controls
    document.getElementById('cameraX').oninput = 
    document.getElementById('cameraY').oninput = 
    document.getElementById('cameraZ').oninput = function() {
        cameraPosition[0] = parseFloat(document.getElementById('cameraX').value);
        cameraPosition[1] = parseFloat(document.getElementById('cameraY').value);
        cameraPosition[2] = parseFloat(document.getElementById('cameraZ').value);
        render(); 
    };
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault()); 

    document.addEventListener('keydown', function(event) {
        if (event.code === 'Space') {
            event.preventDefault(); 
            cylinderFlag = !cylinderFlag;
            cubeFlag = !cubeFlag;
            sphereFlag = !sphereFlag;
        } else if (event.code === 'KeyR') {
            location.reload();
        }
    });
}

function handleMouseDown(event) {
    isDragging = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
    event.preventDefault();  
}

function handleMouseMove(event) {
    if (!isDragging) return;

    var deltaX = event.clientX - lastMouseX;
    var deltaY = event.clientY - lastMouseY;
    var sensitivity = 0.004;  

    cameraTheta += deltaX * sensitivity;
    cameraPhi -= deltaY * sensitivity; 

    cameraPhi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraPhi));

    updateCameraPosition();

    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    isDragging = false;
}

function handleWheel(event) {
    cameraRadius += event.deltaY * 0.01;
    
    cameraRadius = Math.max(2.0, Math.min(10.0, cameraRadius));
    
    updateCameraPosition();
    
    event.preventDefault(); 
}

function updateCameraPosition() {
    // Convert spherical coordinates to Cartesian
    cameraPosition[0] = cameraRadius * Math.sin(cameraTheta) * Math.sin(cameraPhi);
    cameraPosition[1] = cameraRadius * Math.cos(cameraPhi);
    cameraPosition[2] = cameraRadius * Math.cos(cameraTheta) * Math.sin(cameraPhi);

    document.getElementById('cameraX').value = cameraPosition[0];
    document.getElementById('cameraY').value = cameraPosition[1];
    document.getElementById('cameraZ').value = cameraPosition[2];

    render();
}

// Configure WebGL Settings
function configWebGL()
{
    // Initialize the WebGL context
    gl = WebGLUtils.setupWebGL(canvas);
    
    if(!gl)
    {
        alert("WebGL isn't available");
    }

    // Set the viewport and clear the color
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Enable hidden-surface removal
    gl.enable(gl.DEPTH_TEST);

    // Compile the vertex and fragment shaders and link to WebGL
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    // Create buffers and link them to the corresponding attribute variables in vertex and fragment shaders
    // Buffer for positions
    pBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    // Buffer for normals
    nBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, nBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW);
    
    vNormal = gl.getAttribLocation(program, "vNormal");
    gl.vertexAttribPointer(vNormal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vNormal);

    // Get the location of the uniform variables within a compiled shader program
    modelViewMatrixLoc = gl.getUniformLocation(program, "modelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
    normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

    gl.uniform4fv(gl.getUniformLocation(program, "pointLightPos"), flatten(pointLightPos));
    gl.uniform4fv(gl.getUniformLocation(program, "pointAmbient"), flatten(pointAmbient));
    gl.uniform4fv(gl.getUniformLocation(program, "pointDiffuse"), flatten(pointDiffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "pointSpecular"), flatten(pointSpecular));
    gl.uniform1i(gl.getUniformLocation(program, "pointLightOn"), pointLightOn);
    gl.uniform1i(gl.getUniformLocation(program, "isDirectional"), isDirectional);
    gl.uniform4fv(gl.getUniformLocation(program, "spotLightPos"), flatten(spotLightPos));
    gl.uniform4fv(gl.getUniformLocation(program, "spotLightDir"), flatten(spotLightDir));
    gl.uniform1f(gl.getUniformLocation(program, "spotLightCutoff"), Math.cos(radians(spotLightCutoff)));
    gl.uniform1i(gl.getUniformLocation(program, "spotLightOn"), spotLightOn);
    gl.uniform1i(gl.getUniformLocation(program, "isFlatShading"), isFlatShading);
    gl.uniform1f(gl.getUniformLocation(program, "nonPhotorealisticBands"), nonPhotorealisticBands);

}

function render() {
    // Clear buffers
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Set up the camera view matrix ONCE
    var viewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    
    // Set up projection matrix
    projectionMatrix = ortho(-4, 4, -2.25, 2.25, -50, 50);
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));

    // Set lighting products
    ambientProduct = mult(lightAmbient, materialAmbient);
    diffuseProduct = mult(lightDiffuse, materialDiffuse);
    specularProduct = mult(lightSpecular, materialSpecular);
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "lightPos"), flatten(lightPos));
    gl.uniform1f(gl.getUniformLocation(program, "shininess"), shininess);

    // Store the view matrix to combine with model matrices
    modelViewMatrix = viewMatrix;
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    animUpdate();
}


function animUpdate(currentTime) {
    // Calculate time delta to make rotation frame-rate independent
    if (!lastTime) lastTime = currentTime;
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;

    const rotationSpeed = 45.0; // Degrees per second
    const frameRotation = rotationSpeed * (deltaTime / 1000.0);
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if(cylinderFlag) cylinderTheta[cylinderAxis] += frameRotation;
    if(cubeFlag) cubeTheta[cubeAxis] += frameRotation;
    if(sphereFlag) sphereTheta[sphereAxis] += frameRotation;

    var baseModelViewMatrix = lookAt(cameraPosition, cameraTarget, cameraUp);
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(baseModelViewMatrix));
    
    drawCylinder();
    drawCube();
    drawSphere();
 
    animFrame = window.requestAnimationFrame(animUpdate);
}

function drawCylinder() {
    if(cylinderFlag) {
        cylinderTheta[cylinderAxis] += 0.2; 
    }

    // Save the view matrix
    var viewMatrix = modelViewMatrix;
    
    // Apply model transformations
    modelViewMatrix = mult(viewMatrix, translate(-2.5, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(cylinderTheta[X_AXIS], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(cylinderTheta[Y_AXIS], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(cylinderTheta[Z_AXIS], [0, 0, 1]));
    
    gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(cylinderMaterial.ambient));
    gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(cylinderMaterial.diffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(cylinderMaterial.specular));
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));

    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);
    gl.drawArrays(gl.TRIANGLES, 0, cylinderV);
    
    // Restore the view matrix for next object
    modelViewMatrix = viewMatrix;
}

function drawCube() {
    if(cubeFlag) {
        cubeTheta[cubeAxis] += 0.2;
    }

    // Save the current view matrix
    var viewMatrix = modelViewMatrix;
    
    // Apply model transformations
    modelViewMatrix = mult(viewMatrix, translate(0, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(cubeTheta[X_AXIS], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(cubeTheta[Y_AXIS], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(cubeTheta[Z_AXIS], [0, 0, 1]));
    
    // Set material properties
    gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(cubeMaterial.ambient));
    gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(cubeMaterial.diffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(cubeMaterial.specular));
    
    // Update model-view and normal matrices
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);
    
    // Draw the cube
    gl.drawArrays(gl.TRIANGLES, cylinderV, cubeV);
    
    // Restore the view matrix for next object
    modelViewMatrix = viewMatrix;
}

function drawSphere() {
    if(sphereFlag) {
        sphereTheta[sphereAxis] += 0.2;
    }

    // Save the current view matrix
    var viewMatrix = modelViewMatrix;
    
    // Apply model transformations
    modelViewMatrix = mult(viewMatrix, translate(2.5, 0, 0));
    modelViewMatrix = mult(modelViewMatrix, rotate(sphereTheta[X_AXIS], [1, 0, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(sphereTheta[Y_AXIS], [0, 1, 0]));
    modelViewMatrix = mult(modelViewMatrix, rotate(sphereTheta[Z_AXIS], [0, 0, 1]));
    
    // Set material properties
    gl.uniform4fv(gl.getUniformLocation(program, "materialAmbient"), flatten(sphereMaterial.ambient));
    gl.uniform4fv(gl.getUniformLocation(program, "materialDiffuse"), flatten(sphereMaterial.diffuse));
    gl.uniform4fv(gl.getUniformLocation(program, "materialSpecular"), flatten(sphereMaterial.specular));
    
    // Update model-view and normal matrices
    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    nMatrix = normalMatrix(modelViewMatrix);
    gl.uniformMatrix3fv(normalMatrixLoc, false, nMatrix);
    
    // Draw the sphere
    gl.drawArrays(gl.TRIANGLES, cylinderV + cubeV, sphereV);
    
    // Restore the view matrix for next object
    modelViewMatrix = viewMatrix;
}

function concatData(point, normal)
{
    pointsArray = pointsArray.concat(point);
    normalsArray = normalsArray.concat(normal);
}