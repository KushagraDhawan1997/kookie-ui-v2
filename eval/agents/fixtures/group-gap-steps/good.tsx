import { Heading, Stack, Text } from "@kushagradhawan/kookie-ui-react";

function Group({ title, body }: { title: string; body: string }) {
  return (
    <Stack gap="2">
      <Heading size="6">{title}</Heading>
      <Text emphasis="medium">{body}</Text>
    </Stack>
  );
}

// Gap 2 inside each group, gap 6 between them; a section at 6 holds groups that separate at 5.
export default function App() {
  return (
    <Stack gap="6">
      <Group title="Notifications" body="Choose what reaches you." />
      <Stack gap="5">
        <Group title="Billing" body="Cards and invoices." />
        <Group title="Plan" body="The plan you are on." />
      </Stack>
    </Stack>
  );
}
