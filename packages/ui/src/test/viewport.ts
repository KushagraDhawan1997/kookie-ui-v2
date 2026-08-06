/**
 * The browser project's pinned viewport (2026-08-05: WIDE on purpose — the default headless
 * window sat inside the narrow type band, so every law reading a step-9 size was silently
 * asserting against the narrow world). One home (2026-08-06): the config and both
 * band-resizing law files each carried their own copy of the pair.
 */
export const VIEWPORT = { width: 1280, height: 800 } as const;
