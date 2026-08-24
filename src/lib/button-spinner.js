// Global Button Spinner Manager
// Intercepts all button clicks and coordinates with Axios requests to show loaders.

// Filter function to exclude non-action, toggle, or icon-only buttons
function shouldApplySpinner(button) {
  if (!button) return false;

  // Exclude buttons explicitly marked with data-no-spinner="true"
  if (button.hasAttribute("data-no-spinner") || button.getAttribute("data-no-spinner") === "true") {
    return false;
  }

  // Exclude buttons with "no-spinner" class
  if (button.classList.contains("no-spinner")) {
    return false;
  }

  // Exclude eye icons or show/hide password buttons
  if (button.querySelector("svg") && (button.innerText || button.textContent || "").trim() === "") {
    return false;
  }

  // Exclude very small icon-only buttons or close buttons (e.g. size < 38x38)
  const rect = button.getBoundingClientRect();
  if (rect.width > 0 && rect.width < 38 && rect.height > 0 && rect.height < 38) {
    return false;
  }

  // Exclude tiny text/number buttons like pagination buttons
  const text = (button.innerText || button.textContent || "").trim();
  if (text.length > 0 && text.length <= 2 && rect.width < 45 && rect.height < 45) {
    return false;
  }

  return true;
}

// Global click event listener
document.addEventListener("click", (e) => {
  const button = e.target.closest("button");
  if (!button) return;

  // Ignore if the button shouldn't receive a spinner
  if (!shouldApplySpinner(button)) return;

  // Prevent double submissions if already loading
  if (button.classList.contains("btn-loading")) {
    e.preventDefault();
    e.stopPropagation();
    return;
  }

  // Clean up any existing active spinner tracker just in case
  if (window.__buttonSpinner) {
    window.__buttonSpinner.cleanup();
  }

  // Mark the button as loading and disable it
  button.classList.add("btn-loading");
  const originalDisabled = button.disabled;
  button.disabled = true;

  // Set up visual visual/logical timers
  let isMinTimeElapsed = false;
  let isNetworkFinished = false;

  // Minimum visual display duration of 600ms for clean UX
  const minTimer = setTimeout(() => {
    isMinTimeElapsed = true;
    if (isNetworkFinished || !window.__buttonSpinner || window.__buttonSpinner.activeRequests === 0) {
      cleanup();
    }
  }, 600);

  // Safety maximum timeout of 8 seconds to prevent stuck buttons
  const maxTimer = setTimeout(() => {
    cleanup();
  }, 8000);

  function cleanup() {
    clearTimeout(minTimer);
    clearTimeout(maxTimer);
    if (button) {
      button.classList.remove("btn-loading");
      button.disabled = originalDisabled;
    }
    if (window.__buttonSpinner && window.__buttonSpinner.activeButton === button) {
      window.__buttonSpinner = null;
    }
  }

  // Save state globally so the Axios interceptor can reference it
  window.__buttonSpinner = {
    activeButton: button,
    clickTime: Date.now(),
    activeRequests: 0,
    originalDisabled,
    minTimer,
    maxTimer,
    cleanup,
    get isMinTimeElapsed() {
      return isMinTimeElapsed;
    },
    setNetworkFinished() {
      isNetworkFinished = true;
      if (isMinTimeElapsed) {
        cleanup();
      }
    }
  };
}, true); // Use capture phase to intercept early
