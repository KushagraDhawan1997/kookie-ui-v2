# Handover — auditing the material work before it enters the package, 2026-08-16 (overnight)

Written for the person who was not in the room. Plain English. Where this file and a
governance doc disagree, the governance doc is right.

The job was: audit everything the lab wants to bring into the package, decide the order it
should arrive in, and start landing the parts that don't need a design call. Six
independent auditors ran over the port surface, each finding was then handed to a second
agent whose only job was to prove it wrong, and the survivors are below. Everything
load-bearing I re-measured myself in a real browser rather than trusting the report.

---

## 1. The thing that stops the port, and it was invisible

**The lab has not been rendering the numbers it is written with.** Menus, dialogs and every
glass button were blurring at 2.8× their stated value. Cards were not. Nothing in the
source said so.

Measured in the running lab, reading the actual computed filter off real panes:

| pane | blur it declares | blur it drew | |
|---|---|---|---|
| card | 12px | 2.40px | ×0.20 |
| glass button, thin | 6px | 3.36px | ×0.56 |
| glass button, regular | 10px | 5.60px | ×0.56 |
| glass button, thick | 16px | 8.96px | ×0.56 |

Two causes, both mine, both the same shape — one fact living in two places and the copies
drifting apart.

**The filter chain is written twice.** Once in CSS (`lab2.css:133`) and once as a string
built in JavaScript for the refracting panes (`page.tsx:255`). The CSS copy multiplies by
`--l2-noref`; the JS copy does not. That variable is meant to add extra blur when
refraction is *unavailable*, to compensate for the missing bend. Only the JS copy knows
that; the CSS copy applies it to everything that keeps the CSS chain.

**The switch that was supposed to turn it off pointed at nothing.** The guard read
`:root:not([data-l2-refract="on"])`, and nothing has ever written that attribute to
`<html>`. `data-l2-refract` does exist, but it is written onto individual menu elements
with a filter id as its value — a different fact wearing the same name. The html stamp
this guard was waiting for got renamed mid-session and then lost; the new name appears
nowhere in the repo. So the guard matched permanently.

**Fixed** by deleting that guard. It was a second, broken home for something the foot of
the file already states correctly (`:root[data-l2-flat="on"]`, keyed on the attribute the
Refraction switch actually writes). Verified after the change: refraction on → ×1 for
every pane, refraction off → ×2.8 for every pane. One population either way, which is the
design as written.

### What this invalidates, and you should know before you trust anything

- **The control material cells.** "Control surfaces need their own parameters" is written
  into the CSS three times as a system rule. The control cells declare *half* the card's
  blur and were drawing **2.3× more** of it. The re-price was correcting a bug, in the
  wrong direction, and the rule it produced has nothing behind it. Re-judge those cells.
- **Every performance number from the parked audit.** They were taken on panes running
  well past their designed blur, and blur cost climbs fast with radius. Do not port
  anything on the strength of those numbers; the audit is worth re-running now that the
  lab renders itself honestly, and that is the one job I deliberately did not start
  overnight — profiling while my own test runs are using the CPU would have produced
  another set of numbers nobody can trust.
- **The refraction on/off comparison never worked.** Both states were at 2.8×, so the only
  difference between them was the presence of the lens itself, with no frost compensation
  on the "off" side. The honest comparison exists for the first time as of tonight.
- **The buttons will look different when you open the lab.** Less blurry, because they are
  finally drawing what they say. Screenshots in the scratchpad.

---

## 2. What else the audit found

Grouped by what is actually wrong, not by which agent found it. Everything here survived a
refutation pass.

### The veil is not what §10 says a material is

The lab's veil is built out of `--color-surface` directly. The package's rule is that a
material is a *fill modifier* — it takes the component's own fill and mixes it toward
transparent. Because the lab hardcodes the surface colour instead, **tone and the look axis
never reach a glass pane at all.** A `destructive` card and a neutral card are the same
pane. This is the single biggest structural gap between the lab and the system, and it has
to close before any recipe ports, or the port would silently delete two axes.

