# Bench

The same five heavy screens as Kookie UI v1's bench (`kookie-ui/apps/bench`), built from v2 components and measured with the same metric names, so the two libraries can be read side by side. A sixth screen, `glass`, is the Shell screen under a glass theme. CI runs it and fails when a number in `budget.json` gets worse.

| Screen | What it holds |
| --- | --- |
| `table` | 500 rows, each with an avatar, a status chip, a checkbox and a row menu |
| `form` | 40 groups of every field type |
| `menu` | a menu of 300 items in 10 groups |
| `dialogs` | a dialog with a form, a popover and a tooltip, opened and closed 100 times |
| `shell` | a sidebar of 200 rows under a floating toolbar, beside 60 cards, on the solid material |
| `glass` | the same frame on material `3`, so every floating band and card is glass |

What it measures, per screen, as the median of five runs:

- **Size:** the CSS and JS a production bundle ships, gzipped.
- **Render:** time to the first painted commit, and to repaint after every row changes.
- **Response:** the slowest interaction, from the browser's own event timing (what INP reports).
- **Smoothness:** frames over 25ms, and the mean frame, while the screen scrolls top to bottom in two seconds.
- **Glass:** how many elements paint a backdrop filter. The difference between `shell` and `glass` in the other numbers is what blur, the lens and the filters cost.
- **Memory:** DOM nodes and heap after a forced collection, and what 100 open-close cycles leave behind.

```sh
pnpm --filter bench bench          # measure and compare with the budget
pnpm --filter bench bench:update   # re-record the budget on purpose
pnpm --filter bench bench:serve    # look at the screens: http://localhost:4173/?scene=table
```

It reads the built stylesheet, so run `pnpm run build` first. Counts (bytes, DOM nodes, glass panes, leftovers after the cycles) fail on any increase. Times and heap sizes depend on the machine, so they are copied in from a CI run and fail only past 1.5× plus 5ms.
