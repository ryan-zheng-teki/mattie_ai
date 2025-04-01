/**
 * Square Perpendicular Similarity Visualization
 *
 * This visualization demonstrates geometric relationships in a square with
 * perpendicular constructions, proving similarity of triangles and exploring
 * additional properties.
 */

// --- Global Variables ---
let stage, layer, backgroundLayer, shadowLayer, gridLayer;
let elements = {}; // Store Konva objects: { key: KonvaNode }
let currentActiveStep = 0; // Track the highest step currently displayed
let isDraggable = false; // Flag to control draggability of points
let isAutoModeActive = false; // Flag for auto mode state
let autoModeTimeoutId = null; // Timeout ID for auto mode step progression
let currentAutoStep = 0; // Current step index in auto mode

// Mapping of step numbers to the element keys they introduce
const stepElementKeys = {
  1: ['squareEdges', 'pointA', 'pointB', 'pointC', 'pointD', 'textA', 'textB', 'textC', 'textD', 'pointE', 'textE'],
  2: ['lineAE', 'pointG', 'textG', 'lineBG', 'perpSymbolG'],
  3: ['extendedLineBG', 'pointH', 'textH', 'perpSymbolH', 'lineCF', 'pointF', 'textF'],
  4: ['triangleABG', 'triangleBCH', 'similarityAnnotation'],
  5: ['lineAH', 'lineEH', 'extendedLineEH', 'pointI', 'textI', 'proofText1', 'proofText2']
  // Note: Temporary animation elements (like construction lines) are not listed here as they destroy themselves.
  // Note: 'stepExplanation' is managed separately.
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initKonva();
  initEventListeners();

  // Draw the initial state
  gridLayer.draw();
  backgroundLayer.draw();
  layer.draw();
  shadowLayer.draw();

  // Automatically display step 1 on load after a short delay
  setTimeout(() => {
    // Only navigate if auto mode hasn't already started (unlikely here, but good practice)
    if (!isAutoModeActive) {
      navigateToStep(1);
      updateStepUI(1);
    }
  }, 500);
});

// Initialize Konva stage and layers
function initKonva() {
  const stageContainer = document.getElementById('konva-stage-container');
  const stageWidth = stageContainer.clientWidth;
  const stageHeight = stageContainer.clientHeight;

  stage = new Konva.Stage({
    container: 'konva-stage-container',
    width: stageWidth,
    height: stageHeight,
  });

  // Create layers
  layer = new Konva.Layer();
  backgroundLayer = new Konva.Layer();
  shadowLayer = new Konva.Layer(); // Consider if this is still needed, maybe merge into 'layer'
  gridLayer = new Konva.Layer();

  // Add layers to stage in order
  stage.add(backgroundLayer);
  stage.add(gridLayer); // Grid below main layer
  stage.add(shadowLayer); // Shadows potentially on top or merged
  stage.add(layer);      // Main content layer

  // Create gradient background
  const backgroundRect = new Konva.Rect({
    x: 0,
    y: 0,
    width: stageWidth,
    height: stageHeight,
    fillLinearGradient: {
      start: { x: 0, y: 0 },
      end: { x: stageWidth, y: stageHeight },
      colorStops: [0, config.colors.background[0], 1, config.colors.background[1]]
    },
    listening: false // Background should not capture events
  });
  backgroundLayer.add(backgroundRect);

  // Create subtle grid pattern
  const gridSpacing = config.styles.gridSpacing;

  // Draw vertical grid lines
  for (let x = gridSpacing; x < stageWidth; x += gridSpacing) {
    const line = new Konva.Line({
      points: [x, 0, x, stageHeight],
      stroke: config.colors.gridLines,
      strokeWidth: 1,
      listening: false
    });
    gridLayer.add(line);
  }

  // Draw horizontal grid lines
  for (let y = gridSpacing; y < stageHeight; y += gridSpacing) {
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: config.colors.gridLines,
      strokeWidth: 1,
      listening: false
    });
    gridLayer.add(line);
  }

  // Calculate square size based on stage dimensions
  config.squareSize = Math.min(stageWidth, stageHeight) * 0.6;

  // Calculate origin to center the square with some margin
  config.origin = {
    x: (stageWidth - config.squareSize) / 2,
    y: (stageHeight + config.squareSize) / 2 // Bottom aligned
  };

  // Recalculate initial points based on possibly new size/origin
  calculateInitialPoints();
}

