# Fonts

The site asks for no font file from this folder.

Its faces are Inter (reading and the wordmark), Inter Tight (headings) and JetBrains Mono (code).
All three are open source and arrive with `pnpm install`, so a fresh clone and the live site
render the same faces. `app/fonts.css` names them and `app/layout.tsx` imports them.

`.gitignore` carries a blanket rule against font files, and it stays: a licensed face must
never be committed to this public repository.
