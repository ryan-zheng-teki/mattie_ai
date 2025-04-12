import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'tween';

// --- Constants and Configuration ---
const NUCLEUS_RADIUS = 1.0;
const ELECTRON_RADIUS = 0.25;
const SHELL_RADIUS_BASE = 2.5;
const SHELL_RADIUS_INCREMENT = 1.0;
const ELECTRON_SPEED_MULTIPLIER = 0.5;
const POSITIVE_INDICATOR_COLOR = 0xff4444; // Red for positive charge
const NEGATIVE_INDICATOR_COLOR = 0x44aaff; // Blue for negative charge

// Color arrays for shells and electrons
const SHELL_COLORS = [
    0xcc3333, // Red (1st shell - K)
    0x33cc33, // Green (2nd shell - L) 
    0x3333cc, // Blue (3rd shell - M)
    0xcc33cc, // Purple (4th shell - N)
    0xcccc33  // Yellow (5th shell - O)
];

const ELECTRON_COLORS = [
    0xff5555, // Bright red (1st shell electrons)
    0x55ff55, // Bright green (2nd shell electrons)
    0x5555ff, // Bright blue (3rd shell electrons)
    0xff55ff, // Bright purple (4th shell electrons)
    0xffff55  // Bright yellow (5th shell electrons)
];

// Element colors by nucleus
const NUCLEUS_COLORS = {
    Na: 0xff6600, // Orange for Sodium
    Cl: 0x00cc44, // Green for Chlorine
    Mg: 0xffaa00, // Light Orange for Magnesium
    Ca: 0xffdd44, // Yellow for Calcium
    K:  0xff8800, // Dark Orange for Potassium
    F:  0x00ddaa, // Teal for Fluorine
    Al: 0xdddddd, // Silver for Aluminum
    O:  0x00aaff, // Light Blue for Oxygen
    default: 0x888888 // Grey default
};

// --- Element Data with Neutral and Ion States ---
const elements = {
    Na: { 
        name: 'Sodium', 
        symbol: 'Na', 
        neutralState: {
            electronsPerShell: [2, 8, 1],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+1',
            stable: true,
            description: 'Na+ (Sodium Ion): Lost 1 electron from outer shell to achieve stable noble gas configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    Cl: { 
        name: 'Chlorine', 
        symbol: 'Cl', 
        neutralState: {
            electronsPerShell: [2, 8, 7],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '-1',
            stable: true,
            description: 'Cl- (Chloride Ion): Gained 1 electron in outer shell to achieve stable octet configuration (like Argon).'
        },
        ionizationAnimation: true
    },
    Mg: { 
        name: 'Magnesium', 
        symbol: 'Mg', 
        neutralState: {
            electronsPerShell: [2, 8, 2],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+2',
            stable: true,
            description: 'Mg2+ (Magnesium Ion): Lost 2 electrons from outer shell to achieve stable noble gas configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    Ca: { 
        name: 'Calcium', 
        symbol: 'Ca', 
        neutralState: {
            electronsPerShell: [2, 8, 8, 2],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '+2',
            stable: true,
            description: 'Ca2+ (Calcium Ion): Lost 2 electrons from outer shell to achieve stable noble gas configuration (like Argon).'
        },
        ionizationAnimation: true
    },
    K: { 
        name: 'Potassium', 
        symbol: 'K', 
        neutralState: {
            electronsPerShell: [2, 8, 8, 1],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8, 8],
            charge: '+1',
            stable: true,
            description: 'K+ (Potassium Ion): Lost 1 electron from outer shell to achieve stable noble gas configuration (like Argon).'
        },
        ionizationAnimation: true
    },
    F: { 
        name: 'Fluorine', 
        symbol: 'F', 
        neutralState: {
            electronsPerShell: [2, 7],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '-1',
            stable: true,
            description: 'F- (Fluoride Ion): Gained 1 electron in outer shell to achieve stable octet configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    Al: { 
        name: 'Aluminum', 
        symbol: 'Al', 
        neutralState: {
            electronsPerShell: [2, 8, 3],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '+3',
            stable: true,
            description: 'Al3+ (Aluminum Ion): Lost 3 electrons from outer shell to achieve stable noble gas configuration (like Neon).'
        },
        ionizationAnimation: true
    },
    O: { 
        name: 'Oxygen', 
        symbol: 'O', 
        neutralState: {
            electronsPerShell: [2, 6],
            stable: false
        },
        ionState: {
            electronsPerShell: [2, 8],
            charge: '-2',
            stable: true,
            description: 'O2- (Oxide Ion): Gained 2 electrons in outer shell to achieve stable octet configuration (like Neon).'
        },
        ionizationAnimation: true
    }
};

// --- Global Variables ---
let scene, camera, renderer, controls;
let currentAtomGroup = new THREE.Group();
let electrons = [];
let nucleusObject = null;
let chargeIndicator = null;
let currentElement = null;
let currentState = 'neutral';
let animationInProgress = false;

// --- Initialization ---
function init() {
    console.log("Initializing ion visualization...");
    const container = document.getElementById('visualization-container');
    const elementInfo = document.getElementById('element-info');
    const chargeInfo = document.getElementById('charge-info');
    const animateButton = document.getElementById('animate-button');
    
    // Set up scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);
    
    // Set up controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    
    // Add atom group to scene
    scene.add(currentAtomGroup);
    
    // Set up event listeners
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('element-select').addEventListener('change', onElementChange);
    document.getElementById('state-select').addEventListener('change', onStateChange);
    animateButton.addEventListener('click', animateIonization);
    
    // Initial display
    const initialSelection = 'Na'; // Start with Sodium
    document.getElementById('element-select').value = initialSelection;
    updateVisualization(initialSelection, 'neutral');
    
    console.log("Initialization complete.");
    animate();
}

// --- Atom and Ion Visualization ---

// Create nucleus mesh
function createNucleusMesh(color, radius = NUCLEUS_RADIUS) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.3 
    });
    return new THREE.Mesh(geometry, material);
}

