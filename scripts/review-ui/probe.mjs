/* Put every row rule 28 asks about into :hover, and stamp whether it lit up.

   A page script can't force :hover, and a real pointer can't reach a figure's rows (a figure
   is an inert picture). Chromium's DevTools protocol can: `CSS.forcePseudoState` applies
   :hover to an element whatever sits over it. For each candidate the check names, compare
   its paint before and after. */
export async function probeHover(page) {
  const n = await page.evaluate(() => window.__kuiHoverCandidates());
  if (!n) return;
  const cdp = await page.context().newCDPSession(page);
  try {
    await cdp.send("DOM.enable");
    await cdp.send("CSS.enable");
    const { root } = await cdp.send("DOM.getDocument", { depth: 0 });
    const paint = (el) => {
      const s = getComputedStyle(el);
      return `${s.backgroundColor}|${s.backgroundImage}|${s.boxShadow}`;
    };
    for (let i = 0; i < n; i++) {
      const selector = `[data-review-probe="${i}"]`;
      const { nodeId } = await cdp.send("DOM.querySelector", { nodeId: root.nodeId, selector });
      if (!nodeId) continue;
      const row = page.locator(selector);
      const before = await row.evaluate(paint);
      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: ["hover"] });
      const after = await row.evaluate(paint);
      await cdp.send("CSS.forcePseudoState", { nodeId, forcedPseudoClasses: [] });
      await row.evaluate((el, lit) => (el.dataset.reviewLit = lit ? "1" : "0"), before !== after);
    }
  } finally {
    await cdp.detach();
  }
}
