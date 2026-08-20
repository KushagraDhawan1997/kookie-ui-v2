/**
 * /preview/<slug> — one standalone page per ported component (2026-08-19). The params
 * DERIVE from the registry: adding a component to previews/index.ts creates its page, and
 * nothing here is a second list to keep in step.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { COMPONENT_PREVIEWS } from "../previews";
import { ComponentPreviewApp } from "./preview-page";

export function generateStaticParams() {
  return COMPONENT_PREVIEWS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const preview = COMPONENT_PREVIEWS.find((p) => p.slug === slug);
  return {
    title: preview ? `${preview.name} preview · KookieUI` : "Preview · KookieUI",
    description: preview
      ? `${preview.name}: every size, state, material and permutation, standalone.`
      : undefined,
  };
}

export default async function ComponentPreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!COMPONENT_PREVIEWS.some((p) => p.slug === slug)) notFound();
  return <ComponentPreviewApp slug={slug} />;
}
