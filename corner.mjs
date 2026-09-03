import { chromium } from "/Users/kushagradhawan/Code/kookie-ui-v2/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs";
const [mode] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 3 });
await p.goto("http://localhost:1403/preview/text-area", { waitUntil: "networkidle" });
await p.evaluate((m) => document.documentElement.setAttribute("data-appearance", m), mode);
await p.waitForTimeout(1500);
const el = p.locator('[data-material="regular"].kui-textarea').first();
await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(300);
const box = await el.boundingBox();
await p.screenshot({ path: `corner-${mode}.png`, clip: { x: box.x-2, y: box.y-2, width: 26, height: 26 } });
const buf = await p.screenshot({ clip: { x: box.x-2, y: box.y-2, width: 26, height: 26 } });
const reader = await b.newPage();
const grid = await reader.evaluate(async (b64) => {
  const img=new Image(); img.src="data:image/png;base64,"+b64; await img.decode();
  const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
  const x=c.getContext("2d"); x.drawImage(img,0,0);
  const d=x.getImageData(0,0,img.width,img.height).data; const rows=[];
  for(let y=0;y<img.height;y+=1){ const r=[]; for(let X=0;X<img.width;X+=1){ r.push(d[(y*img.width+X)*4]); } rows.push(r); }
  return rows;
}, buf.toString("base64"));
grid.forEach((r,i)=>console.log(String(i).padStart(2), r.map(v=>String(v).padStart(3)).join(" ")));
await b.close();
