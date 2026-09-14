import type { Metadata } from "next";

// The mark's face and its trimmed box are stated in the docs chrome's stylesheet.
import "../(docs)/prose.css";
import { BuilderApp } from "./builder-app";

export const metadata: Metadata = {
  title: "Builder — KookieUI",
  description:
    "Compose screens and blocks from KookieUI components — every distance a token, every axis a closed union — and export the React code a person would have written.",
};

export default function BuilderPage() {
  return <BuilderApp />;
}
