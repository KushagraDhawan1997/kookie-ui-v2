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
  /**
   * What it refuses, and why. The system's argument.
   *
   * `on` narrows a refusal to the named parts. A refusal is written about the component and,
   * left open, reaches every part of it — which is right for `tone` on an accordion and wrong
   * for `render` on a toggle, where the button refuses it and the group is the layout you are
   * told to `render`. The checker reads this field; the page prints the sentence either way.
   */
  refusals: { name: string; why: string; on?: string[] }[];
  /** Parts of a compound component, explained here rather than on stub pages of their own.
      The coverage law accepts either home, and holds part blurbs to a floor. */
  parts?: { part: string; blurb: string }[];
  /**
   * The composition, as code — what a declaration is for a class.
   *
   * Every entry states one, so every page opens the same way. For a compound component it is
   * the arrangement of parts; for a single one it is the call with its common props.
   */
  declaration: string;
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
   * Named departures from the default example, each one linkable.
   *
   * A KNOB SWEEPS AN AXIS; A VARIANT SHOWS A BEHAVIOUR OR A COMPOSITION (2026-09-05, Kushagra,
   * comparing the accordion page with shadcn's: "the playground doesn't fix discoverability, I
   * can't learn that RTL is handled by looking at a gear icon"). Both halves are the point.
   * Nobody sends a colleague to size 3, so `size` stays a knob and gains nothing from being a
   * section; and a state that exists only behind a gear has no URL, which is the same argument
   * that gave every symbol an anchor earlier the same day. Measured before agreeing: 2 of 52
   * examples showed a disabled state and ONE mentioned RTL, in a package that has RTL laws.
   *
   * `name` is the file's suffix — `examples/<slug>.<name>.tsx` — so the file name stays the
   * identity and there is no mapping field to keep in step, exactly as the default example
   * does it. A law walks both directions.
   *
   * WHAT DOES NOT BECOME A VARIANT: shadcn's "Borders" and "Card" are styling variants of
   * their component. Ours refuses a border prop outright and says "put it in a Card", so the
   * first is not expressible and the second is a COMPOSITION — worth showing, and shown as
   * what it is rather than as a property of the accordion.
   */
  variants?: { name: string; title: string; why: string }[];
  /**
   * A live specimen lives in `examples/<slug>.tsx`: one real file, rendered here and shown as
   * source. It is not a field. The file name is the slug, so there is no mapping to keep in
   * step, and a law walks both directions.
   */
};

