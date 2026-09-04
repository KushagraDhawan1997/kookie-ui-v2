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
  /**
   * ONE SENTENCE: what the thing IS. It is the page's deck, the search index's first words,
   * the builder inspector's header and the page metadata's description — the line a reader
   * meets before they have decided to read anything.
   *
   * It replaced `blurb` on 2026-09-05 rather than joining it. A blurb was two or three
   * sentences doing an abstract's job and a discussion's at once, so every surface showing it
   * showed a paragraph where it wanted a line, and this file would otherwise have carried the
   * same words twice.
   */
  abstract: string;
  /** The discussion, in short literal paragraphs. What the abstract cannot hold. */
  overview: string[];
  /** What it refuses, and why. The system's argument. */
  refusals: { name: string; why: string }[];
  /** Parts of a compound component, explained here rather than on stub pages of their own.
      The coverage law accepts either home, and holds part blurbs to a floor. */
  parts?: { part: string; blurb: string }[];
  /**
   * The composition, as code — what a declaration is for a class.
   *
   * Only a compound component states one, and the absence is the design: a component with no
   * parts has no shape to show, so `<Button>Save</Button>` would be a worse Example than the
   * live one already on the page. Apple prints a declaration because a class HAS one; ours is
   * the arrangement of parts, and a component with a single symbol has none.
   */
  declaration?: string;
  /**
   * The symbols, grouped by the job they do. Apple's Topics: a reader arriving with a task
   * finds the name, and a reader arriving with a name finds the anchor.
   *
   * Compound components only, for the same reason as `declaration` — one symbol is not a
   * grouping. Every symbol here is the entry's own name or one of its parts, and every part
   * appears in exactly one group, held by a law: an index that has drifted from what it
   * indexes is worse than no index, because a part left out renders on no page at all.
   */
  topics?: { title: string; symbols: string[] }[];
  /**
   * A live specimen lives in `examples/<slug>.tsx`: one real file, rendered here and shown as
   * source. It is not a field. The file name is the slug, so there is no mapping to keep in
   * step, and a law walks both directions.
   */
};

