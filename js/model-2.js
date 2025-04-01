// Import the THREE.js library
import * as THREE from "https://cdn.skypack.dev/three@0.129.0/build/three.module.js";
// To allow for importing the .gltf file
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.129.0/examples/jsm/loaders/GLTFLoader.js";

// Create a Three.JS Scene
const scene = new THREE.Scene();

// Set the background color to a light skin-tone mix
scene.background = new THREE.Color(0xF5E1DA); // Light peach/sand color

// Create a camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 3);

// Touch tracking variables
let touchStartX = 0, touchStartY = 0;
let touchMoveX = 0, touchMoveY = 0;
let isRotating = false, isMoving = false, isZooming = false;
let originalScale = 1, zoomFactor = 1;

// Adjust speeds based on screen size
const baseScreenSize = 800;
const screenFactor = window.innerWidth / baseScreenSize;
const rotationSpeed = 0.005 * screenFactor;
const moveSpeed = 0.0015 * screenFactor;
const zoomSpeed = 0.05;  // Adjust zoom sensitivity

// Keep the 3D object in a global variable
let object;

// Instantiate a loader for the .gltf file
const loader = new GLTFLoader();
const modelURL = "https://raw.githubusercontent.com/xab-bax/SwarjDemo/main/models/large_tv_man_suit/scene.gltf";

// Function to remove previous object
function clearScene() {
    if (object) {
        scene.remove(object);
        object.traverse((child) => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((mat) => mat.dispose());
                } else {
                    child.material.dispose();
                }
            }
        });
        object = null;
    }
}

// Load the model only when user clicks the image
loader.load(
    modelURL,
    function (gltf) {
        clearScene();  // Remove any existing object before adding a new one
        object = gltf.scene;
        scene.add(object);
        object.scale.set(0.55, 0.55, 0.55);
        originalScale = object.scale.x; // Store original size
        zoomFactor = 1;  // Reset zoom factor
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
    },
    function (error) {
        console.error(error);
    }
);

// Instantiate a new renderer
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById("container3D").appendChild(renderer.domElement);

// Add lights
const topLight = new THREE.DirectionalLight(0xffffff, 15);
topLight.position.set(500, 500, 500);
scene.add(topLight);

const ambientLight = new THREE.AmbientLight(0x333333, 15);
scene.add(ambientLight);

// Function to animate and render scene
function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

// Handle touch events for mobile rotation & movement
document.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isRotating = false;
    isMoving = false;
    isZooming = false;
});

document.addEventListener("touchmove", (e) => {
    if (!object) return;
    e.preventDefault(); // Prevent default browser scrolling

    touchMoveX = e.touches[0].clientX;
    touchMoveY = e.touches[0].clientY;

    let deltaX = touchMoveX - touchStartX;
    let deltaY = touchMoveY - touchStartY;

    if (!isRotating && !isMoving) {
        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            isRotating = true;
        } else {
            isMoving = true;
        }
    }

    if (isRotating) {
        object.rotation.y += deltaX * rotationSpeed;
    } else if (isMoving) {
        camera.position.y += deltaY * moveSpeed;
    }

    touchStartX = touchMoveX;
    touchStartY = touchMoveY;
}, { passive: false }); // Disable passive mode to allow preventDefault()

// Reset lock on touch end
document.addEventListener("touchend", () => {
    isRotating = false;
    isMoving = false;
    isZooming = false;
});

// Handle zooming using mouse wheel
document.addEventListener("wheel", (e) => {
    if (!object || isRotating || isMoving) return; // Prevent zoom while rotating/moving

    e.preventDefault(); // Prevent default page zoom

    if (e.deltaY < 0 && zoomFactor < 1.8) {
        zoomFactor += zoomSpeed;
    } else if (e.deltaY > 0 && zoomFactor > 0.7) {
        zoomFactor -= zoomSpeed;
    }

    object.scale.set(originalScale * zoomFactor, originalScale * zoomFactor, originalScale * zoomFactor);
}, { passive: false }); // Prevent browser zooming

// Handle screen resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Prevent pinch-to-zoom on mobile browsers
document.addEventListener("gesturestart", (e) => {
    e.preventDefault();
});
document.addEventListener("gesturechange", (e) => {
    e.preventDefault();
});
document.addEventListener("gestureend", (e) => {
    e.preventDefault();
});

// Start rendering
animate();
