/**
 * safety-orbit-geometry.js
 * Pure circle geometry for the safety orbit visualization. Same role as
 * orbit-geometry.js has for the homepage's ellipse system: the single
 * source of truth for "where is a point at this angle", owning no
 * timers, no event listeners, no animation state.
 *
 * Two coordinate spaces are in play, deliberately:
 *  - viewBox units (the SVG's own 0-300 space): rings, the scan arc,
 *    and the safety nodes all live here as native SVG shapes, so the
 *    browser scales them for free on resize; nothing here needs
 *    re-measuring when the container's pixel size changes.
 *  - container pixels: the rotating text labels are plain HTML (text
 *    needs normal font layout, an SVG <text> can't wrap or measure
 *    itself the same way), positioned with a CSS transform in the
 *    container's own pixel space, exactly like hero-label.html's
 *    chips. Converting a viewBox-unit radius into that pixel space
 *    only needs one number, the container's current scale factor
 *    relative to the 300-unit viewBox, computed by measureContainer().
 */

export const VIEWBOX_SIZE = 300;
export const VIEWBOX_CENTER = VIEWBOX_SIZE / 2;

/**
 * Measures the orbit container once and returns everything needed to
 * convert a viewBox-unit radius into real container pixels. Call this
 * only on init and on confirmed size changes, never inside the render
 * loop: it is the one place allowed to force layout.
 */
export function measureContainer(containerElement) {
  const rect = containerElement.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    centerX: rect.width / 2,
    centerY: rect.height / 2,
    // The container is a square (aspect-ratio: 1 / 1 in CSS), so one
    // ratio converts a viewBox-unit length to pixels in either axis.
    scale: rect.width / VIEWBOX_SIZE,
  };
}

/**
 * A point on a circle of the given radius and center, in whatever unit
 * space the caller's cx/cy/radius are already expressed in (viewBox
 * units for SVG shapes, pixels for the text labels). Writes into `out`
 * instead of allocating a new object per element per frame; pass
 * nothing to get a fresh object back.
 */
export function pointOnCircle(cx, cy, radius, theta, out) {
  const target = out || { x: 0, y: 0 };
  target.x = cx + radius * Math.cos(theta);
  target.y = cy + radius * Math.sin(theta);
  return target;
}

/**
 * An SVG arc path ("d" attribute) sweeping `sweepAngle` radians
 * starting at `startAngle`, on the circle of the given radius/center
 * (viewBox units). Used for the scanning arc, redrawn every frame as
 * its start angle advances.
 */
export function describeArc(cx, cy, radius, startAngle, sweepAngle) {
  const start = pointOnCircle(cx, cy, radius, startAngle);
  const end = pointOnCircle(cx, cy, radius, startAngle + sweepAngle);
  const largeArcFlag = Math.abs(sweepAngle) > Math.PI ? 1 : 0;
  const sweepFlag = sweepAngle >= 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} ${sweepFlag} ${end.x} ${end.y}`;
}
