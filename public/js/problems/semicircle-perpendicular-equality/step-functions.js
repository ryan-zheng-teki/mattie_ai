/**
 * Step functions for the Semicircle Perpendicular Equality visualization
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

// Step 1: Draw semicircle with center O and diameter AB
function drawStep1(withAnimation = true) {
  // Idempotency Check: If step 1 elements already exist, do nothing.
  if (elements.semicircle && elements.pointO) {
    console.log("Step 1 elements already exist. Skipping draw.");
    // Show the explanation if animating
    if (withAnimation) {
      showStepExplanation("步骤1: 绘制以O为圆心的半圆，AB为直径", 0.1);
    }
    return;
  }
  console.log(`Executing Step 1 (Animate: ${withAnimation})`);
  
  // Calculate points based on config
  const center = config.origin;
  const radius = config.circleRadius;
  
  // Define points A, B, and O
  config.pointA = { x: center.x - radius, y: center.y };
  config.pointB = { x: center.x + radius, y: center.y };
  
  const O = center;
  const A = config.pointA;
  const B = config.pointB;
  
  if (withAnimation) {
    showStepExplanation("步骤1: 绘制以O为圆心的半圆，AB为直径");
  }
  
  // Create the diameter line AB
  const diameterLine = new Konva.Line({
    points: [A.x, A.y, B.x, B.y],
    stroke: config.colors.diameter,
    strokeWidth: config.styles.lineWidth,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(diameterLine);
  elements.diameterLine = diameterLine;
  
  // Create the semicircle
  const semicircle = new Konva.Arc({
    x: center.x,
    y: center.y,
    innerRadius: 0,
    outerRadius: radius,
    angle: 180,
    fill: '',
    stroke: config.colors.circle,
    strokeWidth: config.styles.lineWidth,
    rotation: 0,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(semicircle);
  elements.semicircle = semicircle;
  
  // Create points A, B, and O with labels
  const { point: pointA, text: textA } = createPointWithLabel(A, 'A', config.colors.pointA, -20, 10);
  const { point: pointB, text: textB } = createPointWithLabel(B, 'B', config.colors.pointB, 10, 10);
  const { point: pointO, text: textO } = createPointWithLabel(O, 'O', config.colors.pointO, 10, -20);
  
  // Store elements
  elements.pointA = pointA; elements.textA = textA;
  elements.pointB = pointB; elements.textB = textB;
  elements.pointO = pointO; elements.textO = textO;
  
  if (withAnimation) {
    // Animate the diameter appearing
    gsap.to(diameterLine, { opacity: 1, duration: config.animDuration * 0.5 });
    
    // Animate the center point appearing
    animatePointAppearing(pointO, textO, config.animDuration * 0.3)
      .then(() => {
        // Animate the points A and B appearing
        return Promise.all([
          animatePointAppearing(pointA, textA, config.animDuration * 0.3, 0.1),
          animatePointAppearing(pointB, textB, config.animDuration * 0.3, 0.2)
        ]);
      })
      .then(() => {
        // Animate the semicircle drawing
        return animateSemicircleDrawing(center, radius, 0, Math.PI, config.animDuration * 0.8);
      });
  } else {
    // No animation: just make everything visible
    diameterLine.opacity(1);
    semicircle.opacity(1);
    [pointO, pointA, pointB, textO, textA, textB].forEach(el => {
      el.visible(true);
      el.opacity(1);
      if (el instanceof Konva.Circle) {
        el.scaleX(1); el.scaleY(1);
      }
    });
    layer.batchDraw();
  }
}

// Step 2: Place points C and E on the semicircle
function drawStep2(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(1, 'drawStep2')) return;
  
  // Idempotency Check
  if (elements.pointC && elements.pointE) {
    console.log("Step 2 elements already exist. Skipping draw.");
    if (withAnimation) showStepExplanation("步骤2: 在半圆上取点C和E", 0.1);
    return;
  }
  console.log(`Executing Step 2 (Animate: ${withAnimation})`);
  
  const center = { x: elements.pointO.x(), y: elements.pointO.y() };
  const radius = config.circleRadius;
  
  // Calculate positions for points C and E on the semicircle
  config.pointC = {
    x: center.x + radius * Math.cos(config.angleC),
    y: center.y + radius * Math.sin(config.angleC)
  };
  
  config.pointE = {
    x: center.x + radius * Math.cos(config.angleE),
    y: center.y + radius * Math.sin(config.angleE)
  };
  
  const C = config.pointC;
  const E = config.pointE;
  
  if (withAnimation) {
    showStepExplanation("步骤2: 在半圆上取点C和E");
  }
  
  // Create points C and E with labels
  const { point: pointC, text: textC } = createPointWithLabel(C, 'C', config.colors.pointC, -20, -20);
  const { point: pointE, text: textE } = createPointWithLabel(E, 'E', config.colors.pointE, 10, -20);
  
  // Store elements
  elements.pointC = pointC; elements.textC = textC;
  elements.pointE = pointE; elements.textE = textE;
  
  if (withAnimation) {
    // Animate points C and E appearing
    animatePointAppearing(pointC, textC, config.animDuration * 0.4)
      .then(() => animatePointAppearing(pointE, textE, config.animDuration * 0.4, 0.1));
  } else {
    // No animation: just make everything visible
    [pointC, pointE, textC, textE].forEach(el => {
      el.visible(true);
      el.opacity(1);
      if (el instanceof Konva.Circle) {
        el.scaleX(1); el.scaleY(1);
      }
    });
    layer.batchDraw();
  }
}

// Step 3: Draw perpendiculars CD and EF to AB
function drawStep3(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(2, 'drawStep3')) return;
  
  // Idempotency Check
  if (elements.lineCD && elements.lineEF) {
    console.log("Step 3 elements already exist. Skipping draw.");
    if (withAnimation) showStepExplanation("步骤3: 作垂线CD⊥AB和EF⊥AB", 0.1);
    return;
  }
  console.log(`Executing Step 3 (Animate: ${withAnimation})`);
  
  const A = { x: elements.pointA.x(), y: elements.pointA.y() };
  const B = { x: elements.pointB.x(), y: elements.pointB.y() };
  const C = { x: elements.pointC.x(), y: elements.pointC.y() };
  const E = { x: elements.pointE.x(), y: elements.pointE.y() };
  
  // Calculate points D and F (perpendicular projections onto AB)
  const D = perpendicularPointToLine(C, A, B);
  const F = perpendicularPointToLine(E, A, B);
  
  // Store in config
  config.pointD = D;
  config.pointF = F;
  
  if (withAnimation) {
    showStepExplanation("步骤3: 作垂线CD⊥AB和EF⊥AB");
  }
  
  // Create lines CD and EF
  const lineCD = new Konva.Line({
    points: [C.x, C.y, D.x, D.y],
    stroke: config.colors.lineCD,
    strokeWidth: config.styles.lineWidth,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(lineCD);
  elements.lineCD = lineCD;
  
  const lineEF = new Konva.Line({
    points: [E.x, E.y, F.x, F.y],
    stroke: config.colors.lineEF,
    strokeWidth: config.styles.lineWidth,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(lineEF);
  elements.lineEF = lineEF;
  
  // Create points D and F with labels
  const { point: pointD, text: textD } = createPointWithLabel(D, 'D', config.colors.pointD, 10, 10);
  const { point: pointF, text: textF } = createPointWithLabel(F, 'F', config.colors.pointF, 10, 10);
  
  // Store elements
  elements.pointD = pointD; elements.textD = textD;
  elements.pointF = pointF; elements.textF = textF;
  
  // Create perpendicular symbols at D and F
  const perpSymbolD = drawPerpendicularSymbol(D);
  const perpSymbolF = drawPerpendicularSymbol(F);
  elements.perpSymbolD = perpSymbolD;
  elements.perpSymbolF = perpSymbolF;
  
  if (withAnimation) {
    // Animate perpendicular construction for CD
    animatePerpendicularConstruction(C, A, B, D, config.colors.lineCD, config.animDuration * 0.8)
      .then(() => {
        gsap.to(lineCD, { opacity: 1, duration: config.animDuration * 0.3 });
        animatePointAppearing(pointD, textD, config.animDuration * 0.3);
        perpSymbolD.visible(true);
        gsap.to(perpSymbolD, { opacity: 1, duration: config.animDuration * 0.3 });
        
        // Then animate perpendicular construction for EF
        return animatePerpendicularConstruction(E, A, B, F, config.colors.lineEF, config.animDuration * 0.8);
      })
      .then(() => {
        gsap.to(lineEF, { opacity: 1, duration: config.animDuration * 0.3 });
        animatePointAppearing(pointF, textF, config.animDuration * 0.3);
        perpSymbolF.visible(true);
        gsap.to(perpSymbolF, { opacity: 1, duration: config.animDuration * 0.3 });
      });
  } else {
    // No animation: just make everything visible
    lineCD.opacity(1);
    lineEF.opacity(1);
    [pointD, pointF, textD, textF].forEach(el => {
      el.visible(true);
      el.opacity(1);
      if (el instanceof Konva.Circle) {
        el.scaleX(1); el.scaleY(1);
      }
    });
    perpSymbolD.visible(true).opacity(1);
    perpSymbolF.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// Step 4: Draw CO and perpendicular EG to CO
function drawStep4(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(3, 'drawStep4')) return;
  
  // Idempotency Check
  if (elements.lineCO && elements.lineEG) {
    console.log("Step 4 elements already exist. Skipping draw.");
    if (withAnimation) showStepExplanation("步骤4: 连接CO并作垂线EG⊥CO", 0.1);
    return;
  }
  console.log(`Executing Step 4 (Animate: ${withAnimation})`);
  
  const C = { x: elements.pointC.x(), y: elements.pointC.y() };
  const O = { x: elements.pointO.x(), y: elements.pointO.y() };
  const E = { x: elements.pointE.x(), y: elements.pointE.y() };
  
  // Calculate point G (perpendicular from E to CO)
  // FIXED: Use correct perpendicular calculation to ensure G is on line CO
  const G = calculatePerpendicularPointOnLine(E, C, O);
  
  // Store in config
  config.pointG = G;
  
  if (withAnimation) {
    showStepExplanation("步骤4: 连接CO并作垂线EG⊥CO");
  }
  
  // Create line CO
  const lineCO = new Konva.Line({
    points: [C.x, C.y, O.x, O.y],
    stroke: config.colors.lineCO,
    strokeWidth: config.styles.lineWidth,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(lineCO);
  elements.lineCO = lineCO;
  
  // Create line EG
  const lineEG = new Konva.Line({
    points: [E.x, E.y, G.x, G.y],
    stroke: config.colors.lineEG,
    strokeWidth: config.styles.lineWidth,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(lineEG);
  elements.lineEG = lineEG;
  
  // Create point G with label
  const { point: pointG, text: textG } = createPointWithLabel(G, 'G', config.colors.pointG, 10, -20);
  
  // Store elements
  elements.pointG = pointG; elements.textG = textG;
  
  // Create perpendicular symbol at G
  const perpSymbolG = drawPerpendicularSymbol(G);
  elements.perpSymbolG = perpSymbolG;
  
  if (withAnimation) {
    // Animate line CO appearing
    gsap.to(lineCO, { opacity: 1, duration: config.animDuration * 0.5 });
    
    // Animate perpendicular construction for EG
    setTimeout(() => {
      animatePerpendicularConstruction(E, C, O, G, config.colors.lineEG, config.animDuration * 0.8)
        .then(() => {
          gsap.to(lineEG, { opacity: 1, duration: config.animDuration * 0.3 });
          animatePointAppearing(pointG, textG, config.animDuration * 0.3);
          perpSymbolG.visible(true);
          gsap.to(perpSymbolG, { opacity: 1, duration: config.animDuration * 0.3 });
        });
    }, config.animDuration * 500);
  } else {
    // No animation: just make everything visible
    lineCO.opacity(1);
    lineEG.opacity(1);
    [pointG, textG].forEach(el => {
      el.visible(true);
      el.opacity(1);
      if (el instanceof Konva.Circle) {
        el.scaleX(1); el.scaleY(1);
      }
    });
    perpSymbolG.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// FIXED: Corrected function to calculate the perpendicular point on line
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

// Step 5: Demonstrate the equality of CD and GF
function drawStep5(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(4, 'drawStep5')) return;
  
  // Idempotency Check
  if (elements.triangleCOD && elements.proofText1) {
    console.log("Step 5 elements already exist. Skipping draw.");
    if (withAnimation) showStepExplanation("步骤5: 证明CD = GF", 0.1);
    return;
  }
  console.log(`Executing Step 5 (Animate: ${withAnimation})`);
  
  const C = { x: elements.pointC.x(), y: elements.pointC.y() };
  const O = { x: elements.pointO.x(), y: elements.pointO.y() };
  const D = { x: elements.pointD.x(), y: elements.pointD.y() };
  const E = { x: elements.pointE.x(), y: elements.pointE.y() };
  const G = { x: elements.pointG.x(), y: elements.pointG.y() };
  const F = { x: elements.pointF.x(), y: elements.pointF.y() };
  
  if (withAnimation) {
    showStepExplanation("步骤5: 证明CD = GF");
  }
  
  // Create triangles for similarity highlight
  const triangleCOD = new Konva.Line({
    points: [C.x, C.y, O.x, O.y, D.x, D.y],
    closed: true,
    fill: config.colors.triangleCOD,
    stroke: config.colors.triangleCOD.replace('rgba', 'rgb').replace(/,[^,]*\)/, ')'),
    strokeWidth: 1.5,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(triangleCOD);
  elements.triangleCOD = triangleCOD;
  
  const triangleEGF = new Konva.Line({
    points: [E.x, E.y, G.x, G.y, F.x, F.y],
    closed: true,
    fill: config.colors.triangleEGF,
    stroke: config.colors.triangleEGF.replace('rgba', 'rgb').replace(/,[^,]*\)/, ')'),
    strokeWidth: 1.5,
    opacity: withAnimation ? 0 : 1
  });
  layer.add(triangleEGF);
  elements.triangleEGF = triangleEGF;
  
  // Positions for proof annotations
  const proofPos1 = { x: stage.width() / 2, y: 50 };
  const proofPos2 = { x: stage.width() / 2, y: 90 };
  
  if (withAnimation) {
    // Animate triangles appearing
    gsap.to(triangleCOD, { opacity: 1, duration: config.animDuration * 0.5 });
    gsap.to(triangleEGF, { opacity: 1, duration: config.animDuration * 0.5, delay: 0.2 });
    
    // Show first proof text after triangles
    showMathAnnotation('△COD ≅ △EGF (相似三角形)', proofPos1, config.animDuration * 0.5, 0.8)
      .then(p1 => {
        elements.proofText1 = p1;
        
        // Show second proof text
        return showMathAnnotation('∴ CD = GF (证毕)', proofPos2, config.animDuration * 0.5, 0.3);
      })
      .then(p2 => {
        elements.proofText2 = p2;
        
        // Animate length comparison
        setTimeout(() => {
          animateLengthComparison(C, D, G, F, config.animDuration * 1.5);
        }, config.animDuration * 500);
      });
      
    // OPTIONAL: Create a length text display that updates during interaction
    const lengthText = new Konva.Text({
      x: 20,
      y: stage.height() - 40,
      text: `CD = ${Math.round(distance(C, D))} = GF = ${Math.round(distance(G, F))}`,
      fontSize: 16,
      fill: config.colors.highlight,
      padding: 5,
      background: 'rgba(255, 255, 255, 0.8)',
      cornerRadius: 3,
      opacity: 0
    });
    layer.add(lengthText);
    elements.lengthText = lengthText;
    gsap.to(lengthText, { opacity: 1, duration: config.animDuration * 0.5, delay: 2.0 });
    
  } else {
    // No animation: just make everything visible
    triangleCOD.opacity(1);
    triangleEGF.opacity(1);
    
    // Create annotations directly
    showMathAnnotation('△COD ≅ △EGF (相似三角形)', proofPos1, 0, 0).then(p1 => { elements.proofText1 = p1; });
    showMathAnnotation('∴ CD = GF (证毕)', proofPos2, 0, 0).then(p2 => { elements.proofText2 = p2; });
    
    // Create length text display
    const lengthText = new Konva.Text({
      x: 20,
      y: stage.height() - 40,
      text: `CD = ${Math.round(distance(C, D))} = GF = ${Math.round(distance(G, F))}`,
      fontSize: 16,
      fill: config.colors.highlight,
      padding: 5,
      background: 'rgba(255, 255, 255, 0.8)',
      cornerRadius: 3
    });
    layer.add(lengthText);
    elements.lengthText = lengthText;
    
    layer.batchDraw();
  }
}
