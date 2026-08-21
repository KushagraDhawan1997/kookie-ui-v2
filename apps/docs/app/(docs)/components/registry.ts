/**
 * The component reference, as DATA (ENGINEERING §1.1: the system is data, code is a small
 * interpreter). One entry per exported component; the page is a renderer over these entries,
 * so adding a component means adding a row rather than writing a page.
 *
 * The section that matters most here is `refusals`. What a component will not do is the
 * system's actual argument — margin, `variant`, a shadow prop, a size on a hairline — and it
 * is the part no generated API table can carry, because a missing prop looks the same as an
 * oversight until someone writes down which it is. Every refusal names its reason.
 *
 * A law (`registry.test.ts`) walks the package's exports against this file, so a component
 * cannot ship undocumented — the same shape as the playground law, for the same reason.
 */
export type Entry = {
  /** URL segment. */
  slug: string;
  /** The exported name, and the key the coverage law matches on. */
  name: string;
  /** Which family it belongs to — the §11 grouping. */
  family: "Layout" | "Control" | "Surface" | "Type" | "Indicator";
  /** DECISIONS.md sections this component implements. */
  spec: string;
  /** What it is, in two or three sentences. */
  blurb: string;
  /** The axes it exposes, with what each resolves to here. */
  axes: { name: string; values: string; note: string }[];
  /** What it refuses, and why. The system's argument. */
  refusals: { name: string; why: string }[];
  /** Parts of a compound component (§22): exports explained here rather than on stub pages
      of their own. The coverage law accepts either home, and holds part blurbs to a floor. */
  parts?: { part: string; blurb: string }[];
  /**
   * A live specimen lives in `examples/<slug>.tsx` — one real file, rendered here and shown
   * as source (2026-08-21). It is NOT a field: the file name IS the slug, so there is no
   * mapping to keep in step, and a law walks both directions. It moved out of this registry
   * because a specimen written inline is a specimen nobody can copy, and `tsc` never saw it.
   */
};

