/**
 * Square Perpendicular Similarity Visualization
 * 
 * This visualization demonstrates geometric relationships in a square with
 * perpendicular constructions, proving similarity of triangles and exploring
 * additional properties.
 */

// --- Global Variables ---
let stage, layer, backgroundLayer, shadowLayer, gridLayer;
let elements = {}; // Store Konva objects
let currentActiveStep = 0;
let isDraggable = false; // Flag to control draggability of points

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initKonva();
  initEventListeners();
  
  // Draw the initial state
  gridLayer.draw();
  backgroundLayer.draw();
  layer.draw();
  shadowLayer.draw();
  
  // Automatically start with step 1
  setTimeout(() => {
    const stepsList = document.getElementById('steps-list');
    const step1Item = stepsList.querySelector('li[data-step="1"]');
    if (step1Item) {
      step1Item.classList.add('active');
      drawStep1();
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
  
  // Add layers to stage
  stage.add(backgroundLayer);
  stage.add(shadowLayer);
  stage.add(layer);
  stage.add(gridLayer);
  
  // Move layers to proper order
  stage.moveToBottom(gridLayer);
  stage.moveToBottom(backgroundLayer);

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
    }
  });
  backgroundLayer.add(backgroundRect);

  // Create subtle grid pattern
  const gridSpacing = config.styles.gridSpacing;
  
  // Draw vertical grid lines
  for (let x = gridSpacing; x < stageWidth; x += gridSpacing) {
    const line = new Konva.Line({
      points: [x, 0, x, stageHeight],
      stroke: config.colors.gridLines,
      strokeWidth: 1
    });
    gridLayer.add(line);
  }

  // Draw horizontal grid lines
  for (let y = gridSpacing; y < stageHeight; y += gridSpacing) {
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: config.colors.gridLines,
      strokeWidth: 1
    });
    gridLayer.add(line);
  }
  
  // Calculate square size based on stage dimensions
  // Square should be big enough but leave some margin
  config.squareSize = Math.min(stageWidth, stageHeight) * 0.6;
  
  // Calculate origin to center the square with some margin
  config.origin = {
    x: (stageWidth - config.squareSize) / 2,
    y: (stageHeight + config.squareSize) / 2 // Bottom aligned
  };
  
  // Initialize square corners
  config.pointA = { x: config.origin.x, y: config.origin.y - config.squareSize };
  config.pointB = { x: config.origin.x + config.squareSize, y: config.origin.y - config.squareSize };
  config.pointC = { x: config.origin.x + config.squareSize, y: config.origin.y };
  config.pointD = { x: config.origin.x, y: config.origin.y };
  
  // Initialize point E (midpoint of BC)
  config.pointE = {
    x: (config.pointB.x + config.pointC.x) / 2,
    y: (config.pointB.y + config.pointC.y) / 2
  };
}

