/**
 * hero-animation.js
 * Controls the one-time homepage entrance sequence: eyebrow, headline,
 * paragraph, and buttons fade in first; then the hero image; then the
 * orbit paths; then each orbit dot and its paired text label in turn.
 * This file only decides *when* things become visible (via the
 * "is-visible" class). Where the orbit labels sit on their path is
 * orbit-animation.js's job.
 */

const STAGE_REVEAL_DELAY_MS = 450;
const ORBIT_PATH_REVEAL_DELAY_MS = STAGE_REVEAL_DELAY_MS + 250;
const ORBIT_LABEL_STAGGER_MS = 140;

export function initializeHeroAnimation() {
  const hero = document.querySelector(".comrade-hero");
  if (!hero) return;

  const contentElements = hero.querySelectorAll(".hero-reveal");
  const stage = hero.querySelector(".comrade-hero__stage");
  const orbitSvg = hero.querySelector(".hero-orbit-svg");
  const orbitDots = hero.querySelectorAll(".hero-orbit-dot");
  const orbitLabels = hero.querySelectorAll(".hero-orbit-label");

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion) {
    revealImmediately(contentElements, stage, orbitSvg, orbitDots, orbitLabels);
    return;
  }

  requestAnimationFrame(() => {
    contentElements.forEach((element) => element.classList.add("is-visible"));
  });

  window.setTimeout(() => {
    if (stage) stage.classList.add("is-visible");
  }, STAGE_REVEAL_DELAY_MS);

  window.setTimeout(() => {
    if (orbitSvg) orbitSvg.classList.add("is-visible");
    revealOrbitObjectsSequentially(orbitDots, orbitLabels);
  }, ORBIT_PATH_REVEAL_DELAY_MS);
}

/** Reveals each dot together with its paired text label, one pair at a
 * time. Dots and labels are rendered from the same orbit_labels loop in
 * the template, in the same order, so pairing them by index here lines
 * a dot up with its own label rather than a different one. */
function revealOrbitObjectsSequentially(orbitDots, orbitLabels) {
  orbitLabels.forEach((label, index) => {
    window.setTimeout(() => {
      const dot = orbitDots[index];
      if (dot) dot.classList.add("is-visible");
      label.classList.add("is-visible");
    }, index * ORBIT_LABEL_STAGGER_MS);
  });
}

function revealImmediately(contentElements, stage, orbitSvg, orbitDots, orbitLabels) {
  contentElements.forEach((element) => element.classList.add("is-visible"));
  if (stage) stage.classList.add("is-visible");
  if (orbitSvg) orbitSvg.classList.add("is-visible");
  orbitDots.forEach((dot) => dot.classList.add("is-visible"));
  orbitLabels.forEach((label) => label.classList.add("is-visible"));
}
