import { useState } from "react";
import { Apple, ChevronRight, GitFork, Globe, User } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardLeading,
  CardTitle,
  CardTitleText,
  Field,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Separator,
  Text,
} from "raft-ui";

export function CardSettingsSectionComposition() {
  const [displayName, setDisplayName] = useState("Example User");
  const [savedDisplayName, setSavedDisplayName] = useState("Example User");
  const [googleConnected, setGoogleConnected] = useState(false);
  const [githubConnected, setGithubConnected] = useState(false);
  const [appleConnected, setAppleConnected] = useState(false);
  const profileDirty = displayName !== savedDisplayName;

  return (
    <section className="grid w-full gap-3" aria-labelledby="account-settings-title">
      <div className="flex items-center gap-2 text-foreground-muted">
        <User aria-hidden="true" className="size-4 shrink-0" />
        <h2
          id="account-settings-title"
          className="font-sans text-xs leading-4 font-bold tracking-widest uppercase"
        >
          Account
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <CardLeading>
              <Avatar size="xl" type="human">
                <AvatarFallback>EU</AvatarFallback>
              </Avatar>
            </CardLeading>
            <CardTitleText render={<h3 />}>{savedDisplayName || "Unnamed account"}</CardTitleText>
          </CardTitle>
          <CardDescription>@example-user</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4">
          <Separator />

          <form
            id="account-profile-form"
            className="grid gap-3"
            action={() => setSavedDisplayName(displayName)}
          >
            <Field>
              <FieldLabel htmlFor="account-display-name">Display Name</FieldLabel>
              <Input
                id="account-display-name"
                name="displayName"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
              />
            </Field>

            <Field>
              <FieldLabel htmlFor="account-username">Username</FieldLabel>
              <InputGroup>
                <InputGroupAddon.Text variant="container">@</InputGroupAddon.Text>
                <InputGroupInput
                  id="account-username"
                  name="username"
                  value="example-user"
                  readOnly
                  aria-readonly="true"
                  tabIndex={-1}
                  className="bg-fill-muted text-foreground-muted"
                />
              </InputGroup>
            </Field>

            <Field>
              <FieldLabel>Email</FieldLabel>
              <div className="flex flex-wrap items-center gap-2">
                <Text.Mono size="meta">user@example.com</Text.Mono>
                <Badge variant="success">Verified</Badge>
              </div>
            </Field>

            <div>
              <Button type="submit" variant="accent" size="sm" disabled={!profileDirty}>
                Save Profile
              </Button>
            </div>
          </form>

          <Separator />

          <section className="grid gap-4" aria-labelledby="connected-accounts-title">
            <h3
              id="connected-accounts-title"
              className="font-sans text-sm leading-5 font-bold text-foreground"
            >
              Connected accounts
            </h3>

            <div className="grid gap-2">
              <div className="flex items-start justify-between gap-3 border border-line-muted bg-layer-panel p-3 transition-colors hover:border-line-strong">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="inline-flex size-[18px] shrink-0 items-center justify-center">
                    <Globe aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-sans text-xs leading-4 font-bold text-foreground">
                      Google
                    </div>
                    <Text.Sans size="caption">
                      {googleConnected ? "Connected as user@example.com" : "Not connected"}
                    </Text.Sans>
                  </div>
                </div>
                {!googleConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGoogleConnected(true)}
                  >
                    Connect
                  </Button>
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-3 border border-line-muted bg-layer-panel p-3 transition-colors hover:border-line-strong">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="inline-flex size-[18px] shrink-0 items-center justify-center">
                    <GitFork aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-sans text-xs leading-4 font-bold text-foreground">
                      GitHub
                    </div>
                    <Text.Sans size="caption">
                      {githubConnected ? "Connected as user@example.com" : "Not connected"}
                    </Text.Sans>
                  </div>
                </div>
                {!githubConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setGithubConnected(true)}
                  >
                    Connect
                  </Button>
                ) : null}
              </div>

              <div className="flex items-start justify-between gap-3 border border-line-muted bg-layer-panel p-3 transition-colors hover:border-line-strong">
                <div className="flex min-w-0 items-start gap-2">
                  <span className="inline-flex size-[18px] shrink-0 items-center justify-center">
                    <Apple aria-hidden="true" className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <div className="font-sans text-xs leading-4 font-bold text-foreground">
                      Apple
                    </div>
                    <Text.Sans size="caption">
                      {appleConnected ? "Connected as user@example.com" : "Not connected"}
                    </Text.Sans>
                  </div>
                </div>
                {!appleConnected ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setAppleConnected(true)}
                  >
                    Connect
                  </Button>
                ) : null}
              </div>
            </div>
          </section>

          <Separator />

          <div>
            <Button type="button" variant="ghost" size="sm">
              <ChevronRight data-icon="inline-start" />
              Change Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
