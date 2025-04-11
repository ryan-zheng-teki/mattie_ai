/**
 * Step functions for the Ellipse Ratio Problem visualization
 * These functions draw elements incrementally.
 */

// Helper to check prerequisites and call previous step if needed
function ensurePrerequisites(requiredStep, currentStepFunction) {
    if (currentActiveStep < requiredStep) {
        console.warn(`Prerequisite Step ${requiredStep} not met for ${currentStepFunction}. Drawing prerequisites.`);
        // Find the function for the required step and call it without animation
        const prerequisiteFunctionName = `drawStep${requiredStep}`;
        if (typeof window[prerequisiteFunctionName] === 'function') {
            window[prerequisiteFunctionName](false); // Draw prerequisite non-animated
        } else {
            console.error(`Error: Prerequisite function ${prerequisiteFunctionName} not found.`);
            return false; // Indicate failure
        }
    }
    // Additionally check if the core elements of the prerequisite step actually exist
    const prerequisiteKeys = stepElementKeys[requiredStep];
    if (prerequisiteKeys && prerequisiteKeys.length > 0) {
        const firstKey = prerequisiteKeys[0]; // Check existence of a key element
        if (!elements[firstKey]) {
             console.error(`Error: Prerequisite elements for Step ${requiredStep} seem missing even after drawing.`);
             // Attempt to draw again? Or throw error? For robustness, let's try drawing again.
             const prerequisiteFunctionName = `drawStep${requiredStep}`;
             if (typeof window[prerequisiteFunctionName] === 'function') {
                 window[prerequisiteFunctionName](false); 
                 if (!elements[firstKey]) return false; // Failed again
             } else {
                 return false;
             }
        }
    }
    return true; // Prerequisites met
}

