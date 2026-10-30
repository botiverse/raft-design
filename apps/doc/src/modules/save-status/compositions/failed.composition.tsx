import { useCallback, useEffect, useRef, useState } from "react";
import {
  ListRow,
  ListRowBody,
  ListRowDescription,
  ListRowGroup,
  ListRowTitle,
  Switch,
} from "@botiverse/raft-ui";
import { SaveStatus, SaveStatusError, SaveStatusSaved } from "@botiverse/raft-ui/wip";

// @docs-source-strip-start
import { CompositionPreview } from "#/components/composition-preview.tsx";
// @docs-source-strip-end

export function SaveStatusFailedContent() {
  const [published, setPublished] = useState(false);
  const [failed, setFailed] = useState(false);
  const request = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(request.current), []);

  // The switch moves at once; the save is refused, so it goes back to its old
  // value and the line says what failed, until the next change.
  const handlePublished = useCallback((checked: boolean) => {
    window.clearTimeout(request.current);
    setFailed(false);
    setPublished(checked);
    request.current = window.setTimeout(() => {
      setPublished(!checked);
      setFailed(true);
    }, 600);
  }, []);

  return (
    <ListRowGroup className="w-full max-w-md">
      <ListRow variant="plain" interactive={false}>
        <ListRowBody>
          <ListRowTitle id="public-page-title">Public page</ListRowTitle>
          <ListRowDescription id="public-page-description" wrap>
            Anyone with the link can see the server&apos;s name and channels.
          </ListRowDescription>
          <SaveStatus id="public-page-status">
            {failed ? (
              <SaveStatusError>Couldn&apos;t turn it on. Try again.</SaveStatusError>
            ) : (
              <SaveStatusSaved />
            )}
          </SaveStatus>
        </ListRowBody>
        <Switch
          checked={published}
          onCheckedChange={handlePublished}
          aria-labelledby="public-page-title"
          aria-describedby="public-page-description public-page-status"
        />
      </ListRow>
    </ListRowGroup>
  );
}

// @docs-source-strip-start
export function SaveStatusFailedComposition({ className }: { className?: string }) {
  return (
    <CompositionPreview className={className}>
      <SaveStatusFailedContent />
    </CompositionPreview>
  );
}
// @docs-source-strip-end
