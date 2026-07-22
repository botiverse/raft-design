export const MESSAGE_FIXTURE_AVATAR_SRC = "/avatars/message-sender.jpg";

export const MESSAGE_FIXTURE_IMAGE_SRC =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' fill='%23f4f0e8'/%3E%3Crect x='34' y='34' width='572' height='352' fill='%23f7d358' stroke='%23000' stroke-width='8'/%3E%3Ccircle cx='180' cy='168' r='72' fill='%23ff7ab6' stroke='%23000' stroke-width='8'/%3E%3Cpath d='M292 310 406 190l70 72 56-42 74 90z' fill='%23a3e8ff' stroke='%23000' stroke-width='8'/%3E%3C/svg%3E";

export const MESSAGE_QUICK_REACTIONS = ["👍", "❤️", "🎉", "👀", "🔥", "😂", "✅"] as const;

export const MESSAGE_REACTION_SPRITE_PATH = "/reactions/reaction-sprite.svg";
export const MESSAGE_REACTION_SPRITE_SIZE = { width: 168, height: 24 } as const;

export const MESSAGE_REACTION_SPRITE_ITEMS: Record<
  string,
  { id: string; x: number; width: number }
> = {
  "👍": { id: "thumbs_up", x: 0, width: 24 },
  "❤️": { id: "heart", x: 24, width: 24 },
  "❤": { id: "heart", x: 24, width: 24 },
  "🎉": { id: "party_popper", x: 48, width: 24 },
  "👀": { id: "eyes", x: 72, width: 24 },
  "🔥": { id: "fire", x: 96, width: 24 },
  "😂": { id: "joy", x: 120, width: 24 },
  "✅": { id: "check_mark", x: 144, width: 24 },
};

export function downloadMessageFixture(name: string) {
  const link = document.createElement("a");
  link.download = name;
  link.href = MESSAGE_FIXTURE_IMAGE_SRC;
  link.click();
}

export function openMessageFixture() {
  window.open(MESSAGE_FIXTURE_IMAGE_SRC, "_blank", "noopener,noreferrer");
}
