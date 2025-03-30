/**
 * Animation helper functions for the Square Perpendicular Similarity visualization
 */

// Create a point with label in one function
function createPointWithLabel(point, label, color, labelOffsetX = 10, labelOffsetY = -20) {
  const pointObj = new Konva.Circle({
    x: point.x,
    y: point.y,
    radius: config.styles.pointRadius,
    fill: color,
    visible: false,
    shadowColor: 'black',
    shadowBlur: 0,
    shadowOpacity: 0
  });
  
  const textObj = new Konva.Text({
    x: point.x + labelOffsetX,
    y: point.y + labelOffsetY,
    text: label,
    fontSize: config.styles.labelFontSize,
    fontStyle: 'bold',
    fill: config.colors.labels,
    visible: false
  });
  
  layer.add(pointObj, textObj);
  
  return { point: pointObj, text: textObj };
}

// Draw a perpendicular symbol at a given point
function drawPerpendicularSymbol(point, size = 7, color = config.colors.labels) {
  const symbol = new Konva.Line({
    points: [
      point.x - size, point.y - size,
      point.x - size, point.y + size,
      point.x + size, point.y + size
    ],
    stroke: color,
    strokeWidth: 2,
    visible: false,
    opacity: 0
  });
  
  layer.add(symbol);
  return symbol;
}

// Create or update a step explanation text
function showStepExplanation(text, duration = 0.3) {
  if (elements.stepExplanation) {
    gsap.to(elements.stepExplanation, {
      opacity: 0,
      duration: duration,
      onComplete: () => {
        elements.stepExplanation.text(text);
        gsap.to(elements.stepExplanation, {
          opacity: 1,
          duration: duration
        });
      }
    });
  } else {
    elements.stepExplanation = new Konva.Text({
      x: 20,
      y: 20,
      text: text,
      fontSize: 16,
      fill: '#333',
      padding: 5,
      background: '#f0f0f0',
      cornerRadius: 3,
      opacity: 0
    });
    layer.add(elements.stepExplanation);
    gsap.to(elements.stepExplanation, {
      opacity: 1,
      duration: duration * 2
    });
  }
}

// Animate a point appearing with label
function animatePointAppearing(pointObj, textObj, duration = config.animDuration * 0.3, delay = 0) {
  return new Promise((resolve) => {
    gsap.to(pointObj, {
      visible: true,
      duration: 0,
      delay: delay,
      onComplete: () => {
        gsap.from(pointObj, {
          scaleX: 0,
          scaleY: 0,
          opacity: 0,
          duration: duration,
          ease: "back.out(1.7)",
          onComplete: () => {
            gsap.to(textObj, { 
              visible: true, 
              opacity: 1, 
              duration: duration * 0.5,
              onComplete: resolve
            });
          }
        });
      }
    });
  });
}

// Animated square drawing edge by edge
function animateSquareDrawing(points, duration) {
  return new Promise((resolve) => {
    // Create individual lines for each edge
    const lineAB = new Konva.Line({
      points: [points.A.x, points.A.y, points.A.x, points.A.y],
      stroke: config.colors.square,
      strokeWidth: config.styles.lineWidth
    });
    
    const lineBC = new Konva.Line({
      points: [points.B.x, points.B.y, points.B.x, points.B.y],
      stroke: config.colors.square,
      strokeWidth: config.styles.lineWidth
    });
    
    const lineCD = new Konva.Line({
      points: [points.C.x, points.C.y, points.C.x, points.C.y],
      stroke: config.colors.square,
      strokeWidth: config.styles.lineWidth
    });
    
    const lineDA = new Konva.Line({
      points: [points.D.x, points.D.y, points.D.x, points.D.y],
      stroke: config.colors.square,
      strokeWidth: config.styles.lineWidth
    });
    
    layer.add(lineAB, lineBC, lineCD, lineDA);
    elements.squareEdges = [lineAB, lineBC, lineCD, lineDA];
    
    // Animate each edge sequentially
    const edgeDuration = duration * 0.3;
    const edgeDelay = edgeDuration * 0.8;
    
    // Helper function to animate a single edge
    function animateEdge(line, startPoint, endPoint, delay) {
      return new Promise((edgeResolve) => {
        gsap.to({}, {
          duration: edgeDuration,
          delay: delay,
          onUpdate: function() {
            const progress = this.progress();
            const x = startPoint.x + (endPoint.x - startPoint.x) * progress;
            const y = startPoint.y + (endPoint.y - startPoint.y) * progress;
            line.points([startPoint.x, startPoint.y, x, y]);
            layer.batchDraw();
          },
          onComplete: edgeResolve
        });
      });
    }
    
    // Animate all four edges with sequential timing
    Promise.all([
      animateEdge(lineAB, points.A, points.B, 0),
      animateEdge(lineBC, points.B, points.C, edgeDelay),
      animateEdge(lineCD, points.C, points.D, edgeDelay * 2),
      animateEdge(lineDA, points.D, points.A, edgeDelay * 3)
    ]).then(resolve);
  });
}

