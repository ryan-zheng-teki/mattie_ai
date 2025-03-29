/**
 * Animation utility functions for math visualizations using Konva and GSAP
 */

// Enhanced line animation with glow effect
function animateDrawLine(konvaLine, duration, delay = 0, hasGlow = false, glowColor = null, layer) {
  const startX = konvaLine.points()[0];
  const startY = konvaLine.points()[1];
  const endX = konvaLine.points()[2];
  const endY = konvaLine.points()[3];

  // Initial state: line is a point at the start
  konvaLine.points([startX, startY, startX, startY]);
  konvaLine.visible(true); // Make visible before animation
  
  // Add glow effect if requested
  if (hasGlow && glowColor) {
    konvaLine.shadowColor(glowColor);
    konvaLine.shadowBlur(0); // Start with no glow
    konvaLine.shadowOffset({ x: 0, y: 0 });
    konvaLine.shadowOpacity(0.7);
  }

  // Use GSAP to tween line growth
  let tweenObj = { x: startX, y: startY, glow: 0 };
  gsap.to(tweenObj, {
    x: endX,
    y: endY,
    glow: hasGlow ? 5 : 0, // Default glow amount
    duration: duration,
    delay: delay,
    ease: "power2.out",
    onUpdate: function() {
      konvaLine.points([startX, startY, tweenObj.x, tweenObj.y]);
      if (hasGlow) {
        konvaLine.shadowBlur(tweenObj.glow);
      }
    },
    onComplete: function() {
      layer.batchDraw(); // Final redraw
    }
  });
}

// Enhanced appear animation with shadows and scale effects
function animateAppear(konvaElement, duration, delay = 0, withPhysics = false, layer) {
  konvaElement.scale({ x: 0, y: 0 });
  konvaElement.opacity(0);
  konvaElement.visible(true);

  // Set offset for scaling from center (important for shapes/text)
  const bounds = konvaElement.getClientRect({ skipTransform: true });
  if (konvaElement instanceof Konva.Text) {
    konvaElement.offsetX(konvaElement.width() / 2);
    konvaElement.offsetY(konvaElement.height() / 2);
  } else if (konvaElement instanceof Konva.Circle) {
    konvaElement.offsetX(0); // Circle scales from center by default
    konvaElement.offsetY(0);
    
    // Add shadow for points
    konvaElement.shadowColor('#000');
    konvaElement.shadowBlur(0); // Start with no shadow
    konvaElement.shadowOpacity(0);
  } else { // Default for other shapes if needed
    konvaElement.offsetX(bounds.width / 2 / konvaElement.scaleX()); // Adjust for potential pre-scaling
    konvaElement.offsetY(bounds.height / 2 / konvaElement.scaleY());
  }
  
  // Ensure position is correct after setting offset
  konvaElement.x(konvaElement.x() + konvaElement.offsetX());
  konvaElement.y(konvaElement.y() + konvaElement.offsetY());

  // Choose appropriate easing based on element type and withPhysics flag
  const ease = withPhysics ? "elastic.out(1, 0.75)" : "back.out(1.7)";

  // Animate appearance with shadow
  gsap.to(konvaElement, {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    duration: duration * 0.8, // Slightly faster appearance
    delay: delay,
    ease: ease,
    onUpdate: () => layer.batchDraw(),
    onComplete: () => layer.batchDraw(),
  });

  // Add shadow animation for Circle elements
  if (konvaElement instanceof Konva.Circle) {
    gsap.to(konvaElement, {
      shadowBlur: 10,
      shadowOpacity: 0.3,
      duration: duration,
      delay: delay + duration * 0.2, // Slightly delayed shadow
      ease: "power2.out"
    });
  }
}

// Create pulsing animation for element
function animatePulse(konvaElement, duration = 1, scale = 1.1, repeat = -1) {
  gsap.to(konvaElement, {
    scaleX: scale,
    scaleY: scale,
    duration: duration / 2,
    yoyo: true,
    repeat: repeat,
    ease: "sine.inOut"
  });
}

// Animate fill opacity for shape
function animateFill(konvaShape, duration = 0.5, delay = 0, finalOpacity = 1) {
  gsap.to(konvaShape, {
    opacity: finalOpacity,
    duration: duration,
    delay: delay,
    ease: "power1.inOut"
  });
}

// Export utilities if in a module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    animateDrawLine,
    animateAppear,
    animatePulse,
    animateFill
  };
}
