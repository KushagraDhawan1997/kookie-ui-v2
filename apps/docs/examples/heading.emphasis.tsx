import { Heading, Stack } from "@kushagradhawan/kookie-ui-react";

// `emphasis` picks the ink colour. Use `medium` for a label above a group,
// so it does not compete with the headings that name content.
export default function Example() {
  return (
    <Stack gap="3">
      <Heading size="6" emphasis="loud" render={<h3 />}>
        Team members
      </Heading>
      <Heading size="4" emphasis="medium" render={<h4 />}>
        Pending invitations
      </Heading>
      <Heading size="4" emphasis="quiet" render={<h4 />}>
        Archived members
      </Heading>
    </Stack>
  );
}
