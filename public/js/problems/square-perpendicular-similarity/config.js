/**
 * Configuration for the Square Perpendicular Similarity visualization
 */
const config = {
  // These will be initialized after stage is created
  squareSize: 0, // Will be set based on stage dimensions
  origin: { x: 0, y: 0 }, // Bottom-left corner of the square
  pointA: { x: 0, y: 0 },
  pointB: { x: 0, y: 0 },
  pointC: { x: 0, y: 0 },
  pointD: { x: 0, y: 0 },
  pointE: { x: 0, y: 0 },
  pointF: { x: 0, y: 0 },
  pointG: { x: 0, y: 0 },
  pointH: { x: 0, y: 0 },
  pointI: { x: 0, y: 0 },

  // Colors
  colors: {
    square: '#333',
    pointA: '#e91e63', // Pink
    pointB: '#ff5722', // Deep Orange
    pointC: '#4caf50', // Green
    pointD: '#03a9f4', // Blue
    pointE: '#9c27b0', // Purple
    pointF: '#ff9800', // Orange
    pointG: '#795548', // Brown
    pointH: '#607d8b', // Blue Grey
    pointI: '#ffc107', // Amber
    lineAE: '#673ab7', // Deep Purple
    lineBG: '#2196f3', // Lighter Blue
    lineCF: '#f44336', // Red
    lineEH: '#009688', // Teal
    lineAH: '#cddc39', // Lime
    // Increased opacity for triangle fills for better visibility
    triangleABG: 'rgba(233, 30, 99, 0.4)', // Light Pink (40% opacity)
    triangleBCH: 'rgba(0, 150, 136, 0.4)', // Light Teal (40% opacity)
    labels: '#555',
    helperLines: '#aaa',
    gridLines: '#e0e0e0',
    background: ['#f9f9ff', '#eef5ff']
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
