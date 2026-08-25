/**
 * orbit-geometry.js
 * Pure ellipse geometry for the crossed orbit system. This is the single
 * source of truth for "what shape is each orbit": measuring it from the
 * stage's size, drawing the static SVG paths from it, and calculating a
 * point on it for a given angle. Both the visible SVG line and every
 * moving dot in orbit-animation.js call the SAME pointOnOrbit() function
 * below, so they cannot mathematically drift apart. This file owns no
 * timers, no event listeners, and no animation state.
 *
 * Coordinate system: everything is in CSS pixels relative to the stage
 * element's own top-left corner, i.e. the same space the SVG's viewBox
 * and the absolutely-positioned label wrappers both already live in.
 *
 * A point at angle theta on the UNROTATED ellipse is:
 *   localX = radiusX * cos(theta)
 *   localY = radiusY * sin(theta)
 * The orbit's rotation is then applied with the standard rotation
 * matrix, around the same center the SVG's transform="rotate(deg, cx,
 * cy)" rotates around:
 *   x = centerX + localX * cos(rotation) - localY * sin(rotation)
 *   y = centerY + localX * sin(rotation) + localY * cos(rotation)
 * This is exactly what an SVG <ellipse cx cy rx ry> with that same
 * rotate() transform renders, point for point.
 */

// Shape only. Motion (direction, speed) is an animation concern and
// lives in orbit-animation.js instead.
export const ORBIT_DEFINITIONS = [
  {
    id: "a", // top-right to bottom-left
    rotationDeg: -25,
    radiusXRatio: 0.5,
    radiusYRatio: 0.3,
  },
  {
    id: "b", // top-left to bottom-right
    rotationDeg: 25,
    radiusXRatio: 0.46,
    radiusYRatio: 0.34,
  },
];

/**
 * Measures the stage once and builds the geometry model for every
 * orbit. Call this only on init and on confirmed size changes, never
 * inside the render loop: it is the one place allowed to read layout
 * (getBoundingClientRect forces it).
 */
export function measureOrbitGeometry(stageElement) {
  const stageRect = stageElement.getBoundingClientRect();
  const centerX = stageRect.width / 2;
  const centerY = stageRect.height / 2;

  const geometryById = {};
  ORBIT_DEFINITIONS.forEach((definition) => {
    const rotationRad = (definition.rotationDeg * Math.PI) / 180;
    geometryById[definition.id] = {
      centerX,
      centerY,
      radiusX: stageRect.width * definition.radiusXRatio,
      radiusY: stageRect.height * definition.radiusYRatio,
      rotationDeg: definition.rotationDeg,
      rotationRad,
      // The orbit's rotation is constant between resizes, so its cos/sin
      // are computed once here rather than every label, every frame, in
      // pointOnOrbit(). Two labels sharing an orbit also share this
      // value instead of each recomputing the identical numbers.
      cosRotation: Math.cos(rotationRad),
      sinRotation: Math.sin(rotationRad),
    };
  });

  return { width: stageRect.width, height: stageRect.height, geometryById };
}

/**
 * Draws the two static SVG ellipses directly from the measured
 * geometry. Uses the same cx/cy/rx/ry/rotation values pointOnOrbit()
 * below uses, so the drawn curve and the calculated points describe the
 * identical ellipse.
 */
export function drawOrbitPaths(svgElement, pathElementsById, orbitModel) {
  svgElement.setAttribute("viewBox", `0 0 ${orbitModel.width} ${orbitModel.height}`);

  Object.keys(orbitModel.geometryById).forEach((orbitId) => {
    const geometry = orbitModel.geometryById[orbitId];
    const pathElement = pathElementsById[orbitId];
    if (!pathElement) return;

    pathElement.setAttribute("cx", geometry.centerX);
    pathElement.setAttribute("cy", geometry.centerY);
    pathElement.setAttribute("rx", geometry.radiusX);
    pathElement.setAttribute("ry", geometry.radiusY);
    pathElement.setAttribute(
      "transform",
      `rotate(${geometry.rotationDeg} ${geometry.centerX} ${geometry.centerY})`
    );
  });
}

/**
 * The one point-on-ellipse formula, shared by every moving dot. Writes
 * into `out` (an {x, y} object the caller owns and reuses every frame)
 * instead of allocating a new object per label per frame; pass nothing
 * to get a fresh object back (e.g. for one-off calculations).
 */
export function pointOnOrbit(geometry, theta, out) {
  const localX = geometry.radiusX * Math.cos(theta);
  const localY = geometry.radiusY * Math.sin(theta);
  const target = out || { x: 0, y: 0 };

  target.x = geometry.centerX + localX * geometry.cosRotation - localY * geometry.sinRotation;
  target.y = geometry.centerY + localX * geometry.sinRotation + localY * geometry.cosRotation;

  return target;
}

/**
 * Which side of the dot the floating text should sit on, from the
 * dot's position relative to its own orbit's center. Whichever axis the
 * dot has moved further along wins, so text reads outward from the
 * composition instead of over the image.
 */
export function sideForPoint(x, y, geometry) {
  const dx = x - geometry.centerX;
  const dy = y - geometry.centerY;

  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }
  return dy >= 0 ? "bottom" : "top";
}
