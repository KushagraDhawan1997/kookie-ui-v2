import Link from "next/link";
import { Button, Flex, Heading, Stack, Text } from "@kookie-ui/react";

/**
 * The 404, and it exists for two reasons that turn out to be one.
 *
 * Next serves a built-in not-found component when an app supplies none — and that component
 * injects `<style>body{color:#000;background:#fff}@media(prefers-color-scheme:dark){…}</style>`
 * into the body. Two consequences, both real. It re-decides appearance from the OS, which is
 * exactly the question this app answers from `<html data-appearance>`: a visitor who pinned
 * Dark on a light machine got a white page under a dark-mode header, with the wordmark and nav
 * near-white on white. And it is third-party UI — raw pixels this system did not paint — on a
 * route the app actually serves, which is the one thing the docs claim never happens.
 *
 * So the stance and the bug have the same fix, which is the sort of coincidence that means the
 * stance was load-bearing rather than decorative.
 */
export default function NotFound() {
  return (
    <Stack gap="6" style={{ maxWidth: "34rem" }}>
      <Stack gap="3">
        <Heading size="7" render={<h1 />}>
          404
        </Heading>
        <Text size="3" emphasis="medium" render={<p />}>
          That page does not exist. It may have been renamed while the system was being built —
          most things here still are.
        </Text>
      </Stack>
      <Flex gap="3">
        <Button size="2" tone="accent" emphasis="loud" render={<Link href="/" />}>
          Back to the start
        </Button>
        <Button size="2" emphasis="quiet" bordered render={<Link href="/matrix" />}>
          The judging matrix
        </Button>
      </Flex>
    </Stack>
  );
}
