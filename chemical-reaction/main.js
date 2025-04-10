import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import TWEEN from 'tween';

// --- Constants and Configuration ---
const NUCLEUS_RADIUS = 1.5;  // Increased from 1.0
const ELECTRON_RADIUS = 0.4;  // Increased from 0.25
const SHELL_RADIUS_BASE = 4.0;  // Increased from 2.5
const SHELL_RADIUS_INCREMENT = 2.0;  // Increased from 1.0
const ELECTRON_SPEED_MULTIPLIER = 0.4;  // Slightly decreased for clearer viewing
const ANIMATION_DURATION = 2500;  // Increased from 2000 ms
const SHELL_THICKNESS = 0.05;  // New parameter for shell thickness

// Shell colors per level (from innermost to outermost)
const SHELL_COLORS = [
    0x3498db,  // Blue for K shell
    0x2ecc71,  // Green for L shell
    0xe74c3c,  // Red for M shell
    0xf39c12,  // Orange for N shell
    0x9b59b6   // Purple for O shell
];

// Electron color with higher intensity
const ELECTRON_COLOR = 0x00aaff;
const ELECTRON_GLOW = 0x66ccff;

// Element colors with increased saturation
const NUCLEUS_COLORS = {
    H: 0xff5555,    // Brighter Red
    O: 0x00ccff,    // Brighter Blue
    C: 0x555555,    // Dark Grey for Carbon
    Na: 0xdddddd,   // Brighter Silver for Sodium
    Cl: 0x00ff00,   // Brighter Green for Chlorine
    Zn: 0xaaaaaa,   // Brighter Grey for Zinc
    Cu: 0xff8877,   // Brighter Copper color
    S: 0xffff00,    // Brighter Yellow for Sulfur
    N: 0x4444ff,    // Brighter Blue for Nitrogen
    default: 0x999999
};

// Element data with electron configurations
const elements = {
    H: { name: 'Hydrogen', symbol: 'H', electronsPerShell: [1] },
    O: { name: 'Oxygen', symbol: 'O', electronsPerShell: [2, 6] },
    C: { name: 'Carbon', symbol: 'C', electronsPerShell: [2, 4] },
    Na: { name: 'Sodium', symbol: 'Na', electronsPerShell: [2, 8, 1] },
    Cl: { name: 'Chlorine', symbol: 'Cl', electronsPerShell: [2, 8, 7] },
    Zn: { name: 'Zinc', symbol: 'Zn', electronsPerShell: [2, 8, 18, 2] },
    Cu: { name: 'Copper', symbol: 'Cu', electronsPerShell: [2, 8, 18, 1] },
    S: { name: 'Sulfur', symbol: 'S', electronsPerShell: [2, 8, 6] },
    N: { name: 'Nitrogen', symbol: 'N', electronsPerShell: [2, 5] }
};

// --- Chemical Reactions Data ---
const reactions = {
    'single-replacement': {
        name: 'Single Replacement Reaction',
        equation: 'Zn + CuSO₄ → ZnSO₄ + Cu',
        phases: [
            {
                name: 'Initial State: Reactants',
                explanation: 'This reaction begins with zinc metal (Zn) and copper sulfate (CuSO₄) solution. The zinc atoms have 2 valence electrons, while the copper ions in CuSO₄ have already lost 2 electrons (Cu²⁺).',
                electronInfo: 'Zinc has a stronger tendency to lose electrons than copper.'
            },
            {
                name: 'Electron Transfer',
                explanation: 'Zinc atoms lose 2 electrons, becoming Zn²⁺ ions. These electrons are transferred to Cu²⁺ ions, which gain the electrons and become neutral copper atoms.',
                electronInfo: 'Watch as electrons move from zinc to copper ions.'
            },
            {
                name: 'Final State: Products',
                explanation: 'The reaction is complete. We now have zinc sulfate (ZnSO₄) where zinc has replaced copper in the compound. The copper atoms have precipitated out as solid copper.',
                electronInfo: 'The electrons have been redistributed, creating new combinations of atoms.'
            }
        ],
    },
    'combustion': {
        name: 'Combustion Reaction',
        equation: 'CH₄ + 2O₂ → CO₂ + 2H₂O',
        phases: [
            {
                name: 'Initial State: Reactants',
                explanation: 'Methane (CH₄) contains carbon bonded to four hydrogen atoms. Oxygen (O₂) molecules contain two oxygen atoms bonded together.',
                electronInfo: 'Methane\'s electrons are shared in covalent bonds between carbon and hydrogen.'
            },
            {
                name: 'Breaking Bonds',
                explanation: 'Energy input breaks the C-H bonds in methane and O-O bonds in oxygen, freeing the atoms to rearrange.',
                electronInfo: 'Bond breaking requires energy and releases electrons for rearrangement.'
            },
            {
                name: 'Electron Rearrangement',
                explanation: 'Electrons rearrange as oxygen atoms (which strongly attract electrons) bond with both carbon and hydrogen.',
                electronInfo: 'Oxygen\'s high electronegativity pulls electrons toward it, forming new bonds.'
            },
            {
                name: 'Final State: Products',
                explanation: 'Carbon dioxide (CO₂) forms with carbon double-bonded to two oxygen atoms. Water (H₂O) forms with oxygen bonded to two hydrogen atoms.',
                electronInfo: 'The electrons are now in a lower energy state, which is why combustion releases energy (heat and light).'
            }
        ],
    },
    'acid-base': {
        name: 'Acid-Base Neutralization',
        equation: 'HCl + NaOH → NaCl + H₂O',
        phases: [
            {
                name: 'Initial State: Reactants',
                explanation: 'Hydrochloric acid (HCl) is a strong acid that dissociates into H⁺ and Cl⁻ ions in water. Sodium hydroxide (NaOH) is a strong base that dissociates into Na⁺ and OH⁻ ions.',
                electronInfo: 'In these compounds, electrons are already unevenly distributed, creating charged ions.'
            },
            {
                name: 'Ion Recombination',
                explanation: 'The positively charged H⁺ ion from the acid combines with the negatively charged OH⁻ ion from the base to form water. The Na⁺ and Cl⁻ ions combine to form sodium chloride (table salt).',
                electronInfo: 'This reaction is primarily about rearranging ions rather than transferring electrons.'
            },
            {
                name: 'Final State: Products',
                explanation: 'The products are water (H₂O) and sodium chloride (NaCl). The acid and base have neutralized each other, resulting in a neutral salt solution.',
                electronInfo: 'The reaction creates a more stable arrangement of electrons and ions.'
            }
        ],
    },
    'ionic-bond': {
        name: 'Ionic Bond Formation',
        equation: 'Na + Cl → Na⁺ + Cl⁻ → NaCl',
        phases: [
            {
                name: 'Initial State: Separate Atoms',
                explanation: 'Sodium (Na) has 1 electron in its outer shell. Chlorine (Cl) has 7 electrons in its outer shell and needs 1 more for a full octet.',
                electronInfo: 'Sodium easily loses its outer electron while chlorine strongly attracts additional electrons.'
            },
            {
                name: 'Electron Transfer',
                explanation: 'Sodium loses its outer electron to chlorine. This makes sodium a positively charged ion (Na⁺) and chlorine a negatively charged ion (Cl⁻).',
                electronInfo: 'Watch as the electron transfers from sodium to chlorine.'
            },
            {
                name: 'Ionic Attraction',
                explanation: 'The oppositely charged ions (Na⁺ and Cl⁻) are strongly attracted to each other, forming an ionic bond.',
                electronInfo: 'The electrostatic attraction between positive and negative ions creates a strong ionic bond.'
            },
            {
                name: 'Final State: Sodium Chloride',
                explanation: 'The sodium and chloride ions arrange in a crystal lattice structure, forming sodium chloride (table salt).',
                electronInfo: 'Each sodium ion is surrounded by 6 chloride ions and vice versa in the crystal structure.'
            }
        ],
    }
};