// Create orbital shell with color based on shell index
function createOrbitalShell(radius, shellIndex) {
    // Get color based on shell index (with fallback)
    const color = SHELL_COLORS[shellIndex] || SHELL_COLORS[SHELL_COLORS.length - 1];
    
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.15,
        wireframe: true
    });
    return new THREE.Mesh(geometry, material);
}

// Add electrons to 3D orbital shells with color based on shell index
function addOrbitingElectrons(centerPosition, count, orbitRadius, shellIndex = 0) {
    const addedElectrons = [];
    
    // Get electron color based on shell index (with fallback)
    const electronColor = ELECTRON_COLORS[shellIndex] || ELECTRON_COLORS[ELECTRON_COLORS.length - 1];
    
    for (let i = 0; i < count; i++) {
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: electronColor, 
            emissive: electronColor, 
            emissiveIntensity: 0.5 
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        
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

// Update electron position for animation
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
}

// Create charge indicator (+ or - signs)
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
    
    // Create a proper "+" or "-" sign using line segments instead of a sphere
    const indicatorGroup = new THREE.Group();
    const lineWidth = 0.1;
    const lineLength = 0.8;
    const chargeColor = isPositive ? POSITIVE_INDICATOR_COLOR : NEGATIVE_INDICATOR_COLOR;
    
    const lineMaterial = new THREE.MeshBasicMaterial({ 
        color: chargeColor, 
        emissive: chargeColor,
        emissiveIntensity: 1.0
    });
    
    if (isPositive) {
        // Create "+" sign using two crossed rectangles
        const horizontalGeometry = new THREE.BoxGeometry(lineLength, lineWidth, lineWidth);
        const verticalGeometry = new THREE.BoxGeometry(lineWidth, lineLength, lineWidth);
        
        const horizontalLine = new THREE.Mesh(horizontalGeometry, lineMaterial);
        const verticalLine = new THREE.Mesh(verticalGeometry, lineMaterial);
        
        indicatorGroup.add(horizontalLine);
        indicatorGroup.add(verticalLine);
        
        // Add more + signs if charge is greater than 1
        if (chargeNumber > 1) {
            for (let i = 1; i < chargeNumber; i++) {
                const additionalHLine = new THREE.Mesh(horizontalGeometry.clone(), lineMaterial.clone());
                const additionalVLine = new THREE.Mesh(verticalGeometry.clone(), lineMaterial.clone());
                
                additionalHLine.position.x = i * (lineLength * 0.7);
                additionalVLine.position.x = i * (lineLength * 0.7);
                
                indicatorGroup.add(additionalHLine);
                indicatorGroup.add(additionalVLine);
            }
        }
    } else {
        // Create "-" sign using a single rectangle
        const horizontalGeometry = new THREE.BoxGeometry(lineLength, lineWidth, lineWidth);
        const horizontalLine = new THREE.Mesh(horizontalGeometry, lineMaterial);
        indicatorGroup.add(horizontalLine);
        
        // Add more - signs if charge is greater than 1
        if (chargeNumber > 1) {
            for (let i = 1; i < chargeNumber; i++) {
                const additionalLine = new THREE.Mesh(horizontalGeometry.clone(), lineMaterial.clone());
                additionalLine.position.x = i * (lineLength * 0.7);
                indicatorGroup.add(additionalLine);
            }
        }
    }
    
    // Position the indicator in a more obvious location - above and to the right of the nucleus
    indicatorGroup.position.set(
        position.x + NUCLEUS_RADIUS * 2, 
        position.y + NUCLEUS_RADIUS * 2,
        position.z
    );
    
    // Scale the indicator to be more visible
    indicatorGroup.scale.set(1.5, 1.5, 1.5);
    
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

// Create atom visualization
function createAtomVisualization(elementSymbol, stateType) {
    console.log(`Creating visualization for ${elementSymbol} in ${stateType} state`);
    clearVisualization();
    
    const element = elements[elementSymbol];
    if (!element) {
        console.error(`Element data not found for: ${elementSymbol}`);
        return;
    }
    
    currentElement = elementSymbol;
    currentState = stateType;
    
    // Get the configuration for the requested state
    const configuration = stateType === 'neutral' ? element.neutralState : element.ionState;
    
    // Create nucleus
    const nucleusColor = NUCLEUS_COLORS[elementSymbol] || NUCLEUS_COLORS.default;
    nucleusObject = createNucleusMesh(nucleusColor);
    currentAtomGroup.add(nucleusObject);
    
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
        
        // Add electrons to this shell with color based on shell index
        addOrbitingElectrons(nucleusObject.position, numElectronsInShell, shellRadius, shellIndex);
    });
    
    // Update information displays
    updateElementInfo(element, stateType);
    
    // Enable/disable animation button
    const animateButton = document.getElementById('animate-button');
    animateButton.disabled = animationInProgress || !element.ionizationAnimation || 
                            (stateType === 'ion' && elementRequiresElectronGain(elementSymbol));
}