// Calculate initial points based on config.squareSize and config.origin
function calculateInitialPoints() {
    config.pointA = { x: config.origin.x, y: config.origin.y - config.squareSize };
    config.pointB = { x: config.origin.x + config.squareSize, y: config.origin.y - config.squareSize };
    config.pointC = { x: config.origin.x + config.squareSize, y: config.origin.y };
    config.pointD = { x: config.origin.x, y: config.origin.y };
    config.pointE = midpoint(config.pointB, config.pointC); // Use geometry helper
}

// Set up event listeners
function initEventListeners() {
  const stepsList = document.getElementById('steps-list');
  const autoModeButton = document.getElementById('auto-mode-button');

  stepsList.addEventListener('click', (event) => {
    const targetLi = event.target.closest('li');
    if (!targetLi) return;

    const stepAttr = targetLi.getAttribute('data-step');

    // Any manual interaction should stop auto mode
    stopAutoMode();

    if (stepAttr === 'clear') {
      clearCanvas(); // clearCanvas now also calls stopAutoMode
      updateStepUI(0); // Deactivate all steps in UI
      console.log("Clear action triggered");
    } else if (stepAttr) {
      const stepNum = parseInt(stepAttr, 10);
      if (!isNaN(stepNum)) {
        console.log(`Navigating to Step: ${stepNum}`);
        toggleInteractivity(false); // Ensure interactivity is off for specific steps
        navigateToStep(stepNum);
        updateStepUI(stepNum);
      }
    }
  });

  // Auto Mode Button Listener
  if (autoModeButton) {
    autoModeButton.addEventListener('click', () => {
      if (isAutoModeActive) {
        stopAutoMode();
      } else {
        startAutoMode();
      }
    });
  } else {
    console.error("Auto mode button not found!");
  }

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Numbers 1-5 trigger steps
    if (e.key >= '1' && e.key <= '5') {
       e.preventDefault(); // Prevent default browser actions for numbers
       stopAutoMode(); // Stop auto mode on manual interaction
       const stepNum = parseInt(e.key);
       console.log(`Navigating to Step: ${stepNum} (Keyboard)`);
       toggleInteractivity(false); // Disable interactivity when changing steps
       navigateToStep(stepNum);
       updateStepUI(stepNum);
    }

    // 'C' key to clear
    if (e.key === 'c' || e.key === 'C') {
       e.preventDefault();
       stopAutoMode(); // Stop auto mode
       console.log("Clear action triggered (Keyboard)");
       clearCanvas();
       updateStepUI(0); // Deactivate all steps in UI
    }
  });

  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
          console.log("Resizing Stage...");
          stopAutoMode(); // Stop auto mode on resize

          const stageContainer = document.getElementById('konva-stage-container');
          const newWidth = stageContainer.clientWidth;
          const newHeight = stageContainer.clientHeight;

          // Update stage dimensions
          stage.width(newWidth);
          stage.height(newHeight);

          // Update background gradient and grid lines (assuming they span the stage)
          backgroundLayer.findOne('Rect').width(newWidth).height(newHeight);
          // Regenerate grid might be complex, simplest is redraw all
          gridLayer.destroyChildren();
          const gridSpacing = config.styles.gridSpacing;
          for (let x = gridSpacing; x < newWidth; x += gridSpacing) {
              gridLayer.add(new Konva.Line({ points: [x, 0, x, newHeight], stroke: config.colors.gridLines, strokeWidth: 1, listening: false }));
          }
          for (let y = gridSpacing; y < newHeight; y += gridSpacing) {
              gridLayer.add(new Konva.Line({ points: [0, y, newWidth, y], stroke: config.colors.gridLines, strokeWidth: 1, listening: false }));
          }

          // Recalculate square size and origin based on new dimensions
          config.squareSize = Math.min(newWidth, newHeight) * 0.6;
          config.origin = {
              x: (newWidth - config.squareSize) / 2,
              y: (newHeight + config.squareSize) / 2
          };
          calculateInitialPoints(); // Recalculate A, B, C, D, E

          // Re-render the current step cleanly after resize
          const stepToRestore = currentActiveStep;
          clearCanvas(); // Clear old elements (also stops auto mode)
          navigateToStep(stepToRestore); // Redraw to the current step with new dimensions

          // Redraw layers
          backgroundLayer.batchDraw();
          gridLayer.batchDraw();
          shadowLayer.batchDraw();
          layer.batchDraw();
      }, 250); // Debounce resize event
  });
}

// --- Auto Mode Functions ---

