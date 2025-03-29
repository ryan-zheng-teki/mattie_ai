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

// Calculate the perpendicular point from a point to a line
function perpendicularPointToLine(point, lineStart, lineEnd) {
  // Vector from lineStart to lineEnd
  const lineVec = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y
  };
  
  // Vector from lineStart to point
  const pointVec = {
    x: point.x - lineStart.x,
    y: point.y - lineStart.y
  };
  
  // Calculate dot product
  const dotProduct = pointVec.x * lineVec.x + pointVec.y * lineVec.y;
  
  // Calculate squared length of line
  const lineLengthSq = lineVec.x * lineVec.x + lineVec.y * lineVec.y;
  
  // Calculate projection ratio
  const ratio = dotProduct / lineLengthSq;
  
  // Calculate projection point
  const projectionPoint = {
    x: lineStart.x + ratio * lineVec.x,
    y: lineStart.y + ratio * lineVec.y
  };
  
  return projectionPoint;
}

// Calculate intersection of two lines defined by points
function lineIntersection(line1Start, line1End, line2Start, line2End) {
  // Line 1 coefficients
  const a1 = line1End.y - line1Start.y;
  const b1 = line1Start.x - line1End.x;
  const c1 = a1 * line1Start.x + b1 * line1Start.y;
  
  // Line 2 coefficients
  const a2 = line2End.y - line2Start.y;
  const b2 = line2Start.x - line2End.x;
  const c2 = a2 * line2Start.x + b2 * line2Start.y;
  
  // Determinant
  const det = a1 * b2 - a2 * b1;
  
  if (det === 0) {
    // Lines are parallel
    return null;
  } else {
    // Calculate intersection
    const x = (b2 * c1 - b1 * c2) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    return { x, y };
  }
}

// Calculate extended point from a line in the direction of the line
function extendLine(lineStart, lineEnd, extensionFactor = 2) {
  return {
    x: lineEnd.x + extensionFactor * (lineEnd.x - lineStart.x),
    y: lineEnd.y + extensionFactor * (lineEnd.y - lineStart.y)
  };
}

// Make the square corners draggable
function makeSquareDraggable() {
  if (isDraggable || !elements.pointA) return;
  
  isDraggable = true;
  
  // Make each corner draggable
  [elements.pointA, elements.pointB, elements.pointC, elements.pointD].forEach(point => {
    point.draggable(true);
    
    // Add visual cue that point is draggable
    point.on('mouseover', function() {
      document.body.style.cursor = 'pointer';
      this.strokeEnabled(true);
      this.stroke('#fff');
      this.strokeWidth(2);
      this.scale({ x: 1.2, y: 1.2 });
      layer.batchDraw();
    });
    
    point.on('mouseout', function() {
      document.body.style.cursor = 'default';
      this.strokeEnabled(false);
      this.scale({ x: 1, y: 1 });
      layer.batchDraw();
    });
    
    // Update construction on drag
    let dragThrottleTimeout = null;
    
    point.on('dragmove', function() {
      // Clear any existing timeout
      if (dragThrottleTimeout) clearTimeout(dragThrottleTimeout);
      
      // Set new timeout to update construction
      dragThrottleTimeout = setTimeout(() => {
        updateSquareGeometry();
        updateConstructionPoints();
        updateAllLines();
        layer.batchDraw();
      }, 10); // 10ms throttling for smooth performance
    });
  });
  
  // Add drag help indicator
  const dragHelp = new Konva.Text({
    x: 20,
    y: 20,
    text: "Drag the square corners to explore!",
    fontSize: 14,
    fill: '#777',
    padding: 5,
    background: '#f0f0f0',
    cornerRadius: 3
  });
  layer.add(dragHelp);
  elements.dragHelp = dragHelp;
  
  layer.batchDraw();
}

