/**
 * orbit-animation.js
 * Drives the four orbiting dots and their paired text labels: one
 * centralized requestAnimationFrame loop, delta-time angular motion,
 * and lifecycle (resize/visibility). All ellipse math is delegated to
 * orbit-geometry.js, which is also what draws the static SVG paths, so
 * a dot's position and the visible line it rides on can never
 * mathematically disagree, see that file.
 *
 * Each "label" is actually two elements moved together every frame:
 *   - an SVG <circle> (the dot), living inside the same <svg> as the
 *     orbit paths, so it is rasterized by the exact same rendering
 *     pipeline as the line it must sit on;
 *   - an HTML chip (icon badge + text pill), positioned to the
 *     identical coordinate via a CSS transform, since text needs
 *     normal HTML layout.
 * See hero-label.html for how the two are paired up in markup.
 *
 * Ownership split, deliberately: JavaScript is the only thing that ever
 * writes either element's position (see positionLabel). Neither
 * .hero-orbit-dot nor .hero-orbit-label animates or transitions
 * transform in CSS, so there is exactly one system moving them, not two
 * fighting each other.
 *
 * Each label starts at a fixed phase (0 or PI, via its data-phase
 * attribute) on its orbit, so the two labels sharing an orbit are always
 * on opposite sides and can never collide.
 */

import {
  measureOrbitGeometry,
  drawOrbitPaths,
  pointOnOrbit,
  sideForPoint,
} from "./orbit-geometry.js";

const TWO_PI = Math.PI * 2;
const BASE_ANGULAR_SPEED = 0.28; // radians per second, shared speed budget
const MAX_FRAME_DELTA_SECONDS = 0.05; // clamp: one slow/late frame can
// never move a label further than this, however long it actually took

// Motion only (direction, relative speed). Shape lives in
// orbit-geometry.js's ORBIT_DEFINITIONS; this is a separate, small,
// animation-specific config keyed by the same orbit ids.
const ORBIT_MOTION = {
  a: { direction: 1, speedScale: 1 },
  b: { direction: -1, speedScale: 0.82 },
};

// How long the hero must stay out of view before the loop actually
// pauses. Debounced so a normal scroll past the hero's visibility
// boundary (which can toggle IntersectionObserver rapidly right at the
// edge) never visibly freezes the animation; a genuine "scrolled away
// and staying away" still pauses shortly after.
const VISIBILITY_STOP_DELAY_MS = 200;

let isInitialized = false;

let stageElement = null;
let svgElement = null;
let pathElementsById = {};
let labelStates = [];
let orbitModel = null;
let lastTimestamp = null;
let resizeScheduled = false;
let prefersReducedMotion = false;

let animationFrameId = null;
let isLoopRunning = false;
let heroIsIntersecting = true;
let pendingStopTimeoutId = null;

