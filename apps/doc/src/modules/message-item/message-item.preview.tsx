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
  "continuation",
] as const satisfies readonly MessageItemPreviewChrome[];

type PlaygroundValues = {
  chrome: MessageItemPreviewChrome;
  meta: boolean;
  task: boolean;
  image: boolean;
  video: boolean;
  files: boolean;
  saved: boolean;
  reactions: boolean;
  mobileReactionAdd: boolean;
  toolbar: boolean;
};

export function MessageItemPlaygroundPreview() {
  return (
    <ComponentPlayground<PlaygroundValues>
      defaultValues={{
        chrome: "default",
        meta: true,
        task: false,
        image: false,
        video: false,
        files: false,
        saved: false,
        reactions: true,
        mobileReactionAdd: false,
        toolbar: true,
      }}
      controls={[
        { name: "chrome", label: "Chrome", type: "select", options: CHROME_OPTIONS },
        {
          name: "meta",
          label: "Meta",
          type: "boolean",
          when: (values) => values.chrome !== "continuation",
        },
        { name: "task", label: "Task", type: "boolean" },
        { name: "image", label: "Image", type: "boolean" },
        { name: "video", label: "Video", type: "boolean" },
        { name: "files", label: "Files", type: "boolean" },
        { name: "saved", label: "Saved", type: "boolean" },
        { name: "reactions", label: "Reactions", type: "boolean" },
        {
          name: "mobileReactionAdd",
          label: "Mobile +",
          type: "boolean",
          when: (values) => values.reactions,
        },
        {
          name: "toolbar",
          label: "Toolbar",
          type: "boolean",
          when: (values) => values.chrome !== "selected",
        },
      ]}
      previewMode="light"
      previewClassName="items-stretch"
      render={(values) => (
        <div className="w-full max-w-3xl">
          <MessageItemPreview
            chrome={values.chrome}
            meta={values.meta}
            task={values.task}
            image={values.image}
            video={values.video}
            files={values.files}
            saved={values.saved}
            reactions={values.reactions}
            mobileReactionAdd={values.mobileReactionAdd}
            toolbar={values.toolbar}
          />
        </div>
      )}
    />
  );
}
