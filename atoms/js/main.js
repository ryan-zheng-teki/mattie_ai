import * as THREE from 'three';
import TWEEN from 'tween';
import { initVisualization, animate, updateVisualization } from './visualization.js';
import { initUI } from './ui.js';

// Main initialization function
function init() {
    console.log("Initializing atoms visualization application...");
    
    // Initialize the visualization components
    initVisualization();
    
    // Initialize UI components
    initUI();
    
    // Initial display - Hydrogen
    const initialSelection = 'H';
    document.getElementById('element-select').value = initialSelection;
    updateVisualization(initialSelection);
    
    // Start animation loop
    animate();
    
    console.log("Initialization complete.");
}

// Start application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 50);
});
