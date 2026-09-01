/**
 * The system's own drawings, where more than one component draws the same thing.
 *
 * §8 ships no icon set — that is the app's, and `iconStroke`/`iconGrid` are public so an app's
 * glyphs can be drawn at the weight the package's are. What lives here is the handful the
 * package draws ITSELF, and only once a second component needs the same one: a path in two
 * files is one drawing with two homes, and the day somebody adjusts the tick's mitre they
 * adjust one of them.
 *
 * PATH DATA, NOT COMPONENTS. Each consumer wraps it differently — a checkbox's tick is a
 * `<path>` inside Base UI's Indicator carrying the tri-state's class and the draw-in dash, a
 * button's done glyph is its own `<svg>` in the leading slot — so a shared component would have
 * to grow a prop for every difference. The drawing is the fact they share; the wrapping is not.
 *
 * Every one is drawn on the 16 viewBox the package uses for its own glyphs, at `glyphStroke`,
 * which is `iconStroke` re-derived for that grid (2026-08-23: a stroke is stated in viewBox
 * units, so the painted weight is `stroke × box / viewBox`, and the ecosystem draws on 24).
 */

/** The tick. A checkbox's checked mark, and a Button's done state — the same glyph because it
    means the same thing, which is what makes one home the right number. Stroked rather than
    filled: a stroke scales across 16-28px without the mitre artefacts a filled tick shows at
    the small end, and `currentColor` inherits whatever pairing its bed chose. */
export const CHECK_PATH = "M4 8.5 6.75 11.25 12 5.75";

/** The grid every path here is drawn on. */
export const GLYPH_VIEWBOX = "0 0 16 16";

/** The dismissal ✕. A Notice's acknowledgement and an Attachment's remove — both mean "take
    this away", and both draw it at the same weight in the same box. It was written inline in
    `notice.tsx` while it had one consumer, which is this file's own rule (a path in two files
    is one drawing with two homes); Attachment is the second, so it lands here.

    Two strokes rather than a glyph font's single ✗, and round caps, because at 16px a mitred
    crossing thickens visibly at the centre where the two lines meet. */
export const DISMISS_PATH = "M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5";
