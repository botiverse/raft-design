import { MessageReactionGlyph } from "raft-ui/wip";

const REACTION_SPRITE_PATH = "/reactions/reaction-sprite.svg";
const REACTION_SPRITE_SIZE = { width: 168, height: 24 } as const;

const REACTION_SPRITE_ITEMS: Record<string, { id: string; x: number; width: number }> = {
  "👍": { id: "thumbs_up", x: 0, width: 24 },
  "❤️": { id: "heart", x: 24, width: 24 },
  "❤": { id: "heart", x: 24, width: 24 },
  "🎉": { id: "party_popper", x: 48, width: 24 },
  "👀": { id: "eyes", x: 72, width: 24 },
  "🔥": { id: "fire", x: 96, width: 24 },
  "😂": { id: "joy", x: 120, width: 24 },
  "✅": { id: "check_mark", x: 144, width: 24 },
};

export function MessageReactionGlyphComposition({
  emoji,
  size = 15,
}: {
  emoji: string;
  size?: number;
}) {
  const item = REACTION_SPRITE_ITEMS[emoji];

  return (
    <MessageReactionGlyph>
      {item ? (
        <span
          aria-hidden="true"
          className="block"
          data-reaction-glyph={item.id}
          data-reaction-sprite-path={REACTION_SPRITE_PATH}
          style={{
            backgroundImage: `url(${REACTION_SPRITE_PATH})`,
            backgroundPosition: `${-item.x * (size / item.width)}px 0px`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${REACTION_SPRITE_SIZE.width * (size / item.width)}px ${REACTION_SPRITE_SIZE.height * (size / item.width)}px`,
            display: "inline-block",
            height: size,
            lineHeight: 1,
            width: size,
          }}
        />
      ) : (
        <span aria-hidden="true" className="block" style={{ fontSize: size, lineHeight: 1 }}>
          {emoji}
        </span>
      )}
    </MessageReactionGlyph>
  );
}
