import { Row, Stack } from "@kookie-ui/react";

export default function Example() {
  return (
    <Stack gap="3" style={{ minWidth: "18rem" }}>
      <Row size="1">Deployments at size 1</Row>
      <Row size="2">Deployments at size 2</Row>
      <Row size="3">Deployments at size 3</Row>
      <Row size="4">Deployments at size 4</Row>
    </Stack>
  );
}
