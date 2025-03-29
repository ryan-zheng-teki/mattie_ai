/**
 * Step functions for the Square Perpendicular Similarity visualization
 */

// Step 1: Draw square ABCD and midpoint E
function drawStep1(withAnimation = true) {
  console.log("Executing Step 1: Drawing square ABCD and midpoint E");
  
  // Get square corners from config
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const D = config.pointD;
  const E = config.pointE; // Midpoint of BC
  
  // Show step explanation
  if (withAnimation) {
    showStepExplanation("步骤1: 绘制正方形ABCD，并找出BC边的中点E");
  }
  
  // Draw the square directly (skipping animation for speed when chaining steps)
  if (!withAnimation) {
    // Create the square outline directly
    const squareLines = new Konva.Line({
      points: [A.x, A.y, B.x, B.y, C.x, C.y, D.x, D.y, A.x, A.y],
      stroke: config.colors.square,
      strokeWidth: config.styles.lineWidth,
      closed: true
    });
    layer.add(squareLines);
    elements.squareEdges = [squareLines];
    
    // Create corner points all at once
    const pointA = new Konva.Circle({
      x: A.x,
      y: A.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointA
    });
    
    const pointB = new Konva.Circle({
      x: B.x,
      y: B.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointB
    });
    
    const pointC = new Konva.Circle({
      x: C.x,
      y: C.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointC
    });
    
    const pointD = new Konva.Circle({
      x: D.x,
      y: D.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointD
    });
    
    // Create labels
    const textA = new Konva.Text({
      x: A.x - 20,
      y: A.y - 20,
      text: 'A',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    const textB = new Konva.Text({
      x: B.x + 10,
      y: B.y - 20,
      text: 'B',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    const textC = new Konva.Text({
      x: C.x + 10,
      y: C.y + 10,
      text: 'C',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    const textD = new Konva.Text({
      x: D.x - 20,
      y: D.y + 10,
      text: 'D',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    // Create point E (midpoint of BC)
    const pointE = new Konva.Circle({
      x: E.x,
      y: E.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointE
    });
    
    // Create label for E
    const textE = new Konva.Text({
      x: E.x + 10,
      y: E.y - 20,
      text: 'E',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    // Add all elements to layer
    layer.add(pointA, pointB, pointC, pointD, pointE);
    layer.add(textA, textB, textC, textD, textE);
    
    // Store elements for later reference
    elements.pointA = pointA;
    elements.pointB = pointB;
    elements.pointC = pointC;
    elements.pointD = pointD;
    elements.pointE = pointE;
    elements.textA = textA;
    elements.textB = textB;
    elements.textC = textC;
    elements.textD = textD;
    elements.textE = textE;
    
    layer.batchDraw();
    return;
  }
  
  // If we want animation, use the original animated approach
  // Create square edges as separate lines for animation
  const lineAB = new Konva.Line({
    points: [A.x, A.y, A.x, A.y],
    stroke: config.colors.square,
    strokeWidth: config.styles.lineWidth
  });
  
  const lineBC = new Konva.Line({
    points: [B.x, B.y, B.x, B.y],
    stroke: config.colors.square,
    strokeWidth: config.styles.lineWidth
  });
  
  const lineCD = new Konva.Line({
    points: [C.x, C.y, C.x, C.y],
    stroke: config.colors.square,
    strokeWidth: config.styles.lineWidth
  });
  
  const lineDA = new Konva.Line({
    points: [D.x, D.y, D.x, D.y],
    stroke: config.colors.square,
    strokeWidth: config.styles.lineWidth
  });
  
  layer.add(lineAB, lineBC, lineCD, lineDA);
  elements.squareEdges = [lineAB, lineBC, lineCD, lineDA];
  
  // Animate each edge sequentially
  const edgeDuration = config.animDuration * 0.3;
  const edgeDelay = edgeDuration * 0.8;
  
  // Animate AB
  gsap.to({}, {
    duration: edgeDuration,
    onUpdate: function() {
      const progress = this.progress();
      const x = A.x + (B.x - A.x) * progress;
      const y = A.y + (B.y - A.y) * progress;
      lineAB.points([A.x, A.y, x, y]);
      layer.batchDraw();
    }
  });
  
  // Animate BC
  gsap.to({}, {
    duration: edgeDuration,
    delay: edgeDelay,
    onUpdate: function() {
      const progress = this.progress();
      const x = B.x + (C.x - B.x) * progress;
      const y = B.y + (C.y - B.y) * progress;
      lineBC.points([B.x, B.y, x, y]);
      layer.batchDraw();
    }
  });
  
  // Animate CD
  gsap.to({}, {
    duration: edgeDuration,
    delay: edgeDelay * 2,
    onUpdate: function() {
      const progress = this.progress();
      const x = C.x + (D.x - C.x) * progress;
      const y = C.y + (D.y - C.y) * progress;
      lineCD.points([C.x, C.y, x, y]);
      layer.batchDraw();
    }
  });
  
  // Animate DA
  gsap.to({}, {
    duration: edgeDuration,
    delay: edgeDelay * 3,
    onUpdate: function() {
      const progress = this.progress();
      const x = D.x + (A.x - D.x) * progress;
      const y = D.y + (A.y - D.y) * progress;
      lineDA.points([D.x, D.y, x, y]);
      layer.batchDraw();
    },
    onComplete: function() {
      // After square is drawn, show points
      createCornerPoints();
    }
  });
  
  // Function to create and animate corner points
  function createCornerPoints() {
    // Create points
    const pointA = new Konva.Circle({
      x: A.x,
      y: A.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointA,
      visible: false,
      opacity: 0,
      scale: { x: 0, y: 0 }
    });
    
    const pointB = new Konva.Circle({
      x: B.x,
      y: B.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointB,
      visible: false,
      opacity: 0,
      scale: { x: 0, y: 0 }
    });
    
    const pointC = new Konva.Circle({
      x: C.x,
      y: C.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointC,
      visible: false,
      opacity: 0,
      scale: { x: 0, y: 0 }
    });
    
    const pointD = new Konva.Circle({
      x: D.x,
      y: D.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointD,
      visible: false,
      opacity: 0,
      scale: { x: 0, y: 0 }
    });
    
    // Create labels
    const textA = new Konva.Text({
      x: A.x - 20,
      y: A.y - 20,
      text: 'A',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels,
      visible: false,
      opacity: 0
    });
    
    const textB = new Konva.Text({
      x: B.x + 10,
      y: B.y - 20,
      text: 'B',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels,
      visible: false,
      opacity: 0
    });
    
    const textC = new Konva.Text({
      x: C.x + 10,
      y: C.y + 10,
      text: 'C',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels,
      visible: false,
      opacity: 0
    });
    
    const textD = new Konva.Text({
      x: D.x - 20,
      y: D.y + 10,
      text: 'D',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels,
      visible: false,
      opacity: 0
    });
    
    // Add to layer
    layer.add(pointA, pointB, pointC, pointD);
    layer.add(textA, textB, textC, textD);
    
    // Store elements
    elements.pointA = pointA;
    elements.pointB = pointB;
    elements.pointC = pointC;
    elements.pointD = pointD;
    elements.textA = textA;
    elements.textB = textB;
    elements.textC = textC;
    elements.textD = textD;
    
    // Animate point A
    animatePoint(pointA, textA, 0);
    
    // Animate point B
    animatePoint(pointB, textB, 0.2);
    
    // Animate point C
    animatePoint(pointC, textC, 0.4);
    
    // Animate point D
    animatePoint(pointD, textD, 0.6, function() {
      // After all corner points are shown, find midpoint E
      showStepExplanation("找出BC边的中点E");
      
      // Show midpoint E construction
      setTimeout(findMidpointE, 500);
    });
  }
  
  function animatePoint(point, label, delay, onComplete) {
    point.visible(true);
    gsap.to(point, {
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      duration: config.animDuration * 0.3,
      delay: delay,
      ease: "back.out(1.7)",
      onComplete: function() {
        label.visible(true);
        gsap.to(label, {
          opacity: 1,
          duration: config.animDuration * 0.2,
          onComplete: onComplete
        });
      }
    });
  }
  
  function findMidpointE() {
    // Create a dashed line from B to C
    const dashedBC = new Konva.Line({
      points: [B.x, B.y, C.x, C.y],
      stroke: config.colors.pointE,
      strokeWidth: 1.5,
      dash: [5, 5],
      opacity: 0
    });
    layer.add(dashedBC);
    
    // Animate dashed line
    gsap.to(dashedBC, {
      opacity: 0.7,
      duration: config.animDuration * 0.3,
      onComplete: function() {
        // Show midpoint calculation
        const pointE = new Konva.Circle({
          x: E.x,
          y: E.y,
          radius: config.styles.pointRadius,
          fill: config.colors.pointE,
          visible: false,
          opacity: 0,
          scale: { x: 0, y: 0 }
        });
        
        const textE = new Konva.Text({
          x: E.x + 10,
          y: E.y - 20,
          text: 'E',
          fontSize: config.styles.labelFontSize,
          fontStyle: 'bold',
          fill: config.colors.labels,
          visible: false,
          opacity: 0
        });
        
        layer.add(pointE, textE);
        elements.pointE = pointE;
        elements.textE = textE;
        
        // Create highlight effect for midpoint
        const highlight = new Konva.Circle({
          x: E.x,
          y: E.y,
          radius: 15,
          fill: config.colors.pointE,
          opacity: 0.3
        });
        layer.add(highlight);
        
        // Animate highlight
        gsap.to(highlight, {
          radius: 25,
          opacity: 0,
          duration: config.animDuration * 0.6,
          ease: "power2.out",
          onComplete: function() {
            highlight.destroy();
            
            // Show point E
            animatePoint(pointE, textE, 0, function() {
              // Fade out dashed line
              gsap.to(dashedBC, {
                opacity: 0,
                duration: config.animDuration * 0.3,
                onComplete: function() {
                  dashedBC.destroy();
                  
                  // Final explanation
                  showStepExplanation("正方形ABCD已绘制完成，E是BC的中点");
                  layer.batchDraw();
                }
              });
            });
          }
        });
      }
    });
  }
  
  layer.batchDraw();
}

// Step 2: Draw line AE and perpendicular BG
function drawStep2(withAnimation = true) {
  console.log("Executing Step 2: Drawing perpendicular BG to AE");
  
  // Get points from config
  const A = config.pointA;
  const B = config.pointB;
  const E = config.pointE;
  
  // Show step explanation
  if (withAnimation) {
    showStepExplanation("步骤2: 连接AE，然后过点B作垂线BG⊥AE");
  }
  
  // Draw line AE
  if (!withAnimation) {
    // Create line AE directly
    const lineAE = new Konva.Line({
      points: [A.x, A.y, E.x, E.y],
      stroke: config.colors.lineAE,
      strokeWidth: config.styles.lineWidth
    });
    layer.add(lineAE);
    elements.lineAE = lineAE;
    
    // Calculate G (perpendicular from B to AE)
    const G = perpendicularPointToLine(B, A, E);
    config.pointG = G;
    
    // Create perpendicular symbol at G
    const perpSymbolG = new Konva.Line({
      points: [
        G.x - 7, G.y - 7,
        G.x - 7, G.y + 7,
        G.x + 7, G.y + 7
      ],
      stroke: config.colors.labels,
      strokeWidth: 2
    });
    layer.add(perpSymbolG);
    elements.perpSymbolG = perpSymbolG;
    
    // Create line BG
    const lineBG = new Konva.Line({
      points: [B.x, B.y, G.x, G.y],
      stroke: config.colors.lineBG,
      strokeWidth: config.styles.lineWidth
    });
    layer.add(lineBG);
    elements.lineBG = lineBG;
    
    // Create point G
    const pointG = new Konva.Circle({
      x: G.x,
      y: G.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointG
    });
    
    // Create label for G
    const textG = new Konva.Text({
      x: G.x + 10,
      y: G.y - 20,
      text: 'G',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    layer.add(pointG, textG);
    elements.pointG = pointG;
    elements.textG = textG;
    
    layer.batchDraw();
    return;
  }
  
  // Otherwise, do the animated version
  // Create line AE
  const lineAE = new Konva.Line({
    points: [A.x, A.y, A.x, A.y],
    stroke: config.colors.lineAE,
    strokeWidth: config.styles.lineWidth
  });
  layer.add(lineAE);
  elements.lineAE = lineAE;
  
  // Animate drawing line AE
  gsap.to({}, {
    duration: config.animDuration * 0.7,
    onUpdate: function() {
      const progress = this.progress();
      const x = A.x + (E.x - A.x) * progress;
      const y = A.y + (E.y - A.y) * progress;
      lineAE.points([A.x, A.y, x, y]);
      layer.batchDraw();
    },
    onComplete: function() {
      // After line AE is drawn, show perpendicular BG
      setTimeout(function() {
        showStepExplanation("从点B作垂线BG⊥AE");
        createPerpendicularBG();
      }, 500);
    }
  });
  
  function createPerpendicularBG() {
    // Calculate G (perpendicular from B to AE)
    const G = perpendicularPointToLine(B, A, E);
    config.pointG = G;
    
    // Create a temporary visual indicator
    const constructionCircle = new Konva.Circle({
      x: B.x,
      y: B.y,
      radius: 20,
      stroke: config.colors.helperLines,
      strokeWidth: 1,
      dash: [2, 2],
      opacity: 0
    });
    
    const constructionLine = new Konva.Line({
      points: [B.x, B.y, B.x, B.y],
      stroke: config.colors.lineBG,
      strokeWidth: 1.5,
      dash: [5, 5],
      opacity: 0
    });
    
    layer.add(constructionCircle, constructionLine);
    
    // Animate the perpendicular construction
    gsap.to(constructionCircle, {
      opacity: 0.4,
      radius: 30,
      duration: config.animDuration * 0.3,
      onComplete: function() {
        gsap.to(constructionLine, {
          opacity: 0.7,
          duration: config.animDuration * 0.2,
          onComplete: function() {
            // Animate the line drawing
            gsap.to({}, {
              duration: config.animDuration * 0.5,
              onUpdate: function() {
                const progress = this.progress();
                const x = B.x + (G.x - B.x) * progress;
                const y = B.y + (G.y - B.y) * progress;
                
                constructionLine.points([B.x, B.y, x, y]);
                layer.batchDraw();
              },
              onComplete: function() {
                // Create perpendicular symbol at G
                const perpSymbolG = new Konva.Line({
                  points: [
                    G.x - 7, G.y - 7,
                    G.x - 7, G.y + 7,
                    G.x + 7, G.y + 7
                  ],
                  stroke: config.colors.labels,
                  strokeWidth: 2,
                  opacity: 0
                });
                layer.add(perpSymbolG);
                elements.perpSymbolG = perpSymbolG;
                
                // Show perpendicular symbol
                gsap.to(perpSymbolG, {
                  opacity: 1,
                  duration: config.animDuration * 0.3
                });
                
                // Fade out construction elements
                gsap.to([constructionCircle, constructionLine], {
                  opacity: 0,
                  duration: config.animDuration * 0.3,
                  onComplete: function() {
                    constructionCircle.destroy();
                    constructionLine.destroy();
                    
                    // Create permanent line BG
                    const lineBG = new Konva.Line({
                      points: [B.x, B.y, G.x, G.y],
                      stroke: config.colors.lineBG,
                      strokeWidth: config.styles.lineWidth,
                      opacity: 0
                    });
                    layer.add(lineBG);
                    elements.lineBG = lineBG;
                    
                    // Animate the line appearance
                    gsap.to(lineBG, {
                      opacity: 1,
                      duration: config.animDuration * 0.3,
                      onComplete: function() {
                        // Create and show point G
                        const pointG = new Konva.Circle({
                          x: G.x,
                          y: G.y,
                          radius: config.styles.pointRadius,
                          fill: config.colors.pointG,
                          visible: false,
                          opacity: 0,
                          scale: { x: 0, y: 0 }
                        });
                        
                        const textG = new Konva.Text({
                          x: G.x + 10,
                          y: G.y - 20,
                          text: 'G',
                          fontSize: config.styles.labelFontSize,
                          fontStyle: 'bold',
                          fill: config.colors.labels,
                          visible: false,
                          opacity: 0
                        });
                        
                        layer.add(pointG, textG);
                        elements.pointG = pointG;
                        elements.textG = textG;
                        
                        // Animate point G appearance
                        pointG.visible(true);
                        gsap.to(pointG, {
                          opacity: 1,
                          scaleX: 1,
                          scaleY: 1,
                          duration: config.animDuration * 0.3,
                          ease: "back.out(1.7)",
                          onComplete: function() {
                            textG.visible(true);
                            gsap.to(textG, {
                              opacity: 1,
                              duration: config.animDuration * 0.2,
                              onComplete: function() {
                                // Final explanation
                                showStepExplanation("已从点B作垂线BG⊥AE于点G");
                                layer.batchDraw();
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          }
        });
      }
    });
  }
  
  layer.batchDraw();
}

// Step 3: Draw extended BG and perpendicular CF
function drawStep3(withAnimation = true) {
  console.log("Executing Step 3: Drawing perpendicular CF");
  
  // Get points from config
  const B = config.pointB;
  const C = config.pointC;
  const G = config.pointG;
  const A = config.pointA;
  const D = config.pointD;
  
  // Show step explanation
  if (withAnimation) {
    showStepExplanation("步骤3: 延长BG，然后从点C作垂线CF⊥BG");
  }
  
  // Calculate extended line BG
  const extendedBG = extendLine(B, G);
  config.extendedBG = extendedBG;
  
  if (!withAnimation) {
    // Create extended BG line directly
    const extendedLineBG = new Konva.Line({
      points: [G.x, G.y, extendedBG.x, extendedBG.y],
      stroke: config.colors.lineBG,
      strokeWidth: config.styles.lineWidth,
      dash: [5, 5]
    });
    layer.add(extendedLineBG);
    elements.extendedLineBG = extendedLineBG;
    
    // Calculate H (perpendicular from C to BG extended)
    const bgLineStart = B;
    const bgLineEnd = extendedBG;
    const H = perpendicularPointToLine(C, bgLineStart, bgLineEnd);
    config.pointH = H;
    
    // Create perpendicular symbol at H
    const perpSymbolH = new Konva.Line({
      points: [
        H.x - 7, H.y - 7,
        H.x - 7, H.y + 7,
        H.x + 7, H.y + 7
      ],
      stroke: config.colors.labels,
      strokeWidth: 2
    });
    layer.add(perpSymbolH);
    elements.perpSymbolH = perpSymbolH;
    
    // Create point H
    const pointH = new Konva.Circle({
      x: H.x,
      y: H.y,
      radius: config.styles.pointRadius,
      fill: config.colors.pointH
    });
    
    // Create label for H
    const textH = new Konva.Text({
      x: H.x + 10,
      y: H.y - 20,
      text: 'H',
      fontSize: config.styles.labelFontSize,
      fontStyle: 'bold',
      fill: config.colors.labels
    });
    
    layer.add(pointH, textH);
    elements.pointH = pointH;
    elements.textH = textH;
    
    // Calculate F (intersection of CH with AD)
    const F = lineIntersection(C, H, A, D);
    if (F) {
      config.pointF = F;
      
      // Create line CF
      const lineCF = new Konva.Line({
        points: [C.x, C.y, F.x, F.y],
        stroke: config.colors.lineCF,
        strokeWidth: config.styles.lineWidth
      });
      layer.add(lineCF);
      elements.lineCF = lineCF;
      
      // Create point F
      const pointF = new Konva.Circle({
        x: F.x,
        y: F.y,
        radius: config.styles.pointRadius,
        fill: config.colors.pointF
      });
      
      // Create label for F
      const textF = new Konva.Text({
        x: F.x + 10,
        y: F.y - 20,
        text: 'F',
        fontSize: config.styles.labelFontSize,
        fontStyle: 'bold',
        fill: config.colors.labels
      });
      
      layer.add(pointF, textF);
      elements.pointF = pointF;
      elements.textF = textF;
    }
    
    layer.batchDraw();
    return;
  }
  
  // Otherwise, do the animated version
  // Create extended BG line
  const extendedLineBG = new Konva.Line({
    points: [G.x, G.y, G.x, G.y],
    stroke: config.colors.lineBG,
    strokeWidth: config.styles.lineWidth,
    dash: [5, 5],
    opacity: 0
  });
  layer.add(extendedLineBG);
  elements.extendedLineBG = extendedLineBG;
  
  // Animate the extension
  gsap.to(extendedLineBG, {
    opacity: 1,
    duration: config.animDuration * 0.5,
    onUpdate: function() {
      const progress = this.progress();
      const x = G.x + (extendedBG.x - G.x) * progress;
      const y = G.y + (extendedBG.y - G.y) * progress;
      extendedLineBG.points([G.x, G.y, x, y]);
      layer.batchDraw();
    },
    onComplete: function() {
      // After extension is drawn, show perpendicular from C
      setTimeout(function() {
        showStepExplanation("从点C作垂线CF⊥BG的延长线");
        createPerpendicularCF();
      }, 500);
    }
  });
  
  function createPerpendicularCF() {
    // Calculate H (perpendicular from C to BG extended)
    const bgLineStart = B;
    const bgLineEnd = extendedBG;
    const H = perpendicularPointToLine(C, bgLineStart, bgLineEnd);
    config.pointH = H;
    
    // Create a temporary visual indicator
    const constructionCircle = new Konva.Circle({
      x: C.x,
      y: C.y,
      radius: 20,
      stroke: config.colors.helperLines,
      strokeWidth: 1,
      dash: [2, 2],
      opacity: 0
    });
    
    const constructionLine = new Konva.Line({
      points: [C.x, C.y, C.x, C.y],
      stroke: config.colors.lineCF,
      strokeWidth: 1.5,
      dash: [5, 5],
      opacity: 0
    });
    
    layer.add(constructionCircle, constructionLine);
    
    // Animate the perpendicular construction
    gsap.to(constructionCircle, {
      opacity: 0.4,
      radius: 30,
      duration: config.animDuration * 0.3,
      onComplete: function() {
        gsap.to(constructionLine, {
          opacity: 0.7,
          duration: config.animDuration * 0.2,
          onComplete: function() {
            // Animate the line drawing from C to H
            gsap.to({}, {
              duration: config.animDuration * 0.5,
              onUpdate: function() {
                const progress = this.progress();
                const x = C.x + (H.x - C.x) * progress;
                const y = C.y + (H.y - C.y) * progress;
                
                constructionLine.points([C.x, C.y, x, y]);
                layer.batchDraw();
              },
              onComplete: function() {
                // Create perpendicular symbol at H
                const perpSymbolH = new Konva.Line({
                  points: [
                    H.x - 7, H.y - 7,
                    H.x - 7, H.y + 7,
                    H.x + 7, H.y + 7
                  ],
                  stroke: config.colors.labels,
                  strokeWidth: 2,
                  opacity: 0
                });
                layer.add(perpSymbolH);
                elements.perpSymbolH = perpSymbolH;
                
                // Show perpendicular symbol
                gsap.to(perpSymbolH, {
                  opacity: 1,
                  duration: config.animDuration * 0.3
                });
                
                // Calculate F (intersection of CH with AD)
                const F = lineIntersection(C, H, A, D);
                if (F) {
                  config.pointF = F;
                  
                  // Show point H
                  const pointH = new Konva.Circle({
                    x: H.x,
                    y: H.y,
                    radius: config.styles.pointRadius,
                    fill: config.colors.pointH,
                    visible: false,
                    opacity: 0,
                    scale: { x: 0, y: 0 }
                  });
                  
                  const textH = new Konva.Text({
                    x: H.x + 10,
                    y: H.y - 20,
                    text: 'H',
                    fontSize: config.styles.labelFontSize,
                    fontStyle: 'bold',
                    fill: config.colors.labels,
                    visible: false,
                    opacity: 0
                  });
                  
                  layer.add(pointH, textH);
                  elements.pointH = pointH;
                  elements.textH = textH;
                  
                  // Animate point H appearance
                  pointH.visible(true);
                  gsap.to(pointH, {
                    opacity: 1,
                    scaleX: 1,
                    scaleY: 1,
                    duration: config.animDuration * 0.3,
                    ease: "back.out(1.7)",
                    onComplete: function() {
                      textH.visible(true);
                      gsap.to(textH, {
                        opacity: 1,
                        duration: config.animDuration * 0.2,
                        onComplete: function() {
                          // Fade out construction elements
                          gsap.to([constructionCircle, constructionLine], {
                            opacity: 0,
                            duration: config.animDuration * 0.3,
                            onComplete: function() {
                              constructionCircle.destroy();
                              constructionLine.destroy();
                              
                              // Create line CF
                              const lineCF = new Konva.Line({
                                points: [C.x, C.y, F.x, F.y],
                                stroke: config.colors.lineCF,
                                strokeWidth: config.styles.lineWidth,
                                opacity: 0
                              });
                              layer.add(lineCF);
                              elements.lineCF = lineCF;
                              
                              // Animate the line appearance
                              gsap.to(lineCF, {
                                opacity: 1,
                                duration: config.animDuration * 0.5,
                                onComplete: function() {
                                  // Create and show point F
                                  const pointF = new Konva.Circle({
                                    x: F.x,
                                    y: F.y,
                                    radius: config.styles.pointRadius,
                                    fill: config.colors.pointF,
                                    visible: false,
                                    opacity: 0,
                                    scale: { x: 0, y: 0 }
                                  });
                                  
                                  const textF = new Konva.Text({
                                    x: F.x + 10,
                                    y: F.y - 20,
                                    text: 'F',
                                    fontSize: config.styles.labelFontSize,
                                    fontStyle: 'bold',
                                    fill: config.colors.labels,
                                    visible: false,
                                    opacity: 0
                                  });
                                  
                                  layer.add(pointF, textF);
                                  elements.pointF = pointF;
                                  elements.textF = textF;
                                  
                                  // Animate point F appearance
                                  pointF.visible(true);
                                  gsap.to(pointF, {
                                    opacity: 1,
                                    scaleX: 1,
                                    scaleY: 1,
                                    duration: config.animDuration * 0.3,
                                    ease: "back.out(1.7)",
                                    onComplete: function() {
                                      textF.visible(true);
                                      gsap.to(textF, {
                                        opacity: 1,
                                        duration: config.animDuration * 0.2,
                                        onComplete: function() {
                                          // Final explanation
                                          showStepExplanation("已从点C作垂线CF⊥BG，交BG的延长线于点H，交AD于点F");
                                          layer.batchDraw();
                                        }
                                      });
                                    }
                                  });
                                }
                              });
                            }
                          });
                        }
                      });
                    }
                  });
                }
              }
            });
          }
        });
      }
    });
  }
  
  layer.batchDraw();
}

// Step 4: Demonstrate triangle similarity
function drawStep4(withAnimation = true) {
  console.log("Executing Step 4: Demonstrating triangle similarity");
  
  // Get points from config
  const A = config.pointA;
  const B = config.pointB;
  const C = config.pointC;
  const G = config.pointG;
  const H = config.pointH;
  
  // Show step explanation
  if (withAnimation) {
    showStepExplanation("步骤4: 观察三角形△ABG和△BCH的相似性");
  }
  
  if (!withAnimation) {
    // Create triangles directly
    const triangleABG = new Konva.Line({
      points: [A.x, A.y, B.x, B.y, G.x, G.y, A.x, A.y],
      closed: true,
      fill: config.colors.triangleABG,
      stroke: config.colors.pointA,
      strokeWidth: 1.5
    });
    
    const triangleBCH = new Konva.Line({
      points: [B.x, B.y, C.x, C.y, H.x, H.y, B.x, B.y],
      closed: true,
      fill: config.colors.triangleBCH,
      stroke: config.colors.pointC,
      strokeWidth: 1.5
    });
    
    layer.add(triangleABG, triangleBCH);
    elements.triangleABG = triangleABG;
    elements.triangleBCH = triangleBCH;
    
    // Create similarity annotation
    const similarityAnnotation = new Konva.Text({
      x: stage.width() / 2,
      y: 40,
      text: '△ABG ≅ △BCH (相似三角形)',
      fontSize: 18,
      fontStyle: 'bold',
      fill: '#333',
      padding: 8,
      background: 'rgba(255, 255, 255, 0.8)',
      cornerRadius: 5
    });
    similarityAnnotation.offsetX(similarityAnnotation.width() / 2);
    
    layer.add(similarityAnnotation);
    elements.similarityAnnotation = similarityAnnotation;
    
    layer.batchDraw();
    return;
  }
  
  // Otherwise, do the animated version
  // Create and animate triangle ABG
  const triangleABG = new Konva.Line({
    points: [A.x, A.y, B.x, B.y, G.x, G.y, A.x, A.y],
    closed: true,
    fill: config.colors.triangleABG,
    stroke: config.colors.pointA,
    strokeWidth: 1.5,
    opacity: 0
  });
  
  layer.add(triangleABG);
  elements.triangleABG = triangleABG;
  
  gsap.to(triangleABG, {
    opacity: 1,
    duration: config.animDuration * 0.8,
    ease: "power2.inOut",
    onComplete: function() {
      // After first triangle is shown, show the second one
      setTimeout(function() {
        const triangleBCH = new Konva.Line({
          points: [B.x, B.y, C.x, C.y, H.x, H.y, B.x, B.y],
          closed: true,
          fill: config.colors.triangleBCH,
          stroke: config.colors.pointC,
          strokeWidth: 1.5,
          opacity: 0
        });
        
        layer.add(triangleBCH);
        elements.triangleBCH = triangleBCH;
        
        gsap.to(triangleBCH, {
          opacity: 1,
          duration: config.animDuration * 0.8,
          ease: "power2.inOut",
          onComplete: function() {
            // After both triangles are shown, show similarity annotation
            setTimeout(function() {
              const similarityAnnotation = new Konva.Text({
                x: stage.width() / 2,
                y: 40,
                text: '△ABG ≅ △BCH (相似三角形)',
                fontSize: 18,
                fontStyle: 'bold',
                fill: '#333',
                padding: 8,
                background: 'rgba(255, 255, 255, 0.8)',
                cornerRadius: 5,
                shadowColor: 'black',
                shadowBlur: 4,
                shadowOffset: { x: 1, y: 1 },
                shadowOpacity: 0.2,
                opacity: 0
              });
              similarityAnnotation.offsetX(similarityAnnotation.width() / 2);
              
              layer.add(similarityAnnotation);
              elements.similarityAnnotation = similarityAnnotation;
              
              gsap.to(similarityAnnotation, {
                opacity: 1,
                y: similarityAnnotation.y() - 10,
                duration: config.animDuration * 0.5,
                ease: "power2.out",
                onComplete: function() {
                  // Pulse animation for triangles
                  [triangleABG, triangleBCH].forEach(triangle => {
                    gsap.to(triangle, {
                      strokeWidth: 3,
                      duration: 0.5,
                      repeat: 3,
                      yoyo: true,
                      ease: "sine.inOut",
                      delay: 0.3
                    });
                  });
                  
                  // Final explanation
                  showStepExplanation("三角形△ABG和△BCH是相似的，因为它们都有一个直角，并且共享角B");
                  layer.batchDraw();
                }
              });
            }, 500);
          }
        });
      }, 500);
    }
  });
  
  layer.batchDraw();
}

// Step 5: Connect AH and EH, extend to I
function drawStep5(withAnimation = true) {
  console.log("Executing Step 5: Connecting AH and EH");
  
  // Get points from config
  const A = config.pointA;
  const E = config.pointE;
  const H = config.pointH;
  const C = config.pointC;
  const D = config.pointD;
  
  // Show step explanation
  if (withAnimation) {
    showStepExplanation("步骤5: 连接AH和EH，并延长交CD于点I");
  }
  
  if (!withAnimation) {
    // Create lines directly
    const lineAH = new Konva.Line({
      points: [A.x, A.y, H.x, H.y],
      stroke: config.colors.lineAH,
      strokeWidth: config.styles.lineWidth
    });
    
    const lineEH = new Konva.Line({
      points: [E.x, E.y, H.x, H.y],
      stroke: config.colors.lineEH,
      strokeWidth: config.styles.lineWidth
    });
    
    layer.add(lineAH, lineEH);
    elements.lineAH = lineAH;
    elements.lineEH = lineEH;
    
    // Calculate I (intersection of EH extended with CD)
    const extendedEH = extendLine(E, H);
    const I = lineIntersection(E, extendedEH, C, D);
    
    if (I) {
      config.pointI = I;
      
      // Create extended line
      const extendedLineEH = new Konva.Line({
        points: [H.x, H.y, I.x, I.y],
        stroke: config.colors.lineEH,
        strokeWidth: config.styles.lineWidth,
        dash: [5, 5]
      });
      
      layer.add(extendedLineEH);
      elements.extendedLineEH = extendedLineEH;
      
      // Create point I
      const pointI = new Konva.Circle({
        x: I.x,
        y: I.y,
        radius: config.styles.pointRadius,
        fill: config.colors.pointI
      });
      
      const textI = new Konva.Text({
        x: I.x + 10,
        y: I.y - 20,
        text: 'I',
        fontSize: config.styles.labelFontSize,
        fontStyle: 'bold',
        fill: config.colors.labels
      });
      
      layer.add(pointI, textI);
      elements.pointI = pointI;
      elements.textI = textI;
      
      // Create proof annotations
      const proofText1 = new Konva.Text({
        x: stage.width() / 2,
        y: 40,
        text: 'AB² = AE · BH',
        fontSize: 18,
        fontStyle: 'bold',
        fill: '#333',
        padding: 8,
        background: 'rgba(255, 255, 255, 0.8)',
        cornerRadius: 5
      });
      proofText1.offsetX(proofText1.width() / 2);
      
      const proofText2 = new Konva.Text({
        x: stage.width() / 2,
        y: 80,
        text: 'DI / IC = 2',
        fontSize: 18,
        fontStyle: 'bold',
        fill: '#333',
        padding: 8,
        background: 'rgba(255, 255, 255, 0.8)',
        cornerRadius: 5
      });
      proofText2.offsetX(proofText2.width() / 2);
      
      layer.add(proofText1, proofText2);
      elements.proofText1 = proofText1;
      elements.proofText2 = proofText2;
    }
    
    layer.batchDraw();
    return;
  }
  
  // Otherwise, do the animated version
  // Create and animate line AH
  const lineAH = new Konva.Line({
    points: [A.x, A.y, A.x, A.y],
    stroke: config.colors.lineAH,
    strokeWidth: config.styles.lineWidth
  });
  layer.add(lineAH);
  elements.lineAH = lineAH;
  
  gsap.to({}, {
    duration: config.animDuration * 0.7,
    onUpdate: function() {
      const progress = this.progress();
      const x = A.x + (H.x - A.x) * progress;
      const y = A.y + (H.y - A.y) * progress;
      lineAH.points([A.x, A.y, x, y]);
      layer.batchDraw();
    },
    onComplete: function() {
      // After line AH is drawn, draw line EH
      setTimeout(function() {
        const lineEH = new Konva.Line({
          points: [E.x, E.y, E.x, E.y],
          stroke: config.colors.lineEH,
          strokeWidth: config.styles.lineWidth
        });
        layer.add(lineEH);
        elements.lineEH = lineEH;
        
        gsap.to({}, {
          duration: config.animDuration * 0.7,
          onUpdate: function() {
            const progress = this.progress();
            const x = E.x + (H.x - E.x) * progress;
            const y = E.y + (H.y - E.y) * progress;
            lineEH.points([E.x, E.y, x, y]);
            layer.batchDraw();
          },
          onComplete: function() {
            // After line EH is drawn, show extension to I
            setTimeout(function() {
              showStepExplanation("延长EH交CD于点I");
              
              // Calculate I (intersection of EH extended with CD)
              const extendedEH = extendLine(E, H);
              const I = lineIntersection(E, extendedEH, C, D);
              
              if (I) {
                config.pointI = I;
                
                // Create and animate extended line
                const extendedLineEH = new Konva.Line({
                  points: [H.x, H.y, H.x, H.y],
                  stroke: config.colors.lineEH,
                  strokeWidth: config.styles.lineWidth,
                  dash: [5, 5],
                  opacity: 0
                });
                layer.add(extendedLineEH);
                elements.extendedLineEH = extendedLineEH;
                
                gsap.to(extendedLineEH, {
                  opacity: 1,
                  duration: config.animDuration * 0.3,
                  onUpdate: function() {
                    const progress = this.progress();
                    const x = H.x + (I.x - H.x) * progress;
                    const y = H.y + (I.y - H.y) * progress;
                    extendedLineEH.points([H.x, H.y, x, y]);
                    layer.batchDraw();
                  },
                  onComplete: function() {
                    // After extension is drawn, show point I
                    const pointI = new Konva.Circle({
                      x: I.x,
                      y: I.y,
                      radius: config.styles.pointRadius,
                      fill: config.colors.pointI,
                      visible: false,
                      opacity: 0,
                      scale: { x: 0, y: 0 }
                    });
                    
                    const textI = new Konva.Text({
                      x: I.x + 10,
                      y: I.y - 20,
                      text: 'I',
                      fontSize: config.styles.labelFontSize,
                      fontStyle: 'bold',
                      fill: config.colors.labels,
                      visible: false,
                      opacity: 0
                    });
                    
                    layer.add(pointI, textI);
                    elements.pointI = pointI;
                    elements.textI = textI;
                    
                    // Animate point I appearance
                    pointI.visible(true);
                    gsap.to(pointI, {
                      opacity: 1,
                      scaleX: 1,
                      scaleY: 1,
                      duration: config.animDuration * 0.3,
                      ease: "back.out(1.7)",
                      onComplete: function() {
                        textI.visible(true);
                        gsap.to(textI, {
                          opacity: 1,
                          duration: config.animDuration * 0.2,
                          onComplete: function() {
                            // Show proof annotations
                            setTimeout(function() {
                              // Create and animate first proof text
                              const proofText1 = new Konva.Text({
                                x: stage.width() / 2,
                                y: 40,
                                text: 'AB² = AE · BH',
                                fontSize: 18,
                                fontStyle: 'bold',
                                fill: '#333',
                                padding: 8,
                                background: 'rgba(255, 255, 255, 0.8)',
                                cornerRadius: 5,
                                shadowColor: 'black',
                                shadowBlur: 4,
                                shadowOffset: { x: 1, y: 1 },
                                shadowOpacity: 0.2,
                                opacity: 0
                              });
                              proofText1.offsetX(proofText1.width() / 2);
                              
                              layer.add(proofText1);
                              elements.proofText1 = proofText1;
                              
                              gsap.to(proofText1, {
                                opacity: 1,
                                y: proofText1.y() - 10,
                                duration: config.animDuration * 0.5,
                                ease: "power2.out",
                                onComplete: function() {
                                  // Create and animate second proof text
                                  setTimeout(function() {
                                    const proofText2 = new Konva.Text({
                                      x: stage.width() / 2,
                                      y: 80,
                                      text: 'DI / IC = 2',
                                      fontSize: 18,
                                      fontStyle: 'bold',
                                      fill: '#333',
                                      padding: 8,
                                      background: 'rgba(255, 255, 255, 0.8)',
                                      cornerRadius: 5,
                                      shadowColor: 'black',
                                      shadowBlur: 4,
                                      shadowOffset: { x: 1, y: 1 },
                                      shadowOpacity: 0.2,
                                      opacity: 0
                                    });
                                    proofText2.offsetX(proofText2.width() / 2);
                                    
                                    layer.add(proofText2);
                                    elements.proofText2 = proofText2;
                                    
                                    gsap.to(proofText2, {
                                      opacity: 1,
                                      y: proofText2.y() - 10,
                                      duration: config.animDuration * 0.5,
                                      ease: "power2.out",
                                      onComplete: function() {
                                        // Final explanation
                                        showStepExplanation("已连接AH，EH并延长交CD于点I，证明了AB² = AE·BH，以及DI/IC = 2");
                                        layer.batchDraw();
                                      }
                                    });
                                  }, 500);
                                }
                              });
                            }, 500);
                          }
                        });
                      }
                    });
                  }
                });
              }
            }, 500);
          }
        });
      }, 500);
    }
  });
  
  layer.batchDraw();
}
