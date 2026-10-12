"use client";

/** The stills router for the launch film: one shot per `?shot=`. The shots live in shots.tsx so the
    Remotion film (apps/video) renders the same components. */
import * as React from "react";
import { Open, System, Rules, Sizes, Glass, Pill, Device, Idea, ThemeFlip, Colour, TypeScale, Space, Shape, Material, Adapt, Parts, Principles, Floor, Hero, HeroB, Nest, TouchType, SizeSnap, W, H } from "./shots";

type Params = Record<string, string | undefined>;

export default function Page({ searchParams }: { searchParams: Promise<Params> }) {
  const p = React.use(searchParams);
  const shot = p.shot ?? "open";
  return (
    <div style={{ width: W, height: H }}>
      <style>{"nextjs-portal{display:none!important}"}</style>
      {shot === "open" && <Open />}
      {shot === "system" && <System material={p.material ?? "regular"} />}
      {shot === "rules" && <Rules />}
      {shot === "sizes" && <Sizes />}
      {shot === "glass" && <Glass material={p.material ?? "regular"} />}
      {shot === "pill" && <Pill />}
      {shot === "device" && <Device mode={p.mode === "phone" ? "phone" : "desktop"} />}
      {shot === "end" && <Open />}
      {shot === "idea" && <Idea step={Number(p.step ?? 1)} />}
      {shot === "flip" && <ThemeFlip />}
      {shot === "colour" && <Colour />}
      {shot === "type" && <TypeScale />}
      {shot === "space" && <Space />}
      {shot === "shape" && <Shape />}
      {shot === "material" && <Material />}
      {shot === "adapt" && <Adapt />}
      {shot === "parts" && <Parts />}
      {shot === "principles" && <Principles />}
      {shot === "floor" && <Floor tilt={Number(p.tilt ?? 58)} />}
      {shot === "hero" && <Hero dark={p.dark === "1"} />}
      {shot === "heroB" && <HeroB />}
      {shot === "nest" && <Nest />}
      {shot === "touchtype" && <TouchType />}
      {shot === "sizesnap" && <SizeSnap />}
    </div>
  );
}
