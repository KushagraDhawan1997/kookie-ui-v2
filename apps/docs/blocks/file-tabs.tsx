"use client";

/**
 * A code figure with several files in it (2026-09-01, Kushagra: "it has multiple files, which
 * means our specimen's code area must support segmented control or tabs no?").
 *
 * TABS, NOT A SEGMENTED CONTROL, and §26 settles it in one sentence: a tab bar switches what is
 * under it and a segmented control sets a value in place. Picking `footer.css` over `footer.tsx`
 * replaces the thing below the bar, so it is a tab bar — and the package's own `Tabs` already
 * carries the roles, the arrow keys and the travelling rule, so this file states none of them.
 *
 * THE BAR SITS ON THE CODE, NOT IN THE FIGURE'S CHROME ROW. The figure's row is at the top,
 * above the live specimen, which would put the tabs a demo's height away from what they switch
 * — the one arrangement §26's sentence forbids. So the code half gets its own row back for this
 * case: tabs on one wall, the copy button on the other.
 *
 * AND THE COPY BUTTON MOVES WITH THE TABS, which is the whole reason this is a client component
 * rather than markup the server could emit. The button hands over the file you are looking at;
 * knowing which one that is is state, and the state belongs to the same element that draws the
 * bar. Everything expensive has already happened on the server — the lines arrive tokenized, so
 * what ships here is a `useState` and a list.
 */
import * as React from "react";
import { Flex, Stack, Tabs, TabsList, TabsPanel, TabsTab, type Size } from "@kookie-ui/react";

import { CodeSampleView } from "./code-sample";
import { CopyButton } from "./copy-button";
import type { CodeLine } from "./highlight";

export type TabbedFile = {
  /** The tab's label, and what a reader calls the file. */
  name: string;
  lines: readonly CodeLine[];
  focused: boolean;
  diff: boolean;
  /** What the copy button hands over: the source with every annotation stripped. */
  copyText: string;
  lang: string;
};

export function FileTabs({
  files,
  size = "2",
  lineNumbers = false,
  maxLines,
}: {
  files: readonly TabbedFile[];
  size?: Size;
  /** Passed straight through to every panel. The figure decides it once — see `specimen.tsx`
      — so switching tabs cannot switch whether the lines are numbered. */
  lineNumbers?: boolean;
  maxLines?: number;
}) {
  const [active, setActive] = React.useState(files[0]!.name);
  const current = files.find((file) => file.name === active) ?? files[0]!;

  return (
    /* THE BAR AND WHAT IT SWITCHES ARE TWO THINGS (2026-09-01, Kushagra: "need more space
       after tabs, the content is touching the tabs"). The root drew them flush, so the first
       line of code sat on the bar's own hairline and the two read as one block. `4` is the
       interval a label takes from what it names elsewhere in this figure — the same step the
       demo's label takes above it — and the panel is what the bar names. */
    <Tabs
      value={active}
      onValueChange={(value) => setActive(String(value))}
      render={<Stack gap="4" />}
    >
      {/* The row: the bar on the reading wall, the action on the other, which is the same
          arrangement the figure's own chrome row uses one level up. */}
      <Flex justify="space-between" align="center" gap="3">
        <TabsList size={size} aria-label="Files">
          {files.map((file) => (
            <TabsTab key={file.name} value={file.name}>
              {file.name}
            </TabsTab>
          ))}
        </TabsList>
        <CopyButton code={current.copyText} size={size} iconOnly />
      </Flex>
      {files.map((file) => (
        <TabsPanel key={file.name} value={file.name}>
          <CodeSampleView
            lines={file.lines}
            focused={file.focused}
            diff={file.diff}
            lang={file.lang}
            size={size}
            {...(lineNumbers ? { lineNumbers: true } : {})}
            {...(maxLines === undefined ? {} : { maxLines })}
            // Hosted and bare for the same reasons the single-file figure states: the figure IS
            // the well, and the row above is the only chrome.
            hosted
            bare
          />
        </TabsPanel>
      ))}
    </Tabs>
  );
}
