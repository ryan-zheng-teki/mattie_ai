import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'tween';
import { 
    NUCLEUS_RADIUS, ELECTRON_RADIUS, SHELL_RADIUS_BASE, SHELL_RADIUS_INCREMENT,
    ELECTRON_SPEED_MULTIPLIER, SHELL_COLORS, ELECTRON_COLORS, NUCLEUS_COLORS,
    POSITIVE_INDICATOR_COLOR, NEGATIVE_INDICATOR_COLOR, elements
} from './elements-data.js';
import { showTemporaryLabel, updateElementInfo, updateExplanationBox, updateShellStatus, getUIState } from './ui.js';

// Global visualization variables
let scene, camera, renderer, controls;
let currentAtomGroup = new THREE.Group();
let electrons = [];
let nucleusObject = null;
let chargeIndicator = null;
export let isFullscreen = false;

// Initialize the visualization scene
export function initVisualization() {
    console.log("Initializing ion visualization...");
    const container = document.getElementById('visualization-container');
    
    // Set up scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000011); // Slightly blue-black for better contrast
    
    // Set up camera
    const width = container.clientWidth;
    const height = container.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    
    // Set up renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);
    
    // Set up controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 5;
    controls.maxDistance = 50;
    controls.enableZoom = true;
    
    // Add atom group to scene
    scene.add(currentAtomGroup);
    
    // Set up fullscreen toggle
    document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);
    
    // Set up zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => zoomCamera(0.8));
    document.getElementById('zoom-out').addEventListener('click', () => zoomCamera(1.2));
    
    // Set up window resize handler
    window.addEventListener('resize', onWindowResize, false);
    
    console.log("Visualization initialization complete.");
}

// Create a visualization of an atom or ion
export function createAtomVisualization(elementSymbol, stateType) {
    console.log(`Creating visualization for ${elementSymbol} in ${stateType} state`);
    clearVisualization();
    
    const element = elements[elementSymbol];
    if (!element) {
        console.error(`Element data not found for: ${elementSymbol}`);
        return;
    }
    
    // Get the configuration for the requested state
    const configuration = stateType === 'neutral' ? element.neutralState : element.ionState;
    
    // Create nucleus
    const nucleusColor = NUCLEUS_COLORS[elementSymbol] || NUCLEUS_COLORS.default;
    nucleusObject = createNucleusMesh(nucleusColor);
    currentAtomGroup.add(nucleusObject);
    
    // Show temporary label for nucleus
    const canvasRect = renderer.domElement.getBoundingClientRect();
    const screenPosition = getScreenPosition(nucleusObject.position, camera, renderer);
    
    // Show nucleus label temporarily
    showTemporaryLabel('Nucleus', 
                       canvasRect.width/2, 
                       canvasRect.height/2, 
                       `#${new THREE.Color(nucleusColor).getHexString()}`, 
                       3000);
    
    // Create charge indicator if ion
    if (stateType === 'ion' && configuration.charge) {
        createChargeIndicator(configuration.charge, nucleusObject.position);
    }
    
    // Add electron shells and electrons
    electrons = []; // Reset global electrons array
    
    configuration.electronsPerShell.forEach((numElectronsInShell, shellIndex) => {
        const shellRadius = SHELL_RADIUS_BASE + shellIndex * SHELL_RADIUS_INCREMENT;
        
        // Create orbital shell visualization with color based on shell index
        const orbitalShell = createOrbitalShell(shellRadius, shellIndex);
        currentAtomGroup.add(orbitalShell);
        
        // For the outermost shell, add a temporary label
        if (shellIndex === configuration.electronsPerShell.length - 1) {
            const shellPosition = new THREE.Vector3(shellRadius * 0.7, shellRadius * 0.7, 0);
            const screenPos = getScreenPosition(shellPosition, camera, renderer);
            const shellNames = ['1st Shell (K)', '2nd Shell (L)', '3rd Shell (M)', '4th Shell (N)', '5th Shell (O)'];
            const shellName = shellNames[shellIndex] || `Shell ${shellIndex + 1}`;
            
            showTemporaryLabel(shellName,
                              screenPos.x + canvasRect.left,
                              screenPos.y + canvasRect.top,
                              `#${new THREE.Color(SHELL_COLORS[shellIndex]).getHexString()}`,
                              3000);
        }
        
        // Add electrons to this shell with color based on shell index
        addOrbitingElectrons(nucleusObject.position, numElectronsInShell, shellRadius, shellIndex);
    });
    
    // Update information displays
    updateElementInfo(element, stateType);
    updateExplanationBox(stateType === 'neutral' ? 
                        element.neutralState.description || `This is a neutral ${element.name} atom` : 
                        element.ionState.description || `This is a ${element.name} ion with a charge of ${element.ionState.charge}`);
    updateShellStatus(configuration.electronsPerShell);
    
    // Make objects hoverable
    makeObjectsHoverable();
}

