/**
 * Semicircle Perpendicular Equality Visualization
 *
 * This visualization demonstrates a proof that CD = GF in a semicircle with
 * perpendicular constructions, as given in the problem statement.
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
  1: ['semicircle', 'diameterLine', 'pointA', 'pointB', 'pointO', 'textA', 'textB', 'textO'],
  2: ['pointC', 'pointE', 'textC', 'textE'],
  3: ['lineCD', 'lineEF', 'pointD', 'pointF', 'textD', 'textF', 'perpSymbolD', 'perpSymbolF'],
  4: ['lineCO', 'lineEG', 'pointG', 'textG', 'perpSymbolG'],
  5: ['triangleCOD', 'triangleEGF', 'proofText1', 'proofText2', 'lengthText']
  // Note: Temporary animation elements are not listed here as they destroy themselves.
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
  shadowLayer = new Konva.Layer();
  gridLayer = new Konva.Layer();

  // Add layers to stage in order
  stage.add(backgroundLayer);
  stage.add(gridLayer);
  stage.add(shadowLayer);
  stage.add(layer);

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
    listening: false
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

  // Calculate circle radius based on stage dimensions
  config.circleRadius = Math.min(stageWidth, stageHeight) * 0.35;

  // Calculate origin to center the semicircle
  config.origin = {
    x: stageWidth / 2,
    y: stageHeight / 2
  };

  // Recalculate initial points based on possibly new size/origin
  calculateInitialPoints();
}

// Calculate initial points based on config
function calculateInitialPoints() {
  const center = config.origin;
  const radius = config.circleRadius;
  
  // Diameter points A and B
  config.pointA = { x: center.x - radius, y: center.y };
  config.pointB = { x: center.x + radius, y: center.y };
  
  // Points C and E on the semicircle
  config.pointC = {
    x: center.x + radius * Math.cos(config.angleC),
    y: center.y + radius * Math.sin(config.angleC)
  };
  
  config.pointE = {
    x: center.x + radius * Math.cos(config.angleE),
    y: center.y + radius * Math.sin(config.angleE)
  };
  
  // Calculate perpendicular points (will be calculated in the steps)
  // These will be updated during the visualization steps
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
      clearCanvas();
      updateStepUI(0);
      console.log("Clear action triggered");
    } else if (stepAttr) {
      const stepNum = parseInt(stepAttr, 10);
      if (!isNaN(stepNum)) {
        console.log(`Navigating to Step: ${stepNum}`);
        toggleInteractivity(false);
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
      e.preventDefault();
      stopAutoMode();
      const stepNum = parseInt(e.key);
      console.log(`Navigating to Step: ${stepNum} (Keyboard)`);
      toggleInteractivity(false);
      navigateToStep(stepNum);
      updateStepUI(stepNum);
    }

    // 'C' key to clear
    if (e.key === 'c' || e.key === 'C') {
      e.preventDefault();
      stopAutoMode();
      console.log("Clear action triggered (Keyboard)");
      clearCanvas();
      updateStepUI(0);
    }
  });

  // Debounced resize handler
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      console.log("Resizing Stage...");
      stopAutoMode();

      const stageContainer = document.getElementById('konva-stage-container');
      const newWidth = stageContainer.clientWidth;
      const newHeight = stageContainer.clientHeight;

      // Update stage dimensions
      stage.width(newWidth);
      stage.height(newHeight);

      // Update background gradient and grid lines
      backgroundLayer.findOne('Rect').width(newWidth).height(newHeight);
      
      gridLayer.destroyChildren();
      const gridSpacing = config.styles.gridSpacing;
      for (let x = gridSpacing; x < newWidth; x += gridSpacing) {
        gridLayer.add(new Konva.Line({ 
          points: [x, 0, x, newHeight], 
          stroke: config.colors.gridLines, 
          strokeWidth: 1, 
          listening: false 
        }));
      }
      for (let y = gridSpacing; y < newHeight; y += gridSpacing) {
        gridLayer.add(new Konva.Line({ 
          points: [0, y, newWidth, y], 
          stroke: config.colors.gridLines, 
          strokeWidth: 1, 
          listening: false 
        }));
      }

      // Recalculate circle size and origin
      config.circleRadius = Math.min(newWidth, newHeight) * 0.35;
      config.origin = {
        x: newWidth / 2,
        y: newHeight / 2
      };
      calculateInitialPoints();

      // Re-render the current step
      const stepToRestore = currentActiveStep;
      clearCanvas();
      navigateToStep(stepToRestore);

      // Redraw layers
      backgroundLayer.batchDraw();
      gridLayer.batchDraw();
      shadowLayer.batchDraw();
      layer.batchDraw();
    }, 250);
  });
}

// --- Auto Mode Functions ---

function startAutoMode() {
  if (isAutoModeActive) return;

  console.log("Starting Auto Mode...");
  
  // Update UI
  const autoModeButton = document.getElementById('auto-mode-button');
  if (autoModeButton) {
    autoModeButton.textContent = "停止自动演示";
    autoModeButton.classList.add('stop');
  }

  clearCanvasForAutoMode();
  
  isAutoModeActive = true;
  isDraggable = false;
  
  currentAutoStep = 1;
  
  console.log("Auto Mode: Starting execution from step 1");
  executeAutoStep();
}

function clearCanvasForAutoMode() {
  console.log("Clearing canvas for auto mode");
  
  gsap.killTweensOf(layer.getChildren());
  gsap.killTweensOf(shadowLayer.getChildren());
  
  layer.destroyChildren();
  shadowLayer.destroyChildren();
  
  elements = {};
  currentActiveStep = 0;
  
  layer.batchDraw();
  shadowLayer.batchDraw();
}

function stopAutoMode() {
  if (!isAutoModeActive) return;

  console.log("Stopping Auto Mode.");
  isAutoModeActive = false;
  
  if (autoModeTimeoutId) {
    clearTimeout(autoModeTimeoutId);
    autoModeTimeoutId = null;
  }
  currentAutoStep = 0;

  const autoModeButton = document.getElementById('auto-mode-button');
  if (autoModeButton) {
    autoModeButton.textContent = "开始自动演示";
    autoModeButton.classList.remove('stop');
  }
}

function executeAutoStep() {
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
  
  navigateToStep(currentAutoStep);
  updateStepUI(currentAutoStep);
  
  if (autoModeTimeoutId) {
    clearTimeout(autoModeTimeoutId);
  }
  
  autoModeTimeoutId = setTimeout(() => {
    if (isAutoModeActive) {
      console.log(`Auto Mode: Advancing to Step ${currentAutoStep + 1}`);
      currentAutoStep++;
      executeAutoStep();
    }
  }, config.autoModeStepDelay || 2500);
}

// Function to navigate visualization to a specific step
function navigateToStep(targetStep) {
  if (targetStep === currentActiveStep && targetStep !== 0) {
    console.log(`Already at Step ${targetStep}`);
    return;
  }

  gsap.killTweensOf(layer.getChildren());
  gsap.killTweensOf(shadowLayer.getChildren());

  // Handle backward navigation
  if (targetStep < currentActiveStep) {
    console.log(`Moving backward from ${currentActiveStep} to ${targetStep}`);
    for (let i = currentActiveStep; i > targetStep; i--) {
      clearElementsForStep(i);
    }
  }
  // Handle forward navigation
  else if (targetStep > currentActiveStep) {
    console.log(`Moving forward from ${currentActiveStep} to ${targetStep}`);
    const animateFinalStep = isAutoModeActive || true;

    for (let i = currentActiveStep + 1; i <= targetStep; i++) {
      const animate = (i === targetStep) && animateFinalStep;
      console.log(`Drawing Step ${i} (Animate: ${animate})`);
      
      const drawFunctionName = `drawStep${i}`;
      if (typeof window[drawFunctionName] === 'function') {
        window[drawFunctionName](animate);
      } else {
        console.error(`Error: Function ${drawFunctionName} not found.`);
      }
    }
  } else if (targetStep === 0 && currentActiveStep > 0) {
    console.log(`Clearing from Step ${currentActiveStep}`);
    for (let i = currentActiveStep; i > 0; i--) {
      clearElementsForStep(i);
    }
  }

  currentActiveStep = targetStep;

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
      if (Array.isArray(elements[key])) {
        elements[key].forEach(el => { 
          if(el && typeof el.destroy === 'function') {
            console.log(`Destroying array element ${key}`);
            el.destroy(); 
          }
        });
      } else if (elements[key] instanceof Konva.Node) {
        console.log(`Destroying Konva node ${key}`);
        elements[key].destroy();
      } else {
        console.warn(`Element ${key} is neither array nor Konva node. Type: ${typeof elements[key]}`);
      }
      delete elements[key];
      clearedCount++;
    } else {
      console.warn(`Element ${key} not found in elements map when clearing step ${stepNum}`);
    }
  });

  if (elements.stepExplanation) {
    elements.stepExplanation.destroy();
    delete elements.stepExplanation;
  }

  console.log(`Cleared ${clearedCount} element groups/elements for step ${stepNum}.`);
  layer.batchDraw();
  shadowLayer.batchDraw();
}

// Update the active state in the step list UI
function updateStepUI(activeStep) {
  const stepsList = document.getElementById('steps-list');
  const stepItems = stepsList.querySelectorAll('li[data-step]');

  stepItems.forEach(item => {
    const stepAttr = item.getAttribute('data-step');
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
  stopAutoMode();

  gsap.killTweensOf(layer.getChildren());
  gsap.killTweensOf(shadowLayer.getChildren());
  layer.destroyChildren();
  shadowLayer.destroyChildren();
  elements = {};
  currentActiveStep = 0;
  
  isDraggable = false;

  const explanation = layer.findOne('.stepExplanation');
  if (explanation) explanation.destroy();

  layer.batchDraw();
  shadowLayer.batchDraw();
}

// Simplified toggle interactivity
function toggleInteractivity(forceState) {
  stopAutoMode();

  isDraggable = forceState !== undefined ? forceState : !isDraggable;
  
  if (isDraggable) {
    makePointsDraggable();
  } else {
    // Disable dragging
    if (elements.pointC) elements.pointC.draggable(false);
    if (elements.pointE) elements.pointE.draggable(false);
    
    // Remove drag help indicator
    if (elements.dragHelp) {
      elements.dragHelp.destroy();
      delete elements.dragHelp;
    }
  }

  layer.batchDraw();
}