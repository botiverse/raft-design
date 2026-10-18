import { Fragment, useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, FileText, Menu, Moon, Search, Sun, SunMoon } from "lucide-react";
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

import { SearchDialog } from "./search-dialog.tsx";
import { StatusLabel } from "./status-label.tsx";
import { PAGES, SECTIONS, pageHref } from "./site-map.ts";

function ThemeMenu() {
  const { mode, setMode } = usePreviewTheme();
  const Icon = mode === "dark" ? Moon : mode === "light" ? Sun : SunMoon;
  const handleModeChange = useCallback((value: unknown) => setMode(value as ThemeMode), [setMode]);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="on-frame" size="icon-md" aria-label="Theme" />}>
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
 * The frame. The docs site is a web product, so it takes the web top bar:
 * yellow, 56 tall, the search box in the middle. The site counts as a brand
 * page (like sign-in), so the Raft mark is allowed here.
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
        to="/proposal"
        className="flex min-w-0 items-center gap-2 rounded-control outline-none focus-visible:shadow-raft-focus"
      >
        <RaftLogo aria-hidden className="h-6 w-auto" />
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
          render={<a href="/changelog" />}
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

function NavItem({
  href,
  active,
  children,
  aside,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <SidebarItem active={active} render={<Link to={href} />}>
      <SidebarItemContent>
        <SidebarItemTitle>{children}</SidebarItemTitle>
      </SidebarItemContent>
      {aside ? <SidebarItemAside>{aside}</SidebarItemAside> : null}
    </SidebarItem>
  );
}

/** The cream sidebar: every page of the site, grouped by section. */
export function SiteNav() {
  const { pathname } = useLocation();
  const current = pathname.split("/")[2];

  return (
    <SidebarRoot aria-label="Documentation">
      <SidebarBody>
        <SidebarContent>
          <div className="flex flex-col gap-0.5 pb-2">
            <NavItem
              href="/proposal"
              active={pathname === "/proposal" || pathname === "/proposal/"}
            >
              Overview
            </NavItem>
            <NavItem
              href="/llms.txt"
              active={false}
              aside={<FileText className="size-4 text-foreground-hint" />}
            >
              For agents
            </NavItem>
          </div>
          {SECTIONS.map((section) => {
            const pages = PAGES.filter((page) => page.section === section.id);
            return (
              <SidebarSection
                key={section.id}
                defaultOpen={section.id !== "components" || current === "components"}
              >
                <SidebarSectionHeader>
                  <SidebarSectionDisclosure>
                    <SidebarSectionTitle>{section.title}</SidebarSectionTitle>
                    <SidebarSectionChevron />
                  </SidebarSectionDisclosure>
                </SidebarSectionHeader>
                <SidebarList>
                  {pages.map((page, index) => (
                    <Fragment key={page.slug}>
                      {page.group && page.group !== pages[index - 1]?.group ? (
                        <SidebarGroupLabel>{page.group}</SidebarGroupLabel>
                      ) : null}
                      <NavItem
                        href={pageHref(page)}
                        active={pathname === pageHref(page)}
                        aside={
                          page.status && page.status !== "stable" ? (
                            <StatusLabel status={page.status} />
                          ) : null
                        }
                      >
                        {page.title}
                      </NavItem>
                    </Fragment>
                  ))}
                </SidebarList>
              </SidebarSection>
            );
          })}
        </SidebarContent>
      </SidebarBody>
    </SidebarRoot>
  );
}

export function ProposalShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { pathname } = useLocation();

  const openNav = useCallback(() => setNavOpen(true), []);
  const openSearch = useCallback(() => setSearchOpen(true), []);

  // Close the phone drawer when a link in it navigates.
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
        <main id="proposal-main" className="min-w-0 flex-1 overflow-y-auto bg-layer-canvas">
          {children}
        </main>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen} swipeDirection="left">
        <DrawerContent className="md:hidden">
          <DrawerHeader>
            <DrawerTitle>
              <BookOpen className="mr-2 inline size-5" aria-hidden />
              Documentation
            </DrawerTitle>
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
