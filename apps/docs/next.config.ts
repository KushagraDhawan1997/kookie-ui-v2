import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // `next dev` otherwise writes AGENTS.md and a CLAUDE.md into apps/docs on every run. In
  // this repo CLAUDE.md is the governance document — the file an agent session reads as
  // project instructions — so a framework generating one is not untidy, it is a second
  // uninvited voice in the place the rules live. (Observed doing exactly that during the
  // 2026-08-06 audit: a dev run wrote one and the next session picked it up.) The tree
  // stays authored; the Next docs remain in node_modules for anyone who wants them.
  agentRules: false,
};

export default nextConfig;
