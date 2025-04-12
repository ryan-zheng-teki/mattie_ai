import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/addons/renderers/CSS2DRenderer.js';
import TWEEN from 'tween';

// --- Constants and Configuration ---
const NUCLEUS_RADIUS = 1.5;                  // Increased for better visibility
const ELECTRON_RADIUS = 0.45;                // Increased for better visibility
const SHELL_RADIUS_BASE = 3.0;               // Increased for better visibility
const SHELL_RADIUS_INCREMENT = 1.5;          // Increased for better spacing
const ELECTRON_SPEED_MULTIPLIER = 0.3;       // Slower for better tracking
const POSITIVE_INDICATOR_COLOR = 0xff4444;   // Red for positive charge
const NEGATIVE_INDICATOR_COLOR = 0x44aaff;   // Blue for negative charge

// Color arrays for shells and electrons - brighter colors
const SHELL_COLORS = [
    0xff5252, // Bright Red (1st shell - K)
    0x4caf50, // Bright Green (2nd shell - L) 
    0x2196f3, // Bright Blue (3rd shell - M)
    0x9c27b0, // Bright Purple (4th shell - N)
    0xffeb3b  // Bright Yellow (5th shell - O)
];

const ELECTRON_COLORS = [
    0xff7070, // Brighter red (1st shell electrons)
    0x70ff70, // Brighter green (2nd shell electrons)
    0x7070ff, // Brighter blue (3rd shell electrons)
    0xff70ff, // Brighter purple (4th shell electrons)
    0xffff70  // Brighter yellow (5th shell electrons)
];

// Element colors by nucleus - brighter colors
const NUCLEUS_COLORS = {
    Na: 0xff8833, // Brighter Orange for Sodium
    Cl: 0x33ee66, // Brighter Green for Chlorine
    Mg: 0xffcc33, // Brighter Light Orange for Magnesium
    Ca: 0xffee66, // Brighter Yellow for Calcium
    K:  0xffaa33, // Brighter Dark Orange for Potassium
    F:  0x33ffcc, // Brighter Teal for Fluorine
    Al: 0xeeeeee, // Brighter Silver for Aluminum
    O:  0x33ccff, // Brighter Light Blue for Oxygen
    default: 0xaaaaaa // Brighter Grey default
};

