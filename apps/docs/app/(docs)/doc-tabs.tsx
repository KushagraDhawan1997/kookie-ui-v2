"use client";
/**
 * Documentation and Examples, as two tabs of one page.
 *
 * The page's tabs and its contents column are siblings in the tree, so the current tab lives in
 * a small context both read: the tabs render one panel, the column lists that panel's headings.
 * The tab is kept in `?tab=examples` so a link can land on it, and a `#fragment` that points
 * into the other panel switches to it first.
 */
import * as React from "react";
import { Box, Tabs, TabsList, TabsPanel, TabsTab } from "@kushagradhawan/kookie-ui-react";

import { TableOfContents, type TocEntry } from "../../blocks/table-of-contents";

type Tab = "docs" | "examples";

const DocTabsContext = React.createContext<{
  tab: Tab;
  setTab: (tab: Tab) => void;
} | null>(null);

function useDocTabs() {
  const value = React.useContext(DocTabsContext);
  if (!value) throw new Error("DocTabs parts must sit inside <DocTabsProvider>.");
  return value;
}

export function DocTabsProvider({
  exampleIds,
  children,
}: {
  /** Every anchor in the Examples panel, so a fragment pointing at one can open that tab. */
  exampleIds: readonly string[];
  children: React.ReactNode;
}) {
  const [tab, setTabState] = React.useState<Tab>("docs");
  // A fragment that pointed into the Examples panel. Its heading mounts with the panel, after
  // the browser has already tried to scroll, so the scroll is replayed once the panel is in.
  const pendingHash = React.useRef<string | null>(null);

  React.useEffect(() => {
    const id = pendingHash.current;
    if (tab !== "examples" || !id) return;
    pendingHash.current = null;
    const frame = requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView());
    return () => cancelAnimationFrame(frame);
  }, [tab]);

  // The URL is outside React, so the tab is read from it after mount and written back on change.
  React.useEffect(() => {
    const fromUrl = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const query = new URLSearchParams(window.location.search).get("tab");
      if (hash && exampleIds.includes(hash)) {
        pendingHash.current = hash;
        setTabState("examples");
      } else if (query === "examples") setTabState("examples");
    };
    fromUrl();
    window.addEventListener("hashchange", fromUrl);
    return () => window.removeEventListener("hashchange", fromUrl);
  }, [exampleIds]);

  const setTab = React.useCallback((next: Tab) => {
    setTabState(next);
    const url = new URL(window.location.href);
    if (next === "examples") url.searchParams.set("tab", "examples");
    else url.searchParams.delete("tab");
    url.hash = "";
    window.history.replaceState(null, "", url);
  }, []);

  const value = React.useMemo(() => ({ tab, setTab }), [tab, setTab]);
  return <DocTabsContext.Provider value={value}>{children}</DocTabsContext.Provider>;
}

export function DocTabs({ docs, examples }: { docs: React.ReactNode; examples: React.ReactNode }) {
  const { tab, setTab } = useDocTabs();
  return (
    <Tabs value={tab} onValueChange={(next) => setTab(next === "examples" ? "examples" : "docs")}>
      <TabsList size="3" aria-label="Page">
        <TabsTab value="docs">
          Documentation
        </TabsTab>
        <TabsTab value="examples">
          Examples
        </TabsTab>
      </TabsList>
      <TabsPanel value="docs">
        <Box pt="8">{docs}</Box>
      </TabsPanel>
      <TabsPanel value="examples">
        <Box pt="8">{examples}</Box>
      </TabsPanel>
    </Tabs>
  );
}

export function DocTabsToc({ docs, examples }: { docs: TocEntry[]; examples: TocEntry[] }) {
  const { tab } = useDocTabs();
  return <TableOfContents entries={tab === "examples" ? examples : docs} className="kd-toc" />;
}
