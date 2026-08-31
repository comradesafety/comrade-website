/**
 * recruitment-form.js
 * Drives the Product Development Internship application: step
 * navigation, client-side validation (a UX convenience only — every
 * rule here is re-enforced server-side in routes/recruitment.py,
 * which never trusts this file), progress display, and submission.
 *
 * No requestAnimationFrame loop lives here on purpose: step transitions
 * are plain CSS (see .comrade-recruitment-step.is-entering in
 * recruitment.css), the same reasoning the product illustrations and
 * contact page's orbit motif are pure CSS too — none of this needs
 * per-frame JS-driven motion, so it doesn't get any.
 */

// Checkbox inputs that submit as an array of picks (FormData.getAll),
// as opposed to the three acknowledgement checkboxes below, which
// submit as a single boolean each. Kept as an explicit list here
// rather than inferred from the DOM, since "is this a multi-select
// group or a single acknowledgement" isn't something a generic
// selector can reliably tell apart.
const CHECKBOX_GROUP_NAMES = [
  "microcontrollers",
  "hardware_components",
  "pcb_tools",
  "prototyping_methods",
  "lab_equipment",
  "embedded_languages",
  "communication_protocols",
  "documentation_approach"
];
const ACK_NAMES = ["unpaid_ack", "confidentiality_ack", "privacy_ack"];

const GENERIC_SUBMIT_ERROR =
  "Something went wrong while submitting your application. Please check your connection and try again.";

