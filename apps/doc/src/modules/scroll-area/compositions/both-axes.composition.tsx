import {
  ScrollArea,
  ScrollAreaContent,
  ScrollAreaCorner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
  Text,
} from "raft-ui";

const CELLS = Array.from({ length: 12 }, (_, row) =>
  Array.from({ length: 12 }, (_, column) => `${row + 1}:${column + 1}`),
);

export function ScrollAreaBothAxesComposition() {
  return (
    <ScrollArea className="h-56 w-72 border border-line-muted bg-layer-panel [[data-theme=elegant]_&]:rounded-lg">
      <ScrollAreaViewport>
        <ScrollAreaContent className="p-4">
          <div className="grid w-[36rem] grid-cols-12 gap-2">
            {CELLS.flatMap((row) =>
              row.map((cell) => (
                <Text.Sans
                  key={cell}
                  size="small"
                  className="flex size-12 items-center justify-center bg-layer-muted [[data-theme=elegant]_&]:rounded-md"
                >
                  {cell}
                </Text.Sans>
              )),
            )}
          </div>
        </ScrollAreaContent>
      </ScrollAreaViewport>
      <ScrollAreaScrollbar>
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaScrollbar orientation="horizontal">
        <ScrollAreaThumb />
      </ScrollAreaScrollbar>
      <ScrollAreaCorner />
    </ScrollArea>
  );
}
