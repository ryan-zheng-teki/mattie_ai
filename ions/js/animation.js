import * as THREE from 'three';
import TWEEN from 'tween';
import { elements, elementRequiresElectronGain, SHELL_RADIUS_BASE, SHELL_RADIUS_INCREMENT, ELECTRON_COLORS, ELECTRON_RADIUS, CHILD_FRIENDLY_DESCRIPTIONS } from './elements-data.js';
import { getCurrentAtomGroup, getElectrons, getSceneAndCamera, updateVisualization } from './visualization.js';
import { showTemporaryLabel, showNarration, updateExplanationBox, getUIState } from './ui.js';

// Animation state variables
export let animationInProgress = false;

// Start ionization animation
export function animateIonization() {
    const { currentElement } = getUIState();
    if (!currentElement) return;
    
    const element = elements[currentElement];
    if (!element) return;
    
    // Don't allow animation if already in progress
    if (animationInProgress) return;
    
    // Start animation
    animationInProgress = true;
    
    // Update button state
    const animateButton = document.getElementById('animate-button');
    animateButton.disabled = true;
    animateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ionizing...';
    animateButton.className = 'processing-button';
    
    // Show progress indicator
    const progressIndicator = document.getElementById('progress-indicator');
    progressIndicator.style.display = 'flex';
    
    // Reset progress bar
    const progressBarFill = document.getElementById('progress-bar-fill');
    progressBarFill.style.width = '0%';
    
    // Update progress text
    const progressText = document.getElementById('progress-text');
    progressText.textContent = 'Ionization in progress...';
    
    // Get narration text
    const narrationText = CHILD_FRIENDLY_DESCRIPTIONS[currentElement]?.animation || 
                         `Watch how ${element.name} changes to become an ion!`;
    
    // Show narration
    showNarration(narrationText, 5000);
    updateExplanationBox(narrationText);
    
    // Determine if electron gain or loss
    const isElectronGain = elementRequiresElectronGain(currentElement);
    
    if (isElectronGain) {
        // Animate electron gain
        animateGainingElectrons(currentElement);
    } else {
        // Animate electron loss
        animateLosingElectrons(currentElement);
    }
}

// Animate electron gain
function animateGainingElectrons(elementSymbol) {
    const element = elements[elementSymbol];
    const neutralState = element.neutralState;
    const ionState = element.ionState;
    
    // Calculate electrons to add
    let electronsToAdd = 0;
    for (let i = 0; i < ionState.electronsPerShell.length; i++) {
        const neutralShell = neutralState.electronsPerShell[i] || 0;
        const ionShell = ionState.electronsPerShell[i] || 0;
        electronsToAdd += Math.max(0, ionShell - neutralShell);
    }
    
    if (electronsToAdd === 0) {
        // No electrons to add, complete immediately
        completeAnimation(elementSymbol);
        return;
    }
    
    // Target shell is usually the outer shell
    const targetShellIndex = neutralState.electronsPerShell.length - 1;
    const targetRadius = SHELL_RADIUS_BASE + targetShellIndex * SHELL_RADIUS_INCREMENT;
    
    // Color for incoming electrons
    const electronColor = 0x44aaff; // Blue for incoming
    
    // Create and animate incoming electrons one by one
    let completedCount = 0;
    
    function animateNextElectron(index) {
        if (index >= electronsToAdd) {
            // All electrons added, complete animation
            setTimeout(() => {
                completeAnimation(elementSymbol);
            }, 500);
            return;
        }
        
        // Update progress
        const progress = Math.round((index / electronsToAdd) * 100);
        updateProgress(progress);
        
        // Create a new electron
        const electron = createElectron(electronColor, targetShellIndex);
        
        // Position it outside the atom
        electron.position.set(0, 10, 0); // Always start from top
        
        // Add it to the scene
        const currentAtomGroup = getCurrentAtomGroup();
        currentAtomGroup.add(electron);
        
        // Show label
        const { scene, camera, renderer } = getSceneAndCamera();
        const screenPos = getScreenPosition(electron.position, camera, renderer);
        const canvasRect = renderer.domElement.getBoundingClientRect();
        
        showTemporaryLabel("ELECTRON COMING IN!", 
                          screenPos.x + canvasRect.left, 
                          screenPos.y + canvasRect.top,
                          "#44aaff",
                          1500);
        
        // Add highlight effect
        addElectronHighlight(electron, true);
        
        // Calculate final position on the target shell
        const angle = (Math.PI * 2 * index) / electronsToAdd;
        const finalX = targetRadius * Math.sin(angle);
        const finalY = targetRadius * Math.cos(angle);
        const finalZ = 0;
        
        // Animate the electron moving to the atom
        new TWEEN.Tween(electron.position)
            .to({ x: finalX, y: finalY, z: finalZ }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                completedCount++;
                
                // Update progress
                const progress = Math.round((completedCount / electronsToAdd) * 100);
                updateProgress(progress);
                
                // Continue with next electron
                setTimeout(() => {
                    animateNextElectron(index + 1);
                }, 300);
            })
            .start();
    }
    
    // Start the animation sequence
    animateNextElectron(0);
}

