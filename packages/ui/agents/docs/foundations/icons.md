# Icons

An icon is a shortcut. It speeds up someone who already knows what it means, and slows down someone who doesn't. Use one when it does a job better than a word.

*Figure.* A notes app. Folders have an icon beside their name, search and a new note are icon-only buttons, and the notes themselves are words.

## When an icon helps

- **Standard actions:** close, search, add, delete, undo, share and back. These symbols are learned across apps.
- **Next to text in a list or navigation:** the icon helps the eye find the row, and the word says what it is.
- **State:** a change of shape, such as a filled star or a slashed bell, shows the change at a glance. Pair it with colour, never colour alone.
- **Things with a real look:** files, devices and places.

## When it doesn't

- **Rare or abstract actions:** use a word. If no symbol comes to mind quickly, there isn't one.
- **Hiding the main navigation behind an icon:** show the links.
- **Separating sections:** whitespace, type size, a rule or numbering do it better. The heading already says what the section is.
- **On only some items in a group:** use icons on all of them or none.
- **Two meanings, one icon:** each icon means one thing everywhere.

## Icon-only buttons

An icon-only button needs a name. [`iconOnly`](/components/button#props) makes the name required, and a tooltip shows it to people using a pointer. Use icon-only buttons for standard actions, or where space is short and the action is frequent.

## How Kookie sizes icons

Kookie ships no icon set. Bring your own, drawn on a 24-unit grid, and pass `iconStroke` (1.75) so it matches the glyphs Kookie draws.

The icon box follows the size you set on the control, and the pointer:

| Size | 1 | 2 | 3 | 4 |
|---|---|---|---|---|
| Fine pointer | 16 | 16 | 20 | 24 |
| Touch | 20 | 20 | 24 | 24 |

Density doesn't change the icon. It changes the space around it.

## Sources

- Wiedenbeck 1999: icon-only controls are slower to learn than labelled ones.
- McDougall, Curry & de Bruijn 1999: most symbols are not understood on sight.
- Nielsen Norman Group 2016: hidden navigation is used less and is slower. Colour plus icon is faster to scan than text alone.
- Everett & Byrne 2004: icons speed search when they are simple and distinct.
- WCAG 2.2, 1.4.1: colour can't be the only signal.
- The section-break rule is judgment. No interface study tests it.