// Create nucleus mesh
function createNucleusMesh(color, radius = NUCLEUS_RADIUS) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.5
    });
    const nucleus = new THREE.Mesh(geometry, material);
    
    return nucleus;
}

// Create orbital shell
function createOrbitalShell(radius, shellIndex) {
    // Get color based on shell index (with fallback)
    const color = SHELL_COLORS[shellIndex] || SHELL_COLORS[SHELL_COLORS.length - 1];
    
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25,
        wireframe: true
    });
    return new THREE.Mesh(geometry, material);
}

// Add orbiting electrons
function addOrbitingElectrons(centerPosition, count, orbitRadius, shellIndex = 0) {
    const addedElectrons = [];
    
    // Get electron color based on shell index (with fallback)
    const electronColor = ELECTRON_COLORS[shellIndex] || ELECTRON_COLORS[ELECTRON_COLORS.length - 1];
    
    for (let i = 0; i < count; i++) {
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: electronColor, 
            emissive: electronColor, 
            emissiveIntensity: 0.7
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        electronMesh.userData.isElectron = true;
        electronMesh.userData.shellIndex = shellIndex;
        
        // Add a small pulse animation to electrons
        electronMesh.scale.set(1, 1, 1);
        
        // Distribute in 3D space using spherical coordinates
        const phi = (Math.PI * 2 * i) / count;
        // Vary theta to create 3D distribution and prevent electrons in same plane
        const theta = Math.PI * (0.2 + (0.6 * i / count));
        
        const electronData = {
            mesh: electronMesh,
            shellIndex: shellIndex,
            radius: orbitRadius,
            phi: phi,
            theta: theta,
            phiSpeed: ELECTRON_SPEED_MULTIPLIER / (orbitRadius || 1),
            thetaSpeed: ELECTRON_SPEED_MULTIPLIER * 0.7 / (orbitRadius || 1),
            isAnimating: false,
            center: centerPosition,
            color: electronColor
        };
        
        // Set initial position using spherical coordinates
        updateElectronPosition(electronData, 0);
        
        electrons.push(electronData);
        addedElectrons.push(electronData);
        currentAtomGroup.add(electronMesh);
    }
    
    return addedElectrons;
}

// Update electron position
function updateElectronPosition(electron, deltaTime) {
    if (electron.isAnimating) return;
    
    // Update angles
    electron.phi += electron.phiSpeed * deltaTime;
    electron.theta += electron.thetaSpeed * deltaTime;
    
    // Convert spherical to cartesian coordinates
    const x = electron.center.x + electron.radius * Math.sin(electron.theta) * Math.cos(electron.phi);
    const y = electron.center.y + electron.radius * Math.sin(electron.theta) * Math.sin(electron.phi);
    const z = electron.center.z + electron.radius * Math.cos(electron.theta);
    
    electron.mesh.position.set(x, y, z);
    
    // Add a subtle pulsing effect to make electrons more visible
    const pulseScale = 1 + 0.1 * Math.sin(deltaTime * 2);
    electron.mesh.scale.set(pulseScale, pulseScale, pulseScale);
}

