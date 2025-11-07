/*! generator.styling.js */
(function (root) {
  const FIELD_CONFIGS = {
    "prompt-subject": {
      simple:   { label: "Subject / Scene",     placeholder: "e.g. futuristic city skyline at sunset", show: true },
      advanced: { label: "Subject / Scene",     placeholder: "e.g. futuristic city skyline at sunset", show: true },
      pro:      { label: "Subject / Character", placeholder: "e.g. futuristic city skyline",           show: true }
    },
    "prompt-scene": {
      simple:   { show: false },
      advanced: { show: false },
      pro:      { label: "Scene / Setting",     placeholder: "e.g. sunset with warm golden light",     show: true }
    },
    "prompt-style": {
      simple:   { label: "Style / Motion", placeholder: "e.g. cinematic, anime, drone shot", show: true },
      advanced: { label: "Style / Motion", placeholder: "e.g. cinematic, anime, drone shot", show: true },
      pro:      { label: "Style / Genre",  placeholder: "e.g. cinematic, anime, documentary", show: true }
    },
    "prompt-motion": {
      simple:   { show: false },
      advanced: { show: false },
      pro:      { label: "Motion / Camera Action / Subject Motion", placeholder: "e.g. drone shot, slow pan, walking", show: true }
    },
    "prompt-atmosphere": {
      simple:   { label: "Lighting / Mood", placeholder: "e.g. golden hour, moody, vibrant", show: true },
      advanced: { label: "Lighting / Mood", placeholder: "e.g. golden hour, moody, vibrant", show: true },
      pro:      { label: "Lighting / Mood", placeholder: "e.g. golden hour, moody, vibrant", show: true }
    },
    "prompt-audio": {
      simple:   { label: "Audio / Sound", placeholder: "e.g. epic soundtrack, ambient noise", show: true },
      advanced: { label: "Audio / Sound", placeholder: "e.g. epic soundtrack, ambient noise", show: true },
      pro:      { label: "Audio / Sound", placeholder: "e.g. epic soundtrack, ambient noise", show: true }
    },
    "prompt-frame": {
      simple:   { show: false },
      advanced: { label: "Frame / Aspect Ratio / Composition", placeholder: "e.g. 16:9, wide-angle", show: true },
      pro:      { label: "Frame / Aspect Ratio / Composition", placeholder: "e.g. 16:9, wide-angle", show: true }
    },
    "prompt-message": {
      simple:   { show: false },
      advanced: { label: "Message / Theme", placeholder: "e.g. hero's journey, hope, adventure", show: true },
      pro:      { label: "Message / Theme", placeholder: "e.g. hero's journey, hope, adventure", show: true }
    }
  };

  /**
   * Apply field visibility, labels, and placeholders for a given mode.
   * @param {HTMLElement} container - the #prompt-generator element
   * @param {"simple"|"advanced"|"pro"} mode
   */
  function applyModeStyling(container, mode) {
    if (!container) return;
    const groups = container.querySelectorAll('.form-group[data-fields]');
    groups.forEach(group => {
      const key = group.getAttribute('data-fields');
      const cfg = FIELD_CONFIGS[key] && FIELD_CONFIGS[key][mode];
      if (!cfg) { group.style.display = 'none'; return; }

      if (cfg.show) {
        group.style.display = '';
        const labelEl = group.querySelector('label');
        const inputEl = group.querySelector('input');
        if (labelEl && cfg.label)       labelEl.textContent = cfg.label;
        if (inputEl && cfg.placeholder) inputEl.placeholder = cfg.placeholder;
      } else {
        group.style.display = 'none';
      }
    });
  }

  // expose
  root.PromptGen = root.PromptGen || {};
  root.PromptGen.applyModeStyling = applyModeStyling;
})(window);
