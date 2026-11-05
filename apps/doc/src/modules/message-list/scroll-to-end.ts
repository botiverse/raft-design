/** Scroll a list to its end, as Back to bottom does. */
export function scrollToEnd(list: HTMLDivElement | null) {
  list?.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
}
