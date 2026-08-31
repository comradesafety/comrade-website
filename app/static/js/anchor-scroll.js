/**
 * anchor-scroll.js
 * Two related jobs, both because native browser anchor scrolling
 * (relying purely on scroll-behavior: smooth in reset.css, plus the
 * browser's own fragment-scroll-on-load) proved unreliable on this
 * page: it was consistently stopping a same-page smooth scroll a few
 * hundred pixels in — reproduces even on the pre-existing "Explore the
 * Opportunity" → #current-opening link, so it isn't specific to
 * anything added alongside this file — most likely interrupted by the
 * sticky navbar's own height shrinking (110px → 80px) partway through
 * the scroll and shifting the page under it. Driving the scroll
 * explicitly, frame by frame, toward a position computed once up
 * front sidesteps that entirely: nothing native is left to interrupt.
 *
 *   1. initializeAnchorScroll — lands correctly on load when the URL
 *      already has a hash (e.g. /careers#application, including via
 *      the /careers/product-development-internship redirect).
 *   2. initializeSmoothAnchorLinks — same-page clicks on any link that
 *      resolves to the current page plus a hash — a bare "#id" (Begin
 *      Application, Explore the Opportunity) or the navbar's full
 *      "/careers#application" (Apply Now, whose href has to be a full
 *      URL since it also has to work from every other page) — animate
 *      to their target instead of jumping.
 *
 * Both share the same "where should this land" math, so the two can
 * never disagree with each other about the correct scroll-margin-top-
 * aware destination for a given target.
 */

function getScrollDestination(target) {
  const rect = target.getBoundingClientRect();
  const scrollMarginTop = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  const destination = rect.top + window.scrollY - scrollMarginTop;
  const maxScrollY = document.documentElement.scrollHeight - window.innerHeight;
  return Math.max(0, Math.min(destination, maxScrollY));
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function resolveHashTarget(hash) {
  if (!hash) return null;
  try {
    return document.querySelector(hash);
  } catch (error) {
    return null; // an unparseable hash is not this function's problem
  }
}

function jumpToHash() {
  const target = resolveHashTarget(window.location.hash);
  if (!target) return;
  // behavior: "instant" is the only form of this call guaranteed to
  // jump immediately — both scrollIntoView({behavior: "auto"}) and
  // even window.scrollTo(x, y)'s plain two-argument form resolve
  // "auto" as "respect the page's own scroll-behavior" under the
  // CSS-OM View spec, which on this page is smooth (reset.css).
  window.scrollTo({ top: getScrollDestination(target), left: 0, behavior: "instant" });
}

/**
 * Corrects three times — at DOMContentLoaded, again at window load,
 * and once more shortly after — rather than once, verified necessary,
 * not just defensive cleverness: on a direct load of
 * /careers#application, one correction at DOMContentLoaded is enough.
 * Arriving at the exact same URL by way of the
 * /careers/product-development-internship redirect, though, a *later*
 * native fragment-scroll attempt kept landing at the document's
 * maximum scroll instead of the target — after both the
 * DOMContentLoaded- and load-time corrections had already run and
 * already landed correctly, something scrolled again afterward,
 * specific to arriving via that redirect. A last correction a moment
 * after load catches it; re-running the same idempotent math is cheap
 * and never fights a real scroll the visitor made themselves, since
 * by a few hundred milliseconds after load a person could not yet
 * have scrolled and re-read enough of the page to already want to be
 * somewhere else on it.
 */
export function initializeAnchorScroll() {
  if (!window.location.hash) return;

  jumpToHash();

  const runFinalCorrections = () => {
    jumpToHash();
    // One bounded, one-shot final check — not a loop or a poll.
    window.setTimeout(jumpToHash, 400);
  };

  if (document.readyState === "complete") {
    runFinalCorrections();
  } else {
    window.addEventListener("load", runFinalCorrections, { once: true });
  }
}

function animateScrollTo(destination) {
  const startY = window.scrollY;
  const distance = destination - startY;
  if (Math.abs(distance) < 1) return;

  const duration = Math.min(900, Math.max(300, Math.abs(distance) * 0.6));
  const startTime = performance.now();

  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    // ease-in-out cubic
    const eased =
      progress < 0.5 ? 4 * progress ** 3 : 1 - (-2 * progress + 2) ** 3 / 2;
    window.scrollTo(0, startY + distance * eased);
    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }
  requestAnimationFrame(step);
}

export function initializeSmoothAnchorLinks() {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link) return;

    // Resolved against the current URL rather than a raw href^="#"
    // check, so this catches both a bare "#application" and the
    // navbar's full "/careers#application" (its href has to be the
    // full URL, since that same link also has to work as a normal
    // cross-page navigation from every other page) — either one is a
    // same-page anchor click once resolved, and both deserve the same
    // smooth, JS-driven scroll instead of native anchor navigation.
    let resolved;
    try {
      resolved = new URL(link.getAttribute("href"), window.location.href);
    } catch (error) {
      return;
    }
    const isSamePage =
      resolved.pathname === window.location.pathname && resolved.search === window.location.search;
    if (!isSamePage || !resolved.hash) return;

    const target = resolveHashTarget(resolved.hash);
    if (!target) return;

    event.preventDefault();

    if (window.location.hash !== resolved.hash) {
      history.pushState(null, "", resolved.hash);
    }

    if (prefersReducedMotion()) {
      window.scrollTo({ top: getScrollDestination(target), left: 0, behavior: "instant" });
    } else {
      animateScrollTo(getScrollDestination(target));
    }
  });
}