// Update square to maintain a valid square shape when corners are dragged
function updateSquareGeometry() {
  // Get the current positions of the corners
  const A = { x: elements.pointA.x(), y: elements.pointA.y() };
  const B = { x: elements.pointB.x(), y: elements.pointB.y() };
  const C = { x: elements.pointC.x(), y: elements.pointC.y() };
  const D = { x: elements.pointD.x(), y: elements.pointD.y() };
  
  // Update config points
  config.pointA = A;
  config.pointB = B;
  config.pointC = C;
  config.pointD = D;
  
  // Update E as midpoint of BC
  config.pointE = {
    x: (B.x + C.x) / 2,
    y: (B.y + C.y) / 2
  };
  
  // Update position of point E
  if (elements.pointE) {
    elements.pointE.x(config.pointE.x);
    elements.pointE.y(config.pointE.y);
    elements.textE.x(config.pointE.x + 10);
    elements.textE.y(config.pointE.y - 20);
  }
  
  // Update square lines
  if (elements.squareLines) {
    elements.squareLines.points([
      A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y, A.x, A.y
    ]);
  }
  
  // Update labels positions
  updateLabels(A, B, C, D);
}

// Update all construction points based on current square
function updateConstructionPoints() {
  // Get current positions
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const D = config.pointD;
  const E = config.pointE;
  
  // Calculate G (perpendicular from B to AE)
  if (elements.lineAE) {
    const G = perpendicularPointToLine(B, A, E);
    config.pointG = G;
    
    if (elements.pointG) {
      elements.pointG.x(G.x);
      elements.pointG.y(G.y);
      elements.textG.x(G.x + 10);
      elements.textG.y(G.y - 20);
    }
    
    // Update BG line
    if (elements.lineBG) {
      elements.lineBG.points([B.x, B.y, G.x, G.y]);
      
      // Extended BG line
      const extendedBG = extendLine(B, G);
      config.extendedBG = extendedBG;
      
      if (elements.extendedLineBG) {
        elements.extendedLineBG.points([G.x, G.y, extendedBG.x, extendedBG.y]);
      }
      
      // Calculate H (perpendicular from C to BG extended)
      if (elements.extendedLineBG) {
        const bgLineStart = B;
        const bgLineEnd = extendedBG;
        const H = perpendicularPointToLine(C, bgLineStart, bgLineEnd);
        config.pointH = H;
        
        if (elements.pointH) {
          elements.pointH.x(H.x);
          elements.pointH.y(H.y);
          elements.textH.x(H.x + 10);
          elements.textH.y(H.y - 20);
        }
        
        // Update CF line
        if (elements.lineCF) {
          // Calculate F (intersection of CF with AD)
          const F = lineIntersection(C, H, A, D);
          if (F) {
            config.pointF = F;
            
            if (elements.pointF) {
              elements.pointF.x(F.x);
              elements.pointF.y(F.y);
              elements.textF.x(F.x + 10);
              elements.textF.y(F.y - 20);
            }
            
            elements.lineCF.points([C.x, C.y, F.x, F.y]);
          }
        }
        
        // Step 5 elements - if they exist
        if (elements.lineAH) {
          elements.lineAH.points([A.x, A.y, H.x, H.y]);
          
          if (elements.lineEH) {
            elements.lineEH.points([E.x, E.y, H.x, H.y]);
            
            // Calculate I (intersection of EH extended with CD)
            const extendedEH = extendLine(E, H);
            const I = lineIntersection(E, extendedEH, C, D);
            if (I) {
              config.pointI = I;
              
              if (elements.pointI) {
                elements.pointI.x(I.x);
                elements.pointI.y(I.y);
                elements.textI.x(I.x + 10);
                elements.textI.y(I.y - 20);
              }
              
              if (elements.extendedLineEH) {
                elements.extendedLineEH.points([H.x, H.y, I.x, I.y]);
              }
            }
          }
        }
        
        // Update triangles if they exist
        updateTriangles();
      }
    }
  }
}

// Update the triangle shapes based on current points
function updateTriangles() {
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const G = config.pointG;
  const H = config.pointH;
  
  if (elements.triangleABG && A && B && G) {
    elements.triangleABG.points([A.x, A.y, B.x, B.y, G.x, G.y, A.x, A.y]);
  }
  
  if (elements.triangleBCH && B && C && H) {
    elements.triangleBCH.points([B.x, B.y, C.x, C.y, H.x, H.y, B.x, B.y]);
  }
}

// Update all lines in the construction
function updateAllLines() {
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const D = config.pointD;
  const E = config.pointE;
  
  if (elements.lineAE) {
    elements.lineAE.points([A.x, A.y, E.x, E.y]);
  }
}

