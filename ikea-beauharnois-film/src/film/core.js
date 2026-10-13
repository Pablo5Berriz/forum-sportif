// Noyau : palette, easing, texte, isométrie, carte. Tout est déterministe en fonction du temps t.
const W = 1920, H = 1080, FPS = 30, DUR = 120;

// Couleurs proches de l'univers IKEA (valeurs approximatives, pas une charte officielle).
const C = {
  blue: '#0058A3', blueD: '#003B6F', blueM: '#2F7BC0', blueL: '#DCE9F5', blueXL: '#EEF4FA',
  yellow: '#FFDB00', yellowD: '#E3B900',
  paper: '#F5F3EE', paper2: '#ECE8DF', paper3: '#E2DDD1',
  ink: '#15181D', ink2: '#3A3F47', grey: '#6A6F78', grey2: '#9AA0A8', line: '#D3CEC3',
  water: '#C8DCEB', waterD: '#AFCBE0',
  kraft: '#CFA77B', kraftD: '#AE8559', kraftL: '#E2C29C', wood: '#B48A5A', woodD: '#8E6A41',
  white: '#FFFFFF', green: '#2E7D4F'
};
const FONT = 'Inter, "Inter Display", Arial, sans-serif';

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const prog = (t, a, b) => clamp((t - a) / (b - a));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const eo = x => 1 - Math.pow(1 - x, 3);
const ei = x => x * x * x;
const eoExpo = x => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
const eioQ = x => x < .5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
const eoBack = x => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
// Entrée puis sortie : 0 → 1 → 0
const inout = (t, a, b, c, d) => t < b ? eo(prog(t, a, b)) : 1 - eio(prog(t, c, d));
// Pseudo-aléatoire stable
const rnd = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------- Texte ----------
function setFont(ctx, size, weight = 600) { ctx.font = `${weight} ${size}px ${FONT}`; }
function text(ctx, s, x, y, o = {}) {
  ctx.save();
  setFont(ctx, o.size || 32, o.weight || 600);
  ctx.fillStyle = o.color || C.ink;
  ctx.textAlign = o.align || 'left';
  ctx.textBaseline = o.base || 'alphabetic';
  ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
  if (o.ls !== undefined) ctx.letterSpacing = o.ls + 'px';
  if (o.halo) { ctx.lineWidth = o.halo; ctx.strokeStyle = o.haloColor || C.paper; ctx.lineJoin = 'round'; ctx.strokeText(s, x, y); }
  ctx.fillText(s, x, y);
  ctx.restore();
}
function textW(ctx, s, size, weight = 600, ls = 0) {
  ctx.save(); setFont(ctx, size, weight); ctx.letterSpacing = ls + 'px';
  const w = ctx.measureText(s).width; ctx.restore(); return w;
}
// Révélation par masque : le texte monte depuis sa ligne de base. p : 0→1 entrée, q : 0→1 sortie.
function reveal(ctx, s, x, y, o, p, q = 0) {
  if (p <= 0 || q >= 1) return;
  const size = o.size || 32;
  const w = textW(ctx, s, size, o.weight || 600, o.ls || 0);
  let x0 = x; if (o.align === 'center') x0 = x - w / 2; else if (o.align === 'right') x0 = x - w;
  ctx.save();
  ctx.beginPath(); ctx.rect(x0 - 20, y - size * 1.15, w + 40, size * 1.45); ctx.clip();
  const dy = (1 - eoExpo(p)) * size * 1.2 - eio(q) * size * 1.2;
  text(ctx, s, x, y + dy, o);
  ctx.restore();
}

