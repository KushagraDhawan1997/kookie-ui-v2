# Principles

These principles describe the interfaces Kookie helps you build. Use them to make the decisions no
component can make for you.

## Fit the person

Design for the person using it, in the place they are using it. Someone might be tapping with a
thumb on a train, reading in bright sun, or working at a desk with a mouse. Make targets easy to
hit, text easy to read and contrast easy to see in each of those moments, not only on the screen you
design on.

Kookie adapts to the person for you. Controls grow to 44 pixels under touch, text grows on phones,
readable text never drops below the contrast floor, and a dialog becomes a sheet in a narrow window.

*Figure.* A shop's bag on a laptop with a mouse and on a phone with touch. The same controls and text are larger under touch: the quantity field grows from 32 to 44 pixels, Check Out from 40 to 52, and the subtotal's text from 16 to 18.

## Serve the job

Put the task first. People open your product to get something done. Show what the task in front of
them needs, keep everything else one step away, and let the work itself be the reward.

Kookie's composition rules give each screen one loud action, so the main task stands out. In a
narrow window, Shell's sidebar and inspector step aside so the content keeps the screen.

*Figure.* A video editor on a laptop, dense as a real one: a clip library, a viewer showing Valencia's cathedral, a clip inspector and a ten-track timeline. Each region has one loud action, the selected clip is the timeline's one strong mark, and everything else is quiet.

## Build on what people know

Use the patterns people already recognise, and use each one the same way everywhere. Two things that
look alike but behave differently confuse people more than two things that look different. When a
pattern is wrong, replace it everywhere instead of changing it in one place.

Kookie names components by what they do, so you pick the behaviour along with the look. Tabs switch
views and a segmented control sets a value, and each component's page names the one it is often
confused with.

## Keep only what matters

Every element, option and setting asks for attention. Remove what people don't need, and what
remains becomes easier to find and easier to trust.

Kookie keeps its own options few. Bold, toasts and near-duplicate components are left out, and each
refusal says why and what to use instead.

## Let people stay in control

Show what is happening, let people change it, and let them take it back. Give every gesture a
visible button, and make actions reversible wherever you can. When an AI does the work, people
should still be able to see it, steer it and undo it.

Kookie keeps focus visible, closes overlays with Escape and returns focus to where it was. A button
keeps its label while it loads, and a copy button shows that it copied instead of announcing it
afterwards.

## Care about the details

Small details decide how a product feels. Make each one on purpose. Know which decisions are
measured, like contrast, and which are taste, like a corner radius, and be honest about the
difference.

Kookie takes care of the details you would otherwise set by hand: spacing, sizes, corners and states
all come from the theme. Its docs cite every measured limit and call every other decision a choice.

*Figure.* A music app's Spanish summer playlist on two phones, in glass. One is scrolled down, with the tracks passing under the mini player. The other shows the album's top.

## Sources

Target size and distance come from Fitts (1954), reading size from Legge and Bigelow (2011), and
grouping from Wertheimer (1923). Putting the task first draws on Norman's gulfs of execution and
evaluation. Polson, cited in Grudin (1989), showed that people learn faster when interfaces reuse
what they know, and Raissi and others (2020) found that changing two of eight keys slowed people
across the whole layout. Hick and Hyman measured how choice time grows with the number of options.
Sadana and others (2018) found that only 1 in 16 people discovered a hidden gesture, and Bainbridge
(1983) and Amershi and others (2019) describe what people need when automation does the work. Caring
about details is a judgment, and so is applying control to AI.
