import type { Metadata } from "next";

import { PreviewApp } from "./preview-app";

export const metadata: Metadata = {
  title: "Preview — Kookie UI",
  description: "Every shipped component, every size, density and state, in one place.",
  alternates: { canonical: "/preview" },
};

export default function PreviewPage() {
  return <PreviewApp />;
}
