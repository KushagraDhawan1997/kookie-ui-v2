/**
 * Browser laws. Everything here needs a real engine to answer, and every one of them was a
 * claim made in prose somewhere in DECISIONS.md before it was ever checked.
 */
import { beforeAll, describe, expect, it } from "vitest";

// The committed artifacts, not the generators: these tests are about what actually ships, and
// importing the generators would only prove the generators agree with themselves.
import layoutCss from "./layout.css?raw";
import tokensCss from "../tokens/tokens.css?raw";

beforeAll(() => {
  const sheet = document.createElement("style");
  sheet.textContent = `${tokensCss}\n${layoutCss}`;
  document.head.append(sheet);
});

function mount(html: string): HTMLElement {
  const host = document.createElement("div");
  host.innerHTML = html;
  document.body.append(host);
  return host;
}

const computed = (el: Element, prop: string) => getComputedStyle(el).getPropertyValue(prop).trim();

describe("the var chain actually resolves (§2)", () => {
  it("a space token reaches the rendered property, through three levels of indirection", () => {
    // --kui-p -> var(--layout-space-4) -> var(--space-4) -> calc(12px * var(--scale)) — what
    // the resolver actually writes (§3): layout props read the density-aware layer. Nothing
    // in the node suite can tell you this arrives; it only checks the text says the right thing.
    const host = mount(`<div class="kui-box" style="--kui-p: var(--layout-space-4)"></div>`);
    expect(computed(host.firstElementChild!, "padding-top")).toBe("12px");
  });

  it("the same token tightens under a compact scope — gap=\"4\" is a rhythm, not 16px (§12)", () => {
    // The layer is the whole point: the inherited --layout-space-4 was re-baked at the
    // [data-density] element, so a layout distance follows density while the raw palette
    // (and with it, control innards and this test's sibling above) holds still.
    const host = mount(
      `<div data-density="compact"><div id="probe" class="kui-box" style="--kui-p: var(--layout-space-4)"></div></div>`,
    );
    expect(computed(host.querySelector("#probe")!, "padding-top")).toBe("8px");
    const airy = mount(
      `<div data-density="comfortable"><div id="probe" class="kui-box" style="--kui-p: var(--layout-space-4)"></div></div>`,
    );
    expect(computed(airy.querySelector("#probe")!, "padding-top")).toBe("16px");
  });

  it("a nested default scope ESCAPES a compact ancestor — it re-declares, not inherits (§12)", () => {
    // Theme stamps data-density on every node, and custom properties inherit: without the
    // emitted [data-density="default"] block this rendered 8px — a compact region nobody
    // could opt back out of. Same law the pointer fine world holds (§16).
    const host = mount(
      `<div data-density="compact"><div data-density="default"><div id="probe" class="kui-box" style="--kui-p: var(--layout-space-4); height: var(--control-height-2)"></div></div></div>`,
    );
    const probe = host.querySelector("#probe")!;
    expect(computed(probe, "padding-top")).toBe("12px");
    expect(computed(probe, "height")).toBe("32px");
  });

  it("a raw value rides the same prop, which is what utility classes could never do", () => {
    const host = mount(`<div class="kui-box" style="--kui-p: 13px"></div>`);
    expect(computed(host.firstElementChild!, "padding-top")).toBe("13px");
  });

  it("an unset prop resolves to nothing rather than to a broken value", () => {
    const host = mount(`<div class="kui-box"></div>`);
    expect(computed(host.firstElementChild!, "padding-top")).toBe("0px");
  });
});

describe("@property { inherits: false } stops the value cascading (§2)", () => {
  it("a nested Box does not silently inherit its parent's gap", () => {
    // The failure this prevents: a component that never set `gap` quietly getting one from an
    // ancestor. Custom properties inherit by default, so without the registration this passes
    // a value down through the whole subtree.
    const host = mount(
      `<div class="kui-box" style="--kui-g: 40px"><div class="kui-box" id="child"></div></div>`,
    );
    expect(computed(host.querySelector("#child")!, "row-gap")).not.toBe("40px");
  });

  it("but a normal token still inherits, because those are meant to", () => {
    const host = mount(`<div style="--space-4: 99px"><div id="child" class="kui-box" style="--kui-p: var(--space-4)"></div></div>`);
    expect(computed(host.querySelector("#child")!, "padding-top")).toBe("99px");
  });
});

