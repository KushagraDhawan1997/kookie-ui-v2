import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuTrigger,
  Flex,
  MenuItem,
  Stack,
  Surface,
  Text,
} from "@kookie-ui/react";

const FILES = [
  { name: "Q3 revenue.xlsx", size: "84 KB" },
  { name: "Board deck.pdf", size: "2.1 MB" },
  { name: "Hiring plan.docx", size: "36 KB" },
];

// Give each item its own ContextMenu, so the menu can act on the item that
// was right-clicked. The trigger draws nothing, so the row keeps its look.
export default function Example() {
  return (
    <Stack gap="2" style={{ maxWidth: "28rem" }}>
      {FILES.map((file) => (
        <ContextMenu key={file.name}>
          <ContextMenuTrigger>
            <Surface size="1">
              <Flex justify="space-between" align="center">
                <Text size="2">{file.name}</Text>
                <Text size="2" emphasis="medium">
                  {file.size}
                </Text>
              </Flex>
            </Surface>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <MenuItem>Open {file.name}</MenuItem>
            <MenuItem>Download</MenuItem>
            <MenuItem tone="destructive">Move to trash</MenuItem>
          </ContextMenuContent>
        </ContextMenu>
      ))}
    </Stack>
  );
}
