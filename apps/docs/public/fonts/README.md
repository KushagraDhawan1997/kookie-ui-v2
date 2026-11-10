# Fonts

The two licensed faces this site uses are **deliberately not in the repository**.

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

Drop the `.woff2` files here, under exactly these names. `app/fonts.css` asks for them by name:

| File | Family |
| --- | --- |
| `PPAcma-Semibold.woff2` | PP Acma, the wordmark |
| `NeueMontrealMono.woff2`, `NeueMontrealMono-Medium.woff2` | Neue Montreal Mono, code |

Both are Pangram Pangram's. The reading and heading face is Inter, which is open source and
arrives with `pnpm install`, so it needs no file here.