// --- Global Variables ---
let scene, camera, renderer, labelRenderer, controls;
let currentReactionGroup = new THREE.Group();
let electrons = [];
let molecules = {};
let shellLabels = [];
let currentReaction = 'single-replacement';
let reactionPhase = 'initial';
let lastTime = 0;
let animationInProgress = false;
let currentStep = 0;
let showShellLabels = true;
let copperSulfurBond = null;

// --- DOM Elements ---
let playButton, resetButton, stepButton, reactionSelect, shellLabelsCheckbox;
let reactionPhaseElement, reactionExplanationElement, electronTransferInfoElement;

// --- Helper Functions ---

// Update reaction info display
function updateReactionInfo(phaseIndex) {
    const phaseData = reactions[currentReaction].phases[phaseIndex];
    reactionPhaseElement.textContent = phaseData.name;
    reactionExplanationElement.textContent = phaseData.explanation;
    electronTransferInfoElement.textContent = phaseData.electronInfo;
}

// Toggle shell labels visibility
function toggleShellLabels() {
    showShellLabels = shellLabelsCheckbox.checked;
    
    shellLabels.forEach(label => {
        if (label.element) {
            label.element.visible = showShellLabels;
        }
    });
}

// --- Animation and Event Handlers ---

// Animation loop
function animate(time) {
    requestAnimationFrame(animate);
    const timeSeconds = time * 0.001;
    
    // Update orbit controls
    controls.update();
    
    // Update TWEEN animations
    TWEEN.update(time);
    
    // Update electron positions
    if(electrons.length > 0) {
        const deltaTime = timeSeconds - lastTime;
        lastTime = timeSeconds;
        
        if(!isNaN(deltaTime) && deltaTime > 0) {
            electrons.forEach(electron => {
                updateElectronPosition(electron, deltaTime);
            });
        }
    }
    
    // Render scene
    renderer.render(scene, camera);
    labelRenderer.render(scene, camera);
}

// Handle window resize
function onWindowResize() {
    const container = document.getElementById('visualization-container');
    if(!container) return;
    
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    if(width === 0 || height === 0) return;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    labelRenderer.setSize(width, height);
    
    console.log(`Resized to ${width}x${height}`);
}

// Handle reaction selection change
function onReactionChange(event) {
    const selectedValue = event.target.value;
    console.log(`Reaction selection changed to: ${selectedValue}`);
    
    setupReaction(selectedValue);
}

// Update electron position based on orbital parameters
function updateElectronPosition(electron, deltaTime) {
    if(electron.isTransferring) return;
    
    // Update angles for orbit
    electron.phi += electron.phiSpeed * deltaTime;
    electron.theta += electron.thetaSpeed * deltaTime;
    
    // Convert from spherical to cartesian coordinates
    const x = electron.center.x + electron.radius * Math.sin(electron.theta) * Math.cos(electron.phi);
    const y = electron.center.y + electron.radius * Math.sin(electron.theta) * Math.sin(electron.phi);
    const z = electron.center.z + electron.radius * Math.cos(electron.theta);
    
    electron.mesh.position.set(x, y, z);
}

// --- Atom and Molecule Creation Functions ---

// Create a nucleus mesh with glow effect
function createNucleusMesh(elementSymbol, radius = NUCLEUS_RADIUS, position = new THREE.Vector3()) {
    const color = NUCLEUS_COLORS[elementSymbol] || NUCLEUS_COLORS.default;
    
    // Create nucleus sphere
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.4,
        shininess: 100
    });
    const nucleus = new THREE.Mesh(geometry, material);
    nucleus.position.copy(position);
    
    // Add ambient occlusion for better depth
    nucleus.castShadow = true;
    nucleus.receiveShadow = true;
    
    return nucleus;
}

// Create an orbital shell visualization with improved visibility
function createOrbitalShell(radius, position = new THREE.Vector3(), shellIndex = 0) {
    // Get color for this shell level
    const shellColor = SHELL_COLORS[shellIndex % SHELL_COLORS.length];
    
    // Create shell geometry with thickness
    const outerRadius = radius;
    const innerRadius = radius - SHELL_THICKNESS;
    
    // Use edges of an icosahedron for a more distinct shell
    const shellGeometry = new THREE.IcosahedronGeometry(radius, 2);
    const edgesGeometry = new THREE.EdgesGeometry(shellGeometry);
    const shellMaterial = new THREE.LineBasicMaterial({ 
        color: shellColor,
        opacity: 0.7,
        transparent: true,
        linewidth: 2
    });
    
    const shell = new THREE.LineSegments(edgesGeometry, shellMaterial);
    shell.position.copy(position);
    
    // Add shell label if enabled
    if (showShellLabels) {
        const shellNames = ['K', 'L', 'M', 'N', 'O', 'P', 'Q'];
        const shellName = shellNames[shellIndex] || `Shell ${shellIndex + 1}`;
        
        const labelDiv = document.createElement('div');
        labelDiv.className = 'shell-label';
        labelDiv.textContent = shellName;
        labelDiv.style.color = '#' + shellColor.toString(16).padStart(6, '0');
        labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        labelDiv.style.padding = '2px 5px';
        labelDiv.style.borderRadius = '3px';
        
        const shellLabel = new CSS2DObject(labelDiv);
        
        // Position label on right side of shell
        shellLabel.position.set(radius * 1.2, 0, 0);
        shell.add(shellLabel);
        
        // Track label for toggling visibility
        shellLabels.push({
            element: shellLabel,
            shellIndex: shellIndex
        });
    }
    
    return shell;
}

// Add orbiting electrons with improved visibility
function addOrbitingElectrons(centerPosition, count, orbitRadius, shellIndex = 0, electronGroup = currentReactionGroup) {
    const addedElectrons = [];
    
    for(let i = 0; i < count; i++) {
        // Create electron mesh with glow
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: ELECTRON_COLOR, 
            emissive: ELECTRON_GLOW, 
            emissiveIntensity: 0.7,
            shininess: 90
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        
        // Add subtle point light to each electron for glow effect
        const electronLight = new THREE.PointLight(ELECTRON_GLOW, 0.3, 3);
        electronLight.position.set(0, 0, 0);
        electronMesh.add(electronLight);
        
        // Set up electron data for animation with more varied distribution
        // Distribute electrons more evenly in 3D space
        const phi = (Math.PI * 2 * i) / count + (shellIndex * Math.PI / 4); // Offset by shell
        const theta = Math.PI * (0.2 + (0.6 * i / count)) + (shellIndex * Math.PI / 6); // Varied by shell
        
        const electronData = {
            mesh: electronMesh,
            shellIndex: shellIndex,
            radius: orbitRadius,
            phi: phi,              
            theta: theta,          
            phiSpeed: ELECTRON_SPEED_MULTIPLIER / (orbitRadius || 1),
            thetaSpeed: ELECTRON_SPEED_MULTIPLIER * 0.7 / (orbitRadius || 1),
            isTransferring: false,
            center: centerPosition.clone()
        };
        
        // Set initial position
        updateElectronPosition(electronData, 0);
        
        // Add to tracking arrays
        electrons.push(electronData);
        addedElectrons.push(electronData);
        electronGroup.add(electronMesh);
    }
    
    return addedElectrons;
}

