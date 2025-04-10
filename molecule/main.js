import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import TWEEN from 'tween'; // Import Tween.js

// --- Constants and Configuration ---
const NUCLEUS_RADIUS = 1.0;
const ELECTRON_RADIUS = 0.25;
const SHELL_RADIUS_BASE = 2.5;
const SHELL_RADIUS_INCREMENT = 1.0;
const ELECTRON_SPEED_MULTIPLIER = 0.5;
const ORBIT_COLOR = 0xaaaaaa;
const ELECTRON_COLOR = 0x0077ff;
const BOND_COLOR = 0xffffff; // White for covalent bonds
const BOND_LINEWIDTH = 2; // Doesn't work on all systems, but set anyway

const NUCLEUS_COLORS = {
    H: 0xff4444, // Red
    He: 0xffaa00, // Orange
    Li: 0x44ff44, // Green
    O: 0x00aaff, // Light Blue/Cyan
    Ne: 0x4444ff, // Blue
    S: 0xeeee00, // Yellow for Sulfur
    default: 0x888888 // Grey
};

// --- Element Data ---
const elements = {
    H: { name: 'Hydrogen', symbol: 'H', electronsPerShell: [1] },
    He: { name: 'Helium', symbol: 'He', electronsPerShell: [2], stable: true },
    Li: { name: 'Lithium', symbol: 'Li', electronsPerShell: [2, 1] },
    O: { name: 'Oxygen', symbol: 'O', electronsPerShell: [2, 6], stable: false },
    Ne: { name: 'Neon', symbol: 'Ne', electronsPerShell: [2, 8], stable: true },
    S: { name: 'Sulfur', symbol: 'S', electronsPerShell: [2, 8, 6], stable: false },
    // H2O and SO4 are handled as special cases, not element data
};

// --- Global Variables ---
let scene, camera, renderer, controls;
let currentAtomGroup = new THREE.Group(); // Holds the current atom OR molecule display
let electrons = []; // Holds electrons for animation (used for single atoms and lone pairs in H2O)
let ionizeButton, oxidizeButton, infoElement;
let isMoleculeView = false; // Flag to differentiate between atom and molecule display

// --- Initialization --- (Mostly unchanged)
function init() {
    console.log("Initializing visualization...");
    const container = document.getElementById('visualization-container');
    ionizeButton = document.getElementById('ionize-h-button');
    oxidizeButton = document.getElementById('oxidize-o-button');
    infoElement = document.getElementById('element-info');

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 15;
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight.position.set(5, 5, 10);
    scene.add(pointLight);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 3;
    controls.maxDistance = 50;
    scene.add(currentAtomGroup);

    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('element-select').addEventListener('change', onElementChange);
    ionizeButton.addEventListener('click', animateHydrogenIonization);
    oxidizeButton.addEventListener('click', animateOxidation);

    const initialSelection = 'H'; // Start with Hydrogen
    document.getElementById('element-select').value = initialSelection;
    displayAtom(elements[initialSelection]); // Display initial atom

    console.log("Initialization complete.");
    animate();
}

// --- Atom Creation / Molecule Display ---

// Helper to create nucleus mesh
function createNucleusMesh(color, radius = NUCLEUS_RADIUS) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.3 });
    return new THREE.Mesh(geometry, material);
}

// Create a 3D orbital shell visualization
function createOrbitalShell(radius, color = ORBIT_COLOR) {
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });
    return new THREE.Mesh(geometry, material);
}

