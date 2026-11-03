"use client";

import { Row, RowGroup, Stack, Switch } from "@kushagradhawan/kookie-ui-react";

import { ChevronRightIcon } from "../app/icons";

export default function Example() {
  return (
    <Stack gap="6" style={{ maxWidth: "26rem" }}>
      <RowGroup label="Notifications" note="We only email you about your own projects.">
        <Row render={<label />} trailing={<Switch defaultChecked />}>
          Email
        </Row>
        <Row render={<label />} trailing={<Switch />}>
          Push
        </Row>
        <Row render={<label />} trailing={<Switch defaultChecked />}>
          Weekly summary
        </Row>
      </RowGroup>
      <RowGroup label="Account">
        <Row render={<a href="#password" />} trailing={<ChevronRightIcon />}>
          Password
        </Row>
        <Row render={<a href="#export" />} trailing={<ChevronRightIcon />}>
          Export data
        </Row>
        <Row tone="destructive">Sign out</Row>
      </RowGroup>
    </Stack>
  );
}
