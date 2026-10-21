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
  /**
   * The job the person is doing when this component is on screen. Families are named for the
   * job, not for how the thing is built: Select floats like a Popover, but picking a value is
   * Choose and has nothing in common with a panel. An agent arriving with a problem finds the
   * candidates here before it knows any names.
   */
  job: Job;
  /**
   * A leaf does one thing. A pattern coordinates several parts and owns the decisions that job
   * always needs, so the caller doesn't make them again.
   */
  level: "leaf" | "pattern";
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
    job: "Read",
    level: "leaf",
    spec: "§11, §21, §37",
        abstract: "Accordion stacks sections under headings that people press to show or hide the content.",
    overview: ["An accordion stacks sections one under the other. Each section has a heading that people press to show or hide its content. By default only one section is open at a time, and opening another closes it. Set `multiple` to let several sections stay open.","Use an accordion when a page has several sections and people usually need only one or two of them, such as a list of questions and answers or groups of settings. Use `Tabs` when people switch between views of one thing, and use `NavTree` for navigation with nested levels.","Each heading is as tall as a Button of the same size, and its label underlines under the pointer. The chevron points toward the reading direction while the section is closed and turns down while it is open. The text in a panel starts under the heading's label, so the two line up.","The accordion draws only the thin lines between its sections, with no box around them. Put it in a Card when the sections need an edge. `size` sets the headings and the panel text, and if you leave it unset, the accordion uses the size of the nearest Theme.","Each heading is a real heading element with a button inside it, so a screen reader lists the sections with the other headings on the page. Set `headingLevel` to match your page outline; the default is 3. People press Tab to move between headings and Enter or Space to open or close one, and the button announces whether its section is open.","Set `hiddenUntilFound` on a panel if you want the browser's find-in-page to open a closed section that contains a match."],
    declaration: `<Accordion multiple defaultValue={["shipping"]}>
  <AccordionItem value="shipping">
    <AccordionTrigger>Shipping</AccordionTrigger>
    <AccordionPanel>…</AccordionPanel>
  </AccordionItem>
</Accordion>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Set `size` on the root to change every heading and panel inside it. Each heading is as tall as a Button of the same size, so the accordion lines up with the controls around it."},
      {"name":"multiple","title":"Several sections open","why":"Set `multiple` when people need to compare sections, so opening one leaves the others open. List every section that starts open in `defaultValue`, which is an array of item values."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onValueChange` when your app decides which sections are open. Here, an Expand all button opens every section and a Collapse all button closes them."},
      {"name":"in-a-card","title":"In a card","why":"The accordion draws only the lines between its sections. Put it in a Card with a Heading when the sections need an edge and a title, as in this list of questions."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on an item to stop people from opening that one section, while the other sections still open and close."},
      {"name":"rtl","title":"Right to left","why":"In a right-to-left region, the chevron points the other way and the panel text starts at the right edge. The accordion follows the `dir` attribute on itself or any ancestor, so you can set it once near the top of your app."},
    ],
    topics: [
      { title: "Stacking the sections", symbols: ["Accordion", "AccordionItem"] },
      { title: "Opening and closing one", symbols: ["AccordionTrigger", "AccordionPanel"] },
    ],
    refusals: [
      { name: "A horizontal orientation", why: "Sections placed side by side need a different keyboard model and a different layout, so the accordion is always a vertical stack. Use `Tabs` for side-by-side views." },
      { name: "`tone` and `emphasis`", why: "The headings carry no meaning that a colour could add, and no section is more important than the others. If some panel text needs a colour, set `tone` on a `Text` inside the panel." },
      { name: "An icon slot or a custom chevron", why: "The chevron is the one disclosure icon used everywhere in the system, including `NavTree`. A different icon here would give people a second symbol for the same action." },
      { name: "A border or background of its own", why: "The accordion draws only the lines between its sections, so it fits inside whatever surface holds it. Put it in a Card when the sections need an edge." },
    ],
    parts: [
      { part: "AccordionItem", blurb: "One section, which holds a trigger and a panel. Its `value` is the name that the root's `value` and `defaultValue` arrays use" },
      { part: "AccordionTrigger", blurb: "The heading of the section. It renders a heading element at the level you set, with a button inside it that is as tall as a Button of the same size" },
      { part: "AccordionPanel", blurb: "The content of the section, which shows while the section is open. Its text starts under the heading's label and matches the accordion's size" },
    ],
  },
  {
    slug: "alert-dialog",
    name: "AlertDialog",
    job: "Focus",
    level: "leaf",
    spec: "§10, §20, §25",
        abstract: "AlertDialog stops people to confirm an action that is hard to undo, such as a delete.",
    overview: ["An alert dialog interrupts people to ask a question with two answers, such as \"Delete this file?\". It holds a title, a description, a cancel button and an action button, and it arranges these parts for you.","Use an alert dialog before an action that is hard to undo. If the panel holds work, such as a form, or needs any control other than the two buttons, use a `Dialog` instead.","Write the question as the title, and say in the description what happens if people go ahead. Give the action a short verb, such as Delete, rather than OK. The two buttons sit side by side while both labels fit on one line, with Cancel on the start side. If a label is too long, the buttons stack with the action on top, so a label never wraps.","A press outside the alert does nothing, because a stray click must not answer the question. Escape closes the alert in the same way as Cancel. Both buttons close the alert when they are pressed.","`size` sets the whole alert: its width, padding, corner, text and buttons. Each size has a fixed width that is narrower than a Dialog of the same size. The page behind the alert dims, and the panel uses the material that your Theme sets.","The alert uses `role=\"alertdialog\"`, so a screen reader announces its title and description when it opens. Focus starts on Cancel, stays inside the alert while it is open, and returns to the trigger when it closes. The part names follow shadcn/ui's alert-dialog (MIT), and the behaviour comes from Base UI."],
    declaration: `<AlertDialog>
  <AlertDialogTrigger render={<Button>Delete…</Button>} />
  <AlertDialogContent>
    <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
    <AlertDialogDescription>\n      Everything in it goes with it.\n    </AlertDialogDescription>
    <AlertDialogCancel>Keep it</AlertDialogCancel>
    <AlertDialogAction tone="destructive">Delete</AlertDialogAction>
  </AlertDialogContent>
</AlertDialog>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the whole alert, including its width, the title, the description and both buttons. Open each one to compare them."},
      {"name":"tones","title":"Tones","why":"Give `AlertDialogAction` a `tone` only when the action carries a meaning. Deleting a file uses `destructive`, while publishing a page has no risk and keeps the default tone."},
      {"name":"controlled","title":"Controlled","why":"An alert that your app raises, such as a warning that a session is ending, needs no trigger. Pass `open` and `onOpenChange`, and set `open` from your own logic."},
      {"name":"from-a-menu","title":"Opened from a menu","why":"A menu item cannot contain a trigger, so the item sets `open` in its `onClick` instead. The menu closes and the alert opens in its place."},
      {"name":"rtl","title":"Right to left","why":"The alert follows the text direction around it. In a right-to-left region, Cancel sits on the right and the text starts at the right edge, with no extra prop."},
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
        why: "Each size has a fixed width that suits a short question and two buttons. If your content needs more room, it is doing more than asking a question, so use a `Dialog`.",
      },
      {
        name: "Closing on an outside press",
        why: "A stray click must not answer a question that could delete something. People can still press Escape, which works the same as Cancel.",
      },
      {
        name: "Header and footer parts",
        why: "The alert arranges the title, the description and the two buttons itself, so you write the parts in order and need no layout parts. Put Cancel first, because that is the button that gets focus.",
      },
      {
        name: "`render` on Cancel and Action",
        why: "The alert sets the size and position of both buttons, so they cannot become a different element. The action is always the strong button, because it is the only action in the alert.",
      },
      {
        name: "Arbitrary `children`",
        why: "An alert holds only a title, a description and two buttons. If you need a text field, a checkbox or any other control, use a `Dialog`.",
      },
    ],
    parts: [
      { part: "AlertDialogTrigger", blurb: "The control that opens the alert, usually written as render={`<Button/>`}. If your app opens the alert from its own state, you do not need a trigger" },
      { part: "AlertDialogContent", blurb: "Shows the panel above the page in a portal, dims the page behind it and centres the panel. It also places the title, the description and the buttons for you" },
      { part: "AlertDialogTitle", blurb: "The question, shown as a heading and used as the alert's accessible name. The alert's size sets its text size" },
      { part: "AlertDialogDescription", blurb: "Tells people what happens if they go ahead. It uses the muted text colour and is the alert's accessible description" },
      { part: "AlertDialogCancel", blurb: "The safe way out, shown as a medium Button at the alert's size. Write it first, so it comes first in reading order and gets focus when the alert opens" },
      { part: "AlertDialogAction", blurb: "The button that goes ahead, always shown as the strong Button at the alert's size. Set tone=\"destructive\" on it when the action deletes something" },
    ],
  },
  {
    slug: "attachment",
    name: "Attachment",
    job: "Know",
    level: "leaf",
    spec: "§43",
    declaration: `<Attachment state="uploading" progress={0.62} icon={fileIcon} meta="2.4 MB" onRemove={remove}>
  quarterly-report.pdf
</Attachment>`,
        abstract: "Attachment shows one file and the state of its upload, before or after you send it.",
    overview: ["An attachment shows one file as a small tile with the file name, an optional second line such as the size, an icon and an optional remove button. It also shows what is happening to the file: ready, uploading, being processed on the server, or failed.","Use it wherever a file appears: in a Composer before you send a message, in the message after you send it, or under a form field. A file that is about to be sent and a file that is already sent use the same tile, which is why the tile is a separate component from the Composer.","Your app keeps the file, and the tile only shows what you tell it. It never reads a `File`, starts a timer or creates a URL. Set `state`, `progress` and `meta` from the data that your upload code already has.","Set `state=\"uploading\"` with a `progress` from 0 to 1 to fill a ring around the icon. Without `progress`, and in the `processing` state, a short segment moves around the ring instead. For the `error` state, the tile turns red, and you should write the reason in `meta`, because colour alone does not tell people what went wrong. Without an `icon`, the tile shows a generic file icon.","The remove button appears only when you pass `onRemove`, and your app then removes the file from its own list. The button's accessible name is \"Remove\" followed by the file name, and you can set `removeLabel` to translate the first word.","`size` sets the padding, the corner, the icon, the remove button and the text size of the name. Set `backdrop` when content passes behind the tile, so the tile uses your Theme's material. A screen reader hears the file name as the tile's name, the second line as its description, and a busy state while the file uploads or is processed."],
    variants: [
      {"name":"states","title":"Every state","why":"One tile for each state. An `uploading` tile with a `progress` fills its ring, and one without a `progress` shows a moving segment. `processing` means the server is working on the file, and the `error` tile says why in `meta`."},
      {"name":"sizes","title":"Sizes","why":"`size` sets the whole tile: its padding, its corner, the icon, the remove button and the file name. At size 2, the remove button is as tall as a size 2 Button."},
      {"name":"live-upload","title":"A live upload","why":"The tile has no timer of its own. Your upload code changes `state` and `progress`, and the tile shows the values you give it. In this example, a timer stands in for a real upload."},
      {"name":"composer","title":"In a composer, before sending","why":"The tiles sit in a row above the text, inside the composer, and each one has a remove button. The list belongs to your app, so removing a file means filtering your own array."},
      {"name":"message","title":"In a message, after sending","why":"The same tile appears in a sent message, without a remove button. An image file can show its own picture in the `icon` slot."},
      {"name":"form","title":"Under a field, one per line","why":"A field that accepts files lists the files it has so far, one under the other. The failed file says why in `meta`, because the red colour alone does not explain the problem."},
    ],
    refusals: [
      {
        name: "A done state",
        why: "A file that is sent looks the same as a file that is ready to send. To show the difference, change what is in the tile, such as a remove button before sending and a download link after.",
      },
      {
        name: "`tone`",
        why: "The tile's `state` already sets its colour, and the `error` state shows it in red. A separate `tone` would let a failed upload show as a success.",
      },
      {
        name: "Holding the file",
        why: "The tile never reads a file, uploads it or creates a URL for it, because your app already manages the file. Give the tile a name, a state and an icon.",
      },
      {
        name: "A built-in preview",
        why: "The tile does not load or decode images. To show a thumbnail, create it in your app and pass it as an `img` in the `icon` slot.",
      },
      {
        name: "`emphasis`",
        why: "Every tile has the same strength, because no file is more important than another. Only an `error` state makes a tile stand out.",
      },
      {
        name: "A shadow",
        why: "A tile is content inside another surface, such as a composer or a message, so it draws no shadow. Its border marks its edge instead.",
      },
      {
        name: "`render`",
        why: "The tile is made of several elements, including the name and the remove button, so there is no single element that `render` could replace.",
      },
    ],
  },
  {
    slug: "avatar",
    name: "Avatar",
    job: "Read",
    level: "leaf",
    spec: "§11, §35",
    declaration: `<Avatar src="/shruti.jpg" alt="Shruti Bhatia" fallback="SB" badge={<Badge>3</Badge>} />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Sizes 1 to 4 match the control heights. Sizes 5 to 9 are larger, for a face that stands alone, such as in a profile header."},
      {"name":"fallbacks","title":"Pictures and fallbacks","why":"The picture shows when it loads. Before it loads, or if it fails as in the last avatar, the `fallback` shows instead. Without a `fallback`, the avatar shows a generic person icon."},
      {"name":"badges","title":"With a badge","why":"Pass a `Badge` to the `badge` prop to place it at the top-end corner. A badge with a count shows as a pill, and a badge with no content shows as a dot that needs an `aria-label`."},
      {"name":"with-a-name","title":"Beside a name","why":"When the person's name is written next to the avatar, leave `alt` empty. The picture is then decorative, so a screen reader does not read the name twice."},
      {"name":"with-controls","title":"In a row of controls","why":"At sizes 1 to 4, an avatar is as tall as a control of the same size, so it lines up with a TextField and a Button in one row."},
      {"name":"in-a-button","title":"As a menu trigger","why":"An avatar does not respond to a press. To open an account menu, put the avatar in an icon-only Button, which gives it the accessible name. The avatar fills the button."},
    ],
        abstract: "Avatar shows a person, a team or a thing as a small round picture, with initials or a generic figure until the picture loads.",
    overview: ["An avatar shows a person, a team or a thing as a small round picture. Before the picture loads, or if it fails, the avatar shows its `fallback`, which is usually a person's initials. Without a `fallback`, it shows a generic person icon.","Use `AvatarGroup` to show several avatars that overlap. Use a `Chip` for a word beside a person, such as a role or a status. An avatar does not respond to a press, so for an account menu, put the avatar inside an icon-only Button.","Sizes 1 to 4 match the control heights, so an avatar is as tall as a Button of the same size and grows with density and on touch screens. Sizes 5 to 9 are larger, for a face that stands alone. If you leave `size` unset, the avatar uses the size of its group, and then the size of the nearest Theme.","Pass a `Badge` to `badge` to show a count or a dot at the top-end corner. The avatar positions the badge and cuts a ring in the surface colour around it, so the badge stays separate from the picture.","An avatar is a circle at every radius setting, and its fallback is always grey. Set `backdrop` when content passes behind the avatar, so the fallback uses your Theme's material; a loaded picture covers the material.","`alt` is empty by default, so a screen reader skips the avatar. That is correct when the person's name is written beside it. When the avatar is the only thing that identifies the person, write their name in `alt`, and the fallback then uses the same name."],
    refusals: [
      { name: "A shape prop", why: "An avatar is a circle at every radius setting, so it is always recognisable as a person or a team. For a square picture, use an image in a Card or a Box." },
      { name: "`emphasis`", why: "No person on the screen is more important than another because of their avatar. Show order and importance with the position and the size of the avatars." },
      { name: "`tone`", why: "A tone could colour only the initials, which is too weak to identify a person. The picture is what makes one avatar different from the next." },
      { name: "Built-in status words", why: "Words such as Away or Busy belong to your product, not to the avatar. Use the `badge` prop for a count or a dot, or put a Chip next to the avatar." },
      { name: "A press", why: "An avatar is not a control. When people need to press a person, put the avatar inside an icon-only Button, which gives it focus and an accessible name." },
      { name: "A maximum count on the group", why: "How many faces to show is a decision for your product. Show the ones you want, then add one more Avatar whose fallback counts the rest, such as +3." },
    ],
  },
  {
    slug: "avatar-group",
    name: "AvatarGroup",
    job: "Read",
    level: "leaf",
    spec: "§35",
    declaration: `<AvatarGroup size="3">
  <Avatar src="/shruti.jpg" alt="Shruti Bhatia" fallback="SB" />
  <Avatar fallback="KD" />
  <Avatar fallback="+3" />
</AvatarGroup>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Set `size` once on the group, and every avatar inside it that has no size of its own uses it. The overlap and the rings grow with the size."},
      {"name":"overflow","title":"Counting the rest","why":"The group has no maximum. Decide how many faces to show, then add one more Avatar whose fallback counts the rest and whose `alt` says the count in words."},
      {"name":"with-a-label","title":"Beside a label","why":"A group usually sits next to text that says what it shows, and often next to an action. At sizes 1 to 4, the avatars line up with a Button of the same size."},
    ],
        abstract: "AvatarGroup shows several avatars that overlap, with a ring in the surface colour around each one to keep them separate.",
    overview: ["An avatar group shows several avatars in a row, and each one overlaps the one before it. A ring in the surface colour surrounds each avatar, so the circles stay separate.","Use a group to show who has access to something, who is in a meeting or who worked on a file. The overlap is fixed, so for avatars that do not overlap, put them in a `Flex` instead.","Set `size` once on the group, and every avatar inside it that has no size of its own uses it. An avatar that sets its own `size` keeps that size. At sizes 1 to 4, the group is as tall as a Button of the same size.","Each avatar keeps its own `alt`. Leave it empty when the names are written beside the group. When the faces are the only way to see who is there, give each avatar a name, and give the counting avatar a sentence such as \"3 more members\"."],
    refusals: [
      { name: "A maximum count", why: "How many faces to show is a decision for your product. Show the ones you want, then add one more Avatar whose fallback counts the rest, such as +3." },
      { name: "A spacing prop", why: "The overlap is fixed so that every group looks the same across your app. For avatars that do not overlap, put them in a `Flex` with a `gap`." },
    ],
  },
  {
    slug: "badge",
    name: "Badge",
    job: "Know",
    level: "leaf",
    spec: "§11, §38",
    declaration: `<Text>
  Inbox <Badge>3</Badge>
</Text>`,
    variants: [
      {"name":"counts","title":"Counts in a pill","why":"Put a number in a badge to show it as a pill. The badge shows exactly what you give it, so format the number and choose a cut-off, such as 99+, in your app."},
      {"name":"dots","title":"Named dots","why":"A badge with no content is a dot. A dot is only a colour, so give it an `aria-label` that says what a sighted person understands from it."},
      {"name":"tones","title":"Tones","why":"`tone` says what the badge means. The default, `accent`, means that something is there, and `destructive` means that something needs attention. Map your own words to a tone in your app."},
      {"name":"sizes","title":"Sizes","why":"A badge without a `size` scales with the line it sits in, so it grows with the text around it. Set `size` only when the badge stands alone."},
      {"name":"on-an-avatar","title":"Pinned to an avatar","why":"Pass the badge to an Avatar's `badge` prop. The avatar places it at the top-end corner and cuts a ring around it, and the badge scales with the avatar."},
      {"name":"in-tabs","title":"In a tab label","why":"A badge in a tab label counts the items that wait in that tab. It scales with the tab's text, so it needs no `size`."},
      {"name":"in-a-list","title":"In a navigation list","why":"In a list of Rows, put each badge in the row's `trailing` slot, so every count lines up at the end of its row."},
      {"name":"conditional","title":"Hidden at zero","why":"Write `{count > 0 && count}` to show the badge only when there is something to count. At zero, the badge has no content and no name, so it renders nothing."},
    ],
        abstract: "Badge is a small mark that stays on a thing until you look at it, such as the number on an app icon or an unread dot.",
    overview: ["A badge is a small mark that stays on something until people look at it, such as the number on an app icon or the unread dot on a tab. With no content, it is a dot. With a number in it, it is a pill.","Use a badge to count items or to point at something new. Use a `Chip` for a word, such as Paid or Failed, and for a quieter mark. Use a `Notice` when a condition needs a sentence.","A badge always has a strong colour, and it has no `emphasis`. `tone` says what it means: the default, `accent`, means that something is there, and `destructive` means that something needs attention. Your app maps its own meanings onto a tone, for example a failed payment onto `destructive`.","Without a `size`, a badge scales with the line it sits in, so a badge in a tab label and a badge on a large avatar have the same shape at different sizes. Set `size` only when the badge stands alone.","A badge has no position of its own. Put it in a line of text or in a Row's `trailing` slot, or pass it to an Avatar's `badge` prop to place it on the avatar's corner.","A dot is only a colour, so it needs an `aria-label` that says what it means. A count is its own accessible name, so its `aria-label` is optional. A badge with no content and no label renders nothing, which is why `{count > 0 && count}` hides it at zero."],
    refusals: [
      { name: "`emphasis`", why: "A badge is always strong, because its job is to catch attention until people look. For a quieter mark with a word in it, use a Chip." },
      { name: "Built-in status words", why: "Words such as Online or Overdue belong to your product, so your app maps each one to a tone. If the word itself must show, use a Chip." },
      { name: "An unnamed dot", why: "A dot with no content is only a colour, and some people cannot see the colour. The type therefore requires an `aria-label` that says what the dot means." },
      { name: "A position of its own", why: "The element that holds the badge decides where it goes. To pin a badge to the corner of an avatar, use the Avatar's `badge` prop." },
    ],
  },
  {
    slug: "chip",
    name: "Chip",
    job: "Know",
    level: "leaf",
    spec: "§11, §15, §38",
    declaration: `<Chip tone="success">Live</Chip>`,
    variants: [
      {"name":"tones","title":"Tones","why":"Pick the tone from what the word means. The letters change colour while the box stays grey, so a row of chips stays calm and each word keeps its meaning."},
      {"name":"sizes","title":"Sizes","why":"Set `size` only when a chip stands alone. Next to other text, leave it unset, and the chip matches the size of that text."},
      {"name":"beside-a-heading","title":"Beside a heading and a label","why":"With no `size`, each chip matches the text of the line it sits in. The chip beside the heading is larger than the chip beside the small label, and neither sets a size."},
      {"name":"in-a-table","title":"Status in a table column","why":"A status column is the most common place for a chip. Map each status to one tone in your own code, so the same word always has the same colour."},
    ],
        abstract: "Chip shows a short word or a count that tells you the current state of the thing beside it.",
    overview: ["A chip shows a short word or a count that says what state the thing beside it is in, such as Running, Failed or Deployed. It has the same grey fill, corner and one-line height as `Code` and `Kbd`.","Use a chip for a status in a list, a table or next to a title. To show a dot or a count on an avatar or an icon, use a `Badge`. For something that people can press or remove, use a `Button`, and for a message about a condition, use a `Notice`.","`tone` sets the colour of the letters, and the box stays grey in every tone. Use `success` for a finished job, `destructive` for a failed one, `warning` for one that needs attention and `info` for one that is running. Use the same tone for the same word everywhere in your product.","`size` is optional. If you leave it unset, the chip matches the text size of the line it sits in, so a chip beside a large heading is larger than one in a table row. Set `size` only when the chip stands alone. `weight` and `emphasis` work as they do on `Text` and change only the letters.","Set `backdrop` when the chip sits over an image or other content that passes behind it, so the chip uses your Theme's material. On a plain background, it stays solid.","A chip is plain text, and a screen reader reads its word as part of the line. The colour adds meaning but cannot replace it, so write a word that makes sense on its own. A chip with no content, such as `{false}` or an empty string, renders nothing."],
    refusals: [
      {
        name: "A louder fill, or a `variant` prop",
        why: "A chip's tone says what kind of state something is in, not how important it is, so every chip has the same strength. To make one item stand out, use its position on the screen or a Button's `emphasis`.",
      },
      {
        name: "A remove button",
        why: "A chip that people can remove is a control, which needs focus, a keyboard model and an accessible name. Use a Button when people must act on the item.",
      },
      {
        name: "A count prop",
        why: "A chip shows exactly what you give it. Format the number and choose a cut-off, such as 99+, in your app.",
      },
      {
        name: "A position of its own",
        why: "A chip does not decide where it sits on the screen. Place it in a row, a table cell or a Box.",
      },
      {
        name: "An empty chip",
        why: "A chip with no word is only a coloured shape, and colour alone cannot carry a meaning. For a dot or a count, use a Badge.",
      },
    ],
  },
  {
    slug: "blockquote",
    name: "Blockquote",
    job: "Read",
    level: "leaf",
    spec: "§11, §15",
    declaration: `<Blockquote>Taste is the last layer.</Blockquote>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` is a step on the type scale, as on Text, and the default is 3. The indent grows with the text, so the words stay clear of the line at every size."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` sets the colour of the text. A quote is `loud` by default, and `medium` suits a quote that supports the text around it rather than leading it."},
      {"name":"tones","title":"Tones","why":"`tone` colours the words and leaves the line grey. When a coloured bar must carry the meaning, such as a warning, use a Notice instead."},
      {"name":"with-attribution","title":"With an attribution","why":"Put the name in a sibling Text. Use `render` to make the surrounding Stack a `<figure>` and the name a `<figcaption>`, and pass the source address as `cite`."},
      {"name":"in-an-article","title":"In an article","why":"In running text, the quote sits in the same column as the paragraphs. It adds no margin, so the `gap` of the surrounding Stack sets the space above and below it."},
    ],
        abstract: "Blockquote sets a quoted passage apart from the text around it with a line and an indent.",
    overview: ["A blockquote sets a passage of text apart with a thin line down its leading edge and an indent that keeps the words clear of the line.","Use a blockquote for a quoted passage, such as a customer quote in an article or an excerpt from a document. Use a `Notice` when a coloured bar must carry a meaning, such as a warning, and use a `Card` when the content needs a boundary.","The text works like `Text`. `size` is a step on the type scale and defaults to 3, `weight` defaults to regular, and `emphasis` defaults to `loud`, because a quote is text that people read.","`tone` colours the words and leaves the line grey. The line always has the same colour as a `Separator`, in light and dark mode.","A blockquote adds no margin of its own, so the layout around it sets the space. To credit the source, put the name in a sibling `Text`, use `render` to make the layout a `<figure>` and the name a `<figcaption>`, and pass the source address as `cite`."],
    refusals: [
      {
        name: "A coloured line",
        why: "A tone colours the words and leaves the line grey, so a blockquote never looks like a warning. If a condition needs a coloured bar, use a Notice.",
      },
      {
        name: "An attribution slot",
        why: "An attribution needs no special behaviour, so a sibling `Text` does the same job. It also lets you choose the size and colour of the name.",
      },
    ],
  },
  {
    slug: "box",
    name: "Box",
    job: "Arrange",
    level: "leaf",
    spec: "§2, §3",
    declaration: `<Box p="4" m="2">
  …
</Box>`,
    variants: [
      {"name":"padding","title":"Padding steps","why":"`p` sets the padding on all four sides, `px` and `py` set one axis, and `pt`, `pr`, `pb` and `pl` set one side each. Every value is a step on the space scale."},
      {"name":"spacing-a-control","title":"Space around a control","why":"A control never sets the space around itself. When one child needs more room than the gap gives it, as the button here does, wrap that child in a Box with a margin prop."},
      {"name":"responsive","title":"Responsive values","why":"Any Box prop can take an object with a value for each container size. Here the row is a column on a narrow container and becomes a row from `md` up."},
      {"name":"container","title":"Measurable containers","why":"Add `container` to a Box so that responsive values inside it follow its width instead of the window's. Each Box here has a set width, because a container can't size itself from its content."},
      {"name":"bleed","title":"Bleeding to the edge","why":"Setting `mt` and `mx` to `bleed` cancels the card's padding at the top and sides, so the picture reaches the card's edges and the card clips it to its corners."},
      {"name":"backdrop","title":"A backdrop region","why":"Use `backdrop` for a region where content shows behind the controls, such as a toolbar over a photo. Every control inside the region then uses the theme's material, so you set it once instead of on each button."},
      {"name":"render","title":"Choosing the element","why":"Use `render` when the document needs a specific element, such as a `<section>` or a `<nav>`. The Box props apply to that element directly, with no extra wrapper."},
    ],
        abstract: "Box is the basic layout component, and Flex, Stack and Grid are all built from it.",
    overview: ["Box is the basic layout component. Flex, Stack and Grid are each a Box with a fixed `display` and a shorter list of props, so use one of those when you already know the layout. Use Box when the layout has to change `display` at a container size, or when you need one-off spacing around something.","Box props cover padding, margin, gap, width and height, position, and the props a flex or grid child needs. Spacing values are steps on the space scale rather than lengths, so spacing stays consistent across your app. Anything the props don't cover can go in `style`, which is applied last.","Controls never set the space around themselves, so Box is how you add it. To put space above a button, write `<Box mt=\"4\"><Button /></Box>`.","Every prop takes either a single value or an object with a value for each container size: `initial`, `sm`, `md` and `lg`. The sizes follow the width of the nearest Box marked `container`, or the root Theme when there is none. Only mark a Box as a `container` when its width comes from the layout or from `width`, because a container can't size itself from its content. In a plain flex row it would collapse to zero width, and a development build warns you when that happens.","Three more props cover the edge cases. Setting a margin prop to `bleed`, as in `mx=\"bleed\"`, cancels the padding of the surrounding Card or Surface so that a picture or a divider can reach its edge. `backdrop` marks a region where content shows behind the controls, so they use the theme's material. `render` applies the Box props to an element you choose, such as a `<section>`."],
    refusals: [
      {
        name: "Utility classes",
        why: "Box passes its values to the stylesheet as inline custom properties, so the stylesheet stays the same size no matter which values your app uses.",
      },
      {
        name: "A separate bleed prop",
        why: "Bleed is a value you give a margin prop, such as `m=\"bleed\"` or `mx=\"bleed\"`. Separate props would repeat every margin spelling a second time.",
      },
      {
        name: "Containment by default",
        why: "A container can't take its width from its content, so it would collapse to zero in a flex row. Add `container` only on a Box whose width the layout already sets.",
      },
    ],
  },
  {
    slug: "breadcrumb",
    name: "Breadcrumb",
    job: "Go",
    level: "leaf",
    spec: "§11, §39",
        abstract: "Breadcrumb shows where the current page sits in your app, with a link back to each level above it.",
    overview: ["Breadcrumb shows the path from the top of your app to the current page. Every crumb before the last one links back to that level, and the last crumb names the current page as plain text.","Use a breadcrumb when pages sit several levels deep, such as folders, projects or settings sections. Don't use it for the steps of a process or for a history of pages you visited. To switch between views at the same level, use Tabs.","Each `BreadcrumbItem` draws the chevron that follows it, and the last item draws none, so you never place separators yourself. When a path is too long to show in full, keep the first crumb and the last few, and pass the levels in between to `BreadcrumbEllipsis` as `items`. The ellipsis is a button that opens a menu of those levels. Give each item an `href`, a `render` element or an `onClick`.","`size` sets the text size of the whole path, and the default is `2`. The colours are fixed: links use the muted text colour, the current page uses the full text colour, and the chevrons are fainter still. All three adjust for dark mode and high contrast.","Breadcrumb renders a `<nav>` landmark holding an ordered list, so a screen reader can find it and read it as a path. The landmark is named \"Breadcrumb\" unless you set `label`, which is how you name it in your app's language. The current page carries `aria-current=\"page\"`. Tab moves through the links, and the arrow keys move through the ellipsis menu."],
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
      {"name":"sizes","title":"Sizes","why":"Sizes 1, 2 and 3, set once on `Breadcrumb` and applied to every crumb and chevron. Size 2 suits most page headers, and size 3 works beside a large title."},
      {"name":"short-path","title":"A path with two levels","why":"A breadcrumb with one link and the current page is still useful, because it gives you one clear way back to the list you came from."},
      {"name":"collapsed-levels","title":"Hidden levels in a menu","why":"The first crumb and the last ones stay visible, and the folders in between open from the ellipsis. Each hidden item here uses `onClick`, for levels your app opens in code rather than by URL."},
      {"name":"page-header","title":"Above a page title","why":"Put the breadcrumb above the page heading, with the page's actions on the same line as the heading. The last crumb matches the heading, so you can always see where you are."},
      {"name":"rtl","title":"Right to left","why":"Set `dir=\"rtl\"` on the breadcrumb or on any ancestor, and the path reads from the right with the chevrons pointing the other way. Use `label` to name the landmark in the page's language."},
    ],
    topics: [
      { title: "Drawing the path", symbols: ["Breadcrumb", "BreadcrumbItem"] },
      { title: "The levels above the current page", symbols: ["BreadcrumbLink", "BreadcrumbEllipsis"] },
      { title: "The current page", symbols: ["BreadcrumbPage"] },
    ],
    refusals: [
      {
        name: "`BreadcrumbSeparator`",
        why: "Each item draws the chevron after it and the last item draws none, so separators are always in the right place without you adding them.",
      },
      {
        name: "`BreadcrumbList`",
        why: "A breadcrumb is always a landmark that holds a list, so `Breadcrumb` renders both and there is nothing to choose between.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A breadcrumb shows a location and carries no meaning to colour. Its three text colours are fixed so that every breadcrumb in your app looks the same.",
      },
      {
        name: "`maxItems` and any automatic collapse",
        why: "Only you know which levels matter, so the component never drops any on its own. Render the crumbs you want to keep and pass the rest to `BreadcrumbEllipsis`.",
      },
      {
        name: "An ellipsis that does nothing",
        why: "Three dots suggest there is more to see. `BreadcrumbEllipsis` requires `items`, so it always opens a menu of the hidden levels.",
      },
      {
        name: "Role=link and aria-disabled on the current page",
        why: "The current page is neither a link nor disabled. It is plain text marked with `aria-current`, which is how a screen reader knows you are there.",
      },
    ],
    parts: [
      { part: "BreadcrumbItem", blurb: "One level of the path, together with the chevron that follows it. The last item shows no chevron" },
      { part: "BreadcrumbLink", blurb: "A level above the current page, as a link back to it. It uses the muted text colour rather than the accent colour a `Link` uses" },
      { part: "BreadcrumbPage", blurb: "The current page at the end of the path, in the full text colour and marked with `aria-current=\"page\"`. It is plain text, because there is nowhere to go" },
      { part: "BreadcrumbEllipsis", blurb: "A button that stands in for the hidden levels and opens a menu of them when pressed" },
    ],
  },
  {
    slug: "button",
    name: "Button",
    job: "Act",
    level: "leaf",
    spec: "§4, §8, §9, §41",
    declaration: `<Button tone="accent" emphasis="loud">
  Save changes
</Button>`,
    variants: [
      {"name":"emphasis","title":"Emphasis","why":"A row of actions from loud to quiet. Use one loud button for the main action, medium for the others, and quiet for actions such as Cancel. A quiet button with `bordered` sits between quiet and medium."},
      {"name":"tones","title":"Tones","why":"`tone` says what an action does: `accent` for your main brand action, `destructive` for one that deletes, `success` for one that approves. Every tone works at every emphasis."},
      {"name":"sizes","title":"Sizes","why":"The four sizes. One `size` sets the height, padding, corner, icon and text together. Use size 2 on most screens, and keep the controls in one row at the same size."},
      {"name":"with-icons","title":"With icons","why":"Put an icon before the label with `leading`, or after it with `trailing`. The button sizes the icon for you, so you don't set a width or height on it."},
      {"name":"icon-only","title":"Buttons with only an icon","why":"Set `iconOnly` and put the icon in `children`. TypeScript requires an `aria-label` or `aria-labelledby`, because a screen reader can't describe an icon."},
      {"name":"states","title":"Loading and disabled","why":"`loading` shows a spinner in place of the leading icon and blocks presses while the label stays. `disabled` greys the button out and takes it out of the tab order."},
      {"name":"done","title":"A copy button that confirms","why":"Set `done` once the action succeeds, and the icon changes to a tick. Your app holds the value and clears it with a timer. Change the label or `aria-label` too, so a screen reader hears the result."},
      {"name":"as-link","title":"A button that goes to a page","why":"Use `render={<a href />}` when the action opens another page. It still looks like a button, but the browser treats it as a link, so people can open it in a new tab."},
      {"name":"in-a-form","title":"In a form","why":"Set `type=\"submit\"` on the main action and `type=\"reset\"` on the quiet one. Pressing Enter in the field then submits the form."},
    ],
        abstract: "Button starts an action, such as saving a form, opening a dialog or deleting a file.",
    overview: ["Button starts an action, such as saving a form, opening a dialog or deleting a file. You choose what the action means with `tone` and how prominent it is with `emphasis`, and the theme works out the colours.","`emphasis` ranks the actions on a screen. A `loud` button is filled with the tone's solid colour, a `medium` button has a soft fill, and a `quiet` button has no fill. Give each screen or pane one loud button for its main action. Adding `bordered` draws a thin line around the button, which places a quiet button a little above the other quiet ones. The defaults are `medium` emphasis and the `neutral` tone.","Use `tone` for meaning rather than for a colour you like: `destructive` for an action that deletes or removes, `accent` for your brand's main action, and `success` for an action that approves.","`size` sets the height, padding, corner, icon and text size together, so controls at the same size line up in a row. When you don't set it, the button takes the size of the Field or Toolbar it sits in, or else the Theme's size, which is `2`. On a touch screen every size is taller, so buttons stay easy to tap.","Put an icon before the label with `leading`, or after it with `trailing`. For a square button with only an icon, set `iconOnly` and give it an `aria-label`. While an action runs, set `loading`: a spinner takes the place of the leading icon, the label stays, and presses are blocked. When the action finishes, set `done`, and the icon changes to a tick until you set it back to false. A button without an icon shows the tick beside its label, so it grows a little wider.","Button renders a real `<button>`, so Enter and Space press it, and it submits a form when `type` is `submit`. To make it work as a link, pass `render={<a href=\"/billing\" />}`. A screen reader reads the label, or the `aria-label` on an icon-only button, and it doesn't read the tick, so change the label as well when you use `done`, for example from \"Copy\" to \"Copied\".","Some neighbouring cases have their own components. For a main action with a menu of related ones, use a SplitButton. To join several buttons into one control, use a ButtonGroup. For something that stays on or off, use a Toggle, and for a link inside a sentence, use a Link."],
    refusals: [
      { name: "`margin`", why: "No component sets the space around itself, because the layout that holds it decides that. Wrap the button in `<Box m>` or use the `gap` of its container." },
      {
        name: "`variant`",
        why: "A variant mixes how loud a button is with what it means, which makes a quiet destructive button impossible. Use `tone` for the meaning and `emphasis` for the loudness.",
      },
      {
        name: "A shadow prop",
        why: "Shadows are set for the whole app by the Theme's `depth`, so buttons across your app always match. No single button can ask for its own.",
      },
    ],
  },
  {
    slug: "surface",
    name: "Surface",
    job: "Arrange",
    level: "leaf",
    spec: "§10",
    declaration: `<Surface size="2">
  …
</Surface>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The four sizes. `size` sets the padding and the corner, with the same values a Card uses at that size, so use a larger size for a larger region."},
      {"name":"holding-cards","title":"Holding cards","why":"A Surface groups several cards into one region. The cards keep their own fill, border and shadow, while the Surface stays flat behind them."},
      {"name":"in-a-card","title":"In a card","why":"A small Surface inside a Card sets apart a quieter region, here an API key. Its corner fits inside the card's corner automatically."},
      {"name":"as-a-layout","title":"As a layout","why":"With `render={<Stack />}`, the Surface is also the column layout, so one element gives you both the fill and the stacking with no wrapper."},
      {"name":"bleed","title":"Bleed to the edge","why":"Setting `mx=\"bleed\"` on the Box around the Separator lets it run from edge to edge. Use `mx` for the sides only, or `m` for all four edges."},
    ],
        abstract: "Surface is a quiet region of the page that holds other things, such as a group of cards.",
    overview: ["A Surface is a region of the page that other things sit on. Where a Card is an object, a Surface is the area that holds objects. It has a fill that is slightly different from the page, a thin border and a rounded corner, and it casts no shadow.","Use a Surface for a bounded area that holds several cards, such as a board or a gallery. You can also use one inside a card for a quieter region, such as a code sample, a key or a group of settings. For a single thing that people read, open or press, use a Card.","The fill has one fixed value for light mode and one for dark mode. In dark mode the fill is very close to the page, so the border does most of the work of showing where the region is.","`size` sets the padding and the corner, and matches a Card at the same size. When a Surface sits inside a Card or another Surface, its corner shrinks automatically so it follows the outer corner. The Surface clips its content to that corner, and a child can reach the edge with `m=\"bleed\"`.","A Surface is always opaque, so a card placed on it is solid even inside a `backdrop` region. A child that sets its own `backdrop` still uses the theme's material. A Surface has no keyboard behaviour of its own, and `render` lets you choose its element, such as a `<section>`."],
    refusals: [
      {
        name: "A fill or an edge prop",
        why: "With a choice of fill and border, a Surface could be made to look like a Card, and you would have two ways to build the same thing. The fill and the border are fixed.",
      },
      {
        name: "A border toggle",
        why: "A Surface with a border and one without would mean the same thing, and in dark mode the border is most of what makes the region visible at all.",
      },
      {
        name: "`material` and `backdrop`",
        why: "Glass is for something that sits over other content, and a Surface is part of the page rather than over it. A child that sets `backdrop` still uses the theme's material.",
      },
      {
        name: "Tone, emphasis and a shadow",
        why: "A Surface is a container, so it has no rank among its neighbours, and because it is part of the page rather than raised above it, it casts no shadow.",
      },
    ],
  },
  {
    slug: "card",
    name: "Card",
    job: "Read",
    level: "leaf",
    spec: "§9, §10",
    declaration: `<Card size="2">
  …
</Card>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The four sizes. `size` changes the padding and the corner, and the content sets the height. Use a smaller size for dense content such as stats, and a larger one for a form."},
      {"name":"as-a-link","title":"A card that opens a page","why":"With `render={<a href />}`, the whole card is one link with hover, press and focus states. Don't put another link inside it, because a link inside a link is invalid HTML."},
      {"name":"as-a-button","title":"A card that runs an action","why":"Use `render={<button />}` when the card runs an action instead of opening a page, and put the handler on the element you pass to `render`."},
      {"name":"choice","title":"Cards that select one option","why":"Each Radio sits in a `<Card render={<label />}>` inside a RadioGroup, so pressing anywhere on a card selects its option. The selected card gets an accent-coloured edge."},
      {"name":"disabled","title":"Disabled","why":"A card rendered as a disabled button fades its fill and text and stops showing a pointer. Say in the card's own text why it isn't available."},
      {"name":"responsive-grid","title":"Cards in a responsive grid","why":"Passing an object to Grid's `columns` changes the layout as the space grows. Here the cards stack in one column and move to three columns from `sm` up."},
      {"name":"settings","title":"A settings form in a card","why":"A card that holds a whole task: a heading, a field and its actions, with one loud button for the card's main action."},
    ],
        abstract: "Card sets one object apart from the rest of the page, such as a project, a plan or a group of settings.",
    overview: ["Card sets one object apart from the rest of the page, such as a project, a plan or a group of settings. It has a solid fill, a rounded corner and padding, and it holds whatever you put inside it. Arrange that content with Stack and Flex.","To hold several cards in one region, or to make a quieter region inside a card, use a Surface. For code inside a card, use a CodeBlock. Don't put a card inside another card, and a development build warns you if you do.","`size` sets the padding and the corner. The content decides how tall the card is. Whether cards cast a shadow is set for the whole app by the Theme's `depth`.","The element you pass to `render` decides what the card does. As an `<a>` or a `<button>`, the whole card is pressable, with the same hover, press, focus and disabled states as other controls. As a `<label>` around a Radio or a Checkbox, the whole card selects that control, and the card's edge turns the accent colour while the control is checked.","A card clips its content to its corner. To make a picture or a band reach the card's edge, put it in a Box with `m=\"bleed\"`, or with `mt=\"bleed\"` and `mx=\"bleed\"` for the top and sides only.","Set `backdrop` when an image, a map or a scrolling feed shows behind the card, so that it uses the theme's material. Without it, the card is solid. A card can only be focused when you render it as a link, a button or a label, and a screen reader then reads it as that element, so write its text to make sense read aloud as one name."],
    refusals: [
      {
        name: "A `selected` prop, and an `interactive` one",
        why: "The element decides what a card does. Use `<Card render={<button />}>` for a card you press, or put a `Radio` in `<Card render={<label />}>` for a card you select.",
      },
      {
        name: "A card inside a card",
        why: "A card inside a card doesn't show any clear relationship between the two. Use a Surface for a quieter region inside a card, or to hold several cards.",
      },
      {
        name: "A material prop",
        why: "The Theme sets one material for the whole app. Set `backdrop` on a card that has content behind it, or wrap part of the page in a nested Theme to change the material there.",
      },
      {
        name: "Tone, emphasis and bordered",
        why: "A card is a container, not an action, so it has no rank among its neighbours. Its fill and border are the same on every card in your app.",
      },
      {
        name: "A media or cover slot",
        why: "A card already clips its children to its corner, so a picture can reach the edge without a slot. Wrap it in `<Box mt=\"bleed\" mx=\"bleed\">`.",
      },
      {
        name: "Header and footer slots",
        why: "A title or a footer is just a layout, so you arrange it yourself with Stack and Flex. That leaves you free to build whatever layout the card needs.",
      },
    ],
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    job: "Choose",
    level: "leaf",
    spec: "§4, §6, §11",
    declaration: `<Checkbox id="ship" defaultChecked />
<Text render={<label htmlFor="ship" />}>Ship it</Text>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Each checkbox size is as tall as one line of text one size up, so a size 2 checkbox pairs with size 3 text. Go up both together."},
      {"name":"in-a-form","title":"In a form","why":"Each checkbox sits in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The field connects each label and description to its checkbox, so you don't write any `id`."},
      {"name":"select-all","title":"Select all with a mixed state","why":"The checkbox above the list shows `indeterminate` while only some files are selected. Pressing it selects every file, or clears them all."},
      {"name":"disabled","title":"Disabled","why":"`disabled` fades the box and its tick and blocks presses. A disabled checkbox keeps its state, so a checked one still shows its tick."},
      {"name":"controlled","title":"Controlled","why":"Pass `checked` and `onCheckedChange` when other parts of the screen depend on the value. Here the button stays disabled until you accept the terms."},
      {"name":"in-a-card","title":"In a card","why":"Each checkbox and its text sit in a `<Card render={<label />}>`, so pressing anywhere on the card toggles the option. A checked card gets an accent-coloured edge."},
    ],
        abstract: "Checkbox turns a single option on or off.",
    overview: ["Checkbox turns a single option on or off. It is neutral when off and takes the accent colour when on, and it can also show a mixed state for a group where only some options are selected.","Use a checkbox for an option that takes effect when you submit a form, or for choosing several items from a list. For a setting that takes effect straight away, use a Switch. To pick one option from several, use a RadioGroup, and for a pressed state in a toolbar, use a Toggle.","The label is a separate element rather than a child. In a form, put each checkbox in a `FieldItem` with a `FieldLabel`, and add a `FieldDescription` if the option needs explaining. Outside a form, give the checkbox an `id` and render a Text as `<label htmlFor>`. A label that wraps the checkbox works too, such as `<Card render={<label />}>`.","Use `defaultChecked` to let the checkbox hold its own state, or `checked` with `onCheckedChange` when your app holds it. Set `indeterminate` for the mixed state, and `name` to send the value with a form. There is no `readOnly`, so use `disabled` for an option that can't be changed.","The box is as tall as one line of the text beside it, so it lines up with its label. `size` sets that height, and when you don't set it the checkbox takes the size of its Field or else the Theme's size. The area you can tap reaches beyond the visible box to the height of a Button at the same size. When you stack checkboxes, keep at least `gap=\"5\"` between them so those tap areas don't overlap.","Space toggles a focused checkbox, and clicking its label toggles it too. A screen reader reads the label and the state: checked, not checked or mixed. A focus ring shows when you reach the checkbox with the keyboard."],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "A checkbox always means the same thing, so it is always neutral when off and accent when on. If one option needs to stand out, say so in its label.",
      },
      {
        name: "`children`",
        why: "The label is a sibling element rather than a child, so the layout around them decides the space between the box and its label.",
      },
      {
        name: "`readOnly`",
        why: "HTML has no read-only checkbox, and one would look exactly like a live checkbox that ignores presses. Use `disabled` for an option that can't be changed.",
      },
    ],
  },
  {
    slug: "code",
    name: "Code",
    job: "Read",
    level: "leaf",
    spec: "§11, §15",
    declaration: `<Text>
  Run <Code>pnpm run ci</Code> first.
</Text>`,
    variants: [
      {"name":"inherited-size","title":"Size from the surrounding text","why":"With no `size` set, the code matches the heading, the body text and the small caption around it. You only set the size once, on the Text or the Heading."},
      {"name":"tones","title":"Tones","why":"`tone` changes both the fill and the text. Use it when the value itself has a meaning, such as a status code, an error name or a deprecated flag."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` changes only the text colour. The `quiet` level suits a value that no longer applies, such as an old endpoint."},
      {"name":"in-a-table","title":"Names in a table column","why":"Code in a table cell works well for names such as environment variables, and it takes the text size of the cell."},
    ],
        abstract: "Code shows a short piece of code inside a line of text, in the mono font with a light fill behind it.",
    overview: ["Code shows a short piece of code inside a line of text, such as a command, a file name or a value. It uses the mono font with a light fill behind it.","Use Code for code that sits inside a sentence. For code on several lines, use a CodeBlock, and for a key or a keyboard shortcut, use a Kbd.","`size` is optional. When you don't set it, the code takes the size of the line it sits in, so it stays small in a caption and grows in a heading. Only set `size` when the code stands on its own.","`emphasis` changes the text colour, just as it does on Text. The default is `loud`, because faded code is harder to read. `tone` changes both the text and the fill, so use it when the value itself has a meaning, such as an error code or a success status. The default tone is `neutral`.","Code renders a `<code>` element, which a screen reader reads as ordinary text. Use `render` when the document needs another element, such as `<samp>` for program output."],
    refusals: [
      {
        name: "A fill that gets louder with emphasis",
        why: "`emphasis` changes the text colour on Code just as it does on Text. If it changed the fill as well, the same prop would mean two different things.",
      },
      {
        name: "Block code",
        why: "Code on several lines needs wrapping, scrolling and a height limit, which an inline element can't provide. Use a CodeBlock for that.",
      },
    ],
  },
  {
    slug: "code-block",
    name: "CodeBlock",
    job: "Read",
    level: "leaf",
    spec: "§15, §40",
    declaration: `<CodeBlock size="2">{source}</CodeBlock>`,
    variants: [
      {"name":"with-topbar","title":"File name and copy button","why":"The `topbar` row holds a file name on one side and a copy button on the other. The button uses `done` to show a tick after copying, and `band` moves the code down so the row doesn't cover the first line."},
      {"name":"max-lines","title":"Limited height","why":"With `maxLines={6}` on a long file, six lines show and the rest scroll inside the block. Use it when a sample is long but only its start matters on the page."},
      {"name":"with-footer","title":"Status row at the bottom","why":"The `footer` row sits under terminal output. Use it for facts about the code above, such as an exit code or how long a command took."},
      {"name":"sizes","title":"Sizes","why":"The four sizes, one above the other. One `size` changes the padding, the corner and the text together, so a larger block stays in proportion."},
      {"name":"in-a-card","title":"In a card","why":"A CodeBlock inside a Card with a heading, a description and an action. The block is set into the card, so it doesn't look like a second card."},
    ],
        abstract: "CodeBlock shows several lines of code in a panel that is set into the page.",
    overview: ["CodeBlock shows several lines of code in a panel that is set into the page, such as a command to run, a file to copy or a sample API response. For a short piece of code inside a sentence, such as a prop name or a file path, use `Code` instead.","Long lines wrap only at spaces, so names and paths are never split, and a line with no spaces scrolls sideways. Set `maxLines` to limit the height to that many lines. The rest of the code scrolls rather than being cut off, so every line can still be reached with the mouse, the keyboard or a screen reader.","`size` sets the padding, the corner and the text size together. The panel uses the same fill as a Surface rather than a Card, because code is part of the page rather than an object placed on it. When the block sits inside a panel of the same kind, such as a Surface, set `hosted` to drop its own fill, border and padding.","CodeBlock doesn't highlight code itself. Use any highlighter that has a CSS-variables mode and point it at the `--code-` variables. Those colours are already checked for contrast against the panel in both light and dark mode.","Use `topbar` for a row at the top of the block, such as a file name and a copy button. When that row spans the full width, also set `band` so the first line of code starts below it. Use `footer` for a row at the bottom, such as a status line."],
    refusals: [
      {
        name: "Highlighting",
        why: "Every app has its own highlighter and languages, so CodeBlock doesn't bundle one. Point your highlighter's CSS-variables mode at the `--code-` variables instead.",
      },
      {
        name: "A switch for wrapping",
        why: "Lines always wrap at spaces, so names and paths are never split, and a line with no spaces scrolls. That works for every kind of code, so there is nothing to switch.",
      },
      {
        name: "A copy button, line numbers, and a collapse",
        why: "Put a copy button in `topbar`, and add line numbers in your highlighter. Long code scrolls with `maxLines` rather than collapsing, so no line is ever hidden.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A block of code has no meaning to colour and no reason to be louder than another block. The syntax colours come from your highlighter and the `--code-` variables.",
      },
      {
        name: "A Card as the panel",
        why: "Code is part of the page rather than an object placed on it, so the panel uses the fill of a Surface instead of a Card.",
      },
    ],
  },
  {
    slug: "combobox",
    name: "Combobox",
    job: "Choose",
    level: "leaf",
    spec: "§20, §21, §23, §28, §50",
    abstract: "Combobox lets people type to narrow a long list of options and then pick one.",
    overview: ["Use a Combobox when the list of options is too long to scan, such as countries, time zones or team members. The person types a few letters, the list shrinks to the options that match, and they pick one. For a short list of about ten options or fewer, use `Select`. To run commands rather than choose a value, use `Command`.","The typed text only filters the list. It never becomes the value, so a form always receives one of your options. Matching compares the text against each option's label and keeps the options that contain it. For this reason `ComboboxList` accepts a function rather than children: you describe how to render one option, and the list renders only the options that match.","Pass every option in `items`. An option is either a string or an object with a `value` and a `label`, in which case people search and read the label and the form receives the value. Keep the `items` array stable by defining it outside your component or in a `useMemo`, because a new array on every render makes the filter run again.","Set `name`, `required`, `disabled`, `readOnly` and `form` on `Combobox`, because the chosen value belongs to the root. The field looks and behaves like a `TextField`, and the panel matches the panel of a `Select`. `size` sets both, and each size matches a `TextField` or a `Button` of the same size. Inside a `Field`, the field's size applies unless you set one.","The input has the `combobox` role and tells a screen reader whether the list is open. The arrow keys move through the options, Enter picks the highlighted one, and Escape closes the panel. After you type, the first match is highlighted, so a few letters and Enter are enough. The list takes its accessible name from the field, such as a `Field` label or the input's `aria-label`.","The part names follow shadcn/ui's combobox (MIT), and the behaviour comes from Base UI's Combobox."],
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
      {"name":"groups","title":"Grouped options","why":"Regions sorted into sections with `ComboboxGroup` and `ComboboxLabel`. When nothing in a section matches what you type, the section and its heading disappear together."},
      {"name":"object-options","title":"Values and labels","why":"Options written as objects with a `value` and a `label`. People search and read the label, and the form receives the value, so London submits as `eu-west-2`."},
      {"name":"controlled","title":"Controlled","why":"A time zone held in state with `value` and `onValueChange`, and shown in a sentence below the field. The callback runs when a person picks an option, and not while they type."},
      {"name":"in-a-form","title":"In a form","why":"A required Combobox inside a `Field` with a label, a description and an error. `name` and `required` go on the Combobox, and the error appears if the form is submitted with no choice."},
      {"name":"disabled","title":"Disabled","why":"A disabled Combobox, a read-only Combobox and a list with one disabled option. A read-only Combobox shows and submits its value, but its list does not open."},
      {"name":"with-icon","title":"Icon before the text","why":"An icon in the `leading` slot. The chevron always sits at the end of the field, so an icon can only go before the text."},
      {"name":"sizes","title":"Sizes","why":"The four sizes, one above the other. The field, the panel, the rows and the text change together, and each size matches a `TextField` or a `Button` of the same size."},
    ],
    topics: [
      { title: "Typing and picking", symbols: ["Combobox", "ComboboxInput"] },
      { title: "Showing the panel", symbols: ["ComboboxContent"] },
      { title: "Listing the options", symbols: ["ComboboxList", "ComboboxItem", "ComboboxEmpty"] },
      { title: "Grouping options into sections", symbols: ["ComboboxGroup", "ComboboxLabel", "ComboboxCollection"] },
    ],
    refusals: [
      {
        name: "Free text with suggestions",
        why: "A Combobox always submits one of your options and never the typed text. For a command palette, use `Command`. A text field that accepts any text and offers suggestions is not available yet.",
      },
      {
        name: "`multiple`",
        why: "Choosing several values would need removable chips inside the field, and that design does not exist yet. For now, use a group of checkboxes in a `Field`.",
      },
      {
        name: "A custom matcher, a result limit and inline completion",
        why: "The typed text always filters the options by label. To match in a different way, filter the options yourself and pass the shorter list to `items`.",
      },
      {
        name: "`disabled`, `readOnly`, `name`, `required` and `form` on the input",
        why: "Set these on `Combobox`. On the input they would act on the typed letters rather than the chosen option, so the form would submit the wrong value.",
        on: ["ComboboxInput"],
      },
      {
        name: "A Separator inside the panel",
        why: "A list of options may contain only options and groups, so a separator fails accessibility checks. Use `ComboboxGroup` to divide the options instead.",
      },
      {
        name: "`render` on the input",
        why: "The field is two elements, a visible box and the input inside it, so a `render` prop could only replace one of them. Use `className` and `style` for the box and `ref` for the input.",
        on: ["ComboboxInput"],
      },
      {
        name: "A clear button",
        why: "The chevron fills the end of the field, and a clear button beside it has not been designed yet. A person can select the text and delete it to clear the choice.",
      },
    ],
    parts: [
      { part: "ComboboxInput", blurb: "The field that people type in. `className` and `style` apply to the visible box, and `ref` points to the input inside it. The chevron at the end opens the list with a pointer, and the keyboard opens it with the arrow keys" },
      { part: "ComboboxContent", blurb: "The panel that holds the list. It opens below the field, renders in a portal with your theme settings, and is never narrower than the field" },
      { part: "ComboboxList", blurb: "The list of options. It accepts a function and calls it once for each option that matches, and it takes its accessible name from the field unless you give it one" },
      { part: "ComboboxCollection", blurb: "Renders the matching options inside one `ComboboxGroup`, so each section can shrink or empty on its own while the others stay" },
      { part: "ComboboxItem", blurb: "One option. Space for the tick is always kept, so chosen and unchosen rows line up. Write the option's label as its text, because the field shows that label after a choice" },
      { part: "ComboboxGroup", blurb: "A section with its own options. When no option in the section matches, the section and its heading are hidden" },
      { part: "ComboboxLabel", blurb: "A heading above a set of options. It works inside a group or on its own, and the keyboard skips over it" },
      { part: "ComboboxEmpty", blurb: "The message shown when no option matches. A screen reader announces it when it appears, and it takes up no space while it is empty" },
    ],
  },
  {
    slug: "context-menu",
    name: "ContextMenu",
    job: "Act",
    level: "leaf",
    spec: "§21, §22, §42",
    abstract: "ContextMenu opens a menu at the pointer when someone right-clicks an area, or long-presses it on a touch screen.",
    overview: ["Use a ContextMenu for shortcuts to actions on the thing under the pointer, such as renaming, duplicating or deleting a file. A right-click is hard to discover, so make every action in a context menu available somewhere else too, such as a button or a `Menu`. To open a menu from a visible button, use `Menu`.","You build the menu from the same parts as a `Menu`: `MenuItem`, `MenuGroup`, `MenuLabel`, `MenuCheckboxItem`, `MenuRadioGroup`, `MenuSub` and their children. The panel and the rows look exactly like a `Menu`.","Wrap the area in `ContextMenuTrigger`. It catches the right-click and the long press, and it stops the browser's own menu from opening. It adds no fill, border or cursor, so the area looks the same as before. To make an existing element the area, pass it to `render`.","The panel opens with its corner at the point you clicked and moves as needed to stay inside the window, so there are no placement props. `size` sets the size of the panel and its rows.","The keyboard works as it does in a `Menu`: the arrow keys move through the rows, Enter chooses a row, typing a letter jumps to a matching row, and Escape closes the panel.","The behaviour comes from Base UI's ContextMenu."],
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
      {"name":"groups","title":"Grouped rows","why":"Rows sorted into `MenuGroup` sections, each named by a `MenuLabel`. A screen reader announces the label with its group, and the keyboard skips over it."},
      {"name":"shortcuts","title":"Icons and shortcuts","why":"Icons in the `leading` slot and keyboard shortcuts in the `trailing` slot. Every label starts at the same position, whether or not its row has an icon."},
      {"name":"checkable","title":"Checkbox and radio rows","why":"`MenuCheckboxItem` rows for settings that turn on and off, and a `MenuRadioGroup` for one choice out of several. These rows keep the menu open, so a person can change several settings at once."},
      {"name":"submenu","title":"Submenus","why":"`MenuSub` rows that open a second panel beside the first. Hover over the row, or press the Right Arrow key, to open it."},
      {"name":"disabled","title":"Disabled","why":"A menu with two disabled rows, one of them destructive. A disabled row stays visible and a screen reader still announces it, so a person knows the action exists."},
      {"name":"per-row","title":"One menu for each item","why":"A file list in which each row has its own ContextMenu, so the menu acts on the row that was right-clicked. The rows look the same with or without the trigger."},
    ],
    topics: [
      { title: "Catching the right-click", symbols: ["ContextMenu", "ContextMenuTrigger"] },
      { title: "Showing the panel", symbols: ["ContextMenuContent"] },
    ],
    refusals: [
      {
        name: "`ContextMenuItem` and a second set of parts",
        why: "A context menu's rows are the same components as a menu's rows, so a second set of names would only duplicate them. Use `MenuItem`, `MenuGroup`, `MenuSub` and the other menu parts directly.",
      },
      {
        name: "`side`, `align` and an offset",
        why: "The panel's corner always opens at the point that was clicked, and the window decides which corner fits. There is nothing left for these props to choose.",
      },
      {
        name: "A style for the trigger area",
        why: "A right-click happens over content that is already visible, so the trigger adds no fill, border or cursor. Style the element inside it as you normally would.",
      },
      {
        name: "Opening on a left click",
        why: "A menu that opens on a left click is a `Menu` with a visible trigger. One panel that answered two different gestures would be hard for people to predict.",
      },
    ],
    parts: [
      { part: "ContextMenuTrigger", blurb: "The area where a right-click or a long press opens the menu. It adds nothing visible, so wrap it around the content people already see" },
      { part: "ContextMenuContent", blurb: "The panel, which opens at the point that was clicked. Put `MenuItem` and the other menu parts inside it" },
    ],
  },
  {
    slug: "dialog",
    name: "Dialog",
    job: "Focus",
    level: "leaf",
    spec: "§10, §20, §24",
    abstract: "Dialog shows a panel over a dimmed page for a short task that needs a person's full attention.",
    overview: ["Use a Dialog for a short task that must be finished or cancelled before a person goes back to the page, such as editing settings or renaming a project. To ask a yes-or-no question before a risky action, use `AlertDialog`. For a small panel that leaves the page usable, use `Popover`. For a panel attached to an edge of the window, use `Sheet`.","The panel looks like a `Card` with a slightly rounder corner, and the page behind it is dimmed. In a theme with `depth=\"elevated\"` it has the same shadow as a `Card`, and nothing more, because the dimmed page already shows that the dialog is on top. On a narrow window the panel is attached to the bottom edge of the screen instead of being centred.","Write the layout inside the panel yourself with `Stack` and `Flex`. `size` sets the panel's maximum width, padding and corner, and the text size of `DialogTitle` and `DialogDescription`. Any other text you add keeps its own size. There is no close button in the corner, so put a `DialogClose` button where your layout needs one.","The panel grows with its content. To limit its height, set `maxHeight` in the `style` of `DialogContent` and put a `ScrollArea` inside, so the long content scrolls while the title and the buttons stay in view.","Open a dialog with `DialogTrigger`, or control it with `open` and `onOpenChange`. `onOpenChange` receives the reason for closing, such as `escape-key` or `outside-press`, and you can call `cancel()` to keep the dialog open, for example while a person has unsaved text.","When the dialog opens, focus moves into the panel and Tab stays inside it. Escape or a press outside the panel closes it, and focus then returns to the trigger. A screen reader announces the dialog by its `DialogTitle` and reads the `DialogDescription` with it, so always include a title.","The part names follow shadcn/ui's dialog (MIT), and the behaviour comes from Base UI's Dialog."],
    declaration: `<Dialog>
  <DialogTrigger render={<Button>Rename project</Button>} />
  <DialogContent>
    <DialogTitle>Rename project</DialogTitle>
    <DialogDescription>\n      Everyone with access sees the new name.\n    </DialogDescription>
    <DialogClose render={<Button emphasis="loud">Save</Button>} />
  </DialogContent>
</Dialog>`,
    variants: [
      {"name":"in-a-form","title":"In a form","why":"Project settings in a form inside the panel, with `open` held in state. Enter submits the form, and the dialog closes only after the submit handler runs."},
      {"name":"controlled","title":"Controlled","why":"A dialog with no `DialogTrigger`, opened from state when an export finishes. Use this when something other than a button opens the dialog."},
      {"name":"scrolling-content","title":"Scrolling content","why":"A `maxHeight` on `DialogContent` with a `ScrollArea` around a long list. The list scrolls, and the title and the button stay in view."},
      {"name":"unsaved-changes","title":"Protect unsaved text","why":"`onOpenChange` calls `cancel()` when Escape or an outside press would close a dialog that holds a draft. The Discard and Send buttons still close it."},
      {"name":"from-a-menu","title":"Open from a menu row","why":"A `Menu` row that opens a rename dialog. The dialog sits outside the menu and is opened from state, because the menu closes as soon as the row is chosen."},
    ],
    topics: [
      { title: "Opening the dialog", symbols: ["Dialog", "DialogTrigger"] },
      { title: "Showing the panel", symbols: ["DialogContent"] },
      { title: "Naming the dialog", symbols: ["DialogTitle", "DialogDescription"] },
      { title: "Closing the dialog", symbols: ["DialogClose"] },
    ],
    refusals: [
      {
        name: "`DialogHeader` and `DialogFooter`",
        why: "A header and a row of actions are layout, so write them with `Stack` and `Flex`. `DialogTitle` and `DialogDescription` exist because a screen reader needs them to name the dialog.",
      },
      {
        name: "A prop to choose the presentation, and dragging to close",
        why: "The window width decides whether the panel is centred or attached to the bottom edge, and it stays the same element either way. Dragging would need code running on every pointer move.",
      },
      {
        name: "A height prop",
        why: "The panel grows with its content. To limit it, set `maxHeight` in the `style` of `DialogContent` and put a `ScrollArea` inside.",
      },
      {
        name: "A close button in the corner",
        why: "Escape and a press outside the panel already close the dialog. Put a `DialogClose` button wherever your layout needs one, usually beside the other actions.",
      },
      {
        name: "`modal` and `disablePointerDismissal`",
        why: "A dialog always keeps focus inside it and stops the page from scrolling. For a panel that leaves the page usable, use `Popover`. To stop an outside press from closing it, use `AlertDialog`.",
      },
      {
        name: "A shadow of its own",
        why: "The dimmed page already shows that the dialog is on top. In a theme with `depth=\"elevated\"` the panel has the same shadow as a `Card`.",
      },
      {
        name: "`size` on the title",
        why: "The dialog's `size` sets the size of the title and the description, so they always match the panel. Other text that you add keeps its own size.",
        on: ["DialogTitle", "DialogDescription"],
      },
    ],
    parts: [
      { part: "DialogTrigger", blurb: "The button that opens the dialog, usually `render={<Button />}`. If your own state opens the dialog, you don't need a trigger" },
      { part: "DialogContent", blurb: "The panel. It renders in a portal with your theme settings, dims the page and centres itself. If the panel is taller than the window, the area around it scrolls" },
      { part: "DialogTitle", blurb: "The heading of the dialog and its accessible name. It renders a heading element, sized by the dialog's `size`" },
      { part: "DialogDescription", blurb: "A line of supporting text in the muted text colour. A screen reader reads it after the title" },
      { part: "DialogClose", blurb: "A button that closes the dialog. Place it in your layout beside the other actions, usually with `render={<Button />}`" },
    ],
  },
  {
    slug: "field",
    name: "Field",
    job: "Enter",
    level: "pattern",
    spec: "§28",
    abstract: "Field gives one form control a label, a description and an error message, and connects all three to it.",
    overview: ["Put each form control in a Field: a `TextField`, a `TextArea`, a `Select`, a `Combobox`, a `NumberField`, or a group of checkboxes or radios. The Field connects the label, the description and the error to the control, so a screen reader announces them together.","The parts always appear in the same order: label, control, description, error. The label sits directly above the control it names. The description says what to enter, and it stays visible when an error appears. The error says what went wrong.","Every Kookie control connects to the Field around it, so you add no ids or extra props. `FieldLabel` renders a real `<label>`, so clicking it moves focus to the control. `FieldError` shows only while the field is invalid, and a screen reader announces it when it appears.","You can show an error in three ways. For a browser check, set `required` or another constraint on the control and give `FieldError` a `match` such as `valueMissing`. For your own rules, pass a `validate` function to the Field, which returns a message or `null`. When your server rejects a value, set `invalid` on the Field and give `FieldError` the prop `match={true}`.","`size` on the Field sets the size of the label, the description, the error and the control together, although a control with its own `size` keeps it. `disabled` on the Field disables the control inside it.","In a group of checkboxes or radios, wrap each option in a `FieldItem`, which gives that option its own label and description. Leave at least 12 pixels between options so that each one is easy to tap; `gap=\"5\"` on a `Stack` keeps that distance at every density.","The behaviour comes from Base UI's Field."],
    declaration: `<Field>
  <FieldLabel>Email</FieldLabel>
  <TextField type="email" />
  <FieldDescription>We use this for receipts.</FieldDescription>
  <FieldError match={true}>That address is short.</FieldError>
</Field>`,
    variants: [
      {"name":"required","title":"Required field","why":"`required` on the control, with a `FieldError` that uses `match=\"valueMissing\"`. The message appears when a person submits the form without a value."},
      {"name":"validation","title":"Custom validation","why":"A `validate` function on the Field that checks the value when the control loses focus. It returns a message or `null`, and a `FieldError` with no children shows that message."},
      {"name":"server-error","title":"Error from your server","why":"`invalid` on the Field with an error message below it. The description stays in place, because it still tells the person what to enter."},
      {"name":"disabled","title":"Disabled","why":"A disabled Field beside an enabled one. Setting `disabled` on the Field also disables the control inside it, so you set it only once."},
      {"name":"checkboxes","title":"A group of checkboxes","why":"A `FieldItem` for each checkbox, each with its own label and description. The Field's label names the whole group, and the last option is disabled."},
      {"name":"with-select","title":"With a Select","why":"A `Select` inside a Field. The label names the select, and a screen reader reads the description with it, with no extra props."},
      {"name":"with-text-area","title":"With a text area","why":"A `TextArea` inside a Field. It works the same way as a `TextField` and fills the width of the Field."},
    ],
    topics: [
      { title: "Naming one control", symbols: ["Field", "FieldLabel"] },
      { title: "Adding a description and an error", symbols: ["FieldDescription", "FieldError"] },
      { title: "Naming one option in a group", symbols: ["FieldItem"] },
    ],
    refusals: [
      {
        name: "`FieldControl`",
        why: "Every Kookie control already connects to the Field around it. Put the control directly inside the Field, and it gets its id, label and description automatically.",
      },
      {
        name: "`orientation`",
        why: "A field with its label beside the control needs its own layout, because the error must line up under the control rather than under the label. To build one, pass your own grid to the Field's `render` prop.",
      },
      {
        name: "A choice about where the error goes",
        why: "The error always follows the description, below the control. Keeping one order means every field on a screen reads the same way.",
      },
      {
        name: "An error that replaces the description",
        why: "Both are shown, because they say different things. The description says what to enter, and the error says what went wrong.",
      },
      {
        name: "`Form`",
        why: "A `Form` component that assigns server errors to fields by name is not available yet. For now, set `invalid` on each Field that your server rejects.",
      },
    ],
    parts: [
      { part: "FieldItem", blurb: "One option in a group of checkboxes or radios. It holds the control, its own label and its own description, and it puts the words beside the control" },
      { part: "FieldLabel", blurb: "The name of the field, in medium weight. It renders a real `<label>`, so clicking it moves focus to the control" },
      { part: "FieldDescription", blurb: "Text that says what to enter, in the muted text colour. A screen reader announces it together with the control" },
      { part: "FieldError", blurb: "Text that says what went wrong, in the destructive colour. It shows only while the field is invalid, and a screen reader announces it when it appears" },
    ],
  },
  {
    slug: "flex",
    name: "Flex",
    job: "Arrange",
    level: "leaf",
    spec: "§3",
    declaration: `<Flex gap="3" align="center" justify="space-between">
  …
</Flex>`,
    variants: [
      {"name":"space-between","title":"Title and actions","why":"`justify=\"space-between\"` with a title at one end and a group of buttons at the other. A second Flex groups the buttons with a gap of their own."},
      {"name":"wrap","title":"Wrapping to new lines","why":"`wrap=\"wrap\"` with a set of chips. Items move to a new line when the row runs out of room, and `gap` spaces both the items and the lines."},
      {"name":"grow","title":"A child that fills the space","why":"A search field in a `Box` with `flexGrow=\"1\"`, beside two buttons. The field takes the free space, and the buttons keep their natural width."},
      {"name":"responsive","title":"Column to row","why":"`direction`, `align` and `gap` with a value for each breakpoint. The content stacks in a narrow container and becomes a row from the `md` breakpoint."},
      {"name":"baseline","title":"Baseline alignment","why":"`align=\"baseline\"` with text in three sizes. The first lines of text line up, which `center` cannot do when the sizes differ."},
      {"name":"inline","title":"Inside a line of text","why":"`display=\"inline-flex\"` inside a sentence. The icon and its words stay together and flow with the text around them."},
    ],
    abstract: "Flex arranges its children in a row or a column, with even space between them.",
    overview: ["Use a Flex for a row of buttons, a toolbar, or a title with actions beside it. For a single column with even spacing, use `Stack`. To line children up in rows and columns at the same time, use `Grid`.","Flex is a `Box` with `display: flex`, so it accepts the Box props plus `direction`, `align`, `justify`, `wrap` and `gap`. It has no grid props, so TypeScript reports an error if you set `columns` or `rows`. Use `display=\"inline-flex\"` to place a Flex inside a line of text.","Set the space between children with `gap`. Its values are steps on the spacing scale, and the theme's density decides how large each step is. To let one child take the free space, wrap it in a `Box` with `flexGrow=\"1\"`.","Most props accept either one value or a value for each breakpoint, such as `direction={{ initial: \"column\", md: \"row\" }}`. The breakpoints measure the nearest `Box` with `container`, or the whole app when there is none. `display` accepts one value only, so use a `Box` if you need it to change with the width.","Flex adds nothing visible and has no role, so a screen reader reads its children in the order you write them. Keep that order the same as the order on screen."],
    refusals: [{ name: "`margin` on the children", why: "Components have no margin props, so the space between siblings is set once, with `gap` on the Flex. This keeps the spacing in a row consistent." }],
  },
  {
    slug: "grid",
    name: "Grid",
    job: "Arrange",
    level: "leaf",
    spec: "§3",
    declaration: `<Grid columns="repeat(3, minmax(0, 1fr))" gap="4">
  …
</Grid>`,
    variants: [
      {"name":"responsive","title":"Responsive columns","why":"`columns` with a value for each breakpoint. The grid shows one column in a narrow container, two from `sm` and three from `md`."},
      {"name":"areas","title":"Named areas","why":"Regions named once with `areas`, and each child placed with `gridArea`. Use this for a page layout with a header, a navigation column and a main area."},
      {"name":"spanning","title":"Spanning columns","why":"Children with `gridArea=\"auto / span 2\"`, which makes them two columns wide. A bare `span 2` sets the number of rows, not columns."},
      {"name":"gap-axes","title":"Row and column gaps","why":"`gapX` and `gapY` set the column gap and the row gap separately. The wider column gap keeps each term and its value reading as one line."},
      {"name":"in-a-form","title":"In a form","why":"Short fields that belong together in two columns, with the address spanning both. In a narrow container the form changes to one column."},
      {"name":"container","title":"In a container","why":"A grid inside a narrow `Box` marked `container`. Breakpoints follow that box rather than the window, so the grid stays at one column even in a wide window."},
    ],
    abstract: "Grid lines its children up in rows and columns at the same time.",
    overview: ["Use a Grid when children must line up in two directions, such as a set of cards or a form with two columns. For a single row, use `Flex`. For a single column with even spacing, use `Stack`.","Grid is a `Box` with `display: grid`, so it accepts the Box props plus `columns`, `rows`, `areas`, `flow`, `gap`, `gapX` and `gapY`. It has no `direction` or `wrap` props, because a grid ignores them, and TypeScript reports an error if you set them.","`columns`, `rows` and `areas` accept CSS template values as strings, such as `repeat(3, minmax(0, 1fr))`. The gap props accept steps on the spacing scale, and the theme's density decides how large each step is. Place a child in a named area or across several columns with `gridArea` on a `Box`.","Most props accept either one value or a value for each breakpoint: `{ initial, sm, md, lg }`. The breakpoints measure the nearest `Box` with `container`, or the whole app when there is none, so the same grid adapts to a narrow panel and to a wide page.","A Grid has no keyboard or screen-reader behaviour of its own. The order of the children in your code is the reading order and the tab order, so keep it the same as the order on screen when you move children with `areas` or `gridArea`."],
    refusals: [{ name: "Shortcut props for auto-placement", why: "Grid adds props only where they connect to the spacing scale, the breakpoints or a type check. For any other layout, write the CSS template in `columns`, such as `repeat(auto-fill, minmax(12rem, 1fr))`." }],
  },
  {
    slug: "heading",
    name: "Heading",
    job: "Read",
    level: "leaf",
    spec: "§15",
    declaration: `<Heading size="7" render={<h2 />}>A section</Heading>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The sizes a screen normally uses: 8 for a page, 7 for a section and 6 for a card title. A smaller size, such as 4, suits a heading inside a card."},
      {"name":"levels","title":"Outline levels","why":"An `h1` at size 7 with an `h2` at size 4 below it. `render` sets the level and `size` sets how large it looks, so you can make a heading smaller and keep the levels in order."},
      {"name":"emphasis","title":"Emphasis","why":"Headings at the three emphasis levels: loud, medium and quiet. Use `medium` or `quiet` for a label above a group, so it does not compete with the headings that name content."},
      {"name":"tones","title":"Tones","why":"A neutral heading beside a `warning` heading and a `destructive` heading. The tone carries a meaning, and the theme picks the colour in light and dark mode."},
      {"name":"in-a-card","title":"In a card","why":"A card title at size 6 with a short description below it and a button at the end of the row. This is the most common use of a Heading."},
    ],
    abstract: "Heading shows a title for a page, a section or a card in the heading font.",
    overview: ["Use a Heading for the title of a page, a section or a card. For body text and labels, use `Text`. For a page title that moves into the toolbar when the page scrolls, use `Page`.","A Heading uses the same nine-step size scale as `Text`, so `size=\"4\"` is the same size on both. On most screens, use size 8 for a page title, 7 for a section and 6 for a card title. The default size is 6.","Size and level are set separately. `size` sets how large the heading looks, and `render` sets the element and its level, such as `render={<h1 />}`. Without `render`, a Heading renders an `<h2>`.","The default weight is medium, and semibold is the heaviest weight available. `emphasis` sets how strong the text colour is. `tone` gives the words a meaning, such as `destructive`, and most headings leave it unset so the words match the surface they sit on.","A screen reader announces a heading with its level, and many people move through a page by its headings. Keep the levels in order, and change `size` rather than the level when a heading needs to look smaller."],
    refusals: [
      {
        name: "A `level` prop",
        why: "The level of a heading describes the structure of the document, not how it looks. Set it with `render`, such as `render={<h3 />}`, and set the look with `size`.",
      },
    ],
  },
  {
    slug: "kbd",
    name: "Kbd",
    job: "Read",
    level: "leaf",
    spec: "§11, §15",
    declaration: `<Kbd>⌘K</Kbd>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The same key in three sizes of text, with no `size` set on the key. Without `size`, a key matches the text around it."},
      {"name":"combinations","title":"Key combinations","why":"A separate Kbd for each key in a shortcut. Words that join the keys, such as \"then\", go in the surrounding text."},
      {"name":"in-a-menu","title":"In a menu","why":"Shortcuts in the `trailing` slot of menu rows. The key matches the row's size and sits at the end of the row."},
      {"name":"shortcut-list","title":"A list of shortcuts","why":"A reference list with the action at the start of each row and the key at the end. Use it in a help panel or on a settings page."},
    ],
    abstract: "Kbd shows a key or a keyboard shortcut, such as ⌘K.",
    overview: ["Use a Kbd to show a key or a shortcut that a person presses. For code, such as a command or a file name, use `Code`. For a short label or a status, use `Chip`. In a `Menu`, put a Kbd in a row's `trailing` slot to show that row's shortcut.","A Kbd looks like a small key cap, with a subtle fill, a grey border and a slight raised shadow. It uses the body font rather than a code font, so symbols such as ⌘ draw at their normal size. It is exactly one line tall, so it never pushes apart the lines of text around it.","Without `size`, a key matches the size of the text around it, so set `size` only when the key stands alone. `tone` changes the colour of the letters and the fill, and the border stays grey.","A Kbd renders a `<kbd>` element, which tells a screen reader that the text is keyboard input."],
    refusals: [
      {
        name: "A shadow that follows `depth`",
        why: "A key cap shows a slight raised shadow in every theme, including `depth=\"flat\"`, because it is a picture of a physical key. On a glass panel the shadow is removed.",
      },
    ],
  },
  {
    slug: "link",
    name: "Link",
    job: "Go",
    level: "leaf",
    spec: "§11, §15",
    declaration: `<Link href="/plans">the plans on this workspace</Link>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Links inside sentences of two sizes, with no `size` set, and one standalone link with `size=\"3\"`. Set `size` only when a link stands on its own line."},
      {"name":"tones","title":"Tones","why":"A link in the default `accent` tone, a `destructive` link to a destructive action, and a `neutral` link that should not draw attention."},
      {"name":"external","title":"External links","why":"An anchor with `target` and `rel`, passed through `render`, for a page on another site. An icon after the words shows that the link leaves the app."},
      {"name":"standalone","title":"Standalone links","why":"A column of links outside any sentence, such as in a footer or a help panel. Each link has a size, and a short label names the group."},
    ],
    abstract: "Link takes people to another page or another place, inside a sentence or on its own line.",
    overview: ["Use a Link to go somewhere, such as another page, a section or another site. To perform an action, such as saving or deleting, use a `Button`. A Link renders an `<a>` element, and its text stays selectable and wraps across lines like the sentence around it.","Without `size` and `weight`, a link matches the text around it. It uses the `accent` tone by default. Set `tone` when the destination carries a meaning, such as `destructive`, or `neutral` when the link should not draw attention.","A link is always underlined, because colour alone does not identify a link (WCAG 1.4.1) and a touch screen has no hover. The underline is a light grey line, and it changes to the colour of the text when the pointer is over the link.","To use your router's link component, or an anchor with `target` and `rel`, pass it to `render`. Link adds its text styles, underline and focus ring, and the element keeps its own attributes.","Tab moves focus to a link and Enter follows it. A screen reader announces it as a link and uses its text as its name, so write text that makes sense on its own, such as \"the plans on this workspace\" rather than \"click here\"."],
    refusals: [
      {
        name: "`emphasis`",
        why: "People need to find a link, and a lower emphasis would fade its colour and make it harder to find. To make a link less prominent, give it a smaller `size`.",
      },
      {
        name: "A style for visited links",
        why: "Browsers hide visited styles from scripts to protect a person's history, so the package cannot test a visited style and does not include one.",
      },
      {
        name: "An underline that shows only on hover",
        why: "A person who cannot tell the link's colour from the text must still find it, and a touch screen has no hover. The underline is always visible, and only its colour changes on hover.",
      },
      {
        name: "A larger tap area",
        why: "WCAG exempts links inside a sentence from the minimum target size, and a link cannot grow a larger area without moving the text around it.",
      },
    ],
  },
  {
    slug: "list",
    name: "List",
    job: "Read",
    level: "leaf",
    spec: "§11, §15, §52",
    abstract: "List shows items of text as a bulleted list or a numbered list.",
    overview: ["Use a List for items of text, such as the features of a plan or the steps of a task. For items with no markers, use `Stack`. For items with icons or actions, use `Row`. For items that each have several values, use `Table`.","Set `ordered` when the order of the items matters, such as steps to follow or a ranking, and the List renders an `<ol>` with numbers. Otherwise it renders a `<ul>` with bullets. On a numbered list, `start` and `reversed` change what the numbers say. A bulleted list does not accept them.","A List accepts the same `size`, `weight`, `emphasis` and `tone` props as `Text`, and the default size is 3. The space for the markers grows with the text size. Bullets always use the faint text colour, so they stay in the background, while numbers use the same colour as the words, because people read and refer to them.","To nest a list, put a List inside a `ListItem`. It indents one level and takes the text size of the item, so it needs no props.","A screen reader announces a list and the number of items in it."],
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
      {"name":"ordered","title":"Numbered lists","why":"`ordered` on a list of setup steps. Use it when the order is information, and a screen reader then announces a numbered list."},
      {"name":"resumed","title":"Continued numbering","why":"Two numbered lists with a paragraph between them, and `start={3}` on the second. The numbers stay correct when a person refers to a step."},
      {"name":"sizes","title":"Sizes","why":"The same list at sizes 2, 3 and 4. `size` uses the same scale as `Text`, and the space for the markers grows with it."},
      {"name":"emphasis","title":"Emphasis","why":"A list of details at `emphasis=\"medium\"` under a main statement. The words use a quieter colour, and the bullets stay faint."},
      {"name":"tones","title":"Tones","why":"A `destructive` list of what a delete removes. Use a tone when the whole list carries one meaning, and the words and the markers both change colour."},
      {"name":"in-a-card","title":"In a card","why":"A list of plan features between a card's title and its button. The card sets the padding, and a `Stack` sets the space between the parts."},
    ],
    topics: [
      { title: "Creating the list", symbols: ["List"] },
      { title: "Adding one item", symbols: ["ListItem"] },
    ],
    refusals: [
      {
        name: "A custom marker",
        why: "The list type sets the marker: bullets for a bulleted list and numbers for a numbered one. For no markers, use a `Stack`. For icons, use `Row`.",
      },
      {
        name: "`render`",
        why: "`ordered` chooses between `<ul>` and `<ol>`. Any other element would not be announced as a list by a screen reader.",
      },
      {
        name: "A `gap` or density prop",
        why: "The space between items is set by the theme, so every list in your app has the same spacing. To change it for the whole app, set the theme's density.",
      },
      {
        name: "A description list",
        why: "A `<dl>` pairs terms with their details, which is a different structure from a list of items. It is planned as a separate component.",
      },
    ],
    parts: [
      { part: "ListItem", blurb: "One item, rendered as an `<li>`. It uses the text size, weight and colour of its list, and a List placed inside it indents one level" },
    ],
  },
  {
    slug: "menu",
    name: "Menu",
    job: "Act",
    level: "leaf",
    spec: "§20, §21, §22",
    abstract: "Menu opens a floating list of actions from a button, such as Rename or Delete for a file.",
    overview: ["A Menu opens a floating list of actions when someone presses its trigger. Each row is one action, and choosing a row runs it and closes the menu. Use a Menu when the choices are things to do. Use a `Select` to choose a value in a form, a `ContextMenu` for actions that open at the pointer on a right-click, and a `Popover` for a floating panel that holds other content, such as a short form.","A row can show an icon in `leading` and a keyboard shortcut in `trailing`, and `tone=\"destructive\"` marks an action that deletes something. Checkbox rows and radio rows show a setting's current state, and a submenu holds a related set of choices. Put a `<Separator>` between groups of rows. Rows without an icon still line up with rows that have one, because the space for the icon is always kept.","Set `size` on the `Menu` to size the rows, icons and text in the panel, and give the trigger button the same size. The panel follows the theme: in a raised theme it casts a shadow, in a flat theme it shows a thin edge instead, and with a glass material it uses glass.","Enter or Space on the trigger opens the menu. The arrow keys move between rows, typing a few letters jumps to the row that starts with them, and Escape closes the menu and returns focus to the trigger. The arrow key that points in the reading direction opens a submenu. Screen readers announce the menu, each row, and whether a checkbox or radio row is checked.","The part names follow shadcn/ui's dropdown menu (MIT), and the behaviour comes from Base UI's Menu."],
    declaration: `<Menu>
  <MenuTrigger render={<Button>Actions</Button>} />
  <MenuContent>
    <MenuGroup>
      <MenuLabel>File</MenuLabel>
      <MenuItem trailing={<Kbd>⌘D</Kbd>}>Duplicate</MenuItem>
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
      {"name":"disabled","title":"Disabled and destructive rows","why":"A disabled row stays in the list and screen readers still announce it, because an action that isn't available right now is different from one that doesn't exist. The last row uses `tone=\"destructive\"` for an action that deletes something."},
      {"name":"rtl","title":"Right to left","why":"Inside a right-to-left layout, the panel lines up with the other edge of the trigger and a submenu opens to the left. The menu takes its direction from the trigger, so you don't set anything on the menu itself."},
      {"name":"sizes","title":"Sizes","why":"Set `size` on the `Menu`, and give the trigger button the same size. The rows, icons and text in the panel all change with it."},
      {"name":"with-icons","title":"With icons","why":"Put an icon in `leading` and a `<Kbd>` shortcut in `trailing`. A row without an icon still lines up with the rows that have one."},
      {"name":"checkbox-items","title":"Checkbox rows","why":"Each checkbox row turns one setting on or off, here the columns shown in a table. Pass `checked` and `onCheckedChange` to keep the values in your own state."},
      {"name":"radio-items","title":"Radio rows","why":"Radio rows choose one value from a set, such as a sort order. The trigger shows the current choice, so people can see it without opening the menu."},
      {"name":"submenu","title":"Submenus","why":"Use a submenu for a related set of choices that would make the main list too long. A submenu opens on hover, on a press, or with the arrow key."},
      {"name":"links","title":"Rows that are links","why":"When a row goes to a page, pass an anchor to `render` so the row becomes a real link. You can pass your router's link component in the same way, and the row is still one target."},
      {"name":"placement","title":"Placement","why":"`side` chooses which edge of the trigger the panel opens from, and `align` chooses where it lines up along that edge. If there isn't room, the panel moves so that it stays on screen."},
    ],
    topics: [
      { title: "Opening the menu", symbols: ["Menu", "MenuTrigger"] },
      { title: "Presenting the panel", symbols: ["MenuContent"] },
      { title: "Listing actions", symbols: ["MenuItem"] },
      { title: "Grouping into sections", symbols: ["MenuGroup", "MenuLabel"] },
      { title: "Rows that show a state", symbols: ["MenuCheckboxItem", "MenuRadioGroup", "MenuRadioItem"] },
      { title: "Nesting a menu", symbols: ["MenuSub", "MenuSubTrigger", "MenuSubContent"] },
    ],
    refusals: [
      {
        name: "`emphasis` on rows",
        why: "Every row in a menu is an equal choice, so there is nothing to make louder or quieter. Order the rows and word them clearly instead, and use `tone=\"destructive\"` for a dangerous action.",
      },
      {
        name: "A Shortcut part",
        why: "To show a keyboard shortcut, put a `<Kbd>` in the row's `trailing` slot. A separate Shortcut part would do exactly the same thing under another name.",
      },
      {
        name: "`MenuSeparator`",
        why: "Use the ordinary `<Separator>` between groups of rows. Inside a menu panel it gets the right spacing automatically.",
      },
      {
        name: "An `inset` prop",
        why: "Rows without icons already line up with rows that have them, because the space for the icon or tick is always kept. There is nothing left for an inset prop to fix.",
      },
      {
        name: "`modal` and `openOnHover`",
        why: "A menu opens when someone presses its trigger, and it always blocks the page behind it until it closes. A submenu row already opens on hover, so neither prop is needed.",
      },
      {
        name: "An arrow, a backdrop, a scroll viewport and collision settings",
        why: "A menu needs no arrow pointing at its trigger and no dimmed backdrop. A long menu scrolls inside the panel on its own, and the panel always moves to stay on screen, so there are no settings to tune.",
      },
    ],
    parts: [
      { part: "MenuTrigger", blurb: "The button that opens the menu. Pass your own `<Button>` to `render`, so the trigger is a real Kookie button" },
      { part: "MenuContent", blurb: "The floating panel that holds the rows. It opens next to the trigger, above the rest of the page, with the same theme as the trigger" },
      { part: "MenuItem", blurb: "One action row, with optional `leading` and `trailing` content. It lights up when the keyboard or the pointer reaches it" },
      { part: "MenuGroup", blurb: "A set of related rows. When a `MenuLabel` is inside it, screen readers use the label as the group's name" },
      { part: "MenuLabel", blurb: "A heading above a set of rows. It lines up with the rows, but people can't choose it. Use it inside a group or on its own" },
      { part: "MenuCheckboxItem", blurb: "A row that turns a setting on or off. A tick in the accent colour shows when it is on, and its space is kept when it is off, so the rows stay aligned" },
      { part: "MenuRadioGroup", blurb: "Holds the one chosen value for a set of radio rows. Use `value` and `onValueChange` to control it, or `defaultValue` to let it hold the value" },
      { part: "MenuRadioItem", blurb: "One choice in a radio group. A dot shows next to the choice that is selected" },
      { part: "MenuSub", blurb: "Wraps a submenu's trigger row and panel. It renders no element of its own" },
      { part: "MenuSubTrigger", blurb: "The row that opens a submenu. It stays highlighted while the submenu is open, and its chevron points the way the submenu opens" },
      { part: "MenuSubContent", blurb: "The submenu's panel. It opens beside its trigger row, with its first row level with that trigger" },
    ],
  },
  {
    slug: "select",
    name: "Select",
    job: "Choose",
    level: "leaf",
    spec: "§20, §21, §23",
    abstract: "Select is a form control that lets someone choose one option from a list.",
    overview: ["Select lets someone pick one option from a list. The closed trigger shows the current choice, and pressing it opens a panel of options. Use it when there are too many options to show on the screen at once. When there are only a few, use a `SegmentedControl` or a `RadioGroup`, so people can see every option without opening anything. Use a `Combobox` when people need to type to filter a long list, and a `Menu` when the options are actions rather than a value.","The trigger is a button drawn like a field, with the same fill, border and height as a `TextField`, so the two sit side by side as the same kind of input. The panel is never narrower than the trigger, and when it opens, the chosen option sits over the trigger with the rest of the list above and below it.","Pass `items`, an object that maps each value to its label. The closed trigger uses it to show the chosen option's label, because the options themselves aren't rendered while the panel is closed. Without `items`, the trigger shows the raw value.","Select renders a hidden input, so `name` and `required` work in a form just as they do on a native select. Inside a `Field`, the `FieldLabel` names the trigger. Screen readers announce the trigger as a combobox and the panel as a listbox. The arrow keys move through the options, and typing a letter jumps to an option that starts with it.","The part names follow shadcn/ui's select (MIT)."],
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
      {"name":"disabled","title":"A disabled option","why":"Set `disabled` on a `SelectItem` to stop people choosing it. The option stays in the list, so people still see the whole set of choices."},
      {"name":"rtl","title":"Right to left","why":"Inside a right-to-left layout, the chevron moves to the other end of the trigger and the panel lines up with the other edge. You don't set anything on the Select itself."},
      {"name":"in-a-form","title":"In a form","why":"Inside a `Field`, the `FieldLabel` names the trigger. The hidden input makes `name` and `required` work with the form, just as they do on a native select."},
      {"name":"controlled","title":"Controlled","why":"Keep the value in your own state with `value` and `onValueChange`, here to update a sentence below the field. The callback can receive `null` when the chosen option leaves the list, so handle that case."},
      {"name":"placeholder","title":"No choice yet","why":"With no `defaultValue`, the trigger shows the `placeholder` in a muted colour until someone picks an option. Use it when no option is a safe default."},
      {"name":"disabled-control","title":"The whole control disabled","why":"Set `disabled` on the `Select` to turn off the whole control. The panel can't open and the value isn't sent with the form, so explain why in a `FieldDescription`."},
      {"name":"long-list","title":"A long list in groups","why":"A long list scrolls inside the panel, and `SelectGroup` with `SelectLabel` divides it into sections. When the panel opens, the chosen option sits over the trigger, so it is the first thing people see."},
      {"name":"beside-a-text-field","title":"Beside a text field","why":"A `SelectTrigger` has the same fill, border and height as a `TextField`, so the two can share one row, such as an amount and its unit."},
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
        why: "HTML doesn't support a read-only select, so there is no standard behaviour to follow. To show a value that can't change, display it as `Text`, and add your own hidden input if the form still needs to send it.",
      },
      {
        name: "A Separator inside the panel",
        why: "The panel is a listbox, and a listbox may only contain options and groups, so a separator fails accessibility checks. Use `SelectGroup` to divide the options instead.",
      },
      {
        name: "`emphasis` and `tone` on the trigger",
        why: "Loudness ranks actions, and no field in a form is more important than the one beside it. To show that a value is wrong, mark the field as invalid through `Field`.",
      },
      {
        name: "A `SelectValue` part",
        why: "The trigger shows the chosen value itself and accepts a `placeholder` for when nothing is chosen, so a separate part would have nothing to do.",
      },
      {
        name: "`render` and `children` on the trigger",
        why: "The trigger's content is always the chosen value, and it must stay a real button so screen readers announce it as a combobox. Style the options and use `items` to control what the trigger shows.",
      },
      {
        name: "Scroll arrows",
        why: "The panel already scrolls with a wheel, a trackpad or the keyboard. Arrow buttons at the ends would only help a mouse user, so they aren't included.",
      },
      {
        name: "`multiple`",
        why: "Choosing several values changes how the trigger shows the value, how each option shows its state and what the form sends, so it is a different control. Use checkboxes in a `Field` for a short list.",
      },
    ],
    parts: [
      { part: "SelectTrigger", blurb: "The button that shows the current choice. It looks like a field, with the same fill, border and height, and a muted chevron at the end" },
      { part: "SelectContent", blurb: "The floating panel of options. It opens above the rest of the page, with the same theme as the trigger, and it is never narrower than the trigger" },
      { part: "SelectItem", blurb: "One option. A tick in the accent colour marks the chosen option, and its space is kept on every row, so the text of all the options lines up" },
      { part: "SelectGroup", blurb: "A set of related options. When a `SelectLabel` is inside it, screen readers use the label as the group's name" },
      { part: "SelectLabel", blurb: "A heading above a set of options. It starts at the edge of the rows, a little to the left of the option text, which leaves room for the tick, as in macOS" },
    ],
  },
  {
    slug: "command",
    name: "Command",
    job: "Act",
    level: "pattern",
    spec: "§44",
    abstract: "Command is a command palette that lets people search for any action or page in your app and run it from the keyboard.",
    declaration: `<Command items={sections} open={open} onOpenChange={setOpen}>
  <CommandTrigger render={<Button>Open</Button>} />
  <CommandContent aria-label="Command palette">
    <CommandInput aria-label="Search" placeholder="Search…" />
    <CommandList>{(section) => …}</CommandList>
    <CommandEmpty>…</CommandEmpty>
  </CommandContent>
</Command>`,
    variants: [
      {"name":"flat","title":"A list without groups","why":"A short palette with a flat array and no groups. Start here when your app has only a few commands, and add groups when the list grows."},
      {"name":"keyboard-shortcut","title":"Open with a keyboard shortcut","why":"The palette opens from Command+K or Control+K and has no `CommandTrigger`. Your app listens for the keys and sets `open`, so you choose the shortcut."},
      {"name":"places","title":"Rows that are links","why":"Each row goes to a page, so it is rendered as an anchor with `render`. A link row opens in a new tab on a middle-click, and screen readers announce it as a link."},
      {"name":"app-filtering","title":"Your own search and ranking","why":"`filter={null}` turns off the built-in matching, and `onQueryChange` reports what people type. The app narrows and sorts its own array and passes the result to `items`. Use this for a ranked search, such as help articles."},
      {"name":"stays-open","title":"Keep the palette open","why":"Calling `cancel()` for the `item-press` reason keeps the palette open after a row runs. Use it when rows toggle settings and people may want to change several in one visit."},
    ],
    overview: ["Command is a search field over the actions and pages in your app. Someone types a few letters, the list narrows to the matching rows, and Enter runs the highlighted one. Use it for a command palette that opens from a keyboard shortcut. To choose a value in a form, use a `Combobox`, and for a short list of actions on one object, use a `Menu`.","The palette is a `Dialog`, so it dims the page, keeps focus inside, stops the page behind it from scrolling and closes on Escape. It covers the whole app while it is open. For a floating panel that leaves the page usable, use a `Popover`.","The search field and the results are two separate panels near the top of the window, at every width including a phone. The field stays in place while the results panel below it grows and shrinks as you type. Rows keep the order you wrote them in, so people can learn where each command is.","One `size` sets the whole palette: both panels, the search field, the rows and the group labels. The rows are one size step larger than the controls in your app, and the text in the search field is larger again, so the palette reads as the main thing on the screen rather than as part of a form.","Pass every command to `items`, and keep the array stable by defining it at module scope or in a `useMemo`. `CommandList` and `CommandCollection` take a function, which they call for each item that matches. To rank or limit the results yourself, set `filter` to `null` on `CommandContent`, read the text with `onQueryChange`, and pass your own narrowed array to `items`.","Your app decides which keys open the palette, so `Command` accepts `open` and `onOpenChange`, and it shows no button when you leave out `CommandTrigger`. Running a row closes the palette, and `onOpenChange` reports the reason `item-press`. Call `cancel()` for that reason to keep the palette open.","The search field keeps focus the whole time the palette is open. A row is highlighted from the start, the arrow keys move the highlight and Enter runs it, while Tab leaves the list alone. A row rendered as a link is a real anchor, so screen readers announce it as a link and a middle-click opens it in a new tab. `CommandContent` and `CommandInput` both need an `aria-label`, because the palette has no visible title and a placeholder isn't a name."],
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
        why: "A palette footer usually holds a legend of keyboard shortcuts. Each row can already show its own shortcut in `trailing`, which is where people look for it.",
      },
      {
        name: "`modal`",
        why: "An open palette always covers the page, because it is the one thing someone is doing at that moment. For a panel that leaves the page usable, use a `Popover`.",
      },
      {
        name: "Re-sorting results as you type",
        why: "Rows keep the order you wrote them in. If the order changed on every keystroke, people couldn't learn where a command is. To rank results, filter them yourself and pass the sorted array to `items`.",
      },
      {
        name: "A Separator inside the panel",
        why: "The results list is a listbox, which may only contain options and groups, so a separator fails accessibility checks. Use `CommandGroup` to divide the rows instead.",
      },
      {
        name: "An edge-to-edge results panel",
        why: "The results panel keeps padding around its rows, like a menu panel, so a highlighted row ends inside the panel's rounded corner instead of running into it.",
      },
    ],
    parts: [
      { part: "CommandTrigger", blurb: "The control that opens the palette. Leave it out when a keyboard shortcut is the only way to open it" },
      { part: "CommandContent", blurb: "Holds the search field and the results. It needs an `aria-label`, which names the palette for screen readers, and it accepts `filter` and `onQueryChange`" },
      { part: "CommandInput", blurb: "The search field, in its own panel above the results. It needs an `aria-label`, and it shows no focus ring, because it keeps focus the whole time the palette is open" },
      { part: "CommandList", blurb: "The scrolling panel of results. It takes a function, which it calls for each item that matches the search" },
      { part: "CommandGroup", blurb: "A section of the results with its own `items`. It hides itself when none of its items match" },
      { part: "CommandGroupLabel", blurb: "The heading of a section. It uses a muted colour, and the arrow keys skip over it" },
      { part: "CommandCollection", blurb: "Goes inside a `CommandGroup` and calls its function for each matching item in that group" },
      { part: "CommandItem", blurb: "One command row, with optional `leading` and `trailing` content. Set `tone=\"destructive\"` for a command that deletes something" },
      { part: "CommandEmpty", blurb: "What the palette shows when nothing matches. Put it next to `CommandList`, and it appears inside the results panel, so the palette keeps the same shape" },
    ],
  },
  {
    slug: "composer",
    name: "Composer",
    job: "Converse",
    level: "pattern",
    // CHANGES 2026-08-26: was §31, which is Popover. Composer is §30, and §10 is the surface
    // family decision the section rests on. `registry.test.ts` now resolves every cited § against
    // DECISIONS.md's own headings, so the next renumber fails here instead of misdirecting a reader.
    spec: "§10, §30",
    parts: [
      { part: "ComposerInput", blurb: "The text area where people type. It has no border of its own, because the Composer around it is already the box, and it needs an `aria-label` or `aria-labelledby`" },
      { part: "ComposerRow", blurb: "The row of controls under the text. It sets their alignment and spacing, and a `Flex` inside it groups controls that belong together" },
      { part: "ComposerSend", blurb: "The send button. Its `status` makes it send, show a spinner, stop a running request or retry a failed one" },
    ],
    abstract: "Composer is the box where people type a message and send it, as in a chat or a comment thread.",
    overview: ["A Composer is the box people type a message into. It holds a text area that grows as you type, a row of controls under it, and a send button. Use it for an AI chat, a support inbox, a team thread or a comment field, which all share this shape. For one line of text in a form, use a `TextField`, and for a longer answer in a form, use a `TextArea`.","The Composer is a real `<form>`, and `onSubmit` runs when someone sends. Enter sends and Shift+Enter starts a new line, as in most chat apps. Enter doesn't send while someone is still composing Japanese, Chinese or Korean characters, and it doesn't send again while a request is running.","It looks like a `Card`, with the same fill, corner and shadow, because it holds full-size buttons rather than the small controls inside a text field. One `size` sets the padding, the corner, the text and every control in the row. A control that sets its own `size` keeps it.","`ComposerSend` changes meaning with `status`. `ready` sends, `submitted` shows a spinner, `streaming` turns it into a Stop button that calls `onStop`, and `error` turns it into Retry. It is the loud button by default. The package ships no icons, so pass your own with `icons`, and set `labels` to give each state an accessible name in your app's language.","The Composer doesn't show the conversation and doesn't keep files. Add your own attach button, and handle files that people drop or paste with `onFiles`. Use `notices` to show a `Notice` or a `Confirmation` above the box, and `context` for quiet facts below it, such as the model or how much context is left.","Set `backdrop` when content scrolls behind the Composer, so it uses the theme's material. `ComposerInput` needs an `aria-label` or `aria-labelledby`, because a placeholder isn't a name. The focus ring goes around the whole box while the text area has focus, but not when a button in the row has focus."],
    declaration: `<Composer onSubmit={send}>
  <ComposerInput aria-label="Message" placeholder="Ask anything" />
  <ComposerRow>
    <Button iconOnly aria-label="Add attachment">{icon}</Button>
    <ComposerSend status={status} icons={{ ready: sendIcon }} />
  </ComposerRow>
</Composer>`,
    variants: [
      {"name":"with-notices","title":"Notices above the box","why":"A warning `Notice` with a dismiss button sits in the `notices` slot. Notices appear in a column above the box, outside the form, so pressing their buttons never sends the message."},
      {"name":"confirmation","title":"A question before sending","why":"A `Confirmation` in the `notices` slot asks a question, with `busy` set while the work starts. Focus doesn't move to it, because the person may be in the middle of typing."},
      {"name":"with-context","title":"Context below the box","why":"The `context` slot shows quiet facts about the conversation, such as how much context is left and what a reply costs. You write the words, and the Composer places them below the box."},
      {"name":"request-states","title":"Request states","why":"After a send, `status` moves from `submitted` to `streaming` to `error`. Press the button while it streams to stop the request, and press Reset to start again."},
      {"name":"disabled","title":"Disabled","why":"The text area and every control are disabled. The text dims to the same colour as a disabled `TextArea`, and the box itself doesn't change."},
      {"name":"with-select","title":"Controls in the row","why":"An attach button and a `Select` share the row in a Composer at size 3. The Composer's size reaches every control in the row, so the text and the controls change size together."},
    ],
    topics: [
      { title: "The box a message is typed into", symbols: ["Composer", "ComposerInput"] },
      { title: "The controls under it", symbols: ["ComposerRow", "ComposerSend"] },
    ],
    refusals: [
      {
        name: "The conversation",
        why: "Messages, tool calls and reasoning each need a data model that belongs to your app. Build the conversation from `ScrollArea`, `Card` and `Text`, and keep the Composer for the input.",
      },
      {
        name: "Keeping the conversation scrolled to the bottom",
        why: "Keeping a chat pinned to the newest message while a reply streams in is a hard problem of its own. Use a dedicated library or your chat runtime for it.",
      },
      {
        name: "An attach button",
        why: "Your app decides which files it accepts and how it uploads them, so add your own `Button` with your own icon. Files that people drop or paste still reach `onFiles`.",
      },
      {
        name: "Holding the files",
        why: "The Composer never stores files, previews or uploads, because your app owns them. Show each file with an `Attachment` tile, and set its `state` from your own upload code.",
      },
      {
        name: "Named slots for the start and end of the row",
        why: "Which controls go on the left and which go on the right depends on what they mean in your app. Put each group of controls in a `Flex` inside `ComposerRow`.",
      },
      {
        name: "A compact or collapsed mode",
        why: "The Composer has no compact mode yet, because nothing in it can fold away. It may arrive when the Composer holds something that can.",
      },
      {
        name: "`submitOnEnter`",
        why: "Enter always sends and Shift+Enter always adds a line, as in most chat apps, so there is nothing to switch. Enter never sends while someone is composing Japanese, Chinese or Korean characters.",
      },
    ],
  },
  {
    slug: "notice",
    name: "Notice",
    job: "Know",
    level: "leaf",
    spec: "§29",
    abstract: "Notice tells people about a condition that is true right now, placed above the part of the page it affects.",
    overview: ["Use a Notice to tell people about a condition that is true right now, such as an expiring certificate or a failed sync. Put it in the layout, directly above the region it is about. It takes up space and never floats, so it doesn't cover the content it describes.","A Notice stays for as long as the condition is true and never closes on a timer. It isn't a confirmation of something the person just did, because they didn't cause the condition. Give it at most one `action`, which fixes the condition, and pass `onDismiss` to show a ✕ that lets people acknowledge it.","The Notice keeps no state of its own. When someone presses the ✕, your `onDismiss` callback runs and your app removes the Notice. Store that choice wherever it needs to last, such as in user settings, so the Notice stays dismissed after a reload.","A Notice is `neutral` by default. Set `tone` for the kind of condition, such as `warning` or `destructive`, and the fill, the text and a `Button` in the `action` slot all change colour with it. `size` sets the padding, the corner, the text and the ✕, but a `Button` in `action` keeps its own size, so set it to match.","To ask a question instead, use `Confirmation`. It has the same look, with two answer buttons in words: a quiet no and a loud yes. It has no ✕, because closing a question doesn't answer it. Set `busy` while the work starts, and the yes button shows a spinner.","A Notice has `role=\"status\"`, so screen readers read its words when it appears without moving focus. The icon is hidden from screen readers, so the words must carry the meaning. Set `dismissLabel` to name the ✕ in your app's language. Use a `Card` when the message needs a heading and several paragraphs, and a `Dialog` when the person must answer before they continue."],
    refusals: [
      {
        name: "A position, and a Banner component",
        why: "Where a message sits depends on the layout around it, so the parent places the Notice. Put it in the layout above the region it describes. For a notice about the whole app, use `ShellNotice`, which the `Shell` places above its header.",
      },
      {
        name: "A toast, or any Notice that disappears on its own",
        why: "If an action deserves someone's attention, it deserves it before the action runs, not in a message that vanishes afterwards. Show confirmations on the button that did the work instead.",
      },
      {
        name: "A title and description",
        why: "A Notice is a short message, usually one sentence, so it has no fixed title or description parts. When a message needs a heading and paragraphs, use a `Card`.",
      },
      {
        name: "More than one action",
        why: "The `action` slot holds the one action that fixes the condition. Two competing actions would turn the Notice into a small form, which belongs in the page instead.",
      },
      {
        name: "Remembering its own dismissal",
        why: "`onDismiss` is only a callback, and the Notice keeps no state. Your app stores the dismissal, which is the only way it can survive a reload.",
      },
      {
        name: "A shadow",
        why: "A Notice is a strip that sits inside a card or across a page, not a separate layer above it, so it never casts a shadow.",
      },
      {
        name: "Built-in icons",
        why: "The package ships no icons. Pass a glyph from your own icon set to `icon`, and it is hidden from screen readers.",
      },
      {
        name: "A ✕ on a Confirmation",
        why: "A question needs an answer, and closing it doesn't give one. Word the no answer as a button, just like the yes.",
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
      {"name":"tones","title":"Tones","why":"Set `tone` for the kind of condition. The fill, the text and a `Button` in the `action` slot all change colour together, so you never colour a word yourself."},
      {"name":"with-icon","title":"With an icon","why":"Pass a glyph from your own icon set to `icon`. It sits before the message, and screen readers skip it, so the words must carry the meaning."},
      {"name":"dismissible","title":"A dismissal you store yourself","why":"`onDismiss` shows the ✕ and tells you when someone presses it. Your app removes the Notice and keeps that choice, here for the session."},
      {"name":"sizes","title":"Sizes","why":"`size` changes the padding, the corner, the text and the ✕ together. Choose the size that fits the region the Notice sits above."},
      {"name":"confirmation","title":"A question with Confirmation","why":"`Confirmation` asks a yes or no question in the same kind of strip. Set `busy` after the yes, so the yes shows a spinner and the no is disabled while the work starts."},
      {"name":"above-a-region","title":"Above the region it describes","why":"The Notice sits in the layout, directly above the content it is about. It pushes that content down instead of covering it."},
    ],
    topics: [
      { title: "A condition", symbols: ["Notice"] },
      { title: "A question", symbols: ["Confirmation"] },
    ],
    parts: [
      { part: "Confirmation", blurb: "A question that waits for a yes or a no. It looks like a Notice, with two worded answer buttons and no ✕" },
    ],
  },
  {
    slug: "number-field",
    name: "NumberField",
    job: "Enter",
    level: "leaf",
    spec: "§4, §11, §28, §51",
    declaration: `<NumberField defaultValue={4} min={1} max={50} />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the height, the text and the width of the two buttons. Each size matches a `TextField` and a `Button` at the same size, so the field lines up with them in a row."},
      {"name":"format","title":"Currency, percentages and units","why":"Pass `Intl.NumberFormat` options to `format`. The field shows and reads the value in that format, and screen readers announce the unit with the number."},
      {"name":"steps","title":"Steps for fine and coarse changes","why":"`step` sets the normal change. Alt with an arrow key uses `smallStep` and Shift with an arrow key uses `largeStep`, so people can make a small or a large change from the keyboard."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onValueChange` when other parts of the screen depend on the number, here a monthly price. The value is `null` when the field is empty, so check for it."},
      {"name":"states","title":"Read-only, disabled and invalid","why":"A read-only value can still be selected and is still sent with the form. A disabled field takes no input. An invalid field shows the error from the `Field` around it."},
      {"name":"in-a-form","title":"In a form","why":"Set `name`, and a hidden input sends the number when the form submits. `required` stops the form from submitting while the field is empty."},
    ],
    abstract: "NumberField is a field for entering a number, with buttons on each side that decrease and increase it.",
    overview: ["Use a NumberField when the value is a number, such as a count of seats, an amount of money or a timeout. It shows the value between a decrease button and an increase button. Use a `Slider` when an approximate value in a range is enough, and a `TextField` when the value only looks like a number, such as a postcode.","It matches a `TextField` in height, border, focus ring and material, so the two line up in one form. Set `min` and `max` to keep the value in a range, and `step` to set how far each press or arrow key moves it. A button becomes disabled when the value reaches a limit, and both are disabled in a read-only field.","Pass `format` to show the value as a currency, a percentage or a unit. The field formats the number and reads typed text in the user's locale, so someone in Germany can type `1.234,5`, and `locale` sets a different one. Put a unit in `format` rather than beside the field, so screen readers announce it as part of the value.","The value is a number, or `null` when the field is empty, which is different from zero. Use `value` and `onValueChange` to keep it in your own state, or `defaultValue` to let the field keep it. Set `name`, and a hidden input sends the number with the form.","Put it in a `Field` to give it a label, a description and an error message. Inside a `Field` it uses that field's size, and a `size` set on the NumberField itself still wins.","The arrow keys change the value by `step`, Alt with an arrow key uses `smallStep`, and Shift with an arrow key uses `largeStep`. The two buttons aren't in the tab order, because the keyboard already changes the value from the field itself. Set `decrementLabel` and `incrementLabel` to name the buttons in your app's language."],
    refusals: [
      {
        name: "`leading` and `trailing`",
        why: "The two buttons already fill both ends of the field. Put a unit or currency in `format` instead, so it is shown, announced and read back as part of the number.",
      },
      {
        name: "`emphasis` and `tone`",
        why: "Loudness ranks actions, and no field in a form is more important than the one beside it. To show an unacceptable value, set `aria-invalid` or mark the `Field` around it as invalid.",
      },
      {
        name: "`render`",
        why: "A NumberField is made of an outer box and the input inside it, and neither can be replaced without breaking the other, so there is no single element for `render` to swap.",
      },
      {
        name: "The browser's number input",
        why: "The native number input can't format or read numbers in the user's language, and it draws its own spinner buttons, so NumberField uses a text input with its own buttons.",
      },
      {
        name: "Dragging or scrolling to change the value",
        why: "Changing the value by dragging or by scrolling needs its own pointer design, which doesn't exist yet. Use the buttons or the arrow keys for now.",
      },
    ],
  },
  {
    slug: "page",
    name: "Page",
    job: "Go",
    level: "pattern",
    spec: "§15, §27, §46",
    declaration: `<Page title="Nature Walks" description="Everything collected on the walk.">
  …
</Page>`,
    variants: [
      {"name":"outside-a-frame","title":"Outside a Shell","why":"A Page works without a `Shell`. The title and description show in place and don't collapse into a toolbar, and the box around the Page sets the reading width."},
      {"name":"title-only","title":"A title with no description","why":"Leave out `description` when the title says everything, as on a settings page. The content starts under the title."},
      {"name":"with-mark","title":"With your app's mark","why":"Pass your logo or a large glyph to `mark`, and it sits above the title. Use it on a front page, not on every screen of the app."},
      {"name":"band-in-flow","title":"Under a toolbar that doesn't float","why":"Here the `ShellPaneHeader` sits in the layout instead of floating over the content. The Page still leaves the right amount of space, and the `ToolbarTitle` shows the title once it scrolls away."},
    ],
    abstract: "Page is the screen someone navigated to, with a large title and an optional description at the top.",
    overview: ["Use a Page for each screen someone moves to, such as a settings page or a report. It shows a large title and an optional description at the top, with your content underneath. Set the words with `title` and `description`.","The toolbar above a Page is a separate thing. The row with the navigation button, the back button and the tools stays in place while someone moves from one page to the next, so build it with a `ShellPaneHeader` and a `Toolbar`. The Page is the part that changes with each screen.","Inside a `Shell`, the Page leaves room for the toolbar row above it, whether that row floats over the content or sits in the layout. When the large title scrolls up behind the row, a `ToolbarTitle` in the row shows the same words. That is why `title` must be a string: the same words appear in two places.","A Page has no `size` and no width. Every page in an app uses the same title size, so the pages look like one product, and you set the reading width on the box that holds the Page. Outside a `Shell`, the title shows in place and doesn't collapse into a toolbar.","The title is the page's only `h1`, and screen readers use it as the name of the screen. Use a `Heading` at size 6 or 7 for sections inside the Page. Put actions in the toolbar row, not under the title, and use `mark` to show your app's logo above the title on a front page."],
    refusals: [
      {
        name: "A heading level",
        why: "The page title is always the document's one `h1`, because it names the screen. For headings at other levels, use a `Heading` inside the Page.",
      },
      {
        name: "`size`",
        why: "An app has one page title size. If pages used different sizes, parts of one app would look like different products.",
      },
      {
        name: "Actions beside the title",
        why: "Put actions in the toolbar with the other controls. A row of buttons under the title would be a second toolbar, without the toolbar's keyboard support.",
      },
      {
        name: "A width",
        why: "Different pages need different widths, such as a reading column or a wide table, so the Page doesn't limit its line length. Set a maximum width on the box that holds it.",
      },
      {
        name: "Collapsing into a toolbar outside a Shell",
        why: "The title can only collapse into a toolbar row that stays in place over a scrolling region. Outside a `Shell` there is no such row, so the title shows in place.",
      },
    ],
  },
  {
    slug: "toolbar",
    name: "Toolbar",
    job: "Act",
    level: "pattern",
    spec: "§45",
    abstract: "Toolbar is a row of app controls that the keyboard reaches as one stop, moving between the controls with the arrow keys.",
    overview: ["A Toolbar is the row that holds an app's controls, such as the buttons at the top of an editor. The whole row is one tab stop, and the arrow keys move between the controls inside it, as toolbars do on every platform. That keyboard behaviour, which comes from Base UI's Toolbar, is the reason to use a Toolbar instead of a `Flex`.","Put `ToolbarButton` in the row, not `Button`. A plain `Button` can't join the row's keyboard group, so it adds its own tab stop and the arrow keys skip it. `ToolbarButton` accepts every `Button` prop, and with `render` it can become a link or a menu trigger.","The row is one control tall at its `size`. With no `size`, a Toolbar is one step above the app's size, which is size 3 in a default app, and every control in the row uses that size unless it sets its own. The row spaces its clusters for you: group controls with a `Flex`, and one cluster sits at the start, two go to the ends, and three sit at the start, the centre and the end.","`ToolbarGroup` draws a capsule around controls that belong together, such as bold, italic and underline, and the buttons inside it are quiet by default. A `ToolbarSeparator` divides loose controls. `ToolbarTitle` names the row, and `ToolbarOverflow` moves the controls that don't fit into a menu.","The row itself is transparent, so it has no `tone`, `emphasis` or `material`. Set `backdrop` on the row when content passes behind it, and every control in the row uses the theme's material. A `ToolbarGroup` also accepts `backdrop` for itself.","Screen readers announce the row as a toolbar. Give it an `aria-label` that says what the tools are for, and give every icon-only `ToolbarButton` its own `aria-label`."],
    declaration: `<Toolbar aria-label="Note tools">
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
      {"name":"groups","title":"Groups and separators","why":"A `ToolbarGroup` draws one capsule around the formatting buttons, and a `ToolbarSeparator` divides the loose undo and redo buttons from it. Don't put a separator right after a group, because the capsule already shows where the group ends."},
      {"name":"sizes","title":"Sizes","why":"`size` on the row sets the height of the row and of every control in it, and the title text grows with it. A Toolbar with no `size` is one step above the app's size."},
      {"name":"vertical","title":"Vertical","why":"Set `orientation=\"vertical\"` for a column of tools along the edge of a canvas. The up and down arrow keys then move between the controls, and a separator becomes a horizontal line."},
      {"name":"overflow","title":"Overflow","why":"Put controls in a `ToolbarOverflow` when the row can get too narrow. The controls that don't fit move into a menu behind a ⋯ button, starting from the end of the row. Give that button a `label`, because it has no visible text."},
      {"name":"with-menu","title":"Links and menus","why":"Pass an anchor to `render` to make a `ToolbarButton` into a link. To open a menu, pass a `ToolbarButton` to the `render` prop of `MenuTrigger`. Both keep their place in the row's keyboard order."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on one `ToolbarButton` to turn it off. Set `disabled` on a `ToolbarGroup` to turn off every control in the capsule at once, for example when nothing is selected."},
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
        blurb: "A `Button` that joins the toolbar's keyboard group, so the arrow keys reach it. It accepts every `Button` prop, including `render` for a link or a menu trigger. It is medium by default, and quiet inside a `ToolbarGroup`",
      },
      {
        part: "ToolbarGroup",
        blurb: "A capsule around controls that belong together, such as bold, italic and underline. It is as tall as a button beside it, and it uses the row's size, so the group and its buttons line up with the rest of the row",
      },
      {
        part: "ToolbarOverflow",
        blurb:
          "A group of controls that collapses into a ⋯ menu when the row runs out of room. It measures the space left in the row instead of using a breakpoint, because each toolbar holds different controls. A `ToolbarButton` that moves into the menu shows as a menu row, and your own components can call `useToolbarOverflow()` to render a different form there",
      },
      {
        part: "ToolbarSeparator",
        blurb: "A thin line between two groups of loose controls. It is as tall as the icons beside it rather than the whole row, so it reads as a gap between tools",
      },
      {
        part: "ToolbarTitle",
        blurb: "The title at the start of the row. Give it words to show a fixed title. With no words, it shows the title of the `Page` in the same pane once that page's large title scrolls out of view, and it renders nothing when there is no title to show",
      },
    ],
    refusals: [
      {
        name: "`tone`, `emphasis` and `material` on the row",
        why: "The row itself is transparent, so there is nothing to colour or turn to glass. To make its controls use the theme's material, set `backdrop` on the row or on a `ToolbarGroup`.",
      },
      {
        name: "Leading, centre and trailing parts",
        why: "Which controls sit at each end depends on what they mean in your app. Group them with a `Flex`, and the row spaces the groups.",
      },
      {
        name: "`size` on a group",
        why: "A group and its buttons always use the row's size, so they stay the same height as the controls beside them. Set `size` on the `Toolbar` instead.",
        on: ["ToolbarGroup"],
      },
      {
        name: "A `gap` prop",
        why: "The row sets the space between clusters for you. Inside one cluster, set `gap` on the `Flex` that groups the controls.",
      },
    ],
  },
  {
    slug: "popover",
    name: "Popover",
    job: "Focus",
    level: "leaf",
    spec: "§20, §22, §31",
        abstract: "Popover opens a small panel beside the control that opened it, while the rest of the page stays usable.",
    overview: ["Use a Popover to show a small panel next to a control without blocking the page behind it. It can hold whatever you put in it, such as a short form, a filter panel or a summary of a person.","Each floating component has its own job. A Menu lists actions, and a Select chooses one value. A Dialog holds a task that the person must finish before they continue, and an AlertDialog asks one question. A Tooltip shows a short label for a control.","Pass your own Button to `PopoverTrigger` through `render`, and the panel opens beside it. Set `side` and `align` on `PopoverContent` to choose where the panel prefers to open. When that side has no room, the panel moves to the opposite side, and it always stays on screen.","`size` on `Popover` sets the panel's padding and corner, together with the text size of `PopoverTitle` and `PopoverDescription`. Content that you add keeps the sizes you give it. The panel uses the material that your `Theme` sets, so it is glass when the theme's material is glass and solid otherwise.","Give every panel a `PopoverTitle`, because screen readers announce the panel by its title and read `PopoverDescription` with it. Escape or a press outside the panel closes it and returns focus to the trigger. For a close or save action inside the panel, wrap your own Button in `PopoverClose`. To open and close the panel from your own code, use `open` and `onOpenChange`."],
    declaration: `<Popover>
  <PopoverTrigger render={<Button>Rename</Button>} />
  <PopoverContent>
    <PopoverTitle>Rename project</PopoverTitle>
    <PopoverDescription>\n      This changes the name everywhere.\n    </PopoverDescription>
    <PopoverClose render={<Button emphasis="loud">Save</Button>} />
  </PopoverContent>
</Popover>`,
    variants: [
      {"name":"placement","title":"Choosing a side","why":"Each button opens its panel on a different preferred `side`. When the preferred side has no room, such as near the edge of the window, the panel opens on the opposite side instead."},
      {"name":"sizes","title":"Sizes","why":"The same panel at sizes 1 to 4. `size` changes the padding, the corner and the title and description, and any content you add keeps its own size."},
      {"name":"filter-panel","title":"A filter panel","why":"A Popover can hold a small form, here a set of checkboxes. The Reset and Apply buttons are each wrapped in `PopoverClose`, so pressing either one also closes the panel."},
      {"name":"controlled","title":"Controlled","why":"Use `open` and `onOpenChange` when your code needs to close the panel, such as after a form submits. This example also resets the draft label each time the panel opens."},
      {"name":"details","title":"A summary of a person","why":"A Popover can show details with no form at all. The title and description name the panel for screen readers, and a Separator divides the header from the details below it."},
    ],
    topics: [
      { title: "Opening the panel", symbols: ["Popover", "PopoverTrigger"] },
      { title: "Placing the panel", symbols: ["PopoverContent"] },
      { title: "Naming the panel", symbols: ["PopoverTitle", "PopoverDescription"] },
      { title: "Closing the panel", symbols: ["PopoverClose"] },
    ],
    refusals: [
      {
        name: "A modal mode",
        why: "A Popover always leaves the page usable. When the page must wait for an answer, use a Dialog, or an AlertDialog for a single question.",
      },
      {
        name: "An arrow",
        why: "The panel has its own border and opens right beside its trigger, so it is already clear which control it belongs to.",
      },
      {
        name: "Free positioning",
        why: "You choose a preferred side and alignment, and the panel moves itself when that side has no room. Arbitrary coordinates would break that guarantee on small windows.",
      },
      {
        name: "A width that matches the trigger",
        why: "A popover holds a form or a summary, so its width comes from its content rather than from the button that opened it. A Menu or a Select matches its trigger's width instead.",
      },
      {
        name: "A built-in close button",
        why: "Escape and a press outside the panel already close it. If you want a visible button as well, wrap your own Button in `PopoverClose` and place it where your layout needs it.",
      },
    ],
    parts: [
      { part: "PopoverTrigger", blurb: "The control that opens the panel. Pass your own Button through `render`, and the trigger adds the ARIA attributes and the position that the panel opens beside" },
      { part: "PopoverContent", blurb: "The panel itself. It holds your content and accepts the `side` and `align` that you prefer" },
      { part: "PopoverTitle", blurb: "The visible heading of the panel, which is also the name that a screen reader announces" },
      { part: "PopoverDescription", blurb: "A supporting line that a screen reader reads after the title, so avoid repeating the title's words in it" },
      { part: "PopoverClose", blurb: "Closes the panel when pressed. Pass your own Button to it through `render`" },
    ],
  },
  {
    slug: "progress",
    name: "Progress",
    job: "Know",
    level: "leaf",
    spec: "§11, §19",
    declaration: `<Progress value={35} aria-label="Uploading" />`,
    variants: [
      {"name":"labelled","title":"With a visible label","why":"A Text above the bar names it through `aria-labelledby`, so the same words label the bar on screen and for screen readers."},
      {"name":"indeterminate","title":"When the amount is unknown","why":"With `value={null}`, the bar shows a moving segment. Use it when you know that work is happening but not how much of it is left."},
      {"name":"range","title":"A range other than 0 to 100","why":"This bar uses `min` and `max` to count in gigabytes, and `getAriaValueText` so that screen readers announce the same words that are on screen."},
      {"name":"in-a-card","title":"In a card","why":"A list of uploads, each with its own bar and label. A finished file shows a full bar, and a file that is still waiting shows the moving segment."},
    ],
        abstract: "Progress shows how far along a task is, such as an upload or an export.",
    overview: ["Use Progress to show how much of a task is done, such as an upload, an export or a storage quota. Give `value` a number and the bar fills to that fraction. Set `value` to `null` when you cannot say how much is left, and the bar shows a moving segment instead.","For a short wait inside a control, such as a Button that is saving, use a Spinner. When the person sets the value themselves, use a Slider. A Progress bar only reports, so it takes no focus and responds to no pointer.","The bar has one fixed thickness and fills the width of its container, so set the width on the element that holds it. The value runs from 0 to 100 by default, and `min` and `max` let you count in other units, such as gigabytes.","The fill uses your app's accent colour. When the person has asked their system for reduced motion, the moving segment slows down but keeps moving, because the movement is what tells them that work is still happening.","Screen readers announce the bar as a progress bar with its current value. Name it with `aria-label`, or point `aria-labelledby` at a visible Text. When a percentage alone does not say enough, use `getAriaValueText` to provide words such as “7.2 of 10 gigabytes used”."],
    refusals: [
      {
        name: "`size`",
        why: "A bar has one designed thickness, and its length always comes from its container. Set the width on the element that holds it.",
      },
      {
        name: "`tone`",
        why: "The fill always uses the accent colour. Whether a bar should turn red for a failed upload is still an open design question, so the prop is left out rather than guessed.",
      },
    ],
  },
  {
    slug: "radio",
    name: "Radio",
    job: "Choose",
    level: "leaf",
    spec: "§4, §6, §11",
    declaration: `<Radio value="a" id="a" />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"Each Radio sits next to a label at the same `size`. The circle is one line of that text tall, so the two always line up."},
      {"name":"with-descriptions","title":"With a description for each option","why":"Each Radio sits in a `FieldItem` with a `FieldLabel` and a `FieldDescription`. The description lines up under the label, and screen readers read it with the option."},
      {"name":"disabled","title":"Disabled","why":"One option is disabled and stays in the list, with a description that says how to get it. Use this when a person should know an option exists."},
      {"name":"wrapping-label","title":"A label that wraps the radio","why":"Each Radio and its words sit inside one `<label>` element, so they connect without an `id`. Pressing anywhere on the label checks the Radio."},
    ],
        abstract: "Radio lets a person pick exactly one option from a short list.",
    overview: ["Use a Radio when a person must pick exactly one option from a short list, such as a plan or a backup schedule. Every Radio belongs to a `RadioGroup`, which holds the chosen value, and a Radio is checked when its `value` matches the group's.","For neighbouring cases, use a Checkbox when a person can pick several options or turn one option on and off, and a Switch for a setting that takes effect at once. A Select suits a long list, and a segmented control suits two to five short labels that change a view in place.","A Radio is always a circle, whatever corner setting your theme uses, because a square radio would look like a checkbox. It is neutral when off and uses your app's accent colour when on.","At each `size`, a Radio is exactly one line of text tall and matches a Checkbox, while its pressable area extends to the height of a Button at the same size. Inside a Field it uses the Field's size, although a `size` set on the Radio still wins.","The label is a separate element beside the Radio. The simplest way to connect them is a `FieldItem`, which needs no `id`. You can also wrap the Radio and its words in a `<label>`, or give the Radio an `id` and point a label at it with `htmlFor`. In every case, pressing the label checks the Radio."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "Like a Checkbox, a Radio is always neutral when off and accent-coloured when on, so a checked option reads the same everywhere in your app." },
      { name: "`readOnly`", why: "HTML has no read-only radio button, so there is no standard behaviour to follow. To show a value that cannot change, disable the radio and explain why in a description." },
    ],
  },
  {
    slug: "radio-group",
    name: "RadioGroup",
    job: "Choose",
    level: "leaf",
    spec: "§4, §11",
    declaration: `<RadioGroup defaultValue="yes">
  <Radio value="yes" />
  <Radio value="no" />
</RadioGroup>`,
    variants: [
      {"name":"horizontal","title":"Radios in a row","why":"A Flex passed to `render` lays the radios side by side. Keep the gap wide enough that the pressable area of one Radio does not reach the next."},
      {"name":"controlled","title":"Controlled","why":"The group uses `value` and `onValueChange`, so the price below it can change with the chosen plan. Use this when other parts of the screen depend on the choice."},
      {"name":"in-a-form","title":"In a form","why":"With `name` set on the group, the chosen value is sent when the form submits. `required` stops the form from submitting until someone picks an option."},
      {"name":"disabled","title":"Disabled","why":"`disabled` on the group disables every Radio at once. A description explains why, because a disabled control cannot explain itself."},
    ],
        abstract: "RadioGroup holds the one value chosen from a set of radios.",
    overview: ["Use a RadioGroup around every Radio that answers the same question. The group gives the radios a shared name and holds the one chosen value, which it also sends with a form.","By default the group stacks its radios in a column, with enough space that the pressable area of one never covers the next. To lay them out differently, pass a layout to `render`, such as `render={<Flex gap=\"5\" />}` for a row, and your layout replaces the column.","Use `defaultValue` to let the group keep track of the value, or `value` and `onValueChange` to hold it in your own state. Set `name` to send the value with a form, and `required` to stop the form from submitting until someone picks an option. `disabled` disables every Radio in the group.","Screen readers announce the group as a radio group. Give it a name by putting it in a Field with a `FieldLabel`, or by setting `aria-label`. The whole group is one tab stop, and the arrow keys move between the radios and check each one they reach."],
    refusals: [
      { name: "Visual props", why: "The group draws nothing of its own. It holds the value and stacks the radios, and you can pass any layout to `render` when you need a different arrangement." },
      { name: "`readOnly`", why: "HTML has no read-only radio group. To show a value that cannot change, set `disabled` and add a description that says why." },
    ],
  },
  {
    slug: "row",
    name: "Row",
    job: "Browse",
    level: "leaf",
    spec: "§21",
    declaration: `<Row current trailing={<Text emphasis="quiet">12</Text>}>
  Environments
</Row>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The same Row at sizes 1 to 4. `size` sets the height, the text and the icon, and a Row is as tall as a Button at the same size, so a list lines up with a toolbar beside it."},
      {"name":"leading-and-trailing","title":"Icons, counts and shortcuts","why":"Each Row has an icon in `leading` and a chevron, a file size or a shortcut in `trailing`. The trailing content sits against the far edge of the Row."},
      {"name":"links","title":"Rows that go to another page","why":"Each Row is passed an anchor through `render`, so it is a real link. The Billing row has `current`, which highlights it and tells screen readers that it is the current item."},
      {"name":"highlighted","title":"A highlight moved by the keyboard","why":"Focus stays in the search field while the arrow keys move the highlight through the results. Every Row receives `highlighted`, so the pointer cannot light a second Row at the same time."},
      {"name":"read-only","title":"A list you only read","why":"Each Row is rendered as a `<div>`, because these rows show information and do nothing when pressed. The layout stays the same, but there is no hover or focus."},
      {"name":"destructive","title":"An action that deletes","why":"Only the delete action has `tone=\"destructive\"`, which makes it stand out from the ordinary actions above it."},
    ],
        abstract: "Row is one line in a list that people pick from, such as search results or a settings list.",
    overview: ["Use a Row for one line in a list that people pick from, such as search results, a list of commands, a settings list or a list of files. It looks and behaves like a menu item or a sidebar item. To build the list, put the Rows in a Stack.","Inside a Menu, use `MenuItem` instead. To let someone choose one option from several as a form value, use a RadioGroup. The `current` prop only marks the page or file that is open now: it highlights the Row and sets `aria-current`.","A Row is as tall as a Button at the same `size`, so it lines up with the Buttons around it. Put an icon, an avatar or a tick in `leading`, and a count, a shortcut or a chevron in `trailing`.","A Row renders as a button by default. Pass `render={<a href=\"…\" />}` for a Row that goes to another page, or `render={<div />}` for a Row that only shows information. Set `disabled` to keep a Row visible while it is unavailable, and `tone=\"destructive\"` for the one action that deletes something.","By default a Row lights up when the pointer is over it. When your list moves a highlight with the arrow keys, pass `highlighted` to every Row, even when it is `false`. The Rows then light up only when `highlighted` is true and ignore the pointer.","A Row has no keyboard behaviour of its own. Your list sets the role, such as `listbox` or `list`, and handles the keys, because only the list knows what its Rows mean."],
    refusals: [
      {
        name: "`emphasis`",
        why: "The Rows in a list are equals, so none of them should look more important than the others. Use `tone=\"destructive\"` for the one row that deletes something.",
      },
      {
        name: "A keyboard model",
        why: "Only your list knows how its rows should be navigated. Handle the keys in the list and pass `highlighted` to show which row is active.",
      },
      {
        name: "A `selected` prop",
        why: "Choosing one option from several is a form value, so use a RadioGroup for it. Use `current` to mark the page or file that is open.",
      },
      {
        name: "A List component",
        why: "Use a Stack to arrange the rows, and set the list's role yourself, because the right role depends on what the rows mean.",
      },
      {
        name: "The shorter height of a menu row",
        why: "A Row sits next to ordinary Buttons, so it matches their height. The shorter rows belong to menus, which are only open for a moment, so use a Menu when you want them.",
      },
    ],
  },
  {
    slug: "tree",
    name: "Tree",
    job: "Browse",
    level: "leaf",
    spec: "§33",
    declaration: `<Tree items={files} multiselectable defaultExpandedIds={["src"]} aria-label="Project files" />`,
    variants: [
      {"name":"with-icons","title":"With icons","why":"Each node has an icon in `leading`, which the tree sizes to match the row. Use icons that show the kind of item, such as a folder or a document."},
      {"name":"single-select","title":"Single selection","why":"Without `multiselectable`, a click selects one row and clears the others. This tree starts with one folder open through `defaultExpandedIds` and one row selected through `defaultSelectedIds`."},
      {"name":"controlled","title":"Controlled","why":"The open folders and the selected rows live in the example's own state, through `expandedIds` and `selectedIds` with their change handlers. That lets the Expand all and Collapse all buttons change the tree."},
      {"name":"sizes","title":"Sizes","why":"The same tree at sizes 1 to 4. `size` changes the row height, the text and the indent, and one level of indent is always one icon wide."},
      {"name":"rich-labels","title":"Rich labels","why":"Each `label` holds a name and a count in a `Badge`. Those nodes also set `textValue`, so typing a letter still finds the right row."},
      {"name":"rtl","title":"Right to left","why":"Inside `dir=\"rtl\"`, the indent moves to the right and the disclosure arrow points in the reading direction."},
    ],
        abstract: "Tree shows nested items that you can open, close and select, such as a file browser or a layers panel.",
    overview: ["Use a `Tree` for nested content that people open, close and select, such as a file browser, a layers panel or folders with sub-folders. By default a click selects one row, and `multiselectable` lets people select several.","For navigation, where pressing a row opens a page, use a `NavTree` instead. For a short flat list of choices, use a `Menu` or a `Select`.","You pass the content as data through `items`. Each `TreeNode` has an `id` and a `label`, and a node with `children` shows a disclosure arrow. Add `leading` for an icon, and set `textValue` whenever the `label` is not plain text, so that typing a letter can still find the row.","`size` sets the row height, the text and the indent, and one level of indent is the width of one icon at that size. Selected rows get a soft fill.","Screen readers announce the tree with the level, position, open state and selected state of each row. The tree is a single tab stop. Up and Down move between visible rows, Right opens a row or moves to its first child, and Left closes a row or moves to its parent. Home and End go to the first and last rows, Enter or Space selects, and typing a letter jumps to the next matching row.","With `multiselectable`, Shift with an arrow key or a click selects a range, and Command or Control with a click adds or removes a single row."],
    refusals: [
      {
        name: "Drag to reorder",
        why: "The rules for where an item may be dropped are different in every app, so reordering is left to your code.",
      },
      {
        name: "Selecting a folder's children with it",
        why: "Whether selecting a folder also selects its contents is a product decision. The tree selects exactly the rows that the person picks.",
      },
      {
        name: "Loading children on demand",
        why: "The tree does not yet load branches over the network or show a loading state, so pass the full data you want to show.",
      },
      {
        name: "Renaming in place",
        why: "Your app decides what counts as a valid name and when a rename is saved, so build the rename field in your own code.",
      },
      {
        name: "JSX children",
        why: "The tree renders its rows as one flat list with ARIA levels, so it needs the hierarchy as data. Pass it through `items`.",
      },
      {
        name: "An `indent` prop",
        why: "One level of indent is always one icon wide at the current size, so the indent grows and shrinks with `size`.",
      },
    ],
  },
  {
    slug: "nav-tree",
    name: "NavTree",
    job: "Go",
    level: "leaf",
    spec: "§33",
    declaration: `<NavTree items={chapters} currentId={pathname} defaultExpandedIds={["start"]} />`,
    variants: [
      {"name":"in-a-sidebar","title":"In a sidebar","why":"The NavTree sits inside a named `nav` element, so screen readers list it with the page's other landmarks. Top-level pages and sections sit side by side."},
      {"name":"sizes","title":"Sizes","why":"The same NavTree at sizes 1 to 3. `size` sets the row height, the text and the indent together, and rows are size 2 by default."},
      {"name":"with-icons","title":"With icons","why":"Each node has an icon in `leading`, shown after the disclosure arrow. The icon follows the row's size, so you do not size it yourself."},
      {"name":"controlled","title":"Controlled","why":"The open sections live in the example's own state through `expandedIds` and `onExpandedChange`, so the two buttons can open or close every section at once."},
      {"name":"router-links","title":"Router links","why":"`renderLink` returns the element that each page renders as, which in a real app is your router's link component. Here the link updates `currentId` instead of navigating."},
      {"name":"rtl","title":"Right to left","why":"Inside `dir=\"rtl\"`, the indent moves to the right edge and the disclosure arrow points the other way."},
    ],
        abstract: "NavTree shows a site's navigation as sections that open and close, with a link for each page.",
    overview: ["Use a NavTree for navigation that is grouped into sections, such as an app's sidebar or a list of documentation chapters. The sidebar on this site is one. When pressing a row should select it rather than go somewhere, use a Tree.","A NavTree takes the same data and draws the same indent and disclosure arrow as a Tree. A node with `children` is a section, which is a button that opens and closes its pages. A node with `href` is a page, which is a real link. A node with neither is plain text, unless you provide `renderLink`.","Set `currentId` to the id of the page that is open, and that row is highlighted and marked with `aria-current=\"page\"`. To render each page as your router's link component, use `renderLink`.","Rows are size 2 by default, and each row is as tall as a Button at the same size. One level of indent is the width of one icon, so it follows `size` too.","The NavTree uses ordinary keyboard navigation: Tab moves between sections and pages, Enter or Space opens and closes a section, and Enter follows a link. Because it renders a plain container, put it inside a `<nav>` element with an `aria-label`."],
    refusals: [
      {
        name: "`role=\"tree\"`",
        why: "A tree role tells screen readers to expect selection and arrow-key navigation, which navigation does not have. Sections are buttons and pages are links instead.",
      },
      {
        name: "Selection",
        why: "Navigation has a current page rather than a selection. If people choose rows instead of visiting them, use a Tree.",
      },
      {
        name: "Arrow-key navigation",
        why: "The NavTree holds ordinary links, so Tab moves between them and Enter follows them, as in any other navigation.",
      },
      {
        name: "An `indent` prop",
        why: "One level of indent is always one icon wide at the current size, so the indent follows `size`.",
      },
    ],
  },
  {
    slug: "message-scroller",
    name: "MessageScroller",
    job: "Converse",
    level: "pattern",
    spec: "§56",
    abstract: "MessageScroller keeps a conversation at its newest message while a reply arrives, and leaves your place alone when you scroll up.",
    overview: ["Use a MessageScroller for a transcript that grows while people read it, such as a chat, a support thread or a live log. While people are at the end, it follows new content as it arrives. When they scroll up, it keeps their place until they scroll back to the end. For a list that does not grow, use a ScrollArea on its own.","A MessageScroller does not add a scroll box. It uses the `ScrollArea` or `ShellScroll` inside it as its viewport, so the pane keeps its fade, its scrollbars and its floating header. You draw the rows, the words and the counts yourself, and the Conversation block shows one way to lay out a turn.","Put each row in a `MessageScrollerItem` inside `MessageScrollerContent`. When a new row has `scrollAnchor`, it moves near the top of the view, so people start a long reply from its beginning. Older history can load above the view without moving what people are looking at.","`defaultScrollPosition` sets where the transcript opens: at the end, which is the default, at the start, or at the last row marked with `scrollAnchor`. Set `autoScroll={false}` to stop following new content.","`MessageScrollerButton` returns people to the latest message. It appears only while there is more content below, and it uses the theme's material because the transcript passes behind it. Give it an `aria-label` in your own words.","`MessageScrollerContent` is a live region, so screen readers announce new rows. Name the transcript with `aria-label` on the ScrollArea. To build your own controls, call `useMessageScroller`, `useMessageScrollerScrollable` or `useMessageScrollerVisibility` inside the MessageScroller. They move the transcript, tell you whether there is more to scroll at each end, and tell you which rows are on screen.","The behaviour comes from shadcn/ui's Message Scroller (MIT), through the `@shadcn/react` package. Kookie adds the styling and lets your own `ScrollArea` act as the scroller."],
    declaration: `<MessageScroller>
  <ScrollArea fade aria-label="Transcript">
    <MessageScrollerContent>
      <MessageScrollerItem messageId="m1" scrollAnchor>
        …
      </MessageScrollerItem>
    </MessageScrollerContent>
    <MessageScrollerButton aria-label="Jump to the latest">
      …
    </MessageScrollerButton>
  </ScrollArea>
</MessageScroller>`,
    variants: [
      {"name":"streaming","title":"A streaming reply","why":"Send a question and the reply arrives one word at a time. While you stay at the end, the view follows the words, and if you scroll up it stays where you left it."},
      {"name":"open-at-start","title":"Open at the start","why":"This log uses `defaultScrollPosition=\"start\"` so people read it from the top, and `autoScroll={false}` so new rows do not move the view."},
      {"name":"jump-to-message","title":"Jump to a message","why":"Buttons outside the transcript call `useMessageScroller` to scroll to the first message, to one row by its `messageId`, or to the latest message."},
      {"name":"custom-button","title":"Your own jump control","why":"A button built with `useMessageScrollerScrollable`, which reports whether there is more to scroll at each end. The button is disabled when you are already at the end."},
    ],
    topics: [
      { title: "Following new content", symbols: ["MessageScroller", "MessageScrollerContent"] },
      { title: "Rows, anchors and the jump button", symbols: ["MessageScrollerItem", "MessageScrollerButton"] },
    ],
    refusals: [
      {
        name: "`size`",
        why: "The only thing a MessageScroller draws is its jump button. The rows are your own components, so set their sizes on them.",
      },
      {
        name: "A viewport of its own",
        why: "Two scroll boxes in one pane fight over the scroll position, so the MessageScroller uses the `ScrollArea` that is already in the pane.",
      },
      {
        name: "A default label for the jump button",
        why: "Any built-in label would be in English, so the button requires an `aria-label` that you write in your app's language.",
      },
    ],
    parts: [
      { part: "MessageScrollerContent", blurb: "The transcript. It is a live region, and each of its direct children must be a `MessageScrollerItem`" },
      { part: "MessageScrollerItem", blurb: "One row of the transcript. Give it a `messageId` to scroll to it, and set `scrollAnchor` on the row that starts a new turn" },
      { part: "MessageScrollerButton", blurb: "A button that returns to the latest message. It appears only while there is more content below and sits at the bottom of the view" },
    ],
  },
  {
    slug: "scroll-area",
    name: "ScrollArea",
    job: "Arrange",
    level: "leaf",
    spec: "§10",
    declaration: `<ScrollArea style={{ height: "10rem" }}>
  …
</ScrollArea>`,
    variants: [
      {"name":"fade","title":"Faded edges","why":"With `fade`, the content fades out at an edge while more of it is hidden past that edge. An edge with nothing beyond it does not fade, so the fade shows whether the list continues."},
      {"name":"horizontal","title":"Sideways scrolling","why":"A row of cards that is wider than its box scrolls sideways. ScrollArea shows a bar only for the direction that overflows, so you never choose an orientation."},
      {"name":"in-a-card","title":"In a card","why":"When a ScrollArea is the only child of a Card, it reaches the card's edges and moves the card's padding inside itself, so the bar runs along the card's own edge."},
      {"name":"named-region","title":"A named scroll region","why":"This ScrollArea is named by the heading above it through `aria-labelledby`, so screen readers announce it as a region that keyboard users can scroll."},
    ],
        abstract: "ScrollArea draws its own scrollbars over the browser's native scrolling.",
    overview: ["Use a ScrollArea when content needs to scroll inside a box, such as a long list in a card or a panel. The browser still does the scrolling, so the wheel, trackpad, touch and keyboard behave as usual, while a slim rounded bar is drawn over the content instead of the browser's own scrollbar.","The bar appears while you scroll or point at the area and is hidden the rest of the time. It takes up no space, and it appears only for a direction that has more content, so you never choose horizontal or vertical.","A ScrollArea needs a limit before it can scroll. Give it a `height` or `maxHeight` through `style`, or put it inside a Shell pane or another container with a fixed height. Without a limit it grows with its content.","Set `fade` to fade the content out at any edge that has more content beyond it. When a ScrollArea is the only child of a `Card` or another surface, it reaches the surface's edges and moves the surface's padding inside itself.","When its content overflows, a ScrollArea is a tab stop, so keyboard users can focus it and scroll with the arrow keys. Name it with `aria-label` or `aria-labelledby`, and screen readers announce it as a region. Set `focusable={false}` only inside a component that already handles scrolling from the keyboard, such as a menu."],
    refusals: [
      { name: "`size`", why: "The scrollbar has one designed thickness. The size of the scrolling area comes from the height you give it." },
      { name: "`tone` and `emphasis`", why: "A scrollbar only shows where you are in the content, so it carries no colour meaning and nothing to rank." },
      { name: "`material`", why: "A ScrollArea sits inside a pane, and that pane already uses the theme's material." },
      { name: "`render`", why: "A ScrollArea is made of several nested elements that must stay in a fixed structure. Wrap it in your own element when you need one around it." },
      { name: "`orientation`", why: "The scrollbar appears for whichever direction actually overflows, so there is nothing to choose." },
    ],
  },
  {
    slug: "separator",
    name: "Separator",
    job: "Arrange",
    level: "leaf",
    spec: "§11",
    declaration: `<Separator orientation="horizontal" />`,
    variants: [
      {"name":"in-a-toolbar","title":"In a toolbar","why":"A vertical Separator stretches to the height of its row. Here it divides the text style buttons from the alignment buttons."},
      {"name":"labelled","title":"A divider with a word","why":"An \"or\" divider built from two Separators and a Text in a row. Each Separator sits in a Box that grows, so the two lines share the space that is left."},
      {"name":"in-a-card","title":"In a card","why":"Separators between the rows of a summary card. Each line fills the width of its Stack, so you never set a length."},
    ],
        abstract: "Separator draws a thin line that divides two groups of content.",
    overview: ["Use a Separator to draw a thin line between two groups of content when space alone does not make the division clear. Its colour and thickness come from the theme.","Try space first, because a larger `gap` between two groups is often enough. When a group needs its own surface, use a `Card`, and when a region needs a recessed background, use a `Surface`.","A Separator is horizontal by default and fills the width of its container. With `orientation=\"vertical\"`, it fills the height of its row instead, so you never set a length.","A Separator is a real `role=\"separator\"` element, and `orientation` sets `aria-orientation` for screen readers."],
    refusals: [
      { name: "`children`", why: "A divider with a word in it is two Separators and a Text in a row, as the example above shows." },
      { name: "A length prop", why: "The line always fills its container, so control its length by sizing the container, just as you control spacing." },
      { name: "`decorative`", why: "A line that screen readers should skip is decoration rather than a separator. Draw it with a styled `Box` instead." },
    ],
  },
  {
    slug: "sheet",
    name: "Sheet",
    job: "Focus",
    level: "leaf",
    spec: "§10, §20, §24, §49",
    abstract: "Sheet slides a panel in from an edge of the window and dims the app behind it until the task is done.",
    overview: ["Use a Sheet for a task that needs more room than a `Popover` but belongs beside the page rather than in the middle of it, such as filters, a share panel or navigation on a phone. The panel sits against an edge of the window and dims the app behind it.","For a task that belongs in the centre of the screen, use a `Dialog`, and for a short question that needs an answer, use an `AlertDialog`. For a panel that stays open while people keep working on the page, use a Shell pane such as `ShellInspector`.","A Sheet behaves like a `Dialog`. Focus stays inside the panel, the page behind it stops scrolling, and the dimmed background shows that the page is not available. Escape, a press on the dimmed background or a swipe toward the edge closes it, and `onOpenChange` tells you what closed it.","`side` can be `bottom`, which is the default, `inline-start` or `inline-end`. The inline sides follow the reading direction, so a panel that opens from the right in English opens from the left in Arabic without any change to your markup. While a person drags the panel toward its edge, it follows their finger, and on a phone a bottom sheet stays above the on-screen keyboard.","`size` sets the panel's width, padding and corner, together with the text size of `SheetTitle` and `SheetDescription`. A side sheet uses that width exactly, while a bottom sheet uses it as a maximum, so it fills a phone's width. Content that you add keeps its own sizes.","Screen readers announce the panel as a dialog, named by `SheetTitle` and described by `SheetDescription`. The part names follow shadcn/ui's sheet (MIT), and the behaviour comes from Base UI's Drawer."],
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
      {"name":"bottom","title":"From the bottom","why":"A sheet with the default `side=\"bottom\"`. On a phone it fills the window's width, and on a wider window its width stops at a size that suits one task."},
      {"name":"inline-start","title":"From the start edge","why":"With `side=\"inline-start\"`, the panel opens from the side where reading starts, which is the left in English. It suits navigation on a narrow window."},
      {"name":"controlled","title":"Controlled","why":"The open state lives in the example's own state, so the sheet can open from anywhere without a `SheetTrigger`. `onOpenChange` reports when a person closes it."},
      {"name":"long-content","title":"Content taller than the window","why":"When the content is taller than the window, the panel stops at the window's height and its body scrolls, while the page behind it stays still."},
      {"name":"rtl","title":"Right to left","why":"Inside `dir=\"rtl\"`, `inline-end` opens the panel from the left, and a swipe to the left closes it."},
    ],
    topics: [
      { title: "Opening the sheet", symbols: ["Sheet", "SheetTrigger"] },
      { title: "Presenting the panel", symbols: ["SheetContent"] },
      { title: "Naming the panel", symbols: ["SheetTitle", "SheetDescription"] },
      { title: "Closing the sheet", symbols: ["SheetClose"] },
    ],
    refusals: [
      {
        name: "A top side, and a physical left or right",
        why: "The top edge is where system and app toolbars sit, so a sheet does not open there. The sides follow the reading direction instead of left and right, so a layout works in both directions without changes.",
      },
      {
        name: "Header and footer parts, and a close button in the corner",
        why: "Arrange the title and the actions yourself in a Stack. To add a close or apply button, place a real Button inside `SheetClose` wherever your layout needs it.",
      },
      {
        name: "`modal` and `disablePointerDismissal`",
        why: "An open sheet always keeps focus inside the panel and stops the page from scrolling. For a panel that leaves the page usable, use a Shell pane.",
      },
      {
        name: "Snap points, and a swipe that opens the sheet",
        why: "A sheet is either open or closed. Half-open positions and edge swipes that open it would conflict with the browser's own back gesture.",
      },
      {
        name: "A sheet inside a sheet",
        why: "Two panels that each hold the focus cannot agree on which one has it. Change what the open sheet shows instead of opening a second one.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "The panel is a container and has no meaning of its own. Put tone and emphasis on the components inside it.",
      },
      {
        name: "An extra shadow",
        why: "The dimmed page already shows that the sheet covers the app, so the panel adds no shadow of its own.",
      },
    ],
    parts: [
      { part: "SheetTrigger", blurb: "The button that opens the sheet, usually with `render={<Button />}`. You don't need one if your own state opens the sheet" },
      { part: "SheetContent", blurb: "The panel. It dims the page, places the panel against the chosen edge and applies your theme, and its body scrolls when the content is tall" },
      { part: "SheetTitle", blurb: "The heading of the panel and its accessible name. Its text size follows the sheet's `size`" },
      { part: "SheetDescription", blurb: "A supporting line that screen readers read after the title, so avoid repeating the title's words in it" },
      { part: "SheetClose", blurb: "Closes the sheet when pressed. Pass your own Button through `render` and place it wherever your layout needs it" },
    ],
  },
  {
    slug: "shell",
    name: "Shell",
    job: "Go",
    level: "pattern",
    spec: "§27",
        abstract: "Shell is the frame of an app, with a header, a rail, a sidebar, the content, an inspector and a bottom pane.",
    overview: ["Use a Shell once, at the root of an app, to hold its frame: a full-width header, a narrow rail of icons, a sidebar, the main content, an inspector and a bottom pane. Include only the panes you need, and put your pages inside `ShellContent`.","Each pane places itself in the frame by its type, so you can write the panes in any order and that order stays the reading order. Every pane is a landmark: the header is a `<header>`, the rail and the sidebar are `<nav>` elements, the content is `<main>`, and the inspector and the bottom pane are `<aside>` elements.","Until someone opens or closes it, a pane follows the window size. The sidebar is open on a wide window and opens as an overlay on a narrow one, while the rail becomes a tab bar along the bottom. The inspector and the bottom pane start closed. CSS makes these choices, so the first paint is right before any script runs.","A `ShellTrigger` opens or closes a pane by name from anywhere in the frame. To hold a pane's state yourself, pass `open` and `onOpenChange`. Set `resizable` on the sidebar or the inspector to let people drag its edge to a new width.","By default the panes join edge to edge, with a single line between them. Set `flush={false}` on the side panes to float them over the content as separate panels, or on `ShellContent` to set the work area in from the frame as its own panel.","`size` on the Shell sets the size of the navigation rows, the rail items, the header rows and the padding in every pane, and each pane can set its own. A Shell fills the window by default, and `contained` makes it fill its parent instead, such as a card or a demo.","When a pane opens as an overlay, focus moves into it and the rest of the frame is unavailable until Escape, a press outside the pane or a `ShellTrigger` closes it."],
    declaration: `<Shell>
  <ShellHeader>…</ShellHeader>
  <ShellRail aria-label="Regions">
    <ShellRailList>
      <ShellRailItem label="Files">{icon}</ShellRailItem>
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
    <ShellPaneFooter>…</ShellPaneFooter>
  </ShellSidebar>
  <ShellContent>…</ShellContent>
  <ShellInspector aria-label="Details">…</ShellInspector>
  <ShellBottom aria-label="Console">…</ShellBottom>
</Shell>`,
    variants: [
      {"name":"notice","title":"A notice for the whole app","why":"A `ShellNotice` is a `Notice` in its own row above the header, across every column. Use it for a condition about the whole app, such as planned maintenance. Your app stores the dismissal, and removing the notice gives the frame its height back."},
      {"name":"header","title":"A full-width header","why":"A `ShellHeader` runs across every column. The `ShellTrigger` in it toggles the sidebar, so people can bring the sidebar back after they close it."},
      {"name":"rail","title":"A rail beside the sidebar","why":"A `ShellRail` holds icons for the app's top-level areas, and the sidebar lists the pages in the chosen area. Each `<nav>` has its own `aria-label`."},
      {"name":"inspector","title":"A details inspector","why":"A `ShellInspector` is a details column at the end of the frame. It is closed unless something opens it, so this example starts it open with `defaultOpen`, and a `ShellTrigger` in the content toggles it."},
      {"name":"bottom-pane","title":"A bottom pane for logs","why":"A `ShellBottom` is a full-width pane under the columns, for a console or a build log. This example starts it open with `defaultOpen`, and a `ShellTrigger` toggles it."},
      {"name":"floating","title":"Floating side panes","why":"The rail and sidebar have `flush={false}` while the content stays flush. The content fills the whole frame, and the two panes float over it as separate panels."},
      {"name":"grounded","title":"Content as its own panel","why":"Only `ShellContent` has `flush={false}`. The work area becomes a separate panel set in from the frame, while the header and sidebar stay joined to it."},
      {"name":"resizable","title":"A resizable sidebar","why":"With `resizable`, people can drag the sidebar's edge or move it with the arrow keys. `minWidth` and `maxWidth` limit the width, and `onResize` reports the new width so you can store it."},
      {"name":"controlled","title":"Controlled","why":"The sidebar's `open` state lives in the example's own state, so a Switch in the content can show and hide it. `onOpenChange` fires only when a person opens or closes the pane."},
    ],
    topics: [
      { title: "The frame", symbols: ["Shell"] },
      { title: "The panes", symbols: ["ShellNotice", "ShellHeader", "ShellSidebar", "ShellContent", "ShellInspector", "ShellBottom"] },
      {
        title: "The rail and the tab bar",
        symbols: ["ShellRail", "ShellRailList", "ShellRailItem", "ShellRailAction", "ShellTabBar"],
      },
      { title: "Inside a pane", symbols: ["ShellScroll", "ShellPaneHeader", "ShellPaneFooter"] },
      { title: "Navigation rows", symbols: ["ShellNavGroup", "ShellNavItem"] },
      { title: "Opening and closing a pane", symbols: ["ShellTrigger"] },
    ],
    refusals: [
      { name: "A `gap` prop", why: "The space around floating panes is one step of the theme's layout spacing, so it tightens and loosens with density. A custom number would fall out of step with the rest of the app." },
      { name: "A header position option", why: "The `ShellHeader` always spans the full width. For a header over the content only, put a header inside `ShellContent`." },
      { name: "A narrow mode for the sidebar", why: "A narrow column of icons is a rail, so use a `ShellRail` beside the sidebar. The two are separate panes that you can connect yourself." },
      { name: "Closing the sidebar together with the rail", why: "Whether the two panes open and close together depends on the app, and many apps keep them independent. Use `ShellTrigger` or controlled state to link them." },
      { name: "A half-open `peek` state", why: "A pane is either open or closed. A half-open pane is complex to build and adds little, so it will wait until a real screen needs it." },
      { name: "An action on `ShellRailItem`", why: "A rail item goes to a place in the app. For a control that does something else, such as opening search, use `ShellRailAction`, which sits beside the group of places in the tab bar." },
      { name: "`backdrop` on `ShellContent`", why: "Nothing ever sits behind the work area, so glass there would have nothing to show through. Put a Box or a Card with `backdrop` inside the content instead." },
      {
        name: "A tab bar built from the sidebar",
        why: "A tab bar holds three to five items, while a sidebar is often much longer, so you choose what a phone shows by writing a `ShellTabBar` or a `ShellRail`.",
      },
      {
        name: "A tab bar that changes what the sidebar shows",
        why: "Each item in a tab bar goes to a place, so it takes a link rather than an `onClick`. To change what a pane shows, use a rail.",
      },
      { name: "A `presentation` value for floating panes", why: "A pane floats or stands apart when you set `flush={false}`, and the Shell works out which of the two you get from the other panes." },
    ],
    parts: [
      { part: "ShellHeader", blurb: "The bar across the top of the whole frame, rendered as a `<header>` landmark. For a header over the content only, put one inside `ShellContent`" },
      { part: "ShellRail", blurb: "The narrow column of icons for the app's top-level areas, rendered as a `<nav>`. On a narrow window it becomes a tab bar along the bottom. When a sidebar is present too, give each an `aria-label`" },
      { part: "ShellSidebar", blurb: "The wide navigation column, rendered as a `<nav>`. It is open on a wide window and opens as an overlay on a narrow one, unless you open or close it yourself" },
      { part: "ShellContent", blurb: "The work area, rendered as `<main>`, which fills the space the other panes leave. It scrolls inside the frame, except on a narrow touch screen, where the page itself scrolls" },
      { part: "ShellRailItem", blurb: "One square in the rail, for one of the app's main areas. It shows only an icon, so give it a `label`, which screen readers announce and the tab bar shows under the icon" },
      { part: "ShellRailList", blurb: "A group of rail items. A rail often has two, one for the app's areas at the top and one for account and settings at the bottom. In the tab bar, this group holds the places" },
      { part: "ShellRailAction", blurb: "A control in the rail or tab bar that does something rather than going somewhere, such as opening search. In the tab bar it sits apart from the group of places, so it does not look like a destination" },
      { part: "ShellScroll", blurb: "The part of a pane that scrolls. The pane's other children stay in place, and this part fills the space that is left" },
      { part: "ShellPaneHeader", blurb: "A header row at the top of a pane. It is one control row tall at the pane's size, so it lines up with the rail and the app header beside it. With `float`, the pane's content scrolls behind it" },
      { part: "ShellPaneFooter", blurb: "The same kind of row at the bottom of a pane. With `float`, the pane's content scrolls behind it" },
      { part: "ShellNavGroup", blurb: "A group of navigation rows under a heading. Screen readers announce the heading as the name of the group" },
      { part: "ShellNavItem", blurb: "One navigation row, as tall as a Button at the same size. Set `current` on the row for the page that is open" },
      { part: "ShellInspector", blurb: "The details column at the end of the frame, rendered as an `<aside>`. It starts closed, unless you set `defaultOpen`" },
      { part: "ShellNotice", blurb: "A `Notice` about the whole app, in its own row above the header and across every column. It takes the `Notice` props, plus `flush`" },
      { part: "ShellBottom", blurb: "A full-width pane below the columns for a console or a log, rendered as an `<aside>`. It starts closed, unless you set `defaultOpen`" },
      {
        part: "ShellTabBar",
        blurb:
          "A tab bar for an app without a rail. On a narrow window it shows three to five places along the bottom, and on a wide window it shows nothing, because the sidebar holds the navigation. It is optional: without it, the sidebar opens as a drawer at every width",
      },
      { part: "ShellTrigger", blurb: "A button that opens, closes or toggles a pane by name, from anywhere in the frame" },
    ],
  },
  {
    slug: "slider",
    name: "Slider",
    job: "Choose",
    level: "leaf",
    spec: "§4, §11",
    declaration: `<Slider defaultValue={40} aria-label="Volume" />`,
    variants: [
      {"name":"range","title":"A range with two handles","why":"Pass an array as the value, and the Slider draws a handle for each entry. Here `minStepsBetweenValues` keeps the two price handles apart, and `format` sets how each value is announced to a screen reader."},
      {"name":"controlled","title":"Controlled","why":"Hold the value in your own state when you want to show it somewhere else. `onValueChange` fires while someone drags, and `onValueCommitted` fires once when they let go, which is the right moment to save."},
      {"name":"steps","title":"Steps and limits","why":"`min`, `max` and `step` set the values a handle can stop on. `largeStep` sets how far Page Up, Page Down and Shift with an arrow key move it."},
      {"name":"disabled","title":"Disabled","why":"A disabled Slider still shows its value, but it can't be moved. The filled part turns grey so the setting reads as locked, and a line of text underneath says why."},
      {"name":"in-a-form","title":"In a form","why":"Inside a `Field`, the `FieldLabel` names the Slider, so you don't need `aria-label`. Give it a `name`, and its value is sent when the form is submitted."},
      {"name":"rtl","title":"Right to left","why":"Inside an element with `dir=\"rtl\"`, the Slider fills from the right and the right arrow key lowers the value. The Slider picks up the direction from the page, so it has no prop for it."},
    ],
        abstract: "Slider lets someone choose a number by dragging a handle along a track.",
    overview: ["Use a Slider for a value such as a volume, a price or a timeout, where the rough position in the range matters more than the exact number. When people need to type an exact number, use a `NumberField` instead.","Pressing anywhere on the Slider moves the nearest handle there, and the pressable area is as tall as a `Button` of the same size. The handle is the same size as a `Checkbox` at that size, so the two look like they belong together in a form. A Slider fills the width of its container, so set the width on the container rather than on the Slider.","To choose a range, pass an array as the value and the Slider draws one handle for each entry. The filled part of the track uses the accent colour and the rest of the track is neutral. A disabled Slider turns the filled part grey.","Each handle is a real range input, so the arrow keys, Page Up, Page Down, Home and End all move it. Name a Slider that stands alone with `aria-label`. Inside a `Field`, the `FieldLabel` names it for you. In a right-to-left page the Slider fills from the right, and the arrow keys follow that direction."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "A slider sets a value rather than running an action, so there is nothing for a colour or a louder style to rank. Every slider in a form looks the same." },
      {
        name: "`orientation`",
        why: "A vertical slider needs its own set of measurements, which have not been designed yet. For now, every Slider is horizontal.",
      },
    ],
  },
  {
    slug: "spinner",
    name: "Spinner",
    job: "Know",
    level: "leaf",
    spec: "§8",
    declaration: `<Spinner />`,
    variants: [
      {"name":"in-a-button","title":"In a button","why":"Set `loading` on a `Button`, and a Spinner appears in place of its icon. The label stays, so the button keeps its width and a screen reader still hears what is running."},
      {"name":"with-a-label","title":"With a label","why":"A screen reader skips a Spinner, so put the state in words beside it. Wrapping the pair in `role=\"status\"` makes a screen reader announce the words when they appear."},
      {"name":"colour","title":"Colour from the text","why":"A Spinner draws in the colour of the text around it. Set a `tone` on the surrounding `Text`, and the Spinner inside takes the same colour."},
      {"name":"sizes","title":"Sizes","why":"Inside a control, a Spinner is the same size as that control's icon. This row shows a loading `Button` at each of the four sizes."},
    ],
        abstract: "Spinner shows that something is working and that you should wait.",
    overview: ["Use a Spinner for a short wait when you can't say how much work is left. It draws eight spokes with a fading trail and turns one spoke at a time.","When you know how far the work has got, such as an upload at 40%, use `Progress` instead. When the wait belongs to an action, use the `loading` prop on `Button`, because the button then marks itself as busy and keeps its label.","A Spinner draws in the colour of the text around it, so it matches its surroundings in every tone and in light and dark mode. Inside a control it is the size of that control's icon, so you can swap an icon for a Spinner and nothing shifts. On its own it is the icon size of a size 2 control.","The rotation keeps running even while the page's JavaScript is busy. When the operating system asks for reduced motion, the Spinner turns more slowly but doesn't stop, because a spinner that stood still would look like a frozen page.","A screen reader doesn't announce a Spinner. Put the state in words next to it, or use a control that marks itself as busy, such as a `Button` with `loading`."],
    refusals: [
      {
        name: "A size prop",
        why: "A Spinner takes the icon size of the control it sits in, so swapping it for an icon never moves anything. On its own it uses the size 2 icon size.",
      },
      { name: "A colour prop", why: "A Spinner draws in the colour of the text around it. To change its colour, set a `tone` on the surrounding `Text`." },
    ],
  },
  {
    slug: "stack",
    name: "Stack",
    job: "Arrange",
    level: "leaf",
    spec: "§3",
    declaration: `<Stack gap="3" align="start">
  …
</Stack>`,
    variants: [
      {"name":"gap","title":"Gaps","why":"`gap` sets the space between every child. A small step suits items that belong together, such as the lines of an address, and a larger step suits groups that are separate."},
      {"name":"alignment","title":"Alignment","why":"`align` sets where each child sits across the column. With the default, each child is as wide as the Stack. Use `flex-start` to keep buttons at their own width."},
      {"name":"nested-groups","title":"Nested groups","why":"Put a Stack inside a Stack to make groups, with a smaller gap inside each group and a larger gap between them. The difference in space tells people which items belong together."},
      {"name":"with-separators","title":"With separators","why":"Place a `Separator` wherever you want a line. Here each row after the first starts with one, so there is no line above the first row. The gap sets the space on both sides of each line."},
      {"name":"responsive","title":"Responsive","why":"Give `gap` or `align` an object with a value for each breakpoint. Here the gap grows and the buttons stop stretching when the container is wider. The breakpoints measure a container, not the browser window."},
      {"name":"render","title":"As a section","why":"Use `render` to make the Stack a meaningful element, such as a `section` named by its heading. The column and the gap stay the same, and only the element changes."},
    ],
        abstract: "Stack places its children in a column, one under the other, with a gap between them.",
    overview: ["Use a Stack for most vertical layouts, such as a form, a list of settings, the inside of a card or a group of paragraphs. When the children sit side by side, use a `Flex`, and when they sit in rows and columns, use a `Grid`. A Stack is a `Box` with a column layout already set, so it takes the same props.","Set the space between children with `gap`. The value is a step on the space scale rather than a length, and the theme and its density setting decide how much space each step is. Components never set their own outer margin, so the Stack controls all of the space between them.","Because a column has one direction, a Stack has no `direction`, `wrap`, `gapX` or `gapY`. If you need a row, use `Flex`. To draw a line between items, place a `Separator` where you want it.","Most props accept a responsive value, such as `{ initial: \"3\", md: \"5\" }`. The breakpoints measure the nearest `Box` marked with `container`, or the whole app when there is none. Use `render` to make the Stack a different element, such as a `section` or a `form`, while the layout stays the same."],
    refusals: [{ name: "`dividers`", why: "A prop that adds a line between every child can't know where you want an exception. Place a `Separator` exactly where each line belongs." }],
  },
  {
    slug: "segmented-control",
    name: "SegmentedControl",
    job: "Choose",
    level: "leaf",
    spec: "§4, §11, §19, §26",
        abstract: "SegmentedControl shows a few options side by side and lets someone pick one of them.",
    overview: ["Use a SegmentedControl for two to five short options that change a setting in place, such as a list or grid view. When the choice switches the content below it, use `Tabs`. When people can pick more than one option, use a `ToggleGroup` of `Toggle`s, and when there are too many options to show at once, use a `Select`.","The chosen option sits on a raised tile, and the control is as tall as a `Button` of the same size, so it lines up in a toolbar. Every segment has the same weight, and you set the size once on the control rather than on each segment.","Set `backdrop` when content passes behind the control, such as an image, and it uses the theme's glass material. A `<Box backdrop>` around a whole toolbar does the same for every control inside it.","A screen reader announces the control as a radio group, because picking one of several options is what a radio group does. The arrow keys move the choice from one segment to the next. Give the control an `aria-label` that names the setting."],
    declaration: `<SegmentedControl defaultValue="grid" aria-label="View">
  <SegmentedItem value="list">List</SegmentedItem>
  <SegmentedItem value="grid">Grid</SegmentedItem>
</SegmentedControl>`,
    variants: [
      {"name":"with-icons","title":"With icons","why":"A segment can hold an icon beside its label. The icon is sized for the control, so every segment keeps the same height."},
      {"name":"icon-only","title":"Icon-only segments","why":"A segment with only an icon needs an `aria-label` so that a screen reader can name the option. Use icons people already know, such as list and grid."},
      {"name":"controlled","title":"Controlled","why":"Hold the value in your own state with `value` and `onValueChange` when the choice changes something else on the screen. Here the billing period changes the price shown below."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on one `SegmentedItem` to block that option, or on the `SegmentedControl` to block the whole control. The options stay visible either way."},
      {"name":"in-a-toolbar","title":"In a toolbar","why":"At the same size, a SegmentedControl is as tall as the `TextField` and `Button` beside it, so a row of mixed controls lines up without any extra work."},
    ],
    topics: [
      { title: "Picking one of a few", symbols: ["SegmentedControl", "SegmentedItem"] },
    ],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "The options in a SegmentedControl are equal choices, so none of them should look louder than the others. The control always uses the same neutral colours.",
      },
      {
        name: "Selecting more than one option",
        why: "A SegmentedControl holds exactly one answer. When people can turn several options on at once, use a `ToggleGroup` of `Toggle`s.",
      },
      {
        name: "`nativeButton` and `render`",
        // SCOPED TO THE SEGMENT (2026-09-07, the audit). The sentence is about a segment, and
        // an unscoped refusal reaches the root — where `render` is real and `tsc` accepts it,
        // so the two channels gave opposite verdicts on `<SegmentedControl render={<Stack/>}>`.
        on: ["SegmentedItem"],
        why: "A segment is always the same element. Setting `nativeButton` would stop Space from selecting it, and changing the element with `render` gives you nothing a segment needs.",
      },
      { name: "`readOnly`", why: "HTML has no read-only version of a selection control, so there is no familiar look to copy. Use `disabled` when the choice can't be changed." },
    ],
    parts: [
      { part: "SegmentedItem", blurb: "One option in the control. It holds its own label, and optionally an icon, and a screen reader announces it as a radio button that is checked or not" },
    ],
  },
  {
    slug: "switch",
    name: "Switch",
    job: "Choose",
    level: "leaf",
    spec: "§4, §6, §11, §19",
    declaration: `<Switch id="notify" defaultChecked />
<Text render={<label htmlFor="notify" />}>Notifications</Text>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the height and width of the track, from 1 to 4. At each size a Switch is a little larger than a `Checkbox`. Use size 2 unless the row around it uses another size."},
      {"name":"controlled","title":"Controlled","why":"Pass `checked` and `onCheckedChange` to keep the state in your app, as here, where the text below changes with the switch. When nothing else depends on the value, use `defaultChecked` instead."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` to stop a switch from changing. The track dims, but the thumb stays clear, so people can still see whether the setting is on or off."},
      {"name":"with-description","title":"With a description","why":"Put each switch in a `FieldItem` with its own `FieldLabel` and `FieldDescription`, and they connect to the switch for you. The outer `FieldLabel` names the whole group."},
      {"name":"settings-card","title":"A settings card","why":"Put the label at the start of each row and the switch at the end, with a `Separator` between rows. This is the usual layout for a list of account settings."},
      {"name":"in-a-form","title":"In a form","why":"Give the switch a `name`, and it sends a value when the form is submitted. A checked switch sends `on`, and an unchecked switch sends nothing."},
    ],
        abstract: "Switch turns a single setting on or off, and the change takes effect straight away.",
    overview: ["Use a Switch for a setting that applies as soon as it changes, with no save button. When the choice waits until a form is submitted, use a `Checkbox` instead.","When it is off, the track is a neutral channel. When it is on, the track fills with the accent colour. A Switch is a little larger than a `Checkbox` of the same size, and it has no `tone` or `emphasis`, so every switch looks the same.","The label is a separate element placed beside the Switch. Use a `Text` rendered as a `label`, with `htmlFor` set to the Switch's `id`. Inside a `Field`, put the Switch in a `FieldItem` with a `FieldLabel` and `FieldDescription`, and they are connected for you.","The area that responds to a press is larger than the track, so a Switch is easy to hit with a finger. On a touch screen the whole Switch grows, but the density setting doesn't change it.","A screen reader announces a Switch as a switch that is on or off, and Space changes it. A hidden checkbox goes with it, so a Switch with a `name` sends its value with a form."],
    refusals: [
      { name: "`tone` and `emphasis`", why: "A Switch is always neutral when off and uses the accent colour when on, so every switch in an app reads the same way." },
      { name: "`children`", why: "The label sits beside the Switch rather than inside it, so that the row decides the space between them. Put a `Text` rendered as a `label` next to it." },
      {
        name: "`readOnly`",
        why: "HTML has no read-only switch, so there is no familiar look to copy. Use `disabled` for a setting that can't be changed, as you would with a `Checkbox`.",
      },
    ],
  },
  {
    slug: "table",
    name: "Table",
    job: "Browse",
    level: "leaf",
    spec: "§11, §36",
        abstract: "Table shows data in rows and columns, and it scrolls sideways when the columns need more room than the page has.",
    overview: ["Use a Table for data that people compare across rows and columns, such as invoices or members. It renders a real `table` element, so a screen reader can move by row and by column and read out the header for each cell.","The Table draws the lines between rows, the space inside each cell and a header row in a muted colour, and nothing else. Its rows don't react to hover or presses. For sorting, put a `Button` in a header cell and sort the rows in your own code.","When the columns need more room than the page has, the Table scrolls sideways inside its own box rather than widening the page. That box can take keyboard focus only while it scrolls. Name it with `aria-label` or `aria-labelledby` so a screen reader announces it as a named region, and add a `TableCaption` to name the table itself.","`size` sets the cell padding and the text size together, from 1 to 4, and the padding also follows the density setting. The first and last columns have no padding on their outer edge, so the text lines up with the content around the table.","Use `align` on `TableHead` and `TableCell` to set `start`, `center` or `end`, and set the same value for every cell in a column. Put words at the start and numbers at the end so the digits line up."],
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
      <TableCell align="end">£240.00</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the cell padding and the text size together. Use size 2 for most tables, size 1 for dense data, and size 3 or 4 for a short table that has room to spare."},
      {"name":"alignment","title":"Alignment","why":"Set `align` on the header cell and on every body cell in the same column. The price column sits at the end so its digits line up, and the short quantity is centred."},
      {"name":"wide","title":"Wide columns","why":"When the columns are wider than the space, the table scrolls sideways inside its own box and the page stays the same width. The `aria-label` names the scrolling box when it takes focus."},
      {"name":"labelled-by-heading","title":"Named by a heading","why":"Set `aria-labelledby` to the `id` of a visible heading, and a screen reader uses the heading as the name of the table's region. Use `aria-label` when there is no visible heading."},
      {"name":"with-actions","title":"With actions","why":"Put a `Button` in a cell for an action on that row. Give each icon-only button an `aria-label` that names the row, such as the file name, because the row itself doesn't respond to a press."},
      {"name":"in-a-card","title":"In a card","why":"A table in a `Card` sits under a heading that names it. A `Chip` in a cell shows each member's status in a tone, and the table has no fill of its own, so the card's fill shows through."},
    ],
    topics: [
      { title: "Laying out the table", symbols: ["Table", "TableHeader", "TableBody"] },
      { title: "Rows and cells", symbols: ["TableRow", "TableHead", "TableCell"] },
      { title: "Naming it", symbols: ["TableCaption"] },
    ],
    refusals: [
      {
        name: "A ScrollArea around it",
        why: "The Table already scrolls sideways by itself and takes focus only when it overflows. A `ScrollArea` needs a fixed height, which a table rarely has.",
      },
      { name: "Hover, selection and a press on rows", why: "A row that people can select or open needs keyboard support and an accessible name of its own. That will be a separate component, so this Table's rows stay static." },
      { name: "`tone` and `emphasis`", why: "A table as a whole has no meaning to colour. To show a status, put a tone on a `Text` or a `Chip` inside a cell." },
      { name: "A sticky header", why: "Components never decide their own position on the page. For a tall table with a pinned header, put it in a `ScrollArea` and pin the header there." },
      { name: "Sorting and column controls", why: "Sorting needs state and keyboard handling that belong to your app. Put a `Button` in the header cell, sort the data yourself, and the Table draws the rows in the order you give it." },
    ],
    parts: [
      { part: "TableHeader", blurb: "The header section of the table. Its cells are `TableHead`s, drawn in the muted text colour at medium weight so the column names sit back behind the data" },
      { part: "TableBody", blurb: "The body section of the table. Its last row has no line under it, because the table ends there" },
      { part: "TableRow", blurb: "One row of the table. It doesn't respond to hover, selection or presses, so use a different component for rows that people pick" },
      { part: "TableHead", blurb: "A header cell. It sets `scope=\"col\"` unless you pass a different `scope`, and it takes `align` for its column" },
      { part: "TableCell", blurb: "A body cell. Use `align` to put words at the start and numbers at the end" },
      { part: "TableCaption", blurb: "Says what the table is. It sits under the table in the muted text colour and is also the table's accessible name" },
    ],
  },
  {
    slug: "tabs",
    name: "Tabs",
    job: "Go",
    level: "leaf",
    spec: "§11, §15, §26",
        abstract: "Tabs lets people switch between several views of the same subject and shows which view is open.",
    overview: ["Use Tabs to switch between views of one subject, such as the overview, activity and settings of a project. Selecting a tab shows its panel under the bar, and only one panel shows at a time. To choose a value that changes content in place, such as a list or grid view, use a `SegmentedControl`. For actions, use a `Menu`.","The open tab has full-strength text and a line under it in the accent colour, and the other tabs have muted text. The open tab doesn't get a fill or a heavier weight, because heavier text is wider and the bar would shift each time the tab changed.","Set `size` on `TabsList`, and every tab in the bar uses it. Tabs are always horizontal. To make each tab a link to a separate page, use `render` on `TabsTab`.","A screen reader announces a tab list, its tabs and their panels. Tab moves focus into the bar, the arrow keys move focus between tabs, and Enter or Space opens the focused tab. A disabled tab can still receive focus, but it can't be opened."],
    declaration: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTab value="overview">Overview</TabsTab>
    <TabsTab value="activity">Activity</TabsTab>
  </TabsList>
  <TabsPanel value="overview">…</TabsPanel>
  <TabsPanel value="activity">…</TabsPanel>
</Tabs>`,
    variants: [
      {"name":"with-panels","title":"With panels","why":"Give each `TabsPanel` the same `value` as its tab. The panel for the open tab shows and the others are hidden. A panel has no fill or border of its own."},
      {"name":"sizes","title":"Sizes","why":"Set `size` on `TabsList` to change the height and text of every tab in the bar. Use size 2 in most places, and match the size of the controls near the bar."},
      {"name":"controlled","title":"Controlled","why":"Pass `value` and `onValueChange` to keep the open tab in your app. Use this when something outside the bar must change the tab, such as a button or the URL. When nothing else depends on it, use `defaultValue`."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on a `TabsTab` to stop people from opening it. The tab dims but stays in place, so tell people elsewhere why the view isn't available."},
      {"name":"as-links","title":"As links","why":"Use `render` with an `a` element when each tab is a separate page, so every tab is a real link with an `href`. Set the open tab from the current page's address."},
      {"name":"in-a-card","title":"In a card","why":"Put Tabs in a `Card` to switch between views inside one object. The bar has no fill, so the card's fill shows through, and the line under the bar runs the full width of the card's content."},
    ],
    topics: [
      { title: "Switching between views", symbols: ["Tabs", "TabsList", "TabsTab"] },
      { title: "What a tab reveals", symbols: ["TabsPanel"] },
    ],
    refusals: [
      {
        name: "`tone` and `emphasis`",
        why: "The only thing that sets one tab apart is whether it is open, and the bar already shows that. A colour or a louder style on a tab would compete with it.",
      },
      {
        name: "TabsTrigger and TabsContent",
        why: "In this library a trigger is something that opens a floating layer, such as a menu, and a tab opens nothing. The parts are called `TabsTab` and `TabsPanel`, after the roles a screen reader announces.",
      },
      {
        name: "`material`",
        why: "A tab bar has no background of its own, so there is nothing for the glass material to apply to.",
      },
      { name: "An indicator part", why: "`TabsList` draws and places the line under the open tab for you, so there is nothing to add and nothing to forget." },
    ],
    parts: [
      { part: "TabsList", blurb: "The bar that holds the tabs, with the thin line along its bottom. Set `size` here, and the bar draws the line under the open tab for you" },
      { part: "TabsTab", blurb: "One tab. It is as tall as a control of the same size, and it shows that it is open through its text colour and the line under it" },
      { part: "TabsPanel", blurb: "The content that its tab shows. It draws no box of its own, so put a `Card` inside it if the content needs one" },
    ],
  },
  {
    slug: "toggle",
    name: "Toggle",
    job: "Act",
    level: "leaf",
    spec: "§11, §34",
        abstract: "Toggle is a button that stays pressed until you press it again, for things like bold text or a filter.",
    overview: ["Use a `Toggle` for something that is on or off while you work, such as bold in a formatting bar, a filter, or a panel that you show or hide. When the person must pick exactly one of several options, use a `SegmentedControl`. Use a `Switch` for a saved setting, a `Checkbox` for an option in a form, and a `Button` for an action that runs and finishes.","A Toggle looks and behaves like a `Button`, except that its state sets its style. It is quiet when off and gets a soft fill when pressed, so it has no `emphasis` prop. `tone` gives the toggle a meaning, such as `destructive` when turning it on blocks something.","Use a `ToggleGroup` for several toggles that share one array of pressed values, such as bold, italic and underline. Each toggle in the group still turns on and off by itself. The group has no layout of its own, so use `render` to make it a `Flex` or a `Stack`.","A screen reader announces a Toggle as a button that is pressed or not pressed, and Space or Enter changes it. In a `ToggleGroup`, the whole group is one tab stop, and the arrow keys move focus between the toggles without pressing them. Set `orientation` to `vertical` when the toggles run in a column."],
    declaration: `<ToggleGroup aria-label="Format" defaultValue={["bold"]}>
  <Toggle value="bold" aria-label="Bold">{icon}</Toggle>
  <Toggle value="italic" aria-label="Italic">{icon}</Toggle>
</ToggleGroup>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` has the same four steps as `Button`, and a toggle and a button at the same size are the same height. Use size 2 in most places."},
      {"name":"icon-only","title":"Icon only","why":"Set `iconOnly` to make the toggle a square around one icon, as in a formatting bar. An icon-only toggle needs an `aria-label`, because the icon has no text for a screen reader."},
      {"name":"with-icons","title":"With icons","why":"Put an icon in `leading` or `trailing` beside the label. The theme sets the icon's size and the gap between it and the text."},
      {"name":"tones","title":"Tones","why":"`tone` sets what the toggle means, and its text and pressed fill take that tone's colour. Use `destructive` when turning the toggle on blocks or removes something."},
      {"name":"bordered","title":"Bordered","why":"Set `bordered` to add a thin border that stays in both states. Use it for a row of filters that should be visible before anyone presses them."},
      {"name":"controlled","title":"Controlled","why":"Pass `pressed` and `onPressedChange` to keep a single toggle's state in your app. For a group, pass `value` and `onValueChange` with an array of the pressed values."},
      {"name":"disabled","title":"Disabled","why":"Set `disabled` on a toggle to stop presses and grey it out, whether it is pressed or not. Set `disabled` on a `ToggleGroup` to disable every toggle in it."},
      {"name":"vertical","title":"Vertical group","why":"Set `orientation=\"vertical\"` on a `ToggleGroup` when the toggles run in a column, so the up and down arrow keys move focus. The column itself comes from the `Stack` passed to `render`."},
    ],
    topics: [
      { title: "A button that stays pressed", symbols: ["Toggle"] },
      { title: "Sharing one state across several", symbols: ["ToggleGroup"] },
    ],
    refusals: [
      { name: "`emphasis`", why: "A Toggle's style shows whether it is on: quiet when off and filled when pressed. Choosing an emphasis could make an unpressed toggle look pressed." },
      { name: "`loading`", why: "A Toggle changes state at once and never waits for work to finish. Use a `Button` with `loading` for a task that runs, or a `Switch` for a saved setting." },
      { name: "A single-select group", why: "A group where only one option can be on is a radio group. Use a `SegmentedControl` for that, so a screen reader announces it correctly." },
      { name: "`render`", on: ["Toggle"], why: "A Toggle is always a `button`, because its pressed state is announced through that element's attributes. Swapping the element would lose that announcement." },
    ],
    parts: [
      { part: "ToggleGroup", blurb: "Holds a set of toggles that share one array of pressed values, with arrow-key movement between them. It has no layout of its own, so use `render` to make it a `Flex` or `Stack`" },
    ],
  },
  {
    slug: "split-button",
    name: "SplitButton",
    job: "Act",
    level: "leaf",
    spec: "§11, §53",
    declaration: `<SplitButton
  menuLabel="More merge options"
  menu={<MenuItem>Squash and merge</MenuItem>}
>
  Merge
</SplitButton>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` sets the height of both halves together, from 1 to 4, and the menu opens at the same size. Use size 2 unless the SplitButton sits beside controls of another size."},
      {"name":"emphasis","title":"Emphasis","why":"`emphasis` sets how prominent the button is: `loud`, `medium` or `quiet`. Use `loud` once per screen, for the main action, and add `bordered` when a quiet SplitButton needs a visible edge."},
      {"name":"tones","title":"Tones","why":"`tone` gives both halves a meaning. Use `destructive` when the common action removes something, and set the same tone on the dangerous menu items so the menu agrees with the button."},
      {"name":"with-icon","title":"With an icon","why":"`leading` puts an icon before the label. The icon appears on the action half only, because the other half always shows the chevron."},
      {"name":"disabled","title":"Disabled","why":"`disabled` turns off both halves, so neither can be pressed and the menu can't open. Put the reason next to the button, as this example does, because a disabled control can't explain itself."},
      {"name":"menu-groups","title":"Menu groups","why":"`menu` accepts anything a `MenuContent` accepts. Use `MenuGroup` and `MenuLabel` to sort a longer list, and give a destructive item its own `tone`."},
    ],
        abstract: "SplitButton runs a common action from its label and opens the related actions from a chevron beside it.",
    overview: ["A SplitButton pairs one common action with a few close alternatives. Pressing the label runs the common action, and pressing the chevron opens a Menu with the others. Use it when one choice is right most of the time, such as merge beside squash and merge or rebase and merge.","If no action is more common than the rest, put a Menu on a plain Button instead. If the actions aren't variants of one task, place separate Buttons in a Toolbar.","The two halves are real Buttons drawn as one box, so they share the same `size`, `tone`, `emphasis` and `bordered` values and look like a single control. Each half is still its own button, with its own focus stop. The menu opens under the whole button, lined up with its end edge.","The chevron half has no visible words, so you must name it with `menuLabel`. Screen readers announce that name along with the fact that the half opens a menu."],
    refusals: [
      { name: "`iconOnly`", why: "The label is how people know what the common action is, so it can't be removed. For actions without words, use icon buttons in a `Toolbar` instead." },
      { name: "`render`", why: "A SplitButton renders two buttons and a menu, so there is no single element that `render` could replace." },
    ],
  },
  {
    slug: "carousel",
    name: "Carousel",
    job: "Browse",
    level: "leaf",
    spec: "§10, §55",
        abstract: "Carousel lets people browse a long row of items that scrolls sideways, with a button at each end.",
    overview: ["A Carousel shows a row of items that scrolls sideways and comes to rest on an item each time. Use it for a long row of peers that people browse, such as templates, recent projects or covers. When every item fits in the space, use a Grid or a Flex, and for a vertical list that scrolls, use a ScrollArea.","Put a `CarouselRail` inside the `Carousel`, and wrap each item the rail should stop on in a `CarouselItem`. The component doesn't set a width, a gap or an aspect ratio for the items, so set the item width yourself and place the items in a Flex to space them. Give the rail a bounded width, and set `fade` when it runs to the edge of a pane.","Place `CarouselPrevious` and `CarouselNext` anywhere inside the `Carousel`, either in a row above the rail or on each side of it. The package ships no icons, so put your own arrows in the buttons. No scrollbar is drawn, because the buttons and the fade already show that there is more to see.","Scrolling is the browser's own, so the mouse wheel, the trackpad, touch and the keyboard all work as usual. Each button press moves the rail by one item, and a button is disabled when there is nothing more in its direction. The carousel never plays on its own and never loops.","A Carousel renders a group that screen readers announce as a carousel. Name it with `aria-label`, or point `aria-labelledby` at the heading above it. The buttons are named \"Previous\" and \"Next\" by default and tell assistive technology which rail they move. A disabled button stays focusable, so keyboard focus isn't lost when the rail reaches an end. On a right-to-left page, the rail starts on the right."],
    declaration: `<Carousel aria-label="Covers">
  <CarouselRail fade>
    <Flex gap="4">
      <CarouselItem>…</CarouselItem>
      <CarouselItem>…</CarouselItem>
    </Flex>
  </CarouselRail>
  <CarouselPrevious>‹</CarouselPrevious>
  <CarouselNext>›</CarouselNext>
</Carousel>`,
    variants: [
      {"name":"with-icons","title":"With icons","why":"Arrow icons in `CarouselPrevious` and `CarouselNext`, with an `aria-label` on each. Set your own label when \"Previous\" and \"Next\" don't say enough, such as \"Previous templates\"."},
      {"name":"labelled-by-heading","title":"Named by the heading above it","why":"`aria-labelledby` points at the heading's `id`, so screen readers announce the same name that sighted people read. Each item here is a Card rendered as a link."},
      {"name":"buttons-at-the-ends","title":"Buttons at each end of the rail","why":"The buttons sit on each side of the rail in a Flex. Wrap the rail in a Box with `flexGrow=\"1\"` and `minWidth=\"0\"`, so it fills the space between the buttons and can still scroll."},
      {"name":"rtl","title":"Right to left","why":"With `dir=\"rtl\"` on an ancestor, the rail starts on the right and Previous still moves back toward the first item. Point each arrow in the reading direction, as this example does."},
    ],
    topics: [
      { title: "Naming the carousel", symbols: ["Carousel"] },
      { title: "The scrolling row", symbols: ["CarouselRail", "CarouselItem"] },
      { title: "The buttons", symbols: ["CarouselPrevious", "CarouselNext"] },
    ],
    refusals: [
      { name: "Autoplay", why: "Content that moves on a timer makes people lose their place, so the rail moves only when someone scrolls it or presses a button." },
      { name: "Looping", why: "A loop needs cloned items or a fake scroll position. With real ends, a disabled button tells people they have reached the last item." },
      { name: "Drag to scroll", why: "Touch and trackpads already drag the rail. With a mouse, dragging would get in the way of selecting text and dragging images." },
      { name: "A width, a gap or an aspect ratio for the items", why: "Every carousel lays out its items differently, so you set the item size yourself and use a Flex for the gap. The component only marks where scrolling comes to rest." },
      { name: "`orientation`", why: "A carousel always scrolls sideways. For a vertical list that scrolls, use a ScrollArea." },
      { name: "Dots under the rail", why: "Dots repeat what the rail already shows, each one needs its own accessible name, and people can't count them once there are more than a few." },
    ],
    parts: [
      { part: "CarouselRail", blurb: "The row that scrolls. It is a ScrollArea whose scrolling comes to rest on items. Give it a bounded width, and set `fade` when it runs to the edge of a pane" },
      { part: "CarouselItem", blurb: "Marks one item the rail can stop on. It sets no size of its own, so you control the item's width and the space between items" },
      { part: "CarouselPrevious", blurb: "A button that moves the rail back by one item. It is disabled at the start of the rail, but it stays focusable" },
      { part: "CarouselNext", blurb: "A button that moves the rail forward by one item. It is disabled at the end of the rail, but it stays focusable" },
    ],
  },
  {
    slug: "button-group",
    name: "ButtonGroup",
    job: "Act",
    level: "leaf",
    spec: "§11, §54",
    declaration: `<ButtonGroup aria-label="Range">
  <Button>Day</Button>
  <Button>Week</Button>
  <Button>Month</Button>
</ButtonGroup>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"`size` on the group sizes every button inside it, from 1 to 4. A button can still set its own `size`, but mixed sizes in one group rarely look intended."},
      {"name":"icon-only","title":"A group of icon buttons","why":"Icon-only buttons make a compact set of formatting actions. Give each button an `aria-label`, and give the group a label of its own as well."},
      {"name":"bordered","title":"Quiet buttons with a border","why":"Quiet buttons with `bordered` make a lighter group that suits secondary actions. Where two buttons meet, their borders share one line."},
      {"name":"pagination","title":"Previous and next pages","why":"The button that has nowhere to go is disabled. A disabled button keeps its place, so the group has the same shape on every page."},
    ],
        abstract: "ButtonGroup joins a set of related Buttons into one control.",
    overview: ["A ButtonGroup draws a few related Buttons as one control. The outer corners stay rounded, the inner corners become square, and a thin line separates each pair of buttons. Each button still works on its own.","Use a ButtonGroup for a small set of actions on the same thing, such as text styles or moving between pages. To let people pick one value from a set, use a SegmentedControl. For buttons that stay pressed, use a ToggleGroup, and for one main action with a menu of related ones, use a SplitButton.","Put Buttons directly inside the group. `size` on the group sets the size of every button that doesn't set its own, while `tone`, `emphasis` and `bordered` belong to each Button.","A ButtonGroup renders an element with `role=\"group\"`, so give it an `aria-label` that says what the buttons do together. Tab moves through the buttons one at a time. If you want the arrow keys to move between them instead, put the buttons in a Toolbar."],
    refusals: [
      { name: "A separator part", why: "The group draws the line between buttons itself, so you never need to place separators by hand." },
      { name: "`tone` and `emphasis` on the group", why: "Each Button sets its own `tone` and `emphasis`, because buttons in one group can mean different things. The group only joins them." },
    ],
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    job: "Know",
    level: "leaf",
    spec: "§11, §20, §32",
        abstract: "Tooltip shows the name of a control when the pointer rests on it or the control receives keyboard focus.",
    overview: ["A Tooltip shows a short label when the pointer rests on a control or the control receives keyboard focus. Use it to name an icon-only button and to show its keyboard shortcut.","A tooltip should only repeat what the control already says. Touch screens have no hover, so tooltips never open there, and screen readers don't announce them. Give the control an `aria-label` with the same name, so everyone gets the information whether or not they see the tooltip.","When the panel needs more than one line of text, a form or a link, use a `Popover`. For a hint that touch users also need, use a `FieldDescription` or a `Notice`. `TooltipContent` accepts only a string, so write a shortcut as text, for example `Undo ⌘Z`.","A tooltip uses inverted colours, dark on a light page and light on a dark page. It opens above the control by default. Use `side` and `align` on `TooltipContent` to change that, and the tooltip moves to the opposite side when there isn't enough room.","Put one `TooltipProvider` near the root of your app. It sets the delay for every tooltip inside it and groups them, so once one tooltip has opened, the next ones open straight away as the pointer moves along a row of buttons. Base UI's Tooltip provides the behaviour, and the part names follow shadcn/ui."],
    declaration: `<TooltipProvider>
  <Tooltip>
    <TooltipTrigger render={<Button aria-label="Undo" />} />
    <TooltipContent>Undo</TooltipContent>
  </Tooltip>
</TooltipProvider>`,
    variants: [
      {"name":"icon-buttons","title":"Icon buttons","why":"Each icon-only button has an `aria-label`, and its tooltip repeats the same name. Your `Button` goes to `TooltipTrigger` through `render`, and the `TooltipProvider` lets the tooltips open quickly one after another."},
      {"name":"shortcuts","title":"Keyboard shortcuts","why":"The shortcut follows the name in the tooltip text. The button also sets `aria-keyshortcuts`, because screen readers don't announce the tooltip."},
      {"name":"sides","title":"Sides","why":"`side` sets where the tooltip prefers to open: `top`, `right`, `bottom` or `left`. When that side has no room, the tooltip opens on the opposite side."},
      {"name":"in-a-toolbar","title":"In a toolbar","why":"A `ToolbarButton` passed to `TooltipTrigger` stays part of the toolbar's arrow-key navigation. One `TooltipProvider` around the whole toolbar lets the tooltips open quickly along the row."},
      {"name":"controlled","title":"Controlled","why":"`open` and `onOpenChange` let your own state control the tooltip, here from a Switch. Keep this for demonstrations and guided tours, and let the pointer and focus open tooltips everywhere else."},
    ],
    topics: [
      { title: "Naming a control", symbols: ["Tooltip", "TooltipTrigger", "TooltipContent"] },
      { title: "Setting the delay for the whole app", symbols: ["TooltipProvider"] },
    ],
    refusals: [
      {
        name: "Content that is not a string",
        why: "A tooltip inverts the colours of its panel, and other components placed inside it wouldn't invert with it. Write a shortcut into the text, or use a Popover for richer content.",
      },
      {
        name: "A size",
        why: "A tooltip has one small size everywhere, because it shows one short line of text whatever the size of the control it names.",
      },
      {
        name: "`tone` and `emphasis`",
        why: "A tooltip only repeats a control's name, so a colour or a level of prominence would have nothing to say.",
      },
      {
        name: "A delay you set per tooltip",
        why: "Tooltips that open at different speeds make an app feel inconsistent. Set the delay once, on the `TooltipProvider` near the root of your app.",
      },
      {
        name: "Support for touch screens",
        why: "Phones have no hover, so tooltips never open there. Put any hint that touch users need in a `FieldDescription` or a `Notice`.",
      },
      {
        name: "A material",
        why: "The inverted colours already give a tooltip the strongest contrast available, and glass would add a second edge around a small panel.",
      },
      {
        name: "An arrow",
        why: "The tooltip opens right next to its control, so its position already shows which control it names.",
      },
    ],
    parts: [
      { part: "TooltipProvider", blurb: "Optional. Place it once near the root of your app to set the delay for every tooltip inside it and to let a row of tooltips open quickly one after another" },
      { part: "TooltipTrigger", blurb: "The control that the tooltip names. Pass your own Button to it through `render`" },
      { part: "TooltipContent", blurb: "The text of the tooltip: one short line with the control's name, followed by its shortcut if it has one" },
    ],
  },
  {
    slug: "text",
    name: "Text",
    job: "Read",
    level: "leaf",
    spec: "§15",
    declaration: `<Text size="3" emphasis="medium">Supporting copy.</Text>`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"All nine steps of `size`. Steps 2 and 3 suit reading and labels, and the larger steps suit display text. Each step sets the font size, line height and letter spacing together."},
      {"name":"weights","title":"Weights","why":"The three weights: `regular`, `medium` and `semibold`. Use `medium` for a label or a short title in a row, and a larger size when something needs more importance, because there is no bold."},
      {"name":"emphasis","title":"Emphasis","why":"A title at `loud`, a supporting sentence at `medium` and a short, unimportant line at `quiet`. Don't use `quiet` for a sentence people need to read."},
      {"name":"tones","title":"Tones","why":"`tone` gives text a meaning, such as `success`, `warning` or `destructive`, and emphasis still works inside a tone, as the last line shows. Use a tone for what it means, not as decoration."},
      {"name":"paragraphs","title":"Paragraphs","why":"`render={<p />}` makes each block of text a real paragraph. Text has no margin, so the paragraphs sit in a Stack that sets the space between them with `gap`."},
      {"name":"inline-elements","title":"Inline elements","why":"`Code` for a value to type, `Kbd` for a key to press and `Link` for a link, each inside a sentence. They take the size of the text around them."},
    ],
        abstract: "Text sets body copy, labels and every other line that isn't a heading.",
    overview: ["Text shows body copy, labels and short lines of information. Use it for everything that isn't a heading, and use `Heading` for the title of a page, a section or a card. Inside a sentence, use `Code` for a value people type, `Kbd` for a key and `Link` for a link.","`size` runs from 1 to 9 and defaults to 3, the body size. Each step sets the font size, the line height and the letter spacing together, so the line height always suits the size. Use 3 for reading and 2 for labels and details, and keep size 1 off composed screens.","`weight` is `regular`, `medium` or `semibold`, and defaults to `regular`. There is no bold, so show importance with size and colour instead.","`emphasis` sets the colour of the text. `loud` is the default and has full contrast, `medium` is muted, and `quiet` is faint. Because quiet falls below the contrast needed for comfortable reading, keep it for short lines that matter little. `tone` adds a meaning, such as `success` or `destructive`, and the three emphasis levels then use that tone's colours.","Without a `tone`, Text takes its colour from the surface it sits on, so it stays readable in light mode, in dark mode and on a strong fill. It renders a `span` with no margin, and `render` turns it into another element, such as `render={<p />}` or a `label`. Density doesn't change text size, but a touch screen makes the reading sizes a little larger."],
    refusals: [
      { name: "A colour prop", why: "Use `tone` to say what the text means, and the theme picks a colour that works in light and dark mode. For a one-off colour, set it in `style`." },
      { name: "`margin`", why: "Text never adds space around itself, even when `render` makes it a paragraph. Set the space between blocks with `gap` on a Stack." },
      { name: "`bold` (700)", why: "Semibold is the heaviest weight. Show what matters most with a larger size or a stronger emphasis instead." },
    ],
  },
  {
    slug: "text-area",
    name: "TextArea",
    job: "Enter",
    level: "leaf",
    spec: "§4, §11",
    declaration: `<TextArea rows={3} aria-label="Notes" />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The four steps of `size`, which set the text size, the padding and the corner. The height comes from `rows`. Use size 2 unless the form around it uses another size."},
      {"name":"in-a-form","title":"In a form","why":"A TextArea in a `Field` with a `FieldLabel` and a `FieldDescription`, which connect to the text area for you. The `name` prop sends its value with the form."},
      {"name":"controlled","title":"Controlled","why":"`value` and `onChange` keep the text in your own state, so the description can count the characters left. `maxLength` stops typing at the limit."},
      {"name":"invalid","title":"Invalid","why":"`aria-invalid` turns the border and the focus ring to the error colour. The message goes in a `FieldError`, so screen readers announce it."},
      {"name":"disabled-and-read-only","title":"Disabled and read-only","why":"Use `disabled` when the text can't be changed and doesn't matter right now. Use `readOnly` when people need to read and copy the text but not change it, because a read-only value is still sent with the form."},
      {"name":"resize","title":"Resize","why":"People can drag the corner to make a TextArea taller. The second one sets `resize: \"none\"` in `style` to keep its height fixed, which suits only a layout that can't move."},
    ],
        abstract: "TextArea lets people type text that runs over several lines.",
    overview: ["A TextArea lets people type text that runs over several lines, such as a description, a note or a message. For a single line, such as a name or an email address, use a TextField.","`rows` sets the starting height in lines, and the width comes from the container. People can drag the corner to make the box taller but not wider. To turn resizing off, set `resize: \"none\"` in `style`.","The visible box is a wrapper around a native `textarea`. `className` and `style` apply to the wrapper, `ref` points to the `textarea`, and every other prop, such as `name`, `value` or `maxLength`, goes to the `textarea`.","Put a TextArea in a `Field` with a `FieldLabel` so it has a name, and use a `FieldError` for the error message. `aria-invalid` shows the error colour. `disabled` stops typing and dims the text, while `readOnly` keeps the text selectable, removes the fill and still sends the value with the form. Set `backdrop` when the TextArea sits over an image or other content, and it uses the theme's glass material.","The focus ring appears whenever the cursor is inside the TextArea, however it got there, because typing is the only thing people do in it."],
    refusals: [
      { name: "`emphasis` and `tone`", why: "Every field in a form should look equally important, so a TextArea has no way to stand out from the fields around it." },
      { name: "`resize`", why: "A TextArea resizes vertically by default. To change that, set `resize` in `style`, which applies to the visible box." },
      {
        name: "`cols`",
        why: "The container sets the width. A width counted in characters would change with every size and density.",
      },
      {
        name: "`render`",
        why: "A TextArea renders two elements, and replacing either one would break the box or the text input inside it.",
      },
    ],
  },
  {
    slug: "text-field",
    name: "TextField",
    job: "Enter",
    level: "leaf",
    spec: "§4, §9, §11",
    declaration: `<TextField placeholder="Search" aria-label="Search" />`,
    variants: [
      {"name":"sizes","title":"Sizes","why":"The four steps of `size`, each setting the height, the padding, the corner and the text size. Give a field the same `size` as the buttons in its row, so they line up."},
      {"name":"with-icons","title":"With icons","why":"An icon, a unit or a short hint in `leading` or `trailing`. Clicking one puts the cursor in the input, and a field without them has no extra space."},
      {"name":"password","title":"Password with a reveal button","why":"A real `Button` in `trailing` keeps its own focus and click, and it is sized to fit inside the field. The button switches `type` between `password` and `text` to hide or show the value."},
      {"name":"controlled","title":"Controlled","why":"`value` and `onChange` keep the text in your own state, as with a native input. Here the field filters a list as you type and shows a clear button only when it has text."},
      {"name":"in-a-form","title":"In a form","why":"Each field sits in a `Field` with a `FieldLabel`, plus a `FieldDescription` where people need more information. Native props such as `name`, `type` and `required` go to the input, so the form submits as usual."},
      {"name":"invalid","title":"Invalid","why":"`aria-invalid` shows the error border, and a `FieldError` inside the `Field` says what is wrong. Screen readers announce the error text when it appears."},
      {"name":"disabled","title":"Disabled","why":"`disabled`, on the `Field` or on the field itself, stops all input and dims the control. Use `readOnly` instead when the value must stay selectable and still be sent with the form."},
    ],
        abstract: "TextField lets people type a short value on a single line.",
    overview: ["A TextField is a single-line text input. Use it for a name, an email address, a search query or any other short value. Use a `TextArea` when the value can run over several lines, a `NumberField` for a number with stepper buttons, and a `Select` or `Combobox` when the value comes from a fixed list.","`leading` and `trailing` place an icon, a unit or a button inside the field, before or after the text. The visible box is a wrapper around a native `<input>`, so `className` and `style` apply to the wrapper and a `width` sizes the whole field. `ref` points to the input, so `.focus()` and `.select()` work as usual.","Put a TextField inside a `Field` to give it a label, a description and an error message. The `Field` connects them to the input for screen readers and sets one `size` for the whole group. `size` uses the same steps as `Button`, so a field and the button beside it are the same height.","Set `aria-invalid`, or place the field in an invalid `Field`, to show an error border. `disabled` stops input and dims the field, while `readOnly` keeps the value selectable and sent with the form.","The input is a real `<input>`, so the keyboard, autofill, form submission and screen readers all work as they do for any native field. On a touch screen the text is never smaller than 16 pixels, which stops the browser from zooming in when someone taps the field."],
    refusals: [
      { name: "`emphasis` and `tone`", why: "Every field in a form should look equally important, so a TextField has no way to stand out from the fields around it." },
      {
        name: "`render`",
        why: "A TextField renders two elements, the visible box and the input inside it, so `render` couldn't say which one to replace.",
      },
    ],
  },
  {
    slug: "theme",
    name: "Theme",
    job: "Arrange",
    level: "leaf",
    spec: "§5, §7, §12, §19",
    declaration: `<Theme appearance="inherit" density="default" radius="full" depth="elevated">
  …
</Theme>`,
    variants: [
      {"name":"appearance","title":"Light and dark","why":"The same panel in a light and a dark `Theme`. Use `inherit` at the root when a script sets the mode on `<html>` before the first paint, and use `light` or `dark` to fix one section against the rest of the page."},
      {"name":"density","title":"Density","why":"The same row at `compact`, `default` and `comfortable`. Density changes control heights, padding and gaps, while text and icons keep their size."},
      {"name":"radius","title":"Radius","why":"A field and a button at every `radius` level, from square `none` to fully rounded `full`. Radios, switches and slider thumbs stay round at every level."},
      {"name":"depth","title":"Depth","why":"The same card with `depth=\"flat\"` and with the default `elevated`. Flat removes the shadows under cards and raised buttons, and because no component has its own shadow prop, you set this once for the app."},
      {"name":"contrast","title":"High contrast","why":"The same controls at `contrast=\"normal\"` and `contrast=\"high\"`. High contrast strengthens borders, fills and text so they meet the contrast minimums. Compare the field border, the checkbox and the quiet caption."},
      {"name":"size","title":"Default size","why":"`size` on a `Theme` sets the size of every control that doesn't set its own. The last button in each row sets `size=\"2\"`, so it stays the same when the theme size changes. Text keeps its own scale."},
      {"name":"nested","title":"Nested themes","why":"A dark, compact panel with small corners inside the default theme. A nested `Theme` changes only the settings you give it, and the `Surface` inside gives the panel its own background colour."},
    ],
        abstract: "Theme sets light or dark mode, spacing, corners, shadows and material for everything inside it.",
    overview: ["A Theme holds the settings that every component inside it uses. There are eight: `appearance`, `density`, `radius`, `contrast`, `pointer`, `depth`, `material` and `size`. Put one Theme at the root of your app, and set only the values you want to change, because the defaults suit most apps.","The defaults are `appearance=\"light\"`, `density=\"default\"`, `radius=\"full\"`, `contrast=\"normal\"`, `pointer=\"auto\"`, `depth=\"elevated\"`, `material=\"solid\"` and `size=\"2\"`. `pointer=\"auto\"` follows the device, so a touch screen gets larger controls and slightly larger reading text.","Themes nest. A Theme inside another changes only the settings you give it and keeps the rest from the theme around it. Use a nested Theme for a dark panel on a light page, or for a compact table inside an app that uses the default density.","`size` sets the size of every control that doesn't set its own, so an app whose controls are all size 3 says so once. It doesn't affect type: `Text` and `Heading` have their own nine-step scale, and `Code`, `Kbd`, `Badge` and `Chip` take the size of the line they sit in.","`contrast=\"high\"` is an accessibility setting that strengthens borders, fills and text so they meet the contrast minimums. Put it on the same element as an `appearance` other than `inherit`. When `contrast` is unset, the theme follows the operating system's `prefers-contrast: more` setting.","A Theme renders a `<div>` to hold its settings, and `render` puts them on an element you already have instead. Never render the root Theme onto `<body>` or `<html>`, because menus, dialogs and other floating panels are added to the body."],
    refusals: [
      {
        name: "An `accentColor` prop",
        why: "The accent is one colour for the whole app, set in the colour config, and the full palette is generated from it. A prop that changed it at runtime would mean shipping every possible colour scale.",
      },
      {
        name: "A `scaling` prop",
        why: "Multiplying every size by one factor breaks the designed relationships between them. Use `density`, which switches to designed values for tighter or roomier layouts.",
      },
      {
        name: "A shadow or elevation prop on components",
        why: "Shadows are a choice for the whole app, so individual components have no shadow prop. Use `depth` on the Theme to turn them on or off.",
      },
      {
        name: "An outlined or filled style",
        why: "Cards and fields have one appearance, so screens built by different people match. Use `depth` to choose between raised and flat surfaces.",
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

/**
 * The jobs, in the order a reader meets them, each with the question it answers. The index
 * groups by this list, so a job with no members, or a member with no job here, fails the law.
 */
export const JOBS = [
  { job: "Act", question: "Make something happen." },
  { job: "Choose", question: "Pick from options you can see or list." },
  { job: "Enter", question: "Supply a value by typing it." },
  { job: "Go", question: "Move to another place in the app." },
  { job: "Browse", question: "Scan a collection and find one item." },
  { job: "Read", question: "Take in content." },
  { job: "Know", question: "Learn the state of something." },
  { job: "Focus", question: "Deal with one thing before going on." },
  { job: "Converse", question: "Talk back and forth." },
  { job: "Arrange", question: "Place things on the page. This is your job, not the person's." },
] as const;

export type Job = (typeof JOBS)[number]["job"];

/**
 * THE PAIRS PEOPLE CONFUSE, each written once and printed on both pages. Two components that
 * look alike and do different jobs are the system's most useful teaching, and an agent picking
 * between them needs the split in one sentence. `a` and `b` are export names; `useA` says when
 * the first is right, `useB` when the second is.
 */
export const PAIRS: { a: string; b: string; useA: string; useB: string }[] = [
  {
    a: "Switch",
    b: "Checkbox",
    useA: "the setting takes effect the moment it changes.",
    useB: "the choice waits for a submit, or is one item in a list of options.",
  },
  {
    a: "Switch",
    b: "Toggle",
    useA: "it is a setting that stays on or off.",
    useB: "it is a tool or a format that stays pressed, such as bold text or a filter.",
  },
  {
    a: "Tabs",
    b: "SegmentedControl",
    useA: "each option is a different view, with its own content.",
    useB: "the options filter or change one view that stays on screen.",
  },
  {
    a: "Tabs",
    b: "Accordion",
    useA: "people look at one section at a time.",
    useB: "people may want several sections open, stacked on one page.",
  },
  {
    a: "Menu",
    b: "Select",
    useA: "each item runs an action, and nothing stays chosen.",
    useB: "the person picks a value, and the value stays shown.",
  },
  {
    a: "Menu",
    b: "ContextMenu",
    useA: "the actions open from a visible button.",
    useB: "the actions open from a right-click or long press on an area. Every action in it must also be reachable another way, because nobody can see that it exists.",
  },
  {
    a: "Select",
    b: "Combobox",
    useA: "the list is short enough to scan.",
    useB: "the list is long enough that people need to type to narrow it.",
  },
  {
    a: "RadioGroup",
    b: "Select",
    useA: "there are only a few options and showing them all helps people compare.",
    useB: "there are many options, or there is no room to show them.",
  },
  {
    a: "Popover",
    b: "Dialog",
    useA: "the task is small and the page should stay usable around it.",
    useB: "the task needs the person's full attention and room away from the page.",
  },
  {
    a: "Dialog",
    b: "AlertDialog",
    useA: "the person is doing a task.",
    useB: "the person must answer before going on, such as confirming a loss that cannot be undone. If the action can be undone, do it and offer undo instead of asking.",
  },
  {
    a: "Tooltip",
    b: "Popover",
    useA: "the text only names a control, and nobody needs it to finish their task.",
    useB: "the panel holds content or controls people need.",
  },
  {
    a: "Badge",
    b: "Chip",
    useA: "the mark stays until the person looks, such as an unread count.",
    useB: "the label states the current state of the thing beside it, such as Draft.",
  },
  {
    a: "Card",
    b: "Surface",
    useA: "one object needs to stand apart, such as a project or a plan.",
    useB: "a quiet region holds several things without making any one of them an object.",
  },
  {
    a: "Link",
    b: "Button",
    useA: "pressing it takes people to another place.",
    useB: "pressing it does something where they are.",
  },
  {
    a: "Progress",
    b: "Spinner",
    useA: "you know how far along the work is.",
    useB: "you do not know how long it will take.",
  },
];

/** Every pair this component is in, from its side: the other name, and when to use the other. */
export function alternativesFor(name: string): { name: string; when: string }[] {
  return PAIRS.flatMap((pair) =>
    pair.a === name
      ? [{ name: pair.b, when: pair.useB }]
      : pair.b === name
        ? [{ name: pair.a, when: pair.useA }]
        : [],
  );
}

export const BY_SLUG = new Map(ENTRIES.map((e) => [e.slug, e]));
