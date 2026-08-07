import type { Metadata } from "next";

import { PreviewApp } from "./preview-app";

export const metadata: Metadata = {
  title: "Preview · KookieUI",
  description: "Every shipped component, every size, density and state, in one place.",
};

export default function PreviewPage() {
  return <PreviewApp />;
}
