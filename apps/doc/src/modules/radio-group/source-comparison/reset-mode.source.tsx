import { SourceComparisonPreview } from "#/components/source-comparison-preview.tsx";

const resetModeOptions = [
  {
    value: "restart",
    label: "Restart",
    description:
      "Stop and restart the agent process. Keeps the runtime session and workspace files.",
    checked: true,
  },
  {
    value: "session",
    label: "Reset Session & Restart",
    description: "Clear the runtime session and restart. Workspace files are preserved.",
    checked: false,
  },
  {
    value: "full",
    label: "Full Reset & Restart",
    description: "Clear the runtime session, delete all workspace files, and restart from scratch.",
    checked: false,
  },
] as const;

export function RadioGroupResetModeSourcePreview({ className }: { className?: string }) {
  return (
    <SourceComparisonPreview className={className}>
      <div className="grid w-[22rem] max-w-full gap-3">
        {resetModeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            className={[
              "w-full border-2 p-4 text-left",
              option.checked
                ? "border-black bg-brutal-cyan/20 shadow-brutal-sm"
                : "border-black/30 bg-white",
            ].join(" ")}
          >
            <div className="text-sm font-bold uppercase">{option.label}</div>
            <p className="mt-1 text-xs text-black/60">{option.description}</p>
          </button>
        ))}
      </div>
    </SourceComparisonPreview>
  );
}
