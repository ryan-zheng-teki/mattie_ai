import * as THREE from 'three';
import TWEEN from 'tween';
import { elements, elementRequiresElectronGain, SHELL_RADIUS_BASE, SHELL_RADIUS_INCREMENT, ELECTRON_COLORS, ELECTRON_RADIUS } from './elements-data.js';
import { getCurrentAtomGroup, getElectrons, getSceneAndCamera, updateVisualization } from './visualization.js';
import { showTemporaryLabel, showNarration, updateExplanationBox, getUIState } from './ui.js';

// Animation state variables
export let animationInProgress = false;
let isStepByStepMode = false;
let stepsToAnimate = [];

// Initialize animation controls
export function initAnimationControls() {
    document.getElementById('step-by-step-toggle').addEventListener('click', toggleStepByStepMode);
    document.getElementById('next-step').addEventListener('click', nextAnimationStep);
}

// Toggle step-by-step animation mode
export function toggleStepByStepMode() {
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

// Proceed to next step in step-by-step animation
export function nextAnimationStep() {
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

// Start ionization animation
export function animateIonization() {
    const { currentElement } = getUIState();
    
    if (animationInProgress || !currentElement) return;
    
    const element = elements[currentElement];
    if (!element || !element.ionizationAnimation) return;
    
    animationInProgress = true;
    document.getElementById('animate-button').disabled = true;
    
    // Get the narration text for this element
    const narrationText = element.neutralState.description || 
        `Watch how ${element.name} changes to become stable!`;
    
    // Show narration and update explanation
    showNarration(narrationText, 5000);
    updateExplanationBox(narrationText);
    
    // Determine if we're showing electron loss or gain
    const isElectronGain = elementRequiresElectronGain(currentElement);
    
    if (isStepByStepMode) {
        // Set up steps for step-by-step animation
        setupStepByStepAnimation(isElectronGain, currentElement);
        document.getElementById('next-step').disabled = false;
    } else {
        // Regular animation
        if (isElectronGain) {
            animateElectronGain(currentElement);
        } else {
            animateElectronLoss(currentElement);
        }
    }
}

// Set up step-by-step animation
function setupStepByStepAnimation(isElectronGain, elementSymbol) {
    stepsToAnimate = [];
    const element = elements[elementSymbol];
    
    if (isElectronGain) {
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
                animateElectronGainStep(i + 1, electronsToAdd, elementSymbol);
            });
        }
        
        // Add final step to update visualization
        stepsToAnimate.push(() => {
            updateVisualization(elementSymbol, 'ion');
            showNarration(`${element.name} is now stable with a full outer shell!`);
            updateExplanationBox(`${element.name} has gained ${electronsToAdd} electron${electronsToAdd > 1 ? 's' : ''} and is now stable with a full outer shell.`);
        });
    } else {
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
                animateElectronLossStep(i + 1, electronsToRemove, elementSymbol);
            });
        }
        
        // Add final step to update visualization
        stepsToAnimate.push(() => {
            updateVisualization(elementSymbol, 'ion');
            showNarration(`${element.name} is now stable without those extra electrons!`);
            updateExplanationBox(`${element.name} has lost ${electronsToRemove} electron${electronsToRemove > 1 ? 's' : ''} and is now stable.`);
        });
    }
}

// Animate a single step of electron loss
function animateElectronLossStep(stepNumber, totalSteps, elementSymbol) {
    const element = elements[elementSymbol];
    const electrons = getElectrons();
    const currentAtomGroup = getCurrentAtomGroup();
    const { scene, camera, renderer } = getSceneAndCamera();
    
    const outerShellIndex = element.neutralState.electronsPerShell.length - 1;
    const outerShellElectrons = electrons.filter(e => e.shellIndex === outerShellIndex);
    
    if (outerShellElectrons.length === 0) {
        return;
    }
    
    // Take one electron to animate
    const electronToAnimate = outerShellElectrons[0];
    electronToAnimate.isAnimating = true;
    
    // Step narration
    const stepText = `Step ${stepNumber}: ${element.name} is giving away electron ${stepNumber} of ${totalSteps}!`;
    showNarration(stepText);
    updateExplanationBox(stepText);
    
    // Show temporary label near the electron
    const canvasRect = renderer.domElement.getBoundingClientRect();
    const screenPosition = getScreenPosition(electronToAnimate.mesh.position, camera, renderer);
    
    showTemporaryLabel('Electron leaving!',
                      screenPosition.x + canvasRect.left,
                      screenPosition.y + canvasRect.top,
                      '#ff4444',
                      2000);
    
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
function animateElectronGainStep(stepNumber, totalSteps, elementSymbol) {
    const element = elements[elementSymbol];
    const electrons = getElectrons();
    const currentAtomGroup = getCurrentAtomGroup();
    const { scene, camera, renderer } = getSceneAndCamera();
    
    const targetShellIndex = element.neutralState.electronsPerShell.length - 1;
    const targetRadius = SHELL_RADIUS_BASE + targetShellIndex * SHELL_RADIUS_INCREMENT;
    const electronColor = ELECTRON_COLORS[targetShellIndex] || ELECTRON_COLORS[0];
    
    // Step narration
    const stepText = `Step ${stepNumber}: ${element.name} is grabbing electron ${stepNumber} of ${totalSteps}!`;
    showNarration(stepText);
    updateExplanationBox(stepText);
    
    // Create a new electron
    const electronGeometry = new THREE.SphereGeometry(ELECTRON_RADIUS, 16, 16);
    const electronMaterial = new THREE.MeshPhongMaterial({ 
        color: electronColor, 
        emissive: electronColor, 
        emissiveIntensity: 0.7
    });
    const electronMesh = new THREE.Mesh(electronGeometry, electronMaterial);
    electronMesh.userData.isElectron = true;
    electronMesh.userData.shellIndex = targetShellIndex;
    
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
        phiSpeed: 0.3 / (targetRadius || 1),
        thetaSpeed: 0.3 * 0.7 / (targetRadius || 1),
        isAnimating: true,
        center: new THREE.Vector3(0, 0, 0),
        color: electronColor
    };
    
    electrons.push(electronData);
    currentAtomGroup.add(electronMesh);
    
    // Show temporary label near the new electron
    const canvasRect = renderer.domElement.getBoundingClientRect();
    const screenPosition = getScreenPosition(electronMesh.position, camera, renderer);
    
    showTemporaryLabel('New electron!',
                      screenPosition.x + canvasRect.left,
                      screenPosition.y + canvasRect.top,
                      '#44aaff',
                      2000);
    
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
        }).start();
}