function startAutoMode() {
  if (isAutoModeActive) return; // Already running

  console.log("Starting Auto Mode...");
  
  // Update UI first
  const autoModeButton = document.getElementById('auto-mode-button');
  if (autoModeButton) {
    autoModeButton.textContent = "Stop Auto Demo";
    autoModeButton.classList.add('stop');
  }

  // IMPORTANT: Clear canvas without stopping auto mode
  clearCanvasForAutoMode();
  
  // AFTER clearing, enable auto mode
  isAutoModeActive = true;
  isDraggable = false;
  
  // Start from step 1
  currentAutoStep = 1;
  
  // Begin execution sequence immediately
  console.log("Auto Mode: Starting execution from step 1");
  executeAutoStep();
}

// New function: Clear canvas without stopping auto mode
function clearCanvasForAutoMode() {
  console.log("Clearing canvas for auto mode");
  
  // Stop any running animations
  gsap.killTweensOf(layer.getChildren());
  gsap.killTweensOf(shadowLayer.getChildren());
  
  // Remove all shapes from layers
  layer.destroyChildren();
  shadowLayer.destroyChildren();
  
  // Clear references and reset counters
  elements = {};
  currentActiveStep = 0;
  
  // Redraw
  layer.batchDraw();
  shadowLayer.batchDraw();
}

function stopAutoMode() {
  if (!isAutoModeActive) return; // Not running

  console.log("Stopping Auto Mode.");
  isAutoModeActive = false;
  
  // Clear any pending timeouts
  if (autoModeTimeoutId) {
    clearTimeout(autoModeTimeoutId);
    autoModeTimeoutId = null;
  }
  currentAutoStep = 0; // Reset step counter

  // Update button state
  const autoModeButton = document.getElementById('auto-mode-button');
  if (autoModeButton) {
    autoModeButton.textContent = "Start Auto Demo";
    autoModeButton.classList.remove('stop');
  }
}

function executeAutoStep() {
  // Double-check active state
  if (!isAutoModeActive) {
    console.warn("Auto mode was deactivated during execution");
    return;
  }

  const totalSteps = 5;
  if (currentAutoStep > totalSteps) {
    console.log("Auto Mode finished.");
    stopAutoMode();
    return;
  }

  console.log(`Auto Mode: Executing Step ${currentAutoStep}`);
  
  // Draw the current step
  navigateToStep(currentAutoStep);
  updateStepUI(currentAutoStep);
  
  // Clear any existing timeouts
  if (autoModeTimeoutId) {
    clearTimeout(autoModeTimeoutId);
  }
  
  // Schedule the next step with a safety check
  autoModeTimeoutId = setTimeout(() => {
    if (isAutoModeActive) { // Check again in case mode was stopped during timeout
      console.log(`Auto Mode: Advancing to Step ${currentAutoStep + 1}`);
      currentAutoStep++;
      executeAutoStep();
    }
  }, config.autoModeStepDelay || 2500); // Provide fallback delay value
}

// Function to navigate visualization to a specific step
function navigateToStep(targetStep) {
  // Don't navigate if target is invalid or already there
  if (targetStep === currentActiveStep && targetStep !== 0) {
     console.log(`Already at Step ${targetStep}`);
     return;
  }

  // Stop any ongoing animations
  gsap.killTweensOf(layer.getChildren());
  gsap.killTweensOf(shadowLayer.getChildren());

  // Handle backward navigation: Clear steps from current down to target + 1
  if (targetStep < currentActiveStep) {
    console.log(`Moving backward from ${currentActiveStep} to ${targetStep}`);
    for (let i = currentActiveStep; i > targetStep; i--) {
      clearElementsForStep(i);
    }
  }
  // Handle forward navigation: Draw steps from current + 1 up to target
  else if (targetStep > currentActiveStep) {
    console.log(`Moving forward from ${currentActiveStep} to ${targetStep}`);
    // Always animate when in auto mode
    const animateFinalStep = isAutoModeActive || true;

    for (let i = currentActiveStep + 1; i <= targetStep; i++) {
      const animate = (i === targetStep) && animateFinalStep;
      console.log(`Drawing Step ${i} (Animate: ${animate})`);
      
      // Dynamically call the correct drawStep function
      const drawFunctionName = `drawStep${i}`;
      if (typeof window[drawFunctionName] === 'function') {
         window[drawFunctionName](animate);
      } else {
         console.error(`Error: Function ${drawFunctionName} not found.`);
      }
    }
  } else if (targetStep === 0 && currentActiveStep > 0) {
      // Handle clearing (targetStep 0 from a non-zero state)
      console.log(`Clearing from Step ${currentActiveStep}`);
      for (let i = currentActiveStep; i > 0; i--) {
          clearElementsForStep(i);
      }
  }

  // Special check for step 5: Verify no overlapping annotations remain
  if (targetStep === 5) {
    // Find all text nodes at the top of the stage that might be overlapping
    const topTexts = layer.find('Text').filter(text => 
      text.y() < 100 && text.text().includes('△')
    );
    
    console.log(`Found ${topTexts.length} potential annotation texts at the top of the stage`);
    
    // If more than one similarity annotation is found, keep only the newest one
    if (topTexts.length > 1) {
      console.warn(`Found multiple annotation texts that may be overlapping. Cleaning up...`);
      // Keep only the elements we know should be here for step 5
      topTexts.forEach(text => {
        const isProofText = text === elements.proofText1 || text === elements.proofText2;
        if (!isProofText && text.text().includes('△')) {
          console.log(`Destroying overlapping text: ${text.text()}`);
          text.destroy();
        }
      });
      layer.batchDraw();
    }
  }

  // Update the current step tracker
  currentActiveStep = targetStep;

  // Ensure final state is drawn
  layer.batchDraw();
  shadowLayer.batchDraw();
}

