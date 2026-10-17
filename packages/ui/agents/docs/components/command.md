# Command

Command is a command palette that lets people search for any action or page in your app and run it from the keyboard.

Job: Act. Make something happen. A pattern: it owns the decisions this job needs.

```tsx
<Command items={sections} open={open} onOpenChange={setOpen}>
  <CommandTrigger render={<Button>Open</Button>} />
  <CommandContent aria-label="Command palette">
    <CommandInput aria-label="Search" placeholder="Search…" />
    <CommandList>{(section) => …}</CommandList>
    <CommandEmpty>…</CommandEmpty>
  </CommandContent>
</Command>
```

## Overview

Command is a search field over the actions and pages in your app. Someone types a few letters, the list narrows to the matching rows, and Enter runs the highlighted one. Use it for a command palette that opens from a keyboard shortcut. To choose a value in a form, use a `Combobox`, and for a short list of actions on one object, use a `Menu`.

The palette is a `Dialog`, so it dims the page, keeps focus inside, stops the page behind it from scrolling and closes on Escape. It covers the whole app while it is open. For a floating panel that leaves the page usable, use a `Popover`.

The search field and the results are two separate panels near the top of the window, at every width including a phone. The field stays in place while the results panel below it grows and shrinks as you type. Rows keep the order you wrote them in, so people can learn where each command is.

One `size` sets the whole palette: both panels, the search field, the rows and the group labels. The rows are one size step larger than the controls in your app, and the text in the search field is larger again, so the palette reads as the main thing on the screen rather than as part of a form.

Pass every command to `items`, and keep the array stable by defining it at module scope or in a `useMemo`. `CommandList` and `CommandCollection` take a function, which they call for each item that matches. To rank or limit the results yourself, set `filter` to `null` on `CommandContent`, read the text with `onQueryChange`, and pass your own narrowed array to `items`.

Your app decides which keys open the palette, so `Command` accepts `open` and `onOpenChange`, and it shows no button when you leave out `CommandTrigger`. Running a row closes the palette, and `onOpenChange` reports the reason `item-press`. Call `cancel()` for that reason to keep the palette open.

The search field keeps focus the whole time the palette is open. A row is highlighted from the start, the arrow keys move the highlight and Enter runs it, while Tab leaves the list alone. A row rendered as a link is a real anchor, so screen readers announce it as a link and a middle-click opens it in a new tab. `CommandContent` and `CommandInput` both need an `aria-label`, because the palette has no visible title and a placeholder isn't a name.

## Not supported

- A footer — A palette footer usually holds a legend of keyboard shortcuts. Each row can already show its own shortcut in `trailing`, which is where people look for it.
- `modal` — An open palette always covers the page, because it is the one thing someone is doing at that moment. For a panel that leaves the page usable, use a `Popover`.
- Re-sorting results as you type — Rows keep the order you wrote them in. If the order changed on every keystroke, people couldn't learn where a command is. To rank results, filter them yourself and pass the sorted array to `items`.
- A Separator inside the panel — The results list is a listbox, which may only contain options and groups, so a separator fails accessibility checks. Use `CommandGroup` to divide the rows instead.
- An edge-to-edge results panel — The results panel keeps padding around its rows, like a menu panel, so a highlighted row ends inside the panel's rounded corner instead of running into it.

## Examples

