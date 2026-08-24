/**
 * orbit-animation.js
 * The crossed orbital system: two independent elliptical paths, each
 * carrying two labels that travel continuously along the exact ellipse
 * geometry. This file only calculates and applies orbital positions; it
 * does not handle entrance reveals, navbar, or any other concern.
 *
 * Each label's position is derived every frame from a rotated-ellipse
 * parametric equation:
 *   localX = rx * cos(theta)
 *   localY = ry * sin(theta)
 *   x = centerX + localX * cos(rotation) - localY * sin(rotation)
 *   y = centerY + localX * sin(rotation) + localY * cos(rotation)
 *
 * The two labels sharing an orbit start at a phase offset of PI (180deg,
 * supplied via each element's data-phase attribute), so they can never
 * collide: they are always on opposite sides of the same ellipse.
 */

const TWO_PI = Math.PI * 2;
const BASE_ANGULAR_SPEED = 0.28; // radians per second, shared speed budget
const MAX_FRAME_DELTA_SECONDS = 0.05; // clamp to avoid jumps after tab idle

const ORBIT_DEFINITIONS = [
  {
    id: "a", // top-right to bottom-left
    rotationDeg: -25,
    radiusXRatio: 0.5,
    radiusYRatio: 0.3,
    direction: 1,
    speedScale: 1,
  },
  {
    id: "b", // top-left to bottom-right
    rotationDeg: 25,
    radiusXRatio: 0.46,
    radiusYRatio: 0.34,
    direction: -1,
    speedScale: 0.82,
  },
];

let stageElement = null;
let svgElement = null;
let pathElementsByOrbit = {};
let labelStates = [];
let orbitGeometryById = {};
let lastTimestamp = null;
let resizeScheduled = false;
let prefersReducedMotion = false;

// Centralized play/pause state. The loop only actually runs while the
// hero is on screen AND the tab itself is visible, so the orbit never
// burns CPU animating something nobody can see.
let animationFrameId = null;
let isLoopRunning = false;
let heroIsIntersecting = true;

export function initializeOrbitAnimation() {
  stageElement = document.querySelector(".comrade-hero__stage");
  svgElement = document.querySelector(".hero-orbit-svg");
  if (!stageElement || !svgElement) return;

  pathElementsByOrbit = {
    a: svgElement.querySelector(".hero-orbit-path--a"),
    b: svgElement.querySelector(".hero-orbit-path--b"),
  };

  labelStates = Array.from(
    document.querySelectorAll(".hero-orbit-label")
  ).map((element) => ({
    element,
    textElement: element.querySelector(".hero-orbit-label__text"),
    orbitId: element.dataset.orbit,
    theta: (Number(element.dataset.phase || 0) * Math.PI) / 180,
    lastSide: "right",
  }));

  prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  recalculateOrbitGeometry();
  drawOrbitPaths();
  positionAllLabels();

  // A ResizeObserver on the stage itself (rather than a window "resize"
  // listener) is deliberate: it catches every reason the stage's own box
  // can change size, not just a viewport resize, e.g. a web font finishing
  // its swap and reflowing the hero column, a breakpoint change, or a
  // zoom level change. Without it the orbit geometry could go stale and
  // the labels would drift away from the image.
  if ("ResizeObserver" in window) {
    const stageResizeObserver = new ResizeObserver(scheduleGeometryRecalculation);
    stageResizeObserver.observe(stageElement);
  } else {
    window.addEventListener("resize", scheduleGeometryRecalculation, {
      passive: true,
    });
  }

  setUpVisibilityControl();
  updateAnimationRunState();
}

/**
 * Pauses the single animation loop whenever nobody could possibly see
 * it: the hero has scrolled out of view, or the browser tab itself is in
 * the background. Resumes smoothly (no jump) when it can be seen again.
 */
function setUpVisibilityControl() {
  if ("IntersectionObserver" in window) {
    const heroVisibilityObserver = new IntersectionObserver(
      (entries) => {
        heroIsIntersecting = entries[0].isIntersecting;
        updateAnimationRunState();
      },
      { threshold: 0.05 }
    );
    heroVisibilityObserver.observe(stageElement);
  }

  document.addEventListener("visibilitychange", updateAnimationRunState);
}

function updateAnimationRunState() {
  const shouldRun =
    !prefersReducedMotion &&
    heroIsIntersecting &&
    document.visibilityState === "visible";

  if (shouldRun) {
    startAnimationLoop();
  } else {
    stopAnimationLoop();
  }
}