// Child-friendly explanations for elements
const CHILD_FRIENDLY_DESCRIPTIONS = {
    Na: {
        neutral: "Sodium has 1 lonely electron in its outer shell. It really wants to give it away and be stable!",
        ion: "Sodium gave away 1 electron and now it's happy with a complete shell! It has a +1 charge now.",
        animation: "Sodium gives away its outer electron to become stable!"
    },
    Cl: {
        neutral: "Chlorine needs just 1 more electron to fill its outer shell. It really wants to grab one!",
        ion: "Chlorine caught 1 more electron and now its outer shell is full and happy! It has a -1 charge now.",
        animation: "Chlorine grabs another electron to fill its outer shell!"
    },
    Mg: {
        neutral: "Magnesium has 2 electrons in its outer shell. It wants to give both away to be like neon!",
        ion: "Magnesium gave away 2 electrons and now it's super stable! It has a +2 charge now.",
        animation: "Magnesium gives away its two outer electrons to become stable!"
    },
    Ca: {
        neutral: "Calcium has 2 electrons in its outer shell. It wants to share them to become stable!",
        ion: "Calcium gave away 2 electrons to have a full outer shell! It has a +2 charge now.",
        animation: "Calcium gives away its two outer electrons to become stable!"
    },
    K: {
        neutral: "Potassium has 1 electron in its outer shell. It really wants to give it away!",
        ion: "Potassium gave away 1 electron and now it's stable and happy! It has a +1 charge now.",
        animation: "Potassium gives away its outer electron to become stable!"
    },
    F: {
        neutral: "Fluorine needs 1 more electron to fill its outer shell. It really wants to grab one!",
        ion: "Fluorine caught 1 more electron and now its outer shell is full! It has a -1 charge now.",
        animation: "Fluorine grabs another electron to fill its outer shell!"
    },
    Al: {
        neutral: "Aluminum has 3 electrons in its outer shell. It wants to give them all away!",
        ion: "Aluminum gave away 3 electrons and now it's stable like neon! It has a +3 charge now.",
        animation: "Aluminum gives away its three outer electrons to become stable!"
    },
    O: {
        neutral: "Oxygen needs 2 more electrons to fill its outer shell. It really wants to grab them!",
        ion: "Oxygen caught 2 more electrons and now its outer shell is full! It has a -2 charge now.",
        animation: "Oxygen grabs two more electrons to fill its outer shell!"
    }
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

// Quiz questions
const quizQuestions = [
    {
        question: "What happens when Sodium (Na) loses an electron?",
        options: [
            "It becomes a negative ion (anion)",
            "It becomes a positive ion (cation)",
            "It stays neutral but becomes unstable",
            "It explodes!"
        ],
        correctIndex: 1,
        explanation: "When Sodium loses an electron, it has more protons than electrons, giving it a positive charge. It becomes Na+ (a cation)."
    },
    {
        question: "Why do atoms want to gain or lose electrons?",
        options: [
            "To become electrically charged",
            "To have 8 protons",
            "To have a full outer shell of electrons",
            "To make the nucleus bigger"
        ],
        correctIndex: 2,
        explanation: "Atoms want to have full outer shells (usually 8 electrons for many elements). This makes them stable and happy!"
    },
    {
        question: "What happens when Chlorine (Cl) gains an electron?",
        options: [
            "It becomes a positive ion (cation)",
            "It becomes a negative ion (anion)",
            "Nothing changes",
            "It loses its color"
        ],
        correctIndex: 1,
        explanation: "When Chlorine gains an electron, it has more electrons than protons, giving it a negative charge. It becomes Cl- (an anion)."
    },
    {
        question: "Which of these elements would GAIN electrons to become an ion?",
        options: [
            "Sodium (Na)",
            "Potassium (K)",
            "Oxygen (O)",
            "Magnesium (Mg)"
        ],
        correctIndex: 2,
        explanation: "Oxygen wants to gain 2 electrons to fill its outer shell and become O2-. The other elements listed all lose electrons to form ions."
    },
    {
        question: "Which of these elements would LOSE electrons to become an ion?",
        options: [
            "Chlorine (Cl)",
            "Fluorine (F)",
            "Oxygen (O)",
            "Sodium (Na)"
        ],
        correctIndex: 3,
        explanation: "Sodium wants to lose 1 electron to empty its outer shell and become Na+. The other elements listed all gain electrons to form ions."
    }
];

// --- Global Variables ---
let scene, camera, renderer, labelRenderer, controls;
let currentAtomGroup = new THREE.Group();
let electrons = [];
let nucleusObject = null;
let chargeIndicator = null;
let currentElement = null;
let currentState = 'neutral';
let animationInProgress = false;
let isFullscreen = false;
let isStepByStepMode = false;
let currentStep = 0;
let stepsToAnimate = [];
let labels = [];
let narrationTimeout = null;

// --- Initialization ---
function init() {
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
    
    // Set up CSS2D renderer for labels
    labelRenderer = new CSS2DRenderer();
    labelRenderer.setSize(width, height);
    labelRenderer.domElement.style.position = 'absolute';
    labelRenderer.domElement.style.top = '0';
    labelRenderer.domElement.style.pointerEvents = 'none';
    container.appendChild(labelRenderer.domElement);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7); // Increased brightness
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffffff, 1.0, 100); // Increased brightness
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
    
    // Set up event listeners for visualization
    window.addEventListener('resize', onWindowResize, false);
    document.getElementById('element-select').addEventListener('change', onElementChange);
    document.getElementById('state-select').addEventListener('change', onStateChange);
    document.getElementById('animate-button').addEventListener('click', animateIonization);
    document.getElementById('step-by-step-toggle').addEventListener('click', toggleStepByStepMode);
    document.getElementById('next-step').addEventListener('click', nextAnimationStep);
    document.getElementById('zoom-in').addEventListener('click', () => zoomCamera(0.8));
    document.getElementById('zoom-out').addEventListener('click', () => zoomCamera(1.2));
    document.getElementById('fullscreen-button').addEventListener('click', toggleFullscreen);
    
    // Set up tabs
    setupTabs();
    
    // Set up quiz
    setupQuiz();
    
    // Initial display
    const initialSelection = 'Na'; // Start with Sodium
    document.getElementById('element-select').value = initialSelection;
    updateVisualization(initialSelection, 'neutral');
    
    console.log("Initialization complete.");
    animate();
}

