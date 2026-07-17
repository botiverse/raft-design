const RESPONSIVE_MODES = [
  {
    id: "desktop",
    label: "Desktop",
    range: "1024px and wider",
    title: "Split panels",
    description:
      "Sidebar, conversation, and an open thread render as adjacent resizable panels. Each panel keeps its own contained scroll boundary.",
  },
  {
    id: "narrow-desktop",
    label: "Narrow desktop",
    range: "768px to 1023px",
    title: "Thread overlay",
    description:
      "The sidebar remains beside the main region. An open thread covers the main region and owns the overlay edge while preserving contained panel scrolling.",
  },
  {
    id: "mobile",
    label: "Mobile",
    range: "Below 768px",
    title: "Document scroll",
    description:
      "The active list, conversation, or thread becomes the page. Content joins document scroll, the active header stays sticky, and the composer stays fixed above the safe area.",
  },
] as const;

export function ResponsiveShellComposition() {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {RESPONSIVE_MODES.map((mode) => (
        <article
          key={mode.id}
          className="overflow-hidden rounded-lg border border-line-subtle bg-layer-panel"
        >
          <div className="border-b border-line-subtle px-4 py-3">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-medium text-foreground-strong">{mode.label}</h3>
              <span className="shrink-0 font-mono text-xs text-foreground-muted">{mode.range}</span>
            </div>
            <p className="mt-1 text-sm font-medium text-foreground-muted">{mode.title}</p>
          </div>

          <ResponsiveModeDiagram mode={mode.id} />

          <p className="border-t border-line-subtle px-4 py-3 text-sm leading-6 text-foreground-muted">
            {mode.description}
          </p>
        </article>
      ))}
    </div>
  );
}

function ResponsiveModeDiagram({ mode }: { mode: (typeof RESPONSIVE_MODES)[number]["id"] }) {
  if (mode === "desktop") {
    return (
      <div
        className="flex h-44 gap-px bg-line-subtle p-px"
        role="img"
        aria-label="Desktop shell with rail, sidebar, conversation, and thread as adjacent regions"
      >
        <DiagramRegion className="w-7" label="Rail" vertical />
        <DiagramRegion className="w-20" label="Sidebar" />
        <DiagramRegion className="min-w-0 flex-1" label="Conversation" />
        <DiagramRegion className="w-24" label="Thread" />
      </div>
    );
  }

  if (mode === "narrow-desktop") {
    return (
      <div
        className="flex h-44 gap-px bg-line-subtle p-px"
        role="img"
        aria-label="Narrow desktop shell with rail and sidebar beside a thread overlay covering the conversation"
      >
        <DiagramRegion className="w-7" label="Rail" vertical />
        <DiagramRegion className="w-20" label="Sidebar" />
        <div className="relative min-w-0 flex-1 bg-layer-muted">
          <span className="absolute top-3 left-3 text-xs text-foreground-placeholder">
            Conversation
          </span>
          <div className="absolute inset-y-0 right-0 flex w-[82%] items-center justify-center border-l border-line-subtle bg-layer-panel text-xs font-medium text-foreground-strong shadow-md">
            Thread overlay
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-44 justify-center bg-layer-muted p-3"
      role="img"
      aria-label="Mobile page with a sticky header, document-scrolling content, and a fixed composer"
    >
      <div className="flex w-36 flex-col overflow-hidden rounded-md border border-line-subtle bg-layer-panel shadow-sm">
        <div className="border-b border-line-subtle px-3 py-2 text-center text-xs font-medium text-foreground-strong">
          Sticky header
        </div>
        <div className="flex min-h-0 flex-1 items-center justify-center px-3 text-center text-xs leading-5 text-foreground-muted">
          Document-scrolling content
        </div>
        <div className="m-2 rounded-md border border-line-subtle bg-layer-raised px-2 py-2 text-center text-xs font-medium text-foreground-strong shadow-sm">
          Fixed composer
        </div>
      </div>
    </div>
  );
}

function DiagramRegion({
  className,
  label,
  vertical = false,
}: {
  className: string;
  label: string;
  vertical?: boolean;
}) {
  return (
    <div
      className={`${className} flex items-center justify-center bg-layer-panel text-xs font-medium text-foreground-strong`}
    >
      <span className={vertical ? "[writing-mode:vertical-rl]" : ""}>{label}</span>
    </div>
  );
}
