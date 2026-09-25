import { Box, Page, Row, Stack } from "@kushagradhawan/kookie-ui-react";

// A title that says everything needs no description.
export default function Example() {
  return (
    <Box style={{ maxWidth: "32rem" }}>
      <Page title="Settings">
        <Stack gap="1">
          <Row>Profile</Row>
          <Row>Notifications</Row>
          <Row>Security</Row>
          <Row>Connected apps</Row>
        </Stack>
      </Page>
    </Box>
  );
}