// --- UI Enhancement Functions ---

// Set up tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and its content
            tab.classList.add('active');
            const contentId = tab.getAttribute('data-tab') + '-tab';
            document.getElementById(contentId).classList.add('active');
            
            // If switching to quiz tab, load a new question
            if (tab.getAttribute('data-tab') === 'quiz') {
                loadRandomQuestion();
            }
        });
    });
}

// Set up quiz
function setupQuiz() {
    // Set up quiz event listeners
    document.getElementById('next-question').addEventListener('click', loadRandomQuestion);
}

// Load a random quiz question
function loadRandomQuestion() {
    const questionEl = document.getElementById('quiz-question');
    const optionsEl = document.getElementById('quiz-options');
    const feedbackEl = document.getElementById('quiz-feedback');
    
    // Clear previous content
    optionsEl.innerHTML = '';
    feedbackEl.innerHTML = '';
    feedbackEl.className = '';
    
    // Pick a random question
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    const question = quizQuestions[randomIndex];
    
    // Set question text
    questionEl.textContent = question.question;
    
    // Create options
    question.options.forEach((option, index) => {
        const optionEl = document.createElement('div');
        optionEl.className = 'quiz-option';
        optionEl.textContent = option;
        optionEl.dataset.index = index;
        
        optionEl.addEventListener('click', () => {
            // Remove selected class from all options
            document.querySelectorAll('.quiz-option').forEach(opt => {
                opt.classList.remove('selected', 'correct', 'incorrect');
            });
            
            // Add selected class to clicked option
            optionEl.classList.add('selected');
            
            // Check if answer is correct
            if (index === question.correctIndex) {
                optionEl.classList.add('correct');
                feedbackEl.textContent = '✅ Correct! ' + question.explanation;
                feedbackEl.className = 'correct';
            } else {
                optionEl.classList.add('incorrect');
                
                // Highlight the correct answer
                const correctOption = document.querySelector(`.quiz-option[data-index="${question.correctIndex}"]`);
                correctOption.classList.add('correct');
                
                feedbackEl.textContent = '❌ Not quite. ' + question.explanation;
                feedbackEl.className = 'incorrect';
            }
        });
        
        optionsEl.appendChild(optionEl);
    });
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

// Toggle step by step animation mode
function toggleStepByStepMode() {
    isStepByStepMode = !isStepByStepMode;
    const button = document.getElementById('step-by-step-toggle');
    const nextButton = document.getElementById('next-step');
    
    if (isStepByStepMode) {
        button.classList.add('active');
        nextButton.disabled = false;
        showNarration("Step-by-step mode enabled! Click 'Next' to see each step.");
    } else {
        button.classList.remove('active');
        nextButton.disabled = true;
        showNarration("Normal animation mode enabled.");
    }
}

// Next step in step-by-step animation
function nextAnimationStep() {
    if (!isStepByStepMode || stepsToAnimate.length === 0) return;
    
    // Execute the next step
    const nextStep = stepsToAnimate.shift();
    nextStep();
    
    // Disable the next button if no more steps
    if (stepsToAnimate.length === 0) {
        document.getElementById('next-step').disabled = true;
        // Reset after all steps are complete
        setTimeout(() => {
            animationInProgress = false;
            document.getElementById('animate-button').disabled = false;
            document.getElementById('state-select').value = 'ion';
        }, 500);
    }
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

// Show narration text
function showNarration(text, duration = 4000) {
    const narrationEl = document.getElementById('animation-narration');
    
    // Clear any existing timeout
    if (narrationTimeout) {
        clearTimeout(narrationTimeout);
    }
    
    // Set text and show
    narrationEl.textContent = text;
    narrationEl.style.opacity = '1';
    
    // Hide after duration
    narrationTimeout = setTimeout(() => {
        narrationEl.style.opacity = '0';
    }, duration);
}

// --- Atom and Ion Visualization ---

// Create nucleus mesh with labels
function createNucleusMesh(color, radius = NUCLEUS_RADIUS) {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = new THREE.MeshPhongMaterial({ 
        color: color, 
        emissive: color, 
        emissiveIntensity: 0.5 // Increased for better visibility
    });
    const nucleus = new THREE.Mesh(geometry, material);
    
    // Add nucleus label
    addLabel(nucleus, 'Nucleus', 0xffffff);
    
    return nucleus;
}

// Create orbital shell with color based on shell index
function createOrbitalShell(radius, shellIndex) {
    // Get color based on shell index (with fallback)
    const color = SHELL_COLORS[shellIndex] || SHELL_COLORS[SHELL_COLORS.length - 1];
    
    const geometry = new THREE.SphereGeometry(radius, 32, 16);
    const material = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: 0.25, // Increased for better visibility
        wireframe: true
    });
    const shell = new THREE.Mesh(geometry, material);
    
    // Add shell label
    const shellNames = ['1st Shell (K)', '2nd Shell (L)', '3rd Shell (M)', '4th Shell (N)', '5th Shell (O)'];
    const shellName = shellNames[shellIndex] || `Shell ${shellIndex + 1}`;
    addLabel(shell, shellName, color, { x: radius * 0.7, y: radius * 0.7, z: 0 });
    
    return shell;
}

