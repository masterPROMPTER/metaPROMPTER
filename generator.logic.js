/*! generator.logic.js */
(function (root) {
  /**
   * Pulls trimmed values from known inputs inside container.
   * @param {HTMLElement} container
   * @param {string[]} ids
   * @returns {Record<string,string>}
   */
  function readValues(container, ids) {
    const out = {};
    ids.forEach(id => {
      const el = container.querySelector('#' + id);
      out[id] = (el && 'value' in el) ? String(el.value).trim() : '';
    });
    return out;
  }

  /**
   * Compose a simple comma-separated prompt from available fields.
   * Skips empty parts & tidies punctuation.
   * @param {HTMLElement} container
   * @returns {string}
   */
  function composePrompt(container) {
    const order = [
      'prompt-subject',
      'prompt-scene',
      'prompt-style',
      'prompt-motion',
      'prompt-atmosphere',
      'prompt-audio',
      'prompt-frame',
      'prompt-message'
    ];
    const vals = readValues(container, order);
    const parts = order.map(k => vals[k]).filter(Boolean);
    return parts.join(', ').replace(/\s+,/g, ',').replace(/,\s+,/g, ', ').trim();
  }

  /**
   * Wire up form submission to write result into #prompt-output.
   * @param {HTMLElement} container
   */
  function attachSubmitHandler(container) {
    if (!container) return;
    const form = container.querySelector('#prompt-form');
    const out  = container.querySelector('#prompt-output');
    if (!form || !out) return;

    form.addEventListener('submit', (e) => {
      // onsubmit already prevents default in HTML; keep here in case markup changes:
      e.preventDefault();
      const prompt = composePrompt(container);
      out.textContent = prompt || 'Please enter details to generate a prompt.';
    });
  }
    try {
      if (window.PromptGen && typeof window.PromptGen.getCollectedPayload === 'function' && window.PromptAPI && typeof window.PromptAPI.sendJSONToGPT === 'function') {
        const jsonPayload = window.PromptGen.getCollectedPayload();
        const outputBox = document.getElementById('gpt-output');
        if (outputBox) {
          outputBox.value = 'Contacting GPT...';
        }
        window.PromptAPI.sendJSONToGPT(jsonPayload).then(reply => {
          if (outputBox) outputBox.value = reply;
        }).catch(err => {
          if (outputBox) outputBox.value = '⚠️ ' + (err && err.message ? err.message : String(err));
        });
      }
    } catch (e) {
      const outputBox = document.getElementById('gpt-output');
      if (outputBox) outputBox.value = '⚠️ ' + (e && e.message ? e.message : String(e));
    }
// expose
  root.PromptGen = root.PromptGen || {};
  root.PromptGen.composePrompt = composePrompt;
  root.PromptGen.attachSubmitHandler = attachSubmitHandler;
})(window);