// ---------- Formes ----------
function rrect(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function poly(ctx, pts) { ctx.beginPath(); pts.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.closePath(); }
function shade(hex, f) { // f<0 assombrit, f>0 éclaircit
  const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const m = f < 0 ? 0 : 255, k = Math.abs(f);
  r = Math.round(r + (m - r) * k); g = Math.round(g + (m - g) * k); b = Math.round(b + (m - b) * k);
  return `rgb(${r},${g},${b})`;
}

// Jeton : l'élément graphique récurrent (la commande / la palette suivie).
function token(ctx, x, y, s, o = {}) {
  ctx.save();
  ctx.translate(x, y); if (o.rot) ctx.rotate(o.rot);
  ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
  if (o.shadow !== false) { ctx.shadowColor = 'rgba(0,30,60,0.25)'; ctx.shadowBlur = s * 0.5; ctx.shadowOffsetY = s * 0.15; }
  ctx.fillStyle = C.yellow; rrect(ctx, -s / 2, -s / 2, s, s, s * 0.14); ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = C.blue; rrect(ctx, -s * 0.16, -s * 0.16, s * 0.32, s * 0.32, s * 0.05); ctx.fill();
  ctx.restore();
}
function pulse(ctx, x, y, t, o = {}) {
  for (let i = 0; i < 3; i++) {
    const ph = ((t * (o.speed || 0.8)) + i / 3) % 1;
    ctx.save(); ctx.globalAlpha = (1 - ph) * 0.7 * (o.alpha === undefined ? 1 : o.alpha);
    ctx.strokeStyle = o.color || C.yellowD; ctx.lineWidth = 2.5;
    const r = (o.r0 || 14) + ph * (o.r1 || 70);
    ctx.strokeRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  }
}

// ---------- Isométrie ----------
const COS30 = 0.8660254, SIN30 = 0.5;
function iso(o, x, y, z) { return [o.ox + (x - y) * COS30 * o.s, o.oy + (x + y) * SIN30 * o.s - z * o.s]; }
// Boîte isométrique. cols = {top,l,r} ; seules les faces visibles sont dessinées.
function isoBox(ctx, o, x, y, z, w, d, h, cols, stroke) {
  const P = (a, b, c) => iso(o, a, b, c);
  const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const l = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
  const r = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
  ctx.save();
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.lineJoin = 'round'; }
  for (const [pts, c] of [[l, cols.l], [r, cols.r], [top, cols.top]]) {
    if (!c) continue; poly(ctx, pts); ctx.fillStyle = c; ctx.fill(); if (stroke) ctx.stroke();
  }
  ctx.restore();
}
// Palette isométrique : socle bois + pile de cartons kraft.
function isoPallet(ctx, o, x, y, z, k = 1, hi = false) {
  const w = 48 * k, d = 40 * k;
  isoBox(ctx, o, x, y, z, w, d, 5 * k, { top: C.wood, l: C.woodD, r: shade(C.woodD, -0.1) });
  const cols = hi ? { top: C.yellow, l: C.yellowD, r: shade(C.yellowD, -0.12) } : { top: C.kraftL, l: C.kraft, r: C.kraftD };
  isoBox(ctx, o, x + 1, y + 1, z + 5 * k, w - 2, d - 2, 18 * k, cols, 'rgba(0,0,0,0.12)');
  isoBox(ctx, o, x + 1, y + 1, z + 23 * k, w - 2, d - 2, 16 * k, cols, 'rgba(0,0,0,0.12)');
}

