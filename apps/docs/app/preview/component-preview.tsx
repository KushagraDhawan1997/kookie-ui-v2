"use client";

/**
 * The one renderer over the per-component specs (2026-08-19). Nobody hand-writes a preview
 * page: the section order is SECTION_ORDER's, identical on the collection page and the
 * standalone page, and an absent section prints its reason — a skipped axis is a statement,
 * never a gap.
 *
 * This file deliberately does not import the shell: specimens.tsx renders the body inline
 * on the collection page, and importing the shell from here would close a cycle
 * (specimens → this → preview-app → specimens).
 */
import * as React from "react";
import Link from "next/link";
import { Button, Flex, Heading, Stack, Text } from "@kookie-ui/react";

import { SECTION_ORDER, type ComponentPreview } from "./previews/types";

export function ComponentPreviewBody({
  preview,
  standalone,
}: {
  preview: ComponentPreview;
  /** Standalone page: sections are h2. Collection page: the component name is already the
      h2, so sections step down to h3. Visual size stays the same in both — one structure,
      one look. */
  standalone: boolean;
}) {
  return (
    <Stack gap="7">
      {SECTION_ORDER.map(({ key, name, intent }) => {
        const section = preview.sections[key];
        return (
          <Stack key={key} gap="4" render={<section id={`${preview.slug}-${key}`} />}>
            <Stack gap="1">
              <Heading size="4" render={standalone ? <h2 /> : <h3 />}>
                {name}
              </Heading>
              {/* The section's contract, on the page: a demo either answers this sentence
                  or it is visibly in the wrong section (2026-08-20). */}
              <Text size="2" emphasis="quiet" render={<p />} style={{ maxWidth: "44rem" }}>
                {intent}
              </Text>
            </Stack>
            {"absent" in section && section.absent !== undefined ? (
              <Text size="2" emphasis="quiet" render={<p />} style={{ maxWidth: "36rem" }}>
                Not applicable — {section.absent}
              </Text>
            ) : (
              section.body
            )}
          </Stack>
        );
      })}
    </Stack>
  );
}

/** The collection page's header row for a ported component: the name plus the door to its
    standalone page — the page performance checks run on. */
export function StandaloneLink({ slug }: { slug: string }) {
  return (
    <Button size="1" emphasis="quiet" render={<Link href={`/preview/${slug}`} />}>
      Standalone page
    </Button>
  );
}

/** The six-section jump nav on a standalone page — the collection page's own idiom, reused. */
export function SectionNav({ preview }: { preview: ComponentPreview }) {
  return (
    <Stack gap="2" render={<nav aria-label="Sections" />}>
      <Text size="2" emphasis="quiet" id="pv-section-jump">
        Jump to
      </Text>
      <Flex gap="1" wrap="wrap" aria-labelledby="pv-section-jump">
        {SECTION_ORDER.map(({ key, name }) => (
          <Button key={key} size="1" emphasis="quiet" render={<a href={`#${preview.slug}-${key}`} />}>
            {name}
          </Button>
        ))}
      </Flex>
    </Stack>
  );
}
