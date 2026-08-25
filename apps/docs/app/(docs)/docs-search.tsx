"use client";

/**
 * Search, composed out of the package (2026-08-21).
 *
 * A `Dialog` holding a `TextField` and a list of rows — which is the ordinary way to build a
 * command palette and, more usefully here, a real consumer of the floating family. The docs
 * site being made of the system is not a slogan: this is the piece that would have caught a
 * broken focus trap or a portal that did not re-theme.
 *
 * The rows are `Row`s and not `MenuItem`s, and that is the taxonomy speaking. A menu row is a
 * member of a `Menu` — it needs that context for its roving focus and its `role="menuitem"` —
 * and a list of search results in a dialog is not a menu. §21's row family is the right shape,
 * and `Row` is the member of it that lives outside Menu and Shell.
 *
 * This file used to say so and then render full-width quiet Buttons, because that member did
 * not exist yet. The three things that came back with it: the row's own box (line plus inset,
 * not the button height ladder), the family's lit fill instead of a borrowed emphasis rung, and
 * the two-cursors rule stated rather than hoped for — `highlighted` is what drives these rows,
 * so the pointer stops painting and a mouse resting over row three cannot argue with a keyboard
 * that has moved to row five.
 */
import * as React from "react";
import Link from "next/link";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  Flex,
  Kbd,
  Stack,
  Row,
  Text,
  TextField,
} from "@kookie-ui/react";

import { SearchIcon } from "../icons";
import { searchEntries, type SearchEntry } from "./search";

export function DocsSearch({ index }: { index: readonly SearchEntry[] }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);

  const results = React.useMemo(() => searchEntries(index, query), [index, query]);

  // ⌘K / Ctrl-K. Bound on the document because a palette has to open from anywhere, and
  // `preventDefault` because Chrome's own ⌘K focuses the address bar.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // The active row resets whenever the result SET changes, not on every render: leaving it
  // where it was means a keystroke that shortens the list can point past the end of it.
  React.useEffect(() => setActive(0), [query]);

  /**
   * The rows are real anchors, so Enter CLICKS one rather than pushing a route.
   *
   * The first spelling called `useRouter().push`, which made every result a button that
   * happens to navigate: no middle-click, no open-in-new-tab, nothing on the status bar, and
   * nothing for a screen reader to announce as a link. That is the system's own rule — a link
   * is a link — broken in the one component whose entire job is going somewhere. It also broke
   * a law: `shell.test.tsx` renders this chrome with `renderToStaticMarkup`, where there is no
   * router context, so the hook threw (found 2026-08-21 by an agent reading the suite).
   *
   * Both fixes are the same fix, which is usually the sign the semantics were the problem.
   */
  const rows = React.useRef<(HTMLAnchorElement | null)[]>([]);

  return (
    <>
      <Button
        emphasis="quiet"
        bordered
        leading={<SearchIcon />}
        onClick={() => setOpen(true)}
        aria-label="Search the documentation"
      >
        <Flex align="center" gap="3">
          <Text size="2" emphasis="quiet">
            Search
          </Text>
          <Kbd>⌘K</Kbd>
        </Flex>
      </Button>

      <Dialog size="3" open={open} onOpenChange={setOpen}>
        <DialogContent>
          <Stack gap="4">
            <Stack gap="2">
              <DialogTitle>Search</DialogTitle>
              <DialogDescription>
                Search chapters, sections and components. The index also holds the refusals,
                so a search for a prop the system does not have finds the page that explains it.
              </DialogDescription>
            </Stack>

            <TextField
              autoFocus
              size="3"
              value={query}
              placeholder="Type to search"
              aria-label="Search query"
              leading={<SearchIcon />}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((i) => Math.min(i + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((i) => Math.max(i - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  rows.current[active]?.click();
                }
              }}
            />

            {query.trim().length >= 2 && results.length === 0 ? (
              <Text size="2" emphasis="medium">
                Nothing matches “{query}”. The index covers titles, section headings and
                component descriptions. It does not cover the text of every paragraph.
              </Text>
            ) : null}

            <Stack gap="1">
              {results.map((entry, index) => (
                <Row
                  key={entry.href}
                  size="2"
                  highlighted={index === active}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  render={
                    <Link
                      href={entry.href}
                      ref={(node) => {
                        rows.current[index] = node;
                      }}
                    />
                  }
                >
                  <Flex align="baseline" gap="3" wrap="wrap">
                    <Text size="2" weight="medium">
                      {entry.title}
                    </Text>
                    <Text size="2" emphasis="quiet">
                      {entry.context}
                    </Text>
                  </Flex>
                </Row>
              ))}
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </>
  );
}
