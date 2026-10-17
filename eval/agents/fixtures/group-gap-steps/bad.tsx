import { Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

// The same gap at every level, so nothing reads as a group.
export default function App() {
  return (
    <Stack gap="4">
      <Stack gap="4">
        <Heading size="6">Notifications</Heading>
        <Text emphasis="medium">Choose what reaches you.</Text>
      </Stack>
      <Stack gap="3">
        <Heading size="6">Billing</Heading>
        <Text emphasis="medium">Cards and invoices.</Text>
      </Stack>
    </Stack>
  );
}
