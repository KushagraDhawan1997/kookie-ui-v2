import { List, ListItem, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// Use `start` to continue the numbers after a paragraph. The numbers stay
// correct when a person copies the steps or cites one of them.
export default function Example() {
  return (
    <Stack gap="4" style={{ maxWidth: "28rem" }}>
      <List ordered>
        <ListItem>Export your data from the old workspace</ListItem>
        <ListItem>Create the new workspace</ListItem>
      </List>
      <Text size="3" render={<p />}>
        Wait for the confirmation email before you continue.
      </Text>
      <List ordered start={3}>
        <ListItem>Import the export file</ListItem>
        <ListItem>Invite your team again</ListItem>
      </List>
    </Stack>
  );
}
