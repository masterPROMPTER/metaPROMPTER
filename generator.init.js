/*! generator.init.js */
(function (root) {
  function init() {
    const container = document.getElementById('prompt-generator');
    if (!container) return;

    // Mode toggles
    const radios = container.querySelectorAll('input[name="mode"]');
    radios.forEach(r => {
      r.addEventListener('change', () => {
        root.PromptGen.applyModeStyling(container, r.value);
      });
    });

    // Apply default mode
    const defaultMode = (container.querySelector('input[name="mode"]:checked') || {}).value || 'simple';
    root.PromptGen.applyModeStyling(container, defaultMode);

    // Submit handling
    root.PromptGen.attachSubmitHandler(container);

    // Optional: expose API for later integrations
    root.PromptGen.api = {
      getPrompt: () => root.PromptGen.composePrompt(container),
      setField: (id, value) => {
        const el = container.querySelector('#' + id);
        if (el) el.value = value || '';
      },
      setMode: (mode) => {
        const target = container.querySelector(`input[name="mode"][value="${mode}"]`);
        if (target) { target.checked = true; root.PromptGen.applyModeStyling(container, mode); }
      }
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
