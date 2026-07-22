export function MessageMarkdownSourcePreview() {
  return (
    <article className="flex w-full max-w-xl gap-3 bg-white p-4 font-sans text-black">
      <div className="flex size-9 shrink-0 items-center justify-center border-2 border-black bg-brutal-lavender text-sm font-bold">
        AT
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 text-sm">
          <span className="font-bold">Atlas</span>
          <span className="font-mono text-xs text-black/50">2:18 PM</span>
        </div>
        <div className="mt-1 text-sm leading-5">
          <p>
            The source renderer keeps <strong>bold</strong>, <em>emphasis</em>, and{" "}
            <code className="border border-black bg-brutal-stone px-1 font-mono text-xs">
              inline code
            </code>{" "}
            inside the message row.
          </p>
          <blockquote className="my-2 border-l-4 border-black pl-3 text-black/70">
            Markdown remains bounded by the message content column.
          </blockquote>
          <pre className="max-w-full overflow-x-auto border-2 border-black bg-brutal-stone p-2 font-mono text-xs">
            <code>{"const theme = 'brutal';"}</code>
          </pre>
        </div>
      </div>
    </article>
  );
}
