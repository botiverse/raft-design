import { FileText, Image as ImageIcon, Upload } from "lucide-react";
import { useThemeFamily } from "raft-ui";
import { ComposerDropOverlayLabel } from "raft-ui/wip";

export function ComposerDropOverlayPrompt() {
  const theme = useThemeFamily();

  if (theme !== "elegant") {
    return <ComposerDropOverlayLabel>Drop files to attach</ComposerDropOverlayLabel>;
  }

  return (
    <ComposerDropOverlayLabel>
      <span aria-hidden className="flex items-center gap-1.5">
        <span className="rounded-md bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle">
          <FileText className="size-4 text-foreground-icon" />
        </span>
        <span className="rounded-md bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle">
          <Upload className="size-4 text-foreground-icon" />
        </span>
        <span className="rounded-md bg-layer-panel p-2 shadow-md ring-1 ring-line-subtle">
          <ImageIcon className="size-4 text-foreground-icon" />
        </span>
      </span>
      <span>Drop files here</span>
    </ComposerDropOverlayLabel>
  );
}
