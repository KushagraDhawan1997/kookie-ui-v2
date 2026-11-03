# Composition

Kookie components keep a screen consistent: every distance comes from a spacing step, every
colour from a tone, and every size from a size step. Consistency isn't the same as quality,
though. You can still put nine components on one screen at nine different sizes, and nothing in
the components will stop you.

This page covers the rules for putting components together. Most of them are judgments, not
measurements. The two exceptions are that colour never carries a message alone (WCAG 1.4.1) and
that text people must read stays readable. The [builder](/builder) checks most of the rules
while you work.

*Figure.* A builder's property panel for a selected button: content and appearance in two groups spaced apart, the labels at the controls' size, and one size throughout.

## One obvious action per screen

Give each screen one loud control, and make it the action the screen exists for. Set it with
`tone="accent"` and `emphasis="loud"`, and leave every other control at medium or quiet.

One control stands out only when the controls around it are quieter. This is the isolation
effect. When two controls are loud, neither one stands out, and a person can't tell which is the
main action. One per screen is Kookie's judgment.

*Figure.* A post editor on two phones. Wrong: Save and Publish are both loud, so neither stands out. Right: Save draft is medium and Publish is the one loud action.

`Button` defaults to medium, so a loud button is almost always one you asked for. The two
exceptions are `AlertDialogAction` and the send button in a `Composer`, which default to loud
because each is the only action in its component.

Count loud controls across the whole screen, not inside the nearest card. A dialog counts as a
screen of its own, because it covers the page. Two tab panels never compete either, because only
one is visible at a time.

## Let space do the grouping

Put related things closer together than unrelated things. People see items that sit close
together as a group before they read them. A shared border or fill also groups items, and it can
override distance, but it adds lines and noise. So set the spacing first, and add a border only
when spacing is not enough.

Make the gap inside a group at least two steps smaller than the gap around it. Compare only gaps that
run the same way: a row's gap inside a column does not compete with the column's gap. When a screen
uses the same gap from top to bottom, it shows no structure.

*Figure.* An event on two phones. Wrong: every line sits the same distance apart, so nothing groups. Right: the title and date sit close, and the place and the notes sit apart as their own groups.

Two levels that both separate groups can sit one step apart: a section at gap 6 can hold groups
at gap 5.

## Rank text by size

To show that one piece of text ranks above another, move at least two steps on the type scale.
A size 4 title over size 3 body text looks like an accident. [Typography](/foundations/typography#the-five-steps-for-a-screen)
gives the five steps a screen uses.

*Figure.* An event on two phones. Wrong: the title is one step above the text, so the rank looks like an accident. Right: the title is several steps above it.

When something is less important, keep it at size 2 or 3 and use the muted colour with
`emphasis="medium"`. Keep `emphasis="quiet"` for things a person can't use, such as a disabled
option.

## Use a tone for what it means

Choose a tone because of what it means, not because a screen looks too grey.

*Figure.* An event's actions on two phones. Wrong: blue, green and orange buttons chosen for colour. Right: neutral actions, and red only for Cancel event, which removes something.

`success`, `warning`, `info` and `destructive` carry meanings. `blue`, `green`, `orange` and
`amber` are for colour as data, such as a chart series or a category. Keep to three tones or
fewer on one surface, which is a judgment. Never let colour carry the whole message: write the
words too.

## Same job, same size

Controls that do the same job on one surface should be the same size. A size 3 button beside a
size 2 button looks like two different kinds of control, and a person will look for a reason that
isn't there.

*Figure.* An invitation on two phones. Wrong: Decline is smaller than Accept. Right: both answers are the same size.

Match controls to the surface that holds them. [Scale](/foundations/scale) explains which
components pass their size down.

## Use the component that owns the job

When a component draws a band, a title, a close button or a footer, use it. A toolbar built by
hand from a row of buttons misses the rules the real one carries: its inset, its glass and its
spacing. Every dialog, sheet and titled popover has Close at the end of its band, and in a flow
the main action is full width on every screen. [Modality](/patterns/modality#focus-and-closing)
has the details.

*Figure.* An event on two phones. Wrong: a header built by hand from a row of buttons, with no Close. Right: the pane's own toolbar, with Back, the title and Close.

## Write the real words

Build a layout with real content. Placeholder text hides the problems you most need to see, such
as a heading that wraps onto three lines in a narrow column.

*Figure.* An event on two phones. Wrong: placeholder words and a Submit button. Right: the real title, details and an action that says what it does.

## Run the reviewer

Run the reviewer in the [builder](/builder) before you ship. It checks the rules on this page and
offers a fix when one is safe. It can't tell you whether a screen is good, only when a screen
breaks a rule.
