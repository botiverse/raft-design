import type { ComponentPropsWithRef } from "react";
import { Checkbox } from "../checkbox/index";
import type { CheckboxProps } from "../checkbox/index";
import { InlineCode } from "../inline-code/index";
import type { InlineCodeProps } from "../inline-code/index";
import { useThemeFamily } from "../../lib/theme/use-theme";
import { markdown } from "./markdown.recipe";

const HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

export type MarkdownHeadingLevel = keyof typeof HEADING_TAGS;

export type MarkdownHeadingProps = ComponentPropsWithRef<"h1"> & {
  level: MarkdownHeadingLevel;
};

export function MarkdownHeading({ className, level, ...props }: MarkdownHeadingProps) {
  const theme = useThemeFamily();
  const { heading } = markdown({ level, theme });
  const Tag = HEADING_TAGS[level];

  return <Tag data-slot="markdown-heading" className={heading({ className })} {...props} />;
}

export type MarkdownParagraphProps = ComponentPropsWithRef<"p">;

export function MarkdownParagraph({ className, ...props }: MarkdownParagraphProps) {
  const theme = useThemeFamily();
  const { paragraph } = markdown({ theme });

  return <p data-slot="markdown-paragraph" className={paragraph({ className })} {...props} />;
}

export type MarkdownLinkProps = ComponentPropsWithRef<"a">;

export function MarkdownLink({ className, ...props }: MarkdownLinkProps) {
  const theme = useThemeFamily();
  const { link } = markdown({ theme });

  return <a data-slot="markdown-link" className={link({ className })} {...props} />;
}

export type MarkdownMarkProps = ComponentPropsWithRef<"mark">;

export function MarkdownMark({ className, ...props }: MarkdownMarkProps) {
  const theme = useThemeFamily();
  const { mark } = markdown({ theme });

  return <mark data-slot="markdown-mark" className={mark({ className })} {...props} />;
}

export type MarkdownListProps = ComponentPropsWithRef<"ul">;

export function MarkdownList({ className, ...props }: MarkdownListProps) {
  const theme = useThemeFamily();
  const { list } = markdown({ theme });

  return <ul data-slot="markdown-list" className={list({ className })} {...props} />;
}

export type MarkdownOrderedListProps = ComponentPropsWithRef<"ol">;

export function MarkdownOrderedList({ className, ...props }: MarkdownOrderedListProps) {
  const theme = useThemeFamily();
  const { list } = markdown({ ordered: true, theme });

  return <ol data-slot="markdown-list" className={list({ className })} {...props} />;
}

export type MarkdownListItemProps = ComponentPropsWithRef<"li">;

export function MarkdownListItem({ className, ...props }: MarkdownListItemProps) {
  const theme = useThemeFamily();
  const { listItem } = markdown({ theme });

  return <li data-slot="markdown-list-item" className={listItem({ className })} {...props} />;
}

export type MarkdownBlockquoteProps = ComponentPropsWithRef<"blockquote">;

export function MarkdownBlockquote({ className, ...props }: MarkdownBlockquoteProps) {
  const theme = useThemeFamily();
  const { blockquote } = markdown({ theme });

  return (
    <blockquote data-slot="markdown-blockquote" className={blockquote({ className })} {...props} />
  );
}

export type MarkdownRuleProps = ComponentPropsWithRef<"hr">;

export function MarkdownRule({ className, ...props }: MarkdownRuleProps) {
  const theme = useThemeFamily();
  const { rule } = markdown({ theme });

  return <hr data-slot="markdown-rule" className={rule({ className })} {...props} />;
}

export type MarkdownTableScrollProps = ComponentPropsWithRef<"div">;

/** Horizontal scroll container for wide tables. */
export function MarkdownTableScroll({ className, ...props }: MarkdownTableScrollProps) {
  const theme = useThemeFamily();
  const { tableScroll } = markdown({ theme });

  return (
    <div data-slot="markdown-table-scroll" className={tableScroll({ className })} {...props} />
  );
}

export type MarkdownTableProps = ComponentPropsWithRef<"table">;

export function MarkdownTable({ className, ...props }: MarkdownTableProps) {
  const theme = useThemeFamily();
  const { table } = markdown({ theme });

  return <table data-slot="markdown-table" className={table({ className })} {...props} />;
}

export type MarkdownTableRowProps = ComponentPropsWithRef<"tr">;

export function MarkdownTableRow({ className, ...props }: MarkdownTableRowProps) {
  const theme = useThemeFamily();
  const { tableRow } = markdown({ theme });

  return <tr data-slot="markdown-table-row" className={tableRow({ className })} {...props} />;
}

export type MarkdownHeaderCellProps = ComponentPropsWithRef<"th">;

export function MarkdownHeaderCell({ className, ...props }: MarkdownHeaderCellProps) {
  const theme = useThemeFamily();
  const { headerCell } = markdown({ theme });

  return <th data-slot="markdown-header-cell" className={headerCell({ className })} {...props} />;
}

export type MarkdownCellProps = ComponentPropsWithRef<"td">;

export function MarkdownCell({ className, ...props }: MarkdownCellProps) {
  const theme = useThemeFamily();
  const { cell } = markdown({ theme });

  return <td data-slot="markdown-cell" className={cell({ className })} {...props} />;
}

export type MarkdownImageProps = ComponentPropsWithRef<"img">;

export function MarkdownImage({ className, ...props }: MarkdownImageProps) {
  const theme = useThemeFamily();
  const { image } = markdown({ theme });

  return <img data-slot="markdown-image" className={image({ className })} {...props} />;
}

export type MarkdownInlineCodeProps = InlineCodeProps;

export function MarkdownInlineCode({ className, ...props }: MarkdownInlineCodeProps) {
  const theme = useThemeFamily();
  const { inlineCode } = markdown({ theme });

  return <InlineCode className={inlineCode({ className })} {...props} />;
}

export type MarkdownCheckboxProps = CheckboxProps;

/** Task-list checkbox. Markdown task items are display-only, so it defaults to read-only. */
export function MarkdownCheckbox({ className, ...props }: MarkdownCheckboxProps) {
  const theme = useThemeFamily();
  const { checkbox } = markdown({ theme });

  return <Checkbox variant="primary" readOnly className={checkbox({ className })} {...props} />;
}
