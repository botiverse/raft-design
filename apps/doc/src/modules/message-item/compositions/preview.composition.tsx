import { MessageItemPreview } from "./item-preview.composition.tsx";

export function MessageItemPreviewContent() {
  return (
    <div className="w-full max-w-3xl">
      <MessageItemPreview chrome="default" meta reactions toolbar />
    </div>
  );
}