// Animate electron loss
function animateLosingElectrons(elementSymbol) {
    const element = elements[elementSymbol];
    const electrons = getElectrons();
    const neutralState = element.neutralState;
    const ionState = element.ionState;
    
    // Calculate electrons to remove
    let electronsToRemove = 0;
    for (let i = 0; i < neutralState.electronsPerShell.length; i++) {
        const neutralShell = neutralState.electronsPerShell[i] || 0;
        const ionShell = ionState.electronsPerShell[i] || 0;
        electronsToRemove += Math.max(0, neutralShell - ionShell);
    }
    
    if (electronsToRemove === 0 || electrons.length === 0) {
        // No electrons to remove, complete immediately
        completeAnimation(elementSymbol);
        return;
    }
    
    // Find electrons in outer shell
    const outerShellIndex = neutralState.electronsPerShell.length - 1;
    const outerShellElectrons = electrons.filter(e => e.shellIndex === outerShellIndex);
    
    if (outerShellElectrons.length === 0) {
        // No outer shell electrons, complete immediately
        completeAnimation(elementSymbol);
        return;
    }
    
    // Take electrons to animate
    const electronsToAnimate = outerShellElectrons.slice(0, electronsToRemove);
    let completedCount = 0;
    
    // Animate electrons one by one
    function animateNextElectron(index) {
        if (index >= electronsToAnimate.length) {
            // All electrons removed, complete animation
            setTimeout(() => {
                completeAnimation(elementSymbol);
            }, 500);
            return;
        }
        
        // Update progress
        const progress = Math.round((index / electronsToAnimate.length) * 100);
        updateProgress(progress);
        
        const electron = electronsToAnimate[index];
        if (!electron || !electron.mesh) {
            // Skip if electron not available
            animateNextElectron(index + 1);
            return;
        }
        
        // Mark as animating
        electron.isAnimating = true;
        
        // Highlight the electron
        addElectronHighlight(electron.mesh, false);
        
        // Show label
        const { camera, renderer } = getSceneAndCamera();
        const screenPos = getScreenPosition(electron.mesh.position, camera, renderer);
        const canvasRect = renderer.domElement.getBoundingClientRect();
        
        showTemporaryLabel("ELECTRON LEAVING!", 
                          screenPos.x + canvasRect.left, 
                          screenPos.y + canvasRect.top,
                          "#ff4444",
                          1500);
        
        // Calculate exit direction - always upward for visibility
        const targetY = 15; // Move upward
        const targetX = electron.mesh.position.x;
        const targetZ = electron.mesh.position.z;
        
        // Animate the electron moving away
        new TWEEN.Tween(electron.mesh.position)
            .to({ x: targetX, y: targetY, z: targetZ }, 1500)
            .easing(TWEEN.Easing.Quadratic.Out)
            .onComplete(() => {
                // Remove electron from scene
                const currentAtomGroup = getCurrentAtomGroup();
                currentAtomGroup.remove(electron.mesh);
                
                // Clean up resources
                if (electron.mesh.geometry) electron.mesh.geometry.dispose();
                if (electron.mesh.material) electron.mesh.material.dispose();
                
                // Remove from electrons array
                const idx = electrons.indexOf(electron);
                if (idx > -1) {
                    electrons.splice(idx, 1);
                }
                
                completedCount++;
                
                // Update progress
                const progress = Math.round((completedCount / electronsToAnimate.length) * 100);
                updateProgress(progress);
                
                // Continue with next electron
                setTimeout(() => {
                    animateNextElectron(index + 1);
                }, 300);
            })
            .start();
    }
    
    // Start the animation sequence
    animateNextElectron(0);
}

