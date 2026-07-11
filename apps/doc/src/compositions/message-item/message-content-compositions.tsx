import type { ReactNode } from "react";
import { Link as LinkIcon } from "lucide-react";
import { PreviewCard, PreviewCardContent, PreviewCardTrigger, Spinner } from "raft-ui";
import {
  MessageCodeBlock,
  MessageInlineCode,
  MessageMarkdown,
  MessageMarkdownTableScroll,
  MessageReferenceLabel,
  MessageReferenceLoading,
  MessageReferenceMention,
  MessageReferenceMeta,
  MessageReferencePermalink,
  MessageReferenceSelfMention,
} from "raft-ui/wip";

type MessageReferenceCompositionProps = {
  children: ReactNode;
  href: string;
};

export type MessageSelfMentionReferenceCompositionProps = MessageReferenceCompositionProps & {
  preview: ReactNode;
};

export type MessageMentionReferenceCompositionProps = MessageReferenceCompositionProps & {
  preview: ReactNode;
};

export function MessageMentionReferenceComposition({
  children,
  href,
  preview,
}: MessageMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={<MessageReferenceMention href={href} />}
      >
        {children}
      </PreviewCardTrigger>
      <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
        {preview}
      </PreviewCardContent>
    </PreviewCard>
  );
}

export function MessageSelfMentionReferenceComposition({
  children,
  href,
  preview,
}: MessageSelfMentionReferenceCompositionProps) {
  return (
    <PreviewCard>
      <PreviewCardTrigger
        closeDelay={120}
        delay={200}
        render={<MessageReferenceSelfMention href={href} />}
      >
        {children}
      </PreviewCardTrigger>
      <PreviewCardContent sideOffset={6} collisionPadding={6} className="w-[17.5rem]">
        {preview}
      </PreviewCardContent>
    </PreviewCard>
  );
}

export function MessagePermalinkReferenceComposition({
  children,
  external,
  href,
}: MessageReferenceCompositionProps & { external?: boolean }) {
  return (
    <MessageReferencePermalink external={external} href={href}>
      <LinkIcon />
      <MessageReferenceLabel>{children}</MessageReferenceLabel>
      <MessageReferenceMeta>msg</MessageReferenceMeta>
    </MessageReferencePermalink>
  );
}

export function MessageReferenceLoadingComposition({ children }: { children: ReactNode }) {
  return (
    <MessageReferenceLoading>
      {children}
      <Spinner size="sm" />
    </MessageReferenceLoading>
  );
}

export function MessageMarkdownComposition({ imageSrc }: { imageSrc: string }) {
  return (
    <MessageMarkdown>
      <h1>Heading 1</h1>
      <h2>Heading 2</h2>
      <h3>Heading 3</h3>
      <h4>Heading 4</h4>
      <h5>Heading 5</h5>
      <h6>Heading 6</h6>
      <p>
        Inline: <strong>bold</strong>, <em>italic</em>, <del>strikethrough</del>,{" "}
        <MessageInlineCode>inline code</MessageInlineCode>, H<sub>2</sub>O and x<sup>2</sup>, plus
        escaped *literal* asterisks.
      </p>
      <p>
        First line
        <br />
        hard-break second line.
      </p>
      <p>
        <a href="https://example.com/docs">Labeled link</a> and an autolink{" "}
        <a href="https://example.com/build">https://example.com/build</a>
      </p>
      <p>部署成功 🎉 完成 — emoji and CJK render as plain body text.</p>
      <p>
        Search match: <mark>migration plan</mark> is washed in-place.
      </p>
      <ul>
        <li>Unordered item</li>
        <li>
          Nested list
          <ul>
            <li>child bullet</li>
          </ul>
        </li>
      </ul>
      <ol>
        <li>Ordered one</li>
        <li>Ordered two</li>
      </ol>
      <ul>
        <li>
          <input type="checkbox" aria-label="Completed task-list item" disabled defaultChecked />{" "}
          completed task-list item
        </li>
        <li>
          <input type="checkbox" aria-label="Open task-list item" disabled /> open task-list item
        </li>
      </ul>
      <blockquote>Blockquote wraps at the same line height.</blockquote>
      <hr />
      <MessageMarkdownTableScroll>
        <table>
          <thead>
            <tr>
              <th>Token</th>
              <th>Surface</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>layer-panel</td>
              <td>panel</td>
            </tr>
            <tr>
              <td>line-strong</td>
              <td>border</td>
            </tr>
          </tbody>
        </table>
      </MessageMarkdownTableScroll>
      <img src={imageSrc} alt="markdown embed" />
    </MessageMarkdown>
  );
}

export function MessageCodeBlockComposition() {
  return (
    <MessageMarkdown>
      <p>Here is the loader I landed — no highlighting, just the mono block.</p>
      <MessageCodeBlock>
        <code>{"const tokens = load();\nconsole.log(tokens.layerPanel);"}</code>
      </MessageCodeBlock>
    </MessageMarkdown>
  );
}