// ---------- Personnage stylisé (vue de face / profil simplifié) ----------
function person(ctx, x, y, s, o = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = o.body || C.blue, acc = o.acc || C.yellow;
  // jambes
  ctx.fillStyle = C.ink2; rrect(ctx, -14, -60, 12, 60, 5); ctx.fill(); rrect(ctx, 2, -60, 12, 60, 5); ctx.fill();
  // torse
  ctx.fillStyle = body; rrect(ctx, -22, -128, 44, 74, 14); ctx.fill();
  ctx.fillStyle = acc; ctx.fillRect(-22, -100, 44, 7);
  // bras
  const a = o.arm || 0;
  ctx.strokeStyle = body; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-18, -118); ctx.lineTo(-30, -78); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(18, -118); ctx.lineTo(18 + 30 * Math.cos(a), -118 + 40 * Math.sin(a + 1.1)); ctx.stroke();
  // tête
  ctx.fillStyle = o.skin || '#C99A74'; ctx.beginPath(); ctx.arc(0, -146, 17, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// ---------- Carte ----------
const D2R = Math.PI / 180;
function merc(lon, lat) { return [lon * D2R, Math.log(Math.tan(Math.PI / 4 + lat * D2R / 2))]; }
let GEO = null;
function prepGeo(raw) {
  const g = {};
  for (const k in raw) g[k] = raw[k].map(f => f.map(ring => ring.map(([lo, la]) => merc(lo, la))));
  GEO = g;
}
function cam(lon, lat, scale) { const [x, y] = merc(lon, lat); return { x, y, s: scale }; }
// Interpolation de caméra : zoom exponentiel, centre suivant la vitesse perçue.
function camLerp(A, B, t) {
  const s = Math.exp(lerp(Math.log(A.s), Math.log(B.s), t));
  const w = Math.abs(A.s - B.s) < 1e-6 ? t : (1 / A.s - 1 / s) / (1 / A.s - 1 / B.s);
  return { x: lerp(A.x, B.x, w), y: lerp(A.y, B.y, w), s };
}
function proj(c, lon, lat) { const [x, y] = merc(lon, lat); return [W / 2 + (x - c.x) * c.s, H / 2 - (y - c.y) * c.s]; }
function projM(c, m) { return [W / 2 + (m[0] - c.x) * c.s, H / 2 - (m[1] - c.y) * c.s]; }
function pathRings(ctx, c, feats, closed = true) {
  ctx.beginPath();
  for (const f of feats) for (const ring of f) {
    for (let i = 0; i < ring.length; i++) {
      const p = projM(c, ring[i]); if (i) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]);
    }
    if (closed) ctx.closePath();
  }
}
// Dessin de la carte. o.qc : intensité du surlignage Québec ; o.near : opacité de la couche locale ; o.draw : tracé progressif 0..1
function drawMap(ctx, c, o = {}) {
  ctx.fillStyle = C.water; ctx.fillRect(0, 0, W, H);
  const near = o.near || 0;
  ctx.save(); ctx.lineJoin = 'round';
  pathRings(ctx, c, GEO.far_usa); ctx.fillStyle = C.paper2; ctx.fill('evenodd');
  pathRings(ctx, c, GEO.far_can); ctx.fillStyle = C.white; ctx.fill('evenodd');
  if (o.qc) { pathRings(ctx, c, GEO.far_qc); ctx.fillStyle = `rgba(0,88,163,${0.07 * o.qc * (1 - near)})`; ctx.fill('evenodd'); }
  if (near > 0) { ctx.globalAlpha = near; pathRings(ctx, c, GEO.near_land); ctx.fillStyle = C.white; ctx.fill('evenodd'); ctx.globalAlpha = 1; }
  ctx.fillStyle = C.water;
  if (near < 1) { ctx.globalAlpha = 1 - near; pathRings(ctx, c, GEO.far_lakes); ctx.fill('evenodd'); ctx.globalAlpha = 1; }
  if (near > 0) { ctx.globalAlpha = near; pathRings(ctx, c, GEO.near_lakes); ctx.fill('evenodd'); ctx.globalAlpha = 1; }
  // rivières : épaisseur selon le zoom
  const rw = clamp(c.s / 9000, 1.2, 14);
  ctx.globalAlpha = 1 - near; pathRings(ctx, c, GEO.far_rivers, false); ctx.strokeStyle = C.water; ctx.lineWidth = rw; ctx.lineCap = 'round'; ctx.stroke(); ctx.globalAlpha = 1;
  if (near > 0) {
    ctx.globalAlpha = near;
    pathRings(ctx, c, GEO.near_rivers, false); ctx.lineWidth = rw * 1.6; ctx.stroke();
    pathRings(ctx, c, GEO.near_roads, false); ctx.strokeStyle = C.paper3; ctx.lineWidth = 2.2; ctx.stroke();
    ctx.globalAlpha = 1;
  }
  // frontières (tracé progressif possible)
  const dr = o.draw === undefined ? 1 : o.draw;
  if (dr > 0 && near < 1) {
    ctx.globalAlpha = 1 - near;
    ctx.save();
    if (dr < 1) { ctx.setLineDash([4000 * dr, 99999]); }
    pathRings(ctx, c, GEO.far_can); ctx.strokeStyle = C.line; ctx.lineWidth = 1.2; ctx.stroke();
    pathRings(ctx, c, GEO.far_usa); ctx.strokeStyle = C.paper3; ctx.lineWidth = 1; ctx.stroke();
    ctx.restore();
  }
  ctx.globalAlpha = 1;
  if (o.qc && near < 1) { pathRings(ctx, c, GEO.far_qc); ctx.strokeStyle = `rgba(0,88,163,${0.6 * o.qc * (1 - near)})`; ctx.lineWidth = 2; ctx.stroke(); }
  ctx.restore();
}
function cityDot(ctx, x, y, label, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha; if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = o.color || C.ink; ctx.beginPath(); ctx.arc(x, y, o.r || 6, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.white; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.restore();
  if (label) text(ctx, label, x + (o.dx === undefined ? 14 : o.dx), y + (o.dy === undefined ? 8 : o.dy),
    { size: o.size || 24, weight: o.weight || 600, color: o.tcolor || C.ink, halo: 6, haloColor: C.white, alpha: a, align: o.align || 'left', ls: o.ls || 0 });
}
// Arc de flux : courbe quadratique, tracé partiel 0..p, tête mobile.
function flowArc(ctx, a, b, p, o = {}) {
  if (p <= 0) return;
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy);
  const bend = o.bend === undefined ? 0.22 : o.bend;
  const cx = mx - dy / L * L * bend * (o.side || 1), cy = my + dx / L * L * bend * (o.side || 1) - L * 0.05;
  const N = 60, n = Math.max(2, Math.round(N * p));
  const pt = s => [(1 - s) * (1 - s) * a[0] + 2 * (1 - s) * s * cx + s * s * b[0], (1 - s) * (1 - s) * a[1] + 2 * (1 - s) * s * cy + s * s * b[1]];
  ctx.save();
  ctx.strokeStyle = o.color || C.blue; ctx.lineWidth = o.width || 3; ctx.lineCap = 'round';
  ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
  if (o.dash) ctx.setLineDash(o.dash);
  ctx.beginPath();
  for (let i = 0; i <= n; i++) { const q = pt((i / n) * p); if (i) ctx.lineTo(q[0], q[1]); else ctx.moveTo(q[0], q[1]); }
  ctx.stroke();
  ctx.restore();
  if (o.head !== false && p < 1) { const h = pt(p); token(ctx, h[0], h[1], o.headSize || 16, { shadow: false, alpha: o.alpha }); }
  return pt;
}
