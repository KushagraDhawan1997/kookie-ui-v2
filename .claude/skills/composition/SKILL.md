---
name: composition
description: Gestalt and classic design principles, stated as checkable rules in KookieUI's own vocabulary. Run this before shipping ANY composed surface — preview specimens, showcase screens, docs examples, real app UI. Catches the basic mistakes (flat rhythm, split focus, filler text, drifting alignment) that primitives cannot catch for you.
---

# Composition

DECISIONS §15 ("Composition: the house style") is the authority; this skill is its operational
checklist, widened with the classical principles the house style is an instance of. Where they
disagree, §15 and the LOG win. The persistent memories `ui-information-design` and the taste
rules recorded there apply on top.

The system's guarantee is that every VALUE is right (tokens, ladders, solved contrasts). None
of that prevents a bad composition — a screen can be built entirely of correct parts and still
fail every principle below. This checklist is for the layer the tokens cannot reach.

## Gestalt principles, as rules

**Proximity — distance IS relationship.** Things that belong together sit closer than things
that don't, and the two distances must differ by at least two layout-space steps or the eye
reads one undifferentiated column. The house intervals: label→field gap `3`, group→group gap
`5`, section→section gap `6`, header→body gap `6` with title→description at `2` (heading space
is asymmetric — a heading belongs to what follows it). Failure smell: a form where every gap
is the same number.

**Similarity — same role, same treatment.** Every label on a surface is one size and weight;
every meta line one ink; every primary action one tone. Two spellings of one role is entropy
the reader pays for. Failure smell: one label at `size 1 medium` and another at `size 2
regular` on the same screen.

**Common region — a container groups, a line divides.** Enclosure (Card, panel) and distance
already group; add a Separator only where distance cannot do it (a settings list's channel
break). Never both. The confirm-card lesson: a full-width rule under a right-aligned pair
draws a line where nothing is being divided.

**Continuity & alignment — one axis rules.** Everything aligns to the container's edge unless
it has a stated reason (right-aligned actions, right-aligned values in label/value rows —
aligned on the BASELINE, not center). A composition with three left edges is a composition
with none.

**Figure/ground — one figure per surface.** Boldness is spent exactly once: one loud accent
action, one focal element. Everything else is ground and stays quiet — medium and quiet rungs,
muted inks. Two loud things on one pane means neither is the point. (The switch's checked
accent is state, not emphasis — it does not count against the budget; a second loud BUTTON
does.)

**Closure — let the eye finish.** Don't box what shape already implies. A group of rows needs
no border; the grid alignment closes it.

## Classical principles, as rules

**Hierarchy.** The §15 ladder: page 8, section 7, card title 6, body 3, label and meta 2.
Adjacent levels must differ by a real jump (≥1.33×) — a 1.14× "hierarchy" is a rounding
error. `size 1` is retired from composed surfaces; "matters less" is what muted and faint
inks say at a readable size.

**Rhythm.** Every repeated interval comes off the layout-space scale, and repetition is the
point — a list's rows at one gap, a form's groups at one gap. An invented length (`13px`,
`1.35rem`) breaks the metre even when it looks close. Nothing on a composed surface picks a
colour or invents a length; if a needed distance has no step, that is a system finding, not a
call-site decision.

**Proportion.** Controls match the composition's scale: a size-3 dialog holds size-3 fields
and buttons; helper and label text ride the same scale (never an absolute tiny step beside
scaled controls). A control two rungs under its container reads as a mistake, not as modesty.

**Contrast.** Contrast carries meaning, so it goes exactly where the difference matters:
the focal action against calm ground, the destructive act in its own tone, disabled receding
from live RELATIVE to its local ground (the alpha rule). Decorative contrast — a random
bordered box, a tinted panel with no semantic — is noise.

**Balance.** Weight distributes deliberately: action rows sit at the end and align right;
a lone primary may go full-width (the sign-in stack); an icon action balances a header's
title. A heavy element in a corner with nothing answering it tips the surface.

**Harmony & unity.** One accent per app — the ten tones are data vocabulary (destructive,
success, warning), never decoration. A screen is in harmony when removing any one element's
treatment would be noticed: nothing is styled "extra." The skill's test: name each element's
job in one word (label, value, action, meta). An element with no word gets cut.

**Emphasis by subtraction.** Before shipping, remove one thing (the accessory rule). The
strongest candidates: a definitional caption, a second border, a redundant title, an
unearned icon.

## Information design (what goes there at all)

- Helper text must carry what the label cannot: a consequence, a scope, a constraint, a
  disabled state's reason. A DEFINITION of the control is filler — delete it, let the row
  collapse.
- No eyebrows, ever. A title carries its own subject; a small label above it is two elements
  doing one job.
- Buttons state what happens ("Save changes", never "Submit"/"OK"), and the name stays
  consistent through the flow (button "Publish" → toast "Published").
- Specimen/annotation text never lives inside the composed surface — it belongs in the
  caption outside it.
- Empty states invite an action; errors say what to do next.

## The pass

Run on every composed surface, in this order, then screenshot and judge pixels — structure
passing is necessary, not sufficient:

1. Name each element's one-word job; cut the ones without one.
2. Delete definitional captions; verify no eyebrows.
3. One figure: exactly one loud accent action; destructive in its tone; everything else
   ground.
4. Rhythm: gaps off the scale, within-group < between-group by ≥2 steps, heading space
   asymmetric.
5. Hierarchy: ladder steps with real jumps; no size-1 text; meta in ink, not in shrinkage.
6. Proportion: control sizes match the surface's scale, helpers ride it.
7. Alignment: one axis; baselines for label/value pairs; actions end-aligned.
8. Separators only where distance cannot group.
9. Copy: active verbs, consistent action names.
10. Screenshot both appearances; judge over the real bed (the darkened card bottom, the
    hostile image) — the alpha rules exist because grounds vary.