// Add a label to a Three.js object
function addLabel(object, text, color, offset = { x: 0, y: 0, z: 0 }) {
    const labelDiv = document.createElement('div');
    labelDiv.className = 'atom-label';
    labelDiv.textContent = text;
    labelDiv.style.color = `#${new THREE.Color(color).getHexString()}`;
    
    const label = new CSS2DObject(labelDiv);
    label.position.set(offset.x, offset.y, offset.z);
    object.add(label);
    
    // Add to labels array for later management
    labels.push(label);
    
    return label;
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
            emissiveIntensity: 0.7 // Increased for better visibility
        });
        const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
        
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
        
        // If it's the first electron in each shell, add label
        if (i === 0) {
            addLabel(electronMesh, 'Electron', electronColor);
        }
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
    
    // Add a subtle pulsing effect to make electrons more visible
    const pulseScale = 1 + 0.1 * Math.sin(deltaTime * 2);
    electron.mesh.scale.set(pulseScale, pulseScale, pulseScale);
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
    
    // Create a proper "+" or "-" sign using line segments
    const indicatorGroup = new THREE.Group();
    const lineWidth = 0.2;              // Increased width
    const lineLength = 1.5;             // Increased length
    const spacing = lineLength * 1.5;   // Increased spacing between indicators
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
    // Top-center of the atom instead of top-right
    indicatorGroup.position.set(
        position.x, 
        position.y + SHELL_RADIUS_BASE + 2.5, // Position above the outer shell
        position.z
    );
    
    // Scale the indicator to be more visible
    indicatorGroup.scale.set(2.0, 2.0, 2.0);  // Larger scale for better visibility
    
    // Add a label to the charge indicator
    if (isPositive) {
        addLabel(indicatorGroup, `+${chargeNumber} Charge`, 0xff4444);
    } else {
        addLabel(indicatorGroup, `-${chargeNumber} Charge`, 0x44aaff);
    }
    
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
        // Use child-friendly descriptions
        elementInfo.textContent = `${element.name} (${element.symbol}): Neutral Atom`;
        elementInfo.className = 'info-box neutral-charge';
        
        // Get the child-friendly description
        const childFriendlyDesc = CHILD_FRIENDLY_DESCRIPTIONS[element.symbol]?.neutral || 
            `${element.name} has ${element.neutralState.electronsPerShell.join(', ')} electrons in its shells.`;
        
        chargeInfo.innerHTML = childFriendlyDesc;
        chargeInfo.className = 'info-box neutral-charge';
    } else {
        // Ion state - use child-friendly descriptions
        const chargeClass = element.ionState.charge.startsWith('+') ? 'positive-charge' : 'negative-charge';
        
        elementInfo.textContent = `${element.name} (${element.symbol}${element.ionState.charge}): Ion`;
        elementInfo.className = `info-box ${chargeClass}`;
        
        // Get the child-friendly description
        const childFriendlyDesc = CHILD_FRIENDLY_DESCRIPTIONS[element.symbol]?.ion || element.ionState.description;
        
        chargeInfo.innerHTML = childFriendlyDesc;
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
    
    // Get the narration text for this element
    const narrationText = CHILD_FRIENDLY_DESCRIPTIONS[currentElement]?.animation || 
        `Watch how ${element.name} changes to become stable!`;
    
    // Show narration
    showNarration(narrationText, 5000);
    
    // Determine if we're showing electron loss or gain
    const isElectronGain = elementRequiresElectronGain(currentElement);
    
    if (isStepByStepMode) {
        // Set up steps for step-by-step animation
        setupStepByStepAnimation(isElectronGain);
        document.getElementById('next-step').disabled = false;
    } else {
        // Regular animation
        if (isElectronGain) {
            animateElectronGain();
        } else {
            animateElectronLoss();
        }
    }
}

