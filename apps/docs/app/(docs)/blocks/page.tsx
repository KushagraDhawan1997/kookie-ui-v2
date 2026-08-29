import Link from "next/link";
import { Heading, Stack, Text } from "@kookie-ui/react";

import { PageFrame, PageTitle } from "../page-frame";
import { BLOCKS } from "../../../blocks";

export const metadata = { title: "Blocks — KookieUI" };

/**
 * The blocks index. One renderer over the registry, like every index on this site: adding a
 * block is adding a row and its files, never writing a page.
 *
 * The list is rows rather than cards, for the component index's own reason (2026-08-25): a
 * box around a name and a sentence is a box drawn for its own sake, and alignment already
 * groups a column of entries.
 */
export default function BlocksIndex() {
  return (
    <PageFrame width="48rem">
      <Stack gap="9">
        <PageTitle deck="A block is a few files you copy into your app and own from then on. It arranges components you already have, and every colour and distance in it still comes from the package — so you can change how a block behaves without changing how your app looks.">
          Blocks
        </PageTitle>
        <Stack gap="6">
          {BLOCKS.map((block) => (
            <Stack key={block.slug} gap="2">
              <Heading size="6" render={<h2 />}>
                <Link
                  href={`/blocks/${block.slug}`}
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {block.title}
                </Link>
              </Heading>
              <Text size="3" emphasis="medium" render={<p />}>
                {block.blurb}
              </Text>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </PageFrame>
  );
}
