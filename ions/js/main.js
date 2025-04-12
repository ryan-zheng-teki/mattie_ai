import * as THREE from 'three';
import TWEEN from 'tween';
import { initVisualization, animate, updateVisualization } from './visualization.js';
import { initUI } from './ui.js';
import { initAnimationControls } from './animation.js';

// Main initialization function
function init() {
    console.log("Initializing ion visualization application...");
    
    // Initialize the visualization components
    initVisualization();
    
    // Initialize UI components
    initUI();
    
    // Initialize animation controls
    initAnimationControls();
    
    // Initial display - Sodium in neutral state
    const initialSelection = 'Na';
    document.getElementById('element-select').value = initialSelection;
    updateVisualization(initialSelection, 'neutral');
    
    // Start animation loop
    animate();
    
    console.log("Initialization complete.");
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 50);
});