// Set up steps for step-by-step animation
function setupStepByStepAnimation(isElectronGain) {
    stepsToAnimate = [];
    
    if (isElectronGain) {
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
        
        // Set up steps for electron gain
        for (let i = 0; i < electronsToAdd; i++) {
            stepsToAnimate.push(() => {
                animateElectronGainStep(i + 1, electronsToAdd);
            });
        }
        
        // Add final step to update visualization
        stepsToAnimate.push(() => {
            updateVisualization(currentElement, 'ion');
            showNarration(`${element.name} is now stable with a full outer shell!`);
        });
    } else {
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
        
        // Set up steps for electron loss
        for (let i = 0; i < electronsToRemove; i++) {
            stepsToAnimate.push(() => {
                animateElectronLossStep(i + 1, electronsToRemove);
            });
        }
        
        // Add final step to update visualization
        stepsToAnimate.push(() => {
            updateVisualization(currentElement, 'ion');
            showNarration(`${element.name} is now stable without those extra electrons!`);
        });
    }
}

// Animate a single step of electron loss
function animateElectronLossStep(stepNumber, totalSteps) {
    const element = elements[currentElement];
    const outerShellIndex = element.neutralState.electronsPerShell.length - 1;
    const outerShellElectrons = electrons.filter(e => e.shellIndex === outerShellIndex);
    
    if (outerShellElectrons.length === 0) {
        return;
    }
    
    // Take one electron to animate
    const electronToAnimate = outerShellElectrons[0];
    electronToAnimate.isAnimating = true;
    
    // Show step narration
    showNarration(`Step ${stepNumber}: ${element.name} is giving away electron ${stepNumber} of ${totalSteps}!`);
    
    // Create electron lost label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'atom-label';
    labelDiv.textContent = 'Electron leaving!';
    labelDiv.style.color = '#ff4444';
    
    const label = new CSS2DObject(labelDiv);
    electronToAnimate.mesh.add(label);
    labels.push(label);
    
    // Animate the electron moving away
    const startPos = electronToAnimate.mesh.position.clone();
    const direction = startPos.clone().normalize().multiplyScalar(15);
    
    // Add some randomization to make it look more natural
    direction.x += (Math.random() - 0.5) * 5;
    direction.y += (Math.random() - 0.5) * 5;
    direction.z += (Math.random() - 0.5) * 5;
    
    const targetPos = startPos.clone().add(direction);
    
    new TWEEN.Tween(electronToAnimate.mesh.position)
        .to(targetPos, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            // Remove the electron
            currentAtomGroup.remove(electronToAnimate.mesh);
            if (electronToAnimate.mesh.geometry) electronToAnimate.mesh.geometry.dispose();
            if (electronToAnimate.mesh.material) electronToAnimate.mesh.material.dispose();
            
            // Remove from electrons array
            const index = electrons.indexOf(electronToAnimate);
            if (index > -1) {
                electrons.splice(index, 1);
            }
        }).start();
}