```tsx
"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import {
  Delete02Icon,
  FolderOpenIcon,
  GithubIcon,
  Link01Icon,
  Moon02Icon,
  PlusSignIcon,
  Search01Icon,
  UserAdd01Icon,
} from "@hugeicons/core-free-icons";
import {
  Button,
  Command,
  CommandCollection,
  CommandContent,
  CommandEmpty,
  CommandGroup,
  CommandGroupLabel,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Kbd,
  iconStroke,
  type TypeSize,
} from "@kushagradhawan/kookie-ui-react";
import * as React from "react";

import { EmptyState } from "../blocks/empty-state";

// The package ships no icon set, so the glyphs are yours. `iconStroke` is the weight the system
// draws its own with, so your set matches them. No size: the row sizes the slot's svg.
const icon = (glyph: typeof PlusSignIcon) => (
  <HugeiconsIcon icon={glyph} strokeWidth={iconStroke} aria-hidden />
);

type Action = {
  value: string;
  label: string;
  glyph?: React.ReactNode;
  /** The chord that also runs it, shown at the far edge. */
  chord?: string;
  /** The one meaning a row may carry. */
  tone?: "destructive";
  /** Nothing to run right now — visible, announced, not reachable. */
  disabled?: boolean;
  /** A row that is a PLACE rather than a verb becomes a real anchor. */
  href?: string;
};
type Section = { value: string; items: Action[] };

/* Hold the array stable — it crosses to the matcher by identity, so an inline literal re-runs
   the whole filter pass on every unrelated render of whatever holds the palette. */
const SECTIONS: Section[] = [
  {
    value: "Actions",
    items: [
      { value: "new", label: "New project", glyph: icon(PlusSignIcon), chord: "N" },
      { value: "open", label: "Open recent", glyph: icon(FolderOpenIcon), chord: "O" },
      { value: "invite", label: "Invite a teammate", glyph: icon(UserAdd01Icon) },
      // Disabled is a STATE, not a variant: the row still reads and still announces, and the
      // keyboard skips it.
      { value: "import", label: "Import from GitHub", glyph: icon(GithubIcon), disabled: true },
    ],
  },
  {
    value: "Settings",
    items: [
      { value: "appearance", label: "Appearance", glyph: icon(Moon02Icon) },
      // A row that goes somewhere is a real anchor, so it middle-clicks, opens in a new tab and
      // announces as a link. The row stays one target — an anchor nested inside it would be two.
      { value: "docs", label: "Open documentation", glyph: icon(Link01Icon), href: "https://example.com/docs" },
    ],
  },
  {
    value: "Danger",
    items: [
      // The only meaning a row may carry. It tints the words, and the system decides how.
      { value: "delete", label: "Delete this project", glyph: icon(Delete02Icon), tone: "destructive" },
    ],
  },
];

export default function Example({ size = "3" }: { size?: TypeSize }) {
  void size;
  const [open, setOpen] = React.useState(false);

  return (
    /* `size` prices the whole palette — the panel, the field, the rows and the captions — because
       the component owns all of it. Groups are the only divider: the list is a listbox, and a
       group divides it in the accessibility tree as well as on screen. */
    <Command items={SECTIONS} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Open command palette</Button>} />
      <CommandContent aria-label="Command palette">
        <CommandInput
          aria-label="Search commands"
          placeholder="Search for commands…"
          leading={icon(Search01Icon)}
        />
        <CommandList>
          {(section: Section) => (
            <CommandGroup key={section.value} items={section.items}>
              <CommandGroupLabel>{section.value}</CommandGroupLabel>
              <CommandCollection>
                {(action: Action) => (
                  <CommandItem
                    key={action.value}
                    value={action}
                    {...(action.glyph ? { leading: action.glyph } : {})}
                    {...(action.chord ? { trailing: <Kbd>{action.chord}</Kbd> } : {})}
                    {...(action.tone ? { tone: action.tone } : {})}
                    {...(action.disabled ? { disabled: true } : {})}
                    {...(action.href
                      ? { render: <a href={action.href} target="_blank" rel="noreferrer" /> }
                      : {})}
                  >
                    {action.label}
                  </CommandItem>
                )}
              </CommandCollection>
            </CommandGroup>
          )}
        </CommandList>
        {/* CommandEmpty places what you give it and dresses none of it, so what goes in is an
            empty state rather than a sentence — the same block the docs site's own search uses. */}
        <CommandEmpty>
          <EmptyState
            title="No commands match"
            description="Try a shorter word, or check what you typed."
          />
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
```

### A list without groups

