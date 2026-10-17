import { useState } from "react";
import { Page, Shell, ShellContent, ShellHeader, ShellNavItem, ShellSidebar, Text } from "@kushagradhawan/kookie-ui-react";

const PAGES = { overview: "Overview", projects: "Projects" } as const;
type Key = keyof typeof PAGES;

function Overview() {
  return <Page title="Overview"><Text>Two deploys finished this morning.</Text></Page>;
}

function Projects() {
  return <Page title="Projects"><Text>Four projects.</Text></Page>;
}

export default function App() {
  const [open, setOpen] = useState<Key>("overview");
  return (
    <Shell>
      <ShellHeader><Text>Acme</Text></ShellHeader>
      <ShellSidebar aria-label="Pages">
        {(Object.keys(PAGES) as Key[]).map((key) => (
          <ShellNavItem key={key} current={key === open} onClick={() => setOpen(key)}>
            {PAGES[key]}
          </ShellNavItem>
        ))}
      </ShellSidebar>
      <ShellContent>{open === "overview" ? <Overview /> : <Projects />}</ShellContent>
    </Shell>
  );
}
