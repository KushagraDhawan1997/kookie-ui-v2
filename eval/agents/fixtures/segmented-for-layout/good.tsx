import { useState } from "react";
import { Grid, SegmentedControl, SegmentedItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const FILES = ["brief.pdf", "logo.svg"];

export default function App() {
  const [layout, setLayout] = useState("list");
  return (
    <Stack gap="5">
      <SegmentedControl value={layout} onValueChange={(value) => setLayout(value as string)} aria-label="Layout">
        <SegmentedItem value="list">List</SegmentedItem>
        <SegmentedItem value="grid">Grid</SegmentedItem>
      </SegmentedControl>
      <Grid columns={layout === "grid" ? "3" : "1"} gap="3">
        {FILES.map((file) => <Text key={file}>{file}</Text>)}
      </Grid>
    </Stack>
  );
}
