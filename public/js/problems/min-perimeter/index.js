/**
 * Minimum Perimeter Triangle Visualization
 * 
 * This visualization demonstrates finding the triangle with minimum perimeter
 * from a point to two rays using reflection principles.
 */

// --- Global Variables ---
let stage, layer, backgroundLayer, shadowLayer, gridLayer;
let elements = {}; // Store Konva objects
let currentActiveStep = 0;
let isPDraggable = false; // Flag to control draggability of point P

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  initKonva();
  initEventListeners();
  
  // Draw the initial state
  gridLayer.draw();
  backgroundLayer.draw();
  layer.draw();
  shadowLayer.draw();
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
      colorStops: [0, '#f9f9ff', 1, '#eef5ff']
    }
  });
  backgroundLayer.add(backgroundRect);

  // Create subtle grid pattern
  const gridSpacing = 20;
  
  // Draw vertical grid lines
  for (let x = gridSpacing; x < stageWidth; x += gridSpacing) {
    const line = new Konva.Line({
      points: [x, 0, x, stageHeight],
      stroke: '#e0e0e0',
      strokeWidth: 1
    });
    gridLayer.add(line);
  }

  // Draw horizontal grid lines
  for (let y = gridSpacing; y < stageHeight; y += gridSpacing) {
    const line = new Konva.Line({
      points: [0, y, stageWidth, y],
      stroke: '#e0e0e0',
      strokeWidth: 1
    });
    gridLayer.add(line);
  }
  
  // Initialize config based on stage dimensions
  config.origin = { x: 100, y: stageHeight - 100 };
  config.rayLength = Math.max(stageWidth, stageHeight) * 1.2;
  config.pointP = { x: stageWidth * 0.55, y: stageHeight * 0.45 };
  
  // Calculate ray endpoints
  config.pointA = {
    x: config.origin.x + config.rayLength * Math.cos(config.angleA),
    y: config.origin.y + config.rayLength * Math.sin(config.angleA)
  };
  config.pointB = {
    x: config.origin.x + config.rayLength * Math.cos(config.angleB),
    y: config.origin.y + config.rayLength * Math.sin(config.angleB)
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
      switch (stepNum) {
        case 1: drawStep1(); break;
        case 2: drawStep2(); break;
        case 3: drawStep3(); break;
        case 4: drawStep4(); break;
        case 5: drawStep5(); break;
        default: console.warn(`Step ${stepNum} not implemented.`);
      }
    }
  });

  // Add keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Numbers 1-5 trigger steps
    if (e.key >= '1' && e.key <= '5') {
      const stepNum = parseInt(e.key);
      switch (stepNum) {
        case 1: drawStep1(); break;
        case 2: drawStep2(); break;
        case 3: drawStep3(); break;
        case 4: drawStep4(); break;
        case 5: drawStep5(); break;
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
    
    // Spacebar to toggle point P draggability
    if (e.key === ' ' || e.code === 'Space') {
      toggleInteractivity();
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

// --- Helper Functions ---

// Function to make Point P draggable and update construction
function makePointPDraggable() {
  if (!elements.pointP || isPDraggable) return;
  
  isPDraggable = true;
  elements.pointP.draggable(true);
  
  // Add visual cue that point is draggable
  elements.pointP.on('mouseover', function() {
    document.body.style.cursor = 'pointer';
    this.strokeEnabled(true);
    this.stroke('#fff');
    this.strokeWidth(2);
    this.scale({ x: 1.2, y: 1.2 });
    layer.batchDraw();
  });
  
  elements.pointP.on('mouseout', function() {
    document.body.style.cursor = 'default';
    this.strokeEnabled(false);
    this.scale({ x: 1, y: 1 });
    layer.batchDraw();
  });
  
  let dragThrottleTimeout = null;
  
  // Update construction on drag
  elements.pointP.on('dragmove', function() {
    // Clear any existing timeout
    if (dragThrottleTimeout) clearTimeout(dragThrottleTimeout);
    
    // Set new timeout to update construction (throttled for performance)
    dragThrottleTimeout = setTimeout(() => {
      config.pointP.x = this.x();
      config.pointP.y = this.y();
      
      // Update P' based on new P position
      if (elements.pointP_prime) {
        const pPrimeCoords = reflectPoint(config.pointP, config.origin, config.pointA);
        elements.pPrimeCoords = pPrimeCoords;
        elements.pointP_prime.x(pPrimeCoords.x);
        elements.pointP_prime.y(pPrimeCoords.y);
        elements.textP_prime.x(pPrimeCoords.x + 10);
        elements.textP_prime.y(pPrimeCoords.y - 20);
        elements.linePP_prime.points([config.pointP.x, config.pointP.y, pPrimeCoords.x, pPrimeCoords.y]);
      }
      
      // Update P'' based on new P position
      if (elements.pointP_double_prime) {
        const pDoublePrimeCoords = reflectPoint(config.pointP, config.origin, config.pointB);
        elements.pDoublePrimeCoords = pDoublePrimeCoords;
        elements.pointP_double_prime.x(pDoublePrimeCoords.x);
        elements.pointP_double_prime.y(pDoublePrimeCoords.y);
        elements.textP_double_prime.x(pDoublePrimeCoords.x + 10);
        elements.textP_double_prime.y(pDoublePrimeCoords.y + 10);
        elements.linePP_double_prime.points([config.pointP.x, config.pointP.y, pDoublePrimeCoords.x, pDoublePrimeCoords.y]);
      }
      
      // Update P'P'' line and intersection points C and D
      if (elements.lineP_prime_P_double_prime && elements.pPrimeCoords && elements.pDoublePrimeCoords) {
        elements.lineP_prime_P_double_prime.points([
          elements.pPrimeCoords.x, elements.pPrimeCoords.y, 
          elements.pDoublePrimeCoords.x, elements.pDoublePrimeCoords.y
        ]);
        
        // Recalculate C and D
        const C_coords = intersectSegmentRay(
          elements.pPrimeCoords, elements.pDoublePrimeCoords, 
          config.origin, config.pointA
        );
        const D_coords = intersectSegmentRay(
          elements.pPrimeCoords, elements.pDoublePrimeCoords, 
          config.origin, config.pointB
        );
        
        if (C_coords && D_coords && elements.pointC && elements.pointD) {
          elements.C_coords = C_coords;
          elements.D_coords = D_coords;
          
          // Update point positions
          elements.pointC.x(C_coords.x);
          elements.pointC.y(C_coords.y);
          elements.textC.x(C_coords.x - 20);
          elements.textC.y(C_coords.y - 15);
          
          elements.pointD.x(D_coords.x);
          elements.pointD.y(D_coords.y);
          elements.textD.x(D_coords.x + 10);
          elements.textD.y(D_coords.y + 10);
          
          // Update helper lines and triangle
          if (elements.helperP_primeC) {
            elements.helperP_primeC.points([
              elements.pPrimeCoords.x, elements.pPrimeCoords.y, 
              C_coords.x, C_coords.y
            ]);
          }
          if (elements.helperP_double_primeD) {
            elements.helperP_double_primeD.points([
              elements.pDoublePrimeCoords.x, elements.pDoublePrimeCoords.y, 
              D_coords.x, D_coords.y
            ]);
          }
          if (elements.helperPC) {
            elements.helperPC.points([config.pointP.x, config.pointP.y, C_coords.x, C_coords.y]);
          }
          if (elements.helperPD) {
            elements.helperPD.points([config.pointP.x, config.pointP.y, D_coords.x, D_coords.y]);
          }
          if (elements.triangleCD) {
            elements.triangleCD.points([C_coords.x, C_coords.y, D_coords.x, D_coords.y]);
          }
          if (elements.trianglePD) {
            elements.trianglePD.points([config.pointP.x, config.pointP.y, D_coords.x, D_coords.y]);
          }
          if (elements.trianglePC) {
            elements.trianglePC.points([config.pointP.x, config.pointP.y, C_coords.x, C_coords.y]);
          }
          if (elements.triangleFill) {
            elements.triangleFill.points([
              config.pointP.x, config.pointP.y, 
              C_coords.x, C_coords.y,
              D_coords.x, D_coords.y,
              config.pointP.x, config.pointP.y
            ]);
          }
        }
      }
      
      // Update the element that displays P position coordinates if it exists
      if (elements.textPCoords) {
        elements.textPCoords.text(`P(${Math.round(config.pointP.x)}, ${Math.round(config.pointP.y)})`);
      }
      
      // Update text position
      elements.textP.x(config.pointP.x + 10);
      elements.textP.y(config.pointP.y - 20);
      
      layer.batchDraw();
    }, 10); // 10ms throttling for smooth performance
  });
}

// Add function to toggle interactivity
function toggleInteractivity() {
  if (!elements.pointP) return;
  
  isPDraggable = !isPDraggable;
  
  if (isPDraggable) {
    makePointPDraggable();
    // Add visual indicator that dragging is enabled
    const dragHelp = new Konva.Text({
      x: 20,
      y: 20,
      text: "Drag point P to explore!",
      fontSize: 14,
      fill: '#777',
      padding: 5,
      background: '#f0f0f0',
      cornerRadius: 3
    });
    layer.add(dragHelp);
    elements.dragHelp = dragHelp;
  } else {
    elements.pointP.draggable(false);
    if (elements.dragHelp) {
      elements.dragHelp.destroy();
    }
  }
  
  layer.batchDraw();
}

// Clear canvas function
function clearCanvas() {
  gsap.killTweensOf(layer.getChildren()); // Stop any running animations
  layer.destroyChildren(); // Remove all shapes
  shadowLayer.destroyChildren(); // Clear shadow layer
  elements = {}; // Clear references
  layer.batchDraw();
  shadowLayer.batchDraw();
  isPDraggable = false; // Reset draggable state
  console.log("Canvas cleared");
}

// --- Step Functions with Enhanced Visuals ---

function drawStep1() {
  console.log("Executing Step 1");
  clearCanvas(); // Start fresh for this step

  // Draw angle area fill with subtle animation
  const angleFill = new Konva.Group();
  const angleAreaFill = new Konva.Arc({
    x: config.origin.x,
    y: config.origin.y,
    innerRadius: 0,
    outerRadius: 0, // Will be animated
    angle: Math.abs(config.angleB - config.angleA) * 180 / Math.PI,
    rotation: config.angleA * 180 / Math.PI,
    fill: 'rgba(200, 230, 255, 0.2)',
    opacity: 0,
  });
  angleFill.add(angleAreaFill);
  layer.add(angleFill);
  
  // Animate angle area appearance
  gsap.to(angleAreaFill, {
    outerRadius: config.rayLength * 0.3,
    opacity: 1,
    duration: config.animDuration * 0.7,
    ease: "power2.out"
  });

  // Create Rays with glow effect
  elements.rayOA = new Konva.Line({
    points: [config.origin.x, config.origin.y, config.pointA.x, config.pointA.y],
    stroke: config.colors.rays,
    strokeWidth: 2,
    visible: false,
    listening: false, // Don't intercept clicks
  });
  elements.rayOB = new Konva.Line({
    points: [config.origin.x, config.origin.y, config.pointB.x, config.pointB.y],
    stroke: config.colors.rays,
    strokeWidth: 2,
    visible: false,
    listening: false,
  });
  layer.add(elements.rayOA, elements.rayOB);

  // Create Point P with shadow effect
  elements.pointP = new Konva.Circle({
    x: config.pointP.x,
    y: config.pointP.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointP,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0,
  });
  layer.add(elements.pointP);

  // Display P coordinates (new feature)
  elements.textPCoords = new Konva.Text({
    x: config.pointP.x + 10,
    y: config.pointP.y + 15,
    text: `P(${Math.round(config.pointP.x)}, ${Math.round(config.pointP.y)})`,
    fontSize: 12,
    fill: '#777',
    visible: false,
    opacity: 0
  });
  layer.add(elements.textPCoords);

  // Create Labels with enhanced styling
  elements.textO = new Konva.Text({
    x: config.origin.x - 20, 
    y: config.origin.y + 5, 
    text: 'O',
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  // Position A/B labels slightly along the ray
  const labelDist = 60;
  elements.textA = new Konva.Text({
    x: config.origin.x + labelDist * Math.cos(config.angleA),
    y: config.origin.y + labelDist * Math.sin(config.angleA) - 15, // Adjust y pos
    text: 'A', 
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  elements.textB = new Konva.Text({
    x: config.origin.x + labelDist * Math.cos(config.angleB) + 5, // Adjust x pos
    y: config.origin.y + labelDist * Math.sin(config.angleB) + 10, // Adjust y pos
    text: 'B', 
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  elements.textP = new Konva.Text({
    x: config.pointP.x + 10, 
    y: config.pointP.y - 20, 
    text: 'P', 
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  layer.add(elements.textO, elements.textA, elements.textB, elements.textP);

  // --- Animations with Enhanced Effects ---
  animateDrawLine(elements.rayOA, config.animDuration, 0, true, config.colors.rays, layer);
  animateDrawLine(elements.rayOB, config.animDuration, 0.1, true, config.colors.rays, layer); // Stagger start slightly
  animateAppear(elements.pointP, config.animDuration, config.animDuration * 0.5, true, layer); // Appear after rays start drawing
  animateAppear(elements.textPCoords, config.animDuration * 0.5, config.animDuration * 0.9, false, layer);
  animateAppear(elements.textO, config.animDuration * 0.5, config.animDuration * 0.2, false, layer);
  animateAppear(elements.textA, config.animDuration * 0.5, config.animDuration * 0.3, false, layer);
  animateAppear(elements.textB, config.animDuration * 0.5, config.animDuration * 0.4, false, layer);
  animateAppear(elements.textP, config.animDuration * 0.5, config.animDuration * 0.8, false, layer); // Appear last

  layer.batchDraw(); // Initial draw
  
  // Add drag functionality to point P if interactive
  setTimeout(() => {
    makePointPDraggable();
  }, (config.animDuration * 1.5) * 1000);
}

function drawStep2() {
  console.log("Executing Step 2");
  if (!elements.pointP) { drawStep1(); } // Ensure previous step exists
  if (elements.pointP_prime) return; // Already drawn

  // Calculate P'
  const pPrimeCoords = reflectPoint(config.pointP, config.origin, config.pointA);
  elements.pPrimeCoords = pPrimeCoords; // Store coords

  // Create Point P' with shadow effect
  elements.pointP_prime = new Konva.Circle({
    x: pPrimeCoords.x, 
    y: pPrimeCoords.y, 
    radius: config.styles.pointRadius,
    fill: config.colors.pointP_prime, 
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0,
  });
  
  // Create Label P' with enhanced styling
  elements.textP_prime = new Konva.Text({
    x: pPrimeCoords.x + 10, 
    y: pPrimeCoords.y - 20, 
    text: "P'",
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  // Dashed line P-P' with animated dash
  elements.linePP_prime = new Konva.Line({
    points: [config.pointP.x, config.pointP.y, pPrimeCoords.x, pPrimeCoords.y],
    stroke: config.colors.helperLines, 
    strokeWidth: 1.5, 
    dash: [6, 3], 
    visible: false,
    opacity: 0
  });

  // Add reflection visual effect (temporary ray from P to P')
  const reflectionRay = new Konva.Line({
    points: [config.pointP.x, config.pointP.y, config.pointP.x, config.pointP.y],
    stroke: config.colors.pointP_prime,
    strokeWidth: 2,
    dash: [4, 4],
    visible: true,
    opacity: 0.6
  });
  layer.add(reflectionRay);
  
  // Add mirror line effect on OA (temporary highlight)
  const mirrorLineOA = new Konva.Line({
    points: [config.origin.x, config.origin.y, config.pointA.x, config.pointA.y],
    stroke: config.colors.pointP_prime,
    strokeWidth: 4,
    opacity: 0,
    shadowColor: config.colors.pointP_prime,
    shadowBlur: 10,
    shadowOpacity: 0.5
  });
  layer.add(mirrorLineOA);

  layer.add(elements.linePP_prime, elements.pointP_prime, elements.textP_prime);

  // --- Enhanced Animation Sequence ---
  
  // 1. First highlight the mirror line (OA)
  gsap.to(mirrorLineOA, {
    opacity: 0.7,
    duration: config.animDuration * 0.5,
    ease: "sine.in",
    onComplete: function() {
      // 2. Then animate the reflection ray
      gsap.to(reflectionRay, {
        points: [config.pointP.x, config.pointP.y, pPrimeCoords.x, pPrimeCoords.y],
        duration: config.animDuration * 0.7,
        ease: "power2.inOut",
        onComplete: function() {
          // 3. Show P' point with physics effect
          animateAppear(elements.pointP_prime, config.animDuration, 0, true, layer);
          animateAppear(elements.textP_prime, config.animDuration, 0.1, false, layer);
          
          // 4. Show dashed connection line
          elements.linePP_prime.visible(true);
          gsap.to(elements.linePP_prime, {
            opacity: 1,
            duration: config.animDuration * 0.5,
            delay: config.animDuration * 0.3
          });
          
          // 5. Fade out the temporary visual elements
          gsap.to([mirrorLineOA, reflectionRay], {
            opacity: 0,
            duration: config.animDuration * 0.5,
            delay: config.animDuration * 0.6,
            onComplete: function() {
              mirrorLineOA.destroy();
              reflectionRay.destroy();
              layer.batchDraw();
            }
          });
        }
      });
    }
  });

  layer.batchDraw();
}

function drawStep3() {
  console.log("Executing Step 3");
  if (!elements.pointP) { drawStep1(); } // Ensure base exists
  if (elements.pointP_double_prime) return; // Already drawn

  // Calculate P''
  const pDoublePrimeCoords = reflectPoint(config.pointP, config.origin, config.pointB);
  elements.pDoublePrimeCoords = pDoublePrimeCoords; // Store coords

  // Create Point P'' with shadow effect
  elements.pointP_double_prime = new Konva.Circle({
    x: pDoublePrimeCoords.x, 
    y: pDoublePrimeCoords.y, 
    radius: config.styles.pointRadius,
    fill: config.colors.pointP_double_prime, 
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0,
  });
  
  // Create Label P'' with enhanced styling
  elements.textP_double_prime = new Konva.Text({
    x: pDoublePrimeCoords.x + 10, 
    y: pDoublePrimeCoords.y + 10, 
    text: "P''",
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  // Dashed line P-P'' with animated dash
  elements.linePP_double_prime = new Konva.Line({
    points: [config.pointP.x, config.pointP.y, pDoublePrimeCoords.x, pDoublePrimeCoords.y],
    stroke: config.colors.helperLines, 
    strokeWidth: 1.5, 
    dash: [6, 3], 
    visible: false,
    opacity: 0
  });

  // Add reflection visual effect (temporary ray from P to P'')
  const reflectionRay = new Konva.Line({
    points: [config.pointP.x, config.pointP.y, config.pointP.x, config.pointP.y],
    stroke: config.colors.pointP_double_prime,
    strokeWidth: 2,
    dash: [4, 4],
    visible: true,
    opacity: 0.6
  });
  layer.add(reflectionRay);
  
  // Add mirror line effect on OB (temporary highlight)
  const mirrorLineOB = new Konva.Line({
    points: [config.origin.x, config.origin.y, config.pointB.x, config.pointB.y],
    stroke: config.colors.pointP_double_prime,
    strokeWidth: 4,
    opacity: 0,
    shadowColor: config.colors.pointP_double_prime,
    shadowBlur: 10,
    shadowOpacity: 0.5
  });
  layer.add(mirrorLineOB);

  layer.add(elements.linePP_double_prime, elements.pointP_double_prime, elements.textP_double_prime);

  // --- Enhanced Animation Sequence ---
  
  // 1. First highlight the mirror line (OB)
  gsap.to(mirrorLineOB, {
    opacity: 0.7,
    duration: config.animDuration * 0.5,
    ease: "sine.in",
    onComplete: function() {
      // 2. Then animate the reflection ray
      gsap.to(reflectionRay, {
        points: [config.pointP.x, config.pointP.y, pDoublePrimeCoords.x, pDoublePrimeCoords.y],
        duration: config.animDuration * 0.7,
        ease: "power2.inOut",
        onComplete: function() {
          // 3. Show P'' point with physics effect
          animateAppear(elements.pointP_double_prime, config.animDuration, 0, true, layer);
          animateAppear(elements.textP_double_prime, config.animDuration, 0.1, false, layer);
          
          // 4. Show dashed connection line
          elements.linePP_double_prime.visible(true);
          gsap.to(elements.linePP_double_prime, {
            opacity: 1,
            duration: config.animDuration * 0.5,
            delay: config.animDuration * 0.3
          });
          
          // 5. Fade out the temporary visual elements
          gsap.to([mirrorLineOB, reflectionRay], {
            opacity: 0,
            duration: config.animDuration * 0.5,
            delay: config.animDuration * 0.6,
            onComplete: function() {
              mirrorLineOB.destroy();
              reflectionRay.destroy();
              layer.batchDraw();
            }
          });
        }
      });
    }
  });

  layer.batchDraw();
}

function drawStep4() {
  console.log("Executing Step 4");
  // Ensure dependencies are met
  if (!elements.pointP_prime) { drawStep2(); }
  if (!elements.pointP_double_prime) { drawStep3(); }
  if (elements.lineP_prime_P_double_prime) return; // Already drawn

  // Get coords (ensure they exist)
  const pPrime = elements.pPrimeCoords;
  const pDoublePrime = elements.pDoublePrimeCoords;
  if (!pPrime || !pDoublePrime) {
    console.error("Cannot execute Step 4: P' or P'' missing.");
    return;
  }

  // Create the connecting line P'P'' with glow effect
  elements.lineP_prime_P_double_prime = new Konva.Line({
    points: [pPrime.x, pPrime.y, pDoublePrime.x, pDoublePrime.y],
    stroke: config.colors.constructionLine,
    strokeWidth: 2.5, // Make it prominent
    visible: false,
    shadowColor: config.colors.constructionLine,
    shadowBlur: 0,
    shadowOpacity: 0.5,
    shadowOffset: { x: 0, y: 0 }
  });
  layer.add(elements.lineP_prime_P_double_prime);

  // Calculate Intersections C and D
  const C_coords = intersectSegmentRay(pPrime, pDoublePrime, config.origin, config.pointA);
  const D_coords = intersectSegmentRay(pPrime, pDoublePrime, config.origin, config.pointB);

  if (!C_coords || !D_coords) {
    console.error("Could not find valid intersections C or D on the rays.");
    // Optionally draw the line P'P'' anyway to show the attempt
    animateDrawLine(elements.lineP_prime_P_double_prime, config.animDuration, 0, false, null, layer);
    layer.batchDraw();
    return; // Stop if intersections not found
  }
  elements.C_coords = C_coords;
  elements.D_coords = D_coords;

  // Create points C and D with enhanced styling
  elements.pointC = new Konva.Circle({
    x: C_coords.x, 
    y: C_coords.y, 
    radius: config.styles.pointRadius, 
    fill: config.colors.pointsCD, 
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  elements.pointD = new Konva.Circle({
    x: D_coords.x, 
    y: D_coords.y, 
    radius: config.styles.pointRadius, 
    fill: config.colors.pointsCD, 
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  // Create labels C and D with enhanced styling
  elements.textC = new Konva.Text({
    x: C_coords.x - 20, 
    y: C_coords.y - 15, 
    text: "C", 
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });
  
  elements.textD = new Konva.Text({
    x: D_coords.x + 10, 
    y: D_coords.y + 10, 
    text: "D", 
    fontSize: 18,
    fontStyle: 'bold',
    fill: config.colors.labels, 
    visible: false
  });

  layer.add(elements.pointC, elements.pointD, elements.textC, elements.textD);

  // --- Enhanced Animation Sequence ---
  
  // 1. First animate the line from P' to P''
  elements.lineP_prime_P_double_prime.visible(true);
  elements.lineP_prime_P_double_prime.points([pPrime.x, pPrime.y, pPrime.x, pPrime.y]);
  
  gsap.to({ x: pPrime.x, y: pPrime.y, glow: 0 }, {
    x: pDoublePrime.x, 
    y: pDoublePrime.y,
    glow: 8,
    duration: config.animDuration * 1.2,
    ease: "power2.inOut",
    onUpdate: function() {
      elements.lineP_prime_P_double_prime.points([
        pPrime.x, pPrime.y, 
        this.targets()[0].x, this.targets()[0].y
      ]);
      elements.lineP_prime_P_double_prime.shadowBlur(this.targets()[0].glow);
      layer.batchDraw();
    },
    onComplete: function() {
      // Find intersection positions along the line
      const totalDist = Math.hypot(pDoublePrime.x - pPrime.x, pDoublePrime.y - pPrime.y);
      const CdistFromP = Math.hypot(C_coords.x - pPrime.x, C_coords.y - pPrime.y);
      const DdistFromP = Math.hypot(D_coords.x - pPrime.x, D_coords.y - pPrime.y);
      
      const Cpercent = CdistFromP / totalDist;
      const Dpercent = DdistFromP / totalDist;
      
      // 2. Animate intersection points with "intersection flash"
      const flashC = new Konva.Circle({
        x: C_coords.x,
        y: C_coords.y,
        radius: 15,
        fill: 'transparent',
        stroke: config.colors.pointsCD,
        strokeWidth: 2,
        opacity: 0
      });
      layer.add(flashC);
      
      gsap.timeline()
        .to(flashC, {
          opacity: 0.9,
          duration: 0.3,
          ease: "power2.in"
        })
        .to(flashC, {
          opacity: 0,
          radius: 30,
          strokeWidth: 0.5,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => flashC.destroy()
        });
        
      animateAppear(elements.pointC, config.animDuration * 0.7, 0.1, true, layer);
      animateAppear(elements.textC, config.animDuration * 0.5, 0.3, false, layer);
      
      // Small delay before showing D
      setTimeout(() => {
        const flashD = new Konva.Circle({
          x: D_coords.x,
          y: D_coords.y,
          radius: 15,
          fill: 'transparent',
          stroke: config.colors.pointsCD,
          strokeWidth: 2,
          opacity: 0
        });
        layer.add(flashD);
        
        gsap.timeline()
          .to(flashD, {
            opacity: 0.9,
            duration: 0.3,
            ease: "power2.in"
          })
          .to(flashD, {
            opacity: 0,
            radius: 30,
            strokeWidth: 0.5,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => flashD.destroy()
          });
          
        animateAppear(elements.pointD, config.animDuration * 0.7, 0.1, true, layer);
        animateAppear(elements.textD, config.animDuration * 0.5, 0.3, false, layer);
      }, config.animDuration * 400); // milliseconds delay
    }
  });

  layer.batchDraw();
}

function drawStep5() {
  console.log("Executing Step 5");
  if (!elements.pointC || !elements.pointD) { drawStep4(); } // Ensure C, D exist
  if (elements.trianglePC) return; // Already drawn

  const C = elements.C_coords;
  const D = elements.D_coords;
  const P = config.pointP;
  const P_prime = elements.pPrimeCoords;
  const P_double_prime = elements.pDoublePrimeCoords;

  // Create final triangle lines (PC, CD, PD) - initially invisible
  elements.trianglePC = new Konva.Line({
    points: [P.x, P.y, C.x, C.y], 
    stroke: config.colors.finalTriangle, 
    strokeWidth: config.styles.triangleLineWidth, 
    visible: false,
    shadowColor: config.colors.finalTriangle,
    shadowBlur: 0,
    shadowOpacity: 0.5
  });
  
  elements.triangleCD = new Konva.Line({ // This will overlay part of the orange line
    points: [C.x, C.y, D.x, D.y], 
    stroke: config.colors.finalTriangle, 
    strokeWidth: config.styles.triangleLineWidth + 0.5, // Slightly thicker
    visible: false,
    shadowColor: config.colors.finalTriangle,
    shadowBlur: 0,
    shadowOpacity: 0.5
  });
  
  elements.trianglePD = new Konva.Line({
    points: [P.x, P.y, D.x, D.y], 
    stroke: config.colors.finalTriangle, 
    strokeWidth: config.styles.triangleLineWidth, 
    visible: false,
    shadowColor: config.colors.finalTriangle,
    shadowBlur: 0,
    shadowOpacity: 0.5
  });

  // Create triangle fill with animation - new feature
  elements.triangleFill = new Konva.Line({
    points: [P.x, P.y, C.x, C.y, D.x, D.y, P.x, P.y],
    closed: true,
    fill: 'rgba(213, 0, 0, 0.1)', // Very light red with transparency
    stroke: 'transparent',
    visible: false,
    opacity: 0
  });

  // Create helper dashed lines P'C and P''D (if not already drawn implicitly by P'P'')
  elements.helperP_primeC = new Konva.Line({
    points: [P_prime.x, P_prime.y, C.x, C.y], 
    stroke: config.colors.pointP_prime, // Match P' color
    strokeWidth: 1.5, 
    dash: [5, 5], 
    visible: false, 
    opacity: 0
  });
  
  elements.helperP_double_primeD = new Konva.Line({
    points: [P_double_prime.x, P_double_prime.y, D.x, D.y], 
    stroke: config.colors.pointP_double_prime, // Match P'' color
    strokeWidth: 1.5, 
    dash: [5, 5], 
    visible: false, 
    opacity: 0
  });

  // Also make dashed versions of PC and PD to show equality
  elements.helperPC = new Konva.Line({
    points: [P.x, P.y, C.x, C.y], 
    stroke: config.colors.pointP_prime, // Match P' color
    strokeWidth: 1.5, 
    dash: [5, 5], 
    visible: false, 
    opacity: 0
  });
  
  elements.helperPD = new Konva.Line({
    points: [P.x, P.y, D.x, D.y], 
    stroke: config.colors.pointP_double_prime, // Match P'' color
    strokeWidth: 1.5, 
    dash: [5, 5], 
    visible: false, 
    opacity: 0
  });

  // Create label for minimum perimeter triangle
  elements.textTriangle = new Konva.Text({
    x: (P.x + C.x + D.x) / 3, // Center of triangle
    y: (P.y + C.y + D.y) / 3 - 10, // Slightly above center
    text: "Minimum Perimeter",
    fontSize: 14,
    fontStyle: 'bold',
    fill: config.colors.finalTriangle,
    visible: false,
    opacity: 0,
    align: 'center'
  });
  elements.textTriangle.offsetX(elements.textTriangle.width() / 2);

  layer.add(
    elements.triangleFill, // Add fill first so it's behind the lines
    elements.helperP_primeC, elements.helperP_double_primeD,
    elements.helperPC, elements.helperPD, // Dashed originals
    elements.trianglePC, elements.triangleCD, elements.trianglePD, // Solid lines
    elements.textTriangle // Triangle label
  );

  // --- Enhanced Animation Sequence ---
  const dur = config.animDuration;
  const del = 0.1;

  // 1. Show dashed equality lines with staggered timing
  elements.helperPC.visible(true);
  elements.helperP_primeC.visible(true);
  
  gsap.to(elements.helperPC, {
    opacity: 0.8,
    duration: dur * 0.6,
    ease: "power1.inOut"
  });
  
  gsap.to(elements.helperP_primeC, {
    opacity: 0.8,
    duration: dur * 0.6,
    ease: "power1.inOut"
  });
  
  // Stagger second pair
  setTimeout(() => {
    elements.helperPD.visible(true);
    elements.helperP_double_primeD.visible(true);
    
    gsap.to(elements.helperPD, {
      opacity: 0.8,
      duration: dur * 0.6,
      ease: "power1.inOut"
    });
    
    gsap.to(elements.helperP_double_primeD, {
      opacity: 0.8,
      duration: dur * 0.6,
      ease: "power1.inOut"
    });
  }, dur * 400); // milliseconds delay

  // 2. After showing equality, draw the solid red triangle
  setTimeout(() => {
    // Draw PC line with glow
    elements.trianglePC.visible(true);
    elements.trianglePC.points([P.x, P.y, P.x, P.y]);
    elements.trianglePC.shadowBlur(0);
    
    gsap.to({ x: P.x, y: P.y, glow: 0 }, {
      x: C.x,
      y: C.y,
      glow: 5,
      duration: dur * 0.6,
      ease: "power2.inOut",
      onUpdate: function() {
        elements.trianglePC.points([P.x, P.y, this.targets()[0].x, this.targets()[0].y]);
        elements.trianglePC.shadowBlur(this.targets()[0].glow);
        layer.batchDraw();
      }
    });
    
    // Draw CD line with slight delay
    setTimeout(() => {
      elements.triangleCD.visible(true);
      elements.triangleCD.points([C.x, C.y, C.x, C.y]);
      elements.triangleCD.shadowBlur(0);
      
      gsap.to({ x: C.x, y: C.y, glow: 0 }, {
        x: D.x,
        y: D.y,
        glow: 5,
        duration: dur * 0.6,
        ease: "power2.inOut",
        onUpdate: function() {
          elements.triangleCD.points([C.x, C.y, this.targets()[0].x, this.targets()[0].y]);
          elements.triangleCD.shadowBlur(this.targets()[0].glow);
          layer.batchDraw();
        }
      });
    }, dur * 200); // milliseconds delay
    
    // Draw PD line with more delay
    setTimeout(() => {
      elements.trianglePD.visible(true);
      elements.trianglePD.points([P.x, P.y, P.x, P.y]);
      elements.trianglePD.shadowBlur(0);
      
      gsap.to({ x: P.x, y: P.y, glow: 0 }, {
        x: D.x,
        y: D.y,
        glow: 5,
        duration: dur * 0.6,
        ease: "power2.inOut",
        onUpdate: function() {
          elements.trianglePD.points([P.x, P.y, this.targets()[0].x, this.targets()[0].y]);
          elements.trianglePD.shadowBlur(this.targets()[0].glow);
          layer.batchDraw();
        },
        onComplete: function() {
          // After triangle is complete, show the fill and label
          elements.triangleFill.visible(true);
          gsap.to(elements.triangleFill, {
            opacity: 1,
            duration: dur * 0.8,
            ease: "power1.inOut"
          });
          
          elements.textTriangle.visible(true);
          gsap.to(elements.textTriangle, {
            opacity: 1,
            duration: dur * 0.5,
            delay: dur * 0.3,
            ease: "power2.out"
          });
          
          // Optional: pulse effect for the triangle
          gsap.to([elements.trianglePC, elements.triangleCD, elements.trianglePD], {
            shadowBlur: 10,
            duration: dur * 0.8,
            ease: "power1.inOut",
            yoyo: true,
            repeat: 1
          });
        }
      });
    }, dur * 400); // milliseconds delay
  }, dur * 800); // milliseconds delay after showing equality lines

  layer.batchDraw();
}
