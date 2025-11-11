/*! generator.api.js
 * Connect to local GPT proxy (gpt/chat.php)
 *
 * IMPORTANT:
 * - Keep /gpt/ on the SAME ORIGIN to avoid CORS and share sessions (CSRF)
 * - Set DEFAULT_API_KEY
 * - Override endpoint by passing { endpoint } or setting window.__GPT_ENDPOINT__.
 */
(function (root) {
  /**
   * Send RAW structured JSON to the GPT proxy.
   * @param {Object} payload - raw JSON (atomic fields only)
   * @param {Object} options - { systemPrompt, model, endpoint, apiKey }
   * @returns {Promise<string>} assistant reply
   */
  async function sendJSONToGPT(payload, options = {}) {
    const {
      systemPrompt = (
        "You are a precise prompt-compiler for text-to-video systems. " +
        "You will receive a JSON object containing atomic fields like subject, scene, style, motion, atmosphere, audio, frame, and message. " +
        "Your task: build ONE single-line, production-ready video prompt using ONLY the raw JSON fields (do not copy any pre-concatenated strings). " +
        "Keep it concise but retain critical detail; no markdown; no code fences; no extra commentary. " +
        "Suggested order (if present): Subject | Scene | Style | Motion | Atmosphere | Audio | Frame | Message. " +
        "After the prompt, on a NEW line, append a short random quote (surrounded by quotes) and an em dash + author if known. " +
        'Example: \"The only limit is the sky.\" — Anonymous'
      ),
      model = "gpt-4o-mini",
      endpoint = (root.__GPT_ENDPOINT__ || "gpt/chat.php"),
      apiKey = null // if null, server uses DEFAULT_API_KEY; pass "demo" to trigger DEMO_API_KEY
    } = options;

    const csrfTag = document.querySelector('meta[name="csrf-token"]');
    const csrf = csrfTag ? csrfTag.content : null;
    if (!csrf) {
      throw new Error('Missing CSRF meta tag. Ensure generator.php adds <meta name="csrf-token" ...>.');
    }

    // Ensure payload is a plain object
    const bodyPayload = (payload && typeof payload === "object") ? payload : {};

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csrf,
        prompt: systemPrompt,
        user_message: JSON.stringify(bodyPayload), // chat.php expects a string in user_message
        model,
        api_key: apiKey || "demo"
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error("GPT proxy error: HTTP " + res.status + " – " + text);
    }
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return String(data.reply || "");
  }

  root.PromptAPI = { sendJSONToGPT };
})(window);