// Clear elements associated with a specific step number
function clearElementsForStep(stepNum) {
  if (!stepElementKeys[stepNum]) {
    console.warn(`No element keys defined for step ${stepNum}`);
    return;
  }

  console.log(`Clearing elements for Step ${stepNum}`);
  const keysToClear = stepElementKeys[stepNum];
  let clearedCount = 0;

  keysToClear.forEach(key => {
    if (elements[key]) {
      // Handle cases where element might be an array (like squareEdges)
      if (Array.isArray(elements[key])) {
         elements[key].forEach(el => { 
           if(el && typeof el.destroy === 'function') {
             console.log(`Destroying array element ${key}`);
             el.destroy(); 
           }
         });
      } else if (elements[key] instanceof Konva.Node) {
         console.log(`Destroying Konva node ${key}`);
         elements[key].destroy(); // Destroy Konva node
      } else {
         console.warn(`Element ${key} is neither array nor Konva node. Type: ${typeof elements[key]}`);
      }
      delete elements[key]; // Remove reference from our tracker
      clearedCount++;
    } else {
      console.warn(`Element ${key} not found in elements map when clearing step ${stepNum}`);
    }
  });

  // Also clear the step explanation text if it exists for this step
  if (elements.stepExplanation) {
      elements.stepExplanation.destroy();
      delete elements.stepExplanation;
  }

  console.log(`Cleared ${clearedCount} element groups/elements for step ${stepNum}.`);
  // Redraw needed after clearing
  layer.batchDraw();
  shadowLayer.batchDraw();
}

// Update the active state in the step list UI
function updateStepUI(activeStep) {
  const stepsList = document.getElementById('steps-list');
  const stepItems = stepsList.querySelectorAll('li[data-step]');

  stepItems.forEach(item => {
    const stepAttr = item.getAttribute('data-step');
    // Use == for string/number comparison flexibility
    if (stepAttr == activeStep) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// Clear canvas function - Resets everything
function clearCanvas() {
  console.log("Clearing canvas completely.");
  stopAutoMode(); // Ensure auto mode is stopped when clearing

  gsap.killTweensOf(layer.getChildren()); // Stop any running animations
  gsap.killTweensOf(shadowLayer.getChildren());
  layer.destroyChildren(); // Remove all shapes from main layer
  shadowLayer.destroyChildren(); // Clear shadow layer
  elements = {}; // Clear references
  currentActiveStep = 0; // Reset step counter
  
  // Reset interactivity state
  isDraggable = false;

  // Clear step explanation explicitly if it wasn't part of 'elements' standard clearing
  const explanation = layer.findOne('.stepExplanation');
  if (explanation) explanation.destroy();

  layer.batchDraw();
  shadowLayer.batchDraw();
}

// Simplified toggle interactivity that just disables dragging
function toggleInteractivity(forceState) {
    stopAutoMode(); // Stop auto mode whenever interactivity is toggled

    // Default to false since we're removing interactive mode
    isDraggable = false;
    
    // Remove dragHelp if it exists
    if (elements.dragHelp) {
        elements.dragHelp.destroy();
        elements.dragHelp = null;
    }

    layer.batchDraw();
}