// Create a simple atom visualization with improved visibility
function createAtom(elementSymbol, position = new THREE.Vector3(), scale = 1.0, includeAllElectrons = true) {
    console.log(`Creating atom: ${elementSymbol} at position ${position.x}, ${position.y}, ${position.z}`);
    
    const atomGroup = new THREE.Group();
    atomGroup.position.copy(position);
    currentReactionGroup.add(atomGroup);
    
    // Element data
    const elementData = elements[elementSymbol];
    if(!elementData) {
        console.error(`Element data not found for: ${elementSymbol}`);
        return null;
    }
    
    // Create nucleus
    const nucleus = createNucleusMesh(elementSymbol, NUCLEUS_RADIUS * scale, new THREE.Vector3());
    atomGroup.add(nucleus);
    
    // Set up electrons and shells
    const atomElectrons = [];
    
    if(includeAllElectrons) {
        elementData.electronsPerShell.forEach((numElectronsInShell, shellIndex) => {
            const shellRadius = (SHELL_RADIUS_BASE + shellIndex * SHELL_RADIUS_INCREMENT) * scale;
            
            // Add orbital shell visualization
            const orbitalShell = createOrbitalShell(shellRadius, new THREE.Vector3(), shellIndex);
            atomGroup.add(orbitalShell);
            
            // Add electrons for this shell
            const shellElectrons = addOrbitingElectrons(
                nucleus.position, 
                numElectronsInShell, 
                shellRadius, 
                shellIndex,
                atomGroup
            );
            
            atomElectrons.push(...shellElectrons);
        });
    } else {
        // Just visualize valence electrons (outer shell)
        const valenceElectrons = elementData.electronsPerShell[elementData.electronsPerShell.length - 1];
        const valenceShellIndex = elementData.electronsPerShell.length - 1;
        const shellRadius = (SHELL_RADIUS_BASE + valenceShellIndex * SHELL_RADIUS_INCREMENT) * scale;
        
        // Add orbital shell for valence electrons
        const orbitalShell = createOrbitalShell(shellRadius, new THREE.Vector3(), valenceShellIndex);
        atomGroup.add(orbitalShell);
        
        // Add valence electrons
        const shellElectrons = addOrbitingElectrons(
            nucleus.position, 
            valenceElectrons, 
            shellRadius, 
            valenceShellIndex,
            atomGroup
        );
        
        atomElectrons.push(...shellElectrons);
    }
    
    return {
        group: atomGroup,
        nucleus: nucleus,
        electrons: atomElectrons,
        element: elementSymbol
    };
}

// Create a bond between atoms with improved visibility
function createBond(atom1, atom2, bondOrder = 1) {
    // Get world positions of nuclei
    const pos1 = new THREE.Vector3();
    const pos2 = new THREE.Vector3();
    atom1.nucleus.getWorldPosition(pos1);
    atom2.nucleus.getWorldPosition(pos2);
    
    // Create bonds with improved visibility
    const bonds = [];
    const bondColor = 0xffffff;
    
    // Calculate perpendicular direction for offset
    const dir = new THREE.Vector3().subVectors(pos2, pos1).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const perpendicular = new THREE.Vector3().crossVectors(dir, up).normalize();
    
    // Create bond lines - one per bond order, with proper spacing
    for(let i = 0; i < bondOrder; i++) {
        let offset = new THREE.Vector3(0, 0, 0);
        
        // Calculate offset for multiple bonds (spread them out)
        if(bondOrder > 1) {
            const spacing = 0.3;
            if(bondOrder === 2) {
                // For double bond, offset in opposite directions
                offset = perpendicular.clone().multiplyScalar(spacing * (i === 0 ? 1 : -1));
            } else if(bondOrder === 3) {
                // For triple bond, one in center, two offset
                if(i > 0) {
                    offset = perpendicular.clone().multiplyScalar(spacing * (i === 1 ? 1 : -1));
                }
            }
        }
        
        // Create bond with improved material
        const offsetPos1 = pos1.clone().add(offset);
        const offsetPos2 = pos2.clone().add(offset);
        
        const bondMaterial = new THREE.LineBasicMaterial({ 
            color: bondColor,
            linewidth: 3,
            opacity: 0.9,
            transparent: true
        });
        
        const bondGeometry = new THREE.BufferGeometry().setFromPoints([offsetPos1, offsetPos2]);
        const bondLine = new THREE.Line(bondGeometry, bondMaterial);
        
        bonds.push(bondLine);
        currentReactionGroup.add(bondLine);
    }
    
    return bonds;
}