export function initializeRecruitmentForm() {
  const form = document.querySelector("[data-recruitment-form]");
  if (!form) return;

  const formSection = form.closest("section");
  const steps = Array.from(form.querySelectorAll(".comrade-recruitment-step"));
  const progressFill = form.querySelector("[data-recruitment-progress-fill]");
  const progressStepEls = Array.from(form.querySelectorAll("[data-progress-step]"));
  const backButton = form.querySelector("[data-recruitment-back]");
  const nextButton = form.querySelector("[data-recruitment-next]");
  const submitButton = form.querySelector("[data-recruitment-submit]");
  const submitLabel = form.querySelector("[data-recruitment-submit-label]");
  const submitErrorEl = form.querySelector("[data-recruitment-submit-error]");
  const successEl = document.querySelector("[data-recruitment-success]");
  const honeypotInput = form.querySelector("[data-honeypot] input");
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || "";
  const submitUrl = form.dataset.submitUrl;

  if (steps.length === 0 || !nextButton || !submitButton) return;

  let currentIndex = 0;
  let isSubmitting = false;
  const AUTOSAVE_KEY = 'comrade_recruitment_autosave';

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function updateConditionalFields() {
    const pcbExp = form.querySelector('input[name="pcb_experience"]:checked')?.value;
    const pcbFields = [
      form.querySelector('[data-field="pcb_tools"]'),
      form.querySelector('[data-field="pcb_description"]')
    ];
    pcbFields.forEach(wrapper => {
      if (!wrapper) return;
      if (pcbExp && pcbExp !== "No experience") {
        wrapper.hidden = false;
      } else {
        wrapper.hidden = true;
      }
    });

    const sensorInt = form.querySelector('input[name="sensor_integration"]:checked')?.value;
    const sensorDescWrapper = form.querySelector('[data-field="sensor_integration_desc"]');
    if (sensorDescWrapper) {
      if (sensorInt && sensorInt !== "No" && sensorInt !== "Basic exposure") {
        sensorDescWrapper.hidden = false;
      } else {
        sensorDescWrapper.hidden = true;
      }
    }
  }

  form.addEventListener('change', (e) => {
    if (e.target.name === 'pcb_experience' || e.target.name === 'sensor_integration') {
      updateConditionalFields();
    }
  });

  updateConditionalFields();

  function clearFieldError(key) {
    const errorEl = form.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) errorEl.textContent = "";
    const wrapper = form.querySelector(`[data-field="${key}"]`);
    if (wrapper) wrapper.classList.remove("has-error");
  }

  function showFieldError(key, message) {
    const errorEl = form.querySelector(`[data-error-for="${key}"]`);
    if (errorEl) errorEl.textContent = message;
    const wrapper = form.querySelector(`[data-field="${key}"]`);
    if (wrapper) wrapper.classList.add("has-error");
  }

  function clearStepErrors(stepEl) {
    stepEl.querySelectorAll("[data-error-for]").forEach((el) => {
      el.textContent = "";
    });
    stepEl.querySelectorAll(".has-error").forEach((el) => {
      el.classList.remove("has-error");
    });
  }

  /** Native checkValidity() covers every text/email/tel/url/textarea
   * field and, thanks to `required` being set on every radio in a
   * required group (see the radio_group macro), correctly means "at
   * least one checked" for radios too — that's standard native
   * radio-group semantics. Multi-select checkbox groups don't have an
   * equivalent native "at least one" behavior (required on a checkbox
   * means THAT box specifically must be checked), so those are
   * validated separately via data-required on their fieldset. */
  function validateStep(stepEl) {
    clearStepErrors(stepEl);
    let isValid = true;
    let firstInvalid = null;
    const seenRadioGroups = new Set();

    stepEl.querySelectorAll("input[required], textarea[required]").forEach((input) => {
      if (input.type === "radio") {
        if (seenRadioGroups.has(input.name)) return;
        seenRadioGroups.add(input.name);
      }
      if (!input.checkValidity()) {
        isValid = false;
        showFieldError(input.name, input.validationMessage || "This field is required.");
        if (!firstInvalid) firstInvalid = input;
      }
    });

    stepEl.querySelectorAll('fieldset[data-required="true"]').forEach((fieldset) => {
      const key = fieldset.dataset.field;
      const anyChecked = fieldset.querySelector('input[type="checkbox"]:checked');
      if (!anyChecked) {
        isValid = false;
        showFieldError(key, "Select at least one option.");
        if (!firstInvalid) firstInvalid = fieldset;
      }
    });

    if (firstInvalid) {
      firstInvalid.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "center",
      });
    }

    return isValid;
  }

  function updateProgress(index) {
    if (progressFill) {
      progressFill.style.width = `${((index + 1) / steps.length) * 100}%`;
    }
    progressStepEls.forEach((el, i) => {
      el.classList.toggle("is-current", i === index);
      el.classList.toggle("is-complete", i < index);
    });
  }

  async function showStep(index, skipScroll = false) {
    if (index === currentIndex) return;
    const previous = steps[currentIndex];
    const next = steps[index];

    const transitionDuration = prefersReducedMotion() ? 0 : 300; // matches --comrade-transition-normal

    if (previous && !skipScroll) {
      previous.classList.remove("is-entering");
      await new Promise(resolve => setTimeout(resolve, transitionDuration));
      previous.hidden = true;
    } else if (previous) {
      previous.classList.remove("is-entering");
      previous.hidden = true;
    }

    next.hidden = false;
    void next.offsetHeight; // force reflow so is-entering re-triggers the transition
    requestAnimationFrame(() => next.classList.add("is-entering"));

    currentIndex = index;
    updateProgress(index);

    const isFirstStep = index === 0;
    const isLastStep = index === steps.length - 1;
    if (backButton) backButton.hidden = isFirstStep;
    nextButton.hidden = isLastStep;
    submitButton.hidden = !isLastStep;

    if (formSection && !skipScroll) {
      formSection.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start",
      });
    }

    saveState();
  }

  nextButton.addEventListener("click", () => {
    if (!validateStep(steps[currentIndex])) return;
    if (currentIndex < steps.length - 1) showStep(currentIndex + 1);
  });

  if (backButton) {
    backButton.addEventListener("click", () => {
      if (currentIndex > 0) showStep(currentIndex - 1);
    });
  }

  // Enter key inside a text-like field advances instead of submitting
  // early from an earlier step (native form submit-on-Enter would
  // otherwise fire the (hidden) submit button regardless of which step
  // is showing).
  form.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    const target = event.target;
    if (target.tagName === "TEXTAREA") return;
    if (currentIndex === steps.length - 1) return;
    event.preventDefault();
    if (validateStep(steps[currentIndex])) showStep(currentIndex + 1);
  });

  function collectPayload() {
    const formData = new FormData(form);
    const payload = {};

    for (const [key, value] of formData.entries()) {
      if (CHECKBOX_GROUP_NAMES.includes(key) || ACK_NAMES.includes(key)) continue;
      payload[key] = value;
    }

    CHECKBOX_GROUP_NAMES.forEach((key) => {
      payload[key] = formData.getAll(key);
    });

    ACK_NAMES.forEach((key) => {
      const input = form.querySelector(`input[name="${key}"]`);
      payload[key] = Boolean(input && input.checked);
    });

    if (honeypotInput) {
      payload[honeypotInput.name] = honeypotInput.value;
    }

    return payload;
  }

  function saveState() {
    try {
      const payload = collectPayload();
      payload._currentIndex = currentIndex;
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(payload));
    } catch (e) {}
  }

  function restoreState() {
    try {
      const saved = localStorage.getItem(AUTOSAVE_KEY);
      if (!saved) return 0;
      const payload = JSON.parse(saved);

      Object.keys(payload).forEach(key => {
        if (key === '_currentIndex') return;
        
        const value = payload[key];
        if (CHECKBOX_GROUP_NAMES.includes(key)) {
          if (Array.isArray(value)) {
            form.querySelectorAll(`input[name="${key}"][type="checkbox"]`).forEach(cb => {
              cb.checked = value.includes(cb.value);
            });
          }
        } else if (ACK_NAMES.includes(key)) {
          const cb = form.querySelector(`input[name="${key}"][type="checkbox"]`);
          if (cb) cb.checked = !!value;
        } else {
          const inputs = form.querySelectorAll(`[name="${key}"]`);
          if (inputs.length === 0) return;
          if (inputs[0].type === 'radio') {
            inputs.forEach(r => r.checked = (r.value === value));
          } else {
            inputs[0].value = value;
          }
        }
      });

      updateConditionalFields();

      const savedIndex = payload._currentIndex;
      if (typeof savedIndex === 'number' && savedIndex > 0 && savedIndex < steps.length) {
        return savedIndex;
      }
    } catch (e) {
      console.warn("Could not restore autosave data", e);
    }
    return 0;
  }

  form.addEventListener('input', saveState);
  form.addEventListener('change', saveState);

  function applyServerFieldErrors(fieldErrors) {
    const keys = Object.keys(fieldErrors || {});
    if (keys.length === 0) return;

    let targetStepIndex = null;
    keys.forEach((key) => {
      showFieldError(key, fieldErrors[key]);
      if (targetStepIndex === null) {
        const stepIndex = steps.findIndex((step) => step.querySelector(`[data-field="${key}"]`));
        if (stepIndex !== -1) targetStepIndex = stepIndex;
      }
    });

    if (targetStepIndex !== null && targetStepIndex !== currentIndex) {
      showStep(targetStepIndex);
    }
  }

  function showSubmitError(message) {
    if (!submitErrorEl) return;
    submitErrorEl.textContent = message;
    submitErrorEl.hidden = false;
  }

  function showSuccess() {
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    if (!validateStep(steps[currentIndex])) return;

    isSubmitting = true;
    submitButton.disabled = true;
    const originalLabel = submitLabel ? submitLabel.textContent : "";
    if (submitLabel) submitLabel.textContent = "Submitting...";
    if (submitErrorEl) {
      submitErrorEl.hidden = true;
      submitErrorEl.textContent = "";
    }

    try {
      const response = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        body: JSON.stringify(collectPayload()),
      });
      const data = await response.json().catch(() => null);

      if (response.ok && data && data.success) {
        try { localStorage.removeItem(AUTOSAVE_KEY); } catch (e) {}
        showSuccess();
        return;
      }

      if (data && data.fields) applyServerFieldErrors(data.fields);
      showSubmitError((data && data.error) || GENERIC_SUBMIT_ERROR);
    } catch (error) {
      showSubmitError(GENERIC_SUBMIT_ERROR);
    } finally {
      isSubmitting = false;
      submitButton.disabled = false;
      if (submitLabel) submitLabel.textContent = originalLabel;
    }
  });

  const initialStepIndex = restoreState();
  if (initialStepIndex > 0) {
    showStep(initialStepIndex, true);
  } else {
    updateProgress(0);
  }
}
