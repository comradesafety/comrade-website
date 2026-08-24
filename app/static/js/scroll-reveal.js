/**
 * scroll-reveal.js
 * Generic, reusable scroll-triggered reveal system built on
 * IntersectionObserver. Any element with the "reveal-on-scroll" class
 * (optionally paired with reveal-up / reveal-left / reveal-right /
 * reveal-scale) fades and slides into place the first time it enters
 * the viewport.
 */

const REVEAL_THRESHOLD = 0.15;
const REVEAL_ROOT_MARGIN = "0px 0px -8% 0px";

export function initializeScrollReveal() {
  const revealElements = document.querySelectorAll(".reveal-on-scroll");
  if (!revealElements.length) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(handleIntersect, {
    threshold: REVEAL_THRESHOLD,
    rootMargin: REVEAL_ROOT_MARGIN,
  });

  function handleIntersect(entries) {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }

  revealElements.forEach((element) => observer.observe(element));
}
