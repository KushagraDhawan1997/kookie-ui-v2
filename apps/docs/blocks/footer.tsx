/**
 * The site footer: a mark, columns of links, and the line at the bottom (2026-09-01).
 *
 * WHY THIS IS A BLOCK AND NOT A COMPONENT. A footer is a POSITION — the last region of a page
 * — and §3 is that a component never owns where it sits. Its substance is entirely the app's
 * (which links, which words, which mark), and §11 has no row for it. What is left for the
 * system to own is an arrangement and a piece of wiring, which is exactly what a copied file
 * carries safely: every colour, distance and step below resolves through the package, so the
 * center stays in the dependency and this file holds only the shape.
 *
 * IT IS DATA-DRIVEN, AND THAT IS THE DECISION. v1 shipped a footer as thirteen exports —
 * `Root`, `Main`, `Bottom`, `Brand`, `BrandName`, `Tagline`, `Links`, `LinkGroup`, `Nav`,
 * `Link`, `Legal`, `Social`, `SocialLink` — of which eleven were a `Flex` or a `Text` with
 * different defaults. That is layout wearing a part's name, and this repo has refused it twice
 * by name (`ComposerRow`'s grouping, 2026-08-23; `BreadcrumbSeparator`, 2026-09-01). A column
 * of links is a LIST, and a list is a prop: `groups` says what the footer says, and the file
 * you are reading says how it looks. Nothing is expressible through thirteen wrappers that is
 * not expressible by editing this one.
 *
 * WHAT IT ACTUALLY OWNS is the naming: each column is its own `<nav>` named by its own title
 * through `aria-labelledby`, so a screen reader announces "Support navigation" rather than
 * five unnamed navigation regions in a row. That is a spec rather than a taste, and a spec
 * copied by hand rots — the argument `Field` makes for owning its label wiring and `Tree`
 * makes for owning its keyboard.
 *
 * THE COLUMN TITLE IS NOT A HEADING, and the refusal is deliberate. A heading is a section of
 * the DOCUMENT, and a footer's column title is a label for a navigation region — putting it in
 * the outline makes page furniture compete with the page's own structure, which on a chapter
 * would put "Support" beside the chapter's real sections. The region is named, which is the
 * half that carries the meaning; `aria-labelledby` needs an id, not an `<h2>`.
 *
 * REFUSED, each for a reason the system already states:
 *
 *  - **Social icons.** §8 ships no icon set, so a written one would export an import the
 *    reader's app cannot resolve (the builder's own refusal). A "Follow us" group of links is
 *    the same information, and it is what the references do.
 *  - **A newsletter form.** It needs an endpoint, which is an app's, and a `Field` plus a
 *    `Button` is four lines in a file you own. Giving it a seat here would mean designing a
 *    position for something the system cannot fill.
 *  - **Payment marks and logos.** Images the app owns. `brand` takes a node for the same
 *    reason: the mark is yours.
 *  - **Axis props.** No `size`, no `tone`, no `emphasis`. A block is not a component with an
 *    API to grow — the steps are stated once, below, and if you want other steps you change
 *    them in your copy. That is the whole difference between this and the package.
 *
 * THE PANE IS A `Surface` — a ground, because a footer HOLDS things and is not one of them
 * (§10's own sentence). If your page wants a footer that is just a hairline and some text on
 * the page's own colour, delete the `Surface` and put a `<Separator/>` above the stack; both
 * arrangements exist in the wild and only one of them can be the default.
 */
import * as React from "react";
import { Flex, Separator, Stack, Surface, Text } from "@kookie-ui/react";

import "./footer.css";

export type FooterLink = {
  label: string;
  /** Where it goes. A string, so this file stays framework-free — wrap it in your router's
      own link component if you want client navigation, the way the docs do everywhere else. */
  href: string;
};

export type FooterGroup = {
  /** The column's title, and the name of the navigation region it labels. */
  title: string;
  links: readonly FooterLink[];
};