// Complete the animation and update to ion state
function completeAnimation(elementSymbol) {
    // Update progress to 100%
    updateProgress(100);
    
    // Update visualization to show ion state
    updateVisualization(elementSymbol, 'ion');
    
    // Get completion text
    const element = elements[elementSymbol];
    const completionText = CHILD_FRIENDLY_DESCRIPTIONS[elementSymbol]?.ion || 
                          `${element.name} is now a ${element.ionState.charge} ion!`;
    
    // Show completion narration
    showNarration(completionText, 5000);
    updateExplanationBox(completionText);
    
    // Hide progress after a moment
    setTimeout(() => {
        const progressIndicator = document.getElementById('progress-indicator');
        progressIndicator.style.display = 'none';
        
        // Reset button
        const animateButton = document.getElementById('animate-button');
        animateButton.disabled = false;
        animateButton.innerHTML = '<i class="fas fa-play-circle"></i> Show Ionization';
        animateButton.className = 'primary-button';
        
        // Reset animation state
        animationInProgress = false;
    }, 1000);
}

// Update progress bar
function updateProgress(percent) {
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    
    // Update progress bar width
    progressBarFill.style.width = `${percent}%`;
    
    // Update text
    if (percent < 100) {
        progressText.textContent = `Ionization in progress... ${percent}%`;
    } else {
        progressText.textContent = 'Ionization complete!';
    }
}

// Create a new electron mesh
function createElectron(color, shellIndex) {
    const geometry = new THREE.SphereGeometry(ELECTRON_RADIUS * 2, 16, 16);
    const material = new THREE.MeshPhongMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.5
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.userData.isElectron = true;
    mesh.userData.shellIndex = shellIndex;
    
    return mesh;
}

// Add highlight effect around an electron
function addElectronHighlight(electronMesh, isGaining) {
    // Create highlight effect in DOM
    const container = document.getElementById('visualization-container');
    const { camera, renderer } = getSceneAndCamera();
    
    // Update highlight position every frame for a while
    const updateInterval = setInterval(() => {
        if (!electronMesh || !electronMesh.parent) {
            clearInterval(updateInterval);
            return;
        }
        
        const screenPos = getScreenPosition(electronMesh.position, camera, renderer);
        const canvasRect = renderer.domElement.getBoundingClientRect();
        
        // Create highlight if needed
        if (!electronMesh.userData.highlight) {
            const highlight = document.createElement('div');
            highlight.className = `electron-highlight ${isGaining ? 'gaining' : ''}`;
            highlight.style.width = '20px';
            highlight.style.height = '20px';
            highlight.style.position = 'absolute';
            
            container.appendChild(highlight);
            electronMesh.userData.highlight = highlight;
        }
        
        // Update position
        const highlight = electronMesh.userData.highlight;
        highlight.style.left = (screenPos.x + canvasRect.left - 10) + 'px';
        highlight.style.top = (screenPos.y + canvasRect.top - 10) + 'px';
    }, 16);
    
    // Remove highlight after animation
    setTimeout(() => {
        clearInterval(updateInterval);
        if (electronMesh.userData.highlight) {
            const highlight = electronMesh.userData.highlight;
            if (highlight.parentNode) {
                highlight.parentNode.removeChild(highlight);
            }
            electronMesh.userData.highlight = null;
        }
    }, 2000);
}

// Helper function to get screen position from 3D position
function getScreenPosition(position, camera, renderer) {
    const vector = new THREE.Vector3(
        position.x || 0, 
        position.y || 0, 
        position.z || 0
    );
    vector.project(camera);
    
    const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
    const y = (vector.y * -0.5 + 0.5) * renderer.domElement.clientHeight;
    
    return { x, y };
}
