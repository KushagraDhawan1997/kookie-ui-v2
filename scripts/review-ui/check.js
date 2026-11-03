/* The composition check, run on what the browser actually rendered.

   The builder's reviewer (`apps/docs/app/builder/review.ts`) knows the rules but only reads
   builder documents, so it never saw a docs example, a figure or an app screen. This reads the
   DOM instead, which every one of those ends up as. Components already stamp what a rule needs
   (`data-emphasis`, `data-tone`, `data-size`, `kui-*` classes), and geometry comes from layout.

   Every finding names its rule in RULES.md. A rule here must be one that no good screen
   breaks: a check that fires on good work teaches agents to dodge it (RULES.md, "How to work").

   Loaded into a page as a plain script; it defines `window.__kuiReview(options)`. */
(() => {
  const SCOPES =
    '[role="dialog"], [role="alertdialog"], .kd-figure-stage, .kd-band-stage, .kd-hero-stage, [data-review-scope]';
  const PANELS = '[role="dialog"]';
  const CLOSE_NAME = /^(close|dismiss|done)\b/i;
  // Tones that carry no extra colour: they don't count against the three-tone budget.
  const PLAIN_TONES = new Set(["neutral", "accent"]);

  const visible = (el) =>
    el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
    el.getBoundingClientRect().width > 0;

  const nameOf = (el) =>
    (el.getAttribute("aria-label") || el.textContent || "").trim().replace(/\s+/g, " ");

  const describe = (el) => {
    const label = nameOf(el).slice(0, 40);
    const cls = [...el.classList].filter((c) => c.startsWith("kui-")).slice(0, 2).join(".");
    return `<${el.tagName.toLowerCase()}${cls ? "." + cls : ""}>${label ? ` "${label}"` : ""}`;
  };

  // The wrong half of a do/don't figure breaks a rule on purpose. It is marked the way a reader
  // sees it, by its Wrong verdict glyph, and the check skips the smallest block holding that
  // glyph and something being judged. Nothing else is exempt.
  const deliberate = () =>
    [...document.querySelectorAll('[aria-label="Wrong"]')].map((mark) => {
      let el = mark.parentElement;
      while (el && !el.querySelector(".kui-control, .kui-surface:not(.kui-type)")) el = el.parentElement;
      return el;
    }).filter(Boolean);
  let skipped = [];

  // A scope's own elements: inside it, not inside a nested scope (a dialog opened from a
  // figure is its own screen, RULES 8), and not inside a deliberately wrong example.
  const own = (scope, selector) =>
    [...scope.querySelectorAll(selector)].filter(
      (el) =>
        visible(el) &&
        (el.parentElement.closest(SCOPES) ?? document.body) === scope &&
        !skipped.some((root) => root.contains(el)),
    );

  const alpha = (color) => {
    const m = color.match(/\/\s*([\d.]+%?)\s*\)$|rgba\([^)]*,\s*([\d.]+)\)$/);
    if (!m) return color === "transparent" ? 0 : 1;
    const v = m[1] ?? m[2];
    return v.endsWith("%") ? parseFloat(v) / 100 : parseFloat(v);
  };

  // Where an element's content starts: its first words or its icon, whichever is further left.
  // A row's fill hangs outside this edge (RULES 15), so a row is measured by its content.
  const start = (el) => {
    let left = Infinity;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(n);
      const r = range.getClientRects()[0];
      if (r) left = Math.min(left, r.left);
      break;
    }
    const icon = el.querySelector("svg");
    if (icon && visible(icon)) left = Math.min(left, icon.getBoundingClientRect().left);
    return left;
  };

  const isGlass = (el) => getComputedStyle(el).backdropFilter !== "none";

  const contentBox = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return {
      left: r.left + parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth),
      right: r.right - parseFloat(s.paddingRight) - parseFloat(s.borderRightWidth),
    };
  };

  const RULES = [
    {
      id: "one-figure",
      run(scope, out) {
        // A disabled control is not the figure; it can't be pressed.
        const loud = own(scope, '.kui-control[data-emphasis="loud"]').filter(
          (el) => !el.matches(":disabled, [aria-disabled='true'], [data-disabled]"),
        );
        if (loud.length > 1)
          out(loud[1], `${loud.length} loud controls on one screen: ${loud.map(describe).join(", ")}. Keep one.`);
      },
    },
    {
      id: "panel-close",
      run(scope, out) {
        if (!scope.matches(PANELS)) return;
        const buttons = own(scope, "button, [role=button]");
        if (!buttons.some((b) => CLOSE_NAME.test(nameOf(b))))
          out(scope, "This panel has no Close button. Every titled panel has Close at the end of its band.");
      },
    },
    {
      id: "hand-built-band",
      run(scope, out) {
        if (!scope.matches(PANELS)) return;
        const first = own(scope, ".kui-type, .kui-control")[0];
        if (!first) return;
        // The band is the row the panel's first element sits on: anything whose middle falls
        // inside that element's height.
        const row = first.getBoundingClientRect();
        for (const b of own(scope, "button, [role=button]")) {
          const r = b.getBoundingClientRect();
          const middle = (r.top + r.bottom) / 2;
          if (middle >= row.top && middle <= row.bottom && !b.closest(".kui-toolbar"))
            out(b, `${describe(b)} sits in the panel's top row outside a Toolbar. Use the band the component draws.`);
        }
      },
    },
    {
      // A Flex or Box inside a band, holding Back and a title at a hand-picked gap, skips the
      // band's own spacing (the row gap plus the title's air). Seen 2 Nov 2026: gap 2 between
      // Back and the title read cramped.
      id: "band-wrapper",
      run(scope, out) {
        // A cluster (`<Flex gap>{back}{title}</Flex>`) is how a band is written: the Flex says
        // which controls belong together and the toolbar spaces the clusters (toolbar.css). The
        // title's own air comes from ToolbarTitle and reaches inside a cluster. So the break is
        // a title in the band that isn't a ToolbarTitle, as Navigator's was on 2 Nov 2026: a
        // plain heading at the cluster's gap 2 beside Back, which read cramped.
        for (const bar of own(scope, ".kui-toolbar")) {
          const titles = [...bar.querySelectorAll(".kui-type")].filter(
            (t) => visible(t) && nameOf(t) && !t.closest(".kui-toolbar-title, .kui-control") && !t.parentElement.closest(".kui-type"),
          );
          for (const title of titles)
            out(title, `${describe(title)} is a title in the band that isn't a ToolbarTitle, so it misses the band's title spacing.`);
        }
      },
    },
    {
      id: "band-inset",
      run(scope, out) {
        // The band's edge buttons (Back at the leading edge, Close or actions at the trailing
        // one), each measured from the edge it stands against, against the content's inset.
        const measure = (container, bar, body) => {
          const panel = container.getBoundingClientRect();
          const edge = (el) => (el.matches(".kui-row") ? start(el) : el.getBoundingClientRect().left);
          const bodyInset = Math.min(...body.map((el) => edge(el) - panel.left).filter(Number.isFinite));
          // The band's outermost items: a button, or a ToolbarGroup holding several, whose own
          // edge is what stands against the panel's. Only the item nearest each edge is
          // measured, and only against the edge it stands beside.
          const items = [...bar.querySelectorAll("button, .kui-toolbar-group")]
            .filter((el) => visible(el) && !el.parentElement.closest(".kui-toolbar-group"));
          if (!items.length) return;
          const middle = (panel.left + panel.right) / 2;
          const rects = items.map((el) => ({ el, r: el.getBoundingClientRect() }));
          const lead = rects.reduce((a, b) => (b.r.left < a.r.left ? b : a));
          const trail = rects.reduce((a, b) => (b.r.right > a.r.right ? b : a));
          const edges = [];
          if (lead.r.left < middle) edges.push({ el: lead.el, inset: lead.r.left - panel.left });
          if (trail.r.right > middle) edges.push({ el: trail.el, inset: panel.right - trail.r.right });
          for (const { el, inset } of edges)
            if (inset >= bodyInset - 1)
              out(el, `${describe(el)} stands ${Math.round(inset)}px from the edge, the content ${Math.round(bodyInset)}px. The band sits one step closer to the edge.`);
        };
        if (scope.matches(PANELS)) {
          const bar = own(scope, ".kui-toolbar")[0];
          const body = own(scope, ".kui-type, .kui-control").filter((el) => !el.closest(".kui-toolbar"));
          if (bar && body.length) measure(scope, bar, body.slice(0, 1));
        }
        // A pane's band: ShellPaneHeader and ShellPaneFooter, pinned or floating (2 Nov 2026:
        // the reviewer caught a pinned header level with its content; this rule only read
        // dialogs until then).
        for (const bar of own(scope, ".kui-pane-header, .kui-pane-footer")) {
          const pane = bar.closest(".kui-shell-pane");
          if (!pane) continue;
          const body = [...pane.querySelectorAll(".kui-type, .kui-control")].filter(
            (el) => visible(el) && !el.closest(".kui-pane-header, .kui-pane-footer") && el.closest(".kui-shell-pane") === pane,
          );
          if (body.length) measure(pane, bar, body);
        }
      },
    },
    {
      id: "flow-cta-width",
      run(scope, out) {
        if (!scope.matches(PANELS) || !scope.querySelector(".kui-navigator")) return;
        for (const b of own(scope, '.kui-button[data-emphasis="loud"]')) {
          if (b.closest(".kui-toolbar")) continue;
          const box = contentBox(b.parentElement.closest(".kui-navigator-screen") ?? scope);
          const width = b.getBoundingClientRect().width;
          if (width < (box.right - box.left) * 0.97)
            out(b, `${describe(b)} is ${Math.round(width)}px wide in a ${Math.round(box.right - box.left)}px flow. A flow's main action is full width.`);
        }
      },
    },
    {
      id: "opaque-in-glass",
      run(scope, out) {
        if (!isGlass(scope)) return;
        for (const s of own(scope, ".kui-surface")) {
          if (s === scope || s.classList.contains("kui-control") || s.classList.contains("kui-type")) continue;
          const st = getComputedStyle(s);
          if (st.backdropFilter === "none" && alpha(st.backgroundColor) >= 0.99)
            out(s, `${describe(s)} is opaque inside a glass panel. Use a Card, which reads the glass around it.`);
        }
      },
    },
    {
      id: "size-1-retired",
      run(scope, out) {
        for (const t of own(scope, '.kui-type[data-size="1"]'))
          if (nameOf(t)) out(t, `${describe(t)} is size 1. Use size 2 or 3 in a muted ink.`);
      },
    },
    {
      id: "mixed-control-sizes",
      run(scope, out) {
        const rows = new Map();
        for (const b of own(scope, ".kui-button")) {
          if (b.closest(".kui-toolbar")) continue;
          const key = b.parentElement;
          rows.set(key, [...(rows.get(key) ?? []), b]);
        }
        for (const group of rows.values()) {
          const list = group.map((b) => Math.round(b.getBoundingClientRect().height));
          const heights = new Set(list);
          // Three or more sizes in rising order is a size ladder, shown on purpose.
          const ladder = list.length >= 3 && heights.size === list.length && list.every((h, i) => i === 0 || h > list[i - 1]);
          if (heights.size > 1 && !ladder)
            out(group[0], `Buttons side by side at ${[...heights].join(" and ")}px. Same job, same size.`);
        }
      },
    },
    {
      id: "tone-budget",
      run(scope, out) {
        const tones = new Set(
          own(scope, "[data-tone]").map((el) => el.dataset.tone).filter((t) => !PLAIN_TONES.has(t)),
        );
        if (tones.size > 3) out(scope, `${tones.size} tones on one surface (${[...tones].join(", ")}). Keep three or fewer.`);
      },
    },
    {
      // Words sliced off by an edge. A window may bleed off a figure's band; a sentence may not.
      id: "clipped-text",
      run(scope, out) {
        const clippers = (el) => {
          const out = [];
          for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
            const s = getComputedStyle(a);
            if (s.overflowX !== "visible" || s.overflowY !== "visible") out.push(a);
            if (a === scope) break;
          }
          return out;
        };
        for (const t of own(scope, ".kui-type")) {
          if (!nameOf(t) || t.querySelector(".kui-type")) continue;
          const r = t.getBoundingClientRect();
          const cut = clippers(t).find((c) => {
            const b = c.getBoundingClientRect();
            return r.right > b.right + 1 || r.left < b.left - 1 || r.bottom > b.bottom + 1;
          });
          if (cut) out(t, `${describe(t)} is cut off by the edge of ${describe(cut)}. Fit the words, or show less.`);
        }
      },
    },
    {
      // Kushagra, 2 Nov 2026: "I HATE AND LOATHE THE • THING, PURE SLOP. Less is more." No dot
      // glued between two facts: give each fact its own place, or drop one.
      id: "dot-separator",
      run(scope, out) {
        for (const t of own(scope, ".kui-type"))
          if (!t.querySelector(".kui-type") && /\s[·•∙⋅]\s|^[·•∙⋅]\s|\s[·•∙⋅]$/.test(t.textContent))
            out(t, `${describe(t)} joins facts with a dot. Give each its own place, or cut one.`);
      },
    },
    {
      // Kushagra, 2 Nov 2026: hover states and separators together read badly. A list divided
      // by lines doesn't light its rows; one lit by hover doesn't draw lines.
      id: "hover-with-separators",
      run(scope, out) {
        const pressable = "a[href], button, [role=button], [role=option], [role=menuitem], [role=row][tabindex]";
        // A row drawn lit (hover, highlight or selection fill) counts too: a figure shows the
        // state without anyone hovering it.
        const lit = (el) => el.matches(".kui-row") && alpha(getComputedStyle(el).backgroundColor) > 0;
        // A pressable row counts only if it really lights up under the pointer. The runner
        // hovers each one first (probe.mjs) and stamps what it saw; with no stamp (the check run
        // by hand in a console) a pressable row is assumed to light, the stricter reading.
        const lights = (el) => el.dataset.reviewLit !== "0";
        const pressableRow = (el) =>
          [el, el.querySelector(`:scope > :is(${pressable})`)].some((t) => t && t.matches(pressable) && lights(t));
        const row = (el) => visible(el) && !field(el) && (lit(el) || pressableRow(el));
        // A field (a Select's trigger, a text field) is bordered and pressable but is not a row.
        const field = (el) => !!el.closest(".kui-field, .kui-field-group > .kui-control");
        const lined = (el) => {
          if (field(el)) return false;
          const s = getComputedStyle(el);
          return (
            (parseFloat(s.borderBottomWidth) > 0 && alpha(s.borderBottomColor) > 0) ||
            (parseFloat(s.borderTopWidth) > 0 && alpha(s.borderTopColor) > 0)
          );
        };
        const lists = new Set();
        // A list's lines run across it. A vertical rule between toolbar buttons divides groups
        // of controls, not rows.
        for (const sep of own(scope, '.kui-separator, [role="separator"], hr'))
          if (sep.getAttribute("aria-orientation") !== "vertical" && sep.dataset.orientation !== "vertical" && !sep.parentElement.matches(".kui-toolbar, [role=toolbar]"))
            lists.add(sep.parentElement);
        // Lines drawn as row borders make a list only when two or more rows draw them.
        const bordered = new Map();
        for (const el of own(scope, ".kui-row, " + pressable))
          if (lined(el)) bordered.set(el.parentElement, (bordered.get(el.parentElement) ?? 0) + 1);
        for (const [list, n] of bordered) if (n >= 2) lists.add(list);
        for (const list of lists)
          if ([...list.children].some(row))
            out(list, `${describe(list)} draws lines between rows and also lights a row. Drop the lines or the hover.`);
      },
    },
    {
      // Kushagra, 2 Nov 2026: in a list, sidebar or group, the group's label, every row's text
      // and the separators start on one left edge. A selection or hover fill sits outside that
      // edge; it never pushes the text in.
      id: "text-axis",
      run(scope, out) {
        // A tree indents each level on purpose; its rows are not one axis.
        const groups = new Set(own(scope, ".kui-row").filter((r) => !r.closest(".kui-tree, [role=tree]")).map((r) => r.parentElement));
        for (const group of groups) {
          const rows = [...group.children].filter((c) => c.matches(".kui-row") && visible(c));
          // Rows at several sizes are a size specimen; their edges move with the size on purpose.
          if (rows.length < 2 || new Set(rows.map((r) => r.dataset.size)).size > 1) continue;
          const edges = rows.map((r) => ({ el: r, left: start(r) }));
          for (const sep of group.querySelectorAll(":scope > .kui-separator, :scope > [role=separator]"))
            if (visible(sep)) edges.push({ el: sep, left: sep.getBoundingClientRect().left });
          // The group's label: the text just before the rows, in the same column.
          const label = group.previousElementSibling;
          if (label && label.matches(".kui-type") && visible(label) && nameOf(label)) edges.push({ el: label, left: start(label) });
          const lefts = edges.map((e) => e.left).filter(Number.isFinite);
          const spread = Math.max(...lefts) - Math.min(...lefts);
          if (spread > 1.5) {
            const odd = edges.reduce((a, b) => (Math.abs(b.left - lefts[0]) > Math.abs(a.left - lefts[0]) ? b : a));
            out(group, `${describe(group)} starts its text on ${new Set(lefts.map(Math.round)).size} left edges, ${Math.round(spread)}px apart (${describe(odd.el)}). Label, rows and lines share one edge; a fill sits outside it.`);
          }
        }
      },
    },
    {
      id: "accessible-name",
      run(scope, out) {
        for (const b of own(scope, "button, [role=button]"))
          if (!nameOf(b) && !b.getAttribute("aria-labelledby"))
            out(b, `${describe(b)} has no name. Give an icon-only control an aria-label.`);
      },
    },
  ];

  // `page: true` treats the whole document as a screen too, for an app rather than a docs page
  // (whose own chrome is not under review).
  // The rows rule 28 needs to see hovered: pressable rows in a list with lines between them.
  // Stamped so the runner can hover each and record whether it lights (probe.mjs).
  window.__kuiHoverCandidates = () => {
    const pressable = "a[href], button, [role=button], [role=option], [role=menuitem], [role=row][tabindex]";
    const found = [];
    for (const sep of document.querySelectorAll('.kui-separator, [role="separator"], hr'))
      for (const c of sep.parentElement?.children ?? [])
        for (const t of [c, c.querySelector(`:scope > :is(${pressable})`)])
          if (t && t.matches(pressable) && visible(t) && !t.closest(".kui-field") && !("reviewProbe" in t.dataset)) {
            t.dataset.reviewProbe = String(found.length);
            found.push(t);
          }
    return found.length;
  };

  // Each rule's words (title, severity, reason, RULES.md number) come from the list the
  // builder reads too, `apps/docs/app/builder/rules.json`. The runner loads it as
  // `window.__kuiRuleList` before this script. Only detection lives here.
  window.__kuiRuleIds = () => RULES.map((r) => r.id);

  window.__kuiReview = ({ only, page = false } = {}) => {
    const list = new Map((window.__kuiRuleList ?? []).map((r) => [r.id, r]));
    const missing = RULES.filter((r) => !list.get(r.id)?.checkedBy.includes("screen")).map((r) => r.id);
    if (missing.length) throw new Error(`rules.json has no screen rule for: ${missing.join(", ")}`);
    const findings = [];
    skipped = deliberate();
    // A figure showing two windows side by side shows two screens. Each top-level pane in a
    // figure stage becomes its own scope when there are two or more.
    for (const stage of document.querySelectorAll(".kd-figure-stage, .kd-band-stage, .kd-hero-stage")) {
      const panes = [...stage.querySelectorAll(".kui-surface:not(.kui-type):not(.kui-control)")].filter(
        (el) => visible(el) && el.parentElement.closest(".kui-surface:not(.kui-type):not(.kui-control), " + SCOPES) === stage,
      );
      if (panes.length >= 2) panes.forEach((el) => el.setAttribute("data-review-scope", ""));
    }
    const scopes = [...(page ? [document.body] : []), ...document.querySelectorAll(SCOPES)].filter(visible);
    for (const scope of scopes) {
      for (const rule of RULES) {
        if (only && !only.includes(rule.id)) continue;
        const words = list.get(rule.id);
        rule.run(scope, (el, message) =>
          findings.push({
            rule: rule.id,
            ref: words.rule ? `RULES.md ${words.rule}` : words.title,
            severity: words.severity,
            scope: describe(scope),
            message,
          }),
        );
      }
    }
    // A pane nested in a stage can report the same element twice; say it once.
    const seen = new Set();
    const unique = findings.filter((f) => !seen.has(f.rule + f.message) && seen.add(f.rule + f.message));
    return { scopes: scopes.length, findings: unique };
  };
})();
