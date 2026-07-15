export const PLAYGROUND_SEARCH_FOCUS_EVENT = "playground:search-focus";

export function requestPlaygroundSearchFocus() {
  window.dispatchEvent(new Event(PLAYGROUND_SEARCH_FOCUS_EVENT));
}