// Helper to add electrons in 3D orbital space
function addOrbitingElectrons(centerPosition, count, orbitRadius, shellIndex = 0) {
    const addedElectrons = []; // Track electrons added in this call
    
    for (let i = 0; i < count; i++) {
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: ELECTRON_COLOR, 
            emissive: ELECTRON_COLOR, 
            emissiveIntensity: 0.5 
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        
        // Distribute initial positions evenly in 3D space
        // Using spherical coordinates for true 3D positioning
        // Phi: Azimuthal angle in xy-plane (longitude)
        // Theta: Polar angle from z-axis (latitude)
        const phi = (Math.PI * 2 * i) / count;
        
        // Offset theta for each electron to prevent them all being in same plane
        const theta = Math.PI * (0.2 + (0.6 * i / count));
        
        const electronData = {
            mesh: electronMesh,
            shellIndex: shellIndex,
            radius: orbitRadius,
            // 3D orbit parameters
            phi: phi,              // Azimuthal angle
            theta: theta,          // Polar angle
            phiSpeed: ELECTRON_SPEED_MULTIPLIER / (orbitRadius || 1),
            thetaSpeed: ELECTRON_SPEED_MULTIPLIER * 0.7 / (orbitRadius || 1), // Different speed for 3D effect
            isIonizing: false,
            isIncoming: false,
            center: centerPosition
        };
        
        // Set initial position using spherical coordinates
        updateElectronPosition(electronData, 0);
        
        electrons.push(electronData);
        addedElectrons.push(electronData);
        currentAtomGroup.add(electronMesh);
    }
    
    return addedElectrons;
}

// Update a single electron's position using 3D spherical coordinates
function updateElectronPosition(electron, deltaTime) {
    if (electron.isIonizing || electron.isIncoming) return;
    
    // Update angles
    electron.phi += electron.phiSpeed * deltaTime;
    electron.theta += electron.thetaSpeed * deltaTime;
    
    // Convert spherical to cartesian coordinates
    const x = electron.center.x + electron.radius * Math.sin(electron.theta) * Math.cos(electron.phi);
    const y = electron.center.y + electron.radius * Math.sin(electron.theta) * Math.sin(electron.phi);
    const z = electron.center.z + electron.radius * Math.cos(electron.theta);
    
    electron.mesh.position.set(x, y, z);
}

// Creates a single atom display with 3D orbits
function createAtom(elementData) {
    console.log(`Creating atom for: ${elementData.name} (${elementData.symbol})`);
    clearVisualization();

    const nucleusColor = NUCLEUS_COLORS[elementData.symbol] || NUCLEUS_COLORS.default;
    const nucleus = createNucleusMesh(nucleusColor);
    currentAtomGroup.add(nucleus);

    electrons = []; // Reset global electrons array
    let electronCount = 0;
    
    elementData.electronsPerShell.forEach((numElectronsInShell, shellIndex) => {
        const shellRadius = SHELL_RADIUS_BASE + shellIndex * SHELL_RADIUS_INCREMENT;

        // 3D Orbit Visualization - now a wireframe sphere instead of a circle
        const orbitalShell = createOrbitalShell(shellRadius);
        currentAtomGroup.add(orbitalShell);

        // Add electrons for this shell with 3D orbits
        const added = addOrbitingElectrons(nucleus.position, numElectronsInShell, shellRadius, shellIndex);
        electronCount += added.length;
    });
    
    console.log(`Total electrons created: ${electronCount}`);
    isMoleculeView = false; // It's an atom view
}

