import { Children, isValidElement } from "react";
import type { ReactElement, ReactNode } from "react";

import type { PreviewCanvas } from "./preview-canvas.tsx";
import type { PreviewCode } from "./preview-code.tsx";
import type { PreviewControls } from "./preview-controls.tsx";

export function getPreviewPart(
  children: ReactNode,
  part: typeof PreviewCanvas | typeof PreviewControls | typeof PreviewCode,
) {
  return Children.toArray(children).find(
    (child): child is ReactElement<{ children?: ReactNode }> =>
      isValidElement(child) && child.type === part,
  );
}