function startAnimationLoop() {
  if (isLoopRunning) return;
  isLoopRunning = true;
  lastTimestamp = null; // avoid a large delta on the first resumed frame
  animationFrameId = requestAnimationFrame(animateOrbit);
}

function stopAnimationLoop() {
  isLoopRunning = false;
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function scheduleGeometryRecalculation() {
  if (resizeScheduled) return;
  resizeScheduled = true;
  requestAnimationFrame(() => {
    recalculateOrbitGeometry();
    drawOrbitPaths();
    positionAllLabels();
    resizeScheduled = false;
  });
}

/** Recalculate center/radii once, from the current stage size only. */
function recalculateOrbitGeometry() {
  const stageRect = stageElement.getBoundingClientRect();
  const centerX = stageRect.width / 2;
  const centerY = stageRect.height / 2;

  svgElement.setAttribute("viewBox", `0 0 ${stageRect.width} ${stageRect.height}`);

  orbitGeometryById = {};
  ORBIT_DEFINITIONS.forEach((definition) => {
    orbitGeometryById[definition.id] = {
      centerX,
      centerY,
      radiusX: stageRect.width * definition.radiusXRatio,
      radiusY: stageRect.height * definition.radiusYRatio,
      rotationRad: (definition.rotationDeg * Math.PI) / 180,
      direction: definition.direction,
      speedScale: definition.speedScale,
    };
  });
}

/** Draw the two static elliptical tracks. They never move or rotate. */
function drawOrbitPaths() {
  ORBIT_DEFINITIONS.forEach((definition) => {
    const geometry = orbitGeometryById[definition.id];
    const pathElement = pathElementsByOrbit[definition.id];
    if (!geometry || !pathElement) return;

    pathElement.setAttribute("cx", geometry.centerX);
    pathElement.setAttribute("cy", geometry.centerY);
    pathElement.setAttribute("rx", geometry.radiusX);
    pathElement.setAttribute("ry", geometry.radiusY);
    pathElement.setAttribute(
      "transform",
      `rotate(${definition.rotationDeg} ${geometry.centerX} ${geometry.centerY})`
    );
  });
}

function calculateEllipsePosition(geometry, theta) {
  const localX = geometry.radiusX * Math.cos(theta);
  const localY = geometry.radiusY * Math.sin(theta);
  const cosRotation = Math.cos(geometry.rotationRad);
  const sinRotation = Math.sin(geometry.rotationRad);

  return {
    x: geometry.centerX + localX * cosRotation - localY * sinRotation,
    y: geometry.centerY + localX * sinRotation + localY * cosRotation,
  };
}

/**
 * Which side of the dot the floating text should sit on, based on the
 * dot's current position relative to the orbit center. Whichever axis
 * (horizontal/vertical) the dot has moved further along wins, so the
 * text always reads outward from the composition rather than over it.
 */
function determineLabelSide(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "right" : "left";
  }
  return dy >= 0 ? "bottom" : "top";
}

function positionLabel(labelState) {
  const geometry = orbitGeometryById[labelState.orbitId];
  if (!geometry) return;

  const { x, y } = calculateEllipsePosition(geometry, labelState.theta);

  // The wrapper carries the position; the dot and text (see orbit.css)
  // are positioned relative to that same (0, 0) origin, so they travel
  // together as one object without recomputing their own transforms.
  labelState.element.style.transform = `translate3d(${x}px, ${y}px, 0)`;

  const side = determineLabelSide(x - geometry.centerX, y - geometry.centerY);
  if (side !== labelState.lastSide) {
    labelState.textElement.dataset.side = side;
    labelState.lastSide = side;
  }
}

function positionAllLabels() {
  labelStates.forEach(positionLabel);
}

/** The single centralized render loop: advances every orbit's angle by
 * the same delta-time step, then repositions every label from it. There
 * is deliberately only one requestAnimationFrame chain for the whole
 * orbit system, not one per label. */
function animateOrbit(timestamp) {
  if (!isLoopRunning) return;

  if (lastTimestamp === null) {
    lastTimestamp = timestamp;
  }
  const deltaSeconds = Math.min(
    (timestamp - lastTimestamp) / 1000,
    MAX_FRAME_DELTA_SECONDS
  );
  lastTimestamp = timestamp;

  labelStates.forEach((labelState) => {
    const geometry = orbitGeometryById[labelState.orbitId];
    if (!geometry) return;

    const angularStep =
      BASE_ANGULAR_SPEED * geometry.speedScale * geometry.direction * deltaSeconds;
    labelState.theta = (labelState.theta + angularStep) % TWO_PI;
    positionLabel(labelState);
  });

  animationFrameId = requestAnimationFrame(animateOrbit);
}
