import { Heading } from "@kookie-ui/react";

/**
 * The mark (2026-08-29).
 *
 * One capital in the display face, and it is a component because it is now in two places —
 * the sidebar's masthead and the front door's. Three facts travel together (the face, the
 * regular weight, the collapsed line box) and two of them are stated where a reader of the
 * markup sees them rather than in the stylesheet, so a second hand-written copy is a second
 * chance to say `bold` or forget the class. `prose.css` carries why each one is what it is.
 *
 * `weight="regular"` IS LOAD-BEARING, and leaving it off shipped a fake bold for an hour.
 * Heading rests at semibold, Chomsky has exactly one face at 400, and a request BOLDER than
 * anything in a family is the case a browser synthesizes — it strokes the outline. Measured on
 * a rendered glyph: 3,717 ink pixels at 600 against 2,806 at 400, a third heavier than the face
 * the designer drew. Stating the weight makes the request match the only face there is.
 *
 * ALWAYS `aria-hidden`. A lone "K" announced as text is noise in both placements: in the
 * sidebar the anchor around it carries `aria-label="KookieUI"`, and on the front door the
 * page's own title says the name in the next line. `render={<span/>}` for the same reason it
 * is a span in the chrome — this is a mark, not a heading, so it must not put an entry in the
 * document outline.
 */
export function Wordmark({ size = "8" }: { size?: "8" | "9" }) {
  return (
    <Heading
      size={size}
      weight="regular"
      className="kd-wordmark"
      render={<span aria-hidden="true" />}
    >
      K
    </Heading>
  );
}
