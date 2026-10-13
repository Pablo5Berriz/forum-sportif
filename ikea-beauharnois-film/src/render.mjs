// Rendu image par image : Chromium (Playwright) → PNG → ffmpeg.
// Usage : node render.mjs <out.mp4|stills> [t0] [t1] [fps]   ou   node render.mjs stills 1.5 12 40.2 ...
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
const [mode, ...rest] = process.argv.slice(2);
const PORT = process.env.PORT || 8765;
const browser = await chromium.launch({ executablePath: process.env.CHROME || undefined, args: ['--font-render-hinting=none', '--disable-gpu-vsync'] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.error('PAGE', m.text()); });
page.on('pageerror', e => console.error('PAGEERR', e.message));
await page.goto(`http://127.0.0.1:${PORT}/src/film/index.html`);
await page.evaluate(() => window.ready);
const grab = async T => {
  const b64 = await page.evaluate(T => { renderFrame(T); return document.getElementById('c').toDataURL('image/png').split(',')[1]; }, T);
  return Buffer.from(b64, 'base64');
};
if (mode === 'stills') {
  const SD = process.env.STILLS || 'render/stills'; mkdirSync(SD, { recursive: true });
  for (const s of rest) { writeFileSync(`${SD}/t${String(s).padStart(6, '0')}.png`, await grab(parseFloat(s))); }
} else {
  const t0 = parseFloat(rest[0] ?? 0), t1 = parseFloat(rest[1] ?? 120), fps = parseInt(rest[2] ?? 30);
  const f0 = Math.round(t0 * fps), f1 = Math.round(t1 * fps);
  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(fps), mode], { stdio: ['pipe', 'inherit', 'inherit'] });
  const st = Date.now();
  for (let f = f0; f < f1; f++) {
    const buf = await grab(f / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if ((f - f0) % 150 === 0) console.log(`${mode} frame ${f}/${f1} ${((Date.now() - st) / 1000).toFixed(0)}s`);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r));
}
await browser.close();