// Animate a single step of electron gain
function animateElectronGainStep(stepNumber, totalSteps) {
    const element = elements[currentElement];
    const targetShellIndex = element.neutralState.electronsPerShell.length - 1;
    const targetRadius = SHELL_RADIUS_BASE + targetShellIndex * SHELL_RADIUS_INCREMENT;
    const electronColor = ELECTRON_COLORS[targetShellIndex] || ELECTRON_COLORS[ELECTRON_COLORS.length - 1];
    
    // Show step narration
    showNarration(`Step ${stepNumber}: ${element.name} is grabbing electron ${stepNumber} of ${totalSteps}!`);
    
    // Create a new electron
    const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
    const electronMaterial = new THREE.MeshPhongMaterial({ 
        color: electronColor, 
        emissive: electronColor, 
        emissiveIntensity: 0.7
    });
    const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
    
    // Start from random position outside the atom
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
    
    electrons.push(electronData);
    currentAtomGroup.add(electronMesh);
    
    // Create electron gained label
    const labelDiv = document.createElement('div');
    labelDiv.className = 'atom-label';
    labelDiv.textContent = 'New electron!';
    labelDiv.style.color = '#44aaff';
    
    const label = new CSS2DObject(labelDiv);
    electronMesh.add(label);
    labels.push(label);
    
    // Calculate target position on the shell
    const targetPos = new THREE.Vector3(
        targetRadius * Math.sin(electronData.theta) * Math.cos(electronData.phi),
        targetRadius * Math.sin(electronData.theta) * Math.sin(electronData.phi),
        targetRadius * Math.cos(electronData.theta)
    );
    
    // Animate the electron moving to the atom
    new TWEEN.Tween(electronMesh.position)
        .to(targetPos, 1500)
        .easing(TWEEN.Easing.Quadratic.Out)
        .onComplete(() => {
            electronData.isAnimating = false;
            
            // Remove the label after animation
            setTimeout(() => {
                if (label && electronMesh) {
                    electronMesh.remove(label);
                    const index = labels.indexOf(label);
                    if (index > -1) {
                        labels.splice(index, 1);
                    }
                }
            }, 1000);
        }).start();
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
        
        // Add a "leaving" label to each electron
        const labelDiv = document.createElement('div');
        labelDiv.className = 'atom-label';
        labelDiv.textContent = 'Leaving!';
        labelDiv.style.color = '#ff4444';
        
        const label = new CSS2DObject(labelDiv);
        electron.mesh.add(label);
        labels.push(label);
    });
    
    // Update narration during animation
    showNarration(`${element.name} is giving away ${electronsToRemove} electron${electronsToRemove > 1 ? 's' : ''}!`);
    
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
                            
                            // Show completion narration
                            showNarration(`${element.name} is now stable without those extra electrons!`);
                        }, 500);
                    }
                }).start();
        }, index * 300); // Longer stagger for better visibility
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
    
    // Update narration during animation
    showNarration(`${element.name} is grabbing ${electronsToAdd} more electron${electronsToAdd > 1 ? 's' : ''}!`);
    
    // Create incoming electrons
    const incomingElectrons = [];
    for (let i = 0; i < electronsToAdd; i++) {
        const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
        const electronMaterial = new THREE.MeshPhongMaterial({ 
            color: electronColor, 
            emissive: electronColor, 
            emissiveIntensity: 0.7
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
        
        // Add a "new" label to each electron
        const labelDiv = document.createElement('div');
        labelDiv.className = 'atom-label';
        labelDiv.textContent = 'New electron!';
        labelDiv.style.color = '#44aaff';
        
        const label = new CSS2DObject(labelDiv);
        electronMesh.add(label);
        labels.push(label);
        
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
                            
                            // Show completion narration
                            showNarration(`${element.name} is now stable with a full outer shell!`);
                        }, 500);
                    }
                }).start();
        }, index * 300); // Longer stagger for better visibility
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
    
    // Clear all labels
    labels = [];
    
    electrons = []; // Clear electron tracking array
    nucleusObject = null;
    chargeIndicator = null;
    
    // Reset step-by-step animation state
    stepsToAnimate = [];
    currentStep = 0;
    document.getElementById('next-step').disabled = true;
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
    labelRenderer.setSize(width, height);
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
    labelRenderer.render(scene, camera);
}

// --- Start Application ---
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 50);
});