### The light source contradicts itself

The lab's rim tracks the pointer: a rAF loop that never idles, measuring every glass
element's position every frame and writing a custom property onto each one. Two problems.
It is JavaScript running at interaction time, which the package forbids outright. And it is
a *second light model* — the shadow palette, the material rim and the elevated world all
derive from one fixed light falling downward, and this makes the light follow the cursor.
Under "no exceptions", one of them has to go, and the fixed one has three systems already
built on it. My recommendation is that the pointer-tracked rim does not port. It is the
prettiest thing in the lab and it is also the one thing in it that argues with everything
else.

### The Lit rung invents a second source of shadow truth

The package has exactly one shadow palette and a rule that no component names a shadow.
The Lit rung re-declares the control's shadow with literal colour values that change per
emphasis rung and again on press. That is three things the system says a button may not
have. The intent is right — the rung should reprice the world's shadow — but it has to do
it by choosing rows from the palette, not by writing new ones.

### Text on glass lost its contrast floor

Ink over glass is set with hardcoded alphas rather than the solved ink ladder. The system
deliberately keeps text on a measured floor even after the 2026-08-07 decision that resting
borders and fills are taste. This quietly opted text out of that. It shows: quiet text on
thick glass over a photograph is very hard to read.

### The sealed fallback bakes in a page colour the library does not own

`layered={false}` is supposed to be visually identical with no readback. It is not. It
pre-mixes the veil over `--neutral-2` — a page colour the library has explicitly decided
is the app's to choose, never its own — and it loses a specificity fight in dark mode. It
also cannot answer the thickness axis. It reads correct in the lab only because the one
bed it sits on happens to be that exact token.

### Duplication, counted

The material is written four times in the lab and a fifth time in the package's own
config, and **no two of the five agree**. I measured the core ladder myself:

- Card and menu veils are byte-identical in light. Dialog differs in one cell. Only the
  control family is a genuine re-price — and see §1, that re-price was chasing a bug.
