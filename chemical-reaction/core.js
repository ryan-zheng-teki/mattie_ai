import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import TWEEN from 'tween';

// --- Constants and Configuration ---
export const NUCLEUS_RADIUS = 1.5;
export const ELECTRON_RADIUS = 0.4;
export const SHELL_RADIUS_BASE = 4.0;
export const SHELL_RADIUS_INCREMENT = 2.0;
export const ELECTRON_SPEED_MULTIPLIER = 0.4;
export const ANIMATION_DURATION = 2500;
export const SHELL_THICKNESS = 0.05;

// Shell colors per level (from innermost to outermost)
export const SHELL_COLORS = [
    0x3498db,  // Blue for K shell
    0x2ecc71,  // Green for L shell
    0xe74c3c,  // Red for M shell
    0xf39c12,  // Orange for N shell
    0x9b59b6   // Purple for O shell
];

// Electron color with higher intensity
export const ELECTRON_COLOR = 0x00aaff;
export const ELECTRON_GLOW = 0x66ccff;

// Element colors with increased saturation
export const NUCLEUS_COLORS = {
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
export const elements = {
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

// --- Core Visualization System ---
class ChemistryVisualizer {
    constructor() {
        // Scene, camera, renderer
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.labelRenderer = null;
        this.controls = null;
        
        // Groups and tracking
        this.currentReactionGroup = new THREE.Group();
        this.electrons = [];
        this.shellLabels = [];
        
        // State
        this.showShellLabels = false;
        this.lastTime = 0;
        this.animationInProgress = false;
        this.currentStep = 0;
        
        // Current reaction
        this.currentReaction = null;
        this.molecules = {};
        
        // DOM Elements
        this.container = null;
        this.playButton = null;
        this.resetButton = null;
        this.stepButton = null;
        this.reactionSelect = null;
        this.shellLabelsCheckbox = null;
        this.reactionPhaseElement = null;
        this.reactionExplanationElement = null; 
        this.electronTransferInfoElement = null;
        
        // Module registry
        this.reactionModules = {};
    }
    
    // Initialize the visualizer
    init() {
        console.log("Initializing Chemical Reaction Visualizer...");
        
        // Get DOM elements
        this.container = document.getElementById('visualization-container');
        this.playButton = document.getElementById('play-button');
        this.resetButton = document.getElementById('reset-button');
        this.stepButton = document.getElementById('step-button');
        this.reactionSelect = document.getElementById('reaction-select');
        this.reactionPhaseElement = document.getElementById('reaction-phase');
        this.reactionExplanationElement = document.getElementById('reaction-explanation');
        this.electronTransferInfoElement = document.getElementById('electron-transfer-info');
        this.shellLabelsCheckbox = document.getElementById('show-shell-labels');
        
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000);
        
        // Set up renderer
        const width = this.container.clientWidth || window.innerWidth;
        const height = this.container.clientHeight || window.innerHeight;
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.appendChild(this.renderer.domElement);
        
        // Set up CSS2D renderer for labels
        this.labelRenderer = new CSS2DRenderer();
        this.labelRenderer.setSize(width, height);
        this.labelRenderer.domElement.style.position = 'absolute';
        this.labelRenderer.domElement.style.top = '0';
        this.container.appendChild(this.labelRenderer.domElement);
        
        // Set up camera
        this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        this.camera.position.z = 25;
        
        // Add lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xffffff, 1.0, 100);
        pointLight.position.set(10, 10, 15);
        this.scene.add(pointLight);
        
        const pointLight2 = new THREE.PointLight(0xffffff, 0.8, 100);
        pointLight2.position.set(-10, -10, 15);
        this.scene.add(pointLight2);
        
        // Set up orbit controls
        this.controls = new OrbitControls(this.camera, this.labelRenderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 7;
        this.controls.maxDistance = 60;
        
        // Add reaction group to scene
        this.scene.add(this.currentReactionGroup);
        
        // Set up event listeners
        window.addEventListener('resize', this.onWindowResize.bind(this), false);
        this.reactionSelect.addEventListener('change', this.onReactionChange.bind(this));
        this.playButton.addEventListener('click', this.playReaction.bind(this));
        this.resetButton.addEventListener('click', this.resetReaction.bind(this));
        this.stepButton.addEventListener('click', this.stepReaction.bind(this));
        this.shellLabelsCheckbox.addEventListener('change', this.toggleShellLabels.bind(this));
        
        // Make sure checkbox is unchecked by default
        this.shellLabelsCheckbox.checked = false;
        this.showShellLabels = false;
        
        // Start animation loop
        this.animate(0);
        
        console.log("Chemical Reaction Visualizer initialized");
    }
    
    // Register a reaction module
    registerReactionModule(key, module) {
        this.reactionModules[key] = module;
        // Initialize the module with this visualizer instance
        module.initialize(this);
    }
    
    // Set the active reaction
    setActiveReaction(reactionType) {
        this.currentReaction = reactionType;
        this.setupReaction(reactionType);
    }
    
    // Set up a specific reaction
    setupReaction(reactionType) {
        console.log(`Setting up reaction: ${reactionType}`);
        
        this.currentReaction = reactionType;
        this.currentStep = 0;
        this.animationInProgress = false;
        
        // Update UI elements
        document.getElementById('reaction-equation').textContent = 
            this.reactionModules[reactionType].getEquation();
        this.updateReactionInfo(0);
        
        // Clear previous visualization
        this.clearVisualization();
        
        // Call setup on the appropriate module
        if (this.reactionModules[reactionType]) {
            this.reactionModules[reactionType].setup();
        } else {
            console.error(`Unknown reaction type: ${reactionType}`);
        }
        
        // Enable/reset control buttons
        this.playButton.disabled = false;
        this.resetButton.disabled = false;
        this.stepButton.disabled = false;
    }
    
    // Animation loop
    animate(time) {
        requestAnimationFrame(this.animate.bind(this));
        const timeSeconds = time * 0.001;
        
        // Update orbit controls
        this.controls.update();
        
        // Update TWEEN animations
        TWEEN.update(time);
        
        // Update electron positions
        if(this.electrons.length > 0) {
            const deltaTime = timeSeconds - this.lastTime;
            this.lastTime = timeSeconds;
            
            if(!isNaN(deltaTime) && deltaTime > 0) {
                this.electrons.forEach(electron => {
                    this.updateElectronPosition(electron, deltaTime);
                });
            }
        }
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
        this.labelRenderer.render(this.scene, this.camera);
    }
    
    // Update electron position based on orbital parameters
    updateElectronPosition(electron, deltaTime) {
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
    
    // Handle window resize
    onWindowResize() {
        if(!this.container) return;
        
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        if(width === 0 || height === 0) return;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.labelRenderer.setSize(width, height);
        
        console.log(`Resized to ${width}x${height}`);
    }
    
    // Handle reaction selection change
    onReactionChange(event) {
        const selectedValue = event.target.value;
        console.log(`Reaction selection changed to: ${selectedValue}`);
        
        this.setupReaction(selectedValue);
    }
    
    // Clear the current visualization
    clearVisualization() {
        console.log("Clearing current visualization");
        
        // Stop all animations
        TWEEN.removeAll();
        
        // Remove all objects from the reaction group
        while(this.currentReactionGroup.children.length > 0) {
            const child = this.currentReactionGroup.children[0];
            this.currentReactionGroup.remove(child);
            
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
        this.shellLabels.forEach(label => {
            if (label.element && label.element.parent) {
                label.element.parent.remove(label.element);
            }
        });
        this.shellLabels = [];
        
        // Reset tracking arrays/objects
        this.electrons = [];
        this.molecules = {};
    }
    
    // Toggle shell labels visibility
    toggleShellLabels() {
        this.showShellLabels = this.shellLabelsCheckbox.checked;
        
        this.shellLabels.forEach(label => {
            if (label.element) {
                label.element.visible = this.showShellLabels;
            }
        });
    }
    
    // Update reaction info display
    updateReactionInfo(phaseIndex) {
        if (!this.reactionModules[this.currentReaction]) return;
        
        const phases = this.reactionModules[this.currentReaction].getPhases();
        if (!phases || !phases[phaseIndex]) return;
        
        const phaseData = phases[phaseIndex];
        this.reactionPhaseElement.textContent = phaseData.name;
        this.reactionExplanationElement.textContent = phaseData.explanation;
        this.electronTransferInfoElement.textContent = phaseData.electronInfo;
    }
    
    // Play the full reaction animation
    playReaction() {
        if(this.animationInProgress) return;
        
        console.log("Playing reaction animation");
        
        // Disable controls during animation
        this.playButton.disabled = true;
        this.stepButton.disabled = true;
        
        // Call animate on the current reaction module
        if (this.reactionModules[this.currentReaction]) {
            this.reactionModules[this.currentReaction].animate();
        }
    }
    
    // Reset the reaction to initial state
    resetReaction() {
        console.log("Resetting reaction");
        this.setupReaction(this.currentReaction);
    }
    
    // Step through the reaction phases
    stepReaction() {
        if(this.animationInProgress) return;
        
        console.log(`Stepping reaction, current step: ${this.currentStep}`);
        
        // Get max steps for current reaction
        const maxSteps = this.reactionModules[this.currentReaction].getPhases().length;
        
        // If already at the end, reset
        if(this.currentStep >= maxSteps - 1) {
            this.resetReaction();
            return;
        }
        
        // Move to next step
        this.currentStep++;
        this.updateReactionInfo(this.currentStep);
        
        // Call step on the current reaction module
        if (this.reactionModules[this.currentReaction]) {
            this.reactionModules[this.currentReaction].step(this.currentStep);
        }
    }
    
    // --- Molecule, Atom, and Bond Creation Utilities ---
    
    // Create a nucleus mesh with glow effect
    createNucleusMesh(elementSymbol, radius = NUCLEUS_RADIUS, position = new THREE.Vector3()) {
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
    createOrbitalShell(radius, position = new THREE.Vector3(), shellIndex = 0) {
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
        if (this.showShellLabels) {
            // Use simple numerical labels (1, 2, 3...) instead of K, L, M, N
            const shellName = (shellIndex + 1).toString();
            
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
            this.shellLabels.push({
                element: shellLabel,
                shellIndex: shellIndex
            });
        }
        
        return shell;
    }
    
    // Add orbiting electrons with improved visibility
    addOrbitingElectrons(centerPosition, count, orbitRadius, shellIndex = 0, electronGroup = this.currentReactionGroup) {
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
            this.updateElectronPosition(electronData, 0);
            
            // Add to tracking arrays
            this.electrons.push(electronData);
            addedElectrons.push(electronData);
            electronGroup.add(electronMesh);
        }
        
        return addedElectrons;
    }
    
    // Create a simple atom visualization with improved visibility
    createAtom(elementSymbol, position = new THREE.Vector3(), scale = 1.0, includeAllElectrons = true) {
        console.log(`Creating atom: ${elementSymbol} at position ${position.x}, ${position.y}, ${position.z}`);
        
        const atomGroup = new THREE.Group();
        atomGroup.position.copy(position);
        this.currentReactionGroup.add(atomGroup);
        
        // Element data
        const elementData = elements[elementSymbol];
        if(!elementData) {
            console.error(`Element data not found for: ${elementSymbol}`);
            return null;
        }
        
        // Create nucleus
        const nucleus = this.createNucleusMesh(elementSymbol, NUCLEUS_RADIUS * scale, new THREE.Vector3());
        atomGroup.add(nucleus);
        
        // Set up electrons and shells
        const atomElectrons = [];
        
        if(includeAllElectrons) {
            elementData.electronsPerShell.forEach((numElectronsInShell, shellIndex) => {
                const shellRadius = (SHELL_RADIUS_BASE + shellIndex * SHELL_RADIUS_INCREMENT) * scale;
                
                // Add orbital shell visualization
                const orbitalShell = this.createOrbitalShell(shellRadius, new THREE.Vector3(), shellIndex);
                atomGroup.add(orbitalShell);
                
                // Add electrons for this shell
                const shellElectrons = this.addOrbitingElectrons(
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
            const orbitalShell = this.createOrbitalShell(shellRadius, new THREE.Vector3(), valenceShellIndex);
            atomGroup.add(orbitalShell);
            
            // Add valence electrons
            const shellElectrons = this.addOrbitingElectrons(
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
    createBond(atom1, atom2, bondOrder = 1) {
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
            this.currentReactionGroup.add(bondLine);
        }
        
        return bonds;
    }
    
    // Animate an electron transferring from one atom to another with improved path
    animateElectronTransfer(electron, sourceAtom, targetAtom, callback) {
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
    
    // Create a label for molecules or atoms
    createLabel(text, position, color = '#ffffff', parent = this.currentReactionGroup) {
        const labelDiv = document.createElement('div');
        labelDiv.className = 'molecule-label';
        labelDiv.textContent = text;
        labelDiv.style.color = color;
        labelDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        labelDiv.style.padding = '3px 6px';
        labelDiv.style.borderRadius = '4px';
        
        const labelObject = new CSS2DObject(labelDiv);
        labelObject.position.copy(position);
        parent.add(labelObject);
        
        return labelObject;
    }
}

// Export the visualizer class
export const visualizer = new ChemistryVisualizer();
export default visualizer;