// Animate electron loss (for cations)
function animateElectronLoss(elementSymbol) {
    const element = elements[elementSymbol];
    const electrons = getElectrons();
    const currentAtomGroup = getCurrentAtomGroup();
    const { scene, camera, renderer } = getSceneAndCamera();
    
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
        updateVisualization(elementSymbol, 'ion');
        animationInProgress = false;
        document.getElementById('animate-button').disabled = false;
        return;
    }
    
    // Mark electrons for animation
    const electronsToAnimate = outerShellElectrons.slice(0, electronsToRemove);
    electronsToAnimate.forEach(electron => {
        electron.isAnimating = true;
    });
    
    // Update narration during animation
    const narrationText = `${element.name} is giving away ${electronsToRemove} electron${electronsToRemove > 1 ? 's' : ''}!`;
    showNarration(narrationText);
    updateExplanationBox(narrationText);
    
    let completedAnimations = 0;
    
    // Animate each electron moving away
    electronsToAnimate.forEach((electron, index) => {
        // Show temporary label near the electron
        setTimeout(() => {
            const canvasRect = renderer.domElement.getBoundingClientRect();
            const screenPosition = getScreenPosition(electron.mesh.position, camera, renderer);
            
            showTemporaryLabel('Electron leaving!',
                              screenPosition.x + canvasRect.left,
                              screenPosition.y + canvasRect.top,
                              '#ff4444',
                              1500);
        }, index * 300); // Stagger labels
        
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
                            updateVisualization(elementSymbol, 'ion');
                            animationInProgress = false;
                            document.getElementById('animate-button').disabled = false;
                            document.getElementById('state-select').value = 'ion';
                            
                            // Show completion narration
                            const completionText = `${element.name} is now stable without those extra electrons!`;
                            showNarration(completionText);
                            updateExplanationBox(completionText);
                        }, 500);
                    }
                }).start();
        }, index * 300); // Longer stagger for better visibility
    });
}

// Animate electron gain (for anions)
function animateElectronGain(elementSymbol) {
    const element = elements[elementSymbol];
    const electrons = getElectrons();
    const currentAtomGroup = getCurrentAtomGroup();
    const { scene, camera, renderer } = getSceneAndCamera();
    
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
        updateVisualization(elementSymbol, 'ion');
        animationInProgress = false;
        document.getElementById('animate-button').disabled = false;
        return;
    }
    
    // Find the target shell (usually the outer shell)
    const targetShellIndex = neutralState.electronsPerShell.length - 1;
    const targetRadius = SHELL_RADIUS_BASE + targetShellIndex * SHELL_RADIUS_INCREMENT;
    const electronColor = ELECTRON_COLORS[targetShellIndex] || ELECTRON_COLORS[0];
    
    // Update narration during animation
    const narrationText = `${element.name} is grabbing ${electronsToAdd} more electron${electronsToAdd > 1 ? 's' : ''}!`;
    showNarration(narrationText);
    updateExplanationBox(narrationText);
    
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
        electronMesh.userData.isElectron = true;
        electronMesh.userData.shellIndex = targetShellIndex;
        
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
            phiSpeed: 0.3 / (targetRadius || 1),
            thetaSpeed: 0.3 * 0.7 / (targetRadius || 1),
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
        // Show temporary label near the electron
        setTimeout(() => {
            const canvasRect = renderer.domElement.getBoundingClientRect();
            const screenPosition = getScreenPosition(electron.mesh.position, camera, renderer);
            
            showTemporaryLabel('New electron!',
                              screenPosition.x + canvasRect.left,
                              screenPosition.y + canvasRect.top,
                              '#44aaff',
                              1500);
        }, index * 300); // Stagger labels
        
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
                            updateVisualization(elementSymbol, 'ion');
                            animationInProgress = false;
                            document.getElementById('animate-button').disabled = false;
                            document.getElementById('state-select').value = 'ion';
                            
                            // Show completion narration
                            const completionText = `${element.name} is now stable with a full outer shell!`;
                            showNarration(completionText);
                            updateExplanationBox(completionText);
                        }, 500);
                    }
                }).start();
        }, index * 300); // Stagger start times
    });
}

// Helper function to get screen position from 3D position
function getScreenPosition(position, camera, renderer) {
    const vector = new THREE.Vector3(position.x, position.y, position.z);
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    
    return { x, y };
}
