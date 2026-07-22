import { COMPOSER_IMAGE_SRC } from "#/modules/chat-composer/composer-image.ts";

export const MESSAGE_FIXTURE_AVATAR_SRC = "/avatars/message-sender.jpg";

/** Same photo as composer attachment previews — see `COMPOSER_IMAGE_SRC`. */
export const MESSAGE_FIXTURE_IMAGE_SRC = COMPOSER_IMAGE_SRC;

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