describe("container tiers arbitrate by slot, not by window (§2)", () => {
  it("a narrow container keeps the base value even on a wide screen", () => {
    const host = mount(
      `<div class="kui-box" style="width: 200px"><div id="child" class="kui-box" style="--kui-p: 4px; --kui-p-md: 40px"></div></div>`,
    );
    expect(computed(host.querySelector("#child")!, "padding-top")).toBe("4px");
  });

  it("a wide container takes the tier value", () => {
    const host = mount(
      `<div class="kui-box" style="width: 900px"><div id="child" class="kui-box" style="--kui-p: 4px; --kui-p-md: 40px"></div></div>`,
    );
    expect(computed(host.querySelector("#child")!, "padding-top")).toBe("40px");
  });

  it("a tier falls back down the chain when its own value is unset", () => {
    const host = mount(
      `<div class="kui-box" style="width: 900px"><div id="child" class="kui-box" style="--kui-p: 4px; --kui-p-sm: 20px"></div></div>`,
    );
    expect(computed(host.querySelector("#child")!, "padding-top")).toBe("20px");
  });

  it("a Box with no ancestor container stays at its base values — tiers read the SLOT", () => {
    // The sharp edge, pinned: a tier reads the nearest ancestor query container, and a Box is
    // a container for its CHILDREN, never for itself. The outermost Box in a tree therefore
    // has no tier context at all — found when the preview's grid rig sat at one column at
    // every width. Decided 2026-08-02: Theme's element is a container too (.kui-theme), so in
    // an app this edge only exists OUTSIDE any Theme — which is what this law pins.
    const host = mount(
      `<div style="width: 900px"><div id="probe" class="kui-box" style="--kui-p: 4px; --kui-p-md: 40px"></div></div>`,
    );
    expect(computed(host.querySelector("#probe")!, "padding-top")).toBe("4px");
  });

  it("structural props ride the same pipe, which is why this is not a spacing mechanism", () => {
    const host = mount(
      `<div class="kui-box" style="width: 900px"><div id="child" class="kui-box" style="--kui-fd: column; --kui-fd-md: row"></div></div>`,
    );
    expect(computed(host.querySelector("#child")!, "flex-direction")).toBe("row");
  });
});

describe("what containment does and does not cost (§2)", () => {
  it("height still comes from content — inline-size containment leaves the block axis alone", () => {
    // The commonly-claimed container-query trap, checked rather than believed: only
    // `container-type: size` freezes the block axis. Ours is inline-size.
    const host = mount(
      `<div class="kui-box" id="probe"><div style="height: 300px"></div></div>`,
    );
    expect(computed(host.querySelector("#probe")!, "height")).toBe("300px");
  });

  it("a container inside a container reads ITS slot, not the outer one", () => {
    const host = mount(
      `<div class="kui-box" style="width: 900px">
        <div class="kui-box" style="width: 300px">
          <div id="probe" class="kui-box" style="--kui-p: 4px; --kui-p-md: 40px"></div>
        </div>
      </div>`,
    );
    // The outer slot is md-wide; the probe's own slot is 300px, so base wins.
    expect(computed(host.querySelector("#probe")!, "padding-top")).toBe("4px");
  });

  it("does NOT hijack positioning — a Box is not a containing block", () => {
    // Worth pinning because the containment spec reads as though it should: `container-type`
    // applies layout containment, and layout containment is documented as making an element a
    // containing block for absolutely and fixed positioned descendants. Measured, neither is
    // caught — both still resolve against the viewport, exactly as with a plain div. So a
    // consumer's fixed overlay or absolute child behaves normally inside our layout, and if an
    // engine ever changes that, this law is where it shows up rather than in someone's app.
    const host = mount(
      `<div style="padding: 100px">
        <div class="kui-box" style="width: 400px">
          <div id="fixed" style="position: fixed; inset: 0"></div>
          <div id="abs" style="position: absolute; inset: 0"></div>
        </div>
      </div>`,
    );
    const viewport = `${document.documentElement.clientWidth}px`;
    expect(computed(host.querySelector("#fixed")!, "width")).toBe(viewport);
    expect(computed(host.querySelector("#abs")!, "width")).toBe(viewport);
  });

  it("the real cost, pinned: a bare Box as a flex item shrink-wraps to nothing", () => {
    // Inline-size containment makes the box contribute zero intrinsic inline size, so a flex
    // item at width:auto collapses regardless of content. The escape is any explicit width,
    // flexGrow, or flexBasis — documented in §2. If an engine change ever makes this pass
    // differently, the doc needs rewriting, which is why it is pinned.
    const host = mount(
      `<div style="display: flex; width: 600px">
        <div id="probe" class="kui-box">content that would normally size this</div>
      </div>`,
    );
    expect(computed(host.querySelector("#probe")!, "width")).toBe("0px");
  });

  it("and flexGrow is the one-prop escape", () => {
    const host = mount(
      `<div style="display: flex; width: 600px">
        <div id="probe" class="kui-box" style="--kui-fg: 1">content</div>
      </div>`,
    );
    expect(computed(host.querySelector("#probe")!, "width")).toBe("600px");
  });
});

