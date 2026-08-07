import Link from "next/link";
import { Button, Flex, Stack, Heading, Text } from "@kookie-ui/react";

export default function Home() {
  return (
    <Stack gap="6" style={{ maxWidth: "44rem" }}>
      <Stack gap="4">
        <Heading size="8" render={<h1 />}>
          KookieUI
        </Heading>
        <Text size="4" emphasis="medium" render={<p />}>
          A ground-up design system: Base UI primitives behind a Kookie-owned API, generated
          OKLCH color, token-only styling, semantic axes, and a hard CSS budget. These docs are
          built out of the system itself — if a pixel here isn&apos;t KookieUI, it&apos;s a bug.
        </Text>
      </Stack>
      <Flex gap="3">
        <Button size="3" tone="accent" emphasis="loud" render={<Link href="/components" />}>
          Browse the components
        </Button>
        <Button size="3" emphasis="medium" render={<Link href="/matrix" />}>
          Judging matrix
        </Button>
        <Button
          size="3"
          emphasis="quiet"
          bordered
          render={<a href="https://github.com/KushagraDhawan1997/kookie-ui-v2" />}
        >
          GitHub
        </Button>
      </Flex>
    </Stack>
  );
}