// Update the positions of the corner labels
function updateLabels(A, B, C, D) {
  if (elements.textA) {
    elements.textA.x(A.x - 20);
    elements.textA.y(A.y - 20);
  }
  
  if (elements.textB) {
    elements.textB.x(B.x + 10);
    elements.textB.y(B.y - 20);
  }
  
  if (elements.textC) {
    elements.textC.x(C.x + 10);
    elements.textC.y(C.y + 10);
  }
  
  if (elements.textD) {
    elements.textD.x(D.x - 20);
    elements.textD.y(D.y + 10);
  }
}

// Add function to toggle interactivity
function toggleInteractivity() {
  if (!elements.pointA) return;
  
  isDraggable = !isDraggable;
  
  if (isDraggable) {
    makeSquareDraggable();
  } else {
    // Disable dragging
    [elements.pointA, elements.pointB, elements.pointC, elements.pointD].forEach(point => {
      point.draggable(false);
    });
    
    // Remove drag help indicator
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
  isDraggable = false; // Reset draggable state
  console.log("Canvas cleared");
}

// --- Step Functions ---

function drawStep1() {
  console.log("Executing Step 1");
  clearCanvas(); // Start fresh for this step

  // Get square corners from config
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const D = config.pointD;
  const E = config.pointE; // Midpoint of BC
  
  // Draw the square outline
  elements.squareLines = new Konva.Line({
    points: [A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y, A.x, A.y],
    stroke: config.colors.square,
    strokeWidth: config.styles.lineWidth,
    closed: true,
    visible: false
  });
  layer.add(elements.squareLines);
  
  // Create corner points
  elements.pointA = new Konva.Circle({
    x: A.x,
    y: A.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointA,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  elements.pointB = new Konva.Circle({
    x: B.x,
    y: B.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointB,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  elements.pointC = new Konva.Circle({
    x: C.x,
    y: C.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointC,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  elements.pointD = new Konva.Circle({
    x: D.x,
    y: D.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointD,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  // Create point E (midpoint of BC)
  elements.pointE = new Konva.Circle({
    x: E.x,
    y: E.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointE,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  // Create labels for points
  elements.textA = new Konva.Text({
    x: A.x - 20,
    y: A.y - 20,
    text: 'A',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  elements.textB = new Konva.Text({
    x: B.x + 10,
    y: B.y - 20,
    text: 'B',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  elements.textC = new Konva.Text({
    x: C.x + 10,
    y: C.y + 10,
    text: 'C',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  elements.textD = new Konva.Text({
    x: D.x - 20,
    y: D.y + 10,
    text: 'D',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  elements.textE = new Konva.Text({
    x: E.x + 10,
    y: E.y - 20,
    text: 'E',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  // Add all elements to the layer
  layer.add(
    elements.pointA, elements.pointB, elements.pointC, elements.pointD, elements.pointE,
    elements.textA, elements.textB, elements.textC, elements.textD, elements.textE
  );
  
  // --- Animations ---
  // First animate the square
  animateDrawLine(elements.squareLines, config.animDuration, 0, true, config.colors.square, layer);
  
  // Then animate the corner points with slight delays
  const cornerDelay = config.animDuration * 0.5;
  animateAppear(elements.pointA, config.animDuration, cornerDelay, true, layer);
  animateAppear(elements.pointB, config.animDuration, cornerDelay + 0.1, true, layer);
  animateAppear(elements.pointC, config.animDuration, cornerDelay + 0.2, true, layer);
  animateAppear(elements.pointD, config.animDuration, cornerDelay + 0.3, true, layer);
  
  // Then animate point E with a highlight effect
  setTimeout(() => {
    // First show a construction line from B to C
    const constructionLine = new Konva.Line({
      points: [B.x, B.y, C.x, C.y],
      stroke: config.colors.pointE,
      strokeWidth: 2,
      dash: [5, 5],
      opacity: 0.6
    });
    layer.add(constructionLine);
    layer.batchDraw();
    
    // Then show point E
    setTimeout(() => {
      animateAppear(elements.pointE, config.animDuration, 0, true, layer);
      
      // Fade out construction line
      gsap.to(constructionLine, {
        opacity: 0,
        duration: config.animDuration * 0.5,
        onComplete: () => {
          constructionLine.destroy();
          layer.batchDraw();
        }
      });
    }, config.animDuration * 500);
  }, cornerDelay * 1000 + 400);
  
  // Finally show labels with slight delays
  const labelDelay = config.animDuration * 1.5;
  animateAppear(elements.textA, config.animDuration * 0.5, labelDelay, false, layer);
  animateAppear(elements.textB, config.animDuration * 0.5, labelDelay + 0.1, false, layer);
  animateAppear(elements.textC, config.animDuration * 0.5, labelDelay + 0.2, false, layer);
  animateAppear(elements.textD, config.animDuration * 0.5, labelDelay + 0.3, false, layer);
  animateAppear(elements.textE, config.animDuration * 0.5, labelDelay + 0.5, false, layer);
  
  layer.batchDraw();
}

function drawStep2() {
  console.log("Executing Step 2");
  if (!elements.pointE) { drawStep1(); } // Ensure previous step exists
  if (elements.lineAE) return; // Already drawn
  
  // Get points from config
  const A = config.pointA;
  const B = config.pointB;
  const E = config.pointE;
  
  // Draw line AE
  elements.lineAE = new Konva.Line({
    points: [A.x, A.y, E.x, E.y],
    stroke: config.colors.lineAE,
    strokeWidth: config.styles.lineWidth,
    visible: false
  });
  layer.add(elements.lineAE);
  
  // Calculate point G (perpendicular from B to AE)
  const G = perpendicularPointToLine(B, A, E);
  config.pointG = G;
  
  // Create point G
  elements.pointG = new Konva.Circle({
    x: G.x,
    y: G.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointG,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  // Create label for G
  elements.textG = new Konva.Text({
    x: G.x + 10,
    y: G.y - 20,
    text: 'G',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  // Create line BG (perpendicular to AE)
  elements.lineBG = new Konva.Line({
    points: [B.x, B.y, G.x, G.y],
    stroke: config.colors.lineBG,
    strokeWidth: config.styles.lineWidth,
    visible: false
  });
  
  // Add perpendicular symbol at G
  elements.perpendicularSymbolG = new Konva.Line({
    points: [
      G.x - 7, G.y - 7,
      G.x - 7, G.y + 7,
      G.x + 7, G.y + 7
    ],
    stroke: config.colors.labels,
    strokeWidth: 2,
    visible: false,
    opacity: 0
  });
  
  // Add elements to layer
  layer.add(elements.lineBG, elements.pointG, elements.textG, elements.perpendicularSymbolG);
  
  // --- Animations ---
  // First animate the AE line
  animateDrawLine(elements.lineAE, config.animDuration, 0, true, config.colors.lineAE, layer);
  
  // Then show construction for point G
  setTimeout(() => {
    // Temporary construction line
    const constructionLine = new Konva.Line({
      points: [B.x, B.y, B.x, B.y], // Start at B
      stroke: config.colors.pointG,
      strokeWidth: 2,
      dash: [5, 5],
      opacity: 0.6
    });
    layer.add(constructionLine);
    
    // Animate construction line to show perpendicular
    gsap.to({}, {
      duration: config.animDuration * 0.8,
      onUpdate: function() {
        const progress = this.progress();
        // Create a point that moves from B toward AE, then snaps to G
        let x, y;
        if (progress < 0.8) {
          // Move toward AE
          x = B.x + progress * 1.25 * (G.x - B.x);
          y = B.y + progress * 1.25 * (G.y - B.y);
        } else {
          // Snap to G
          x = G.x;
          y = G.y;
        }
        
        constructionLine.points([B.x, B.y, x, y]);
        layer.batchDraw();
      },
      onComplete: function() {
        // Show permanent line BG
        animateDrawLine(elements.lineBG, config.animDuration * 0.6, 0, true, config.colors.lineBG, layer);
        
        // Show G point
        animateAppear(elements.pointG, config.animDuration, 0.3, true, layer);
        
        // Show G label
        animateAppear(elements.textG, config.animDuration * 0.5, 0.5, false, layer);
        
        // Fade out construction line
        gsap.to(constructionLine, {
          opacity: 0,
          duration: config.animDuration * 0.3,
          delay: 0.2,
          onComplete: () => {
            constructionLine.destroy();
            
            // Show perpendicular symbol
            elements.perpendicularSymbolG.visible(true);
            gsap.to(elements.perpendicularSymbolG, {
              opacity: 1,
              duration: config.animDuration * 0.5,
              delay: 0.1
            });
            
            layer.batchDraw();
          }
        });
      }
    });
  }, config.animDuration * 1000 + 200);
  
  layer.batchDraw();
}

function drawStep3() {
  console.log("Executing Step 3");
  if (!elements.lineBG) { drawStep2(); } // Ensure previous step exists
  if (elements.extendedLineBG) return; // Already drawn
  
  // Get points from config
  const B = config.pointB;
  const C = config.pointC;
  const G = config.pointG;
  const A = config.pointA;
  const D = config.pointD;
  
  // Calculate extended line BG
  const extendedBG = extendLine(B, G);
  config.extendedBG = extendedBG;
  
  // Draw extended line BG
  elements.extendedLineBG = new Konva.Line({
    points: [G.x, G.y, extendedBG.x, extendedBG.y],
    stroke: config.colors.lineBG,
    strokeWidth: config.styles.lineWidth,
    dash: [5, 5],
    visible: false,
    opacity: 0
  });
  layer.add(elements.extendedLineBG);
  
  // Calculate H (perpendicular from C to BG extended)
  const bgLineStart = B;
  const bgLineEnd = extendedBG;
  const H = perpendicularPointToLine(C, bgLineStart, bgLineEnd);
  config.pointH = H;
  
  // Create point H
  elements.pointH = new Konva.Circle({
    x: H.x,
    y: H.y,
    radius: config.styles.pointRadius,
    fill: config.colors.pointH,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  // Create label for H
  elements.textH = new Konva.Text({
    x: H.x + 10,
    y: H.y - 20,
    text: 'H',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  // Calculate F (intersection of CH with AD)
  const F = lineIntersection(C, H, A, D);
  if (F) {
    config.pointF = F;
    
    // Create point F
    elements.pointF = new Konva.Circle({
      x: F.x,
      y: F.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointF,
      visible: false,
      shadowColor: 'black',
      shadowBlur: 0,
      shadowOpacity: 0
    });
    
    // Create label for F
    elements.textF = new Konva.Text({
      x: F.x + 10,
      y: F.y - 20,
      text: 'F',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels,
      visible: false
    });
    
    // Create line CF (perpendicular to BG)
    elements.lineCF = new Konva.Line({
      points: [C.x, C.y, F.x, F.y],
      stroke: config.colors.lineCF,
      strokeWidth: config.styles.lineWidth,
      visible: false
    });
    
    // Add perpendicular symbol at the intersection of CF and BG extended
    elements.perpendicularSymbolH = new Konva.Line({
      points: [
        H.x - 7, H.y - 7,
        H.x - 7, H.y + 7,
        H.x + 7, H.y + 7
      ],
      stroke: config.colors.labels,
      strokeWidth: 2,
      visible: false,
      opacity: 0
    });
    
    // Add elements to layer
    layer.add(
      elements.extendedLineBG, elements.lineCF, 
      elements.pointH, elements.textH,
      elements.pointF, elements.textF,
      elements.perpendicularSymbolH
    );
    
    // --- Animations ---
    // First animate the extended BG line
    elements.extendedLineBG.visible(true);
    gsap.to(elements.extendedLineBG, {
      opacity: 1,
      duration: config.animDuration * 0.6,
      ease: config.easing.draw
    });
    
    // Then show construction for point H
    setTimeout(() => {
      // Temporary construction line
      const constructionLine = new Konva.Line({
        points: [C.x, C.y, C.x, C.y], // Start at C
        stroke: config.colors.pointH,
        strokeWidth: 2,
        dash: [5, 5],
        opacity: 0.6
      });
      layer.add(constructionLine);
      
      // Animate construction line to show perpendicular
      gsap.to({}, {
        duration: config.animDuration * 0.8,
        onUpdate: function() {
          const progress = this.progress();
          // Create a point that moves from C toward BG, then snaps to H
          let x, y;
          if (progress < 0.8) {
            // Move toward BG
            x = C.x + progress * 1.25 * (H.x - C.x);
            y = C.y + progress * 1.25 * (H.y - C.y);
          } else {
            // Snap to H
            x = H.x;
            y = H.y;
          }
          
          constructionLine.points([C.x, C.y, x, y]);
          layer.batchDraw();
        },
        onComplete: function() {
          // Show H and F points
          animateAppear(elements.pointH, config.animDuration, 0.2, true, layer);
          animateAppear(elements.pointF, config.animDuration, 0.4, true, layer);
          
          // Show CF line
          animateDrawLine(elements.lineCF, config.animDuration * 0.8, 0.3, true, config.colors.lineCF, layer);
          
          // Show labels
          animateAppear(elements.textH, config.animDuration * 0.5, 0.5, false, layer);
          animateAppear(elements.textF, config.animDuration * 0.5, 0.6, false, layer);
          
          // Fade out construction line
          gsap.to(constructionLine, {
            opacity: 0,
            duration: config.animDuration * 0.3,
            delay: 0.3,
            onComplete: () => {
              constructionLine.destroy();
              
              // Show perpendicular symbol
              elements.perpendicularSymbolH.visible(true);
              gsap.to(elements.perpendicularSymbolH, {
                opacity: 1,
                duration: config.animDuration * 0.5,
                delay: 0.1
              });
              
              layer.batchDraw();
            }
          });
        }
      });
    }, config.animDuration * 800);
  } else {
    console.error("Could not calculate point F (intersection not found)");
  }
  
  layer.batchDraw();
}

function drawStep4() {
  console.log("Executing Step 4");
  if (!elements.pointH) { drawStep3(); } // Ensure previous step exists
  if (elements.triangleABG) return; // Already drawn
  
  // Get points from config
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const G = config.pointG;
  const H = config.pointH;
  
  // Create triangle ABG fill
  elements.triangleABG = new Konva.Line({
    points: [A.x, A.y, B.x, B.y, G.x, G.y, A.x, A.y],
    closed: true,
    fill: config.colors.triangleABG,
    stroke: config.colors.pointA,
    strokeWidth: 2,
    visible: false,
    opacity: 0
  });
  
  // Create triangle BCH fill
  elements.triangleBCH = new Konva.Line({
    points: [B.x, B.y, C.x, C.y, H.x, H.y, B.x, B.y],
    closed: true,
    fill: config.colors.triangleBCH,
    stroke: config.colors.pointC,
    strokeWidth: 2,
    visible: false,
    opacity: 0
  });
  
  // Create proof text
  elements.proofText = new Konva.Text({
    x: stage.width() / 2,
    y: 40,
    text: '△ABG ≅ △BCH (相似三角形)',
    fontSize: 18,
    fontStyle: 'bold',
    fill: '#333',
    visible: false,
    opacity: 0,
    align: 'center'
  });
  elements.proofText.offsetX(elements.proofText.width() / 2);
  
  // Add elements to layer
  layer.add(elements.triangleABG, elements.triangleBCH, elements.proofText);
  
  // --- Animations ---
  // Show triangles with staggered timing
  elements.triangleABG.visible(true);
  gsap.to(elements.triangleABG, {
    opacity: 1,
    duration: config.animDuration * 0.8,
    ease: "power2.inOut"
  });
  
  setTimeout(() => {
    elements.triangleBCH.visible(true);
    gsap.to(elements.triangleBCH, {
      opacity: 1,
      duration: config.animDuration * 0.8,
      ease: "power2.inOut"
    });
  }, config.animDuration * 600);
  
  // Show proof text
  setTimeout(() => {
    elements.proofText.visible(true);
    gsap.to(elements.proofText, {
      opacity: 1,
      duration: config.animDuration * 0.5,
      ease: "power2.inOut"
    });
    
    // Pulse animation for triangles to show similarity
    gsap.to([elements.triangleABG, elements.triangleBCH], {
      strokeWidth: 3,
      duration: 0.5,
      repeat: 3,
      yoyo: true,
      ease: "sine.inOut",
      delay: 0.3
    });
  }, config.animDuration * 1200);
  
  layer.batchDraw();
}

function drawStep5() {
  console.log("Executing Step 5");
  if (!elements.pointH) { drawStep3(); } // Ensure previous step exists
  if (elements.lineAH) return; // Already drawn
  
  // Get points from config
  const A = config.pointA;
  const E = config.pointE;
  const H = config.pointH;
  const C = config.pointC;
  const D = config.pointD;
  
  // Create line AH
  elements.lineAH = new Konva.Line({
    points: [A.x, A.y, H.x, H.y],
    stroke: config.colors.lineAH,
    strokeWidth: config.styles.lineWidth,
    visible: false
  });
  
  // Create line EH
  elements.lineEH = new Konva.Line({
    points: [E.x, E.y, H.x, H.y],
    stroke: config.colors.lineEH,
    strokeWidth: config.styles.lineWidth,
    visible: false
  });
  
  // Calculate I (intersection of EH extended with CD)
  const extendedEH = extendLine(E, H);
  const I = lineIntersection(E, extendedEH, C, D);
  
  if (I) {
    config.pointI = I;
    
    // Create point I
    elements.pointI = new Konva.Circle({
      x: I.x,
      y: I.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointI,
      visible: false,
      shadowColor: 'black',
      shadowBlur: 0,
      shadowOpacity: 0
    });
    
    // Create label for I
    elements.textI = new Konva.Text({
      x: I.x + 10,
      y: I.y - 20,
      text: 'I',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels,
      visible: false
    });
    
    // Create extended line EH to I
    elements.extendedLineEH = new Konva.Line({
      points: [H.x, H.y, I.x, I.y],
      stroke: config.colors.lineEH,
      strokeWidth: config.styles.lineWidth,
      dash: [5, 5],
      visible: false,
      opacity: 0
    });
    
    // Create proof texts
    elements.proofText1 = new Konva.Text({
      x: stage.width() / 2,
      y: 40,
      text: 'AB² = AE · BH',
      fontSize: 18,
      fontStyle: 'bold',
      fill: '#333',
      visible: false,
      opacity: 0,
      align: 'center'
    });
    elements.proofText1.offsetX(elements.proofText1.width() / 2);
    
    elements.proofText2 = new Konva.Text({
      x: stage.width() / 2,
      y: 70,
      text: 'DI / IC = 2',
      fontSize: 18,
      fontStyle: 'bold',
      fill: '#333',
      visible: false,
      opacity: 0,
      align: 'center'
    });
    elements.proofText2.offsetX(elements.proofText2.width() / 2);
    
    // Add elements to layer
    layer.add(
      elements.lineAH, elements.lineEH, elements.extendedLineEH,
      elements.pointI, elements.textI,
      elements.proofText1, elements.proofText2
    );
    
    // --- Animations ---
    // First animate line AH
    animateDrawLine(elements.lineAH, config.animDuration, 0, true, config.colors.lineAH, layer);
    
    // Then animate line EH
    setTimeout(() => {
      animateDrawLine(elements.lineEH, config.animDuration, 0, true, config.colors.lineEH, layer);
      
      // After EH is drawn, show the extension to I
      setTimeout(() => {
        elements.extendedLineEH.visible(true);
        gsap.to(elements.extendedLineEH, {
          opacity: 1,
          duration: config.animDuration * 0.6,
          ease: config.easing.draw
        });
        
        // Show point I
        animateAppear(elements.pointI, config.animDuration, 0.3, true, layer);
        
        // Show I label
        animateAppear(elements.textI, config.animDuration * 0.5, 0.5, false, layer);
        
        // Show proof texts
        setTimeout(() => {
          elements.proofText1.visible(true);
          gsap.to(elements.proofText1, {
            opacity: 1,
            duration: config.animDuration * 0.5,
            ease: "power2.inOut"
          });
          
          setTimeout(() => {
            elements.proofText2.visible(true);
            gsap.to(elements.proofText2, {
              opacity: 1,
              duration: config.animDuration * 0.5,
              ease: "power2.inOut"
            });
          }, config.animDuration * 500);
        }, config.animDuration * 700);
      }, config.animDuration * 1000);
    }, config.animDuration * 1000);
  } else {
    console.error("Could not calculate point I (intersection not found)");
  }
  
  layer.batchDraw();
}
