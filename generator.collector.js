/*! generator.collector.js */
(function () {
  const PROMPT_COLLECTOR_ID = "prompt-generator";

  function textContent(el) { return (el && el.textContent || "").trim(); }

  function getLabelForInput(input) {
    if (!input) return "";
    if (input.id) {
      const label = document.querySelector(`label[for="${input.id}"]`);
      if (label) return textContent(label);
    }
    if (input.getAttribute && input.getAttribute("aria-label")) return input.getAttribute("aria-label").trim();
    if (input.placeholder) return String(input.placeholder).trim();
    if (input.name) return String(input.name).trim();
    return input.id || "";
  }

  function classifyRole(labelOrName) {
    const s = (labelOrName || "").toLowerCase().trim();
    if (!s) return "misc";

    // --- Priority buckets (mutually exclusive by design) ---

    // Environment / Setting gets priority over subject
    if (/\b(scene|setting|location|place|background|world|interior|exterior|indoors?|outdoors?|weather|street|city|forest|beach|desert|mountain|room|kitchen|office|alley|train|subway|corridor|club|warehouse|island|space|planet|underwater)\b/.test(s)) {
      return "environment";
    }

    // Style only when "scene/setting" denotes aesthetic/look; otherwise env handled above
    if (/\b(style|aesthetic|look|genre|vibe|palette|grading?|lut|art\b|gothic|noir|wes\s*anderson|ghibli|retro|vaporwave|cyberpunk)\b/.test(s)) {
      return "style";
    }

    // Subject = entities/props/wardrobe (no "scene" here to avoid collisions)
    if (/\b(subject|character|hero|actor|object|prop|wardrobe|costume|outfit|makeup|pose|casting|model|person|figure|creature)\b/.test(s)) {
      return "subject";
    }

    // Negative constraints
    if (/\b(negative|avoid|exclude|ban|without|no\s+|forbid|disallow)\b/.test(s)) {
      return "negative";
    }

    // Camera (gear/moves/lenses/composition terms). Prefer camera when 'camera' is explicit.
    if (/\b(camera|lens|prime|zoom|gimbal|steadicam|tripod|dolly|crane|jib|pan|tilt|roll|rack\s*focus|focal|aperture|depth(?:\s*of\s*field)?|dof|composition|framing|shot\s*(?:type)?)\b/.test(s)) {
      return "camera";
    }

    // Lighting (exposure + light qualities + time-of-day cues)
    if (/\b(lighting|light|exposure|hdr|bloom|shadow|rim|key\s*light|fill\s*light|back\s*light|contrast|neon|sunset|sunrise|golden\s*hour|blue\s*hour)\b/.test(s)) {
      return "lighting";
    }

    // Mood / Tone
    if (/\b(mood|tone|emotion|atmosphere|ambience|vibes?)\b/.test(s)) {
      return "mood";
    }

    // Audio (expanded: voiceover, foley)
    if (/\b(audio|sound|music|soundtrack|sfx\b|fx\b(?!\s*makeup)|voice(?:over)?|dialogue|narration|foley|tempo|bpm|beat)\b/.test(s)) {
      return "audio";
    }

    // Timing (duration, fps, frames)
    if (/\b(duration|length|seconds?|sec\b|ms\b|timecode|time\s*code|fps|frame\s*rate|frames?)\b/.test(s)) {
      return "timing";
    }

    // Render / Output (resolution, aspect ratio, quality) — expanded: 1080p/720p
    if (/\b(resolution|quality|aspect\s*ratio|\bar\b(?!t\b)|output|codec|bitrate|bit\s*rate|(?:4k|8k|1080p|2160p))\b/.test(s)) {
      return "render";
    }

    // Action / Motion / Choreography (fallback when not camera)
    if (/\b(action|motion|behavior|gesture|choreography|blocking|movement|animate|animation)\b/.test(s)) {
      // If the word 'camera' also appears, prefer camera; else action
      if (/\bcamera\b/.test(s)) return "camera";
      return "action";
    }

    return "misc";
  }

  function readAllInputs(form) {
    const fields = [];
    const controls = form.querySelectorAll('input, textarea, select');
    controls.forEach(ctrl => {
      const type = (ctrl.getAttribute && ctrl.getAttribute('type')) ? ctrl.getAttribute('type').toLowerCase() : ctrl.tagName.toLowerCase();
      let value = '';
      let include = true;

      if (type === 'checkbox') {
        value = ctrl.checked ? (ctrl.value || true) : '';
        include = true; // include even when off for visibility
      } else if (type === 'radio') {
        include = ctrl.checked;
        value = ctrl.checked ? (ctrl.value || 'on') : '';
      } else if (ctrl.tagName.toLowerCase() === 'select') {
        value = ctrl.multiple ? Array.from(ctrl.selectedOptions).map(o => o.value) : ctrl.value;
      } else {
        value = ctrl.value;
      }

      const id = ctrl.id || '';
      const name = ctrl.name || '';
      const label = getLabelForInput(ctrl);
      const role = classifyRole(label || name || id);
      fields.push({ id, name, label, type, value, checked: !!ctrl.checked, role, include });
    });
    return fields;
  }

  function buildSectionedPrompt(fields) {
    const parts = [];
    fields.forEach(f => {
      const isEmpty = (Array.isArray(f.value) ? f.value.length === 0 : String(f.value || '').trim() === '');
      if (f.type === 'checkbox') {
        parts.push(`[${f.role.toUpperCase()}] ${f.label || f.name || f.id}: ${f.checked ? 'on' : 'off'}`);
        return;
      }
      if (f.type === 'radio') {
        if (f.include) parts.push(`[${f.role.toUpperCase()}] ${f.label || f.name || f.id}: ${f.value}`);
        return;
      }
      if (!isEmpty) {
        const val = Array.isArray(f.value) ? f.value.join(', ') : f.value;
        parts.push(`[${f.role.toUpperCase()}] ${f.label || f.name || f.id}: ${val}`);
      }
    });
    const roleOrder = ['subject','environment','action','camera','lighting','mood','style','render','audio','timing','negative','misc'];
    const grouped = roleOrder.flatMap(role => parts.filter(p => p.startsWith('[' + role.toUpperCase())))
      .concat(parts.filter(p => roleOrder.every(r => !p.startsWith('['+r.toUpperCase()))));
    return grouped.join('\n');
  }

  function buildConcatenatedPrompt(fields) {
    const parts = [];
    fields.forEach(f => {
      const isEmpty = (Array.isArray(f.value) ? f.value.length === 0 : String(f.value || '').trim() === '');
      if (f.type === 'checkbox') {
        parts.push(`${(f.label || f.name || f.id)}: ${f.checked ? 'on' : 'off'}`);
        return;
      }
      if (f.type === 'radio') {
        if (f.include) parts.push(`${(f.label || f.name || f.id)}: ${f.value}`);
        return;
      }
      if (!isEmpty) {
        const val = Array.isArray(f.value) ? f.value.join(', ') : f.value;
        parts.push(`${(f.label || f.name || f.id)}: ${val}`);
      }
    });
    return parts.join(' | ');
  }

  // Preview mount
  function ensurePreviewMount() {
    const pg = document.getElementById(PROMPT_COLLECTOR_ID);
    if (!pg) return null;
    const wrapper = pg.querySelector('.form-wrapper');
    if (!wrapper) return null;

    let mount = document.getElementById('input-preview');
    if (!mount) {
      mount = document.createElement('div');
      mount.id = 'input-preview';
      mount.className = 'input-preview';
      mount.setAttribute('role', 'region');
      mount.setAttribute('aria-label', 'Generator Input Preview');
      wrapper.insertAdjacentElement('afterend', mount);

      mount.innerHTML = [
        '<span class="title d-none">Collected Input</span>',
        '<div class="input-preview-block">',
        '  <span class="block-title">Sectioned (by role)</span>',
        '  <textarea id="input-sectioned" readonly></textarea>',
        '</div>',
        '<div class="input-preview-block">',
        '  <span class="block-title">Combined (single-line)</span>',
        '  <textarea id="input-concatenated" readonly></textarea>',
        '</div>',
        '<div class="input-preview-block">',
        '  <div class="block-header">',
        '    <span class="block-title">Structured (JSON)</span>',
        '    <label class="input-structured-toggle">',
        '      <input type="checkbox" id="input-structured-toggle">',
        '      Show full (includes prompts)',
        '    </label>',
        '  </div>',
        '  <textarea id="input-structured" readonly></textarea>',
        '</div>'
      ].join('\n');
    }
    return mount;
  }

  // ------------------------------------------------------------
  // OUTPUT .JSON
  // ------------------------------------------------------------

  function mapToCanonicalBuckets(fields) {
    const bucket = {
      subject: [],
      scene: [],
      style: [],
      motion: [],
      atmosphere: [],
      audio: [],
      frame: [],
      message: []
    };

    fields.forEach(f => {
      const val = Array.isArray(f.value)
        ? f.value.join(", ")
        : String(f.value || "").trim();

      if (!val) return;

      switch (f.role) {
        case "subject":
          bucket.subject.push(val);
          break;
        case "environment":
          bucket.scene.push(val);
          break;
        case "style":
          bucket.style.push(val);
          break;
        case "action":
        case "camera":
          bucket.motion.push(val);
          break;
        case "lighting":
        case "mood":
          bucket.atmosphere.push(val);
          break;
        case "audio":
          bucket.audio.push(val);
          break;
        case "render":
        case "timing":
          bucket.frame.push(val);
          break;
        case "negative":
        case "misc":
        default:
          bucket.message.push(val);
      }
    });

    return Object.fromEntries(
      Object.entries(bucket).map(([k, arr]) => [k, arr.join(", ")])
    );
  }

  // ------------------------------------------------------------

  function updateOutputs(form) {
    const mount = ensurePreviewMount();
    if (!mount) return;

    const fieldsAll = readAllInputs(form);
    const fields = fieldsAll.filter(f => !(f.type === 'radio' && !f.include));

    const sectioned = buildSectionedPrompt(fields);
    const flat = buildConcatenatedPrompt(fields);

    const sectionedEl = document.getElementById('input-sectioned');
    const flatEl = document.getElementById('input-concatenated');
    const jsonEl = document.getElementById('input-structured');
    const toggle = document.getElementById('input-structured-toggle');

    if (sectionedEl) sectionedEl.value = sectioned;
    if (flatEl) flatEl.value = flat;

    // NEW canonical output
    const canonical = mapToCanonicalBuckets(fields);

    const payload = {
      instruction:
        "You are a video-prompt compiler. Use the data in the 'input' object to generate ONE concise, production-ready, single-line text-to-video prompt using ONLY the provided fields: subject, scene, style, motion, atmosphere, audio, frame, message. Do not add markdown, labels, categories, or commentary. Make the prompt vivid and cinematic but not verbose. Use natural order: Subject → Scene → Style → Motion → Atmosphere → Audio → Frame → Message. After the prompt, output a SECOND line containing a short random inspirational quote in quotation marks, followed by an em dash and the author's name (or 'Anonymous').",

      input: canonical
    };

    const toDisplay = toggle && toggle.checked
      ? {
          ...payload,
          _debug: {
            sectioned,
            flat,
            raw_fields: fields,
            generated_at: new Date().toISOString(),
            source: "generator.collector.js"
          }
        }
      : payload;

    if (jsonEl) jsonEl.value = JSON.stringify(toDisplay, null, 2);

    window.PromptGen = window.PromptGen || {};
    window.PromptGen.getCollectedPayload = () => ({ ...payload });
  }

  function initCollector() {
    const pg = document.getElementById(PROMPT_COLLECTOR_ID);
    if (!pg) return;
    const form = pg.querySelector('#prompt-form');
    if (!form) return;

    ensurePreviewMount();
    let raf = 0;
    const schedule = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => updateOutputs(form));
    };

    form.addEventListener('input', schedule, true);
    form.addEventListener('change', schedule, true);
    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t && t.id === 'input-structured-toggle') schedule();
    }, true);

    schedule();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCollector);
  } else {
    initCollector();
  }
})();
