import { PreviewCanvas } from "./preview-canvas.tsx";
import { PreviewCheckbox } from "./preview-checkbox.tsx";
import { PreviewCode } from "./preview-code.tsx";
import { PreviewControl } from "./preview-control.tsx";
import { PreviewControlGroup } from "./preview-control-group.tsx";
import { PreviewControls } from "./preview-controls.tsx";
import { PreviewRadio } from "./preview-radio.tsx";
import { PreviewRoot } from "./preview-root.tsx";
import { PreviewSegmented } from "./preview-segmented.tsx";
import { PreviewSelect } from "./preview-select.tsx";
import { PreviewText } from "./preview-text.tsx";

export const Preview = Object.assign(PreviewRoot, {
  Canvas: PreviewCanvas,
  Controls: PreviewControls,
  ControlGroup: PreviewControlGroup,
  Control: PreviewControl,
  Select: PreviewSelect,
  Radio: PreviewRadio,
  Segmented: PreviewSegmented,
  Checkbox: PreviewCheckbox,
  Text: PreviewText,
  Code: PreviewCode,
});
