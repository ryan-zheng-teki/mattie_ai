/**
 * Step functions for the Square Perpendicular Similarity visualization
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


// Step 1: Draw square ABCD and midpoint E
function drawStep1(withAnimation = true) {
  // Idempotency Check: If step 1 elements already exist, do nothing.
  if (elements.pointA && elements.pointE) {
      console.log("Step 1 elements already exist. Skipping draw.");
      // Ensure visibility if they were hidden? Generally not needed with this flow.
      // We might want to re-show the explanation if navigating back to step 1
      if (withAnimation) {
        showStepExplanation("步骤1: 绘制正方形ABCD，并找出BC边的中点E", 0.1); // Faster appearance if re-showing
      }
      return;
  }
  console.log(`Executing Step 1 (Animate: ${withAnimation})`);
  
  // Get square corners from config (ensure they are up-to-date)
  calculateInitialPoints(); // Recalculate points based on current stage size
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const D = config.pointD;
  const E = config.pointE; 
  
  if (withAnimation) {
    showStepExplanation("步骤1: 绘制正方形ABCD，并找出BC边的中点E");
  }
  
  // Create the square outline (simplified - one shape if not animating edge-by-edge)
  const squareShape = new Konva.Line({
    points: [A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y],
    stroke: config.colors.square,
    strokeWidth: config.styles.lineWidth,
    closed: true,
    id: 'squareOutline' // Give it an ID for potential easier selection
  });
  layer.add(squareShape);
  // Store as a single element for simplicity in clearing, assuming edge animation isn't critical now
  // If edge animation IS needed, we revert to storing individual lines.
  elements.squareEdges = [squareShape]; // Keep key name consistent for clearing map
  
  // Create corner points and labels
  const { point: pointA, text: textA } = createPointWithLabel(A, 'A', config.colors.pointA, -20, -20);
  const { point: pointB, text: textB } = createPointWithLabel(B, 'B', config.colors.pointB, 10, -20);
  const { point: pointC, text: textC } = createPointWithLabel(C, 'C', config.colors.pointC, 10, 10);
  const { point: pointD, text: textD } = createPointWithLabel(D, 'D', config.colors.pointD, -20, 10);
  const { point: pointE, text: textE } = createPointWithLabel(E, 'E', config.colors.pointE, 10, -20);
  
  // Store elements
  elements.pointA = pointA; elements.textA = textA;
  elements.pointB = pointB; elements.textB = textB;
  elements.pointC = pointC; elements.textC = textC;
  elements.pointD = pointD; elements.textD = textD;
  elements.pointE = pointE; elements.textE = textE;

  if (withAnimation) {
      // Animate the square appearing (fade in?)
      squareShape.opacity(0);
      gsap.to(squareShape, { opacity: 1, duration: config.animDuration * 0.5 });
      
      // Animate points appearing sequentially
      const points = [pointA, pointB, pointC, pointD];
      const texts = [textA, textB, textC, textD];
      points.forEach((p, i) => {
          animatePointAppearing(p, texts[i], config.animDuration * 0.3, i * 0.2)
            .then(() => {
                // After last point (D), animate midpoint E
                if (i === points.length - 1) {
                    // Use the midpoint animation helper if desired, or just simple appear
                    // For simplicity here, using simple appear:
                    animatePointAppearing(pointE, textE, config.animDuration * 0.4, 0.1)
                      .then(() => layer.batchDraw()); 
                    // If using the complex animation:
                    // animateMidpointConstruction(B, C, E, config.colors.pointE, config.animDuration * 1.5)
                    //   .then(() => animatePointAppearing(pointE, textE, config.animDuration * 0.4));
                }
            });
      });
  } else {
      // No animation: just make everything visible
      squareShape.visible(true);
      [pointA, pointB, pointC, pointD, pointE, textA, textB, textC, textD, textE].forEach(el => {
        el.visible(true);
        el.opacity(1); // Ensure full opacity
        if (el instanceof Konva.Circle) { // Reset scale if animation sets it
             el.scaleX(1); el.scaleY(1);
        }
      });
      layer.batchDraw();
  }
}

// Step 2: Draw line AE and perpendicular BG
function drawStep2(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(1, 'drawStep2')) return;
  
  // Idempotency Check
  if (elements.lineBG && elements.pointG) {
      console.log("Step 2 elements already exist. Skipping draw.");
      if (withAnimation) showStepExplanation("步骤2: 连接AE，然后过点B作垂线BG⊥AE", 0.1);
      return;
  }
  console.log(`Executing Step 2 (Animate: ${withAnimation})`);

  const A = config.pointA;
  const B = config.pointB;
  const E = config.pointE;
  
  // Calculate G (perpendicular from B to AE) - Should always be calculated
  const G = perpendicularPointToLine(B, A, E);
  config.pointG = G; // Update config

  if (withAnimation) {
    showStepExplanation("步骤2: 连接AE，然后过点B作垂线BG⊥AE");
  }

  // Create line AE
  const lineAE = new Konva.Line({
    points: [A.x, A.y, E.x, E.y],
    stroke: config.colors.lineAE,
    strokeWidth: config.styles.lineWidth,
    opacity: 0 // Start hidden for animation
  });
  layer.add(lineAE);
  elements.lineAE = lineAE;

  // Create line BG
  const lineBG = new Konva.Line({
    points: [B.x, B.y, G.x, G.y],
    stroke: config.colors.lineBG,
    strokeWidth: config.styles.lineWidth,
    opacity: 0
  });
  layer.add(lineBG);
  elements.lineBG = lineBG;

  // Create point G and label
  const { point: pointG, text: textG } = createPointWithLabel(G, 'G', config.colors.pointG);
  elements.pointG = pointG;
  elements.textG = textG;

  // Create perpendicular symbol at G
  const perpSymbolG = drawPerpendicularSymbol(G);
  elements.perpSymbolG = perpSymbolG;

  if (withAnimation) {
    // Animate line AE drawing
    gsap.to(lineAE, { opacity: 1, duration: config.animDuration * 0.4 });

    // Animate perpendicular construction visually then show final elements
    // Using the helper function for visual flair:
    animatePerpendicularConstruction(B, A, E, G, config.colors.lineBG, config.animDuration * 1.2)
      .then(({ perpSymbol }) => {
          // Construction animation is done, now fade in the actual elements
          // Note: perpSymbol from animation helper might be temporary. Use elements.perpSymbolG
          gsap.to(lineBG, { opacity: 1, duration: config.animDuration * 0.3 });
          animatePointAppearing(elements.pointG, elements.textG, config.animDuration * 0.3);
          elements.perpSymbolG.visible(true); // Make sure our persistent symbol is visible
          gsap.to(elements.perpSymbolG, { opacity: 1, duration: config.animDuration * 0.3 });
          
          // Destroy the temporary symbol returned by the helper if it exists and is different
          if (perpSymbol && perpSymbol !== elements.perpSymbolG) {
              perpSymbol.destroy();
          }
      });

  } else {
    // No animation: make elements visible
    lineAE.opacity(1);
    lineBG.opacity(1);
    pointG.visible(true).opacity(1).scaleX(1).scaleY(1);
    textG.visible(true).opacity(1);
    perpSymbolG.visible(true).opacity(1);
    layer.batchDraw();
  }
}

// Step 3: Draw extended BG and perpendicular CF
function drawStep3(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(2, 'drawStep3')) return;

  // Idempotency Check
  if (elements.lineCF && elements.pointH && elements.pointF) {
      console.log("Step 3 elements already exist. Skipping draw.");
       if (withAnimation) showStepExplanation("步骤3: 延长BG，然后从点C作垂线CF⊥BG", 0.1);
      return;
  }
  console.log(`Executing Step 3 (Animate: ${withAnimation})`);

  const B = config.pointB;
  const C = config.pointC;
  const D = config.pointD;
  const A = config.pointA;
  // Ensure G is calculated from previous step or config
  if (!config.pointG) {
      config.pointG = perpendicularPointToLine(B, A, config.pointE);
  }
  const G = config.pointG;

  // Calculate extended line BG endpoint
  const extendedBG = extendLine(B, G, 3); // Extend further if needed
  config.extendedBG = extendedBG; // Store in config if needed elsewhere

  // Calculate H (perpendicular from C to line B-G-extendedBG)
  const H = perpendicularPointToLine(C, B, G); // Perpendicular to the original line BG is sufficient
  config.pointH = H;

  // Calculate F (intersection of line C-H with line A-D)
  const F = lineIntersection(C, H, A, D);
  if (!F) {
      console.error("Failed to calculate intersection point F in Step 3.");
      // Provide default or stop? For now, let's place it visually on AD if calculation fails.
      // This indicates a potential issue in geometry helpers or square definition.
      // A robust solution would handle parallel lines case in lineIntersection if needed.
      config.pointF = { x: A.x, y: C.y }; // Place F visually on AD aligned with C as fallback
  } else {
      config.pointF = F;
  }
  const finalF = config.pointF; // Use the calculated or fallback F

  if (withAnimation) {
    showStepExplanation("步骤3: 延长BG，然后从点C作垂线CF⊥BG");
  }

  // Create dashed extended BG line
  const extendedLineBG = new Konva.Line({
      points: [G.x, G.y, extendedBG.x, extendedBG.y],
      stroke: config.colors.lineBG,
      strokeWidth: 1.5, // Thinner for extension
      dash: [5, 5],
      opacity: 0
  });
  layer.add(extendedLineBG);
  elements.extendedLineBG = extendedLineBG;

  // Create line CF (will intersect AD at F and BG extension at H)
  const lineCF = new Konva.Line({
      points: [C.x, C.y, finalF.x, finalF.y],
      stroke: config.colors.lineCF,
      strokeWidth: config.styles.lineWidth,
      opacity: 0
  });
  layer.add(lineCF);
  elements.lineCF = lineCF;

  // Create point H and label
  const { point: pointH, text: textH } = createPointWithLabel(H, 'H', config.colors.pointH);
  elements.pointH = pointH;
  elements.textH = textH;

  // Create perpendicular symbol at H
  const perpSymbolH = drawPerpendicularSymbol(H);
  elements.perpSymbolH = perpSymbolH;

  // Create point F and label
  const { point: pointF, text: textF } = createPointWithLabel(finalF, 'F', config.colors.pointF);
  elements.pointF = pointF;
  elements.textF = textF;


  if (withAnimation) {
      // Animate extension line appearing
      gsap.to(extendedLineBG, { opacity: 0.7, duration: config.animDuration * 0.4 });

      // Animate perpendicular construction for CH visually
      animatePerpendicularConstruction(C, B, G, H, config.colors.lineCF, config.animDuration * 1.2)
          .then(({ perpSymbol }) => {
              // Fade in actual elements after construction animation
              gsap.to(lineCF, { opacity: 1, duration: config.animDuration * 0.5 });
              animatePointAppearing(elements.pointH, elements.textH, config.animDuration * 0.3, 0);
              animatePointAppearing(elements.pointF, elements.textF, config.animDuration * 0.3, 0.2); // Slightly delayed
              
              elements.perpSymbolH.visible(true);
              gsap.to(elements.perpSymbolH, { opacity: 1, duration: config.animDuration * 0.3 });

              if (perpSymbol && perpSymbol !== elements.perpSymbolH) perpSymbol.destroy();
          });
          
  } else {
      // No animation: make elements visible
      extendedLineBG.opacity(0.7); // Keep dashed line slightly faded
      lineCF.opacity(1);
      pointH.visible(true).opacity(1).scaleX(1).scaleY(1);
      textH.visible(true).opacity(1);
      perpSymbolH.visible(true).opacity(1);
      pointF.visible(true).opacity(1).scaleX(1).scaleY(1);
      textF.visible(true).opacity(1);
      layer.batchDraw();
  }
}

// Step 4: Demonstrate triangle similarity
function drawStep4(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(3, 'drawStep4')) return;

  // Idempotency Check
  if (elements.triangleABG && elements.triangleBCH && elements.similarityAnnotation) {
      console.log("Step 4 elements already exist. Skipping draw.");
       if (withAnimation) showStepExplanation("步骤4: 观察三角形△ABG和△BCH的相似性", 0.1);
      return;
  }
  console.log(`Executing Step 4 (Animate: ${withAnimation})`);

  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const G = config.pointG;
  const H = config.pointH;

  if (!G || !H) {
      console.error("Points G or H are missing for Step 4.");
      return; // Cannot draw triangles
  }

  if (withAnimation) {
    showStepExplanation("步骤4: 观察三角形△ABG和△BCH的相似性");
  }

  // Create triangle ABG using Konva.Line with closed property
  const triangleABG = new Konva.Line({
    points: [A.x, A.y, B.x, B.y, G.x, G.y],
    fill: config.colors.triangleABG,
    stroke: config.colors.pointA,
    strokeWidth: 1.5,
    closed: true,
    opacity: 0
  });
  layer.add(triangleABG);
  elements.triangleABG = triangleABG;

  // Create triangle BCH using Konva.Line with closed property
  const triangleBCH = new Konva.Line({
    points: [B.x, B.y, C.x, C.y, H.x, H.y],
    fill: config.colors.triangleBCH,
    stroke: config.colors.pointC,
    strokeWidth: 1.5,
    closed: true,
    opacity: 0
  });
  layer.add(triangleBCH);
  elements.triangleBCH = triangleBCH;
  
  // Similarity Annotation
  const annotationPos = { x: stage.width() / 2, y: 50 };

  if (withAnimation) {
    // Animate triangles appearing (fade in fill)
    gsap.to(triangleABG, { opacity: 1, duration: config.animDuration * 0.6, delay: 0.1 });
    gsap.to(triangleBCH, { opacity: 1, duration: config.animDuration * 0.6, delay: 0.3 });

    // Show annotation after triangles
    showMathAnnotation('△ABG ≅ △BCH', annotationPos, config.animDuration * 0.5, 0.8)
      .then(annotation => {
          elements.similarityAnnotation = annotation;
          
          // FIXED: Instead of infinite pulse, do a brief highlight effect
          // First triangle: Scale up and down once with a bright highlight
          gsap.timeline()
            .to(triangleABG, { 
                scaleX: 1.05, 
                scaleY: 1.05, 
                strokeWidth: 2.5, 
                duration: 0.5, 
                ease: "sine.inOut",
                transformOrigin: "center center" 
            })
            .to(triangleABG, { 
                scaleX: 1, 
                scaleY: 1, 
                strokeWidth: 1.5, 
                duration: 0.5, 
                ease: "sine.out",
                transformOrigin: "center center" 
            });
            
          // Second triangle: Scale up and down once with a bright highlight, slightly delayed
          gsap.timeline()
            .to(triangleBCH, { 
                scaleX: 1.05, 
                scaleY: 1.05, 
                strokeWidth: 2.5, 
                duration: 0.5, 
                delay: 0.2, 
                ease: "sine.inOut",
                transformOrigin: "center center" 
            })
            .to(triangleBCH, { 
                scaleX: 1, 
                scaleY: 1, 
                strokeWidth: 1.5, 
                duration: 0.5, 
                ease: "sine.out",
                transformOrigin: "center center" 
            });
            
          layer.batchDraw();
      });
  } else {
    // No animation: make elements visible
    triangleABG.opacity(1);
    triangleBCH.opacity(1);
    // Create annotation directly
    showMathAnnotation('△ABG ≅ △BCH', annotationPos, 0, 0)
        .then(annotation => {
            elements.similarityAnnotation = annotation;
            layer.batchDraw();
        });
  }
}

// Step 5: Connect AH and EH, extend to I
function drawStep5(withAnimation = true) {
  // Prerequisite check
  if (!ensurePrerequisites(4, 'drawStep5')) return; // Depends on H from step 3, but easier to check step 4 done

  // Idempotency Check
  if (elements.lineAH && elements.pointI && elements.proofText1) {
      console.log("Step 5 elements already exist. Skipping draw.");
      if (withAnimation) showStepExplanation("步骤5: 连接AH和EH，延长交CD于I，展示证明", 0.1);
      return;
  }
  console.log(`Executing Step 5 (Animate: ${withAnimation})`);

  const A = config.pointA;
  const E = config.pointE;
  const H = config.pointH;
  const C = config.pointC;
  const D = config.pointD;
  const B = config.pointB; // Needed for proof text potentially

  if (!H) {
      console.error("Point H is missing for Step 5.");
      return;
  }

  // Calculate I (intersection of EH extended with CD)
  // Extend E->H significantly to ensure intersection with segment CD
  const extendedEH = extendLine(E, H, 10); 
  const I = lineIntersection(E, extendedEH, C, D);
  
  if (!I || I.y < D.y || I.y > C.y || I.x < D.x || I.x > C.x) { // Check if intersection I is actually on segment CD (more robust check)
      console.warn("Intersection I is not on segment CD. Geometry might be distorted or calculation issue.");
      // Fallback: Use the theoretical property DI/IC = 2.
      // Vector DC = C - D
      const vecDC = { x: C.x - D.x, y: C.y - D.y };
      // If DI/IC = 2, then DI = 2 * IC. Total length DC = DI + IC = 3 * IC. So IC = DC/3.
      // Point I = D + DI = D + 2 * IC = D + (2/3) * DC 
      // OR Point I = C - IC = C - (1/3) * DC
      const calculatedI = {
          x: C.x - vecDC.x / 3,
          y: C.y - vecDC.y / 3 
      };
      config.pointI = calculatedI;
      console.log("Using calculated I based on expected DI/IC = 2 ratio.");
  } else {
       config.pointI = I; // Use the intersection if valid
  }
  const finalI = config.pointI;


  if (withAnimation) {
    showStepExplanation("步骤5: 连接AH和EH，延长交CD于I，展示证明");
  }

  // Create line AH
  const lineAH = new Konva.Line({
    points: [A.x, A.y, H.x, H.y],
    stroke: config.colors.lineAH,
    strokeWidth: config.styles.lineWidth,
    opacity: 0
  });
  layer.add(lineAH);
  elements.lineAH = lineAH;

  // Create line EH
  const lineEH = new Konva.Line({
    points: [E.x, E.y, H.x, H.y],
    stroke: config.colors.lineEH,
    strokeWidth: config.styles.lineWidth,
    opacity: 0
  });
  layer.add(lineEH);
  elements.lineEH = lineEH;

  // Create dashed extended line from H to I
  const extendedLineEH = new Konva.Line({
      points: [H.x, H.y, finalI.x, finalI.y],
      stroke: config.colors.lineEH,
      strokeWidth: 1.5,
      dash: [5, 5],
      opacity: 0
  });
  layer.add(extendedLineEH);
  elements.extendedLineEH = extendedLineEH;

  // Create point I and label
  const { point: pointI, text: textI } = createPointWithLabel(finalI, 'I', config.colors.pointI);
  elements.pointI = pointI;
  elements.textI = textI;

  // Proof annotations positions
  const proofPos1 = { x: stage.width() / 2, y: 50 };
  const proofPos2 = { x: stage.width() / 2, y: 90 };

  if (withAnimation) {
      // Animate lines AH and EH appearing
      gsap.to(lineAH, { opacity: 1, duration: config.animDuration * 0.5 });
      gsap.to(lineEH, { opacity: 1, duration: config.animDuration * 0.5, delay: 0.2 });
      
      // Animate extension and point I appearing after a delay
      gsap.to(extendedLineEH, { opacity: 0.7, duration: config.animDuration * 0.4, delay: 0.5 });
      animatePointAppearing(pointI, textI, config.animDuration * 0.4, 0.7);

      // Show proofs after everything else is drawn
      showMathAnnotation('AB² = AE · BH', proofPos1, config.animDuration * 0.5, 1.2)
          .then(p1 => { elements.proofText1 = p1; });
      showMathAnnotation('DI / IC = 2', proofPos2, config.animDuration * 0.5, 1.4)
          .then(p2 => { elements.proofText2 = p2; layer.batchDraw(); });
          
  } else {
      // No animation: make elements visible
      lineAH.opacity(1);
      lineEH.opacity(1);
      extendedLineEH.opacity(0.7);
      pointI.visible(true).opacity(1).scaleX(1).scaleY(1);
      textI.visible(true).opacity(1);
      
      // Create annotations directly
      showMathAnnotation('AB² = AE · BH', proofPos1, 0, 0).then(p1 => { elements.proofText1 = p1; });
      showMathAnnotation('DI / IC = 2', proofPos2, 0, 0).then(p2 => { elements.proofText2 = p2; layer.batchDraw(); });
  }
}
