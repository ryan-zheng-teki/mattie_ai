/**
 * Animation helper functions for the Set Intersection Constraint visualization
 */

// Helper function to animate appearance with physics
function animateAppear(element, duration, delay, usePhysics, layer) {
  element.visible(true);
  element.opacity(0);
  element.scaleX(0.8);
  element.scaleY(0.8);
  
  gsap.to(element, {
    opacity: 1,
    scaleX: 1,
    scaleY: 1,
    duration: duration,
    delay: delay,
    ease: usePhysics ? "back.out(1.7)" : "power2.out",
    onUpdate: function() {
      layer.batchDraw();
    }
  });
}

// Helper function to animate line drawing
function animateDrawLine(line, duration, delay, useGlow, glowColor, layer) {
  // Store original points
  const origPoints = line.points().slice();
  const startX = origPoints[0];
  const startY = origPoints[1];
  
  // Reset to just the starting point
  line.points([startX, startY, startX, startY]);
  line.visible(true);
  
  // If glow effect requested
  let glowObj = null;
  if (useGlow) {
    line.shadowColor(glowColor || line.stroke());
    line.shadowBlur(0);
    line.shadowOpacity(0.5);
    
    // Create animation for glow
    glowObj = {blur: 0};
    gsap.to(glowObj, {
      blur: 8,
      duration: duration * 0.6,
      delay: delay + duration * 0.2,
      yoyo: true,
      repeat: 1,
      ease: "sine.inOut",
      onUpdate: function() {
        line.shadowBlur(glowObj.blur);
        layer.batchDraw();
      }
    });
  }
  
  // Animate drawing the line
  gsap.to({}, {
    duration: duration,
    delay: delay,
    onUpdate: function() {
      const progress = this.progress();
      const endX = startX + (origPoints[2] - startX) * progress;
      const endY = startY + (origPoints[3] - startY) * progress;
      line.points([startX, startY, endX, endY]);
      layer.batchDraw();
    },
    onComplete: function() {
      // Ensure final points are exactly as original
      line.points(origPoints);
      layer.batchDraw();
    }
  });
}

// Helper function to pulse an element
function pulsateElement(element, duration, layer) {
  gsap.to(element, {
    scaleX: 1.2,
    scaleY: 1.2,
    duration: duration * 0.5,
    yoyo: true,
    repeat: 1,
    ease: "sine.inOut",
    onUpdate: function() {
      layer.batchDraw();
    }
  });
}

// Helper function to animate move with physics
function animateMove(element, targetX, targetY, duration, delay, layer) {
  gsap.to(element, {
    x: targetX,
    y: targetY,
    duration: duration,
    delay: delay,
    ease: "elastic.out(1, 0.75)",
    onUpdate: function() {
      layer.batchDraw();
    }
  });
}
