# Fonts

The three faces this site uses are **licensed and deliberately not in the repository**.

`Fontshare-FFL.txt`, beside this file, is the licence they travel under. Section 02 forbids
making the font software available "through another font website, font library, marketplace,
repository, download service … or publicly accessible servers". This repository is public, so
committing them would breach it. `.gitignore` carries a blanket `*.woff2` rule and it must stay:
never force-add one.

Self-hosting for this site is explicitly permitted — that is what these files do once you have
them.

## What a fresh clone gets

The system stack, and a 404 per face in the network panel. The build succeeds and the site is
fully readable; only the typeface is wrong. `app/fonts.css` carries the mechanism.

## To render the real faces locally

Download from [fontshare.com](https://www.fontshare.com) and drop the `.woff2` files here:

| File | Family |
| --- | --- |
| `Boska-Medium.woff2` | Boska, the wordmark |
| `Switzer.woff2`, `Switzer-Italic.woff2` | Switzer, reading and headings |
| `NeueMontrealMono.woff2`, `NeueMontrealMono-Medium.woff2` | Neue Montreal Mono, code |

Neue Montreal Mono is Pangram Pangram's rather than ITF's and comes from its own starter pack.
