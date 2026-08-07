# LOG

Living decision log. Newest first. Each entry: what, why, date, alternatives rejected.

This is the *why* behind the history, not a changelog: git is the changelog. `DECISIONS.md` says what the system is now; this says how it got there and what was turned down on the way, so a later reader cannot quietly re-litigate a settled question or re-try a dead end. (Naming differs from the site repo on purpose: there `DECISIONS.md` is the log, here it is the standing spec and the log is this file.)

Write an entry when a choice was genuinely open and got closed: a reversal, a measurement that moved a decision, a constraint the code cannot show, a rejected alternative worth staying rejected. Do not write one for tuning or for new code that is simply new.

---

## 2026-08-07 Dark's control edges rest softer than light's — the split's first taste edit, and the direction becomes a law

The morning's solve held one Lc target across both modes, and the peer comparison said that
is not how a border feels: at the same Lc 46, the ring measures 2.4:1 on white and 6.4:1 on
the dark page — the WCAG 2 meter's dark-bed inflation agreeing with the eye that a mid-grey
line GLOWS in a dark UI. Every peer ships dark borders fainter than light ones (Radix and
shadcn near 1.2–1.5:1 against our 4.3–6.4), and the original complaint that started the
control-edge work — "what I would expect when high contrast is on" — was a dark-mode
complaint. So `controlEdgeLc`'s normal targets split per mode, dark under light. The first
pair (mark 38, field 24 — one notch down) was judged in the preview and still read heavy;
Kushagra moved both to the tier below: **mark 46 light / 30 dark, field 31 light / 15
dark**, rendering dark `#95999c → #75787b` and `#777b7e → #525557` — each dark family now
resting one full APCA tier under its light self (fine detail → large, large →
discernibility). Light is untouched; `high` stays mode-invariant, because conformance does
not dim with the lights, and the anchor law now steps `high` above BOTH modes' resting
values.

This is exactly the edit the mode split exists to permit — a taste value moved by eye with
the report watching — so the entry is here for the one durable part: the DIRECTION is now a
law (dark < light per family), while the values stay free. A future "simplify: one target"
cleanup has to argue with the glow, not just flatten a table.

Even at the softened pair, dark sits above the peers (4.1:1 ring, 2.4:1 field on the WCAG
meter, where Radix and shadcn ship ~1.2–1.5:1) — the report keeps both meters in every run.

---

## 2026-08-07 The contrast rule splits by mode: taste rules standard, APCA rules high contrast — borders and fills only

The rule, verbatim from Kushagra: "APCA rule checks for high contrast mode, taste over APCA
rules in standard." Scope confirmed as **borders and fills**; text pairings, the focus ring
and the invalid edge stay floor-checked in standard mode — signals, not dress, and a signal
that only works under an opt-in setting is not a signal.

Two unresolved tensions from the previous day forced it, and it dissolves both:

- **The two rulers split on one hex.** The solved light control edge (`#a3a6aa`) clears its
  APCA target of 46 while measuring 2.44:1 in WCAG 2 terms — under the normative 3:1 that the
  step-pick it replaced cleared at 3.17. The divergence is largest exactly where we work
  (light greys on white); a value cannot be optimised to two disagreeing meters, and the day
  had already spent hours discovering that each fix by one meter reopened the other.