export const ENTRIES: Entry[] = [
  {
    slug: "accordion",
    name: "Accordion",
    family: "Control",
    spec: "§11, §21, §37",
        abstract: "Accordion stacks sections that open and close, one under the other.",
    overview: ["Each heading stands as tall as a Button at the same size, underlines under the pointer and turns its chevron when its panel opens; the panel slides open by height and its words start under the heading's label. One section is open at a time unless you say multiple. It paints no box of its own: put it in a Card when it wants one."],
    declaration: `<Accordion multiple defaultValue={["shipping"]}>
  <AccordionItem value="shipping">
    <AccordionTrigger>Shipping</AccordionTrigger>
    <AccordionPanel>Orders ship within two business days.</AccordionPanel>
  </AccordionItem>
</Accordion>`,
    topics: [
      { title: "Stacking the sections", symbols: ["Accordion", "AccordionItem"] },
      { title: "Opening and closing one", symbols: ["AccordionTrigger", "AccordionPanel"] },
    ],
    refusals: [
      { name: "A horizontal orientation", why: "Sections side by side are a different thing with a different keyboard, and nothing here has asked for one. The vertical stack is the accordion." },
      { name: "`tone` and `emphasis`", why: "A list of headings has no meaning of its own to colour and no heading is louder than the next. The words inside a panel can carry a tone through Text." },
      { name: "An icon slot or a custom chevron", why: "The chevron is the system's disclosure glyph, the same one the Tree turns. A different glyph per accordion would mean two ways to say open." },
      { name: "A boundary of its own", why: "An accordion is a list of headings in whatever surface it sits in. Give it a Card when it wants an edge; the hairlines between items are all it draws." },
    ],
    parts: [
      { part: "AccordionItem", blurb: "One section: a trigger and its panel, named by value for the root's value array" },
      { part: "AccordionTrigger", blurb: "The section's heading: a heading element at the level you state, holding a button that stands as tall as a Button of the same size" },
      { part: "AccordionPanel", blurb: "The section's content, opening and closing by height on the geometry clock, its words starting under the heading's label" },
    ],
  },
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    family: "Surface",
    spec: "§10, §20, §25",
        abstract: "AlertDialog asks a question with two answers.",
    overview: ["It holds a title, a description, a cancel button and an action button, and it lays those out itself. It is separate from Dialog because the two do different jobs: a dialog holds work you asked for, and an alert stops you to ask something. It uses `role=alertdialog`, it does not close when you press outside it, and its contents are fixed. The part names follow shadcn/ui's alert-dialog (MIT), with credit, and the behaviour is Base UI's AlertDialog."],
    declaration: `<AlertDialog>
  <AlertDialogTrigger render={<Button tone="destructive">Delete\u2026</Button>} />
  <AlertDialogContent>
    <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
    <AlertDialogDescription>Everything in it goes with it.</AlertDialogDescription>
    <AlertDialogCancel>Keep it</AlertDialogCancel>
    <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>`,
    topics: [
      { title: "Asking the question", symbols: ["AlertDialog", "AlertDialogTrigger"] },
      { title: "Presenting the panel", symbols: ["AlertDialogContent"] },
      { title: "Wording it", symbols: ["AlertDialogTitle", "AlertDialogDescription"] },
      { title: "The two ways out", symbols: ["AlertDialogCancel", "AlertDialogAction"] },
    ],
    refusals: [
      {
        name: "A width prop",
        why: "The width is fixed per size, and narrower than a dialog at the same index. An alert asks a question. It does not hold work. On a phone the window gutter still wins.",
      },
      {
        name: "Closing on an outside press",
        why: "A stray press must not answer a question about deleting something. Escape still closes it, because a keyboard user saying `not now` is the Cancel action by another route.",
      },
      {
        name: "Header and Footer",
        why: "The component arranges the title, the description and the action row itself, so you never write a Stack. Cancel comes first in the DOM, which places it at the start and gives it initial focus. Document order picks the safest action.",
      },
      {
        name: "`render` on Cancel and Action",
        why: "The alert owns the size of its two buttons and the row that splits them. Both are real Kookie Buttons. Action defaults to loud, which is correct here and nowhere else: an alert has exactly one Action, so the one-focal-action rule holds by the anatomy rather than by memory.",
      },
      {
        name: "Arbitrary `children`",
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
    slug: "attachment",
    name: "Attachment",
    family: "Surface",
    spec: "§43",
        abstract: "Attachment is one file and what is happening to it.",
    overview: ["It is not part of the composer, because a file about to be sent and a file already sent are the same tile, so the tile cannot belong to the thing that sends. The system draws the state and the app owns the file: every value is a prop you set from state you already have, and the component never sees a File, never starts a timer, and never mints a URL it would have to revoke."],
    refusals: [
      {
        name: "A done state",
        why: "The spec named five and this ships four. A file about to be sent and a file already sent are the same tile, which makes done and idle one appearance, and a value that cannot be told from another is not a value — this system deleted a whole axis for that reason. What separates a pending attachment from a sent one is what you put in the tile: a remove button before, a download after.",
      },
      {
        name: "`tone`",
        why: "The state is the category. An error tile reads destructive because it failed, not because you chose a colour. A second colour axis would let you paint success on a failed upload, which is a sentence the system should not be able to write.",
      },
      {
        name: "Holding the file",
        why: "It never receives a File, reads bytes, or creates an object URL. Version one of this idea did, and revoked the URL one commit after handing it on, so the preview of the message you just sent was already broken. Give it a name, a state, and an icon you drew.",
      },
      {
        name: "A built-in preview",
        why: "An image goes in the icon slot, already decoded by you. A component that fetched or decoded one would own the file it is not allowed to own.",
      },
      {
        name: "`emphasis`",
        why: "A tile is one thing at one volume. Nothing here gets louder or quieter: what changes its weight is the state, and the state is not a preference.",
      },
      {
        name: "A shadow",
        why: "It never casts, in a flat theme or an elevated one. A shadow belongs to a box that is a plane of its own; a tile in a composer's strip is content on that composer's plane, the same reading that keeps a notice flat. On glass it keeps the pool every pane gets, which is what the material has rather than what the app says.",
      },
      {
        name: "`render`",
        why: "There are two elements here, the tile and its name, and neither can move. render would have to silently mean one of them.",
      },
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    family: "Type",
    spec: "§11, §35",
        abstract: "Avatar shows a person, a team or a thing as a small round picture, with initials or a generic figure standing in until the picture loads.",
    overview: ["Its box is one line of the text beside it, so an avatar next to a name in a list is list-sized and one in a page header is header-sized without a second number. A row of overlapped faces is an AvatarGroup, on its own page."],
    refusals: [
      { name: "A shape prop", why: "A person is a disc on every platform, at every radius level. A square picture is a picture, and you have Card and Box for that. A rounded square for a workspace waits for the screen that needs it." },
      { name: "`emphasis`", why: "No avatar is louder than the one beside it. Rank in a list of people is order and size, never a heavier face." },
      { name: "`tone`", why: "It was a prop for a day. Since no family paints a tinted wash, a tone could only colour the initials, which is too faint to be the per-person colour people want from it. A person's colour is their picture." },
      { name: "A status vocabulary", why: "Online, away and busy are an app's words. Pin a Badge with the badge prop for a count or a named dot, and say a status with a Chip in the row." },
      { name: "A press", why: "An avatar is inert. A person you can open is an icon-only Button with the avatar inside it: the avatar fills the button, so the two read as one disc, and the press has a name, a ring and a keyboard from the one place those live." },
      { name: "A max count on the group", why: "How many to show and what the rest reads as is a product decision. The group overlaps whatever you give it, and the rest is an Avatar whose fallback says +3." },
    ],
  },
  {
    slug: "avatar-group",
    name: "AvatarGroup",
    family: "Type",
    spec: "§35",
        abstract: "AvatarGroup shows several avatars overlapped, each ringed in the surface colour so the discs stay separate.",
    overview: ["It is a line of text with no words in it: a size on the group reaches every avatar inside that states none, and an avatar that states its own still wins. How many to show is yours, and the rest is an Avatar whose fallback says +3."],
    refusals: [
      { name: "A max count", why: "How many to show and what the rest reads as is a product decision. The group overlaps whatever you give it, and the rest is an Avatar whose fallback says +3." },
      { name: "A spacing prop", why: "The overlap is one share of a face, stated once in the system. A group that overlapped less would be a row of avatars, which is a Flex." },
    ],
  },
  {
    slug: "badge",
    name: "Badge",
    family: "Type",
    spec: "§11, §38",
        abstract: "Badge is the small mark that waits on a thing until you look: the number on an app icon, the unread dot on a tab.",
    overview: ["Bare, it is a dot. With a number in it, it is a pill. Both are bold by nature and sized as a share of the line they sit in, so a badge on a tab and one pinned to a large avatar are the same shape at two sizes. Pin one to an Avatar with its badge prop, at the top-end corner."],
    refusals: [
      { name: "`emphasis`", why: "A badge is loud by nature. A mark that whispers is not a mark, and a quieter one is a Chip with a word." },
      { name: "A status vocabulary", why: "Online, away and busy are an app's words, and the app decides which tone each one maps to. The badge takes the tone, never the word; if the word must show, it is a Chip." },
      { name: "An unnamed dot", why: "A bare dot is colour alone. The type requires an accessible name on it, so what a sighted reader infers, the name states." },
      { name: "A position of its own", why: "The thing it is pinned to owns the corner and the cut-out. Avatar takes a badge prop; nothing here decides where it sits." },
    ],
  },
  {
    slug: "chip",
    name: "Chip",
    family: "Type",
    spec: "§11, §15, §38",
        abstract: "Chip shows a short word or a count that says what the thing beside it is right now.",
    overview: ["It is built from the same parts as Code and Kbd: the same fill, the same corner and the same one-line box. What it adds is tone, so that words such as failed, running and done read the same way everywhere in a product."],
    refusals: [
      {
        name: "A fill scale, or a variant prop",
        why: "Tone is the category, not the volume. A chip does not come in loud. Two chips of different loudness on one screen say something about importance that neither of them means, and a failed deploy is destructive whether or not it is the most important thing on the page. Ranking is what emphasis does for actions.",
      },
      {
        name: "A dismissal",
        why: "A chip you can remove is a control: it takes focus, it answers a key, and it needs an accessible name for the removal. That is a different component and it is not built. A removable chip today is a Button.",
      },
      {
        name: "A count prop",
        why: "A chip renders what you give it. Formatting a number is the app's job, and where the cut-off sits — 99+, 9+, no cut-off at all — is a product decision that changes per surface.",
      },
      {
        name: "A position",
        why: "Apple's chip sits on its container: a tab, an app icon, a row. That is a position, and no component here owns its own position. Put a chip in the row beside a title, in a table cell, or over the thing it counts with a Box.",
      },
      {
        name: "An empty chip",
        why: "A chip is a word. The dot and the count that wait on a thing are a Badge, which requires a name when it is bare.",
      },
    ],
  },
  {
    slug: "blockquote",
    name: "Blockquote",
    family: "Type",
    spec: "§11, §15",
        abstract: "Blockquote sets body copy apart with a rule and an indent.",
    overview: ["How the text reads comes from the shared type layer. What Blockquote adds is the thin line down its leading edge and the indent that keeps the words clear of it."],
    refusals: [
      {
        name: "A tinted rule",
        why: "A chosen tone moves the words, not the bar. The rule sits where a Separator sits and carries no meaning of its own. A quote whose bar has to carry meaning is a different component: use a Notice if a live condition raised it.",
      },
      {
        name: "An attribution slot",
        why: "The line under a quote is a sibling Text. The system owns an anatomy only where something non-visual forces one, and nothing here does.",
      },
    ],
  },
  {
    slug: "box",
    name: "Box",
    family: "Layout",
    spec: "§2, §3",
        abstract: "Box is the layout engine every other layout component is built from.",
    overview: ["Flex, Stack and Grid are all Box with a fixed display and a shorter prop list. Box takes the full set: spacing, width and height, and the props a flex or grid child needs. Every value resolves through a token, and any prop can take a different value at each container size."],
    refusals: [
      {
        name: "Utility classes",
        why: "Values travel as inline custom properties into fixed rules, so a token and a raw string cost the same and the stylesheet never grows with the number of values used.",
      },
      {
        name: "A bleed prop",
        why: "It is a value on the margin rows, not a prop of its own. Every per-side and per-tier spelling already exists there, so bleed, bleedX and bleedTop would have meant seven new prop rows and a second mechanism writing margin.",
      },
      {
        name: "Containment by default",
        why: "A measurable box can never size itself around its contents, so a Box that was always a container collapsed to zero width inside a flex row. A plain Box hugs its content like a div. Put `container` on things the layout already sizes: a sidebar with a width, a growing column, a grid cell. A container Box left to shrink-wrap renders zero pixels wide, and a development build warns you.",
      },
    ],
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    family: "Type",
    spec: "§11, §39",
        abstract: "Breadcrumb shows the path to where you are: the places above this one, each a way back, ending in the place you are now.",
    overview: ["It is a navigation landmark holding an ordered list, so a screen reader can find it by name and read it as a path. It draws the chevron between the crumbs itself, so no page has to place them and no two pages can use different ones."],
    declaration: `<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/">Home</BreadcrumbLink>
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbEllipsis items={hidden} />
  </BreadcrumbItem>
  <BreadcrumbItem>
    <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
  </BreadcrumbItem>
</Breadcrumb>`,
    topics: [
      { title: "Drawing the path", symbols: ["Breadcrumb", "BreadcrumbItem"] },
      { title: "The places above this one", symbols: ["BreadcrumbLink", "BreadcrumbEllipsis"] },
      { title: "Where you are", symbols: ["BreadcrumbPage"] },
    ],
    refusals: [
      {
        name: "`BreadcrumbSeparator`",
        why: "shadcn/ui has you place a separator between every pair of crumbs and leave it off the last. That is three things this system does not hand to you: it is layout wearing a part's name, it makes an off-by-one rule yours to keep by hand, and it lets each page pick its own chevron. The item draws its own chevron and the stylesheet hides the last one.",
      },
      {
        name: "`BreadcrumbList`",
        why: "A breadcrumb is always a landmark holding a list, so nothing would ever choose between the two. shadcn/ui splits them because its parts are styling hooks; the layout here is the system's, so the list is inside Breadcrumb and is not yours to dress.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A breadcrumb is a location, not a meaning, so it has no family to colour. Its three shades of text — the page you are on, the places you can go back to, and the punctuation between them — are the design, not a scale you pick a level from.",
      },
      {
        name: "`maxItems` and any automatic collapse",
        why: "Which levels to drop depends on the room and on which of them mean anything, and no component here decides what it shows. Render the crumbs you are keeping and hand the rest to a BreadcrumbEllipsis, which opens them.",
      },
      {
        name: "An ellipsis that does nothing",
        why: "Three dots say there is more here, which is a promise. shadcn/ui ships a static marker and then wraps it in a dropdown in the one example anybody copies, so the dead one stays reachable and is the one a reader presses first. Here the menu is the component and items is required, so a dead ellipsis cannot be written.",
      },
      {
        name: "Role=link and aria-disabled on the current page",
        why: "shadcn/ui announces the last crumb as a link that has been switched off. Both halves are false: there is nothing to follow, and nothing was disabled. aria-current on plain text is what the ARIA practices example carries.",
      },
    ],
    parts: [
      { part: "BreadcrumbItem", blurb: "One place on the path, and the chevron that follows it. The chevron is drawn here rather than placed by you, and the last item's is not drawn" },
      { part: "BreadcrumbLink", blurb: "A place above this one, and a way back to it. It is not a Link: a Link rests on the accent family, and a crumb carries no meaning, so it reads the plain foreground inks" },
      { part: "BreadcrumbPage", blurb: "Where you are: the end of the path, in the full ink, carrying aria-current=page. Not a link, because there is nothing to follow" },
      { part: "BreadcrumbEllipsis", blurb: "The stretch of the path you are not showing, and the way back into it" },
    ],
  },
  {
    slug: "button",
    name: "Button",
    family: "Control",
    spec: "§4, §8, §9, §41",
        abstract: "Button is the action control, and the one the shared control layer was built for.",
    overview: ["Loudness is its only ranking axis. You never set an appearance directly: the theme works it out from `tone`, `emphasis` and `bordered`, over whatever material the Theme says the app is made of."],
    refusals: [
      { name: "`margin`", why: "A component never sets outer spacing. The distance belongs to the container. The escape is <Box m>." },
      {
        name: "`variant`",
        why: "It fuses loudness with meaning, so it cannot express a quiet destructive action. `tone` and `emphasis` are separate props for exactly that reason.",
      },
      {
        name: "A shadow prop",
        why: "There is no elevation axis. Depth is an app identity, set once by Theme depth, and never chosen per component.",
      },
    ],
  },
  {
    slug: "surface",
    name: "Surface",
    family: "Surface",
    spec: "§10",
        abstract: "Surface is a ground: the region that objects sit on.",
    overview: ["A Card is an object, and a Surface is what holds it. Use it for a bounded region of a page that holds cards, or for a quieter region inside a card, such as a code block or a settings group. Its colour is a stated pair rather than one step down from its parent, because in dark mode a relative step would land lighter than the cards it holds."],
    refusals: [
      {
        name: "A fill or an edge prop",
        why: "The ground colour and the hairline are the component. Give it a fill and edge vocabulary and the first thing anyone builds is a fill plus a hairline, which is a second way to make a Card. A ground cannot pass for a card, so it cannot start that drift.",
      },
      {
        name: "A border toggle",
        why: "Button's `bordered` ranks: quiet, quiet with a border and medium say three different things about loudness. Two grounds, one lined and one not, would say the same thing. The line is also load-bearing in dark mode, where a ground sits barely above the page — #121213 against #0f0f10, a step of 0.011 in lightness — so the hairline is most of what says the region is there, and there is no palette step between the two colours to fall back on.",
      },
      {
        name: "`material` and `backdrop`",
        why: "Glass defends a pane against something passing behind it, and a ground's backdrop is its own parent. Inside a glass card a Surface joins the scope already there and opens none of its own. It does CLOSE a backdrop region, because the ground is opaque: a card sitting on one is not over content and resolves solid, exactly as it would on a solid card. A member that states its own backdrop still gets the theme's material.",
      },
      {
        name: "Tone, emphasis and a shadow",
        why: "Card's refusals, unchanged. A container ranks nothing against its siblings, and a region in the plane throws no shadow.",
      },
    ],
  },
  {
    slug: "card",
    name: "Card",
    family: "Surface",
    spec: "§9, §10",
        abstract: "Card is an object with its own surface: one solid fill, one corner and one padding, and nothing else.",
    overview: ["Its size sets the padding and the corner, never a height. What it does depends on the element you give it: render it as a button or a link and it becomes pressable, with the same state colours and motion every control has. Only the press distances differ, because a large box that moved as far as a button would look like the page was bending."],
    refusals: [
      {
        name: "A `selected` prop, and an `interactive` one",
        why: "The element says both instead. `<Card render={<button/>}>` is the pressable card, and `<Card render={<label/>}>` around a `Radio` is the chosen one, so the semantics, the keyboard, the form value and the announcement all belong to the primitive and the system supplies only the edge. A `selected` prop would be a second way to say what the radio already says, with nothing keeping the two in agreement. A disabled card is a disabled button and shows what one shows: the fill recedes, the words dim, the cursor stops promising, and the shadow goes.",
      },
      {
        name: "A card inside a card",
        why: "A card is an object with its own plane. Two of them stacked is an object standing on an object, which describes a relationship this system does not have. For a quiet region inside a card, use a Surface. For several objects on one ground, put the cards in a Surface. A development build warns you, the builder cannot express it, and the composition reviewer reports it.",
      },
      {
        name: "A material prop",
        why: "Material is a Theme value. It answers what the app is made of, which is one answer for a whole scope rather than a per-card choice. A subtree that has to differ uses a nested Theme. Where the glass shows is decided by placement: a component renders glass only where a backdrop exists.",
      },
      {
        name: "Tone, emphasis and bordered",
        why: "A card ranks nothing against its siblings. Its edge comes from light, not from a loudness level.",
      },
      {
        name: "A media or cover slot",
        why: "A card clips what it holds, and a child says it reaches the edge with <Box mt=\"bleed\" mx=\"bleed\">. Every peer solved this with a part of its own, such as Mantine's Card.Section, MUI's CardMedia and Ant's cover. Here the picture is a child that cancels the padding, not a region the card has to know about.",
      },
      {
        name: "Header and footer slots",
        why: "The system owns an anatomy only where something non-visual forces one, such as a dialog's focus wiring or a notice's status role. A card's regions are a layout, and a layout is something you compose.",
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    family: "Control",
    spec: "§4, §6, §11",
        abstract: "Checkbox is a control that is its own mark.",
    overview: ["Its box is exactly one line of its label's text, so it lines up with the words beside it and grows on a phone without anything being designed twice. Its tappable area extends to the size a Button of the same index would occupy, whether or not you can see that area."],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "Neutral when off and accent when on is an identity, not an axis. The family has one meaning and one way to show it.",
      },
      {
        name: "`children`",
        why: "A mark sits beside its label. The label is a sibling, and the row sets the distance between them.",
      },
      {
        name: "`readOnly`",
        why: "HTML does not define readonly for a checkbox, and every library that accepts it draws the control exactly like a live one. A state with no appearance is worse than no state.",
      },
    ],
  },
  {
    slug: "code",
    name: "Code",
    family: "Type",
    spec: "§11, §15",
        abstract: "Code shows inline code in the mono font, with a light fill behind it.",
    overview: [
      "Its size is optional: leave it unset and it takes the size of the line it sits in, so a value inside small text stays small without you repeating the index.",
    ],
    refusals: [
      {
        name: "A fill that gets louder with emphasis",
        why: "On type, emphasis picks an ink colour. A chip whose fill also climbed would be reading one prop two ways in one element.",
      },
      {
        name: "Block code",
        why: "A code block owns overflow, wrapping and a scroll container. That is a different component, not a mode of this one.",
      },
    ],
  },
  {
    slug: "code-block",
    name: "CodeBlock",
    family: "Type",
    spec: "§15, §40",
        abstract: "CodeBlock shows a block of code in a well recessed into the page.",
    overview: ["Long lines scroll sideways rather than wrapping, because a wrapped line breaks where the language does not. Give it maxLines and the well stops at that many lines and scrolls; nothing is ever clipped away, so every line stays reachable by wheel, keyboard and screen reader. Size sets the pane and the code together. It ships no highlighter, and it does ship the colours one uses: point a highlighter at the --code- variables and every colour it draws is one the system already solved against the surface it sits on."],
    refusals: [
      {
        name: "Highlighting",
        why: "Turning code into coloured spans means shipping a grammar for every language, and the choice of tokenizer belongs to whatever builds your pages. The colours are the system's part, and it publishes them as --code- variables that any highlighter's CSS-variables mode can be pointed at.",
      },
      {
        name: "Wrapping, and a switch for it",
        why: "A wrapped line puts a break where the language has none, which changes what the code says. The well scrolls instead, which is also why a long line is safe here.",
      },
      {
        name: "A copy button, line numbers, and a collapse",
        why: "Those are behaviour and markup, not the well. Line numbers belong to whatever renders the lines, a copy button is a Button you put in the topbar, and hiding lines behind a collapse takes them out of reach. Bounding scrolls, so the lines are still there.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "Code has no meaning of its own to colour, and no block of it is louder than the next. The colours inside it come from the syntax theme, which reads the same inks as the prose around it.",
      },
      {
        name: "A Card as the pane",
        why: "The code is not an object sitting on the page, it is a well recessed into it. So the pane is a Surface, which is what the rest of the page's grounds are.",
      },
    ],
  },
  {
    slug: "context-menu",
    name: "ContextMenu",
    family: "Surface",
    spec: "§21, §22, §42",
        abstract: "ContextMenu is the menu a right-click opens, over the area you right-clicked.",
    overview: ["On a touch screen a long press opens it instead. It is the same panel and the same rows as Menu, so you build it out of MenuItem and its siblings; what is different is that it is summoned at a point rather than opened by a control, and it grows out of that point instead of out of a button. The part names follow shadcn/ui's context-menu (MIT), with credit, and the behaviour is Base UI's ContextMenu."],
    declaration: `<ContextMenu>
  <ContextMenuTrigger>
    <Surface>The area you right-click</Surface>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <MenuItem>Duplicate</MenuItem>
    <MenuItem tone="destructive">Delete</MenuItem>
  </ContextMenuContent>
</ContextMenu>`,
    topics: [
      { title: "Catching the right-click", symbols: ["ContextMenu", "ContextMenuTrigger"] },
      { title: "Presenting the panel", symbols: ["ContextMenuContent"] },
    ],
    refusals: [
      {
        name: "A parallel set of parts",
        why: "shadcn/ui ships ContextMenuItem, ContextMenuLabel, ContextMenuSub and the rest, and every one of them is the menu part under a second name — Base UI re-exports the same components for both. A second name for one thing is the fault, not the fix. Build the rows out of MenuItem, MenuGroup, MenuLabel, MenuCheckboxItem, MenuRadioGroup and MenuSub, which work here because they are the same components.",
      },
      {
        name: "Side, align and an offset",
        why: "Placement belongs to the system for every floating component, and here there is nothing you could usefully say: the panel's corner goes on the point you clicked, and the viewport decides which corner that is.",
      },
      {
        name: "An appearance for the region",
        why: "A right-click is a gesture over content you can already see, so the area draws no fill, no border and no cursor of its own. A region that announced itself would be a control, and this is not one.",
      },
      {
        name: "Opening on a left click",
        why: "That is a Menu with a trigger. Two gestures on one component would mean the same panel appearing for two different reasons, and a reader could not tell which one they had.",
      },
    ],
    parts: [
      { part: "ContextMenuTrigger", blurb: "The area a right-click opens the menu over. It draws nothing" },
      { part: "ContextMenuContent", blurb: "The panel, placed at the point that summoned it. It holds MenuItem and its siblings, and it takes no placement props at all" },
    ],
  },
  {
    slug: "dialog",
    name: "Dialog",
    family: "Surface",
    spec: "§10, §20, §24",
        abstract: "Dialog shows a panel over a dimmed app.",
    overview: ["The panel looks like a Card with a slightly rounder corner, and it casts no shadow of its own, because the dimmed background behind it is what separates it from the page. On a narrow window it slides up from the bottom edge as a sheet instead. The part names follow shadcn/ui's dialog (MIT), with credit, and the behaviour is Base UI's Dialog, including the focus trap and scroll lock."],
    declaration: `<Dialog>
  <DialogTrigger render={<Button>Rename project</Button>} />
  <DialogContent>
    <DialogTitle>Rename project</DialogTitle>
    <DialogDescription>Everyone with access will see the new name.</DialogDescription>
    <DialogClose render={<Button emphasis="loud">Save</Button>} />
  </DialogContent>
</Dialog>`,
    topics: [
      { title: "Opening it", symbols: ["Dialog", "DialogTrigger"] },
      { title: "Presenting the panel", symbols: ["DialogContent"] },
      { title: "Naming it", symbols: ["DialogTitle", "DialogDescription"] },
      { title: "Closing it", symbols: ["DialogClose"] },
    ],
    refusals: [
      {
        name: "Header and Footer",
        why: "A title, a description and an action row are a Stack you write. Blessing one arrangement deprecates every other. Title and Description are parts here because they carry the panel's accessible name and description, which is a non-visual reason.",
      },
      {
        name: "A presentation prop, and a drag",
        why: "The window class decides whether the panel centres or sits on the bottom edge. It is the same element throughout, so a half-filled form survives the change. A sheet does not drag, because a swipe means JavaScript on every pointer move. An AlertDialog stays centred at every width.",
      },
      {
        name: "A height prop",
        why: "The extent is yours. State a height or a max-height on DialogContent and a ScrollArea inside it becomes the thing that scrolls, with the title and the action row staying put. State nothing and the panel grows, and the dialog's own viewport scrolls it.",
      },
      {
        name: "A close button in the corner",
        why: "Escape and an outside press both dismiss. DialogClose puts a real Button wherever the composition wants one, which is also what a screen reader user on a touch device needs in order to leave a trapped panel.",
      },
      {
        name: "`modal` and `disablePointerDismissal`",
        why: "An open dialog is the interaction: focus trapped, page scroll locked, the scrim saying so. A panel that leaves the page live is a Popover or a Sheet. A dialog that must not close on an outside press is an AlertDialog.",
      },
      {
        name: "A shadow",
        why: "A menu casts because a floating pane has to show the coverage nobody else announced. A dialog's coverage is announced by the whole viewport going dark, so a shadow would say it twice. In an elevated app the panel lifts exactly as much as a Card does.",
      },
      {
        name: "A size on the title",
        why: "The title and description take their type steps from the dialog's own index, and you cannot set them yourself. They are parts the system owns, forced into existence by the accessibility wiring. Everything you wrote inside the panel is untouched, which is what `no surface sizes the type inside it` protects.",
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
        abstract: "Field is the unit that makes one input make sense.",
    overview: ["A control on its own is just a box: it cannot carry its own name, say what it is for, or say what went wrong. Field supplies a label, a description and an error message, and wires all three to the control so a screen reader reads them as one thing. What it draws is a column and a gap. The behaviour is Base UI's Field."],
    declaration: `<Field>
  <FieldLabel>Email</FieldLabel>
  <TextField type="email" />
  <FieldDescription>We use this for receipts.</FieldDescription>
  <FieldError match={true}>That address is not complete.</FieldError>
</Field>`,
    topics: [
      { title: "Naming one input", symbols: ["Field", "FieldLabel"] },
      { title: "Saying more about it", symbols: ["FieldDescription", "FieldError"] },
      { title: "Naming one option in a group", symbols: ["FieldItem"] },
    ],
    refusals: [
      {
        name: "`FieldControl`",
        why: "Base UI's is a plain input for callers who have no other input. Every Kookie control already is a Base UI input and reads Field's context by itself, so a control dropped inside a Field wires itself. Re-exporting one would be a second spelling of the control already standing there.",
      },
      {
        name: "`orientation`",
        why: "A horizontal field is not a direction flip. The label has to align to the control's first line, and the error has to sit under the control rather than under the label. That is a designed grid with its own rules, and it ships the day something needs it.",
      },
      {
        name: "A choice about where the error goes",
        why: "The order is fixed: label, control, description, error. The label sits on the control it names, and everything else about that control sits underneath it, so a form of ten fields groups correctly with no border and no rule. Position inside one field is proximity, not sequence: a reader meets a field all at once. GOV.UK puts the description above the control instead, because at high zoom the focused control fills the view and anything under it may be off screen. That cost is real and it is written down. A prop here would make the order a per-call-site opinion, which is what a system exists to prevent.",
      },
      {
        name: "An error that replaces the description",
        why: "Both show. The description says what to enter and the error says what went wrong. Removing the instruction at the exact moment somebody failed to follow it is the wrong trade.",
      },
      {
        name: "`Form`",
        why: "Deferred, not refused. Base UI's Form gives a server error map to fields by name and moves focus to the first invalid one. It is additive and changes nothing here, so it ships when something real has server errors to distribute.",
      },
    ],
    parts: [
      { part: "FieldItem", blurb: "One option inside a checkbox group or a radio group: a mark, its own name, and its own line of explanation" },
      { part: "FieldLabel", blurb: "The field's name: a real <label> associated by id, so clicking it lands the caret. Medium weight and the plain foreground role" },
      { part: "FieldDescription", blurb: "What to enter. The muted ink role, wired into aria-describedby wherever it sits, so a screen reader announces it with the control from any position" },
      { part: "FieldError", blurb: "What went wrong, after it went wrong. The destructive ink, rendered only while the field is invalid, and carrying the live region that announces it" },
    ],
  },
  {
    slug: "flex",
    name: "Flex",
    family: "Layout",
    spec: "§3",
        abstract: "Flex is Box with `display: flex` and the flex props kept.",
    overview: ["It ships no CSS of its own. The shorter prop list is the point: `columns` on a Flex does not compile."],
    refusals: [{ name: "`margin` on children", why: "The distance between siblings is the container's gap, so it is set once and cannot drift." }],
  },
  {
    slug: "grid",
    name: "Grid",
    family: "Layout",
    spec: "§3",
        abstract: "Grid is Box with `display: grid` and the grid props kept.",
    overview: [
      "It works the same way Flex does, and adds no CSS of its own.",
    ],
    refusals: [{ name: "Auto-placement helpers", why: "A prop earns its place only if it adds token resolution, tiers or a constraint. Everything else is style." }],
  },
  {
    slug: "heading",
    name: "Heading",
    family: "Type",
    spec: "§15",
        abstract: "Heading uses the heading font on the same nine-step scale Text uses.",
    overview: [
      "How large it looks and where it sits in the document outline are separate choices: `size` picks the step, and `render` picks the element.",
    ],
    refusals: [
      {
        name: "A level prop",
        why: "An h1 is a fact about the document, not about how the text looks. render={<h1/>} says it where a reader can see that the two decisions are separate.",
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    family: "Type",
    spec: "§11, §15",
        abstract: "Kbd shows a key or a shortcut, such as ⌘K.",
    overview: ["It takes the same fill and tone behaviour as Code, but sets the letters in the body font, because a key names a key rather than quoting code. Its box is exactly one line tall, so it never pushes apart the line it sits in."],
    refusals: [
      {
        name: "A shadow that follows Theme depth",
        why: "A key cap always shows relief, in a flat theme as well: a catch of light on the top face and a whisper of drop. A key cap is a picture of a raised physical object, and that reading is the component. What stays refused is the shadow changing with the app's depth setting.",
      },
    ],
  },
  {
    slug: "link",
    name: "Link",
    family: "Type",
    spec: "§11, §15",
        abstract: "Link is the one type component that responds to a pointer.",
    overview: ["How it reads comes from the shared type layer. What it adds is the underline and the hover and focus states. It is not a control, so it stays selectable, it wraps across lines, and it sits on the same line as the paragraph around it."],
    refusals: [
      {
        name: "`emphasis`",
        why: "On type, emphasis picks an ink colour, and the two lower levels sit at or below the reading floor. A link is the one run of text whose job is to be found, so a level that turns its colour down works against the only thing it is for. A link that matters less is a smaller link.",
      },
      {
        name: "A :visited style",
        why: "Browsers limit what :visited may paint and make getComputedStyle report the unvisited value, to stop a page reading your history. A rule no test can read is a rule this package does not ship.",
      },
      {
        name: "A hover-only underline",
        why: "Colour alone is not enough (WCAG 1.4.1), and a link inside a paragraph is the case that rule is written about. A hover reveal serves no touch screen at all. The underline is always there. What moves under the pointer is its colour.",
      },
      {
        name: "A target of its own",
        why: "WCAG 2.2 SC 2.5.8 exempts a target inside a sentence. A checkbox grows its hit area because it has no container. A link's container is the paragraph, and a paragraph may not grow.",
      },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    family: "Surface",
    spec: "§20, §21, §22",
        abstract: "Menu shows a floating list of actions.",
    overview: ["Its corner is worked out from the rows inside it, so the outer curve and the row curves nest instead of fighting. In a raised theme it casts the floating shadow; in a flat theme it draws a hairline instead, because a flat theme has no light to cast with. The part names follow shadcn/ui's dropdown-menu (MIT), with credit, and the behaviour is Base UI's Menu."],
    declaration: `<Menu>
  <MenuTrigger render={<Button>Actions</Button>} />
  <MenuContent>
    <MenuGroup>
      <MenuLabel>File</MenuLabel>
      <MenuItem trailing={<Kbd>\u2318D</Kbd>}>Duplicate</MenuItem>
    </MenuGroup>
    <MenuCheckboxItem defaultChecked>Show hidden</MenuCheckboxItem>
    <MenuRadioGroup defaultValue="name">
      <MenuRadioItem value="name">Sort by name</MenuRadioItem>
    </MenuRadioGroup>
    <MenuSub>
      <MenuSubTrigger>Export as</MenuSubTrigger>
      <MenuSubContent>
        <MenuItem>PNG</MenuItem>
      </MenuSubContent>
    </MenuSub>
  </MenuContent>
</Menu>`,
    topics: [
      { title: "Opening the menu", symbols: ["Menu", "MenuTrigger"] },
      { title: "Presenting the panel", symbols: ["MenuContent"] },
      { title: "Listing actions", symbols: ["MenuItem"] },
      { title: "Grouping into sections", symbols: ["MenuGroup", "MenuLabel"] },
      { title: "Rows that carry state", symbols: ["MenuCheckboxItem", "MenuRadioGroup", "MenuRadioItem"] },
      { title: "Nesting a menu", symbols: ["MenuSub", "MenuSubTrigger", "MenuSubContent"] },
    ],
    refusals: [
      {
        name: "`emphasis` on rows",
        why: "A menu is a list of peers. Emphasis ranks actions, and ranking rows inside a menu says nothing. Quiet is the family's fixed identity.",
      },
      {
        name: "A Shortcut part",
        why: "A keyboard hint is the row's trailing slot holding a <Kbd>. Both already exist, and a part that renames existing vocabulary earns no row.",
      },
      {
        name: "`MenuSeparator`",
        why: "Base UI's menu separator is a re-export of the standalone one, and ours would be too. Use <Separator>. The menu's stylesheet spaces it inside the panel.",
      },
      {
        name: "An inset prop",
        why: "Rows without icons lining up with rows that have them is geometry's job, not something a caller has to remember. A checkable row keeps its indicator mounted, so the gutter is always reserved.",
      },
      {
        name: "`modal` and `openOnHover`",
        why: "An open menu is modal. A transparent full-screen press catcher is what makes clicking outside close it, and locking page scroll keeps the panel attached to the trigger it is positioned against. There is no visible scrim. A menu opens on press, never on hover; a submenu row opens on hover, which is the platform's own behaviour and the reason the prop is not exposed.",
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
        abstract: "Select is a form control that holds a choice.",
    overview: ["Its panel, rows and corner all come from Menu with nothing redesigned. What is new is the trigger: a button shaped like a field, so a Select beside a TextField reads as the same family, with the same fill, border and height, while staying a real button that announces itself as a combobox. Base UI renders a hidden input, so a Select submits with a form like the native element it replaces. The part names follow shadcn/ui's select (MIT), with credit."],
    declaration: `<Select defaultValue="banana" items={labels}>
  <SelectTrigger placeholder="Pick one" />
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruit</SelectLabel>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
    topics: [
      { title: "Holding the choice", symbols: ["Select", "SelectTrigger"] },
      { title: "Presenting the panel", symbols: ["SelectContent"] },
      { title: "Listing the options", symbols: ["SelectItem"] },
      { title: "Grouping into sections", symbols: ["SelectGroup", "SelectLabel"] },
    ],
    refusals: [
      {
        name: "`readOnly`",
        why: "HTML says readonly does not apply to a select, so there is no native appearance to copy and no expectation to meet. A value that must submit but cannot change is a disabled trigger beside a hidden input, or the value rendered as Text.",
      },
      {
        name: "A Separator inside the panel",
        why: "The panel is the listbox, and a listbox may contain only options and groups. A separator in it is markup an accessibility scan reports as a violation, from library code you cannot fix. Use a group instead: a group divides options in the accessibility tree as well as on screen.",
      },
      {
        name: "`emphasis` and `tone` on the trigger",
        why: "A form control does not rank. Loudness orders actions, and a form where one field is louder than the next is pointing at itself.",
      },
      {
        name: "SelectValue as a part",
        why: "A part whose only job is to stand where the value goes earns a prop, not an element. The trigger renders the value itself and takes a placeholder.",
      },
      {
        name: "`render` and `children` on the trigger",
        why: "The value is the trigger's content. Re-rooting the trigger would reopen the accessibility question Base UI already answers with a real button that announces role=combobox.",
      },
      {
        name: "The scroll arrows",
        why: "The panel places the chosen row on top of the value it replaces, in the way macOS does. Base UI pairs that placement with arrows at the top and bottom, and those are refused: they are a mouse-only affordance, the panel already scrolls by wheel, trackpad and keyboard, and an arrow is a control this system has not designed.",
      },
      {
        name: "`multiple`",
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
    slug: "command",
    name: "Command",
    family: "Surface",
    spec: "§44",
    abstract: "Command is one field over everything your app can do.",
    declaration: `<Command items={sections} open={open} onOpenChange={setOpen}>
  <CommandTrigger render={<Button>Open</Button>} />
  <CommandContent aria-label="Command palette">
    <CommandInput placeholder="Search for commands\u2026" />
    <CommandList>{(section) => \u2026}</CommandList>
    <CommandEmpty>\u2026</CommandEmpty>
  </CommandContent>
</Command>`,
    overview: [
      "Command is a Dialog. The scrim, the focus trap, the scroll lock, the re-theming inside the portal and the entry motion all arrive with it, and `CommandContent` is a dialog\u2019s popup.",
      "What it adds is the keyboard model. One row is highlighted from the first frame, the highlight survives each keystroke, and Enter runs the row you are looking at.",
      "Pass every command to `items`. `CommandList` and `CommandCollection` take a function and call it once for each item that survives the filter, so the array you write is the list of everything and the panel decides what exists right now.",
      "Hold `items` stable. It crosses to the matcher by identity, so an inline literal re-runs the whole filter pass on every unrelated render. Put it at module scope or in a `useMemo`.",
      "Open it yourself. Which chord opens a palette is your app\u2019s decision, so `Command` takes `open` and `onOpenChange` and renders no trigger at all when you leave `CommandTrigger` out.",
    ],
    topics: [
      { title: "Opening the palette", symbols: ["Command", "CommandTrigger"] },
      { title: "Presenting the panel", symbols: ["CommandContent"] },
      { title: "Filtering", symbols: ["CommandInput", "CommandEmpty"] },
      { title: "Listing the commands", symbols: ["CommandList", "CommandItem"] },
      {
        title: "Grouping into sections",
        symbols: ["CommandGroup", "CommandGroupLabel", "CommandCollection"],
      },
    ],
    /* THREE, DOWN FROM SEVEN (2026-09-04, Kushagra: "do I need the refusals").

       A refusal answers a question the rest of the page cannot: why is this not here. That is
       still the one section a generated table can never carry — but the trial layout took four
       of these away by answering them somewhere a reader looks first. The Overview says it is a
       Dialog and says you open it yourself; `CommandContent`'s own line says it carries the
       accessible name; `CommandEmpty`'s says it places and does not dress. A refusal that
       repeats a sentence from higher up the page is not carrying the argument, it is padding
       the section that carries it.

       What is left is what a reader would go looking for and not find. */
    refusals: [
      {
        name: "`modal`",
        why: "An open palette is the interaction. For a panel that leaves the page live behind it, use a Popover.",
      },
      {
        name: "Fuzzy reordering as you type",
        why: "Rows keep the order you wrote them in. A palette that re-sorts on every keystroke is one nobody can build muscle memory for.",
      },
      {
        name: "A Separator inside the panel",
        why: "The list is a listbox, and a listbox may contain only options and groups. A separator in it is markup an accessibility scan reports as a violation, from library code you cannot fix — Select's own refusal, one component over. Use a group: it divides the list in the accessibility tree as well as on screen, and it disappears on its own when nothing in it matches.",
      },
      {
        name: "An edge-to-edge panel",
        why: "The panel pads like every other dialog, so a highlighted row has two ends rather than running under a 40px corner.",
      },
    ],
    parts: [
      { part: "CommandTrigger", blurb: "The control that opens the palette. Leave it out when a chord is the only way in." },
      { part: "CommandContent", blurb: "The panel. It holds the field and the list, and carries the palette\u2019s accessible name." },
      { part: "CommandInput", blurb: "The field across the top. It wears the field family and stands at the height of a control of the same size." },
      { part: "CommandList", blurb: "The scrolling list. It takes a function and calls it for each item that survives the filter." },
      { part: "CommandGroup", blurb: "A section, carrying its own items, so it disappears when nothing in it matches." },
      { part: "CommandGroupLabel", blurb: "The section\u2019s caption. Muted, and not reachable by the keyboard." },
      { part: "CommandCollection", blurb: "Renders each surviving item of the group it sits in." },
      { part: "CommandItem", blurb: "One command: a row standing level with a button of the same size, with a slot before and after." },
      { part: "CommandEmpty", blurb: "What the panel shows when nothing matches. It places what you give it and dresses none of it." },
    ],
  },
  {
    slug: "composer",
    name: "Composer",
    family: "Surface",
    // CHANGES 2026-08-26: was §31, which is Popover. Composer is §30, and §10 is the surface
    // family decision the section rests on. `registry.test.ts` now resolves every cited § against
    // DECISIONS.md's own headings, so the next renumber fails here instead of misdirecting a reader.
    spec: "§10, §30",
    parts: [
      { part: "ComposerInput", blurb: "The box a person types their message into. It is a plain textarea with no border of its own, because the Composer around it is already the box, and putting a TextArea here would show two" },
      { part: "ComposerRow", blurb: "The row of controls under the text. It sets the alignment, the split and the spacing so you never write them" },
      { part: "ComposerSend", blurb: "One button with four meanings, read off status: send, in flight, stop, retry" },
    ],
        abstract: "The box a person types a message into.",
    overview: ["It is the input half of a conversation and not the conversation: a form holding a text area that grows, a row of controls under it, and one button that sends. It is a surface rather than a control because of what it holds — a text field holds shrunken controls in its slots, and a composer holds full-size buttons at their own size, which is a box containing controls. It works for an AI chat, a support inbox, a team thread or a comment field, because all four are the same shape."],
    declaration: `<Composer onSubmit={send}>
  <ComposerInput placeholder="Ask anything" />
  <ComposerRow>
    <Button iconOnly aria-label="Add attachment">{icon}</Button>
    <ComposerSend status={status} aria-label="Send" />
  </ComposerRow>
</Composer>`,
    topics: [
      { title: "The box a message is typed into", symbols: ["Composer", "ComposerInput"] },
      { title: "The controls under it", symbols: ["ComposerRow", "ComposerSend"] },
    ],
    refusals: [
      {
        name: "The conversation, and every part of it",
        why: "A message, a bubble, a branch, a reasoning block and a tool call each encode a data model, and this system has none. The libraries that ship them are chat runtimes with a user interface attached. Compose a thread from ScrollArea, Card and Text, or bring a runtime.",
      },
      {
        name: "The scroller",
        why: "Staying pinned to the bottom, not jumping while a reply streams, and keeping your place when older messages load above are six thousand lines of behaviour in the one library that has done it properly. That is a package, not a component.",
      },
      {
        name: "An attach button",
        why: "The button follows whoever owns the files, and the app owns them. It is also a Button with an icon, and the system ships no icon set, so ours would be a Button with a hole in it. Files that land on our own elements are different: drop and paste both reach onFiles.",
      },
      {
        name: "Owning the files",
        why: "No File objects, no preview URLs, no validation, no upload. An attachment tile takes its state as a prop you set and draws it. A composer that minted preview URLs would have to destroy them, and it would destroy the one it just handed you.",
      },
      {
        name: "A row of slots",
        why: "ComposerRow states the alignment, the split and the rhythm, and stops. Which controls sit left and which sit right is what those controls mean, and that is yours. The previous version shipped five parts for this and every one of them was a layout.",
      },
      {
        name: "A compact or collapsed mode",
        why: "Deferred rather than judged. Collapsing only means something when there is something to fold away, and this ships no attachment tray and no queue. When it lands it will follow what you have typed, never whether you clicked into it, because a bar that closes behind your back can strand itself shut.",
      },
      {
        name: "`submitOnEnter`",
        why: "Enter sends and Shift+Enter breaks the line, with no prop. That is what being a real form buys, and it is what every messaging surface a person has used already does. An Enter that closes a Japanese, Chinese or Korean composition never sends.",
      },
    ],
  },
  {
    slug: "notice",
    name: "Notice",
    family: "Surface",
    spec: "§29",
        abstract: "Notice states a condition that is true right now, on the region it is about.",
    overview: ["The person did not cause it, so it is not a receipt, and it lasts as long as the condition lasts, so it does not disappear on a timer. It takes up layout space and never floats, because a strip that hovered would cover the content it is telling you about. It carries at most one action that fixes the condition, and one dismissal that only acknowledges it."],
    refusals: [
      {
        name: "A position, and the name Banner",
        why: "Placement is yours: in flow above the region it concerns, or handed to the Shell to pin at the top. Atlassian needs both Banner and SectionMessage because their difference is where each one sits. Here a component never owns its position, so there is one component and the parent places it.",
      },
      {
        name: "Toast, and any transient version of this",
        why: "Refused across the system, not only here. If an action deserves attention it gets that attention before it runs. A toast is important enough to say and too late to act on. Undo belongs in an undo stack, and a copy confirmation belongs on the button that copied.",
      },
      {
        name: "A title, a description and any fixed anatomy",
        why: "Nothing non-visual forces them. The role sits on the root, the symbol is decorative, and the two verbs are slots. A notice that needs a heading and several paragraphs is a Card.",
      },
      {
        name: "More than one action",
        why: "One slot, and it holds the verb that resolves the condition. A strip with two competing actions is a form. A notice offering neither an action nor a dismissal is a Text in a box: write the sentence and delete the box.",
      },
      {
        name: "Remembering its own dismissal",
        why: "onDismiss is a callback and there is no internal state. A notice that dismissed itself would forget on reload, and a close button the app cannot honour is a close button that lied. Pass nothing and no dismissal renders at all.",
      },
      {
        name: "A shadow",
        why: "A notice never casts a shadow, in a flat theme or an elevated one. A shadow belongs to a box that is a plane of its own, which is why a field does not cast one and why a ground does not either. A notice is a marker on a plane: a strip inside a card, or across a page. On glass it keeps the pool the material gives every pane, which is not the same thing as the lift the app says.",
      },
      {
        name: "An icon set",
        why: "The package ships no icons. The slot is safe when empty, takes whatever your app draws, and is hidden from assistive technology, because the words are the message.",
      },
    ],
  },
  {
    slug: "popover",
    name: "Popover",
    family: "Surface",
    spec: "§20, §22, §31",
        abstract: "Popover shows a panel anchored to a control, with the page still live behind it.",
    overview: ["It is the one floating component whose contents the system does not design: a menu holds rows and a select holds options, but a popover holds whatever you put in it, such as a form, a summary or a filter panel. The part names follow shadcn/ui's popover (MIT), with credit, and the behaviour is Base UI's Popover."],
    declaration: `<Popover>
  <PopoverTrigger render={<Button>Rename</Button>} />
  <PopoverContent>
    <PopoverTitle>Rename project</PopoverTitle>
    <PopoverDescription>This changes the name everywhere.</PopoverDescription>
    <PopoverClose render={<Button emphasis="loud">Save</Button>} />
  </PopoverContent>
</Popover>`,
    topics: [
      { title: "Opening it", symbols: ["Popover", "PopoverTrigger"] },
      { title: "Presenting the panel", symbols: ["PopoverContent"] },
      { title: "Naming it", symbols: ["PopoverTitle", "PopoverDescription"] },
      { title: "Closing it", symbols: ["PopoverClose"] },
    ],
    refusals: [
      {
        name: "A modal mode",
        why: "The page staying live is the whole distinction from Dialog. A panel that must be answered before anything else can happen is a Dialog, and one that stops you to ask a single question is an AlertDialog. Those are three different promises, and which component you reach for is how you make one.",
      },
      {
        name: "An arrow",
        why: "An arrow is a second boundary on a pane whose boundary is already drawn, and on glass it would need its own tint, ring and lens for a shape the lens cannot describe. What says where the panel came from is that it is anchored to the thing you pressed and grows out of it.",
      },
      {
        name: "Free positioning",
        why: "You choose a side and an alignment, and the system does the rest — flipping when that side has no room, keeping the panel on screen, matching the gap every other floating panel uses. A panel that could be placed anywhere is a panel you would place differently every time.",
      },
      {
        name: "A width that matches the trigger",
        why: "A menu is never narrower than the button that opened it, because its rows are that button's own options. A popover holds a form; tying its width to whatever opened it would make one panel a different shape on every screen.",
      },
      {
        name: "A drawn close button",
        why: "The panel has two other ways out — an outside press and Escape — and a corner glyph on a small pane competes with what the panel is for. Place a PopoverClose around your own Button when a third way out is worth the room.",
      },
    ],
    parts: [
      { part: "PopoverTrigger", blurb: "The control that opens it. Pass your own Button through render; this adds the wiring and the anchor the panel measures itself against." },
      { part: "PopoverContent", blurb: "The panel. Takes the side and alignment to prefer, and holds your content." },
      { part: "PopoverTitle", blurb: "The panel's name, in words. It is the visible heading and the string a screen reader announces the panel by" },
      { part: "PopoverDescription", blurb: "The supporting line, announced together with the title. A description that restates the title is heard twice." },
      { part: "PopoverClose", blurb: "Dismisses the panel. Place a real Button inside it." },
    ],
  },
  {
    slug: "progress",
    name: "Progress",
    family: "Indicator",
    spec: "§11, §19",
        abstract: "Progress shows how far along a task is.",
    overview: ["It has no handle, so it takes no focus and needs no tappable area. Give it a number and it shows a fraction. Give it null and it sweeps, to say that something is happening without claiming to know how far along it is."],
    refusals: [
      {
        name: "`size`",
        why: "The slider's track scale is a fraction of the slider's own thumb, and a bar has no thumb, so using that scale would size the bar against a box it does not have. It uses one stated thickness instead, and takes its width from the container.",
      },
      {
        name: "`tone`",
        why: "Left open rather than decided. A failed upload in the destructive family is real vocabulary, but adding an axis on the day a component ships is guessing.",
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    family: "Control",
    spec: "§4, §6, §11",
        abstract: "Radio lets someone pick one option from a group.",
    overview: ["Its circle carries the meaning: a square radio reads as a checkbox, so no theme setting can square it off. It is one of only four shapes in the system that stays round whatever the corner setting says."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "The same as Checkbox: neutral when off and accent when on is an identity, not an axis." },
      { name: "`readOnly`", why: "The same as Checkbox: HTML does not define readonly for a radio, so there is no appearance to inherit." },
    ],
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    family: "Control",
    spec: "§11",
        abstract: "RadioGroup wraps Base UI's radio group and adds no styling at all.",
    overview: ["It exists for the keyboard behaviour and the form value, not for a look. `render` is open, so the group can be a Stack."],
    refusals: [{ name: "Any visual prop", why: "The group is wiring. What it looks like is whatever layout you render it as." }],
  },
  {
    slug: "row",
    name: "Row",
    family: "Control",
    spec: "§21",
        abstract: "Row is one line in a list of things you can pick.",
    overview: ["It is the same object a menu item and a sidebar item are: the same rest, the same hover, the same content weight. A standing row shares the height scale, so it sits level with a Button at its index; only a menu's rows keep their tighter box, because a panel opened for a second is read denser than a column that is on screen all day. Use it for search results, command lists, settings rows and file lists. Inside a Menu, use MenuItem instead."],
    refusals: [
      {
        name: "`emphasis`",
        why: "Actions rank; a list of peers ranks nothing. A row that was louder than the row under it would be claiming an importance the list does not have. Quiet is the family's identity and the component states it.",
      },
      {
        name: "A keyboard model",
        why: "A list that moves a highlight with the arrow keys owns that highlight, because only the list knows what its items are and what Enter should do to them. Pass `highlighted` and the row paints what you tell it — and stops answering the pointer, so the two cursors cannot fight.",
      },
      {
        name: "A selected prop",
        why: "Picking one of several is a radio group, and a row that faked it with an attribute would be the shape the segmented control refused. `current` is a different thing and it is here: it announces aria-current, it means the page you are on, and it is not a form value.",
      },
      {
        name: "A List component to put these in",
        why: "A column with a gap is a Stack, and the role a list needs — list, listbox, menu, none at all — depends on what the rows mean, which is yours to state. A component that wrapped them would have to guess.",
      },
      {
        name: "The menu row's tighter box",
        why: "A menu row's height is its text line plus a small inset — judged on a menu, where a full-height row read sparse. A standing row is on screen all day beside real buttons, so it stands level with them; wanting the menu's density in a permanent list is wanting a menu.",
      },
    ],
  },
  {
    slug: "tree",
    name: "Tree",
    family: "Control",
    spec: "§33",
        abstract: "Tree shows hierarchical content the person reveals and hides: a file browser, a layers panel, anything with sub-contents.",
    overview: ["It is the machine only — disclosure per node, the ARIA tree keyboard (arrows walk visible rows, Right opens and descends, Left closes and ascends, Home, End, typeahead), and selection, single or several at once. The rows are row-family members, the visible nodes render as a flat list with level attributes, and the indent is derived: one level is one icon box, so it answers size and the pointer world with no number of its own. The finished tools built on it — rename, drag, icons per file type — are blocks, not props."],
    refusals: [
      {
        name: "Drag to reorder",
        why: "Restructuring by drag is its own pattern — flat lists want it as much as trees — with a genuinely contested accessible answer and drop semantics that belong to your data model. It will land as its own mechanism that composes with Tree; until then it is app code, as the builder's Layers pane shows.",
      },
      {
        name: "Cascade selection",
        why: "Whether choosing a folder chooses its children is a product decision — a checkbox tree's tri-state is one answer among several — and nothing in this system needs one yet. Selection here is exactly the rows you selected.",
      },
      {
        name: "Async children and loading states",
        why: "No consumer loads a subtree over the network yet. When one does, the pattern's aria-busy shape is where it lands.",
      },
      {
        name: "Rename-in-place",
        why: "Renaming belongs to the tool built on the tree, not to the machine: what a name is, when it commits and what rejects it are the app's facts.",
      },
      {
        name: "JSX children",
        why: "The hierarchy is data (`items`), because the visible rows render FLAT with ARIA level attributes — the accessible spelling of nesting — and a nested JSX walk would be the child-scanning the Shell deleted. Your data maps to nodes; the tree renders rows.",
      },
      {
        name: "An indent prop",
        why: "One level is one icon box, derived from the designed icon-size scale. A stated indent would be a second number for a distance the system already sets per size and per pointer world.",
      },
    ],
  },
  {
    slug: "nav-tree",
    name: "NavTree",
    family: "Control",
    spec: "§33",
        abstract: "NavTree is the tree machine's navigation member: the same data, indent and disclosure as Tree, announced as navigation instead of a tree view — sections are real buttons with aria-expanded, pages are real links, and the page you are on says aria-current.",
    overview: ["Use it for a sidebar's navigation, a docs chapter list, anything where pressing a row goes somewhere. The docs sidebar you are reading is one. Use Tree when pressing a row selects it."],
    refusals: [
      {
        name: "Role=\"tree\"",
        why: "The ARIA APG separates disclosure navigation from tree views, and role=\"tree\" on a nav over-claims: it promises a selection model and a roving keyboard that navigation does not have. A section is a button that discloses, a page is a link — the platform's own vocabulary says everything true.",
      },
      {
        name: "Selection",
        why: "A nav has location, not selection. currentId is where you ARE, announced as aria-current; a selectedIds prop here would blur the two meanings §33 keeps apart. If rows are chosen rather than visited, it is a Tree.",
      },
      {
        name: "The tree keyboard",
        why: "Roving focus, arrow traversal and typeahead belong to the tree view pattern. Links live in the normal tab order and Enter follows them — the keyboard every navigation on the web already has.",
      },
      {
        name: "An indent prop",
        why: "Tree's own refusal, inherited with the machine: one level is one icon box, derived.",
      },
    ],
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    family: "Surface",
    spec: "§10",
        abstract: "ScrollArea draws custom scrollbars over native scrolling.",
    overview: ["The browser keeps the scrolling behaviour, and the system draws the bar: a rounded thumb over the content, visible while you scroll or hover, with no visible track and no reserved gutter. It is one export, because the viewport, the bars and the corner are assembly rather than API."],
    refusals: [
      { name: "`size`", why: "One stated thickness. A scrollbar has no box of its own to index against." },
      { name: "`tone` and `emphasis`", why: "It ranks nothing and means nothing. It shows you where you are in the content." },
      { name: "`material`", why: "It draws over content inside a pane, and the pane already answered the theme." },
      { name: "`render`", why: "The anatomy is Base UI's contract. The parts are assembly you cannot reach." },
      { name: "`orientation`", why: "Both bars are declared, and Base UI mounts only the ones the content needs, after it measures. Which bars appear is a fact about the content, not a prop." },
    ],
  },
  {
    slug: "separator",
    name: "Separator",
    family: "Surface",
    spec: "§11",
        abstract: "Separator draws a thin dividing line.",
    overview: ["It has one colour and one thickness, both already decided. Its length comes from whatever contains it, which is the outer-spacing rule applied to size."],
    refusals: [
      { name: "`children`", why: "A labelled divider is a composition: two separators and a Text, not a prop." },
      { name: "A length prop", why: "The container decides the length, which is the same rule that refuses margin everywhere." },
      { name: "`decorative`", why: "A rule that has to hide from assistive technology is not a Separator. It is a styled Box." },
    ],
  },
  {
    slug: "shell",
    name: "Shell",
    family: "Layout",
    spec: "§27",
        abstract: "Shell is the app frame: a header, a rail, a sidebar, the content, an inspector and a bottom pane.",
    overview: ["Each pane places itself in one grid, so Shell never inspects its children and the DOM order stays the reading order. A pane you have not touched rests on auto, and CSS decides what auto means at the current window size, so the first paint is correct with no script. State lives on each pane, in the same controlled pattern Dialog uses."],
    declaration: `<Shell>
  <ShellHeader>\u2026</ShellHeader>
  <ShellRail aria-label="Regions">
    <ShellRailList>
      <ShellRailItem aria-label="Files">{icon}</ShellRailItem>
    </ShellRailList>
  </ShellRail>
  <ShellSidebar aria-label="Sections">
    <ShellPaneHeader float>
      <ShellTrigger pane="sidebar" action="toggle" render={<Button iconOnly />} />
    </ShellPaneHeader>
    <ShellScroll fade>
      <ShellNavGroup label="Workspace">
        <ShellNavItem current>Home</ShellNavItem>
      </ShellNavGroup>
    </ShellScroll>
    <ShellPaneFooter>\u2026</ShellPaneFooter>
  </ShellSidebar>
  <ShellContent>\u2026</ShellContent>
  <ShellInspector aria-label="Details">\u2026</ShellInspector>
  <ShellBottom aria-label="Console">\u2026</ShellBottom>
</Shell>`,
    topics: [
      { title: "The frame", symbols: ["Shell"] },
      { title: "The panes", symbols: ["ShellHeader", "ShellSidebar", "ShellContent", "ShellInspector", "ShellBottom"] },
      { title: "The rail that switches regions", symbols: ["ShellRail", "ShellRailList", "ShellRailItem"] },
      { title: "Inside a pane", symbols: ["ShellScroll", "ShellPaneHeader", "ShellPaneFooter"] },
      { title: "Navigating", symbols: ["ShellNavGroup", "ShellNavItem"] },
      { title: "Opening and closing a pane", symbols: ["ShellTrigger"] },
    ],
    refusals: [
      { name: "A gap prop", why: "Floating is the gap. The distance is one layout-space step, so a compact app's frame tightens with the rest of its distances. A per-shell number is how a frame drifts off its own app's rhythm." },
      { name: "A header position axis", why: "The header is full-width by definition. A header that is not full-width is a header inside ShellContent. One geometry, and the other arrangement is a composition." },
      { name: "A thin sidebar mode", why: "A thin sidebar is a rail wearing a sidebar's name, which puts the same region in the tree twice. Rail and sidebar are independent columns here, and an app that wants them linked writes three lines." },
      { name: "A close-cascade between rail and sidebar", why: "It is not universally true. VS Code's columns are independent and Slack's rail cannot close. That makes it an app's opinion, not a frame rule with a conflict protocol." },
      { name: "`peek`", why: "Deferred until a real screen asks for it. A pane that slides half open costs a context slice, absolute overlays and per-pane CSS, and it carries very little." },
      { name: "`backdrop` on `ShellContent`", why: "The work area never gets glass. It is not a preference: a pane floats only when the content is underneath it, so the content is the one pane nothing is ever underneath — it is the bottom of the stack, with the app's flat ground behind it. Glass there blurs nothing and mints a lens map for the largest box on screen. A vibrant region inside the work area is still reachable, because a solid surface hosts glass: put a Box backdrop or a Card backdrop in it." },
      { name: "A floating or stacked presentation value", why: "A pane over the content and a pane pulled off the frame are one idea, and it is flush={false}. The pane leaves the tiling, and what it becomes is derived from whether the content is underneath it. There is no third presentation to choose." },
    ],
    parts: [
      { part: "ShellHeader", blurb: "The full-width top bar, and a real <header> landmark. A header that is not full-width belongs inside ShellContent" },
      { part: "ShellRail", blurb: "The narrow icon column that switches sections: a <nav>, independent of the sidebar. Give each nav an aria-label when both are present" },
      { part: "ShellSidebar", blurb: "The wide navigation column: a <nav>. Untouched, it rests open on a roomy window and closed on a narrow one, with no script deciding" },
      { part: "ShellContent", blurb: "The work area: a real <main> that scrolls itself and takes whatever room the other panes leave" },
      { part: "ShellRailItem", blurb: "One square in the rail, for a high-level region rather than a row. Icon-only, because narrow is part of what a rail means" },
      { part: "ShellRailList", blurb: "A run of rail squares. A rail usually has two: the regions at the top, and the account and settings squares pinned at the bottom" },
      { part: "ShellScroll", blurb: "The one region of a pane that scrolls. Mark it and everything else in the pane pins by being an ordinary child: the pane becomes a column, this takes the leftover room, and the pane stops scrolling itself" },
      { part: "ShellPaneHeader", blurb: "A pane's own header row: one control row at the pane's index, so the chrome stands level with the rail and the app header beside it" },
      { part: "ShellPaneFooter", blurb: "The same row at the pane's other end. With `float` the pane publishes --kui-pane-inset-block-end" },
      { part: "ShellNavGroup", blurb: "A cluster of nav rows under a heading. It carries role=group and points aria-labelledby at its own label, so the heading is announced as well as seen" },
      { part: "ShellNavItem", blurb: "One row of navigation. It stands level with a Button, which a menu row does not, because a menu row lives in a panel opened for a second while this sits beside real buttons all day" },
      { part: "ShellInspector", blurb: "The right-hand detail column: an <aside> that rests closed until it is asked for. Pass defaultOpen for one that starts open" },
      { part: "ShellBottom", blurb: "The bottom pane for a terminal or a log: an <aside> spanning the full width below the columns, resting closed" },
      { part: "ShellTrigger", blurb: "The one thing that crosses the frame: a button that drives a pane by name" },
    ],
  },
  {
    slug: "slider",
    name: "Slider",
    family: "Control",
    spec: "§4, §11",
        abstract: "Slider lets someone set a value along a length.",
    overview: ["The whole strip is pressable, and it stands as tall a target as the Button beside it. A range slider is the same component: pass an array and it renders a handle for each entry."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "A value is not an action, and a form where one slider is louder than the next says nothing." },
      {
        name: "`orientation`",
        why: "A vertical slider needs its own designed measurements: how far the thumb travels, how thick the track is, and every cell of both. It ships the day something needs it, rather than as a prop that renders undesigned geometry today.",
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    family: "Indicator",
    spec: "§8",
        abstract: "Spinner shows that something is busy.",
    overview: ["It costs one composited transform and no JavaScript. The spokes are real shapes rather than a gradient, and the wrapper is what rotates rather than the SVG, because this control's one job is to keep moving even when the main thread is busy."],
    refusals: [
      {
        name: "A size prop",
        why: "It occupies the icon box, so swapping a spinner in for an icon shifts nothing. On its own it takes the size-2 box.",
      },
      { name: "A colour prop", why: "It draws in currentColor, which is correct in every context with no token at all." },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    family: "Layout",
    spec: "§3",
        abstract: "Stack is Box with a column flex preset.",
    overview: [
      "It is the most common layout in any app, so it has a name of its own and nobody writes it out again.",
    ],
    refusals: [{ name: "`dividers`", why: "A rule between rows is a Separator you place, not a prop that guesses where you wanted one." }],
  },
  {
    slug: "segmented-control",
    name: "SegmentedControl",
    family: "Control",
    spec: "§4, §11, §19, §26",
        abstract: "SegmentedControl shows a few options at once and lets someone pick one.",
    overview: ["It is built as a radio group rather than a row of toggle buttons, because picking one of several is what a radio group is, and that is what a screen reader announces. The control stands the same height as a Button beside it, and the selected option is marked by a raised tile that slides between positions."],
    declaration: `<SegmentedControl defaultValue="grid" aria-label="View">
  <SegmentedItem value="list">List</SegmentedItem>
  <SegmentedItem value="grid">Grid</SegmentedItem>
</SegmentedControl>`,
    topics: [
      { title: "Picking one of a few", symbols: ["SegmentedControl", "SegmentedItem"] },
    ],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "The family has one tone, as an identity. A segment louder than its neighbours is not a segmented control.",
      },
      {
        name: "An exported thumb",
        why: "The sliding tile is structure, not API. It is placed for you, and a consumer who has to place it is one who will forget.",
      },
      {
        name: "Multi-select",
        why: "Two options on at once is a set of toggle buttons, which is a different component: a ToggleGroup of Toggles. A radio group holds exactly one answer.",
      },
      {
        name: "`nativeButton` and `render`",
        why: "Set nativeButton on a segment and Space stops selecting it, which is the bug the checkbox closed on this same primitive.",
      },
      { name: "`readOnly`", why: "The same as Radio: HTML has no read-only selection control, so there is no appearance to inherit." },
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
        abstract: "Switch turns one thing on or off.",
    overview: ["Its track is slightly larger than a checkbox at the same size, which is the relationship every other design system arrives at by hand. When it is off, the track is a neutral channel with no visible border, so you feel for it rather than reading it as a small panel."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "The same as every mark: neutral when off, accent when on, as an identity rather than an axis." },
      { name: "`children`", why: "The label is a sibling, as it is for every mark. The row sets the distance between them." },
      {
        name: "`readOnly`",
        why: "The same answer Checkbox gives. A read-only switch is a disabled one with a different name.",
      },
    ],
  },
  {
    slug: "table",
    name: "Table",
    family: "Type",
    spec: "§11, §36",
        abstract: "Table lays data out in rows and columns, as the real table element, inside a box that scrolls sideways when the columns need more room than the page has.",
    overview: ["It draws the lines between rows, the space inside each cell and the quiet header, and nothing else. Its rows do nothing when you point at them: a row you can select or open is a different component that has not shipped yet."],
    declaration: `<Table aria-label="Invoices">
  <TableCaption>Invoices this month</TableCaption>
  <TableHeader>
    <TableRow>
      <TableHead>Invoice</TableHead>
      <TableHead align="end">Amount</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>INV-001</TableCell>
      <TableCell align="end">\u00a3240.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    topics: [
      { title: "Laying out the table", symbols: ["Table", "TableHeader", "TableBody"] },
      { title: "Rows and cells", symbols: ["TableRow", "TableHead", "TableCell"] },
      { title: "Naming it", symbols: ["TableCaption"] },
    ],
    refusals: [
      {
        name: "A ScrollArea around it",
        why: "The wrapper scrolls natively, so the browser makes it keyboard-focusable exactly when the columns overflow — which is the only time that tab stop is worth having. A ScrollArea takes one at all times and needs a height you state. It wears the same thumb, so the two match.",
      },
      { name: "Hover, selection and a press on rows", why: "A row you can point at, pick or open is an interactive surface with a keyboard and a name. That is the table row in the plan, a member of the row family, and it will ship as its own component rather than as a prop that turns this one into it." },
      { name: "`tone` and `emphasis`", why: "A table is not louder than the block beside it, and it has no meaning of its own to colour. A cell's words can carry a tone through Text or Chip." },
      { name: "A sticky header", why: "Pinning the header means the table decides how tall the room around it is, and no component here owns its own position. Put a tall table in a ScrollArea and pin the header there when that pattern is designed." },
      { name: "Sorting and column controls", why: "Sorting is state and a keyboard, and the header button that carries it is a Button. The table draws what you give it in the order you give it." },
    ],
    parts: [
      { part: "TableHeader", blurb: "The head section. Its cells are TableHeads, set in the muted ink at medium weight, because a column's name is secondary to what it names" },
      { part: "TableBody", blurb: "The body section. Its last row draws no line under itself: the table's edge is the end" },
      { part: "TableRow", blurb: "One row. It does nothing when you point at it: no hover, no selection, no press. A row you can pick is a different component" },
      { part: "TableHead", blurb: "A header cell, with scope=col unless you say otherwise, and an align word for the column" },
      { part: "TableCell", blurb: "A body cell, with an align word. Words start-align and numbers end-align" },
      { part: "TableCaption", blurb: "What this table is, drawn under it in the muted ink. It is also the table's accessible name" },
    ],
  },
  {
    slug: "tabs",
    name: "Tabs",
    family: "Control",
    spec: "§11, §15, §26",
        abstract: "Tabs shows a set of places you can go and marks the one you are on.",
    overview: ["The active tab is marked by its ink and a rule underneath, never by a louder fill or a heavier label. A fill would make it read as a button among links, and a heavier weight is wider, so the bar would shift every time you switched."],
    declaration: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
  </TabsList>
  <TabsPanel value="overview">\u2026</TabsPanel>
  <TabsPanel value="activity">\u2026</TabsPanel>
</Tabs>`,
    topics: [
      { title: "Switching between places", symbols: ["Tabs", "TabsList", "TabsTab"] },
      { title: "What a tab reveals", symbols: ["TabsPanel"] },
    ],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "A bar where one tab is louder than the next says nothing. Which tab is active is a state, not a loudness you pick.",
      },
      {
        name: "TabsTrigger and TabsContent",
        why: "These are shadcn's names, and the one place this package does not take them. A trigger here opens a floating layer, and a tab opens nothing. TabsPanel follows the role it announces.",
      },
      {
        name: "`material`",
        why: "A tab bar paints no pane. There is nothing behind it to blur, so glass has nothing to do.",
      },
      { name: "An exported indicator", why: "The rule is structure, not API. A consumer who has to place it is one who will forget." },
    ],
    parts: [
      { part: "TabsList", blurb: "The bar, the hairline, and the one place the size is set. It places the rule itself, so nobody has to remember to" },
      { part: "TabsTab", blurb: "One tab: a control on the height scale wearing the quiet colour, marked active by ink rather than by a fill" },
      { part: "TabsPanel", blurb: "What the tab reveals. It paints nothing: a region that draws its own box is a Card" },
    ],
  },
  {
    slug: "toggle",
    name: "Toggle",
    family: "Control",
    spec: "§11, §34",
        abstract: "Toggle is a button that stays pressed: bold in a formatting bar, a filter that is on or off, a pane you show or hide.",
    overview: ["It is a Button in every respect but one. Its loudness is its state: off is quiet and on is the medium wash, the same soft fill a chosen card or a selected tree row rests on. A screen reader hears it as a pressed or unpressed button."],
    declaration: `<ToggleGroup aria-label="Format" defaultValue={["bold"]}>
  <Toggle value="bold" aria-label="Bold">{icon}</Toggle>
  <Toggle value="italic" aria-label="Italic">{icon}</Toggle>
</ToggleGroup>`,
    topics: [
      { title: "A button that stays pressed", symbols: ["Toggle"] },
      { title: "Sharing one state across several", symbols: ["ToggleGroup"] },
    ],
    refusals: [
      { name: "`emphasis`", why: "The pressed state IS the emphasis. Off is quiet and on is medium, and if you could pick a loudness, a toggle that is off could look louder than one that is on." },
      { name: "`loading`", why: "A toggle does not wait for anything. It flips. A control that starts a job and waits for it is a Button, and a switch that persists is a Switch." },
      { name: "A single-select group", why: "ToggleGroup is always multiple. Pick one of several is a radio group, and this library spells that SegmentedControl, which announces itself as one and moves the value with the arrow keys." },
      { name: "`render`", why: "The primitive's pressed state drives the element's attributes, and the emphasis is stamped from that state. Swapping the element would leave the stamp behind. A toggle is a button." },
    ],
    parts: [
      { part: "ToggleGroup", blurb: "The shared state for a set of toggles: one value array, roving arrow keys, a group announcement. It draws nothing, so make it the layout with render" },
    ],
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    family: "Surface",
    spec: "§11, §20, §32",
        abstract: "Tooltip shows the name of a control when a pointer rests on it.",
    overview: ["It may only repeat what the control already announces, because a tooltip has no keyboard route, no touch route and no reading order, so anything that appears only here is lost to everybody else. It is inverted: dark on a light page and light on a dark one. The part names follow shadcn/ui's tooltip (MIT), with credit, and the behaviour is Base UI's Tooltip."],
    declaration: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button iconOnly aria-label="Undo">{icon}</Button>} />
    <TooltipContent>Undo</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    topics: [
      { title: "Naming a control", symbols: ["Tooltip", "TooltipTrigger", "TooltipContent"] },
      { title: "Timing, stated once near the root", symbols: ["TooltipProvider"] },
    ],
    refusals: [
      {
        name: "Content that is not a string",
        why: "A tooltip holds a sentence, not a small composition. An inverted panel cannot invert an arbitrary subtree: anything that carries its own colour re-states it on its own element and wins, so a key cap inside a tooltip keeps the page's ink and its own pale fill and disappears on a dark panel. Write the shortcut into the sentence. Anything that genuinely needs a chip in it is a Popover.",
      },
      {
        name: "A size",
        why: "The only index a tooltip could take is the one belonging to the control it names, which it cannot see — and reading it would make one label two sizes depending on which button it sat under. A tooltip is one thing at one size.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A tooltip has a job, not a volume. There is nothing for a colour family to mean on a label that restates a name.",
      },
      {
        name: "A delay you set per tooltip",
        why: "Timing is a property of a region of the interface, not of one label — a delay you set per tooltip would make one product feel like several. Wrap your app in a TooltipProvider once and every tooltip inside it shares both the timing and the group, so the first one in a toolbar waits and the rest appear as the pointer travels.",
      },
      {
        name: "A touch story",
        why: "There is no hover on a phone, so nothing opens — and because a tooltip never carries anything of its own, nothing is missing. A hint a touch user genuinely needs belongs in a FieldDescription, a Notice, or on the screen.",
      },
      {
        name: "A material",
        why: "A tooltip defends its words by INVERTING — it is the highest contrast the palette has — and that is the stronger answer than glass. Two defences on one 28px chip is a doubled edge, so the panel stays solid whatever the app is made of.",
      },
      {
        name: "An arrow",
        why: "An arrow is a second boundary on a panel whose boundary is already the strongest contrast on the screen. What says where it came from is that it is anchored to the thing you are pointing at.",
      },
    ],
    parts: [
      { part: "TooltipProvider", blurb: "Optional, and it belongs once near the root of an app: it states the system's timing and groups every tooltip inside it, so a row of buttons reads as one row" },
      { part: "TooltipTrigger", blurb: "The control the tooltip names. Pass your own Button through render." },
      { part: "TooltipContent", blurb: "The words. One short line — the name of the thing, and a shortcut if it has one." },
    ],
  },
  {
    slug: "text",
    name: "Text",
    family: "Type",
    spec: "§15",
        abstract: "Text sets body copy.",
    overview: ["One size index sets three things at once: the font size, the line height and the letter spacing. It renders a span, because laying out a block is the container's job, so write a paragraph as `render={<p/>}`."],
    refusals: [
      { name: "A colour prop", why: "tone says the meaning and the theme resolves the colour. A raw colour goes through style, where a reviewer can see it." },
      { name: "`margin`", why: "Type owns no outer spacing. The margin is zeroed whatever element render names." },
      { name: "`bold` (700)", why: "Semibold is the heaviest weight, and every heading rests there. Hierarchy is size and the ink colours, both already designed. The token is deleted too, so nothing can reach it by hand." },
    ],
  },
  {
    slug: "text-area",
    name: "TextArea",
    family: "Control",
    spec: "§4, §11",
        abstract: "A multi-line text input.",
    overview: ["The visible control is a wrapper around the textarea, which is what lets it carry a border and a background while the text scrolls inside it. It has no icon slots, because an icon floating over a scrolling paragraph has nowhere sensible to sit. Its padding above and below matches the plain side padding, so at every radius level but `full` all four sides are equal; at `full` the sides take the pill correction and the block inset does not, because the corner only cuts into text running sideways. `ref` reaches the textarea, and `className` and `style` dress the wrapper."],
    refusals: [
      { name: "`emphasis` and `tone`", why: "A form where one field is louder than the next says nothing. The same argument as TextField." },
      { name: "`resize`", why: "It would rename raw CSS. Vertical-only is the shipped behaviour, and style on the wrapper is the escape — the handle inherits it." },
      {
        name: "`cols`",
        why: "The container sets the width. A textarea sized in characters uses a unit the type scale does not use, so an 80-column box is a different width at every size step and every density.",
      },
      {
        name: "`render`",
        why: "TextField's sentence: there are two elements and neither can move — the wrapper holds the paint a textarea cannot, and the inner element must stay a textarea or the platform wiring goes with it.",
      },
    ],
  },
  {
    slug: "text-field",
    name: "TextField",
    family: "Control",
    spec: "§4, §9, §11",
        abstract: "TextField is a single-line text input.",
    overview: ["The visible control is a wrapper around the input, which is what makes its icon slots real: a field that holds an icon inside its border cannot keep that border on the input itself. `ref` goes to the input, and `className` and `style` dress the wrapper."],
    refusals: [
      { name: "`emphasis` and `tone`", why: "Loudness ranks actions. A form where one field is louder than the next says nothing." },
      {
        name: "`render`",
        why: "Everywhere else render swaps the one element that is the component. Here there are two, and neither can move: the wrapper holds a border the input cannot, and the input has to stay an input or the platform wiring goes with it.",
      },
    ],
  },
  {
    slug: "theme",
    name: "Theme",
    family: "Layout",
    spec: "§5, §7, §12, §19",
        abstract: "Theme is where an app sets its identity.",
    overview: ["It has eight settings, and each one changes the tokens for everything inside it. Themes nest, so one section can override the page around it. Every setting answers a question once, at the root, so that individual screens are not left answering it one at a time.", "`size` is the newest of them and the one with a limit worth knowing. It sets the step every component rests at when it states no size of its own, so an app whose controls are size 3 says so once instead of on every call. It does not reach text: `Text` and `Heading` read a scale that runs to nine rather than four, and `Code`, `Kbd`, `Badge`, `Avatar` and `Chip` take the size of the line they sit in on purpose."],
    refusals: [
      {
        name: "An `accentColor` prop",
        why: "Accent is written as a hue in the config and baked by the generator, so it is one app-wide identity rather than a per-subtree choice. A runtime prop would mean shipping every family's whole colour scale for every subtree.",
      },
      {
        name: "A scale prop",
        why: "The factor is wired and the prop is deferred. It reopens the day a real need names the steps, and it will ship as designed steps rather than a free multiplier.",
      },
      {
        name: "An elevation axis",
        why: "Deleted. Nothing ever varied it per component, so it was a component fact wearing an axis's clothes. depth is what survived of it.",
      },
      {
        name: "A look axis",
        why: "Deleted. Its two control values had converged on one appearance, and its second surface value was never used: the borderless pane is the one surface identity. A tinted surface can return as a Theme value the day a real app wants one.",
      },
    ],
  },
];

export const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));