const DECLARED: Entry[] = [
  {
    slug: "accordion",
    name: "Accordion",
    family: "Control",
    spec: "§11, §21, §37",
        abstract: "Accordion stacks sections that open and close, one under the other.",
    overview: ["An accordion stacks sections under each other. Each section has a heading you press to show or hide its content. Only one section is open at a time. Set `multiple` to let several stay open.","Each heading is as tall as a Button at the same size. Under the pointer, its label underlines. The chevron turns when the panel opens, and the panel slides open by height. The words in a panel start under the heading's label.","Use an accordion when a page has several sections and people need only one or two. Examples are questions and answers, or groups of settings. Use `Tabs` when people switch between views of one thing. Use `NavTree` for navigation with nested levels.","The accordion draws no box of its own. It draws only the thin lines between its sections. Put it in a Card when the sections need an edge. `size` sets the headings and the panel inset, and without a `size` it follows the nearest Theme.","Each heading is a real heading element with a button inside it, so a screen reader lists it with the page headings. Set `headingLevel` to match your page outline. The default is 3.","Press Tab to move between headings, and press Enter or Space to open or close one. The button announces whether its panel is open. Set `hiddenUntilFound` on a panel to let the browser's find-in-page open a closed section."],
    declaration: `<Accordion multiple defaultValue={["shipping"]}>
  <AccordionItem value="shipping">
    <AccordionTrigger>Shipping</AccordionTrigger>
    <AccordionPanel>\u2026</AccordionPanel>
  </AccordionItem>
</Accordion>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` on the root sets every heading and panel inside it. Each heading is as tall as a Button at the same size, so an accordion lines up with the controls around it."},
      {"name":"multiple","title":"Several sections open","why":"Set `multiple` to let people open more than one section. List every section that starts open in `defaultValue`, which is an array of item values."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onValueChange` when your app decides which sections are open. This lets a button such as Expand all open every section at once."},
      {"name":"in-a-card","title":"In a card","why":"The accordion draws only the lines between its sections. Put it in a Card with a Heading when the sections need an edge and a title."},
      {"name":"with-controls","title":"A form in a panel","why":"A panel holds any content, such as a field and a button. Plain text in a panel follows the accordion's size. A Text or a layout inside sets its own size."},
      {"name":"disabled","title":"Disabled","why":"`disabled` sits on the item, so one section closes to you while the rest of the list still opens."},
      {"name":"rtl","title":"Right to left","why":"The chevron turns and the panel's inset mirrors. Direction is read off the DOM, so the app states `dir` once and no component takes a prop for it."},
    ],
    topics: [
      { title: "Stacking the sections", symbols: ["Accordion", "AccordionItem"] },
      { title: "Opening and closing one", symbols: ["AccordionTrigger", "AccordionPanel"] },
    ],
    refusals: [
      { name: "A horizontal orientation", why: "Side-by-side sections need a different keyboard. The accordion is a vertical stack." },
      { name: "`tone` and `emphasis`", why: "Headings have no meaning to colour and none is louder. Put a tone on Text inside a panel." },
      { name: "An icon slot or a custom chevron", why: "The chevron is the system's one disclosure glyph. A custom glyph would be a second way to say open." },
      { name: "A boundary of its own", why: "It draws only the hairlines between items. Put it in a Card if it needs an edge." },
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
    overview: ["An alert dialog stops people to ask a question with two answers, such as \"Delete this file?\". It holds a title, a description, a cancel button and an action button. The component lays these parts out for you.","Use an alert dialog before an action that is hard to undo, such as a delete. Use a `Dialog` when the panel holds work, such as a form. If you need any control other than the two buttons, use a `Dialog`.","The title is the question and the accessible name. The description says what going ahead means. Cancel comes first, sits on the start side, and gets focus when the alert opens. Give the action a verb, such as Delete.","The alert does not close when you press outside it, because a stray press must not answer the question. Escape closes it and counts as Cancel. The action closes it too, on the same press.","`size` sets the whole alert: its width, padding, corner, text and buttons. The width is fixed for each size and is narrower than a Dialog. The panel uses the theme's material, and the page behind it dims.","The alert uses `role=\"alertdialog\"`, and a screen reader announces its title and description when it opens. Focus stays inside it until it closes, then returns to the trigger. An alert raised by app state needs no trigger. The part names follow shadcn/ui's alert-dialog (MIT), and the behaviour comes from Base UI."],
    declaration: `<AlertDialog>
  <AlertDialogTrigger render={<Button>Delete\u2026</Button>} />
  <AlertDialogContent>
    <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
    <AlertDialogDescription>\n      Everything in it goes with it.\n    </AlertDialogDescription>
    <AlertDialogCancel>Keep it</AlertDialogCancel>
    <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the whole alert, including its width, the title, the description and both buttons. Open each one to compare them side by side."},
      {"name":"tones","title":"Tones","why":"Give `AlertDialogAction` a `tone` only when it carries a meaning. A delete uses `destructive`. A question with no risk, such as publishing, keeps the default tone."},
      {"name":"controlled","title":"Controlled","why":"An alert raised by your app, such as an expiring session, has no trigger. Pass `open` and `onOpenChange`, and set `open` from your own logic."},
      {"name":"from-a-menu","title":"Opened from a menu","why":"A menu row cannot hold a trigger, so the row sets `open` in its `onClick`. The menu closes and the alert opens in its place, with the same question."},
      {"name":"rtl","title":"Right to left","why":"The alert follows the direction around its trigger. In a right-to-left region, Cancel sits on the right and the text starts at the right edge."},
    ],
    topics: [
      { title: "Asking the question", symbols: ["AlertDialog", "AlertDialogTrigger"] },
      { title: "Presenting the panel", symbols: ["AlertDialogContent"] },
      { title: "Wording it", symbols: ["AlertDialogTitle", "AlertDialogDescription"] },
      { title: "The two ways out", symbols: ["AlertDialogCancel", "AlertDialogAction"] },
    ],
    refusals: [
      {
        name: "A width prop",
        why: "The width is fixed per size and narrower than a Dialog. An alert asks a question; it does not hold work.",
      },
      {
        name: "Closing on an outside press",
        why: "A stray press must not answer a destructive question. Escape still closes it, as Cancel.",
      },
      {
        name: "Header and Footer",
        why: "The component lays out the title, description and actions itself. Cancel comes first and gets initial focus.",
      },
      {
        name: "`render` on Cancel and Action",
        why: "The alert sizes its two buttons and their row. Action defaults to loud because there is only one.",
      },
      {
        name: "Arbitrary `children`",
        why: "Any control beyond the two buttons, like a confirm field or checkbox, makes it a Dialog.",
      },
    ],
    parts: [
      { part: "AlertDialogTrigger", blurb: "The button that opens it, usually render={`<Button/>`}. An alert driven by app state needs no trigger at all" },
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
    declaration: `<Attachment state="uploading" progress={0.62} icon={fileIcon} meta="2.4 MB" onRemove={remove}>
  quarterly-report.pdf
</Attachment>`,
        abstract: "Attachment is one file and what is happening to it.",
    overview: ["An attachment shows one file and what is happening to it: waiting, uploading, being processed, or failed. It shows the file name, a second line such as the size, an optional icon, and an optional remove button.","Use it wherever a file appears: in a Composer before you send, in a message after you send, and under a form field. A file about to be sent and a file already sent use the same tile, so it is not part of the Composer.","Your app keeps the file. The component never reads a File, starts a timer or creates a URL. Set `state`, `progress` and `meta` from the data your upload code already has.","Set `state=\"uploading\"` with `progress` from 0 to 1 to fill the ring. Without `progress`, the ring sweeps. Use `processing` when the server is working on the file. For `error`, write the reason in `meta`, because colour alone is not a message.","The remove button shows only when you pass `onRemove`. Your app then removes the file from its own list. Set `removeLabel` to change the button's name, for example into another language.","`size` sets the padding, corner, icon, remove button and file name. Set `backdrop` when content passes behind the tile, so it uses the theme's material. A screen reader hears the file name as the tile's name, the second line as its description, and a busy state while it uploads. Each remove button is named for its file."],
    variants: [
      {"name":"states","title":"Every state","why":"One tile per state. `uploading` with a `progress` fills the ring, and without one it sweeps. `processing` shows a server step. An `error` tile says why in `meta`."},
      {"name":"sizes","title":"Sizes","why":"`size` sets the whole tile: its padding, its corner, the icon, the remove button and the file name. At size 2 the remove button is as tall as a size 2 Button."},
      {"name":"live-upload","title":"A live upload","why":"The tile keeps no timer. Your upload code changes `state` and `progress`, and the tile draws what you give it. A timer stands in for a real upload here."},
      {"name":"composer","title":"In a composer, before sending","why":"The strip sits above the text, inside the composer, and every tile has a remove. The list is yours: removing one filters your own array."},
      {"name":"message","title":"In a message, after sending","why":"The same tile with nothing to remove. A file about to be sent and a file already sent are one component, which is why it is not part of the composer."},
      {"name":"form","title":"Under a field, one per line","why":"A field that takes files lists what it has so far. The failed one says why in meta, because the colour alone is not a message."},
    ],
    refusals: [
      {
        name: "A done state",
        why: "Sent and idle look the same. Put a remove button in the tile before sending, a download after.",
      },
      {
        name: "`tone`",
        why: "The state sets the colour. A failed tile is already destructive.",
      },
      {
        name: "Holding the file",
        why: "It never reads a file or creates a URL. Give it a name, a state and an icon.",
      },
      {
        name: "A built-in preview",
        why: "Decode the image yourself and put it in the icon slot.",
      },
      {
        name: "`emphasis`",
        why: "A tile has one volume. Only its state changes how strongly it reads.",
      },
      {
        name: "A shadow",
        why: "A tile is content on the composer, so it never casts a shadow. On glass it keeps the pane's pool.",
      },
      {
        name: "`render`",
        why: "It renders two elements, so `render` could only silently mean one of them.",
      },
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    family: "Type",
    spec: "§11, §35",
    declaration: `<Avatar src="/shruti.jpg" alt="Shruti Bhatia" fallback="SB" badge={<Badge>3</Badge>} />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Sizes 1 to 4 match the control heights. Sizes 5 to 9 are larger, for a face that stands alone, such as a profile header or a member page."},
      {"name":"fallbacks","title":"Pictures and fallbacks","why":"A picture shows when it loads. Until then, or when it fails, the `fallback` shows. Without a `fallback`, a generic person glyph shows instead."},
      {"name":"badges","title":"With a badge","why":"Pass a `Badge` to the `badge` prop to pin it to the top-end corner. A count shows as a pill. A bare dot needs an `aria-label` that says what it means."},
      {"name":"with-a-name","title":"Beside a name","why":"When the name is written next to the avatar, leave `alt` empty. The picture is then decorative, and a screen reader does not read the name twice."},
      {"name":"with-controls","title":"In a row of controls","why":"At sizes 1 to 4 an avatar is as tall as a control at the same size. It lines up with a TextField and a Button in one row."},
      {"name":"in-a-button","title":"As a menu trigger","why":"An avatar does not respond to a press. Put it in an icon-only Button to open an account menu. The avatar fills the button, and the button has the name."},
    ],
        abstract: "Avatar shows a person, a team or a thing as a small round picture, with initials or a generic figure standing in until the picture loads.",
    overview: ["An avatar shows a person, a team or a thing as a small round picture. Until the picture loads, or if it fails, the avatar shows its `fallback`, which is usually initials. Without a fallback, it shows a generic person glyph.","Sizes 1 to 4 match the control heights, so an avatar is as tall as a Button at the same size. It grows with density and on touch screens. Sizes 5 to 9 are larger, for a face that stands alone. Without a `size`, it follows its group, then the nearest Theme.","Use `AvatarGroup` for several overlapping avatars. Use a `Chip` for a word, such as a role or a status. An avatar does not respond to a press. For an account menu, put the avatar inside an icon-only Button.","Pass a `Badge` to `badge` to show a count or a dot at the top-end corner. The avatar places the badge and draws a ring around it in the surface colour.","An avatar is a circle at every radius setting, and its fallback is always neutral. Set `backdrop` when content passes behind it, so the fallback uses the theme's material. A picture covers the material.","`alt` is empty by default, so a screen reader skips the avatar. This is correct when the person's name is written beside it. When the avatar is the only thing that names the person, write the name in `alt`. The fallback then uses the same name."],
    refusals: [
      { name: "A shape prop", why: "A person is a disc at every radius level. For a square picture, use a Card or Box." },
      { name: "`emphasis`", why: "No avatar is louder than another. Rank people by order and size." },
      { name: "`tone`", why: "A tone could only tint the initials, which is too faint. A person's colour is their picture." },
      { name: "A status vocabulary", why: "Status words belong to the app. Use the badge prop for a count or dot, or a Chip in the row." },
      { name: "A press", why: "An avatar is inert. For a pressable person, put the avatar inside an icon-only Button." },
      { name: "A max count on the group", why: "How many to show is a product decision. Make the rest an Avatar whose fallback says +3." },
    ],
  },
  {
    slug: "avatar-group",
    name: "AvatarGroup",
    family: "Type",
    spec: "§35",
    declaration: `<AvatarGroup size="3">
  <Avatar src="/shruti.jpg" alt="Shruti Bhatia" fallback="SB" />
  <Avatar fallback="KD" />
  <Avatar fallback="+3" />
</AvatarGroup>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Set `size` once on the group, and every avatar inside that has no size of its own takes it. The overlap and the rings grow with the size."},
      {"name":"overflow","title":"Counting the rest","why":"The group has no maximum. Decide how many faces to show, then add one more Avatar whose fallback counts the rest and whose `alt` says it in words."},
      {"name":"with-a-label","title":"Beside a label","why":"A group usually sits next to words that say what it shows, and often next to an action. At sizes 1 to 4 the faces line up with a Button."},
    ],
        abstract: "AvatarGroup shows several avatars overlapped, each ringed in the surface colour so the discs stay separate.",
    overview: ["An avatar group shows several avatars in a row, each one overlapping the one before. A ring in the surface colour goes around each avatar, so the circles stay separate.","Use a group to show who has access to something, who is in a meeting, or who worked on a file. For avatars that do not overlap, put them in a `Flex` instead. The overlap is fixed and has no spacing prop.","Set `size` once on the group. Every avatar inside that has no size of its own takes it. An avatar that sets its own `size` keeps it. At sizes 1 to 4, the group is as tall as a Button at the same size.","The group has no maximum count, because how many faces to show is a decision for your product. Show the number you want, then add one more Avatar whose fallback counts the rest, such as +3.","Each avatar keeps its own `alt`. Leave it empty when names are written beside the group. When the faces are the only way to see who is there, give each avatar a name. Give the count avatar a sentence such as \"3 more members\"."],
    refusals: [
      { name: "A max count", why: "How many to show is a product decision. Make the rest an Avatar whose fallback says +3." },
      { name: "A spacing prop", why: "The overlap is fixed by the system. For avatars that don't overlap, use a Flex." },
    ],
  },
  {
    slug: "badge",
    name: "Badge",
    family: "Type",
    spec: "§11, §38",
    declaration: `<Text>
  Inbox <Badge>3</Badge>
</Text>`,
    variants: [
      {"name":"counts","title":"Counts in a pill","why":"Put a number in a badge to make it a pill. The badge shows what you give it, so format the number and choose the cut-off, such as 99+, in your app."},
      {"name":"dots","title":"Named dots","why":"A badge with no content is a dot. A dot is colour alone, so give it an `aria-label` that says what a sighted person understands from it."},
      {"name":"tones","title":"Tones","why":"`tone` says what the badge means. `accent` means something is here and `destructive` means something needs you. Map your own words to a tone in your app."},
      {"name":"sizes","title":"Sizes","why":"A badge without a `size` takes a share of the line it sits in, so it grows with the text around it. Set `size` only when the badge stands alone."},
      {"name":"on-an-avatar","title":"Pinned to an avatar","why":"Pass the badge to an Avatar's `badge` prop. The avatar places it at the top-end corner and draws a ring around it. The badge scales with the avatar."},
      {"name":"in-tabs","title":"In a tab label","why":"A badge in a tab label counts what waits on the other side of the tab. It takes its size from the tab's text, so it needs no `size`."},
      {"name":"in-a-list","title":"In a navigation list","why":"In a list of Rows, put each badge in the `trailing` slot. Every count then lines up at the end of its row."},
      {"name":"conditional","title":"Hidden at zero","why":"Write `{count > 0 && count}` to show the badge only when there is something to count. At zero it has no content and no name, so nothing renders."},
    ],
        abstract: "Badge is the small mark that waits on a thing until you look: the number on an app icon, the unread dot on a tab.",
    overview: ["A badge is a small mark that stays on something until you look at it. Examples are the number on an app icon and the unread dot on a tab. With no content, it is a dot. With a number in it, it is a pill.","A badge is always strong in colour, and it has no `emphasis`. Without a `size`, it takes a share of the line it sits in. A badge in a tab and a badge on a large avatar have the same shape at two sizes. Set `size` only when the badge stands alone.","Use a badge to count or to point at something new. Use a `Chip` for a word, such as Paid or Failed, and for a quieter marker. Use a `Notice` when a condition needs a sentence.","`tone` says what the badge means. The default is `accent`, for \"something is here\". Use `destructive` for \"something needs you\". Your app maps its own words onto a tone, for example \"alert\" to `destructive`.","A bare dot is colour alone, so it needs an `aria-label` that says what it means. A count is its own name, and `aria-label` is optional. With no content and no label, the badge renders nothing, so `{count > 0 && count}` hides it at zero.","A badge has no position of its own. Put it in a line of text or in a Row's `trailing` slot. To pin it to the corner of an Avatar, pass it to the `badge` prop."],
    refusals: [
      { name: "`emphasis`", why: "A badge is always loud. For a quieter marker with a word, use a Chip." },
      { name: "A status vocabulary", why: "Status words belong to the app, which maps each to a tone. Use a Chip if the word must show." },
      { name: "An unnamed dot", why: "A bare dot is colour alone, so the type requires an accessible name." },
      { name: "A position of its own", why: "The element it is pinned to owns the placement. Use the Avatar `badge` prop." },
    ],
  },
  {
    slug: "chip",
    name: "Chip",
    family: "Type",
    spec: "§11, §15, §38",
    declaration: `<Chip tone="success">Live</Chip>`,
    variants: [
      {"name":"tones","title":"Tones","why":"Pick the tone from what the word means. The letters change colour and the box stays grey, so a row of chips stays calm while each word keeps its meaning."},
      {"name":"sizes","title":"Sizes","why":"Set `size` only when a chip is not beside other text. Next to text, leave it unset and the chip matches the line."},
      {"name":"beside-a-heading","title":"Beside a heading and a label","why":"With no `size`, each chip takes the size of the line it sits in. The chip beside the heading is larger than the chip beside the small label, with no size set on either."},
      {"name":"in-a-table","title":"Status in a table column","why":"A status column is the most common place for a chip. Map each status to one tone in your own code, so the same word always has the same colour."},
    ],
        abstract: "Chip shows a short word or a count that says what the thing beside it is right now.",
    overview: ["Chip shows a short word or a count that says what state the thing beside it is in, such as Running, Failed or Deployed. It uses the same fill, corner and one-line box as Code and Kbd.","`tone` carries the category. Use `success` for a finished job, `destructive` for a failed one, `warning` for one that needs attention and `info` for one that is running. The tone changes the colour of the letters, and the box stays the same grey for every tone. Use the same tone for the same word everywhere in your product.","Use a chip for status in a list, a table or beside a title. To show a dot or a count on an avatar or an icon, use a Badge. For a chip you can press or remove, use a Button. For a message about a condition, use a Notice.","`size` is optional. When you do not set it, the chip takes the text size of the line it sits in, so a chip beside a large heading is larger than one in a table row. Set `size` only when the chip stands alone. `weight` and `emphasis` work as they do on Text: `emphasis` changes the letters, not the fill.","Set `backdrop` when the chip sits over an image or other content that passes behind it. The chip then uses the material your Theme sets. On plain ground it stays solid.","A chip is plain text, and a screen reader reads its word as part of the line. The colour adds meaning but does not replace it, so write a word that makes sense without the colour. A chip must have content: the type does not allow an empty chip."],
    refusals: [
      {
        name: "A fill scale, or a variant prop",
        why: "Tone is the category, not the volume, so chips have no loud version. Rank actions with emphasis instead.",
      },
      {
        name: "A dismissal",
        why: "A removable chip is a control and needs focus and a name. Use a Button for now.",
      },
      {
        name: "A count prop",
        why: "A chip renders what you give it. Format the number and choose its cut-off in the app.",
      },
      {
        name: "A position",
        why: "No component owns its own position. Place the chip in a row, a table cell, or a Box.",
      },
      {
        name: "An empty chip",
        why: "A chip is a word. For a dot or a count, use a Badge.",
      },
    ],
  },
  {
    slug: "blockquote",
    name: "Blockquote",
    family: "Type",
    spec: "§11, §15",
    declaration: `<Blockquote>Taste is the last layer.</Blockquote>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` is a step on the type scale, as on Text, and defaults to 3. The indent grows with the text, so the words stay clear of the line at every size."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` picks the ink colour. A quote rests at `loud`. Use `medium` for a quote that supports the text around it rather than leading it."},
      {"name":"tones","title":"Tones","why":"`tone` colours the words and leaves the line neutral. When a coloured bar must carry the meaning, such as a warning, use a Notice instead."},
      {"name":"with-attribution","title":"With an attribution","why":"Put the name in a sibling Text. Use `render` to make the layout a `<figure>` and the name a `<figcaption>`, and pass the source as `cite`."},
      {"name":"in-an-article","title":"In an article","why":"In running text, the quote sits in the same column as the paragraphs. It adds no margin, so the `gap` of the surrounding Stack sets the space."},
    ],
        abstract: "Blockquote sets body copy apart with a rule and an indent.",
    overview: ["A blockquote sets a passage of body text apart with a thin line down its leading edge and an indent. The indent keeps the words clear of the line.","Use a blockquote for a quoted passage, such as a customer quote in an article or an excerpt from a document. Use a `Notice` when a coloured bar must carry a meaning, such as a warning. Use a `Card` when the content needs a boundary.","The text works like `Text`. `size` is a step on the type scale and defaults to 3. `weight` rests at regular, and `emphasis` rests at `loud`, because a quote is text people read.","`tone` colours the words and leaves the line neutral. The line always uses the same colour as a `Separator`, in light and dark mode.","Blockquote has no attribution slot. Put the name in a sibling `Text`. Use `render` to make the layout a `<figure>` and the name a `<figcaption>`, and pass the source address as `cite`. A blockquote adds no margin of its own, so the layout around it sets the space."],
    refusals: [
      {
        name: "A tinted rule",
        why: "A tone colours the words, not the bar. If a live condition needs a coloured bar, use a Notice.",
      },
      {
        name: "An attribution slot",
        why: "Put the attribution in a sibling Text. Nothing non-visual forces a slot here.",
      },
    ],
  },
  {
    slug: "box",
    name: "Box",
    family: "Layout",
    spec: "§2, §3",
    declaration: `<Box p="4" m="2">
  \u2026
</Box>`,
    variants: [
      {"name":"padding","title":"Padding steps","why":"`p` sets padding on all four sides. `px` sets the left and right, `py` sets the top and bottom, and `pt`, `pr`, `pb` and `pl` set one side. Each value is a step on the space scale."},
      {"name":"spacing-a-control","title":"Space around a control","why":"A control never sets the space around itself. When one child needs more room than the gap gives it, wrap that child in a Box with a margin prop."},
      {"name":"responsive","title":"Responsive values","why":"Any Box prop takes an object with a value for each container size. Here the layout is a column on a narrow container and a row from `md` up."},
      {"name":"container","title":"Measurable containers","why":"Add `container` to make a Box measurable, so responsive values inside it follow its width. Give it a width, because a container cannot size itself from its content."},
      {"name":"bleed","title":"Bleeding to the edge","why":"The value `bleed` on a margin prop cancels the padding of the surrounding Card. The picture reaches the top and side edges, and the Card clips its corners."},
      {"name":"backdrop","title":"A backdrop region","why":"`backdrop` marks a region where content passes behind the controls, such as a toolbar over a picture. Every control inside it then uses the theme's material."},
      {"name":"render","title":"Choosing the element","why":"Use `render` to give a Box the element the document needs, such as a `<section>` or a `<nav>`. The Box props apply to that element, with no wrapper."},
    ],
        abstract: "Box is the layout engine every other layout component is built from.",
    overview: ["Box is the layout component that every other layout component is built from. Flex, Stack and Grid are a Box with a fixed `display` and a shorter prop list. Box takes the full set.","Box props cover padding, margin, gap, width and height, position, and the props a flex or grid child needs. Every spacing value is a step on the space scale, not a length. Anything outside the props goes in `style`, which applies last.","Use Flex, Stack or Grid when you know the layout. Use Box when a layout must switch display at a container size, or for one-off spacing. A control never sets the space around itself, so wrap it: `<Box mt=\"4\"><Button/></Box>`.","Any prop takes one value, or an object with a value for each container size: `initial`, `sm`, `md` and `lg`. Sizes follow the nearest Box marked `container`, or the Theme root when there is none.","Set `container` only on a Box whose width comes from the layout or from `width`. A container cannot size itself from its content, so in a plain flex row it collapses to zero width. A development build warns you when this happens.","The value `bleed` on a margin prop cancels the padding of the surrounding Card or Surface, so a picture can reach its edge. `backdrop` marks a region where content passes behind the controls, so they use the theme's material. `render` puts the Box props on an element you choose, such as a `<section>`."],
    refusals: [
      {
        name: "Utility classes",
        why: "Values pass as inline custom properties, so the stylesheet never grows with the values you use.",
      },
      {
        name: "A bleed prop",
        why: "Bleed is a margin value, such as `m=\"bleed\"`. Separate props would duplicate every margin spelling.",
      },
      {
        name: "Containment by default",
        why: "A container cannot hug its contents, so it collapses in a flex row. Add `container` only where the layout sets the size.",
      },
    ],
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    family: "Type",
    spec: "§11, §39",
        abstract: "Breadcrumb shows the path to where you are: the places above this one, each a way back, ending in the place you are now.",
    overview: ["Breadcrumb shows the path from the top of your app to the current page. Each crumb before the last is a link back to that place. The last crumb is the current page, and it is plain text.","Use a breadcrumb when your pages sit several levels deep, such as folders, projects or settings sections. Do not use it for the steps of a process or for a history of visited pages. To switch between views at the same level, use Tabs.","Each `BreadcrumbItem` draws the chevron that follows it, and the last item draws none. You never place a separator by hand, so every breadcrumb in your app uses the same chevron.","When the path is too long, keep the first crumb and the last few, and pass the rest to `BreadcrumbEllipsis` as `items`. The ellipsis is a button that opens a menu of those places. Give each item an `href`, a `render` element or an `onClick`. The component does not decide which levels to hide.","`size` sets the text size for the whole path, and the default is `2`. There is no `tone` or `emphasis`. Links use the muted text colour, the current page uses the full text colour, and the chevrons use the faint colour. The theme adjusts all three for dark mode and high contrast.","Breadcrumb renders a `<nav>` landmark that holds an ordered list, so a screen reader can find it in the landmark list and read it as a path. Set `label` to name the landmark in your app's language. The default name is \"Breadcrumb\". The current page carries `aria-current=\"page\"`. Tab moves through the links, and the arrow keys move through the ellipsis menu."],
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
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` on `Breadcrumb` reaches every crumb and every chevron. Use size 2 in most page headers, and size 3 when the path sits beside a large title."},
      {"name":"short-path","title":"A path with two levels","why":"A breadcrumb with one link and the current page is still useful. It gives you one clear way back to the list you came from."},
      {"name":"collapsed-levels","title":"Hidden levels in a menu","why":"Keep the first crumb and the last ones, and pass the middle levels to `BreadcrumbEllipsis`. Each item here uses `onClick`, for places your app opens with code instead of a URL."},
      {"name":"page-header","title":"Above a page title","why":"Put the breadcrumb above the page heading, with the page actions on the same line as the heading. The last crumb repeats the heading, so you always see where you are."},
      {"name":"rtl","title":"Right to left","why":"Set `dir=\"rtl\"` on the breadcrumb or on any ancestor. The chevrons point the other way, and the path reads from the right. Name the landmark in the page's language with `label`."},
    ],
    topics: [
      { title: "Drawing the path", symbols: ["Breadcrumb", "BreadcrumbItem"] },
      { title: "The places above this one", symbols: ["BreadcrumbLink", "BreadcrumbEllipsis"] },
      { title: "Where you are", symbols: ["BreadcrumbPage"] },
    ],
    refusals: [
      {
        name: "`BreadcrumbSeparator`",
        why: "Each item draws its own chevron and the last one is hidden. You never place separators by hand.",
      },
      {
        name: "`BreadcrumbList`",
        why: "A breadcrumb is always a landmark holding a list, so `Breadcrumb` renders both.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A breadcrumb is a location, not a meaning. Its three text shades are fixed.",
      },
      {
        name: "`maxItems` and any automatic collapse",
        why: "The component does not decide what to drop. Render the crumbs you keep and pass the rest to BreadcrumbEllipsis.",
      },
      {
        name: "An ellipsis that does nothing",
        why: "Three dots promise more. BreadcrumbEllipsis requires `items`, so it always opens a menu.",
      },
      {
        name: "Role=link and aria-disabled on the current page",
        why: "The current page is not a link and is not disabled. It is plain text with aria-current.",
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
    declaration: `<Button tone="accent" emphasis="loud">
  Save changes
</Button>`,
    variants: [
      {"name":"emphasis","title":"Emphasis","why":"Read a row of actions from loud to quiet. Use one loud button for the main action, medium for other actions, and quiet for actions such as Cancel. A quiet button with `bordered` sits between quiet and medium."},
      {"name":"tones","title":"Tones","why":"`tone` says what an action does. Use `accent` for your main brand action and `destructive` for an action that deletes. Each tone works at every emphasis level."},
      {"name":"sizes","title":"Sizes","why":"One `size` sets the height, the padding, the corner, the icon and the text together. Use size 2 on most screens, and match the size of the other controls in the same row."},
      {"name":"with-icons","title":"With icons","why":"Put an icon before the label with `leading`, or after it with `trailing`. The theme sizes the icon to the button, so you do not set a width or a height."},
      {"name":"icon-only","title":"Buttons with only an icon","why":"Set `iconOnly` and put the icon in `children`. The type requires an `aria-label` or an `aria-labelledby`, because a screen reader cannot read an icon."},
      {"name":"states","title":"Loading and disabled","why":"`loading` shows a spinner in the leading slot and blocks the press, while the label stays. `disabled` greys the button and removes it from the tab order."},
      {"name":"done","title":"A copy button that confirms","why":"Set `done` after the action succeeds, and the icon changes to a tick. Your app holds the state and clears it with a timer. Change the label or `aria-label` too, so a screen reader hears the result."},
      {"name":"as-link","title":"A button that goes to a page","why":"Use `render={<a href />}` when the action opens another page. The button keeps its appearance, and the browser treats it as a link, so it opens in a new tab on request."},
      {"name":"in-a-form","title":"In a form","why":"Set `type=\"submit\"` on the main action and `type=\"reset\"` on the quiet one. Enter in a field submits the form through the submit button."},
    ],
        abstract: "Button is the action control, and the one the shared control layer was built for.",
    overview: ["Button starts an action, such as saving a form, opening a dialog or deleting a file. You set what the action means with `tone` and how prominent it is with `emphasis`. The theme turns those two choices into a colour.","`emphasis` ranks the actions on a screen. `loud` fills the button with the tone's solid colour, `medium` gives it a soft fill, and `quiet` has no fill. The default is `medium`, with the `neutral` tone. Give each screen or pane one loud button for its main action. Add `bordered` to put a thin line around a button, which sits between quiet and medium.","Use `tone` for meaning. Use `destructive` for an action that deletes or removes, `accent` for your brand's main action, and `success` for an action that approves. Do not pick a tone to get a colour you like.","`size` sets the height, the side padding, the corner, the icon size and the text size together. The default comes from the nearest `Theme`, which is `2` unless your app sets another value. Controls at the same size line up in a row. On a phone the theme makes every size taller, so the tap target stays large enough.","Put an icon before the label with `leading`, or after it with `trailing`. Set `iconOnly` for a square button that shows only an icon, and give it an `aria-label`. Set `loading` while the action runs: a spinner replaces the leading icon, the label stays, and the press is blocked. Set `done` when the action finishes: the icon changes to a tick for as long as you keep it true.","Use `render` to make a Button look like a button but work as a link, for example `render={<a href=\"/billing\" />}`. For an action with a menu of related actions, use a SplitButton. For several buttons joined into one control, use a ButtonGroup. For an on and off state, use a Toggle. For a link inside a sentence, use a Link.","Button renders a real `<button>`, so Enter and Space press it and it sends a form when `type` is `submit`. There is no `margin` prop: put space around a button with the layout that holds it, or with `<Box m>`. A screen reader reads the label, or the `aria-label` on an icon-only button. When you use `done`, change the label too, for example from \"Copy\" to \"Copied\", because a screen reader does not read the tick."],
    refusals: [
      { name: "`margin`", why: "A component never sets outer spacing; its container does. Use `<Box m>`." },
      {
        name: "`variant`",
        why: "It mixes loudness with meaning, so a quiet destructive action is impossible. Use `tone` and `emphasis`.",
      },
      {
        name: "A shadow prop",
        why: "There is no elevation prop. Theme `depth` sets shadows for the whole app.",
      },
    ],
  },
  {
    slug: "surface",
    name: "Surface",
    family: "Surface",
    spec: "§10",
    declaration: `<Surface size="2">
  \u2026
</Surface>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the padding and the corner, from 1 to 4. The values match a Card at the same size. Use a larger size for a larger region."},
      {"name":"holding-cards","title":"Holding cards","why":"Put cards on a Surface to group them into one region. The cards keep their own fill, border and shadow. The Surface sits behind them and does not cast a shadow."},
      {"name":"in-a-card","title":"In a card","why":"Put a Surface inside a Card to set apart a quieter region, such as a key or a code sample. Use a small size so the inner corner is smaller than the card's corner. Do not put a Card inside a Card."},
      {"name":"as-a-layout","title":"As a layout","why":"Use `render` to make the Surface a layout component, such as a Stack. The result is one element that has the fill and the column layout. You do not need a wrapper."},
      {"name":"bleed","title":"Bleed to the edge","why":"Set a margin prop to `bleed` to make a child reach the edge of the Surface. Here a Separator runs from edge to edge. Use `mx` for the sides only, or `m` for all four edges."},
    ],
        abstract: "Surface is a ground: the region that objects sit on.",
    overview: ["A Surface is a region that other things sit on. A Card is an object, and a Surface is what holds it. The Surface has a fill one step away from the page, a thin border and a corner.","Use a Surface for a bounded part of a page that holds cards, such as a board or a gallery. Also use it for a quieter region inside a card, such as a code sample, a key or a group of settings. Use a Card for a single object that people read, open or press.","Its colour is a fixed pair of values, one for light mode and one for dark mode. It is not one step down from its parent, because in dark mode a relative step would be lighter than the cards on it. In dark mode the border does most of the work of showing the region.","`size` sets the padding and the corner, and it matches a Card at the same size. The corner is not a size you set. There is no fill, border, tone or emphasis prop, because a second way to change the fill and the edge would make a second kind of Card.","A Surface does not blur what is behind it, and it has no `backdrop` prop. Its fill is solid, so a card on it is solid too. A child that sets its own `backdrop` still gets glass. A Surface clips its content, and a child can reach the edge with `m=\"bleed\"`. It has no keyboard behaviour of its own."],
    refusals: [
      {
        name: "A fill or an edge prop",
        why: "A fill and edge vocabulary would make a second way to build a Card. The ground colour and hairline are fixed.",
      },
      {
        name: "A border toggle",
        why: "Lined and unlined grounds would say the same thing. In dark mode the hairline is what shows the region at all.",
      },
      {
        name: "`material` and `backdrop`",
        why: "A ground's backdrop is its own parent, so glass has nothing to defend. A child that states `backdrop` still gets glass.",
      },
      {
        name: "Tone, emphasis and a shadow",
        why: "A container ranks nothing against its siblings, and a region in the page throws no shadow.",
      },
    ],
  },
  {
    slug: "card",
    name: "Card",
    family: "Surface",
    spec: "§9, §10",
    declaration: `<Card size="2">
  \u2026
</Card>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` changes the padding and the corner, and the content sets the height. Use a smaller size for dense content such as stats, and a larger one for a single form."},
      {"name":"as-a-link","title":"A card that opens a page","why":"Pass `render={<a href />}` and the whole card is one link, with hover, press and focus states. Keep only one link inside it, because a link inside a link is invalid."},
      {"name":"as-a-button","title":"A card that runs an action","why":"Pass `render={<button />}` when the card runs an action instead of opening a page. Put the handler on the element you pass to `render`."},
      {"name":"choice","title":"Cards that select one option","why":"Wrap each Radio in `<Card render={<label />}>` inside a RadioGroup. The whole card selects its option, and the chosen card's edge shows the accent colour."},
      {"name":"disabled","title":"Disabled","why":"A card rendered as a disabled button fades its fill and its text and stops showing a pointer. Say why it is disabled in the card's own text."},
      {"name":"responsive-grid","title":"Cards in a responsive grid","why":"Pass an object to `columns` on Grid to change the layout as the room grows. Here the cards stack in one column, then move to three columns from the `sm` width."},
      {"name":"settings","title":"A settings form in a card","why":"A card holds a whole task: a heading, a field and its actions. The one loud button is the card's main action."},
    ],
        abstract: "Card is an object with its own surface: one solid fill, one corner and one padding, and nothing else.",
    overview: ["Card is an object with its own surface: one solid fill, one corner and one padding. It holds any content you put inside it, such as a title, a form or a list. A card has no title or footer parts, so you arrange its content with Stack and Flex.","Use a Card to separate one object from the rest of the page, such as a project, a plan or a settings group. To make a quiet region that holds several cards, use a Surface. Do not put a card inside another card. For a quiet region inside a card, such as a code sample, use a Surface or a CodeBlock.","`size` sets the padding and the corner. It never sets a height, because the content decides how tall the card is. The theme's `depth` decides whether cards cast a shadow, and there is no shadow prop on the card.","The element you pass to `render` decides what the card does. Render it as an `<a>` or a `<button>` and the whole card presses, with the same hover, press, focus and disabled appearance as other controls. Wrap a Radio or a Checkbox in `<Card render={<label />}>` and the whole card selects that control. When the control is checked, the card's edge shows the accent colour.","A card clips its content to its corner. To make a picture or a band reach the card's edge, put it in a Box with `m=\"bleed\"`, or with `mt=\"bleed\"` and `mx=\"bleed\"` for the top edge only.","Set `backdrop` when an image, a map or a scrolling feed passes behind the card. The card then uses the material your Theme sets. A card on plain ground stays solid. A card is not focusable unless you render it as a link, a button or a label. A screen reader then reads it as that element, so write the card's text so it makes sense read aloud as one name."],
    refusals: [
      {
        name: "A `selected` prop, and an `interactive` one",
        why: "Use `<Card render={<button/>}>` to press, or wrap a `Radio` in `<Card render={<label/>}>` to select.",
      },
      {
        name: "A card inside a card",
        why: "Stacked cards describe no real relationship. Use a Surface for a quiet region, or to hold several cards.",
      },
      {
        name: "A material prop",
        why: "Material is a Theme value for a whole scope. To make one subtree differ, use a nested Theme.",
      },
      {
        name: "Tone, emphasis and bordered",
        why: "A card ranks nothing against its siblings. Its edge comes from light, not from a loudness level.",
      },
      {
        name: "A media or cover slot",
        why: "A card clips its children. Make a picture reach the edge with `<Box mt=\"bleed\" mx=\"bleed\">`.",
      },
      {
        name: "Header and footer slots",
        why: "Card regions are layout, which you compose. Nothing non-visual forces a header or footer part.",
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    family: "Control",
    spec: "§4, §6, §11",
    declaration: `<Checkbox id="ship" defaultChecked />
<Text render={<label htmlFor="ship" />}>Ship it</Text>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Each checkbox size matches one line of text at a matching text size. Pair a size 2 checkbox with size 3 text, and go up together."},
      {"name":"in-a-form","title":"In a form","why":"Put each checkbox in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The field connects each label and description to its checkbox, so you write no `id`."},
      {"name":"select-all","title":"Select all with a mixed state","why":"The checkbox above the list shows `indeterminate` when only some files are selected. A press on it selects all files or clears them."},
      {"name":"disabled","title":"Disabled","why":"`disabled` fades the box and its check and blocks the press. A disabled checkbox keeps its state, so a checked one still shows its tick."},
      {"name":"controlled","title":"Controlled","why":"Pass `checked` and `onCheckedChange` when other parts of the screen depend on the value. Here the button stays disabled until you accept the terms."},
      {"name":"in-a-card","title":"In a card","why":"Wrap a checkbox and its text in `<Card render={<label />}>`. The whole card toggles the option, and a checked card's edge shows the accent colour."},
    ],
        abstract: "Checkbox is a control that is its own mark.",
    overview: ["Checkbox turns one option on or off. It is off in a neutral colour and on in the accent colour, and it can also show a mixed state for a group where only some options are on.","Use a checkbox for an option that takes effect when you submit a form, or for choosing several items from a list. For a setting that takes effect at once, use a Switch. To pick one option from several, use a RadioGroup. For a pressed state in a toolbar, use a Toggle.","The checkbox is exactly one line tall of the text beside it, so it lines up with its label. Its tappable area extends past the box you can see, to the size a Button of the same size would occupy. When you stack checkboxes in a column, leave at least `gap=\"5\"` between them, so the tappable areas do not overlap.","The label is a separate element, not a child. Inside a form, put each checkbox in a `FieldItem` with a `FieldLabel`, and add a `FieldDescription` when the option needs one. Outside a form, give the checkbox an `id` and render a Text as `<label htmlFor>`. A label that wraps the checkbox also works, such as `<Card render={<label />}>`.","Use `defaultChecked` when the checkbox holds its own state, or `checked` with `onCheckedChange` when your app holds it. Set `indeterminate` for the mixed state. Set `name` to send the value with a form. `size` sets the box size, and the default comes from the nearest Theme. There is no `readOnly`: use `disabled` instead.","Space toggles a focused checkbox, and a click on its label toggles it too. A screen reader reads the label and the state: checked, not checked or mixed. The theme draws a focus ring when you reach the checkbox with the keyboard."],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "Off is neutral and on is accent, always. A checkbox has one meaning.",
      },
      {
        name: "`children`",
        why: "The label is a sibling element. The row sets the distance between them.",
      },
      {
        name: "`readOnly`",
        why: "HTML defines no readonly checkbox, and it would look exactly like a live one.",
      },
    ],
  },
  {
    slug: "code",
    name: "Code",
    family: "Type",
    spec: "§11, §15",
    declaration: `<Text>
  Run <Code>pnpm run ci</Code> first.
</Text>`,
    variants: [
      {"name":"inherited-size","title":"Size from the surrounding text","why":"With no `size`, the code matches the heading, the body text and the small caption it sits in. You set the size once, on the Text or the Heading."},
      {"name":"tones","title":"Tones","why":"`tone` changes the fill and the letters. Use it when the value itself carries a meaning, such as a status code or an error name."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` changes only the letters. Use `quiet` for a value that no longer applies, such as an old endpoint."},
      {"name":"in-a-table","title":"Names in a table column","why":"Put Code in a table cell for names such as environment variables. The code takes the cell's text size."},
    ],
        abstract: "Code shows inline code in the mono font, with a light fill behind it.",
    overview: ["Code shows a short piece of code inside a sentence, such as a command, a file name or a value. It uses the mono font with a light fill behind it.","Use Code for code that sits inside a line of text. For code on several lines, use a CodeBlock. For a key or a keyboard shortcut, use a Kbd.","`size` is optional. When you do not set it, the code takes the size of the line it sits in, so code inside small text stays small and code in a heading is large. Set `size` only when the code stands alone.","`emphasis` changes the colour of the letters, the same way it does on Text. Code rests at `loud`, because faded code is harder to read. `tone` changes both the letters and the fill, so use it when the value itself has a meaning, such as an error code or a success status. The default tone is `neutral`.","Code renders a `<code>` element, and a screen reader reads it as ordinary text. Use `render` when the document needs another element, such as `<samp>` for program output."],
    refusals: [
      {
        name: "A fill that gets louder with emphasis",
        why: "Emphasis picks the ink colour. A fill that also changed would read one prop two ways.",
      },
      {
        name: "Block code",
        why: "Block code needs overflow, wrapping and scrolling. Use a CodeBlock.",
      },
    ],
  },
  {
    slug: "code-block",
    name: "CodeBlock",
    family: "Type",
    spec: "§15, §40",
    declaration: `<CodeBlock size="2">{source}</CodeBlock>`,
    variants: [
      {"name":"with-topbar","title":"File name and copy button","why":"Shows the `topbar` slot with a file name on one side and a copy button on the other. The button uses `done` to show a tick after it copies, and `band` keeps the first line of code clear of the row."},
      {"name":"max-lines","title":"Limited height","why":"Shows `maxLines` on a long file. Six lines show, and the rest scroll inside the pane. Use it when a sample is long but only its start matters on the page."},
      {"name":"with-footer","title":"Status row at the bottom","why":"Shows the `footer` slot under terminal output. Use a footer for facts about the code above it, such as an exit code or how long a command took."},
      {"name":"sizes","title":"Sizes","why":"Shows the four sizes one above the other. One `size` changes the padding, the corner and the text together, so a larger block stays in proportion."},
      {"name":"in-a-card","title":"In a card","why":"Shows a CodeBlock inside a Card with a heading, a description and an action. The code pane sits into the card, so it does not look like a second card."},
    ],
        abstract: "CodeBlock shows a block of code in a well recessed into the page.",
    overview: ["CodeBlock shows a block of code in a pane that is set into the page. Use it for a command to run, a file to copy, or a sample of an API response. For a short literal inside a sentence, such as a prop name or a file path, use `Code` instead.","Long lines wrap only at spaces, so names and paths are never broken. A line with no space scrolls sideways. Set `maxLines` to limit the height to that many lines. The rest of the code scrolls, and nothing is cut off, so every line stays reachable by wheel, keyboard and screen reader.","One `size` sets the padding, the corner and the text size together. The pane uses the same colour as a `Surface`, not a `Card`, because the code is part of the page and not an object placed on it. It follows light and dark mode with the rest of the theme.","CodeBlock does not highlight code. Use any highlighter that has a CSS-variables mode, and point it at the `--code-` variables. Each of those colours is already checked for contrast against the pane in light and dark mode.","Use `topbar` for a row at the top of the pane, such as a file name and a copy button. Set `band` when that row reaches both sides of the pane, so the first line of code starts below it. Use `footer` for a row at the bottom, such as a status line."],
    refusals: [
      {
        name: "Highlighting",
        why: "Pick your own highlighter. Point its CSS-variables mode at the --code- variables the system publishes.",
      },
      {
        name: "A switch for wrapping",
        why: "It wraps only at spaces, so names and paths are never cut. A line with no space scrolls.",
      },
      {
        name: "A copy button, line numbers, and a collapse",
        why: "Put a copy Button in the topbar. Line numbers belong to your renderer. Long code scrolls instead of collapsing.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "Code has no meaning to colour and no block is louder. The syntax theme supplies the colours.",
      },
      {
        name: "A Card as the pane",
        why: "Code is recessed into the page, not placed on it. So the pane is a Surface.",
      },
    ],
  },
  {
    slug: "combobox",
    name: "Combobox",
    family: "Surface",
    spec: "§20, §21, §23, §28, §50",
    abstract: "Combobox is a field you type in to narrow a list of options, and pick one of them.",
    overview: ["A Combobox is a field you type in to narrow a list of options, and then pick one of them. Use it when the list is too long to scan, such as countries, time zones or team members. For a short list of fewer than about ten options, use `Select`. To run commands instead of picking a value, use `Command`.","The field is a `TextField` you type into, with the same fill, border, height and focus ring. The panel is the same as the panel of `Select`, so the rows, the corner and the tick all match. The panel is never narrower than the field above it. The part names follow shadcn/ui's combobox (MIT), with credit, and the behaviour is Base UI's Combobox.","What you type narrows the list and never becomes the value. A form receives the option you picked. Base UI matches the typed text against the label of each option and renders only the options that match. That is why `ComboboxList` takes a function instead of children: you write every option one time, and the panel decides which of them show.","Keep the `items` array stable. The matcher compares it by reference, so an array written inside your component runs the whole filter again on every render. Put it at module scope, or in a `useMemo`. An option can be a string, or an object with a `value` and a `label`: people search by the label, and the form receives the value.","Set `name`, `required`, `disabled`, `readOnly` and `form` on the `Combobox`, not on `ComboboxInput`. On the input they would act on the typed letters instead of the chosen option. `size` matches a `TextField` or a `Button` at the same size, and inside a `Field` the field sets the size.","The input has the `combobox` role and tells a screen reader when the list is open. The arrow keys move through the options, Enter picks one, and Escape closes the panel. A chosen row is announced as selected, not only shown with a tick. Inside a `Field`, the field label names the input and the list."],
    declaration: `<Combobox items={regions}>
  <ComboboxInput placeholder="Search regions" />
  <ComboboxContent>
    <ComboboxEmpty>No region matches.</ComboboxEmpty>
    <ComboboxList>
      {(region) => (
        <ComboboxItem value={region}>{region}</ComboboxItem>
      )}
    </ComboboxList>
  </ComboboxContent>
</Combobox>`,
    variants: [
      {"name":"groups","title":"Grouped options","why":"Shows options in sections with `ComboboxGroup` and `ComboboxLabel`. When nothing in a section matches what you type, the section and its heading disappear together."},
      {"name":"object-options","title":"Values and labels","why":"Shows options as objects with a `value` and a `label`. People search and read the label, and a form receives the value, so London submits as `eu-west-2`."},
      {"name":"controlled","title":"Controlled","why":"Shows `value` and `onValueChange` driving text elsewhere on the screen. The callback fires when a person picks or clears an option, and it does not fire while they type."},
      {"name":"in-a-form","title":"In a form","why":"Shows a Combobox inside a Field with a label, a description and an error. `name` and `required` go on the Combobox, and the error shows when a person submits without a choice."},
      {"name":"disabled","title":"Disabled","why":"Shows a disabled Combobox, a read-only Combobox and a list with one disabled option. Read-only keeps the value visible and submitted, but the list does not open."},
      {"name":"with-icon","title":"Icon before the text","why":"Shows the `leading` slot with an icon. The chevron always sits at the trailing edge, so an icon goes before the text."},
      {"name":"sizes","title":"Sizes","why":"Shows the four sizes one above the other. The field, the panel, the rows and the text all change together, and each size matches a TextField or a Button at the same size."},
    ],
    topics: [
      { title: "Typing and picking", symbols: ["Combobox", "ComboboxInput"] },
      { title: "Presenting the panel", symbols: ["ComboboxContent"] },
      { title: "Listing the options", symbols: ["ComboboxList", "ComboboxItem", "ComboboxEmpty"] },
      { title: "Grouping into sections", symbols: ["ComboboxGroup", "ComboboxLabel", "ComboboxCollection"] },
    ],
    refusals: [
      {
        name: "Free text with suggestions",
        why: "A Combobox submits one of your options, never typed text. Use Command for a palette; free-text suggestions have not shipped.",
      },
      {
        name: "`multiple`",
        why: "Deferred. Several values need chips inside the field, and that design does not exist yet.",
      },
      {
        name: "A matcher of your own, a limit, and inline completion",
        why: "The letters filter the list by label. To match differently, pass a list you have already narrowed.",
      },
      {
        name: "`disabled`, `readOnly`, `name`, `required` and `form` on the field",
        why: "Set these on the Combobox. On the input they submit the typed letters or leave the list working.",
        on: ["ComboboxInput"],
      },
      {
        name: "A Separator inside the panel",
        why: "A listbox may hold only options and groups, so a separator fails accessibility checks. Use a group.",
      },
      {
        name: "`render` on the field",
        why: "It renders two elements, so `render` could only silently mean one of them.",
        on: ["ComboboxInput"],
      },
      {
        name: "A clear button",
        why: "Not yet. The chevron owns the trailing edge, and a clear button beside it is not designed.",
      },
    ],
    parts: [
      { part: "ComboboxInput", blurb: "The field you type in. The wrapper is the control and the input inside it is bare, which is what lets the chevron sit inside the border. The chevron opens the list for a pointer and stays out of the tab order, because the keyboard opens it from the field" },
      { part: "ComboboxContent", blurb: "The floating panel: it portals, hangs below the field, re-applies the theme, and is never narrower than the field that opened it" },
      { part: "ComboboxList", blurb: "The listbox. It takes a function and calls it for each option that survives what you typed, and it is the element a name for the list belongs on" },
      { part: "ComboboxCollection", blurb: "Renders each surviving option of the group it sits in, which is what lets one section narrow and empty while the others stay" },
      { part: "ComboboxItem", blurb: "One option row. Its tick stays in place so chosen and unchosen rows line up, and the words you write here are what the row reads as" },
      { part: "ComboboxGroup", blurb: "A section carrying its own options, so the filter empties it and hides the heading with it" },
      { part: "ComboboxLabel", blurb: "A heading for a run of option rows. It works inside a group and on its own, and the keyboard never lands on it" },
      { part: "ComboboxEmpty", blurb: "What the panel says when nothing matches. It is always rendered, so a screen reader announces the message when it arrives, and it takes room only when it speaks" },
    ],
  },
  {
    slug: "context-menu",
    name: "ContextMenu",
    family: "Surface",
    spec: "§21, §22, §42",
        abstract: "ContextMenu is the menu a right-click opens, over the area you right-clicked.",
    overview: ["ContextMenu is the menu that opens when a person right-clicks an area, at the point they clicked. On a touch screen, a long press opens it. Use it for shortcuts to actions a person can also reach another way, such as rename, duplicate or delete on a file. To open a menu from a visible button, use `Menu`.","It uses the same panel and the same rows as `Menu`, so you build it from `MenuItem`, `MenuGroup`, `MenuLabel`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuSub` and their parts. The panel opens from the point you clicked and grows out of it. The part names follow shadcn/ui's context-menu (MIT), with credit, and the behaviour is Base UI's ContextMenu.","`ContextMenuTrigger` is the area that responds to a right-click. It draws no fill, border or cursor, because a right-click happens over content that is already visible. It stops the browser's own menu from opening. Use `render` to make an element you already have into the area.","The system places the panel. Its corner goes on the point you clicked, and the panel moves to stay inside the window. There are no `side`, `align` or offset props. `size` sets the panel and its rows, and the panel follows the theme inside its portal.","Keyboard and screen-reader behaviour is the same as `Menu`. The arrow keys move through the rows, Enter chooses a row, typing a letter jumps to a row, and Escape closes the panel. Because a right-click is hard to find, do not put an action only in a context menu. Make it available from a button or a `Menu` too."],
    declaration: `<ContextMenu>
  <ContextMenuTrigger>
    <Surface>The area you right-click</Surface>
  </ContextMenuTrigger>
  <ContextMenuContent>
    <MenuItem>Duplicate</MenuItem>
    <MenuItem tone="destructive">Delete</MenuItem>
  </ContextMenuContent>
</ContextMenu>`,
    variants: [
      {"name":"groups","title":"Grouped rows","why":"Shows rows in MenuGroup sections with a MenuLabel. The label names the group for a screen reader, and the keyboard skips it."},
      {"name":"shortcuts","title":"Icons and shortcuts","why":"Shows the `leading` slot with icons and the `trailing` slot with keyboard shortcuts. The labels all start on the same line, with or without an icon."},
      {"name":"checkable","title":"Checkbox and radio rows","why":"Shows MenuCheckboxItem for settings that turn on and off, and MenuRadioGroup for one choice from several. These rows keep the menu open, so a person can change several settings."},
      {"name":"submenu","title":"Submenus","why":"Shows MenuSub rows that open a second panel beside the first. Hover the row or press the right arrow key to open it."},
      {"name":"disabled","title":"Disabled","why":"Shows disabled rows, including a destructive one. A disabled row stays in the menu and is still announced, so a person can see the action exists."},
      {"name":"per-row","title":"One menu for each item","why":"Shows a list where each row has its own ContextMenu. The menu acts on the row that was right-clicked, and the trigger does not change how the row looks."},
    ],
    topics: [
      { title: "Catching the right-click", symbols: ["ContextMenu", "ContextMenuTrigger"] },
      { title: "Presenting the panel", symbols: ["ContextMenuContent"] },
    ],
    refusals: [
      {
        name: "A parallel set of parts",
        why: "Those parts are the Menu parts under a second name. Use MenuItem, MenuGroup, MenuSub and the rest directly.",
      },
      {
        name: "Side, align and an offset",
        why: "The panel's corner goes on the point you clicked, and the viewport picks which corner.",
      },
      {
        name: "An appearance for the region",
        why: "A right-click happens over visible content, so the region draws no fill, border or cursor.",
      },
      {
        name: "Opening on a left click",
        why: "That is a Menu with a trigger. One panel opening for two gestures would confuse readers.",
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
    overview: ["Dialog shows a panel over a dimmed app. Use it for a short task that needs full attention, such as editing settings or renaming a project. To ask a yes-or-no question before a risky action, use `AlertDialog`. For a panel that leaves the page usable, use a `Popover`. For a panel that slides in from an edge, use a `Sheet`.","The panel looks like a `Card` with a slightly rounder corner. It casts no shadow of its own, because the dimmed background behind it separates it from the page. On a narrow window it sits on the bottom edge as a sheet instead. The part names follow shadcn/ui's dialog (MIT), with credit, and the behaviour is Base UI's Dialog, including the focus trap and scroll lock.","`size` sets the width, the padding, the corner, and the size of `DialogTitle` and `DialogDescription`. Everything else you write inside keeps its own size. Write the layout of the panel yourself with `Stack` and `Flex`, and place a `DialogClose` button where the layout needs one. There is no close button in the corner.","The panel grows with its content. To limit its height, set `maxHeight` on `DialogContent` and put a `ScrollArea` inside it. The scroll area scrolls, and the title and the buttons stay in view.","Open a dialog with `DialogTrigger`, or control it with `open` and `onOpenChange`. `onOpenChange` receives the reason for closing, such as `escape-key` or `outside-press`. Call `cancel()` to keep the dialog open, for example when the person has unsaved text.","Focus moves into the panel when it opens and returns to the trigger when it closes. Tab stays inside the panel. Escape and a press outside the panel close it. `DialogTitle` names the panel for a screen reader and `DialogDescription` describes it, so always include a title."],
    declaration: `<Dialog>
  <DialogTrigger render={<Button>Rename project</Button>} />
  <DialogContent>
    <DialogTitle>Rename project</DialogTitle>
    <DialogDescription>\n      Everyone with access sees the new name.\n    </DialogDescription>
    <DialogClose render={<Button emphasis="loud">Save</Button>} />
  </DialogContent>
</Dialog>`,
    variants: [
      {"name":"in-a-form","title":"In a form","why":"Shows fields and actions inside a form element, with `open` controlled by state. Enter submits the form, and the dialog closes only after the save."},
      {"name":"controlled","title":"Controlled","why":"Shows a dialog with no DialogTrigger, opened by state after a task finishes. Use this when something other than a button opens the dialog."},
      {"name":"scrolling-content","title":"Scrolling content","why":"Shows `maxHeight` on DialogContent with a ScrollArea inside. The list scrolls, and the title and the action stay in view."},
      {"name":"unsaved-changes","title":"Protect unsaved text","why":"Shows `onOpenChange` calling `cancel()` for Escape and outside presses while the text area holds a draft. The buttons still close the dialog."},
      {"name":"from-a-menu","title":"Open from a menu row","why":"Shows a Menu row that opens a dialog. The dialog sits outside the menu and uses state, because the menu closes when the row is chosen."},
    ],
    topics: [
      { title: "Opening it", symbols: ["Dialog", "DialogTrigger"] },
      { title: "Presenting the panel", symbols: ["DialogContent"] },
      { title: "Naming it", symbols: ["DialogTitle", "DialogDescription"] },
      { title: "Closing it", symbols: ["DialogClose"] },
    ],
    refusals: [
      {
        name: "Header and Footer",
        why: "Write the header and action row as a Stack. Title and Description exist only for accessible naming.",
      },
      {
        name: "A presentation prop, and a drag",
        why: "Window width decides centred or bottom sheet, keeping the same element. Dragging would need JavaScript on every pointer move.",
      },
      {
        name: "A height prop",
        why: "Set a height or max-height on DialogContent, and a ScrollArea inside it scrolls. Otherwise the panel grows.",
      },
      {
        name: "A close button in the corner",
        why: "Escape and an outside press dismiss. Place a DialogClose Button wherever the layout needs one.",
      },
      {
        name: "`modal` and `disablePointerDismissal`",
        why: "A dialog always traps focus and locks scroll. Use a Popover for a live page, an AlertDialog to block outside presses.",
      },
      {
        name: "A shadow",
        why: "The dark scrim already shows the dialog is on top. In an elevated app it lifts like a Card.",
      },
      {
        name: "A size on the title",
        why: "The dialog's size sets the title and description. Everything else you write inside keeps its own size.",
      },
    ],
    parts: [
      { part: "DialogTrigger", blurb: "The button that opens it, usually render={`<Button/>`}. A dialog driven by app state needs no trigger at all" },
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
    overview: ["A Field gives one form control a label, a description and an error message. It connects all three to the control, so a screen reader reads them together. Use a Field around every `TextField`, `TextArea`, `Select`, `Combobox`, `NumberField`, `Checkbox` group and `Radio` group in a form. The behaviour is Base UI's Field.","The parts always come in the same order: label, control, description, error. The label sits on the control it names, and everything about that control is below it. The description says what to enter, and it stays when an error shows. The error says what went wrong.","Every Kookie control connects to the Field around it without extra props. `FieldLabel` is a real `<label>`, so clicking it puts focus in the control. `FieldDescription` is added to the control's `aria-describedby`. `FieldError` shows only while the field is invalid, and a screen reader announces it when it appears.","Show an error in one of three ways. Use `match` with a validity state such as `valueMissing` for browser checks like `required`. Pass a `validate` function to the Field for your own rules. Set `invalid` on the Field when your server rejects a value, and use `match={true}` on the error.","`size` on the Field sets the label, the description, the error and the control together. A control with its own `size` keeps it. `disabled` on the Field turns off the control inside it.","For a group of checkboxes or radios, use one `FieldItem` for each option. The item gives that option its own label and its own description, and clicking the label changes the option. Put 12 pixels or more between options, which is `gap=\"5\"` on a `Stack`."],
    declaration: `<Field>
  <FieldLabel>Email</FieldLabel>
  <TextField type="email" />
  <FieldDescription>We use this for receipts.</FieldDescription>
  <FieldError match={true}>That address is short.</FieldError>
</Field>`,
    variants: [
      {"name":"required","title":"Required field","why":"Shows `required` on the control and a FieldError with `match=\"valueMissing\"`. The message shows when a person submits the form without a value."},
      {"name":"validation","title":"Custom validation","why":"Shows a `validate` function on the Field that runs when the control loses focus. The function returns a message or `null`, and an empty FieldError shows the message."},
      {"name":"server-error","title":"Error from your server","why":"Shows `invalid` on the Field with an error message. The description stays next to the error, because it still says what to enter."},
      {"name":"disabled","title":"Disabled","why":"Shows `disabled` on a Field beside an enabled one. The setting reaches the control inside, so you set it once."},
      {"name":"checkboxes","title":"A group of checkboxes","why":"Shows a FieldItem for each checkbox, with its own label and description. The Field label names the group, and one option is disabled."},
      {"name":"with-select","title":"With a Select","why":"Shows a Select inside a Field. The label names the Select trigger and the description is read with it, with no extra props."},
      {"name":"with-text-area","title":"With a text area","why":"Shows a TextArea inside a Field. A text area works the same way as a text field, and it fills the width of the Field."},
    ],
    topics: [
      { title: "Naming one input", symbols: ["Field", "FieldLabel"] },
      { title: "Saying more about it", symbols: ["FieldDescription", "FieldError"] },
      { title: "Naming one option in a group", symbols: ["FieldItem"] },
    ],
    refusals: [
      {
        name: "`FieldControl`",
        why: "Every Kookie control already reads Field's context, so a control inside a Field wires itself.",
      },
      {
        name: "`orientation`",
        why: "A horizontal field needs its own designed grid, not a direction flip. It ships when something needs it.",
      },
      {
        name: "A choice about where the error goes",
        why: "The order is always label, control, description, error, so forms group without borders or rules.",
      },
      {
        name: "An error that replaces the description",
        why: "Both show. The description says what to enter; the error says what went wrong.",
      },
      {
        name: "`Form`",
        why: "Deferred. It ships when a real form needs server errors mapped to fields.",
      },
    ],
    parts: [
      { part: "FieldItem", blurb: "One option inside a checkbox group or a radio group: a mark, its own name, and its own line of explanation" },
      { part: "FieldLabel", blurb: "The field's name: a real `<label>` associated by id, so clicking it lands the caret. Medium weight and the plain foreground role" },
      { part: "FieldDescription", blurb: "What to enter. The muted ink role, wired into aria-describedby wherever it sits, so a screen reader announces it with the control from any position" },
      { part: "FieldError", blurb: "What went wrong, after it went wrong. The destructive ink, rendered only while the field is invalid, and carrying the live region that announces it" },
    ],
  },
  {
    slug: "flex",
    name: "Flex",
    family: "Layout",
    spec: "§3",
    declaration: `<Flex gap="3" align="center" justify="space-between">
  \u2026
</Flex>`,
    variants: [
      {"name":"space-between","title":"Title and actions","why":"Shows `justify=\"space-between\"` with a title on one side and a group of buttons on the other. A nested Flex groups the buttons with their own gap."},
      {"name":"wrap","title":"Wrapping to new lines","why":"Shows `wrap=\"wrap\"` with a set of chips. Items move to a new line when the row runs out of room, and `gap` spaces both the items and the lines."},
      {"name":"grow","title":"A child that fills the space","why":"Shows a search field in a Box with `flexGrow=\"1\"` beside two buttons. The field takes the free space, and the buttons keep their own width."},
      {"name":"responsive","title":"Column to row","why":"Shows `direction`, `align` and `gap` with a value for each breakpoint. The content stacks in a narrow container and becomes a row from the `md` breakpoint."},
      {"name":"baseline","title":"Baseline alignment","why":"Shows `align=\"baseline\"` with text at three sizes. The first lines of text line up, which `center` does not do when the sizes differ."},
      {"name":"inline","title":"Inside a line of text","why":"Shows `display=\"inline-flex\"` inside a sentence. An icon and its words stay together and flow with the text around them."},
    ],
        abstract: "Flex is Box with `display: flex` and the flex props kept.",
    overview: ["Flex lays out its children in a row or a column. It is a `Box` with `display: flex`, and it has the props of a flex container: `direction`, `align`, `justify`, `wrap` and `gap`. Use it for a toolbar, a row of buttons, or a title with actions. For a plain column with even spacing, use `Stack`. For rows and columns together, use `Grid`.","Set the space between children with `gap` on the Flex. A child never sets its own margin. The `gap` values are steps on the spacing scale, and the theme's density changes what each step is worth.","Flex has no grid props, so `columns` on a Flex does not compile. It adds no styles of its own beyond what `Box` does. Use `display=\"inline-flex\"` to place a Flex inside a line of text.","Every prop takes one value, or a value for each breakpoint, such as `direction={{ initial: \"column\", md: \"row\" }}`. The breakpoints measure the nearest `Box` with `container`, or the whole app when there is none.","To let one child take the free space, wrap it in a `Box` with `flexGrow=\"1\"`. Flex draws nothing and has no role, so a screen reader reads its children in the order you write them. Keep that order the same as the visual order."],
    refusals: [{ name: "`margin` on children", why: "Set the space once with the container's `gap`, so sibling spacing cannot drift." }],
  },
  {
    slug: "grid",
    name: "Grid",
    family: "Layout",
    spec: "§3",
    declaration: `<Grid columns="3" gap="4">
  \u2026
</Grid>`,
    variants: [
      {"name":"responsive","title":"Responsive columns","why":"Give `columns` a value for each tier. The grid shows one column on a narrow container, two from `sm` and three from `md`."},
      {"name":"areas","title":"Named areas","why":"Name the regions once with `areas`, then place each child with `gridArea`. Use this for a page frame with a header, a navigation column and a main area."},
      {"name":"spanning","title":"Spanning columns","why":"Set `gridArea` to `auto / span 2` to make a child two columns wide. A bare `span 2` sets the row span, not the column span."},
      {"name":"gap-axes","title":"Row and column gaps","why":"`gapX` and `gapY` set the column gap and the row gap separately. Here the wider column gap keeps each term and value together as one line."},
      {"name":"in-a-form","title":"In a form","why":"Put short fields that belong together in two columns, and let a long field span both. On a narrow container the form drops to one column."},
      {"name":"container","title":"In a container","why":"Responsive values follow the nearest Box marked `container`, not the window. This narrow panel keeps one column even when the window is wide."},
    ],
        abstract: "Grid is Box with `display: grid` and the grid props kept.",
    overview: ["Grid is Box with `display: grid`. It keeps the grid props `columns`, `rows`, `areas` and `flow`, and the gap props `gap`, `gapX` and `gapY`. It adds no CSS of its own, so it works the same way Flex does.","Use a Grid when children must line up in two directions, such as a set of cards or a form with two columns. Use Flex for one row, and Stack for one column with a gap between items.","`columns`, `rows` and `areas` take CSS template values as strings, such as `repeat(3, minmax(0, 1fr))`. The gap props take a step on the space scale, and the theme density sets what each step is worth. There are no `direction` or `wrap` props, because a grid ignores them, and TypeScript reports an error if you set them.","Every prop accepts one value for each tier: `{ initial, sm, md, lg }`. A tier follows the width of the nearest Box with `container`, or the root Theme when there is no such Box. This lets a grid change its columns inside a narrow panel and a wide page in the same way.","A Grid has no keyboard or screen-reader behaviour of its own. The source order is the reading order and the tab order, so keep it the same as the visual order when you place children with `areas` or `gridArea`."],
    refusals: [{ name: "Auto-placement helpers", why: "A prop must add tokens, tiers or a constraint. Other placement is plain style." }],
  },
  {
    slug: "heading",
    name: "Heading",
    family: "Type",
    spec: "§15",
    declaration: `<Heading size="7" render={<h2 />}>A section</Heading>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The steps a composed screen uses: 8 for a page, 7 for a section and 6 for a card title. A smaller step suits a heading inside a card."},
      {"name":"levels","title":"Outline levels","why":"`render` sets the level and `size` sets the look, so an `h1` can sit at step 7 and an `h2` at step 4. Change the size when you need a smaller look, and keep the levels in order."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` picks the ink colour. Use `medium` for a label above a group, so it does not compete with the headings that name content."},
      {"name":"tones","title":"Tones","why":"`tone` gives the words a meaning, such as a warning or a destructive action. The theme picks the colour in light mode and in dark mode."},
      {"name":"in-a-card","title":"In a card","why":"A card title at step 6 with a short description under it and the action at the end of the row. This is the most common place a Heading appears."},
    ],
        abstract: "Heading uses the heading font on the same nine-step scale Text uses.",
    overview: ["Heading shows a title in the heading font. It uses the same nine-step type scale as Text, so `size=\"4\"` on a Heading is the same size as `size=\"4\"` on Text.","How large a heading looks and where it sits in the document outline are separate choices. `size` picks the step, and `render` picks the element, such as `render={<h1 />}`. Without `render`, a Heading renders an `<h2>`, and its size is 6, the step for a card title.","On a composed screen, use step 8 for a page title, 7 for a section and 6 for a card title. Use Text for body copy and labels. Use Page when a page title must move into the toolbar as the page scrolls.","The weight is semibold by default, which is the heaviest weight in the system. There is no bold. `emphasis` picks one of the three ink colours, and `tone` gives the words a meaning, such as `destructive`. Leave `tone` unset for most headings, so the words use the text colour of the surface below them.","A screen reader announces the element you render, with its level. Many people move through a page by its headings, so keep the levels in order. If a heading must look smaller, change `size` and keep the level."],
    refusals: [
      {
        name: "A level prop",
        why: "Heading level is a document fact, not a look. Use `render={<h1/>}` to set it separately.",
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    family: "Type",
    spec: "§11, §15",
    declaration: `<Kbd>\u2318K</Kbd>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Without `size`, a key matches the text it sits in. The same key appears here in three sizes of text, with no `size` set on it."},
      {"name":"combinations","title":"Key combinations","why":"Give each key its own Kbd when a shortcut needs keys pressed together. Put joining words, such as \"then\", in the text."},
      {"name":"in-a-menu","title":"In a menu","why":"Put the shortcut in a menu row's `trailing` slot. The key takes the row's size and sits at the end of the row."},
      {"name":"shortcut-list","title":"A list of shortcuts","why":"A reference list puts the action first and the key at the end of each row. Use it in a help panel or a settings page."},
    ],
        abstract: "Kbd shows a key or a shortcut, such as ⌘K.",
    overview: ["Kbd shows a key or a shortcut, such as ⌘K. It renders a `<kbd>` element, so a screen reader can identify the text as keyboard input.","It uses the same fill and tone behaviour as Code, but it sets the letters in the body font, because a key names a key and does not quote code. Its box is exactly one line tall, so it never pushes apart the line it sits in.","Without `size`, a key takes the size of the text around it. Set `size` only when the key stands alone. `tone` moves the letters and the fill to a colour family, and the edge stays grey. A key cap always shows slight relief, in a flat theme too.","Use Code for a piece of code, such as a command or a file name. Use Chip for a short label or a status. In a Menu, put a Kbd in the row's `trailing` slot to show the shortcut for that row."],
    refusals: [
      {
        name: "A shadow that follows Theme depth",
        why: "A key cap always shows slight relief, even in a flat theme. It does not follow the depth setting.",
      },
    ],
  },
  {
    slug: "link",
    name: "Link",
    family: "Type",
    spec: "§11, §15",
    declaration: `<Link href="/plans">the plans on this workspace</Link>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Inside a sentence, leave `size` unset and the link matches the text around it. Set `size` only when the link stands on its own line."},
      {"name":"tones","title":"Tones","why":"A link uses `accent` by default. Set `tone=\"destructive\"` for a link to a destructive action, or `neutral` for a link that must not draw the eye."},
      {"name":"external","title":"External links","why":"For a page on another site, pass an anchor with `target` and `rel` through `render`. Put an icon after the words to show that the link leaves the app."},
      {"name":"standalone","title":"Standalone links","why":"A column of links that are not inside a sentence, such as a footer or a help panel. Give each link a size, and put a short label above the group."},
    ],
        abstract: "Link is the one type component that responds to a pointer.",
    overview: ["Link is the one type component that responds to a pointer. It renders an `<a>` with an underline, a hover state and a focus ring. The size, the weight and the font come from the shared type layer, so a link reads the same way Text does.","Use a Link to go to another page or another place. Use a Button to do an action, such as saving or deleting. A Link is not a control: its text stays selectable, it wraps across lines, and it sits on the same line as the paragraph around it.","Without `size` and `weight`, a link matches the sentence it sits in. It uses the `accent` tone by default, so that people can find it in a paragraph. Set `tone` when the destination has a meaning, such as `destructive`. The underline is always there, because colour alone does not identify a link (WCAG 1.4.1). On hover, the colour of the underline changes.","Use `render` to pass your router's link component, or an anchor with `target` and `rel`. Link adds the type, the underline and the states, and the element keeps its own attributes.","Tab moves focus to a link, and Enter follows it. A screen reader announces it as a link and uses its text as its name. Write link text that makes sense on its own, such as \"the plans on this workspace\" and not \"click here\"."],
    refusals: [
      {
        name: "`emphasis`",
        why: "A link's job is to be found, and lower emphasis fades it. Use a smaller link instead.",
      },
      {
        name: "A :visited style",
        why: "Browsers hide :visited styles from tests to protect history, so the package ships no rule it cannot check.",
      },
      {
        name: "A hover-only underline",
        why: "Colour alone fails WCAG 1.4.1 and touch has no hover. The underline stays; only its colour changes.",
      },
      {
        name: "A target of its own",
        why: "WCAG exempts links inside a sentence, and a paragraph cannot grow a larger hit area.",
      },
    ],
  },
  {
    slug: "list",
    name: "List",
    family: "Type",
    spec: "§11, §15, §52",
    abstract: "List sets a bulleted or a numbered list of prose.",
    overview: ["List shows a bulleted or a numbered list of prose. It uses the shared type layer, so it takes the same sizes, weights and ink colours as Text. It adds the space for the marker, the distance between items and the colour of the marker.","A bullet always uses the faint ink colour, so it stays in the background. A number uses the same colour as the words, because people read numbers and refer to them.","`ordered` picks the element: `<ul>` for a set, `<ol>` for steps or a ranking. A screen reader announces a list and the number of items in it. On an ordered list, `start` and `reversed` pass to the `<ol>` and change what the numbers say. A bulleted list does not accept them.","A List placed inside a ListItem indents one level and takes the size of the item, so a nested list needs no props. The indent follows the text size, and the theme density does not change it.","Use List for items of prose. Use Stack for a list without markers, Row for a list of items with icons, and Table for items that each have several values."],
    declaration: `<List>
  <ListItem>Invite your team</ListItem>
  <ListItem>
    Deploy the first build
    <List>
      <ListItem>Preview builds run on every push</ListItem>
    </List>
  </ListItem>
</List>`,
    variants: [
      {"name":"ordered","title":"Numbered lists","why":"Set `ordered` when the order is information, such as steps to follow. A screen reader then announces a numbered list."},
      {"name":"resumed","title":"Continued numbering","why":"Use `start` to continue the numbers after a paragraph. Step 3 stays step 3 when a person refers to it."},
      {"name":"sizes","title":"Sizes","why":"`size` picks a step on the same scale Text uses. The space for the marker and the space between items grow with the step."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis=\"medium\"` shows a list of details under a main statement in a quieter colour. Numbers follow the colour of the words, and bullets stay faint."},
      {"name":"tones","title":"Tones","why":"`tone` moves the words and the markers to a colour family. Use it when the whole list carries one meaning, such as what a delete removes."},
      {"name":"in-a-card","title":"In a card","why":"A list of plan features between a card's title and its action. The card sets the padding, and a Stack sets the space between the parts."},
    ],
    topics: [
      { title: "Setting the list", symbols: ["List"] },
      { title: "One item", symbols: ["ListItem"] },
    ],
    refusals: [
      {
        name: "A marker of your own",
        why: "The element sets the marker: discs for sets, numbers for sequences. Use a Stack for no marker, Row for icons.",
      },
      {
        name: "`render`",
        why: "`ordered` picks the element. A list that is neither `<ul>` nor `<ol>` announces nothing.",
      },
      {
        name: "A gap or a density prop",
        why: "The system sets item spacing, so two lists on one page never space differently.",
      },
      {
        name: "A description list",
        why: "A `<dl>` is a different structure of terms and details. It will ship as its own component.",
      },
    ],
    parts: [
      { part: "ListItem", blurb: "One item: the `<li>`. It takes the list's step, weight and ink, and a List placed inside it indents one level with no prop of its own" },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    family: "Surface",
    spec: "§20, §21, §22",
        abstract: "Menu shows a floating list of actions.",
    overview: ["Menu shows a floating list of actions when you press its trigger. Each row is one action, such as Rename or Delete, and choosing a row closes the menu.","Use a Menu for actions. Use Select to choose one value in a form, ContextMenu for actions that open at the pointer on a right-click, and Popover for a floating panel that holds other content, such as a short form.","A row can show an icon in `leading` and a shortcut `<Kbd>` in `trailing`. Checkbox rows and radio rows show state, and a submenu holds a related set of choices. Put a `<Separator>` between groups. A row without an icon lines up with rows that have one, because the leading column is always kept.","`size` on the Menu sets the rows, the icons and the text inside the panel. The panel's corner is calculated from the rows inside it, so the outer curve and the row curves nest. In a raised theme the panel casts a floating shadow. In a flat theme it casts no shadow and shows a hairline edge. When the theme material is glass, the panel uses glass.","Enter or Space on the trigger opens the menu. The arrow keys move between rows, typing moves to the row that starts with those letters, and Escape closes the menu and returns focus to the trigger. The arrow key toward the reading direction opens a submenu. A screen reader announces the menu, each row and the checked state of checkbox and radio rows.","The part names follow shadcn/ui's dropdown-menu (MIT), with credit, and the behaviour is Base UI's Menu."],
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
    variants: [
      {"name":"disabled","title":"Disabled","why":"A disabled row stays in the list and stays announced — a thing you cannot do now is not the same as a thing that is not there."},
      {"name":"rtl","title":"Right to left","why":"The panel anchors from the other edge and a submenu opens to the left. A menu reads direction off its trigger, the one element it places in the page."},
      {"name":"sizes","title":"Sizes","why":"Set `size` on the Menu, and give the trigger button the same size. The rows, the icons and the text in the panel all follow it."},
      {"name":"with-icons","title":"With icons","why":"Put an icon in `leading` and a `<Kbd>` in `trailing`. A row without an icon still lines up with the rows that have one."},
      {"name":"checkbox-items","title":"Checkbox rows","why":"A checkbox row turns one setting on or off, and the menu stays a list of peers. Pass `checked` and `onCheckedChange` to keep the value in your own state."},
      {"name":"radio-items","title":"Radio rows","why":"Radio rows choose one value from a set, such as a sort order. Show the current value on the trigger, so a person can see it without opening the menu."},
      {"name":"submenu","title":"Submenus","why":"Use a submenu for a related set of choices that would make the main list long. It opens on hover, on a press, or with the arrow key."},
      {"name":"links","title":"Rows that are links","why":"When a row goes to a page, render it as a link with `render`. The row stays one target, and you can pass your router's link component in the same way."},
      {"name":"placement","title":"Placement","why":"`side` sets the edge of the trigger the panel opens from, and `align` sets where it lines up on that edge. If there is no room, the panel moves to stay on screen."},
    ],
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
        why: "A menu is a list of peers, so ranking rows means nothing. Rows are always quiet.",
      },
      {
        name: "A Shortcut part",
        why: "Put a `<Kbd>` in the row's trailing slot. A Shortcut part would only rename that.",
      },
      {
        name: "`MenuSeparator`",
        why: "Use `<Separator>`. Inside a menu panel, the menu's stylesheet spaces it.",
      },
      {
        name: "An inset prop",
        why: "Rows without icons align with rows that have them automatically. The indicator gutter is always reserved.",
      },
      {
        name: "`modal` and `openOnHover`",
        why: "A menu is modal and opens on press. A submenu row opens on hover already, so the prop is not exposed.",
      },
      {
        name: "Arrow, Backdrop, Viewport, LinkItem and collision knobs",
        why: "Menus need no arrow or scrim. Long menus scroll in a built-in ScrollArea. Collision handling is a fixed default.",
      },
    ],
    parts: [
      { part: "MenuTrigger", blurb: "The button that opens the menu, usually render={`<Button/>`}, so the trigger is a real Kookie Button" },
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
    overview: ["Select is a form control that lets someone pick one option from a list. The trigger shows the current choice, and a press opens a panel of options. Use it when there are more options than fit on the screen at once.","Use `SegmentedControl` or a `RadioGroup` when there are only a few options, because people can then see them all without opening anything. Use `Combobox` when people need to type to filter a long list. Use `Menu` when the options are actions rather than a value.","The trigger is a button shaped like a field. It has the same fill, border and height as a `TextField`, so a Select beside a TextField reads as the same kind of input. The panel and its rows come from `Menu`, and the panel is never narrower than the trigger.","Pass `items`, a map from each value to its label. The closed trigger uses this map to show the chosen option's label. Without it, the trigger shows the raw value.","Select renders a hidden input, so `name` and `required` work with a form the same way a native select does. Inside a `Field`, the `FieldLabel` names the trigger. A screen reader announces the trigger as a combobox and the panel as a listbox. The arrow keys move through the options, and typing a letter jumps to a matching option.","The part names follow shadcn/ui's select (MIT), with credit."],
    declaration: `<Select defaultValue="banana" items={labels}>
  <SelectTrigger placeholder="Pick one" />
  <SelectContent>
    <SelectGroup>
      <SelectLabel>Fruit</SelectLabel>
      <SelectItem value="banana">Banana</SelectItem>
    </SelectGroup>
  </SelectContent>
</Select>`,
    variants: [
      {"name":"disabled","title":"Disabled","why":"It stays in the list, so the set a reader sees is the whole set. `disabled` on the Select itself closes the control instead."},
      {"name":"rtl","title":"Right to left","why":"The caret moves to the other end and the panel anchors from the other edge. Nothing in the markup says which way."},
      {"name":"in-a-form","title":"In a form","why":"Inside a Field, the FieldLabel names the trigger. The hidden input makes `name` and `required` work with the form, the same way a native select does."},
      {"name":"controlled","title":"Controlled","why":"Hold the value in your own state with `value` and `onValueChange`. The callback can receive `null` when the chosen option leaves the list, so handle that case."},
      {"name":"placeholder","title":"No choice yet","why":"With no `defaultValue`, the trigger shows the `placeholder` in a muted colour until someone picks an option. Use it when no option is a safe default."},
      {"name":"disabled-control","title":"The whole control disabled","why":"Set `disabled` on the Select to turn off the whole control. The panel cannot open and the value is not sent, so explain why with a FieldDescription."},
      {"name":"long-list","title":"A long list in groups","why":"A long list scrolls inside the panel, and SelectGroup with SelectLabel divides it into sections. On open, the panel places the chosen option over the trigger."},
      {"name":"beside-a-text-field","title":"Beside a text field","why":"A SelectTrigger has the same fill, border and height as a TextField. Put the two in one row for an amount and its unit."},
    ],
    topics: [
      { title: "Holding the choice", symbols: ["Select", "SelectTrigger"] },
      { title: "Presenting the panel", symbols: ["SelectContent"] },
      { title: "Listing the options", symbols: ["SelectItem"] },
      { title: "Grouping into sections", symbols: ["SelectGroup", "SelectLabel"] },
    ],
    refusals: [
      {
        name: "`readOnly`",
        why: "HTML does not apply readonly to a select. Use a disabled trigger with a hidden input, or show Text.",
      },
      {
        name: "A Separator inside the panel",
        why: "A listbox may only contain options and groups. Use a group to divide options.",
      },
      {
        name: "`emphasis` and `tone` on the trigger",
        why: "Form fields do not rank. Loudness is for ordering actions.",
      },
      {
        name: "SelectValue as a part",
        why: "The trigger renders the value itself and takes a `placeholder`, so no separate part is needed.",
      },
      {
        name: "`render` and `children` on the trigger",
        why: "The value is the trigger's content, and the trigger must stay a real button announced as a combobox.",
      },
      {
        name: "The scroll arrows",
        why: "The panel already scrolls by wheel, trackpad and keyboard. Arrows would be a mouse-only extra control.",
      },
      {
        name: "`multiple`",
        why: "A multi-select shows its value, indicator and form data differently. It is a different control.",
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
    variants: [
      {"name":"flat","title":"A list without groups","why":"Shows a short palette with a flat array and no groups. Start here when your app has only a few commands, then add groups when the list grows."},
      {"name":"keyboard-shortcut","title":"Open with a keyboard shortcut","why":"Shows the palette opening from Command+K or Control+K with no CommandTrigger. Your app listens for the keys and sets `open`, so you choose the shortcut."},
      {"name":"places","title":"Rows that are links","why":"Shows rows rendered as links with `render`. A row that goes to a page is a real anchor, so it opens in a new tab and a screen reader announces it as a link."},
      {"name":"app-filtering","title":"Your own search and ranking","why":"Shows `filter={null}` with `onQueryChange`. The app reads the typed text, narrows and sorts its own array, and passes the result to `items`. Use this for a ranked search, such as help articles."},
      {"name":"stays-open","title":"Keep the palette open","why":"Shows `cancel()` on the `item-press` reason, so the palette stays open after a row runs. Use it when rows toggle settings and a person may change several in one visit."},
    ],
    overview: ["Command is one search field over the actions and places in your app. A person types a few letters, the list narrows, and Enter runs the highlighted row. Use it for a command palette that opens from a keyboard shortcut. To pick one value for a form, use `Combobox`. For a short list of actions on one object, use `Menu`.","Command is a `Dialog`. The dimmed background, the focus trap, the scroll lock, the theme inside the portal and the opening motion all come with it. An open palette covers the page. For a panel that leaves the page usable, use a `Popover`.","The search bar and the results are two separate panels. The bar stays in the same place while the list under it grows and shrinks as you type. The palette sits near the top of the window at every width, including on a phone. The rows keep the order you wrote, so people can learn where a command is.","One `size` sets the whole palette: the panels, the search field, the rows and the group labels. The text you type is one step larger than the rows, and the rows are one step larger than the controls in the app behind them, so the palette never looks like a form.","Pass every command to `items`, and keep the array stable in module scope or a `useMemo`. `CommandList` and `CommandCollection` take a function and call it for each item that matches. To rank or limit results yourself, set `filter` to `null`, read the text with `onQueryChange`, and pass your own narrowed array.","You open the palette. Your app decides which keys open it, so `Command` takes `open` and `onOpenChange`, and it renders no button when you leave out `CommandTrigger`. Running a row closes the palette, and `onOpenChange` reports the reason `item-press`. Call `cancel()` on that reason to keep it open.","The search field keeps focus while the palette is open. One row is highlighted from the first frame, the arrow keys move the highlight, and Enter runs it. Tab does not move into the list. A row with `render={<a/>}` is a real link, so a screen reader announces it as one and a middle-click opens it in a new tab."],
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
        name: "A footer",
        why: "A footer could only hold a key legend. Shortcuts already sit on each row in `trailing`.",
      },
      {
        name: "`modal`",
        why: "An open palette takes over the page. For a panel that leaves the page live, use a Popover.",
      },
      {
        name: "Fuzzy reordering as you type",
        why: "Rows keep the order you wrote. Re-sorting on every keystroke stops people learning where things are.",
      },
      {
        name: "A Separator inside the panel",
        why: "A listbox may hold only options and groups, so a separator fails accessibility checks. Use a group.",
      },
      {
        name: "An edge-to-edge panel",
        why: "The panel pads like every dialog, so a highlighted row ends cleanly inside the corner.",
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
      { part: "CommandEmpty", blurb: "What the panel shows when nothing matches. Write it beside CommandList; it renders inside the results panel, so both states are one box." },
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
    overview: ["A Composer is the box a person types a message into. It holds a text area that grows as you type, a row of controls under it, and one button that sends. Use it for an AI chat, a support inbox, a team thread or a comment field, because all four have the same shape. For one line of text in a form, use `TextField`. For a longer text field in a form, use `TextArea`.","The Composer is a real `<form>`. Enter sends and Shift+Enter adds a new line, like every chat app. Enter does not send while a person confirms Japanese, Chinese or Korean input, and it does not send again while a request is running. `onSubmit` fires when a person sends.","It is a surface, not a control, because it holds full-size buttons at their own size. So it has the padding, corner and shadow of a `Card`. One `size` sets the padding, the corner, the text and every control you put in the row. A control with its own `size` keeps it.","`ComposerSend` is one button with four meanings, set with `status`. `ready` sends, `submitted` shows a spinner, `streaming` becomes Stop and calls `onStop`, and `error` becomes Retry. The button is the loud action by default. Pass your own icons with `icons`, and your own accessible names with `labels` for a language other than English.","The Composer does not show the conversation, and it does not hold files. Add an attach button yourself. Files that people drop or paste reach `onFiles`, and your app keeps them. Use `notices` for a `Notice` or a `Confirmation` above the box, and `context` for quiet facts below it, such as the model or how much context is left.","Set `backdrop` when content scrolls behind the composer, so the theme's material can show. `ComposerInput` needs an `aria-label` or `aria-labelledby`, because a placeholder is not a name. The focus ring shows on the whole box when the text has focus, and not when a button inside it has focus."],
    declaration: `<Composer onSubmit={send}>
  <ComposerInput placeholder="Ask anything" />
  <ComposerRow>
    <Button iconOnly aria-label="Add attachment">{icon}</Button>
    <ComposerSend status={status} aria-label="Send" />
  </ComposerRow>
</Composer>`,
    variants: [
      {"name":"with-notices","title":"Notices above the box","why":"Shows the `notices` slot with a dismissable warning. Notices sit outside the form in a column above the box, so pressing their buttons never sends the message."},
      {"name":"confirmation","title":"A question before sending","why":"Shows a Confirmation in the `notices` slot, with `busy` while the work starts. Focus does not move to it, because the person may be in the middle of a sentence."},
      {"name":"with-context","title":"Context below the box","why":"Shows the `context` slot with quiet facts about the conversation, such as context left and cost per reply. The words are yours, and the Composer places them below the box."},
      {"name":"request-states","title":"Request states","why":"Shows `status` moving from `submitted` to `streaming` to `error` after a send. Press the button while it streams to stop the request, and press Reset to start again."},
      {"name":"disabled","title":"Disabled","why":"Shows a disabled input and disabled controls. The text dims to the same colour a disabled TextArea uses, and the box itself stays the same."},
      {"name":"with-select","title":"Controls in the row","why":"Shows a Select and an attach button in the row at size 3. The composer's size reaches every control in the row, so the text and the controls change size together."},
    ],
    topics: [
      { title: "The box a message is typed into", symbols: ["Composer", "ComposerInput"] },
      { title: "The controls under it", symbols: ["ComposerRow", "ComposerSend"] },
    ],
    refusals: [
      {
        name: "The conversation, and every part of it",
        why: "Messages, tool calls and reasoning need a data model the system does not have. Compose from ScrollArea, Card and Text.",
      },
      {
        name: "The scroller",
        why: "Keeping a chat scroll pinned while replies stream is a large package's job. Use MessageScroller or a runtime.",
      },
      {
        name: "An attach button",
        why: "Your app owns the files, so add a Button with your icon. Dropped and pasted files reach `onFiles`.",
      },
      {
        name: "Owning the files",
        why: "The composer never holds files, previews or uploads. Set each attachment tile's state as a prop.",
      },
      {
        name: "A row of slots",
        why: "ComposerRow sets alignment and spacing only. Which controls go left or right is your choice.",
      },
      {
        name: "A compact or collapsed mode",
        why: "Deferred. There is nothing to fold away yet. When it ships, it will follow content, not focus.",
      },
      {
        name: "`submitOnEnter`",
        why: "Enter sends and Shift+Enter adds a line, like every chat app. Confirming Japanese, Chinese or Korean input never sends.",
      },
    ],
  },
  {
    slug: "notice",
    name: "Notice",
    family: "Surface",
    spec: "§29",
        abstract: "Notice states a condition that is true right now, on the region it is about.",
    overview: ["Use a Notice to tell people about a condition that is true right now, such as an expiring certificate or a failed sync. Put it in the layout, above the region it is about. It takes up space and never floats, so it does not cover the content it describes.","The person did not cause the condition, so a Notice is not a receipt for an action. It stays for as long as the condition is true, and it does not close on a timer. Give it at most one `action` that fixes the condition. Add `onDismiss` to show a ✕ that only acknowledges it.","The dismissal has no internal state. When someone presses the ✕, your `onDismiss` callback runs, and your app removes the Notice. Store the dismissal where it must survive, for example in user settings, so it stays dismissed after a reload.","Use `Confirmation` when you need to ask a question instead. It uses the same strip, with two worded answers: a quiet no and a loud yes. It has no ✕, because closing a question does not answer it. Set `busy` while the work starts, and the yes shows a spinner.","A Notice rests on `neutral`. Set `tone` for the kind of condition, such as `warning` or `destructive`, and the fill, the words and the buttons inside all change with it. A Button in the `action` slot takes the Notice's tone unless you set its own. Use a Card when the message needs a heading and several paragraphs, and use a Dialog when the person must answer before they continue.","A Notice has `role=\"status\"`, so screen readers announce its words when it appears, without moving focus. The icon slot is hidden from screen readers. Set `dismissLabel` to give the ✕ a name in your app's language."],
    refusals: [
      {
        name: "A position, and the name Banner",
        why: "The parent places it. Put it in flow above the region, or let the Shell pin it.",
      },
      {
        name: "Toast, and any transient version of this",
        why: "If an action deserves attention, it gets it before it runs. Put confirmations on the button that acted.",
      },
      {
        name: "A title, a description and any fixed anatomy",
        why: "Nothing requires them. A notice that needs a heading and paragraphs is a Card.",
      },
      {
        name: "More than one action",
        why: "One slot holds the action that resolves the condition. Two competing actions make it a form.",
      },
      {
        name: "Remembering its own dismissal",
        why: "`onDismiss` is a callback with no internal state. Your app keeps the dismissal so it survives a reload.",
      },
      {
        name: "A shadow",
        why: "A notice is a marker on a surface, not a surface of its own, so it never casts a shadow.",
      },
      {
        name: "An icon set",
        why: "The package ships no icons. The slot takes whatever your app draws and is hidden from screen readers.",
      },
      {
        name: "A ✕ on a Confirmation",
        why: "A question needs an answer. Give the no a worded button, like the yes.",
      },
    ],
    declaration: `<Notice tone="warning" action={<Button>Renew</Button>}>
  Your certificate expires in six days.
</Notice>

<Confirmation
  confirmLabel="Run"
  cancelLabel="Not now"
  onConfirm={run}
  onCancel={dismiss}
>
  Run 4 nodes for $0.32?
</Confirmation>`,
    variants: [
      {"name":"tones","title":"Tones","why":"Set `tone` for the kind of condition. The fill, the words and a Button in the `action` slot all change together, so you never colour a word yourself."},
      {"name":"with-icon","title":"With an icon","why":"Pass a glyph from your own icon set to `icon`. It sits before the message at the size of the text, and screen readers skip it, so the words must carry the meaning."},
      {"name":"dismissible","title":"A dismissal you store yourself","why":"`onDismiss` shows the ✕ and tells you when someone presses it. Your app removes the Notice and keeps that choice, so it can survive a reload."},
      {"name":"sizes","title":"Sizes","why":"`size` changes the padding, the words, the ✕ and the Button in the `action` slot together. Use the size that matches the region the Notice sits above."},
      {"name":"confirmation","title":"A question with Confirmation","why":"Use `Confirmation` to ask a yes or no question in the same strip. Set `busy` after the yes, so the yes shows a spinner and the no is disabled while the work starts."},
      {"name":"above-a-region","title":"Above the region it describes","why":"Put the Notice in the layout, directly above the content it is about. It pushes that content down instead of covering it, and it has no shadow of its own."},
    ],
    topics: [
      { title: "A condition", symbols: ["Notice"] },
      { title: "A question", symbols: ["Confirmation"] },
    ],
    parts: [
      { part: "Confirmation", blurb: "A question waiting for a yes or a no: the same strip, two worded answers, no dismissal" },
    ],
  },
  {
    slug: "number-field",
    name: "NumberField",
    family: "Control",
    spec: "§4, §11, §28, §51",
    declaration: `<NumberField defaultValue={4} min={1} max={50} />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the height, the text and the width of the two buttons. Each size matches a TextField and a Button at the same size, so the field sits level in a row."},
      {"name":"format","title":"Currency, percentages and units","why":"Pass `Intl.NumberFormat` options to `format`. The field shows and parses the value in that format, and screen readers announce the unit with the number."},
      {"name":"steps","title":"Steps for fine and coarse changes","why":"`step` sets the normal change. `smallStep` applies with Alt and `largeStep` applies with Shift, so a person can make a small or a large change from the keyboard."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onValueChange` when other parts of the screen depend on the number. The value is `null` when the field is empty, so check for it."},
      {"name":"states","title":"Read-only, disabled and invalid","why":"A read-only value stays selectable and is still sent with the form. A disabled field takes no input. An invalid field shows its error from the Field around it."},
      {"name":"in-a-form","title":"In a form","why":"Set `name`, and a hidden input sends the number when the form submits. `required` stops the form from submitting while the field is empty."},
    ],
    abstract: "NumberField holds a number, with a step down and a step up beside it.",
    overview: ["Use a NumberField when the value is a number, such as a count of seats, an amount of money or a timeout. It shows the value between a decrease button and an increase button. Use a Slider when an approximate value in a range is enough, and a TextField when the value only looks like a number, such as a postcode.","It matches a TextField in height, border, focus ring and material, so the two sit level in one form. Set `min` and `max` to keep the value in a range, and `step` to set how far each press or arrow key moves it. A button at a limit, or in a read-only field, becomes disabled.","Pass `format` to show the value as currency, a percentage or a unit. The field formats and parses the number in the language your app runs in, so a person can type `1.234,5` in German. Put a unit in `format`, not in a slot, so the unit is part of the value that screen readers announce.","The value is a number or `null`. `null` means an empty field, not zero. Use `value` and `onValueChange` to hold it yourself, or `defaultValue` to let the field hold it. Set `name`, and a hidden input sends the number with the form.","Put it in a Field to give it a label, a description and an error. Inside a Field it uses that Field's size, and a `size` you set on the NumberField still wins.","The arrow keys change the value by `step`. Alt with an arrow key uses `smallStep`, and Shift with an arrow key uses `largeStep`. The two buttons are not tab stops, because the keyboard already changes the value from the field. Set `decrementLabel` and `incrementLabel` to name the buttons in your app's language."],
    refusals: [
      {
        name: "`leading` and `trailing`",
        why: "The slots hold the steppers. Put a unit or currency in `format` so it is announced and parsed with the number.",
      },
      {
        name: "`emphasis` and `tone`",
        why: "Fields do not rank. For an unacceptable value, set `aria-invalid` or put the field in a Field.",
      },
      {
        name: "`render`",
        why: "It renders two elements, so `render` could only silently mean one of them.",
      },
      {
        name: "The platform's number input",
        why: "The native number input cannot format or parse in your app's language, and draws its own spinner.",
      },
      {
        name: "Dragging and scrolling to change the value",
        why: "Deferred. Scrubbing and scroll-to-change need a pointer design that does not exist yet.",
      },
    ],
  },
  {
    slug: "page",
    name: "Page",
    family: "Layout",
    spec: "§15, §27, §46",
    declaration: `<Page title="Nature Walks" description="Everything collected on the walk.">
  \u2026
</Page>`,
    variants: [
      {"name":"outside-a-frame","title":"Outside a Shell","why":"A Page works without a Shell. The title and description show in place, and the box around the Page sets the reading width."},
      {"name":"title-only","title":"A title with no description","why":"Leave out `description` when the title says everything, as on a settings page. The content starts under the title."},
      {"name":"with-mark","title":"With your app's mark","why":"Pass your logo or a large glyph to `mark`, and it sits above the title. Use it on a front page, not on every screen of the app."},
      {"name":"band-in-flow","title":"Under a toolbar that does not float","why":"Here the ShellPaneHeader sits in the layout instead of floating. The same Page still leaves the right space, and the `ToolbarTitle` shows the title after it scrolls away."},
    ],
    abstract: "Page is the screen you navigated to, and the large title that arrives with it.",
    overview: ["Use a Page for the screen someone moved to, such as a settings page or a report. It shows a large title and an optional description at the top, and it puts your content under them. Set the words with `title` and `description`.","A Page is different from the toolbar above it. The toolbar row, with the navigation button, the back button and the tools, stays in place when the person moves from one page to the next. Build that row with a ShellPaneHeader and a Toolbar. The Page is the part that changes with each screen.","Inside a Shell, the Page leaves room for the toolbar row above it, whether that row floats over the content or sits in the layout. When the large title scrolls up behind the row, a `ToolbarTitle` in the row shows the same words. The `title` is a string for this reason: the same words appear in two places.","A Page has no `size` prop and no width. Every page in an app uses the same title size, so they look like one product. Set the reading width on the box that holds the Page. Outside a Shell, the title shows in place and does not collapse into a toolbar.","The title is the page's one `h1`, and screen readers use it as the name of the screen. Use a Heading at size 6 or 7 for sections inside the Page. Put actions in the toolbar row, not under the title. Use `mark` to show your app's logo above the title on a front page."],
    refusals: [
      {
        name: "A heading level",
        why: "A page is the document's one h1. Use a Heading inside the page for other levels.",
      },
      {
        name: "A size",
        why: "An app has one page title size. Different sizes on one site look like different apps.",
      },
      {
        name: "Actions beside the title",
        why: "Put them in the toolbar with the other controls. Buttons under the title make a second toolbar.",
      },
      {
        name: "A width",
        why: "The page does not cap line length. Set a maximum width on the box that holds it.",
      },
      {
        name: "Collapsing on its own outside a frame",
        why: "The collapse needs a pinned band over a scrolling region. Outside a frame, the title just draws.",
      },
    ],
  },
  {
    slug: "toolbar",
    name: "Toolbar",
    family: "Control",
    spec: "§45",
    abstract: "Toolbar is the row an app's controls live in, and it answers the keyboard as one control.",
    overview: ["`Toolbar` is the row that holds an app's controls. It is one tab stop, and the arrow keys move between the controls inside it. This is how toolbars work on every platform, and it is why this is a component and not a `Flex`. Base UI's Toolbar supplies the keyboard behaviour.","Put `ToolbarButton` in the row, not `Button`. A plain `Button` cannot join the row's keyboard, so it becomes an extra tab stop that the arrow keys skip. `ToolbarButton` takes every `Button` prop, and `render` makes it a link or a menu trigger.","The row is one control tall at its `size`. With no `size`, a toolbar is one step above the app's default, so size 3 in a default app. Every control in the row takes the row's size unless you give it its own. The row sets the space between clusters. Group controls with a `Flex`: one cluster sits at the start, two split to the ends, and three sit at the start, the centre and the end.","`ToolbarGroup` draws a capsule around controls that belong together, such as bold, italic and underline. The buttons in it are quiet by default. Use a `ToolbarSeparator` to divide loose controls. `ToolbarTitle` names the row, and `ToolbarOverflow` moves the controls that do not fit into a menu.","The row itself paints nothing. It has no `tone`, `emphasis` or `material`. Set `backdrop` on the row when content passes behind it, so that every control in the row shows the theme's material. A `ToolbarGroup` also takes `backdrop` for itself.","Screen readers announce the row as a toolbar. Give it an `aria-label` that says what the tools are for, and give every icon-only `ToolbarButton` an `aria-label` of its own."],
    declaration: `<Toolbar>
  <Flex align="center" gap="2">
    <ToolbarButton iconOnly aria-label="Back">{back}</ToolbarButton>
    <ToolbarTitle>Nature Walks</ToolbarTitle>
  </Flex>
  <ToolbarGroup>
    <ToolbarButton>Share</ToolbarButton>
    <ToolbarSeparator />
    <ToolbarButton>Export</ToolbarButton>
  </ToolbarGroup>
</Toolbar>`,
    variants: [
      {"name":"groups","title":"Groups and separators","why":"A `ToolbarGroup` draws one capsule around related controls. A `ToolbarSeparator` draws a thin line between loose controls. Do not put a separator next to a group, because the capsule already shows the boundary."},
      {"name":"sizes","title":"Sizes","why":"`size` on the row sets the height of the row and of every control in it. The title text grows with the row. A toolbar with no `size` is one step above the app's default."},
      {"name":"vertical","title":"Vertical","why":"Set `orientation=\"vertical\"` for a column of tools at the edge of a canvas. The up and down arrow keys then move between the controls, and a separator becomes a horizontal line."},
      {"name":"overflow","title":"Overflow","why":"Put controls in a `ToolbarOverflow` when the row can get too narrow. The controls that do not fit move into a menu behind a more button, starting from the end of the row. Give the menu button a `label`, because it has no visible text."},
      {"name":"with-menu","title":"Links and menus","why":"Pass `render` to make a `ToolbarButton` into a link. To open a menu, pass a `ToolbarButton` to `MenuTrigger` through `render`. Both keep their place in the row's keyboard order."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on one `ToolbarButton` to stop it. Set `disabled` on a `ToolbarGroup` to turn off every control in the capsule at the same time, for example when nothing is selected."},
    ],
    topics: [
      { title: "The row", symbols: ["Toolbar"] },
      { title: "What goes in it", symbols: ["ToolbarButton", "ToolbarGroup", "ToolbarSeparator"] },
      { title: "Naming it", symbols: ["ToolbarTitle"] },
      { title: "When the row runs out of room", symbols: ["ToolbarOverflow"] },
    ],
    parts: [
      {
        part: "ToolbarButton",
        blurb: "A Button registered with the row's keyboard. Our Button cannot enrol itself in the composite, so a plain one in a toolbar is a second tab stop the arrow keys never reach. Every Button prop passes through, render included, so an item that navigates is an anchor and one that opens a menu is a MenuTrigger. It rests where every other control rests, at medium: quiet and loud are for the exceptional cases, and a row of unfilled glyphs reads as marks on the content rather than as things to press.",
      },
      {
        part: "ToolbarGroup",
        blurb: "A capsule around controls that belong together — the formatting cluster in a macOS toolbar. It is a channel with no edge of its own, as tall as a Button at the same size, and the controls in it are inset from its walls — so the group stands level with the button beside it and the buttons inside stand level with both. It takes no size of its own: the group and its contents both read the row's index.",
      },
      {
        part: "ToolbarOverflow",
        blurb:
          "A cluster that collapses into a menu. It measures its controls against the room the row has left, and draws whatever does not fit inside a ⋯ menu instead. It measures rather than reading a breakpoint, because a row's contents are not the same on every screen of an app: the width at which a row is too full is a different width on each one, so there is no single number to state. A control that does not fit is not replaced by something else. It is the same control, asked where it is, and it answers with useToolbarOverflow. The macOS toolbar works the same way, for the same reason.",
      },
      {
        part: "ToolbarSeparator",
        blurb: "The rule between two clusters. It draws the same hairline a Separator draws anywhere else, turned across the row, and it stands at the height of the glyphs it divides rather than of the band it crosses — a line spanning the whole band reads as a division of the frame.",
      },
      {
        part: "ToolbarTitle",
        blurb: "What the row is about. Given words it says them, which is the permanent title of a row with no page under it. Given none it mirrors the Page in the same pane: silent while that page's own large title is on screen, and fading in when it scrolls away. With nothing to say it renders nothing at all, so no gap opens where a title is not.",
      },
    ],
    refusals: [
      {
        name: "Tone, emphasis and material on the ROW",
        why: "A toolbar paints nothing, so there is nothing to colour or blur. Only the group takes `backdrop`.",
      },
      {
        name: "Leading, centre and trailing parts",
        why: "Which control sits at which end is yours to say. Group them with a Flex; the row sets the split.",
      },
      {
        name: "A size on the group",
        why: "The group and its controls read the row's size, so they stay the same height.",
      },
      {
        name: "A gap prop",
        why: "The row sets the spacing between clusters, and your Flex sets it within one.",
      },
    ],
  },
  {
    slug: "popover",
    name: "Popover",
    family: "Surface",
    spec: "§20, §22, §31",
        abstract: "Popover shows a panel anchored to a control, with the page still live behind it.",
    overview: ["Use a Popover to show a small panel next to the control that opened it, while the rest of the page stays usable. It can hold anything you put in it, such as a short form, a summary of a person or a filter panel.","Choose the right floating component for the job. Use a Menu for a list of actions, and a Select to pick one value. Use a Dialog when the person must finish a task before they continue, and an AlertDialog to ask one question. Use a Tooltip for a short label that names a control.","Put a Button in `PopoverTrigger` through `render`. The panel opens from that Button and stays attached to it. Set `side` and `align` on `PopoverContent` to choose where the panel prefers to open. The panel moves to the other side when it has no room, and it stays on screen.","`size` on `Popover` sets the panel's padding and corner, and the size of `PopoverTitle` and `PopoverDescription`. Your own content keeps the sizes you give it. The panel uses the theme's glass material without a prop, because content is always behind it.","Give every panel a `PopoverTitle`. Screen readers announce the panel by its title, and `PopoverDescription` is announced with it. Escape and a press outside the panel close it, and focus goes back to the trigger. Wrap your own Button in `PopoverClose` for a close or save action. Use `open` and `onOpenChange` to control the panel yourself."],
    declaration: `<Popover>
  <PopoverTrigger render={<Button>Rename</Button>} />
  <PopoverContent>
    <PopoverTitle>Rename project</PopoverTitle>
    <PopoverDescription>\n      This changes the name everywhere.\n    </PopoverDescription>
    <PopoverClose render={<Button emphasis="loud">Save</Button>} />
  </PopoverContent>
</Popover>`,
    variants: [
      {"name":"placement","title":"Choosing a side","why":"Set `side` and `align` on `PopoverContent` to choose where the panel opens. The panel moves to the opposite side when the preferred side has no room."},
      {"name":"sizes","title":"Sizes","why":"`size` on `Popover` sets the panel's padding and corner, and the size of the title and description. Content that you add keeps its own sizes."},
      {"name":"filter-panel","title":"A filter panel","why":"A Popover can hold a small form, such as a set of checkboxes. Wrap the Apply and Reset buttons in `PopoverClose` so each one also closes the panel."},
      {"name":"controlled","title":"Controlled","why":"Use `open` and `onOpenChange` when your code must close the panel, for example after a form submits. Reset the draft value each time the panel opens."},
      {"name":"details","title":"A summary of a person","why":"A Popover can show details without a form. The title and description name the panel for screen readers, and a Separator divides the header from the details."},
    ],
    topics: [
      { title: "Opening it", symbols: ["Popover", "PopoverTrigger"] },
      { title: "Presenting the panel", symbols: ["PopoverContent"] },
      { title: "Naming it", symbols: ["PopoverTitle", "PopoverDescription"] },
      { title: "Closing it", symbols: ["PopoverClose"] },
    ],
    refusals: [
      {
        name: "A modal mode",
        why: "A popover leaves the page live. Use a Dialog to block the page, or an AlertDialog to ask one question.",
      },
      {
        name: "An arrow",
        why: "The pane already has a border. Its anchor to the trigger shows where it came from.",
      },
      {
        name: "Free positioning",
        why: "Choose a side and an alignment. The system flips it and keeps it on screen.",
      },
      {
        name: "A width that matches the trigger",
        why: "A popover holds a form, so its width should not change with whatever opened it.",
      },
      {
        name: "A drawn close button",
        why: "Outside press and Escape already close it. Wrap your own Button in a `PopoverClose` if you need one.",
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
    declaration: `<Progress value={35} aria-label="Uploading" />`,
    variants: [
      {"name":"labelled","title":"With a visible label","why":"Put a Text above the bar and connect it with `aria-labelledby`. The same words name the bar on screen and for screen readers, so you do not write the label twice."},
      {"name":"indeterminate","title":"When the amount is unknown","why":"Set `value` to `null` when you do not know how much work is left. The bar shows a moving segment until you give it a number."},
      {"name":"range","title":"A range other than 0 to 100","why":"Set `min` and `max` to use your own units. Use `getAriaValueText` so screen readers announce the value in the same words that are on screen."},
      {"name":"in-a-card","title":"In a card","why":"Each file gets its own bar, named by its own label. A finished file shows a full bar, and a file that has not started yet shows a moving segment."},
    ],
        abstract: "Progress shows how far along a task is.",
    overview: ["Use Progress to show how far along a task is, such as an upload, an export or a quota. Give `value` a number and the bar fills to that fraction. Give it `null` and the bar shows a moving segment, which says that work is happening without saying how much is left.","Use a Spinner instead when the wait is short and sits inside a control, such as a Button that is saving. Use a Slider when the person sets the value. A Progress bar has no handle, so it takes no focus and has no tappable area.","The bar has one fixed thickness and fills the width of its container. Set a width on the box that holds it. By default the value runs from 0 to 100. Set `min` and `max` to use other units, such as gigabytes.","The bar uses your app's accent colour for the fill, and it has no `tone` or `size` prop. When the person asks the system for less motion, the moving segment slows down but does not stop.","Screen readers announce the bar as a progress bar with its value. Give it a name with `aria-label`, or connect it to a visible Text with `aria-labelledby`. Use `getAriaValueText` when the percentage alone does not say enough, for example “7.2 of 10 gigabytes used”."],
    refusals: [
      {
        name: "`size`",
        why: "A bar has one fixed thickness and takes its width from its container.",
      },
      {
        name: "`tone`",
        why: "Not decided yet. It is left open rather than guessed.",
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    family: "Control",
    spec: "§4, §6, §11",
    declaration: `<Radio value="a" id="a" />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the circle to the height of one line of text at that size. Match the size of the label beside it, so the circle and the words line up."},
      {"name":"with-descriptions","title":"With a description for each option","why":"Put each Radio in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The description lines up under the label, and screen readers announce it with the option."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on one Radio to keep it in the list while it is not available. Add a description that says why, so the person knows how to get it."},
      {"name":"wrapping-label","title":"A label that wraps the radio","why":"Wrap the Radio and its words in a `<label>`, and they connect without an `id`. Pressing anywhere on the label checks the Radio."},
    ],
        abstract: "Radio lets someone pick one option from a group.",
    overview: ["Use a Radio to let someone pick exactly one option from a short list, such as a plan or a backup schedule. Every Radio sits inside a RadioGroup, which holds the chosen value. A Radio is checked when its `value` matches the group's value.","Use a Checkbox when a person can pick several options, or one option on its own. Use a Switch for a setting that takes effect at once. Use a Select when the list is long, and a segmented control when the options are two to five short labels that change a view in place.","A Radio is always a circle, whatever corner setting your theme uses, because a square radio looks like a checkbox. It is off in a neutral colour and on in your app's accent colour. It has no `tone` or `emphasis` prop.","A Radio is exactly as tall as one line of the text beside it, and it is the same size as a Checkbox at the same `size`. Its tappable area extends past the circle to the size of a Button at that size. Inside a Field it uses that Field's size, and a `size` you set on the Radio still wins.","The label is a separate element next to the Radio. Put each Radio and its label in a `FieldItem`, which connects them without an `id`. You can also wrap the Radio in a `<label>`, or give the Radio an `id` and point a label at it with `htmlFor`. Pressing the label checks the Radio."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "Neutral when off and accent when on is fixed, as on Checkbox." },
      { name: "`readOnly`", why: "HTML has no read-only radio, so there is no appearance to copy." },
    ],
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    family: "Control",
    spec: "§4, §11",
    declaration: `<RadioGroup defaultValue="yes">
  <Radio value="yes" />
  <Radio value="no" />
</RadioGroup>`,
    variants: [
      {"name":"horizontal","title":"Radios in a row","why":"Pass a Flex to `render` to put the radios side by side. Keep the gap wide enough that the tappable area of one Radio does not reach the next."},
      {"name":"controlled","title":"Controlled","why":"Use `value` and `onValueChange` when other parts of the screen depend on the choice. Here the price under the group changes with the plan."},
      {"name":"in-a-form","title":"In a form","why":"Set `name` on the group, and the chosen value is sent when the form submits. `required` stops the form from submitting until someone picks an option."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on the group to disable every Radio at once. Say why in a description, because a disabled control does not explain itself."},
    ],
        abstract: "RadioGroup holds one chosen value among its radios, and stacks them.",
    overview: ["Use a RadioGroup to hold one chosen value for a set of Radio components. It gives the radios one name and one value, and it sends that value with a form. Put every Radio for one question inside the same group.","By default the group is a column, with enough space between the radios that the tappable area of one never covers the next. Pass `render={<Flex gap=\"5\" />}` to lay the radios out in a row, or in any other layout. Your layout replaces the default column.","Use `defaultValue` to let the group hold the value, or `value` and `onValueChange` to hold it yourself. Set `name` to send the value with a form, and `required` to stop the form from submitting until someone picks an option. Set `disabled` on the group to disable every radio in it.","The group has no visual props of its own. It has no `readOnly` prop, because HTML has no read-only radio. To show a value that cannot change, set `disabled` and add a description that says why.","Screen readers announce the group as a radio group. Put it in a Field with a `FieldLabel` to give the group a name, or set `aria-label` on it. The group is one tab stop. The arrow keys move between the radios and check the one they reach."],
    refusals: [{ name: "Any visual prop", why: "The group is wiring plus a default stack. Render it as any other layout you need." }],
  },
  {
    slug: "row",
    name: "Row",
    family: "Control",
    spec: "§21",
    declaration: `<Row current trailing={<Text emphasis="quiet">12</Text>}>
  Environments
</Row>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the height, the text and the icon box. A Row matches the height of a Button at the same size, so a list and a toolbar next to it line up."},
      {"name":"leading-and-trailing","title":"Icons, counts and shortcuts","why":"Put an icon in `leading`, and a count, a size, a shortcut or a chevron in `trailing`. The trailing content sits against the far edge of the Row."},
      {"name":"links","title":"Rows that go to another page","why":"Pass an anchor to `render` so each Row is a real link. Set `current` on the Row for the page that is open, and screen readers announce it as the current page."},
      {"name":"highlighted","title":"A highlight moved by the keyboard","why":"Focus stays in the search field while the arrow keys move a highlight through the results. Pass `highlighted` to every Row, so the pointer does not light a second Row."},
      {"name":"read-only","title":"A list you only read","why":"Pass a `<div>` to `render` when the Rows show information and do nothing when pressed. The Row keeps its layout and has no hover or focus."},
      {"name":"destructive","title":"An action that deletes","why":"Set `tone=\"destructive\"` on the one Row that deletes something. Use it only for that Row, so it stands out from the actions around it."},
    ],
        abstract: "Row is one line in a list of things you can pick.",
    overview: ["Use a Row for one line in a list that people pick from, such as search results, a command list, a settings list or a file list. It is the same kind of line as a menu item and a sidebar item, with the same hover and the same text weight. Put Rows in a Stack to make the list.","Inside a Menu, use `MenuItem` instead. To let someone choose one option from several, use a RadioGroup. Use `current` only to mark the page or file that is open now: a Row with `current` announces `aria-current` and is not a form value.","A Row is as tall as a Button at the same `size`, so it sits level with the Buttons around it. Rows in a Menu are shorter, because a menu is open only for a moment. Add an icon, an avatar or a tick with `leading`, and a count, a shortcut or a chevron with `trailing`.","A Row is a button by default. Pass `render={<a href=\"…\" />}` for a Row that goes to another page, and `render={<div />}` for a Row that shows information and cannot be pressed. Set `disabled` to keep a Row in the list while it is not available. Set `tone=\"destructive\"` for an action that deletes something.","No Row is louder than another, so a Row has no `emphasis` prop. When the pointer is the only way to move through the list, the Row lights up on hover. When your list moves a highlight with the arrow keys, pass `highlighted` to every Row: the Row then lights up only when `highlighted` is true, and it stops following the pointer.","A Row has no keyboard model of its own. Your list decides the role, such as `listbox`, `list` or navigation links, because the role depends on what the Rows mean."],
    refusals: [
      {
        name: "`emphasis`",
        why: "A list of peers ranks nothing, so rows stay quiet. No row is louder than another.",
      },
      {
        name: "A keyboard model",
        why: "The list owns the highlight. Pass `highlighted` and the row paints it and stops following the pointer.",
      },
      {
        name: "A selected prop",
        why: "Picking one of several is a radio group. Use `current` to mark the page you are on.",
      },
      {
        name: "A List component to put these in",
        why: "Use a Stack for the column. You set the list role, because it depends on what the rows mean.",
      },
      {
        name: "The menu row's tighter box",
        why: "A standing row matches the height of nearby buttons. If you want menu density, use a Menu.",
      },
    ],
  },
  {
    slug: "tree",
    name: "Tree",
    family: "Control",
    spec: "§33",
    declaration: `<Tree items={files} multiselectable defaultExpandedIds={["src"]} aria-label="Project files" />`,
    variants: [
      {"name":"with-icons","title":"With icons","why":"Set `leading` on a node to put an icon before its label. The theme sizes the icon to match the row. Use icons that show the kind of item, such as a folder or a document."},
      {"name":"single-select","title":"Single selection","why":"Without `multiselectable`, a click selects one row and clears the rest. Use `defaultSelectedIds` to start with a row selected, and `defaultExpandedIds` to start with folders open."},
      {"name":"controlled","title":"Controlled","why":"Pass `expandedIds` with `onExpandedChange`, and `selectedIds` with `onSelectionChange`, to keep both sets in your own state. Then buttons such as Expand all and Collapse all can change the tree."},
      {"name":"sizes","title":"Sizes","why":"`size` sets the row height, the text size and the indent. One level of indent is always one icon wide, so the tree keeps its shape at every size."},
      {"name":"rich-labels","title":"Rich labels","why":"A `label` can hold other components, such as a count in a `Badge`. Set `textValue` on those nodes so that typing a letter still finds the right row."},
      {"name":"rtl","title":"Right to left","why":"Set `dir=\"rtl\"` on the tree or on any parent. The indent moves to the right side and the disclosure arrow points in the reading direction."},
    ],
        abstract: "Tree shows hierarchical content the person reveals and hides: a file browser, a layers panel, anything with sub-contents.",
    overview: ["`Tree` shows hierarchical content that you open and close: a file browser, a layers panel, or a list of folders with sub-folders. You can select one row, or several rows when you set `multiselectable`.","Give the tree its content as data through `items`. Each `TreeNode` has an `id` and a `label`. A node with `children` shows a disclosure arrow. Add `leading` for an icon, and add `textValue` when the `label` is not a plain string, so that typing a letter can find the row.","Use a `NavTree` when pressing a row opens a page instead of selecting it, such as a documentation sidebar. Use a `Menu` or a `Select` for a short flat list of choices. Renaming, drag-and-drop and icons per file type are your app's work, not props on the tree.","The theme sets the row height and the indent. `size` picks the same steps that controls use, and one level of indent is the width of one icon at that size. So the indent grows with `size` and on touch screens. Selected rows get a soft fill.","Screen readers announce the tree as a tree, with the level, position, open state and selected state of each row. The tree is one tab stop. The up and down arrow keys move between visible rows. The right arrow opens a row or moves to its first child, and the left arrow closes a row or moves to its parent. Home and End go to the first and last rows, and typing a letter moves to the next matching row.","When `multiselectable` is on, Shift with an arrow key or a click selects a range, and Command or Control with a click adds or removes one row."],
    refusals: [
      {
        name: "Drag to reorder",
        why: "Drag-to-reorder is its own pattern with app-specific drop rules. Build it in app code for now.",
      },
      {
        name: "Cascade selection",
        why: "Whether a folder selects its children is a product decision. Selection is exactly the rows you pick.",
      },
      {
        name: "Async children and loading states",
        why: "Nothing loads subtrees over the network yet. It will use `aria-busy` when something does.",
      },
      {
        name: "Rename-in-place",
        why: "Renaming belongs to your app, which decides what a name is and when it commits.",
      },
      {
        name: "JSX children",
        why: "Rows render flat with ARIA levels, so the hierarchy is data. Pass it through `items`.",
      },
      {
        name: "An indent prop",
        why: "One level is one icon box, set per size. A stated indent would be a second number for it.",
      },
    ],
  },
  {
    slug: "nav-tree",
    name: "NavTree",
    family: "Control",
    spec: "§33",
    declaration: `<NavTree items={chapters} currentId={pathname} defaultExpandedIds={["start"]} />`,
    variants: [
      {"name":"in-a-sidebar","title":"In a sidebar","why":"Put the NavTree in a `nav` element with a name, so a screen reader lists it with the other landmarks. Top-level pages and sections can sit side by side."},
      {"name":"sizes","title":"Sizes","why":"`size` sets the row height, the text and the indent together. Rows are size 2 by default."},
      {"name":"with-icons","title":"With icons","why":"Set `leading` on a node to show an icon after the disclosure arrow. The icon takes the row's size, so you set no size on it."},
      {"name":"controlled","title":"Controlled","why":"Pass `expandedIds` and `onExpandedChange` to keep the open sections in your own state. Here two buttons open or close every section at once."},
      {"name":"router-links","title":"Router links","why":"`renderLink` returns the element each page renders as, such as your router's link component. This example updates `currentId` in place of a real navigation."},
      {"name":"rtl","title":"Right to left","why":"Set `dir=\"rtl\"` on the NavTree or on any ancestor. The indent moves to the right edge and the disclosure arrow points the other way."},
    ],
        abstract: "NavTree is the tree machine's navigation member: the same data, indent and disclosure as Tree, announced as navigation instead of a tree view — sections are real buttons with aria-expanded, pages are real links, and the page you are on says aria-current.",
    overview: ["NavTree shows navigation as a tree of sections and pages. It uses the same data, indent and disclosure arrow as Tree. A section is a button that opens and closes its pages, a page is a real link, and the page you are on has `aria-current=\"page\"`.","Use it for a sidebar's navigation, a list of documentation chapters, or anything where pressing a row goes somewhere. The documentation sidebar on this site is one. Use Tree when pressing a row selects it, such as in a file picker.","`items` holds the tree as data. A node with `children` is a section, and a node with `href` is a page. A node with neither renders as plain text, not as a link. `currentId` marks the page you are on in the accent colour. Use `renderLink` to render each page as your router's link component.","Rows are size 2 by default, and each row is as tall as a Button of the same size. The theme density and the pointer type change the row height in the same way they change a Button. One level of indent is the width of one icon, and it follows the size.","Tab moves between sections and pages in the normal order. Enter or Space opens and closes a section, and Enter follows a link. There are no tree roles and no arrow-key navigation, because this is navigation and not a selection. NavTree renders a plain container, so put it inside a `<nav>` element with an `aria-label`."],
    refusals: [
      {
        name: "Role=\"tree\"",
        why: "Navigation has no selection model or roving keyboard, so a tree role over-claims. Sections are buttons, pages are links.",
      },
      {
        name: "Selection",
        why: "A nav has a current location, not a selection. If rows are chosen rather than visited, use a Tree.",
      },
      {
        name: "The tree keyboard",
        why: "It holds links, so Tab moves between them and Enter follows them, like any other navigation.",
      },
      {
        name: "An indent prop",
        why: "One level of indent is one icon box. It is derived, not set.",
      },
    ],
  },
  {
    slug: "message-scroller",
    name: "MessageScroller",
    family: "Surface",
    spec: "§56",
    abstract: "MessageScroller keeps a transcript at its live edge while a reply streams in.",
    overview: ["MessageScroller keeps a conversation at its latest message while a reply streams in. While you are at the end, it follows the new content. When you scroll up, it keeps your place until you come back to the end.","A new turn marked with `scrollAnchor` moves near the top of the view, so you read a long reply from its start. Older history can load above without moving what you are reading, and a button brings you back to the latest message.","It adds no scroll box of its own. The `ScrollArea` in the pane becomes its viewport, so the pane keeps its fade, its scrollbars and its floating bands. The rows, the words and the counts are yours. The Conversation block shows one way to draw a turn.","Use it for a chat, a support thread or a log that grows while people read it. For a list that does not grow, use ScrollArea on its own. `defaultScrollPosition` sets where the transcript opens: at the end (the default), at the start, or at the last marked turn. Set `autoScroll={false}` to stop following new content.","`MessageScrollerContent` is a live region, so a screen reader announces new rows. Name the transcript with `aria-label` on the ScrollArea, and give the jump button a name in your own words. The jump button shows only when there is more below, and it uses the theme's material because content passes behind it.","Call `useMessageScroller`, `useMessageScrollerScrollable` or `useMessageScrollerVisibility` inside a MessageScroller to build your own controls. They move the transcript, tell you whether there is more at each end, and tell you which rows are on screen."],
    declaration: `<MessageScroller>
  <ScrollArea fade aria-label="Transcript">
    <MessageScrollerContent>
      <MessageScrollerItem messageId="m1" scrollAnchor>
        \u2026
      </MessageScrollerItem>
    </MessageScrollerContent>
    <MessageScrollerButton aria-label="Jump to the latest">
      \u2026
    </MessageScrollerButton>
  </ScrollArea>
</MessageScroller>`,
    variants: [
      {"name":"streaming","title":"A streaming reply","why":"Send a question and watch the reply arrive one word at a time. While you stay at the end, the view follows the words. Scroll up and the view stays where you left it."},
      {"name":"open-at-start","title":"Open at the start","why":"A saved thread opens at its end. Set `defaultScrollPosition=\"start\"` for a log that people read from the top, and `autoScroll={false}` when new rows must not move the view."},
      {"name":"jump-to-message","title":"Jump to a message","why":"Call `useMessageScroller` inside the MessageScroller to move the transcript from your own controls. It scrolls to the start, to the end, or to one row by its `messageId`."},
      {"name":"custom-button","title":"Your own jump control","why":"`useMessageScrollerScrollable` tells you whether there is more to scroll to at each end. Use it to build a control of your own, here a button that is off when you are at the end."},
    ],
    topics: [
      { title: "Following the live edge", symbols: ["MessageScroller", "MessageScrollerContent"] },
      { title: "Rows, anchors and jumping back", symbols: ["MessageScrollerItem", "MessageScrollerButton"] },
    ],
    refusals: [
      {
        name: "`size`",
        why: "It paints only the button. Each row in your app states its own size.",
      },
      {
        name: "A viewport of its own",
        why: "Two scroll boxes in one pane fail. It uses the pane's `ScrollArea` instead.",
      },
      {
        name: "English",
        why: "The button's accessible name is yours to write, like every name the system cannot know.",
      },
    ],
    parts: [
      { part: "MessageScrollerContent", blurb: "The transcript itself: a live region whose direct children are its rows" },
      { part: "MessageScrollerItem", blurb: "One row, the boundary the transcript measures, anchors and can be jumped to; `scrollAnchor` marks a turn" },
      { part: "MessageScrollerButton", blurb: "Back to the latest: shown while there is more below, inert when there is not, and placed by the dock it sits in" },
    ],
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    family: "Surface",
    spec: "§10",
    declaration: `<ScrollArea style={{ height: "10rem" }}>
  \u2026
</ScrollArea>`,
    variants: [
      {"name":"fade","title":"Faded edges","why":"`fade` fades the content at an edge while more is hidden behind it. An edge with nothing past it does not fade, so the list shows when it continues."},
      {"name":"horizontal","title":"Sideways scrolling","why":"Content wider than its box scrolls sideways. ScrollArea shows a bar only for the direction that overflows, so there is no orientation prop to set."},
      {"name":"in-a-card","title":"In a card","why":"When a ScrollArea is the only child of a Card, it reaches the card's edges and puts the padding inside itself. The bar then runs along the card's own edge."},
      {"name":"named-region","title":"A named scroll region","why":"A ScrollArea is a tab stop. Name it with `aria-labelledby` or `aria-label`, and a screen reader announces it as a region that keyboard users can scroll."},
    ],
        abstract: "ScrollArea draws custom scrollbars over native scrolling.",
    overview: ["ScrollArea draws its own scrollbars over the browser's native scrolling. The browser keeps the wheel, trackpad, touch and keyboard behaviour. The system draws a rounded bar over the content, with no track and no reserved space.","The bar is visible while you scroll or point at the area, and it is hidden at rest. ScrollArea shows a bar only for a direction that has more content, so you do not choose horizontal or vertical.","A ScrollArea needs a limit to scroll. Give it a `height` or `maxHeight` through `style`, or put it in a Shell pane or a panel that sets its height. Without a limit, it grows with its content and never scrolls.","Set `fade` to fade the content out at an edge while more of it is hidden past that edge. When a ScrollArea is the only child of a `Card` or another surface, it reaches the surface's edges and moves the surface's padding inside itself.","A ScrollArea is a tab stop, so a keyboard user can focus it and scroll with the arrow keys. Name it with `aria-label` or `aria-labelledby`, and a screen reader announces it as a region. Set `focusable={false}` only inside a component that already handles keyboard scrolling, such as a menu."],
    refusals: [
      { name: "`size`", why: "It has one fixed thickness. A scrollbar has no box to size against." },
      { name: "`tone` and `emphasis`", why: "A scrollbar ranks nothing and means nothing. It only shows where you are." },
      { name: "`material`", why: "It draws inside a pane, and the pane already answers the theme's material." },
      { name: "`render`", why: "The parts follow Base UI's structure, which you cannot reach into." },
      { name: "`orientation`", why: "Base UI shows only the bars the content needs, after measuring. It is not a prop." },
    ],
  },
  {
    slug: "separator",
    name: "Separator",
    family: "Surface",
    spec: "§11",
    declaration: `<Separator orientation="horizontal" />`,
    variants: [
      {"name":"in-a-toolbar","title":"In a toolbar","why":"A vertical Separator stretches to the height of its row. Use it to divide one group of controls from the next, such as text style from text alignment."},
      {"name":"labelled","title":"A divider with a word","why":"There is no `children` prop. Build an \"or\" divider from two Separators and a Text in a row, with each line in a Box that grows."},
      {"name":"in-a-card","title":"In a card","why":"Separators between the rows of a summary card. Each line fills the width of its Stack, so you never set a length."},
    ],
        abstract: "Separator draws a thin dividing line.",
    overview: ["Separator draws a thin line between two groups of content. It has one colour and one thickness, and the theme sets both. Use it where space alone does not show that two groups are separate.","The line is as long as the container it sits in. A horizontal Separator fills the width of its column, and a vertical one fills the height of its row. There is no length prop, for the same reason no component sets its own outer spacing.","Prefer space before you add a line. A larger `gap` between two groups is often enough. Use a `Card` when a group needs its own surface, and use `Surface` when a region needs a recessed background.","A Separator is a real `role=\"separator\"` element, and `orientation` sets `aria-orientation` for screen readers. A line that must stay hidden from screen readers is decoration, so draw it with a styled `Box` instead."],
    refusals: [
      { name: "`children`", why: "A labelled divider is two Separators and a Text, not a prop." },
      { name: "A length prop", why: "The container sets the length, the same way it sets spacing everywhere." },
      { name: "`decorative`", why: "A rule hidden from screen readers is not a Separator. Use a styled Box." },
    ],
  },
  {
    slug: "sheet",
    name: "Sheet",
    family: "Surface",
    spec: "§10, §20, §24, §49",
    abstract: "Sheet slides a panel in from an edge of the window, over a dimmed app.",
    overview: ["Sheet slides a panel in from an edge of the window, over a dimmed app. Use it for a task that needs more room than a `Popover` but that you want to keep beside the page, such as filters, a share panel or navigation on a phone.","Use `Dialog` when the task belongs in the centre of the screen. Use `AlertDialog` for a short question that needs an answer. Use a Shell pane, such as `ShellInspector`, for a panel that stays open while people keep working on the page.","It has the same behaviour as `Dialog`. Focus stays in the panel, the page behind it stops scrolling, and the dimmed background shows that the page is out of use. Escape, a press on the dimmed background, or a swipe toward the edge closes it. `onOpenChange` tells you why it closed.","`side` follows the reading direction: `bottom`, `inline-start` or `inline-end`. A panel that comes from the right in English comes from the left in Arabic, and your markup does not change. The panel follows your finger while you drag it closed, and on a phone it sits above the keyboard.","`size` sets the width, the padding, the corner, and the text size of `SheetTitle` and `SheetDescription`. A side sheet uses that width. A bottom sheet uses it as a maximum, so it fills the window on a phone. The size does not change the content you put inside.","A screen reader announces the panel as a dialog, named by `SheetTitle` and described by `SheetDescription`. The part names follow shadcn/ui's sheet (MIT), with credit, and the behaviour comes from Base UI's Drawer."],
    declaration: `<Sheet side="inline-end">
  <SheetTrigger render={<Button>Filters</Button>} />
  <SheetContent>
    <SheetTitle>Filters</SheetTitle>
    <SheetDescription>
      Narrow the deploys shown on this page.
    </SheetDescription>
    <SheetClose render={<Button>Apply</Button>} />
  </SheetContent>
</Sheet>`,
    variants: [
      {"name":"bottom","title":"From the bottom","why":"`side=\"bottom\"` is the default. On a phone the panel fills the window's width, and on a wider window its width stops at a size that suits one task."},
      {"name":"inline-start","title":"From the start edge","why":"`side=\"inline-start\"` opens from the side where reading starts, the left in English. It is a common place for navigation on a narrow window."},
      {"name":"controlled","title":"Controlled","why":"Hold `open` in your own state to open the sheet from anywhere, with no SheetTrigger. `onOpenChange` tells you when a person closes it."},
      {"name":"long-content","title":"Content taller than the window","why":"When the content is taller than the window, the panel stops at the window's height and its body scrolls. The page behind it does not scroll."},
      {"name":"rtl","title":"Right to left","why":"`side` follows the reading direction. Under `dir=\"rtl\"`, `inline-end` opens the panel from the left, and a swipe to the left closes it."},
    ],
    topics: [
      { title: "Opening it", symbols: ["Sheet", "SheetTrigger"] },
      { title: "Presenting the panel", symbols: ["SheetContent"] },
      { title: "Naming it", symbols: ["SheetTitle", "SheetDescription"] },
      { title: "Closing it", symbols: ["SheetClose"] },
    ],
    refusals: [
      {
        name: "A top edge, and a physical left or right",
        why: "The top edge belongs to system and app toolbars. Sides follow reading direction, so physical left and right are out.",
      },
      {
        name: "Header and Footer, and a close button in the corner",
        why: "Write the title and actions in a Stack. Use `SheetClose` to place a real Button where you want it.",
      },
      {
        name: "`modal` and `disablePointerDismissal`",
        why: "An open sheet traps focus and locks the page. A panel that leaves the page live is a Shell pane.",
      },
      {
        name: "Snap points, and a swipe that opens it",
        why: "A sheet is open or closed. Half-open states and edge swipes conflict with the browser's back gesture.",
      },
      {
        name: "Sheets inside sheets",
        why: "Two stacked focus traps have no order. Change what the open sheet shows instead.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "The panel carries no meaning of its own. Put tone and emphasis on what goes inside it.",
      },
      {
        name: "A shadow",
        why: "The dimmed page already shows the sheet covers the app, so no extra shadow is added.",
      },
    ],
    parts: [
      { part: "SheetTrigger", blurb: "The button that opens it, usually render={`<Button/>`}. A sheet driven by your own state needs no trigger at all" },
      { part: "SheetContent", blurb: "Portals the panel, re-applies the theme, dims the page, and places the panel against the edge you named. The body inside it is what scrolls" },
      { part: "SheetTitle", blurb: "The panel's accessible name, wired by aria-labelledby. A real heading element, at the step the sheet's own size sets" },
      { part: "SheetDescription", blurb: "The supporting line, wired by aria-describedby. It is announced with the title, so a description that restates the title is heard twice" },
      { part: "SheetClose", blurb: "A dismissing button you place yourself. There is no corner glyph, so the action zone stays where the composition put it" },
    ],
  },
  {
    slug: "shell",
    name: "Shell",
    family: "Layout",
    spec: "§27",
        abstract: "Shell is the app frame: a header, a rail, a sidebar, the content, an inspector and a bottom pane.",
    overview: ["Shell is the frame of an app. It holds a full-width header, a rail of icons, a sidebar, the content, an inspector and a bottom pane. Use it once, at the root of an app, and put your pages inside `ShellContent`.","Each pane places itself in one grid by name, so Shell does not inspect its children, and the order you write them in stays the reading order. Leave out the panes you do not need. Every pane is a real landmark: the header is a `<header>`, the rail and sidebar are `<nav>` elements, the content is `<main>`, and the inspector and bottom pane are `<aside>` elements.","A pane you have not opened or closed follows the window size. The sidebar is open on a wide window and becomes an overlay on a narrow one. CSS makes this choice, so the first paint is correct with no script. A `ShellTrigger` opens and closes a pane by name from anywhere in the frame. Pass `open` and `onOpenChange` to hold a pane's state yourself, in the same pattern `Dialog` uses.","By default the panes join edge to edge, with one line at each join. Set `flush={false}` on a pane to pull it off the frame. The side panes then float over the content, or, when the content itself is not flush, it becomes a separate panel set in from the frame.","`size` on Shell sets the size of the navigation rows, the rail items and the header row in every pane, and any pane can set its own. By default a Shell fills the window. Set `contained` to fill its parent instead, for a Shell inside a card or a demo.","When a pane opens as an overlay on a narrow window, focus moves into it, the rest of the frame cannot be used, and Escape or a press outside closes it."],
    declaration: `<Shell>
  <ShellHeader>\u2026</ShellHeader>
  <ShellRail aria-label="Regions">
    <ShellRailList>
      <ShellRailItem aria-label="Files">{icon}</ShellRailItem>
    </ShellRailList>
  </ShellRail>
  <ShellSidebar aria-label="Sections">
    <ShellPaneHeader float>
      <ShellTrigger target="sidebar" action="toggle" />
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
    variants: [
      {"name":"header","title":"A full-width header","why":"ShellHeader is a bar above every column. A ShellTrigger in it opens and closes the sidebar, so people can get the sidebar back after they close it."},
      {"name":"rail","title":"A rail beside the sidebar","why":"A ShellRail is a narrow column of icons for the top-level areas. The sidebar lists the pages in the chosen area. Give each `<nav>` its own `aria-label`."},
      {"name":"inspector","title":"A details inspector","why":"ShellInspector is a details column at the end of the frame. It stays closed until a ShellTrigger opens it, or you pass `defaultOpen`."},
      {"name":"bottom-pane","title":"A bottom pane for logs","why":"ShellBottom is a full-width pane under the columns, for a console or a build log. It stays closed until a ShellTrigger opens it."},
      {"name":"floating","title":"Floating side panes","why":"Set `flush={false}` on the side panes and leave the content flush. The content fills the whole frame, and the rail and sidebar float over it as separate panels."},
      {"name":"grounded","title":"Content as its own panel","why":"Set `flush={false}` on ShellContent and leave the other panes flush. The work area becomes its own panel, while the header and sidebar stay joined to the frame."},
      {"name":"resizable","title":"A resizable sidebar","why":"Set `resizable` to let people drag the sidebar's edge or step it with the arrow keys. `minWidth` and `maxWidth` limit the drag, and `onResize` gives you the width to store."},
      {"name":"controlled","title":"Controlled","why":"Pass `open` and `onOpenChange` to hold a pane's state yourself, for example to remember it between visits. `onOpenChange` fires only when a person changes it."},
    ],
    topics: [
      { title: "The frame", symbols: ["Shell"] },
      { title: "The panes", symbols: ["ShellHeader", "ShellSidebar", "ShellContent", "ShellInspector", "ShellBottom"] },
      {
        title: "The rail that switches regions, and the tab bar it becomes",
        symbols: ["ShellRail", "ShellRailList", "ShellRailItem", "ShellRailAction", "ShellTabBar"],
      },
      { title: "Inside a pane", symbols: ["ShellScroll", "ShellPaneHeader", "ShellPaneFooter"] },
      { title: "Navigating", symbols: ["ShellNavGroup", "ShellNavItem"] },
      { title: "Opening and closing a pane", symbols: ["ShellTrigger"] },
    ],
    refusals: [
      { name: "A gap prop", why: "Floating is the gap: one layout-space step, so it tightens with density. A custom number drifts off rhythm." },
      { name: "A header position axis", why: "The header is always full-width. For a narrower one, put a header inside `ShellContent`." },
      { name: "A thin sidebar mode", why: "A thin sidebar is a rail. Rail and sidebar are separate columns you can link yourself." },
      { name: "A close-cascade between rail and sidebar", why: "It is an app's opinion, not a frame rule. Some apps keep rail and sidebar independent." },
      { name: "`peek`", why: "Deferred until a real screen needs it. A half-open pane costs a lot and carries little." },
      { name: "A `ShellRailItem` with a prop for the detached seat", why: "A rail item is a place, and an action is not. Use `ShellRailAction`, which sizes itself to match the pill." },
      { name: "`backdrop` on `ShellContent`", why: "Nothing ever sits behind the work area, so glass blurs nothing. Put a Box or Card with `backdrop` inside it instead." },
      {
        name: "A tab bar derived from the sidebar",
        why: "You declare what a phone gets. A bar holds three to five items, so it cannot be derived from a long sidebar.",
      },
      {
        name: "A tab bar that changes what the sidebar shows",
        why: "A bar item is a place, so it takes a link, not `onClick`. Use a rail to drive a pane.",
      },
      { name: "A floating or stacked presentation value", why: "Floating and stacked are the same idea, spelled `flush={false}`. The frame derives which one you get." },
    ],
    parts: [
      { part: "ShellHeader", blurb: "The full-width top bar, and a real `<header>` landmark. A header that is not full-width belongs inside ShellContent" },
      { part: "ShellRail", blurb: "The narrow icon column that switches sections: a `<nav>`, independent of the sidebar. Give each nav an aria-label when both are present" },
      { part: "ShellSidebar", blurb: "The wide navigation column: a `<nav>`. Untouched, it rests open on a roomy window and closed on a narrow one, with no script deciding" },
      { part: "ShellContent", blurb: "The work area: a real `<main>` that takes whatever room the other panes leave. It scrolls inside the frame, except on a phone, where the page itself scrolls" },
      { part: "ShellRailItem", blurb: "One square in the rail, for a high-level region rather than a row. Icon-only, because narrow is part of what a rail means" },
      { part: "ShellRailList", blurb: "A run of rail squares. A rail usually has two: the regions at the top, and the account and settings squares pinned at the bottom. On a narrow window, where the rail is a tab bar, this run is the pill the places sit in" },
      { part: "ShellRailAction", blurb: "A control in the tab bar that is not a place \u2014 a search, or anything else that opens rather than goes somewhere. It sits outside the pill of tabs as its own pane, a circle at the default radius, because a trigger that looks like a tab promises a destination it does not have" },
      { part: "ShellScroll", blurb: "The one region of a pane that scrolls. Mark it and everything else in the pane pins by being an ordinary child: the pane becomes a column, this takes the leftover room, and the pane stops scrolling itself" },
      { part: "ShellPaneHeader", blurb: "A pane's own header row: one control row at the pane's index, so the chrome stands level with the rail and the app header beside it" },
      { part: "ShellPaneFooter", blurb: "The same row at the pane's other end. With `float` the pane publishes --kui-pane-inset-block-end" },
      { part: "ShellNavGroup", blurb: "A cluster of nav rows under a heading. It carries role=group and points aria-labelledby at its own label, so the heading is announced as well as seen" },
      { part: "ShellNavItem", blurb: "One row of navigation. It stands level with a Button, which a menu row does not, because a menu row lives in a panel opened for a second while this sits beside real buttons all day" },
      { part: "ShellInspector", blurb: "The right-hand detail column: an `<aside>` that rests closed until it is asked for. Pass defaultOpen for one that starts open" },
      { part: "ShellBottom", blurb: "The bottom pane for a terminal or a log: an `<aside>` spanning the full width below the columns, resting closed" },
      {
        part: "ShellTabBar",
        blurb:
          "The tab bar for an app with no rail: three to five places across the bottom of a narrow window, and nothing at all on a wide one, where the sidebar carries the navigation. It is a ShellRail that only ever appears as a bar, and it is a ROW OF PANES rather than one: the ShellRailList is the pill the places sit in, and a ShellRailAction beside it is its own box. It is optional. A Shell is responsive without one, and its sidebar opens as a drawer at every width",
      },
      { part: "ShellTrigger", blurb: "The one thing that crosses the frame: a button that drives a pane by name" },
    ],
  },
  {
    slug: "slider",
    name: "Slider",
    family: "Control",
    spec: "§4, §11",
    declaration: `<Slider defaultValue={40} aria-label="Volume" />`,
    variants: [
      {"name":"range","title":"A range with two handles","why":"Pass an array to draw a handle for each value. `minStepsBetweenValues` keeps the two handles apart, and `format` sets how a screen reader speaks the value."},
      {"name":"controlled","title":"Controlled","why":"Hold the value in your own state to show it elsewhere. `onValueChange` fires during a drag, and `onValueCommitted` fires once when you let go, which suits a save."},
      {"name":"steps","title":"Steps and limits","why":"`min`, `max` and `step` set the values a handle can land on. `largeStep` sets how far Page Up, Page Down and Shift with an arrow key move it."},
      {"name":"disabled","title":"Disabled","why":"A disabled Slider keeps its value visible but does not move. The filled part turns grey, so the setting reads as off, and a line of text says why."},
      {"name":"in-a-form","title":"In a form","why":"Inside a Field, the FieldLabel names the Slider, so it needs no `aria-label`. Give it a `name`, and the value is sent with the form."},
      {"name":"rtl","title":"Right to left","why":"Under `dir=\"rtl\"` the Slider fills from the right and the right arrow key lowers the value. Nothing in the Slider's own props sets the direction."},
    ],
        abstract: "Slider lets someone set a value along a length.",
    overview: ["Slider lets someone set a number along a length, such as a volume, a price or a timeout. Use it when the exact value matters less than where it sits in the range. Use `NumberField` when people need to type an exact number.","The whole strip responds to a press, and it is as tall a target as the `Button` beside it at the same size. The handle is the same size as a `Checkbox` at that size. The Slider fills the width of its container, so set the width on the container.","Pass an array as the value and the Slider draws a handle for each entry. `min`, `max` and `step` set the values a handle can land on, and `minStepsBetweenValues` keeps two handles apart.","The filled part uses the accent colour and the track is neutral. There is no `tone` or `emphasis`, because a value is not an action. A disabled Slider turns the filled part grey.","Each handle is a real range input, so the arrow keys, Page Up, Page Down, Home and End move it. Name a standalone Slider with `aria-label`. Inside a `Field`, the `FieldLabel` names it. Under `dir=\"rtl\"` the Slider fills from the right, and the arrow keys follow that direction."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "A value is not an action, and one slider louder than the next says nothing." },
      {
        name: "`orientation`",
        why: "A vertical slider needs its own designed measurements. It ships when something needs it.",
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    family: "Indicator",
    spec: "§8",
    declaration: `<Spinner />`,
    variants: [
      {"name":"in-a-button","title":"In a button","why":"Set `loading` on a Button to put a Spinner in the icon's place. The label stays, so the button keeps its width and a screen reader still hears what is running."},
      {"name":"with-a-label","title":"With a label","why":"A Spinner is hidden from screen readers, so put the state in words beside it. `role=\"status\"` makes a screen reader announce those words when they appear."},
      {"name":"colour","title":"Colour from the text","why":"A Spinner has no colour prop. It draws in the colour of the text it sits in, so a tone on the surrounding Text also colours the Spinner."},
      {"name":"sizes","title":"Sizes","why":"Inside a control, the Spinner is the size of that control's icon. This row shows a loading Button at each of the four sizes."},
    ],
        abstract: "Spinner shows that something is busy.",
    overview: ["Spinner shows that something is busy. It draws eight spokes with a fading trail, and it turns one spoke at a time. Use it for a short wait where you cannot say how much work is left.","Use `Progress` instead when you know how far the work has gone, such as an upload at 40%. Use the `loading` prop on `Button` when the wait belongs to an action, because the button then marks itself busy and keeps its label.","A Spinner draws in the colour of the text around it, so it matches its context in every tone and in light and dark mode. Inside a control it is the size of that control's icon, so you can swap an icon for a Spinner and nothing moves. On its own it uses the icon size of a size 2 control.","The spinning costs one composited transform and no JavaScript. The wrapper element turns, not the SVG, so the Spinner keeps moving even when the main thread is busy. When the operating system asks for reduced motion, the Spinner turns more slowly but does not stop.","A screen reader does not announce a Spinner. Put the state in words next to it, or use a control that marks itself busy, such as a `Button` with `loading`."],
    refusals: [
      {
        name: "A size prop",
        why: "It fills the icon box, so swapping it for an icon shifts nothing. Alone, it uses the size-2 box.",
      },
      { name: "A colour prop", why: "It draws in currentColor, which is correct in every context without a token." },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    family: "Layout",
    spec: "§3",
    declaration: `<Stack gap="3" align="start">
  \u2026
</Stack>`,
    variants: [
      {"name":"gap","title":"Gaps","why":"`gap` sets the space between every child. A small step suits items that belong together, such as the lines of one address. A larger step suits groups that are separate."},
      {"name":"alignment","title":"Alignment","why":"`align` sets where each child sits across the column. The default, `stretch`, makes each child as wide as the Stack. Use `flex-start` to keep buttons at their own width."},
      {"name":"nested-groups","title":"Nested groups","why":"Put a Stack inside a Stack to make groups. Use a smaller gap inside each group and a larger gap between groups. The difference in space shows people which items belong together."},
      {"name":"with-separators","title":"With separators","why":"Place a `Separator` between items to draw a line. Put each line where you want it, so the first item has no line above it. The Stack gap sets the space on both sides of the line."},
      {"name":"responsive","title":"Responsive","why":"Give `gap` or `align` an object with a value for each breakpoint. Here the gap grows and the buttons stop stretching on a wider container. The breakpoints measure a container, not the window."},
      {"name":"render","title":"As a section","why":"Use `render` to make the Stack a real element with a meaning, such as a `section` with a heading. The column and the gap stay the same. Only the element changes."},
    ],
        abstract: "Stack is Box with a column flex preset.",
    overview: ["Stack puts its children in a column, one under the other, with a gap between them. It is a Box with a column layout already set, so it has no CSS of its own.","Use a Stack for most vertical layouts: a form, a list of settings, a card body, or a group of paragraphs. Use a Flex when the children sit side by side, and a Grid when they sit in rows and columns.","Set the space between children with `gap`. The value is a step on the space scale, not a length, and the theme and the density setting decide what each step is worth. A component inside a Stack never sets its own outer margin, so the Stack decides all the space between them.","Stack has no `direction`, `wrap`, `gapX` or `gapY`, because a single column has one direction and one gap. If you need a row, use Flex. To put a rule between items, place a Separator where you want it. There is no `dividers` prop.","Most props take a responsive value, such as `{ initial: \"3\", md: \"5\" }`. The breakpoints measure the nearest container you mark with `container`, or the whole app if there is none. Use `render` to make the Stack a different element, such as a `section` or a `form`. The layout stays the same."],
    refusals: [{ name: "`dividers`", why: "Place a Separator where you want a rule, rather than a prop that guesses." }],
  },
  {
    slug: "segmented-control",
    name: "SegmentedControl",
    family: "Control",
    spec: "§4, §11, §19, §26",
        abstract: "SegmentedControl shows a few options at once and lets someone pick one.",
    overview: ["SegmentedControl shows a few options side by side and lets someone pick one, such as a list or grid view. Use it for two to five short options that change a setting in place.","Use `Tabs` instead when the choice switches the content below it. Use a `ToggleGroup` of `Toggle`s when people can pick more than one option. Use `Select` when there are too many options to show at once.","It is built as a radio group, not a row of toggle buttons, because picking one of several is what a radio group is. A screen reader announces it as a radio group, and the arrow keys move the choice. Give the control an `aria-label` that names the setting.","The control is as tall as a `Button` beside it at the same size. The selected option sits on a raised tile that slides to the new position when the choice changes. There is no `tone` or `emphasis`, so every segment has the same weight.","Set `backdrop` when content passes behind the control, and it uses the theme's material. A `<Box backdrop>` region does the same for a whole toolbar."],
    declaration: `<SegmentedControl defaultValue="grid" aria-label="View">
  <SegmentedItem value="list">List</SegmentedItem>
  <SegmentedItem value="grid">Grid</SegmentedItem>
</SegmentedControl>`,
    variants: [
      {"name":"with-icons","title":"With icons","why":"A segment can hold an icon beside its label. The icon is the size set for the control, so every segment keeps the same height."},
      {"name":"icon-only","title":"Icon-only segments","why":"A segment with only an icon needs `aria-label`, so a screen reader can name the option. Use icons that people already know, such as list and grid."},
      {"name":"controlled","title":"Controlled","why":"Hold the value in your own state with `value` and `onValueChange` when the choice changes something else on the screen, such as a price."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on one SegmentedItem to block that option, or on the SegmentedControl to block the whole control. The options stay visible either way."},
      {"name":"in-a-toolbar","title":"In a toolbar","why":"At the same size, a SegmentedControl is as tall as the TextField and Button beside it. A row of mixed controls lines up with no extra work."},
    ],
    topics: [
      { title: "Picking one of a few", symbols: ["SegmentedControl", "SegmentedItem"] },
    ],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "The control has one fixed colour. A segment louder than the others breaks it.",
      },
      {
        name: "An exported thumb",
        why: "The sliding tile is placed for you. Exporting it would make you place it yourself.",
      },
      {
        name: "Multi-select",
        why: "Choosing several options is a ToggleGroup of Toggles. A segmented control holds one answer.",
      },
      {
        name: "`nativeButton` and `render`",
        // SCOPED TO THE SEGMENT (2026-09-07, the audit). The sentence is about a segment, and
        // an unscoped refusal reaches the root — where `render` is real and `tsc` accepts it,
        // so the two channels gave opposite verdicts on `<SegmentedControl render={<Stack/>}>`.
        on: ["SegmentedItem"],
        why: "Setting `nativeButton` stops Space from selecting a segment.",
      },
      { name: "`readOnly`", why: "HTML has no read-only selection control, so there is no appearance to copy." },
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
    declaration: `<Switch id="notify" defaultChecked />
<Text render={<label htmlFor="notify" />}>Notifications</Text>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the track height and width, from 1 to 4. At each size the switch is one step larger than a Checkbox. Use size 2 unless the row around it uses another size."},
      {"name":"controlled","title":"Controlled","why":"Pass `checked` and `onCheckedChange` to keep the state in your app. Use this when other parts of the screen change with the switch. Leave them out and use `defaultChecked` when nothing else depends on the value."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` to stop a switch from changing. The track dims, and the thumb stays visible so people can still see the value. Tell people why, near the switch, when the reason is not clear."},
      {"name":"with-description","title":"With a description","why":"Put each switch in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The label and the description connect to the switch for you. The outer `FieldLabel` names the whole group."},
      {"name":"settings-card","title":"A settings card","why":"Put the label on the start side and the switch on the end side of each row. Use a `Separator` between rows. This is the common layout for a list of account settings."},
      {"name":"in-a-form","title":"In a form","why":"Give the switch a `name`, and it sends a value with the form. A checked switch sends `on`, and an unchecked switch sends nothing. Use a form when the settings save together."},
    ],
        abstract: "Switch turns one thing on or off.",
    overview: ["A Switch turns one setting on or off. The change applies at once, with no save button. Use a Checkbox when the choice waits for a form to be sent.","The track is one step larger than a Checkbox at the same size, and the width follows the same size. When it is off, the track is a neutral channel with no visible border. When it is on, the track fills with the accent colour. These colours are fixed. There is no `tone` or `emphasis`.","The label is a separate element, not a child. Put a `Text` rendered as a `label` beside it, with `htmlFor` set to the Switch's `id`. Inside a `Field`, use `FieldItem` with `FieldLabel` and `FieldDescription`, and the names connect for you.","A screen reader announces a Switch as a switch that is on or off. Space changes it. A hidden checkbox goes with it, so it sends its `name` and value with a form. Its tappable area extends past the track, to the size a control of the same size would occupy.","`disabled` stops it from changing. There is no `readOnly`, because HTML has no read-only switch. Use `disabled` for that case. Density does not change a Switch. A pointer that is coarse, such as a finger, makes it larger."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "It is neutral when off and accent when on. That is fixed, not a choice." },
      { name: "`children`", why: "The label is a sibling, as with every mark. The row sets the distance between them." },
      {
        name: "`readOnly`",
        why: "A read-only switch is just a disabled one. Use `disabled`, as with Checkbox.",
      },
    ],
  },
  {
    slug: "table",
    name: "Table",
    family: "Type",
    spec: "§11, §36",
        abstract: "Table lays data out in rows and columns, as the real table element, inside a box that scrolls sideways when the columns need more room than the page has.",
    overview: ["A Table shows data in rows and columns. It renders the real `table` element, so a screen reader can move by row and by column and read the header for each cell.","It draws the lines between rows, the space inside each cell and the header in a muted colour. The last row has no line under it. Its rows do not react to the pointer. A row that people can select or open needs a different component.","The table sits inside a box that scrolls sideways when the columns need more room than the page has. The box can take focus only when it scrolls. Name it with `aria-label` or `aria-labelledby`, and a screen reader announces it as a named region. A `TableCaption` names the table itself.","`size` sets the cell padding and the text size, from 1 to 4. The cell padding also follows the density setting. The outer edge of the first and last columns has no extra padding, so the text lines up with the content around the table.","Use `align` on `TableHead` and `TableCell` to set `start`, `center` or `end`. Put words at the start and numbers at the end. A table has no `tone` or `emphasis`. Put a tone on a `Text` or a `Chip` in a cell instead. For sorting, put a Button in a header cell and sort the rows in your own code."],
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
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the cell padding and the text size together. Use size 2 for most tables. Use size 1 for dense data and size 3 or 4 for a short table that needs more space."},
      {"name":"alignment","title":"Alignment","why":"Set `align` on the header cell and on each body cell in the same column. Put numbers at the end so the digits line up. Use `center` for a short value such as a count."},
      {"name":"wide","title":"Wide columns","why":"When the columns are wider than the space, the table scrolls sideways inside its own box. The page around it does not get wider. Give the table a name so the scrolling box has a name when it takes focus."},
      {"name":"labelled-by-heading","title":"Named by a heading","why":"Set `aria-labelledby` to the `id` of a visible heading. A screen reader then uses the heading as the name of the table region. Use `aria-label` when there is no visible heading."},
      {"name":"with-actions","title":"With actions","why":"Put a Button in a cell for an action on that row. Give each icon-only button an `aria-label` that names the row, such as the file name. The row itself does not react to a press."},
      {"name":"in-a-card","title":"In a card","why":"Put a table in a Card with a heading above it. Use `Chip` in a cell to show a status with a tone. The table has no fill of its own, so it uses the card's fill."},
    ],
    topics: [
      { title: "Laying out the table", symbols: ["Table", "TableHeader", "TableBody"] },
      { title: "Rows and cells", symbols: ["TableRow", "TableHead", "TableCell"] },
      { title: "Naming it", symbols: ["TableCaption"] },
    ],
    refusals: [
      {
        name: "A ScrollArea around it",
        why: "The wrapper scrolls natively and is focusable only when columns overflow. A ScrollArea needs a stated height.",
      },
      { name: "Hover, selection and a press on rows", why: "An interactive row needs a keyboard and a name. It will ship as its own component." },
      { name: "`tone` and `emphasis`", why: "A table has no meaning of its own to colour. Put a tone on a cell's Text or Chip." },
      { name: "A sticky header", why: "No component here owns its position. Put a tall table in a ScrollArea and pin the header there." },
      { name: "Sorting and column controls", why: "Sorting is state and keyboard work. Put a Button in the header; the table draws rows in your order." },
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
    overview: ["Tabs show a set of views and mark the one that is open. A person selects a tab, and the panel for that tab shows under the bar. Only one panel shows at a time.","Use Tabs to switch between views of the same subject, such as the overview, activity and settings of one project. Use a SegmentedControl to choose a value that changes the content in place, such as a list or grid view. Use a Menu for actions.","The active tab has full-strength text and a line under it in the accent colour. The other tabs have muted text. The active tab has no fill and no heavier weight, because a heavier weight is wider and the bar would move each time the tab changes. The line slides to the new tab.","Set `size` on `TabsList`, and every tab in the bar uses it. There is no `tone`, `emphasis` or `material` prop. Tabs are horizontal only.","A screen reader announces a tab list, tabs and tab panels. Tab moves focus into the bar, and the arrow keys move focus between tabs. Enter or Space opens the focused tab. Use `render` on a `TabsTab` to make it a link when each tab is a separate page. Set `disabled` on a tab that people cannot open."],
    declaration: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
  </TabsList>
  <TabsPanel value="overview">\u2026</TabsPanel>
  <TabsPanel value="activity">\u2026</TabsPanel>
</Tabs>`,
    variants: [
      {"name":"with-panels","title":"With panels","why":"Give each `TabsPanel` the same `value` as its tab. The panel for the active tab shows, and the others are hidden. A panel has no fill or border of its own."},
      {"name":"sizes","title":"Sizes","why":"Set `size` on `TabsList` to change the height and text of every tab in the bar. Use size 2 in most places. Match the size to the controls that sit near the bar."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onValueChange` to keep the active tab in your app. Use this when something outside the bar must change the tab, such as a button or the URL. Use `defaultValue` when nothing else depends on it."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on a `TabsTab` to stop people from opening it. The tab dims and the arrow keys skip it. Tell people elsewhere why the view is not available."},
      {"name":"as-links","title":"As links","why":"Use `render` with an `a` element when each tab is a separate page. Each tab is then a real link with an `href`. Set the active tab from the current page."},
      {"name":"in-a-card","title":"In a card","why":"Put Tabs in a Card to switch views inside one object. The bar has no fill, so it uses the card's fill. The line under the bar runs the full width of the card's content."},
    ],
    topics: [
      { title: "Switching between places", symbols: ["Tabs", "TabsList", "TabsTab"] },
      { title: "What a tab reveals", symbols: ["TabsPanel"] },
    ],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "Which tab is active is a state, not a loudness you pick.",
      },
      {
        name: "TabsTrigger and TabsContent",
        why: "Here a trigger opens a floating layer, and a tab opens nothing. `TabsPanel` matches the role it announces.",
      },
      {
        name: "`material`",
        why: "A tab bar paints no pane, so there is nothing for glass to blur.",
      },
      { name: "An exported indicator", why: "The indicator is structure, not API. If you had to place it, you would forget it." },
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
    overview: ["`Toggle` is a button that stays pressed. Use it for bold in a formatting bar, a filter that is on or off, or a panel that you show or hide.","It looks and behaves like a `Button`, with one difference: the pressed state sets its emphasis. Off is quiet, and on is the medium fill. So there is no `emphasis` prop. `tone` gives the pressed state a meaning, such as `destructive` for a toggle that blocks something.","Use `ToggleGroup` for several toggles that share one value array, such as bold, italic and underline. Each toggle in the group turns on and off by itself. The group draws nothing, so use `render` to make it a `Flex` or a `Stack`.","Use a `SegmentedControl` when the person must pick exactly one of several options. Use a `Switch` for a setting that is saved, and a `Checkbox` for an option in a form. Use a `Button` for an action that runs and finishes.","A screen reader announces a toggle as a button with a pressed or unpressed state. Space and Enter change the state. In a `ToggleGroup`, the whole group is one tab stop and the arrow keys move focus between the toggles without pressing them. Set `orientation` to `vertical` when the toggles run in a column."],
    declaration: `<ToggleGroup aria-label="Format" defaultValue={["bold"]}>
  <Toggle value="bold" aria-label="Bold">{icon}</Toggle>
  <Toggle value="italic" aria-label="Italic">{icon}</Toggle>
</ToggleGroup>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` picks the same four steps that `Button` uses. A toggle and a button at the same `size` are the same height. Use size 2 in most places."},
      {"name":"icon-only","title":"Icon only","why":"Set `iconOnly` to make the toggle square around one icon. An icon-only toggle must have an `aria-label`, because the icon has no text for a screen reader. This is the usual formatting bar."},
      {"name":"with-icons","title":"With icons","why":"Put an icon in `leading` or `trailing` beside the label. The theme sizes the icon and the gap between it and the text."},
      {"name":"tones","title":"Tones","why":"`tone` sets what the pressed state means. The text and the icon take the colour of the tone, and the fill stays grey. Use `destructive` when turning the toggle on blocks or removes something."},
      {"name":"bordered","title":"Bordered","why":"Set `bordered` to add a thin border around each toggle. The border stays when the toggle is pressed. Use it for a row of filters that must be visible before anyone presses them."},
      {"name":"controlled","title":"Controlled","why":"Pass `pressed` and `onPressedChange` to keep a single toggle's state in your app. For a group, pass `value` and `onValueChange` with an array of the pressed values."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on a toggle to stop presses and grey it out, in either state. Set `disabled` on a `ToggleGroup` to disable every toggle in it."},
      {"name":"vertical","title":"Vertical group","why":"Set `orientation=\"vertical\"` on a `ToggleGroup` when the toggles run in a column. The up and down arrow keys then move focus. The layout comes from the `Stack` you pass to `render`."},
    ],
    topics: [
      { title: "A button that stays pressed", symbols: ["Toggle"] },
      { title: "Sharing one state across several", symbols: ["ToggleGroup"] },
    ],
    refusals: [
      { name: "`emphasis`", why: "The pressed state sets the emphasis: off is quiet, on is medium. A choice could make off look louder." },
      { name: "`loading`", why: "A toggle flips and never waits. Use a Button for a running job and a Switch for a saved setting." },
      { name: "A single-select group", why: "Picking one of several is a radio group. Use `SegmentedControl` for that." },
      { name: "`render`", on: ["Toggle"], why: "The pressed state drives the element's attributes, so swapping the element would lose it. A toggle is a button." },
    ],
    parts: [
      { part: "ToggleGroup", blurb: "The shared state for a set of toggles: one value array, roving arrow keys, a group announcement. It draws nothing, so make it the layout with render" },
    ],
  },
  {
    slug: "split-button",
    name: "SplitButton",
    family: "Control",
    spec: "§11, §53",
    declaration: `<SplitButton
  menuLabel="More merge options"
  menu={<MenuItem>Squash and merge</MenuItem>}
>
  Merge
</SplitButton>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the height of both halves together, from 1 to 4. The menu that opens uses the same size. Use size 2 unless the SplitButton sits beside controls of a different size."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` sets how loud the button is: `loud`, `medium` or `quiet`. Use `loud` for the main action on the screen, and only once. Add `bordered` to a quiet SplitButton when it needs a visible edge."},
      {"name":"tones","title":"Tones","why":"`tone` gives the button a meaning, and both halves get it. Use `destructive` when the common action removes something. Set the same tone on the dangerous menu items, so the menu says the same thing as the button."},
      {"name":"with-icon","title":"With an icon","why":"Put an icon before the label with `leading`. The icon goes on the action half only. The chevron half always shows the chevron, so it has no icon slot."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` to stop both halves at once. Neither half can be pressed, and the menu cannot open. Put the reason next to the button, because a disabled control does not explain itself."},
      {"name":"menu-groups","title":"Menu groups","why":"`menu` holds anything a `MenuContent` holds. Use `MenuGroup` and `MenuLabel` to sort a long list of alternatives. Give a destructive item its own `tone`."},
    ],
        abstract: "SplitButton is a button with its alternatives one press away: the label runs the common action, the chevron opens the rest.",
    overview: ["A SplitButton runs one common action and keeps the other actions one press away. The label half runs the action. The chevron half opens a Menu with the alternatives.","It is two Buttons drawn as one box. Both halves get the same size, tone and emphasis, so they look like one control. Each half is its own button with its own focus stop, and each one presses on its own.","Use a SplitButton when one action is right most of the time and a few close variants are sometimes right, such as merge, squash and merge, and rebase and merge. If no action is more common than the others, use a Menu on a plain Button. If the actions are not variants of one task, put separate Buttons in a Toolbar.","The chevron half has no words, so you must give it a name with `menuLabel`. A screen reader announces that name, and it tells people that the half opens a menu. The menu opens under the whole button and lines up with its end edge.","The fill changes colour on hover and press, but the shape does not move. Moving one half on its own would break the seam between the halves. The theme sets the colours, the height and the corner, the same as for a Button at the same size."],
    refusals: [
      { name: "`iconOnly`", why: "The label is the common action. Without words, use two buttons in a toolbar instead." },
      { name: "Travel on hover and press", why: "Moving half a button alone would tear it at the seam. The fill still reacts; the shape stays put." },
      { name: "`render`", why: "It renders two elements and a menu, so neither half can become a different element alone." },
    ],
  },
  {
    slug: "carousel",
    name: "Carousel",
    family: "Surface",
    spec: "\u00a710, \u00a755",
        abstract: "Carousel is a row that scrolls sideways, settles on its items, and has a button each way.",
    overview: ["Carousel is a row of items that scrolls sideways and stops on each item. It has a previous button and a next button, and each button is disabled when there is nothing more in its direction. What you put inside is yours: cards, covers, frames or a row of anything.","Use a carousel for a long row of peers that you browse, such as templates, recent projects or covers. When every item fits in the space, use a Grid or a Flex instead. For a vertical list that scrolls, use a ScrollArea. The carousel does not play on its own or loop.","Put `CarouselRail` inside `Carousel`, and mark each stopping point with `CarouselItem`. The component sets no width, gap or aspect ratio for the items. Set the item width yourself, and put the items in a Flex to set the gap. Give the rail a bounded width, and set `fade` when it runs to the edge of a pane.","Place `CarouselPrevious` and `CarouselNext` anywhere inside `Carousel`: in a row above the rail, or at each end of it. Put an arrow icon in each button. No scrollbar is drawn, because the buttons and the fade already show that there is more.","The scrolling is the browser's own, so the wheel, the trackpad, touch and the keyboard all work. A button press moves the rail by one item. The rail scrolls smoothly unless the person asks their system to reduce motion.","Carousel renders a group with the role description \"carousel\". Give it a name with `aria-label`, or point `aria-labelledby` at the heading above it. The buttons are named \"Previous\" and \"Next\" by default, and each one says which rail it moves. A button at the end of the rail stays focusable, so keyboard focus does not jump away. In a right-to-left page the rail starts on the right."],
    declaration: `<Carousel aria-label="Covers">
  <CarouselRail fade>
    <Flex gap="4">
      <CarouselItem>\u2026</CarouselItem>
      <CarouselItem>\u2026</CarouselItem>
    </Flex>
  </CarouselRail>
  <CarouselPrevious>‹</CarouselPrevious>
  <CarouselNext>›</CarouselNext>
</Carousel>`,
    variants: [
      {"name":"with-icons","title":"With icons","why":"The package ships no icons, so put your own arrows in `CarouselPrevious` and `CarouselNext`. Set `aria-label` when \"Previous\" and \"Next\" are not specific enough."},
      {"name":"labelled-by-heading","title":"Named by the heading above it","why":"Point `aria-labelledby` at the heading's `id`, so the name a screen reader hears is the text you already show. Here each item is a Card rendered as a link."},
      {"name":"buttons-at-the-ends","title":"Buttons at each end of the rail","why":"Put the buttons on each side of the rail in a Flex. Wrap the rail in a Box with `flexGrow=\"1\"` and `minWidth=\"0\"`, so it takes the space between them and can scroll."},
      {"name":"rtl","title":"Right to left","why":"Set `dir=\"rtl\"` on any ancestor. The rail starts on the right, and Previous still moves back toward the first item. Point the arrows in the reading direction."},
    ],
    topics: [
      { title: "Naming the whole thing", symbols: ["Carousel"] },
      { title: "What scrolls", symbols: ["CarouselRail", "CarouselItem"] },
      { title: "Moving it", symbols: ["CarouselPrevious", "CarouselNext"] },
    ],
    refusals: [
      { name: "Autoplay", why: "Content that moves on a timer loses your place. The rail moves only when a person moves it." },
      { name: "Looping", why: "A loop needs cloned items or a false scroll position. Real ends let the buttons show there is no more." },
      { name: "Drag to scroll", why: "Touch and trackpad already drag. On a mouse, dragging would break text selection and image drag." },
      { name: "A width, a gap or an aspect for the items", why: "Size and space the items yourself. The component only marks where scrolling settles." },
      { name: "`orientation`", why: "A carousel is a horizontal rail. For a vertical list that scrolls, use a ScrollArea." },
      { name: "Dots under the rail", why: "Dots repeat what the rail shows, need a name per item, and stop being countable past a few." },
    ],
    parts: [
      { part: "CarouselRail", blurb: "What scrolls: a ScrollArea that settles on items. Give it a bounded box, and `fade` if it runs to the edge of a pane" },
      { part: "CarouselItem", blurb: "One place scrolling can settle. It states no size \u2014 the layout between the rail and the items is yours" },
      { part: "CarouselPrevious", blurb: "Back one item. It goes dead at the start, in the spelling that keeps it focusable" },
      { part: "CarouselNext", blurb: "On one item. It goes dead at the end, the same way" },
    ],
  },
  {
    slug: "button-group",
    name: "ButtonGroup",
    family: "Control",
    spec: "§11, §54",
    declaration: `<ButtonGroup aria-label="Range">
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ButtonGroup>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` on the group sizes every button inside it. A button that sets its own `size` keeps its own value, but mixed sizes in one group rarely look intended."},
      {"name":"icon-only","title":"A group of icon buttons","why":"Icon-only buttons make a compact set of formatting actions. Give each button an `aria-label`, and give the group its own label as well."},
      {"name":"bordered","title":"Quiet buttons with a border","why":"Quiet buttons with `bordered` make a light group that suits secondary actions. The borders of two neighbouring buttons meet on one shared line."},
      {"name":"pagination","title":"Previous and next pages","why":"Disable the button that has nowhere to go. A disabled member keeps its place in the group, so the shape of the group stays the same on every page."},
    ],
        abstract: "ButtonGroup draws a set of related Buttons as one control.",
    overview: ["ButtonGroup joins a set of related Buttons into one control. The outer corners stay round, the inner corners become square, and a thin line separates each pair of buttons. Each button still presses on its own.","Use a ButtonGroup for a small set of actions on the same object, such as text styles or page navigation. To let people pick one value from a set, use a SegmentedControl. For buttons that stay pressed, use a ToggleGroup. For one main action with a menu of related actions, use a SplitButton.","Put Buttons as direct children of the group. Set `size` on the group to size every button that does not set its own size. Each Button sets its own `tone`, `emphasis` and `bordered`. Bordered buttons share one line where they meet.","The buttons in a group do not move when you hover or press them, because one button moving alone would break the shape of the group. The fill still changes on hover and press.","ButtonGroup renders an element with `role=\"group\"`. Give it an `aria-label`, so a screen reader can say what the buttons do together. Tab moves to each button in turn. If you want the arrow keys to move between buttons instead, put the buttons in a Toolbar."],
    refusals: [
      { name: "A separator part", why: "The group draws the line between buttons itself, so you never place separators by hand." },
      { name: "Travel on hover and press", why: "One button moving alone would tear the group apart. The fill still changes; the geometry stays put." },
      { name: "`tone` and `emphasis` on the group", why: "Each Button sets its own `tone` and `emphasis`. The group only joins them." },
    ],
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    family: "Surface",
    spec: "§11, §20, §32",
        abstract: "Tooltip shows the name of a control when a pointer rests on it.",
    overview: ["`Tooltip` shows the name of a control when a pointer rests on it or when the control gets keyboard focus. Use it to name an icon-only button, and to show its keyboard shortcut.","A tooltip must only repeat what the control already says. A tooltip has no touch route and no place in the reading order, so information that appears only in a tooltip is lost to many people. Screen readers do not announce the tooltip. Give the control an `aria-label` with the same name.","Use a `Popover` when the panel holds more than one line of text, a form or a link. Use a `FieldDescription` or a `Notice` for a hint that touch users must also see. `TooltipContent` takes a string only, so write a shortcut as text, for example `Undo ⌘Z`.","The tooltip uses inverted colours: dark on a light page and light on a dark page. It has no `size`, `tone` or `material`. Set `side` and `align` to choose where it opens. It moves to the other side when there is no room.","Put one `TooltipProvider` near the root of your app. It sets the delay, and it groups the tooltips inside it, so that after the first tooltip opens, the next ones open immediately as the pointer moves along a row. The part names follow shadcn/ui's tooltip (MIT), and Base UI's Tooltip supplies the behaviour."],
    declaration: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button aria-label="Undo" />} />
    <TooltipContent>Undo</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    variants: [
      {"name":"icon-buttons","title":"Icon buttons","why":"Name each icon-only button with an `aria-label`, and repeat the same name in the tooltip. Pass your `Button` to `TooltipTrigger` through `render`. The `TooltipProvider` makes the tooltips open quickly one after another."},
      {"name":"shortcuts","title":"Keyboard shortcuts","why":"Write the shortcut into the tooltip text after the name. Also set `aria-keyshortcuts` on the button, because screen readers do not announce the tooltip."},
      {"name":"sides","title":"Sides","why":"`side` sets where the tooltip prefers to open: `top`, `right`, `bottom` or `left`. If that side has no room, the tooltip opens on the opposite side."},
      {"name":"in-a-toolbar","title":"In a toolbar","why":"Pass a `ToolbarButton` to `TooltipTrigger` so that the button stays part of the toolbar's keyboard. Put the `TooltipProvider` around the whole toolbar so that the tooltips open quickly along the row."},
      {"name":"controlled","title":"Controlled","why":"Pass `open` and `onOpenChange` to control the tooltip from your own state. Use this only for a demonstration or a guided tour. In most apps, let the pointer and focus open it."},
    ],
    topics: [
      { title: "Naming a control", symbols: ["Tooltip", "TooltipTrigger", "TooltipContent"] },
      { title: "Timing, stated once near the root", symbols: ["TooltipProvider"] },
    ],
    refusals: [
      {
        name: "Content that is not a string",
        why: "An inverted panel cannot invert other components. Write shortcuts into the sentence, or use a Popover.",
      },
      {
        name: "A size",
        why: "It cannot see the control it names, so it has one size everywhere.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A tooltip restates a name, so there is nothing for a colour to mean.",
      },
      {
        name: "A delay you set per tooltip",
        why: "Timing belongs to a region, not a label. Wrap your app in one `TooltipProvider` instead.",
      },
      {
        name: "A touch story",
        why: "Phones have no hover, so nothing opens. Put hints touch users need in a `FieldDescription` or Notice.",
      },
      {
        name: "A material",
        why: "It already inverts, the strongest contrast available. Glass on top would add a second edge.",
      },
      {
        name: "An arrow",
        why: "Its edge is already the strongest contrast on screen. Anchoring to the trigger shows where it came from.",
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
    declaration: `<Text size="3" emphasis="medium">Supporting copy.</Text>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` goes from 1 to 9. Steps 2 and 3 are for reading and labels, and the larger steps are for display text. Each step sets the font size, line height and letter spacing together."},
      {"name":"weights","title":"Weights","why":"`weight` is `regular`, `medium` or `semibold`. Use `medium` for a label or a short title in a row. There is no bold, so use a larger size when you need more importance."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` sets how strong the ink is. Use `loud` for the main text, `medium` for supporting details and `quiet` for a short line that matters little. Do not use `quiet` for a full sentence people must read."},
      {"name":"tones","title":"Tones","why":"`tone` gives the text a meaning, such as `success`, `warning` or `destructive`. The emphasis levels still work inside a tone. Use a tone for its meaning, not to decorate the text."},
      {"name":"paragraphs","title":"Paragraphs","why":"Use `render={<p />}` to make each block of text a real paragraph. Text has no margin, so put the paragraphs in a Stack and set the space with `gap`."},
      {"name":"inline-elements","title":"Inline elements","why":"Put `Code`, `Kbd` and `Link` inside a Text. They take the size of the text around them. Use them for a value to type, a key to press and a link."},
    ],
        abstract: "Text sets body copy.",
    overview: ["Text shows body copy, labels and short lines of information. One `size` value sets the font size, the line height and the letter spacing together, so the text always has a line height that suits its size.","Use Text for everything that is not a heading. Use `Heading` for the title of a page, a section or a card. Use `Code` for a value people type, `Kbd` for a key, and `Link` for a link inside a sentence.","`size` goes from 1 to 9 and defaults to 3, the body size. Use 3 for reading and 2 for labels and details. Do not use size 1 on a composed screen. `weight` is `regular`, `medium` or `semibold`. There is no bold. Show the order of importance with size and colour instead.","`emphasis` sets the ink colour: `loud` is full contrast, `medium` is muted and `quiet` is faint. Quiet is below the contrast needed for reading, so use it only for a short line that matters little. `tone` sets a meaning, such as `success` or `destructive`, and the three emphasis levels use that tone's inks.","Without a `tone`, Text uses the ink colour of the surface it is on, so it is correct in light mode, dark mode and on a loud fill. It renders a `span` and has no margin. Use `render` to make it a paragraph or a label, such as `render={<p />}`. Density does not change text size. A coarse pointer, such as a finger, makes the reading sizes larger."],
    refusals: [
      { name: "A colour prop", why: "`tone` states the meaning and the theme picks the colour. Put a raw colour in `style`." },
      { name: "`margin`", why: "Type owns no outer spacing. The margin is zero whatever element `render` names." },
      { name: "`bold` (700)", why: "Semibold is the heaviest weight. Show hierarchy with size and ink colour instead." },
    ],
  },
  {
    slug: "text-area",
    name: "TextArea",
    family: "Control",
    spec: "§4, §11",
    declaration: `<TextArea rows={3} aria-label="Notes" />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the text size and the padding, from 1 to 4. The height comes from `rows`, not from the size. Use size 2 unless the form around it uses another size."},
      {"name":"in-a-form","title":"In a form","why":"Put the TextArea in a `Field` with a `FieldLabel` and a `FieldDescription`. The label and the description connect to the textarea for you. Give it a `name` so it sends its value with the form."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onChange` to keep the text in your app. Here the description shows how many characters are left. `maxLength` stops typing at the limit."},
      {"name":"invalid","title":"Invalid","why":"Set `aria-invalid` to show that the value is wrong. The border and the focus ring change to the error colour. Put the message in a `FieldError` so a screen reader announces it."},
      {"name":"disabled-and-read-only","title":"Disabled and read-only","why":"Use `disabled` when people cannot change the text and the value does not matter now. Use `readOnly` when people must see and copy the text but not change it. A read-only value still goes with the form."},
      {"name":"resize","title":"Resize","why":"People can drag the corner to make a TextArea taller. Set `resize: \"none\"` in `style` to keep the height fixed. Do this only when the layout cannot move."},
    ],
        abstract: "A multi-line text input.",
    overview: ["A TextArea lets people type text that runs over several lines, such as a description, a note or a message. Use a TextField for a single line, such as a name or an email address.","The visible control is a wrapper around the `textarea` element. The wrapper has the border and the fill, and the text scrolls inside it. `ref` goes to the `textarea`. `className` and `style` go to the wrapper. All other props, such as `name`, `value` and `maxLength`, go to the `textarea`.","`rows` sets the starting height in lines. People can drag the corner to make it taller, but not wider. To stop the resize, set `resize: \"none\"` in `style`. The width comes from the container, so there is no `cols` prop. At the `full` radius, the sides get a little more padding than the top and bottom.","A TextArea has no `tone`, `emphasis` or icon slots, because every field in a form should look the same. Put it in a `Field` with a `FieldLabel` so it has a name. Set `aria-invalid` to show an error, and put the message in a `FieldError`.","`disabled` stops typing and dims the text. `readOnly` keeps the text selectable and sends it with the form, and it removes the fill. The focus ring shows when the cursor is inside, however people got there. Set `backdrop` when the TextArea sits over an image or other content, and it becomes glass."],
    refusals: [
      { name: "`emphasis` and `tone`", why: "A form where one field is louder than the next says nothing." },
      { name: "`resize`", why: "It is vertical-only by default. Set `resize` in `style` on the wrapper to change it." },
      {
        name: "`cols`",
        why: "The container sets the width. A width in characters changes at every size and density.",
      },
      {
        name: "`render`",
        why: "It renders two elements, and neither can change without breaking the border or the input.",
      },
    ],
  },
  {
    slug: "text-field",
    name: "TextField",
    family: "Control",
    spec: "§4, §9, §11",
    declaration: `<TextField placeholder="Search" aria-label="Search" />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` picks one of four steps. Each step sets the height, the padding, the corner and the text size. Use the same `size` as the buttons in the same row, so that the field and the buttons line up."},
      {"name":"with-icons","title":"With icons","why":"Put an icon, a unit or a short hint in `leading` or `trailing`. A click on the adornment puts the caret in the input. The slots are empty by default, so a field without them has no extra space."},
      {"name":"password","title":"Password with a reveal button","why":"A `trailing` slot can hold a real `Button`. The button keeps its own focus and click, and the theme makes it fit inside the field. Change `type` between `password` and `text` to show or hide the value."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onChange` to keep the text in your own state, as with a native input. This example filters a list as you type and shows a clear button only when the field has text."},
      {"name":"in-a-form","title":"In a form","why":"Wrap each field in a `Field` with a `FieldLabel`, and add a `FieldDescription` when the person needs more information. Native props such as `name`, `type` and `required` go to the input, so the form submits the value as usual."},
      {"name":"invalid","title":"Invalid","why":"Set `aria-invalid` to show the error border. Inside a `Field`, add a `FieldError` to say what is wrong. The screen reader announces the error text when it appears."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on a `Field` or on the field to stop all input and grey out the control. Use `readOnly` when the value must stay selectable and still submit with the form."},
    ],
        abstract: "TextField is a single-line text input.",
    overview: ["`TextField` is a single-line text input. Use it for a name, an email address, a search query or any other short value that you type on one line.","Use a `TextArea` when the value can run to several lines, such as a comment or a description. Use a `NumberField` for a number with steppers, and a `Select` or `Combobox` when the value comes from a fixed list.","The visible control is a wrapper around a native `<input>`. The wrapper draws the border, so the field can hold an icon or a button inside it through the `leading` and `trailing` slots. `ref` goes to the input, so `.focus()` and `.select()` work as usual. `className` and `style` go to the wrapper, so a `width` sizes the whole field.","Put a `TextField` inside a `Field` to give it a label, a description and an error message. The `Field` connects them to the input for screen readers and sets one `size` for the whole group. A field has no `tone` or `emphasis`, because one field in a form is never more important than the next.","The theme sets the height, the corner and the padding. `size` picks a step on the same scale that `Button` uses, so a field and the button beside it are the same height. Set `aria-invalid` or place it in an invalid `Field` to show an error border, and set `disabled` or `readOnly` to stop edits.","The input is a real `<input>`, so the keyboard, autofill, form submission and screen readers behave as they do for any native field. On a touch screen, the text is never smaller than 16 pixels, so the browser does not zoom in when you tap the field."],
    refusals: [
      { name: "`emphasis` and `tone`", why: "Loudness ranks actions, and one field louder than the next says nothing." },
      {
        name: "`render`",
        why: "It renders two elements, so `render` could only silently mean one of them.",
      },
    ],
  },
  {
    slug: "theme",
    name: "Theme",
    family: "Layout",
    spec: "§5, §7, §12, §19",
    declaration: `<Theme appearance="inherit" density="default" radius="full" depth="elevated">
  \u2026
</Theme>`,
    variants: [
      {"name":"appearance","title":"Light and dark","why":"`appearance` sets light or dark for everything inside the theme. Use `inherit` at the root when a script sets the mode on `<html>` before the first paint. Set `light` or `dark` to fix one section against the rest of the page."},
      {"name":"density","title":"Density","why":"`density` sets how much space the controls and layouts get. `compact` makes controls shorter and gaps smaller, and `comfortable` makes them larger. Text and icons keep their size."},
      {"name":"radius","title":"Radius","why":"`radius` sets the corners for the whole app, from square `none` to round `full`. Each level has its own values for each kind of component. Radios, switch thumbs and slider thumbs keep their round shape at every level."},
      {"name":"depth","title":"Depth","why":"`depth` sets whether cards and raised buttons cast a shadow. `elevated` is the default, and `flat` removes the shadows. There is no shadow prop on a component, so set this one time for the app."},
      {"name":"contrast","title":"High contrast","why":"`contrast=\"high\"` makes borders, fills and quiet text darker so that they meet the contrast minimums. Set `appearance` on the same `Theme`. Compare the field border, the checkbox and the quiet caption in the two columns."},
      {"name":"size","title":"Default size","why":"`size` on a `Theme` sets the step every control uses when it has no `size` of its own. A `size` on a single control still wins, as the last button shows. Text components keep their own scale."},
      {"name":"nested","title":"Nested themes","why":"A nested `Theme` changes only the settings you give it. Here a dark, compact panel with small corners sits inside the default theme. Put a `Surface` inside the nested theme so that the panel gets its own background colour."},
    ],
        abstract: "Theme is where an app sets its identity.",
    overview: ["`Theme` holds the settings that every component in your app uses. It has eight settings: `appearance`, `density`, `radius`, `contrast`, `pointer`, `depth`, `material` and `size`. Each setting changes the tokens for everything inside the theme.","Put one `Theme` at the root of your app. Every setting answers a question once, at the root, so that each screen does not have to answer it again. The default values are suitable for most apps, so set only the ones you want to change.","Themes nest. A `Theme` inside another one changes only the settings you give it, and it keeps the rest from the theme around it. Use a nested theme for a dark panel inside a light page, or for a compact data table inside a default app.","`size` sets the step every component uses when you give it no size of its own, so an app whose controls are size 3 says so one time. A `size` on a component still wins. It does not change text: `Text` and `Heading` use a scale with nine steps, not four, and `Code`, `Kbd`, `Badge` and `Chip` take the size of the line they sit in.","`contrast=\"high\"` is an accessibility setting. It raises the contrast of borders, fills and text so that they meet the contrast minimums. Put it on the same element as an `appearance` that is not `inherit`. If you leave `contrast` unset, the theme follows the operating system setting `prefers-contrast: more`.","A `Theme` renders a `<div>` to carry its settings. Use `render` to put the theme on an element you already have. Never put the root theme on `<body>` or `<html>`, because floating panels such as menus and dialogs attach to the body."],
    refusals: [
      {
        name: "An `accentColor` prop",
        why: "Accent is one app-wide hue set in the config. A runtime prop would ship every colour scale.",
      },
      {
        name: "A scale prop",
        why: "The factor exists but the prop is deferred. It will ship as designed steps when a real need appears.",
      },
      {
        name: "An elevation axis",
        why: "Deleted, because nothing varied it per component. Use `depth` instead.",
      },
      {
        name: "A look axis",
        why: "Deleted, because its values converged and the rest went unused. There is now one surface appearance.",
      },
    ],
  },
];

/**
 * ALPHABETICAL, BY THE NAME A READER SEES (2026-09-07, Kushagra: "can we arrange the pages to be
 * purely alphabetically").
 *
 * The literal above is grouped — `Surface` beside `Button`, `Chip` beside `Badge` — which reads
 * as an argument about which components are relatives, and that argument is the reference's own
 * prose rather than its index. An index has one job: let a reader find a name they already have.
 *
 * SORTED HERE, ONCE, rather than by rewriting the literal, because the order then has a single
 * home that cannot rot: every consumer — the sidebar, the walk through the band, the search
 * index, the coverage laws — reads this list, and a hand-kept order is a thing 54 blocks can
 * silently fall out of on the next component.
 *
 * By `name` and not `slug`: `AlertDialog` is what the page is called and `alert-dialog` is what
 * the URL is, and a reader scanning the sidebar is reading the first.
 */
export const ENTRIES: Entry[] = [...DECLARED].sort((a, b) => a.name.localeCompare(b.name));

export const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));
