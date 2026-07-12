import { MessageReactionGlyph } from "raft-ui/wip";
import {
  MESSAGE_REACTION_SPRITE_ITEMS,
  MESSAGE_REACTION_SPRITE_PATH,
  MESSAGE_REACTION_SPRITE_SIZE,
} from "#/fixtures/message-item/assets.ts";

export function MessageReactionGlyphComposition({
  emoji,
  size = 15,
}: {
  emoji: string;
  size?: number;
}) {
  const item = MESSAGE_REACTION_SPRITE_ITEMS[emoji];

  return (
    <MessageReactionGlyph>
      {item ? (
        <span
          aria-hidden="true"
          className="block"
          data-reaction-glyph={item.id}
          data-reaction-sprite-path={MESSAGE_REACTION_SPRITE_PATH}
          style={{
            backgroundImage: `url(${MESSAGE_REACTION_SPRITE_PATH})`,
            backgroundPosition: `${-item.x * (size / item.width)}px 0px`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${MESSAGE_REACTION_SPRITE_SIZE.width * (size / item.width)}px ${MESSAGE_REACTION_SPRITE_SIZE.height * (size / item.width)}px`,
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
