/** The search shortcut as the platform writes it: ⌘K on Apple devices, Ctrl K elsewhere. */
export const SEARCH_SHORTCUT = /Mac|iPhone|iPad|iPod/.test(
  typeof navigator === "undefined" ? "" : navigator.platform || navigator.userAgent,
)
  ? "⌘K"
  : "Ctrl K";
