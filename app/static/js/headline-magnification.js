/**
 * headline-magnification.js
 * macOS Dock-style cursor-proximity magnification for the site's large
 * display headlines: the homepage hero headline, the footer's "Comrades
 * born to defy." statement, the About page's hero headline plus its
 * three section headlines (Values, Philosophy, Team), the Vision page's
 * hero and closing headlines, the Products page's hero and closing
 * headlines, and the Contact page's hero headline. Characters nearest
 * the pointer scale up smoothly; influence falls off continuously with
 * distance, no hard thresholds.
 * Idle state is the plain, unmodified heading — no scaling, no
 * color/glow changes, ever.
 *
 * Deliberately NOT applied to card/section titles (e.g. "Freedom",
 * "Feel It") or body copy — only the large editorial headlines it was
 * built for. Each matched heading gets its own independent instance
 * (own character cache, own pointer state, own rAF loop), driven by one
 * pointermove/pointerleave listener per heading, never per character.
 *
 * Touch/coarse-pointer devices and prefers-reduced-motion get every
 * targeted heading completely untouched: this module returns before
 * making any DOM change at all, rather than attaching a disabled effect.
 */

// Every large display headline this effect applies to. `.comrade-about-
// section-heading h2` alone matches all three About section headlines
// (Values, Philosophy, Team) since they share one heading pattern.
const HEADLINE_SELECTORS = [
  ".comrade-hero__headline",
  ".comrade-footer__statement",
  ".comrade-about-hero__headline",
  ".comrade-about-section-heading h2",
  ".comrade-vision-hero__headline",
  ".comrade-vision-why__headline",
  ".comrade-products-hero__headline",
  ".comrade-products-how__headline",
  ".comrade-contact-hero__headline",
  ".comrade-recruitment-hero__headline",
];

const CHAR_CLASS = "headline-char";
const WORD_CLASS = "headline-word";

// Tuned to read as "premium and subtle", not a magnifying glass:
// center-of-effect lands around the 1.12-1.18 range called for, easing
// smoothly down to 1.0 by the edge of the radius. Adjust these two
// constants to retune the whole effect in one place, for every heading
// at once.
const INFLUENCE_RADIUS_PX = 140;
const MAX_SCALE = 1.16;

// How quickly each character eases toward its target scale, per frame
// (0-1; higher = snappier, lower = softer/laggier). Lower than a typical
// UI easing on purpose — this is what makes the motion trail the
// pointer like a soft lens instead of characters darting to size, and
// what makes the pointer-leave reset a slow, buttery glide rather than
// a quick snap back.
const LERP_FACTOR = 0.14;

// Once every character's scale is within this of 1.0 (and the pointer
// isn't currently over the headline), the rAF loop stops entirely
// instead of running forever at rest.
const SETTLE_EPSILON = 0.0005;

export function initializeHeadlineMagnification() {
  if (!supportsFineHoverPointer() || prefersReducedMotion()) {
    return;
  }

  const headlines = new Set();
  HEADLINE_SELECTORS.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => headlines.add(el));
  });

  headlines.forEach((headline) => magnetizeHeadline(headline));
}

/** Sets up character splitting, position caching, and the pointer-driven
 * rAF loop for a single headline element. Everything here is scoped to
 * one element's own closure, so multiple headlines on the same page
 * (e.g. the About page's four) run fully independently. */
function magnetizeHeadline(headline) {
  const accessibleLabel = computeAccessibleLabel(headline);
  headline.setAttribute("aria-label", accessibleLabel);

  splitTextIntoCharSpans(headline);

  const charEntries = Array.from(headline.querySelectorAll(`.${CHAR_CLASS}`)).map((el) => ({
    el,
    centerX: 0,
    centerY: 0,
    currentScale: 1,
  }));

  if (charEntries.length === 0) return;

  let pointerX = null;
  let pointerY = null;
  let rafId = null;
  let resizeTimer = null;

  // Positions are cached in *document* coordinates (viewport rect plus
  // the current scroll offset), not viewport coordinates. Every one of
  // these headings except the hero sits below the fold, so the page is
  // scrolled by the time it's actually reached; caching plain
  // getBoundingClientRect() values meant the cache silently went stale
  // the moment the user scrolled at all, which is exactly what made the
  // effect look like it "sometimes" worked — it was accurate only for
  // however long the scroll position happened to match whenever the
  // cache was last built. Document coordinates don't have that problem:
  // they stay correct at any scroll position, so nothing needs to
  // recalculate on scroll at all.
  function measurePositions() {
    charEntries.forEach((entry) => {
      const rect = entry.el.getBoundingClientRect();
      entry.centerX = rect.left + rect.width / 2 + window.scrollX;
      entry.centerY = rect.top + rect.height / 2 + window.scrollY;
    });
  }

  function ensureLoopRunning() {
    if (rafId === null) rafId = requestAnimationFrame(tick);
  }

  function tick() {
    let anyOffRest = false;

    charEntries.forEach((entry) => {
      let targetScale = 1;
      if (pointerX !== null) {
        const dx = entry.centerX - pointerX;
        const dy = entry.centerY - pointerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        targetScale = scaleForDistance(distance);
      }

      entry.currentScale += (targetScale - entry.currentScale) * LERP_FACTOR;
      if (Math.abs(entry.currentScale - 1) > SETTLE_EPSILON) anyOffRest = true;
      entry.el.style.transform = entry.currentScale === 1 ? "" : `scale(${entry.currentScale.toFixed(4)})`;
    });

    if (pointerX !== null || anyOffRest) {
      rafId = requestAnimationFrame(tick);
    } else {
      // Fully at rest: snap every character exactly to 1 (clears any
      // residual sub-pixel value the lerp asymptotically approaches but
      // never quite reaches) and stop the loop rather than idling it
      // forever with the pointer elsewhere on the page.
      charEntries.forEach((entry) => {
        entry.currentScale = 1;
        entry.el.style.transform = "";
      });
      rafId = null;
    }
  }

  headline.addEventListener("pointermove", (event) => {
    // pageX/pageY (document-relative, built into the event) rather
    // than clientX/clientY (viewport-relative) — kept in the same
    // coordinate space as the cached character centers above.
    pointerX = event.pageX;
    pointerY = event.pageY;
    ensureLoopRunning();
  });

  // pointerleave (unlike pointerout) only fires once the pointer has
  // truly left the headline and every descendant character span, so
  // moving between characters never falsely triggers a reset.
  headline.addEventListener("pointerleave", () => {
    pointerX = null;
    pointerY = null;
    ensureLoopRunning();
  });

  // Character positions are measured once up front, then re-measured
  // only on the handful of events that can actually move them — never
  // inside the per-frame tick() loop above.
  measurePositions();
  window.addEventListener("load", measurePositions);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(measurePositions);
  }

  // The hero headline carries its own entrance transition directly
  // (.hero-reveal), so `headline` itself is the transitioning element.
  // Every other targeted heading is plain, static markup *wrapped* in a
  // ".reveal-on-scroll" ancestor that does the fading/sliding instead —
  // transitionend on that ancestor never bubbles down to a listener on
  // the child headline (bubbling only travels outward to ancestors), so
  // a listener on `headline` alone silently never fired for those. This
  // walks up to whichever element actually owns the transition (falling
  // back to headline itself, e.g. for the footer statement, which has
  // neither reveal class and simply won't fire this — harmless, nothing
  // to catch there) and listens there instead.
  const revealHost = headline.closest(".reveal-on-scroll, .hero-reveal") || headline;
  revealHost.addEventListener("transitionend", () => measurePositions());

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(measurePositions, 150);
  });
}

