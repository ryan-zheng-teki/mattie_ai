/**
 * Configuration for the Semicircle Perpendicular Equality visualization
 */
const config = {
  // These will be initialized after stage is created
  circleRadius: 0, // Will be set based on stage dimensions
  origin: { x: 0, y: 0 }, // Center of the semicircle
  pointA: { x: 0, y: 0 },
  pointB: { x: 0, y: 0 },
  pointC: { x: 0, y: 0 },
  pointD: { x: 0, y: 0 },
  pointE: { x: 0, y: 0 },
  pointF: { x: 0, y: 0 },
  pointG: { x: 0, y: 0 },
  
  // Angle constraints (for initial placement)
  angleC: Math.PI / 4, // Initial angle for point C (45 degrees)
  angleE: Math.PI * 3 / 4, // Initial angle for point E (135 degrees)

  // Colors
  colors: {
    circle: '#333',
    diameter: '#555',
    pointA: '#e91e63', // Pink
    pointB: '#ff5722', // Deep Orange
    pointC: '#4caf50', // Green
    pointD: '#03a9f4', // Blue
    pointE: '#9c27b0', // Purple
    pointF: '#ff9800', // Orange
    pointG: '#795548', // Brown
    pointO: '#607d8b', // Blue Grey
    lineCD: '#673ab7', // Deep Purple
    lineEF: '#2196f3', // Lighter Blue
    lineCO: '#f44336', // Red
    lineEG: '#009688', // Teal
    triangleCOD: 'rgba(233, 30, 99, 0.2)', // Light Pink (20% opacity)
    triangleEGF: 'rgba(0, 150, 136, 0.2)', // Light Teal (20% opacity)
    labels: '#555',
    helperLines: '#aaa',
    gridLines: '#e0e0e0',
    background: ['#f9f9ff', '#eef5ff'],
    highlight: '#ff5252'
  },

  // Enhanced styling properties
  styles: {
    pointShadowBlur: 10,
    pointShadowOpacity: 0.3,
    lineGlow: 5,
    lineWidth: 2.5,
    pointRadius: 7,
    labelFontSize: 18,
    gridSpacing: 20
  },

  // Animation settings
  animDuration: 0.8, // Duration for drawing animations (in seconds)
  autoModeStepDelay: 2500, // Delay between auto mode steps in milliseconds (e.g., 2.5 seconds)

  // Enhanced easing options
  easing: {
    draw: "power2.out",
    appear: "back.out(1.7)",
    move: "elastic.out(1, 0.75)"
  }
};
