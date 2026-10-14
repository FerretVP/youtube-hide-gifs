// Keep in sync with MODES and LANGS in content.js.
const MODES = ["off", "reveal", "hide-comment"];
const DEFAULT_MODE = "reveal";
const LANGS = ["ru", "en"];

const STRINGS = {
  ru: {
    createdBy: "Автор",
    groupLabel: "GIF в комментариях",
    off: "Показывать",
    reveal: "По кнопке",
    "hide-comment": "Скрыть",
    descriptions: {
      off: "GIF показываются как обычно.",
      reveal: "GIF скрыты. Нажмите «Показать GIF», чтобы просмотреть их.",
      "hide-comment": "Комментарии с GIF скрыты целиком, вместе с ответами.",
    },
  },
  en: {
    createdBy: "Created by",
    groupLabel: "GIFs in comments",
    off: "Show",
    reveal: "On click",
    "hide-comment": "Hide",
    descriptions: {
      off: "GIFs are shown as usual.",
      reveal: "GIFs are hidden. Click “Show GIF” to view them.",
      "hide-comment": "Comments with GIFs are hidden entirely, replies included.",
    },
  },
};

const radios = document.querySelectorAll('input[name="mode"]');
const langButtons = document.querySelectorAll("[data-lang]");
const description = document.getElementById("description");

let mode = DEFAULT_MODE;
let lang = defaultLang();

document.getElementById("version").textContent = `v${chrome.runtime.getManifest().version}`;

// Until the user picks a language, follow the browser's.
function defaultLang() {
  return chrome.i18n.getUILanguage().startsWith("ru") ? "ru" : "en";
}

function render() {
  const strings = STRINGS[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = strings[el.dataset.i18n];
  });
  document.querySelector(".segmented").setAttribute("aria-label", strings.groupLabel);
  description.textContent = strings.descriptions[mode];

  radios.forEach((radio) => {
    radio.checked = radio.value === mode;
  });
  langButtons.forEach((button) => {
    button.setAttribute("aria-pressed", button.dataset.lang === lang);
  });
}

// Older versions stored a boolean "enabled" instead of a mode, or the
// removed "hide" mode; both fall back to the default.
chrome.storage.sync.get({ mode: null, enabled: null, lang: null }, (stored) => {
  mode = MODES.includes(stored.mode) ? stored.mode : stored.enabled === false ? "off" : DEFAULT_MODE;
  if (LANGS.includes(stored.lang)) lang = stored.lang;
  render();
});

radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    mode = radio.value;
    render();
    chrome.storage.sync.set({ mode });
  });
});

langButtons.forEach((button) => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    render();
    chrome.storage.sync.set({ lang });
  });
});
