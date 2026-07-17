import { ImagePlus, Paperclip, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import {
  Checkbox,
  ConversationPanelContent,
  ConversationPanelFooter,
  ConversationPanelRoot,
  useThemeFamily,
} from "raft-ui";
import {
  Composer,
  ComposerActions,
  ComposerIconButton,
  ComposerInput,
  ComposerMeta,
  ComposerRoot,
  ComposerSubmit,
  ComposerToolbar,
  ComposerToolbarLabel,
  useComposerSuggestions,
} from "raft-ui/wip";

import {
  detectSuggestion,
  getSuggestionText,
  getSuggestions,
  isSuggestionDisabled,
  type Suggestion,
} from "./composer-suggestions.data.ts";
import { ComposerSuggestionResults } from "./composer-suggestion-results.tsx";

export type ComposerSuggestionCompositionProps = {
  initialValue?: string;
};

export function ComposerSuggestionComposition({
  initialValue = "@",
}: ComposerSuggestionCompositionProps) {
  const [value, setValue] = useState(initialValue);
  const [alsoCreateTask, setAlsoCreateTask] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const theme = useThemeFamily();
  const sourceParityControlsActive = theme === "brutal";
  const autocomplete = useComposerSuggestions<Suggestion>({
    value,
    onValueChange: setValue,
    detectTrigger: detectSuggestion,
    getItems: getSuggestions,
    getItemText: getSuggestionText,
    isItemDisabled: isSuggestionDisabled,
  });
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!value.trim()) return;
    setStatusMessage(`Sent${alsoCreateTask ? " as task" : ""}: ${value.trim()}`);
    autocomplete.clear();
  };
  return (
    <ConversationPanelRoot>
      <ConversationPanelContent className="justify-end">
        <ConversationPanelFooter>
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
                  <ComposerIconButton
                    aria-label="Attach image"
                    disabled={!sourceParityControlsActive}
                    onClick={() => setStatusMessage("Image attachment selected")}
                  >
                    <ImagePlus />
                  </ComposerIconButton>
                  <ComposerIconButton
                    aria-label="Attach file"
                    disabled={!sourceParityControlsActive}
                    onClick={() => setStatusMessage("File attachment selected")}
                  >
                    <Paperclip />
                  </ComposerIconButton>
                </ComposerActions>
                <ComposerMeta>
                  <ComposerToolbarLabel>
                    <Checkbox
                      size="sm"
                      aria-label="Send as task"
                      checked={alsoCreateTask}
                      disabled={!sourceParityControlsActive}
                      onCheckedChange={setAlsoCreateTask}
                    />
                    As Task
                  </ComposerToolbarLabel>
                  <ComposerSubmit
                    aria-label="Send"
                    disabled={!sourceParityControlsActive || !value.trim()}
                  >
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
        </ConversationPanelFooter>
      </ConversationPanelContent>
    </ConversationPanelRoot>
  );
}
