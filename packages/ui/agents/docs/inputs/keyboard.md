# Keyboard

Everything a person can do with a pointer, they can do with a keyboard. Kookie components follow
the keyboard conventions people already know, so you don't wire keys yourself.

## Show where focus is

One focus ring marks keyboard focus on every control, in the accent colour whatever the control's
tone. A text field shows its ring whenever the cursor is in it, because you type into a field
rather than press it. The [Interaction](/foundations/interaction) page describes the ring.

## Tab between groups, arrows within them

Tab moves between groups, and the arrow keys move inside one. A `Toolbar`, a `ToggleGroup`, the
tabs of `Tabs`, a `SegmentedControl` and a `RadioGroup` are each one tab stop. In a menu or a
select, the arrow keys move the highlight and Enter chooses. A plain `Button` inside a toolbar
adds its own tab stop, so use `ToolbarButton` there.

## Escape backs out

Escape closes a menu, a popover, a sheet or a dialog, and focus returns to the control that opened
it. In an `AlertDialog`, Escape works the same as Cancel.

## Step values with the arrows

The arrow keys move a `Slider` by one `step`, Shift with an arrow by `largeStep`, and Alt with an
arrow by `smallStep`. In a right-to-left page, the arrows follow the reading direction.
