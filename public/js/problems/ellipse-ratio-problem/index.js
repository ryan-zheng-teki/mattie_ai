/**
 * Ellipse Ratio Problem Visualization
 *
 * This visualization demonstrates that for any point P on ellipse C,
 * if ray OP intersects ellipse E at point Q, the ratio |OQ|/|OP| = 2.
 */

// --- Global Variables ---
let stage, layer, backgroundLayer, gridLayer;
let elements = {}; // Store Konva objects: { key: KonvaNode }
let currentActiveStep = 0; // Track the highest step currently displayed
let isDraggable = false; // Flag to control draggability of points
let isAutoModeActive = false; // Flag for auto mode state
let autoModeTimeoutId = null; // Timeout ID for auto mode step progression
let currentAutoStep = 0; // Current step index in auto mode

// Mapping of step numbers to the element keys they introduce
const stepElementKeys = {
  1: ['xAxis', 'yAxis', 'xLabel', 'yLabel', 'pointO', 'textO', 'ellipseC', 'ellipseE', 'labelC', 'labelE'],
  2: ['pointP', 'textP'],
  3: ['rayOP', 'pointQ', 'textQ'],
  4: [], // Ratio calculation doesn't add persistent elements
  5: ['dragHelp'] // Drag mode adds dragHelp text
  // Note: Temporary animation elements are not listed here as they destroy themselves.
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

  // Automatically display step 1 on load after a short delay
  setTimeout(() => {
    // Only navigate if auto mode hasn't already started
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

  // Save dimensions to config
  config.stageWidth = stageWidth;
  config.stageHeight = stageHeight;

  // Create layers
  layer = new Konva.Layer();
  backgroundLayer = new Konva.Layer();
  gridLayer = new Konva.Layer(); // For coordinate grid

  // Add layers to stage in order
  stage.add(backgroundLayer);
  stage.add(gridLayer); // Grid below main layer
  stage.add(layer);    // Main content layer

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

  // Set origin to center of stage
  config.origin = {
    x: stageWidth / 2,
    y: stageHeight / 2
  };

  // Calculate appropriate scale based on stage size
  // We want the larger ellipse (E) to fit comfortably within the stage
  const maxRadius = Math.min(stageWidth, stageHeight) / 2 * 0.8; // 80% of half the smaller dimension
  const largestSemiAxis = Math.max(config.ellipseE.a, config.ellipseE.b);
  config.scale = maxRadius / largestSemiAxis;

  // Create coordinate grid with appropriate spacing
  createCoordinateGrid();
}

// Create a coordinate grid with tick marks
function createCoordinateGrid() {
  const stageWidth = config.stageWidth;
  const stageHeight = config.stageHeight;
  const origin = config.origin;
  const gridSpacing = config.styles.gridSpacing;
  
  // Calculate grid bounds (how many units to show)
  const unitsPerGrid = 0.5; // Each grid line represents 0.5 units
  const gridLinesX = Math.ceil(stageWidth / gridSpacing);
  const gridLinesY = Math.ceil(stageHeight / gridSpacing);
  
  // Draw vertical grid lines
  for (let i = -gridLinesX; i <= gridLinesX; i++) {
    const x = origin.x + i * gridSpacing;
    if (x < 0 || x > stageWidth) continue;
    
    const opacity = i % 2 === 0 ? 0.3 : 0.1; // Stronger lines for integer units
    
    const line = new Konva.Line({
      points: [x, 0, x, stageHeight],
      stroke: config.colors.grid,
      strokeWidth: i % 2 === 0 ? 1 : 0.5,
      opacity: opacity,
      listening: false
    });
    gridLayer.add(line);
    
    // Add coordinate labels for integer values (skip 0)
    if (i % 2 === 0 && i !== 0) {
      const unitValue = (i / 2).toString();
      const label = new Konva.Text({
        x: x - 5,
        y: origin.y + 5,
        text: unitValue,
        fontSize: 10,
        fill: config.colors.labels,
        opacity: 0.6,
        listening: false
      });
      gridLayer.add(label);
    }
  }
  
  // Draw horizontal grid lines
  for (let i = -gridLinesY; i <= gridLinesY; i++) {
    const y = origin.y + i * gridSpacing;
    if (y < 0 || y > stageHeight) continue;
    
    const opacity = i % 2 === 0 ? 0.3 : 0.1; // Stronger lines for integer units
    
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: config.colors.grid,
      strokeWidth: i % 2 === 0 ? 1 : 0.5,
      opacity: opacity,
      listening: false
    });
    gridLayer.add(line);
    
    // Add coordinate labels for integer values (skip 0)
    if (i % 2 === 0 && i !== 0) {
      const unitValue = (-i / 2).toString(); // Negative because y is inverted in canvas
      const label = new Konva.Text({
        x: origin.x + 5,
        y: y - 7,
        text: unitValue,
        fontSize: 10,
        fill: config.colors.labels,
        opacity: 0.6,
        listening: false
      });
      gridLayer.add(label);
    }
  }
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
      clearCanvas(); // clearCanvas also calls stopAutoMode
      updateStepUI(0); // Deactivate all steps in UI
      console.log("Clear action triggered");
      
      // Also hide ratio display
      const ratioDisplay = document.getElementById('ratio-display');
      if (ratioDisplay) {
        ratioDisplay.style.display = 'none';
      }
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
       
       // Also hide ratio display
       const ratioDisplay = document.getElementById('ratio-display');
       if (ratioDisplay) {
         ratioDisplay.style.display = 'none';
       }
    }
    
    // 'D' key to toggle drag mode (in step 5)
    if (e.key === 'd' || e.key === 'D') {
       e.preventDefault();
       if (currentActiveStep >= 5) { // Only in step 5
         console.log("Toggle drag mode triggered (Keyboard)");
         toggleInteractivity(); // Toggle current state
       }
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
          
          // Update config
          config.stageWidth = newWidth;
          config.stageHeight = newHeight;
          
          // Update origin to center of stage
          config.origin = {
            x: newWidth / 2,
            y: newHeight / 2
          };
          
          // Recalculate scale
          const maxRadius = Math.min(newWidth, newHeight) / 2 * 0.8;
          const largestSemiAxis = Math.max(config.ellipseE.a, config.ellipseE.b);
          config.scale = maxRadius / largestSemiAxis;

          // Update background
          backgroundLayer.destroyChildren();
          const backgroundRect = new Konva.Rect({
            x: 0,
            y: 0,
            width: newWidth,
            height: newHeight,
            fillLinearGradient: {
              start: { x: 0, y: 0 },
              end: { x: newWidth, y: newHeight },
              colorStops: [0, config.colors.background[0], 1, config.colors.background[1]]
            },
            listening: false
          });
          backgroundLayer.add(backgroundRect);
          
          // Regenerate grid
          gridLayer.destroyChildren();
          createCoordinateGrid();

          // Re-render the current step cleanly after resize
          const stepToRestore = currentActiveStep;
          clearCanvas(); // Clear old elements
          navigateToStep(stepToRestore); // Redraw to the current step with new dimensions

          // Redraw layers
          backgroundLayer.batchDraw();
          gridLayer.batchDraw();
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
  
  // Also hide ratio display
  const ratioDisplay = document.getElementById('ratio-display');
  if (ratioDisplay) {
    ratioDisplay.style.display = 'none';
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
  
  // Remove all shapes from layers
  layer.destroyChildren();
  
  // Clear references and reset counters
  elements = {};
  currentActiveStep = 0;
  
  // Redraw
  layer.batchDraw();
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

  // Handle backward navigation: Clear steps from current down to target + 1
  if (targetStep < currentActiveStep) {
    console.log(`Moving backward from ${currentActiveStep} to ${targetStep}`);
    for (let i = currentActiveStep; i > targetStep; i--) {
      clearElementsForStep(i);
    }
    
    // Hide ratio display when moving backward before step 4
    if (targetStep < 4) {
      const ratioDisplay = document.getElementById('ratio-display');
      if (ratioDisplay) {
        ratioDisplay.style.display = 'none';
      }
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
      
      // Hide ratio display
      const ratioDisplay = document.getElementById('ratio-display');
      if (ratioDisplay) {
        ratioDisplay.style.display = 'none';
      }
  }

  // Update the current step tracker
  currentActiveStep = targetStep;

  // Ensure final state is drawn
  layer.batchDraw();
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
      // Handle cases where element might be an array
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
  layer.destroyChildren(); // Remove all shapes from main layer
  elements = {}; // Clear references
  currentActiveStep = 0; // Reset step counter
  
  // Reset interactivity state
  isDraggable = false;

  // Hide ratio display
  const ratioDisplay = document.getElementById('ratio-display');
  if (ratioDisplay) {
    ratioDisplay.style.display = 'none';
  }

  layer.batchDraw();
}
