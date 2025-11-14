<?php
// Session + CSRF for chat.php (github.com/masterPROMPTER/CloneGPT)
if (session_status() === PHP_SESSION_NONE) { session_start(); }
if (empty($_SESSION['csrf'])) { $_SESSION['csrf'] = bin2hex(random_bytes(32)); }
?>
<meta name="csrf-token" content="<?php echo htmlspecialchars($_SESSION['csrf'], ENT_QUOTES, 'UTF-8'); ?>">

<div class="prompt-generator" id="prompt-generator">

  <fieldset class="input-mode-selector">
    <legend>Prompt input mode</legend>
    <label><input type="radio" name="mode" value="simple" checked /> Simple</label>
    <label><input type="radio" name="mode" value="advanced" /> Advanced</label>
    <label><input type="radio" name="mode" value="pro" /> Pro</label>
  </fieldset>

  <div class="form-wrapper">
    <form id="prompt-form" method="post" autocomplete="off">

      <div class="form-group" data-fields="prompt-subject">
        <label for="prompt-subject" title="Subject / Character">Subject</label>
        <input id="prompt-subject" class="expanding-input" name="prompt-subject" type="text" placeholder="e.g. futuristic city skyline" required aria-required="true" />
      </div>

      <div class="form-group" data-fields="prompt-scene">
        <label for="prompt-scene" title="Scene / Setting">Scene</label>
        <input id="prompt-scene" name="prompt-scene" type="text" placeholder="e.g. sunset with warm golden light" />
      </div>

      <div class="form-group" data-fields="prompt-style">
        <label for="prompt-style" title="Style / Genre">Style</label>
        <input id="prompt-style" name="prompt-style" type="text" placeholder="e.g. cinematic, anime, documentary" />
      </div>

      <div class="form-group" data-fields="prompt-motion">
        <label for="prompt-motion" title="Motion / Camera Action / Subject Motion">Motion</label>
        <input id="prompt-motion" name="prompt-motion" type="text" placeholder="e.g. drone shot, slow pan, walking" />
      </div>

      <div class="form-group" data-fields="prompt-atmosphere">
        <label for="prompt-atmosphere" title="Lighting / Mood">Atmosphere</label>
        <input id="prompt-atmosphere" name="prompt-atmosphere" type="text" placeholder="e.g. golden hour, moody, vibrant" />
      </div>

      <div class="form-group" data-fields="prompt-audio">
        <label for="prompt-audio" title="Audio / Sound">Audio</label>
        <input id="prompt-audio" name="prompt-audio" type="text" placeholder="e.g. epic soundtrack, ambient noise" />
      </div>

      <div class="form-group" data-fields="prompt-frame">
        <label for="prompt-frame" title="Frame / Aspect Ratio / Composition">Frame</label>
        <input id="prompt-frame" name="prompt-frame" type="text" placeholder="e.g. 16:9, wide-angle" />
      </div>

      <div class="form-group" data-fields="prompt-message">
        <label for="prompt-message" title="Message / Theme">Message</label>
        <input id="prompt-message" name="prompt-message" type="text" placeholder="e.g. hero's journey, hope, adventure" />
      </div>

      <div class="form-group">
        <button id="generate-prompt-btn" type="submit" aria-label="Generate prompt">Generate Prompt</button>
      </div>

    </form>
    <pre id="prompt-output" role="status" aria-live="polite" aria-atomic="true"></pre>

    <!-- #DEV: GPT reply output -->
    <style>
    .t_container {border: 1px solid #ddd;border-radius: 8px;padding: 12px;}
    .t_area1 {width: 100%;min-height: 80px;border: 1px solid #ddd;border-radius: 8px;resize: vertical;font-size: 75%;}
    .t_area2 {border: 1px solid #ddd;border-radius: 8px;resize: vertical;font-size: 75%;margin-top: 15px;padding: 12px;}
    .t_label {font-size: 75%;}
    </style>
    
    <div id="gpt-output-container" class="t_container">
      <label for="gpt-output" class="t_label">GPT Output (preview)</label>
      <textarea id="gpt-output" class="t_area1"></textarea>
    </div>
    
    <!-- #DEV: Plain-text request (what we send to the API) -->
    <div id="gpt-request-container" class="t_area2">
      <div>Request sent to ChatGPT (endpoint + JSON body)</div>
      <div id="gpt-request-inspect" style="white-space:pre-wrap;font-size: 75%;"></div>
    </div>
  </div>
</div>

<link rel="stylesheet" href="generator.css">
<script src="generator.styling.js" defer></script>
<script src="generator.logic.js" defer></script>
<script src="generator.init.js" defer></script>

<!-- GPT endpoint (same-origin) -->
<script>
  window.__GPT_ENDPOINT__ = "gpt/chat.php";
</script>

<script src="generator.collector.js" defer></script>
<!-- API helper -->
<script src="generator.api.js" defer></script>
<!-- TEMP styles -->
<link rel="stylesheet" href="generator.collector.css">

<!-- Send JSON to GPT and show reply -->
<script>
(function () {
  function getCSRF() {
    const m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.content : null;
  }

  // Build JSON
  function getRawStructuredJSON() {
    const payload = (window.PromptGen && typeof window.PromptGen.getCollectedPayload === "function")
      ? window.PromptGen.getCollectedPayload()
      : {};
    // Remove any locally-composed strings so GPT must synthesize from atomic fields
    const {
      concatenated_prompt_flat,
      concatenated_prompt_sectioned,
      ...rest
    } = payload || {};
    return rest;
  }

  // Hardcoded instructions
  function systemInstruction() {
    return [
      "You are a prompt-compiler for text-to-video systems.",
      "You will receive a JSON object containing atomic fields like subject, scene, style, motion, atmosphere, audio, frame, and message.",
      "Your task: build ONE single-line, production-ready video prompt using ONLY the raw JSON fields (do not copy any pre-concatenated strings).",
      "Keep it concise but retain critical detail; no markdown; no code fences; no extra commentary.",
      "Read and understand input, add your creative or matching random detail and make the final output theatrical.",
      "Suggested order (if present): Subject | Scene | Style | Motion | Atmosphere | Audio | Frame | Message.",
      "After the prompt, on a NEW line, append a short random quote (surrounded by quotes) and an em dash + author if known.",
      'Example of the second line format: "The only limit is the sky." —Anonymous'
    ].join(" ");
  }

  function ensureAPIWrapper() {
    const orig = window.PromptAPI && window.PromptAPI.sendJSONToGPT;
    if (!orig) return null;
    // Default endpoint override
    window.PromptAPI.sendJSONToGPT = function (payload, opts = {}) {
      opts.endpoint = opts.endpoint || window.__GPT_ENDPOINT__ || "gpt/chat.php";
      return orig(payload, opts);
    };
    return window.PromptAPI.sendJSONToGPT;
  }

  function showRequestPreview(endpoint, bodyObj) {
    const box = document.getElementById("gpt-request-inspect");
    if (!box) return;
    const preview = {
      endpoint: endpoint,
      body: bodyObj
    };
    // Use textContent (not innerHTML) to avoid any accidental HTML interpretation
    box.textContent = JSON.stringify(preview, null, 2);
  }

  async function callGPT() {
    const outBox = document.getElementById("gpt-output");
    if (outBox) outBox.value = "Sending…";

    const payload = getRawStructuredJSON();
    const sys = systemInstruction();
    const endpoint = window.__GPT_ENDPOINT__ || "gpt/chat.php";

    try {
      let reply = "";
      const sendJSONToGPT = ensureAPIWrapper();

      if (sendJSONToGPT) {
        // Reconstruct the exact body the helper sends, for visual inspection
        const body = {
          csrf: getCSRF(),
          prompt: sys,
          user_message: JSON.stringify(payload),
          model: "gpt-4o-mini",
          api_key: "demo" // this mirrors the default testing path; change when using DEFAULT_API_KEY server-side
        };
        showRequestPreview(endpoint, body);

        reply = await sendJSONToGPT(payload, {
          model: "gpt-4o-mini",
          systemPrompt: sys
        });
      } else {
        // Fallback path (direct fetch) if helper wasn’t loaded
        const body = {
          csrf: getCSRF(),
          prompt: sys,
          user_message: JSON.stringify(payload),
          model: "gpt-4o-mini",
          api_key: "demo" // remove or change when using server DEFAULT_API_KEY
        };
        showRequestPreview(endpoint, body);

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body)
        });
        if (!res.ok) throw new Error("Proxy HTTP " + res.status + ": " + (await res.text()));
        const data = await res.json();
        reply = String(data.reply || "");
      }

      // Show GPT response
      if (outBox) outBox.value = reply || "(empty)";
    } catch (err) {
      console.error("[generator] GPT error:", err);
      if (outBox) outBox.value = "⚠️ " + (err?.message || String(err));
    }
  }

  function hookSubmit() {
    const form = document.getElementById("prompt-form");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      // generator.logic.js already prevents default
      e.preventDefault();
      callGPT();
    }, { capture: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hookSubmit);
  } else {
    hookSubmit();
  }
})();
</script>