/**
 * The heading's real text, for aria-label, built by walking the DOM
 * rather than reading `.textContent` directly: `.textContent` skips
 * <br> entirely (it contributes nothing, unlike its CSS line break),
 * which for a two-line headline like "Designed around<br>intelligent
 * protection." would otherwise glue the two lines into one run-on word
 * ("aroundintelligent"). Each <br> here becomes a single space instead,
 * then all whitespace is collapsed and trimmed once at the end.
 */
function computeAccessibleLabel(root) {
  let text = "";
  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      text += node.tagName === "BR" ? " " : computeAccessibleLabel(node);
    }
  });
  return text.replace(/\s+/g, " ").trim();
}

/** Continuous distance -> scale falloff (smootherstep — Perlin's
 * quintic refinement of smoothstep, with zero first *and* second
 * derivative at both ends of the curve), not a hard if/else threshold:
 * the influence — and therefore the scale — changes gradually as the
 * pointer moves, with no seam at the center or at the radius edge,
 * which is what makes neighboring characters react instead of only the
 * one directly under the cursor, and what keeps the whole field feeling
 * like one continuous surface rather than a series of steps. */
function scaleForDistance(distance) {
  if (distance >= INFLUENCE_RADIUS_PX) return 1;
  const linear = 1 - distance / INFLUENCE_RADIUS_PX;
  const eased = linear * linear * linear * (linear * (linear * 6 - 15) + 10);
  return 1 + eased * (MAX_SCALE - 1);
}

function supportsFineHoverPointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Wraps every non-whitespace character under `root` in its own
 * <span class="headline-char" aria-hidden="true">, walking into child
 * elements (so a burgundy highlight span's letters get wrapped too,
 * inheriting its color) while leaving <br> and every whitespace run as
 * plain, untouched text nodes — line breaks and spacing are completely
 * unaffected. The element's real text is preserved for assistive tech
 * separately, via the aria-label set on `root` before this runs.
 *
 * Each word's character spans are also wrapped together in one
 * <span class="headline-word">, styled `white-space: nowrap` in CSS.
 * This is not optional grouping: .headline-char is `display:
 * inline-block` (needed for a correct, stable transform-origin per
 * character), and every atomic inline-level box — inline-block
 * included — gets an implicit soft-wrap opportunity on both sides per
 * the CSS Text spec, even with zero whitespace between adjacent spans.
 * Without this wrapper, the browser is free to break a line between
 * ANY two letters of a word, not just at real spaces, which is exactly
 * what caused "taking" to render as "taki" / "ng" mid-word. The word
 * span itself stays plain `display: inline` (non-atomic), so it
 * doesn't introduce that same extra wrap opportunity around whole
 * words — only real spaces between word spans remain valid break
 * points, same as normal text.
 */
function splitTextIntoCharSpans(root) {
  Array.from(root.childNodes).forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const fragment = document.createDocumentFragment();
      const text = node.textContent;
      let i = 0;
      while (i < text.length) {
        const char = text[i];
        if (/\s/.test(char)) {
          let run = "";
          while (i < text.length && /\s/.test(text[i])) {
            run += text[i];
            i += 1;
          }
          fragment.appendChild(document.createTextNode(run));
        } else {
          const wordSpan = document.createElement("span");
          wordSpan.className = WORD_CLASS;
          while (i < text.length && !/\s/.test(text[i])) {
            const charSpan = document.createElement("span");
            charSpan.className = CHAR_CLASS;
            charSpan.setAttribute("aria-hidden", "true");
            charSpan.textContent = text[i];
            wordSpan.appendChild(charSpan);
            i += 1;
          }
          fragment.appendChild(wordSpan);
        }
      }
      root.replaceChild(fragment, node);
    } else if (node.nodeType === Node.ELEMENT_NODE && node.tagName !== "BR") {
      splitTextIntoCharSpans(node);
    }
  });
}
