import { ScrollArea } from "@botiverse/raft-ui";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

const days = Array.from({ length: 21 }, (_, index) => `Sep ${index + 1}`);
const people = ["Artea", "Kirby", "Mika", "Noor", "Oskar", "Priya", "Quinn", "Rae", "Sol"];

export function ScrollAreaOrientationContent() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <ScrollArea
        role="region"
        aria-label="Days"
        orientation="horizontal"
        className="w-full rounded-container border border-line-hairline bg-layer-canvas"
      >
        <div className="flex gap-2 px-3 pt-3 pb-5">
          {days.map((day) => (
            <span
              key={day}
              className="flex h-14 w-18 flex-none items-center justify-center rounded-control bg-fill-muted text-sm text-foreground"
            >
              {day}
            </span>
          ))}
        </div>
      </ScrollArea>
      <ScrollArea
        role="region"
        aria-label="Schedule"
        orientation="both"
        className="h-56 w-full rounded-container border border-line-hairline bg-layer-canvas"
      >
        <table className="border-separate border-spacing-0 text-sm whitespace-nowrap text-foreground">
          <tbody>
            {people.map((person) => (
              <tr key={person}>
                <th
                  scope="row"
                  className="sticky inset-s-0 border-e border-b border-line-hairline bg-layer-canvas px-3 py-2 text-start font-bold"
                >
                  {person}
                </th>
                {days.map((day) => (
                  <td key={day} className="border-b border-line-hairline px-3 py-2">
                    {day}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );
}

// @docs-source-strip-start
export function ScrollAreaOrientationComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <ScrollAreaOrientationContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
