/**
 * Geometric helper functions for the Square Perpendicular Similarity visualization
 */

// Calculate the perpendicular point from a point to a line
function perpendicularPointToLine(point, lineStart, lineEnd) {
  // Vector from lineStart to lineEnd
  const lineVec = {
    x: lineEnd.x - lineStart.x,
    y: lineEnd.y - lineStart.y
  };
  
  // Vector from lineStart to point
  const pointVec = {
    x: point.x - lineStart.x,
    y: point.y - lineStart.y
  };
  
  // Calculate dot product
  const dotProduct = pointVec.x * lineVec.x + pointVec.y * lineVec.y;
  
  // Calculate squared length of line
  const lineLengthSq = lineVec.x * lineVec.x + lineVec.y * lineVec.y;
  
  // Calculate projection ratio
  const ratio = dotProduct / lineLengthSq;
  
  // Calculate projection point
  const projectionPoint = {
    x: lineStart.x + ratio * lineVec.x,
    y: lineStart.y + ratio * lineVec.y
  };
  
  return projectionPoint;
}

// Calculate intersection of two lines defined by points
function lineIntersection(line1Start, line1End, line2Start, line2End) {
  // Line 1 coefficients
  const a1 = line1End.y - line1Start.y;
  const b1 = line1Start.x - line1End.x;
  const c1 = a1 * line1Start.x + b1 * line1Start.y;
  
  // Line 2 coefficients
  const a2 = line2End.y - line2Start.y;
  const b2 = line2Start.x - line2End.x;
  const c2 = a2 * line2Start.x + b2 * line2Start.y;
  
  // Determinant
  const det = a1 * b2 - a2 * b1;
  
  if (Math.abs(det) < 1e-6) {
    // Lines are parallel or coincident
    return null;
  } else {
    // Calculate intersection
    const x = (b2 * c1 - b1 * c2) / det;
    const y = (a1 * c2 - a2 * c1) / det;
    return { x, y };
  }
}

// Calculate extended point from a line in the direction of the line
function extendLine(lineStart, lineEnd, extensionFactor = 2) {
  return {
    x: lineEnd.x + extensionFactor * (lineEnd.x - lineStart.x),
    y: lineEnd.y + extensionFactor * (lineEnd.y - lineStart.y)
  };
}

// Calculate distance between two points
function distance(p1, p2) {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

// Calculate the midpoint of two points
function midpoint(p1, p2) {
  return {
    x: (p1.x + p2.x) / 2,
    y: (p1.y + p2.y) / 2
  };
}

// Calculate length ratio of line segments
function lengthRatio(p1, p2, p3) {
  // Calculate length of p1p2 to p2p3
  const len1 = distance(p1, p2);
  const len2 = distance(p2, p3);
  return len1 / len2;
}