// Update element information displays
function updateElementInfo(element, stateType) {
    const elementInfo = document.getElementById('element-info');
    const chargeInfo = document.getElementById('charge-info');
    
    if (stateType === 'neutral') {
        const stableText = element.neutralState.stable ? 'Stable (filled outer shell).' : 'Not stable (incomplete outer shell).';
        elementInfo.textContent = `${element.name} (${element.symbol}): Neutral Atom`;
        elementInfo.className = 'info-box neutral-charge';
        
        chargeInfo.innerHTML = `Electronic Configuration: ${element.neutralState.electronsPerShell.join(', ')}.<br>${stableText}`;
        chargeInfo.className = 'info-box neutral-charge';
    } else {
        // Ion state
        const chargeClass = element.ionState.charge.startsWith('+') ? 'positive-charge' : 'negative-charge';
        
        elementInfo.textContent = `${element.name} (${element.symbol}${element.ionState.charge}): Ion`;
        elementInfo.className = `info-box ${chargeClass}`;
        
        chargeInfo.innerHTML = element.ionState.description;
        chargeInfo.className = `info-box ${chargeClass}`;
    }
}

// Helper to determine if element requires electron gain (for animation direction)
function elementRequiresElectronGain(elementSymbol) {
    const element = elements[elementSymbol];
    if (!element || !element.ionState || !element.ionState.charge) return false;
    
    // If charge is negative, element gains electrons
    return element.ionState.charge.startsWith('-');
}

// --- Animations ---

