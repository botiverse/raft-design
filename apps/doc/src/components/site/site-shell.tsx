import { Fragment, useCallback, useEffect, useState } from "react";
import type { MouseEvent, ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import {
  ChevronDown,
  ExternalLink,
  FileText,
  Languages,
  Menu,
  Moon,
  Search,
  Sun,
  SunMoon,
} from "lucide-react";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  RaftLogo,
  SearchTrigger,
  SearchTriggerLabel,
  SearchTriggerShortcut,
  SidebarBody,
  SidebarContent,
  SidebarGroupLabel,
  SidebarItem,
  SidebarItemAside,
  SidebarItemContent,
  SidebarItemTitle,
  SidebarList,
  SidebarRoot,
  SidebarSection,
  SidebarSectionChevron,
  SidebarSectionDisclosure,
  SidebarSectionHeader,
  SidebarSectionTitle,
} from "@botiverse/raft-ui";
import type { ThemeMode } from "@botiverse/raft-ui";
import { DropdownMenuLinkItem } from "@botiverse/raft-ui/wip";

import { GithubMark } from "#/components/github-mark.tsx";
import { usePreviewTheme } from "#/components/preview-theme.tsx";
import { raftUiVersion } from "#/data/raft-ui-release.ts";
import { navSections } from "#/lib/content/nav.ts";
import type { NavItem } from "#/lib/content/nav.ts";
import { LANGUAGE_NAME, LANGUAGE_TAG, LOCALES, localizePath } from "#/lib/i18n/locales.ts";
import { useLocale, useMessages } from "#/lib/i18n/use-locale.ts";

import { SearchDialog } from "./search-dialog.tsx";
import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

