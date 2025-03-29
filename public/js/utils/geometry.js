/**
 * Geometry utility functions for math visualizations
 */

// Reflect point p across the line defined by p1 and p2
function reflectPoint(p, p1, p2) {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  if (dx === 0 && dy === 0) return { ...p };

  const a = dy;
  const b = -dx;
  const c = -a * p1.x - b * p1.y;
  const denom = a * a + b * b;
  if (denom === 0) return { ...p };

  const t = -2 * (a * p.x + b * p.y + c) / denom;
  return { x: p.x + a * t, y: p.y + b * t };
}

// Find intersection of line segment (p1, p2) and RAY starting at p3 towards p4
// Returns {x, y} or null
function intersectSegmentRay(p1, p2, p3, p4) {
  const x1 = p1.x, y1 = p1.y, x2 = p2.x, y2 = p2.y; // Segment P'P''
  const x3 = p3.x, y3 = p3.y, x4 = p4.x, y4 = p4.y; // Ray O-A or O-B

  const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
  if (Math.abs(den) < 1e-6) { // Lines are parallel or coincident
    return null;
  }

  const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den; // Parameter for segment P'P''
  const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den; // Parameter for Ray O-A/B

  const epsilon = 1e-6;

  // Check if intersection is on the segment P'P'' (0 <= t <= 1)
  // AND on the ray starting from O (u >= 0)
  if (t >= -epsilon && t <= 1 + epsilon && u >= -epsilon) {
    return { x: x1 + t * (x2 - x1), y: y1 + t * (y2 - y1) };
  }

  return null; // Intersection not valid
}

// Calculate distance between two points
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Calculate angle between three points (angle at p2)
function angleBetween(p1, p2, p3) {
  const a = distance(p2, p3);
  const b = distance(p1, p2);
  const c = distance(p1, p3);
  
  // Law of cosines
  return Math.acos((a*a + b*b - c*c) / (2 * a * b));
}

// Export utilities if in a module environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    reflectPoint,
    intersectSegmentRay,
    distance,
    angleBetween
  };
}
