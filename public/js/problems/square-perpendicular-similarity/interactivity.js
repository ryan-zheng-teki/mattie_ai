/**
 * Interactivity functions for the Square Perpendicular Similarity visualization
 */

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
    text: "Drag square vertices for dynamic exploration!",
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
  
  // Show a brief animation on the corners to indicate they're draggable
  [elements.pointA, elements.pointB, elements.pointC, elements.pointD].forEach((point, i) => {
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
  if (elements.squareEdges) {
    elements.squareEdges[0].points([A.x, A.y, B.x, B.y]);
    elements.squareEdges[1].points([B.x, B.y, C.x, C.y]);
    elements.squareEdges[2].points([C.x, C.y, D.x, D.y]);
    elements.squareEdges[3].points([D.x, D.y, A.x, A.y]);
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
      
      // Update perpendicular symbol at G
      if (elements.perpSymbolG) {
        elements.perpSymbolG.points([
          G.x - 7, G.y - 7,
          G.x - 7, G.y + 7,
          G.x + 7, G.y + 7
        ]);
      }
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
          
          // Update perpendicular symbol at H
          if (elements.perpSymbolH) {
            elements.perpSymbolH.points([
              H.x - 7, H.y - 7,
              H.x - 7, H.y + 7,
              H.x + 7, H.y + 7
            ]);
          }
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
      elements.dragHelp = null;
    }
  }
  
  layer.batchDraw();
}