export function initializeOrbitAnimation() {
  // Guards against ever ending up with two parallel loops, two
  // ResizeObservers, or two IntersectionObservers if something calls
  // this more than once.
  if (isInitialized) return;

  stageElement = document.querySelector(".comrade-hero__stage");
  svgElement = document.querySelector(".hero-orbit-svg");
  if (!stageElement || !svgElement) return;

  isInitialized = true;

  pathElementsById = {
    a: svgElement.querySelector(".hero-orbit-path--a"),
    b: svgElement.querySelector(".hero-orbit-path--b"),
  };

  // Geometry is measured before building label state below, because
  // each label's fixed text side (see the comment on `side` below) is
  // derived from its starting position on this geometry.
  recalculateGeometry();

  labelStates = Array.from(
    document.querySelectorAll(".hero-orbit-label")
  ).map((element) => {
    const orbitId = element.dataset.orbit;
    const phase = element.dataset.phase;
    const theta = (Number(phase || 0) * Math.PI) / 180;
    const geometry = orbitModel.geometryById[orbitId];
    const startPoint = geometry ? pointOnOrbit(geometry, theta) : { x: 0, y: 0 };

    // The dot paired with this label lives in the SVG (see the note on
    // .hero-orbit-dot in orbit.css), matched by the same orbit + phase
    // the server rendered onto both elements.
    const dotElement = svgElement.querySelector(
      `.hero-orbit-dot[data-orbit="${orbitId}"][data-phase="${phase}"]`
    );

    return {
      element,
      dotElement,
      chipElement: element.querySelector(".hero-orbit-label__chip"),
      orbitId,
      theta,
      // Decided once from the label's starting position and never
      // recalculated: switching sides as the dot travels around the
      // ellipse meant the text kept re-anchoring mid-flight, which read
      // as jitter rather than motion. A single fixed side per label
      // keeps the text visually stable for the entire animation.
      side: geometry ? sideForPoint(startPoint.x, startPoint.y, geometry) : "right",
      // Reused every frame so positionLabel() never allocates a new
      // {x, y} object 4 times a frame; see pointOnOrbit()'s `out` param.
      point: { x: 0, y: 0 },
    };
  });

  labelStates.forEach((labelState) => {
    labelState.chipElement.dataset.side = labelState.side;
  });

  prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  positionAllLabels();

  // A ResizeObserver on the stage itself (rather than a window "resize"
  // listener) catches every reason the stage's own box can change size,
  // not just a viewport resize: a web font swap reflowing the hero
  // column, a breakpoint change, a zoom level change. Geometry is
  // recalculated, but every label's theta is left untouched, so a
  // resize reshapes the orbit without moving labels to a new phase.
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
 * it: the hero has scrolled out of view, or the browser tab itself is
 * backgrounded. The stop is debounced (see VISIBILITY_STOP_DELAY_MS) so
 * scrolling past the hero's edge doesn't rapidly stop/start it; the
 * resume itself is always immediate.
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
    if (pendingStopTimeoutId !== null) {
      clearTimeout(pendingStopTimeoutId);
      pendingStopTimeoutId = null;
    }
    startAnimationLoop();
    return;
  }

  if (pendingStopTimeoutId !== null || !isLoopRunning) return;
  pendingStopTimeoutId = window.setTimeout(() => {
    pendingStopTimeoutId = null;
    stopAnimationLoop();
  }, VISIBILITY_STOP_DELAY_MS);
}

function startAnimationLoop() {
  if (isLoopRunning) return;
  isLoopRunning = true;
  // A fresh timing reference on every (re)start, not just at first load:
  // this is what prevents a stale lastTimestamp from producing one huge
  // deltaSeconds (and a visible jump) after any pause, however it
  // happened. The current angle itself is never touched.
  lastTimestamp = null;
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
    recalculateGeometry();
    positionAllLabels();
    resizeScheduled = false;
  });
}

/** Re-measures the stage and redraws the (stationary) SVG paths from
 * the fresh geometry. Never called from inside animateOrbit. */
function recalculateGeometry() {
  orbitModel = measureOrbitGeometry(stageElement);
  drawOrbitPaths(svgElement, pathElementsById, orbitModel);
}

function positionLabel(labelState) {
  const geometry = orbitModel.geometryById[labelState.orbitId];
  if (!geometry) return;

  const point = pointOnOrbit(geometry, labelState.theta, labelState.point);

  // The SVG dot is moved with an SVG transform, in the SVG's own
  // coordinate space, the same space the ellipse path is drawn in.
  if (labelState.dotElement) {
    labelState.dotElement.setAttribute("transform", `translate(${point.x} ${point.y})`);
  }

  // The HTML text wrapper is positioned separately, to the identical
  // (x, y) coordinate, via a CSS transform.
  labelState.element.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`;
  // labelState.side is fixed at init (see initializeOrbitAnimation) and
  // never touched here: the text's offset direction never changes
  // mid-animation, only the dot's and text's shared position does.
}

function positionAllLabels() {
  labelStates.forEach(positionLabel);
}

/**
 * The single centralized render loop for the whole orbit system: one
 * requestAnimationFrame chain, not one per label. Every label's angle
 * advances by the same elapsed wall-clock time (delta-time), so speed
 * is independent of frame rate and immune to dropped frames.
 */
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
    const motion = ORBIT_MOTION[labelState.orbitId];
    if (!motion) return;

    const angularStep =
      BASE_ANGULAR_SPEED * motion.speedScale * motion.direction * deltaSeconds;
    labelState.theta = (labelState.theta + angularStep) % TWO_PI;
    positionLabel(labelState);
  });

  animationFrameId = requestAnimationFrame(animateOrbit);
}
