import { chromium } from 'playwright';
const b = await chromium.launch();
for (const h of [900, 700, 500]) {
  const page = await (await b.newContext({viewport:{width:1280,height:h},reducedMotion:'no-preference'})).newPage();
  await page.goto('http://localhost:1403/preview/select',{waitUntil:'networkidle'});
  const t = page.locator('button[aria-label="Machine"]').first();
  await t.scrollIntoViewIfNeeded(); await t.click();
  const r = await page.evaluate(async () => {
    const pick = () => [...document.querySelectorAll('.kui-floating')].pop();
    const trig = document.querySelector('button[aria-label="Machine"]');
    const rows=[], inner=[], settled=[], hFly=[], hLand=[];
    for (let i=0;i<130;i++){ await new Promise(r=>requestAnimationFrame(r));
      const el=pick(); if(!el) continue;
      const fly=el.hasAttribute('data-unfurling');
      const row=el.querySelector('[data-selected]');
      const off=row&&trig?row.getBoundingClientRect().top-trig.getBoundingClientRect().top:null;
      const hh=el.getBoundingClientRect().height;
      if(fly){ inner.push(el.scrollTop); hFly.push(hh); if(off!==null) rows.push(off); }
      else if(inner.length){ hLand.push(hh); if(off!==null) settled.push(off); }
    }
    const sp=a=>a.length?Math.max(...a)-Math.min(...a):NaN;
    return { flyFrames:inner.length, offsetSpread:Math.round(sp(inner)),
      landingRow:Math.round(Math.abs(rows.at(-1)??NaN)), rowCreep:Math.round(sp(settled)),
      lastFlyingH:Math.round(hFly.at(-1)??NaN), firstLandedH:Math.round(hLand[0]??NaN),
      heightStep:Math.round((hLand[0]??NaN)-(hFly.at(-1)??NaN)), heightCreep:Math.round(sp(hLand)) };
  });
  console.log(`h=${h}`, JSON.stringify(r));
  await page.context().close();
}
await b.close();
