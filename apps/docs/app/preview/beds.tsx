/**
 * The standard backgrounds — ONE home (2026-08-19, Kushagra: material must be judged over
 * many grounds, and the set must be the same for every component; "one thing I hate the
 * most is inconsistency").
 *
 * Each bed is a different kind of ground a real app puts behind a surface:
 *
 *   plain    — the page's own calm ground (a token, not an image). The convergence case:
 *              glass over nothing to defend converges to the solid look.
 *   photo    — the photograph the package preview has always judged against.
 *   country  — a real outdoor photograph: natural detail, greens, a bright sky band.
 *   bloom    — near-black with a pale subject. The dark-alpha stress case.
 *   wave     — monochrome silver on black: does glass read with NO chroma to lean on?
 *   ink      — light cream with saturated ink. The light-mode ground with sharp detail.
 *   swirl    — saturated hues edge to edge. The saturation-ramp and ink-floor stress case.
 *   pattern  — flat illustrated shapes, high frequency. Blur and refraction are invisible
 *              over smooth gradients; this is where they show.
 *
 * Real photographs (Unsplash, chosen by Kushagra 2026-08-19; resampled to 2400px — a 5500px
 * original is page weight, not judgment). Adding a bed here adds it to every component's
 * Materials board at once.
 */
import * as React from "react";
import Image from "next/image";
import { Flex } from "@kookie-ui/react";

export type Bed = {
  id: string;
  name: string;
  /** Background image URL, or null for the plain page ground. */
  image: string | null;
};

export const BEDS: readonly Bed[] = [
  { id: "plain", name: "Plain ground", image: null },
  { id: "photo", name: "Photograph", image: "/backdrop.jpg" },
  { id: "country", name: "Countryside", image: "/beds/tanya-barrow-BUHgBZUc2rY-unsplash.jpg" },
  { id: "bloom", name: "Dark bloom", image: "/beds/evelyn-verdin-f1fizuWU14M-unsplash.jpg" },
  { id: "wave", name: "Silver wave", image: "/beds/philip-oroni-UcXbGzwwlJI-unsplash.jpg" },
  { id: "ink", name: "Ink wash", image: "/beds/susan-wilkinson-99PdsHVaEQs-unsplash.jpg" },
  { id: "swirl", name: "Vivid swirl", image: "/beds/ruliff-andrean-IfqKDhDpDPA-unsplash.jpg" },
  { id: "flow", name: "Blue flow", image: "/beds/boliviainteligente-NfEZoAaSS9s-unsplash.jpg" },
  { id: "pattern", name: "Pattern", image: "/beds/getty-images-tlgpcZ8vUiM-unsplash.png" },
];

export const PHOTO_BED = BEDS.find((b) => b.id === "photo")!;

/** One bed by id, loudly — a spec asking for a bed that left the set should fail its build,
    not render a bare region. */
export function bed(id: string): Bed {
  const found = BEDS.find((b) => b.id === id);
  if (!found) throw new Error(`no bed "${id}" — see BEDS in beds.tsx`);
  return found;
}

/**
 * A bed to place specimens on. By default it IS a backdrop region (§10 selectivity): content
 * passes behind everything placed on it, so the mark lives on the place and every specimen
 * inside expresses the theme's material without a prop of its own. `backdrop={false}` exists
 * for live toggles that demonstrate the mark itself.
 *
 * Sized like the original hostile bed (2026-08-08): tall enough for varied luminance behind
 * the glass, no taller, specimens centered so the bed reads as a bed and not a photo the
 * controls wandered onto.
 */
export function BedSurface({
  bed,
  backdrop = true,
  minHeight = "240px",
  children,
}: {
  bed: Bed;
  backdrop?: boolean;
  minHeight?: string;
  children: React.ReactNode;
}) {
  return (
    <Flex
      backdrop={backdrop}
      align="center"
      justify="center"
      gap="5"
      wrap="wrap"
      p="6"
      style={{
        // The image is a positioned child at z -1 (below), so the container must be its own
        // stacking context — without `isolation` the negative z resolves against the THEME's
        // frame (§20 isolates the root) and the bed slips behind the page's own background,
        // invisible. `overflow: clip` is what clips the image to the corner.
        position: "relative",
        isolation: "isolate",
        overflow: "clip",
        // The plain bed marks its region with the page's own next step — a token, so it
        // follows appearance; the point of this bed is a ground with nothing to defend
        // against.
        ...(bed.image ? {} : { background: "var(--neutral-2)" }),
        borderRadius: "var(--radius-surface-3)",
        minHeight,
      }}
    >
      {bed.image ? (
        // next/image, not a CSS background (2026-08-19, Kushagra: isolate the factors — a
        // page judging glass should not also be paying for a 2400px original on a phone).
        // The optimizer serves the rendered size in a modern format, and offscreen beds
        // lazy-load, so a preview page's weight is the beds you scrolled to, not the set.
        <Image
          src={bed.image}
          alt=""
          fill
          sizes="(max-width: 968px) 100vw, 920px"
          style={{ objectFit: "cover", zIndex: -1 }}
        />
      ) : null}
      {children}
    </Flex>
  );
}
