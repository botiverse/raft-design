import { Blocks } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLeading,
  CardTitle,
  CardTitleText,
  CardTrailing,
  type CardProps,
  Text,
} from "raft-ui";

type CardProjectSummaryCompositionProps = {
  variant?: CardProps["variant"];
};

export function CardProjectSummaryComposition({
  variant = "default",
}: CardProjectSummaryCompositionProps = {}) {
  return (
    <Card variant={variant} className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          <CardLeading>
            <Blocks aria-hidden />
          </CardLeading>
          <CardTitleText render={<h3 />}>Design system review</CardTitleText>
          <CardTrailing>
            <Badge variant="success">On track</Badge>
          </CardTrailing>
        </CardTitle>
        <CardDescription>Five members are reviewing the next release.</CardDescription>
      </CardHeader>
      <CardContent>
        <Text.Sans size="small">
          Tokens, components, and migration notes are ready for final approval.
        </Text.Sans>
      </CardContent>
      <CardFooter>
        <Text.Mono size="meta">Updated 4 minutes ago</Text.Mono>
      </CardFooter>
    </Card>
  );
}