// Creates the H2O molecule display with 3D electron positions
function displayWaterMolecule() {
    console.log("Displaying H2O molecule structure in 3D.");
    clearVisualization();
    isMoleculeView = true;
    electrons = []; // Reset global electrons array

    infoElement.textContent = "Water (H₂O) Structure";

    const oxygenNucleus = createNucleusMesh(NUCLEUS_COLORS['O']);
    const hydrogenNucleus1 = createNucleusMesh(NUCLEUS_COLORS['H'], NUCLEUS_RADIUS * 0.6);
    const hydrogenNucleus2 = createNucleusMesh(NUCLEUS_COLORS['H'], NUCLEUS_RADIUS * 0.6);

    // Position based on bent shape (O at origin)
    const bondLength = SHELL_RADIUS_BASE * 0.8;
    const angle = 104.5 * (Math.PI / 180); // Water bond angle in radians

    // Position H atoms in 3D space to show true tetrahedral-like arrangement
    // This places them at the correct bond angle but in different planes
    hydrogenNucleus1.position.set(
        bondLength * Math.cos(angle / 2),
        bondLength * Math.sin(angle / 2),
        0
    );
    
    hydrogenNucleus2.position.set(
        bondLength * Math.cos(-angle / 2),
        bondLength * Math.sin(-angle / 2),
        0
    );

    currentAtomGroup.add(oxygenNucleus);
    currentAtomGroup.add(hydrogenNucleus1);
    currentAtomGroup.add(hydrogenNucleus2);

    // Draw covalent bonds (lines)
    const bondMaterial = new THREE.LineBasicMaterial({ color: BOND_COLOR, linewidth: BOND_LINEWIDTH });

    const bondGeometry1 = new THREE.BufferGeometry().setFromPoints([
        oxygenNucleus.position, 
        hydrogenNucleus1.position
    ]);
    const bondLine1 = new THREE.Line(bondGeometry1, bondMaterial);

    const bondGeometry2 = new THREE.BufferGeometry().setFromPoints([
        oxygenNucleus.position, 
        hydrogenNucleus2.position
    ]);
    const bondLine2 = new THREE.Line(bondGeometry2, bondMaterial);

    currentAtomGroup.add(bondLine1);
    currentAtomGroup.add(bondLine2);

    // Add Oxygen's 4 lone pair electrons in 3D space
    const lonePairOrbitRadius = SHELL_RADIUS_BASE * 0.6;
    addOrbitingElectrons(oxygenNucleus.position, 4, lonePairOrbitRadius, 0);

    infoElement.textContent = "Water (H₂O): Oxygen shares electrons with two Hydrogens (covalent bonds shown as lines). Oxygen has 4 non-bonding lone pair electrons (shown orbiting in 3D). Stable molecule.";
}

// Creates a Sulfate (SO4) molecule to demonstrate S+6 and O-2 oxidation states
function displaySulfateMolecule() {
    console.log("Displaying SO₄²⁻ (Sulfate) structure in 3D.");
    clearVisualization();
    isMoleculeView = true;
    electrons = [];

    infoElement.textContent = "Sulfate (SO₄²⁻) Structure";

    // Create nucleus for sulfur (center)
    const sulfurNucleus = createNucleusMesh(NUCLEUS_COLORS['S'], NUCLEUS_RADIUS * 1.2);
    currentAtomGroup.add(sulfurNucleus);

    // Create four oxygen nuclei around sulfur in tetrahedral arrangement
    const oxygenNuclei = [];
    const bondLength = SHELL_RADIUS_BASE * 1.2; // S-O bond length
    
    // Tetrahedral positions for oxygens (based on vertices of tetrahedron)
    const tetrahedralPositions = [
        new THREE.Vector3(bondLength, bondLength, bondLength),
        new THREE.Vector3(-bondLength, -bondLength, bondLength),
        new THREE.Vector3(bondLength, -bondLength, -bondLength),
        new THREE.Vector3(-bondLength, bondLength, -bondLength)
    ];
    
    // Create oxygen nuclei at tetrahedral positions
    for (let i = 0; i < 4; i++) {
        const oxygenNucleus = createNucleusMesh(NUCLEUS_COLORS['O'], NUCLEUS_RADIUS * 0.9);
        oxygenNucleus.position.copy(tetrahedralPositions[i]);
        currentAtomGroup.add(oxygenNucleus);
        oxygenNuclei.push(oxygenNucleus);
        
        // Draw bond between sulfur and this oxygen
        const bondGeometry = new THREE.BufferGeometry().setFromPoints([
            sulfurNucleus.position,
            oxygenNucleus.position
        ]);
        const bondMaterial = new THREE.LineBasicMaterial({ 
            color: BOND_COLOR, 
            linewidth: BOND_LINEWIDTH 
        });
        const bondLine = new THREE.Line(bondGeometry, bondMaterial);
        currentAtomGroup.add(bondLine);
        
        // Add 8 electrons (forming octet) around each oxygen
        // These represent the -2 charge state of each oxygen
        addOrbitingElectrons(oxygenNucleus.position, 8, SHELL_RADIUS_BASE * 0.5, 0);
    }
    
    // Note: Sulfur has given up 6 electrons (to the oxygens), so it has +6 oxidation state
    infoElement.textContent = "Sulfate ion (SO₄²⁻): Sulfur (+6 oxidation state) shares electrons with four oxygens (-2 oxidation state each) in tetrahedral arrangement. Total charge: -2.";
    
    // Adjust camera to better view the larger molecule
    camera.position.z = 20;
}

