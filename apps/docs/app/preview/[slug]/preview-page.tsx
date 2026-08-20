"use client";

/**
 * A standalone component preview: the same shell, the same renderer, one component
 * (2026-08-19). This page exists so a detailed preview can be judged — and performance-
 * checked — without the weight of every other component on the collection page.
 */
import * as React from "react";
import Link from "next/link";
import { Button, Flex, Heading, Stack } from "@kookie-ui/react";

import { PreviewShell } from "../preview-app";
import { ComponentPreviewBody, SectionNav } from "../component-preview";
import { COMPONENT_PREVIEWS } from "../previews";

export function ComponentPreviewApp({ slug }: { slug: string }) {
  const preview = COMPONENT_PREVIEWS.find((p) => p.slug === slug);
  // The server route 404s an unknown slug before this renders; the guard is for type flow.
  if (!preview) return null;

  return (
    <PreviewShell>
      <Stack gap="6">
        <Flex gap="3" align="center" justify="space-between" wrap="wrap">
          <Heading size="8" render={<h1 />}>
            {preview.name}
          </Heading>
          <Button size="1" emphasis="quiet" render={<Link href="/preview" />}>
            All components
          </Button>
        </Flex>
        <SectionNav preview={preview} />
      </Stack>
      <ComponentPreviewBody preview={preview} standalone />
    </PreviewShell>
  );
}
