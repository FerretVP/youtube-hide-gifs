// Slider positions, in order. Keep in sync with MODES in content.js.
const MODES = ["off", "reveal", "hide-comment"];
const DEFAULT_MODE = "reveal";

const DESCRIPTIONS = {
  off: "Гифки показываются как обычно.",
  reveal: "Гифки скрыты. На их месте кнопка «Показать GIF».",
  "hide-comment": "Комментарии с гифками скрыты целиком.",
};

const slider = document.getElementById("mode");
const labels = document.querySelectorAll(".labels button");
const description = document.getElementById("description");

function render(mode) {
  const index = MODES.indexOf(mode);
  slider.value = index;
  labels.forEach((label, i) => label.classList.toggle("active", i === index));
  description.textContent = DESCRIPTIONS[mode];
}

function save(index) {
  const mode = MODES[index];
  render(mode);
  chrome.storage.sync.set({ mode });
}

// Older versions stored a boolean "enabled" instead of a mode, or the
// removed "hide" mode; both fall back to the default.
chrome.storage.sync.get({ mode: null, enabled: null }, (stored) => {
  let mode = stored.mode;
  if (!MODES.includes(mode)) mode = stored.enabled === false ? "off" : DEFAULT_MODE;
  render(mode);
});

slider.addEventListener("input", () => save(Number(slider.value)));
labels.forEach((label) => {
  label.addEventListener("click", () => save(Number(label.dataset.index)));
});
