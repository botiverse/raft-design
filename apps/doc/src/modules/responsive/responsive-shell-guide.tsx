const OWNERSHIP = [
  {
    owner: "raft-ui panels",
    responsibility:
      "Reusable structure, panel chrome, and the default contained-scroll layout. They do not choose product breakpoints or route presentation.",
  },
  {
    owner: "Playground shell",
    responsibility:
      "Breakpoint detection, which product surface is active, desktop resize regions, narrow-desktop thread overlay, and the mobile document-scroll classes.",
  },
  {
    owner: "Playground compositions",
    responsibility:
      "Sticky header or tabs, fixed composer placement, and the content clearance that keeps the last message visible above the composer.",
  },
] as const;

export function ResponsiveShellOwnership() {
  return (
    <dl className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle">
      {OWNERSHIP.map((item) => (
        <div key={item.owner} className="grid gap-2 p-4 sm:grid-cols-[10rem_1fr] sm:gap-6">
          <dt className="font-medium text-foreground-strong">{item.owner}</dt>
          <dd className="text-sm leading-6 text-foreground-muted">{item.responsibility}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ResponsiveShellValidation() {
  return (
    <ul className="list-disc space-y-3 pl-5 text-sm leading-6 text-foreground-muted marker:text-foreground-placeholder">
      <li>
        Cross 768px and confirm the active mobile surface replaces the multi-panel shell without a
        nested scroll container.
      </li>
      <li>
        Between 768px and 1023px, open a thread and confirm it covers the conversation, keeps its
        left hairline, and does not expose the conversation composer underneath.
      </li>
      <li>
        At 1024px and wider, confirm the thread returns to an adjacent resizable panel and the
        divider remains visible through the footer fade.
      </li>
      <li>
        On mobile, scroll a long conversation and thread to verify sticky headers, composer
        safe-area placement, and enough clearance below the final message.
      </li>
    </ul>
  );
}
