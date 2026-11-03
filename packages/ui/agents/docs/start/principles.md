# Principles

An AI agent can make a screen look good. It cannot make fifty screens agree, because it answers
every question again on every screen. Kookie is a system of patterns, carried by components, that
answers those questions once and keeps the answers correct. Six principles decide those answers.


## Fit the person, where they are

The body and the mind set the floors, in the situation the person is in: their hand, their eyes,
the device, the window and the light. Targets are big enough to hit, text is big enough to read,
and contrast is high enough to see. Readable text always meets the reading contrast floor, and no
setting lowers it. Under a touch pointer, controls grow to 44 pixels, because a finger is less
precise than a mouse.


Sources: Fitts (1954) on target size and distance, Legge and Bigelow on text size and
reading speed, Wertheimer (1923) on grouping. The 44-pixel target is a judgment inside the
range that touch studies measured (Parhi and others, 2006).

## Serve the job

People use a tool to get work done. Put the task in front, and keep everything else one step
away. Getting the job done well is the satisfaction the tool gives.

Source: Norman's gulfs of execution and evaluation, which measure the effort between what a
person intends and the result they get.

## One job, one form, everywhere

Use the pattern people already know. Components that do different jobs stay apart, even when they
look alike, and each component's [Use instead](/components) section names the one it gets
confused with. Things that do the same job become one, answered once, so the same meaning gives
the same result on every screen. Challenge a pattern only to replace it everywhere, never to vary
it in one place.


Sources: Grudin (1989), citing Polson, on reusing what people know. Raissi and others (2020)
found that changing two of eight keys slowed people across the whole layout. That a near-copy
does more harm than a clean break is a judgment.

## Less

Fewer things. Every element, option and setting earns its place, and what nobody uses goes.

Sources: Hick and Hyman on choice time, and Sweller on extra information slowing learning of
hard material. The rest is a judgment, in the line of Dieter Rams.

## People stay in control

People see what is happening, steer it and undo it. Every gesture has a visible equivalent. When
work is handed to an AI, the handover stays visible, steerable and reversible.


Sources: Sadana and others (2018) found that 1 person in 16 discovered a hidden hold-and-swipe
gesture. Bainbridge (1983) on what automation takes from people, and Amershi and others (2019)
on correcting and dismissing AI. Applying this to AI handovers is a judgment.

## Craft

Care for every detail, and own taste as taste. Measured limits are cited and held, and
everything else, such as corner radius or the accent hue, is called a judgment. What the system
says about itself is true.

Source: a judgment, openly. Taste decides the look. The person's limits and the job decide
everything else.

## How Kookie decides

- **Correct over popular:** Kookie chooses what is right over what is easy to adopt. Research on
  how people see and use interfaces decides what is right, and so does whether products built on
  Kookie are better.
- **Patterns before components:** A pattern is a problem that recurs, with a known solution. A
  component is a pattern packaged for reuse. A pattern that coordinates several parts, such as an
  app frame, ships as one component that arranges them.
- **The right thing by default:** The correct result is what you get when you don't think about
  it. In a narrow window, a dialog becomes a sheet with no prop. Where the answer depends on your
  product, Kookie gives you the tool and makes no decision.
- **The trade-off:** Kookie gives you fewer overrides, and in return your screens stay consistent
  as the app grows. `style` and `className` remain available, and both are easy to find in a
  review.
