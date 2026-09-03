import { chromium } from "/Users/kushagradhawan/Code/kookie-ui-v2/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:1403/preview/text-area", { waitUntil: "networkidle" });
await p.evaluate(() => document.documentElement.setAttribute("data-appearance", "light"));
await p.waitForTimeout(1500);
const out = await p.evaluate(() => {
  const rows = [];
  for (const el of document.querySelectorAll('[data-material="regular"]')) {
    const r = el.getBoundingClientRect();
    if (r.width < 8 || r.height < 8) continue;
    const cs = getComputedStyle(el);
    const before = getComputedStyle(el, "::before");
    const after = getComputedStyle(el, "::after");
    const g = el.style.getPropertyValue("--kui-glint");
    let dims = null;
    if (g) { const m = g.match(/base64,([^"]+)/); if (m) { const bin=atob(m[1]); const u=new Uint8Array([...bin].map(c=>c.charCodeAt(0))); const dv=new DataView(u.buffer); dims=[dv.getUint32(16),dv.getUint32(20)]; } }
    rows.push({ cls: el.className.toString(), box:[Math.round(r.width),Math.round(r.height)], map: dims,
      beforeBg: before.backgroundImage.slice(0,70), beforeOp: before.opacity, afterOp: after.opacity,
      bdf: cs.backdropFilter.slice(0,60) });
  }
  return rows;
});
console.log(JSON.stringify(out, null, 1));
await b.close();
