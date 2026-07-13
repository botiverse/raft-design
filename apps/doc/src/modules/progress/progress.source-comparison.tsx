import { ProgressAttachmentUploadComposition } from "./compositions/attachment-upload.composition.tsx";
import { ProgressMachineDownloadComposition } from "./compositions/machine-download.composition.tsx";
import { ProgressRestartIndeterminateComposition } from "./compositions/restart-indeterminate.composition.tsx";
import { ProgressAttachmentUploadSourcePreview } from "./source-comparison/attachment-upload.source.tsx";
import { ProgressMachineDownloadSourcePreview } from "./source-comparison/machine-download.source.tsx";
import { ProgressRestartIndeterminateSourcePreview } from "./source-comparison/restart-indeterminate.source.tsx";

export const PROGRESS_SOURCE_COMPARISON_COMPOSITION_PATHS = {
  AttachmentUpload: "apps/doc/src/modules/progress/compositions/attachment-upload.composition.tsx",
  MachineDownload: "apps/doc/src/modules/progress/compositions/machine-download.composition.tsx",
  RestartIndeterminate:
    "apps/doc/src/modules/progress/compositions/restart-indeterminate.composition.tsx",
} as const;

export const PROGRESS_SOURCE_COMPARISON_COMPOSITION = {
  AttachmentUpload: ProgressAttachmentUploadComposition,
  MachineDownload: ProgressMachineDownloadComposition,
  RestartIndeterminate: ProgressRestartIndeterminateComposition,
} as const;

export const PROGRESS_SOURCE_COMPARISON_SOURCE = {
  AttachmentUpload: ProgressAttachmentUploadSourcePreview,
  MachineDownload: ProgressMachineDownloadSourcePreview,
  RestartIndeterminate: ProgressRestartIndeterminateSourcePreview,
} as const;
