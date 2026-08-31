/**
 * careers-interactions.js
 * Starts the Careers hero's Idea → Engineer → Prototype → Product
 * signal. The motion itself is native SVG SMIL (<animateMotion> along
 * #careerFlowPath, in careers-hero.html) — not a JavaScript animation
 * loop — because that path-following is exact and doesn't have the
 * cross-browser transform-origin ambiguity CSS offset-path ran into.
 * This file only does two one-time things: trigger that native
 * playback (it's authored with begin="indefinite", so nothing moves
 * until this runs), and, in lockstep, add the class that starts the
 * matching CSS fade — no per-frame work, no rAF, no interval.
 *
 * Under prefers-reduced-motion, this simply never triggers the SMIL
 * animation or adds that class; careers.css's own reduced-motion query
 * swaps in a plain static dot instead (see
 * .comrade-careers-visual__signal-static there).
 */
export function initializeCareersSignal() {
  const signal = document.querySelector("[data-careers-signal]");
  if (!signal) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  if (prefersReducedMotion) return;

  const motion = signal.querySelector("animateMotion");
  if (motion && typeof motion.beginElement === "function") {
    motion.beginElement();
  }

  signal.classList.add("is-active");
}
