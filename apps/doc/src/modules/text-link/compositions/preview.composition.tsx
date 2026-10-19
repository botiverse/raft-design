import { TextLink } from "@botiverse/raft-ui";

export function TextLinkPreviewContent() {
  return (
    <div className="flex flex-col items-start gap-4 text-footnote text-foreground-muted">
      <TextLink render={<a href="#forgot-password" />}>Forgot Password</TextLink>
      <p className="m-0">
        Don&apos;t have an account?{" "}
        <TextLink variant="strong" render={<a href="#create-account" />}>
          Create One
        </TextLink>
      </p>
    </div>
  );
}
