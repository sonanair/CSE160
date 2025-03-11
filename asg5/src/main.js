import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {MTLLoader} from 'three/addons/loaders/MTLLoader.js';

function main() {
    //initialize scene info
    const canvas = document.querySelector('#c');

    const renderer = new THREE.WebGLRenderer({antialias: true, canvas});
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x181f29,15,25);
    scene.background = new THREE.Color(0x000000);


    // Camera Set Up-----------------------------------------------------------------------------------
    const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100); //fov, aspect, near, far
    camera.position.set(0, 5, 3);
    camera.lookAt(0,0,0);
    camera.updateProjectionMatrix();


    // Texture Set Up ------------------------------------------------------------------------------------
    const planeSize = 40;
 
    const loader = new THREE.TextureLoader();
    const texture = loader.load('../lib/textures/checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const bgloader = new THREE.CubeTextureLoader();
    const bgtexture = bgloader.load([
        '../lib/textures/px.png',
        '../lib/textures/nx.png',
        '../lib/textures/py.png',
        '../lib/textures/ny.png',
        '../lib/textures/pz.png',
        '../lib/textures/nz.png'
      ]);
    scene.background = bgtexture;

    const textureLoader = new THREE.TextureLoader();
    
    const snowColor = textureLoader.load('../lib/textures/snow_02_diff_4k.jpg');
    const normalMap = textureLoader.load('../lib/textures/snow_02_nor_gl_4k.exr');  // Might need EXRLoader for this
    const displacementMap = textureLoader.load('../lib/textures/snow_02_disp_4k.png');
    const roughnessMap = textureLoader.load('../lib/textures/snow_02_rough_4k.jpg');

    const rockLoader = new THREE.TextureLoader();
    const rockColor = rockLoader.load('../lib/textures/mossy_rock_diff_4k.jpg');
    const rockDisplacement = rockLoader.load('../lib/textures/mossy_rock_disp_4k.png');
    const rockNormal = rockLoader.load('../lib/textures/mossy_rock_nor_gl_4k.exr');
    const rockRoughness = rockLoader.load('../lib/textures/mossy_rock_rough_4k.exr');

    const barkLoader = new THREE.TextureLoader();
    const barkColor = barkLoader.load('../lib/textures/pine_bark_diff_4k.jpg');
    const barkDisplacement = barkLoader.load('../lib/textures/pine_bark_disp_4k.png');
    const barkNormal = barkLoader.load('../lib/textures/pine_bark_nor_gl_4k.exr');
    const barkRoughness = barkLoader.load('../lib/textures/pine_bark_rough_4k.exr');

    // Material Set Up ----------------------------------------------------------------
    const snowMaterial = new THREE.MeshStandardMaterial({
        map: snowColor, normalMap: normalMap,
        displacementMap: displacementMap, displacementScale: 2.0,
        roughnessMap: roughnessMap, roughness: 0.9
    });

    const rockMaterial = new THREE.MeshStandardMaterial({
        map: rockColor, displacementMap: rockDisplacement, 
        displacementScale: 0.2, normalMap: rockNormal,
        roughnessMap: rockRoughness, roughness: 1
    });

    const stumpMaterial = new THREE.MeshStandardMaterial({
        map: barkColor, displacementMap: barkDisplacement,  
        displacementScale: 0.1, normalMap: barkNormal,  
        roughnessMap: barkRoughness, roughness: 0.8,
    });


    // Create Objects ----------------------------------------------------------------------
    const planeGeometry = new THREE.PlaneGeometry(50, 50, 100, 100); // High subdivisions for displacement
    const ground = new THREE.Mesh(planeGeometry, snowMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const objects = [];

    function createRock(x, y, z, size) {
        const geometry = new THREE.SphereGeometry(size, 6, 6);
        const material = rockMaterial.clone();
        const rock = new THREE.Mesh(geometry, material);
        rock.position.set(x, y, z);
        rock.scale.set(1, 0.5, 1.2);

        rock.castShadow = true;
        rock.receiveShadow = true;
    
        scene.add(rock);
        objects.push(rock);
    }
    createRock(-7, 1.3, 0, 2);
    createRock(-7, 1.3, -3, 1);
    createRock(15, 1.3, 2, 2);
    createRock(19, 1.3, -6, 1.5);
    createRock(-13, 1, 8, 1);
    createRock(2, 1, 14, 2);


    function createStump(x, y, z, height){
        const stumpGeometry = new THREE.CylinderGeometry(1, 1, height, 32); // radiusTop, radiusBottom, height, radialSegments
        const material = stumpMaterial.clone();
        const stump = new THREE.Mesh(stumpGeometry, material);

        stump.position.set(x, y, z);  // Position it above the ground
        stump.castShadow = true;  // Make it cast shadows
        stump.receiveShadow = true;

        scene.add(stump);
        objects.push(stump);
    }

    createStump(-5,1,4,3);
    createStump(15,1,4,4);
    createStump(13,1,-14,2);

    
    const fireflies = [];

    function createFirefly(x, y, z) {
        const firefly = new THREE.Group();
        
        const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
        const material = new THREE.MeshBasicMaterial({ color: 0xFFFF00 });
        const cube = new THREE.Mesh(geometry, material);
        firefly.add(cube);
        
        // PointLight for firefly glow
        const pointLight = new THREE.PointLight(0xFFFF00, 1, 5);
        pointLight.position.set(0, 0, 0);
        firefly.add(pointLight);
        
        // Position the firefly
        firefly.position.set(x, y, z);
        
        // Store firefly details for animation
        fireflies.push({
            object: firefly,
            light: pointLight,
            speed: Math.random() * 0.5 + 0.5,  // Random speed
            amplitude: Math.random() * 1 + 0.5,  // Random bobbing height
            flickerInterval: Math.random() * 500 + 200,  // Random flicker interval
            lastFlickerTime: Date.now()
        });
        scene.add(firefly);
    }

    for (let i = 0; i < 50; i++) {
        const x = Math.random() * 30 - 15;
        const y = Math.random() * 10 + 1;
        const z = Math.random() * 30 - 15;
        createFirefly(x, y, z);
    }

    // 3D Model Set Up ----------------------------------------------------------
    const objLoader = new OBJLoader();
    const mtlLoader = new MTLLoader();

    function create3DModel(x, y, z, scale){
        mtlLoader.load('Tree2.mtl', (mtl) => {
            mtl.preload();
            objLoader.setMaterials(mtl);
            objLoader.load('Tree2.obj', (root) => {
                root.scale.set(scale, scale, scale); // Adjust scale if needed
                root.position.set(x, y, z); // Move it into view
                root.traverse((child) => {
                    if (child.isMesh) {
                        child.material = child.material.clone();
                        child.castShadow = true; // Ensure each mesh casts shadows
                        child.receiveShadow = true; 
                        objects.push(child);
                    }
                });
                scene.add(root);
            });
        }); 
    }

    create3DModel(0,0,-23,5);
    create3DModel(3,0,23,5);
    create3DModel(20,0,-23,5);
    create3DModel(13,0,-23,5);
    create3DModel(20,0,-13,5);
    create3DModel(-21,0,-19,5);
    create3DModel(-21,0,-2,5);
    create3DModel(-21,0,4,5);
    create3DModel(20,0,0,4);
    create3DModel(-10,0,0,5)
    create3DModel(-15,0,20,5);
    create3DModel(10,0,20,4);
    create3DModel(0,0,10,5);
    create3DModel(-5,0,-10,5);
    create3DModel(8,0,-13,5);
    create3DModel(23,0,9,5);

    // Lighting -------------------------------------------------------------------

    const light = new THREE.DirectionalLight(0xccffff, 4);
    light.castShadow = true;
    light.position.set(-10, 10, 10);
    light.target.position.set(0, 0, 0);
    scene.add(light);
    scene.add(light.target);

    // Improve shadow quality
    light.shadow.mapSize.width = 2048; light.shadow.mapSize.height = 2048;
    light.shadow.camera.near = 0.5; light.shadow.camera.far = 50;
    light.shadow.camera.left = -20; light.shadow.camera.right = 20;
    light.shadow.camera.top = 20; light.shadow.camera.bottom = -20;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Light color (gray), intensity (0.5)
    scene.add(ambientLight);

    // Orbit Controls Set Up -----------------------------------------------------------
    const controls = new OrbitControls(camera, canvas); // Attach to the canvas
    controls.target.set(0, 5, 0);
    controls.update();

    // Picking -------------------------------------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let selectedObject = null;

    let flickerInterval = null;
    let highlightIntensity = 0; 
    let increasing = true;
    let pickerOn = false;

    function onMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(objects);
    
        if (intersects.length > 0) {
            const object = intersects[0].object;
    
            if (selectedObject !== object) {
                if (selectedObject) {
                    selectedObject.material.emissive.setHex(0x000000); // Reset previous
                    clearInterval(flickerInterval); // Stop flicker on previous object
                }
    
                selectedObject = object;
                if (pickerOn) startFlicker(selectedObject); // Start flicker only if enabled
            }
        } else {
            if (selectedObject) {
                selectedObject.material.emissive.setHex(0x000000);
                clearInterval(flickerInterval);
                selectedObject = null;
            }
        }
    }
    
    function startFlicker(object) {
        clearInterval(flickerInterval); // Clear any previous flickering
    
        flickerInterval = setInterval(() => {
            if (!pickerOn) {
                clearInterval(flickerInterval);
                object.material.emissive.setHex(0x000000);
                return;
            }
    
            if (increasing) {
                highlightIntensity += 0.1;
                if (highlightIntensity >= 1) increasing = false;
            } else {
                highlightIntensity -= 0.1;
                if (highlightIntensity <= 0) increasing = true;
            }
    
            object.material.emissive.setRGB(highlightIntensity, highlightIntensity * 0.8, 0);
        }, 15); // Adjust timing for faster/slower flicker
    }
    
    // Handle Button Clicks
    document.getElementById("pickerOn").addEventListener("click", () => {
        pickerOn = true;
        if (selectedObject) startFlicker(selectedObject); // Restart flicker if an object is already selected
    });
    
    document.getElementById("pickerOff").addEventListener("click", () => {
        pickerOn = false;
        if (selectedObject) {
            clearInterval(flickerInterval);
            selectedObject.material.emissive.setHex(0x000000); // Reset to normal
        }
    });
    
    // Event Listener for Mouse Movement
    canvas.addEventListener('mousemove', onMouseMove);

    // FUNCTIONS -----------------------------------------------------------------------

    function animate() {
        requestAnimationFrame(animate);
        const time = Date.now();
        
        // Update fireflies (bobbing and flickering)
        fireflies.forEach(firefly => {
            // Bobbing effect (up and down)
            firefly.object.position.y += Math.sin(time * firefly.speed * 0.002) * firefly.amplitude * 0.01;
            // Flickering effect (random intensity changes)
            if (time - firefly.lastFlickerTime > firefly.flickerInterval) {
                firefly.light.intensity = Math.random() * 0.8 + 0.2; // Random intensity for flicker
                firefly.lastFlickerTime = time;
            }
        });
        renderer.render(scene, camera);
    }
    animate();

    function updateLight() {
        light.target.updateMatrixWorld();
    }
    updateLight();
     
}   

main();