function ThemeMenu({
  variant = "on-frame",
  className,
}: {
  variant?: "on-frame" | "ghost";
  className?: string;
}) {
  const messages = useMessages();
  const { mode, setMode } = usePreviewTheme();
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : SunMoon;
  const handleModeChange = useCallback((value: unknown) => setMode(value as ThemeMode), [setMode]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant={variant}
            size="icon-md"
            className={className}
            aria-label={messages.colorMode}
          />
        }
      >
        <Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={mode} onValueChange={handleModeChange}>
          <DropdownMenuRadioItem value="light">{messages.light}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">{messages.dark}</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">{messages.system}</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The language menu: a dropdown of the languages, each named in itself and
 * each a link to the same page in that language, so it can be opened in a
 * new tab or copied. Following one loads the other document, so the whole
 * site switches with it, and keeps the section being read.
 */
function LanguageMenu({ variant = "on-frame" }: { variant?: "on-frame" | "ghost" }) {
  const messages = useMessages();
  const locale = useLocale();
  const pathname = useLocation({ select: (location) => location.pathname });
  // The server never sees the fragment, so it joins the link only when it is
  // followed: the same section in the other language.
  const keepFragment = useCallback((event: MouseEvent<HTMLAnchorElement>) => {
    if (window.location.hash) event.currentTarget.hash = window.location.hash;
  }, []);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant={variant} aria-label={messages.languageSwitch} />}
      >
        <Languages data-icon="inline-start" />
        <span lang={LANGUAGE_TAG[locale]}>{LANGUAGE_NAME[locale]}</span>
        <ChevronDown data-icon="inline-end" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "ghost" ? "start" : "end"}>
        {LOCALES.map((option) => (
          <DropdownMenuLinkItem
            key={option}
            current={option === locale}
            href={localizePath(pathname, option)}
            hrefLang={LANGUAGE_TAG[option]}
            lang={LANGUAGE_TAG[option]}
            onClick={keepFragment}
          >
            {LANGUAGE_NAME[option]}
          </DropdownMenuLinkItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * The frame: the web top bar (design/patterns/page-structure.md), yellow and
 * 56 tall, with the search box in the middle. The docs site is a brand page,
 * like sign-in, so it shows the Raft mark rather than a workspace.
 */
function TopBar({ onOpenNav, onOpenSearch }: { onOpenNav: () => void; onOpenSearch: () => void }) {
  const messages = useMessages();
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line-seam bg-layer-frame px-2 text-foreground-on-frame md:px-5">
      <Button
        variant="on-frame"
        size="icon-md"
        className="md:hidden"
        aria-label={messages.openNavigation}
        onClick={onOpenNav}
      >
        <Menu />
      </Button>
      <Link
        to="/"
        className="flex min-w-0 items-center gap-2 rounded-control outline-none focus-visible:shadow-focus md:shrink-0"
      >
        <RaftLogo aria-hidden className="h-6 w-auto shrink-0" />
        <span className="truncate text-headline font-bold">{messages.siteName}</span>
      </Link>
      <span className="hidden font-mono text-mono-meta text-foreground-on-frame-muted lg:inline">
        raft-ui {raftUiVersion}
      </span>
      {/* From 1024 up there is room for the search box; below, a button. */}
      <div className="flex flex-1 justify-center px-4 max-lg:hidden">
        <SearchTrigger onClick={onOpenSearch}>
          <Search />
          <SearchTriggerLabel>{messages.searchTrigger}</SearchTriggerLabel>
          <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
        </SearchTrigger>
      </div>
      <div className="ml-auto flex items-center gap-1 lg:ml-0">
        <Button
          variant="on-frame"
          size="icon-md"
          className="lg:hidden"
          aria-label={messages.search}
          onClick={onOpenSearch}
        >
          <Search />
        </Button>
        {/* On a phone the top bar has no room for it: it is at the top of the menu. */}
        <div className="shrink-0 max-md:hidden">
          <LanguageMenu />
        </div>
        <ThemeMenu className="max-md:hidden" />
        <Button
          variant="on-frame"
          size="icon-md"
          className="max-md:hidden"
          aria-label="GitHub"
          nativeButton={false}
          render={
            <a href="https://github.com/botiverse/raft-design" target="_blank" rel="noreferrer" />
          }
        >
          <GithubMark />
        </Button>
      </div>
    </header>
  );
}

function NavRow({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <SidebarItem
      active={active}
      render={
        item.external ? (
          <a href={item.url} target="_blank" rel="noreferrer" />
        ) : (
          <Link to={item.url} />
        )
      }
    >
      <SidebarItemContent>
        <SidebarItemTitle>{item.title}</SidebarItemTitle>
      </SidebarItemContent>
      {item.status && item.status !== "stable" ? (
        <SidebarItemAside>
          <StatusLabel status={item.status as ComponentStatus} />
        </SidebarItemAside>
      ) : item.external ? (
        <SidebarItemAside>
          <ExternalLink className="size-4 text-foreground-hint" aria-hidden />
        </SidebarItemAside>
      ) : null}
    </SidebarItem>
  );
}

/**
 * A row's labels: the layer when it changes (components: Core, Collaboration),
 * then the group when it changes. The layer reads as the heading of the
 * groups below it.
 */
function NavLabels({ item, previous }: { item: NavItem; previous: NavItem | undefined }) {
  const newLayer = item.layer !== undefined && item.layer !== previous?.layer;
  const newGroup = item.group !== undefined && (newLayer || item.group !== previous?.group);
  return (
    <>
      {newLayer ? (
        <SidebarGroupLabel className="font-bold text-foreground">{item.layer}</SidebarGroupLabel>
      ) : null}
      {newGroup ? <SidebarGroupLabel>{item.group}</SidebarGroupLabel> : null}
    </>
  );
}

/**
 * The cream sidebar: Overview (design/README.md) and For Agents, then every
 * page by section in reading order (components by layer and category,
 * decision records under About).
 */
export function SiteNav() {
  const locale = useLocale();
  const messages = useMessages();
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const currentSection = path.split("/")[1];

  return (
    <SidebarRoot aria-label={messages.documentation}>
      <SidebarBody>
        <SidebarContent>
          <div className="flex flex-col gap-0.5 pb-2">
            <SidebarItem active={path === "/"} render={<Link to="/" />}>
              <SidebarItemContent>
                <SidebarItemTitle>{messages.overview}</SidebarItemTitle>
              </SidebarItemContent>
            </SidebarItem>
            <SidebarItem render={<a href="/llms.txt" />}>
              <SidebarItemContent>
                <SidebarItemTitle>{messages.forAgents}</SidebarItemTitle>
              </SidebarItemContent>
              <SidebarItemAside>
                <FileText className="size-4 text-foreground-hint" aria-hidden />
              </SidebarItemAside>
            </SidebarItem>
          </div>
          {navSections(locale).map((section) => (
            <SidebarSection
              key={section.id}
              defaultOpen={section.id !== "components" || currentSection === "components"}
            >
              <SidebarSectionHeader>
                <SidebarSectionDisclosure>
                  <SidebarSectionTitle>{section.title}</SidebarSectionTitle>
                  <SidebarSectionChevron />
                </SidebarSectionDisclosure>
              </SidebarSectionHeader>
              <SidebarList>
                {section.items.map((item, index) => (
                  <Fragment key={item.url}>
                    <NavLabels item={item} previous={section.items[index - 1]} />
                    <NavRow item={item} active={path === item.url} />
                  </Fragment>
                ))}
              </SidebarList>
            </SidebarSection>
          ))}
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

/**
 * The documentation site: frame, cream sidebar, white paper
 * (design/foundations/color.md). Below 768 the sidebar is a drawer.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  const messages = useMessages();
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();
  const openNav = useCallback(() => setNavOpen(true), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  // A link in the phone drawer navigates; close the drawer with it.
  const [navPathname, setNavPathname] = useState(pathname);
  if (navPathname !== pathname) {
    setNavPathname(pathname);
    setNavOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="flex h-dvh flex-col bg-layer-canvas text-foreground">
      <TopBar onOpenNav={openNav} onOpenSearch={openSearch} />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-60 shrink-0 md:flex">
          <SiteNav />
        </aside>
        <main id="site-main" className="min-w-0 flex-1 overflow-y-auto bg-layer-canvas">
          {children}
        </main>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen} swipeDirection="left">
        <DrawerContent className="md:hidden">
          <DrawerHeader className="flex items-center justify-between gap-2">
            <DrawerTitle>{messages.siteName}</DrawerTitle>
            {/* The phone top bar has room only for the title and search. */}
            <div className="flex items-center gap-1">
              <ThemeMenu variant="ghost" />
              <Button
                variant="ghost"
                size="icon-md"
                aria-label="GitHub"
                nativeButton={false}
                render={
                  <a
                    href="https://github.com/botiverse/raft-design"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <GithubMark />
              </Button>
            </div>
          </DrawerHeader>
          <DrawerBody className="min-h-0 overflow-y-auto p-0">
            <div className="px-3 pt-1 pb-2">
              <LanguageMenu variant="ghost" />
            </div>
            <SiteNav />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
