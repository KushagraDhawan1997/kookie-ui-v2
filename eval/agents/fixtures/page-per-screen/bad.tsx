import { useState } from "react";
import { Heading, Shell, ShellContent, ShellNavItem, ShellSidebar } from "@kushagradhawan/kookie-ui-react";

// Each screen's title is a hand-placed Heading, not a Page.
export default function App() {
  const [open, setOpen] = useState("Overview");
  return (
    <Shell>
      <ShellSidebar aria-label="Pages">
        <ShellNavItem current={open === "Overview"} onClick={() => setOpen("Overview")}>Overview</ShellNavItem>
        <ShellNavItem current={open === "Projects"} onClick={() => setOpen("Projects")}>Projects</ShellNavItem>
      </ShellSidebar>
      <ShellContent><Heading size="8">{open}</Heading></ShellContent>
    </Shell>
  );
}
