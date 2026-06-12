import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  Badge,
  Banner,
  BannerDescription,
  BannerTitle,
  Button,
  CheckIndicator,
  Checkbox,
  ConversationPreviewCard,
  ConversationPreviewCardAuthor,
  ConversationPreviewCardAuthorName,
  ConversationPreviewCardAuthorSubtitle,
  ConversationPreviewCardChannel,
  ConversationPreviewCardContent,
  ConversationPreviewCardFooter,
  ConversationPreviewCardMeta,
  ConversationPreviewCardPreview,
  ConversationPreviewCardPreviewAuthor,
  ConversationPreviewCardPreviewLeading,
  ConversationPreviewCardSecondaryPreview,
  ConversationPreviewCardTimestamp,
  DescriptionDetails,
  DescriptionItem,
  DescriptionList,
  DescriptionTerm,
  DropdownMenu,
  DropdownMenuActionItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  EmptyState,
  EmptyStateActions,
  EmptyStateDescription,
  EmptyStateIcon,
  EmptyStateTitle,
  Field,
  FieldDescription,
  FieldItem,
  FieldLabel,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  Kbd,
  KbdGroup,
  ListItem,
  ListItemBody,
  ListItemRow,
  ListItemTitle,
  MediaListItem,
  MediaListItemAside,
  MediaListItemBody,
  MediaListItemSubtitle,
  MediaListItemText,
  MediaListItemTitle,
  MediaListItemVisual,
  PanelHeader,
  PanelHeaderActions,
  PanelHeaderContent,
  PanelHeaderIcon,
  PanelHeaderSubtitle,
  PanelHeaderSuffix,
  PanelHeaderTitle,
  PanelHeaderTitleRow,
  QuotedMessageCard,
  QuotedMessageCardAttachments,
  QuotedMessageCardAuthor,
  QuotedMessageCardAuthorName,
  QuotedMessageCardAuthorSubtitle,
  QuotedMessageCardBody,
  QuotedMessageCardChannel,
  QuotedMessageCardContent,
  QuotedMessageCardContentWrap,
  QuotedMessageCardHeader,
  QuotedMessageCardMeta,
  QuotedMessageCardSeparator,
  QuotedMessageCardTag,
  QuotedMessageCardThread,
  QuotedMessageCardTimestamp,
  Spinner,
  Status,
  Tabs,
  TabsLabel,
  TabsList,
  TabsPanel,
  TabsTab,
  ToggleGroup,
  ToggleGroupCount,
  ToggleGroupItem,
  ToggleGroupLabel,
} from "@slock/ui";
import {
  Check,
  CheckCircle,
  Clock3,
  FileText,
  Hash,
  Inbox,
  Mail,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { DocPage } from "#/components/doc-page.tsx";
import { DocSection } from "#/components/doc-section.tsx";

export const Route = createFileRoute("/")({ component: Home });

const TOC = [
  { id: "introduction", title: "Introduction" },
  { id: "component-gallery", title: "Component gallery" },
  { id: "installation", title: "Installation" },
] as const;

function Home() {
  return (
    <DocPage
      title="slock-ui"
      description="A React component library built on Base UI and styled with tailwind-variants."
      toc={TOC}
      showToc={false}
    >
      <DocSection id="introduction" title="Introduction">
        <p className="text-gray-600">
          slock-ui provides accessible primitives from{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
            @base-ui/react
          </code>{" "}
          composed with Tailwind utilities through{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm">
            tailwind-variants
          </code>
          . Browse the components in the sidebar to see their states and APIs.
        </p>
        <p className="mt-4">
          <Link
            to="/components/button"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            View the Button component →
          </Link>
        </p>
      </DocSection>

      <DocSection id="component-gallery" title="Component gallery">
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-gray-600">
          A compact sampler of current package exports. It is not a one-to-one theme builder; it is
          a quick way to scan how the existing primitives behave together across forms, navigation,
          feedback, and data surfaces.
        </p>
        <ComponentGallery />
      </DocSection>

      <DocSection id="installation" title="Installation">
        <pre className="overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm">
          <code className="font-mono text-gray-900">pnpm add @slock/ui</code>
        </pre>
      </DocSection>
    </DocPage>
  );
}

function ComponentGallery() {
  const [mode, setMode] = useState<"compose" | "review" | "ship">("compose");
  const itemClass = "mb-4 break-inside-avoid";
  const fieldClass = `${itemClass} max-w-full`;
  const tabsClass = `${itemClass} border-2 border-black bg-brutal-cream p-4 shadow-[var(--shadow)]`;

  return (
    <div className="columns-1 gap-4 md:columns-2 xl:columns-3">
      <Field className={fieldClass}>
        <FieldLabel required>Email</FieldLabel>
        <Input type="email" defaultValue="john@email.com" aria-label="Email" />
        <FieldDescription>Used for invite and billing notifications.</FieldDescription>
      </Field>

      <Field className={fieldClass}>
        <FieldLabel>Project slug</FieldLabel>
        <InputGroup>
          <InputGroupAddon.Slug />
          <InputGroupInput defaultValue="slock-docs" aria-label="Project slug" />
        </InputGroup>
      </Field>

      <Field className={fieldClass}>
        <FieldLabel>Search</FieldLabel>
        <InputGroup lift={false}>
          <InputGroupAddon.Search />
          <InputGroupInput placeholder="Find a component" aria-label="Find a component" />
        </InputGroup>
      </Field>

      <Field className={fieldClass}>
        <FieldLabel>Readiness</FieldLabel>
        <FieldItem>
          <Checkbox defaultChecked />
          <CheckIndicator checked fill="yellow" size="lg" />
          <span className="text-sm font-bold text-black">Preview ready</span>
        </FieldItem>
        <div className="mt-3 flex items-center gap-3">
          <Status variant="success" pulse aria-label="Online" />
          <Status variant="primary" aria-label="Queued" />
          <Status variant="accent" aria-label="Unread" />
        </div>
      </Field>

      <ToggleGroup
        value={mode}
        onValueChange={(value) => setMode(value)}
        ariaLabel="Preview mode"
        className={`${itemClass} w-full border-2 border-black bg-brutal-cream p-3 shadow-[var(--shadow)]`}
      >
        <ToggleGroupItem value="compose">
          <MessageSquare />
          <ToggleGroupLabel>Compose</ToggleGroupLabel>
          <ToggleGroupCount>3</ToggleGroupCount>
        </ToggleGroupItem>
        <ToggleGroupItem value="review">
          <FileText />
          <ToggleGroupLabel>Review</ToggleGroupLabel>
          <ToggleGroupCount>7</ToggleGroupCount>
        </ToggleGroupItem>
        <ToggleGroupItem value="ship">
          <Sparkles />
          <ToggleGroupLabel>Ship</ToggleGroupLabel>
        </ToggleGroupItem>
      </ToggleGroup>

      <Button
        variant="primary"
        className={`${itemClass} w-full justify-start shadow-[var(--shadow)]`}
      >
        Publish component notes
      </Button>

      <MediaListItem selected className={itemClass}>
        <MediaListItemBody>
          <MediaListItemVisual>
            <Avatar size="md" type="agent">
              <AvatarFallback>AT</AvatarFallback>
              <AvatarBadge />
            </Avatar>
          </MediaListItemVisual>
          <MediaListItemText>
            <MediaListItemTitle>Atlas</MediaListItemTitle>
            <MediaListItemSubtitle>@atlas · claude-opus</MediaListItemSubtitle>
          </MediaListItemText>
        </MediaListItemBody>
        <MediaListItemAside>
          <Badge variant="success">Live</Badge>
        </MediaListItemAside>
      </MediaListItem>

      <MediaListItem className={itemClass}>
        <MediaListItemBody>
          <MediaListItemVisual>
            <Avatar size="md" type="human">
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </MediaListItemVisual>
          <MediaListItemText>
            <MediaListItemTitle>Ada Lovelace</MediaListItemTitle>
            <MediaListItemSubtitle>Reviewer · design systems</MediaListItemSubtitle>
          </MediaListItemText>
        </MediaListItemBody>
        <MediaListItemAside>
          <Status variant="success" aria-label="Available" />
        </MediaListItemAside>
      </MediaListItem>

      <AgentDmPreviewCard className={itemClass} />

      <PanelHeader className={`${itemClass} border-2 border-black shadow-[var(--shadow)]`}>
        <PanelHeaderIcon className="flex bg-brutal-yellow">
          <Search />
        </PanelHeaderIcon>
        <PanelHeaderContent>
          <PanelHeaderTitleRow>
            <PanelHeaderTitle>Source audit queue</PanelHeaderTitle>
            <PanelHeaderSuffix>
              <Status variant="success" aria-label="Ready" />
            </PanelHeaderSuffix>
          </PanelHeaderTitleRow>
          <PanelHeaderSubtitle>PanelHeader + indicators</PanelHeaderSubtitle>
        </PanelHeaderContent>
        <PanelHeaderActions>
          <KbdGroup aria-label="Keyboard shortcuts">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </KbdGroup>
          <Button size="icon-sm" variant="outline" aria-label="Queue settings">
            <Settings />
          </Button>
        </PanelHeaderActions>
      </PanelHeader>

      <Tabs value="inbox" className={tabsClass}>
        <TabsList>
          <TabsTab value="inbox">
            <Inbox />
            <TabsLabel>Inbox</TabsLabel>
          </TabsTab>
          <TabsTab value="files">
            <FileText />
            <TabsLabel>Files</TabsLabel>
          </TabsTab>
          <TabsTab value="settings">
            <Settings />
            <TabsLabel>Settings</TabsLabel>
          </TabsTab>
        </TabsList>

        <TabsPanel value="inbox" className="space-y-3 pt-3">
          <GalleryTabsPanelContent />
        </TabsPanel>

        <TabsPanel value="files" className="space-y-3 pt-3">
          <GalleryTabsPanelContent />
        </TabsPanel>

        <TabsPanel value="settings" className="space-y-3 pt-3">
          <GalleryTabsPanelContent />
        </TabsPanel>
      </Tabs>

      <ButtonShowcase className={itemClass} />
      <DropdownMenuShowcase className={itemClass} />

      <ThreadPreviewCard className={itemClass} />
      <WorkspaceDetails className={itemClass} />
      <ReviewQueueItem className={itemClass} />

      <Banner status="success" className={itemClass}>
        <CheckCircle />
        <BannerTitle>Package export scan completed</BannerTitle>
        <BannerDescription>
          Docs are showing current components, not source-only surfaces.
        </BannerDescription>
      </Banner>

      <EmptyState className={`${itemClass} border-2 border-black bg-white shadow-[var(--shadow)]`}>
        <EmptyStateIcon>
          <Spinner className="size-9" />
        </EmptyStateIcon>
        <EmptyStateTitle>Source sync queued</EmptyStateTitle>
        <EmptyStateDescription>
          Loading visual parity notes for deferred app surfaces.
        </EmptyStateDescription>
        <EmptyStateActions>
          <Button size="sm" variant="default">
            Save draft
          </Button>
        </EmptyStateActions>
      </EmptyState>
    </div>
  );
}

function GalleryTabsPanelContent() {
  return (
    <>
      <ThreadPreviewCard />
      <AgentDmPreviewCard />
      <QuotedSourceMessage />
    </>
  );
}

function DropdownMenuShowcase({ className }: { className?: string }) {
  const [containerElement, setContainerElement] = useState<HTMLDivElement | null>(null);
  const anchor = useMemo(
    () => ({
      getBoundingClientRect() {
        const rect = containerElement?.getBoundingClientRect();
        return DOMRect.fromRect({
          x: rect?.left ?? 0,
          y: rect?.top ?? 0,
          width: 0,
          height: 0,
        });
      },
    }),
    [containerElement],
  );

  return (
    <div ref={setContainerElement} className={`${className ?? ""} relative h-56 max-w-full`.trim()}>
      {containerElement ? (
        <DropdownMenu open modal={false}>
          <DropdownMenuContent
            anchor={anchor}
            side="bottom"
            align="start"
            sideOffset={0}
            alignOffset={0}
            className="flex w-72 max-w-full flex-col"
            portalProps={{ container: containerElement }}
          >
            <DropdownMenuItem className="font-bold">
              <Check />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Slock</div>
                <div className="truncate font-mono text-xs text-black/40">/slock</div>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Check className="opacity-0" />
              <div className="min-w-0 flex-1 text-left">
                <div className="truncate">Design Guild</div>
                <div className="truncate font-mono text-xs text-black/40">/design</div>
              </div>
              <span className="ml-auto shrink-0 border border-black bg-brutal-pink px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                4
              </span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuActionItem>
              <Plus />
              <span className="min-w-0 flex-1 text-left">Join Community</span>
              <DropdownMenuShortcut>J</DropdownMenuShortcut>
            </DropdownMenuActionItem>
            <DropdownMenuActionItem className="bg-brutal-pink">
              <Plus />
              <span className="min-w-0 flex-1 text-left">Switch or Create</span>
              <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
            </DropdownMenuActionItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  );
}

function ButtonShowcase({ className }: { className?: string }) {
  return (
    <div className={`${className ?? ""} flex flex-wrap items-center gap-2`.trim()}>
      <Button variant="primary">
        <Sparkles />
        Primary
      </Button>
      <Button variant="default">Default</Button>
      <Button variant="information">Info</Button>
      <Button variant="danger">Delete</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost" size="icon-sm" aria-label="Settings">
        <Settings />
      </Button>
      <Button variant="link">Link action</Button>
      <Button loading>Loading</Button>
      <Button disabled>Disabled</Button>
    </div>
  );
}

function ThreadPreviewCard({ className }: { className?: string }) {
  return (
    <ConversationPreviewCard data-highlighted="true" className={className} onClick={() => {}}>
      <ConversationPreviewCardContent>
        <ConversationPreviewCardMeta>
          <ConversationPreviewCardChannel>#engineering</ConversationPreviewCardChannel>
          <ConversationPreviewCardTimestamp>2m</ConversationPreviewCardTimestamp>
        </ConversationPreviewCardMeta>
        <ConversationPreviewCardPreview className="line-clamp-2 font-bold">
          <ConversationPreviewCardPreviewLeading>
            <MessageSquare className="shrink-0 text-brutal-pink" />
          </ConversationPreviewCardPreviewLeading>
          <ConversationPreviewCardPreviewAuthor>Wug: </ConversationPreviewCardPreviewAuthor>
          Source comparison is clean; only the Select gap remains.
        </ConversationPreviewCardPreview>
        <ConversationPreviewCardSecondaryPreview className="text-black">
          <span className="font-bold text-black">Ada: </span>
          <span>Keep the gallery close to actual panel usage.</span>
        </ConversationPreviewCardSecondaryPreview>
        <ConversationPreviewCardFooter>
          <span className="inline-flex items-center gap-1 border border-black bg-brutal-lime px-1.5 py-0.5 text-[10px] font-bold">
            <CheckCircle className="size-2.5" />
            #13 @Ada
          </span>
          <span className="font-mono text-[10px] text-black/40">4 replies</span>
        </ConversationPreviewCardFooter>
      </ConversationPreviewCardContent>
    </ConversationPreviewCard>
  );
}

function AgentDmPreviewCard({ className }: { className?: string }) {
  return (
    <ConversationPreviewCard
      aria-label="Atlas agent DM activity"
      title="Agent DM activity"
      className={className}
    >
      <ConversationPreviewCardContent>
        <ConversationPreviewCardMeta>
          <ConversationPreviewCardChannel>Agent DM</ConversationPreviewCardChannel>
          <ConversationPreviewCardAuthor>
            <Avatar size="4xs" type="agent">
              <AvatarFallback />
            </Avatar>
            <ConversationPreviewCardAuthorName>Atlas</ConversationPreviewCardAuthorName>
            <ConversationPreviewCardAuthorSubtitle>@atlas</ConversationPreviewCardAuthorSubtitle>
          </ConversationPreviewCardAuthor>
          <ConversationPreviewCardTimestamp>2m ago</ConversationPreviewCardTimestamp>
        </ConversationPreviewCardMeta>
        <ConversationPreviewCardPreview>No messages yet</ConversationPreviewCardPreview>
        <ConversationPreviewCardFooter>
          <span className="font-mono text-[11px] uppercase tracking-wide text-black/45">
            Activity only
          </span>
        </ConversationPreviewCardFooter>
      </ConversationPreviewCardContent>
    </ConversationPreviewCard>
  );
}

function QuotedSourceMessage({ className }: { className?: string }) {
  return (
    <QuotedMessageCard
      render={<button type="button" aria-label="Open quoted message" onClick={() => {}} />}
      className={className}
    >
      <QuotedMessageCardBody>
        <QuotedMessageCardHeader>
          <QuotedMessageCardMeta>
            <QuotedMessageCardChannel>
              <Hash />
              design
            </QuotedMessageCardChannel>
            <QuotedMessageCardSeparator />
            <QuotedMessageCardAuthor>
              <Avatar size="2xs" type="human">
                <AvatarFallback />
              </Avatar>
              <QuotedMessageCardAuthorName>Ada</QuotedMessageCardAuthorName>
              <QuotedMessageCardAuthorSubtitle>reviewer</QuotedMessageCardAuthorSubtitle>
            </QuotedMessageCardAuthor>
            <QuotedMessageCardSeparator />
            <QuotedMessageCardThread />
            <QuotedMessageCardSeparator />
            <QuotedMessageCardTag className="bg-brutal-orange/30 text-black">
              Archived
            </QuotedMessageCardTag>
          </QuotedMessageCardMeta>
          <QuotedMessageCardTimestamp>Yesterday</QuotedMessageCardTimestamp>
        </QuotedMessageCardHeader>
        <QuotedMessageCardContentWrap>
          <QuotedMessageCardContent>
            Preserve the brutal panel affordance, but move app-domain mapping to callers.
          </QuotedMessageCardContent>
          <QuotedMessageCardAttachments>
            <QuotedMessageCardTag className="bg-brutal-lavender font-mono text-[10px] font-bold text-black">
              diff.patch
            </QuotedMessageCardTag>
            <QuotedMessageCardTag className="bg-brutal-lavender font-mono text-[10px] font-bold text-black">
              source.tsx
            </QuotedMessageCardTag>
          </QuotedMessageCardAttachments>
        </QuotedMessageCardContentWrap>
      </QuotedMessageCardBody>
    </QuotedMessageCard>
  );
}

function WorkspaceDetails({ className }: { className?: string }) {
  return (
    <ListItem interactive={false} className={className}>
      <ListItemBody>
        <ListItemRow className="justify-between">
          <ListItemTitle>Workspace detail</ListItemTitle>
          <Badge variant="primary">Source-like</Badge>
        </ListItemRow>
        <DescriptionList className="mt-3 grid gap-3">
          <DescriptionItem>
            <DescriptionTerm>Channel</DescriptionTerm>
            <DescriptionDetails className="font-mono">#engineering</DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Updated</DescriptionTerm>
            <DescriptionDetails>
              <span className="inline-flex items-center gap-1">
                <Clock3 />2 minutes ago
              </span>
            </DescriptionDetails>
          </DescriptionItem>
          <DescriptionItem>
            <DescriptionTerm>Status</DescriptionTerm>
            <DescriptionDetails>
              <Badge variant="success">Ready for review</Badge>
            </DescriptionDetails>
          </DescriptionItem>
        </DescriptionList>
      </ListItemBody>
    </ListItem>
  );
}

function ReviewQueueItem({ className }: { className?: string }) {
  return (
    <MediaListItem className={className}>
      <MediaListItemBody>
        <MediaListItemVisual>
          <Avatar size="md" type="human">
            <AvatarFallback>
              <UserPlus className="size-4" />
            </AvatarFallback>
          </Avatar>
        </MediaListItemVisual>
        <MediaListItemText>
          <MediaListItemTitle>Invite reviewers</MediaListItemTitle>
          <MediaListItemSubtitle>Share this docs page</MediaListItemSubtitle>
        </MediaListItemText>
      </MediaListItemBody>
      <MediaListItemAside>
        <Button size="icon-xs" variant="outline" aria-label="Send invite">
          <Mail />
        </Button>
      </MediaListItemAside>
    </MediaListItem>
  );
}
