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

  // Check for valid triangle sides (avoid NaN from acos if points are collinear/coincident)
  if (a <= 0 || b <= 0 || 2 * a * b === 0) {
      // Handle degenerate cases, e.g., return 0 or PI depending on arrangement
      // For simplicity, returning 0 if sides are invalid
      return 0; 
  }

  const cosTheta = (a*a + b*b - c*c) / (2 * a * b);
  
  // Clamp value to [-1, 1] to prevent floating point errors causing acos(>1)
  const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
  
  return Math.acos(clampedCosTheta);
}

// --- Functions moved from problem-specific utils ---

// Calculate the perpendicular point from a point to a line defined by lineStart and lineEnd
function perpendicularPointToLine(point, lineStart, lineEnd) {
  const lineVecX = lineEnd.x - lineStart.x;
  const lineVecY = lineEnd.y - lineStart.y;
  
  // Handle case where lineStart and lineEnd are the same point
  if (lineVecX === 0 && lineVecY === 0) {
      return { x: lineStart.x, y: lineStart.y }; // Return the start point
  }
  
  const pointVecX = point.x - lineStart.x;
  const pointVecY = point.y - lineStart.y;
  
  const dotProduct = pointVecX * lineVecX + pointVecY * lineVecY;
  const lineLengthSq = lineVecX * lineVecX + lineVecY * lineVecY;
  
  // Avoid division by zero if line has zero length (handled above, but belt-and-suspenders)
  if (lineLengthSq === 0) {
      return { x: lineStart.x, y: lineStart.y };
  }
  
  const ratio = dotProduct / lineLengthSq;
  
  const projectionPointX = lineStart.x + ratio * lineVecX;
  const projectionPointY = lineStart.y + ratio * lineVecY;
  
  return { x: projectionPointX, y: projectionPointY };
}

// Calculate intersection of two lines defined by points (line1Start, line1End) and (line2Start, line2End)
function lineIntersection(line1Start, line1End, line2Start, line2End) {
  const a1 = line1End.y - line1Start.y;
  const b1 = line1Start.x - line1End.x;
  const c1 = a1 * line1Start.x + b1 * line1Start.y;
  
  const a2 = line2End.y - line2Start.y;
  const b2 = line2Start.x - line2End.x;
  const c2 = a2 * line2Start.x + b2 * line2Start.y;
  
  const det = a1 * b2 - a2 * b1;
  
  // Use a small epsilon for floating point comparison
  const epsilon = 1e-9; 
  if (Math.abs(det) < epsilon) {
    // Lines are parallel or coincident
    console.warn("lineIntersection: Lines are parallel or coincident. No unique intersection point.");
    return null; 
  } else {
    const x = (b2 * c1 - b1 * c2) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    return { x, y };
  }
}

// Calculate an extended point along the line from lineStart through lineEnd
function extendLine(lineStart, lineEnd, extensionFactor = 2) {
  // If extensionFactor is 1, it just returns lineEnd. 
  // If 0, returns lineStart. If 2, doubles the vector length from start.
  return {
    x: lineStart.x + extensionFactor * (lineEnd.x - lineStart.x),
    y: lineStart.y + extensionFactor * (lineEnd.y - lineStart.y)
  };
}

// Calculate the midpoint between two points
function midpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

// Calculate length ratio of segments (p1 to p2) / (p2 to p3)
function lengthRatio(p1, p2, p3) {
  const len1 = distance(p1, p2);
  const len2 = distance(p2, p3);
  
  // Avoid division by zero if p2 and p3 are the same point
  if (len2 < 1e-9) { 
      console.warn("lengthRatio: Distance between p2 and p3 is zero. Cannot calculate ratio.");
      // Return NaN, Infinity, or handle as appropriate for the calling context.
      // Returning NaN might be safest to indicate an invalid calculation.
      return NaN; 
  }
  return len1 / len2;
}


// Export utilities if in a module environment (optional, depends on usage)
// Keep this check, although current setup seems global script loading
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    reflectPoint,
    intersectSegmentRay,
    distance,
    angleBetween,
    perpendicularPointToLine,
    lineIntersection,
    extendLine,
    midpoint,
    lengthRatio
  };
}
