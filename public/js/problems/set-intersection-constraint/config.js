/**
 * Configuration for the Set Intersection Constraint visualization
 */
const config = {
  // Canvas dimensions (will be initialized after stage creation)
  canvasWidth: 0,
  canvasHeight: 0,
  
  // Mathematical parameters
  omega: 1.0,          // Current ω value
  n: 5,                // Current interval size
  a: 0,                // Current interval start position
  maxElements: 100,    // Maximum number of elements to display
  
  // Set analysis parameters
  modulus: 7,          // The modulus for divisibility (7 in this problem)
  representativePower: 4, // Use 2^4 instead of 2^2025 for calculation (same modulo 7)
  
  // Visualization parameters
  numberLineYPos: 0,   // Y-position of the number line
  elementsRadius: 6,   // Radius of set elements on the visualization
  intervalHeight: 80,  // Height of the interval visualization
  elementSpacing: 25,  // Spacing between elements on the number line
  
  // Animation settings
  animDuration: 0.8,   // Duration for animations (in seconds)
  
  // Colors
  colors: {
    background: '#f9f9ff',
    numberLine: '#555',
    setElements: '#4285f4',  // Blue for set elements
    interval: '#34a853',     // Green for interval
    intersection: '#ea4335', // Red for intersection
    annotation: '#666',
    grid: '#ddd',
    controlPoint: '#ff5722'  // Deep orange for control points
  },
  
  // Styles
  styles: {
    lineWidth: 2,
    elementStrokeWidth: 1.5,
    highlightGlow: 10,
    dashedLine: [6, 3],
    annotationFontSize: 14
  },
  
  // Easing options
  easing: {
    draw: "power2.out",
    appear: "back.out(1.7)",
    move: "elastic.out(1, 0.75)"
  }
};
