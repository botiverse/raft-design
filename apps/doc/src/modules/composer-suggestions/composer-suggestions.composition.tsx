import { ImagePlus, Paperclip, Send } from "lucide-react";
import { useCallback, useState } from "react";
import type { FormEvent } from "react";
import {
  Checkbox,
  ComposerActions,
  ComposerIconButton,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbarLabel,
  useComposerSuggestions,
} from "raft-ui";
import {
  Composer,
  ComposerInput,
  ComposerToolbar,
} from "#/modules/chat-composer/composer-responsive.tsx";

import {
  detectSuggestion,
  getSuggestionText,
  getSuggestions,
  isSuggestionDisabled,
} from "./composer-suggestions.data.ts";
import type { Suggestion, SuggestionDataset } from "./composer-suggestions.data.ts";
import { ComposerSuggestionResults } from "./composer-suggestion-results.tsx";

export type ComposerSuggestionCompositionProps = {
  dataset?: SuggestionDataset;
  initialValue?: string;
};

export function ComposerSuggestionComposition({
  dataset = "default",
  initialValue = "@",
}: ComposerSuggestionCompositionProps) {
  const [value, setValue] = useState(initialValue);
  const [alsoCreateTask, setAlsoCreateTask] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const autocomplete = useComposerSuggestions<Suggestion>({
    value,
    onValueChange: setValue,
    detectTrigger: detectSuggestion,
    getItems: (match) => getSuggestions(match, dataset),
    getItemText: getSuggestionText,
    isItemDisabled: isSuggestionDisabled,
  });
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!value.trim()) return;
      setStatusMessage(`Sent${alsoCreateTask ? " as task" : ""}: ${value.trim()}`);
      autocomplete.clear();
    },
    [alsoCreateTask, autocomplete, value],
  );
  const handleAttachImage = useCallback(() => {
    setStatusMessage("Image attachment selected");
  }, []);
  const handleAttachFile = useCallback(() => {
    setStatusMessage("File attachment selected");
  }, []);
  return (
    <div className="flex h-full min-w-0 flex-col justify-end p-3">
      <ComposerRoot onSubmit={handleSubmit}>
        {autocomplete.open ? (
          <ComposerSuggestionResults
            items={autocomplete.items}
            getListProps={autocomplete.getListProps}
            getOptionProps={autocomplete.getOptionProps}
          />
        ) : null}
        <Composer>
          <ComposerInput
            {...autocomplete.getInputProps({
              "aria-label": "Message #proj-uiux",
              placeholder: "Type @ for people or # for channels",
            })}
          />
          <ComposerToolbar>
            <ComposerActions>
              <ComposerIconButton aria-label="Attach image" onClick={handleAttachImage}>
                <ImagePlus />
              </ComposerIconButton>
              <ComposerIconButton aria-label="Attach file" onClick={handleAttachFile}>
                <Paperclip />
              </ComposerIconButton>
            </ComposerActions>
            <ComposerMeta>
              <ComposerToolbarLabel>
                <Checkbox
                  size="sm"
                  aria-label="Send as task"
                  checked={alsoCreateTask}
                  onCheckedChange={setAlsoCreateTask}
                />
                As Task
              </ComposerToolbarLabel>
              <ComposerSubmit aria-label="Send" disabled={!value.trim()}>
                <span>Send</span>
                <Send />
              </ComposerSubmit>
            </ComposerMeta>
          </ComposerToolbar>
        </Composer>
        <span className="sr-only" aria-live="polite">
          {statusMessage}
        </span>
      </ComposerRoot>
    </div>
  );
}
