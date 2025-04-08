/**
 * Interactivity functions for the Ellipse Ratio Problem visualization
 */

// Make point P draggable along ellipse C
function makePointPDraggable() {
  if (!elements.pointP || isDraggable) return;
  
  isDraggable = true;
  
  // Make P draggable
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
  
  // Update construction when P is dragged
  let dragThrottleTimeout = null;
  
  elements.pointP.on('dragmove', function() {
    // Clear any existing timeout
    if (dragThrottleTimeout) clearTimeout(dragThrottleTimeout);
    
    // Set new timeout to update construction
    dragThrottleTimeout = setTimeout(() => {
      // Constrain P to ellipse C
      constrainPointToEllipseC(this);
      
      // Update rays and point Q
      updateRayOPAndPointQ();
      
      // Update ratio display
      updateRatioDisplay();
      
      layer.batchDraw();
    }, 10); // 10ms throttling for smooth performance
  });
  
  // Add drag help indicator
  const dragHelp = new Konva.Text({
    x: 20,
    y: 60,
    text: "Drag point P along ellipse C to see the constant ratio",
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
  
  // Show a brief animation on P to indicate it's draggable
  gsap.to(elements.pointP, {
    scaleX: 1.3,
    scaleY: 1.3,
    duration: 0.5,
    yoyo: true,
    repeat: 1,
    ease: "power2.inOut"
  });
  
  layer.batchDraw();
}

// Constrain point P to always stay on ellipse C
function constrainPointToEllipseC(pointObject) {
  // Get current position relative to origin
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = pointObject.x();
  const py = pointObject.y();
  
  // Calculate angle from center to current position
  let angle = Math.atan2(-(py - oy), px - ox); // Negative for y because canvas y is inverted
  
  // Calculate the constrained position on ellipse C
  const x = ox + config.scale * config.ellipseC.a * Math.cos(angle);
  const y = oy - config.scale * config.ellipseC.b * Math.sin(angle);
  
  // Update point position
  pointObject.x(x);
  pointObject.y(y);
  
  // Update text label position
  if (elements.textP) {
    elements.textP.x(x + 10);
    elements.textP.y(y - 20);
  }
  
  // Update config point
  config.pointP = { x, y };
  
  return { x, y, angle };
}

// Update ray OP and calculate point Q
function updateRayOPAndPointQ() {
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  
  // Calculate the ray vector
  const rayVector = { x: px - ox, y: py - oy };
  
  // Calculate point Q (exactly twice as far along the ray)
  const qx = ox + 2 * rayVector.x;
  const qy = oy + 2 * rayVector.y;
  
  // Update config point Q
  config.pointQ = { x: qx, y: qy };
  
  // Update visual elements if they exist
  if (elements.rayOP) {
    // For visual clarity, extend the ray slightly beyond Q
    const extendedQx = ox + 2.5 * rayVector.x;
    const extendedQy = oy + 2.5 * rayVector.y;
    elements.rayOP.points([ox, oy, extendedQx, extendedQy]);
  }
  
  if (elements.pointQ) {
    elements.pointQ.x(qx);
    elements.pointQ.y(qy);
  }
  
  if (elements.textQ) {
    elements.textQ.x(qx + 10);
    elements.textQ.y(qy - 20);
  }
}

// Update the ratio display with the current values
function updateRatioDisplay() {
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  const qx = config.pointQ.x;
  const qy = config.pointQ.y;
  
  // Calculate distances
  const distOP = Math.sqrt(Math.pow(px - ox, 2) + Math.pow(py - oy, 2));
  const distOQ = Math.sqrt(Math.pow(qx - ox, 2) + Math.pow(qy - oy, 2));
  
  // Calculate ratio
  const ratio = distOQ / distOP;
  
  // Update HTML display
  const ratioDisplay = document.getElementById('ratio-display');
  const ratioValue = document.getElementById('ratio-value');
  
  if (ratioDisplay && ratioValue) {
    ratioValue.textContent = ratio.toFixed(2);
    ratioDisplay.style.display = 'block';
  }
}

// Toggle interactivity - enable/disable drag mode
function toggleInteractivity(forceState) {
  if (forceState === false || isDraggable) {
    // Disable drag mode
    isDraggable = false;
    
    if (elements.pointP) {
      elements.pointP.draggable(false);
      // Remove event listeners (optional - if causing issues)
      elements.pointP.off('mouseover');
      elements.pointP.off('mouseout');
      elements.pointP.off('dragmove');
    }
    
    // Remove drag help
    if (elements.dragHelp) {
      elements.dragHelp.destroy();
      elements.dragHelp = null;
    }
  } else {
    // Enable drag mode if we're at step 5 (requires previous steps to be complete)
    if (currentActiveStep >= 3 && elements.pointP) {
      makePointPDraggable();
    }
  }
  
  layer.batchDraw();
}