// Create charge indicator
function createChargeIndicator(charge, position) {
    // Remove existing charge indicator if any
    if (chargeIndicator) {
        currentAtomGroup.remove(chargeIndicator);
        if (chargeIndicator.geometry) chargeIndicator.geometry.dispose();
        if (chargeIndicator.material) chargeIndicator.material.dispose();
        chargeIndicator = null;
    }
    
    if (!charge || charge === '0') return; // No indicator for neutral atoms
    
    const isPositive = charge.startsWith('+');
    const chargeNumber = parseInt(charge.substring(1)) || 1;
    
    // Create a proper "+" or "-" sign using line segments
    const indicatorGroup = new THREE.Group();
    const lineWidth = 0.2;
    const lineLength = 1.5;
    const spacing = lineLength * 1.5;
    const chargeColor = isPositive ? POSITIVE_INDICATOR_COLOR : NEGATIVE_INDICATOR_COLOR;
    
    const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: chargeColor, 
        emissive: chargeColor,
        emissiveIntensity: 1.0
    });
    
    // Create all charge indicators separated in space
    for (let i = 0; i < chargeNumber; i++) {
        if (isPositive) {
            // Create "+" sign using two crossed rectangles
            const horizontalGeometry = new THREE.BoxGeometry(lineLength, lineWidth, lineWidth);
            const verticalGeometry = new THREE.BoxGeometry(lineWidth, lineLength, lineWidth);
            
            const horizontalLine = new THREE.Mesh(horizontalGeometry, lineMaterial.clone());
            const verticalLine = new THREE.Mesh(verticalGeometry, lineMaterial.clone());
            
            // Group for a single + sign
            const plusSignGroup = new THREE.Group();
            plusSignGroup.add(horizontalLine);
            plusSignGroup.add(verticalLine);
            
            // Position this + sign with proper spacing
            plusSignGroup.position.x = i * spacing;
            
            indicatorGroup.add(plusSignGroup);
        } else {
            // Create "-" sign using a single rectangle
            const horizontalGeometry = new THREE.BoxGeometry(lineLength, lineWidth, lineWidth);
            const horizontalLine = new THREE.Mesh(horizontalGeometry, lineMaterial.clone());
            
            // Position this - sign with proper spacing
            horizontalLine.position.x = i * spacing;
            
            indicatorGroup.add(horizontalLine);
        }
    }
    
    // Center the entire group based on its total width
    const totalWidth = (chargeNumber - 1) * spacing;
    indicatorGroup.position.x -= totalWidth / 2;
    
    // Position the indicators in a more visible location
    indicatorGroup.position.set(
        position.x, 
        position.y + SHELL_RADIUS_BASE + 2.5,
        position.z
    );
    
    // Scale the indicator to be more visible
    indicatorGroup.scale.set(2.0, 2.0, 2.0);
    
    // Add a temporary label for the charge
    const canvasRect = renderer.domElement.getBoundingClientRect();
    const screenPosition = getScreenPosition(indicatorGroup.position, camera, renderer);
    
    showTemporaryLabel(isPositive ? `+${chargeNumber} Charge` : `-${chargeNumber} Charge`,
                       screenPosition.x + canvasRect.left,
                       screenPosition.y + canvasRect.top,
                       isPositive ? '#ff4444' : '#44aaff',
                       3000);
    
    // Add a small glowing effect to the nucleus to reinforce the charge
    if (nucleusObject) {
        const glowIntensity = isPositive ? 0.4 : 0.2;
        const glowColor = isPositive ? 0xff4444 : 0x4444ff;
        
        // Update the nucleus material to show charge
        if (nucleusObject.material) {
            nucleusObject.material.emissive.setHex(glowColor);
            nucleusObject.material.emissiveIntensity = glowIntensity;
        }
    }
    
    chargeIndicator = indicatorGroup;
    currentAtomGroup.add(indicatorGroup);
    
    return indicatorGroup;
}

