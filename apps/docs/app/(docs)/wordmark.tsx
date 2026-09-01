import { Heading } from "@kookie-ui/react";

/**
 * The mark (2026-08-29; the word, and the face under it, 2026-09-01).
 *
 * It is a component because it is in two places — the sidebar's masthead and the front door's
 * — and three facts travel together (the face, the regular weight, the collapsed line box).
 * Two of them are stated where a reader of the markup sees them rather than in the stylesheet,
 * so a second hand-written copy is not a second chance to say `bold` or forget the class.
 * `prose.css` carries why each one is what it is.
 *
 * IT SAYS THE NAME NOW, NOT A LETTER (2026-09-01, Kushagra: "use playground... and write
 * Kookie"). A single capital was the right mark for a BLACKLETTER: a drawn initial standing
 * for a name is what that kind of face has always been best at, and it is the shape the New
 * York Times masthead's own K comes from. A script is the opposite proposition — it is a face
 * for writing a name out — so keeping one letter of it would have been a monogram set in
 * handwriting, which is neither thing. The face and the word are one decision.
 *
 * THE STEPS DID NOT MOVE, and a claim that they had to was written here for an hour without
 * being measured. The reasoning sounded like arithmetic — a step is a HEIGHT, so six letters at
 * the height one letter had is several times the ink — and the conclusion drawn from it, that
 * size 8 put the word past the sidebar's own width, is simply false: measured, the word's ink
 * is 79px at step 8 and 108.9 at step 9, inside a 288px pane whose row has 240px of room. The
 * mark reads as a masthead at the steps the letter used, and it read as a caption at the ones
 * that arithmetic suggested (Kushagra: "way too small"). `size` still names the step, so both
 * call sites keep stating theirs.
 *
 * `weight="regular"` IS LOAD-BEARING, and leaving it off shipped a fake bold for an hour.
 * Heading rests at semibold, this face ships exactly one weight at 400, and a request BOLDER
 * than anything in a family is the case a browser synthesizes — it strokes the outline.
 * Measured on the face this replaced: 3,717 ink pixels at 600 against 2,806 at 400, a third
 * heavier than the face the designer drew. Stating the weight makes the request match the only
 * face there is.
 *
 * ALWAYS `aria-hidden`, and the word does not change that. It is a picture of the name rather
 * than a second copy of it: in the sidebar the anchor around it carries `aria-label="KookieUI"`
 * and on the front door the page's own title says the name in the next line, so announcing it
 * here would say the name twice in both placements. `render={<span/>}` for the same reason it
 * is a span in the chrome — this is a mark, not a heading, so it must not put an entry in the
 * document outline.
 */
/**
 * TWO FORMS OF ONE NAME (2026-09-01, Kushagra: "Footer should say Kookie User Interface in the
 * wordmark"). A masthead is glanced at and a footer is arrived at, so the short form is what
 * sits above the navigation all day and the long form is what signs the page off — which is the
 * arrangement every foundry and every newspaper uses, and the one the reference footer this
 * block was drawn against uses too.
 *
 * A CLOSED PROP RATHER THAN `children`, because a mark is not a text component: taking children
 * would let any call site set any words in this face, and then the brand is whatever somebody
 * typed. Two forms, both stated here, and this is the only file that knows either string.
 *
 * THE `©` IS ON THE LONG FORM ONLY (2026-09-01, Kushagra: "add a copyright symbol © after
 * Kookie"). It is part of the name as the name is SIGNED — which is the long form's whole job,
 * and why every foundry and newspaper carries its mark in the footer and not in the masthead
 * they look at all day. Putting it on the short form would have put it in the sidebar too,
 * which nobody asked for and which a glanced-at mark does not want.
 */
type Form = "short" | "full";

export function Wordmark({
  size = "8",
  form = "short",
}: {
  size?: "7" | "8" | "9";
  form?: Form;
}) {
  return (
    <Heading
      size={size}
      weight="regular"
      className="kd-wordmark"
      render={<span aria-hidden="true" />}
    >
      {form === "full" ? (
        <>
          {/* RAISED AND SMALL, the way a mark is set (2026-09-01). At full size the glyph is a
              circle the height of the capitals and the word reads "KookieO" — measured on
              screen, not guessed. Both values are in `em`, so the mark is a property of the
              letters it sits beside and follows the step without a second number: `prose.css`
              carries the rule beside the face it is set in. */}
          Kookie<span className="kd-wordmark-mark">©</span> User Interface
        </>
      ) : (
        "Kookie"
      )}
    </Heading>
  );
}
