/**
 * careers-process.js
 * Drives the Selection Process progress tracker: hovering,
 * keyboard-focusing, or tapping a card sets one [data-active-step]
 * attribute (and one --comrade-process-progress custom property) on
 * the track — careers-process.css does the rest (which dots/segments
 * fill, which card lifts) with plain attribute-selector rules. There
 * is no animation loop here, nothing runs on a timer, and nothing
 * moves until a person actually interacts with a card.
 */
export function initializeSelectionProcess() {
  const track = document.querySelector("[data-process-stage]");
  if (!track) return;

  const cards = track.querySelectorAll("[data-process-card]");
  if (!cards.length) return;

  const totalSteps = cards.length;

  function setActiveStep(step) {
    track.dataset.activeStep = String(step);
    const fraction = totalSteps > 1 ? (step - 1) / (totalSteps - 1) : 1;
    track.style.setProperty("--comrade-process-progress", String(fraction));
  }

  function clearActiveStep() {
    delete track.dataset.activeStep;
    track.style.setProperty("--comrade-process-progress", "0");
  }

  cards.forEach((card) => {
    const step = Number(card.dataset.processCard);
    if (!step) return;

    // mouseenter covers mouse hover; focus covers keyboard Tab; click
    // covers touch taps (browsers translate a tap to a click even
    // where they don't reliably focus a plain, non-form element) —
    // three input modes, one shared handler, no touch-specific code
    // needed.
    const activate = () => setActiveStep(step);
    card.addEventListener("mouseenter", activate);
    card.addEventListener("focus", activate);
    card.addEventListener("click", activate);
  });

  // Only devices with real hover reset to neutral on mouseleave —
  // touch devices have no equivalent gesture, so the last tapped card
  // stays active until another one is tapped, per the brief.
  const supportsHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (supportsHover) {
    track.addEventListener("mouseleave", clearActiveStep);
    track.addEventListener("focusout", (event) => {
      if (!track.contains(event.relatedTarget)) {
        clearActiveStep();
      }
    });
  }
}
