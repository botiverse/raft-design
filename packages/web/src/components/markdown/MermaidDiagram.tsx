import { useEffect, useMemo, useState } from "react";
import Spinner from "../ui/Spinner";
import SandboxedPreviewFrame from "../ui/SandboxedPreviewFrame";
import CopyableCodeBlock from "./CopyableCodeBlock";
import { buildMermaidSrcDoc, parseSvgAspect } from "./mermaidFrame";

// `beautiful-mermaid` renders synchronously (string → SVG string, no DOM
// deps). We still lazy-load the module so its layout engine (elkjs) never
// enters the main bundle — it's only needed when a markdown *attachment*
// preview actually contains a ```mermaid block. The import is cached
// module-level so the second+ diagram in the same preview renders instantly.
type MermaidModule = typeof import("beautiful-mermaid");
let mermaidModulePromise: Promise<MermaidModule> | null = null;
function loadMermaid(): Promise<MermaidModule> {
  if (!mermaidModulePromise) {
    mermaidModulePromise = import("beautiful-mermaid");
  }
  return mermaidModulePromise;
}

function MermaidSourceFallback({ code, note }: { code: string; note: string }) {
  // Degrade to the raw fenced block — never blank. Same dark code-block look
  // as the BASE markdown `pre` so it stays visually consistent with every
  // other code block in the preview.
  return (
    <div className="my-2">
      <CopyableCodeBlock className="overflow-x-auto border-2 border-black bg-gray-900 p-3 pr-12 text-sm text-white font-mono [&>code]:border-0 [&>code]:bg-transparent [&>code]:p-0">
        <code>{code}</code>
      </CopyableCodeBlock>
      <p className="mt-1 text-xs font-mono text-brutal-orange">{note}</p>
    </div>
  );
}

/**
 * Renders a ```mermaid fenced block (from a markdown attachment preview) as an
 * SVG. The diagram source is FULLY attacker-controlled, so the SVG is framed
 * inside a sandboxed iframe with an *empty* sandbox (no allow-scripts, no
 * allow-same-origin): opaque origin + zero script execution makes any
 * script/onload/foreignObject/javascript: in the SVG inert, without trusting a
 * sanitizer. Same isolation primitive as the HTML attachment preview.
 * @Bugen security review #proj-uiux:df4d393b.
 *
 * Synchronous render once the lazy module is loaded; any parse/render error
 * degrades to the original source block. Scoped to the attachment-preview
 * surface only (opt-in via MarkdownContent's `enableMermaid`).
 */
export default function MermaidDiagram({ code }: { code: string }) {
  const [mod, setMod] = useState<MermaidModule | null>(null);
  const [moduleFailed, setModuleFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadMermaid().then(
      (m) => live && setMod(m),
      () => live && setModuleFailed(true),
    );
    return () => {
      live = false;
    };
  }, []);

  const result = useMemo<
    { srcDoc: string; w: number; h: number } | { error: true } | null
  >(() => {
    if (!mod) return null;
    try {
      // transparent → sits on the brutalist white container; ink fg matches
      // Slock's #141111 border/text so the diagram reads as part of the UI.
      const svg = mod.renderMermaidSVG(code, { transparent: true, fg: "#141111" });
      const { w, h } = parseSvgAspect(svg);
      return { srcDoc: buildMermaidSrcDoc(svg), w, h };
    } catch {
      return { error: true };
    }
  }, [mod, code]);

  if (moduleFailed) {
    return <MermaidSourceFallback code={code} note="Couldn't load the diagram renderer — showing source." />;
  }
  if (result && "error" in result) {
    return <MermaidSourceFallback code={code} note="Couldn't render this mermaid diagram — showing source." />;
  }
  if (!result) {
    return (
      <div className="my-2 flex items-center gap-2 border-2 border-black bg-white p-3 text-sm text-black/60">
        <Spinner size="sm" />
        Rendering diagram…
      </div>
    );
  }
  return (
    <div className="my-2 overflow-hidden border-2 border-black bg-white">
      {/* Empty sandbox = no scripts, no same-origin: the SVG renders in an
          opaque origin and cannot touch Slock's DOM/cookies even if it
          contains script/onload/foreignObject/javascript:. CSS aspect-ratio
          sizes the frame from the SVG's intrinsic viewBox — no JS measurement,
          no double scrollbar, no clipping. */}
      <SandboxedPreviewFrame
        srcDoc={result.srcDoc}
        sandbox=""
        referrerPolicy="no-referrer"
        title="Mermaid diagram"
        className="block w-full border-0 bg-transparent"
        style={{ width: "100%", aspectRatio: `${result.w} / ${result.h}` }}
      />
    </div>
  );
}