describe("density and radius compose instead of racing (§6, §12)", () => {
  it("a nested density does not clobber an outer radius level", () => {
    // The argument that forced the control/surface band split: a custom property set by a
    // NEARER ancestor wins regardless of source order, so if both axes wrote the same token an
    // inner Theme setting only density would silently drop the outer Theme's radius. They are
    // safe only because density picks a step and the level prices it.
    // Read through real properties: getComputedStyle on a custom property hands back its
    // unresolved token stream (`calc(28px * 1)`), not a value, so a probe has to actually use it.
    const host = mount(
      `<div data-radius="none"><div data-density="compact">
        <div id="probe" style="height: var(--control-height-2); border-radius: var(--radius-control-2)"></div>
      </div></div>`,
    );
    const probe = host.querySelector("#probe")!;
    expect(computed(probe, "border-top-left-radius")).toBe("0px");
    expect(computed(probe, "height")).toBe("28px");
  });

  it("full pills the controls while the surfaces stay capped", () => {
    const host = mount(
      `<div data-radius="full">
        <div id="control" style="width: 80px; height: 32px; border-radius: var(--radius-control-2)"></div>
        <div id="surface" style="width: 80px; height: 80px; border-radius: var(--radius-surface-3)"></div>
      </div>`,
    );
    // A pill: CSS clamps border-radius to half the smaller dimension, so 9999px renders as 16px
    // on a 32px-tall control. The surface stays at its designed cap instead (§6).
    //
    // This probe read `var(--radius-surface)` until 2026-08-03 — a token deleted when the band
    // became size-indexed (LOG 2026-08-04 records the bare alias being rejected). An unset var
    // is invalid at computed-value time, so border-radius computed 0px and `0 < 100` passed
    // unconditionally: the assertion could not fail, whatever the surface band did.
    expect(computed(host.querySelector("#control")!, "border-top-left-radius")).toBe("9999px");
    const surface = parseFloat(computed(host.querySelector("#surface")!, "border-top-left-radius"));
    expect(surface).toBeGreaterThan(0);
    expect(surface).toBeLessThan(100);
  });

  it("an inner appearance overrides an outer one, so a forced-dark section works", () => {
    const host = mount(
      `<div data-appearance="light"><div data-appearance="dark"><div id="probe"></div></div></div>`,
    );
    const light = mount(`<div data-appearance="light"><div id="probe2"></div></div>`);
    expect(computed(host.querySelector("#probe")!, "--neutral-1")).not.toBe(
      computed(light.querySelector("#probe2")!, "--neutral-1"),
    );
  });
});
