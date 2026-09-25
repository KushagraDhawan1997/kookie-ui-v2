import { ScrollArea, Stack, Text } from "@kushagradhawan/kookie-ui-react";

const RELEASES = [
  "Faster search across all projects",
  "Invoices now download as PDF",
  "Dark mode follows the system setting",
  "Keyboard shortcuts for every menu",
  "Shared links expire after 30 days",
  "Audit log export to CSV",
  "Two-factor sign-in with passkeys",
  "Bulk move for archived files",
  "Comments show who edited last",
  "New billing page for team owners",
];

// `fade` makes the content fade out at an edge while more of it is hidden past that edge.
// An edge with nothing behind it does not fade.
export default function Example() {
  return (
    <ScrollArea fade aria-label="Release notes" style={{ height: "12rem", width: "22rem" }}>
      <Stack gap="4">
        {RELEASES.map((note) => (
          <Text key={note} size="2">
            {note}
          </Text>
        ))}
      </Stack>
    </ScrollArea>
  );
}
