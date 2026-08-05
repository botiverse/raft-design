import { useState } from "react";
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
  const [appleConnected, setAppleConnected] = useState(false);
  const profileDirty = displayName !== savedDisplayName;

  return (
    <section className="grid w-full max-w-xl gap-3" aria-labelledby="account-settings-title">
      <Text.Mono render={<h2 id="account-settings-title" />} size="eyebrow">
        Account
      </Text.Mono>

      <Card>
        <CardHeader>
          <CardTitle>
            <CardLeading>
              <Avatar size="lg" type="human">
                <AvatarFallback>EU</AvatarFallback>
              </Avatar>
            </CardLeading>
            <CardTitleText render={<h3 />}>{savedDisplayName || "Unnamed account"}</CardTitleText>
          </CardTitle>
          <CardDescription>@example-user</CardDescription>
        </CardHeader>

        <CardContent className="grid gap-6">
          <form
            id="account-profile-form"
            className="grid gap-4"
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
              <Button type="submit" variant="primary" size="sm" disabled={!profileDirty}>
                Save Profile
              </Button>
            </div>
          </form>

          <Separator />

          <section className="grid gap-4" aria-labelledby="connected-accounts-title">
            <CardTitle>
              <CardTitleText render={<h3 id="connected-accounts-title" />}>
                Connected accounts
              </CardTitleText>
            </CardTitle>

            <div className="grid gap-3">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Text.Sans size="small">Google</Text.Sans>
                  <Text.Sans size="caption">
                    {googleConnected ? "Connected as user@example.com" : "Not connected"}
                  </Text.Sans>
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

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Text.Sans size="small">GitHub</Text.Sans>
                  <Text.Sans size="caption">Connected as user@example.com</Text.Sans>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Text.Sans size="small">Apple</Text.Sans>
                  <Text.Sans size="caption">
                    {appleConnected ? "Connected as user@example.com" : "Not connected"}
                  </Text.Sans>
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
        </CardContent>
      </Card>
    </section>
  );
}
