// Toggles the class that content.css uses to hide GIFs.
// Hiding itself is pure CSS, so comments loaded later are covered automatically.

const CLASS_NAME = "ythg-enabled";

function apply(enabled) {
  document.documentElement.classList.toggle(CLASS_NAME, enabled);
}

// Hide by default until the saved setting is read, to avoid a flash of GIFs.
apply(true);

chrome.storage.sync.get({ enabled: true }, ({ enabled }) => apply(enabled));

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && "enabled" in changes) {
    apply(changes.enabled.newValue);
  }
});
