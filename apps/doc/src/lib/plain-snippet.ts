function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Wrap plain text as CodeBlock markup. For sources whose grammar is not in the
 * fine-grained Shiki bundle, such as the Markdown input a renderer is fed.
 */
export function plainSnippet(code: string) {
  return `<pre><code>${escapeHtml(code)}</code></pre>`;
}
