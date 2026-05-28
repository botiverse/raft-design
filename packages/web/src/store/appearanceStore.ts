import { create } from "zustand";

export type MessageBodyFontSize = "sm" | "md" | "lg";

export const MESSAGE_BODY_FONT_SIZE_OPTIONS: Array<{
  value: MessageBodyFontSize;
  label: string;
  sizeLabel: string;
  className: string;
}> = [
  { value: "sm", label: "Small", sizeLabel: "12px", className: "text-xs" },
  { value: "md", label: "Medium", sizeLabel: "14px", className: "text-sm" },
  { value: "lg", label: "Large", sizeLabel: "16px", className: "text-base" },
];

const MESSAGE_BODY_FONT_SIZE_CLASSES: Record<MessageBodyFontSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

export function normalizeMessageBodyFontSize(value: unknown): MessageBodyFontSize {
  return value === "sm" || value === "lg" ? value : "md";
}

export function getMessageBodyFontSizeClass(size: MessageBodyFontSize): string {
  return MESSAGE_BODY_FONT_SIZE_CLASSES[size];
}

interface AppearanceState {
  messageBodyFontSize: MessageBodyFontSize;
  hydrateMessageBodyFontSize: (size: MessageBodyFontSize | null | undefined) => void;
  setMessageBodyFontSize: (size: MessageBodyFontSize) => void;
}

export const useAppearanceStore = create<AppearanceState>((set) => ({
  messageBodyFontSize: "md",
  hydrateMessageBodyFontSize: (size) => {
    set({ messageBodyFontSize: normalizeMessageBodyFontSize(size) });
  },
  setMessageBodyFontSize: (size) => {
    set({ messageBodyFontSize: normalizeMessageBodyFontSize(size) });
  },
}));