- Blur: card 12/20/28, menu 12/**16**/28, dialog 12/20/**36**, control 6/10/16, and the
  shipped config says 5/16/32.
- Dark saturation for menus and dialogs collapses to a single value — the ladder does not
  exist there, and the package has a law requiring it to be monotonic that would fail.
- The dark thick card renders **light mode's** spectral rim, roughly three times too
  bright, because that recipe was written twice and only the dialog's copy was corrected.
- The dialog states sheen as a 0–1 opacity while everything else states it as a 0–100
  number. Same idea, two units.
- Two live and disagreeing implementations of "loud through glass" ship in the same file.

One auditor counted ~230 numbers across the whole surface. My own read of the core levers
says the honest total is roughly **twelve designed numbers plus four scale factors**: one
thickness ladder per mode, one rule with two values for how dark mode tints (things in the
page darken, things floating above it lighten — that distinction is real and worth
keeping), and one scale vector for controls. Menus and dialogs need nothing of their own.

### Runtime

The refraction machinery generates a displacement map on a canvas, encodes it to PNG, and
injects a stylesheet — on the path that opens a popup. Its dressing loop cannot be
cancelled and never clears its marks, so changing any lens parameter permanently strips
refraction from every popup already open. Its observer watches the whole document body and
answers every batch with a full-document query. None of this is fatal, but none of it can
port in this shape.

There is also a suspected double-flight bug in the overlay entry in `floating.tsx`
(uncommitted): the hook that retires a previous flight is registered one microtask after
the flight starts, so two rapid opens could run two flights with the older one's timer
stripping the newer one's pins. I read the code closely and the `data-seed` guard appears
to close most of the window, so I am reporting it as **unconfirmed**. I deliberately did
not touch that file — your motion audit is running against it, and two of us editing one
file overnight is how a good fix gets lost.

---

## 3. The three decisions that are yours, and nothing should move until they land

Each blocks a different part of the port. Recommendations given, with the objection I could
not kill where there is one.

### (a) Does `material` become a Theme property?

**Recommend yes, and delete the nine component props rather than keeping them as
overrides.** The argument is that material is currently the *only* appearance axis that
lives on components. Theme already owns eight — appearance, density, radius, contrast,
pointer, depth, and the two look props — and not one of them is also a component prop. The
escape for all eight is the same: nest another Theme. Material joining them removes an
exception rather than adding one, and a per-component override would be the second home
for a fact that the theme already states.

Cost, counted: nine components lose a prop, 28 CSS selectors are keyed on the element and
would move to the theme, 58 laws mention it, five doc surfaces describe it.

**The objection you should weigh:** DECISIONS §5 already reserves a Theme prop *named*
`material`, and it means something incompatible — a policy ceiling that clamps what
components may ask for, not a value that sets what they are. If material becomes a value
selector, that reserved meaning has to be either dropped or renamed, and the clamp is what
was going to let an app cap the cost of glass on weak hardware.

### (b) Does `depth` grow a third rung?

**Recommend not yet.** Two of the three proposed rungs are already reachable: "Stacked" is
today's `elevated`, and "Drawn" is close to today's `flat`. The genuinely new one is "Lit",
where controls join the lit world — and that is one rule, not a new axis. The cost of a
third rung is 51 laws, eight of which loop over exactly two values and would cover a third
with nothing at all. My reading is that this is a rename plus one rule, and it should be
proven as one before it becomes a third value.

Also: the proposal has glass *seal* at the Drawn rung, which makes depth and material stop
being independent of each other. Every other axis pair in this system is disjoint.

### (c) Does `layered` exist?

**Recommend deferring it, and it is the one I am least sure about.** As specified it does
not work (see above: it bakes a page colour, it is not identical, it does not answer
thickness). More importantly, once material is a theme property, a component with
`layered={false}` that still paints a veil leaves no way for anything to say "I am not
glass" — which is the only thing currently enforcing the one-glass-per-stack rule you
confirmed yesterday.

But the underlying need is real: glass costs a readback per pane and something has to be
able to opt out. I think the answer is a *theme-level* performance ceiling — which is
exactly what §5's reserved `material` prop already described — rather than a per-component
boolean. That is worth a proper argument rather than my overnight guess.

---

## 4. The order it should arrive in

Nothing here ports a number until the frame that holds it has stopped moving.

1. **Split the working tree.** It currently holds six independent concerns and the
   regenerated token file cannot be split without regenerating twice. Nothing can arrive
   "one at a time" onto a tree that is already a pile.
2. **Answer (a), (b), (c) above.** Code that moves before these is code that moves twice.
3. **Make the veil a fill modifier.** Until a pane can carry tone, the recipes describe a
   material the system does not have.
4. **One materials table**, in config, with per-family factors — and it extends
   `config.material`, which is already the right shape, rather than becoming a new home.
   This is where the ~230 numbers collapse.
5. **The Lit rung**, expressed as shadow-palette rows rather than literals.
6. **Ink on glass** back onto the solved ladder, with the contrast floor restored.
7. **The performance question**, re-measured on the fixed lab, and then whatever
   opt-out (c) settled on.
8. **Refraction last**, because it is the only part that needs new runtime, and it should
   arrive after everything that does not.

---

## 5. What actually landed overnight

- **The blur bug** — deleted the broken duplicate guard in `lab2.css`. Verified by
  measurement in both refraction states. This changes how the lab looks.
- **The accent documentation** — the flip from grey to blue had landed in code with no LOG
  entry, while `DECISIONS.md` §7 and `CLAUDE.md` both still described a grey brand as the
  shipped default. Three homes for one fact, one of them moved. Fixed all three, with the
  reason recorded: a brand with no chroma has nothing to survive a translucent veil, which
  is a structural argument rather than a taste one. I also corrected my own first draft of
  that entry, which overclaimed — `accent` and `blue` are two config entries holding the
  same two numbers, and they must stay separate, because accent is rebindable and blue is
  a fixed family. That is a coincidence of the default, not one fact written twice, and it
  earns no law.

- **One home for the axis value lists.** Eight law files each carried their own copy of
  "depth has these two values" and six their own "there are these three thicknesses". All
  of them pass now and all of them would still pass after the axis widened, covering the
  new value with nothing — which is exactly what a third depth rung would have walked into.
  `depth` now owns a list beside its type, the thicknesses already had one nobody was
  reaching for, and a law forbids a second copy. It checks both spellings, because one file
  had the pair backwards. Falsified in both directions, and it caught me on the first run:
  my own explaining comment spelled the literals out and the walk reads its own file.

  Not closed: the two docs files restate the same lists (and four other axes). Closing them
  means exporting the axis lists from the package's public API, which is your call, not a
  refactor.

Deliberately not done: the tree split (wanted your eyes on what belongs in which commit
before I rewrote history), anything in `floating.tsx` (your motion audit owns it), and the
performance re-run (it needs the machine to itself, and after §1 it needs redoing anyway).

CI was green before I started and after everything above: 1267 package tests (the new law
is the extra one), 148 docs tests, CSS at 25087 gzipped against a 25087 baseline — no
stylesheet moved, so the budget is unchanged rather than merely re-recorded.

---

## 5b. The performance measurement you parked — run, with one usable answer

Stills only, animations frozen, the fixed lab, 190 panes, headless, scrolling the whole page
in 60 steps and timing each frame. I ran the whole set **twice**, which turned out to matter.

**The one finding both runs agree on: glass is the dominant scroll cost, and it roughly
doubles the expensive frames.** Removing `backdrop-filter` entirely takes the 90th-percentile
frame from ~21ms to ~10.3ms, and the two runs landed within 0.1ms of each other on that
number. That is the readback, and it is the thing a cost opt-out has to buy back.

**The median frame is 8.3–8.4ms in every configuration**, including with all glass removed.
Most frames are cheap no matter what; the cost lives entirely in the tail. A "still screen is
nearly free" claim is true and also not the interesting question.

**The blur fix itself was worth more than any optimisation I tested.** The earlier audit
measured scroll at 25.4ms median / 172ms worst; the same page now sits at 8.3ms median with a
worst frame in the 28–53ms range. Most of that was the 2.8× blur.

**And here is the part worth more than the numbers: I could not reproduce my own results.**
Between the two runs, `contain: paint` moved from 22.0ms to 10.6ms at p90 — on the same page,
same config, same machine. Worst-frame swung from 27.7ms to 53.2ms for the plain baseline.
So I can rank nothing except backdrop-filter, and **the previously reported "-27% draw from
`contain:paint`" and "-42% paint from `content-visibility`" should not be trusted** — they
were single runs, at the wrong blur, on an instrument this noisy. Neither showed a
reproducible win tonight.

If these numbers are going to drive a port decision they need a real harness: repeated
trials, a stated confidence interval, and a fixed CPU throttle. That is a half-day of work
and it should happen before anyone spends effort on `contain`, `content-visibility` or the
shadow stack. What does **not** need it: glass costs a readback per pane, that cost is real
and measurable, and something has to be able to opt out of it.

---

## 6. Where I disagreed with the audit, and changed my mind

I went in recommending that the nine per-component `material` props be **deleted** when
material becomes a theme property — one home, no override, no exception. The audit killed
it and I think it is right: with no per-component lever, a themed-glass app renders a glass
card holding a glass field holding a glass button by default, which is precisely the
composition you ruled against yesterday. Deleting the prop deletes the only thing that
enforces that rule.

What I would put in its place, and it is the thing I would most like your reaction to: the
theme owns the material, and a component may only ever step **down to solid** — never pick
a different thickness. That is not two homes for one fact; it is the theme owning the value
and the component owning one word, "not me". And it may remove `layered` entirely: if the
sealed composite cannot actually be identical (§2 says it cannot), then there is no free
glass, and opting out of the cost is the same act as opting out of the look. One prop
instead of two, and the escape hatch is a value you already have.
