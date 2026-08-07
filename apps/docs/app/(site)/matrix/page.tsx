import type { Metadata } from "next";

import { MatrixExplorer } from "./matrix-explorer";

export const metadata: Metadata = {
  title: "Judging matrix — KookieUI",
  description:
    "Every shipped control across size × density, under switchable radius, pointer, surfaces and contrast — the eye pass happens here.",
};

export default function MatrixPage() {
  return <MatrixExplorer />;
}
