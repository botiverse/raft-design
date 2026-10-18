import { Fragment, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { FileText, Menu, Moon, Search, Sun, SunMoon } from "lucide-react";
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
} from "raft-ui";
import type { ThemeMode } from "raft-ui";

import { GithubMark } from "#/components/github-mark.tsx";
import { usePreviewTheme } from "#/components/preview-theme.tsx";
import { raftUiVersion } from "#/data/raft-ui-release.ts";
import { navSections } from "#/lib/content/nav.ts";
import type { NavItem } from "#/lib/content/nav.ts";

import { SearchDialog } from "./search-dialog.tsx";
import { StatusLabel } from "./status-label.tsx";
import type { ComponentStatus } from "./status-label.tsx";

function ThemeMenu() {
  const { mode, setMode } = usePreviewTheme();
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : SunMoon;
  const handleModeChange = useCallback((value: unknown) => setMode(value as ThemeMode), [setMode]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="on-frame" size="icon-md" aria-label="Color mode" />}
      >
        <Icon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={mode} onValueChange={handleModeChange}>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
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
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-line-seam bg-layer-frame px-2 text-foreground-on-frame md:px-5">
      <Button
        variant="on-frame"
        size="icon-md"
        className="md:hidden"
        aria-label="Open navigation"
        onClick={onOpenNav}
      >
        <Menu />
      </Button>
      <Link
        to="/"
        className="flex min-w-0 items-center gap-2 rounded-control outline-none focus-visible:shadow-focus"
      >
        <RaftLogo aria-hidden className="h-6 w-auto shrink-0" />
        <span className="truncate text-headline font-bold">Raft Design System</span>
      </Link>
      <span className="hidden font-mono text-mono-meta text-foreground-on-frame-muted sm:inline">
        raft-ui {raftUiVersion}
      </span>
      <div className="flex flex-1 justify-center px-4 max-md:hidden">
        <SearchTrigger onClick={onOpenSearch}>
          <Search />
          <SearchTriggerLabel>Search components, tokens, patterns</SearchTriggerLabel>
          <SearchTriggerShortcut>⌘K</SearchTriggerShortcut>
        </SearchTrigger>
      </div>
      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <Button
          variant="on-frame"
          size="icon-md"
          className="md:hidden"
          aria-label="Search"
          onClick={onOpenSearch}
        >
          <Search />
        </Button>
        <Button
          variant="on-frame"
          className="max-lg:hidden"
          nativeButton={false}
          render={<a href="/playground" />}
        >
          Playground
        </Button>
        <Button
          variant="on-frame"
          className="max-lg:hidden"
          nativeButton={false}
          render={<Link to="/changelog" />}
        >
          Changelog
        </Button>
        <ThemeMenu />
        <Button
          variant="on-frame"
          size="icon-md"
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
    <SidebarItem active={active} render={<Link to={item.url} />}>
      <SidebarItemContent>
        <SidebarItemTitle>{item.title}</SidebarItemTitle>
      </SidebarItemContent>
      {item.status && item.status !== "stable" ? (
        <SidebarItemAside>
          <StatusLabel status={item.status as ComponentStatus} />
        </SidebarItemAside>
      ) : null}
    </SidebarItem>
  );
}

/** The cream sidebar: every page, by section; components by category. */
export function SiteNav() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  const currentSection = path.split("/")[1];

  return (
    <SidebarRoot aria-label="Documentation">
      <SidebarBody>
        <SidebarContent>
          <div className="flex flex-col gap-0.5 pb-2">
            <SidebarItem active={path === "/"} render={<Link to="/" />}>
              <SidebarItemContent>
                <SidebarItemTitle>Overview</SidebarItemTitle>
              </SidebarItemContent>
            </SidebarItem>
            <SidebarItem render={<a href="/llms.txt" />}>
              <SidebarItemContent>
                <SidebarItemTitle>For Agents</SidebarItemTitle>
              </SidebarItemContent>
              <SidebarItemAside>
                <FileText className="size-4 text-foreground-hint" aria-hidden />
              </SidebarItemAside>
            </SidebarItem>
          </div>
          {navSections().map((section) => (
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
                    {item.group && item.group !== section.items[index - 1]?.group ? (
                      <SidebarGroupLabel>{item.group}</SidebarGroupLabel>
                    ) : null}
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
          <DrawerHeader>
            <DrawerTitle>Raft Design System</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="min-h-0 overflow-y-auto p-0">
            <SiteNav />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
