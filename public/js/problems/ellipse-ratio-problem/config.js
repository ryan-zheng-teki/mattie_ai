/**
 * Configuration for the Ellipse Ratio Problem visualization
 */
const config = {
  // These will be initialized after stage is created
  stageWidth: 0,
  stageHeight: 0,
  origin: { x: 0, y: 0 }, // Will be set to center of the stage
  scale: 0, // Pixels per unit, will be set based on stage size
  
  // Ellipse parameters
  ellipseC: {
    a: 2, // Semi-major axis (√4 = 2)
    b: 1, // Semi-minor axis
    equation: "x²/4 + y² = 1"
  },
  
  ellipseE: {
    a: 4, // Semi-major axis (√16 = 4)
    b: 2, // Semi-minor axis (√4 = 2)
    equation: "x²/16 + y²/4 = 1"
  },
  
  // Points that will be calculated
  pointP: { x: 0, y: 0 }, // Will be set dynamically
  pointQ: { x: 0, y: 0 }, // Will be set dynamically
  
  // Fixed angle for initial position of P (can be changed)
  initialAngle: Math.PI/4, // 45 degrees
  
  // Colors
  colors: {
    axes: '#333',
    grid: '#e0e0e0',
    ellipseC: '#3f51b5', // Indigo
    ellipseE: '#e91e63', // Pink
    pointO: '#212121', // Almost Black
    pointP: '#4caf50', // Green
    pointQ: '#ff9800', // Orange
    rayOP: '#673ab7', // Deep Purple
    rayOQ: '#00bcd4', // Cyan (continuation of rayOP)
    labels: '#555',
    ratioHighlight: '#f44336', // Red
    background: ['#f9f9ff', '#eef5ff']
  },

  // Enhanced styling properties
  styles: {
    axisWidth: 2,
    ellipseWidth: 2.5,
    ellipseDashC: [], // Solid line
    ellipseDashE: [], // Solid line
    rayWidth: 2,
    pointRadius: 6,
    labelFontSize: 16,
    gridSpacing: 20,
    axisOffset: 10, // How far axis labels are offset from the axis
    tickSize: 5 // Size of axis ticks
  },

  // Animation settings
  animDuration: 0.8, // Duration for drawing animations (in seconds)
  autoModeStepDelay: 2500, // Delay between auto mode steps in milliseconds

  // Enhanced easing options
  easing: {
    draw: "power2.out",
    appear: "back.out(1.7)",
    move: "elastic.out(1, 0.75)"
  }
};
