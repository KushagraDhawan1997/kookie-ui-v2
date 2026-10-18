import { Grid, Stack, Tabs, TabsList, TabsPanel, TabsTab, Text } from "@kushagradhawan/kookie-ui-react";

const FILES = ["brief.pdf", "logo.svg"];

// Tabs for a choice that only changes how the same files are laid out.
export default function App() {
  return (
    <Tabs defaultValue="list">
      <TabsList>
        <TabsTab value="list">List</TabsTab>
        <TabsTab value="grid">Grid</TabsTab>
      </TabsList>
      <TabsPanel value="list"><Stack gap="2">{FILES.map((f) => <Text key={f}>{f}</Text>)}</Stack></TabsPanel>
      <TabsPanel value="grid"><Grid columns="3" gap="3">{FILES.map((f) => <Text key={f}>{f}</Text>)}</Grid></TabsPanel>
    </Tabs>
  );
}
