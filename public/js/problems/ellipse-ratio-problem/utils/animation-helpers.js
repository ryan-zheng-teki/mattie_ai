/**
 * Animation helper functions for the Ellipse Ratio Problem visualization
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

// Animate drawing an ellipse
function animateEllipseDrawing(ellipse, duration = config.animDuration, delay = 0) {
  return new Promise((resolve) => {
    ellipse.visible(true);
    ellipse.opacity(0);
    
    gsap.to(ellipse, {
      opacity: 1,
      duration: duration,
      delay: delay,
      ease: config.easing.draw,
      onComplete: () => {
        resolve(ellipse);
      }
    });
  });
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

// Animate drawing a line from start to end
function animateDrawLine(line, duration = config.animDuration, delay = 0) {
  return new Promise((resolve) => {
    const points = line.points();
    const startX = points[0];
    const startY = points[1]; 
    const endX = points[2];
    const endY = points[3];
    
    // Reset to start position
    line.points([startX, startY, startX, startY]);
    line.visible(true);
    
    // Animate drawing
    gsap.to({}, {
      duration: duration,
      delay: delay,
      onUpdate: function() {
        const progress = this.progress();
        const currentX = startX + (endX - startX) * progress;
        const currentY = startY + (endY - startY) * progress;
        line.points([startX, startY, currentX, currentY]);
        layer.batchDraw();
      },
      ease: config.easing.draw,
      onComplete: () => {
        // Ensure final position is precise
        line.points([startX, startY, endX, endY]);
        layer.batchDraw();
        resolve(line);
      }
    });
  });
}

// Show a step explanation text with animation
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

// Animate the calculation of the ratio with visual indicators
function animateRatioCalculation(pointO, pointP, pointQ, duration = config.animDuration) {
  return new Promise((resolve) => {
    // Create temporary indicators for lengths
    const distOP = distance(pointO, pointP);
    const distOQ = distance(pointO, pointQ);
    const ratio = distOQ / distOP;
    
    // Create a line for OP with animation to show measurement
    const lineOP = new Konva.Line({
      points: [pointO.x, pointO.y, pointP.x, pointP.y],
      stroke: config.colors.rayOP,
      strokeWidth: 3,
      dash: [5, 2],
      opacity: 0
    });
    layer.add(lineOP);
    
    // Create a line for OQ with animation to show measurement
    const lineOQ = new Konva.Line({
      points: [pointO.x, pointO.y, pointQ.x, pointQ.y],
      stroke: config.colors.rayOQ,
      strokeWidth: 3,
      dash: [5, 2],
      opacity: 0
    });
    layer.add(lineOQ);
    
    // Create text labels for the distances
    const opText = new Konva.Text({
      x: (pointO.x + pointP.x) / 2 + 15,
      y: (pointO.y + pointP.y) / 2 - 10,
      text: `|OP| = ${distOP.toFixed(2)}`,
      fontSize: 14,
      fill: config.colors.rayOP,
      background: 'rgba(255,255,255,0.7)',
      padding: 3,
      opacity: 0
    });
    
    const oqText = new Konva.Text({
      x: (pointO.x + pointQ.x) / 2 + 15,
      y: (pointO.y + pointQ.y) / 2 - 10,
      text: `|OQ| = ${distOQ.toFixed(2)}`,
      fontSize: 14,
      fill: config.colors.rayOQ,
      background: 'rgba(255,255,255,0.7)',
      padding: 3,
      opacity: 0
    });
    
    const ratioText = new Konva.Text({
      x: stage.width() / 2,
      y: 60,
      text: `|OQ| / |OP| = ${ratio.toFixed(2)}`,
      fontSize: 18,
      fontStyle: 'bold',
      fill: config.colors.ratioHighlight,
      align: 'center',
      padding: 5,
      background: 'rgba(255,255,255,0.8)',
      cornerRadius: 5,
      opacity: 0
    });
    ratioText.offsetX(ratioText.width() / 2); // Center horizontally
    
    layer.add(opText, oqText, ratioText);
    
    // Animate the measurement lines and texts sequentially
    gsap.timeline()
      .to(lineOP, { opacity: 1, duration: duration * 0.3 })
      .to(opText, { opacity: 1, duration: duration * 0.3 })
      .to(lineOQ, { opacity: 1, duration: duration * 0.3 })
      .to(oqText, { opacity: 1, duration: duration * 0.3 })
      .to(ratioText, { 
        opacity: 1, 
        duration: duration * 0.5,
        onComplete: () => {
          // Pulse the ratio text to emphasize
          gsap.to(ratioText, {
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 0.5,
            repeat: 1,
            yoyo: true,
            onComplete: () => {
              // Update the HTML ratio display
              const ratioDisplay = document.getElementById('ratio-display');
              const ratioValue = document.getElementById('ratio-value');
              
              if (ratioDisplay && ratioValue) {
                ratioValue.textContent = ratio.toFixed(2);
                ratioDisplay.style.display = 'block';
                ratioDisplay.classList.add('highlight');
                
                // Remove highlight after a moment
                setTimeout(() => {
                  ratioDisplay.classList.remove('highlight');
                }, 1000);
              }
              
              // Clean up temporary visual elements after a delay
              setTimeout(() => {
                gsap.to([lineOP, lineOQ, opText, oqText, ratioText], {
                  opacity: 0,
                  duration: duration * 0.3,
                  onComplete: () => {
                    lineOP.destroy();
                    lineOQ.destroy();
                    opText.destroy();
                    oqText.destroy();
                    ratioText.destroy();
                    layer.batchDraw();
                    resolve(ratio);
                  }
                });
              }, 3000); // Show for 3 seconds
            }
          });
        }
      });
  });
}

// Show a mathematical formula or annotation
function showMathAnnotation(text, position, duration = 0.5, delay = 0) {
  return new Promise((resolve) => {
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

// Demonstrate the constant ratio with multiple points
function demonstrateConstantRatio(duration = config.animDuration) {
  return new Promise((resolve) => {
    // Create a visual indicator for the constant ratio
    const annotation = new Konva.Text({
      x: stage.width() / 2,
      y: 50,
      text: "For any point P on ellipse C,\n|OQ|/|OP| = 2",
      fontSize: 20,
      fontStyle: 'bold',
      fill: config.colors.ratioHighlight,
      align: 'center',
      padding: 10,
      background: 'rgba(255, 255, 255, 0.9)',
      cornerRadius: 8,
      shadowColor: 'black',
      shadowBlur: 6,
      shadowOffset: { x: 1, y: 1 },
      shadowOpacity: 0.3,
      opacity: 0
    });
    annotation.offsetX(annotation.width() / 2);
    
    layer.add(annotation);
    
    // Show the annotation with animation
    gsap.to(annotation, {
      opacity: 1,
      duration: duration * 0.5,
      ease: "power2.out"
    });
    
    // Create an array of angles to demonstrate different points P
    const angles = [0, Math.PI/6, Math.PI/3, Math.PI/2, 2*Math.PI/3, 5*Math.PI/6, Math.PI];
    let currentAngle = 0;
    
    // Create a circular indicator that will travel along ellipse C
    const indicator = new Konva.Circle({
      x: 0,
      y: 0,
      radius: config.styles.pointRadius + 2,
      stroke: config.colors.pointP,
      strokeWidth: 2,
      dash: [3, 3],
      opacity: 0.8
    });
    layer.add(indicator);
    
    // Function to update point P and the corresponding Q
    function updatePoints(angle) {
      // Calculate point P on ellipse C
      const px = config.origin.x + config.scale * config.ellipseC.a * Math.cos(angle);
      const py = config.origin.y - config.scale * config.ellipseC.b * Math.sin(angle);
      
      // Move the indicator to show where P would be
      indicator.x(px);
      indicator.y(py);
      
      // Calculate point Q (exactly twice the distance from O to P)
      const ox = config.origin.x;
      const oy = config.origin.y;
      const qx = ox + 2 * (px - ox);
      const qy = oy + 2 * (py - oy);
      
      // Create temporary ray indicator
      const ray = new Konva.Line({
        points: [ox, oy, qx, qy],
        stroke: config.colors.rayOP,
        strokeWidth: 1,
        dash: [4, 4],
        opacity: 0.6
      });
      layer.add(ray);
      
      // Create temporary point Q indicator
      const qIndicator = new Konva.Circle({
        x: qx,
        y: qy,
        radius: config.styles.pointRadius,
        fill: config.colors.pointQ,
        opacity: 0
      });
      layer.add(qIndicator);
      
      // Fade in the temporary elements
      gsap.to([ray, qIndicator], {
        opacity: 0.8,
        duration: 0.3,
        onComplete: () => {
          // Fade out after a brief delay
          gsap.to([ray, qIndicator], {
            opacity: 0,
            duration: 0.3,
            delay: 0.5,
            onComplete: () => {
              ray.destroy();
              qIndicator.destroy();
              layer.batchDraw();
            }
          });
        }
      });
    }
    
    // Animate the indicator through different points
    const animateNextPoint = () => {
      if (currentAngle >= angles.length) {
        // Animation series complete
        gsap.to(indicator, {
          opacity: 0,
          duration: 0.5,
          onComplete: () => {
            indicator.destroy();
            layer.batchDraw();
            
            // Highlight the result text once more
            const ratioDisplay = document.getElementById('ratio-display');
            if (ratioDisplay) {
              ratioDisplay.classList.add('highlight');
              setTimeout(() => {
                ratioDisplay.classList.remove('highlight');
              }, 1000);
            }
            
            // Cleanup and resolve after a delay
            setTimeout(() => {
              gsap.to(annotation, {
                opacity: 0,
                duration: duration * 0.3,
                onComplete: () => {
                  annotation.destroy();
                  resolve();
                }
              });
            }, 2000);
          }
        });
        return;
      }
      
      // Update to the next angle
      const angle = angles[currentAngle];
      updatePoints(angle);
      currentAngle++;
      
      // Schedule the next update
      setTimeout(animateNextPoint, 1200);
    };
    
    // Start the animation sequence after the annotation appears
    setTimeout(animateNextPoint, duration * 500);
  });
}
