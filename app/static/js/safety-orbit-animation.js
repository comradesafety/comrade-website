/**
 * safety-orbit-animation.js
 * Drives the safety orbit visualization: the rotating safety-word ring,
 * the scanning arc, and the safety nodes (plus their inner-ring
 * connector lines) — one centralized requestAnimationFrame loop,
 * delta-time angular motion, and lifecycle (resize/visibility/reduced
 * motion), following the same shape as orbit-animation.js. All circle
 * math is delegated to safety-orbit-geometry.js.
 *
 * Deliberately NOT driven by JS: the shield's glow pulse and the
 * protection ripple (plain CSS @keyframes in safety-orbit.css) and the
 * per-node opacity breathing (also CSS, staggered per node). Neither
 * needs to synchronize with anything else moving, so giving them their
 * own simple CSS animations keeps this file focused on the motion that
 * actually requires shared, cached geometry.
 *
 * The center shield itself is never touched by this file at all: it
 * has no theta, no transform, nothing to animate here. That is what
 * keeps it visually stable while everything else moves around it.
 */

import { measureContainer, pointOnCircle, describeArc, VIEWBOX_CENTER } from "./safety-orbit-geometry.js";

const TWO_PI = Math.PI * 2;
const MAX_FRAME_DELTA_SECONDS = 0.05;
const VISIBILITY_STOP_DELAY_MS = 200;

// Shape (radius, in viewBox units) is fixed by the SVG markup itself
// (see safety-orbit.html / safety-orbit.css); this is motion only.
// The viewBox is 300 units (150 half-width), and the text labels are
// plain HTML text with real rendered width, not a zero-width point on
// the circle — TEXT_RADIUS_VIEWBOX therefore has to leave real margin
// short of that 150 edge for a word's own width to fit inside the
// component's box, not just for the anchor point itself.
const TEXT_RADIUS_VIEWBOX = 122;
const NODE_RADIUS_VIEWBOX = 74;
const SCAN_RADIUS_VIEWBOX = 96;
const SCAN_SWEEP_RAD = (46 * Math.PI) / 180;
const INNER_RING_RADIUS_VIEWBOX = 52; // node-link connectors end here

const TEXT_ANGULAR_SPEED = TWO_PI / 26; // one revolution per 26s, clockwise
const NODE_ANGULAR_SPEED = TWO_PI / 42; // one revolution per 42s, clockwise
const SCAN_ANGULAR_SPEED = TWO_PI / 7; // one sweep-around per 7s, counter-clockwise

// Multiplies the scan's angular speed while the pointer is hovering the
// composition, per the "scan slows slightly" hover response.
const HOVER_SCAN_SPEED_SCALE = 0.55;

// How far the outer layers (rings/scan/nodes/text) drift toward the
// pointer, in container pixels, at most. The center shield gets none of
// this: see the file header.
const PARALLAX_MAX_PX = 3;
const PARALLAX_EASE = 0.08;

const instances = [];
let isInitialized = false;

export function initializeSafetyOrbit() {
  // Guards against ever ending up with two parallel loops driving the
  // same DOM elements, the same reasoning orbit-animation.js guards
  // itself for.
  if (isInitialized) return;
  isInitialized = true;

  const roots = document.querySelectorAll("[data-safety-orbit]");
  roots.forEach((root) => {
    const instance = createInstance(root);
    if (instance) instances.push(instance);
  });
}

function createInstance(root) {
  const svg = root.querySelector(".comrade-safety-orbit__svg");
  const textLayer = root.querySelector(".comrade-safety-orbit__text-ring");
  const scanPath = root.querySelector(".comrade-safety-orbit__scan-arc");
  const nodeGroup = root.querySelector(".comrade-safety-orbit__nodes");
  if (!svg || !textLayer) return null;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const words = Array.from(textLayer.querySelectorAll(".comrade-safety-orbit__word")).map(
    (element, index, all) => ({
      element,
      theta: (index / all.length) * TWO_PI,
      halfWidth: 0,
      halfHeight: 0,
    })
  );

  const nodeElements = nodeGroup ? Array.from(nodeGroup.querySelectorAll(".comrade-safety-orbit__node")) : [];
  const nodes = nodeElements.map((element, index) => ({
    element,
    link: nodeGroup.querySelector(`.comrade-safety-orbit__node-link[data-node="${index}"]`),
    theta: (index / nodeElements.length) * TWO_PI,
  }));

  const state = {
    root,
    svg,
    textLayer,
    scanPath,
    words,
    nodes,
    container: measureContainer(root),
    scanTheta: 0,
    isHovered: false,
    parallaxTargetX: 0,
    parallaxTargetY: 0,
    parallaxX: 0,
    parallaxY: 0,
    prefersReducedMotion,
    lastTimestamp: null,
    animationFrameId: null,
    isLoopRunning: false,
    isIntersecting: true,
    pendingStopTimeoutId: null,
  };

  measureWordSizes(state);
  renderStaticFrame(state);

  if (prefersReducedMotion) {
    // Composition stays fully intact (rings, shield, one fixed position
    // per moving element); nothing here ever starts moving.
    return state;
  }

  if (supportsHover) {
    root.addEventListener("pointerenter", () => {
      state.isHovered = true;
      root.classList.add("is-hovered");
    });
    root.addEventListener("pointerleave", () => {
      state.isHovered = false;
      root.classList.remove("is-hovered");
      state.parallaxTargetX = 0;
      state.parallaxTargetY = 0;
    });
    root.addEventListener("pointermove", (event) => {
      const rect = root.getBoundingClientRect();
      const normalizedX = (event.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const normalizedY = (event.clientY - rect.top) / rect.height - 0.5;
      state.parallaxTargetX = normalizedX * 2 * PARALLAX_MAX_PX;
      state.parallaxTargetY = normalizedY * 2 * PARALLAX_MAX_PX;
    });
  }

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => scheduleRecalculation(state));
    resizeObserver.observe(root);
  } else {
    window.addEventListener("resize", () => scheduleRecalculation(state), { passive: true });
  }

  setUpVisibilityControl(state);
  updateAnimationRunState(state);

  return state;
}

