import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * A block's source, off disk.
 *
 * Promoted out of the block page on 2026-09-06, when the markdown twin became its second
 * reader: a block IS its source, so the twin is mostly these files, and two readers of one
 * directory is two places that know where blocks live.
 *
 * NOT IN `blocks/` ITSELF, and the laws are why rather than taste: every source file in that
 * directory must be claimed by a block, because it is the set a consumer copies. This reads
 * that set and is not part of it.
 *
 * Scoped to the subfolder deliberately — Turbopack traces the whole project into the server
 * bundle when it cannot statically bound a filesystem read (the constraint `example.tsx` and
 * `toc.ts` both document). `process.cwd()` is apps/docs under dev, build and vitest alike.
 */
const BLOCKS_ROOT = path.join(process.cwd(), "blocks");

export const readBlockSource = (name: string): string =>
  readFileSync(path.join(BLOCKS_ROOT, name), "utf8");

/** A block's USAGE example — the call site, not the block. It lives outside `blocks/` because
    every file in that directory is something a consumer copies, and this is the opposite: it is
    what they write once they have. Same subfolder scoping, same reason. */
const USAGE_ROOT = path.join(process.cwd(), "examples", "blocks");

export const readBlockUsageSource = (slug: string): string =>
  readFileSync(path.join(USAGE_ROOT, `${slug}.tsx`), "utf8");

/** A file's fence language, from its extension. The registry law holds every listed file to
    an extension this map answers, so an unlisted kind fails the suite rather than a caller. */
export const blockLang = (name: string): string => {
  const ext = name.slice(name.lastIndexOf(".") + 1);
  return ext === "css" ? "css" : ext === "ts" ? "ts" : "tsx";
};
