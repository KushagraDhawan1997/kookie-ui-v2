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