// Animate showing a midpoint construction
function animateMidpointConstruction(start, end, midpoint, color, duration) {
  return new Promise((resolve) => {
    // First, draw a dashed line between the two points
    const constructionLine = new Konva.Line({
      points: [start.x, start.y, end.x, end.y],
      stroke: color,
      strokeWidth: 1.5,
      dash: [5, 5],
      opacity: 0
    });
    layer.add(constructionLine);
    
    // Create a measurement indicator
    const measureLine1 = new Konva.Line({
      points: [
        start.x, start.y,
        (start.x + end.x) / 2, (start.y + end.y) / 2
      ],
      stroke: color,
      strokeWidth: 1,
      opacity: 0
    });
    
    const measureLine2 = new Konva.Line({
      points: [
        (start.x + end.x) / 2, (start.y + end.y) / 2,
        end.x, end.y
      ],
      stroke: color,
      strokeWidth: 1,
      opacity: 0
    });
    
    // Create small tick marks to indicate equal measurements
    const tick1 = new Konva.Line({
      points: [
        (start.x + midpoint.x) / 2 - 5, (start.y + midpoint.y) / 2 - 5,
        (start.x + midpoint.x) / 2 + 5, (start.y + midpoint.y) / 2 + 5
      ],
      stroke: color,
      strokeWidth: 1.5,
      opacity: 0
    });
    
    const tick2 = new Konva.Line({
      points: [
        (midpoint.x + end.x) / 2 - 5, (midpoint.y + end.y) / 2 - 5,
        (midpoint.x + end.x) / 2 + 5, (midpoint.y + end.y) / 2 + 5
      ],
      stroke: color,
      strokeWidth: 1.5,
      opacity: 0
    });
    
    layer.add(measureLine1, measureLine2, tick1, tick2);
    
    // Animate the construction process
    // 1. Show the construction line
    gsap.to(constructionLine, {
      opacity: 0.7,
      duration: duration * 0.3,
      onComplete: () => {
        // 2. Show the measurement indicators
        gsap.to([measureLine1, measureLine2], {
          opacity: 0.6,
          duration: duration * 0.3,
          stagger: 0.1,
          onComplete: () => {
            // 3. Show tick marks to indicate equality
            gsap.to([tick1, tick2], {
              opacity: 0.8,
              duration: duration * 0.2,
              stagger: 0.1
            });
            
            // Create a gradually fading effect to highlight the midpoint
            const highlight = new Konva.Circle({
              x: midpoint.x,
              y: midpoint.y,
              radius: 15,
              fill: color,
              opacity: 0.3
            });
            layer.add(highlight);
            
            // Pulse and fade out the highlight
            gsap.to(highlight, {
              radius: 25,
              opacity: 0,
              duration: duration * 0.6,
              ease: "power2.out",
              onComplete: () => {
                highlight.destroy();
                
                // Fade out construction elements after a delay
                setTimeout(() => {
                  gsap.to([constructionLine, measureLine1, measureLine2, tick1, tick2], {
                    opacity: 0,
                    duration: duration * 0.3,
                    stagger: 0.05,
                    onComplete: () => {
                      constructionLine.destroy();
                      measureLine1.destroy();
                      measureLine2.destroy();
                      tick1.destroy();
                      tick2.destroy();
                      layer.batchDraw();
                      resolve();
                    }
                  });
                }, duration * 500);
              }
            });
          }
        });
      }
    });
  });
}

