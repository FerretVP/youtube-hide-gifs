// Keep in sync with MODES in content.js.
const MODES = ["off", "reveal", "hide-comment"];
const DEFAULT_MODE = "reveal";

const DESCRIPTIONS = {
  off: "GIF показываются как обычно.",
  reveal: "GIF скрыты. Нажмите «Показать GIF», чтобы просмотреть их.",
  "hide-comment": "Комментарии с GIF скрыты целиком, вместе с ответами.",
};

const radios = document.querySelectorAll('input[name="mode"]');
const description = document.getElementById("description");

document.getElementById("version").textContent = `v${chrome.runtime.getManifest().version}`;

function render(mode) {
  radios.forEach((radio) => {
    radio.checked = radio.value === mode;
  });
  description.textContent = DESCRIPTIONS[mode];
}

// Older versions stored a boolean "enabled" instead of a mode, or the
// removed "hide" mode; both fall back to the default.
chrome.storage.sync.get({ mode: null, enabled: null }, (stored) => {
  let mode = stored.mode;
  if (!MODES.includes(mode)) mode = stored.enabled === false ? "off" : DEFAULT_MODE;
  render(mode);
});

radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    render(radio.value);
    chrome.storage.sync.set({ mode: radio.value });
  });
});
