/**
 * The component reference, as data. One entry per exported component. The page is a renderer
 * over these entries, so adding a component means adding a row rather than writing a page.
 *
 * The section that matters most is `refusals`. What a component will not do is the system's
 * real argument, and it is the part no generated API table can carry: a missing prop looks the
 * same as an oversight until someone writes down which it is. Every refusal names its reason.
 *
 * `registry.test.ts` walks the package's exports against this file, so a component cannot ship
 * undocumented.
 *
 * Write these entries in plain English. See `content/AUTHORING.md`, section "Register": no
 * comma tail on a heading, name the product you mean, no ", by construction" tail, no
 * aphorisms, and none of the internal vocabulary of docs/DECISIONS.md (prices, rides, owes,
 * stands down, rung, veil, seal, bed, dress, posture). No dates and no development history:
 * a reader has not seen an earlier version of anything here.
 */
export type Entry = {
  /** URL segment. */
  slug: string;
  /** The exported name, and the key the coverage law matches on. */
  name: string;
  /** Which family it belongs to. */
  family: "Layout" | "Control" | "Surface" | "Type" | "Indicator";
  /** DECISIONS.md sections this component implements. */
  spec: string;
  /** What it is, in two or three sentences. */
  blurb: string;
  /** The axes it exposes, and what each one does here. */
  axes: { name: string; values: string; note: string }[];
  /** What it refuses, and why. The system's argument. */
  refusals: { name: string; why: string }[];
  /** Parts of a compound component, explained here rather than on stub pages of their own.
      The coverage law accepts either home, and holds part blurbs to a floor. */
  parts?: { part: string; blurb: string }[];
  /**
   * A live specimen lives in `examples/<slug>.tsx`: one real file, rendered here and shown as
   * source. It is not a field. The file name is the slug, so there is no mapping to keep in
   * step, and a law walks both directions.
   */
};

