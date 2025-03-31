/**
 * Animation helper functions for the Semicircle Perpendicular Equality visualization
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

// Animate a semicircle drawing
function animateSemicircleDrawing(center, radius, startAngle, endAngle, duration) {
  return new Promise((resolve) => {
    const semicircle = new Konva.Arc({
      x: center.x,
      y: center.y,
      innerRadius: 0,
      outerRadius: radius,
      angle: 0,
      fill: '',
      stroke: config.colors.circle,
      strokeWidth: config.styles.lineWidth,
      rotation: startAngle * (180 / Math.PI),
      angle: 0
    });
    
    layer.add(semicircle);
    elements.semicircle = semicircle;
    
    gsap.to({}, {
      duration: duration,
      onUpdate: function() {
        const progress = this.progress();
        semicircle.angle(progress * (endAngle - startAngle) * (180 / Math.PI));
        layer.batchDraw();
      },
      onComplete: resolve
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

// Animate a length comparison between two line segments
function animateLengthComparison(line1Start, line1End, line2Start, line2End, duration) {
  return new Promise((resolve) => {
    // Create the "measurement" visual indicators
    const measureLine1 = new Konva.Line({
      points: [line1Start.x, line1Start.y, line1End.x, line1End.y],
      stroke: config.colors.highlight,
      strokeWidth: 3,
      dash: [5, 2],
      opacity: 0
    });
    
    const measureLine2 = new Konva.Line({
      points: [line2Start.x, line2Start.y, line2End.x, line2End.y],
      stroke: config.colors.highlight,
      strokeWidth: 3,
      dash: [5, 2],
      opacity: 0
    });
    
    // Create measurement tick marks
    const tickSize = 5;
    const tick1Start = new Konva.Line({
      points: [
        line1Start.x - tickSize, line1Start.y - tickSize,
        line1Start.x + tickSize, line1Start.y + tickSize
      ],
      stroke: config.colors.highlight,
      strokeWidth: 2,
      opacity: 0
    });
    
    const tick1End = new Konva.Line({
      points: [
        line1End.x - tickSize, line1End.y - tickSize,
        line1End.x + tickSize, line1End.y + tickSize
      ],
      stroke: config.colors.highlight,
      strokeWidth: 2,
      opacity: 0
    });
    
    const tick2Start = new Konva.Line({
      points: [
        line2Start.x - tickSize, line2Start.y - tickSize,
        line2Start.x + tickSize, line2Start.y + tickSize
      ],
      stroke: config.colors.highlight,
      strokeWidth: 2,
      opacity: 0
    });
    
    const tick2End = new Konva.Line({
      points: [
        line2End.x - tickSize, line2End.y - tickSize,
        line2End.x + tickSize, line2End.y + tickSize
      ],
      stroke: config.colors.highlight,
      strokeWidth: 2,
      opacity: 0
    });
    
    layer.add(measureLine1, measureLine2, tick1Start, tick1End, tick2Start, tick2End);
    
    // Animate the comparison
    // First, highlight the first segment
    gsap.to(measureLine1, {
      opacity: 1,
      duration: duration * 0.3
    });
    
    gsap.to([tick1Start, tick1End], {
      opacity: 1,
      duration: duration * 0.2,
      delay: duration * 0.3
    });
    
    // Then, highlight the second segment
    gsap.to(measureLine2, {
      opacity: 1,
      duration: duration * 0.3,
      delay: duration * 0.5
    });
    
    gsap.to([tick2Start, tick2End], {
      opacity: 1,
      duration: duration * 0.2,
      delay: duration * 0.8,
      onComplete: () => {
        // Create an equals sign animation in the middle
        const midpoint1 = {
          x: (line1Start.x + line1End.x) / 2,
          y: (line1Start.y + line1End.y) / 2
        };
        
        const midpoint2 = {
          x: (line2Start.x + line2End.x) / 2,
          y: (line2Start.y + line2End.y) / 2
        };
        
        const equalSize = 12;
        const equalTopLine = new Konva.Line({
          points: [
            midpoint1.x - equalSize, midpoint1.y - 5,
            midpoint1.x + equalSize, midpoint1.y - 5
          ],
          stroke: config.colors.highlight,
          strokeWidth: 3,
          opacity: 0
        });
        
        const equalBottomLine = new Konva.Line({
          points: [
            midpoint1.x - equalSize, midpoint1.y + 5,
            midpoint1.x + equalSize, midpoint1.y + 5
          ],
          stroke: config.colors.highlight,
          strokeWidth: 3,
          opacity: 0
        });
        
        const equal2TopLine = new Konva.Line({
          points: [
            midpoint2.x - equalSize, midpoint2.y - 5,
            midpoint2.x + equalSize, midpoint2.y - 5
          ],
          stroke: config.colors.highlight,
          strokeWidth: 3,
          opacity: 0
        });
        
        const equal2BottomLine = new Konva.Line({
          points: [
            midpoint2.x - equalSize, midpoint2.y + 5,
            midpoint2.x + equalSize, midpoint2.y + 5
          ],
          stroke: config.colors.highlight,
          strokeWidth: 3,
          opacity: 0
        });
        
        layer.add(equalTopLine, equalBottomLine, equal2TopLine, equal2BottomLine);
        
        // Show equals signs
        gsap.to([equalTopLine, equalBottomLine, equal2TopLine, equal2BottomLine], {
          opacity: 1,
          duration: duration * 0.3,
          delay: 0.1,
          stagger: 0.05,
          onComplete: () => {
            // Fade all measurement indicators after a delay
            setTimeout(() => {
              gsap.to([
                measureLine1, measureLine2, 
                tick1Start, tick1End, tick2Start, tick2End,
                equalTopLine, equalBottomLine, equal2TopLine, equal2BottomLine
              ], {
                opacity: 0,
                duration: duration * 0.3,
                stagger: 0.02,
                onComplete: () => {
                  // Clean up and resolve
                  measureLine1.destroy();
                  measureLine2.destroy();
                  tick1Start.destroy();
                  tick1End.destroy();
                  tick2Start.destroy();
                  tick2End.destroy();
                  equalTopLine.destroy();
                  equalBottomLine.destroy();
                  equal2TopLine.destroy();
                  equal2BottomLine.destroy();
                  layer.batchDraw();
                  resolve();
                }
              });
            }, duration * 700); // Allow visibility for a while
          }
        });
      }
    });
  });
}