export type FooterProps = {
  /** The app's mark, sitting above the columns. A node, because §8 ships no icon set and a
      wordmark is the one thing on this page that is unarguably yours. */
  brand?: React.ReactNode;
  /** The columns. Each becomes a named navigation region. */
  groups: readonly FooterGroup[];
  /** The line at the bottom — a copyright, a company, a country. */
  note?: React.ReactNode;
  /** The links that sit opposite the note: privacy, terms, status. Separate from `groups`
      because they are not a subject a reader browses, they are the ones a reader is sent to
      look for, and a column of two would read as a category that ran out. */
  legal?: readonly FooterLink[];
};

export function Footer({ brand, groups, note, legal }: FooterProps) {
  /* One id per mounted footer, so two on one page (a preview beside the real one) cannot both
     claim the same name and leave every `aria-labelledby` pointing at the first. */
  const id = React.useId();

  return (
    /* The landmark is the `<footer>` element itself: it announces as `contentinfo` when it is
       a child of the body rather than of an article, which is where a page footer sits. No
       `role`, because stating the role the element already has is the aria rule this system
       follows everywhere else. */
    <Surface size="4" render={<footer />}>
      {/* 9 between the three regions against 3 inside a column and 2 between links — §15 asks
          a group and its siblings to differ by at least two steps, and this is the largest
          interval the block has because these are the largest things in it. */}
      <Stack gap="9">
        {brand ? <div>{brand}</div> : null}

        {/* THE COLUMNS ARE A CSS COLUMN LAYOUT, and `footer.css` carries why: a grid's row is
            as tall as its tallest item, so six groups of unequal length leave a hole nothing in
            grid can close. A plain `div` because there is no layout prop for this — `columns`
            on Box is `grid-template-columns`, which is the mechanism this had to leave. */}
        <div className="kb-footer-columns">
          {groups.map((group, index) => (
            <Stack
              key={group.title}
              gap="3"
              render={<nav aria-labelledby={`${id}-${index}`} />}
            >
              {/* Full ink at medium against muted links: the title is the one thing in the
                  column that is not a destination, and §15 puts that rank in the ink rather
                  than in a heavier face or a larger step. */}
              <Text size="2" weight="medium" id={`${id}-${index}`}>
                {group.title}
              </Text>
              <Stack gap="2" render={<ul className="kb-footer-list" />}>
                {group.links.map((link) => (
                  <li key={link.href}>
                    {/* `medium` IS the muted ink role — the resting rank stated through the
                        system rather than repainted in the block's own stylesheet. */}
                    <Text
                      size="2"
                      emphasis="medium"
                      render={<a className="kb-footer-link" href={link.href} />}
                    >
                      {link.label}
                    </Text>
                  </li>
                ))}
              </Stack>
            </Stack>
          ))}
        </div>

        {note || legal?.length ? (
          <Stack gap="6">
            {/* The hairline, and the reason it is here rather than at the top of the block: it
                separates the browsing half from the legal half, which is a relationship inside
                the footer. A rule ABOVE the footer would be the page saying where the footer
                begins, and where the footer begins is the page's business, not this file's. */}
            <Separator />
            <Flex justify="space-between" align="center" gap="4" wrap="wrap">
              {/* Quiet, the rung §15 minted for something deliberately stood down — a
                  copyright line is read once a year and never scanned. */}
              {note ? (
                <Text size="2" emphasis="quiet">
                  {note}
                </Text>
              ) : (
                /* Holds the end position when there is no note: one child and
                   `space-between` pushes it to the wrong wall. */
                <span />
              )}
              {legal?.length ? (
                <Flex gap="5" wrap="wrap" render={<nav aria-label="Legal" />}>
                  {legal.map((link) => (
                    <Text
                      key={link.href}
                      size="2"
                      emphasis="medium"
                      render={<a className="kb-footer-link" href={link.href} />}
                    >
                      {link.label}
                    </Text>
                  ))}
                </Flex>
              ) : null}
            </Flex>
          </Stack>
        ) : null}
      </Stack>
    </Surface>
  );
}
