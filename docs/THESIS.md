# THESIS

Why KookieUI exists and how it decides. Folded into the repo 2026-08-02 from the theory-track document; from here the repo is the single source. Architecture lives in `DECISIONS.md` and wins any disagreement with older exports of the theory doc — that doc's Part III predates the reversals recorded in `LOG.md` (radius palettes over a factor, density as designed sets, `variant` renamed, the solid band bending by hue).

Read order: this file → `DECISIONS.md` (the spec) → `REVIEW.md` (audit) → `ENGINEERING.md` (how we build) → `LOG.md` (how it got here).

---

## 1. Loss function

KookieUI optimizes for **correctness, not adoption**. Right, not popular — chosen deliberately, because the market cannot perceive the axis being optimized, so the two diverge constantly. The judges are the two things that cannot flatter: the human-factors literature, and whether real products built on it are demonstrably better. Not stars. Not conviction alone.

## 2. Patterns, not components

- A **pattern** is a recurring functional structure — context + problem + solution. It exists in the world; you discover it (Alexander, *A Pattern Language*, rederived for interface).
- A **component** is a pattern encapsulated for reuse. A **name** is a handle. Order: pattern first, encapsulation second, name last and least.
- The industry works in reverse — names and appearances first, function last. That inversion is the root of every failure named below.

## 3. Function over appearance (the epistemic duty)

A taxonomy must carve reality at **functional joints**, not appearance. The canonical case: filtering one view by different data pulls and switching between peer views are **distinct operations** — segmented control and tabs — proven different by **functional dissociation** (you can have one without the other), not assumed different and then validated.

Collapsing them into "one component, two variants" because both render as horizontal segments is not an ugly choice, it is a **false** one. Co-categorization manufactures perceived sameness — people compress within-group difference and exaggerate between-group difference — so structure teaches whether you intend it or not, and reducing function to appearance de-educates everyone downstream.

The library author is the one party obligated to know. The duty: **encode the real distinctions, teach them, and trust the taught. Teach relentlessly; enforce lightly** — enforcement at the taxonomy layer is teaching and defaults; the hard walls are reserved for the floors below.

## 4. Design is empirical

- Much of design has **objective floors**: Fitts's law (1954 — movement time as a function of distance and target width, logarithmic, predictive), touch anthropometry (fingerpad ~10mm → 44–48px minimums; Apple HIG 44pt, Material 48dp), the Gestalt grouping principles (Wertheimer, 1923 — the documented behavior of the visual grouping system), contrast sensitivity (WCAG/APCA). Measured, settled, non-negotiable.
- Above the floors is **taste within constraints** — the exact radius, the material's saturation, the specific accent. The discipline: know which decisions are floors (cite them, be immovable) and which are taste (own them as judgment, never dress them as objective). **Asserting false precision is the same sin as asserting false sameness, inverted.**
- The validator for a structural claim is **dissociation and recurrence, not coherence**. Coherence is not evidence — a perfectly consistent system can be perfectly wrong.

## 5. Coherence is negative-cost

Coherence is *cheaper* than incoherence: shipping the same button twice is easier than re-deciding its weight. Incoherence is therefore not saved time — it is **re-derivation without memory**. A centerless system re-decides every choice locally, in ignorance of prior choices, and local optima don't compose. The cost is paid at assembly scale, by the uninformed builder.

## 6. Why the field failed (incentives, not incompetence)

- **Centerless tools won.** shadcn's centerlessness is architectural — copy-paste means no center by construction. Tailwind's is cultural — utilities at the call site push decisions out, though a theme layer exists. Both traded coherence for adoption velocity on purpose.
- **Component-thinking applied to patterns.** A sidebar is a pattern (outward coordination), not a big component (inward containment). Forcing patterns into component shape leaks — a child wrapping its *parent* in a provider is the tell of the category error.
- **The talent is hidden and mis-selected.** Systematic designers work on private systems inside companies; the public market selects for virality, which rewards isolable, demoable craft and is blind to coherence, which is only visible at assembly.
- **The human-factors literature was abandoned** because consumer web has no forcing function — a missed tap is cheap, so "responsiveness" degraded from *adapt to the human on this device* into *reflow without a scrollbar*: the measurable proxy replacing the goal.
- **AI industrialized incoherence** — each component generated in isolation, locally plausible, globally inconsistent, and it looks fine per-component so no alarm fires.

The leaders share one architectural failure, it is structural, it is worsening, and only a small fraction of builders perceive it (unmeasured — an estimate, held to this document's own standard). The barrier to the position is perception and discipline, which do not get competed away.

---

## 7. Governance: the three tiers

Every decision sorts by one question: **does answering this require knowing what the product is?**

1. **Locked** — agnostic truth (touch target size; a finger is a finger). Decided, baked in, no opt-out.
2. **Opt-out default** — agnostic *pattern*, product-specific *choice* (a Composer's send button resting `loud`: the component places it and ranks it, and the row is still the caller's to re-rank). The library knows the right default, ships it, makes it opt-*out*.
   - **Amended 2026-08-26.** This tier's example used to be *dialog → sheet on mobile*, and that feature SHIPPED (2026-08-21) as **tier 1 with no prop** — the window class answers "which interface should this app show", which is not a product-specific question, so a call site staying centred on a phone is choosing against an answer the system just gave. The re-tiering is a defensible call and the document now says so rather than promising an opt-out the code refuses. If a real screen forces the escape it widens the way every axis here widens; until then, keeping a centred panel on a narrow window means composing a Popover or building the surface, not passing a flag.
3. **Mechanism only** — product-specific (what content to drop on mobile). The library provides the tool and makes no decision.

**The core inversion: opt-out, not opt-in.** The correct thing is what happens when you don't think; overriding requires knowing something the library doesn't. The default *is* the teaching; the opt-out *is* the respect — and it must be a first-class, easy, documented path, because a grudging escape hatch is policing with extra steps.

**Responsiveness = interaction-model adaptation, not layout reflow.** A phone is not a small desktop: larger targets, thumb not pointer, no hover, bottom reachable. So dialog → sheet, popover → sheet, rail → bottom tabs, hover-reveal → always-visible. Same component, same function, device-appropriate interaction. Human factors, not taste — which is exactly why the shipped ones sit in tier 1: the adaptation is the human factor, and there is nothing product-specific left in it to opt out of.

**Caution:** "the library knows the right default" holds only where research is settled. Where the answer is product-dependent — or agnostic but genuinely contested — the opt-out must be real. Confidence in a default is itself the overreach being criticized.

---

## 8. The pattern layer

- **Components are leaves** — bounded, self-managing. **Patterns are relational** — their essence is outward coordination. A pattern cannot ship as a component; the tell is a child reaching up to control its parent.
- **Shell is the exemplar**: the coordinator owns the arrangement, slots never reach outward because the container already sits at the top. Base UI has no Shell — the layer is ours to own.
- **The stack:** tokens → primitives (wrapped Base UI) → layout primitives → patterns (Shell, Sidebar, CommandBar, NavMenu) → Blocks. The leaf layer alone is what everyone has; the pattern layer with a center is the position.
