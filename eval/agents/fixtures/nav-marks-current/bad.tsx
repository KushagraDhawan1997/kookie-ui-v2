import { useState } from "react";
import { Page, Shell, ShellContent, ShellNavItem, ShellSidebar } from "@kushagradhawan/kookie-ui-react";

// The open page is held in state but never marked in the navigation.
export default function App() {
  const [open, setOpen] = useState("Overview");
  return (
    <Shell>
      <ShellSidebar aria-label="Pages">
        <ShellNavItem onClick={() => setOpen("Overview")}>Overview</ShellNavItem>
        <ShellNavItem onClick={() => setOpen("Projects")}>Projects</ShellNavItem>
      </ShellSidebar>
      <ShellContent><Page title={open} /></ShellContent>
    </Shell>
  );
}
