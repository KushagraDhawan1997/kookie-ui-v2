import Link from "next/link";
import { Link as KookieLink, Stack } from "@kookie-ui/react";

import { PageFrame, PageTitle } from "../page-frame";
import { BLOCKS } from "../../../blocks";

export const metadata = { title: "Blocks — KookieUI" };

/**
 * The blocks index. One renderer over the registry, like every index on this site: adding a
 * block is adding a row and its files, never writing a page.
 *
 * A PLAIN LINK LIST, THE FRONT DOOR'S SHAPE (2026-08-30, Kushagra: "same with blocks page",
 * the hour the component index took it). The previous spelling was heading-sized links with
 * a blurb under each — no cards, but still a third shape beside the two indexes that had
 * just agreed on one. A block's page is a place, the thing that goes to a place is a link,
 * and the blurb lives where the reader asked for it. This also deletes the hand-rolled
 * `color: inherit` link reset the heading-link needed — a real `Link` says what it is while
 * nobody is pointing at it.
 */
export default function BlocksIndex() {
  return (
    <PageFrame width="48rem">
      <Stack gap="10">
        <PageTitle deck="A block is a few files you copy into your app and own from then on. It arranges components you already have, and every colour and distance in it still comes from the package — so you can change how a block behaves without changing how your app looks.">
          Blocks
        </PageTitle>
        <Stack gap="3" align="start">
          {BLOCKS.map((block) => (
            <KookieLink
              key={block.slug}
              size="3"
              render={<Link href={`/blocks/${block.slug}`} />}
            >
              {block.title}
            </KookieLink>
          ))}
        </Stack>
      </Stack>
    </PageFrame>
  );
}