// Step 1: Draw coordinate system and ellipses C and E
function drawStep1(withAnimation = true) {
  // Idempotency Check: If step 1 elements already exist, do nothing.
  if (elements.xAxis && elements.ellipseC && elements.ellipseE) {
    console.log("Step 1 elements already exist. Skipping draw.");
    if (withAnimation) {
      showStepExplanation("Step 1: Draw the coordinate system and the two ellipses C and E", 0.1);
    }
    return;
  }
  
  console.log(`Executing Step 1 (Animate: ${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("Step 1: Draw the coordinate system and the two ellipses C and E");
  }
  
  // Draw coordinate system (x and y axes)
  const xAxis = new Konva.Line({
    points: [0, config.origin.y, stage.width(), config.origin.y],
    stroke: config.colors.axes,
    strokeWidth: config.styles.axisWidth,
    visible: false
  });
  
  const yAxis = new Konva.Line({
    points: [config.origin.x, 0, config.origin.x, stage.height()],
    stroke: config.colors.axes,
    strokeWidth: config.styles.axisWidth,
    visible: false
  });
  
  // Add x and y axis labels
  const xLabel = new Konva.Text({
    x: stage.width() - 20,
    y: config.origin.y + 10,
    text: 'x',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'italic',
    fill: config.colors.labels,
    visible: false
  });
  
  const yLabel = new Konva.Text({
    x: config.origin.x - 20,
    y: 10,
    text: 'y',
    fontSize: config.styles.labelFontSize,
    fontStyle: 'italic',
    fill: config.colors.labels,
    visible: false
  });
  
  // Add origin point and label
  const { point: pointO, text: textO } = createPointWithLabel(
    config.origin,
    'O',
    config.colors.pointO,
    -20, // X offset
    10    // Y offset
  );
  
  // Create Ellipse C
  const ellipseC = new Konva.Ellipse({
    x: config.origin.x,
    y: config.origin.y,
    radiusX: config.ellipseC.a * config.scale,
    radiusY: config.ellipseC.b * config.scale,
    stroke: config.colors.ellipseC,
    strokeWidth: config.styles.ellipseWidth,
    dash: config.styles.ellipseDashC,
    visible: false
  });
  
  // Create Ellipse E
  const ellipseE = new Konva.Ellipse({
    x: config.origin.x,
    y: config.origin.y,
    radiusX: config.ellipseE.a * config.scale,
    radiusY: config.ellipseE.b * config.scale,
    stroke: config.colors.ellipseE,
    strokeWidth: config.styles.ellipseWidth,
    dash: config.styles.ellipseDashE,
    visible: false
  });
  
  // Create ellipse labels
  const labelC = new Konva.Text({
    x: config.origin.x + config.ellipseC.a * config.scale + 5,
    y: config.origin.y,
    text: 'C: x²/4 + y² = 1',
    fontSize: config.styles.labelFontSize - 2,
    fill: config.colors.ellipseC,
    visible: false
  });
  
  const labelE = new Konva.Text({
    x: config.origin.x + config.ellipseE.a * config.scale + 5,
    y: config.origin.y - 20,
    text: 'E: x²/16 + y²/4 = 1',
    fontSize: config.styles.labelFontSize - 2,
    fill: config.colors.ellipseE,
    visible: false
  });
  
  // Add additional explanation about the ellipses
  const ellipsesExplanation = new Konva.Text({
    x: config.origin.x,
    y: config.origin.y + config.ellipseE.b * config.scale + 30,
    text: 'Note: Ellipse E is exactly twice the size of ellipse C in both x and y dimensions',
    fontSize: config.styles.labelFontSize - 2,
    fill: '#333',
    align: 'center',
    width: 300,
    visible: false,
    opacity: 0
  });
  ellipsesExplanation.offsetX(ellipsesExplanation.width() / 2);
  
  // Add elements to the layer
  layer.add(xAxis, yAxis, xLabel, yLabel, ellipseC, ellipseE, labelC, labelE, ellipsesExplanation);
  
  // Store references
  elements.xAxis = xAxis;
  elements.yAxis = yAxis;
  elements.xLabel = xLabel;
  elements.yLabel = yLabel;
  elements.pointO = pointO;
  elements.textO = textO;
  elements.ellipseC = ellipseC;
  elements.ellipseE = ellipseE;
  elements.labelC = labelC;
  elements.labelE = labelE;
  elements.ellipsesExplanation = ellipsesExplanation;
  
  if (withAnimation) {
    // Animate axes appearing
    xAxis.visible(true);
    yAxis.visible(true);
    
    const axisTimeline = gsap.timeline();
    
    axisTimeline
      .fromTo(xAxis, { opacity: 0 }, { opacity: 1, duration: config.animDuration * 0.4 })
      .fromTo(yAxis, { opacity: 0 }, { opacity: 1, duration: config.animDuration * 0.4 }, "-=0.2")
      .to(xLabel, { visible: true, opacity: 1, duration: config.animDuration * 0.3 })
      .to(yLabel, { visible: true, opacity: 1, duration: config.animDuration * 0.3 }, "-=0.1")
      .then(() => {
        // Animate origin point
        animatePointAppearing(pointO, textO, config.animDuration * 0.4)
          .then(() => {
            // Animate ellipses
            animateEllipseDrawing(ellipseC, config.animDuration * 0.6)
              .then(() => {
                labelC.visible(true);
                gsap.to(labelC, { opacity: 1, duration: config.animDuration * 0.3 });
                
                // Show ellipse E after ellipse C
                animateEllipseDrawing(ellipseE, config.animDuration * 0.6, config.animDuration * 0.1)
                  .then(() => {
                    labelE.visible(true);
                    gsap.to(labelE, { opacity: 1, duration: config.animDuration * 0.3 });
                    
                    // Show the additional explanation
                    ellipsesExplanation.visible(true);
                    gsap.to(ellipsesExplanation, { 
                      opacity: 1, 
                      duration: config.animDuration * 0.5,
                      delay: config.animDuration * 0.3
                    });
                  });
              });
          });
      });
  } else {
    // No animation: just make everything visible
    [xAxis, yAxis, xLabel, yLabel, pointO, textO, ellipseC, ellipseE, labelC, labelE, ellipsesExplanation].forEach(el => {
      el.visible(true);
      el.opacity(1);
    });
    layer.batchDraw();
  }
}

// Step 2: Select a point P on ellipse C
function drawStep2(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(1, 'drawStep2')) return;
  
  // Idempotency Check
  if (elements.pointP && elements.textP) {
    console.log("Step 2 elements already exist. Skipping draw.");
    if (withAnimation) {
      showStepExplanation("Step 2: Select a point P on ellipse C", 0.1);
    }
    return;
  }
  console.log(`Executing Step 2 (Animate: ${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("Step 2: Select a point P on ellipse C");
  }
  
  // Calculate initial position for point P based on configured angle
  const angle = config.initialAngle;
  const px = config.origin.x + config.scale * config.ellipseC.a * Math.cos(angle);
  const py = config.origin.y - config.scale * config.ellipseC.b * Math.sin(angle);
  
  // Update config with the point P position
  config.pointP = { x: px, y: py };
  
  // Create point P and its label
  const { point: pointP, text: textP } = createPointWithLabel(
    config.pointP,
    'P',
    config.colors.pointP
  );
  
  // Add an explanation for point P
  const pointPExplanation = new Konva.Text({
    x: px + 25,
    y: py - 40,
    text: 'P is any point on ellipse C\nP = (2cos(θ), sin(θ))',
    fontSize: 14,
    fill: config.colors.pointP,
    visible: false,
    opacity: 0
  });
  layer.add(pointPExplanation);
  
  // Store references
  elements.pointP = pointP;
  elements.textP = textP;
  elements.pointPExplanation = pointPExplanation;
  
  if (withAnimation) {
    // Animate a "selection" of point P along the ellipse
    // Create a temporary indicator that travels along ellipse C
    const indicator = new Konva.Circle({
      x: config.origin.x + config.scale * config.ellipseC.a,
      y: config.origin.y,
      radius: config.styles.pointRadius + 2,
      stroke: config.colors.pointP,
      strokeWidth: 2,
      dash: [3, 3],
      opacity: 0.8
    });
    layer.add(indicator);
    
    // Animate the indicator traveling around part of the ellipse before stopping at P
    gsap.to({}, {
      duration: config.animDuration * 1.2,
      onUpdate: function() {
        const progress = this.progress();
        // Travel from 0 to the desired angle
        const currentAngle = progress * angle;
        const x = config.origin.x + config.scale * config.ellipseC.a * Math.cos(currentAngle);
        const y = config.origin.y - config.scale * config.ellipseC.b * Math.sin(currentAngle);
        indicator.x(x);
        indicator.y(y);
        layer.batchDraw();
      },
      onComplete: () => {
        // Fade out the indicator
        gsap.to(indicator, {
          opacity: 0,
          duration: config.animDuration * 0.3,
          onComplete: () => {
            indicator.destroy();
            // Animate point P appearing at the chosen position
            animatePointAppearing(pointP, textP, config.animDuration * 0.4)
              .then(() => {
                // Show the explanation
                pointPExplanation.visible(true);
                gsap.to(pointPExplanation, { 
                  opacity: 1, 
                  duration: config.animDuration * 0.5 
                });
              });
          }
        });
      }
    });
  } else {
    // No animation: make elements visible
    pointP.visible(true).opacity(1);
    textP.visible(true).opacity(1);
    pointPExplanation.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// Step 3: Draw ray OP and find intersection point Q with ellipse E
function drawStep3(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(2, 'drawStep3')) return;
  
  // Idempotency Check
  if (elements.rayOP && elements.pointQ) {
    console.log("Step 3 elements already exist. Skipping draw.");
    if (withAnimation) {
      showStepExplanation("Step 3: Draw ray OP and find its intersection Q with ellipse E", 0.1);
    }
    return;
  }
  console.log(`Executing Step 3 (Animate: ${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("Step 3: Draw ray OP and find its intersection Q with ellipse E");
  }
  
  // Get coordinates
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
  
  // For visual clarity, extend the ray slightly beyond Q
  const extendedQx = ox + 2.5 * rayVector.x;
  const extendedQy = oy + 2.5 * rayVector.y;
  
  // Create ray OP that extends to Q and beyond
  const rayOP = new Konva.Line({
    points: [ox, oy, extendedQx, extendedQy],
    stroke: config.colors.rayOP,
    strokeWidth: config.styles.rayWidth,
    visible: false
  });
  
  // Create point Q and its label
  const { point: pointQ, text: textQ } = createPointWithLabel(
    config.pointQ,
    'Q',
    config.colors.pointQ
  );
  
  // Add an explanation for ray OP and point Q
  const rayExplanation = new Konva.Text({
    x: (ox + px) / 2 + 20,
    y: (oy + py) / 2 - 30,
    text: 'Ray OP',
    fontSize: 14,
    fill: config.colors.rayOP,
    visible: false,
    opacity: 0
  });
  
  const pointQExplanation = new Konva.Text({
    x: qx + 25,
    y: qy - 40,
    text: 'Q is where ray OP intersects ellipse E\nQ = (4cos(θ), 2sin(θ)) = 2P',
    fontSize: 14,
    fill: config.colors.pointQ,
    visible: false,
    opacity: 0
  });
  
  // Add elements to the layer
  layer.add(rayOP, rayExplanation, pointQExplanation);
  
  // Store references
  elements.rayOP = rayOP;
  elements.pointQ = pointQ;
  elements.textQ = textQ;
  elements.rayExplanation = rayExplanation;
  elements.pointQExplanation = pointQExplanation;
  
  if (withAnimation) {
    // Animate drawing the ray
    animateDrawLine(rayOP, config.animDuration * 0.7)
      .then(() => {
        // Show ray explanation
        rayExplanation.visible(true);
        gsap.to(rayExplanation, { 
          opacity: 1, 
          duration: config.animDuration * 0.3 
        });
        
        // After ray is drawn, animate point Q appearing
        animatePointAppearing(pointQ, textQ, config.animDuration * 0.4, 0.1)
          .then(() => {
            // Show point Q explanation
            pointQExplanation.visible(true);
            gsap.to(pointQExplanation, { 
              opacity: 1, 
              duration: config.animDuration * 0.5 
            });
          });
      });
  } else {
    // No animation: make elements visible
    rayOP.visible(true).opacity(1);
    pointQ.visible(true).opacity(1);
    textQ.visible(true).opacity(1);
    rayExplanation.visible(true).opacity(1);
    pointQExplanation.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// Step 4: Calculate and display the ratio |OQ|/|OP|
function drawStep4(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(3, 'drawStep4')) return;
  
  // Idempotency Check - using ratio display instead of a specific element
  const ratioDisplay = document.getElementById('ratio-display');
  if (ratioDisplay && ratioDisplay.style.display === 'block') {
    console.log("Step 4 elements already exist. Skipping draw.");
    if (withAnimation) {
      showStepExplanation("Step 4: Calculate and display the ratio |OQ|/|OP|", 0.1);
    }
    return;
  }
  console.log(`Executing Step 4 (Animate: ${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("Step 4: Calculate and display the ratio |OQ|/|OP|");
  }
  
  // Get coordinates
  const ox = config.origin.x;
  const oy = config.origin.y;
  const px = config.pointP.x;
  const py = config.pointP.y;
  const qx = config.pointQ.x;
  const qy = config.pointQ.y;
  
  // Add explanation of the algebraic calculation
  const algebraicExplanation = new Konva.Text({
    x: config.origin.x,
    y: config.origin.y - config.ellipseE.b * config.scale - 80,
    text: 'For any point P on ellipse C, the ray OP intersects ellipse E\nat point Q where Q = 2P',
    fontSize: 16,
    fontStyle: 'bold',
    fill: config.colors.ratioHighlight,
    align: 'center',
    width: 400,
    visible: false,
    opacity: 0
  });
  algebraicExplanation.offsetX(algebraicExplanation.width() / 2);
  layer.add(algebraicExplanation);
  elements.algebraicExplanation = algebraicExplanation;
  
  if (withAnimation) {
    // Animate the calculation with visual indicators
    animateRatioCalculation(
      { x: ox, y: oy }, // Point O
      { x: px, y: py }, // Point P
      { x: qx, y: qy }  // Point Q
    ).then(() => {
      // Show the algebraic explanation
      algebraicExplanation.visible(true);
      gsap.to(algebraicExplanation, { 
        opacity: 1, 
        duration: config.animDuration * 0.5 
      });
    });
  } else {
    // Just display the ratio without animation
    const distOP = Math.sqrt(Math.pow(px - ox, 2) + Math.pow(py - oy, 2));
    const distOQ = Math.sqrt(Math.pow(qx - ox, 2) + Math.pow(qy - oy, 2));
    const ratio = distOQ / distOP;
    
    // Update HTML display
    const ratioDisplay = document.getElementById('ratio-display');
    const ratioValue = document.getElementById('ratio-value');
    
    if (ratioDisplay && ratioValue) {
      ratioValue.textContent = ratio.toFixed(2);
      ratioDisplay.style.display = 'block';
    }
    
    // Show the algebraic explanation
    algebraicExplanation.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// Step 5: Demonstrate that ratio |OQ|/|OP| = 2 is constant
function drawStep5(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(4, 'drawStep5')) return;
  
  console.log(`Executing Step 5 (Animate: ${withAnimation})`);
  
  if (withAnimation) {
    showStepExplanation("Step 5: Demonstrate that the ratio |OQ|/|OP| = 2 is constant for any point P on ellipse C");
  }
  
  // Add a final mathematical explanation
  const finalExplanation = new Konva.Text({
    x: config.origin.x,
    y: config.stageHeight - 50,
    text: 'This constant ratio of 2 occurs because ellipse E is exactly twice the size of ellipse C\nin both dimensions, relative to the origin O.',
    fontSize: 16,
    fontStyle: 'bold',
    fill: '#333',
    align: 'center',
    width: 500,
    visible: false,
    opacity: 0
  });
  finalExplanation.offsetX(finalExplanation.width() / 2);
  layer.add(finalExplanation);
  elements.finalExplanation = finalExplanation;
  
  // Hide the ratio display temporarily if we'll replace it with an animated proof
  if (withAnimation) {
    const ratioDisplay = document.getElementById('ratio-display');
    if (ratioDisplay) {
      // We'll show it again after the demonstration
      ratioDisplay.style.display = 'none';
    }
    
    // Animate demonstration that this ratio is constant
    demonstrateConstantRatio(config.animDuration)
      .then(() => {
        // Show final explanation
        finalExplanation.visible(true);
        gsap.to(finalExplanation, { 
          opacity: 1, 
          duration: config.animDuration * 0.5 
        });
        
        // After demonstration, enable dragging of point P
        makePointPDraggable();
        
        // Show the ratio display again
        if (ratioDisplay) {
          ratioDisplay.style.display = 'block';
        }
      });
  } else {
    // No animation: just make point P draggable
    finalExplanation.visible(true).opacity(1);
    makePointPDraggable();
    layer.batchDraw();
  }
}