// Animate a perpendicular line construction
function animatePerpendicularConstruction(fromPoint, lineStart, lineEnd, perpendicularPoint, color, duration) {
  return new Promise((resolve) => {
    // Create a visual indicator to show the perpendicular property
    const constructionCircle = new Konva.Circle({
      x: fromPoint.x,
      y: fromPoint.y,
      radius: 20,
      stroke: config.colors.helperLines,
      strokeWidth: 1,
      dash: [2, 2],
      opacity: 0
    });
    
    // Create a temporary construction line
    const constructionLine = new Konva.Line({
      points: [fromPoint.x, fromPoint.y, fromPoint.x, fromPoint.y],
      stroke: color,
      strokeWidth: 1.5,
      dash: [5, 5],
      opacity: 0
    });
    
    // Create a perpendicular symbol
    const perpSymbol = new Konva.Line({
      points: [
        perpendicularPoint.x - 7, perpendicularPoint.y - 7,
        perpendicularPoint.x - 7, perpendicularPoint.y + 7,
        perpendicularPoint.x + 7, perpendicularPoint.y + 7
      ],
      stroke: config.colors.labels,
      strokeWidth: 2,
      visible: false,
      opacity: 0
    });
    
    layer.add(constructionCircle, constructionLine, perpSymbol);
    
    // Animate the construction
    // 1. Show construction circle
    gsap.to(constructionCircle, {
      opacity: 0.4,
      radius: 30,
      duration: duration * 0.3,
      onComplete: () => {
        // 2. Show and animate construction line
        gsap.to(constructionLine, {
          opacity: 0.7,
          duration: duration * 0.2,
          onComplete: () => {
            // 3. Animate the line drawing from point to the perpendicular point
            gsap.to({}, {
              duration: duration * 0.5,
              onUpdate: function() {
                const progress = this.progress();
                const x = fromPoint.x + (perpendicularPoint.x - fromPoint.x) * progress;
                const y = fromPoint.y + (perpendicularPoint.y - fromPoint.y) * progress;
                
                constructionLine.points([fromPoint.x, fromPoint.y, x, y]);
                layer.batchDraw();
              },
              onComplete: () => {
                // 4. Show perpendicular symbol
                perpSymbol.visible(true);
                gsap.to(perpSymbol, {
                  opacity: 1,
                  duration: duration * 0.3
                });
                
                // 5. Fade out construction elements after a delay
                setTimeout(() => {
                  gsap.to([constructionCircle, constructionLine], {
                    opacity: 0,
                    duration: duration * 0.3,
                    onComplete: () => {
                      constructionCircle.destroy();
                      constructionLine.destroy();
                      layer.batchDraw();
                      resolve({ perpSymbol });
                    }
                  });
                }, duration * 500);
              }
            });
          }
        });
      }
    });
  });
}

// Animate a line drawing from start to end
function animateDrawLine(start, end, color, width, duration, delay = 0) {
  return new Promise((resolve) => {
    const line = new Konva.Line({
      points: [start.x, start.y, start.x, start.y],
      stroke: color,
      strokeWidth: width || config.styles.lineWidth
    });
    layer.add(line);
    
    gsap.to({}, {
      duration: duration,
      delay: delay,
      onUpdate: function() {
        const progress = this.progress();
        const x = start.x + (end.x - start.x) * progress;
        const y = start.y + (end.y - start.y) * progress;
        line.points([start.x, start.y, x, y]);
        layer.batchDraw();
      },
      onComplete: () => {
        line.points([start.x, start.y, end.x, end.y]);
        layer.batchDraw();
        resolve(line);
      }
    });
    
    return line;
  });
}

// Animate filling a triangle
function animateTriangleFill(points, color, duration = 0.5, delay = 0) {
  return new Promise((resolve) => {
    const triangle = new Konva.Line({
      points: [points[0].x, points[0].y, points[1].x, points[1].y, points[2].x, points[2].y],
      closed: true,
      fill: color,
      stroke: color.replace('rgba', 'rgb').replace(/,[^,]*\)/, ')'), // Solid border from fill color
      strokeWidth: 1.5,
      opacity: 0
    });
    
    layer.add(triangle);
    
    gsap.to(triangle, {
      opacity: 1,
      duration: duration,
      delay: delay,
      ease: "power2.inOut",
      onComplete: () => resolve(triangle)
    });
    
    return triangle;
  });
}

// Show a formula or text as a mathematical annotation
function showMathAnnotation(text, position, duration = 0.5, delay = 0) {
  return new Promise((resolve) => {
    console.log(`Creating math annotation "${text}" at position (${position.x}, ${position.y})`);
    
    const annotation = new Konva.Text({
      x: position.x,
      y: position.y,
      text: text,
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
    
    // Center the text
    annotation.offsetX(annotation.width() / 2);
    
    layer.add(annotation);
    
    gsap.to(annotation, {
      opacity: 1,
      y: position.y - 10, // Slight floating animation
      duration: duration,
      delay: delay,
      ease: "power2.out",
      onComplete: () => resolve(annotation)
    });
    
    return annotation;
  });
}