- **Filled's borders were picked steps beside outlined's solved ones** ("WHY THE FUCK ARENT
  THEY APCA") — an inconsistency with no principle to arbitrate it as long as "standard mode
  owes APCA" was the claim, because filled's whole point is to identify by fill, and holding
  its border to a border-contrast floor un-makes the look.

The resolution is not "solve more"; it is naming where each authority governs. Standard mode
is DRESS: the resting border and fill values — solved edges and picked dress steps alike —
are taste, judged in the preview, held to no floor, and the eye pass may move any of them.
`contrast="high"` is CONFORMANCE: its solved edge targets are the ones law-anchored to
`apcaFloors`, and the look-border stand-down already routes filled through those same edges,
so both looks conform under the setting built for exactly this. The anchor law moved
accordingly (the normal targets' floor assertions deleted; the high targets now pinned ≥ the
fine-detail floor and strictly above their own resting values, so the setting always does
something). The normal-mode emitted-hex law survives as a drift check — the generator must
render the stated number — explicitly relabeled as not-a-floor.

**The rule grew its second clause the same day (Kushagra: "we still decide them based on
contrast, we still run checks, but not to validate, but to catch how off we are — it's
always good to know").** Taste is still contrast-informed — the numbers are how the values
are reasoned about; what changed is only what a bad number DOES. So the suite gained a
report: every run prints where each resting border and fill sits against its advisory tier,
on both meters (APCA Lc and the WCAG 2 ratio, because they disagree exactly where this
palette works), asserting only that the measurement happened. A slide toward invisible shows
up in the test output the day it ships, instead of surfacing as a preview argument later.
The report writes to stdout directly — the runner drops intercepted console output for
passing tests, and a report that only prints on failure never prints.

Rejected: solving filled's dress edges to a faint APCA target (the previous evening's open
proposal — it would have made filled "consistent" by extending APCA's authority into exactly
the territory taste was about to reclaim); re-solving the standard edges to WCAG 2 ratios or
to max(APCA, 3:1) (same move, other meter); and pulling the focus ring or invalid edge into
the split (they carry state, not identity — WCAG 2.4.11/1.4.11 bind the default for those,
and their existing standard-mode laws are untouched).

---

## 2026-08-07 Filled's wells stay soft, and high contrast is the accommodation — argued to rest with measurements on both sides

The control-edge day ended on filled. The wells measure single-digit Lc against their beds
(the APCA implementation clamps under-10 to 0.00, which briefly overstated this as "zero" —
method note from the audit, relearned). Against APCA's advisory discernibility tier of 15
that is a real shortfall, and I proposed solving the fills up to it. Kushagra pushed back
three times, and each push held:

- *"In what world is this low contrast"* — with preview screenshots. Both true: a large soft
  well is plainly visible to typical vision on a bright screen, AND marginal for the low-vision
  users the tier protects. The tiers are calibrated for the margins, not the median eye.
- *"That 30 applies to hairline"* — the tier split held for borders (45 fine detail / 30 large)
  but the FILL owes at most the discernibility tier, because the fill does not carry meaning:
  the label, placeholder and caret identify the field. WCAG 1.4.11 does not bind it.
- *"Isn't this what high contrast is for?"* — rejected for the outlined border (the normative
  rule binds the default), accepted here (advisory tier, identity carried elsewhere) — WITH the
  requirement that the setting actually deliver. Measured: it does, already. The morning's
  look-border stand-down makes contrast="high" drop filled's soft dress edge and resolve the
  solved control/field edges at their HC tier — light field border #e0e1e2 → #a3a6aa, dark
  checkbox #46484a → #b0b3b5 — law-tested in the mounted HC suite before this entry was
  written. Nothing needed building; the mechanism composed.

The position, stated once: **outlined conforms at rest through its boundary (normative, solved
45/30); filled reads as filled at rest, is identified by its content, and conforms under
contrast="high", which restores strong boundaries.** The soft filled fill is a decision, not a
finding; the audits that keep rediscovering it should land here.

---

## 2026-08-07 The control edge: solved, shared, and the reading of the guidance that reshaped it

Started as taste — Kushagra: *"the mark control's border in outline mode is a little too dark.
It is what I would expect to be when high contrast is on."* Measured, he was right twice over.
The dark ring sat at `#bcbec0`, Lc 66.5 against a floor of 45, because the pick-the-first-
passing-rung rule met a ladder that folds back between steps 9 and 11: step 9 misses the floor
by 2.9, and the next rung over the fold overshoots it by 21. And the surrounding borders it was
judged against sit at 1.35:1 (light) and ~1.5:1 (dark) — under the 3:1 the floor encodes — so
the one conforming boundary in the library read as an outlier: shadcn's checkbox measures
1.24:1, which is the norm this was being compared to.

**The argument that settled scope was his:** matching the ring down to the field breaks the
checkbox (D2's whole point); accepting filled as soft while holding outlined to the floor is
incoherent ("if we accept filled as soft, outline has no reason to comply"); so *read the
guidance again*. APCA's non-text tiers answered it: **Lc 45 is for fine detail — hairlines;
Lc 30 is for large solid shapes; 15 is bare discernibility.** A hairline and a fill are
different classes with different floors. So outlined (identity = a 1px line) owes 45, filled
(identity = a solid well) owes 30 — filled keeps its idea AND a conformance path, and the
"one floor for everything" I had been arguing was simply wrong. Filled's fills are still short
of their 30 and stay open; today shipped the outlined half.

**Amended the same day, in the preview: the field family sits one tier DOWN.** The first cut
put fields on the mark's 45 — "one boundary, they match" — and Kushagra rejected it on sight:
*"Text Field + Area being much larger than checkbox, they appear very dark. I think we should
stick to 30 floor for field and areas."* The guidance supports it: 45 is the fine-detail tier,
and 30 is the tier for LARGE elements — at equal colour, the long border of a large box reads
far heavier than a small ring. So `--field-edge` is the same solve at `controlEdgeLc.field`
(31; high 46 — a field under contrast="high" wears what a mark wears at rest, one ladder
offset by size class). Light `#c0c2c5`, dark `#777b7e`. The consistency law became an ORDER
law: ring strongest, field one tier down, card under both, three distinct — a collapse in
either direction fails. `apcaFloors` gained `nonTextLarge: 30` and the config law pins each
family's target to its own floor.

**What shipped.** `--control-edge` supersedes `--mark-edge`: SOLVED, not picked — binary
search on the neutral recipe's lightness for the value that just clears `controlEdgeLc.normal`
(46, the floor plus rounding margin) against both the seal and the page. Light `#a3a6aa`
(46.3), dark `#95999c` (46.1) — the dark ring calms from a third-of-the-way-to-white to just
past the floor, which was the original complaint. Consumers: the mark family as before, and
now the FIELD family under outlined (`.kui-field, .kui-textarea` re-point `--tone-border`,
the mark family's own pattern, so the state remaps keep winning) — an outlined field's fill
is the seal it sits on, so its border is all that identifies it: D2's criterion applied
honestly, and the consistency he asked for. Field, area, checkbox and radio now resolve ONE
boundary, law-tested component-against-component with the card as the negative control.
Cards and separators keep the quiet hairline.

**Generated colours are not a new pattern** (his check before agreeing): every step in the
palette is already solved output, and `--accent-label` is already generated between rungs 11
and 12 for exactly this no-rung-where-needed reason. And the solve composes with the tone
axis: it searches lightness, which is what APCA measures, so run on the accent recipe it
yields an accent-tinted boundary at the same guarantee — that is how an accent variant would
land if ever wanted.

**The laws grew both directions.** The old floor law could not fail upward — any
sufficiently dark grey passed — which is exactly how the overshoot shipped. The new one holds
floor AND ceiling (target + 4 Lc of two-bed slack), reads the EMITTED hex so the solve is in
the loop, and a config law pins the target itself to `apcaFloors.nonText` + 2, because the
ceiling law reads the target and would follow a drifted one — mutation-tested at target 66,
caught. `contrast="high"` re-solves at 60: designed, where before dark moved by band accident
and light never moved (R9's half-truth made whole). Hosted-control note, stated not hidden: a
control in a field's slot inherits the field's `--tone-border` and wears the boundary too.

Rejected: matching the ring down to the quiet border (breaks D2 in dark, ~0 Lc); one floor
for hairlines and fills (contradicts the guidance's own tiers); accepting the overshoot as
"floor-bound" (it was rung-bound, not floor-bound).

---

## 2026-08-07 The slider leaves the look axis entirely — and the membership test grows its second half

Kushagra, from the regenerated preview: *"Slider has basically no reason to subscribe to look
axis, like button has no role. We'll see this repeat with progress."* Plus the observation that
finally made the shape visible: *"in light mode, the rail looks fine, but in dark, the filled
mode has a weird rail. Its basically invisible."*

He was right about the rail, and it was my doing: pinning the thumb to the seal a few hours
earlier forced dark's filled rail down to the page step to avoid becoming the thumb's own
colour, and a rail at `--neutral-1` inside a filled card at `--neutral-3` is very nearly
nothing. That was the third symptom in a row from one wrong premise, so the premise went.

**Three passes, all arguing about the parts, none about the thing.** The rail was excluded at
first on "an edgeless well has no border-versus-fill trade to make" — a statement about the
part, which stopped being true the moment `filled` stopped being a trade, so the rail was let
IN. It was then DRAWN as an outline — `outlined` applied to a path by analogy with surfaces —
and read as a bead resting on nothing. The thumb then left on its own merits, and the rail
followed it into the corner described above. Each fix was locally reasonable and the direction
was wrong every time.

**The rule that survives is about what a slider IS.** The axis dresses things whose resting
state is a *surface with a boundary* — a card, a field, a checkbox — because for those, "how
does this app draw a resting surface" is a question with an answer. A slider has no resting
surface. It is a rail, a fill and a grip: an instrument, every part shaped by what it does
rather than by the app's identity. Button belongs to no dressed family on exactly this
argument, which is the connection Kushagra drew, and Progress will land here too — a bar is a
rail with no grip.

**So the membership test grows a second half.** §19 said "membership IS role consumption": a
family is dressed because its sheet consumes the roles, and only for that reason. That is the
MECHANICAL half and it is still true — it is what makes membership checkable. What was missing
is the DESIGN half: a family should consume them only if its resting state is a surface. The
mechanical half alone is what let a slider into the axis twice, because "this part could read a
role" is always true of any part that paints.

The law asserts all five painted parts together — rail, rail edge, fill, thumb, thumb edge —
across both looks, with a checkbox in the same app as the negative control so it cannot pass in
a world where `look` has stopped working altogether. Together rather than one each, because a
component leaves an axis completely or it does not leave it, and a law checking only the rail
would have missed the thumb, which was dressed until the previous commit. Mutation-tested by
pointing the rail back at a look role: five laws fail.

Unchanged by any of this, and now the slider's only open defect: the thumb ignores `invalid`
and `disabled`.

---

## 2026-08-07 The thumb leaves the look axis — the mark family shares its box, not its dress

Kushagra, after the drawn-rail revert: *"I further think the handle / thumb also shouldn't
subscribe to look axis."* The mark family had answered the axis once for all three members,
which read as the promotion paying off — one rule instead of three, and a law pinning checkbox,
radio and thumb to the same computed pair in both looks. Right shape, wrong membership.

**The criterion is what the two things ARE.** A checkbox at rest is a small empty surface with
a boundary, and `look` is precisely a statement about how the app draws its resting surfaces —
so it takes the dress for the same reason a card and a field do. A handle is not a surface you
read; it is a grip you move, and its job is to stay the same recognisable object while
everything behind it changes. Button belongs to no dressed family on exactly that argument
(its border is rank, not dress), and the thumb lands in Button's category despite sharing the
checkbox's geometry down to the pixel. So the family shares its **box** — one ladder, one
corner, one target rule — and not its **dress**, and that divergence is now stated rather than
assumed.

The selector is not new: `:where(:not(.kui-control *))` already means "a mark that is itself the
control" in the target rule two blocks down, where the thumb is excluded from growing its own
hit area for a related reason. Reusing it makes "is this mark a control or a part of one" one
question with one spelling. Specificity stays equal to the family block (`:where()` contributes
nothing), so the file reads top-to-bottom as identity-then-dress.

**It immediately reintroduced the collision the track joined the axis to fix, through the other
door.** With the thumb pinned to the seal, and dark's seal being `--neutral-2`, the filled rail
at `--neutral-2` became the handle's own colour again — 1.000:1, the handle invisible on its
rail, caught by the law written for the first instance. Dark's filled rail moved to the page
step: a deeper well inside a filled card, with the handle a clear step above it. Worth noting
that the law caught this the same session it was written for a different cause, which is the
argument for laws that assert a RELATIONSHIP (this must not equal that) over laws that assert a
value — a value law would have needed rewriting here and would have gone quiet instead.

Not fixed, and unchanged by any of this: the handle still ignores `invalid` and `disabled`.

---

## 2026-08-07 The drawn rail is built, judged and reverted — and it takes the slider's contrast fix with it

`outlined` was made to mean *drawn* on the slider rail: an empty channel bounded by a hairline
instead of a solid grey bar, with the accent portion painted inside it. Built, regenerated into
the preview, rejected on sight. Kushagra: *"handle doesnt look good w outline."* A solid handle
sitting on a transparent rail reads as a bead resting on nothing, and the rail is the one part
of this control whose job is to show the handle where it sits.

**The shape of the mistake is what is worth keeping.** The design argument was sound and
general and still wrong here. "Outlined means drawn rather than filled" is a rule about
SURFACES — regions that have content inside them, where an outline still describes the region.
It was applied to a track by analogy. A rail is not a region; it is a path, and a path drawn as
an outline stops looking like a path. So: the look axis REACHING a part is not the same as the
axis's usual expression SUITING that part. The rail's honest answer to the axis is the
fill-versus-fill trade it already had — one grey, then a sunk grey — a smaller difference than
the other families get, and that is a property of what a rail is rather than a gap to close.

**What the revert costs, recorded as open rather than quietly lost: the slider is deaf to
`contrast="high"` in the outlined world again.** Measured, both appearances: rail fill, handle
fill and handle edge all byte-identical between normal and high. The rail's fill is a
mid-neutral that sits outside every high-contrast band, and with no edge there is nothing to
strengthen — so the accessibility escape does nothing at all on this control on the default
path. The drawn rail closed that as a side effect, which was the one genuinely good thing about
it, and the fix now needs its own answer. Untried candidates: a rail fill picked to land inside
a contrast band, or a hairline that appears only under `contrast="high"` (the material's
stand-down pattern, inverted).

Also still open and unrelated, restated because the original request bundled the two: the
handle ignores `invalid` and `disabled`. That is a cascade problem — the mark family declares
its ring colour ON the mark, which beats the state colour inherited from the control — and no
change to how the rail looks can fix it. Removing that declaration is not available either: it
is the same line that gives all three marks their resting ring, and deleting it turns a
checkbox's grey ring pale blue (measured), undoing audit D2.

Kept from the reverted work, because they were separate commits and stand on their own: the
rail squaring off at `radius="none"`, and §6's corrected "only two corners" count.

---

## 2026-08-07 The rail squares off — an exception has to be argued, not merely unreached

Audit R8, fixed rather than documented away (Kushagra: "we need to fix this").

§6's kill switch says `radius="none"` squares everything, with exactly two named exceptions:
the radio and the slider thumb, both circles because shape is role semantics — a square radio
reads as a checkbox, and a square handle reads as a bead that stuck. The claim "these two
corners are the ONLY two the radius axis never reaches" appears in §6 twice, in LOG and in
CLAUDE.md, and it was false. The slider RAIL was a third: its cap is `calc(track / 2)`, and
`--kui-ct-track` resolves to a designed raw px with no palette token anywhere in the chain, so
nothing about the radius level could ever reach it. Measured under `none`, both pointer worlds,
every size: rail 2 / 2.5 / 3 / 3.5px while the root, Button, Checkbox and TextField all read 0.

The case for keeping it was real and was rejected. Every platform ships a rounded rail even in
a square theme, and square end caps on a 4px well do look broken — so "argue the cap as role,
the way the two circles are argued, and correct the count in four places" was a legitimate
option and is what the audit itself proposed. What decided it against: those two exceptions
were each argued from a confusion the square would CAUSE (a square radio is a checkbox), and no
such confusion exists here — nobody mistakes a square-ended rail for another control. It was
never an exception anyone chose. It was a value the axis could not reach, and discovering that
after the fact is not the same as having decided it. A theme that promises square corners
should not keep one rounded thing on the page because of how a token happened to be spelled.

The fix needs no new token: `min(calc(var(--kui-ct-track) / 2), var(--kui-ct-radius))`. At every
level that has a corner the control radius dwarfs half a 4-7px rail, so all those cells render
byte-identically and the capsule is untouched; at `none` the control radius is 0 and the rail
squares with everything else. The cap stays a property of the rail's own thickness rather than
becoming a pick into the box palette, which is right — a well is not a box.

The law that replaces the missing one checks both halves, because only checking `none` would
let a future "simplification" reprice every level: square at `none`, and exactly half the rail
at every other level, per size. Its negative control is the thumb, which must still be round
under `none` — squaring the rail must not have squared the handle. Mutation-tested by restoring
the bare `calc()`: all four sizes fail.

---

## 2026-08-07 Forced colors is declined, not deferred — and declining it is the accessible answer

Audit finding R3, carried unfixed since the Radio/Slider round because its scope was a
decision rather than a repair. Kushagra: "our library is too premature to solve it."

The defect is real and was re-measured before the call, not taken on the audit's word.
Emulating `forced-colors: active`, a radio's selected and unselected states resolve to the
same visible thing: the accent fill is forced to Canvas white and the indicator dot stays
white, so the one mark distinguishing them disappears into the backplate. Screen readers are
unaffected — the hidden input still carries `checked` — which is what makes this precisely a
sighted-low-vision failure, on the users the setting exists for.

What decided it was not cost. Forced colors is **all-or-nothing per page**: the browser
substitutes the user's palette everywhere at once. So a radio taught to answer it, sitting in
a form beside a slider and a field that were not, produces a screen where some controls are
legible and others are not — and the user has no way to know which of the two they are looking
at. Half-support is worse than none, and this library has ten controls and a material to get
through before the answer would be uniform. Rejected accordingly: patching Radio alone (the
finding's literal fix), and patching the mark family alone (its natural boundary, which still
leaves fields and buttons out).

Recorded in §19's open list rather than left in REVIEW, because REVIEW is where findings go and
this is now a property of the system: a known, measured, accepted gap. The point of writing it
down is that three audit rounds have now found it, and the next one should recognise it instead
of raising it again.

Not to be confused with the contrast axis, which is supported and unrelated: `contrast="high"`
and `prefers-contrast: more` shift our own values within our own palette (§7). Forced colors
takes the palette away.

---

## 2026-08-06 `filled` stops being a trade, the track joins the axis, and every look law is rewritten to compare something

The look axis was audited the day it shipped (ultracode, 38 agents, adversarially verified — REVIEW.md carries the record). The machinery came back clean: ten roles in five scopes and nowhere else, the cascade resolving, `initial` behaving at every consumption site, the P3 rewrite reaching through, nested Themes escaping both ways, and `outlined` byte-identical to the bare render for all six dressed members in both appearances. **Every value `filled` shipped was wrong, and not one of the axis's laws could see it.**

**The premise was the bug.** `filled` was defined as a *trade* — `border: transparent` on all three families, on the theory that a fill replaces a hairline. Kushagra, from the preview's outlined/filled pair: *"filled surfaces can have slight border, but their main pull is filled bg, not border."* Reversing that one word fixed four separate findings at once, because every consumption site already had a correct fallback waiting: the mark family got back the boundary `--mark-edge` was minted for one day earlier (audit D2 — an unchecked box IS its hairline, and `filled` had dropped it to |Lc| 0.0); `contrast="high"` started working again on every dressed family, having had no edge left to strengthen; and the **read-only field stopped being invisible** — readOnly drops the seal by design, so the border was the only thing bounding it, and the dress deleted that too. That last one is the clearest argument against the trade: a state and a dress, each individually reasonable, multiplied to a control that paints nothing at all.

Rejected: keeping filled's border at the *same* weight as outlined's (`initial`, zero new tokens, and contrast="high" for free) — Kushagra chose a softer dedicated edge, so the fill stays the dominant signal and a filled card is visibly less edged than an outlined one. 
**That choice immediately produced the round's best defect, and I shipped it myself.** The stated cost of a bespoke edge was that a faint step *outside* the high-contrast band would look correct while silently killing the accessibility escape — so the edges were picked from inside `contrastHighBands.border`, and a law was written to pin the membership. Both the pick and the law were wrong in the same way: **the band indexes the ladder 0-based, and token names are 1-based.** `contrastHighBands.border = [5, 6, 7]` emits as `--neutral-6/7/8`, so the `--neutral-5` edges chosen for the surface and field families were never re-declared under high contrast at all — and the law passed because it compared 1-indexed names against 0-indexed positions and the two ranges happened to overlap. Measured against the artifact: tokens 6, 7 and 8 move under `contrast="high"`; token 5 does not. The claim was false for two of the three dressed families, written into two documents, and green.

This is precisely the defect class the audit that prompted all of this was about — a law agreeing with its author's arithmetic rather than with the artifact — reproduced within the hour, by the author who had just written the warning against it. It is the third recorded instance of the pattern, and the statement narrows each time: 2026-08-03 said *read a computed value*; the look audit said *read the right element and the right box*; this one says **read the OUTPUT, never the input you derived it from.** Config membership is an input. The emitted declaration is the artifact. The pixel a component computes is the truth.

The fix is not a better pick. `contrast="high"` now stands every look border down to `initial`, so the tone system resolves the edge at the element — which is exactly what the material already does with its glass edge under high contrast, making this a precedent reused rather than a mechanism invented. It also ends the competition between softness and reachability: the resting edge can now be as soft as taste wants. The replacement law is an **outcome** law, mounted — a real component's computed `border-top-color` must differ between `contrast="normal"` and `"high"`, per family and per appearance. Mutation-tested by deleting the stand-down: four cells go red, and the mark cells correctly stay green, because that family's edge already sat on a step the pass moves.

**An index is not a colour, and this is the third time that has cost us.** `filled` named raw `--neutral-2/3/4` in one mode-blind block. In dark, those *are* `--color-surface` and its two states — so the entire surface family resolved byte-identically to `outlined`, and the axis did nothing but delete the card's hairline across half the world. The `[data-look]` blocks cannot hold the fix: they are one block per look on purpose (co-location — a compound `[data-appearance][data-look]` would resolve for Theme and miss the un-themed path the stylesheet explicitly promises), so they may only carry mode-blind mappings. The pigment moved into `--dress-<family>-<slot>` roles declared per appearance scope, exactly the shape `--color-surface` already is. The first instance of this bug was `--color-text` baked at `:root` (§8); the second is recorded in `surfaceColor`'s own comment, where dark's card hover equalled its rest for the same reason; this is the third. A higher step is *darker* in light and *lighter* in dark, so recessed and raised are opposite arithmetic and the ladders are not each other's copy.

**The track joined the axis, reversing a decision recorded hours earlier.** It had been excluded on "the look trades a border for a fill, and the track never had a border — an edgeless well has no trade to make." True of the trade, and the trade is what stopped being the design. Kushagra, from the preview: *"slider doesn't respect outline at all rn."* The exclusion also hid a measured defect: the thumb reads `--look-mark-fill` and the track read `--color-track`, and **both resolved to `--neutral-4` in both appearances** — a filled slider's handle was its own rail at 1.000:1. Rejected: moving the *mark* family off `--neutral-4` instead, which would have dragged checkbox and radio off a value that suits them to fix a collision that is the slider's; and giving the thumb its own fill outside the mark family, which splits the identity the mark-family promotion was built on. The well moves and the handle stays. What replaced the old "track pinned unmoved" law is a pair: the track must *differ* between looks, and the thumb must never equal its rail in either look.

**The lesson, and it is 2026-08-03's rule with the hole finally named.** That rule said an axis is proven by a law reading a *computed value* through a mounted `<Theme>`. Every look law did exactly that — and every one of them still measured nothing, because *reading a computed value is not the same as comparing it to anything*. `card.browser.test.tsx` asserted a filled card equalled `var(--neutral-2)`, the name its author had just typed, so the law and the bug agreed with each other and both were wrong in dark. `text-area`'s law was titled "filled matches TextField exactly" and never once mentioned TextField. **Not one law compared the two ends of the axis, and not one compared a dressed part to the thing behind it.** Both comparisons now exist, per family and per appearance, and both were mutation-tested against the shipped-and-broken config before being trusted: put dark's surface back on the seal, put the borders back to transparent, put the thumb back on its rail, put an edge outside the contrast band — each kills its law. The rule grows: **a law that reads only one value has not made an assertion, it has taken a reading.**

---

## 2026-08-06 The look axis: rank and dress split, and the border keeps both jobs

Kushagra's taste question, held against the system until it factored: v1 and Radix felt more expressive because of variants (`soft`, `surface`), yet variants are exactly what this system refuses — and Button already shipped `bordered`, which looked like the same sin. The reconciliation is that variants fused two questions. **Rank** — which action is louder — is per call site and already ours (`emphasis`). **Dress** — how the app draws resting chrome — is an app identity with no home. The border pixel serves both, resolved per family the way emphasis is: Button's `bordered` is rank (the preview matrix shows it: quiet+border is the classic outline button, a real half-step — quiet < quiet+border < medium — derived instead of named) and SURVIVES as a prop; a one-look family's border ranks nothing and moves to Theme. First proposed as "fold `bordered` into the Theme look"; Kushagra refuted it with the matrix and the refutation stuck.

`look="outlined" | "filled"` (§19), the seventh Theme prop. Vocabulary: `outlined | soft` rejected — an edge-word and a feel-word are not one axis; `outlined | filled` is Material's own text-field pair, both naming how the boundary is drawn. `bordered` as a value rejected: that word now means rank. Membership is role consumption per family (surface, field, mark — Kushagra's hierarchy: lightest, one darker, darkest), with mounted flip laws for members, a per-rung negative law for Button, and the axis's home pinned (only tokens.css may put a colour in a look role).

Two mechanics earned their scars the same day. The first cut put `var(--tone-border)` in the outlined border roles and every outlined border silently went transparent — §6's own substitution-at-declaration, violated by its author, caught by the mounted identity laws before it ever ran in a browser: the value baked at the Theme scope where no tone exists. `initial` + consumption-site fallback (the material edge's pattern) is the correct spelling, and the emission law now asserts `initial` BY NAME as load-bearing. And the painted-variable law rejected the field sheets declaring `--kui-border-color` — the checkbox audit's law, holding one component later, forcing the field-family rule into the shared layer where it belonged.

Deferred on the tone-set rule: the accent-tinted well (a value on this axis, never a second prop), and any hover step for filled fields (a field's fill does not move; the border and ring carry its states — whether filled needs a substitute cue is an eye-pass question).

**Caught by eye, same day: the look roles were the only colour roles not repeated per appearance, and dark mode paid for it.** Kushagra, from the regenerated preview: cards, fields, text areas and radios all rendering WHITE in the dark sections. A look role holds a colour, and a `var()` inside a custom property substitutes where it is **declared** — so `--look-field-fill: var(--color-surface)` emitted only at `:root` baked the light seal, and every dark region that was not also a look scope inherited it. Every other colour role in the system already repeats in both appearance scopes for precisely this reason (`--color-text` baked at `:root` was the same lesson in §8); the new axis simply was not held to the rule. Both appearance scopes now carry the default look's roles, with the `[data-look]` blocks later so they win on the co-located element.

What made it invisible to 755 laws: every mounted look law went through `<Theme>`, which stamps `data-look` beside `data-appearance` on one element, so the roles were always re-declared where the mode was decided. The bug lived exclusively on the **un-themed** path — raw `data-appearance="dark"`, which the emitted stylesheet explicitly promises works standalone and which the preview uses throughout. The law added for it renders a Card inside a bare `data-appearance` div and asserts it equals the themed dark render and differs from the light one; it fails against the pre-fix generator. The general lesson is narrower than "test both appearances" — it is that a law which only ever exercises the *sanctioned* path cannot see a defect in the *supported* one, and this system supports both on purpose. The preview also gained the top-level `look` select it should have shipped with (stamped on the root and on every appearance scope, exactly as the contrast toggle already had to be), and the look demo's mark row moved to definite grid tracks after hitting the known Box shrink-wrap collapse — labels piled on top of each other, the defect the checkbox section already documents.

**Postscript, same day: the axis and the mark-family promotion landed in parallel and had to be reconciled.** The look wiring was written against `.kui-checkbox`; Radio and Slider promoted the family's rules into `.kui-mark` in the shared layer hours later. Rebasing the wiring onto the family — one rule instead of three — is what the promotion was for: Radio ships a single declaration (its circle), Slider says nothing about dress at all, and both answer the app's identity, pinned by a law that asserts all three members resolve the SAME computed pair in both looks. The merge also corrupted `outlined`'s field and mark entries with `filled`'s values, and the thing that caught it was the "outlined ≡ the bare render" law — the end-to-end form, doing exactly the job the config-reading version of the same law could not have done. The slider TRACK stays outside the axis and now has a law saying so: the look trades a border for a fill, and a part with no boundary has no trade to make.
## 2026-08-06 The audit's rule grows: a mechanism with two implementations owes a law that they agree

The apps/docs slice was audited the way the system layer was on 2026-08-03 — independent lenses, every finding handed to a verifier told to refute it, nothing surviving that was not personally reproduced. Twenty-seven confirmed, five refuted, eight distinct defects. The full round is in REVIEW.md; what belongs here is the part that changes how the next thing gets built.

**2026-08-03's rule was "an axis is proven by a law that reads a computed value."** It was written because every broken axis in that sweep had a law one indirection short of the thing that could be wrong. This sweep's defects were not one indirection short. They sat where **no law existed at all**, and in two different shapes.

The first shape: `apps/docs` was not in the test graph. It had no test harness, so the appearance mechanism — the thing the entire dark-SSR debt was paid with, and the headline of the slice — carried zero assertions, and two crash-the-site defects shipped through a green `pnpm run ci`. The second shape: the underline invariant had quietly become **two sites with one law**, so deleting `surfaces.css`'s half left all 509 tests passing while a card-as-link underlined its contents. That is the focus-ring and box-shadow lesson arriving a third time, which is what makes it a pattern rather than an incident: a single-site fact becomes a multi-site one silently, and only a law that reads the value *at every site* notices.

So the rule grows two clauses. **A mechanism with two implementations owes a law that they agree** — here a pre-paint script string and a React store, both reading the same keys, both stamping the same attributes, kept in step by nothing but discipline; the law now compares them attribute-for-attribute across all eighteen cells. And **the first thing a new app in this repo owes is somewhere for its laws to live**, before it owes anything else, because an app outside the test graph is a place where the standing rule cannot reach.

**Writing that law immediately caught the fix being incomplete**, which is the cleanest possible argument for the clause. Guarding the storage reads stopped the crash, and the toggle was still dead for the same visitors: `apply()` re-derives from storage, so a write that could not persist was invisible to the very next read. Memory is now the session's truth and storage is persistence. Nothing about that is visible from reading the diff; it took a law that ran the two halves against a throwing environment.

**The other thing worth carrying forward is where the worst defect lived.** `pnpm dev` was broken on every route because an element created in a Server Component crosses the RSC boundary as a lazy node, and `composeRender` dereferenced it blind. It is DEV-ONLY — production Flight sends a real element — so `next build` was clean, `next start` was clean, the screenshots were clean, and the command a human would actually type was the one nobody typed. **Verify the developer's path, not only the artifact's.** The fix is upstream's, through the public `React.Children.toArray`; Base UI has carried the identical workaround all along, which is the second time render.ts has had to record "where upstream handles a case and we do not, that is our defect."

Refuted and staying refuted: the "every visible pixel is @kookie-ui/react" stance over the hand-drawn icons — §8 already says the icon set is "installed by the app (and the docs), never by the library", naming this exact case — and the containment diagnosis written into DECISIONS the day before, which survived independent re-measurement.

Five confirmed findings were deliberately NOT fixed, and are in DECISIONS' open list rather than here: each is a system decision (should a Button rendered as a link announce as a link; should a field be shrinkable by default; the card-as-link box; the surface margin; how selection state is spelled before a Segmented Control exists). Fixing a system decision inside an audit cleanup is how a decision gets made by whoever happened to be holding the broom.

## 2026-08-06 Fields leave the elevated world: a well casts no shadow

For two days `surfaces="elevated"` lifted TextField and TextArea with the cards, on the sentence "a text field is a bordered box sitting on the page — it lifts with the cards, or the identity is only half applied" (2026-08-04). Kushagra kept pulling the thread — first the membership question (why fields and not button or checkbox), then the vocabulary (the prop says *surfaces* and a field is a control) — and the sentence turned out to be asserted, not judged. Elevation separates a plane from what is behind it. A field is a **well**: something you look and type into, content of a plane, not a plane above one — and a recessed thing casting a drop shadow is physically incoherent. The platforms already agree: Material's fields are filled or outlined, never raised; no OS shades an input. The floating search bar one might cite is a promoted toolbar *containing* an input — a shell, not a form field.

The membership criterion is now one sentence in §5: elevation dresses boxes that establish a plane of their own. Button's box is the action, a mark's is the state, a field's is a well — all three stay flat, each pinned by a mounted negative law under `surfaces="elevated"` (Material's raised buttons are the cautionary counterexample: shadow-as-loudness, fused into the rank ladder). The box-shadow walk re-pins the consumer count at exactly one — the surface layer — so a second consumer is a decision that fails a law first, not a drift.

Rejected: keeping fields in and renaming the prop around them — the set was wrong, not just the word. Recorded beside it: an elevated world *deepening* the well (an inset shadow) is a coherent future taste question; a lift never was.

## 2026-08-06 One Size union across three ladders, on purpose

The architecture review flagged that the exported `Size` serves three unrelated scales — Button and the fields read it as the control height index, Card as the surface padding + corner index (default "3" against everyone else's "2"), Checkbox as the mark index. They share a numeral, not a scale. Kushagra's call: keep the one union. §4 already defines a size as "an index, not a measurement" — the index never promised that two components at size 2 share a box, only that each family resolves its own designed ladder at that step. Splitting the type would encode in the API a sameness the system never claimed, and cost a breaking rename across every component for a distinction the resolved tokens already carry.

Rejected: `ControlSize` / `SurfaceSize` / `MarkSize` as distinct public unions — more honest-looking at the call site, but the honesty is false precision (all three are the same closed "1"–"4" set), and the day a family needs a different index count the union splits then, with the evidence in hand. Recorded in `system/axes.ts` beside the type; here so it stays closed.

## 2026-08-06 The alpha ramp composites over the seal, and its law stops grading its own homework

The recomposition law took its backdrop from the emitter's own `pageBackdrop` — the same value the alpha solve consumed — so the law was a tautology: it could verify the arithmetic but never notice the backdrop being the wrong colour. And it quietly was. The page colour existed as three near-identical statements (`surfaceColor.light.rest` `#ffffff`, `pageBackdrop`'s own white / hand-built dark approximation, and the generated `--neutral-1`), and the two modes told different stories: light solved against white — which happens to be the seal — while dark solved against a page approximation, which is why dark's neutral overlay hexes came out faintly pink (`#fff0f1` for a grey ramp).

Kushagra's call: the ramp officially sits on the **surface seal**, not the page — an alpha fill's usual home is a card or a field, both sealed. `alphaBackdrop` now reads config's `surfaceColor` (a literal directly; dark's `var(--neutral-2)` resolved through the same generator that emits it, via a steps-only build that breaks the solve's cycle), and the law derives the seal independently from config, so an emitter/seal divergence now fails CI. Dark's ramp re-solved: 98 declarations moved by a hair, the pink cast gone; light was already seal-based and did not move. Budget 18,137 → 18,129.

Rejected: compositing against the page (`--neutral-1`) — it matches the word "page" but not where alpha fills live, and dark's seal (`--neutral-2`) is the surface story §10 already tells; leaving the tolerance recorded — the deltas were invisible, but a law that cannot fail is the audit's oldest finding.

## 2026-08-06 Slider: the control is the target, and the track needs two things the system did not have

Repetition's fourth entry, landing with Radio (below). Three questions were genuinely open, and two of them minted something.

**The target needed no mechanism at all, and that was the design.** A slider's thumb is a mark, and the checkbox's answer — an invisible expander to the box a control of its size would occupy — was sitting right there. Wrong tool: the slider root already IS a control of its size. It takes the size join and `min-height: var(--kui-ct-h)`, the whole strip is pressable (Base UI's control part hit-tests track presses to the nearest thumb), so the height ladder's guarantees — the 24 floor, the 44 coarse default — arrive with zero new machinery. The thumb's own expander is *scoped out*, and that scoping generalised the slot-only exclusion into the real rule: **a mark inside another control never grows its own target** (`:not(.kui-control *)`), because overlapping thumb expanders on a range slider would resolve track presses in tree order, overruling Base UI's nearest-thumb logic — the D4 inversion wearing a new coat.

**The track's colour needed a role: `--color-track`.** §11 says "track low", and low means neutral — the checkbox's "neutral off" one control over — but the element stamps `accent` for its fill, and a component stylesheet cannot say neutral without naming a family (the role-not-family law). Same structural forcing that minted `--mark-edge`, so the answer sits beside it in color-config: step 4 both modes, v0. Deliberately NOT held to the mark edge's non-text floor — a well is a region the APCA-passing fill moves through, not a hairline identity, and iOS/Radix both ship it subtle. The switch's off-track and progress/meter inherit the role.

**The track's thickness needed a ladder, and the space palette refused it the same way it refused the mark.** A plausible track ladder is 4/5/6/7; between 4 and 8 the palette has nothing, so a pick either repeats a step or doubles between sizes 2 and 3 — the third family to hit this wall, and the answer is the established one (height, px, pxPill): `sliderTrack`, raw designed px, ~0.25 of the fine mark across the index. Density- and pointer-invariant: the coarse world's extra allowance is the control's height, not a fatter line (iOS holds 4pt against a 28pt thumb). Law: the track never reaches half its thumb, in both pointer worlds.

Fixed identities, refused as API: `thumbAlignment="edge"` (the handle stays inside the rail's ends — every platform's shape; exposing it would make the rail's endpoints a per-call-site opinion) and horizontal only (`orientation` refused: the root rides the height ladder and the track ladder holds a fraction of the fine mark, and none of those numbers were placed for a vertical box — vertical ships as its own designed set the day something forces it, the tone-set rule). The thumb rests as every mark rests — seal and mark edge, no hover step: a handle does not fill, it moves. Range sliders are the same component: array value, one thumb per entry, `index` stamped for SSR.

One law corrected itself before it earned trust (the checkbox scan's lesson recurring): the first keyboard law dispatched a synthetic KeyboardEvent, which cannot drive a native range input, and the first focus law ran before Base UI's edge-alignment measurement — the input sits `visibility: hidden` until first layout, refuses focus, and the law would have skipped itself. Both now wait for the settled frame and assert the focus landed before asserting anything else.

Rejected: a thumb-level expander (above); track thickness as a mark fraction ("I don't like fraction" — the objection is standing policy); track colour as `--tone-soft` (under the stamped accent that is a *tinted* track, and §11 says low, not soft-accent); `--color-surface-active` as the well (role abuse — a name meaning "surface pressed" painting a resting region); vertical as a pass-through prop (undesigned geometry shipping today beats no geometry only in libraries without laws).

## 2026-08-06 Radio lands, the mark family promotes on its third member, and the circle breaches the kill switch on purpose

Repetition's third entry. Radio is the checkbox's shape sibling and brought almost nothing of its own — which is the finding: with the slider thumb landing in the same change, the mark family reached three members, and TextArea's promotion rule fired exactly as written. The box, the invisible target, the hosted floor, the seal-and-edge resting identity, the disabled fill arm, the accent ON state and the glyph-is-the-box rule moved from checkbox.css into `system/recipes.css` as `.kui-mark` rules; checkbox.css keeps the tri-state's glyph picks, radio.css keeps one declaration. The ON state is written once for the binary controls (`:where([data-checked], [data-indeterminate])`, still losing to the state remaps — the precedence question travels with the rule), so Switch inherits the whole apparatus the day its stylesheet exists. A structural law pins the promotion: no component stylesheet may size a mark's box or re-point the mark edge. Laws that mounted the family's geometry through Checkbox needed not one edit, which is the promotion demonstrating it changed nothing.

**The circle is the entry's one real decision.** §6's kill switch says `none` squares everything, and a radio under `radius="none"` would be a square — indistinguishable from the checkbox beside it in any form that has both. The checkbox already decided this question from the other side: its corner caps below the capsule at `full` because "a circular checkbox reads as a radio — shape is role semantics, and role legibility outranks theme uniformity." Mirrored, the same sentence forbids the square radio. So a radio (and a slider thumb, for the platform's reason — a round handle on a rail is what a handle is) is a circle at every radius level, stated as `calc(mark / 2)` — the capsule as the rule, §6's own correction — and the breach is narrow and named: the kill switch owns every corner that is dress; these two corners are role, and they are the only two. Law-tested at every level in both pointer worlds, `none` included. (The count was wrong until 2026-08-07: the RAIL escaped too, by arithmetic rather than argument — see that day's entry.)

The group: Base UI's `RadioGroup`, wrapped with zero CSS and no class — selection, `name`, roving focus are the platform's; layout is the caller's Stack (`gap="5"` holds the 12px stacking rule at every density), with `render` left open so the group can BE the Stack. `readOnly` refused on both Radio and the group, inheriting the checkbox's LOG-recorded refusal.

Rejected: keeping the ON state per-component (identical bodies in two files, with Switch queued to make it three); a `Radio` that owns its own label prop (the label is a sibling — the non-negotiable, third control in a row); squaring the radio under `none` for the kill switch's purity (role legibility outranks theme uniformity, already decided once); `--radius-full` as the circle's spelling (dies under `none`, and 9999px asks the rendered box — the §6 correction's whole point).

## 2026-08-06 The budget gate pins its compressor: pako in the lockfile, not the runner's zlib

CI went red on a +20-byte "regression" no commit caused. `dist/styles.css` was byte-identical on both sides (167,744 raw) — the build is deterministic — but the gate's number came from `node:zlib`, and Node vendors zlib: Node 22.23 (CI) and Node 25.2 (the machine that recorded the 18,137 baseline) emit different, equally valid gzip streams for the same input at the same level, 20 bytes apart. The last green run agreed with its baseline exactly, because back then both sides compressed alike; the divergence began the day the recording machine's Node moved. The law was measuring the environment, not the stylesheet — the standing audit lesson one layer down: a gate's number must be a function of the artifact alone, and a compressor outside the lockfile is an input nobody pinned.

`measure-css.mjs` now compresses with pako, pure JS and exactly pinned, so the number is identical on every platform and Node version. Pako's level 9 lands on 18,137 for the current bundle — the recorded baseline — so the number did not even move; only its provenance did.

Rejected: re-recording the baseline to CI's number (leaves a ±20 band where a real local regression hides, and moves again whenever either side's Node does); pinning Node to an exact patch in CI and on every machine (fixes today's pair, not the class — the compressor stays outside the lockfile); ratcheting raw bytes instead (deterministic and dependency-free, but §2 states the budget as wire cost, and gzipped is the unit the ceiling means).

## 2026-08-06 The spinner gains a wrapper: composited rotation outranks one element

An external audit (Vercel's react-best-practices rules, run over the whole repo) matched the Spinner against its animate-the-wrapper rule: the `kui-spin` transform sat on the `<svg>` root, and an SVG element's CSS transform is not reliably composited — some engines run it on the main thread. For this control that is not a micro-optimisation: a busy indicator exists to keep moving while the main thread is busy, so a main-thread rotation freezes at exactly the moment it is for. The component's own comment claimed "a single composited rotation"; the claim was precisely the assumption the rule disputes, and nothing enforced it.

The animation, the icon box, `fill: currentColor` (inherited into the svg) and the ref move to a `<span>` wrapper; the svg fills the box at 100%. One element becomes two, and the criterion that allows it is the anatomy criterion already governing wrappers elsewhere: the second element is forced by something non-visual (animation reliability under load), not by layout convenience. Done now because nothing is published — the ref retypes from `SVGSVGElement` to `HTMLSpanElement` at zero cost, which stops being true the day there is a consumer.

The same audit's remaining runtime findings landed as separate commits: Theme's `resolved` memo depended on the parent context's *identity* rather than the six fields it reads, so a nested Theme re-rendered its whole subtree on ancestor changes it overrides; `useWindowClass` built fresh `MediaQueryList`s on every snapshot read and every subscribe (now one shared trio per document, lazy so SSR never allocates it); the spinner's spoke elements and the resolver's digit regex hoisted to module level. Everything else came back clean or not applicable — the no-JS-at-interaction-time law means most of the rule set has nothing to bite on, and the barrel/tree-shaking posture passed by mechanism (unbundled output, `sideEffects`, deep Base UI imports).

Rejected: keeping the one-element spinner with `will-change` or a translate hint (a hint requests a layer; it does not change which thread animates an SVG root's transform in the engines that main-thread it); animating an inner `<g>` instead (same element class, same question, plus a second SVG node).

## 2026-08-06 The mark edge: a control that IS its hairline gets its own resting colour

The audit's D2: an unchecked checkbox failed WCAG 1.4.11 outright — its entire visual identity is the 1px `--color-border` hairline, and that role (neutral 7) measures |Lc| 22.8 light / 10.3 dark against the surface, against the non-text floor of 45 the system itself declares and enforces for the focus ring and the invalid edge. The floor existed; nothing pointed it at the border a mark rests on. The checked state passed, so the failure was precisely the state every form starts in, and `contrast="high"` only reached 2.87:1 in light.

Kushagra's call, and the scope IS the decision: **a new role for the mark family only — checkbox, switch, slider (and radio with them) — nothing else changes.** The alternative was re-stepping `--color-border` itself, which would have darkened TextField, TextArea and the card seal in the same stroke; refused because their identity does not rest on the hairline (a field has a seal and a value) and the quiet edge is a deliberate part of how surfaces read.

`--mark-edge` resolves per mode to the FIRST neutral step clearing the floor against both the surface and the page, measured through the shipped generator: light 9 (Lc 58.8), dark 11 (66.5 — dark's step 9 misses at 42.1, and its step 10 is darker still; the dark ladder folds back past the solid). Per-mode steps are the `--focus-ring` precedent. Material's unchecked outlines sit in the same territory in both modes, so this lands beside the platform rather than away from it. The picks live in color-config.ts; the law lives beside the invalid edge's and was watched failing at step 7 in both modes before the picks were accepted.

Rejected: re-stepping `--color-border` for everyone (above); a raw designed hex (goes deaf to `contrast="high"`, which reaches the mark automatically because the role resolves through the re-declared neutral scale); leaving it to the eye pass (a WCAG failure is not taste).

## 2026-08-06 Marks in a stack need twelve pixels — the overlap is governed, not removed

The audit's D1, its largest finding: below the target's reach, the LATER of two stacked marks owned pixels inside the EARLIER one's painted box (both invisible targets hit-test in tree order), so a real click on one checkbox toggled the next — measured, 6px of a 24px mark stolen at a 4px gap under coarse — while the shipped sentence said "a stacked list is clear at any layout-space gap the system offers" in three places. The scale starts at 2px; the sentence was false at its bottom rungs.

Four options were put up and Kushagra picked the rule: **keep the expanding target as it is, state the spacing it obliges — 12 real pixels between stacked marks — and check it automatically.** Twelve is one more than the worst reach in any cell (11 with the border term), a real rung (space 4; the default density's `gap="4"` sits exactly on it, `gap="5"` is the smallest index that holds it at every density since compact resolves 4 to 8px), and the law mounts the rule rather than deriving it: two marks at exactly 12px in all 24 (pointer × density × size) cells, every point strictly inside the first's paint must belong to the first — plus a negative control at 4px that must KEEP stealing, so the twelve cannot rot into decoration.

The law itself earned a correction before it earned trust: the first cut ran after enough mounts had pushed the pair off-viewport, `elementFromPoint` answered null for every row, and all 24 cells passed while measuring nothing. A row nobody claims is now an error, not a zero.

Rejected: clamping the reach to half the tightest gap the scale offers (~1px — kills the mechanism to save the worst layout); expanding on the inline axis only (nothing sits beside a mark but its label, but the vertical reach is where the value is, and a rule beats an asymmetry); dropping the expansion entirely (returns every fine cell to a sub-24 target, the thing the expansion exists to fix); leaving the sentence and hoping (it was already false).

## 2026-08-06 A hosted mark stays a mark — behaving beats a rule nobody can enforce

The audit's D4: a checkbox in a field's trailing slot rendered 20 wide and 24 tall. The hosted-control rule pins `height` to the slot's derived box — right for a Button, which is a container for a label, wrong for the one control whose box IS its mark — and physical `height` beats logical `block-size` in the cascade while `inline-size` sails through unopposed. The corner then held two different fractions of two different axes, the exact class of thing the `--radius-mark-N` fix was written to end. Worse, on a fine pointer the mark kept its own expanding target inside the container: 36px of reach inside a 32px field, the inversion §4's hosted rule exists to prevent.

Two options: make it behave, or declare the combination unsupported. The deciding fact, surfaced when Kushagra asked what a block would take: **a true block is impossible** — the slots accept any node, so "unsupported" could only ever be a written rule, and anyone ignoring it would get the broken rectangle. He chose behaving ("A"). Both axes now come from one expression — the mark, floored by the hosted box for the cells where the slot is genuinely tighter — and the mark's own expander is scoped out of slots entirely (`:where` keeps the exclusion at class specificity), so the container-matched coarse target from the shared layer is the only target a hosted mark has. A law pins that the exclusion does not leak to marks that merely sit inside a label or a form. Radio and Switch inherit the geometry.

Rejected: the written-rule "block" (unenforceable, and a documented broken cell sits badly with a system whose demos are law-checked); filling the hosted box instead of keeping the mark (24×24 in a size-2 field — a hosted checkbox LARGER than a standalone one, growing on entry); suppressing the coarse container-matched target along with the mark's own (it is the sanctioned §4 behaviour for anything hosted).

## 2026-08-06 readOnly is refused on Checkbox — the standard pattern is that there is none

The audit (D5) found `readOnly` accepted and resolving to nothing: a checkbox that looked live, stepped its fill under the pointer, kept the pointing cursor, and silently refused the click — three affordances promising a toggle Base UI then denied. The open question was what it should look like; four candidates were mocked in the preview and judged.

Kushagra asked the question that dissolved it: what does everyone else do — why are we reinventing the wheel? Checked rather than answered from memory, and the finding is that **the wheel does not exist.** The HTML `readonly` attribute is defined for text fields and deliberately not for checkboxes; the WHATWG's stated position is that a read-only checkbox has no useful distinction from a disabled one. Material has an open feature request from 2019 it never shipped. Ant the same. Adrian Roselli's article on the subject is titled "Avoid Read-only Controls". The libraries that do accept the prop — Chakra, Base UI — draw it identically to a live control, which is not a pattern but the same bug this audit had just flagged.

So the prop is refused by the type, beside `render`, `children` and `nativeButton`, and the mock section came off the preview. The one real capability lost is submission: a read-only value goes with the form where a disabled one does not. Accepted — it is rare, and an app that needs it sends the value itself. Radio and Switch inherit the refusal.

Rejected: the four mocked appearances (no-fill, faded, Kushagra's grey tick, and the shipped nothing) — not on their merits, but because designing an appearance concedes the state should exist, and the platform's own position is that it should not; keeping the prop functional-but-unstyled (the Chakra/Base UI shape — the exact defect being fixed); mapping it to the disabled look (the two differ in form submission, and identical dress on different behaviour is a lie in the other direction).

## 2026-08-05 A mark's corner held a fraction of the wrong box — the radius bug, third instance

Checkbox shipped its corner riding `--radius-control-N` with a ceiling at `full` to stop it becoming a radio. Kushagra caught the rest of it by eye within the hour: "size 4 looks much more rounded than size 1."

Measured, and it was worse than it looked. The control radii are designed to hold ~0.2 of the HEIGHT ladder; a mark is not on that ladder, so the corner was holding a fraction of a box the control does not have — **0.250 → 0.385** across the index at default density, and **0.462** at comfortable size 4, which is a circle in all but name.

**The second half is the part worth recording, because no ceiling could have caught it.** `--radius-control-N` is DENSITY-indexed. Density does not touch a mark's box — that was a deliberate call when the family landed, since a mark sits beside a label and the label does not move either — yet it was re-cutting the mark's corner, and the guard I had written only looked at the `radius` LEVELS. A theme could not reach the failure; an axis could. This is the third instance of one lesson (the control corner in 2026-08-04, control padding on 2026-08-05, now this): **a fraction is only meaningful against the box it is a fraction of, and inheriting a ladder is not the same as being on it.**

`--radius-mark-N` is the family's own picks into the palette — steps, not raw px, so the levels still reach it (`none` must square a mark like it squares everything else), density-invariant like the mark itself, and at `full` it holds at `large`'s values, which is the sentence the surface band already uses one band over. The fraction lands in 0.17-0.25 at the default level (the per-level bands and the corrected claim: 2026-08-06, audit D13).

Rejected: a raw designed ladder per size (4/5/6/7 would hold 0.25 exactly — the palette cannot, since it has no 5 and no 6.5 — but a raw number goes deaf to the radius levels, and `none` squaring every corner is not negotiable); keeping the ceiling as the whole mechanism (it is a guard against a theme, and the defect arrived through an axis); making the ceiling density-aware (it would have hidden the real fault, which is that the corner was reading the wrong ladder at all).

The laws that now exist are the ones whose absence let this ship: the spread across the size index stays under a third at every level, no (level × density × pointer × size) cell reaches half the box, and density declares no mark corner at all. The first of those fails against the shipped ladder at 1.54.

## 2026-08-05 Checkbox: the mark family is the line box, and the target is a control of its size

Repetition's third entry, and the first control that leaves the height ladder without leaving the size index. Four questions were genuinely open, and Kushagra closed each one against a different argument than the one I brought.

**The API closed first and cheaply: no `tone`, no `emphasis`, no `material`, no `render`, no `children`.** §11 already assigns the family its one tone (neutral off, accent on), which is an identity rather than an axis; loudness ranks actions and a checkbox is not one; blur inside a 20px square is a 20px square. `children` goes because the LABEL is a sibling — a mark sits beside its label, and the row that owns them both is what spaces them.

**The size: not the space palette, and not a fraction either.** My first proposal anchored the box at ~1.2x its own font step. Kushagra rejected the shape of it — "I don't like fraction" — and asked the better question: why not the space tokens? Measured, and the answer is the control-padding failure one family over (third instance of this lesson, after radius and padding): across a mark's plausible range the palette offers exactly **two rungs, 16 and 24**, so a four-step ladder either repeats steps (16, 16, 24, 24) or overshoots (12, 16, 24, 32). Radix hit the identical wall from the other side and wrote a fraction to escape it — their switch size 2 is `calc(var(--space-5) * 5/6)`, which exists only because the palette has no 20.

What resolved it was **the line box**: `--mark-N` IS `--line-height-N`, an identity rather than a ratio. A mark occupies exactly one line of the label it sits beside. It aligns with that label by construction, and it **grows on a phone with nothing designed twice** — §17's handheld band raises the type and the mark rides it, which is where Spectrum ends up by scaling every component 1.25x on touch and maintaining both scales by hand. Rendered 16/20/24/26 fine, 20/24/26/28 coarse.

**It is one ladder for four controls, and that was Kushagra's catch too** — asked mid-decision whether the switch and slider thumb would share the checkbox's height, which is not a question I had put on the table. Four separately designed ladders in one visual weight class drift, and a checkbox beside a switch in one form has to read as the same size of thing. So: checkbox = radio = slider thumb = `mark(n)`, switch track = `mark(n + 1)`. The shift is not invented — it is what Radix arrives at by hand (their switch heights ARE their checkbox ladder moved up a step) and what Material shows in the extreme (32 track against an 18 box). §1226 is amended accordingly: the switch still leaves the control height ladder, it just no longer gets a bespoke pair that can drift.

**The target reopened a §16 rejection, and narrowed it rather than reversing it.** §16 refused invisible pseudo-element expansion outright: "its safe extent depends on neighbour gaps, which CSS cannot read." Kushagra's answer was to reach for the rule the field already uses for a hosted control — the hit area is the CONTAINER's box, not a hardcoded 44 — inverted: a mark has no container, so it grows to the box a control of its size would have occupied. That is what makes it legitimate, because **the extent is no longer guessed**: it is `--control-height-N`, the same number the Button beside it occupies.

Two things changed in the building. It applies in **both** pointer worlds, not coarse-only like the hosted rule — a fine cell's mark is 16-26px, under WCAG 2.5.8's minimum at the small sizes, and "a mouse is precise" is not what the criterion says. And it is **capped at `--touch-target-min`**: the raw ladder reaches 68px at comfortable coarse, 20px of invisible reach per side, which is exactly the silent overlap §16 feared. With the cap the widest reach in any of the 24 cells is 10px (law-tested), so a stacked list is clear at any gap the layout-space scale offers. The floor token gets its first stylesheet consumer, having been minted for the `max()` reserve §16 dropped.

**Two defects the laws caught in the writing, both about a component reaching past the shared layer.** The resting box first declared `--kui-border-color` directly, so the shared `invalid` remap — which rewrites the tone ROLES — could not reach it, and a checkbox with `aria-invalid` kept its calm neutral edge. And the checked rule was written with `:is()`, tying with the invalid remap at (0,2,0) and winning on source order, so a checked invalid checkbox looked entirely fine. `:where()` fixes the second by stating the precedence question in a selector: **being ticked is dress, being invalid or disabled is a state, and a state outranks dress.**

Rejected along the way: a designed raw ladder for the mark (10 numbers, uncoupled from type — the fallback if the line box ever feels wrong at size 4, where 26/28 is larger than any peer ships); fewer than four sizes (Radix ships 3, Fluent 2, Material 1 — but `size` is a closed union by law, and a call site passing an index from a variable cannot have one component refuse it); no expansion at all (the honest reading of "peer-sized paint", and it fails 2.5.8 on paint in every fine cell); a padded footprint instead of a pseudo-element (self-contained, but the component's footprint would stop matching its paint); and stamping `data-tone` from the checked state in JS (the state attribute is Base UI's, but styling that reads it belongs in CSS — §1's no-JS-at-interaction-time).

**--color-border is minted with it**, and it is not scope creep: "neutral off, accent on" needs the element to stamp `accent` for its ON state, which leaves the resting edge with no way to be neutral except naming a family in a component stylesheet — the one thing the role-not-family law forbids. §11 already promised Separator "a border token" that did not exist.

CSS 17706 -> 18017 gzipped (+311, the whole thing: the mark family across four scopes, the corner ceiling, the role token, the size join and the component). 60 mounted laws, 10 at the token layer.
## 2026-08-05 The docs are built out of the system, and dark SSR closes where it was due

The docs framework question ("undecided (Next/Astro/Vite)" since the scaffold) closed on a stance, not a comparison. Kushagra, on Mintlify and Fumadocs: a UI design system shouldn't have its docs built on another system — if those were good enough, KookieUI wouldn't need to exist. So the decision has two halves: **bare Next.js App Router is the rendering substrate, and every visible pixel is `@kookie-ui/react`** — no docs framework, no third-party UI, ever. A framework that renders whatever components it is given does not violate the stance; a docs product that ships its own components is a standing counterexample on the system's own homepage. Content is plain TSX until a content pipeline earns its place (a pipeline is not a UI system, so MDX later would not reopen this). The docs are thereby the system's first real consumer, which is the other reason to build them this way.

**Dark SSR resolved with the shape §18 had already retracted TO.** The server cannot know the visitor's appearance, so the HTML ships without one and a synchronous script in `<head>` stamps `data-appearance` on `<html>` before first paint — stored choice first, `prefers-color-scheme` otherwise. The root `<Theme appearance="inherit">` stamps every axis *except* appearance, so the scope the script writes is the only source of truth. The script owns `data-contrast` too, and that is load-bearing rather than tidy: the generated high-contrast selectors are `[data-appearance][data-contrast]` on ONE element (§7 — Theme normally co-locates them), and a Theme with inherited appearance stamps no appearance at all, so contrast stamped on the Theme div could never match in dark. Hydration is safe by construction — the appearance store is `useSyncExternalStore` over the same localStorage keys, with server snapshots that render the toggles neutral and correct on the client without a mismatch; system mode tracks `matchMedia` live. Verified in a real browser: stamped before paint, survives reload, dark+high co-locate.

**Being the first consumer earned two findings inside the first hour.** A Box sitting where its parent shrink-to-fits it — a row-flex item, the most ordinary header composition there is — collapses to width 0, because every Box is `container-type: inline-size` for the tier mechanism and inline-size containment sizes an element as if it had no contents; the generator's own comment had always named this for Theme, and nobody had asked about Box. Recorded in DECISIONS' open questions with the taught escapes (`flexGrow` takes width from space distribution — the one sizing route containment leaves open — `width` states it; column items stretch and are safe). And a Button rendered as an anchor wore the UA's link underline into the control dress — the audit had fixed the anchor's semantics and never asked about its clothes; fixed in the skeleton (`text-decoration: none`, +5 bytes, computed-value law in the render-composes suite). The judging matrix at `/matrix` is the gate the density entry named — twelve heights across three levels "cannot be judged by reading a config file" — now standing: size × density per pointer world, radius/pointer/surfaces/contrast switchable in place, the tone × emphasis board, the type ramp.

Rejected: Mintlify/Fumadocs (the stance above); appearance mirrored into React state or context (a second source of truth and a guaranteed flash — the html attribute IS the store); `data-contrast` on the root Theme (can never match in dark, above); Astro despite being the site's own choice (these docs exercise React components and close a React hydration debt — the substrate follows the components, and REVIEW had framed the debt in RSC/`"use client"` terms from the start).

## 2026-08-05 A material is a pane with four parts, and only one had been designed

Kushagra, on the preview's glass cards: thin material as blur plus the ordinary card border reads "cheap — the border looks slapped on." It was. The material owned only its body (the alpha mix and the filter); its edge came from the tone system (opaque step-7 pigment on a translucent pane), it had no lighting, and no relationship to depth. The missing parts were being filled in by systems designed for opaque, in-flow surfaces — which is exactly what cheap looks like.

Three parts landed, each per thickness and mode, all v0. The **edge** is now the material's own translucent white hairline (`--material-<t>-edge`), consumed with a `var(--tone-border)` fallback that resolves at the element — closing §10's long-open "does the material border stay opaque" question with the platform answer it had already sketched. The **rim** is a top inner light catch, painted as a `background-image` gradient deliberately rather than a shadow: the first cut composed it into `box-shadow` and ran straight into `none` being illegal inside a shadow list — flat worlds declare `none` — which would have meant rewriting every "computed box-shadow is none" law; a background layer keeps the one-box-shadow law untouched and cannot leak into nested cards, since `background-image` is a real property, not an inherited custom one.

**Separation was welded to the glass for one hour and then given back to the app.** The first cut had every pane compose `var(--shadow-2)` on its own authority — "a pane with content behind it is above it, flat world or not." Kushagra called it: the persistent elevated look overrides the `surfaces` identity. Rim and edge are what the material IS; depth is what the app SAYS. Glass in a flat world now has edge and glint, no lift; the elevated world lifts it like everything else.

**High contrast leans on the glass rather than unmaking it** — his second catch, same session. The first cut reused the reduced-transparency fallback (95%) and collapsed all three thicknesses into one near-opaque slab. Each thickness now carries its own designed `alphaHigh` triple — more opaque, never fully — and the edge and rim empty so the border returns to the tone system, the one place the contrast setting can reach it.

Tried and declined the same session: **fading blur** (the frost dissolving top-to-bottom with the light, one masked `::before`) — built as page-CSS-only in the preview, judged, reverted. Recorded because the technique is real and cheap if scroll-edge chrome ever wants it at Shell.

Rejected: the pane carrying its own `var(--shadow-2)` (above — reversed on sight); rim as `box-shadow` (the `none`-in-a-list trap, plus custom-property inheritance into nested cards); one fallback alpha serving both high contrast and reduced transparency (two preferences, one designed answer each); leaving the edge on the tone border for `contrast="high"` reachability alone (the setting now gets it back by emptying the material edge, which is strictly better than never having a designed one).

## 2026-08-05 A textarea's frame is the inset — the one-row-equals-TextField identity is reversed, same day it shipped

TextArea shipped with its block padding DERIVED from the height token — `(h − line − 2·border)/2` — so a one-row textarea sat exactly where a TextField's value sits. Kushagra caught the cost in the preview within hours: with a second line, that residue stops being invisible centering and becomes the visible top margin of a paragraph — 13px at the sides, 9px above in the coarse world, an asymmetry nobody designed. The diagnosis that closed it: **centering leftover is not an inset.** In a fixed-height control, the vertical space is residue the eye never judges; in a grown box the eye reads a frame and expects the four sides related. One number was doing two jobs and only one had ever been chosen.

Three candidates, two rejected on the record:

- **A compromise value between the residue and the side padding** — rejected by Kushagra outright: worst of both worlds, fixes neither the frame nor the alignment, and mints a third unexplained number.
- **Keeping the identity** — died on the use-case audit. Every real textarea is a multi-row paragraph (comment, description, ticket, address, commit body); a one-row box is what TextField is for, and the chat composer — the one genuine one-row-that-grows case — is its own component with more props and its own needs, not a reason to bend the paragraph control.
- **What shipped: block padding IS the side padding.** One inset, all four sides, no new number. The one-row law is deleted; the size index still joins every non-height fact (law amended to say exactly that); a `rows={1}` textarea sits taller than a field, accepted.

**No exception for roundness** (Kushagra: "lets try with no exception"): at `full` the pill bump stays horizontal-only, so radius never buys height. The bump corrects text running *sideways* into the corner at its widest swing; vertically the curve has flattened to under half a pixel at the x where text starts. Flagged for the eye pass — a rounded textarea's top corners are the case to judge — and the preview note points at it.

---

## 2026-08-05 The capsule is half the height TOKEN — full's control band states the rule instead of riding the clamp

Kushagra caught it in the preview the day TextArea shipped: at `radius="full"` the three-row textareas were stadiums — corners scaling with the box, the first line of text deep inside the curve. The control band priced `full` at 9999px and let CSS clamping find the capsule, and clamping asks the *rendered* box: right for every control whose height is its token's, wrong the moment one grows, which TextArea does by design (§4's non-fixed-height class — so every future growing control inherited the bug).

Two fixes were argued and the first was refuted in review: a `min(radius, h/2)` cap in text-area.css states a true rule in one component's stylesheet — a system gap patched locally, the token still lying about what it means. The precedent that decided the layer was Card's: the surface band never had this bug because `full` re-prices it to designed corners at the *palette* level. The control band now makes the same move — the generator emits `--radius-control-N: calc(var(--control-height-N) / 2)` in every full cell, beside the heights it halves (substitution-at-declaration, each world's own ladder). Fixed-height controls render byte-identically — 9999 was only ever a trick to reach h/2 — and TextArea is correct with zero CSS of its own.

One visible change accepted knowingly: a pill control whose label wraps (200% zoom, WCAG 1.4.4) used to stay a full stadium and now keeps h/2 corners — judged more correct by the same principle (a corner must not scale with accidental height). Rejected alternatives: exempting TextArea from full (breaks the one-row ≡ TextField law) and giving it the surface band's answer (breaks the same law the same way). The raw palette steps 1–5 keep 9999 as a §13 escape; the old law that pinned the literal `9999px` is rewritten to assert radius = height/2 — the literal was the bug's spelling.

---

## 2026-08-05 The semantic core completes: success, warning, info — each a family, none an alias

Kushagra, closing the open question the docs had carried since the tone set was born ("do success/warning/info earn system-tone status, or stay app-defined?"): the set completes. The forcing was his product call rather than a component landing first — scrutinised and accepted: status names are universal and stable, so the shipped-early-gets-squatted risk that killed Card's slots does not apply to them, and the widening was already unblocked by the amber finding (below).

**Each name ships as its own generated family resolving to a pigment already judged and law-passed:** success on green's hue (150), warning on amber's (80 at vividness 0.9), info on blue's (250). Not aliases into those families, though today they render identically — names are meanings, and a meaning must stay independently correctable: success can drift toward teal someday without `green`, a colour-as-data name, moving with it. The accent/blue pair set the precedent (same hue, two names, two jobs), and gzip absorbs duplicate scales well. Ten tones total; +~2.9KB gzipped for the three.

**Warning is the amber question answered.** The 2026-08-04 position was that warning could not ship without either orange standing in or a generator exception; the day amber earned membership (below), warning stopped needing either.

Rejected: aliasing the semantic names onto the data families in the tone indirection (saves bytes, welds two meanings to one correction knob — the action-at-a-distance §7 already refuses across tones); waiting for Callout/Toast to force each name (the principled default, overridden knowingly — the names are not speculative the way Card's slots were); warning-as-orange (a stand-in with a recorded expiry, expired).

## 2026-08-05 Amber joins at vividness 0.9 — the refusal was real, but the input space was not exhausted

The 2026-08-04 entry recorded amber as unable to ship: hemmed at its cusp in both directions, refused by the state-separation law, waiting on "a designed exception" in the generator. Chasing Kushagra's tone-set widening reopened it, and the finding is that no exception was ever needed — **the failure was specific to full vividness, and vividness is a designed per-tone input the first attempt never varied.**

The mechanism: at vividness 1.0 the chroma curve asks for everything hue 80 holds, which parks the resting solid exactly ON the sRGB cusp. From the cusp, any lightness move sheds chroma steeply, the mud-guard (states keep ≥75% of resting chroma) halts the travel at .032, and the .035 separation floor refuses it — by .003, which is why the preview looked fine while the law said no: a 0.003 lightness step is precisely the "nearly visible feedback" the floor exists to catch. At vividness 0.9 the fill sits 10% off the cusp, the same excursion affords .035+, and every law passes in both modes and both contrast levels. Sitting slightly off maximum saturation is what buys the visible press state; that trade IS the fix.

Why amber still reads softer than indigo, recorded so nobody chases it: yellow's saturation lives at high lightness (dark vivid yellow is brown — it does not exist), blue's lives at low, and one shared lightness ladder means each hue keeps only what the gamut holds at that depth. §7's saturation-for-lightness trade, visible for the first time with both hues in one sweep. Radix has the identical asymmetry and hides it by hand-placing every scale.

**Rejected: carrying the light pin into dark (Radix's own move — their dark amber 9 is byte-identical to light).** Kushagra spotted it in their dark palette, it was measured viable (a pinned #FFC53D passes every light law at full vividness; only our re-derived dark fails), and the fix was scoped: let a pin carry to the dark solid band. He chose the hue-80 v0.9 row by eye instead — config only, dark stays dark-tuned. The carry stays recorded here as the known route to a brighter amber if taste ever wants it. Also rejected: every pinned amber tried (#FFC53D, #FFB224, #F5A623, #FFAE00, #EFA400 — all fail dark separation, because a pin derives full vividness and dark re-derives from it), and the pin-plus-vividness-override hybrid (passes at 0.85, but needs an intake extension the chosen answer doesn't).

## 2026-08-05 The exports map gets its promised validators, and "leaning ESM-only" stops leaning

Prompted by "is the repo set up well": Part III of the planning doc named `publint` + `are-the-types-wrong` as the package-output validation, and neither was installed — while the repo had *already shipped* both failures they exist to catch (2026-07-31: a content-hashed d.ts the exports map did not name, and stripped `"use client"` directives; the build's assert-own-files check was the partial cover). Both now run against the **packed artifact** at the end of every build (`pack:check`), so the exports map is verified rather than trusted, and the gate rides CI. Mutation-checked: pointing `exports.types` at a file that does not exist fails by name. ENGINEERING §1.6 carries the standing rule.

**The decision inside the chore: the module-format lean became a stance.** The spec said "ESM-first, leaning ESM-only (dual if adoption reach matters)." Validating under attw's `esm-only` profile closes that: node10 resolution and `require()` are now *formally* the unsupported paths — reported as ignored in every build log rather than silently untested. Reopening means changing one flag, but from this point shipping dual is a decision someone must make, not a drift that happens. The `styles.css` subpath is excluded from attw only because attw can exclusively type-resolve JS; publint still covers the file's existence.

Rejected: a separate CI step instead of the build tail (the build is what packs — a check that can be skipped by running the build alone re-creates the claimed-versus-actual gap the audit closed); validating the source tree instead of the packed tarball (the 2026-07-31 defects were only visible in the artifact); the strict profile (it fails ESM-only packages on node10/CJS by design, which would force dual output nobody decided to ship).

## 2026-08-05 TextArea: one element, because the anatomy criterion answers twice; padding derived, not designed

Repetition's second entry, and three questions inside it were genuinely open:

**Wrapper or bare element — the anatomy criterion, applied twice with two answers.** TextField's wrapper is forced: a slot puts an icon inside the border, the border must leave the `<input>`, and the wrapper then owes the caret redirect, slot layout and hosted-control focus. TextArea was decided by asking the same question, not by copying the neighbour: it has no slots — an adornment floating over a scrolling paragraph is not a designed position — so nothing non-visual forces a second element, the border stays on the `<textarea>`, and every wrapper debt never exists. The temptation rejected was symmetry ("the field family shares one anatomy"); the criterion outranks the family resemblance. The stylesheet consequence is accepted and bounded: text-field.css's facts repeat self-keyed in text-area.css because the field's selectors are structural (`:has(> .kui-field-input …)`) and this component has no child to ask — the THIRD field-shaped control is the signal to promote the family into the shared layer, not the second.

**The block padding is derived — the one place the system's anti-derivation stance inverts.** §6 rejects derived values where the number is taste (radius-from-height). Here the number is a geometric identity BETWEEN two components: a textarea sits beside fields in a form, and its first row must sit exactly where the field's value sits. `py = (height − line − 2·border) / 2` makes that true at every size in every world by construction; a designed number would be the same four values today and free to drift tomorrow. Taste has no opinion for the identity to override — when it does (the eye pass), the identity is the thing to re-judge, not the values.

**`resize` is a stylesheet default, not a prop.** Vertical-only (horizontal resize makes the element wider than the column that owns it — the one axis that breaks the layout around it); `none` and `both` are one `style` away. A `resize` prop was considered and refused by §3's own rule: a prop earns a row only if it adds something raw CSS lacks, and this one would rename a CSS property.

Also closed: the disabled remap's third arm (`.kui-control:disabled`) for the control that IS the native form element — no stamp, the native attribute is the one truth both routes land on; and the type refusals (`children` — React's form contract is `defaultValue`; `cols` — the field's `size` argument verbatim; `render` — the element cannot move). Cost: **+91 bytes gzipped**, against TextField's +247 and Button's +1,206 — the additivity curve, third point.

---

## 2026-08-05 Two width vocabularies, and they are correct — a window is unique, containers are legion

Raised immediately after §18 shipped: tiers say `sm / md / lg`, window classes say `narrow / regular / wide` — two word-families for width, and `md` and the narrow boundary even share 48rem. One vocabulary was considered seriously, and the unification is genuinely available: room words work as thresholds for the two upper tiers without inversion (`{ initial, regular, wide }` — "when this slot has regular-window room"), `initial` is the narrow state by mobile-first construction, and only `sm` (30rem, sub-class) lacks a name.

**Kushagra's argument killed it, and it is the better argument: normative words need a unique referent.** A window is one per app — "a regular window" judges one thing against one norm, so state words mean something. Containers are *everything* — a sidebar, a gallery, a pane — and "a regular container" is relative to expectations of the particular thing: a regular sidebar and a regular gallery are wildly different widths. Room words smuggle in a norm that containers do not share. `md` survives precisely because a T-shirt size is semantically empty — an absolute measurement label that means the same 48rem in a sidebar and a gallery, claiming nothing about what is normal for either.

So the vocabularies stay split, on principle rather than by accident: **states of the unique thing get normative words; measurements of the many things get size labels.**

**The number coincidence is recorded as coincidence, deliberately unpinned.** `md` = 48rem = the narrow boundary and `lg` = 64rem = the wide boundary — but tiers judge where *content* breaks and window classes judge where *shells* break, and the eye pass must stay free to move them apart. Deriving one from the other (the `narrowMedia` move) was considered and rejected: §6's sin is coincidence silently *relied on*, not coincidence existing. Nothing may assume a slot at `md` has "a narrow window's worth of room"; if the numbers ever need to agree by rule, that is a new decision, not this one.

---

## 2026-08-05 Window size classes: three, named for room, one boundary shared with the narrow band

The gap the tablet discussion surfaced (§17, LOG below) closed the same day, as §18. Three decisions inside it, each of which was genuinely open:

**Three classes, not four.** Kushagra opened at four (and the system does follow 3s and 4s). What settled it: a window class exists to pick the navigation shape — bottom bar, rail, sidebar — and there are three shapes. The platform survey said the same from both directions: Apple's two is the documented failure (rail and sidebar collapse into one "regular"), and Material's four-then-five is compensation for not having container queries — their "at 1600px add an inspector" is a *room* question our container tiers already answer in the pane that asks it. Three ships as a closed union with the tone set's widening rule: `expanded` joins the day a real shell forces it, not before.

**Named for room, never hardware.** `phone | tablet | small desktop | desktop` was on the table and was rejected with its own author's argument: users run apps in windowed mode, so device names lie — an app in half a 5K display would be "tablet" with no tablet anywhere, and a phone-preview canvas inside a desktop tool would be a "phone". Every platform that started from device names retreated to window-measured classes. The device question is `pointer`'s (§16, §17); the window class is pure room. `narrow | medium | wide | full` was also rejected (Kushagra: `medium` is not the middle of four, `full` is vague) — at three the shape resolves to **`narrow | regular | wide`**: blunt words, and the unmarked middle rung, material's habit.

**The narrow boundary IS the narrow type band's number, by derivation.** Not two thresholds that happen to agree: `narrowMedia` is built from `windowClass.narrowMax` in config, a law pins the derivation, and the shared word is the point — display type shrinks exactly when the app goes to one column, including at exactly 48rem (boundaries land downward, law-tested at the exact widths). This closes §17's "same numbers or independent" question as *same, mechanically*. The wide boundary opened at 64rem and moved to **75rem the same day** (Kushagra: 1024 is too small — and the arithmetic agrees: `wide` promises a sidebar, and at 1024 the content behind ~260px of sidebar is narrower than a narrow window). 80rem was rejected for where the boundary would *sit*, not what it would grant: exactly on 1280, one of the most populated widths in the wild — half of every 27" display, WXGA fullscreen — so the commonest desktop posture would flip shells with a pixel of drag. A threshold sits in quiet territory between populations; almost nothing lands exactly on 1200. Re-judged by eye when a real shell exists.

The mechanism is a hook, `useWindowClass()`, and deliberately NOT a token: no emitted declaration keys on a window class (law-tested), because a class picks a shell and a shell is components. SSR returns `null` honestly — the server has no window, and a guessed class paints a guessed shell. ~~The pre-paint stamp that would close that gap is the same debt dark-mode SSR carries, and the two are now formally one deliverable at apps/docs: one inline script, both answers stamped before first paint.~~ *Retracted same day — see the entry below.*

---

## 2026-08-05 The window half of the pre-paint stamp is retracted — false symmetry with dark mode

Same day as §18 shipped, Kushagra's standing rule — every claim scrutinised against standards — killed half of it. The recorded plan was one inline script at apps/docs stamping two answers before first paint: dark mode and `data-window`. The symmetry is false, and the window half fails twice:

**CSS never needed the stamp.** Media queries read the window width natively, before paint, with no script — it is the standard mechanism and the one our own type bands already use. `data-pointer` earns its attribute because *pinning* overrides what media queries would say; window pinning is deferred and may never land. Until it does, `data-window` duplicates a native capability.

**JS cannot use the stamp.** Hydration: React's first client render must match the server HTML, and the server rendered the `null` branch — so the first frame is the null branch no matter what an inline script stamped on the root. This is not a Kookie limitation; next-themes, the reference implementation of the dark-mode script, has exactly this shape — the script fixes CSS only, and its hook returns undefined until mount.

**The standard answer for a first-paint shell is CSS-shaped**: both navigations in the HTML, the exported boundary queries picking which shows. No JS decides layout, so nothing flashes. The hook serves post-mount decisions — what to fetch, what to route — which is what a runtime signal is for.

What survives: the dark-mode inline script, alone — the industry-standard fix (next-themes, Tailwind docs), and needed only because `appearance` can be authored rather than system-followed; pure system-following is plain `prefers-color-scheme`. The `data-window` attribute is no longer reserved; it exists the day pinning does, as pinning's mechanism, or never.

---

## 2026-08-05 A pill pads wider — but only on an edge where text meets the curve

Kushagra, judging the preview at `radius="full"`: on buttons and fields without a leading icon, the text sits too close to the left edge, and the fix should be system-wide. Then, on the first cut, the refinement that turned out to be the whole design: a side holding an icon or a hosted control needs no correction — the password field (bare text, trailing Show button) compensates only its left edge; the search field (leading icon, trailing Clear) compensates neither.

The cause is geometric, which is what makes this the system's job rather than a call-site taste knob. Padding is measured at the vertical midline, where a pill is at its widest; the eye judges the gap at the text's cap line and baseline, where the corner curve has already swung inward. At `medium` radius the encroachment is sub-pixel where the text lives; at `full` the radius is half the height and the label reads crammed against a curve that the same padding clears perfectly at every other level. His intuition — pad by half the height, so the text starts where the straight walls start — is the classic capsule rule and the safe maximum; the placed values sit just under it (~0.40–0.44 of the box), because full half-height overshoots at the large sizes.

**The mechanism: a second designed number per cell, identity everywhere but `full`.** `pxPill` joins `height` and `px` in every (density × pointer) set; `--control-px-pill-N` resolves to `var(--control-px-N)` at every radius level (re-declared wherever `px` is — substitution-at-declaration) and only the full cells state raw values. Unlike the control radii there is no palette indirection to carry the level into a pointer world — the radii ride `var(--radius-step)` and the full palette re-prices the step, but a raw length has nothing to ride — so the full cells exist per pointer world too, and a mounted law pins the coarse cell precisely because a missing one would silently fall back to the fine value.

**Per side, read off the DOM.** The skeleton now pads each inline side independently; a side whose direct child is a `[data-slot]` wrapper resets to the plain padding, and the field's hosted-control rules still tighten past that to the slot inset. Which required Button's slots to *wear* the wrapper — they were bare children, so the stylesheet could not see them — and closing that hole closed a second one for free: §4's hosted-control geometry (`.kui-control > [data-slot]`) had only ever worked in TextField, so a control in a Button's trailing slot was silently unsized. One spelling for the adornment wrapper, everywhere (ENGINEERING §3's `data-slot`), and the `filled()` slot predicate moved to the shared layer since both components now ask it.

Rejected: a `calc()` off the radius or height (a ratio nobody chose is not a design — the slotInset/radius lesson, third time); re-declaring `--control-px-N` itself under full (the slot sides need the plain value to fall back to, and a wholesale re-declaration erases it); half the height as the value (right rule of thumb, wrong at size 4, where it turns padding into a third of the control's width); compensating every side regardless of slots (pushes an icon visibly off its edge, which is the complaint mirrored).

## 2026-08-05 The device prop is dropped — coarse means handheld

Kushagra, on being walked through what `device` survived on after the split: "I'm not designing for kiosk and POS terminal." And that was the prop's whole remaining justification — the two cases where "the primary input is a finger" and "the screen is close to a face" disagree, which no media query can tell apart.

Strike those and the prop was indefensible on three counts:

- **It had no consumer.** Its auto signal asked exactly the question `pointer` asks, so in every product actually being designed for, nobody would ever set it.
- **The name wrote a cheque the implementation didn't cash.** A prop called `device` set four font sizes and nothing else — no targets, no spacing. Someone setting `device="handheld"` expecting a mobile mode would get bigger paragraphs and identical buttons.
- **It held two spellings open.** The prop said `handheld`, the band said `held` — the same two-spellings debt just paid off on Button's `icon`/`iconEnd`, one day old.

So: the band is renamed `handheld` (Kushagra: the better word regardless, one word everywhere), the prop, its type, its `data-device` attribute and its emitted scopes are deleted, and the band now rides the POINTER axis's own `[data-pointer]` scopes — its steps are emitted inside the pointer world blocks. Pinning `pointer="coarse"` forces the whole coarse world, geometry and reading type together; `pointer="fine"` is the escape and re-declares the identity steps. The preview's pointer select judges phone type now; its device select is gone. Neither world touches the narrow band's steps — a pointer says nothing about width.

Two laws changed meaning with it, deliberately: "type never takes density or pointer" is now "type never takes density" (pinning pointer legitimately moves the reading steps — that is the point), and §16's "coarse world never touches type" became "the coarse world's type declarations are exactly the handheld band's".

**To bring it back** — a touch screen genuinely operated from a distance: re-add the Theme prop stamping `data-device`, emit the band under `[data-device="desktop"|"handheld"]` plus `@media (pointer: coarse) { [data-device="auto"] }` instead of inside the pointer worlds, and restore the pointer-invariance law. The commit before this one carries the complete working mechanism; this entry is the pointer to it.

---

## 2026-08-05 One type band was doing two jobs, and Apple's own table is what showed it

Kushagra, on the question of whether iPads need their own band, with a screenshot: Apple's page is titled **"iOS, iPadOS Dynamic Type sizes"** — one table for both platforms. Body is 17pt on an iPhone and 17pt on an iPad.

Which quietly demolishes the width half of our rule. The `handheld` band (shipped 2026-08-04) fired on `(pointer: coarse) and (max-width: 48rem)`, and the *cited* justification for the band was "HIG: iOS body 17pt against macOS 13pt" — a **touch platform vs desktop platform** contrast. The width gate silently converted that into **phone vs tablet**, a split the source does not make. And it did not even make that split well: a 13" iPad Pro is 1032px portrait and 1376px landscape, the 10.9" is 820px, so at 768px the gate separates an iPad mini in portrait from every other iPad. That is where a threshold landed, not a boundary anyone chose.

Chasing the fix exposed the real defect, which was structural rather than numeric. **The band was doing two unrelated jobs:**

    reading steps 1-4 ROSE    16 -> 18   because a held screen is close to the eye
    display steps 8-9  FELL   56 -> 40   because a narrow screen is seven characters wide

Viewing distance and line length. Different questions, different answers, welded to one signal — so the middle of the range came out wrong in both directions. A tablet lost a rise it should have had, and a squeezed desktop window kept 56px headings though the line-length argument applies to it identically.

So: two bands. `held` on `(pointer: coarse)`, `narrow` on `(max-width: 48rem)`. Each emits only the steps it MOVES, which is what lets them coexist — held owns 1-4, narrow owns 8-9, steps 5-7 are nobody's, and neither can silently overwrite the other on a phone where both apply. The generator derives the moved set from the picks, so tuning a pick moves the emission with it.

Two consequences worth recording.

**`device` stops being an axis and becomes an escape.** Its auto signal now asks exactly the question `pointer` asks. It survives on two cases no query can answer: a touch-only kiosk or wall display (coarse, held by nobody, read from two metres, wanting *bigger* type), and a POS terminal that wants coarse targets with desk-distance text. Without the prop, type and targets are welded and neither is expressible. §17's framing as "the third device-facing question gets its own signal" is now overstated and has been rewritten.

**There is no tablet band, and the thing Kushagra was actually reaching for is a different deliverable.** Figma-on-iPad ships a reduced interface — but sort what differs and it is: which features exist (a product decision), navigation shape (width), tap targets (the pointer axis), and type (where Apple says tablet equals phone). Nothing is left for a band to hold. What IS missing is a **window-level size class** for app-shell composition: our tiers are container-keyed on purpose, and "which interface should this app show" is a viewport question the system currently cannot answer. Recorded as open, shaped like Material's compact/medium/expanded.

Rejected on the way: **`any-pointer: coarse`** as the held signal — it means "touch exists somewhere on this machine", so it would permanently inflate a mouse-driven touchscreen laptop and override density, an axis built precisely so people could choose airiness. `pointer` tracks how the machine is being used now: flip a 2-in-1 into tablet mode and it becomes coarse, flip it back and it does not. That also closes §16's long-open `any-pointer` question for geometry, with the same answer — capability is not use.

One test-infrastructure note, because it was a live falsification: the browser suite's viewport was under 768px, so the moment the narrow band existed every law that read a step-9 size was silently asserting against the narrow world while claiming to test the base palette. The viewport is now pinned wide, and the narrow band has its own laws that resize the page for real.

---

## 2026-08-05 Two layers were writing to the same private names, and one of them was Box

`--kui-h` was the control layer's height stem AND the layout mechanism's stem for Box's `height` prop. So were `--kui-px` and `--kui-py`, against Box's `px` and `py`. Three names, six meanings.

This is not a tidiness complaint. The layout mechanism registers every one of its stems `inherits: false` — correctly, so a Box's padding does not leak into its children — and that registration applies to the NAME, not to the layer. So `--kui-h` was silently *absent* on any element that did not declare it, which is exactly why the hosted-control geometry needed two hops: the container had to compute the height and hand it to the slot, because the slot could not read the container's `--kui-h` at all. That was the second thing the collision broke; the size join leaking the whole control family onto every Card was the first, and it was fixed at the symptom in the 2026-08-03 audit by scoping the selector, leaving the name shared.

The control layer now wears `--kui-ct-`, which is the convention the surface layer already had (`--kui-sf-`). With the names distinct, the slot can simply read the container's height and the second hop is gone — one registered property deleted, and the mechanism reads the way it should have.

`--kui-border-color` stays shared, on purpose: `[data-bordered]` is written once and read by both `.kui-control` and `.kui-surface`, because containment is one idea. So the law is not "no shared names" — it is the narrower one that could not have been satisfied by accident: **nothing outside the layout mechanism may so much as MENTION a name the layout mechanism declares.** Mention rather than declare, because reading a stem you do not own is the same defect from the other side, and `--kui-py` was precisely that — read by the control skeleton, declared by Box.

Two laws had to learn to strip comments to make this work, and the reason is worth recording: these stylesheets explain why a rung, a family or an abandoned stem is *absent*, which means writing it down, which made both laws fire on their own documentation. The cheap fix each time is to delete the sentence. That is the wrong direction for a codebase whose comments are the argument, so the laws now read code.

---

## 2026-08-05 The iOS zoom hole was bigger than the size 1 everyone had pencilled in

Safari zooms the whole page when a text input under 16px takes focus — the layout shifts off-centre and the user pinches back. It is the only way a control in this system can break the page *around* it just by being tapped.

The device axis (§17) was recorded as having mostly closed this: the handheld band lifts size 2 to 16px, so "sizes 2+ are safe on a phone, size 1 is the known edge." The first half is true and the second half was wrong. An iPad in landscape is past the handheld conjunction's 48rem threshold, so it resolves as `desktop`, takes the desktop type ladder — 14px at size 2 — and Safari zooms on the default size of the default control. The axis that was supposed to answer this is optical (where the screen sits); the question is motor (a finger is touching it). Wrong axis.

So `--input-font-floor` rides the POINTER world: 0px on fine, 16px on coarse, and the input's font size is `max()`ed against it. It lands on the input alone — the box keeps its designed height, the label its designed step — so a size-1 field is still visibly a size-1 field, and the control≡type parity the size index rests on is untouched.

**Rejected: lifting the handheld type ladder so size 1 renders 16px.** It fixes one control by making the caption step unusable — a phone that cannot render small secondary text has lost more than it gained.

**Rejected: a bare `@media (pointer: coarse)` rule.** Same rendered result, but it would be the one geometry answer in the system that cannot be pinned, escaped, or read as a computed value through `<Theme pointer>` — which is how everything else in the pointer axis works and how it gets tested.

---

## 2026-08-05 readOnly was a prop that resolved to nothing

`<TextField readOnly />` was fully accepted, refused keystrokes, and looked pixel-identical to the editable field beside it. The only feedback was typing and having nothing happen.

The temptation is to reach for the disabled treatment, and it is wrong: a read-only field is live. Its value is selectable, copyable, focusable, in the tab order, and submitted with the form. Exactly one thing is gone — the invitation to type — so exactly one thing changes: the **seal**, which is what makes a field read as a well you put a caret into. Border, text contrast and the caret cursor all stay, because each of them is still telling the truth.

One trap, and it is CSS's: `:read-only` matches anything that is not `:read-write`, which includes a *disabled* input. Without `:not(:disabled)` every disabled field would lose its fill on top of the disabled remap — two states painting one box.

Closed at the same time, from the same audit: `type` became a closed union. On the native element `type` is not an axis but a component selector, and unconstrained it let `type="hidden"` render a visible empty bordered box — the wrapper draws the border and the height, and it cannot honour a type nobody told it about. And slot content now DESCRIBES the field through `aria-describedby` rather than floating beside it unlinked; described rather than labelled, because an adornment qualifies the value and does not name the field.

---

## 2026-08-05 Control padding leaves the space palette — the radius bug, one family over

Kushagra, judging the preview: "in both text field and button, at size 2 to size 4, the horizontal padding seems a bit too much." He was right, and the interesting part is *why* it was too much, because the answer is a mistake this system had already made once and already fixed once.

`--control-px-N` was a step index into the space palette. The palette is a **layout** rhythm — a hybrid curve, near-linear at the bottom and geometric at the top — so through the band controls actually live in (8, 12, 16, 24) it grows about **1.44x per step**, against a control height ladder that grows about **1.20x**. Two ladders climbing at different rates, joined by a shared index, cannot hold a ratio between them. Measured across default density: padding ran **0.286 -> 0.375 -> 0.400 -> 0.500** of the box. Size 4 was carrying half its own height in side padding, and v1 of this system used a flat 0.375 — so the top of the ladder was 33% past the project's own reference constant while the bottom sat under it.

Coarse/comfortable was worse and gave the game away: it needed a fifth step past 32 and the palette had none, so it repeated one — `[16, 24, 32, 32]`. A size-4 control padded no wider than a size-3 control, shipped, with no law that could see it.

This is section 6's capsule bug in a different family. Radius climbed with the size index until size 4 read as a pill; the fix was to hold it near a constant fraction of the box, and the mechanism that made that possible was **widening the radius palette inside the control band** — that is what the extra step at index 10 exists for. Space cannot take the same fix: inserting a step renumbers every layout pick, and `gap="6"` would quietly change meaning across the whole system.

So control padding joins `height` as a **designed raw number per set**, six sets of four. All twenty-four cells now sit in **0.24-0.38** of their box, and three laws hold it there: the band per cell, absolute monotonicity across sizes, and the compact < default < comfortable ordering that height already had. Every one of them fails against the config that shipped — including the coarse/comfortable repeat, which is exactly the kind of defect that survives because no law was ever pointed at it.

**Rejected: adding a step to the space palette.** It fixes the resolution and breaks the meaning of every layout number in the system, to serve one family that is not a layout family.

**Rejected: a fraction of the height, computed.** Same objection Kushagra raised against a computed `slotInset` the day before — a ratio nobody chose is not a design — and the same reason radius is *held near* a fraction by designed points rather than derived from one.

Not a violation of "reference, never restate" (section 6): there is no palette entry being restated. What the rule forbids is a component knowing `12px`; `--control-px-N` is still the only name any component may use. It does now carry `--scale` directly instead of inheriting it from the space token, which a law pins — a raw length emitted without it would have dropped control padding out of the one geometry that answers the scale escape.

Size 4 came down 24 -> 16 (-33%), size 3 16 -> 13, size 2 12 -> 10, size 1 unchanged. v0, like every number here, and now correctable per cell instead of per palette step.

---

## 2026-08-05 A field's ring answers "is the caret here", not "is focus anywhere in this box"

Fallout from making a hosted control a first-class pattern the day before. The field rang on `:focus-within`, which fires for **any** descendant — and the descendant is now routinely a button. Tabbing to a clear button lit the field's ring and the button's own `:focus-visible` ring, one nested inside the other, saying two different things at once.

The framing problem underneath is the more important one. Section 8 defends the field's departure from `:focus-visible` on the grounds that *a field's focus is a mode*: you do not press a field, you enter it, and the box has to say where your keystrokes land. A ring that fires when focus is on a button inside the box says something that is not true. It was a correct rule asked a question it was never meant to answer, and the fix is to ask the right one: `:has(> .kui-field-input:focus)`. The border still belongs to the wrapper; the ring still encloses the slots; a hosted control rings itself, like any control.

Rejected: excluding slots from `:focus-within` with a `:not(:has(...))` arm. Same rendered result, but it states the rule as a list of exceptions to a question that is still the wrong question.

---

## 2026-08-05 Two things a field claimed about itself that its CSS did not deliver

Both from the TextField audit, and both the same shape: a comment asserting an invariant that half the mechanism did not honour.

**A glass field's fill did move.** text-field.css pins all three fill *sources* to `--color-surface` and says, in a comment, that a field's fill does not move at all — the border and ring carry its states. True of the sources. But material is a **fill modifier** (section 10): it mixes the source toward transparent on a ramp of its own — rest, hover, active — so the thing that moved was the mix, not the source. At the middle thickness in light that is 64% -> 72% -> 80% of the same white. The trailing button was enough to fire it just by being crossed on the way to the caret. Fixed by pinning the *derived* hover and active fills to the resting derived value, which names no thickness — a fourth one would not touch the rule. Deliberately unguarded: where nothing derives a fill the reference is invalid at computed-value time, the property falls to the guaranteed-invalid value, and the shared layer's own fallback chain takes over exactly as before.

**A `Field.Root disabled` field looked entirely live.** The component stamped `data-disabled` from its own prop and the comment claimed that was sufficient "because we own the prop". It is not — Base UI computes `fieldDisabled || disabledProp` at the *input*, so inside a disabled fieldset the flag never passes through this component at all, and the element that paints was never told. The identical problem was solved for `invalid` one line away, in the shared layer, with `:has()`. It now reads `disabled` the same way. Direct child only, because a disabled clear button is a grandchild and a field is not disabled because something inside it is.

The audit's own summary of the 2026-08-03 sweep applies unchanged: a law that reads the component's attribute instead of the browser's computed value is one indirection short of the thing that can be wrong. Both of these had laws. Neither law asked the engine.

---

## 2026-08-04 A control inside a control, and the mapping the call site was being asked to invent

Kushagra, on the preview: the Show and Clear buttons inside a field do not compose — they are the same height as the field. Measured, they were: 87.5% of the box in the two cells he was looking at, 100% under coarse at size 1, and 1px of slack in the composition a consumer would actually write (`<TextField trailing={<Button/>}/>`, both at their own default size). In that last case the field also **grew 2px past its own size token**, in 16/16 measured cells — `box-sizing: border-box` plus a hosted control that exceeds the content box.

His hypothesis — "perhaps size 1" — was already what the preview shipped, and it did not work. Dropping one index only ever buys 2-4px because adjacent heights are 4-8px apart, and **no size index in the ladder seats a hosted control with visible air**. That is the actual finding: the system had exactly one nesting rule (§10's "one glass per stack") and none for geometry, so a call site had to DERIVE the relationship — and the mapping it was asked to infer was non-uniform (2px, 4px, 4px) and undefined at size 1, where nothing in the system fits a 26px content box.

The space was also asymmetric by **13:1**. The sides came from `--control-px` (12px at size 2); the top and bottom came from whatever the height left over (~1px). Two numbers from two places, one of them nobody chose.

**One designed `slotInset` per size now drives all four sides**, and the hosted height is that inset subtracted rather than a second designed ladder that would drift out of agreement with the first. Rejected: a fraction of the container (~0.7) — Kushagra, "I don't like fraction" — and the ladder had already learned that lesson with radius, which is deliberately held near a constant fraction *because* letting it climb made size 4 read as a capsule. A designed number per size is what every other control quantity here is.

**Touch: the hit area matches the CONTAINER's content box, not 44.** Kushagra caught the flaw in targeting 44 directly — at coarse size 1 the field is 36, so a hosted control grown to 44 would be a *larger target than the thing containing it* and would overlap its neighbours in a stacked form, which WCAG 2.5.8 counts against you. Matching the container means the hosted control inherits whatever compliance its container already has, and size 1 keeps the one deliberate sub-44 compromise §16 already made rather than inventing a second one.

Two mechanisms this cost, both lessons this system has already learned once:

- `--kui-slot-h` and `--kui-hosted-height` are **registered lengths**. Unregistered, a custom property inherits as a token stream and `var(--kui-h)` inside it substitutes on the element that USES it — the hosted control, where `--kui-h` is that control's own height. Measured 24px at every field size, i.e. the container's size having no effect at all. Fourth instance of substitution-at-declaration, after radius, density and surface padding.
- The container computes and the **slot captures**, because the hosted control is also a `.kui-control` and re-declares `--kui-slot-h` from its own index. The slot is a plain span with no size join, so a value parked there survives.

Found on the way, and it is why the container must do the arithmetic at all: `--kui-h` is registered `inherits: false` by the layout mechanism, because Box's `height` prop shares the stem. So it is simply *absent* on the slot. The stem collision the 2026-08-03 audit flagged was fixed at the symptom (scoping the size join to `.kui-control`); the name is still shared, and this is the second thing it has broken.

**`iconOnly` ships with it, as a prop on Button rather than a second component.** v1 had a separate `IconButton` and it failed in a specific way: it was opt-in by memory, so people and agents alike reached for `Button` and got a pill where they wanted a square. One component cannot be forgotten. The glyph goes in `children` because for this button the glyph *is* the content, not an adornment beside one — spelling it through the leading slot would make that prop mean two different things depending on a boolean. And the prop is explicit rather than inferred from "has a glyph, no children" precisely so the type can demand an accessible name: an icon-only control with no `aria-label` announces "button" and nothing else, and here it does not compile.

**The adornment spelling closed at the same time**: Button takes TextField's `leading`/`trailing`. `iconEnd` is not RTL-correct, and a trailing slot holding a *control* is now routine rather than exceptional. The break is theoretical while the package is unpublished; two spellings would have been permanent.

Rejected: an `IconButton` component (above); inferring `iconOnly` (an unlabelled icon button would still compile); targeting 44 for hosted controls on touch (above); a `--slot-control-height-N` token family (24 declarations across six worlds restating a subtraction — measured 422 bytes gzipped — that one `calc()` does once).

## 2026-08-04 The invalid state was a hue rotation at constant luminance, and the ring drowned it

Kushagra, looking at the rendered preview: the invalid border is too light, and a validity state should read as high-emphasis. Both halves were right, and the measurements are worse than the complaint.

`--destructive-border` is step 7, and step 7 shares its lightness with every other tone **by law** — the shared-ladder test asserts exactly that. So the entire validity signal was a hue rotation at constant luminance. Against the field own fill: 22.8 -> 23.9 Lc in light (+1.1), and 10.3 -> **9.8** in dark. **Going invalid lowered contrast in dark mode**, and at constant luminance the state is close to invisible to a red-green colourblind user. Both modes sat far under the Lc 45 non-text floor the system already enforces on the focus ring — a floor adopted the previous day and never applied here.

The ring made it worse. On a focused invalid field the accent ring measured **6.4x** the visual weight of the error border it surrounded (2px at Lc 76.5 against 1px at Lc 23.9), so the error indication was at its faintest at precisely the moment the user focused the field to fix it.

**Both now read `--invalid-edge`**, one token picked per mode — `--destructive-solid` in light (Lc 65.4), `--destructive-11` in dark (65.2), because step 9 clears the floor in light and misses it in dark at 36.1. That is the same per-mode shape the focus ring itself took on 2026-08-03, for the same reason.

**This reverses §8 one-ring rule for the invalid state, and half of that rule defence was false.** §8 argued a destructive ring "would have to re-clear the APCA floor per mode — the trap the audit found in the dark ring." Measured, it does not struggle at all: destructive clears Lc 55-65 in both modes. What genuinely argued for one ring was consistency with Spectrum, Radix and Primer; that is real but outweighed here by two chromatic signals arguing on one control. **The rule survives for tone and dies only for state** — a destructive-tone Button still rings accent, and a law pins that. A tone is chosen; a state is not.

The related trap, named so it stays named: the fix is that invalid one *resolved appearance* is loud, **not** that loudness becomes selectable. An `invalidEmphasis` prop would be an axis nobody varies, which §9 calls a component fact rather than an axis — the reasoning that deleted the elevation axis.

Rejected: keeping the accent ring and thickening the border instead (the two signals still argue, and stroke width is not the variable that was wrong); a per-tone ring generally (tone is chosen, and the Spectrum/Radix/Primer convergence stands); an `invalid` emphasis rung (above).

## 2026-08-04 The tone set widens to six, and the widening catches the generator not following its own comment

## 2026-08-04 The device axis: type follows where the screen sits, and the third device question gets its own signal

Kushagra, from Apple's "Ensuring legibility" table (iOS body 17pt, macOS 13pt): text should respect breakpoints, "but not in the same way as coarse and fine — on a mobile, what you want is a larger font size." The observation is the dissociation that forces a third axis: `pointer` is motor (can a finger hit the box), this is optical (how far the screen is from the eye), and they come apart on exactly the devices that matter — a touchscreen laptop is coarse at desk distance, an iPad with a keyboard is fine at reading distance. §16 had left "whether body text shifts under coarse" open; the answer turned out to be that it was the wrong question — type never follows pointer at all.

**Shipped as §17.** Theme prop `device: desktop | handheld | auto`, the pointer axis's exact shape: auto follows the platform, pinning forces a band (and is how phone type gets judged on a desktop — the preview grew a device select). The auto signal is a **conjunction**, `(pointer: coarse) and (max-width: 48rem)`: coarse alone is the touch laptop, narrow alone is a squeezed desktop window whose boxes did not grow; both together is a screen held in a hand. This does not reopen §16's width rejection — geometry still never reads width; the conjunction gates type and, later, the interaction-model adaptations (dialog→sheet) that THESIS Part II promises and that had no signal to key off until now.

**The band is a re-pick of indices, non-monotonic by design.** Handheld maps each step to a new index into the three paired palettes, so every rendered step stays a designed triple. Reading sizes rise one index (body 16 → 18, against the HIG's 17pt), the middle holds, display sizes come *down* — 56px on a 375px screen is seven characters a line, so "bigger on mobile" as a multiplier is wrong at both ends. Steps 4/5 and 7/8 collapse on a handheld, the price compact already pays in layout space. A found constraint shaped the mechanism: re-picking *within* one token family via `var()` is impossible (handheld maps step 5 onto its own name, and a self-referencing custom property is IACVT, taking the whole chain down), so a band re-prices the palette in place with raw values from the same config source — the radius-level mechanism (§6), one family over. No second token name, because raw type has no legitimate consumer the way raw space does: `--font-size-N` stays the one spelling and no consumer learns a band exists.

**Control labels follow for free, and the claim finally has its law.** The session opened with me asserting the control join dropped letter-spacing — false; tracking shipped with Button, and the grep that "found" the bug never searched for it. What was genuinely missing was the *law*: control≡type parity (same computed font-size, line-height, letter-spacing at every size, both bands) is now pinned in the mounted suite, so "one definition of what a size step means" is a guarantee rather than a reading of the file. A quiet dividend: the handheld band renders size 2 at 16px, which stops iOS's zoom-on-focus for the default-adjacent field sizes with no floor mechanism and no broken size promise; size 1 stays exposed, recorded open.

Rejected: pointer alone as the signal (the touch laptop gets phone type); width alone (the squeezed window's boxes did not grow); a scaling multiplier (wrong at both ends of the ramp); per-prop device tiers à la Tailwind's `sm:` (the system owns device adaptation, opt-out — THESIS Part II; per-prop device intent surviving as a common need would mean the defaults had failed); a second semantic token layer over the type palette (layout space needed one because raw space has real consumers; raw type has none); spacing or geometry answering the axis (gutters must not inflate on the smaller screen, and two axes pushing one box compose a height nobody designed — both now band-scoped laws).

## 2026-08-04 Container-keyed tiers re-litigated and re-affirmed; window breakpoints stay dead, and an unnamed cost gets a name

Kushagra, sus of container-based responsive props after the device-axis discussion, asked for the user-level cons and then directly: "should I switch to window based then." The full re-litigation, run to the end this time so it stays closed: what a consumer loses with container tiers is (1) no way to say "on mobile" per-prop, (2) no single page-wide breakpoint moment a designer can draw as three frames, (3) Tailwind muscle memory reading `md` as a window width, (4) the shrink-wrap collapse. Against that: window width is a *proxy* that conflates "how much room do I have" (containers answer exactly) with "what is this device" (the device axis answers exactly), and once both real signals exist the proxy has no remaining job — every honest `sm:` decomposes into one or the other.

The external record agrees, which was checked rather than assumed: Shopify Polaris rebuilt its responsive props on container queries (`@container (inline-size > 300px)` values, an explicit `QueryContainer`); Chakra's open discussions ask to move breakpoints *from* viewport *to* container; Panda shipped container conditions; Tailwind 4 added container queries under a distinct `@sm:` spelling while keeping `sm:` for the viewport — the industry's migrations all run window→container, none back, and the consensus split (containers for components, media for device-level type and interaction) is exactly §2 + §17. The 2025 State of CSS names container collapse as the common frustration — the same footgun §2 already documents and law-pins, a cost of the feature, not of this design.

Two things came out of the challenge worth keeping. First, a discipline failure worth not repeating: mid-discussion I escalated an observation into a "narrow containers to regions" recommendation with no disconfirming evidence — a hypothesis competing against a decision with written reasons and accepted costs. Withdrawn; the standing rule is that decisions reopen on the build's evidence (the docs app is this one's gate), not on argument quality. Second, a real cost that had never been *named*: **wrapping a subtree in a plain Box re-targets which container its children's tiers measure** — a direct consequence of nearest-ancestor resolution, documented as mechanism but absent from §2's cost list, unpinned by any law. Recorded in the open list; it gets named in §2 with a law when that section is next touched. (Polaris's explicit-container shape is external precedent for the withdrawn alternative — recorded here so the fact survives, and so nobody mistakes its existence for a reason to reopen.)

Rejected: window/viewport breakpoints as the responsive-prop mechanism (v1's model; the proxy argument above, plus THESIS Part I — familiarity is an adoption argument and adoption is explicitly not the loss function); merging device and container into one breakpoint system (a narrow desktop card and a full-width phone block dissociate in both directions — one name for two operations is the false-sameness error THESIS opens with); per-prop device overrides as the escape hatch (same rejection as in the §17 entry).

Kushagra, closing the colour discussion: "a few basic families are fine, so the middle ground." The framing that got there: Radix's per-button colour is mechanically identical to kookie's `tone` — attribute plus variable indirection — and the only real differences are how many scales ship (Radix pre-ships ~30, ~29.3KB gzipped by v1's own measurement) and whether the names are pigments or meanings. The middle ground keeps the closed set and the config-only widening, and adds a small colour-as-data vocabulary — tags, calendars, charts, badges — where the colour IS the information and a status name would be dishonest: **blue** (hue 250), **green** (hue 150), **orange** (pinned `#F76B15`). Cost measured at ~1.15KB gzipped per family; `Tone` now derives from the config instead of restating it (the audit lesson — a local union literal kept holes invisible to CI).

**The first green failed a law, and the law was right twice.** The state-separation law (hover/rest/press ≥ .035 L apart) rejected every green tried, at the same ~.03 regardless of input — a systematic wall, not a bad pick. The cause: dark-mode solids sit at the hue's cusp, and the state-excursion code's own comment says "the direction is chosen by which way affords more of that travel," but the code implemented only a cliff-edge flip (change direction when the preferred side cannot even reach hover). A hue parked at its cusp kept the short side and compressed both states. Red and purple never exposed the drift because their away-from-label side always affords the full excursion — the §2-style lesson again, this time *inside* the generator: a comment is not a law.

**The naive fix failed the other law, which is the finding worth keeping.** Choosing the longer direction unconditionally spends label contrast — toward-label travel dropped amber's active state to Lc 55 against its black label, under the 60 floor. The landed rule: the flip is **gated on the label law** — taken only when every flipped state still clears APCA (60, or 75 under `contrast="high"`). Green passes the gate with room (67+ on every state); amber can afford neither direction (away washes out below the separation floor, toward breaks the label floor) and therefore **cannot ship as a tone**. Both laws hold unchanged; membership in the tone set is what gives. Amber joins the day the generator earns it a designed exception, not before — recorded in the config beside its absence.

Rejected: pre-shipping a palette (v1's 29.3KB, walked away from on measurement); pigment names as the general API (the semantic core stays semantic; the basics are data-vocabulary, a different job); weakening either law to admit amber (the separation floor is the interaction-visibility promise, the APCA floor is the legibility one — a colour that needs a law bent is not a colour the system has yet); hue-authored orange (at hue 55 the generated solid cannot hold a clearing label; the pinned value passes everything, and a placed number that works beats a generated one that does not).

Kushagra, minutes after the emphasis ladder: "colour should be supported by text, just like button" — and, offered the cheap version (a coloured text is one colour per family) against the full one (every family carries all three emphasis strengths), he chose the full ladder. Both halves of the call were his; the shape it landed in is the system's.

**Semantic only, which was the other half of his question.** `tone="destructive"` says *error*; the theme resolves the pigment. Radix's Text takes any of thirty scale names, and that is precisely the API §7 forbids — a component that names a colour cannot be rebranded by config, and the working non-negotiable ("components expose tone/emphasis/material, never raw fills") would be dead the day type violated it. Future statuses (`success`, `warning`) arrive as generated tone families when a component forces them, and Text gets them for free because the prop is the family set.

**The ladder could not be scale steps, and that finding shaped the mechanism.** Neutral's three rungs are designed steps (12/11/10) because a gray scale has twelve grays. A chroma family has exactly one designed text colour: step 11. Step 12 is the high-contrast variant — loud destructive resolving to it would render an error in near-black maroon, when the entire point of `tone="destructive"` is that the error reads *red* — and steps 9/10 are the solid fills, *more* vivid below the text step, not less. So a chroma family's loud ink is 11, and the lower rungs fade the ink itself: `color-mix` toward transparent, the material mechanism (§10) applied to text. New roles `--{tone}-ink/-ink-muted/-ink-faint` join the tone indirection; the type layer re-scopes the three foreground roles onto them in one `[data-tone]` block that names no family. Neutral's inks equal the tone-less roles exactly, so `tone="neutral"` and no tone are one ladder — law-tested, because two ladders one step apart is the kind of drift nobody notices until a screenshot does.

**A tone stamps only when chosen, and an explicit tone survives the loud-surface collapse.** The collapse protects text that never chose a colour; a call site that puts red text on a solid blue banner asked for exactly that, and the escape's own rule applies — a choice spelled at the call site is the call site's to defend. (The general answer to colour-over-fill legibility remains §10's deferred brightness-floor branch, not a per-case swallow.)

Rejected: one ink per family (the recommendation on the table; lost to the axis's own promise — a rung that exists for neutral and silently vanishes for accent makes emphasis conditional on tone, §2's additivity broken at the API instead of the stylesheet); raw colour names on Text (Radix's thirty-name prop; §7's autopsy); scale-step lower rungs for chroma families (step 10 is a solid — "faint red" via steps selects a *louder* colour); the alpha ramp as the fade (a-steps match their solid's appearance by construction — an a11 line looks like 11, which fades nothing).

Kushagra, hours after Text shipped without it: will Text have emphasis — "a low grayish text vs strong"? The morning's ship had answered no ("no tone, no emphasis; decoration is the call site's `style` against the role tokens"), and the question exposed that answer as a category error of the polite kind: muted body copy is not decoration. It is the second rung of a ladder the system already designed — every surface sets `--color-text` **and** `--color-text-muted`, the tone-forward rungs re-scope both — and the shipped API made the most common text treatment in any app ride the lawless escape.

**The resolution is the axis, not a new prop.** The precedent was already in the codebase twice: controls resolve `emphasis` as fills (§9), surfaces resolve the same three rungs as dressing (§10). Type is the third resolution — foreground roles: loud reads `--color-text`, medium `--color-text-muted`, quiet a new `--color-text-faint` (v0 at neutral-10, awaiting the eye like every placed value). One axis, one vocabulary, three layers each answering it in their own terms — versus a `muted` boolean, which was the recommendation on the table and lost because it would have been a ladder wearing a boolean: the moment a third level exists (iOS ships four), the boolean is API debt.

**Text rests loud, the deliberate inversion of the control default.** §11's mantra — nothing loud by accident — ranks *actions*; a paragraph is not competing for a focal point, and full contrast is the accessible resting state for reading. The system's resting states now read as a sentence: surfaces rest quiet, controls rest medium, text rests loud — each layer's safe default is the opposite end of the same axis, for its own reason.

**Two placed choices carried in the same commit:** quiet is below body-copy contrast by design (a timestamp, a placeholder — never a reading-length line, the call site's law, same shape as §16's "size 1 below the touch target is a choice, not a defect"); and on a loud surface all three rungs collapse to `--tone-contrast`, because the APCA-chosen contrast is the one colour guaranteed against a solid tone fill — legibility over hierarchy, made a law rather than left as an accident of the re-scope.

Rejected: a `muted` boolean (a ladder wearing a boolean; the role layer already had two rungs and iOS's four says the count grows); "strong" as a rung (already spelled twice — `weight` prices it, `render={<strong/>}` means it; a third spelling would drift); a text-specific union name (`variant`, `hierarchy` — the axis exists, renaming it per layer is how one idea becomes three APIs); keeping the style escape as the API (semantics spelled where review sees them is the thesis, and `bordered` on Button set the precedent for a role-reading modifier).

## 2026-08-04 TextField: the second control costs 247 bytes, and three "exactly one" claims turn out to be stale

Repetition begins, and the point of going second is that the additivity claim finally has something to compare against: **+247 bytes gzipped for a whole control**, against the +1,206 Button paid to create the layer. The size index, the emphasis-free skeleton, the disabled remap, the states and material all arrived from `recipes.css` untouched. That is §2 measured rather than asserted.

**What is genuinely new is the wrapper, and it is what makes slots legitimate here after Card refused them.** A field that holds an icon inside its border cannot keep that border on the `<input>`; once a wrapper owns the border it owes three things no consumer can compose from outside — clicking anywhere lands the caret, the input yields to the slots without breaking `::placeholder` or selection, and an interactive trailing control keeps its own press. That is the anatomy criterion (LOG 2026-08-04) doing real work in both directions: it refused Card's title/footer because nothing non-visual forced them, and it grants a field two slots because the border's position does.

**Decisions closed:** no `emphasis` and no `tone` on a field — loudness ranks actions against siblings, and a form where one field is louder than the next names nothing (the Card argument, arriving at a control). Construction (filled vs outlined) is an app identity, not a per-field knob. Validity is state, never a prop: `data-invalid` inside a Base UI `Field`, `aria-invalid` standalone, and the remap went into the SHARED layer because Select and Combobox can be wrong too. Focus rings on `:focus-within` — a field's focus is a mode, not a keyboard affordance; you do not press a field, you enter it.

**The adversarial audit's real yield was three claims that had gone stale without anyone editing them.** "Exactly one `box-shadow` in the system" (§10) — already about to be false, and the law that guarded it counted occurrences in *one file*, so a second element legitimately needing depth made the doc wrong and CI silent. "One ring, defined once" (§8) — already false since card-as-button shipped a second ring, months before TextField added a third. "Cursors: three states" — four. In every case the doc's number was a count of something the law also counted in one place, which is the same failure the 2026-08-03 audit named one level down: **a law that counts occurrences in a single file proves nothing about a system.** Both laws are now rewritten to walk every shipped stylesheet and assert what actually matters — every focus rule resolves the same three ring tokens, every `box-shadow` resolves `--kui-surface-chrome` and never reaches past it to the palette — and both were mutation-checked before being trusted.

The audit also found the interactive-element list written twice, in the click handler and in a CSS `:not(:has())` guard, already disagreeing about `textarea` and `[tabindex]`; the guard turned out to be unnecessary (a control inside a slot paints its own label colour) and was deleted rather than synchronised. And the icon-box rule had been copied into the component because the shared selector is `.kui-control > svg` and a slot's icon is a grandchild — the copy is gone and the shared rule now covers `[data-slot] > svg`, which is what makes `data-slot` a system convention rather than dead output.

One defect found by hand rather than by any auditor, because it needs a device: **iOS zooms the page on focus for any input under 16px**, which is sizes 1 and 2. Recorded in the open list unfixed — the fix (a 16px floor under coarse) trades away the promise that size-2 type is size-2 type, and that is a taste call.

Rejected: an `invalid` prop (nothing chooses to look invalid); a destructive focus ring on invalid — REVERSED 2026-08-04, and the reason given here was false: destructive clears the APCA floor in both modes (55-65 against a floor of 45), and the accent ring measured 6.4x the weight of the error border beside it; putting the invalid remap in the component (Select and Combobox wear it too); compound `TextField.Slot` children (arbitrary stacking, the shadcn header failure); label/description/error parts (Base UI's `Field` already does the `aria-*` wiring, and the labelled arrangement is a block).

## 2026-08-04 The icon-label gap joins the label cluster, out of the density sets

Kushagra, reading the rebuilt card demos: the gap between a button's icon and label should not be controlled by density. Correct by the axis's own definition — density grows the box and holds the content, and the system already said so twice without noticing the third instance: type never takes density (the whole point of the axis) and the icon box is explicitly "size-indexed, but never density-indexed" (a perception floor). The gap that binds those two is part of the same **label cluster**; a compact button squeezing icon against label was the content moving when only the box should.

`gap` leaves the density sets. `controlGap` is size-indexed, declared once at `:root` and re-declared per pointer world — fine 4/8/8/12, coarse 8/12/12/16, because the coarse box is a full size step larger and the cluster spreads with it (§16's designed-set values, preserved exactly). Density blocks no longer declare it, which IS the invariance, law-tested: same 8px gap at every density, 12px under coarse. CSS shrank 21 bytes; the ratchet was re-recorded downward.

Preview, same session: title + description became one coupled text group (tighter to each other than the group sits to the actions — two nested Stacks, the block pattern), the card-as-button demo got the same structure it had missed, and the first render exposed a real footgun worth remembering: **a `kui-box` is an inline-size container, so in a shrink-to-fit context (a flex column with `align-items: flex-start`) its width cannot come from its contents and it collapses to nothing.** Stacks stretch; that is the default for a reason.

Rejected: making the gap fully pointer-invariant like the icon box (the coarse judged sets placed larger gaps and nothing argued against them — flattening would have been a silent v0 change smuggled inside a refactor); keeping identical gap rows in every density level as data (a set that never varies is a constant wearing a set's costume, and the emission would still invite divergence).
## 2026-08-03 The two escape axes nobody opened in a browser were the two that were broken

Found by an audit of the whole repo, not by use: `contrast="high"` resolved **no rule at all** in light mode, and `prefers-contrast: more` could **never fire** in dark. Both had shipped since the token pipeline landed, both were "covered" by tests, and neither could have been caught by the tests that covered them.

The mechanism is one line — the high-contrast block took `mode === "light" ? ":root" : '[data-appearance="dark"]'`. `:root` only ever matches `<html>`; Theme renders a div. So light stamped `data-contrast="high"` onto an element no rule could see, while dark worked *by accident*, because its scope happened to name a second attribute that Theme co-locates on the same node. The platform signal failed the mirror-image way: the guard `:not([data-contrast="normal"])` was correct, but Theme stamped a defaulted `normal` on every node, so the one element carrying `data-appearance="dark"` always also carried the attribute that excluded it. The same sweep found the third member of the family: light colour tokens lived only at `:root`, so `<Theme appearance="light">` inside a dark app rendered fully dark — `light` and `inherit` were indistinguishable, and only the dark direction of a nestable axis actually nested.

**Why it survived: every law asserted one indirection short of the thing that could be wrong.** `theme.browser.test.tsx` asserted that `contrast="high"` *writes its attribute* — which it always did, correctly, while resolving nothing. The preview did exercise light high-contrast and did show it working, because the page toggle stamps `document.documentElement.dataset.contrast` by hand and `:root` matches `<html>` — so the one place a human looked was the one place the bug could not appear. The generator already knew this failure mode and carried three comments about it ("an escape that does nothing is not an escape") on density, radius and pointer: the three axes that had been debugged by eye. The fix had been applied per incident and never turned into a rule.

The same sweep caught the identical shape one layer down, in the values rather than the scopes. `contrast="high"` re-declared `--tone-solid-hover` and `--tone-solid-active` but not `--tone-solid`, on the assumption that re-declaring step 12 would carry the role with it — but the role is baked as a *literal*, not `var(--tone-12)`, so rest stayed at its normal-contrast value while hover and active moved beneath it. The neutral loud button pressed **lighter** than it rested, on the opposite side of hover, reachable with no prop at all through `prefers-contrast`. The law that should have caught it compared two `Scale` objects in memory — true in JS, and never once checked against the stylesheet. It now reads the emitted declaration text and applies the high block over the base the way the cascade does.

**The rule now:** an axis is proven by a law that reads a *computed token* through a mounted `<Theme>`, in both appearances, or the *emitted declarations* where the question is what the generator wrote. Attribute assertions are kept, but they are no longer the proof. Theme stamps `data-contrast` only when the axis was actually chosen — a defaulted value is not a choice, and writing it opts the user out of an accessibility signal they never declined. Light gets its own `[data-appearance="light"]` block, so both directions of the appearance axis escape.

Rejected: leaving light on `:root` and having Theme also write to `documentElement` (a component that reaches outside its own subtree cannot nest, and two Themes would fight over one attribute); dropping the `:not()` guard so `prefers-contrast` reaches everything (it would override an explicit `contrast="normal"`, which is a real opt-out, not an absence); a single `:where(:root, [data-appearance="light"])` base (zero specificity loses the tie to the dark block inside a dark subtree).

## 2026-08-04 Material becomes a fill modifier — the white veil dies in hours, colour survives the glass

Supersedes the fill model in the entry below, same day, on Kushagra's question after seeing the neutral glass: colour has to survive material — and "if the veil can tint with neutral, why can't it tint with whatever colour the button's fill already is? Why complicate?" He was right, and the correction dissolved the entry-below's central rule rather than patching it. The white veil was never "neutral tinted" — it mixed the *page* colour (`--neutral-1`), a third colour the material chose for itself. The category error mirrors the one that killed the alpha shell (LOG 2026-08-04, below): material had quietly become a fill, when its whole job is modifying one.

**The model: material makes whatever fill the component would have painted translucent at the thickness alpha, and adds the filter — it never names a colour.** Rungs publish their fills as sources (`--kui-fill-src[-hover/-active]`, `--kui-sf-fill-src`); the painted value reads through a fallback chain that collapses to the rung's value when no material is on; material re-derives every state as `color-mix(src, alpha)`. The alphas stay the designed `[rest, hover, active]` ladder; the tokens they were baked into (`--material-*-fill`) are replaced by bare alpha tokens applied at the point of use. Everything the first cut special-cased falls out for free: tone and loudness both survive (loud accent glass is translucent accent-9; "loud sleeps" lasted one commit), quiet glass is bare blur (the absence of a fill, frosted), the rung keeps its own label pairing (`--tone-contrast` stays paired to a fill that is still there, merely translucent), and the label re-scope to `--tone-label` is deleted. The opaque environments (no backdrop-filter, reduced transparency) become the fill nearly sealed at the fallback alpha — a 30% veil defends nothing without blur.

**Surfaces are the same law one level up, and Card is its special case, not an exception:** the quiet rung's source is the opaque seal, and the seal at the thin alpha *is* the old page-coloured glass — Card never visibly moved. Tone-forward surfaces (Callout, Banner) will tint their own veils the day one floats, with no second material table. The interactive surface steps re-derive too, fixing a latent quirk the first cut inherited: a glass card-as-button flashed opaque `--color-surface-hover` under the pointer. New leak found and guarded: the derived fills (`--kui-sf-fill*`) now exist only on material surfaces and would inherit into nested plain cards — `@property inherits: false`, the border guard's lesson, third instance.

Rejected: the white veil with tone on the label (shipped for hours; erased the axes and made the material a fill); a tinted-glass second table (the modifier gets tinting free — a second table is the tone × material product by another name); label re-scope to `--tone-label` under glass (the rung's fill is still there; thin-over-bright-photo legibility is the deferred brightness-floor branch's job, not a label swap); keeping the veil neutral for the *fallback* only (one model per law — the fallback is the same mix at a higher alpha).

## 2026-08-04 Material returns to Button: glass owns the fill, tone rides the label

The standing debt from §14 step 5 ("material deliberately does not ship on Button") comes due: Card proved §10's recipes against the photo backdrop, so the axis extends to the control layer. What was genuinely open was not *whether* — §10 already said "available on any component that can float, buttons included" — but *how glass composes with the control machinery*, which has three fills and a designed label pairing where a surface has one fill.

The composition: **while a material is on, it owns the whole fill triplet, and the rung's dressing sleeps until it comes off.** The rung fills were designed against the page; glass is designed against an arbitrary backdrop, and the two do not mix — a hover that flashed `--tone-soft-hover` over glass would be the page's answer to a question the photo asked. Interaction instead steps glass's one ramp, the mix percentage: each thickness carries designed `[rest, hover, active]` alphas moving toward the seal (§8's +1/+2 rule translated), monotone per column so thickness reads as one dimension mid-interaction. The filter never moves with state — a blur change re-samples the backdrop and shimmers. The label re-scopes to `--tone-label`: `--tone-contrast` is APCA-paired to `--tone-solid`, a fill that is no longer there, and the neutral glass takes the label token — so tone still reaches a glass button, on its label, which is iOS's own answer (tint the symbol, not the glass). In the opaque environments (no `backdrop-filter`, reduced transparency) the fill is the near-opaque fallback and hover/press read the seal's own steps (`--color-surface-hover/-active`) — the fallback is the seal's neighbour, so it responds like the seal.

Mechanically: the material block lands in recipes.css (the shared layer — every control that will ever float reads it), three-environment shape copied from the surface layer; `Material` moves to button.tsx and Card imports it, so types flow one direction; `button.css` still names no axis, material included, law-tested. The loud-under-glass consequence ships to the preview for judgment ("loud sleeps") rather than being reasoned about.

Rejected: tinted per-tone glass (a tone × material product the token layer never pays, and the platform tints symbols, not glass); keeping the rung's label and branching on backdrop brightness (that is §10's deferred brightness-floor mechanism — it arrives designed, not as a side effect of a prop landing); gating material by emphasis or per component (axes never select against one another; the library defines what material looks like, never where it goes); stepping the blur for hover feedback (re-sampling shimmer).

## 2026-08-04 The surface corner takes the size index, and the preview stops breaking the system's own law

Two catches from one screenshot of the padding-index row, both Kushagra's.

**Surface radius follows size now.** Every Card wore radius step 6 flat, on the §6 premise "a card has no size index" — a premise that quietly died the day Card grew a size index for padding, and looked wrong the moment four sizes stood side by side. The surface band widens from two steps to four plus the overlay (palette 0-10: control 1-5, surface 6-9, overlay 10), and `--radius-surface-1..4` becomes size-indexed picks, joined by the surface size join in surfaces.css. Placed rules: size 3 anchors at each level's old flat value (small 8, medium 16, large 24) so the default card never moved; `full` still caps the band at large's values; **density never touches a surface corner** — density reaches a card through padding, the corner follows size alone. Fixing this surfaced the third instance of the substitution-at-declaration bug: `--radius-surface` lived only in `:root`, so a nested radius Theme re-priced the palette and cards ignored it. The surface semantics now re-declare inside every `[data-radius]` block, the default level's included (the escape lesson, radius axis this time), and a mounted law pins a nested small Theme's card at 8px.

**The preview was violating the no-margin law in its own demos** — card bodies pushed with `margin-top`, demo rows with inline flex-gap strings — "the biggest blunder we could make," and correctly so: the preview is the system demonstrating itself, and a demo that spaces by margin documents the exact habit the system forbids. Every demo distance in the surface section now goes through `kuiBox` — the real resolver, emitting real `--layout-space-N` references — so the demos are Boxes with flex and gap all the way down and follow the density select like any consumer's layout would. Heading rhythm inside the section rides the same stack gap, margins zeroed.

Rejected: surface radius per density (padding already answers density; a second mover on the corner has no semantic); reusing control-band steps for small surfaces (at `full` the control band is 9999 — a size-1 card would become a lens, which is the exact case the disjoint bands exist for); a bare `--radius-surface` kept as an alias (two names for one thing is how drift starts).

## 2026-08-04 Layout space: the rhythm becomes a semantic layer, hours after the per-family fix

Kushagra, immediately after surface padding got its own density sets: if `gap="4"` does not answer density, the index is a unit conversion — "what's the point of writing gap = 4 if it's absolute too, when the user could have written 16px?" The analogy he reached for is the system's own logic: contrast does not change which role a component reads, it changes what the role resolves to. Layout props had no role layer to re-resolve — they consumed the palette raw — which is the actual reason density "couldn't" touch them.

**The layer: `--layout-space-N`, consumed by every distance BETWEEN things** — gap on Flex/Stack/Grid, Box `p`/`m`, and surface padding — with the default level a 1:1 identity map onto the palette and compact/comfortable re-picking steps from it (designed sets, section 12's shape). The palette itself stays untouched, which is the constraint that killed the obvious alternative: space is shared currency between layout and control innards, and control px/gap already answer density through the designed sets, so re-pricing the palette would compress a compact button twice and welding compensation into the density sets would end per-cell correctability. The boundary rule that falls out: **raw space = the palette plus the control family's picks; layout space = everything else.** This superseded the morning's per-family surface padding sets the same day — surface padding is now fixed picks into the layer (identical rendered values), one lever instead of two.

Placed choices in the v0: steps 1-8 shift one palette step per level; the gutter band 9-12 holds at identity, so section 12's original protection — compact must not collapse page gutters — survives as a designed choice rather than a prohibition. Pointer never touches the layer, extending section 16's judgment (a phone needs more content per inch, not less). Surface padding re-bakes inside every density scope — substitution-at-declaration, again. Cost: +108 bytes gzipped.

Rejected: re-pricing the space palette under `[data-density]` (double-applies to control innards; ends correctability); a separate Theme `spacing` identity knob re-pricing the palette, the radius-levels pattern (same double-application, plus a second knob for what density already means); shifting the whole curve including gutters (`p="9"` page margins collapsing 96 -> 64 is Radix's `scaling` coarseness re-admitted); coarse pointer re-picking the layer (nothing forced it, and the section 16 law says gutters hold on small screens).

## 2026-08-04 Surface padding takes density — the deferral closes on first sight of the gap

Kushagra, looking at the shipped Card: density does not move a card, "I mean it should." The question had been explicitly deferred in section 10's open list ("whether surface padding takes density — lands at Card"), and it closed the first time the gap was visible: a compact app whose controls tighten while its cards keep default air is half-adjusted, which is not what a density level means.

The mechanism is the one density already uses everywhere — a designed set per level, never a multiplier. `surfacePadding` becomes per-level step indices into the space palette, one step apart (compact 8/12/16/24, default 12/16/24/32, comfortable 16/24/32/40), emitted inside the existing `[data-density]` blocks; the space palette itself stays untouched, so compact still cannot shrink page gutters. No pointer cells: surface padding does not vary by pointer, and the single-attribute block matches under any pointer scope. Cost: +31 bytes gzipped, baseline re-recorded. The per-level steps are v0 values awaiting the eye, like every other placed number. The preview gained a page-wide density select the same commit — the density x size matrix keeps its pinned sections, because it is the axis laid out, but everything else on the page (cards included) now follows one control the way it would follow an app's Theme.

Raised in the same message and left OPEN, deliberately: whether `--radius-surface` should follow the size index. Today every Card size wears radius step 6; the config comment "surfaces have no size index" predates Card growing one for padding. Not decided here — it is a taste call on real screens, and the surface band would need more than two steps to express it.

Rejected: a density multiplier on the padding (the same reason density is not a multiplier anywhere: no cell would be correctable alone); putting surface padding into the control family emission (it is section 10's family, not section 4's — a surface has no height to own and the families should stay separately correctable); pointer-axis cells for surface padding (nothing varies).

## 2026-08-04 The shadow's home is the Theme, and Box learns it does not paint

Three corrections inside one afternoon, each Kushagra's: the palette values were rebuilt on researched geometry (negative spread is the sharpness mechanism — Tailwind's sm/md/lg verbatim, because the first two attempts were soft fog with short blurs and the reference card shadow was sharp); the `<Box shadow render={<Card/>}>` composition was judged "ugly, not for my system", which forced the real question; and the answer was the lever recorded a day earlier — **Theme `surfaces="flat" | "elevated"`**, an app identity beside `radius` and `density`. Named `elevated`, not `shadowed`: shadows are not semantic, sitting up is; row 2 is merely tonight's resolution of it.

The forcing argument for the Theme world over a Card prop: a per-card, four-value visual knob that nothing semantic drives is the elevation autopsy's exact profile re-admitted through the side door, ending in `shadow="2"` cargo-culted onto some cards and not others. One world rule dresses every surface on the element that owns the radius — which also kills the wrapper problem (a Box is a sharp-cornered rectangle; its shadow peeks past a rounded card's corners).

**Box's `shadow` prop died the same hour, on taxonomy:** "I thought Box is purely a layout component — why does it get to define shadow?" Correct; the prop was paint on a layout primitive, shipped for a day, and the honest escape was always `style` with the palette tokens. Laws now pin all three refusals: no shadow prop on Box, none on Card, exactly one `box-shadow` in the surface layer and it lives inside the `[data-surfaces="elevated"]` scope reading row 2.

Rejected: `surfaces="shadowed"` (names the resolution, not the semantic); a Card `shadow` prop (the side-door elevation axis); keeping Box's prop for convenience (layout components do not paint, and convenience was the argument for every leak the system has deleted).

## 2026-08-04 Taste gets its escape valve: shadows as a fenced resource, interactivity from the element

Kushagra, after the elevation deletion settled: where does visual taste come in — a card *looks nice* with a bit of shadow, but that is not everyone's taste. The resolution keeps the identity and prices the taste: KookieUI's surfaces are flat by system decision, and shadow becomes a **resource with a fence** rather than an axis. `--shadow-1..4` in the public contract — the system's one index shape, 1 the inset well (his call, over Radix's six), mode-aware, values only in config. No semantic component may read them, law-tested; the sole API is Box's closed `shadow` prop, the same tier as `m`: decoration spelled where review sees it. If the flat identity itself ever feels wrong on a real screen, the recorded lever is a Theme-level designed set — not a resurrection of elevation.

Card-as-button landed the same session, and its shape is the anatomy criterion applied again: interactivity is forced by something non-visual — the element — so the pattern is `render={<button/>}` and the surface layer keys on `:where(button, a)`. No `interactive` prop, no ClickableCard component. Rest pixel-identical to a plain Card; hover washes the seal (guarded), press steps instantly (unguarded), one shared ring; a button cannot nest a button, so HTML enforces the one-action-zone rule for free.

Rejected: six shadow steps (a menu, not an index); free strings on Box's shadow (`style` already exists for lawlessness; the prop's value is that it cannot be lawless); shadow props on Card or any semantic component; a data-interactive attribute (a prop restating what the element already declares); responsive shadow (no known use; the remap pipe is there if one appears).

## 2026-08-04 The alpha-nesting theory dies by eye, and the shell seals

The preview made two claims Kushagra caught as false in one screenshot: "three distinct levels" over a nesting demo whose levels were indistinguishable, and a "solid" card over a photo that had no background at all. One root cause: the shell's fill was `--tone-a1`, 1.2% alpha — too faint to differentiate nesting, too transparent to be a surface over media. His framing closed it: **why does a card have an alpha background — isn't that material's job?** It is. Translucency belongs to `material` exclusively; the alpha default was material's responsibility leaking into the shell.

§10's alpha-nesting paragraph is retracted rather than tuned: the theory ("stacked surfaces auto-differentiate by compositing") was written before a value existed and falsified when one did. At the neutral end of the ramp the effect is arithmetic, not perception — nested surfaces visibly separate by **border**. The shell now seals with `--color-surface` — and the first value was wrong for half a day: sealed at `--neutral-1` the card was page-coloured, i.e. invisible where it lives most, caught by Kushagra on sight. The seal is paper ABOVE the page: white over the #fcfcfc page in light, `--neutral-2` in dark (the Radix panel answer). "Solid" finally means solid over media, and the material cells became a true comparison. The alpha ramp keeps its one honest surface job: the tone-forward rungs (`--tone-a3`), where the fill carries chroma and is visible. `--tone-a1` left the role set.

The laws inverted with the decision: "the fill is translucent" became "the fill has no alpha channel in any spelling" (the first draft asserted `rgb(` and was immediately schooled by the P3 block resolving to `color(display-p3 …)` — test the property, not the spelling).

Rejected: darkening the alpha step until nesting reads (chases perception with arithmetic; the border already does the job); a seal at the page colour itself (an invisible card — the half-day mistake above); keeping a1 alongside the seal as an optional tint (1.2% buys nothing; a token nobody can see is budget without a job); a nesting demo at all (nested same-fill cards separated by borders demonstrate a border, not a mechanism — the law keeps the truth, the preview stops performing it).

## 2026-08-04 Card strips to a shell, and the anatomy criterion falls out

The elevation deletion kept going. Kushagra, in sequence: why does a Card have an emphasis ladder at all — a solid card is "a purely visual tool, which is what you did also" (the preview's own `loud accent` demo cell was decoration, which proved the point); then, after a five-slot anatomy (Header/Title/Description/Action/Footer) had been argued down to three (Title/Description/Actions), the sharper question — *why this layout and no other?* A titled card is one layout among many, and a system that blesses one is silently deprecating stat cards, media cards, profile cards. "Card is a block, not a component."

**The criterion, worth more than the component: anatomy is system-owned only where something non-visual forces it.** Dialog's title/description are forced by a11y wiring; Callout's by status semantics; nothing forces a Card layout. Layouts are blocks (kookie-blocks), built from the shell plus Text/Heading/Flex when they exist. So Card is `size × material` and children — one fixed treatment (neutral quiet alpha + border) written as constant data attributes, resolved through the same shared layer, chosen by no one.

**The slot autopsy, recorded so it stays dead:** the header Action slot died first (its legitimate tenant is card-object operations — dismiss, overflow — whose components don't exist; shipped early it gets squatted by task actions, which is shadcn's own login demo putting Sign Up top-right against its own footer buttons). Header died with it — a wrapper with no horizontal relationship left to lay out. Footer died by name: positional names attract positional tenants, Apple's `Section(footer:)` already means fine print, and the semantic name was Actions. Then the whole trio died as anatomy, by the criterion above. What survives anyway: the one-task-action-zone rule as the documented pattern, and the foreground-context roles, which Dialog and Callout's *forced* anatomy will consume.

**Also named:** on controls, `bordered` genuinely is part of the emphasis ladder — the composed cells reproduce v1's five variants exactly — and §10's containment framing was half true. The prop stays; the reading changes.

Emphasis/tone/bordered props deleted from Card; a `@ts-expect-error` law pins each refusal. Apple as the external check: no Card component exists in SwiftUI — `GroupBox` and inset `Section` ship one fixed treatment, materials are the real axis, card-ness is composed.

Rejected: five surface-emphasis rungs (folding border in); demoting `bordered` to a system-owned ingredient on controls (Button needs its ladder public); a `Card.Content` wrapper (padding lives on the shell, so content is just children); `Card.Media` (full-bleed is its own design problem, buildable from tokens meanwhile); shipping anatomy slots that a block can express with three primitives.

## 2026-08-03 Elevation dies on first sight, and it was never an axis

Kushagra, on seeing the v0 shadow ladder rendered: shadows for elevation is a no go — and then the sharper question, "why does our card need any elevation ladder?" It doesn't. The post-mortem matters more than the deletion: **nothing ever chose elevation at a call site.** §11's own defaults table fixed it per component — a Card was always `raised`, a Menu always `floating`, a Dialog always `overlay` — and a prop that nothing varies is a component fact wearing a prop's clothes. §9's rule (axes are derived, not assigned) should have caught it before a preview had to.

What replaces the ladder costs nothing. In-flow surfaces separate by border and fill — the alpha nesting demo already proved three levels of depth with one token and no shadow. Detached components design their own detachment when built: Dialog's separation was already specced as its backdrop scrim (§11), and whether a Popover needs anything beyond border + opaque fill is a judgment for when a Popover exists, made against a real backdrop.

Deleted: the shadow tokens, the `elevation` prop, the ladder rules, and the preview block that displayed them — an hour after they shipped. A law now asserts the surface layer names no shadow and no elevation. The budget gave back 164 bytes.

Rejected: keeping shadows for the overlay tier only (the components that need separation get to design it, and pre-buying a shadow scale for them repeats the same over-modelling); elevation-as-fill-lightness (dark-mode convention, but it collides with the emphasis rungs which already own fill); keeping the axis with all levels resolving to nothing (a rung that is not visibly distinct is not a rung — §9's own words).

## 2026-08-03 Card lands as pure data attributes, and the surface layer is recipes.css one level up

§14 step 6, closing the first vertical slice. The measurement: **+590 bytes gzipped for the entire surface world** — shadow ladder, material recipes, foreground context, the surface rungs — and the additive claim now has its limit case: **Card ships not one line of its own CSS.** There is no card.css, and a law asserts the file does not exist; the component is data attributes over the shared layer, so Panel, Callout, Popover and Dialog will each cost the same nothing.

**Decisions made on contact:**

- **Surface rungs resolve through the alpha ramp, controls through solid steps — same axis, two dressings.** Quiet is `--tone-a1`, medium `--tone-a3`, loud the solid. §10's nesting argument decided it: an alpha fill composites over whatever is behind it, so three nested quiet cards differentiate with one token and no per-level colour math. `a1`/`a3` joined the tone indirection roles, so a medium destructive Callout is a data attribute, not a colour.
- **Foreground context is two new roles, not a mechanism.** `--color-text` / `--color-text-muted` exist at :root as neutral 12/11; tone-forward rungs re-scope them (`medium` → `--tone-text`, `loud` → `--tone-contrast`). The law that matters: the surface re-scopes only the foreground roles, never the tone indirection — a neutral Button on an accent card is still a neutral Button, asserted mounted.
- **The surface world is emitted per mode**, because a var() resolves where declared — `--color-text` baked at :root would carry light neutral-12 into a dark subtree, the same lesson `--focus-ring` taught.
- **Material's three environments are cascade order, not logic**: near-opaque fallback first, the real recipe under `@supports (backdrop-filter)`, `prefers-reduced-transparency` last so the accessibility override wins. A law pins the order.
- **Bordered is genuinely shared:** the surface skeleton reads the same `--kui-border-color` the control layer's `[data-bordered]` rule sets — containment is defined once for the whole system.

v0 taste shipped for judging in the preview, same contract as the coarse numbers: the shadow recipes (two-layer, higher alphas in dark because a dark page swallows shadow), surface padding on the size index (12/16/24/32, default 3 = 24), and §10's material table against a deliberately hostile gradient backdrop.

Rejected: Base UI for Card (nothing behavioural to buy; Box's cloneElement render pattern is the house style); opaque step fills for surfaces (kills nesting, §10 already argued it); a separate surface state machine (interactive surfaces reuse the control one when they arrive); shipping a card.css for symmetry (an empty file is a place for drift to start).

## 2026-08-03 Button meets a real phone, and three settled answers reverse

Every defect in this entry was invisible in desktop Chromium, including its device emulator, and each was found by Kushagra on hardware — a preview on an actual iPhone falsified more of §8 in an evening than the test suite could. The suite asserts what the stylesheet *says*; only a device says how it *feels*.

**"Applied uniformly" was wrong, and the correction is a designed asymmetry.** The canonical transition promised every state change at the same 120ms. On a phone the button read as dead: a tap lasts ~60ms, so an eased press never reaches its colour before it starts returning — a mouse hides this because a click holds the button down through the ramp. Press now lands instantly (`transition-duration: 0s` on `:active`) and release eases, which is also how native controls behave. Second touch defect, same session: unguarded `:hover` left tapped controls stuck in their hover fill, because touch synthesises hover on tap and holds it — every hover rule now sits under `@media (hover: hover)`, and `:active` deliberately never does, since on touch it is the only feedback there is. The hover law initially *passed against a comment* — the prose explaining the guard contained ":hover" — so the law now strips comments first: a law a comment can satisfy is not a law.

**The cursor reversal.** §8 had chosen the arrow on native-platform-parity grounds. The argument did not survive the medium: on the web the hand means "this responds" — a convention old enough to be a human factor rather than a style — and every system a consumer has used shows it. Now tokenised as a designed set: `pointer` at rest, `progress` while loading (busy, not frozen — `wait` overstates), `default` when disabled (the hand promises a response the control will not give; `not-allowed` scolds). The loading cursor also fixed the blocking mechanism: `pointer-events: none` stops hit-testing, and an element that takes no pointer events shows no cursor, so activation blocks through the disabled attribute instead.

**The Spinner stopped being clever.** The border-trick arc (one element, no SVG) was the spec's pride and was rejected by eye; the conic-gradient replacement failed structurally, because a conic gradient cuts angular wedges and the native idiom is parallel-sided bars. Wrong primitive, not wrong tuning. It is now twelve static SVG spokes rotated as a whole by a `steps(12)` keyframe — the tick from spoke to spoke *is* the look — still zero JS, one composited transform per frame, `currentColor` for free.

This audit also closed §Open's "how does quiet render" (bare at rest, decided at the first real Button as planned) and caught the disabled cursor as genuine doc-code drift: the spec said arrow, the stylesheet still showed the hand. Fixed in CSS with a law, not by amending the doc — the doc was right.

Rejected: guarding `:active` alongside `:hover` (removes the only feedback touch gets); `not-allowed` on disabled; `wait` while loading; keeping the eased press with a shorter duration (any ease loses a race with a 60ms tap; the asymmetry is the fix, not the number).

**Superseded the same day, by Kushagra: transitions are zero until the motion system exists.** The 120ms transition and the press asymmetry were shipped without approval, and taste-level decisions are not the implementation's to make. All transitions removed — every state change instant on both pointer worlds, motion tokens wired but unread, a law asserting the recipe layer names no `transition`. The press finding survives as a constraint handed to the future motion system: whatever lands, press stays instant. The hover guard and `touch-action` stay — they are input-hardware correctness, not motion.

## 2026-08-03 Button lands, and the additivity claim stops being an argument

§14 step 5. Base UI behind the Kookie surface — it supplies the `<button>` semantics, keyboard behaviour, `data-disabled` and `focusableWhenDisabled`, and every visible decision stays ours. First runtime dependency in the package.

**The measurement the step exists for: +1,206 bytes gzipped for the entire control layer**, 8,105 against a 40,960 ceiling. The decomposition is the actual result — `button.css` is about 480 bytes and contains three declarations, because everything that varies lives once in `system/recipes.css` and is shared by every control that follows. The second control costs its structure and nothing else.

**Byte counts cannot prove additivity, so laws do.** A measurement tells you today's number; what tells you the *shape* is that a component's stylesheet names none of the axes. `button.css` may not contain a tone, a rung, a size index or a colour token, and the recipe layer may never select one axis against another (`[data-emphasis="loud"][data-tone="accent"]` is the exact rule that starts the multiplicative slide). Both are asserted. The tone indirection is generated from the tone list, so a fourth tone is a config line, not a CSS edit.

**Two things changed on contact.**

The Spinner's 2px ring sat *outside* its 16px box, so a loading button rendered 4px wider than the same button at rest — the zero-shift promise falsified by a `box-sizing` default, caught by the law that asserted it. And the focus ring named `--accent-solid` directly inside the shared layer, which made the "a rung names no family" law fail for a good reason: the ring genuinely is always accent (§8), but writing that in the recipe layer leaks a family into the one file that must stay tone-blind. `--focus-ring` is now a generated role token, re-declared per mode because a `var()` resolves where it is declared.

**Disabled is a tone remap, and that turned out to be better than the spec's wording.** Rewriting `--tone-*` to a flat neutral rather than forcing `--kui-fill` means every rung keeps its own shape while going flat: a disabled quiet button stays bare instead of growing a fill it never had at rest. Same reason opacity was refused — the state should be a designed pair, not a filter over one.

**`material` deliberately does not ship on Button.** §10's recipes are v0 pending measurement against real backdrops, and §14 assigns that proof to Card. Shipping unmeasured glass to hit a table row would be exactly the false precision this project keeps catching.

Rejected: a wrapper element for icon slots (`> svg` sizing plus `--kui-icon` costs no DOM, and minimising layers was the explicit constraint); a paint layer inside the control (the reserve it existed for was already deleted); hiding the label while loading; per-component emphasis rules.

## 2026-08-03 44 was never the floor, and dropping that error removes a mechanism

Kushagra, reading the coarse matrix: a coarse compact size 1 at 32px is a *conscious* design choice, a consumer reaching for size 1 is doing it deliberately, and raising it to 44 to satisfy a floor destroys the reason they reached for it. Correct — and checking the premise made it stronger than a compromise.

**WCAG 2.2 SC 2.5.8 *Target Size (Minimum)* is 24×24 CSS px at Level AA.** That is the enforceable requirement. The 44×44 number is SC 2.5.5 *Target Size (Enhanced)* at Level AAA, and Apple's HIG figure. §16 had been written treating AAA as the locked floor, which is the "false precision" failure THESIS §4 names — asserting a stricter standard than the evidence supports, and then building machinery to satisfy the overstatement.

Refiled by tier: **24 is locked** — no designed cell in any pointer world at any density may cross it, and the system's smallest control (fine, compact, size 1) sits at exactly 24. **44 is the opt-out default** — default density, size 2, coarse, which is what a consumer gets without choosing anything. Going below takes two deliberate acts: asking for size 1, or setting a denser theme.

**The consequence is a mechanism deleted.** With both guarantees carried by the designed geometry, no control needs a layout box that differs from its painted box, so no control needs a second element to paint into. The `max()` reserve is dropped; Button is one element plus its content slots, which is what "minimise layers" actually requires. The reserve only ever earns its keep for something whose visual size is genuinely below 24 — a Checkbox glyph — and that is a Checkbox decision.

Two laws replace it: every cell clears 24 in both worlds, and the default path clears 44 in geometry alone.

Rejected: raising coarse size 1 to the floor (erases the size index exactly where someone reached for it); a per-control `max()` reserve (a runtime mechanism compensating for a misread standard); keeping 44 filed as tier 1 (it is a target, not a requirement, and calling it locked would make every deliberate small control a violation).

## 2026-08-02 The pre-Button states close, and loading refuses to eat the label

Four of Button's five gates decided in one pass (§8, §4); motion deferred to its own discussion without gating — Button ships on §8's single canonical transition.

**Focus is one ring, always accent.** `:focus-visible` only, `outline` (follows radius natively, pills included, cannot move layout), offset 2, and the colour does not follow the control's tone — "where is focus" is one question system-wide, and Spectrum, Radix and Primer all landed on the same answer. The 3:1 adjacent-contrast requirement is a law, not a hope.

**Disabled remaps roles; opacity is refused.** Opacity is the industry shortcut (Material's 38%) and it stacks on tinted surfaces, silently voiding every generated contrast guarantee. The neutral remap keeps a designed, testable pair. Cursor stays default: `not-allowed` scolds, native platforms don't.

**Loading keeps the label, reversing Polaris/Primer.** Kushagra's call, and the reasoning is better than the industry pattern: a button that loses its label stops saying what it is doing. Spinner replaces the icon when one exists (same box, zero shift); otherwise it joins the label, and the slight width change on text-only controls is the named, accepted cost. Spinner itself is deliberately primitive — one element, border-top on `currentColor`, one rotate keyframe, no SVG, no JS — because performance is the system's first constraint. Under reduced motion it slows rather than stops; a stopped busy indicator is information lost.

**Icons are slots, not a dependency.** `--icon-size-1..4` = 16/16/20/24 (sizes 1-2 share 16: the ecosystem's grid has nothing legible below it). Hugeicons is the blessed set, installed by the app and the docs, never shipped by the library — a bundled set is dead weight, an update treadmill, and a licence surface. Only the box is pinned; the icon system proper stays open.

Rejected: label-hiding loading (above); a per-tone focus ring (two questions in one signal); `not-allowed` cursor; opacity-based disabled; shipping hugeicons as a dependency; a third motion duration nobody has ever justified.

## 2026-08-02 The preview finds the edge the laws could not state: the outermost Box has no tier context

Steps 4 and 4b shipped (Flex/Stack/Grid, the coarse cells, the Theme `pointer` prop), and building their preview rigs surfaced a constraint no string or mounted test had a reason to probe: **a tier reads the nearest ancestor query container, and a Box is a container for its children, never for itself.** The rigs' outermost Box sat at one column at every width — correct per spec, useless per intent. Every browser law had wrapped a Box in a Box, so the suite was structurally incapable of noticing; the demo built for human eyes found it in one render. A law now pins the edge, §2 documents it, and whether Theme's element should be a container (making "inside a Theme, tiers always work" the rule) is an open question gating Button.

Same arc, worth one line each: the coarse world costs +519 bytes gzipped for ~20KB raw of cells, which is the emission strategy's whole bet paying off; the preview page defaulted to no `data-pointer`, so the media-scoped `auto` path could never have fired on a real phone — sections now default `auto`, making a phone on the LAN the honest test of §16's default; and the fine escape must *re-declare* the fine sets, because a nested scope that declares nothing inherits coarse and escapes nothing.

## 2026-08-02 The pointer axis: touch is a second geometry, not a mobile mode

New §16, THESIS.md folded into the repo, and the pre-Button gate list grows to five. The frame that settled it: **fine and coarse are two complete designed renderings of geometry, the way light and dark are two complete renderings of color.** Same components, same index, same laws — different placed values. The signal is what touches the screen (`pointer: coarse`), never width: an iPad at 1024px gets coarse values at full desktop width, and a narrow desktop window keeps fine ones.

**The floor is locked; the geometry is an opt-out default; the numbers are taste** — the first decision to sort by THESIS §7's tiers end to end, which is most of why the tiers earned their fold-in. The 44px floor encodes twice: coarse height sets place most sizes at or above it by design, and a `max(44px, height)` layout reserve covers the sizes that deliberately stay small, so size 1 and size 2 remain distinct instead of both flattening to the floor. Reserving layout space instead of overlapping neighbours is what dissolves the collision problem that killed hit-area expansion. Opt-out is a Theme prop symmetric with appearance — `pointer: fine | coarse | auto` — and pinning it doubles as the desktop preview mechanism.

**Spacing does not move, and that is the load-bearing exclusion.** Controls grow, gaps hold, layouts adapt on their own; a space palette that inflated under coarse would widen gutters on the smaller screen. Static surfaces hold too — but interactive surfaces (rows, list items, clickable cards) are §10's "ghost-emphasis control wearing a container", so they are tap targets and inherit the floor through machinery they already reuse.

**`min-height` replaced `height` in §4 on the way** — fixed height stays the design intent, but a hard `height` clips a 200%-text-resize label (WCAG 1.4.4) and truncates wrapped ones. Identical render in every normal case; growth only where the alternative is clipping.

**Corrected mid-arc, worth keeping:** the 17px mobile body figure was imported from Apple's *native* HIG as if it were evidence — the web ships ~16px bodies almost universally and iOS Safari doesn't honour Dynamic Type — so whether body text shifts under coarse (vs control labels only) stays open, and the type shift is not the growth mechanism anyway: under §4's model only the height token can grow the box, and both families re-place independently.

Rejected: rem-derived geometry from a root font-size switch (one root scales gutters and type together — a multiplier by the back door, on the axis we control rather than the one the user does; rem's real job, honouring the user's text preference, is a separate open question); the floor as `max()` on the height token itself (size 1 and 2 both render 44 and the index collapses); invisible hit-area expansion via pseudo-element (its safe extent depends on neighbour gaps, which CSS cannot read — the overlap failure is silent); responsive `size` as the mechanism (opt-in, so the floor depends on every author remembering — the exact inversion THESIS §7 forbids); width or breakpoints as a signal anywhere in the axis.

## 2026-08-02 An audit of the layout layer: the browser suite was testing the stylesheet, not the components

Swept the work from the token pipeline through Theme against the docs. The finding that matters is not any single defect but what the suite's shape was hiding.

**A browser test that hand-writes its own markup proves the stylesheet and nothing else.** Every one of the twelve browser laws mounted `<div class="kk-box" style="--kk-p: ...">` — the markup Box is *supposed* to produce. So the stylesheet was thoroughly proven and the entire React half was asserted nowhere: prop to custom property, token index to `var()`, tier key to tier var, the `render` merge, Theme's nesting and inheritance. It looked like coverage because the tests were about the right subject; they entered the system one layer below the part nobody had checked. Real components are mounted now, and the resolver has node laws of its own.

**The split between the two projects is itself load-bearing, in both directions.** `p={0}` emitted `var(--space-0)` — the palette starts at 1 — and rendered `0px` anyway, because an unset custom property falls back to the property's initial value and padding's is zero. No browser test could ever have caught it; only reading what the resolver *writes* shows a working token apart from a broken one. The mirror case is the one from the entry below: a stylesheet can be textually perfect and compute nothing. Bare indices are bounded by the palette now, and out-of-range digits pass through as raw CSS where a wrong value is at least visible.

**`layout.css` was generated, committed, and unlawed** while `tokens.css` had a drift test — so a hand edit to the half of the CSS carrying the responsive mechanism would have survived CI. Both are covered now, and both mutations were checked to actually fail.

**The type refused the ordinary conditional prop.** The package compiles with `exactOptionalPropertyTypes`, under which `Partial<Record<...>>` rejects `p={cond ? "4" : undefined}`. A type that turns the normal spelling into an error pushes people to the escape hatch, which is the opposite of what §3's whole enforcement argument depends on. `| undefined` is explicit now.

Smaller, all fixed: nine screenshot artifacts were committed, one of them from a debug test file that no longer exists (`__screenshots__` is ignored now); `config.ts` still carried the disjoint-bands-make-it-safe argument that the browser had disproven and §6 had already been corrected for; the docs spelled remap vars `--kk-gap` where the code writes `--kk-g`; and the entry below claimed §14 step 4 when only Theme had shipped.

Not fixed, recorded instead: **Theme shipped ahead of the dark-mode SSR decision**, which REVIEW.md listed as its gate. Nothing renders an app yet so the debt is invisible, and it comes due at `apps/docs`. Naming it beats quietly deciding the gate was never real.

## 2026-08-02 Box and Theme land, and the browser finds four things the string tests could not

§14 step 3 and the Theme half of step 4 — Flex, Stack and Grid do not exist yet, and the first version of this entry claimed the whole step. The responsive mechanism is generated from one prop table, Box is the engine and Theme scopes the tokens, and the suite gains a browser project because the claims that mattered most had been asserted in prose for days and verified nowhere.

**Every failure below was found by the browser suite within minutes of it existing.** Three of the four were invisible to a test that reads generated CSS as text, because the text was correct and the *engine* disagreed with what we thought it meant.

**A shorthand followed by longhands does not degrade the way it looks like it should.** `padding: var(--kk-p)` then `padding-block-start: var(--kk-pt)` renders 0 whenever `pt` is unset, because an unset custom property makes its declaration invalid at computed-value time and the property falls back to its *initial* value rather than to the earlier shorthand. Shorthands are expanded now, and the specificity of `pt` over `py` over `p` lives inside one var chain per longhand, where it behaves.

**Every Box was an inline element.** Same rule, worse blast radius: `display: var(--kk-d)` with nothing set falls back to `display`'s initial value, which is `inline`, not `block`. Width and height were ignored, block padding collapsed, and `container-type` does not apply to inline boxes — so no Box was ever a query container and no responsive tier could ever have fired. The prop table now carries an explicit fallback for properties whose CSS initial value is not the sensible default; `display` is the only one that needs it.

**And the one that invalidated an argument in the spec: a custom property reference is substituted where it is DECLARED, not where it is used.** `--radius-control-2: var(--radius-2)` in `:root` is baked to the default palette immediately, so a `[data-radius]` block further down the tree never reaches it — setting a radius level did nothing to control radii. The disjoint-band design was justified on the grounds that the two axes never write the same token and therefore compose; that reasoning was wrong, and only a browser could say so. The generator now emits every (radius x density) cell, which is exact because Theme writes both attributes on one element. Bands still earn their keep for `full` capping surfaces; they just were not sufficient.

**`"use client"` was being stripped by the bundler**, which the audit had warned about and the tsdown bump had not actually fixed: bundling merges modules and drops their directives, and the failure only appears in a consumer's RSC app. Output is unbundled now, and the build walks the source for directives and fails if any is missing downstream.

The mechanism itself: one prop table drives the resolver and the stylesheet, so a prop cannot exist in one and not the other. Cost is O(longhands x tiers) and does not move when tokens are added, because no value ever appears in the CSS. Tiers are container-keyed, three of them, semantic.

Rejected: a shorthand-plus-longhand emission (above); `banner: '"use client"'` on the bundle (marks every export a client module, including ones that are not); reading custom properties directly in tests (`getComputedStyle` hands back the unresolved token stream, so a probe has to actually use the value).

## 2026-08-02 Colour finishes: chroma against the boundary, P3, contrast, and a brand colour going in

Everything after the generator's first landing, in one entry because it was one arc: making the output actually look right, then making the section's headline claim true.

**Chroma was authored as absolutes, and they were wrong in both directions at once.** Every light step of every hue asked for more than sRGB holds and was silently clamped — so the curve did nothing through steps 1-8 and hold-L-reduce-C was doing all the work, which is the reverse of what §7 describes. Meanwhile the solid band asked for *less* than available: red sat at .17 where sRGB allows .254. Chroma is now a **fraction of what the gamut holds at that lightness**, and the per-tone knob is `vividness` from 0 to 1. Red gained 50%, green 29%, magenta 31%. The curve means what it says at every step, nothing is silently clipped, and P3 became a parameter rather than a rewrite.

**P3 ships behind `@supports`, layered over the sRGB values rather than replacing them.** It was worth the bytes precisely where sRGB constrains a hue most: cyan +31%, sky +25%, blue +22%, against indigo's +4%. Blue and sky had been sitting *at* the sRGB ceiling — 0.185 of a possible 0.187 — so their flatness was the gamut's shape, not an under-ask. The alpha ramp deliberately stays sRGB: its least-alpha solve assumes sRGB compositing, and surface nesting gains nothing from a wider gamut.

**`contrast="high"` is generated, and its claim is "as much contrast as each colour permits", not a fixed shift.** The first version asserted a uniform +9 Lc, which is the dangerous kind of law: insisting every band move is exactly what pushed yellow's borders below their cusp and turned them olive. Bright hues now take no border shift at all and gain in the text band, which is the one place the ladder structurally guarantees headroom. A band that stays put is the setting working; the only failure is a pairing that comes out worse. Both cases are asserted, so nobody later "fixes" the no-op.

**Six bugs came out of looking at the preview, and four of those were found by a law rather than by eye.** The pattern is worth keeping: each one was invisible until a law existed that stated the intent.

- The contrast token was recomputed per gamut, so P3's more saturated red tipped APCA to black — the same button rendered white-on-red on one display and black-on-red on another. Decided on the sRGB rendering now: the label is a design decision, not a per-display computation.
- A fixed interaction direction ("darken in light, lighten in dark") reasons against the background and therefore walks a fill *toward* its own label half the time. Dark destructive pressed measured Lc 59; every dark-labelled bright hue measured 53-55. Direction follows the label now, so hover and press are strictly more legible than rest.
- The excursion is bounded by **what the hue can hold**, not a fixed delta. Yellow was olive going down and washed out to near-white going up, shedding 54% of its chroma — a fill at its cusp is hemmed in on both sides. States now travel as far as they can while keeping 75% of the resting chroma, direction chosen by which way affords more of it.
- Neutral's states were 0.24 / 0.20 / 0.16 and read as one flat black. A low-chroma solid moves *toward* its label (the visible direction, safe because it started at an extreme) and takes a wider step, since a grey has only lightness where a hue also shifts saturation.
- The two state-widenings were multiplying rather than taking the larger, dropping dark neutral's pressed label to Lc 55.
- High contrast pushed dark neutral's step 12 past pure white. Found by the law being written for the bug above it.

**The intake landed last, and it is what makes this a system rather than a generator.** `toneFromColor` takes a CSS colour: hue as-is, vividness as the colour's chroma measured against what its own lightness could hold, and the input's lightness carried as a pin. Light mode reproduces the supplied hex **byte-identically at step 9**; dark mode re-derives, since no promise was made about a dark solid. Verified against Radix violet, Vercel blue, Linear indigo, Radix red and yellow, and a teal — and every one is put through the full legibility suite in both modes, because pinning that bought fidelity at the cost of the guarantees would make this a colour picker. Out-of-band inputs snap, and a near-black brand colour falls through the low-chroma path to a near-black solid, which is what it wanted. Generated solids also round-trip: any step 9 on the preview can be pasted back in as an accent to reproduce its own scale.

Final shape: 106 laws, 4,316 bytes gzipped against a 40,960 ceiling, for three tones in two modes with full alpha ramps, a P3 block and a high-contrast block.

Rejected: `apca-w3` as a dependency (thirty lines against a licence question on a value we ship); snapshotting hex values (a snapshot asserts the output did not change, never that it is correct); normalising vividness across the configured tones so hues read at equal intensity (it works, but adding a destructive red would then silently change how the accent looks, and action at a distance is worse than a documented asymmetry); compressing the state excursion rather than reversing it (a fill near its cusp can only go lighter by shedding chroma, so the pressed yellow stopped being yellow).

## 2026-08-02 The colour generator lands, and interaction states learn to move away from their label

§14 step 2b. Three tones in both modes generate from a hue angle and a chroma peak each, 2,102 bytes gzipped for the whole token file against a 40,960 ceiling. `culori` does the colour-space work at build time; APCA-W3 0.1.9 is implemented directly, thirty lines, so the contrast guarantee has no licence question attached to it. The browser does no colour maths.

**The law tests earned their existence three times before the generator was finished.** Each failure was a real design defect, not a wrong assertion, which is the whole argument for laws over snapshots.

**First: the dark text role missed its own target.** `--destructive-text` measured APCA Lc 57 on the soft fill it sits on, under the Lc 60 body-text bar. Fixed in the ladder, dark step 11 from .77 to .80, rather than by lowering the bar.

**Second, and the interesting one: a fixed interaction direction walks a fill toward its own label half the time.** §7 said darken in light, lighten in dark, reasoned against the *background*. But in dark mode lightening a solid moves it toward its white label — the destructive pressed state landed at Lc 59. The same fault in mirror image hit every bright hue in light mode: yellow, lime and cyan carry black labels, and darkening on press dropped them to Lc 53-55, the worst cases in the system.

The rule is now **away from the label, never a fixed direction per mode.** The label is chosen on the resting fill, then hover and press move away from it, so the interaction states are *strictly more* legible than rest and only rest has to clear the bar. It reads correctly too: pressed separates further from its label rather than muddying into it. One exception falls out of the arithmetic — a fill already at an extreme has no room to move away (dark neutral rests at L .94 with a black label), so it moves toward the label instead, which is safe precisely because being at an extreme is what left the margin.

Worst case across every hue tested, both modes, is now Lc 68. It was 53.

**Third: the cusp pull needed to be stronger than guessed.** At 0.55 the bright hues sat in the middle-lightness zone where neither black nor white clears comfortably. 0.72 puts them where dark text has room.

The hostile-hue suite is the reason all of this surfaced: brand yellow, neon lime, hot magenta, cyan, near-black navy and a near-grey accent, each asserted against the same laws as the shipped tones. The near-grey case also confirms the low-chroma solid remap keys on chroma rather than on the tone being *named* neutral.

Also built: the alpha ramp (least-alpha overlay that composites back to its step, law-tested by recompositing), and colour swatches in the preview, because Lc numbers say a colour is legible and nothing but an eye says it looks right.

Rejected: pulling in `apca-w3` as a dependency (thirty lines against a licence question on a value we ship); snapshotting hex values (a snapshot asserts that the output did not change, never that it is correct); lowering the target to Lc 45 for interaction states, which would have passed all three bugs.

## 2026-08-02 highContrast does not ship, because both of its jobs are role-layer bugs

Radix's per-component `highContrast` was being reached for as a *look* — a darker, more authoritative button label — which is not what the name says and not what the mechanism is for. Two orthogonal problems were hiding under one prop, and neither one is about contrast.

**Radix's step 11 is placed at a floor**, the minimum clearing 4.5:1 on the backgrounds it sits on, so `highContrast` is an escape from a value tuned to a threshold rather than to how it should look. We generate and verify with APCA, so the default can sit where it looks right and still be provably legible. That removes the reason the escape existed.

**Fix one: a UI label is not a link.** `--accent-text` (step 11) stays where it is, because links and prose on a tint want the lighter, more chromatic value and *should* look different from a button label. Controls read a new `--accent-label`, generated between 11 and 12 — enough weight to read as a label, enough chroma to still say accent rather than ink.

**Fix two: prominence comes from chroma or from lightness, and at zero chroma lightness does all the work.** A mid-grey solid never reads as loud, whatever its lightness. So below a chroma threshold, `--accent-solid` resolves to step 12 rather than step 9. Keyed on chroma, not on the name "neutral", so a desaturated brand accent gets the same correction. Dark mode falls out free: step 12 there is near-white, giving the light primary with a dark label that Vercel, Linear and Radix all ship.

**Both live in the role layer, and that constraint is what makes them right.** The first instinct was to bend the solid band's lightness by chroma, the way section 7 already bends it by hue. That breaks the system: neutral step 9 at L .2 would sit *below* step 12 at .24, destroying the ladder's monotonicity and the guarantee that step 9 reads as the same step across every hue. Section 7's "do not mutate the scale" earns its keep here.

**Consequence worth remembering: the ramp runs out at 12.** A low-chroma solid cannot take +1/+2 for hover and press, so those derive as generated L-deltas off step 12 — the same problem that made `--accent-solid-active` a generated token rather than a step.

So `contrast` is now only what it should always have been: a Theme-level accessibility setting, honouring `prefers-contrast: more`, that shifts values globally. Section 7 previously framed it as a design knob with a cost to budget; that framing was wrong.

New law for the build: a label must clear APCA against **every** background in its rung, not only the resting one. Medium rests on step 3 and presses to 5, and the press state is where a label that passed at rest fails silently.

Rejected: a per-component `highContrast` prop (an appearance escape hatch, contradicting appearance-as-output, growing a boolean on every component whose meaning shifts per rung); moving step 11 darker (links and prose need it where it is); a step 11.5 (the scale does not gain steps — extra states live in the role layer); keying the solid remap on `tone === "neutral"` (misses the desaturated brand accent, which has the identical problem).

## 2026-08-01 Emphasis collapses to three rungs, border leaves the ladder, and material becomes backdrop defense

Supersedes the variant decision made earlier today and the material parts of sections 9-11. Kushagra's call, worked out in parallel with the token build.

**The five-name recipe set is dead.** `solid / soft / surface / outline / ghost` named construction rather than loudness, which is why four emphasis rungs could never map onto it cleanly. The earlier fix — keep `variant` public underneath `emphasis` as a documented escape — preserved the mixed metaphor instead of removing it, and left users with two props and no rule for choosing between them. There is now one axis: `emphasis = loud | medium | quiet`. Three rungs, because a rung has to earn a visible step to exist, and three stays obviously separable (roughly what iOS ships).

**`bordered` is the reason the ladder ever looked lossy.** `surface` and `outline` were never loudness levels; they were *containment*, a different question. As an orthogonal boolean it reproduces the whole old range from two comprehensible props: `quiet + bordered` is the old outline, `medium + bordered` the old surface. The blocker that opened this whole thread turns out to have been a factoring error, not a counting error.

**Material is backdrop defense, not decoration**, which is what makes it testable — does the label survive — rather than aesthetic. It is `solid | thin | thick`, off by default, and available on any component that can *float*, buttons included. That corrects the old "containers only" reading in both directions: a Card in a solid layout has nothing to defend against, and a Button over a photo does. `thin` and `thick` are two recipes rather than two magnitudes, since saturation and opacity do not order monotonically between them.

The load-bearing detail is that the brightness floor's direction follows the label: dark label brightens the backdrop, light label darkens it, which is what lets a control survive an arbitrary photo instead of the demo one. It needs no new plumbing — section 7's APCA-derived `--accent-contrast` already carries exactly that signal, so the material reads it and the label never moves.

**Performance has no clever fix, so the rules are architectural**: one glass per stack (the toolbar is the glass, its buttons are plain), material on fixed chrome that content scrolls under rather than on things that move and re-sample every frame, `prefers-reduced-transparency` honoured, `@supports` fallback to opaque. Blur radii are provisional until measured on a mid-tier device.

**Placement stays the user's.** Material over a solid surface is a muddy smudge, and the answer is allow-and-guide rather than block (rigidity leaks) or silence (people ship the smudge and blame the library) — the same stance as `className` forwarding and the margin escape.

Rejected: keeping `variant` as a public escape beneath `emphasis` (two props, one job); four or five rungs (a rung that is not visibly distinct is not a rung); border as a rung (the original error); `regular` as a material level (it was either the off-state or a status word on a magnitude axis); naming the loudness prop `variant` (the docs would spend forever explaining that the prop is not about looks); gating material placement by component (the library defines what material looks like, never where it goes).

## 2026-08-01 The radius prop becomes designed palettes, and the palette splits into two bands

The Theme `radius` prop was the last multiplier standing after density lost its own. It is now five designed palettes (`none`, `small`, `medium`, `large`, `full`) emitted under `[data-radius]`, and `--radius-factor` is gone.

**`full` is what settles it.** A pill comes free because CSS clamps `border-radius` to half the smaller dimension, but §6 requires surfaces to be *capped* at the same time, so a dialog does not become a giant lens. One factor scales controls and surfaces by the same amount and structurally cannot do both. A designed palette can: the control band goes to 9999 while the surface band holds at its medium values. The multiplier was already broken for the level that most needed care.

**The palette split into disjoint bands, and that is the load-bearing part.** Steps 1-5 are the control band, 6-7 the surface band. Density only ever picks a step; a level only ever says what a step is worth. No token is written by both, so the two axes compose instead of racing.

The alternative considered first was letting the radius level re-declare `--radius-control-N` directly and relying on source order, since the generated file controls it. That fails on nested Themes: a custom property set by a nearer ancestor wins regardless of source order, so an inner Theme setting only `density` would silently drop an outer Theme's `full`. Disjoint bands survive that; cascade ordering does not.

`none` squares everything including `--radius-full`, since a kill switch with an exception is not a kill switch. Surfaces moved up a step with the split, so a card reads 16px and a dialog 24px where they were 12 and 16 — a deliberate consequence of giving surfaces their own band, worth re-judging by eye.

**Caught on the first look at the preview: `full` was capping surfaces at medium's 16/24 while `large` already sat at 24/32, so cards got squarer as the dial turned up.** The cap now sits at large's values, and a law asserts the real invariant — for any step, the value never decreases across `none, small, medium, large, full`. Turning the dial up must never turn a corner down. Worth noting the shape of the miss: the cap was chosen against the requirement it came from (§6's "do not let a dialog become a lens") without checking it against its own neighbour on the ladder.

Two more law-test corrections fell out of building it. The "palette is non-decreasing" law was wrong: at `full` it must drop at the band boundary, so it now asserts monotonicity within each band. And the test helper that sliced a rule body ran to end-of-file, so a density block appeared to contain every later block's declarations; it now bounds at the closing brace. Both were tests asserting something looser than intended, which is the failure mode worth watching in a suite built on absence checks.

## 2026-08-01 The corner is held to a fraction of its box, and the palette gains a 10

Seen in the density matrix on the first render: the largest controls read as capsules. The cause was that radius climbed with the size index rather than with the box. Measured against its own height, default ran 0.14 at size 1 to 0.25 at size 4, comfortable reached 0.40, and compact came out at 0.30, rounder than default, because it reused the same radii on smaller boxes. A dense mode being bubblier than a roomy one is backwards.

**The rule is now that a corner holds near a constant fraction of its box (~0.2), growing in absolute terms with size but not in proportion.** §6 already said a bigger control wants a bigger corner; it did not say how much bigger, and "proportionally rounder" was the wrong reading. Resulting ratios: compact 0.17/0.21/0.18/0.20, default 0.14/0.19/0.20/0.21, comfortable 0.18/0.20/0.20/0.20.

**The palette gained a 10px step to make that expressible.** Controls live between 4 and 12, where the old curve jumped 8 to 12 with nothing between, so every correction overshot by 50% and the size-4 corner had nowhere to land. Eight steps is still inside §6's perception cap. Surfaces moved up with the renumbering: `--radius-surface` is now step 5 and `--radius-overlay` step 6, both unchanged in pixels.

Rejected: leaving the palette alone and choosing coarser control radii (the wobble was the problem, and no combination of 4/6/8/12 holds the ratio); dropping the climb entirely for one flat control radius (a size-4 corner genuinely should be larger in absolute terms, which §6 is right about).

## 2026-08-01 Scale keeps its wiring and loses its API

`--scale` stays a multiplier on every length token and stays at 1; the Theme `scale` prop is deferred. Once density took "bigger box, same type," the only case left for scale was "everything bigger, type included," and that splits into browser zoom (which already does it, and is where accessibility guidance points), a config change to the anchors (for a permanently larger system), and the size index (for one larger region). None of those needs a runtime knob today.

**Keeping the wiring costs nothing that matters.** At `--scale: 1` every token resolves to exactly its designed integer, so the arbitrary products only appear if someone opts in. The price is about fifteen characters per token, highly repetitive, which gzip removes almost entirely.

**Not shipping the prop is what avoids the problem**, because a shipped `scale` would be the one factor in the system still producing values like 26.78px after density stopped. Adding a prop later is non-breaking, so this is the reversible direction.

Rejected: stripping `--scale` from the calcs entirely (cleaner, but it forecloses the option for a saving gzip already provides); shipping the prop now as a free multiplier (arbitrary products, and nobody has named the steps it should have); designed sets for scale the way density got them (density re-declares ~16 control tokens per level, scale would re-declare ~40 — every space step, radius step, type step and line height, plus the control family — for a knob with no demonstrated demand); CSS `zoom` as the sanctioned scoped mechanism (it does not reach portaled content, so a zoomed region's popover renders unzoomed; fine as an app-root escape, wrong as an API).

## 2026-08-01 Density becomes designed sets, not a multiplier, and it takes radius with it

Density's job is breathing room at a fixed type size. Canva's signup button is the case that names it: the same label size in a much taller box with a much larger corner. `size` grows everything including type; density grows only the box. v1 had size 2 at 32px height with 14px type and that pairing was right, but some interfaces want the bigger box without the bigger type, and reaching for size 3 to get it moves the type too.

**It is a set of designed values per level, not a multiplier.** Two reasons, and the second is the decisive one. A multiplier produces arbitrary products (`32px * 0.95 * 0.875` = 26.6px), which the system rejects elsewhere: §6 already forbids deriving radius from height on the grounds that each value should be a designed point on a curve. More importantly, a multiplier makes every taste correction *global* — you cannot say "spacious size 2 should be 44px, not 45px" without moving all four sizes in that level. Designed sets make each correction local, and correction is the actual work.

**Shape:** designed heights per level, plus a step offset into the existing palettes for the families that reference them (control-px, control-gap, radius-control), with a per-cell override where the offset lands wrong. Roughly twelve raw numbers and three offsets, about the same decision count as the multiplier model, with the fractions gone and every rendered value a placed point.

**Radius joins the set.** This reverses the call made earlier the same day. Holding radius fixed is right across a small delta, where the radius-to-height ratio moves 0.19 to 0.21 and nobody sees it. It is wrong across density's real range: a 44px box wearing a 6px corner reads boxy, and §6's own argument ("a bigger control wants a bigger corner") is about visual size, not about the size index.

**Untouched, deliberately:** the space palette, so compact never shrinks page gutters, and type, which is the entire point.

**Theme level only, with nested Theme as the escape.** A per-component `density` prop duplicates `size` (a spacious size 2 at 44px against a default size 3 at 40px is two knobs producing overlapping geometry with no rule for choosing between them), and density is a property of a region rather than of an element. The airy hero CTA is reached by putting a nested Theme on the hero section that already exists, via §5's `render` escape, so it costs no extra DOM. Same mechanism §7 uses to rebind accent for a subtree instead of adding a per-component color prop.

**One law, and only one:** for a given size, compact < default < spacious. Spacious size 2 landing above compact size 3 is not drift, it is what density means; a law forbidding it would encode taste as correctness.

**Built the same day, and two details changed on contact.** The step offsets became explicit per-level arrays: an offset could not carry radius (compact at -1 put a size-1 control on `--radius-0`, a square corner), and once one family needs its own array the offset saves nothing over twelve readable rows of data. Compact therefore keeps default's radii deliberately, since a fixed corner reads boxy when the box grows, not when it shrinks. Measured cost of the two extra levels: +108 bytes gzipped, against the +50% guess, so the whole token file is 730.

The heights landed at 24/28/34/40, 28/32/40/48, 34/40/50/60, built so one density step moves the box about one size step while the label holds: compact size 2 stands where default size 1 does, comfortable size 2 where default size 3 does, all three setting their label at font-size 2. That pairing is the axis stated in numbers.

Still open: the numbers themselves, the level names and count (§5 says `comfortable`, which may understate the airy end), whether surface padding takes density (lands at Card), and a size-by-density matrix in the docs app — which is the real gate, because twelve heights across three levels cannot be judged by reading a config file.

Rejected: multiplicative density (arbitrary products, global corrections); density as "another spacing token series" (height is not spacing, and §3 forbids aligning the scales — `--space-7` at 32px matching a size-2 control at 32px is exactly the coincidence the doc warns against); a per-component density prop; a cross-level ordering law.

## 2026-08-01 The token pipeline lands, and density enters at the semantic layer only

Space, radius, type, and the control family generate from `src/tokens/config.ts`, which now holds every raw pixel constant in the system. The generator is §12's multiplier table expressed as code, which is the point: `--scale` is global, `--density` reaches only control height and control inline padding, `--radius-factor` only radius, and the law tests fail if any family drifts from that table.

**§3 and §12 contradicted each other, and the fix keeps both.** §3 specified `--control-px-1: var(--space-3)`, a pure reference with no multiplier; the amended §12 says control spacing takes density. Emitted as `calc(var(--space-3) * var(--density))`, both rules hold: the semantic token still points at the palette instead of restating 8px (§6's reference-not-coincidence law), and density enters at the semantic control layer exactly as §12 says. The space palette itself stays density-free, so a compact theme tightens controls without shrinking page gutters. That coupling was the defect REVIEW.md flagged in Radix's single `scaling` knob.

**Values that were illustrative are now pinned:** line heights 16/20/24/26/28/32/38/48/62px (ratios running 1.33 to 1.5 through the reading sizes, tightening to 1.11 at display), letter spacing flat through the reading sizes then -0.005 to -0.025em, system stacks as the family defaults with `--font-heading` chaining to `var(--font-body)` so §5's `font` shorthand falls out for free. `--radius-full` is deliberately not scaled: it is a clamp sentinel, not a measurement.

**Generated files are protected by a law test, not a hook.** The suite regenerates and compares against the committed artifact. Proved by appending a comment to `tokens.css` by hand: the test failed, and passed again after regeneration. A hook only protects the session that has it installed; a test fails CI for everyone, including a future contributor who never read ENGINEERING.md.

**The budget ratchet fired on its first real growth**, refusing 20 to 604 bytes gzipped until the baseline was re-recorded in the same commit. Working as designed: intentional growth is cheap to accept and impossible to take silently.

Rejected: a single derived line-height ratio (§15 already argues one ratio is wrong at both ends of a nine-step ramp); unitless line heights (they would re-derive the ratio from font-size, which is the derivation §15 rejects, and paired px values scale correctly through `--scale` anyway); density on the space palette (compact would shrink page gutters, the coupling defect); a PreToolUse hook guarding generated files (protects one machine, not the repo).

## 2026-07-31 The scaffold ships audited, and the budget gate becomes a ratchet

pnpm, Turborepo, tsdown, Lightning CSS, Changesets, Vitest, with the CI budget gate wired on day one per §14. Two adversarial audits ran against the result before anything was committed, and two of their findings were real defects invisible from the working tree.

**The published package would have had no types and no client directives.** tsdown 0.12 emitted a content-hashed `index-BNjKmUhF.d.ts` while the exports map promised `./dist/index.d.ts`, so every TypeScript consumer would have gotten "could not find a declaration file"; the same version stripped `"use client"`, which would crash any hook-using component imported from a Next.js server component. Both fixed by moving to tsdown 0.22, and the build now asserts its own output files exist. That assertion immediately earned itself by catching 0.22 defaulting to `.mjs`.

**The budget gate contradicted its own spec.** All three documents say the build fails on *regression*; the script checked only a fixed 40KB ceiling, so every byte of creep from zero to 40,959 would have passed silently. It is now a ratchet: `budget.json` carries a baseline alongside the ceiling, and any unexplained increase fails.

Two smaller corrections worth remembering: Lightning CSS was doing bundle and minify only, because without `targets` it emits no prefixes and passes nesting through untranspiled, so §2's promise of "minify, autoprefix, nesting" was two-thirds inert; and the release workflow failed on its first push trying to publish 0.0.0 without an `NPM_TOKEN`, so it is manual until there is something to publish.

Rejected: Bun (pnpm's strict isolated `node_modules` makes phantom dependencies fail immediately, which is a correctness gate for a published package; `Bun.build` emits no declarations; `bun test` has no browser mode, and the CSS law tests need a real browser to evaluate `@property` and container queries); ESLint 10 and TypeScript 7 despite both being current (typescript-eslint 8 pairs with ESLint 9, and TS 7's native compiler is an ecosystem-compatibility bet the scaffold does not need to take); a `no-restricted-imports` depth pattern for package boundaries (it false-positives on legitimate nesting like `src/components/button` importing `src/system`).

## 2026-07-31 The review's blockers close: responsive props compile by variable remap

REVIEW.md's three blockers are resolved in the spec, and the largest one reversed a diagnosis the doc had made confidently.

**The CSS-size story was wrong about the shipped codebase.** Measured v1: ~91.5KB gzipped, of which component CSS is ~55KB (`sidebar.css` alone 48KB raw). The doc had argued colors were the bulk and component CSS was lean; component CSS is not lean, the real mass is responsive prop utilities, and the doc had no compile story for them at all.

> **Corrected 2026-08-02.** This entry originally put v1's colour scales at ~2.8KB gzipped and concluded the colour diagnosis was simply wrong. Re-measured, `tokens/colors/` is 31 scales at 29.3KB gzipped — ~1.1KB each, so 2.8KB was a sample read as a total. Colour is a major term and generating only the configured tones earns its place; the surviving claim is only that component, layout and utility CSS together are much larger, so responsive props are the bigger lever. Recorded rather than edited away, because the wrong number is what made the argument feel decisive, and a number that convenient should have been checked twice.

**Variable remap is the answer, and its shape is what makes it small.** The component writes tier values as inline custom properties; the stylesheet holds a fixed set of arbitration rules per prop that decide which tier's variable wins. Values never enter the stylesheet, so cost is O(props x tiers) forever and the token dimension, the multiplier behind the 55KB, disappears entirely. Raw strings like `gap="13px"` ride the same pipe at zero additional cost, which pregenerated classes structurally cannot do. Because the mechanism is value-agnostic, structural props (`direction`, `columns`, `display`, `areas`) remap identically to spacing.

**Tiers are container-keyed, few, and semantic**, so a component adapts to its slot rather than the window and the same Grid is correct in a drawer and a main column. Both native platforms independently landed there: iOS ships two size classes, Android three window classes, and neither has per-prop pixel breakpoints anywhere in its API.

The other two blockers: the fixed L ladder now bends for the solid band only, as a bounded continuous function of hue, because saturated yellow does not exist at L .62 and an arbitrary user hue means a brand yellow will eventually arrive; and `variant` becomes public underneath `emphasis`, because four rungs cannot address five recipes and `outline` was otherwise unreachable through the semantic API.

Rejected: pregenerated token-by-breakpoint utility classes (v1's mass, and no way to express an arbitrary value); build-time scanning of consumer source in the manner of Tailwind's JIT or Panda (requires a compiler in every consumer's build, breaks on runtime-computed props like `gap={isCompact ? "2" : "4"}`, and contradicts §2's no-build-step position); a fifth emphasis rung or deleting `outline` to make the ladder cover the recipes (distorts the semantic layer to protect an abstraction); viewport breakpoints as the primary tier vocabulary; Braid-style `className` lockdown (kills legitimate escapes such as consumer grid placement and animation libraries; a shipped lint rule polices defection instead).