// Animate an electron transferring from one atom to another with improved path
function animateElectronTransfer(electron, sourceAtom, targetAtom, callback) {
    electron.isTransferring = true;
    
    // Get world positions
    const sourcePos = new THREE.Vector3();
    const targetPos = new THREE.Vector3();
    sourceAtom.nucleus.getWorldPosition(sourcePos);
    targetAtom.nucleus.getWorldPosition(targetPos);
    
    // Calculate a more pronounced arc for better visibility
    const midpoint = new THREE.Vector3().lerpVectors(sourcePos, targetPos, 0.5);
    const direction = new THREE.Vector3().subVectors(targetPos, sourcePos).normalize();
    const perp = new THREE.Vector3(-direction.y, direction.x, direction.z).normalize();
    midpoint.add(perp.multiplyScalar(8)); // Increased arc height for visibility
    
    // Add a third control point for a more complex path
    const midpoint2 = new THREE.Vector3().lerpVectors(midpoint, targetPos, 0.5);
    midpoint2.add(perp.multiplyScalar(-3)); // Create a curved path
    
    // Create animation path with multiple control points
    const curve = new THREE.CubicBezierCurve3(
        electron.mesh.position.clone(),
        midpoint,
        midpoint2,
        targetPos
    );
    
    // Add glowing effect during transfer
    const originalColor = electron.mesh.material.emissive.clone();
    electron.mesh.material.emissive.set(0x55ffff);
    electron.mesh.material.emissiveIntensity = 1.0;
    
    // Scale electron up slightly during transfer for visibility
    const originalScale = electron.mesh.scale.clone();
    electron.mesh.scale.set(1.5, 1.5, 1.5);
    
    // Use TWEEN to animate along path
    new TWEEN.Tween({ t: 0 })
        .to({ t: 1 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onUpdate(function(obj) {
            const point = curve.getPointAt(obj.t);
            electron.mesh.position.copy(point);
        })
        .onComplete(function() {
            // Reset electron appearance
            electron.mesh.material.emissive.copy(originalColor);
            electron.mesh.material.emissiveIntensity = 0.7;
            electron.mesh.scale.copy(originalScale);
            
            // Update electron data to orbit around target
            electron.center = targetAtom.nucleus.position.clone();
            electron.isTransferring = false;
            
            if(callback) callback();
        })
        .start();
}

// --- Visualization Control Functions ---

// Clear the current visualization
function clearVisualization() {
    console.log("Clearing current visualization");
    
    // Stop all animations
    TWEEN.removeAll();
    
    // Remove all objects from the reaction group
    while(currentReactionGroup.children.length > 0) {
        const child = currentReactionGroup.children[0];
        currentReactionGroup.remove(child);
        
        // Dispose of geometries and materials
        if(child.geometry) child.geometry.dispose();
        if(child.material) {
            if(Array.isArray(child.material)) {
                child.material.forEach(material => material.dispose());
            } else {
                child.material.dispose();
            }
        }
    }
    
    // Clear shell labels
    shellLabels.forEach(label => {
        if (label.element && label.element.parent) {
            label.element.parent.remove(label.element);
        }
    });
    shellLabels = [];
    
    // Reset tracking arrays/objects
    electrons = [];
    molecules = {};
    copperSulfurBond = null;
}

// --- Animation Control Functions ---

// Play the full reaction animation
function playReaction() {
    if(animationInProgress) return;
    
    console.log("Playing reaction animation");
    
    // Disable controls during animation
    playButton.disabled = true;
    stepButton.disabled = true;
    
    // Start animation sequence based on reaction type
    switch(currentReaction) {
        case 'single-replacement':
            animateSingleReplacementReaction();
            break;
        case 'combustion':
            animateCombustionReaction();
            break;
        case 'acid-base':
            animateAcidBaseReaction();
            break;
        case 'ionic-bond':
            animateIonicBondReaction();
            break;
    }
}

// Reset the reaction to initial state
function resetReaction() {
    console.log("Resetting reaction");
    setupReaction(currentReaction);
}

// Step through the reaction phases
function stepReaction() {
    if(animationInProgress) return;
    
    console.log(`Stepping reaction, current step: ${currentStep}`);
    
    // Get max steps for current reaction
    const maxSteps = reactions[currentReaction].phases.length;
    
    // If already at the end, reset
    if(currentStep >= maxSteps - 1) {
        resetReaction();
        return;
    }
    
    // Move to next step
    currentStep++;
    updateReactionInfo(currentStep);
    
    // Perform animation for this step
    switch(currentReaction) {
        case 'single-replacement':
            stepSingleReplacementReaction(currentStep);
            break;
        case 'combustion':
            stepCombustionReaction(currentStep);
            break;
        case 'acid-base':
            stepAcidBaseReaction(currentStep);
            break;
        case 'ionic-bond':
            stepIonicBondReaction(currentStep);
            break;
    }
}

// --- Reaction Setup Functions ---

// Set up a specific reaction
function setupReaction(reactionType) {
    console.log(`Setting up reaction: ${reactionType}`);
    
    currentReaction = reactionType;
    reactionPhase = 'initial';
    currentStep = 0;
    animationInProgress = false;
    
    // Update UI elements
    document.getElementById('reaction-equation').textContent = reactions[reactionType].equation;
    updateReactionInfo(0);
    
    // Clear previous visualization
    clearVisualization();
    
    // Set up initial state based on reaction type
    switch(reactionType) {
        case 'single-replacement':
            setupSingleReplacementReaction();
            break;
        case 'combustion':
            setupCombustionReaction();
            break;
        case 'acid-base':
            setupAcidBaseReaction();
            break;
        case 'ionic-bond':
            setupIonicBondReaction();
            break;
        default:
            console.error(`Unknown reaction type: ${reactionType}`);
    }
    
    // Enable/reset control buttons
    playButton.disabled = false;
    resetButton.disabled = false;
    stepButton.disabled = false;
}

// Setup Single Replacement Reaction: Zn + CuSO₄ → ZnSO₄ + Cu
function setupSingleReplacementReaction() {
    // Create reaction components with better spacing
    const zinc = createAtom('Zn', new THREE.Vector3(-12, 0, 0), 0.8, false);
    const copper = createAtom('Cu', new THREE.Vector3(12, 0, 0), 0.8);
    
    // Create sulfate group (simplified)
    const sulfur = createAtom('S', new THREE.Vector3(6, 0, 0), 0.7);
    const oxygen1 = createAtom('O', new THREE.Vector3(6, 3, 0), 0.5, false);
    const oxygen2 = createAtom('O', new THREE.Vector3(6, -3, 0), 0.5, false);
    const oxygen3 = createAtom('O', new THREE.Vector3(9, 0, 0), 0.5, false);
    const oxygen4 = createAtom('O', new THREE.Vector3(3, 0, 0), 0.5, false);
    
    // Create initial bonds in copper sulfate
    createBond(sulfur, oxygen1);
    createBond(sulfur, oxygen2);
    createBond(sulfur, oxygen3);
    createBond(sulfur, oxygen4);
    copperSulfurBond = createBond(copper, sulfur); // Initial bond between copper and sulfate
    
    // Add initial labels
    const cuSO4Label = document.createElement('div');
    cuSO4Label.className = 'molecule-label';
    cuSO4Label.textContent = 'CuSO₄';
    cuSO4Label.style.color = '#ffffff';
    cuSO4Label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    cuSO4Label.style.padding = '3px 6px';
    cuSO4Label.style.borderRadius = '4px';
    
    const cuSO4LabelObject = new CSS2DObject(cuSO4Label);
    cuSO4LabelObject.position.set(6, -5, 0);
    currentReactionGroup.add(cuSO4LabelObject);
    
    const znLabel = document.createElement('div');
    znLabel.className = 'molecule-label';
    znLabel.textContent = 'Zn';
    znLabel.style.color = '#aaaaaa';
    znLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    znLabel.style.padding = '3px 6px';
    znLabel.style.borderRadius = '4px';
    
    const znLabelObject = new CSS2DObject(znLabel);
    znLabelObject.position.set(0, -3, 0);
    zinc.group.add(znLabelObject);
    
    // Store for animation reference
    molecules = {
        zinc: zinc,
        copper: copper,
        sulfate: {
            sulfur: sulfur,
            oxygens: [oxygen1, oxygen2, oxygen3, oxygen4]
        },
        labels: {
            cuSO4: cuSO4LabelObject,
            zn: znLabelObject
        },
        bonds: {
            copperSulfur: copperSulfurBond
        }
    };
    
    // Set camera position
    camera.position.set(0, 0, 30);
    controls.update();
}

// Setup Combustion Reaction: CH₄ + 2O₂ → CO₂ + 2H₂O
function setupCombustionReaction() {
    // Create methane (CH₄) with better spacing
    const carbon = createAtom('C', new THREE.Vector3(-12, 0, 0), 0.8);
    const hydrogen1 = createAtom('H', new THREE.Vector3(-12, 4, 0), 0.5, false);
    const hydrogen2 = createAtom('H', new THREE.Vector3(-12, -4, 0), 0.5, false);
    const hydrogen3 = createAtom('H', new THREE.Vector3(-8, 0, 0), 0.5, false);
    const hydrogen4 = createAtom('H', new THREE.Vector3(-16, 0, 0), 0.5, false);
    
    // Create bonds in methane
    createBond(carbon, hydrogen1);
    createBond(carbon, hydrogen2);
    createBond(carbon, hydrogen3);
    createBond(carbon, hydrogen4);
    
    // Create oxygen molecules (O₂)
    const oxygen1a = createAtom('O', new THREE.Vector3(0, 4, 0), 0.7, false);
    const oxygen1b = createAtom('O', new THREE.Vector3(0, 8, 0), 0.7, false);
    createBond(oxygen1a, oxygen1b, 2); // Double bond
    
    const oxygen2a = createAtom('O', new THREE.Vector3(0, -4, 0), 0.7, false);
    const oxygen2b = createAtom('O', new THREE.Vector3(0, -8, 0), 0.7, false);
    createBond(oxygen2a, oxygen2b, 2); // Double bond
    
    // Store for animation reference
    molecules = {
        methane: {
            carbon: carbon,
            hydrogens: [hydrogen1, hydrogen2, hydrogen3, hydrogen4]
        },
        oxygen: [
            { atoms: [oxygen1a, oxygen1b] },
            { atoms: [oxygen2a, oxygen2b] }
        ]
    };
    
    // Set camera position
    camera.position.set(0, 0, 30);
    controls.update();
}

// Setup Acid-Base Reaction: HCl + NaOH → NaCl + H₂O
function setupAcidBaseReaction() {
    // Create HCl (hydrochloric acid) with better spacing
    const hydrogen = createAtom('H', new THREE.Vector3(-12, 4, 0), 0.6, false);
    const chlorine = createAtom('Cl', new THREE.Vector3(-12, -2, 0), 0.8, false);
    createBond(hydrogen, chlorine);
    
    // Create NaOH (sodium hydroxide)
    const sodium = createAtom('Na', new THREE.Vector3(9, 4, 0), 0.7, false);
    const oxygen = createAtom('O', new THREE.Vector3(9, -2, 0), 0.7, false);
    const hydroxideH = createAtom('H', new THREE.Vector3(9, -6, 0), 0.5, false);
    createBond(oxygen, hydroxideH);
    createBond(sodium, oxygen);
    
    // Store for animation reference
    molecules = {
        acid: {
            hydrogen: hydrogen,
            chlorine: chlorine
        },
        base: {
            sodium: sodium,
            oxygen: oxygen,
            hydrogen: hydroxideH
        }
    };
    
    // Set camera position
    camera.position.set(0, 0, 25);
    controls.update();
}

// Setup Ionic Bond Formation: Na + Cl → Na⁺ + Cl⁻ → NaCl
function setupIonicBondReaction() {
    // Create sodium atom
    const sodium = createAtom('Na', new THREE.Vector3(-8, 0, 0), 1.0, true);
    
    // Create chlorine atom
    const chlorine = createAtom('Cl', new THREE.Vector3(8, 0, 0), 1.0, true);
    
    // Store for animation reference
    molecules = {
        sodium: sodium,
        chlorine: chlorine
    };
    
    // Set camera position
    camera.position.set(0, 0, 25);
    controls.update();
}

// --- Step-by-Step Reaction Animations ---

// Single Replacement Reaction Steps
function stepSingleReplacementReaction(step) {
    animationInProgress = true;
    
    switch(step) {
        case 1: // Electron Transfer
            // Find valence electrons in zinc
            const zincValenceElectrons = molecules.zinc.electrons.slice(0, 2);
            
            // Add glow effect to highlight zinc during transfer
            molecules.zinc.nucleus.material.emissiveIntensity = 0.7;
            
            // Animate electron transfer (one at a time)
            animateElectronTransfer(zincValenceElectrons[0], molecules.zinc, molecules.copper, () => {
                setTimeout(() => {
                    animateElectronTransfer(zincValenceElectrons[1], molecules.zinc, molecules.copper, () => {
                        // Reset glow effect
                        molecules.zinc.nucleus.material.emissiveIntensity = 0.4;
                        animationInProgress = false;
                    });
                }, 700);
            });
            break;
            
        case 2: // Final State
            // Add highlight to indicate zinc is now an ion
            new TWEEN.Tween(molecules.zinc.nucleus.material)
                .to({ emissiveIntensity: 0.8 }, 500)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            // Remove the bond between copper and sulfate
            if (molecules.bonds && molecules.bonds.copperSulfur) {
                // Remove each bond line from the scene
                molecules.bonds.copperSulfur.forEach(line => {
                    currentReactionGroup.remove(line);
                    if (line.geometry) line.geometry.dispose();
                    if (line.material) line.material.dispose();
                });
                // Clear the reference
                molecules.bonds.copperSulfur = null;
            }
                
            // Move zinc to replace copper in the sulfate group
            new TWEEN.Tween(molecules.zinc.group.position)
                .to({ x: 6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Create bonds between zinc and sulfate after zinc moves into position
                    createBond(molecules.zinc, molecules.sulfate.sulfur);
                    
                    // Create visual indicators for the new ZnSO₄ compound
                    const zincSulfateLabel = document.createElement('div');
                    zincSulfateLabel.className = 'molecule-label';
                    zincSulfateLabel.textContent = 'ZnSO₄';
                    zincSulfateLabel.style.color = '#ffffff';
                    zincSulfateLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    zincSulfateLabel.style.padding = '3px 6px';
                    zincSulfateLabel.style.borderRadius = '4px';
                    zincSulfateLabel.style.fontSize = '16px';
                    zincSulfateLabel.style.fontWeight = 'bold';
                    
                    const zincSulfateLabelObject = new CSS2DObject(zincSulfateLabel);
                    zincSulfateLabelObject.position.set(6, -5, 0);
                    currentReactionGroup.add(zincSulfateLabelObject);
                    
                    // Remove the CuSO4 label if it exists
                    if(molecules.labels && molecules.labels.cuSO4) {
                        currentReactionGroup.remove(molecules.labels.cuSO4);
                    }
                })
                .start();
                
            // Move copper completely away from sulfate to show it's fully separated
            new TWEEN.Tween(molecules.copper.group.position)
                .to({ x: 25, y: 2 }, ANIMATION_DURATION) // Increased separation & y-offset for visual distinction
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Highlight copper to show it's now elemental Cu
                    molecules.copper.nucleus.material.emissiveIntensity = 1.0; // Increased glow
                    molecules.copper.nucleus.scale.set(1.2, 1.2, 1.2); // Slightly larger
                    
                    // Add a label for elemental copper
                    const copperLabel = document.createElement('div');
                    copperLabel.className = 'molecule-label';
                    copperLabel.textContent = 'Cu';
                    copperLabel.style.color = '#ff9988'; // Brighter color
                    copperLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                    copperLabel.style.padding = '4px 8px';
                    copperLabel.style.borderRadius = '4px';
                    copperLabel.style.fontSize = '18px'; // Larger font
                    copperLabel.style.fontWeight = 'bold';
                    
                    const copperLabelObject = new CSS2DObject(copperLabel);
                    copperLabelObject.position.set(0, -4, 0);
                    molecules.copper.group.add(copperLabelObject);
                    
                    // Update reaction info to emphasize complete separation
                    const currentExplanation = document.getElementById('reaction-explanation').textContent;
                    document.getElementById('reaction-explanation').textContent = 
                        currentExplanation + " The copper is completely separated as elemental Cu.";
                    
                    animationInProgress = false;
                })
                .start();
            break;
    }
}

