// Pure helpers for framing a beautiful-mermaid SVG inside a sandboxed iframe.
// Kept dependency-free so they unit-test under node:test directly.

/** Aspect ratio (w/h) parsed from the generated SVG so the sandboxed iframe
 *  can size itself with CSS `aspect-ratio` (no JS measurement, no double
 *  scrollbar, no clipping). Falls back to a sane 4:3 when unparseable. */
export function parseSvgAspect(svg: string): { w: number; h: number } {
  const vb = svg.match(/viewBox\s*=\s*["']\s*[\d.eE+-]+\s+[\d.eE+-]+\s+([\d.eE+-]+)\s+([\d.eE+-]+)\s*["']/);
  if (vb) {
    const w = Number(vb[1]);
    const h = Number(vb[2]);
    if (w > 0 && h > 0) return { w, h };
  }
  const wAttr = svg.match(/\bwidth\s*=\s*["']\s*([\d.]+)/);
  const hAttr = svg.match(/\bheight\s*=\s*["']\s*([\d.]+)/);
  const w = wAttr ? Number(wAttr[1]) : NaN;
  const h = hAttr ? Number(hAttr[1]) : NaN;
  if (w > 0 && h > 0) return { w, h };
  return { w: 4, h: 3 };
}

/**
 * Minimal HTML document that frames the SVG. Defense-in-depth on top of the
 * empty-sandbox iframe: a strict CSP meta blocks any network/script the SVG
 * might try, even though the empty sandbox already forbids script execution
 * and same-origin access entirely.
 */
export function buildMermaidSrcDoc(svg: string): string {
  return [
    "<!doctype html><html><head><meta charset=\"utf-8\">",
    '<meta http-equiv="Content-Security-Policy" ',
    "content=\"default-src 'none'; style-src 'unsafe-inline'; img-src data:\">",
    "<style>html,body{margin:0;padding:0;background:transparent}",
    "svg{display:block;width:100%;height:auto}</style></head>",
    `<body>${svg}</body></html>`,
  ].join("");
}
