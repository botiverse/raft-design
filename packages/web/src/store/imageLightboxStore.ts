import { create } from "zustand";
import type { MessageAttachment } from "./messageStore";

export { type MessageAttachment };

interface ImageLightboxState {
  /** Whether the lightbox is open */
  isOpen: boolean;
  /** All image attachments from the same message */
  images: MessageAttachment[];
  /** Index of the currently displayed image */
  currentIndex: number;
  /** Session-scoped mapping so reopening the same attachment can reuse a still-valid URL. */
  imageUrlCache: Record<string, { url: string; expiresAt: string | null }>;

  open: (images: MessageAttachment[], startIndex: number) => void;
  close: () => void;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  cacheImageUrl: (attachmentId: string, value: { url: string; expiresAt: string | null }) => void;
}

export const useImageLightboxStore = create<ImageLightboxState>((set, get) => ({
  isOpen: false,
  images: [],
  currentIndex: 0,
  imageUrlCache: {},

  open: (images, startIndex) =>
    set({ isOpen: true, images, currentIndex: startIndex }),

  close: () => set({ isOpen: false, images: [], currentIndex: 0 }),

  next: () => {
    const { currentIndex, images } = get();
    if (currentIndex < images.length - 1) {
      set({ currentIndex: currentIndex + 1 });
    }
  },

  prev: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) {
      set({ currentIndex: currentIndex - 1 });
    }
  },

  goTo: (index) => {
    const { images } = get();
    if (index >= 0 && index < images.length) {
      set({ currentIndex: index });
    }
  },

  cacheImageUrl: (attachmentId, value) =>
    set((state) => ({
      imageUrlCache: {
        ...state.imageUrlCache,
        [attachmentId]: value,
      },
    })),
}));
