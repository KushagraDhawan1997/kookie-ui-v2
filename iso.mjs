import { chromium } from "/Users/kushagradhawan/Code/kookie-ui-v2/node_modules/.pnpm/playwright@1.62.1/node_modules/playwright/index.mjs";
const [mode, glintOn] = process.argv.slice(2);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 2 });
await p.goto("http://localhost:1403/preview/text-area", { waitUntil: "networkidle" });
await p.evaluate((m) => document.documentElement.setAttribute("data-appearance", m), mode);
await p.waitForTimeout(1500);
const el = p.locator('[data-material="regular"].kui-textarea').first();
await el.scrollIntoViewIfNeeded();
if (glintOn === "off") await el.evaluate((n) => n.style.setProperty("--kui-glint-on", "0"));
await p.waitForTimeout(300);
const box = await el.boundingBox();
const reader = await b.newPage();
const read = async (clip, horiz) => {
  const buf = await p.screenshot({ clip });
  return reader.evaluate(async ({b64, horiz}) => {
    const img = new Image(); img.src="data:image/png;base64,"+b64; await img.decode();
    const c=document.createElement("canvas"); c.width=img.width;c.height=img.height;
    const x=c.getContext("2d"); x.drawImage(img,0,0);
    const d=x.getImageData(0,0,img.width,img.height).data; const out=[];
    const n = horiz ? img.width : img.height;
    for(let i=0;i<n;i++){ const idx = horiz ? i*4 : i*img.width*4; out.push(d[idx]); }
    return out;
  }, {b64: buf.toString("base64"), horiz});
};
const top = await read({x: box.x+box.width/2, y: box.y-3, width:1, height:12}, false);
const bot = await read({x: box.x+box.width/2, y: box.y+box.height-9, width:1, height:12}, false);
const left = await read({x: box.x-3, y: box.y+box.height/2, width:12, height:1}, true);
const right = await read({x: box.x+box.width-9, y: box.y+box.height/2, width:12, height:1}, true);
console.log(`${mode} glint=${glintOn}`);
console.log(" top   ", top.join(" "));
console.log(" bottom", bot.join(" "));
console.log(" left  ", left.join(" "));
console.log(" right ", right.join(" "));
await b.close();