export const ENTRIES: Entry[] = [
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    family: "Surface",
    spec: "§10, §20, §25",
    blurb:
      "A modal question: title, description, and two actions that split the row equally — nothing else. Split from Dialog because the two are semantically different (a dialog is summoned to host your work; an alert comes at you and stops you), which is why it wears role=alertdialog, refuses outside-press dismissal, and carries the family's arrival entry as its own gesture. The content is fixed, and that closed anatomy is what licenses everything unusual here: the system lays out the parts itself, the width is a designed constant per size, and the entry may animate the content because the content is the system's own. The part vocabulary follows shadcn/ui's alert-dialog (MIT), adopted with credit; behavior is Base UI's AlertDialog end to end.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "prices EVERYTHING — box, corner, padding, the title's and description's type steps, and the two buttons — where Dialog's size stops at the box; legal because the content here is the system's own" },
      { name: "tone (Action)", values: "any family", note: "the one meaning an action carries beyond proceeding — destructive for the deletes this component mostly exists for" },
    ],
    refusals: [
      {
        name: "a width prop",
        why: "The width is the component's alone: a designed FIXED width per size (narrower than the dialog of the same index — an alert interrupts with a question, it does not host work). Closed content is what lets the box close; the window's gutter still wins on a phone.",
      },
      {
        name: "outside-press dismissal",
        why: "The role's own refusal, and Base UI's: an alert that could be dismissed by clicking elsewhere is a dialog wearing the wrong role. Escape still closes — a keyboard user answering 'not now' is the Cancel action by another route.",
      },
      {
        name: "Header and Footer",
        why: "The component owns the layout, so they have no job: Content arranges title, description and the action row itself, and the caller never writes a Stack. Cancel first in the DOM is what places it at the start AND hands it initial focus — the least destructive action, answered by document order rather than machinery.",
      },
      {
        name: "render on Cancel and Action",
        why: "The alert owns its actions' size and their 50/50 row, and an escape would hand both back. They are real Kookie Buttons the component prices: Cancel medium (the rung moved four times in one day — the near-solid dark reading that argued against it turned out to be the lab glass veil's compositing, not the rung's; on a plain pane bare quiet was an absence), Action loud — loud as a DEFAULT is legal here and nowhere else, because an alert has exactly one Action, so the one-focal-point rule holds by anatomy instead of self-policing.",
      },
      {
        name: "arbitrary children",
        why: "If it needs any control beyond its two buttons — a type-to-confirm field, a checkbox — it is a Dialog. An alert's only task is choosing.",
      },
    ],
    parts: [
        { part: "AlertDialogTrigger", blurb: "The button that opens it — usually render={<Button/>}; an alert driven by app state needs no trigger at all" },
        { part: "AlertDialogContent", blurb: "The whole fold: portals, re-applies the theme (§20), paints the scrim, centres the panel — and owns the layout, a two-column grid the parts drop into" },
        { part: "AlertDialogTitle", blurb: "The accessible name, a real heading priced by the alert's own index — the question, phrased as one" },
        { part: "AlertDialogDescription", blurb: "What proceeding means, in the muted ink — the consequence said quietly, wired as the panel's accessible description" },
        { part: "AlertDialogCancel", blurb: "The safe way out: a quiet bordered Button the component sizes, first in reading order, first to take focus" },
        { part: "AlertDialogAction", blurb: "The committing choice: a loud Button carrying the caller's handler and optional tone; it closes, because the alert's job ends when a choice is made" },
    ],
  },
  {
    slug: "blockquote",
    name: "Blockquote",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "Body copy set apart by a rule and an indent. Everything about how it reads comes from the shared type layer; what it adds is the quiet hairline down its leading edge and the indent that keeps the words off it.",
    axes: [
      { name: "size", values: "1–9", note: "anchors at 3 — a quote is a block, so it states its own step" },
      { name: "weight", values: "regular | medium | semibold", note: "token names, never numbers" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the foreground roles; rests loud" },
      { name: "tone", values: "any family", note: "re-scopes the ink trio — and only the ink" },
    ],
    refusals: [
      {
        name: "a tinted rule",
        why: "A chosen tone moves the words, not the bar. §7's edge order puts a quote's rule where a separator's sits — under both solved tiers, carrying no identity. A quote whose bar must carry meaning is an Aside if an author wrote it, or a Notice if it is a live condition (§29).",
      },
      {
        name: "an attribution slot",
        why: "The footer under a quote is a sibling <Text>. Anatomy is system-owned only where something non-visual forces it, and nothing here does.",
      },
    ],
  },
  {
    slug: "box",
    name: "Box",
    family: "Layout",
    spec: "§2, §3",
    blurb:
      "The layout engine every other primitive is typed sugar over. It accepts the full curated prop set — spacing, sizing, display, container props — each resolving through tokens, each responsive via container tiers rather than utility classes.",
    axes: [
      { name: "p / m / px / py …", values: "layout space steps", note: "the density-aware layer, never the raw palette" },
      {
        name: "m / mx / mt … = \"bleed\"",
        values: "the one named value on the space scale",
        note: "cancels the enclosing surface's padding, so this box reaches the pane's edge — a picture across the top of a card is `mt=\"bleed\" mx=\"bleed\"` (§3, 2026-08-20). Margins only: padding and gap reject a negative length. It reads the NEAREST surface, and outside one it computes a real zero rather than a pull",
      },
      { name: "any prop", values: "value | { initial, sm, md, lg }", note: "container-query tiers, compiled to variable remaps" },
      {
        name: "container",
        values: "boolean",
        note: "makes THIS Box the region responsive values inside it measure; absent, they measure the nearest marked ancestor, ultimately the Theme root",
      },
      {
        name: "backdrop",
        values: "boolean",
        note: "marks a REGION where content passes behind the components inside it (§10, 2026-08-17) — every material-expressing component within resolves the theme's material; placement is a fact about the place, stated once, and backdrop={false} re-marks a sub-region as calm",
      },
    ],
    refusals: [
      {
        name: "utility classes",
        why: "Values ride inline custom properties into fixed arbitration rules, so tokens and raw strings cost the same and the stylesheet never grows with the value set.",
      },
      {
        name: "a `bleed` prop",
        why: "It is a VALUE on the margin rows, not a prop of its own — which is the whole economy of it. Every per-side and per-tier spelling already exists there, so `bleed`/`bleedX`/`bleedTop` would have meant seven new rows, twenty-eight property registrations, and a second mechanism writing `margin` for the existing var chain to arbitrate against.",
      },
      {
        name: "containment by default",
        why: "It shipped that way and was the recorded zero-width defect: a measurable box can never size itself around its contents (the no-loop rule container queries are built on), so every Box in a flex row collapsed to nothing. A plain Box hugs like a div; `container` opts in, and belongs on things layout already sizes — a sidebar with a width, a growing column, a grid cell. A container Box left to shrink-wrap renders 0px wide, and dev builds warn when it happens.",
      },
    ],
  },
  {
    slug: "button",
    name: "Button",
    family: "Control",
    spec: "§4, §8, §9",
    blurb:
      "The control layer's first citizen, and the component the shared skeleton was written for. Loudness is the only ranking axis; appearance is always the resolved output of tone × emphasis × bordered, over whatever material the Theme says the app is built of, never set directly.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "an index into the height ladder, not a measurement" },
      { name: "tone", values: "any family", note: "picks the hue; accent resolves through the Theme" },
      { name: "emphasis", values: "loud | medium | quiet", note: "three rungs, because a rung must earn a visible step" },
      { name: "bordered", values: "boolean", note: "containment, and honestly half a rung: medium+bordered reads louder than medium" },
      { name: "backdrop", values: "boolean", note: "placement, not material (§10, 2026-08-17): content passes behind this, so the theme's glass may express; unset it reads the ambient <Box backdrop> region" },
      { name: "leading / trailing", values: "ReactNode", note: "an icon, or a whole hosted control" },
    ],
    refusals: [
      { name: "margin", why: "Components never own outer spacing. The escape is <Box m>." },
      {
        name: "variant",
        why: "It fuses loudness with meaning, so it cannot express a quiet destructive action. tone and emphasis are separate axes for exactly that reason.",
      },
      {
        name: "a shadow prop",
        why: "Elevation is deleted. Depth is an app identity, set once by Theme depth, never chosen per call site.",
      },
    ],
  },
  {
    slug: "surface",
    name: "Surface",
    family: "Surface",
    spec: "§10",
    blurb:
      "A ground — what an object sits ON, and the pair that completes the family: a Card is an object, a Surface is a ground. An object seals, catches light and casts; a ground does none of those. Two shapes, one statement: a bounded region of a page that holds cards, and a bed inside a card that holds something quieter — a code block, a settings group. Before it, every one of those was a hand-painted div picking a raw neutral, a radius and a hairline at the call site, which is how the builder's own canvas came to wear a SMALLER corner than the cards inside it. Its ground is an absolute pair rather than a relative step, and that was measured: dark's alpha ramp is built from white, so a ground that stepped down from its parent would land ABOVE the seal and the cards would be darker than the ground holding them. In dark it is the page's own colour, and the hairline is the only thing bounding it — which is why the edge is part of the component and not a choice.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "padding and corner from the CONTAINER band, one step up from a card's — a container must out-round what it holds" },
    ],
    refusals: [
      {
        name: "a fill or an edge prop",
        why: "The ground and the hairline ARE the component. With a fill/edge vocabulary the first thing anyone reaches for is a seal plus a hairline, which is the outlined card deleted on 2026-08-19, reachable again from every call site. The failure a system cannot recover from is not somebody building something DIFFERENT — it is somebody building the same thing a second way, which then drifts out of reach of a fix. A ground cannot pass for a card, so it cannot start that.",
      },
      {
        name: "a border toggle, on Button's `bordered` precedent",
        why: "There the border RANKS: quiet, quiet-with-a-border and medium say three different things about how loud the action is. Two grounds, one lined and one not, would say exactly the same thing — the test an axis has to pass, and the one `surfaceLook` failed the day before this shipped. The line is also load-bearing in dark, where the ground and the page are the same colour.",
      },
      {
        name: "material and backdrop",
        why: "Glass defends a pane against something passing BEHIND it, and a ground's backdrop is its own parent, which is not a backdrop. Inside a glass card it participates in the scope already there and opens none of its own — a Surface leaves a card's material scope exactly as it found it.",
      },
      {
        name: "tone, emphasis, a shadow",
        why: "Card's refusals, unchanged: a container ranks nothing, and a hole in a plane throws no shadow.",
      },
    ],
  },
  {
    slug: "card",
    name: "Card",
    family: "Surface",
    spec: "§9, §10",
    blurb:
      "A shell, deliberately: one fixed treatment — an opaque seal, BORDERLESS at standard contrast since 2026-08-17 (the lab's pane: the edge is light — cast and seat-line pool on solid, the ring on glass — never a pigment hairline; contrast='high' restores the tone system's edge) — with size and the `backdrop` placement fact as its only props, and no stylesheet of its own. It was stripped back to this on the finding that a card with tone, emphasis and anatomy slots was a layout pretending to be a component. Rendered as a button or a link it becomes interactive, and since 2026-08-17 it MOVES like one: the control layer's two clocks, its lively recovery and stiff press, its ring landing, and the same one-pixel rise to meet the pointer. Only the press distances are the surface's own — a card sinks 1px and shrinks to 0.995, because scale is relative and a button's 0.975 would move a wide card's edge five pixels and read as the page flexing.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "padding and corner, not height" },
      { name: "backdrop", values: "boolean", note: "a PLACEMENT fact (§10, 2026-08-17): content passes behind this, so the theme's material may express — unset it reads the ambient <Box backdrop> region; it can never choose a thickness" },
    ],
    refusals: [
      {
        name: "a material prop",
        why: "Material moved to the Theme on 2026-08-16: it answers what the APP is built of, which is one value for a whole scope rather than a per-card choice. There is no rung to walk and no ceiling at `thick`, and what makes one pane read heavier than another is coverage and its scrim, not a second thickness. A subtree that must differ says so with a nested Theme; and since 2026-08-17 EXPRESSION is placement-gated — a component renders the theme's glass only where a backdrop exists (`<Box backdrop>` marks the region; Card, Button, TextField, TextArea and SelectTrigger take the same prop as a one-off; popups pass it by construction), so `thin` no longer makes every in-flow control pay a filter. Nesting itself is handled — a pane inside a glass pane resolves `on-glass` (the veil's alpha, no second blur), and a pane on a solid pane resolves solid.",
      },
      {
        name: "tone, emphasis, bordered",
        why: "A card ranks nothing against its siblings. Its edge is light, not a rung — and since 2026-08-17 not a hairline either.",
      },
      {
        name: "a media / cover slot",
        why: "The corner is a shape, so a pane clips what it holds (2026-08-20), and a child states that it reaches the edge with `<Box mt=\"bleed\" mx=\"bleed\">`. That is the layout every peer solved with a part of its own — Mantine's Card.Section, MUI's CardMedia, Ant's cover — and it needs no anatomy here: the picture is a child that cancels the padding, not a region the card has to know about. An element that must hang OFF the corner escapes with `style={{ overflow: \"visible\" }}`.",
      },
      {
        name: "header / footer slots",
        why: "Anatomy is system-owned only where something non-visual forces it — Dialog's focus wiring, Notice's status role. A card's regions are a layout, and layouts are blocks.",
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    family: "Control",
    spec: "§4, §6, §11",
    blurb:
      "The first control that is its own mark. Its box is one line of its label's type, so it aligns with the text beside it by construction and grows on a phone with nothing designed twice — and its hit area extends to a control of its size, painted or not.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "an index into the mark ladder, which is the line-height ladder" }],
    refusals: [
      {
        name: "tone and emphasis",
        why: "Neutral off, accent on is an identity, not an axis — the family has one meaning and one way to show it.",
      },
      {
        name: "children",
        why: "A mark sits beside its label, so the label is a sibling and the row owns the space between them.",
      },
      {
        name: "readOnly",
        why: "The platform does not define it for checkboxes, and every library that accepts it draws it identically to a live control. A state with no appearance is worse than no state.",
      },
    ],
  },
  {
    slug: "code",
    name: "Code",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "Inline code: the type system's mono family slot wearing a subtle fill. Its size is optional and unset means the line it sits in, so a literal inside small text stays small without the call site repeating the index.",
    axes: [
      { name: "size", values: "1–9, optional", note: "unset inherits the surrounding line — the atom's own rule" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the ink's axis, not the fill's" },
      { name: "tone", values: "any family", note: "moves both the ink and the fill" },
    ],
    refusals: [
      {
        name: "a fill that climbs the ladder",
        why: "Emphasis resolves for type as foreground roles. A chip whose fill also climbed would be reading one axis two ways in one element.",
      },
      {
        name: "block code",
        why: "A code block owns overflow, wrapping and a scroll container. It is a different component, not a mode of this one.",
      },
    ],
  },
  {
    slug: "dialog",
    name: "Dialog",
    family: "Surface",
    spec: "§10, §20, §24",
    blurb:
      "A modal panel over a dimmed app: the floating family's third member and the first one anchored to nothing. The panel is a Card that covers — the same seal, edge, look and material, with the corner coming from the overlay band, one step rounder than the card of its size — and it casts no shadow of its own, because its separation is the SCRIM behind it rather than a lift above the page. The part vocabulary follows shadcn/ui's dialog (MIT), adopted with credit; behavior is Base UI's Dialog end to end, focus trap and scroll lock included.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "prices the BOX — a maximum width, the padding and the corner — and never the type inside it; the window wins when there is less room than the size asks for" },
    ],
    refusals: [
      {
        name: "Header and Footer",
        why: "Layout, not anatomy — Card's own cut. A title, a description and an action row are a Stack the call site writes, and blessing one arrangement deprecates every other. Title and Description ARE parts here, because something non-visual forces them: they carry the panel's accessible name and description.",
      },
      {
        name: "a height, and a way to keep a long panel inside the window",
        why: "The extent is the call site's, the same class of value as a card's: state a height (or a max-height) on DialogContent and a ScrollArea inside it becomes the thing that scrolls, with the title and the action row staying put. State nothing and the panel grows and the dialog's own viewport scrolls it, so a long form is still reachable. Whether a panel holding a scroller should cap itself at the window without being asked is recorded open.",
      },
      {
        name: "a system-drawn ✕",
        why: "The same positioned slot, refused for the same reason. Escape and an outside press both dismiss, and DialogClose puts a real Button wherever the composition wants one — which is also what a touch screen-reader user needs to escape a trapped panel.",
      },
      {
        name: "modal, disablePointerDismissal",
        why: "Designed defaults. An open dialog IS the interaction — focus trapped, page scroll locked, the scrim saying so. A panel that leaves the page live is a Popover or a Sheet, and a dialog that must not be dismissed by pressing outside is an alert: a decision, not a flag.",
      },
      {
        name: "a shadow, and the floating chrome",
        why: "Menu and Select cast because a floating pane must state the coverage nobody else announced. A dialog's coverage is announced by the whole viewport going dark, so a second mechanism would be saying it twice. In an elevated app the panel is lifted exactly as much as a Card is — the app's identity, not the component's.",
      },
      {
        name: "a size on the title",
        why: "No surface in this system sizes the type inside it. The parts state §15's composition steps — the card-title step for the title, body copy in the muted ink for the description — so a dialog and a confirm card are the same typography by construction. Whether a size-1 dialog deserves a smaller title is open.",
      },
    ],
    parts: [
        { part: "DialogTrigger", blurb: "The button that opens it — usually render={<Button/>}, and the one node a dialog may own in ordinary flow; a dialog driven by app state needs no trigger at all" },
        { part: "DialogContent", blurb: "The whole fold: portals, re-applies the theme (§20), paints the scrim, and centres the panel in a viewport that scrolls when the panel is taller than the window. Takes the ordinary props of the element it renders — id, aria-label, data attributes, handlers — spread before the system's own identity, so a call site can name the panel but cannot take its size index" },
        { part: "DialogTitle", blurb: "The panel's accessible name, wired by aria-labelledby — a real heading element, dressed by the type layer at the composition brief's card-title step" },
        { part: "DialogDescription", blurb: "The supporting line, wired by aria-describedby — body copy in the muted ink, which is what 'said quietly' means since the ladder was solved" },
        { part: "DialogClose", blurb: "A dismissing button the call site places: there is no corner glyph, so the one action zone stays where the composition put it" },
    ],
  },
  {
    slug: "field",
    name: "Field",
    family: "Control",
    spec: "§28",
    blurb:
      "The unit that makes one input make sense. A control on its own is a box: it does not carry its own name, it cannot say what it is for, and it cannot say what went wrong. Field supplies a label, a description and an error, and wires all three to the control so a screen reader reads them as one thing. It passes the anatomy criterion by the widest margin in the library — three non-visual forcers stack (label association by id, aria-describedby, the announced error), so no part of the arrangement is a visual preference. What it draws is a column and a gap; the parts are Text at roles the type system already designed. Behavior is Base UI's Field end to end.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "prices the WHOLE unit — the label, the description, the error and the control inside it. It reaches the control by context and an explicit prop on the control always wins, so a field is stated once and a control is never re-sized behind a number somebody typed. The label's step is the control's own by derivation, because the control size join is itself the identity map" },
    ],
    refusals: [
      {
        name: "FieldControl",
        why: "Base UI's is a generic <input> for callers who have no other input. Every Kookie control already IS a Base UI input and reads Field's context by itself — the id, the label target, the description target and data-invalid all arrive without being passed — so a control dropped inside a Field wires itself. Re-exporting one would be a second spelling of the control already standing there. Progress.Track and the Tabs indicator were left unexported for the same reason: structure, not API.",
      },
      {
        name: "orientation",
        why: "A horizontal field is not a direction flip. The label has to align to the control's first line and the error has to sit under the CONTROL rather than under the label, which makes it a designed grid with its own rules — Slider's own argument for refusing a vertical axis. It ships as its own designed set the day something forces it, and render on the root is open in the meantime.",
      },
      {
        name: "a choice about where the error goes",
        why: "The description sits above the control and the error below it, always: instruction before the act, diagnosis after, which is the rule the whole message family is built on. GOV.UK puts both above, on the argument that at high zoom the focused input is on screen and anything under it may not be; that was weighed and overruled on consistency, and the cost is recorded in §28 rather than buried. A prop here would make the order a per-call-site opinion, which is what a system exists to prevent.",
      },
      {
        name: "an error that replaces the description",
        why: "Both show. The description says what to enter and the error says what went wrong, and removing the instruction at the exact moment somebody failed to follow it is the wrong trade.",
      },
      {
        name: "Form",
        why: "Deferred, not refused. Base UI's Form distributes a server error map to fields by name and moves focus to the first invalid one — non-visual behaviour, the same forcer that licenses this anatomy. It is purely additive and changes nothing here, so it ships when something real has server errors to distribute.",
      },
    ],
    parts: [
      { part: "FieldLabel", blurb: "The field's name — a real <label> associated by id, so clicking it lands the caret. Medium weight and the plain foreground role: a label leads the group it names, and this system carries that with weight and ink rather than with a louder size" },
      { part: "FieldDescription", blurb: "What to enter, before you enter it. The muted role, wired into aria-describedby wherever it sits, so its position above the control is a reading decision rather than a wiring one" },
      { part: "FieldError", blurb: "What went wrong, after it went wrong. The destructive family's ink, rendered only while the field is invalid and carrying the live region — which is the non-visual forcer that makes it a part rather than a Text a caller writes. Base UI's match keys one message to one ValidityState reason; with no children it prints the browser's own" },
    ],
  },
  {
    slug: "flex",
    name: "Flex",
    family: "Layout",
    spec: "§3",
    blurb:
      "Box with display: flex preset and the flex props narrowed. It ships no CSS of its own — the named primitives are where the library adds enforcement over raw CSS, not decoration on top of it.",
    axes: [
      { name: "direction / align / justify / wrap", values: "the flex vocabulary", note: "responsive like every curated prop" },
      { name: "gap", values: "layout space steps", note: "the distance between things, always through the density-aware layer" },
    ],
    refusals: [{ name: "margin on children", why: "Distance between siblings is the container's gap, so it is stated once and cannot drift." }],
  },
  {
    slug: "grid",
    name: "Grid",
    family: "Layout",
    spec: "§3",
    blurb: "Box with display: grid preset and the grid props narrowed. Same mechanism as Flex, same zero additional CSS.",
    axes: [
      { name: "columns / rows", values: "track lists", note: "raw track strings ride the same pipe as tokens" },
      {
        name: "gap / gapX / gapY",
        values: "layout space steps",
        note: "the density-aware layer, not the raw palette. A comfortable theme widens the grid and a compact theme narrows it, and no call site changes. The two axes are separate because a grid is the one layout where row spacing and column spacing answer different questions",
      },
    ],
    refusals: [{ name: "auto-placement helpers", why: "A prop earns existence only if it adds token resolution, tiers or constraint. Everything else is style." }],
  },
  {
    slug: "heading",
    name: "Heading",
    family: "Type",
    spec: "§15",
    blurb:
      "The heading family slot on the same nine-step ramp Text uses. Visual size and outline level are independent axes on purpose: size prices the type, render names the document structure.",
    axes: [
      { name: "size", values: "1–9", note: "defaults to 6 — the level a section actually reaches for" },
      { name: "weight", values: "regular | medium | semibold", note: "defaults to semibold — 700 is refused (§15)" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the foreground roles, not fills. Use it for a muted section label. It rests loud, because a heading must stay readable" },
      { name: "tone", values: "any family", note: "moves the three ink roles onto that family. It changes the ink only, because a heading has no fill" },
    ],
    refusals: [
      {
        name: "a level prop",
        why: "An h1 is a document fact, not a visual one. render={<h1/>} says it where a reader can see the two decisions are separate.",
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "A key cap: Code's fill and tone facts in the BODY family and a centered, floored cap box — a key names a key, it does not quote code, and the sans draws ⌘ full-size where a mono cell draws it compact. The hairline is the tone-aware border rather than one of the solved edge tiers — those were solved for controls whose identity rests on the edge, and a cap has a fill to carry it.",
    axes: [
      { name: "size", values: "1–9, optional", note: "when unset, it takes the size of the line it sits in, like Code. A cap with a fixed size would raise a size-1 caption to 16px" },
      { name: "emphasis", values: "loud | medium | quiet", note: "the type resolution. It changes the ink role, not the cap fill. A quiet chord shows quieter letters on the same key" },
      { name: "tone", values: "any family", note: "moves the ink and the fill; the edge is the cap's own achromatic relief line since 2026-08-17, tone-blind so it reads the same on any bed" },
    ],
    refusals: [
      {
        name: "a world-switched shadow",
        why: "The cap carries RELIEF always — flat world included — a top-face catch and a whisper of drop (`--kbd-relief`, its own cap-scale value since 2026-08-17: the lit button chrome it used to read made a bare cap read as a small floating button), because a key cap is a picture of a raised physical object; a glass pane stands even that down (relief in the pane, not a sticker on it). What stays refused is the cast moving with Theme depth.",
      },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    family: "Surface",
    spec: "§20, §21, §22",
    blurb:
      "A floating list of actions: the first portalled component and the row family's first member. The popup is a Card that floats — same seal, same edge, and a CONCENTRIC corner: its rows' own corner plus its padding, derived per size and radius level (two fixed corners were tried and rejected by eye first) — and it casts in BOTH depth worlds, because a shadow under a floating pane is information about overlap, not the expression the app switch governs. The part vocabulary follows shadcn/ui's dropdown-menu (MIT), adopted with credit; behavior is Base UI's menu end to end.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "on the root, like Button — a size-4 trigger must not open a size-2 dropdown; rows take the control cells' padding and type, and their HEIGHT from the text line plus a designed inset, a notch under the button ladder" },
      { name: "tone (Item)", values: "destructive", note: "a union of one — the single meaning a row may carry; not a palette, and widening it is a decision, never a default" },
      { name: "side / align / sideOffset (Content)", values: "designed defaults", note: "bottom / start / 4 — the only positioning vocabulary that is public" },
    ],
    refusals: [
      {
        name: "emphasis on rows",
        why: "A menu is a list of peers: emphasis ranks actions, and ranking rows inside a dropdown names nothing — the TextField sentence one family over. Quiet is the family's fixed identity, stamped, not chosen.",
      },
      {
        name: "Shortcut",
        why: "A keyboard hint is the row's trailing slot holding a <Kbd> — both already exist, and a part that renames existing vocabulary earns no row.",
      },
      {
        name: "MenuSeparator",
        why: "Base UI's menu separator is a re-export of the standalone one; ours would be too. Use <Separator> — the menu's stylesheet spaces it inside the popup.",
      },
      {
        name: "inset",
        why: "Icon-less rows aligning with icon'd neighbours is geometry's job, not a per-row prop the caller must remember: checkable rows keep their indicator mounted so the gutter reserves. Recorded open for plain items.",
      },
      {
        name: "modal / openOnHover",
        why: "Designed defaults, not call-site choices. An open menu IS modal — Base UI's default, and Radix's under shadcn/ui, whose vocabulary this component adopts: a transparent full-viewport press-catcher is what makes light-dismiss work, and locking page scroll keeps the panel attached to the anchor it is positioned against. There is no visible scrim. Rows open on click, never on hover.",
      },
      {
        name: "Arrow, Backdrop, Viewport, LinkItem, collision knobs",
        why: "Menus don't point; light-dismiss needs no scrim; long menus scroll inside a system-owned ScrollArea viewport (the panel itself never scrolls — it keeps the glass, corner and cast); navigation rows arrive with Sidebar; collision handling is a designed default.",
      },
    ],
    parts: [
        { part: "MenuTrigger", blurb: "The button that opens the menu — usually render={<Button/>}, so the trigger IS a Kookie Button; what the render target roots in decides the a11y contract, inferred through the escape rather than assumed" },
        { part: "MenuContent", blurb: "The floating panel: portals, positions, re-applies the theme (§20) and wears the surface identity" },
        { part: "MenuItem", blurb: "One action row — the row family's member: control cells, quiet identity, highlight not hover" },
        { part: "MenuGroup", blurb: "Groups rows so a label can name them; wires the group's accessible name automatically" },
        { part: "MenuLabel", blurb: "A heading for rows: the row skeleton for alignment, with the control-ness stood down — legal inside a group, where it names it, and legal on its own" },
        { part: "MenuCheckboxItem", blurb: "A toggleable row — the family's selected state: the tick wears the accent solid while the label stays neutral, and the indicator stays mounted so the gutter holds" },
        { part: "MenuRadioGroup", blurb: "Holds one chosen value among its radio rows; the value API is Base UI's, unchanged" },
        { part: "MenuRadioItem", blurb: "One choice in a radio group, marked by the mounted dot indicator when chosen" },
        { part: "MenuSub", blurb: "A nested menu's root: state and wiring only, no element of its own, like the root" },
        { part: "MenuSubTrigger", blurb: "The row that opens a child menu; stays lit while it is open, chevron is its own statement" },
        { part: "MenuSubContent", blurb: "The child panel: opens outward, first row aligned with its trigger — geometry is the system's" },
    ],
  },
  {
    slug: "select",
    name: "Select",
    family: "Surface",
    spec: "§20, §21, §23",
    blurb:
      "A form control that holds a choice — the floating family's second member, and the proof the first one generalised: the fold, the row family, the concentric corner and the floating chrome all arrive from Menu's mechanisms with nothing re-designed. What is new is the TRIGGER, a field-shaped button: it wears the field identity, so a Select beside a TextField reads as one family — same seal, same edge, same height — while staying a real button with a combobox's accessibility contract. Base UI renders the hidden input, so a Select submits with a form like the native element it replaces. Part vocabulary follows shadcn/ui's select (MIT), adopted with credit.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "on the root, like Button and Menu — the trigger and its option rows price from one index" },
      { name: "items", values: "Record<value, label>", note: "value → label for the CLOSED trigger: Base UI resolves labels from mounted options, and a panel that never opened has none — pass it whenever a defaultValue can paint first" },
      { name: "backdrop", values: "boolean", note: "placement, not material (§10, 2026-08-17): content passes behind the TRIGGER, so the theme's glass may express; unset it reads the ambient <Box backdrop> region" },
    ],
    refusals: [
      {
        name: "readOnly",
        why: "Researched, not undesigned: HTML states `readonly` does not apply to `<select>`, so there is no native appearance to inherit and no expectation to meet. It shipped accepted for a day — Base UI refused to open while this system drew nothing at all, byte-identical to a live trigger including the hand cursor, while assistive technology was correctly told it was read-only. A value that must submit but cannot change is a disabled trigger beside a hidden input, or the value rendered as Text.",
      },
      {
        name: "a Separator inside the panel",
        why: "The panel IS the listbox, and a listbox may contain only options and groups — a separator in it is markup an accessibility scan reports as a violation, from library markup a consumer cannot fix. Radix and shadcn keep theirs by making it aria-hidden; Separator already refused `decorative` on the stance that a rule hiding from assistive technology is a styled Box, so the same rule cannot return through this door. Groups divide options in the accessibility tree as well as on screen.",
      },
      {
        name: "emphasis / tone on the trigger",
        why: "A form control does not rank and does not editorialize — the TextField sentence: loudness orders actions, and a form where one field shouts is a form pointing at itself.",
      },
      {
        name: "SelectValue as a part",
        why: "A part whose only job is to stand where the value goes earns a prop, not an element — the trigger renders the value itself and takes `placeholder`.",
      },
      {
        name: "render / children on the trigger",
        why: "The value IS the trigger's content, and a re-rooted trigger would re-open the accessibility question Base UI already answers with a real button wearing role=combobox.",
      },
      {
        name: "the scroll arrows",
        why: "The panel is placed item-aligned — the chosen row sits on the trigger, macOS-style — and it still flies out of that trigger the way a menu does. The scroll ARROWS that Base UI pairs with that placement are refused: they are a mouse-only affordance for a list taller than its panel, the panel scrolls by wheel, trackpad and keyboard without them, and an arrow is a control this system has not designed. The panel also hangs a little to the LEFT of the trigger, which is the placement working rather than a bug: item-aligned lines the chosen option's text up with the trigger's value text, and the rows reserve a gutter for the tick that the trigger has no equivalent of.",
      },
      {
        name: "multiple",
        why: "A multi-select is a different control wearing the same name — different value display, different indicator language, different form semantics. Widening is a decision, never a default.",
      },
    ],
    parts: [
        { part: "SelectTrigger", blurb: "The field-shaped button reporting the choice: seal, edge and height from the field family, chevron as its own muted statement" },
        { part: "SelectContent", blurb: "The floating panel: portals, positions, re-applies the theme (§20) and wears the surface identity, always floored at its trigger's width" },
        { part: "SelectItem", blurb: "One option row — the row family's member; its mounted indicator reserves the gutter and wears the accent solid when chosen" },
        { part: "SelectGroup", blurb: "Groups option rows so a label can name them; wires the group's accessible name automatically" },
        { part: "SelectLabel", blurb: "A heading for option rows: the row skeleton gives it the same inset every row has, with the control-ness stood down — legal in a group and on its own. It sits OUT-dented from the option text below it by the width of the tick's reserved gutter, which is macOS's own posture and deliberate" },
    ],
  },
  {
    slug: "progress",
    name: "Progress",
    family: "Indicator",
    spec: "§11, §19",
    blurb:
      "A rail with no grip: a neutral well and an accent level. It sits outside the look axis for the instrument rule — the axis dresses things whose resting state is a surface, and a bar has none — and it grows no hit area, because nothing hits it.",
    axes: [
      { name: "value", values: "number | null", note: "null is indeterminate, and sweeps" },
      { name: "min / max", values: "number", note: "0 and 100 by default. The bar reports a fraction, so any pair of numbers works. The component shows no number. Put a formatted value in a sibling Text" },
    ],
    refusals: [
      {
        name: "size",
        why: "The slider's track ladder holds a fraction of the mark, and a bar has no mark — riding it would size the bar against a box it does not have. One designed thickness instead. Whether a bar earns the index is recorded open.",
      },
      {
        name: "tone",
        why: "Left closed rather than decided: a failed upload in destructive is real vocabulary, but adding an axis the day the component ships is assignment, not derivation.",
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    family: "Control",
    spec: "§4, §6, §11",
    blurb:
      "The checkbox's shape sibling, and the third member that promoted the mark family into the shared layer. Its circle is role semantics: a square radio reads as a checkbox, so the radius axis never reaches it — one of only four corners in the system that no theme can square.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "the mark ladder, shared with Checkbox and the slider thumb" }],
    refusals: [
      { name: "tone and emphasis", why: "Inherited from Checkbox: neutral off, accent on is an identity." },
      { name: "readOnly", why: "Inherited from Checkbox — the platform does not define it." },
    ],
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    family: "Control",
    spec: "§11",
    blurb:
      "Base UI's roving-focus group wrapped with zero CSS. It exists for the keyboard and the form value, not for a look — render is open so the group can BE a Stack.",
    axes: [{ name: "value / defaultValue", values: "string", note: "the group owns the selection" }],
    refusals: [{ name: "any visual prop", why: "The group is wiring. What it looks like is the layout you render it as." }],
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    family: "Surface",
    spec: "§10",
    blurb:
      "Custom scrollbars over native scrolling: the platform keeps the physics, the system draws the bar — an overlay capsule thumb on the alpha ramp, visible only while scrolling or hovering, with no drawn track and no gutter. One export; the viewport, bars and corner are assembly, not API. The one behavioral prop is focusable: a standalone region keeps its keyboard tab stop, and a host widget that owns keyboard scrolling (Menu) passes false so the presentation wrappers stay structural.",
    axes: [],
    refusals: [
      { name: "size", why: "One designed thickness — a scrollbar has no box of its own to index (Progress's sentence)." },
      { name: "tone / emphasis", why: "An instrument: it ranks nothing and means nothing, it shows where you are." },
      { name: "material", why: "It draws over content INSIDE a pane; the pane already answered the theme." },
      { name: "render", why: "The anatomy is Base UI's contract — the parts are assembly the caller cannot reach." },
      { name: "orientation", why: "Both bars are declared and Base UI mounts only the ones the content actually needs, on the frame after it measures — orientation is a fact the content decides, not a prop." },
    ],
  },
  {
    slug: "separator",
    name: "Separator",
    family: "Surface",
    spec: "§11",
    blurb:
      "The quiet hairline as its own element: one paint and one thickness, both already designed. Its extent is the container's — the outer-spacing rule applied to length.",
    axes: [{ name: "orientation", values: "horizontal | vertical", note: "the one prop; a vertical hairline is the same two tokens with the axes swapped" }],
    refusals: [
      { name: "children", why: "A labelled divider is a composition — two separators and a Text — not a prop." },
      { name: "a length prop", why: "The container decides extent, the same sentence that refuses margin everywhere." },
      { name: "decorative", why: "A rule that must hide from assistive tech is not a Separator; it is a styled Box." },
    ],
  },
  {
    slug: "shell",
    name: "Shell",
    family: "Layout",
    spec: "§27",
    blurb:
      "The app frame: header, rail, sidebar, content, inspector and bottom, each pane a surface placing itself in one grid — the shell never inspects its children, and DOM order stays reading order. An untouched pane is `auto`: the stylesheet resolves its resting state per window class (nav columns open on roomy windows, closed on narrow ones, where opening presents them as an overlay behind a scrim), so first paint is right with no script and no callback can fire at mount. State lives on each pane in the library's one controlled pattern; the only thing that crosses the shell is a trigger finding its pane by name. Each pane takes `flush`, and what happens when you turn it off is derived rather than chosen: a pane floats above the content if the content is underneath it, which it is only when the content is itself flush; otherwise the pane grounds and becomes its own surface on the page. One boolean reaches the tiled app frame, the canvas app whose work area runs under its panels, the console whose work area is a card in flush chrome, and the all-cards frame — and a floating pane picks up the theme's material for free, because it is finally the one thing with something behind it.",
    axes: [
      { name: "flush", values: "boolean, per pane (default true)", note: "is this pane part of the app frame — tiled with one-hairline seams, and PAINTING NOTHING: flush means level with the page, so the pane has no fill, no corner and no edge of its own, and the app's page shows through. Separation between flush panes is a HAIRLINE — the same rule a Separator draws — and exactly one pane owns each boundary, because a pane draws only its inner edge. One exception the app never states: a pane presenting as an overlay is not in the frame while it does so, so a drawer takes the surface identity back. Turn it off and the pane floats over the content or grounds beside it, whichever is true; you never state which, and a floating pane picks up the theme's material because it is the one with something behind it" },
      { name: "open / defaultOpen / onOpenChange", values: "per pane", note: "Dialog's controlled pattern exactly; omit both and the pane is auto — resolved by CSS per window class, explicit after the first toggle. Passing `open` CONDITIONALLY is supported: a preview mode can pin a pane closed and hand control straight back, and the pane returns to the state the user last left it in rather than to the pinned one" },
      { name: "presentation", values: "auto | fixed | overlay", note: "how an open pane presents: in flow, or floating over content behind a scrim (Escape closes, the rest of the shell goes inert, focus returns); auto follows the window class" },
      { name: "width / height", values: "number (px)", note: "the system's first sanctioned raw length — a pane's width is the app's content speaking, and no ladder can price it; it writes the one custom property a future resize will write. NOT on the rail: a rail's width is its item's box, so it takes a size instead" },
      { name: "size", values: "1 | 2 | 3 | 4 (on Shell, and per pane)", note: "the control index the app's navigation is priced at — its rows and its squares. State it once on Shell and every pane takes it; state it on a pane to overrule the app there. On the rail it decides the pane's whole extent, because a column of squares is as wide as a square plus its air. Never the pane's WIDTH: an extent is content speaking and has no ladder, which is why width is a raw number and this is an index" },
    ],
    refusals: [
      { name: "a gap prop", why: "Floating IS the gap. The distance is one layout-space pick, so a compact app's shell tightens with the rest of its distances; a per-shell number is how a shell drifts off its own app's rhythm (v1 documented overriding --shell-inset-gap)." },
      { name: "a header position axis", why: "The header is full-width by definition — if it isn't wide, it's a header inside ShellContent. One geometry; the Linear posture is composition, not configuration." },
      { name: "a thin sidebar mode, and Rail×Sidebar exclusivity", why: "v1's thin mode was a rail wearing a sidebar's name — the same region twice under two names, which is what forced the exclusivity warning, the child scanning and the close-cascade. Renamed, nothing overlaps: rail and sidebar are independent columns, and an app that wants them linked writes three lines." },
      { name: "a close-cascade between rail and sidebar", why: "Not universally true (VS Code's columns are independent; Slack's rail cannot close), so it is an app opinion, not a shell rule with a conflict-resolution protocol." },
      { name: "drag-to-resize (deferred, not refused)", why: "It is JS at interaction time by definition, so it lands with a written carve-out plus min/max, persistence and the ARIA wiring v1 never finished. The room is already left: a drag writes the same custom property the width prop writes today." },
      { name: "peek", why: "Deferred until a real screen asks — v1's peek was its least load-bearing feature at its highest structural cost (a context slice, absolute overlays, a z-band, per-pane CSS)." },
      { name: "a floating / stacked presentation value", why: "v1 shipped `stacked` (a pane over the content) and `inset` (a pane pulled off the frame) as two features that never met, which is why neither could express a canvas running under its own layers panel. They are one idea, and it is `flush={false}` — the pane leaves the tiling and what it becomes is derived, so there is no third presentation to choose." },
    ],
    parts: [
        { part: "ShellHeader", blurb: "The full-width top bar — a real <header> landmark; a header that isn't full-width belongs inside ShellContent" },
        { part: "ShellRail", blurb: "The narrow icon column that switches sections — a <nav>, independent of the sidebar; give each nav an aria-label when both are present" },
        { part: "ShellSidebar", blurb: "The wide navigation column — a <nav>; untouched it rests open on roomy windows and closed on narrow ones, with no script deciding" },
        { part: "ShellContent", blurb: "The work area — a real <main>, scrolls itself, takes whatever room the panes leave; the one pane every shell should have" },
        { part: "ShellRailItem", blurb: "One square in the rail — a high-level region, not a row. Icon-only by default, because narrow is part of what a rail means: the moment it carries words beside the icon it reads as a small sidebar. `aria-label` is required, `current` announces and paints, and the paint is inset while the whole column still takes the press" },
        { part: "ShellRailList", blurb: "A run of rail squares. A rail typically has two — the regions at the top and the account and settings squares pinned at the bottom — and the second run holds plain actions that are never \"current\"" },
        { part: "ShellScroll", blurb: "The one region of a pane that scrolls. Mark it and everything else in the pane pins by being an ordinary child — the pane becomes a column, this takes the leftover room, and the pane stops scrolling itself. It IS a ScrollArea, so the custom scrollbars arrive with it. A pane fact, not a sidebar one: the inspector and the bottom pane have the same pinned-header-over-a-scrolling-body shape" },
        { part: "ShellNavGroup", blurb: "A cluster of nav rows under a heading. The part exists for the half you cannot see: a heading rendered as a sibling is a heading nobody is told about, so the group carries role=\"group\" and points aria-labelledby at its own label" },
        { part: "ShellNavItem", blurb: "One row of navigation, and the row family's second member — it stands level with a Button, which a menu row deliberately does not, because a menu row lives in a panel opened for a second while this sits beside real buttons all day. `current` both announces (aria-current) and paints, and it paints in a different currency from hover: grey means your pointer is here, accent means this is where you are" },
        { part: "ShellInspector", blurb: "The right-hand detail column — an <aside> that rests closed until asked for; pass defaultOpen for one that starts open" },
        { part: "ShellBottom", blurb: "The bottom pane for terminals and logs — an <aside> spanning the full width below the columns, resting closed" },
        { part: "ShellTrigger", blurb: "The one crossing: a button that drives a pane by name through the registry — stamps aria-expanded and aria-controls, composes over a Kookie Button via render" },
    ],
  },
  {
    slug: "slider",
    name: "Slider",
    family: "Control",
    spec: "§4, §11",
    blurb:
      "The first value control, and the one that needed no target mechanism: the root IS the control, so the whole strip rides the height ladder and a slider stands exactly as tall a target as the Button beside it. Range sliders are the same component — pass an array and a thumb renders per entry.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "the height ladder for the target, the mark ladder for the thumb" },
      { name: "value / defaultValue", values: "number | number[]", note: "an array makes it a range" },
    ],
    refusals: [
      { name: "tone and emphasis", why: "A value is not an action, and a form where one slider is louder than the next names nothing." },
      {
        name: "orientation",
        why: "Vertical needs its own designed geometry set — thumb travel, track pricing, the cells. It ships the day something forces it, not as a prop that renders undesigned geometry today.",
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    family: "Indicator",
    spec: "§8",
    blurb:
      "A busy indicator that costs one composited transform and no JS. The spokes are geometry rather than a gradient, and the animated element is the wrapper rather than the SVG — an SVG root's transform is not reliably composited, and this control's one job is to keep moving while the main thread is busy.",
    axes: [{ name: "—", values: "none", note: "it takes the icon box of whatever control hosts it" }],
    refusals: [
      {
        name: "a size prop",
        why: "It occupies the icon box, so swapping a spinner in for an icon shifts nothing. Standalone, it takes the size-2 box.",
      },
      { name: "a colour prop", why: "It draws in currentColor, which is correct in every context with no token at all." },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    family: "Layout",
    spec: "§3",
    blurb: "Box with a column flex preset. The most common layout in any app, named so it stops being re-derived.",
    axes: [{ name: "gap / align / justify", values: "the flex vocabulary", note: "gap through the layout-space layer" }],
    refusals: [{ name: "dividers", why: "A rule between rows is a Separator you place, not a prop that guesses where you wanted one." }],
  },
  {
    slug: "segmented-control",
    name: "SegmentedControl",
    family: "Control",
    spec: "§4, §11, §19, §26",
    blurb:
      "One choice among a few, shown all at once. It is a radio group, not a row of toggle buttons — picking one of several is what a radio group IS, and that is what a screen reader then hears. The track is a well on the height ladder so it stands level with the button beside it — law-asserted against a mounted Button's rendered box, after the first spelling compared two declared heights and was green over a track two pixels too tall. Each segment is §4's hosted-control rule with N hosts; the segments sit flush; and the chosen one is the grip, casting like the switch's thumb and wearing the ink that pairs with the grip rather than with the page.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "prices the track; the segments derive from the channel" },
    ],
    refusals: [
      {
        name: "tone and emphasis",
        why: "The family has one tone as an identity. A segment louder than its neighbours is not a segmented control.",
      },
      {
        name: "an indicator element",
        why: "The chosen segment paints its own box. A measuring hook whose only consumer is a motion nobody has designed yet is a mechanism with no consumer.",
      },
      {
        name: "multi-select",
        why: "That is a set of toggle buttons and a different component. Toggle Button has its own row in §11.",
      },
      {
        name: "nativeButton and render",
        why: "Closed with the mark family's own reasons, and pinned by type probes after an audit found nativeButton reopened here: set on a segment it breaks Space selection, which is the defect Checkbox closed on this same primitive.",
      },
      { name: "readOnly", why: "Inherited from Radio — the platform has no read-only selection control." },
    ],
    parts: [
        { part: "SegmentedItem", blurb: "One segment — a control hosted in the channel, holding its own label and reporting its own checked state" },
    ],
  },
  {
    slug: "switch",
    name: "Switch",
    family: "Control",
    spec: "§4, §6, §11, §19",
    blurb:
      "The mark family's shifted member: its track is mark(n + 1), the identity every peer arrives at by hand. Off is the neutral well with its edge melted in — a channel felt for rather than a small surface read — which is why the whole control sits outside the look axis with the slider.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "one index up the mark ladder, with its own width ladder" }],
    refusals: [
      { name: "tone and emphasis", why: "Inherited from the family: neutral off, accent on." },
      { name: "children", why: "The label is a sibling, as for every mark." },
      {
        name: "readOnly",
        why: "The same answer Checkbox gives — a read-only switch is a disabled one with a different name.",
      },
    ],
  },
  {
    slug: "tabs",
    name: "Tabs",
    family: "Control",
    spec: "§11, §15, §26",
    blurb:
      "A bar of places you can go, and the one you are on. The active tab is marked by ink and a rule, never by a louder fill or a heavier label — a fill would make it read as a button among links, and a heavier weight reflows the whole bar every time you switch. The rule is drawn by an offset and a width, the pair Base UI computes in one coordinate space: the both-edges spelling it shipped with collapsed to zero width whenever the bar overflowed.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "on the list, once — a bar of mixed sizes is not a thing anyone means" },
    ],
    refusals: [
      {
        name: "tone and emphasis",
        why: "A bar where one tab is louder than the next names nothing. Which tab is active is a state, not a rung a call site picks.",
      },
      {
        name: "TabsTrigger / TabsContent",
        why: "shadcn's names, and the one place this package does not take them: a trigger here opens a floating layer, and a tab opens nothing. TabsPanel follows the role it announces.",
      },
      {
        name: "material",
        why: "A tab bar paints no pane. There is nothing behind it to defocus, so glass has nothing to do.",
      },
      { name: "an exported indicator", why: "The rule is structure, not API. A consumer who has to place it is one who will forget." },
    ],
    parts: [
        { part: "TabsList", blurb: "The bar, the hairline, and the one place the size is stated — it places the rule itself, which is why nobody has to remember to" },
        { part: "TabsTab", blurb: "One tab: a control on the height ladder wearing the quiet rung, marked active by ink rather than by a fill" },
        { part: "TabsPanel", blurb: "What the tab reveals. Paints nothing — a region that draws its own box is a Card" },
    ],
  },
  {
    slug: "text",
    name: "Text",
    family: "Type",
    spec: "§15",
    blurb:
      "Body copy. A step on the ramp joins three designed pairs — font size, line height, letter spacing — at one index, and the family is the Theme's body slot. It renders a span: flow is the layout layer's job, so a paragraph is render={<p/>}.",
    axes: [
      { name: "size", values: "1–9", note: "defaults to 3, the anchor step" },
      { name: "weight", values: "regular | medium | semibold", note: "token names, never numbers" },
      { name: "emphasis", values: "loud | medium | quiet", note: "rests LOUD — full contrast is the accessible resting state for reading" },
      { name: "tone", values: "any family", note: "re-scopes the ladder onto the family's ink trio" },
    ],
    refusals: [
      { name: "a colour prop", why: "tone says the meaning and the theme resolves the pigment. A raw colour rides style, spelled where review sees it." },
      { name: "margin", why: "Type owns no outer spacing; the margin is zeroed whatever element render names." },
      { name: "bold (700)", why: "Semibold tops the ladder and every heading rests there. Hierarchy is size and the ink roles, both already designed; a fourth weight is a fifth way to say the same thing. The token is gone too, so nothing can reach it by hand." },
    ],
  },
  {
    slug: "text-area",
    name: "TextArea",
    family: "Control",
    spec: "§4, §11",
    blurb:
      "One element, no wrapper, no slots — the anatomy criterion answered by subtraction. TextField needs a wrapper because a slot forces the border off the input; a textarea has no slots, so the border stays on the element and every wrapper debt never exists. It is the first control whose padding is the dimension: one inset, all four sides.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "control height survives as a min-height; growth is rows" },
      { name: "rows", values: "number", note: "the height, because a composer is its own component" },
      { name: "backdrop", values: "boolean", note: "placement, not material (§10, 2026-08-17): content passes behind this, so the theme's glass may express; unset it reads the ambient <Box backdrop> region" },
    ],
    refusals: [
      { name: "emphasis and tone", why: "A form where one field is louder than the next is incoherent — TextField's argument." },
      { name: "resize", why: "It renames raw CSS. Vertical-only is the shipped behaviour; style is the escape." },
      {
        name: "cols",
        why: "The container sets the width. A textarea sized in characters uses a unit that the type ramp does not use, so an 80-column box is a different width at every size step and every density. Set the width in the layout that owns the relationship, where the distance is a token.",
      },
    ],
  },
  {
    slug: "text-field",
    name: "TextField",
    family: "Control",
    spec: "§4, §9, §11",
    blurb:
      "The visible control is a WRAPPER around the input, and that is what makes its slots legitimate anatomy: a field that can hold an icon inside its border cannot keep that border on the input, and the wrapper then owes caret-on-click, slot-aware layout, and a trailing control that keeps its own press. ref goes to the input; className dresses the wrapper.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "the control family index. It sets the height, the inline padding, the corner, the slot inset and the label type step together. A control inside a slot derives its own box from that inset, so you never choose a second index" },
      { name: "leading / trailing", values: "ReactNode", note: "an icon, or a hosted control that keeps its own press" },
      { name: "backdrop", values: "boolean", note: "placement, not material (§10, 2026-08-17): content passes behind this, so the theme's glass may express; unset it reads the ambient <Box backdrop> region" },
    ],
    refusals: [
      { name: "emphasis and tone", why: "Loudness ranks actions. A form where one field is louder than the next names nothing." },
      {
        name: "render",
        why: "Everywhere else render swaps the one element that IS the component. Here there are two and neither can move — the wrapper holds a border the input cannot, and the input must stay an input or the platform wiring goes with it.",
      },
    ],
  },
  {
    slug: "theme",
    name: "Theme",
    family: "Layout",
    spec: "§5, §7, §12, §19",
    blurb:
      "Where an app states its identity. Seven axes, each re-pricing tokens for everything beneath it — and they nest, so a section can override the page. Nothing about a Theme is decoration: every prop answers a question the call sites are then forbidden from answering one at a time.",
    axes: [
      { name: "appearance", values: "inherit | light | dark", note: "resolved output, never a colour" },
      { name: "contrast", values: "normal | high", note: "an accessibility setting, not a design knob — the conformance surface for edges and signals" },
      { name: "radius", values: "none | small | medium | large | full", note: "selects a designed palette per level, not a factor" },
      { name: "density", values: "compact | default | comfortable", note: "control-only: airiness, never type" },
      { name: "pointer", values: "auto | fine | coarse", note: "two complete geometries, the way there are two colour modes" },
      { name: "depth", values: "flat | elevated", note: "does light exist: the one sanctioned consumer of the shadow palette" },
      { name: "material", values: "solid | thin | regular | thick", note: "of what the app is BUILT — one VALUE for the whole scope (2026-08-16); expression is placement since 2026-08-17: glass renders only where a backdrop is stated (the backdrop prop / region), so the value names the material and placement decides where it shows" },
    ],
    refusals: [
      {
        name: "an accentColor prop",
        why: "Accent is hue-authored in config and baked by the generator, so it is one app-wide identity rather than a per-subtree choice. A runtime prop would mean shipping every family's ladder for every subtree — the named extra-accent slot is recorded open, and it will be a config entry when it lands.",
      },
      {
        name: "a scale prop",
        why: "The factor stays wired and the prop is deferred. It reopens the day a real need names the steps, and ships as designed steps rather than a free multiplier.",
      },
      {
        name: "an elevation axis",
        why: "Deleted. Nothing ever varied it per call site — it was a component fact wearing an axis's clothes, and depth is what survived of its logic.",
      },
      {
        name: "the look axis (surfaceLook / controlLook)",
        why: "Deleted whole (controlLook 2026-08-19, surfaceLook 2026-08-20). controlLook's two values had converged — fields and marks wear the dress unconditionally. surfaceLook's second value was never judged or used: the lab's borderless pane is the one surface identity, so the prop was a lever every call site could reach and none had needed. A tinted surface identity can return as a Theme value the day a real app wants one.",
      },
    ],
  },
];

export const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));
