import { SiteChrome } from "../site-chrome";

/** The site chrome, moved out of the root so /preview can own a full-viewport shell. The
    shell itself lives in site-chrome.tsx because not-found.tsx needs it too and cannot be in
    this group — Next wraps an unmatched URL in the ROOT layout only. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