// --- Update and Animation ---
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

// --- Ionization/Reduction Animations ---
function animateHydrogenIonization() {
    if (isMoleculeView || document.getElementById('element-select').value !== 'H' || electrons.length !== 1) return;
    const electron = electrons[0];
    if (electron.isIonizing || electron.isIncoming) return;
    electron.isIonizing = true;
    ionizeButton.disabled = true;
    infoElement.textContent = "Hydrogen ionizing...";
    const startPos = electron.mesh.position.clone();
    const direction = startPos.clone().normalize().multiplyScalar(15);
    const targetPos = startPos.clone().add(direction); 
    targetPos.z += 7;
    
    new TWEEN.Tween(electron.mesh.position)
        .to(targetPos, 2000)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            currentAtomGroup.remove(electron.mesh);
            if (electron.mesh.geometry) electron.mesh.geometry.dispose();
            if (electron.mesh.material) electron.mesh.material.dispose();
            electrons.splice(0, 1);
            infoElement.textContent = "Hydrogen Ion (H+). Lost 1 electron. Net charge: +1.";
            ionizeButton.style.display = 'none';
        }).start();
}

function animateOxidation() {
    if (isMoleculeView || document.getElementById('element-select').value !== 'O' || electrons.length !== 8) return;
    if (electrons.some(e => e.isIonizing || e.isIncoming)) return;
    
    oxidizeButton.disabled = true;
    infoElement.textContent = "Oxygen gaining electrons...";
    const targetShellIndex = 1;
    const targetRadius = SHELL_RADIUS_BASE + targetShellIndex * SHELL_RADIUS_INCREMENT;
    
    // Create two new electrons with 3D positions
    const incomingElectronsData = [];
    for (let i = 0; i < 2; i++) {
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: ELECTRON_COLOR, 
            emissive: ELECTRON_COLOR, 
            emissiveIntensity: 0.5 
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        
        // Start from different positions in 3D space
        const startPos = (i === 0) 
            ? new THREE.Vector3(targetRadius * 2.5, 0, 5) 
            : new THREE.Vector3(-targetRadius * 2.5, 0, -5);
            
        electronMesh.position.copy(startPos);
        
        // 3D orbit parameters
        const phi = (Math.PI * 2 * (6 + i)) / 8; // Position in outer shell
        const theta = Math.PI * (0.4 + (0.2 * i)); // Different polar angles
        
        const electronData = {
            mesh: electronMesh,
            shellIndex: targetShellIndex,
            radius: targetRadius,
            phi: phi,
            theta: theta,
            phiSpeed: ELECTRON_SPEED_MULTIPLIER / (targetRadius || 1),
            thetaSpeed: ELECTRON_SPEED_MULTIPLIER * 0.7 / (targetRadius || 1),
            isIonizing: false,
            isIncoming: true,
            center: new THREE.Vector3(0, 0, 0)
        };
        
        incomingElectronsData.push(electronData);
        electrons.push(electronData);
        currentAtomGroup.add(electronMesh);
    }
    
    // Calculate target positions in 3D space
    const targetPos1 = new THREE.Vector3(
        targetRadius * Math.sin(incomingElectronsData[0].theta) * Math.cos(incomingElectronsData[0].phi),
        targetRadius * Math.sin(incomingElectronsData[0].theta) * Math.sin(incomingElectronsData[0].phi),
        targetRadius * Math.cos(incomingElectronsData[0].theta)
    );
    
    const targetPos2 = new THREE.Vector3(
        targetRadius * Math.sin(incomingElectronsData[1].theta) * Math.cos(incomingElectronsData[1].phi),
        targetRadius * Math.sin(incomingElectronsData[1].theta) * Math.sin(incomingElectronsData[1].phi),
        targetRadius * Math.cos(incomingElectronsData[1].theta)
    );
    
    let electronsArrived = 0;
    const onElectronArrival = () => {
        electronsArrived++;
        if (electronsArrived === 2) {
            incomingElectronsData[0].isIncoming = false;
            incomingElectronsData[1].isIncoming = false;
            infoElement.textContent = "Oxide Ion (O²⁻). Gained 2 electrons. Stable octet achieved. Net charge: -2.";
            oxidizeButton.style.display = 'none';
        }
    };
    
    const tweenDuration = 2500;
    new TWEEN.Tween(incomingElectronsData[0].mesh.position)
        .to(targetPos1, tweenDuration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(onElectronArrival)
        .start();
        
    new TWEEN.Tween(incomingElectronsData[1].mesh.position)
        .to(targetPos2, tweenDuration)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(onElectronArrival)
        .start();
}

// --- Helper Functions ---
// Generic clear function for any display (atom or molecule)
function clearVisualization() {
    console.log("Clearing current visualization...");
    TWEEN.removeAll(); // Stop animations

    // Remove all objects from the main group
    while (currentAtomGroup.children.length > 0) {
        const child = currentAtomGroup.children[0];
        currentAtomGroup.remove(child);
        // Dispose of geometries and materials to free memory
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
    isMoleculeView = false; // Reset flag

    // Ensure specific buttons are hidden and reset
    if (ionizeButton) {
        ionizeButton.style.display = 'none';
        ionizeButton.disabled = false;
    }
    if (oxidizeButton) {
        oxidizeButton.style.display = 'none';
        oxidizeButton.disabled = false;
    }
    console.log("Visualization cleared.");
}

// Main function to display either an atom or a molecule based on data
function displayAtom(elementData) {
    if (!elementData) {
        console.error("Invalid element data provided.");
        return;
    }
    createAtom(elementData); // Calls clearVisualization internally

    const stabilityText = elementData.stable ? 'Stable (filled outer shell).' : 'Not stable.';
    infoElement.textContent = `${elementData.name} (${elementData.symbol}). Shells: ${elementData.electronsPerShell.join(', ')}. ${stabilityText}`;

    // Hide both buttons initially
    if (ionizeButton) ionizeButton.style.display = 'none';
    if (oxidizeButton) ionizeButton.style.display = 'none';

    // Show the relevant button if applicable
    if (elementData.symbol === 'H') {
        if (ionizeButton) { ionizeButton.style.display = 'inline-block'; ionizeButton.disabled = false; }
    } else if (elementData.symbol === 'O') {
        if (oxidizeButton) { oxidizeButton.style.display = 'inline-block'; oxidizeButton.disabled = false; }
    }
}

// --- Event Handlers ---
function onWindowResize() {
    const container = document.getElementById('visualization-container');
    if (!container) return;
    const width = container.clientWidth; 
    const height = container.clientHeight;
    if (width === 0 || height === 0) return;
    camera.aspect = width / height; 
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    console.log(`Resized to ${width}x${height}`);
}

function onElementChange(event) {
    const selectedValue = event.target.value;
    console.log(`Selection changed to: ${selectedValue}`);

    if (selectedValue === 'H2O') {
        displayWaterMolecule();
    } else if (selectedValue === 'SO4') {
        displaySulfateMolecule();
    } else {
        // Handle elements
        const elementData = elements[selectedValue];
        if (elementData) {
            displayAtom(elementData);
        } else {
            console.error(`Element data not found for symbol: ${selectedValue}`);
            clearVisualization();
            infoElement.textContent = `Error: Element ${selectedValue} not defined.`;
        }
    }
}

// --- Start ---
document.addEventListener('DOMContentLoaded', (event) => {
    setTimeout(init, 50);
});