function measureWordSizes(state) {
  state.words.forEach((word) => {
    word.halfWidth = word.element.offsetWidth / 2;
    word.halfHeight = word.element.offsetHeight / 2;
  });
}

let resizeScheduled = new WeakSet();

function scheduleRecalculation(state) {
  if (resizeScheduled.has(state)) return;
  resizeScheduled.add(state);
  requestAnimationFrame(() => {
    state.container = measureContainer(state.root);
    measureWordSizes(state);
    renderStaticFrame(state);
    resizeScheduled.delete(state);
  });
}

function setUpVisibilityControl(state) {
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        state.isIntersecting = entries[0].isIntersecting;
        updateAnimationRunState(state);
      },
      { threshold: 0.05 }
    );
    observer.observe(state.root);
  }
  document.addEventListener("visibilitychange", () => updateAnimationRunState(state));
}

function updateAnimationRunState(state) {
  const shouldRun = state.isIntersecting && document.visibilityState === "visible";

  if (shouldRun) {
    if (state.pendingStopTimeoutId !== null) {
      clearTimeout(state.pendingStopTimeoutId);
      state.pendingStopTimeoutId = null;
    }
    startLoop(state);
    return;
  }

  if (state.pendingStopTimeoutId !== null || !state.isLoopRunning) return;
  state.pendingStopTimeoutId = window.setTimeout(() => {
    state.pendingStopTimeoutId = null;
    stopLoop(state);
  }, VISIBILITY_STOP_DELAY_MS);
}

function startLoop(state) {
  if (state.isLoopRunning) return;
  state.isLoopRunning = true;
  // Fresh timing reference on every (re)start, the same way
  // orbit-animation.js does it: this is what stops a stale timestamp
  // from producing one huge delta (and a visible jump) after a pause,
  // however that pause happened. Every angle is left exactly where it
  // was, so motion resumes from its current phase, never resets.
  state.lastTimestamp = null;
  state.animationFrameId = requestAnimationFrame((timestamp) => tick(state, timestamp));
}

function stopLoop(state) {
  state.isLoopRunning = false;
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }
}

function tick(state, timestamp) {
  if (!state.isLoopRunning) return;

  if (state.lastTimestamp === null) state.lastTimestamp = timestamp;
  const deltaSeconds = Math.min((timestamp - state.lastTimestamp) / 1000, MAX_FRAME_DELTA_SECONDS);
  state.lastTimestamp = timestamp;

  const scanSpeedScale = state.isHovered ? HOVER_SCAN_SPEED_SCALE : 1;

  state.words.forEach((word) => {
    word.theta = (word.theta + TEXT_ANGULAR_SPEED * deltaSeconds) % TWO_PI;
  });
  state.nodes.forEach((node) => {
    node.theta = (node.theta + NODE_ANGULAR_SPEED * deltaSeconds) % TWO_PI;
  });
  state.scanTheta = (state.scanTheta - SCAN_ANGULAR_SPEED * scanSpeedScale * deltaSeconds) % TWO_PI;

  state.parallaxX += (state.parallaxTargetX - state.parallaxX) * PARALLAX_EASE;
  state.parallaxY += (state.parallaxTargetY - state.parallaxY) * PARALLAX_EASE;

  render(state);

  state.animationFrameId = requestAnimationFrame((nextTimestamp) => tick(state, nextTimestamp));
}

/** One-shot positioning used for the initial paint and after a resize,
 * without needing the loop to be running (e.g. reduced-motion). */
function renderStaticFrame(state) {
  render(state);
}

function render(state) {
  const { container } = state;
  const parallaxTransform = `translate(${state.parallaxX}px, ${state.parallaxY}px)`;
  state.svg.style.transform = parallaxTransform;
  state.textLayer.style.transform = parallaxTransform;

  state.words.forEach((word) => {
    const point = pointOnCircle(
      container.centerX,
      container.centerY,
      TEXT_RADIUS_VIEWBOX * container.scale,
      word.theta
    );
    word.element.style.transform = `translate3d(${point.x - word.halfWidth}px, ${point.y - word.halfHeight}px, 0)`;
  });

  state.nodes.forEach((node) => {
    const point = pointOnCircle(VIEWBOX_CENTER, VIEWBOX_CENTER, NODE_RADIUS_VIEWBOX, node.theta);
    node.element.setAttribute("cx", point.x);
    node.element.setAttribute("cy", point.y);
    if (node.link) {
      const innerPoint = pointOnCircle(VIEWBOX_CENTER, VIEWBOX_CENTER, INNER_RING_RADIUS_VIEWBOX, node.theta);
      node.link.setAttribute("x1", point.x);
      node.link.setAttribute("y1", point.y);
      node.link.setAttribute("x2", innerPoint.x);
      node.link.setAttribute("y2", innerPoint.y);
    }
  });

  if (state.scanPath) {
    state.scanPath.setAttribute(
      "d",
      describeArc(VIEWBOX_CENTER, VIEWBOX_CENTER, SCAN_RADIUS_VIEWBOX, state.scanTheta, SCAN_SWEEP_RAD)
    );
  }
}