// Make objects hoverable with tooltips
function makeObjectsHoverable() {
    // Add hover capabilities to scene objects
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    // Add event listener for mouse movement
    renderer.domElement.addEventListener('mousemove', (event) => {
        // Calculate mouse position in normalized device coordinates
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the picking ray with the camera and mouse position
        raycaster.setFromCamera(mouse, camera);
        
        // Calculate objects intersecting the picking ray
        const intersects = raycaster.intersectObjects(currentAtomGroup.children, true);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            
            // Check if it's an electron
            if (object.userData.isElectron) {
                const shellIndex = object.userData.shellIndex;
                const shellNames = ['1st (K)', '2nd (L)', '3rd (M)', '4th (N)', '5th (O)'];
                const shellName = shellNames[shellIndex] || `${shellIndex+1}th`;
                
                // Show temporary label near the electron
                const screenPos = getScreenPosition(object.position, camera, renderer);
                showTemporaryLabel(`Electron in ${shellName} shell`,
                                  screenPos.x + rect.left,
                                  screenPos.y + rect.top,
                                  `#${new THREE.Color(object.material.color).getHexString()}`,
                                  1000);
            }
            // Could add more hover behaviors for nucleus, shells, etc.
        }
    });
}

// Get screen position from 3D position
function getScreenPosition(position, camera, renderer) {
    const vector = new THREE.Vector3(position.x, position.y, position.z);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    
    return { x, y };
}

// Toggle fullscreen mode
function toggleFullscreen() {
    const container = document.getElementById('visualization-container');
    const button = document.getElementById('fullscreen-button');
    const icon = button.querySelector('i');
    
    if (!isFullscreen) {
        // Enter fullscreen
        container.classList.add('fullscreen');
        icon.classList.remove('fa-expand');
        icon.classList.add('fa-compress');
    } else {
        // Exit fullscreen
        container.classList.remove('fullscreen');
        icon.classList.remove('fa-compress');
        icon.classList.add('fa-expand');
    }
    
    isFullscreen = !isFullscreen;
    
    // Resize renderer after a brief delay to ensure DOM has updated
    setTimeout(() => {
        onWindowResize();
    }, 100);
}

// Zoom camera in or out
function zoomCamera(factor) {
    if (!camera || !controls) return;
    
    // Move camera closer or further
    camera.position.z *= factor;
    
    // Ensure we respect min/max limits
    if (camera.position.z < controls.minDistance) {
        camera.position.z = controls.minDistance;
    } else if (camera.position.z > controls.maxDistance) {
        camera.position.z = controls.maxDistance;
    }
    
    camera.updateProjectionMatrix();
}

// Clear current visualization
function clearVisualization() {
    console.log("Clearing current visualization...");
    
    // Remove all objects from the atom group
    while (currentAtomGroup.children.length > 0) {
        const child = currentAtomGroup.children[0];
        currentAtomGroup.remove(child);
        
        // Dispose of geometries and materials
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
            if (Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
            } else {
                child.material.dispose();
            }
        }
    }
    
    electrons = []; // Clear electron tracking array
    nucleusObject = null;
    chargeIndicator = null;
    
    // Clear temporary labels
    document.getElementById('temporary-labels').innerHTML = '';
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('visualization-container');
    if (!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if (width === 0 || height === 0) return;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Update visualization based on element and state
export function updateVisualization(elementSymbol, stateType) {
    if (!elementSymbol) return;
    
    createAtomVisualization(elementSymbol, stateType);
    
    // Update UI state
    document.getElementById('element-select').value = elementSymbol;
    document.getElementById('state-select').value = stateType;
}

// Update electron positions for animation
export function updateElectronPositions(currentTime) {
    if (electrons.length === 0) return;
    
    electrons.forEach(electron => {
        updateElectronPosition(electron, currentTime);
    });
}

// Animation loop
let lastTime = 0;
export function animate(time) {
    requestAnimationFrame(animate);
    const timeSeconds = time * 0.001;
    const deltaTime = (timeSeconds - lastTime);
    lastTime = timeSeconds;
    
    controls.update();
    TWEEN.update(time); // Added this line to update TWEEN animations
    
    // Only update electron positions if there are electrons to animate
    if (electrons.length > 0 && !isNaN(deltaTime) && deltaTime > 0) {
        updateElectronPositions(timeSeconds);
    }
    
    renderer.render(scene, camera);
}

// Get access to electrons for animation
export function getElectrons() {
    return electrons;
}

// Get access to the atom group
export function getCurrentAtomGroup() {
    return currentAtomGroup;
}

// Get scene and camera
export function getSceneAndCamera() {
    return { scene, camera, renderer };
}
