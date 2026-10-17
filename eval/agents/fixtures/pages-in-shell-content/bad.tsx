import { Page, Shell, ShellContent, ShellSidebar, Text } from "@kushagradhawan/kookie-ui-react";

// The page is a sibling of the panes, not inside ShellContent.
export default function App() {
  return (
    <Shell>
      <ShellSidebar aria-label="Pages"><Text>Overview</Text></ShellSidebar>
      <Page title="Overview"><Text>Hello</Text></Page>
      <ShellContent><Text>Empty</Text></ShellContent>
    </Shell>
  );
}
