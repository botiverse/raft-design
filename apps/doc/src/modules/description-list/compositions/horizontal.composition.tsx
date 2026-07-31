import { DescriptionDetails, DescriptionItem, DescriptionList, DescriptionTerm } from "raft-ui";

export function HorizontalDescriptionListComposition() {
  return (
    <DescriptionList direction="horizontal" className="w-full max-w-lg">
      <DescriptionItem>
        <DescriptionTerm>Client key</DescriptionTerm>
        <DescriptionDetails className="font-mono">release-notes</DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Redirect URL</DescriptionTerm>
        <DescriptionDetails className="break-all">
          https://notes.example.com/oauth/callback
        </DescriptionDetails>
      </DescriptionItem>
      <DescriptionItem>
        <DescriptionTerm>Owner</DescriptionTerm>
        <DescriptionDetails>Atlas</DescriptionDetails>
      </DescriptionItem>
    </DescriptionList>
  );
}