export const ENTRIES: Entry[] = [
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    family: "Surface",
    spec: "§10, §20, §25",
    blurb:
      "A modal question with two answers. It holds a title, a description, a cancel button and an action button, and the component lays those out itself. It is separate from Dialog because the two do different jobs: a dialog holds work you asked for, and an alert stops you and asks something. It uses role=alertdialog, it does not close on an outside press, and its content is fixed. The part names follow shadcn/ui's alert-dialog (MIT), with credit. The behaviour is Base UI's AlertDialog.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "sets everything: the box, the corner, the padding, the type steps of the title and description, and both buttons. Dialog's size stops at the box. Alert may go further because the system wrote this content" },
      { name: "tone (Action)", values: "any family", note: "the one meaning an action carries beyond going ahead. Use destructive for the deletes this component mostly exists for" },
    ],
    refusals: [
      {
        name: "a width prop",
        why: "The width is fixed per size, and narrower than a dialog at the same index. An alert asks a question. It does not hold work. On a phone the window gutter still wins.",
      },
      {
        name: "closing on an outside press",
        why: "A stray press must not answer a question about deleting something. Escape still closes it, because a keyboard user saying `not now` is the Cancel action by another route.",
      },
      {
        name: "Header and Footer",
        why: "The component arranges the title, the description and the action row itself, so you never write a Stack. Cancel comes first in the DOM, which places it at the start and gives it initial focus. Document order picks the safest action.",
      },
      {
        name: "render on Cancel and Action",
        why: "The alert owns the size of its two buttons and the row that splits them. Both are real Kookie Buttons. Action defaults to loud, which is correct here and nowhere else: an alert has exactly one Action, so the one-focal-action rule holds by the anatomy rather than by memory.",
      },
      {
        name: "arbitrary children",
        why: "A panel that needs any control beyond its two buttons is a Dialog. A type-to-confirm field and a checkbox both cross that line. An alert's only job is choosing.",
      },
    ],
    parts: [
      { part: "AlertDialogTrigger", blurb: "The button that opens it, usually render={<Button/>}. An alert driven by app state needs no trigger at all" },
      { part: "AlertDialogContent", blurb: "Portals the panel, re-applies the theme, paints the scrim, centres the panel, and arranges the parts in a two-column grid" },
      { part: "AlertDialogTitle", blurb: "The accessible name, and a real heading sized by the alert's own index. Write the question here" },
      { part: "AlertDialogDescription", blurb: "What going ahead means, in the muted ink role, wired as the panel's accessible description" },
      { part: "AlertDialogCancel", blurb: "The safe way out: a medium Button the component sizes, first in reading order and first to take focus" },
      { part: "AlertDialogAction", blurb: "The button that goes ahead. The component sizes it and defaults it to loud, and tone=\"destructive\" is the usual answer here" },
    ],
  },
  {
    slug: "blockquote",
    name: "Blockquote",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "Body copy set apart by a rule and an indent. How it reads comes from the shared type layer. What it adds is the quiet hairline down its leading edge and the indent that keeps the words off it.",
    axes: [
      { name: "size", values: "1-9", note: "defaults to 3. A quote is a block, so it sets its own step" },
      { name: "weight", values: "regular | medium | semibold", note: "token names, never numbers" },
      { name: "emphasis", values: "loud | medium | quiet", note: "picks an ink colour. It rests loud" },
      { name: "tone", values: "any family", note: "moves the ink onto that family, and only the ink" },
    ],
    refusals: [
      {
        name: "a tinted rule",
        why: "A chosen tone moves the words, not the bar. The rule sits where a Separator sits and carries no meaning of its own. A quote whose bar has to carry meaning is a different component: use a Notice if a live condition raised it.",
      },
      {
        name: "an attribution slot",
        why: "The line under a quote is a sibling Text. The system owns an anatomy only where something non-visual forces one, and nothing here does.",
      },
    ],
  },
  {
    slug: "box",
    name: "Box",
    family: "Layout",
    spec: "§2, §3",
    blurb:
      "The layout engine. Flex, Stack and Grid are Box with a fixed display and a shorter prop list. Box takes the whole set: spacing, width and height, a few structural keywords, and the props a flex or grid child needs. Every value resolves through a token, and any prop can take one value per container tier.",
    axes: [
      { name: "p / m / px / py …", values: "layout space steps", note: "the density-aware layer, never the raw palette" },
      {
        name: "m / mx / mt … = \"bleed\"",
        values: "the one named value on the space scale",
        note: "cancels the enclosing surface's padding, so this box reaches the pane's edge. A picture across the top of a card is mt=\"bleed\" mx=\"bleed\". Margins only, because padding and gap reject a negative length. It reads the nearest surface, and outside one it computes a real zero",
      },
      { name: "any prop", values: "value | { initial, sm, md, lg }", note: "container tiers, compiled to variable remaps" },
      {
        name: "container",
        values: "boolean",
        note: "makes this Box the region that responsive values inside it measure. Without it they measure the nearest marked ancestor, and finally the Theme root",
      },
      {
        name: "backdrop",
        values: "boolean",
        note: "marks a region where content passes behind the components inside it. Every glass-capable component within resolves the theme's material. Say it once for the region. backdrop={false} marks a sub-region as plain again",
      },
    ],
    refusals: [
      {
        name: "utility classes",
        why: "Values travel as inline custom properties into fixed rules, so a token and a raw string cost the same and the stylesheet never grows with the number of values used.",
      },
      {
        name: "a bleed prop",
        why: "It is a value on the margin rows, not a prop of its own. Every per-side and per-tier spelling already exists there, so bleed, bleedX and bleedTop would have meant seven new prop rows and a second mechanism writing margin.",
      },
      {
        name: "containment by default",
        why: "A measurable box can never size itself around its contents, so a Box that was always a container collapsed to zero width inside a flex row. A plain Box hugs its content like a div. Put `container` on things the layout already sizes: a sidebar with a width, a growing column, a grid cell. A container Box left to shrink-wrap renders zero pixels wide, and a development build warns you.",
      },
    ],
  },
  {
    slug: "button",
    name: "Button",
    family: "Control",
    spec: "§4, §8, §9",
    blurb:
      "The action control, and the one the shared control layer was written for. Loudness is the only ranking axis. You never set an appearance: the theme resolves it from tone, emphasis and bordered, over whatever material the Theme says the app is made of.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "an index into the height ladder, not a measurement" },
      { name: "tone", values: "any family", note: "picks the meaning. accent resolves through the Theme" },
      { name: "emphasis", values: "loud | medium | quiet", note: "three levels, because a level has to earn a visible step" },
      { name: "bordered", values: "boolean", note: "containment, and about half a level: medium with a border reads louder than medium" },
      { name: "backdrop", values: "boolean", note: "says content passes behind this button, so the theme's glass can show. Unset, it follows the surrounding <Box backdrop> region" },
      { name: "leading / trailing", values: "ReactNode", note: "an icon, or a whole control hosted inside" },
    ],
    refusals: [
      { name: "margin", why: "A component never sets outer spacing. The distance belongs to the container. The escape is <Box m>." },
      {
        name: "variant",
        why: "It fuses loudness with meaning, so it cannot express a quiet destructive action. `tone` and `emphasis` are separate props for exactly that reason.",
      },
      {
        name: "a shadow prop",
        why: "There is no elevation axis. Depth is an app identity, set once by Theme depth, and never chosen at a call site.",
      },
    ],
  },
  {
    slug: "surface",
    name: "Surface",
    family: "Surface",
    spec: "§10",
    blurb:
      "A ground: what objects sit on. A Card is an object, and a Surface is what holds it. An object is opaque, catches light and casts a shadow. A ground does none of those. Use it two ways: a bounded region of a page that holds cards, and a quieter region inside a card, such as a code block or a settings group. Its colour is a stated pair rather than a step down from its parent, because in dark mode a relative step would land above the card colour and the cards would be darker than the region holding them.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "padding and corner from the container band, one step up from a card's, because a container needs a larger corner than the things inside it" },
    ],
    refusals: [
      {
        name: "a fill or an edge prop",
        why: "The ground colour and the hairline are the component. Give it a fill and edge vocabulary and the first thing anyone builds is a fill plus a hairline, which is a second way to make a Card. A ground cannot pass for a card, so it cannot start that drift.",
      },
      {
        name: "a border toggle",
        why: "Button's `bordered` ranks: quiet, quiet with a border and medium say three different things about loudness. Two grounds, one lined and one not, would say the same thing. The line is also load-bearing in dark mode, where a ground and the page are the same colour.",
      },
      {
        name: "material and backdrop",
        why: "Glass defends a pane against something passing behind it, and a ground's backdrop is its own parent. Inside a glass card a Surface joins the scope already there and opens none of its own.",
      },
      {
        name: "tone, emphasis and a shadow",
        why: "Card's refusals, unchanged. A container ranks nothing against its siblings, and a region in the plane throws no shadow.",
      },
    ],
  },
  {
    slug: "card",
    name: "Card",
    family: "Surface",
    spec: "§9, §10",
    blurb:
      "An object with its own plane: one opaque fill, one corner, one padding, and no other treatment. Its size sets the padding and the corner, never a height. The element decides what it does: render it as a button or a link and it presses, with the same state colours and the same motion every control has; render it as the label of a radio and it can be chosen. Only the press distances are its own, because a large box moving as far as a button reads as the page bending.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "padding and corner, not height" },
      { name: "backdrop", values: "boolean", note: "says content passes behind this card, so the theme's material can show. Unset, it follows the surrounding <Box backdrop> region. It can never pick a thickness" },
    ],
    refusals: [
      {
        name: "a `selected` prop, and an `interactive` one",
        why: "The element says both instead. `<Card render={<button/>}>` is the pressable card, and `<Card render={<label/>}>` around a `Radio` is the chosen one, so the semantics, the keyboard, the form value and the announcement all belong to the primitive and the system supplies only the edge. A `selected` prop would be a second way to say what the radio already says, with nothing keeping the two in agreement. A disabled card is a disabled button and shows what one shows: the fill recedes, the words dim, the cursor stops promising, and the shadow goes.",
      },
      {
        name: "a card inside a card",
        why: "A card is an object with its own plane. Two of them stacked is an object standing on an object, which describes a relationship this system does not have. For a quiet region inside a card, use a Surface. For several objects on one ground, put the cards in a Surface. A development build warns you, the builder cannot express it, and the composition reviewer reports it.",
      },
      {
        name: "a material prop",
        why: "Material is a Theme value. It answers what the app is made of, which is one answer for a whole scope rather than a per-card choice. A subtree that has to differ uses a nested Theme. Where the glass shows is decided by placement: a component renders glass only where a backdrop exists.",
      },
      {
        name: "tone, emphasis and bordered",
        why: "A card ranks nothing against its siblings. Its edge comes from light, not from a loudness level.",
      },
      {
        name: "a media or cover slot",
        why: "A card clips what it holds, and a child says it reaches the edge with <Box mt=\"bleed\" mx=\"bleed\">. Every peer solved this with a part of its own, such as Mantine's Card.Section, MUI's CardMedia and Ant's cover. Here the picture is a child that cancels the padding, not a region the card has to know about.",
      },
      {
        name: "header and footer slots",
        why: "The system owns an anatomy only where something non-visual forces one, such as a dialog's focus wiring or a notice's status role. A card's regions are a layout, and a layout is something you compose.",
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    family: "Control",
    spec: "§4, §6, §11",
    blurb:
      "A control that is its own mark. Its box is exactly one line of its label's type, so it lines up with the text beside it and grows on a phone with nothing designed twice. Its hit area extends to the size a Button of the same index would occupy, whether or not that area is painted.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "an index into the mark ladder, which is the line-height ladder" }],
    refusals: [
      {
        name: "tone and emphasis",
        why: "Neutral when off and accent when on is an identity, not an axis. The family has one meaning and one way to show it.",
      },
      {
        name: "children",
        why: "A mark sits beside its label. The label is a sibling, and the row sets the distance between them.",
      },
      {
        name: "readOnly",
        why: "HTML does not define readonly for a checkbox, and every library that accepts it draws the control exactly like a live one. A state with no appearance is worse than no state.",
      },
    ],
  },
  {
    slug: "code",
    name: "Code",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "Inline code: the mono font slot with a subtle fill behind it. Its size is optional, and unset it takes the size of the line it sits in, so a literal inside small text stays small without the call site repeating the index.",
    axes: [
      { name: "size", values: "1-9, optional", note: "unset, it takes the line it sits in" },
      { name: "emphasis", values: "loud | medium | quiet", note: "picks the ink colour, not the fill" },
      { name: "tone", values: "any family", note: "moves both the ink and the fill" },
    ],
    refusals: [
      {
        name: "a fill that gets louder with emphasis",
        why: "On type, emphasis picks an ink colour. A chip whose fill also climbed would be reading one prop two ways in one element.",
      },
      {
        name: "block code",
        why: "A code block owns overflow, wrapping and a scroll container. That is a different component, not a mode of this one.",
      },
    ],
  },
  {
    slug: "dialog",
    name: "Dialog",
    family: "Surface",
    spec: "§10, §20, §24",
    blurb:
      "A modal panel over a dimmed app. The panel is a Card that covers: same fill, same edge, with a corner one step rounder than a card of the same size. It casts no shadow of its own, because the scrim behind it is what separates it from the page. Below the narrow window boundary it presents as a sheet on the bottom edge. The part names follow shadcn/ui's dialog (MIT), with credit. The behaviour is Base UI's Dialog, focus trap and scroll lock included.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "sets the box: a maximum width, the padding and the corner. It never sets the type inside. The window wins when there is less room than the size asks for" },
    ],
    refusals: [
      {
        name: "Header and Footer",
        why: "A title, a description and an action row are a Stack you write. Blessing one arrangement deprecates every other. Title and Description are parts here because they carry the panel's accessible name and description, which is a non-visual reason.",
      },
      {
        name: "a presentation prop, and a drag",
        why: "The window class decides whether the panel centres or sits on the bottom edge. It is the same element throughout, so a half-filled form survives the change. A sheet does not drag, because a swipe means JavaScript on every pointer move. An AlertDialog stays centred at every width.",
      },
      {
        name: "a height prop",
        why: "The extent is yours. State a height or a max-height on DialogContent and a ScrollArea inside it becomes the thing that scrolls, with the title and the action row staying put. State nothing and the panel grows, and the dialog's own viewport scrolls it.",
      },
      {
        name: "a close button in the corner",
        why: "Escape and an outside press both dismiss. DialogClose puts a real Button wherever the composition wants one, which is also what a screen reader user on a touch device needs in order to leave a trapped panel.",
      },
      {
        name: "modal and disablePointerDismissal",
        why: "An open dialog is the interaction: focus trapped, page scroll locked, the scrim saying so. A panel that leaves the page live is a Popover or a Sheet. A dialog that must not close on an outside press is an AlertDialog.",
      },
      {
        name: "a shadow",
        why: "A menu casts because a floating pane has to show the coverage nobody else announced. A dialog's coverage is announced by the whole viewport going dark, so a shadow would say it twice. In an elevated app the panel lifts exactly as much as a Card does.",
      },
      {
        name: "a size on the title",
        why: "The title and description take their type steps from the dialog's own index, and no call site can set them. They are parts the system owns, forced into existence by the accessibility wiring. Everything you wrote inside the panel is untouched, which is what `no surface sizes the type inside it` protects.",
      },
    ],
    parts: [
      { part: "DialogTrigger", blurb: "The button that opens it, usually render={<Button/>}. A dialog driven by app state needs no trigger at all" },
      { part: "DialogContent", blurb: "Portals the panel, re-applies the theme, paints the scrim, and centres the panel in a viewport that scrolls when the panel is taller than the window" },
      { part: "DialogTitle", blurb: "The panel's accessible name, wired by aria-labelledby. A real heading element at the card-title step" },
      { part: "DialogDescription", blurb: "The supporting line, wired by aria-describedby. Body copy in the muted ink role" },
      { part: "DialogClose", blurb: "A dismissing button you place yourself. There is no corner glyph, so the action zone stays where the composition put it" },
    ],
  },
  {
    slug: "field",
    name: "Field",
    family: "Control",
    spec: "§28",
    blurb:
      "The unit that makes one input make sense. A control on its own is a box: it does not carry its own name, it cannot say what it is for, and it cannot say what went wrong. Field supplies a label, a description and an error, and wires all three to the control so a screen reader reads them as one thing. What it draws is a column and a gap. The behaviour is Base UI's Field.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "sets the whole unit: the label, the description, the error and the control inside it. It reaches the control by context, and an explicit prop on the control always wins, so a control is never re-sized behind a number somebody typed" },
    ],
    refusals: [
      {
        name: "FieldControl",
        why: "Base UI's is a plain input for callers who have no other input. Every Kookie control already is a Base UI input and reads Field's context by itself, so a control dropped inside a Field wires itself. Re-exporting one would be a second spelling of the control already standing there.",
      },
      {
        name: "orientation",
        why: "A horizontal field is not a direction flip. The label has to align to the control's first line, and the error has to sit under the control rather than under the label. That is a designed grid with its own rules, and it ships the day something needs it.",
      },
      {
        name: "a choice about where the error goes",
        why: "The order is fixed: label, control, description, error. The label sits on the control it names, and everything else about that control sits underneath it, so a form of ten fields groups correctly with no border and no rule. Position inside one field is proximity, not sequence: a reader meets a field all at once. GOV.UK puts the description above the control instead, because at high zoom the focused control fills the view and anything under it may be off screen. That cost is real and it is written down. A prop here would make the order a per-call-site opinion, which is what a system exists to prevent.",
      },
      {
        name: "an error that replaces the description",
        why: "Both show. The description says what to enter and the error says what went wrong. Removing the instruction at the exact moment somebody failed to follow it is the wrong trade.",
      },
      {
        name: "Form",
        why: "Deferred, not refused. Base UI's Form gives a server error map to fields by name and moves focus to the first invalid one. It is additive and changes nothing here, so it ships when something real has server errors to distribute.",
      },
    ],
    parts: [
      { part: "FieldItem", blurb: "One option inside a checkbox group or a radio group: a mark, its own name, and its own line of explanation. It opens a fresh naming scope, so a label written inside it names the mark beside it rather than the group, and a description written inside it is added to the ones the field already supplies. It closes the hole the mark family shipped with, where a named checkbox meant writing an id and an htmlFor by hand. Two columns: the mark, then the name and the explanation stacked beside it, so the explanation lines up with the words rather than with the mark" },
      { part: "FieldLabel", blurb: "The field's name: a real <label> associated by id, so clicking it lands the caret. Medium weight and the plain foreground role" },
      { part: "FieldDescription", blurb: "What to enter. The muted ink role, wired into aria-describedby wherever it sits, so a screen reader announces it with the control from any position. It sits under the control and above the error" },
      { part: "FieldError", blurb: "What went wrong, after it went wrong. The destructive ink, rendered only while the field is invalid, and carrying the live region that announces it. Base UI matches one message to one validity reason; with no children it prints the browser's own" },
    ],
  },
  {
    slug: "flex",
    name: "Flex",
    family: "Layout",
    spec: "§3",
    blurb:
      "Box with display: flex and the flex props kept. It ships no CSS of its own. The shorter prop list is the point: columns on a Flex does not compile.",
    axes: [
      { name: "direction / align / justify / wrap", values: "the flex vocabulary", note: "responsive like every layout prop" },
      { name: "gap", values: "layout space steps", note: "the distance between children, through the density-aware layer" },
    ],
    refusals: [{ name: "margin on children", why: "The distance between siblings is the container's gap, so it is set once and cannot drift." }],
  },
  {
    slug: "grid",
    name: "Grid",
    family: "Layout",
    spec: "§3",
    blurb: "Box with display: grid and the grid props kept. Same mechanism as Flex, and the same zero extra CSS.",
    axes: [
      { name: "columns / rows", values: "track lists", note: "a raw track string travels the same path a token does" },
      {
        name: "gap / gapX / gapY",
        values: "layout space steps",
        note: "the density-aware layer, not the raw palette. A comfortable theme widens the grid and a compact theme narrows it, with no call site changing. The two axes are separate because a grid is the one layout where row spacing and column spacing answer different questions",
      },
    ],
    refusals: [{ name: "auto-placement helpers", why: "A prop earns its place only if it adds token resolution, tiers or a constraint. Everything else is style." }],
  },
  {
    slug: "heading",
    name: "Heading",
    family: "Type",
    spec: "§15",
    blurb:
      "The heading font slot, on the same nine-step ramp Text uses. How large it looks and where it sits in the document outline are separate questions: size picks the step, and render picks the element.",
    axes: [
      { name: "size", values: "1-9", note: "defaults to 6, the level a section title usually wants" },
      { name: "weight", values: "regular | medium | semibold", note: "defaults to semibold. There is no bold" },
      { name: "emphasis", values: "loud | medium | quiet", note: "picks an ink colour, not a fill. Use it for a muted section label. It rests loud, because a heading has to stay readable" },
      { name: "tone", values: "any family", note: "moves the ink onto that family. It changes the ink only, because a heading has no fill" },
    ],
    refusals: [
      {
        name: "a level prop",
        why: "An h1 is a fact about the document, not about how the text looks. render={<h1/>} says it where a reader can see that the two decisions are separate.",
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "A key cap. It takes Code's fill and tone behaviour but sets the letters in the body font, because a key names a key rather than quoting code, and the interface sans draws the command symbol full size where a mono cell squeezes it. Its box is exactly one line tall, so it never spreads the line it sits in.",
    axes: [
      { name: "size", values: "1-9, optional", note: "unset, it takes the size of the line it sits in, like Code. A fixed size would push a size-1 caption up to 16px" },
      { name: "emphasis", values: "loud | medium | quiet", note: "changes the ink colour, not the cap fill. A quiet chord shows quieter letters on the same key" },
      { name: "tone", values: "any family", note: "moves the ink and the fill. The edge is a grey relief line and does not follow the tone, so it reads the same on any background" },
    ],
    refusals: [
      {
        name: "a shadow that follows Theme depth",
        why: "A key cap always shows relief, in a flat theme as well: a catch of light on the top face and a whisper of drop. A key cap is a picture of a raised physical object, and that reading is the component. What stays refused is the shadow changing with the app's depth setting.",
      },
    ],
  },
  {
    slug: "link",
    name: "Link",
    family: "Type",
    spec: "§11, §15",
    blurb:
      "The one type component that answers a pointer. How it reads comes from the shared type layer. What it adds is the underline and the states. It is not a control, so it stays selectable, it wraps across lines, and it sits on the line its paragraph set.",
    axes: [
      { name: "size", values: "1-9", note: "optional with no default. Unset, it takes the line it sits in" },
      { name: "weight", values: "regular | medium | semibold", note: "optional. A link in a sentence keeps that sentence's weight" },
      { name: "tone", values: "any family", note: "defaults to accent. It moves the words and the underline together" },
    ],
    refusals: [
      {
        name: "emphasis",
        why: "On type, emphasis picks an ink colour, and the two lower levels sit at or below the reading floor. A link is the one run of text whose job is to be found, so a level that turns its colour down works against the only thing it is for. A link that matters less is a smaller link.",
      },
      {
        name: "a :visited style",
        why: "Browsers limit what :visited may paint and make getComputedStyle report the unvisited value, to stop a page reading your history. A rule no test can read is a rule this package does not ship.",
      },
      {
        name: "a hover-only underline",
        why: "Colour alone is not enough (WCAG 1.4.1), and a link inside a paragraph is the case that rule is written about. A hover reveal serves no touch screen at all. The underline is always there. What moves under the pointer is its colour.",
      },
      {
        name: "a target of its own",
        why: "WCAG 2.2 SC 2.5.8 exempts a target inside a sentence. A checkbox grows its hit area because it has no container. A link's container is the paragraph, and a paragraph may not grow.",
      },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    family: "Surface",
    spec: "§20, §21, §22",
    blurb:
      "A floating list of actions. The panel is a Card that floats, with a corner derived from its rows: the row's own corner plus the panel's padding, so the two curves nest. It casts a shadow in a flat theme as well as an elevated one, because a shadow under a floating pane is information about what it covers. The part names follow shadcn/ui's dropdown-menu (MIT), with credit. The behaviour is Base UI's Menu.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "set it on the root, like Button. A size-4 trigger must not open a size-2 menu. Rows take the control padding and type, and their height is the text line plus a fixed inset, a notch under a button of the same index" },
      { name: "tone (Item)", values: "destructive", note: "a list of one: the single meaning a row may carry. Widening it is a decision, never a default" },
      { name: "side / align / sideOffset (Content)", values: "bottom / start / 4", note: "the only positioning vocabulary that is public" },
    ],
    refusals: [
      {
        name: "emphasis on rows",
        why: "A menu is a list of peers. Emphasis ranks actions, and ranking rows inside a menu says nothing. Quiet is the family's fixed identity.",
      },
      {
        name: "a Shortcut part",
        why: "A keyboard hint is the row's trailing slot holding a <Kbd>. Both already exist, and a part that renames existing vocabulary earns no row.",
      },
      {
        name: "MenuSeparator",
        why: "Base UI's menu separator is a re-export of the standalone one, and ours would be too. Use <Separator>. The menu's stylesheet spaces it inside the panel.",
      },
      {
        name: "an inset prop",
        why: "Rows without icons lining up with rows that have them is geometry's job, not something a caller has to remember. A checkable row keeps its indicator mounted, so the gutter is always reserved.",
      },
      {
        name: "modal and openOnHover",
        why: "An open menu is modal. A transparent full-screen press catcher is what makes clicking outside close it, and locking page scroll keeps the panel attached to the trigger it is positioned against. There is no visible scrim. Rows open on click, never on hover.",
      },
      {
        name: "Arrow, Backdrop, Viewport, LinkItem and collision knobs",
        why: "Menus do not point at their trigger. Closing on an outside press needs no scrim. A long menu scrolls inside a ScrollArea the system supplies, so the panel keeps its glass, corner and shadow. Navigation rows arrive with the sidebar components. Collision handling is a designed default.",
      },
    ],
    parts: [
      { part: "MenuTrigger", blurb: "The button that opens the menu, usually render={<Button/>}, so the trigger is a real Kookie Button" },
      { part: "MenuContent", blurb: "The floating panel: it portals, positions, re-applies the theme and takes the surface identity" },
      { part: "MenuItem", blurb: "One action row: control padding, the family's quiet colour, and lit by the keyboard highlight rather than by hover alone" },
      { part: "MenuGroup", blurb: "Groups rows so a label can name them, and wires the group's accessible name for you" },
      { part: "MenuLabel", blurb: "A heading for a run of rows. It uses the row's alignment without being interactive. Legal inside a group and on its own" },
      { part: "MenuCheckboxItem", blurb: "A row you can toggle. The tick uses the accent fill while the label stays neutral, and the indicator stays mounted so the gutter holds" },
      { part: "MenuRadioGroup", blurb: "Holds one chosen value among its radio rows. The value API is Base UI's, unchanged" },
      { part: "MenuRadioItem", blurb: "One choice in a radio group, marked by a dot when chosen" },
      { part: "MenuSub", blurb: "A nested menu's root: state and wiring only, with no element of its own" },
      { part: "MenuSubTrigger", blurb: "The row that opens a child menu. It stays lit while the child is open, and the chevron says which way it opens" },
      { part: "MenuSubContent", blurb: "The child panel. It opens to the side, with its first row aligned to its trigger" },
    ],
  },
  {
    slug: "select",
    name: "Select",
    family: "Surface",
    spec: "§20, §21, §23",
    blurb:
      "A form control that holds a choice. The panel, the rows and the corner all come from Menu with nothing re-designed. What is new is the trigger: a field-shaped button, so a Select beside a TextField reads as the same family, with the same fill, edge and height, while staying a real button that announces itself as a combobox. Base UI renders a hidden input, so a Select submits with a form like the native element it replaces. The part names follow shadcn/ui's select (MIT), with credit.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "set it on the root. The trigger and the option rows both take it" },
      { name: "items", values: "Record<value, label>", note: "value to label for the closed trigger. Base UI reads labels from mounted options, and a panel that never opened has none, so pass this whenever a defaultValue paints first" },
      { name: "backdrop", values: "boolean", note: "says content passes behind the trigger, so the theme's glass can show. Unset, it follows the surrounding <Box backdrop> region" },
    ],
    refusals: [
      {
        name: "readOnly",
        why: "HTML says readonly does not apply to a select, so there is no native appearance to copy and no expectation to meet. A value that must submit but cannot change is a disabled trigger beside a hidden input, or the value rendered as Text.",
      },
      {
        name: "a Separator inside the panel",
        why: "The panel is the listbox, and a listbox may contain only options and groups. A separator in it is markup an accessibility scan reports as a violation, from library code you cannot fix. Use a group instead: a group divides options in the accessibility tree as well as on screen.",
      },
      {
        name: "emphasis and tone on the trigger",
        why: "A form control does not rank. Loudness orders actions, and a form where one field is louder than the next is pointing at itself.",
      },
      {
        name: "SelectValue as a part",
        why: "A part whose only job is to stand where the value goes earns a prop, not an element. The trigger renders the value itself and takes a placeholder.",
      },
      {
        name: "render and children on the trigger",
        why: "The value is the trigger's content. Re-rooting the trigger would reopen the accessibility question Base UI already answers with a real button that announces role=combobox.",
      },
      {
        name: "the scroll arrows",
        why: "The panel places the chosen row on top of the value it replaces, in the way macOS does. Base UI pairs that placement with arrows at the top and bottom, and those are refused: they are a mouse-only affordance, the panel already scrolls by wheel, trackpad and keyboard, and an arrow is a control this system has not designed.",
      },
      {
        name: "multiple",
        why: "A multi-select is a different control wearing the same name: a different way to show the value, a different indicator, and different form behaviour.",
      },
    ],
    parts: [
      { part: "SelectTrigger", blurb: "The field-shaped button that reports the choice. Fill, edge and height come from the field family, and the chevron is muted" },
      { part: "SelectContent", blurb: "The floating panel: it portals, positions, re-applies the theme, and is never narrower than its trigger" },
      { part: "SelectItem", blurb: "One option row. Its indicator stays mounted so the gutter holds, and it takes the accent fill when chosen" },
      { part: "SelectGroup", blurb: "Groups option rows so a label can name them, and wires the group's accessible name for you" },
      { part: "SelectLabel", blurb: "A heading for a run of option rows. It sits out to the left of the option text by the width of the tick's reserved gutter, which is what macOS does" },
    ],
  },
  {
    slug: "notice",
    name: "Notice",
    family: "Surface",
    spec: "§29",
    blurb:
      "A condition that is true right now, stated on the region it is about. The person did not cause it, so it is not a receipt, and it lasts while the condition lasts, so it is not transient. It takes layout space and never floats, because a strip that hovered would cover the content it is telling you about. It carries at most one action that resolves the condition and one dismissal that only acknowledges it.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "sets the whole strip: the padding, the corner, the symbol's grid, the dismiss button and the message. A surface normally never sizes the type inside it, and the exception is type the system owns. A notice is one sentence in a fixed arrangement rather than a composition you built, so it uses the alert dialog's own steps and the two cannot drift. State a step on your own Text and yours still wins. It rests at 2 rather than a card's 3, because a notice is a strip across the top of something rather than an object in its own right" },
      { name: "backdrop", values: "boolean", note: "says content passes behind this strip, so the theme's material can show. Pin a notice over a scrolling region and it can be glass. Leave it in flow and it resolves solid and costs nothing. A glass strip scopes everything inside it, so its action button never paints a second layer of glass" },
      { name: "tone", values: "the ten families", note: "the category, never the volume. It rests neutral, and a warning can be grey. The tone tints the box and re-scopes the ink, so the words follow the box without you colouring anything" },
    ],
    refusals: [
      {
        name: "a position, and the name Banner",
        why: "Placement is yours: in flow above the region it concerns, or handed to the Shell to pin at the top. Atlassian needs both Banner and SectionMessage because their difference is where each one sits. Here a component never owns its position, so there is one component and the parent places it.",
      },
      {
        name: "Toast, and any transient version of this",
        why: "Refused across the system, not only here. If an action deserves attention it gets that attention before it runs. A toast is important enough to say and too late to act on. Undo belongs in an undo stack, and a copy confirmation belongs on the button that copied.",
      },
      {
        name: "a title, a description and any fixed anatomy",
        why: "Nothing non-visual forces them. The role sits on the root, the symbol is decorative, and the two verbs are slots. A notice that needs a heading and several paragraphs is a Card.",
      },
      {
        name: "more than one action",
        why: "One slot, and it holds the verb that resolves the condition. A strip with two competing actions is a form. A notice offering neither an action nor a dismissal is a Text in a box: write the sentence and delete the box.",
      },
      {
        name: "remembering its own dismissal",
        why: "onDismiss is a callback and there is no internal state. A notice that dismissed itself would forget on reload, and a close button the app cannot honour is a close button that lied. Pass nothing and no dismissal renders at all.",
      },
      {
        name: "a shadow",
        why: "A notice never casts a shadow, in a flat theme or an elevated one. A shadow belongs to a box that is a plane of its own, which is why a field does not cast one and why a ground does not either. A notice is a marker on a plane: a strip inside a card, or across a page. On glass it keeps the pool the material gives every pane, which is not the same thing as the lift the app says.",
      },
      {
        name: "an icon set",
        why: "The package ships no icons. The slot is safe when empty, takes whatever your app draws, and is hidden from assistive technology, because the words are the message.",
      },
    ],
  },
  {
    slug: "progress",
    name: "Progress",
    family: "Indicator",
    spec: "§11, §19",
    blurb:
      "A track with a fill in it. It has no grip, so it needs no hit area and takes no focus. Give it a number and it reports a fraction. Give it null and it sweeps to say that something is happening without saying how far along it is.",
    axes: [
      { name: "value", values: "number | null", note: "null sweeps, which means the work started and you cannot say how far it has got" },
      { name: "min / max", values: "number", note: "0 and 100 by default. The bar reports a fraction, so any pair of numbers works. It shows no number itself: put a formatted value in a sibling Text" },
    ],
    refusals: [
      {
        name: "size",
        why: "The slider's track ladder is a fraction of a slider's thumb, and a bar has no thumb, so riding it would size the bar against a box it does not have. It uses one stated thickness instead, and takes its width from the container.",
      },
      {
        name: "tone",
        why: "Left open rather than decided. A failed upload in the destructive family is real vocabulary, but adding an axis on the day a component ships is guessing.",
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    family: "Control",
    spec: "§4, §6, §11",
    blurb:
      "The checkbox's shape sibling. Its circle carries the role: a square radio reads as a checkbox, so the radius axis never reaches it. It is one of only four shapes in the system that no theme can square off.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "the mark ladder, shared with Checkbox and the slider thumb" }],
    refusals: [
      { name: "tone and emphasis", why: "The same as Checkbox: neutral when off and accent when on is an identity, not an axis." },
      { name: "readOnly", why: "The same as Checkbox: HTML does not define readonly for a radio, so there is no appearance to inherit." },
    ],
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    family: "Control",
    spec: "§11",
    blurb:
      "Base UI's group, wrapped with no CSS at all. It exists for the keyboard and the form value, not for a look. `render` is open, so the group can be a Stack.",
    axes: [{ name: "value / defaultValue", values: "string", note: "the group owns the selection" }],
    refusals: [{ name: "any visual prop", why: "The group is wiring. What it looks like is whatever layout you render it as." }],
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    family: "Surface",
    spec: "§10",
    blurb:
      "Custom scrollbars over native scrolling. The browser keeps the physics, and the system draws the bar: a capsule thumb over the content, visible while you scroll or hover, with no drawn track and no reserved gutter. One export, because the viewport, the bars and the corner are assembly rather than API.",
    axes: [
      { name: "focusable", values: "boolean", note: "a standalone region keeps its keyboard tab stop. A component that already owns keyboard scrolling, such as Menu, passes false" },
    ],
    refusals: [
      { name: "size", why: "One stated thickness. A scrollbar has no box of its own to index against." },
      { name: "tone and emphasis", why: "It ranks nothing and means nothing. It shows you where you are in the content." },
      { name: "material", why: "It draws over content inside a pane, and the pane already answered the theme." },
      { name: "render", why: "The anatomy is Base UI's contract. The parts are assembly you cannot reach." },
      { name: "orientation", why: "Both bars are declared, and Base UI mounts only the ones the content needs, after it measures. Which bars appear is a fact about the content, not a prop." },
    ],
  },
  {
    slug: "separator",
    name: "Separator",
    family: "Surface",
    spec: "§11",
    blurb:
      "The quiet hairline as its own element: one colour and one thickness, both already designed. Its length is the container's, which is the outer-spacing rule applied to size.",
    axes: [{ name: "orientation", values: "horizontal | vertical", note: "the one prop. A vertical hairline is the same two tokens with the axes swapped" }],
    refusals: [
      { name: "children", why: "A labelled divider is a composition: two separators and a Text, not a prop." },
      { name: "a length prop", why: "The container decides the length, which is the same rule that refuses margin everywhere." },
      { name: "decorative", why: "A rule that has to hide from assistive technology is not a Separator. It is a styled Box." },
    ],
  },
  {
    slug: "shell",
    name: "Shell",
    family: "Layout",
    spec: "§27",
    blurb:
      "The app frame: a header, a rail, a sidebar, the content, an inspector and a bottom pane. Each pane places itself in one grid, so the Shell never inspects its children and DOM order stays reading order. A pane nobody has touched rests on auto, and CSS decides what auto means for the current window size, so first paint is right with no script. State lives on each pane, in the same controlled pattern Dialog uses. The only thing that crosses the frame is a trigger finding a pane by name.",
    axes: [
      {
        name: "flush",
        values: "boolean, per pane (default true)",
        note: "is this pane part of the app frame. A flush pane is level with the page: no fill, no corner and no edge of its own, and the app's page shows through. One hairline separates two flush panes, and exactly one of them owns it, because a pane draws only its inner edge. One exception the app never states: a pane presenting as an overlay is not in the frame while it does so, so a drawer takes the surface identity back. Turn it off and the pane floats over the content or grounds beside it, whichever is true, and a floating pane picks up the theme's material because it is the one with something behind it",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        values: "per pane",
        note: "Dialog's controlled pattern. Omit both and the pane is auto, resolved by CSS per window size and explicit after the first toggle. Passing open conditionally works: a preview mode can pin a pane closed and hand control straight back, and the pane returns to the state the user last left it in",
      },
      { name: "presentation", values: "auto | fixed | overlay", note: "how an open pane presents: in flow, or over the content behind a scrim, where Escape closes it, the rest of the shell goes inert and focus returns. auto follows the window size" },
      { name: "width / height", values: "number (px)", note: "a raw length, on purpose: a pane's width is your content speaking, and no ladder can size it. Not on the rail, whose width is its square plus its air, so the rail takes a size index instead" },
      { name: "size", values: "1 | 2 | 3 | 4 (on Shell, and per pane)", note: "the index a pane is drawn at. It sets the pane's own padding first, and then everything the pane holds: nav rows, rail squares, the header's row. Set it once on Shell and every pane takes it. Set it on a pane to overrule the app there, which is how a reading column gets more of a safe area than the list of links beside it. It sets the pane's corner too, so a pane pulled off the frame wears the corner a Card of that size wears. On the rail and the header it also sets the pane's extent, because a column of squares is as wide as a square plus its air and a header is as tall as its row plus the same. At one index a header is exactly as tall as the rail is wide. It is never the pane's width: an extent is content speaking and has no ladder, which is why width is a raw number and this is an index" },
    ],
    refusals: [
      { name: "a gap prop", why: "Floating is the gap. The distance is one layout-space step, so a compact app's frame tightens with the rest of its distances. A per-shell number is how a frame drifts off its own app's rhythm." },
      { name: "a header position axis", why: "The header is full-width by definition. A header that is not full-width is a header inside ShellContent. One geometry, and the other arrangement is a composition." },
      { name: "a thin sidebar mode", why: "A thin sidebar is a rail wearing a sidebar's name, which puts the same region in the tree twice. Rail and sidebar are independent columns here, and an app that wants them linked writes three lines." },
      { name: "a close-cascade between rail and sidebar", why: "It is not universally true. VS Code's columns are independent and Slack's rail cannot close. That makes it an app's opinion, not a frame rule with a conflict protocol." },
      { name: "drag-to-resize (deferred, not refused)", why: "A drag is JavaScript on every pointer move, so it lands with a written exception plus minimum and maximum widths, persistence and the ARIA wiring. The room is already there: a drag writes the same custom property the width prop writes today." },
      { name: "peek", why: "Deferred until a real screen asks for it. A pane that slides half open costs a context slice, absolute overlays and per-pane CSS, and it carries very little." },
      { name: "a floating or stacked presentation value", why: "A pane over the content and a pane pulled off the frame are one idea, and it is flush={false}. The pane leaves the tiling, and what it becomes is derived from whether the content is underneath it. There is no third presentation to choose." },
    ],
    parts: [
      { part: "ShellHeader", blurb: "The full-width top bar, and a real <header> landmark. A header that is not full-width belongs inside ShellContent. Its height is the frame's, not its content's: one control row at the pane's index, inside the pane's padding. Anything shorter centres in it rather than defining it, and anything taller grows it, because the row is a floor" },
      { part: "ShellRail", blurb: "The narrow icon column that switches sections: a <nav>, independent of the sidebar. Give each nav an aria-label when both are present" },
      { part: "ShellSidebar", blurb: "The wide navigation column: a <nav>. Untouched, it rests open on a roomy window and closed on a narrow one, with no script deciding" },
      { part: "ShellContent", blurb: "The work area: a real <main> that scrolls itself and takes whatever room the other panes leave. The one pane every shell should have. It pads like every pane, so a picture or a canvas that wants the whole box says m=\"bleed\", and a ShellScroll inside it reaches the edges on its own" },
      { part: "ShellRailItem", blurb: "One square in the rail, for a high-level region rather than a row. Icon-only, because narrow is part of what a rail means: the moment it carries words beside the icon it reads as a small sidebar. aria-label is required, current both announces and paints, and the paint is inset while the whole column still takes the press" },
      { part: "ShellRailList", blurb: "A run of rail squares. A rail usually has two: the regions at the top, and the account and settings squares pinned at the bottom. The second run holds plain actions that are never current" },
      { part: "ShellScroll", blurb: "The one region of a pane that scrolls. Mark it and everything else in the pane pins by being an ordinary child: the pane becomes a column, this takes the leftover room, and the pane stops scrolling itself. It is a ScrollArea, so the custom scrollbars arrive with it. It is a pane fact rather than a sidebar one, because the inspector and the bottom pane have the same shape of a pinned header over a scrolling body" },
      { part: "ShellNavGroup", blurb: "A cluster of nav rows under a heading. It carries role=group and points aria-labelledby at its own label, so the heading is announced as well as seen" },
      { part: "ShellNavItem", blurb: "One row of navigation. It stands level with a Button, which a menu row does not, because a menu row lives in a panel opened for a second while this sits beside real buttons all day. `current` both announces with `aria-current` and paints, and it paints in a different colour from hover: grey means your pointer is here, accent means this is where you are" },
      { part: "ShellInspector", blurb: "The right-hand detail column: an <aside> that rests closed until it is asked for. Pass defaultOpen for one that starts open" },
      { part: "ShellBottom", blurb: "The bottom pane for a terminal or a log: an <aside> spanning the full width below the columns, resting closed" },
      { part: "ShellTrigger", blurb: "The one thing that crosses the frame: a button that drives a pane by name. It stamps aria-expanded and aria-controls, and composes over a Kookie Button with render" },
    ],
  },
  {
    slug: "slider",
    name: "Slider",
    family: "Control",
    spec: "§4, §11",
    blurb:
      "A value you set along a length. The root is the control, so the whole strip is pressable and it stands as tall a target as the Button beside it. A range slider is the same component: pass an array and a thumb renders for each entry.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "the height ladder for the target, and the mark ladder for the thumb" },
      { name: "value / defaultValue", values: "number | number[]", note: "an array makes it a range" },
    ],
    refusals: [
      { name: "tone and emphasis", why: "A value is not an action, and a form where one slider is louder than the next says nothing." },
      {
        name: "orientation",
        why: "A vertical slider needs its own designed measurements: how far the thumb travels, how thick the track is, and every cell of both. It ships the day something needs it, rather than as a prop that renders undesigned geometry today.",
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    family: "Indicator",
    spec: "§8",
    blurb:
      "A busy indicator that costs one composited transform and no JavaScript. The spokes are real shapes rather than a gradient, and the animated element is the wrapper rather than the SVG, because an SVG root's transform is not reliably composited and this control's one job is to keep moving while the main thread is busy.",
    axes: [],
    refusals: [
      {
        name: "a size prop",
        why: "It occupies the icon box, so swapping a spinner in for an icon shifts nothing. On its own it takes the size-2 box.",
      },
      { name: "a colour prop", why: "It draws in currentColor, which is correct in every context with no token at all." },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    family: "Layout",
    spec: "§3",
    blurb: "Box with a column flex preset. It is the most common layout in any app, named so that nobody writes it out again.",
    axes: [{ name: "gap / align / justify", values: "the flex vocabulary", note: "gap through the layout-space layer" }],
    refusals: [{ name: "dividers", why: "A rule between rows is a Separator you place, not a prop that guesses where you wanted one." }],
  },
  {
    slug: "segmented-control",
    name: "SegmentedControl",
    family: "Control",
    spec: "§4, §11, §19, §26",
    blurb:
      "One choice among a few, all shown at once. It is a radio group, not a row of toggle buttons, because picking one of several is what a radio group is, and that is what a screen reader then hears. The track stands level with the Button beside it, each segment is the channel minus a fixed inset, and the chosen segment is the grip.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "sets the track. The segments derive from the channel, so they never state an index of their own" },
    ],
    refusals: [
      {
        name: "tone and emphasis",
        why: "The family has one tone, as an identity. A segment louder than its neighbours is not a segmented control.",
      },
      {
        name: "an indicator element",
        why: "The chosen segment paints its own box. Base UI's RadioGroup does not measure the selection for you, so a sliding indicator here would mean writing the measurement for a motion nobody has designed.",
      },
      {
        name: "multi-select",
        why: "Two options on at once is a set of toggle buttons, which is a different component. A radio group holds exactly one answer.",
      },
      {
        name: "nativeButton and render",
        why: "Set nativeButton on a segment and Space stops selecting it, which is the bug the checkbox closed on this same primitive.",
      },
      { name: "readOnly", why: "The same as Radio: HTML has no read-only selection control, so there is no appearance to inherit." },
    ],
    parts: [
      { part: "SegmentedItem", blurb: "One segment: a control hosted in the channel, holding its own label and reporting its own checked state" },
    ],
  },
  {
    slug: "switch",
    name: "Switch",
    family: "Control",
    spec: "§4, §6, §11, §19",
    blurb:
      "An on and off control. Its track is one step up the mark ladder from a checkbox, which is the relationship every peer arrives at by hand. Off is a neutral channel with its edge melted into it, so you feel for it rather than read it as a small surface.",
    axes: [{ name: "size", values: "1 | 2 | 3 | 4", note: "one index up the mark ladder, with its own width for each step" }],
    refusals: [
      { name: "tone and emphasis", why: "The same as every mark: neutral when off, accent when on, as an identity rather than an axis." },
      { name: "children", why: "The label is a sibling, as it is for every mark. The row sets the distance between them." },
      {
        name: "readOnly",
        why: "The same answer Checkbox gives. A read-only switch is a disabled one with a different name.",
      },
    ],
  },
  {
    slug: "tabs",
    name: "Tabs",
    family: "Control",
    spec: "§11, §15, §26",
    blurb:
      "A bar of places you can go, and the one you are on. The active tab is marked by ink and a rule, never by a louder fill or a heavier label: a fill would make it read as a button among links, and a heavier weight is wider, so the bar would reflow every time you switch.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "on the list, once. A bar of mixed sizes is not a thing anyone means" },
    ],
    refusals: [
      {
        name: "tone and emphasis",
        why: "A bar where one tab is louder than the next says nothing. Which tab is active is a state, not a loudness a call site picks.",
      },
      {
        name: "TabsTrigger and TabsContent",
        why: "These are shadcn's names, and the one place this package does not take them. A trigger here opens a floating layer, and a tab opens nothing. TabsPanel follows the role it announces.",
      },
      {
        name: "material",
        why: "A tab bar paints no pane. There is nothing behind it to blur, so glass has nothing to do.",
      },
      { name: "an exported indicator", why: "The rule is structure, not API. A consumer who has to place it is one who will forget." },
    ],
    parts: [
      { part: "TabsList", blurb: "The bar, the hairline, and the one place the size is set. It places the rule itself, so nobody has to remember to" },
      { part: "TabsTab", blurb: "One tab: a control on the height ladder wearing the quiet colour, marked active by ink rather than by a fill" },
      { part: "TabsPanel", blurb: "What the tab reveals. It paints nothing: a region that draws its own box is a Card" },
    ],
  },
  {
    slug: "text",
    name: "Text",
    family: "Type",
    spec: "§15",
    blurb:
      "Body copy. A step on the ramp sets three things at one index: font size, line height and letter spacing. It renders a span, because flow is the layout layer's job, so a paragraph is render={<p/>}.",
    axes: [
      { name: "size", values: "1-9", note: "defaults to 3, the anchor step" },
      { name: "weight", values: "regular | medium | semibold", note: "token names, never numbers" },
      { name: "emphasis", values: "loud | medium | quiet", note: "rests loud. Full contrast is the correct resting state for reading" },
      { name: "tone", values: "any family", note: "moves the three ink colours onto that family" },
    ],
    refusals: [
      { name: "a colour prop", why: "tone says the meaning and the theme resolves the colour. A raw colour goes through style, where a reviewer can see it." },
      { name: "margin", why: "Type owns no outer spacing. The margin is zeroed whatever element render names." },
      { name: "bold (700)", why: "Semibold is the heaviest weight, and every heading rests there. Hierarchy is size and the ink colours, both already designed. The token is deleted too, so nothing can reach it by hand." },
    ],
  },
  {
    slug: "text-area",
    name: "TextArea",
    family: "Control",
    spec: "§4, §11",
    blurb:
      "One element, no wrapper and no slots. TextField needs a wrapper because an icon inside the border forces the border off the input. A textarea has no slots, so the border stays on the element. Its padding is the same inset on all four sides, because every real textarea is a paragraph.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "the control height survives as a minimum height. Growth is rows" },
      { name: "rows", values: "number", note: "the starting height, in lines of text" },
      { name: "backdrop", values: "boolean", note: "says content passes behind this, so the theme's glass can show. Unset, it follows the surrounding <Box backdrop> region" },
    ],
    refusals: [
      { name: "emphasis and tone", why: "A form where one field is louder than the next says nothing. The same argument as TextField." },
      { name: "resize", why: "It would rename raw CSS. Vertical-only is the shipped behaviour, and style is the escape." },
      {
        name: "cols",
        why: "The container sets the width. A textarea sized in characters uses a unit the type ramp does not use, so an 80-column box is a different width at every size step and every density.",
      },
    ],
  },
  {
    slug: "text-field",
    name: "TextField",
    family: "Control",
    spec: "§4, §9, §11",
    blurb:
      "A single-line input. The visible control is a wrapper around the input, which is what makes its slots real anatomy: a field that can hold an icon inside its border cannot keep that border on the input. ref goes to the input, and className and style dress the wrapper.",
    axes: [
      { name: "size", values: "1 | 2 | 3 | 4", note: "the control index. It sets the height, the side padding, the corner, the slot inset and the label step together. A control inside a slot derives its own box from that inset, so you never pick a second index" },
      { name: "leading / trailing", values: "ReactNode", note: "an icon, or a hosted control that keeps its own press" },
      { name: "backdrop", values: "boolean", note: "says content passes behind this, so the theme's glass can show. Unset, it follows the surrounding <Box backdrop> region" },
    ],
    refusals: [
      { name: "emphasis and tone", why: "Loudness ranks actions. A form where one field is louder than the next says nothing." },
      {
        name: "render",
        why: "Everywhere else render swaps the one element that is the component. Here there are two, and neither can move: the wrapper holds a border the input cannot, and the input has to stay an input or the platform wiring goes with it.",
      },
    ],
  },
  {
    slug: "theme",
    name: "Theme",
    family: "Layout",
    spec: "§5, §7, §12, §19",
    blurb:
      "Where an app sets its identity. Seven axes, each re-pricing tokens for everything below it. Themes nest, so a section can override the page. Every prop answers a question that call sites are then not allowed to answer one at a time.",
    axes: [
      { name: "appearance", values: "inherit | light | dark", note: "resolved output, never a colour you pass" },
      { name: "contrast", values: "normal | high", note: "an accessibility setting, not a design knob. It is where the contrast floors bind for edges and fills" },
      { name: "radius", values: "none | small | medium | large | full", note: "picks a set of hand-drawn values per level, not a factor" },
      { name: "density", values: "compact | default | comfortable", note: "controls only. It buys room, and it never touches type" },
      { name: "pointer", values: "auto | fine | coarse", note: "two complete sets of measurements, in the way there are two colour modes" },
      { name: "depth", values: "flat | elevated", note: "does light exist in this app. It is the one thing that reads the shadow palette" },
      { name: "material", values: "solid | thin | regular | thick", note: "what the app is made of. One value for the whole scope. Where the glass shows is decided by placement: a component renders it only where a backdrop is stated" },
    ],
    refusals: [
      {
        name: "an accentColor prop",
        why: "Accent is written as a hue in the config and baked by the generator, so it is one app-wide identity rather than a per-subtree choice. A runtime prop would mean shipping every family's whole ladder for every subtree.",
      },
      {
        name: "a scale prop",
        why: "The factor is wired and the prop is deferred. It reopens the day a real need names the steps, and it will ship as designed steps rather than a free multiplier.",
      },
      {
        name: "an elevation axis",
        why: "Deleted. Nothing ever varied it per call site, so it was a component fact wearing an axis's clothes. depth is what survived of it.",
      },
      {
        name: "a look axis",
        why: "Deleted. Its two control values had converged on one appearance, and its second surface value was never used: the borderless pane is the one surface identity. A tinted surface can return as a Theme value the day a real app wants one.",
      },
    ],
  },
];

export const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));
