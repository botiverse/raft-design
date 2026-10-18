import { useCallback, useState } from "react";
import type { ChangeEvent } from "react";
import { ChevronRight } from "lucide-react";
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
  Field,
  FieldLabel,
  Input,
  Separator,
  Text,
} from "raft-ui";

export function CardSettingsSectionComposition() {
  const [displayName, setDisplayName] = useState("Example User");
  const [savedDisplayName, setSavedDisplayName] = useState("Example User");
  const profileDirty = displayName !== savedDisplayName;

  const handleDisplayNameChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setDisplayName(event.target.value);
  }, []);

  return (
    <section className="grid w-full gap-3">
      <Card>
        <CardHeader>
          <CardLeading>
            <Avatar size="xl" type="human">
              <AvatarFallback>EU</AvatarFallback>
            </Avatar>
          </CardLeading>
          <CardTitle render={<h3 />}>{savedDisplayName || "Unnamed account"}</CardTitle>
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
                onChange={handleDisplayNameChange}
              />
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