// Animate ionization (electron loss) or electron gain
function animateIonization() {
    if (animationInProgress || !currentElement) return;
    
    const element = elements[currentElement];
    if (!element || !element.ionizationAnimation) return;
    
    animationInProgress = true;
    document.getElementById('animate-button').disabled = true;
    
    // Determine if we're showing electron loss or gain
    const isElectronGain = elementRequiresElectronGain(currentElement);
    
    if (isElectronGain) {
        animateElectronGain();
    } else {
        animateElectronLoss();
    }
}

// Animate electron loss (for cations)
function animateElectronLoss() {
    const element = elements[currentElement];
    const neutralState = element.neutralState;
    const ionState = element.ionState;
    
    // Calculate how many electrons to remove
    let electronsToRemove = 0;
    for (let i = 0; i < neutralState.electronsPerShell.length; i++) {
        const neutralShell = neutralState.electronsPerShell[i] || 0;
        const ionShell = ionState.electronsPerShell[i] || 0;
        electronsToRemove += Math.max(0, neutralShell - ionShell);
    }
    
    // Find the electrons to animate (from outer shell)
    const outerShellIndex = neutralState.electronsPerShell.length - 1;
    const outerShellElectrons = electrons.filter(e => e.shellIndex === outerShellIndex);
    
    // If no electrons to animate, switch display directly
    if (outerShellElectrons.length === 0 || electronsToRemove === 0) {
        updateVisualization(currentElement, 'ion');
        animationInProgress = false;
        document.getElementById('animate-button').disabled = false;
        return;
    }
    
    // Mark electrons for animation
    const electronsToAnimate = outerShellElectrons.slice(0, electronsToRemove);
    electronsToAnimate.forEach(electron => {
        electron.isAnimating = true;
    });
    
    // Update info during animation
    const chargeInfo = document.getElementById('charge-info');
    chargeInfo.textContent = `Ionization in progress: ${element.symbol} → ${element.symbol}${ionState.charge}`;
    
    let completedAnimations = 0;
    
    // Animate each electron moving away
    electronsToAnimate.forEach((electron, index) => {
        const startPos = electron.mesh.position.clone();
        const direction = startPos.clone().normalize().multiplyScalar(15);
        
        // Add some randomization to make it look more natural
        direction.x += (Math.random() - 0.5) * 5;
        direction.y += (Math.random() - 0.5) * 5;
        direction.z += (Math.random() - 0.5) * 5;
        
        const targetPos = startPos.clone().add(direction);
        
        // Stagger the animations slightly
        setTimeout(() => {
            new TWEEN.Tween(electron.mesh.position)
                .to(targetPos, 1500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(() => {
                    // Remove the electron
                    currentAtomGroup.remove(electron.mesh);
                    if (electron.mesh.geometry) electron.mesh.geometry.dispose();
                    if (electron.mesh.material) electron.mesh.material.dispose();
                    
                    completedAnimations++;
                    
                    // When all animations are done, update to ion state
                    if (completedAnimations === electronsToAnimate.length) {
                        setTimeout(() => {
                            updateVisualization(currentElement, 'ion');
                            animationInProgress = false;
                            document.getElementById('animate-button').disabled = false;
                            document.getElementById('state-select').value = 'ion';
                        }, 500);
                    }
                }).start();
        }, index * 200); // Stagger start times
    });
}

// Animate electron gain (for anions)
function animateElectronGain() {
    const element = elements[currentElement];
    const neutralState = element.neutralState;
    const ionState = element.ionState;
    
    // Calculate how many electrons to add
    let electronsToAdd = 0;
    for (let i = 0; i < ionState.electronsPerShell.length; i++) {
        const neutralShell = neutralState.electronsPerShell[i] || 0;
        const ionShell = ionState.electronsPerShell[i] || 0;
        electronsToAdd += Math.max(0, ionShell - neutralShell);
    }
    
    // If no electrons to add, switch display directly
    if (electronsToAdd === 0) {
        updateVisualization(currentElement, 'ion');
        animationInProgress = false;
        document.getElementById('animate-button').disabled = false;
        return;
    }
    
    // Find the target shell (usually the outer shell)
    const targetShellIndex = neutralState.electronsPerShell.length - 1;
    const targetRadius = SHELL_RADIUS_BASE + targetShellIndex * SHELL_RADIUS_INCREMENT;
    const electronColor = ELECTRON_COLORS[targetShellIndex] || ELECTRON_COLORS[ELECTRON_COLORS.length - 1];
    
    // Update info during animation
    const chargeInfo = document.getElementById('charge-info');
    chargeInfo.textContent = `Electron gain in progress: ${element.symbol} → ${element.symbol}${ionState.charge}`;
    
    // Create incoming electrons
    const incomingElectrons = [];
    for (let i = 0; i < electronsToAdd; i++) {
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: electronColor, 
            emissive: electronColor, 
            emissiveIntensity: 0.5 
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        
        // Start from random positions outside the atom
        const randomDir = new THREE.Vector3(
            Math.random() - 0.5,
            Math.random() - 0.5,
            Math.random() - 0.5
        ).normalize().multiplyScalar(targetRadius * 3);
        
        electronMesh.position.copy(randomDir);
        
        const electronData = {
            mesh: electronMesh,
            shellIndex: targetShellIndex,
            radius: targetRadius,
            phi: Math.random() * Math.PI * 2,
            theta: Math.PI * (0.2 + Math.random() * 0.6),
            phiSpeed: ELECTRON_SPEED_MULTIPLIER / (targetRadius || 1),
            thetaSpeed: ELECTRON_SPEED_MULTIPLIER * 0.7 / (targetRadius || 1),
            isAnimating: true,
            center: new THREE.Vector3(0, 0, 0),
            color: electronColor
        };
        
        incomingElectrons.push(electronData);
        electrons.push(electronData);
        currentAtomGroup.add(electronMesh);
    }
    
    let completedAnimations = 0;
    
    // Animate each electron moving to the atom
    incomingElectrons.forEach((electron, index) => {
        // Calculate target position on the shell
        const targetPos = new THREE.Vector3(
            targetRadius * Math.sin(electron.theta) * Math.cos(electron.phi),
            targetRadius * Math.sin(electron.theta) * Math.sin(electron.phi),
            targetRadius * Math.cos(electron.theta)
        );
        
        // Stagger the animations slightly
        setTimeout(() => {
            new TWEEN.Tween(electron.mesh.position)
                .to(targetPos, 1500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .onComplete(() => {
                    electron.isAnimating = false;
                    completedAnimations++;
                    
                    // When all animations are done, update to ion state
                    if (completedAnimations === incomingElectrons.length) {
                        setTimeout(() => {
                            updateVisualization(currentElement, 'ion');
                            animationInProgress = false;
                            document.getElementById('animate-button').disabled = false;
                            document.getElementById('state-select').value = 'ion';
                        }, 500);
                    }
                }).start();
        }, index * 200); // Stagger start times
    });
}

// --- Helper Functions ---

// Clear current visualization
function clearVisualization() {
    console.log("Clearing current visualization...");
    TWEEN.removeAll(); // Stop animations
    
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
}

// Update visualization based on element and state
function updateVisualization(elementSymbol, stateType) {
    createAtomVisualization(elementSymbol, stateType);
    
    // Update UI state
    document.getElementById('element-select').value = elementSymbol;
    document.getElementById('state-select').value = stateType;
}

// --- Event Handlers ---

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

// Handle element selection change
function onElementChange(event) {
    const selectedElement = event.target.value;
    updateVisualization(selectedElement, currentState);
}

// Handle state selection change
function onStateChange(event) {
    const selectedState = event.target.value;
    updateVisualization(currentElement, selectedState);
}

// --- Animation Loop ---
let lastTime = 0;

function updateElectronPositions(currentTime) {
    const deltaTime = (currentTime - lastTime);
    lastTime = currentTime;
    
    if (isNaN(deltaTime) || deltaTime <= 0 || electrons.length === 0) return;
    
    electrons.forEach(electron => {
        updateElectronPosition(electron, deltaTime);
    });
}

function animate(time) {
    requestAnimationFrame(animate);
    const timeSeconds = time * 0.001;
    
    controls.update();
    TWEEN.update(time);
    
    // Only update electron positions if there are electrons to animate
    if (electrons.length > 0) {
        updateElectronPositions(timeSeconds);
    }
    
    renderer.render(scene, camera);
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 50);
});