A short palette with a flat array and no groups. Start here when your app has only a few commands, and add groups when the list grows.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Command,
  CommandContent,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Action = { value: string; label: string };

// A short palette does not need groups. Pass a flat array to `items`, and
// `CommandList` calls its function once for each row that matches.
const ACTIONS: Action[] = [
  { value: "new-project", label: "New project" },
  { value: "invite", label: "Invite a teammate" },
  { value: "billing", label: "Open billing" },
  { value: "api-keys", label: "Manage API keys" },
  { value: "sign-out", label: "Sign out" },
];

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Command items={ACTIONS} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Open command palette</Button>} />
      <CommandContent aria-label="Command palette">
        <CommandInput aria-label="Search commands" placeholder="Search for commands…" />
        <CommandList>
          {(action: Action) => (
            <CommandItem key={action.value} value={action}>
              {action.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No commands match.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
```

### Open with a keyboard shortcut

The palette opens from Command+K or Control+K and has no `CommandTrigger`. Your app listens for the keys and sets `open`, so you choose the shortcut.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Command,
  CommandContent,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  Flex,
  Kbd,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Action = { value: string; label: string };

const ACTIONS: Action[] = [
  { value: "new-file", label: "New file" },
  { value: "search", label: "Search in project" },
  { value: "deploy", label: "Deploy to production" },
  { value: "settings", label: "Open settings" },
];

// Your app decides which keys open the palette. Listen for them yourself
// and set `open`. Without a CommandTrigger, the palette renders no button.
export default function Example() {
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((current) => !current);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Flex gap="3" align="center">
      <Button emphasis="medium" onClick={() => setOpen(true)} trailing={<Kbd>⌘K</Kbd>}>
        Search
      </Button>
      <Text size="2" emphasis="medium">
        Or press <Kbd>⌘</Kbd> <Kbd>K</Kbd> anywhere on the page.
      </Text>
      <Command items={ACTIONS} open={open} onOpenChange={setOpen}>
        <CommandContent aria-label="Command palette">
          <CommandInput aria-label="Search commands" placeholder="Search for commands…" />
          <CommandList>
            {(action: Action) => (
              <CommandItem key={action.value} value={action}>
                {action.label}
              </CommandItem>
            )}
          </CommandList>
          <CommandEmpty>
            <Text size="2" emphasis="medium">
              No commands match.
            </Text>
          </CommandEmpty>
        </CommandContent>
      </Command>
    </Flex>
  );
}
```

### Rows that are links

Each row goes to a page, so it is rendered as an anchor with `render`. A link row opens in a new tab on a middle-click, and screen readers announce it as a link.

```tsx
"use client";

import * as React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Book02Icon, CreditCardIcon, Home01Icon, Settings02Icon } from "@hugeicons/core-free-icons";
import {
  Button,
  Command,
  CommandContent,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Text,
  iconStroke,
} from "@kushagradhawan/kookie-ui-react";

type Place = { value: string; label: string; href: string; glyph: typeof Home01Icon };

// A row that goes somewhere renders as a real link with `render`. It
// still opens in a new tab on a middle-click, and a screen reader
// announces it as a link.
const PLACES: Place[] = [
  { value: "dashboard", label: "Dashboard", href: "#dashboard", glyph: Home01Icon },
  { value: "billing", label: "Billing", href: "#billing", glyph: CreditCardIcon },
  { value: "settings", label: "Workspace settings", href: "#settings", glyph: Settings02Icon },
  { value: "docs", label: "Documentation", href: "#docs", glyph: Book02Icon },
];

export default function Example() {
  const [open, setOpen] = React.useState(false);

  return (
    <Command items={PLACES} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Go to…</Button>} />
      <CommandContent aria-label="Go to a page">
        <CommandInput aria-label="Search pages" placeholder="Search pages…" />
        <CommandList>
          {(place: Place) => (
            <CommandItem
              key={place.value}
              value={place}
              leading={<HugeiconsIcon icon={place.glyph} strokeWidth={iconStroke} aria-hidden />}
              render={<a href={place.href} />}
            >
              {place.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No page matches.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
```

### Your own search and ranking

`filter={null}` turns off the built-in matching, and `onQueryChange` reports what people type. The app narrows and sorts its own array and passes the result to `items`. Use this for a ranked search, such as help articles.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Command,
  CommandContent,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Article = { value: string; label: string; body: string };

const ARTICLES: Article[] = [
  { value: "invoices", label: "Download an invoice", body: "billing pdf receipt" },
  { value: "seats", label: "Add seats to your plan", body: "billing team members" },
  { value: "sso", label: "Set up single sign-on", body: "security saml login" },
  { value: "export", label: "Export project data", body: "csv backup download" },
  { value: "delete", label: "Delete a workspace", body: "remove account data" },
];

// Set `filter` to `null` to turn off the built-in matching. Read what
// people type with `onQueryChange`, then pass your own narrowed and
// ranked array to `items`.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const results = React.useMemo(() => {
    const words = query.trim().toLowerCase();
    if (!words) return ARTICLES;
    return ARTICLES.filter((a) => `${a.label} ${a.body}`.toLowerCase().includes(words)).sort(
      (a, b) => Number(b.label.toLowerCase().includes(words)) - Number(a.label.toLowerCase().includes(words)),
    );
  }, [query]);

  return (
    <Command items={results} open={open} onOpenChange={setOpen}>
      <CommandTrigger render={<Button emphasis="medium">Search help articles</Button>} />
      <CommandContent aria-label="Help search" filter={null} onQueryChange={setQuery}>
        <CommandInput aria-label="Search help" placeholder="Search help…" />
        <CommandList>
          {(article: Article) => (
            <CommandItem key={article.value} value={article}>
              {article.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No articles match.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
```

### Keep the palette open

Calling `cancel()` for the `item-press` reason keeps the palette open after a row runs. Use it when rows toggle settings and people may want to change several in one visit.

```tsx
"use client";

import * as React from "react";
import {
  Button,
  Command,
  CommandContent,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandTrigger,
  Text,
} from "@kushagradhawan/kookie-ui-react";

type Setting = { value: string; label: string };

const SETTINGS: Setting[] = [
  { value: "email", label: "Email notifications" },
  { value: "digest", label: "Weekly digest" },
  { value: "mentions", label: "Mentions only" },
];

// Running a row closes the palette. When a row toggles a setting, people
// often want to change several. Call `cancel()` for the `item-press`
// reason and the palette stays open.
export default function Example() {
  const [open, setOpen] = React.useState(false);
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({ email: true });

  return (
    <Command
      items={SETTINGS}
      open={open}
      onOpenChange={(next, details) => {
        if (!next && details.reason === "item-press") {
          details.cancel();
          return;
        }
        setOpen(next);
      }}
    >
      <CommandTrigger render={<Button emphasis="medium">Notification settings</Button>} />
      <CommandContent aria-label="Notification settings">
        <CommandInput aria-label="Search settings" placeholder="Search settings…" />
        <CommandList>
          {(setting: Setting) => (
            <CommandItem
              key={setting.value}
              value={setting}
              trailing={
                <Text size="2" emphasis="medium">
                  {enabled[setting.value] ? "On" : "Off"}
                </Text>
              }
              onClick={() => setEnabled((all) => ({ ...all, [setting.value]: !all[setting.value] }))}
            >
              {setting.label}
            </CommandItem>
          )}
        </CommandList>
        <CommandEmpty>
          <Text size="2" emphasis="medium">
            No settings match.
          </Text>
        </CommandEmpty>
      </CommandContent>
    </Command>
  );
}
```

## Topics

Every symbol this component exports, grouped by the job it does. Each one carries the props it declares.

### Opening the palette

#### Command

Command is a command palette that lets people search for any action or page in your app and run it from the keyboard.

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `React.ReactNode` | A `CommandTrigger`, if there is one, and a `CommandContent`. |
| `defaultOpen?` | `DialogProps["defaultOpen"]` | Whether the palette is open at the start, for an uncontrolled palette. |
| `items` | `readonly unknown[]` | All the items that the palette can show, before filtering. |
| `onOpenChange?` | `(open: boolean, details: CommandOpenChangeDetails) => void` | Called each time the palette opens or closes. |
| `open?` | `DialogProps["open"]` | Whether the palette is open, for a controlled palette. |
| `size?` | `"1" \| "2" \| "3" \| "4"` | The size step of the palette, from `"1"` to `"4"`. |

#### CommandTrigger

The control that opens the palette. Leave it out when a keyboard shortcut is the only way to open it

| Prop | Type | What it does |
| --- | --- | --- |
| `children?` | `React.ReactNode` | The button's label. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |
| `nativeButton?` | `boolean` | Tells the part if the rendered element is a real `<button>`. |
| `render?` | `RenderElement` | Usually a Kookie Button: `<DialogTrigger render={<Button/>}>Delete…</DialogTrigger>`. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

It also takes every prop of a `<button>`.

### Presenting the panel

#### CommandContent

Holds the search field and the results. It needs an `aria-label`, which names the palette for screen readers, and it accepts `filter` and `onQueryChange`

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label` | `string` | The accessible name of the palette. |
| `children` | `React.ReactNode` | A `CommandInput`, a `CommandList`, and a `CommandEmpty` for when nothing matches. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `filter?` | `React.ComponentPropsWithoutRef<typeof Autocomplete.Root>["filter"]` | A custom function that decides which items match the query. |
| `onQueryChange?` | `(query: string) => void` | Called with the query each time it changes, and with an empty query when the palette closes. |
| `style?` | `React.CSSProperties` | Inline styles, merged last, so your value wins over anything the component resolved. |

### Filtering

#### CommandInput

The search field, in its own panel above the results. It needs an `aria-label`, and it shows no focus ring, because it keeps focus the whole time the palette is open

| Prop | Type | What it does |
| --- | --- | --- |
| `aria-label` | `string` | The accessible name of the search field. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `leading?` | `React.ReactNode` | Content before the field, such as a search icon. |

#### CommandEmpty

What the palette shows when nothing matches. Put it next to `CommandList`, and it appears inside the results panel, so the palette keeps the same shape

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `React.ReactNode` | The content to show when no item matches. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |

### Listing the commands

#### CommandList

The scrolling panel of results. It takes a function, which it calls for each item that matches the search

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `(item: T) => React.ReactNode` | Called for each item that survives the filter. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |

#### CommandItem

One command row, with optional `leading` and `trailing` content. Set `tone="destructive"` for a command that deletes something

| Prop | Type | What it does |
| --- | --- | --- |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `leading?` | `React.ReactNode` | Content before the label, such as an icon or an avatar. |
| `render?` | `RenderElement` | The element to render the row as, such as an `<a href>` or your framework's link component. |
| `tone?` | `"destructive"` | The colour of the row. |
| `trailing?` | `React.ReactNode` | Content at the far end of the row, such as a keyboard shortcut, a category or a count. |

### Grouping into sections

#### CommandGroup

A section of the results with its own `items`. It hides itself when none of its items match

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `React.ReactNode` | A `CommandGroupLabel` and a `CommandCollection` for the rows. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them.  |
| `items` | `readonly unknown[]` | The items in this group. |

#### CommandGroupLabel

The heading of a section. It uses a muted colour, and the arrow keys skip over it

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `React.ReactNode` | The name of the group. |
| `className?` | `string` | Your classes, appended to the ones this component resolves rather than replacing them. |

#### CommandCollection

Goes inside a `CommandGroup` and calls its function for each matching item in that group

| Prop | Type | What it does |
| --- | --- | --- |
| `children` | `(item: T) => React.ReactNode` | A function that renders a row for each item in the group that matches the query. |