// Set up event listeners
function initEventListeners() {
  // Listen for step list clicks
  const stepsList = document.getElementById('steps-list');
  const stepItems = stepsList.querySelectorAll('li[data-step]');

  stepsList.addEventListener('click', (event) => {
    const targetLi = event.target.closest('li');
    if (!targetLi) return; // Click wasn't on or inside an li

    const step = targetLi.getAttribute('data-step');

    // Remove active class from all items
    stepItems.forEach(item => item.classList.remove('active'));

    if (step === 'clear') {
      clearCanvas();
      currentActiveStep = 0;
      console.log("Clear action triggered");
    } else if (step === 'interactive') {
      toggleInteractivity();
      targetLi.classList.add('active');
    } else if (step) {
      const stepNum = parseInt(step, 10);
      console.log(`Clicked Step: ${stepNum}`);

      // Add active class to the clicked item
      targetLi.classList.add('active');
      currentActiveStep = stepNum;

      // Execute the corresponding function
      // Important: We need to handle these as synchronous functions for the UI
      // while the implementation may be async internally
      clearCanvas(); // Clear before drawing new step
      
      switch (stepNum) {
        case 1: 
          drawStep1();
          break;
        case 2: 
          // First redraw step 1 content quickly, then add step 2
          drawStep1ToStep2();
          break;
        case 3: 
          // Same approach - build up from previous steps quickly
          drawStep1ToStep3();
          break;
        case 4: 
          drawStep1ToStep4();
          break;
        case 5: 
          drawStep1ToStep5();
          break;
        default: 
          console.warn(`Step ${stepNum} not implemented.`);
      }
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Numbers 1-5 trigger steps
    if (e.key >= '1' && e.key <= '5') {
      const stepNum = parseInt(e.key);
      
      // Clear canvas before drawing
      clearCanvas();
      
      switch (stepNum) {
        case 1: drawStep1(); break;
        case 2: drawStep1ToStep2(); break;
        case 3: drawStep1ToStep3(); break;
        case 4: drawStep1ToStep4(); break;
        case 5: drawStep1ToStep5(); break;
      }
      
      // Update active class in UI
      stepItems.forEach(item => {
        if (item.getAttribute('data-step') === e.key) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
      
      currentActiveStep = stepNum;
    }
    
    // Spacebar to toggle interactivity
    if (e.key === ' ' || e.code === 'Space') {
      toggleInteractivity();
      // Find and activate the interactive step in the UI
      stepItems.forEach(item => {
        if (item.getAttribute('data-step') === 'interactive') {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }
    
    // 'C' key to clear
    if (e.key === 'c' || e.key === 'C') {
      clearCanvas();
      currentActiveStep = 0;
      stepItems.forEach(item => item.classList.remove('active'));
    }
  });

  // Handle window resize
  window.addEventListener('resize', () => {
    const stageContainer = document.getElementById('konva-stage-container');
    const newWidth = stageContainer.clientWidth;
    const newHeight = stageContainer.clientHeight;
    
    // Only resize if significant change occurred
    if (Math.abs(newWidth - stage.width()) > 50 || Math.abs(newHeight - stage.height()) > 50) {
      // Update stage dimensions
      stage.width(newWidth);
      stage.height(newHeight);
      
      // Update background and grid
      backgroundLayer.findOne('Rect').width(newWidth);
      backgroundLayer.findOne('Rect').height(newHeight);
      
      // Redraw everything
      backgroundLayer.draw();
      gridLayer.draw();
      shadowLayer.draw();
      layer.draw();
    }
  });
}

// Helper functions to handle multi-step progression
// These functions ensure we show the complete state up to a given step

function drawStep1ToStep2() {
  // Draw step 1 with minimal animation
  drawStep1(false);
  
  // Then continue with step 2
  setTimeout(() => {
    drawStep2(true);
  }, 300);
}

function drawStep1ToStep3() {
  // Draw steps 1-2 with minimal animation
  drawStep1(false);
  
  setTimeout(() => {
    drawStep2(false);
    
    // Then continue with step 3
    setTimeout(() => {
      drawStep3(true);
    }, 300);
  }, 300);
}

function drawStep1ToStep4() {
  // Draw steps 1-3 with minimal animation
  drawStep1(false);
  
  setTimeout(() => {
    drawStep2(false);
    
    setTimeout(() => {
      drawStep3(false);
      
      // Then continue with step 4
      setTimeout(() => {
        drawStep4(true);
      }, 300);
    }, 300);
  }, 300);
}

function drawStep1ToStep5() {
  // Draw steps 1-4 with minimal animation
  drawStep1(false);
  
  setTimeout(() => {
    drawStep2(false);
    
    setTimeout(() => {
      drawStep3(false);
      
      setTimeout(() => {
        drawStep4(false);
        
        // Then continue with step 5
        setTimeout(() => {
          drawStep5(true);
        }, 300);
      }, 300);
    }, 300);
  }, 300);
}

// Clear canvas function
function clearCanvas() {
  gsap.killTweensOf(layer.getChildren()); // Stop any running animations
  layer.destroyChildren(); // Remove all shapes
  shadowLayer.destroyChildren(); // Clear shadow layer
  elements = {}; // Clear references
  layer.batchDraw();
  shadowLayer.batchDraw();
  isDraggable = false; // Reset draggable state
  console.log("Canvas cleared");
}
