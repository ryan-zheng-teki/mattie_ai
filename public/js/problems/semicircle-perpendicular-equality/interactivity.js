/**
 * Interactivity functions for the Semicircle Perpendicular Equality visualization
 */

// Make points C and E draggable along the semicircle
function makePointsDraggable() {
  if (isDraggable || !elements.pointC) return;
  
  isDraggable = true;
  
  // Make points C and E draggable
  [elements.pointC, elements.pointE].forEach((point, index) => {
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
        // Constrain the point to stay on the semicircle
        const center = { x: elements.pointO.x(), y: elements.pointO.y() };
        const radius = config.circleRadius;
        
        // Current position
        const currentX = this.x();
        const currentY = this.y();
        
        // Calculate the angle from center to current position
        let angle = Math.atan2(currentY - center.y, currentX - center.x);
        
        // Ensure the angle stays within the semicircle range (0 to π)
        if (angle < 0) angle += 2 * Math.PI;
        if (angle > Math.PI) angle = Math.PI;
        
        // Calculate new position on the semicircle
        const newX = center.x + radius * Math.cos(angle);
        const newY = center.y + radius * Math.sin(angle);
        
        // Update point position
        this.x(newX);
        this.y(newY);
        
        // Update the corresponding text position
        const label = index === 0 ? elements.textC : elements.textE;
        const labelOffsetX = 10;
        const labelOffsetY = -20;
        label.x(newX + labelOffsetX);
        label.y(newY + labelOffsetY);
        
        // Store the updated position in config
        if (index === 0) {
          config.pointC = { x: newX, y: newY };
          config.angleC = angle;
        } else {
          config.pointE = { x: newX, y: newY };
          config.angleE = angle;
        }
        
        // Update all dependent constructions
        updateAllConstructions();
        layer.batchDraw();
      }, 10); // 10ms throttling for smooth performance
    });
  });
  
  // Add drag help indicator
  const dragHelp = new Konva.Text({
    x: 20,
    y: 20,
    text: "拖动点C和E进行动态探索!",
    fontSize: 16,
    fill: '#777',
    padding: 10,
    background: '#f0f0f0',
    cornerRadius: 5,
    shadowColor: '#000',
    shadowBlur: 3,
    shadowOffset: { x: 1, y: 1 },
    shadowOpacity: 0.2
  });
  layer.add(dragHelp);
  elements.dragHelp = dragHelp;
  
  // Show a brief animation on the points to indicate they're draggable
  [elements.pointC, elements.pointE].forEach((point, i) => {
    gsap.to(point, {
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 0.5,
      delay: i * 0.1,
      yoyo: true,
      repeat: 1,
      ease: "power2.inOut"
    });
  });
  
  layer.batchDraw();
}

// Update all constructions based on the current positions of points C and E
function updateAllConstructions() {
  const O = { x: elements.pointO.x(), y: elements.pointO.y() };
  const A = { x: elements.pointA.x(), y: elements.pointA.y() };
  const B = { x: elements.pointB.x(), y: elements.pointB.y() };
  const C = { x: elements.pointC.x(), y: elements.pointC.y() };
  const E = { x: elements.pointE.x(), y: elements.pointE.y() };
  
  // Update point D - perpendicular from C to AB
  const D = perpendicularPointToLine(C, A, B);
  elements.pointD.x(D.x);
  elements.pointD.y(D.y);
  elements.textD.x(D.x + 10);
  elements.textD.y(D.y + 10);
  
  // Update line CD
  elements.lineCD.points([C.x, C.y, D.x, D.y]);
  
  // Update point F - perpendicular from E to AB
  const F = perpendicularPointToLine(E, A, B);
  elements.pointF.x(F.x);
  elements.pointF.y(F.y);
  elements.textF.x(F.x + 10);
  elements.textF.y(F.y + 10);
  
  // Update line EF
  elements.lineEF.points([E.x, E.y, F.x, F.y]);
  
  // Update line CO
  elements.lineCO.points([C.x, C.y, O.x, O.y]);
  
  // Update point G - perpendicular from E to CO
  // FIXED: Use the correct calculation function for G
  const G = calculatePerpendicularPointOnLine(E, C, O);
  elements.pointG.x(G.x);
  elements.pointG.y(G.y);
  elements.textG.x(G.x + 10);
  elements.textG.y(G.y - 20);
  
  // Update line EG
  elements.lineEG.points([E.x, E.y, G.x, G.y]);
  
  // Update perpendicular symbols
  updatePerpendicularSymbols(C, D, E, F, E, G, B);
  
  // Update triangles if they exist
  if (elements.triangleCOD) {
    elements.triangleCOD.points([C.x, C.y, O.x, O.y, D.x, D.y]);
  }
  
  if (elements.triangleEGF) {
    elements.triangleEGF.points([E.x, E.y, G.x, G.y, F.x, F.y]);
  }
  
  // Update the length comparison annotation if it exists
  if (elements.lengthText) {
    elements.lengthText.text(`CD = ${Math.round(distance(C, D))} = GF = ${Math.round(distance(G, F))}`);
  }
}

