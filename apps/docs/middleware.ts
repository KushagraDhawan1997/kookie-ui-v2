import { NextResponse, type NextRequest } from "next/server";

import { alternateLink, markdownRoute, prefersMarkdown } from "./app/(docs)/negotiate";

/**
 * The canonical URL answers in markdown when a client asks for markdown (2026-09-07, §47).
 *
 * The twin has been served at `<path>.md` since 2026-09-06, which requires the caller to know
 * our spelling. `Accept` is the platform's own way to ask, and this is the seam where the
 * question gets answered: a rewrite onto the twin's existing route, so there is one body and
 * one `markdownFor()` rather than a second renderer that agrees.
 *
 * TWO HEADERS ON EVERY PAGE, negotiated or not. `Vary: Accept` because the same URL now has two
 * representations and a cache that does not know that will hand a person a markdown file. And a
 * `Link` naming the alternate, so a client that would rather fetch the twin directly can find
 * it without being told the convention — which is the same job `llms.txt` does for the site as
 * a whole, one page at a time.
 *
 * THE MATCHER IS AUTHORED, and it has to be: Next statically analyses this object at build
 * time, so a list derived from `PAGES` would be read as no list at all. It cannot import
 * `PAGES` either — that module reaches the filesystem and every chapter's compiled MDX. So the
 * shape of a page URL is written here and a law compiles this exact array against `PAGES`,
 * which is what makes a new section fail CI rather than quietly lose its twin.
 *
 * Every path this site serves a twin for is two segments: a chapter carries its section
 * (`start/installation`), and components and blocks carry theirs. The dot exclusion keeps
 * `/components/button.md` out — middleware runs BEFORE `next.config.ts`'s rewrites, so the
 * twin's own URL arrives here first and must be left to the route it already has.
 */
export const config = {
  matcher: ["/((?:start|concepts|foundations|patterns|components|blocks)/[^/.]+)"],
};

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const response = prefersMarkdown(request.headers.get("accept"))
    ? NextResponse.rewrite(new URL(markdownRoute(pathname), request.url))
    : NextResponse.next();
  response.headers.set("Vary", "Accept");
  response.headers.set("Link", alternateLink(pathname));
  return response;
}
