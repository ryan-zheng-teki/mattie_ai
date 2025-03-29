/**
 * Configuration for the Minimum Perimeter Triangle visualization
 */
const config = {
  // These will be initialized after stage is created
  origin: { x: 0, y: 0 },
  angleA: -Math.PI / 10, // Angle for OA (closer to horizontal)
  angleB: -Math.PI / 2.8, // Angle for OB (steeper)
  rayLength: 0,
  pointP: { x: 0, y: 0 },
  pointA: { x: 0, y: 0 },
  pointB: { x: 0, y: 0 },
  
  // Colors
  colors: {
    rays: '#333',
    pointP: '#ff5722', // Deep Orange
    pointP_prime: '#e91e63', // Pink
    pointP_double_prime: '#03a9f4', // Blue
    pointsCD: '#4caf50', // Green
    constructionLine: '#ff9800', // Orange
    finalTriangle: '#d50000', // Red
    labels: '#555',
    helperLines: '#aaa'
  },
  
  // Enhanced styling properties
  styles: {
    pointShadowBlur: 10,
    pointShadowOpacity: 0.3,
    rayGlow: 5,
    triangleLineWidth: 3.5,
    pointRadius: 7
  },
  
  // Animation settings
  animDuration: 0.8, // Duration for drawing animations (in seconds)
  
  // Enhanced easing options
  easing: {
    draw: "power2.out",
    appear: "back.out(1.7)",
    move: "elastic.out(1, 0.75)"
  }
};
