import { Rocket } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardLeading,
  CardTitle,
  CardTrailing,
  Separator,
  Status,
  Text,
} from "@botiverse/raft-ui";
import type { CardProps } from "@botiverse/raft-ui";

type CardProjectSummaryCompositionProps = {
  variant?: CardProps["variant"];
};

export function CardProjectSummaryComposition({
  variant = "default",
}: CardProjectSummaryCompositionProps = {}) {
  return (
    <Card variant={variant} className="w-full max-w-md">
      <CardHeader>
        <CardLeading>
          <Rocket aria-hidden />
        </CardLeading>
        <CardTitle render={<h3 />}>Release readiness</CardTitle>
        <CardTrailing>
          <Badge variant="warning">1 blocker</Badge>
        </CardTrailing>
        <CardDescription>Public beta · Thursday at 10:00</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3.5">
        <div className="flex min-w-0 items-start gap-3">
          <Status aria-hidden className="mt-1" size="sm" variant="success" />
          <div className="min-w-0 flex-1">
            <Text.Sans size="small">Component freeze</Text.Sans>
            <Text.Sans size="caption">48 components approved for release.</Text.Sans>
          </div>
          <Text.Mono className="mt-0.5 shrink-0" size="meta">
            Ready
          </Text.Mono>
        </div>

        <Separator className="data-[orientation=horizontal]:border-line-hairline" />

        <div className="flex min-w-0 items-start gap-3">
          <Status aria-hidden className="mt-1" size="sm" variant="success" />
          <div className="min-w-0 flex-1">
            <Text.Sans size="small">Accessibility audit</Text.Sans>
            <Text.Sans size="caption">Keyboard and contrast checks passed.</Text.Sans>
          </div>
          <Text.Mono className="mt-0.5 shrink-0" size="meta">
            Ready
          </Text.Mono>
        </div>

        <Separator className="data-[orientation=horizontal]:border-line-hairline" />

        <div className="flex min-w-0 items-start gap-3">
          <Status aria-hidden className="mt-1" size="sm" variant="warning" />
          <div className="min-w-0 flex-1">
            <Text.Sans size="small">Migration guide</Text.Sans>
            <Text.Sans size="caption">Waiting for platform review.</Text.Sans>
          </div>
          <Text.Mono className="mt-0.5 shrink-0" size="meta">
            Review
          </Text.Mono>
        </div>
      </CardContent>
      <CardFooter>
        <Text.Mono size="meta">Owner · Mira Chen</Text.Mono>
        <Text.Mono className="ml-auto" size="meta">
          Updated 4 min ago
        </Text.Mono>
      </CardFooter>
    </Card>
  );
}