// Combustion Reaction Steps (simplified)
function stepCombustionReaction(step) {
    animationInProgress = true;
    
    switch(step) {
        case 1: // Breaking Bonds
            // Add glow effect to indicate energy input
            molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.7;
            
            // Animate breaking of bonds by moving atoms apart
            new TWEEN.Tween(molecules.methane.hydrogens[0].group.position)
                .to({ y: 6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.methane.hydrogens[1].group.position)
                .to({ y: -6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.methane.hydrogens[2].group.position)
                .to({ x: -6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.methane.hydrogens[3].group.position)
                .to({ x: -18 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Reset glow effect
                    molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.4;
                    animationInProgress = false;
                })
                .start();
            break;
            
        case 2: // Electron Rearrangement
            // Highlight oxygen atoms as they attract electrons
            molecules.oxygen.forEach(o => {
                o.atoms.forEach(atom => {
                    atom.nucleus.material.emissiveIntensity = 0.7;
                });
            });
            
            // Move oxygen atoms toward carbon and hydrogen
            new TWEEN.Tween(molecules.oxygen[0].atoms[0].group.position)
                .to({ x: -8, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[0].atoms[1].group.position)
                .to({ x: -16, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[1].atoms[0].group.position)
                .to({ x: -12, y: 6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[1].atoms[1].group.position)
                .to({ x: -12, y: -6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Reset glow effect
                    molecules.oxygen.forEach(o => {
                        o.atoms.forEach(atom => {
                            atom.nucleus.material.emissiveIntensity = 0.4;
                        });
                    });
                    animationInProgress = false;
                })
                .start();
            break;
            
        case 3: // Final State
            // Rearrange into products (CO₂ and H₂O)
            // Move to CO₂ formation
            new TWEEN.Tween(molecules.methane.carbon.group.position)
                .to({ x: 8, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[0].atoms[0].group.position)
                .to({ x: 4, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[0].atoms[1].group.position)
                .to({ x: 12, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            // Move to H₂O formation (first water molecule)
            new TWEEN.Tween(molecules.methane.hydrogens[0].group.position)
                .to({ x: -8, y: 6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.methane.hydrogens[1].group.position)
                .to({ x: -8, y: 2 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[1].atoms[0].group.position)
                .to({ x: -8, y: 4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            // Second water molecule
            new TWEEN.Tween(molecules.methane.hydrogens[2].group.position)
                .to({ x: -8, y: -2 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.methane.hydrogens[3].group.position)
                .to({ x: -8, y: -6 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.oxygen[1].atoms[1].group.position)
                .to({ x: -8, y: -4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    animationInProgress = false;
                })
                .start();
            break;
    }
}

// Acid-Base Reaction Steps
function stepAcidBaseReaction(step) {
    animationInProgress = true;
    
    switch(step) {
        case 1: // Ion Recombination
            // Highlight ions
            molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.7;
            molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.7;
            
            // Animate ion movement and recombination
            new TWEEN.Tween(molecules.acid.hydrogen.group.position)
                .to({ x: 0, y: -2 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.acid.chlorine.group.position)
                .to({ x: 0, y: 4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.base.sodium.group.position)
                .to({ x: 0, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.base.oxygen.group.position)
                .to({ x: 0, y: -4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.base.hydrogen.group.position)
                .to({ x: 0, y: -8 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Reset highlight
                    molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.4;
                    molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.4;
                    animationInProgress = false;
                })
                .start();
            break;
            
        case 2: // Final State
            // Rearrange atoms to show final products
            new TWEEN.Tween(molecules.acid.hydrogen.group.position)
                .to({ x: 12, y: -4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.base.oxygen.group.position)
                .to({ x: 12, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.base.hydrogen.group.position)
                .to({ x: 12, y: 4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.acid.chlorine.group.position)
                .to({ x: -12, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.base.sodium.group.position)
                .to({ x: -12, y: 4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    animationInProgress = false;
                })
                .start();
            break;
    }
}

// Ionic Bond Formation Steps
function stepIonicBondReaction(step) {
    animationInProgress = true;
    
    switch(step) {
        case 1: // Electron Transfer
            // Find the outermost electron of sodium
            const sodiumValenceElectron = molecules.sodium.electrons.find(
                e => e.shellIndex === elements['Na'].electronsPerShell.length - 1
            );
            
            // Highlight sodium during transfer
            molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
            
            // Animate electron transfer
            if(sodiumValenceElectron) {
                animateElectronTransfer(sodiumValenceElectron, molecules.sodium, molecules.chlorine, () => {
                    // Reset highlight
                    molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
                    animationInProgress = false;
                });
            } else {
                console.error("Could not find sodium valence electron");
                animationInProgress = false;
            }
            break;
            
        case 2: // Ionic Attraction
            // Highlight both ions to show attraction
            molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
            molecules.chlorine.nucleus.material.emissiveIntensity = 0.7;
            
            // Bring atoms closer together
            new TWEEN.Tween(molecules.sodium.group.position)
                .to({ x: -4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.chlorine.group.position)
                .to({ x: 4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Reset highlight
                    molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
                    molecules.chlorine.nucleus.material.emissiveIntensity = 0.4;
                    animationInProgress = false;
                })
                .start();
            break;
            
        case 3: // Final State (NaCl crystal)
            // Move to final positions
            new TWEEN.Tween(molecules.sodium.group.position)
                .to({ x: 0, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.chlorine.group.position)
                .to({ x: 0, y: 0 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Add more ions to suggest crystal structure (just visual suggestion)
                    for(let i = 0; i < 6; i++) {
                        const angle = (Math.PI * 2 * i) / 6;
                        const distance = 8;
                        const x = Math.cos(angle) * distance;
                        const y = Math.sin(angle) * distance;
                        
                        // Alternate Na and Cl
                        if(i % 2 === 0) {
                            createAtom('Na', new THREE.Vector3(x, y, 0), 0.8, false);
                        } else {
                            createAtom('Cl', new THREE.Vector3(x, y, 0), 0.8, false);
                        }
                    }
                    
                    animationInProgress = false;
                })
                .start();
            break;
    }
}

// --- Complete Reaction Animations ---

// Animate full single replacement reaction
function animateSingleReplacementReaction() {
    animationInProgress = true;
    
    // Phase 1: Electron Transfer
    updateReactionInfo(1);
    currentStep = 1;
    
    // Find valence electrons in zinc
    const zincValenceElectrons = molecules.zinc.electrons.slice(0, 2);
    
    // Highlight zinc during transfer
    molecules.zinc.nucleus.material.emissiveIntensity = 0.7;
    
    // Animate electron transfer (one at a time)
    animateElectronTransfer(zincValenceElectrons[0], molecules.zinc, molecules.copper, () => {
        setTimeout(() => {
            animateElectronTransfer(zincValenceElectrons[1], molecules.zinc, molecules.copper, () => {
                // Reset highlight
                molecules.zinc.nucleus.material.emissiveIntensity = 0.4;
                
                // Phase 2: Final State
                setTimeout(() => {
                    updateReactionInfo(2);
                    currentStep = 2;
                    
                    // Highlight zinc to show it's now an ion
                    new TWEEN.Tween(molecules.zinc.nucleus.material)
                        .to({ emissiveIntensity: 0.8 }, 500)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .start();
                    
                    // Remove the bond between copper and sulfate
                    if (molecules.bonds && molecules.bonds.copperSulfur) {
                        // Remove each bond line from the scene
                        molecules.bonds.copperSulfur.forEach(line => {
                            currentReactionGroup.remove(line);
                            if (line.geometry) line.geometry.dispose();
                            if (line.material) line.material.dispose();
                        });
                        // Clear the reference
                        molecules.bonds.copperSulfur = null;
                    }
                    
                    // Move zinc to replace copper in the sulfate group
                    new TWEEN.Tween(molecules.zinc.group.position)
                        .to({ x: 6 }, ANIMATION_DURATION)
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(() => {
                            // Create bonds between zinc and sulfate after zinc moves into position
                            createBond(molecules.zinc, molecules.sulfate.sulfur);
                            
                            // Create visual indicators for the new ZnSO₄ compound
                            const zincSulfateLabel = document.createElement('div');
                            zincSulfateLabel.className = 'molecule-label';
                            zincSulfateLabel.textContent = 'ZnSO₄';
                            zincSulfateLabel.style.color = '#ffffff';
                            zincSulfateLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                            zincSulfateLabel.style.padding = '3px 6px';
                            zincSulfateLabel.style.borderRadius = '4px';
                            zincSulfateLabel.style.fontSize = '16px';
                            zincSulfateLabel.style.fontWeight = 'bold';
                            
                            const zincSulfateLabelObject = new CSS2DObject(zincSulfateLabel);
                            zincSulfateLabelObject.position.set(6, -5, 0);
                            currentReactionGroup.add(zincSulfateLabelObject);
                            
                            // Remove the CuSO4 label if it exists
                            if(molecules.labels && molecules.labels.cuSO4) {
                                currentReactionGroup.remove(molecules.labels.cuSO4);
                            }
                        })
                        .start();
                    
                    // Move copper completely away from sulfate to show it's fully separated
                    new TWEEN.Tween(molecules.copper.group.position)
                        .to({ x: 25, y: 2 }, ANIMATION_DURATION) // Increased separation & y-offset for visual distinction
                        .easing(TWEEN.Easing.Quadratic.InOut)
                        .onComplete(() => {
                            // Highlight copper to show it's now elemental Cu
                            molecules.copper.nucleus.material.emissiveIntensity = 1.0; // Increased glow
                            molecules.copper.nucleus.scale.set(1.2, 1.2, 1.2); // Slightly larger
                            
                            // Add a label for elemental copper
                            const copperLabel = document.createElement('div');
                            copperLabel.className = 'molecule-label';
                            copperLabel.textContent = 'Cu';
                            copperLabel.style.color = '#ff9988'; // Brighter color
                            copperLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                            copperLabel.style.padding = '4px 8px';
                            copperLabel.style.borderRadius = '4px';
                            copperLabel.style.fontSize = '18px'; // Larger font
                            copperLabel.style.fontWeight = 'bold';
                            
                            const copperLabelObject = new CSS2DObject(copperLabel);
                            copperLabelObject.position.set(0, -4, 0);
                            molecules.copper.group.add(copperLabelObject);
                            
                            // Update reaction info to emphasize complete separation
                            const currentExplanation = document.getElementById('reaction-explanation').textContent;
                            document.getElementById('reaction-explanation').textContent = 
                                currentExplanation + " The copper is completely separated as elemental Cu.";
                                
                            animationInProgress = false;
                            playButton.disabled = false;
                            stepButton.disabled = false;
                        })
                        .start();
                }, 1000);
            });
        }, 700);
    });
}

// Animate full ionic bond formation
function animateIonicBondReaction() {
    animationInProgress = true;
    
    // Phase 1: Electron Transfer
    updateReactionInfo(1);
    currentStep = 1;
    
    // Find the outermost electron of sodium
    const sodiumValenceElectron = molecules.sodium.electrons.find(
        e => e.shellIndex === elements['Na'].electronsPerShell.length - 1
    );
    
    // Highlight sodium during transfer
    molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
    
    // Animate electron transfer
    animateElectronTransfer(sodiumValenceElectron, molecules.sodium, molecules.chlorine, () => {
        // Reset highlight
        molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
        
        // Phase 2: Ionic Attraction
        setTimeout(() => {
            updateReactionInfo(2);
            currentStep = 2;
            
            // Highlight both ions to show attraction
            molecules.sodium.nucleus.material.emissiveIntensity = 0.7;
            molecules.chlorine.nucleus.material.emissiveIntensity = 0.7;
            
            // Bring atoms closer together
            new TWEEN.Tween(molecules.sodium.group.position)
                .to({ x: -4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .start();
                
            new TWEEN.Tween(molecules.chlorine.group.position)
                .to({ x: 4 }, ANIMATION_DURATION)
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onComplete(() => {
                    // Reset highlight
                    molecules.sodium.nucleus.material.emissiveIntensity = 0.4;
                    molecules.chlorine.nucleus.material.emissiveIntensity = 0.4;
                    
                    // Phase 3: Final State
                    setTimeout(() => {
                        updateReactionInfo(3);
                        currentStep = 3;
                        
                        // Move to final positions
                        new TWEEN.Tween(molecules.sodium.group.position)
                            .to({ x: 0, y: 0 }, ANIMATION_DURATION)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .start();
                            
                        new TWEEN.Tween(molecules.chlorine.group.position)
                            .to({ x: 0, y: 0 }, ANIMATION_DURATION)
                            .easing(TWEEN.Easing.Quadratic.InOut)
                            .onComplete(() => {
                                // Add more ions to suggest crystal structure
                                for(let i = 0; i < 6; i++) {
                                    const angle = (Math.PI * 2 * i) / 6;
                                    const distance = 8;
                                    const x = Math.cos(angle) * distance;
                                    const y = Math.sin(angle) * distance;
                                    
                                    // Alternate Na and Cl
                                    if(i % 2 === 0) {
                                        createAtom('Na', new THREE.Vector3(x, y, 0), 0.8, false);
                                    } else {
                                        createAtom('Cl', new THREE.Vector3(x, y, 0), 0.8, false);
                                    }
                                }
                                
                                animationInProgress = false;
                                playButton.disabled = false;
                                stepButton.disabled = false;
                            })
                            .start();
                    }, 1000);
                })
                .start();
        }, 1000);
    });
}

// Animate full combustion reaction
function animateCombustionReaction() {
    animationInProgress = true;
    
    // Phase 1: Breaking Bonds
    updateReactionInfo(1);
    currentStep = 1;
    
    // Add glow effect to indicate energy input
    molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.7;
    
    // Animate breaking of bonds by moving atoms apart
    new TWEEN.Tween(molecules.methane.hydrogens[0].group.position)
        .to({ y: 6 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.methane.hydrogens[1].group.position)
        .to({ y: -6 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.methane.hydrogens[2].group.position)
        .to({ x: -6 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.methane.hydrogens[3].group.position)
        .to({ x: -18 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            // Reset glow effect
            molecules.methane.carbon.nucleus.material.emissiveIntensity = 0.4;
            
            // Phase 2: Electron Rearrangement
            setTimeout(() => {
                updateReactionInfo(2);
                currentStep = 2;
                
                // Highlight oxygen atoms as they attract electrons
                molecules.oxygen.forEach(o => {
                    o.atoms.forEach(atom => {
                        atom.nucleus.material.emissiveIntensity = 0.7;
                    });
                });
                
                // Move oxygen atoms toward carbon and hydrogen
                new TWEEN.Tween(molecules.oxygen[0].atoms[0].group.position)
                    .to({ x: -8, y: 0 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.oxygen[0].atoms[1].group.position)
                    .to({ x: -16, y: 0 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.oxygen[1].atoms[0].group.position)
                    .to({ x: -12, y: 6 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.oxygen[1].atoms[1].group.position)
                    .to({ x: -12, y: -6 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Reset glow effect
                        molecules.oxygen.forEach(o => {
                            o.atoms.forEach(atom => {
                                atom.nucleus.material.emissiveIntensity = 0.4;
                            });
                        });
                        
                        // Phase 3: Final State
                        setTimeout(() => {
                            updateReactionInfo(3);
                            currentStep = 3;
                            
                            // Rearrange into products (CO₂ and H₂O)
                            // Move to CO₂ formation
                            new TWEEN.Tween(molecules.methane.carbon.group.position)
                                .to({ x: 8, y: 0 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(molecules.oxygen[0].atoms[0].group.position)
                                .to({ x: 4, y: 0 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(molecules.oxygen[0].atoms[1].group.position)
                                .to({ x: 12, y: 0 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            // Move to H₂O formation (first water molecule)
                            new TWEEN.Tween(molecules.methane.hydrogens[0].group.position)
                                .to({ x: -8, y: 6 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(molecules.methane.hydrogens[1].group.position)
                                .to({ x: -8, y: 2 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(molecules.oxygen[1].atoms[0].group.position)
                                .to({ x: -8, y: 4 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            // Second water molecule
                            new TWEEN.Tween(molecules.methane.hydrogens[2].group.position)
                                .to({ x: -8, y: -2 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(molecules.methane.hydrogens[3].group.position)
                                .to({ x: -8, y: -6 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .start();
                                
                            new TWEEN.Tween(molecules.oxygen[1].atoms[1].group.position)
                                .to({ x: -8, y: -4 }, ANIMATION_DURATION)
                                .easing(TWEEN.Easing.Quadratic.InOut)
                                .onComplete(() => {
                                    // Add product labels
                                    const co2Label = document.createElement('div');
                                    co2Label.className = 'molecule-label';
                                    co2Label.textContent = 'CO₂';
                                    co2Label.style.color = '#ffffff';
                                    co2Label.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                    co2Label.style.padding = '3px 6px';
                                    co2Label.style.borderRadius = '4px';
                                    
                                    const co2LabelObject = new CSS2DObject(co2Label);
                                    co2LabelObject.position.set(8, -3, 0);
                                    currentReactionGroup.add(co2LabelObject);
                                    
                                    const h2oLabel1 = document.createElement('div');
                                    h2oLabel1.className = 'molecule-label';
                                    h2oLabel1.textContent = 'H₂O';
                                    h2oLabel1.style.color = '#ffffff';
                                    h2oLabel1.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                    h2oLabel1.style.padding = '3px 6px';
                                    h2oLabel1.style.borderRadius = '4px';
                                    
                                    const h2oLabel1Object = new CSS2DObject(h2oLabel1);
                                    h2oLabel1Object.position.set(-8, 8, 0);
                                    currentReactionGroup.add(h2oLabel1Object);
                                    
                                    const h2oLabel2 = document.createElement('div');
                                    h2oLabel2.className = 'molecule-label';
                                    h2oLabel2.textContent = 'H₂O';
                                    h2oLabel2.style.color = '#ffffff';
                                    h2oLabel2.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                                    h2oLabel2.style.padding = '3px 6px';
                                    h2oLabel2.style.borderRadius = '4px';
                                    
                                    const h2oLabel2Object = new CSS2DObject(h2oLabel2);
                                    h2oLabel2Object.position.set(-8, -8, 0);
                                    currentReactionGroup.add(h2oLabel2Object);
                                    
                                    animationInProgress = false;
                                    playButton.disabled = false;
                                    stepButton.disabled = false;
                                })
                                .start();
                        }, 1000);
                    })
                    .start();
            }, 1000);
        })
        .start();
}

// Animate full acid-base reaction
function animateAcidBaseReaction() {
    animationInProgress = true;
    
    // Phase 1: Ion Recombination
    updateReactionInfo(1);
    currentStep = 1;
    
    // Highlight ions
    molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.7;
    molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.7;
    
    // Animate ion movement and recombination
    new TWEEN.Tween(molecules.acid.hydrogen.group.position)
        .to({ x: 0, y: -2 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.acid.chlorine.group.position)
        .to({ x: 0, y: 4 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.base.sodium.group.position)
        .to({ x: 0, y: 0 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.base.oxygen.group.position)
        .to({ x: 0, y: -4 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .start();
        
    new TWEEN.Tween(molecules.base.hydrogen.group.position)
        .to({ x: 0, y: -8 }, ANIMATION_DURATION)
        .easing(TWEEN.Easing.Quadratic.InOut)
        .onComplete(() => {
            // Reset highlight
            molecules.acid.hydrogen.nucleus.material.emissiveIntensity = 0.4;
            molecules.base.hydrogen.nucleus.material.emissiveIntensity = 0.4;
            
            // Phase 2: Final State
            setTimeout(() => {
                updateReactionInfo(2);
                currentStep = 2;
                
                // Rearrange atoms to show final products
                new TWEEN.Tween(molecules.acid.hydrogen.group.position)
                    .to({ x: 12, y: -4 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.base.oxygen.group.position)
                    .to({ x: 12, y: 0 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.base.hydrogen.group.position)
                    .to({ x: 12, y: 4 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.acid.chlorine.group.position)
                    .to({ x: -12, y: 0 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .start();
                    
                new TWEEN.Tween(molecules.base.sodium.group.position)
                    .to({ x: -12, y: 4 }, ANIMATION_DURATION)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onComplete(() => {
                        // Add product labels
                        const naClLabel = document.createElement('div');
                        naClLabel.className = 'molecule-label';
                        naClLabel.textContent = 'NaCl';
                        naClLabel.style.color = '#ffffff';
                        naClLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        naClLabel.style.padding = '3px 6px';
                        naClLabel.style.borderRadius = '4px';
                        
                        const naClLabelObject = new CSS2DObject(naClLabel);
                        naClLabelObject.position.set(-12, -3, 0);
                        currentReactionGroup.add(naClLabelObject);
                        
                        const h2oLabel = document.createElement('div');
                        h2oLabel.className = 'molecule-label';
                        h2oLabel.textContent = 'H₂O';
                        h2oLabel.style.color = '#ffffff';
                        h2oLabel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                        h2oLabel.style.padding = '3px 6px';
                        h2oLabel.style.borderRadius = '4px';
                        
                        const h2oLabelObject = new CSS2DObject(h2oLabel);
                        h2oLabelObject.position.set(12, -3, 0);
                        currentReactionGroup.add(h2oLabelObject);
                        
                        animationInProgress = false;
                        playButton.disabled = false;
                        stepButton.disabled = false;
                    })
                    .start();
            }, 1000);
        })
        .start();
}

// --- Initialization ---
function init() {
    console.log("Initializing Chemical Reaction Visualizer...");
    
    // Get DOM elements
    const container = document.getElementById('visualization-container');
    playButton = document.getElementById('play-button');
    resetButton = document.getElementById('reset-button');
    stepButton = document.getElementById('step-button');
    reactionSelect = document.getElementById('reaction-select');
    reactionPhaseElement = document.getElementById('reaction-phase');
    reactionExplanationElement = document.getElementById('reaction-explanation');
    electronTransferInfoElement = document.getElementById('electron-transfer-info');
    shellLabelsCheckbox = document.getElementById('show-shell-labels');
    
    // Initialize Three.js scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // Set up renderer
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Set up CSS2D renderer for labels
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    container.appendChild(labelRenderer.domElement);
    
    // Set up camera
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = 25;
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
    pointLight.position.set(10, 10, 15);
    scene.add(pointLight);
    
    const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
    pointLight2.position.set(-10, -10, 15);
    scene.add(pointLight2);
    
    // Set up orbit controls
    controls = new OrbitControls(camera, labelRenderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 7;
    controls.maxDistance = 60;
    
    // Add reaction group to scene
    scene.add(currentReactionGroup);
    
    // Set up event listeners
    window.addEventListener('resize', onWindowResize, false);
    reactionSelect.addEventListener('change', onReactionChange);
    playButton.addEventListener('click', playReaction);
    resetButton.addEventListener('click', resetReaction);
    stepButton.addEventListener('click', stepReaction);
    shellLabelsCheckbox.addEventListener('change', toggleShellLabels);
    
    // Get initial shell label state
    showShellLabels = shellLabelsCheckbox.checked;
    
    // Initialize with the default reaction
    setupReaction(currentReaction);
    
    // Start animation loop
    animate();
    
    console.log("Chemical Reaction Visualizer initialized");
}

// --- Initialize on DOM Content Loaded ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 50);
});
