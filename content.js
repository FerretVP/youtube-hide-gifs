// Applies the mode chosen in the popup. Hiding itself is pure CSS (content.css);
// this script only sets the mode attribute and, in "reveal" mode, adds
// a "Show GIF" button next to every hidden GIF.

const MODES = ["off", "reveal", "hide-comment"];
const DEFAULT_MODE = "reveal";
const LANGS = ["ru", "en"];

const BUTTON_TEXT = {
  ru: { show: "Показать GIF", hide: "Скрыть GIF" },
  en: { show: "Show GIF", hide: "Hide GIF" },
};

const ATTACHMENT = "ytw-comment-image-attachment-view-model";
const GIF_IMG = 'img[src*="animated"]';
const BUTTON_CLASS = "ythg-reveal-btn";
const REVEALED_CLASS = "ythg-revealed";

let mode = DEFAULT_MODE;
// Until the user picks a language in the popup, follow the browser's.
let lang = chrome.i18n.getUILanguage().startsWith("ru") ? "ru" : "en";

// Older versions stored a boolean "enabled" instead of a mode, or the
// removed "hide" mode; both fall back to the default.
function readMode(stored) {
  if (MODES.includes(stored.mode)) return stored.mode;
  return stored.enabled === false ? "off" : DEFAULT_MODE;
}

// <html> can be swapped or have its attributes rewritten by the page,
// so the mode attribute is re-applied whenever it goes missing.
function syncModeAttribute() {
  const root = document.documentElement;
  if (root && root.dataset.ythgMode !== mode) root.dataset.ythgMode = mode;
}

function apply(newMode) {
  mode = newMode;
  syncModeAttribute();
  if (mode === "reveal") scheduleScan();
}

function setButtonText(button, revealed) {
  button.textContent = revealed ? BUTTON_TEXT[lang].hide : BUTTON_TEXT[lang].show;
}

function setLang(newLang) {
  if (!LANGS.includes(newLang)) return;
  lang = newLang;
  for (const button of document.querySelectorAll(`.${BUTTON_CLASS}`)) {
    setButtonText(button, button.nextElementSibling?.classList.contains(REVEALED_CLASS));
  }
}

function addRevealButton(attachment) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = BUTTON_CLASS;
  // Keep the button in the same slot as the attachment so YouTube renders it.
  if (attachment.slot) button.slot = attachment.slot;
  setButtonText(button, false);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    const revealed = attachment.classList.toggle(REVEALED_CLASS);
    setButtonText(button, revealed);
  });
  attachment.before(button);
  return button;
}

function scan() {
  for (const attachment of document.querySelectorAll(ATTACHMENT)) {
    const img = attachment.querySelector(GIF_IMG);
    let button = attachment.previousElementSibling;
    if (!button?.classList.contains(BUTTON_CLASS)) button = null;

    if (!img) {
      button?.remove();
      continue;
    }

    // YouTube reuses comment elements when scrolling or switching videos,
    // so a new GIF in the same element starts hidden again.
    if (attachment.dataset.ythgSrc !== img.src) {
      attachment.dataset.ythgSrc = img.src;
      attachment.classList.remove(REVEALED_CLASS);
      if (button) setButtonText(button, false);
    }

    if (!button) addRevealButton(attachment);
  }
}

let scanQueued = false;
function scheduleScan() {
  if (scanQueued) return;
  scanQueued = true;
  requestAnimationFrame(() => {
    scanQueued = false;
    scan();
  });
}

// Use the default until the saved setting is read, to avoid a flash of GIFs.
apply(DEFAULT_MODE);

new MutationObserver(() => {
  syncModeAttribute();
  if (mode === "reveal") scheduleScan();
}).observe(document, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ["src", "data-ythg-mode"],
});

chrome.storage.sync.get({ mode: null, enabled: null, lang: null }, (stored) => {
  setLang(stored.lang);
  apply(readMode(stored));
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== "sync") return;
  if ("lang" in changes) setLang(changes.lang.newValue);
  if ("mode" in changes) apply(readMode({ mode: changes.mode.newValue }));
});
