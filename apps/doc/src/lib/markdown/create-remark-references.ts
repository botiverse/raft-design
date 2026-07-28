import type { MarkdownReference } from "./markdown-reference.types.ts";
import { serializeMarkdownReference } from "./serialize-markdown-reference.ts";

type MarkdownNode = {
  children?: MarkdownNode[];
  data?: {
    hProperties?: {
      dataMarkdownReference?: string;
    };
  };
  type: string;
  url?: string;
  value?: string;
};

const OPAQUE_NODE_TYPES = ["link", "linkReference", "definition", "inlineCode", "code", "html"];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildReferencePattern(actorNames: readonly string[], channelNames: readonly string[]) {
  const byLongestFirst = (a: string, b: string) => b.length - a.length;
  const channelAlt = [...channelNames].sort(byLongestFirst).map(escapeRegExp).join("|");
  const actorAlt = [...actorNames].sort(byLongestFirst).map(escapeRegExp).join("|");
  // Threads before bare channels, then task references and @mentions.
  return new RegExp(
    `#(${channelAlt})(?::([a-z0-9-]+))?|task\\s+#(\\d+)|#(\\d+)|@(${actorAlt})`,
    "gi",
  );
}

function referenceFromMatch(match: RegExpExecArray): MarkdownReference {
  const [, channelName, shortId, taskWithKeyword, bareTask, mentionName] = match;

  if (mentionName !== undefined) return { kind: "mention", name: mentionName };
  if (taskWithKeyword !== undefined || bareTask !== undefined) {
    return { kind: "task", number: taskWithKeyword ?? bareTask };
  }
  return { kind: "channel", name: channelName, shortId };
}

function transformTextNode(value: string, pattern: RegExp): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const scanner = new RegExp(pattern.source, pattern.flags);
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = scanner.exec(value)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }

    nodes.push({
      type: "link",
      children: [{ type: "text", value: match[0] }],
      data: {
        hProperties: {
          dataMarkdownReference: serializeMarkdownReference(referenceFromMatch(match)),
        },
      },
      url: "#",
    });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < value.length) {
    nodes.push({ type: "text", value: value.slice(lastIndex) });
  }

  return nodes.length > 0 ? nodes : [{ type: "text", value }];
}

function transformReferences(parent: MarkdownNode, pattern: RegExp) {
  if (!parent.children) return;

  const children: MarkdownNode[] = [];
  for (const child of parent.children) {
    if (child.type === "text" && child.value !== undefined) {
      children.push(...transformTextNode(child.value, pattern));
      continue;
    }

    if (!OPAQUE_NODE_TYPES.includes(child.type)) {
      transformReferences(child, pattern);
    }
    children.push(child);
  }
  parent.children = children;
}

/**
 * Marks `@mention`, `#channel`, `#channel:thread`, and `#123` runs as anchors carrying a
 * reference marker. The consumer's `components.a` override decides what each one renders as.
 */
export function createRemarkReferences({
  actorNames,
  channelNames,
}: {
  actorNames: readonly string[];
  channelNames: readonly string[];
}) {
  const pattern = buildReferencePattern(actorNames, channelNames);

  return function remarkReferences() {
    return (tree: MarkdownNode) => {
      transformReferences(tree, pattern);
    };
  };
}