// Function that correctly calculates a perpendicular point on the line
// This function is the same as in step-functions.js and ensures consistency
function calculatePerpendicularPointOnLine(fromPoint, lineStart, lineEnd) {
  const lineVecX = lineEnd.x - lineStart.x;
  const lineVecY = lineEnd.y - lineStart.y;
  
  // Handle case where lineStart and lineEnd are the same point
  if (lineVecX === 0 && lineVecY === 0) {
    return { x: lineStart.x, y: lineStart.y }; // Return the start point
  }
  
  const pointVecX = fromPoint.x - lineStart.x;
  const pointVecY = fromPoint.y - lineStart.y;
  
  // Calculate the dot product of the line vector and the point vector
  const dotProduct = pointVecX * lineVecX + pointVecY * lineVecY;
  const lineLengthSq = lineVecX * lineVecX + lineVecY * lineVecY;
  
  // Avoid division by zero
  if (lineLengthSq === 0) {
    return { x: lineStart.x, y: lineStart.y };
  }
  
  // Calculate the projection ratio along the line CO
  const ratio = dotProduct / lineLengthSq;
  
  // Calculate the point on line CO closest to E
  const projectionX = lineStart.x + ratio * lineVecX;
  const projectionY = lineStart.y + ratio * lineVecY;
  
  return { x: projectionX, y: projectionY };
}

// Update perpendicular symbols
function updatePerpendicularSymbols(C, D, E, F, E2, G, B) {
  // CD⊥AB symbol
  if (elements.perpSymbolD) {
    elements.perpSymbolD.points([
      D.x - 7, D.y - 7,
      D.x - 7, D.y + 7,
      D.x + 7, D.y + 7
    ]);
  }
  
  // EF⊥AB symbol
  if (elements.perpSymbolF) {
    elements.perpSymbolF.points([
      F.x - 7, F.y - 7,
      F.x - 7, F.y + 7,
      F.x + 7, F.y + 7
    ]);
  }
  
  // EG⊥CO symbol
  if (elements.perpSymbolG) {
    elements.perpSymbolG.points([
      G.x - 7, G.y - 7,
      G.x - 7, G.y + 7,
      G.x + 7, G.y + 7
    ]);
  }
}

// Toggle interactivity
function toggleInteractivity() {
  if (!elements.pointC) return;
  
  isDraggable = !isDraggable;
  
  if (isDraggable) {
    makePointsDraggable();
  } else {
    // Disable dragging
    [elements.pointC, elements.pointE].forEach(point => {
      point.draggable(false);
    });
    
    // Remove drag help indicator
    if (elements.dragHelp) {
      elements.dragHelp.destroy();
      elements.dragHelp = null;
    }
  }
  
  layer.batchDraw();
}
