import { ComponentPlayground } from "#/components/component-playground.tsx";
import {
  MessageItemPreview,
  type MessageItemPreviewChrome,
} from "./compositions/item-preview.composition.tsx";

const CHROME_OPTIONS = [
  "default",
  "active",
  "search-match",
  "selected",
] as const satisfies readonly MessageItemPreviewChrome[];

type PlaygroundValues = {
  chrome: MessageItemPreviewChrome;
  saved: boolean;
  reactions: boolean;
  toolbar: boolean;
};

export function MessageItemPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{ chrome: "default", saved: false, reactions: true, toolbar: true }}
      controls={[
        { name: "chrome", label: "Chrome", type: "select", options: CHROME_OPTIONS },
        { name: "saved", label: "Saved", type: "boolean" },
        { name: "reactions", label: "Reactions", type: "boolean" },
        { name: "toolbar", label: "Toolbar", type: "boolean" },
      ]}
      previewTheme="brutal"
      previewMode="light"
      previewClassName="items-stretch"
      render={(values) => (
        <div className="w-full max-w-3xl">
          <MessageItemPreview
            chrome={values.chrome}
            saved={values.saved}
            reactions={values.reactions}
            toolbar={values.toolbar}
          />
        </div>
      )}
    />
  );
}
