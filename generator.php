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
        <input id="prompt-subject" name="prompt-subject" type="text" placeholder="e.g. futuristic city skyline" required aria-required="true" />
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
  </div>

</div>

<link rel="stylesheet" href="generator.css">
<script src="generator.styling.js" defer></script>
<script src="generator.logic.js" defer></script>
<script src="generator.init.js" defer></script>
