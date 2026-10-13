// Scènes S01 à S10. Chaque scène : draw(ctx, t) avec t = temps local en secondes (peut être <0 ou > durée).
const S = window.STR;
const LOC = {
  beau: [-73.8723, 45.3156], mtl: [-73.5673, 45.5017], wpg: [-97.1384, 49.8951],
  hfx: [-63.5752, 44.6488], tor: [-79.3832, 43.6532], qcLbl: [-71.5, 52.2], onLbl: [-86.0, 50.2]
};
// Destinations clients illustratives (dispersion autour du sud du Québec et de l'est de l'Ontario)
const CUST = Array.from({ length: 16 }, (_, i) => [LOC.beau[0] + (rnd(i + 3) - 0.45) * 6.5, LOC.beau[1] + (rnd(i + 40) - 0.35) * 3.2]);

const CAM = {
  wide0: cam(-81, 50.5, 2350),
  local: cam(-74.02, 45.36, 64000),
  local2: cam(-74.0, 45.355, 72000),
  net: cam(-80.6, 47.1, 2700),
  net2: cam(-80.6, 47.0, 2560)
};

function paperBg(ctx, c = C.paper) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
function footnote(ctx, s, a, dark = false) {
  text(ctx, s, 80, 1046, { size: 16, weight: 500, color: dark ? 'rgba(255,255,255,0.6)' : C.grey, alpha: a });
}
function card(ctx, x, y, w, h, o = {}) {
  ctx.save(); ctx.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
  ctx.shadowColor = 'rgba(20,30,40,0.12)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
  ctx.fillStyle = o.fill || C.white; rrect(ctx, x, y, w, h, o.r || 18); ctx.fill();
  ctx.restore();
}
function fmtNum(n) { return Math.round(n).toLocaleString('fr-CA').replace(/ | |,/g, ' '); }
function check(ctx, x, y, s, p, col = C.blue) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = s * 0.16; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.beginPath(); const a = [x - s * .35, y], b = [x - s * .08, y + s * .28], c2 = [x + s * .4, y - s * .3];
  const p1 = clamp(p * 2), p2 = clamp(p * 2 - 1);
  ctx.moveTo(...a); ctx.lineTo(lerp(a[0], b[0], p1), lerp(a[1], b[1], p1));
  if (p2 > 0) ctx.lineTo(lerp(b[0], c2[0], p2), lerp(b[1], c2[1], p2));
  ctx.stroke(); ctx.restore();
}

// =============== S01 — Ouverture : du Canada à Beauharnois ===============
const S01 = {
  dur: 10,
  cam(t) {
    const z = eio(prog(t, 1.4, 7.4));
    let c = camLerp(CAM.wide0, CAM.local, z);
    if (t > 7.4) c = camLerp(CAM.local, CAM.local2, prog(t, 7.4, 10.5));
    return c;
  },
  beauPos(t) { return proj(this.cam(t), ...LOC.beau); },
  draw(ctx, t) {
    const c = this.cam(t);
    const near = clamp((c.s - 12000) / 30000);
    drawMap(ctx, c, { draw: eio(prog(t, 0, 1.8)), qc: eo(prog(t, 0.8, 2.2)), near });
    // étiquettes provinces (vue large)
    const wideA = 1 - prog(c.s, 5000, 12000);
    const q = proj(c, ...LOC.qcLbl), on = proj(c, ...LOC.onLbl);
    text(ctx, S.s01.quebec, q[0], q[1], { size: 30, weight: 700, ls: 10, color: C.blue, align: 'center', alpha: eo(prog(t, 1.2, 2.2)) * wideA });
    text(ctx, S.s01.ontario, on[0], on[1], { size: 22, weight: 600, ls: 8, color: C.grey2, align: 'center', alpha: eo(prog(t, 1.4, 2.4)) * wideA });
    // Montréal
    const m = proj(c, ...LOC.mtl);
    cityDot(ctx, m[0], m[1], S.s01.montreal, { alpha: eo(prog(t, 3.6, 4.4)), size: 26, r: 7 });
    // Beauharnois
    const b = proj(c, ...LOC.beau);
    const ba = eo(prog(t, 4.6, 5.3));
    if (ba > 0) {
      pulse(ctx, b[0], b[1], t, { alpha: ba });
      token(ctx, b[0], b[1], 30 * eoBack(prog(t, 4.6, 5.3)));
      text(ctx, S.s01.beauharnois, b[0] + 30, b[1] + 9, { size: 28, weight: 700, color: C.ink, halo: 7, haloColor: C.white, alpha: ba });
    }
    // Bloc titre
    const out = prog(t, 9.0, 9.5);
    const g = ctx.createRadialGradient(0, H, 100, 0, H, 1250);
    g.addColorStop(0, 'rgba(245,243,238,0.97)'); g.addColorStop(0.6, 'rgba(245,243,238,0.88)'); g.addColorStop(1, 'rgba(245,243,238,0)');
    ctx.save(); ctx.globalAlpha = eo(prog(t, 5.3, 6.2)) * (1 - out); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    const bar = eo(prog(t, 5.5, 6.3)) * (1 - out);
    if (bar > 0) { ctx.fillStyle = C.yellow; ctx.fillRect(120, 640, 90 * bar, 8); }
    reveal(ctx, S.s01.title1, 120, 712, { size: 30, weight: 700, ls: 8, color: C.blue }, prog(t, 5.7, 6.5), out);
    reveal(ctx, S.s01.brand, 116, 836, { size: 118, weight: 800, ls: 2, color: C.blue }, prog(t, 6.4, 7.2), out);
    reveal(ctx, S.s01.title2a + '  +  ' + S.s01.title2b, 122, 906, { size: 38, weight: 600, color: C.ink }, prog(t, 7.0, 7.8), out);
    reveal(ctx, S.s01.title2en, 122, 952, { size: 22, weight: 500, color: C.grey, ls: 1 }, prog(t, 7.4, 8.2), out);
  }
};

// =============== S02 — Échelle : bâtiment isométrique + chiffres ===============
const BLD = { W: 1600, D: 700, Hh: 90 };
function drawBuilding(ctx, o, k, opt = {}) {
  // k : 0→1 montée des murs
  const h = BLD.Hh * k;
  // ombre portée
  ctx.save(); ctx.globalAlpha = 0.10 * k;
  poly(ctx, [iso(o, 0, BLD.D, 0), iso(o, BLD.W, BLD.D, 0), iso(o, BLD.W + 120, BLD.D + 90, 0), iso(o, 120, BLD.D + 90, 0)]);
  ctx.fillStyle = C.ink; ctx.fill(); ctx.restore();
  // dalle
  poly(ctx, [iso(o, -30, -30, 0), iso(o, BLD.W + 30, -30, 0), iso(o, BLD.W + 30, BLD.D + 30, 0), iso(o, -30, BLD.D + 30, 0)]);
  ctx.fillStyle = C.paper3; ctx.fill();
  if (h <= 0.5) return;
  isoBox(ctx, o, 0, 0, 0, BLD.W, BLD.D, h, { top: C.white, l: '#E4E7EB', r: '#CBD2DA' }, 'rgba(0,40,80,0.18)');
  // bande bleue en tête de mur
  const bh = Math.min(14, h);
  isoBox(ctx, o, 0, BLD.D - 0.01, h - bh, BLD.W, 0.01, bh, { l: C.blue });
  isoBox(ctx, o, BLD.W - 0.01, 0, h - bh, 0.01, BLD.D, bh, { r: C.blueD });
  // portes de quai sur les deux façades visibles
  const da = clamp((k - 0.6) / 0.4);
  if (da > 0) {
    ctx.save(); ctx.globalAlpha = da; ctx.fillStyle = '#5B6672';
    for (let i = 0; i < 26; i++) {
      const x = 90 + i * 54; if (x > BLD.W - 80) break;
      poly(ctx, [iso(o, x, BLD.D, 6), iso(o, x + 28, BLD.D, 6), iso(o, x + 28, BLD.D, 42), iso(o, x, BLD.D, 42)]); ctx.fill();
    }
    for (let i = 0; i < 11; i++) {
      const y = 80 + i * 54;
      poly(ctx, [iso(o, BLD.W, y, 6), iso(o, BLD.W, y + 28, 6), iso(o, BLD.W, y + 28, 42), iso(o, BLD.W, y, 42)]); ctx.fill();
    }
    ctx.restore();
  }
  // lanterneaux de toit (rythme graphique)
  if (opt.roof !== false) {
    ctx.save(); ctx.globalAlpha = 0.5 * da; ctx.strokeStyle = '#D9DEE4'; ctx.lineWidth = 1;
    for (let x = 100; x < BLD.W; x += 100) { const a = iso(o, x, 20, h), b = iso(o, x, BLD.D - 20, h); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    ctx.restore();
  }
}
function trailerIso(ctx, o, x, y, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  isoBox(ctx, o, x, y, 0, 34, 150, 44, { top: '#F7F8FA', l: '#C9D0D8', r: '#E3E7EC' }, 'rgba(0,0,0,0.15)');
  ctx.restore();
}
const S02 = {
  dur: 12,
  o: { ox: 610, oy: 330, s: 0.45 },
  tokenPos() { return iso(this.o, 630, BLD.D + 70, 0); },
  draw(ctx, t) {
    paperBg(ctx);
    const o = { ...this.o };
    // lente dérive de caméra
    const dz = 1 + 0.04 * prog(t, 0, 12);
    o.s *= dz; o.ox -= 20 * prog(t, 0, 12);
    // sol
    ctx.save(); ctx.globalAlpha = 0.6;
    ctx.strokeStyle = C.paper2; ctx.lineWidth = 1;
    for (let i = -6; i <= 24; i++) {
      const a = iso(o, i * 100, -600, 0), b = iso(o, i * 100, 1400, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke();
      const c2 = iso(o, -600, i * 100, 0), d = iso(o, 2400, i * 100, 0); ctx.beginPath(); ctx.moveTo(...c2); ctx.lineTo(...d); ctx.stroke();
    }
    ctx.restore();
    const k = eio(prog(t, 0.2, 2.0));
    drawBuilding(ctx, o, k);
    // remorques à quai (façade avant) et sur la façade droite
    for (let i = 0; i < 7; i++) {
      const ap = eo(prog(t, 1.6 + i * 0.12, 2.4 + i * 0.12));
      if (ap <= 0) continue;
      const x = 90 + [1, 3, 4, 7, 11, 16, 20][i] * 54 - 3;
      trailerIso(ctx, o, x, BLD.D + 8 + (1 - ap) * 120, ap);
    }
    // patinoires LNH sur le toit (comparaison d'échelle C1)
    const rk = prog(t, 6.2, 8.4);
    if (rk > 0) {
      let n = 0;
      for (let r = 0; r < 8; r++) for (let cc = 0; cc < 8; cc++) {
        if (n >= 61) break;
        const ap = eo(clamp(rk * 61 / 12 - n / 12));
        if (ap > 0) {
          const x0 = cc * 200, y0 = r * 87.5 + 1.25;
          ctx.save(); ctx.globalAlpha = ap * (1 - 0.55 * prog(t, 9.5, 11));
          ctx.beginPath();
          const pts = [];
          const R = 28, w = 196, hh = 85, cx0 = x0 + 2;
          const arcPts = (cx, cy, a0) => { for (let s2 = 0; s2 <= 4; s2++) { const a = a0 + s2 / 4 * Math.PI / 2; pts.push(iso(o, cx + R * Math.cos(a), cy + R * Math.sin(a), BLD.Hh)); } };
          arcPts(cx0 + w - R, y0 + R, -Math.PI / 2); arcPts(cx0 + w - R, y0 + hh - R, 0);
          arcPts(cx0 + R, y0 + hh - R, Math.PI / 2); arcPts(cx0 + R, y0 + R, Math.PI);
          poly(ctx, pts); ctx.fillStyle = 'rgba(0,88,163,0.10)'; ctx.fill(); ctx.strokeStyle = C.blueM; ctx.lineWidth = 1.2; ctx.stroke();
          ctx.restore();
        }
        n++;
      }
    }
    // jeton au quai
    const tp = this.tokenPos();
    const ta = 1 - prog(t, 1.2, 1.8);
    if (ta > 0) token(ctx, tp[0], tp[1] - 12, 28, { alpha: ta });
    // deux rôles
    const roof = iso(o, BLD.W * 0.5, BLD.D * 0.5, BLD.Hh);
    const ra = inout(t, 2.0, 2.8, 5.4, 6.0);
    if (ra > 0) {
      const roles = [[S.s02.roleA, S.s02.roleAsub, C.blue, 150, 150], [S.s02.roleB, S.s02.roleBsub, C.yellow, 690, 150]];
      roles.forEach(([a, b, col, x, y], i) => {
        const p = inout(t, 2.0 + i * 0.5, 2.8 + i * 0.5, 5.4, 6.0);
        ctx.save(); ctx.globalAlpha = p; ctx.strokeStyle = C.ink2; ctx.lineWidth = 1.5; ctx.setLineDash([4, 5]);
        ctx.beginPath(); ctx.moveTo(x + 20, y + 74); ctx.lineTo(roof[0] + (i ? 60 : -60), roof[1] - 10); ctx.stroke(); ctx.restore();
        ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = col; ctx.fillRect(x, y - 24, 22, 22); ctx.restore();
        text(ctx, a, x + 36, y - 4, { size: 30, weight: 700, alpha: p });
        text(ctx, b, x + 36, y + 32, { size: 24, weight: 500, color: C.grey, alpha: p });
      });
      // le "+" qui lie les deux rôles
      text(ctx, '+', 640, 150, { size: 44, weight: 800, color: C.blue, alpha: ra, align: 'center' });
    }
    // panneau chiffres
    const stats = [[S.s02.stat1, 5.4], [S.s02.stat2, 7.6], [S.s02.stat3, 9.4]];
    const px = 1330;
    stats.forEach(([st, t0], i) => {
      const p = eo(prog(t, t0, t0 + 0.7)); if (p <= 0) return;
      const y = 250 + i * 250;
      ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = i === 0 ? C.blue : i === 1 ? C.yellow : C.blueM; ctx.fillRect(px, y - 112, 6, 168 * p); ctx.restore();
      const pre = st.pre;
      text(ctx, pre, px + 30, y - 78, { size: 22, weight: 600, color: C.grey, alpha: p, ls: 2 });
      reveal(ctx, fmtNum(st.num), px + 26, y + 4, { size: 86, weight: 800, color: C.ink, ls: -1 }, prog(t, t0, t0 + 0.6));
      text(ctx, st.label, px + 30, y + 44, { size: 28, weight: 700, color: C.ink, alpha: p });
      text(ctx, st.sub, px + 30, y + 78, { size: 21, weight: 500, color: C.grey, alpha: eo(prog(t, t0 + 0.5, t0 + 1.1)) });
    });
    footnote(ctx, S.s02.source, eo(prog(t, 5.6, 6.4)));
  }
};

// =============== S03 — Réseau : carte des flux ===============
function networkLayer(ctx, c, t, o = {}) {
  const b = proj(c, ...LOC.beau);
  const sp = o.speed || 1;
  const arcs = [
    { to: LOC.wpg, t0: 2.4, d: 1.5, col: C.blue, w: 3.5, side: 1, bend: 0.18 },
    { to: LOC.hfx, t0: 2.9, d: 1.1, col: C.blue, w: 3.5, side: -1, bend: 0.2 },
    { to: LOC.tor, t0: 4.6, d: 1.0, col: C.blueM, w: 3, side: 1, bend: 0.25, dash: [10, 8] }
  ];
  arcs.forEach((a, i) => {
    const p = eio(prog(t, a.t0 * sp, (a.t0 + a.d) * sp));
    const e = proj(c, ...a.to);
    const pt = flowArc(ctx, b, e, p, { color: a.col, width: a.w, side: a.side, bend: a.bend, dash: a.dash, headSize: 18 });
    if (p >= 1 && pt) { // jetons circulants
      for (let k = 0; k < 2; k++) { const s = ((t * 0.28 + k * 0.5 + i * 0.17) % 1); const q = pt(s); token(ctx, q[0], q[1], 11, { shadow: false, alpha: 0.9 }); }
    }
  });
  // clients en ligne : arcs courts jaunes
  CUST.forEach((d, i) => {
    const t0 = (6.3 + i * 0.07) * sp;
    const p = eio(prog(t, t0, t0 + 0.7 * sp));
    const e = proj(c, ...d);
    flowArc(ctx, b, e, p, { color: C.yellowD, width: 2, bend: 0.3, side: i % 2 ? 1 : -1, head: false, alpha: 0.9 });
    if (p >= 1) { ctx.fillStyle = C.yellow; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(e[0], e[1], 6, 0, 7); ctx.fill(); ctx.stroke(); }
  });
  // villes
  const lw = proj(c, ...LOC.wpg), lh = proj(c, ...LOC.hfx), lt = proj(c, ...LOC.tor);
  cityDot(ctx, lw[0], lw[1], S.s03.winnipeg, { alpha: eo(prog(t, (3.7) * sp, 4.2 * sp)), color: C.blue, size: 26, align: 'center', dx: 0, dy: 38 });
  cityDot(ctx, lh[0], lh[1], S.s03.halifax, { alpha: eo(prog(t, 3.8 * sp, 4.3 * sp)), color: C.blue, size: 26 });
  cityDot(ctx, lt[0], lt[1], S.s03.toronto, { alpha: eo(prog(t, 5.4 * sp, 5.9 * sp)), color: C.blueM, size: 24, dx: -16, align: 'right', dy: 30 });
  // Beauharnois
  pulse(ctx, b[0], b[1], t, { r1: 40 });
  token(ctx, b[0], b[1], 26);
  return b;
}
function legend(ctx, t, items, x = 80, y = 820) {
  const a = eo(prog(t, items[0][2], items[0][2] + 0.5)); if (a <= 0) return;
  card(ctx, x, y, 620, 170, { alpha: a * 0.96 });
  items.forEach(([lbl, kind, t0], i) => {
    const p = eo(prog(t, t0, t0 + 0.5)); const yy = y + 48 + i * 44;
    ctx.save(); ctx.globalAlpha = p;
    if (kind === 'stores') { ctx.strokeStyle = C.blue; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + 30, yy - 8); ctx.lineTo(x + 78, yy - 8); ctx.stroke(); }
    if (kind === 'net') { ctx.strokeStyle = C.blueM; ctx.lineWidth = 3; ctx.setLineDash([10, 7]); ctx.beginPath(); ctx.moveTo(x + 30, yy - 8); ctx.lineTo(x + 78, yy - 8); ctx.stroke(); }
    if (kind === 'cust') { ctx.fillStyle = C.yellow; ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x + 54, yy - 8, 8, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.restore();
    text(ctx, lbl, x + 100, yy, { size: 23, weight: 600, alpha: p });
  });
}
const S03 = {
  dur: 11,
  cam(t) { const c = camLerp(CAM.local2, CAM.net, eio(prog(t, -0.2, 2.6))); if (t > 2.6) { const z = 1 + 0.045 * eioQ(prog(t, 2.6, 11.5)); c.s *= z; } return c; },
  beauPos(t) { return proj(this.cam(t), ...LOC.beau); },
  draw(ctx, t) {
    const c = this.cam(t);
    drawMap(ctx, c, { qc: 1 - prog(t, 0.5, 2.5) * 0.6, near: clamp((c.s - 12000) / 30000) });
    const m = proj(c, ...LOC.mtl);
    cityDot(ctx, m[0], m[1], S.s03.montreal, { alpha: 1 - prog(t, 0.6, 1.4), size: 26, r: 7 });
    networkLayer(ctx, c, t);
    legend(ctx, t, [[S.s03.legStores, 'stores', 2.6], [S.s03.legNetwork, 'net', 4.7], [S.s03.legCustomers, 'cust', 6.4]]);
    text(ctx, S.s03.note, 1840, 1000, { size: 17, weight: 500, color: C.grey, align: 'right', alpha: eo(prog(t, 7, 7.6)) });
    footnote(ctx, S.s03.source, eo(prog(t, 3, 3.6)));
  }
};

// =============== S04 — Réception : quai, palette, identification ===============
const S04 = {
  dur: 12,
  o: { ox: 1080, oy: 150, s: 1.6 },
  doors: [[40, 150], [260, 370], [480, 590]],
  palletPos(t) { const p1 = eio(prog(t, 3.8, 5.6)); return [lerp(8, 300, p1), 290]; },
  cam(t) { const o = { ...this.o }; const z = 1 + 0.05 * prog(t, 0, 12); o.s *= z; o.ox -= 50 * prog(t, 0, 12); o.oy -= 20 * prog(t, 0, 12); return o; },
  tokenScreen(t) {
    const o = this.cam(t); const pp = this.palletPos(t);
    const start = iso(o, pp[0] + 30, pp[1] + 25, 30);
    const p = eio(prog(t, 8.0, 11.6));
    return [lerp(start[0], 1420, p), lerp(start[1], 520, p)];
  },
  draw(ctx, t) {
    paperBg(ctx, C.paper2);
    const o = this.cam(t);
    // sol intérieur
    poly(ctx, [iso(o, 0, -400, 0), iso(o, 1200, -400, 0), iso(o, 1200, 900, 0), iso(o, 0, 900, 0)]); ctx.fillStyle = C.paper; ctx.fill();
    ctx.save(); ctx.strokeStyle = C.yellow; ctx.lineWidth = 4;
    for (const yy of [250, 380]) { const a = iso(o, 20, yy, 0), b = iso(o, 1200, yy, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); }
    ctx.restore();
    // remorque + cabine (à l'extérieur, derrière le mur)
    const tr = eio(prog(t, 0.6, 3.0));
    const tx = lerp(-1300, -446, tr);
    isoBox(ctx, o, tx - 150, 268, 8, 130, 94, 120, { top: '#3A4F6E', l: '#22324A', r: '#2C3E57' });
    isoBox(ctx, o, tx, 262, 20, 440, 106, 130, { top: '#FBFCFD', l: '#D3D9E0', r: '#E9EDF1' }, 'rgba(0,0,0,0.18)');
    // mur de quai percé de trois ouvertures
    const WH = 125, DH = 105;
    const P = (y, z) => iso(o, 0, y, z);
    ctx.beginPath();
    [P(-400, 0), P(900, 0), P(900, WH), P(-400, WH)].forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath();
    for (const [a2, b2] of this.doors) { [P(a2, 0), P(a2, DH), P(b2, DH), P(b2, 0)].forEach((p, i) => i ? ctx.lineTo(...p) : ctx.moveTo(...p)); ctx.closePath(); }
    ctx.fillStyle = '#D9DEE4'; ctx.fill('evenodd');
    poly(ctx, [iso(o, -16, -400, WH), iso(o, 0, -400, WH), iso(o, 0, 900, WH), iso(o, -16, 900, WH)]); ctx.fillStyle = C.ink2; ctx.fill();
    // portes sectionnelles : fermées (1 et 3), ouverture de la 2
    const op = eo(prog(t, 2.8, 3.6));
    this.doors.forEach(([a2, b2], i) => {
      const z0 = i === 1 ? DH * op : 0;
      if (z0 < DH) {
        poly(ctx, [P(a2, z0), P(b2, z0), P(b2, DH), P(a2, DH)]); ctx.fillStyle = '#A9B3BE'; ctx.fill();
        ctx.strokeStyle = '#8E99A6'; ctx.lineWidth = 1;
        for (let z = z0 + 12; z < DH; z += 14) { const p1 = P(a2, z), p2 = P(b2, z); ctx.beginPath(); ctx.moveTo(...p1); ctx.lineTo(...p2); ctx.stroke(); }
      }
      poly(ctx, [P(a2 - 8, 0), P(a2, 0), P(a2, DH + 8), P(a2 - 8, DH + 8)]); ctx.fillStyle = C.ink2; ctx.fill();
      poly(ctx, [P(b2, 0), P(b2 + 8, 0), P(b2 + 8, DH + 8), P(b2, DH + 8)]); ctx.fill();
      poly(ctx, [P(a2 - 8, DH), P(b2 + 8, DH), P(b2 + 8, DH + 8), P(a2 - 8, DH + 8)]); ctx.fill();
    });
    // niveleur de quai
    isoBox(ctx, o, 0, 262, 0, 46 * op, 106, 3, { top: C.yellow, l: C.yellowD, r: C.yellowD });
    // portique de lecture
    const ga = eo(prog(t, 2.0, 2.8));
    // palette (dessinée avant le montant avant du portique)
    const pp = this.palletPos(t);
    const morph = prog(t, 6.6, 7.6);
    const drawPal = () => { if (t > 3.7 && morph < 1) { ctx.save(); ctx.globalAlpha = (1 - morph) * eo(prog(t, 3.7, 4.1)); isoPallet(ctx, o, pp[0], pp[1], 0, 1.25, false); ctx.restore(); } };
    if (ga > 0) {
      ctx.save(); ctx.globalAlpha = ga;
      isoBox(ctx, o, 360, 240, 0, 10, 10, 120, { top: C.blue, l: C.blueD, r: C.blue });
      ctx.restore();
    }
    drawPal();
    if (ga > 0) {
      ctx.save(); ctx.globalAlpha = ga;
      isoBox(ctx, o, 360, 380, 0, 10, 10, 120, { top: C.blue, l: C.blueD, r: C.blue });
      isoBox(ctx, o, 360, 240, 120, 10, 150, 10, { top: C.blueM, l: C.blueD, r: C.blue });
      ctx.restore();
    }
    // faisceau de lecture
    const sc = prog(t, 5.4, 6.4);
    if (sc > 0 && sc < 1) {
      const z = lerp(118, 4, eio(sc));
      ctx.save(); ctx.globalAlpha = 0.8 * Math.sin(sc * Math.PI);
      poly(ctx, [iso(o, 290, 250, z), iso(o, 290, 380, z), iso(o, 370, 380, z), iso(o, 370, 250, z)]);
      ctx.fillStyle = 'rgba(255,219,0,0.6)'; ctx.fill(); ctx.restore();
    }
    // étiquettes
    const dl = iso(o, 0, 330, WH + 40);
    text(ctx, S.s04.dock, dl[0], dl[1], { size: 28, weight: 700, alpha: inout(t, 1.0, 1.6, 5.2, 5.8), halo: 7, haloColor: C.paper2 });
    const scl = iso(o, 365, 240, 175);
    const sa = inout(t, 5.9, 6.4, 8.6, 9.2);
    if (sa > 0) {
      card(ctx, scl[0] - 20, scl[1] - 70, 330, 66, { alpha: sa });
      check(ctx, scl[0] + 16, scl[1] - 37, 28, prog(t, 6.0, 6.5), C.blue);
      text(ctx, S.s04.scan, scl[0] + 44, scl[1] - 28, { size: 25, weight: 700, alpha: sa });
    }
    // morph palette → jeton suivi
    if (morph > 0) {
      const s0 = iso(o, pp[0] + 30, pp[1] + 25, 30);
      const ts = this.tokenScreen(t);
      const sz = lerp(110, 40, eio(morph));
      const tr2 = prog(t, 8.0, 11.6);
      if (tr2 > 0) {
        ctx.save(); ctx.strokeStyle = C.blue; ctx.lineWidth = 3; ctx.setLineDash([8, 8]); ctx.lineDashOffset = -t * 40;
        ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.lineTo(ts[0], ts[1]); ctx.stroke(); ctx.restore();
      }
      token(ctx, ts[0], ts[1], sz, { alpha: eo(morph) });
      const ua = inout(t, 7.6, 8.2, 10.8, 11.3);
      if (ua > 0) {
        const w = textW(ctx, S.s04.unit, 25, 700) + 40;
        card(ctx, ts[0] + 40, ts[1] - 29, w, 58, { alpha: ua });
        text(ctx, S.s04.unit, ts[0] + 60, ts[1] + 9, { size: 25, weight: 700, alpha: ua });
      }
    }
  }
};

// =============== S05 — Stockage automatisé : ASRS schématique ===============
const RK = { cols: 16, rows: 8, cw: 82, ch: 66, x0: 330, floor: 930 };
const cellXY = (c, r) => [RK.x0 + c * RK.cw, RK.floor - (r + 1) * RK.ch];
const OCC = (c, r) => rnd(c * 31 + r * 7 + 1) < 0.68;
const S05 = {
  dur: 14.5,
  target: [11, 5], retrieve: [4, 2],
  crane(t) {
    // position (x en colonnes, y en rangées) et charge
    const k0 = [-1.2, 0], k1 = this.target, k2 = this.retrieve, k3 = [16.4, 0];
    let x, y, load = 'none';
    if (t < 2.4) { x = k0[0]; y = 0; load = t > 1.9 ? 'token' : 'none'; }
    else if (t < 6.2) { const p = eio(prog(t, 2.6, 6.0)); x = lerp(k0[0], k1[0], p); y = lerp(k0[1], k1[1], eioQ(p)); load = 'token'; }
    else if (t < 7.2) { x = k1[0]; y = k1[1]; load = t < 6.8 ? 'token' : 'none'; }
    else if (t < 9.6) { const p = eio(prog(t, 7.2, 9.4)); x = lerp(k1[0], k2[0], p); y = lerp(k1[1], k2[1], p); }
    else if (t < 10.4) { x = k2[0]; y = k2[1]; load = t > 10.0 ? 'other' : 'none'; }
    else { const p = eio(prog(t, 10.4, 12.6)); x = lerp(k2[0], k3[0], p); y = lerp(k2[1], 0, p); load = t < 12.4 ? 'other' : 'none'; }
    return { x, y, load };
  },
  palletFront(ctx, x, y, hi, a = 1) {
    ctx.save(); ctx.globalAlpha *= a;
    ctx.fillStyle = C.wood; ctx.fillRect(x + 6, y + RK.ch - 10, RK.cw - 12, 7);
    ctx.fillStyle = hi ? C.yellow : C.kraft; ctx.fillRect(x + 9, y + 12, RK.cw - 18, RK.ch - 22);
    ctx.fillStyle = hi ? C.yellowD : C.kraftD; ctx.fillRect(x + 9, y + 12 + (RK.ch - 22) / 2 - 1, RK.cw - 18, 2);
    if (hi) { ctx.fillStyle = C.blue; ctx.fillRect(x + RK.cw / 2 - 7, y + RK.ch / 2 - 4, 14, 14); }
    ctx.restore();
  },
  draw(ctx, t) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0C3157'); g.addColorStop(1, '#06223F');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const inv = eio(prog(t, 12.2, 13.4)); // bascule vers l'inventaire numérique
    // rack arrière (parallaxe)
    ctx.save(); ctx.globalAlpha = 0.18 * (1 - inv); ctx.strokeStyle = '#7FA6CC'; ctx.lineWidth = 1;
    const off = -30 * prog(t, 0, 14.5);
    for (let c = 0; c <= 22; c++) { const x = 140 + c * 62 + off; ctx.beginPath(); ctx.moveTo(x, 300); ctx.lineTo(x, 900); ctx.stroke(); }
    for (let r = 0; r <= 12; r++) { const y = 900 - r * 50; ctx.beginPath(); ctx.moveTo(140 + off, y); ctx.lineTo(1504 + off, y); ctx.stroke(); }
    ctx.restore();
    // cellules
    const cr = this.crane(t);
    for (let c = 0; c < RK.cols; c++) for (let r = 0; r < RK.rows; r++) {
      const [x, y] = cellXY(c, r);
      const isT = c === this.target[0] && r === this.target[1];
      const isR = c === this.retrieve[0] && r === this.retrieve[1];
      let occ = OCC(c, r);
      if (isT) occ = t > 6.8; if (isR) occ = t < 10.0;
      const appear = eo(prog(t, 0.1 + (c + r) * 0.02, 0.6 + (c + r) * 0.02));
      if (inv < 1 && occ) this.palletFront(ctx, x, y, isT, appear * (1 - inv));
      if (inv > 0) {
        ctx.save(); ctx.globalAlpha = inv;
        const m = 8;
        if (occ) { ctx.fillStyle = isT ? C.yellow : 'rgba(47,123,192,0.85)'; ctx.fillRect(x + m, y + m, RK.cw - 2 * m, RK.ch - 2 * m); }
        else { ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1.5; ctx.strokeRect(x + m, y + m, RK.cw - 2 * m, RK.ch - 2 * m); }
        ctx.restore();
      }
    }
    // structure du rack
    ctx.save(); ctx.globalAlpha = (1 - inv) * eo(prog(t, 0, 0.8)); ctx.strokeStyle = '#D6E3F0'; ctx.lineWidth = 2;
    for (let c = 0; c <= RK.cols; c++) { const x = RK.x0 + c * RK.cw; ctx.beginPath(); ctx.moveTo(x, RK.floor); ctx.lineTo(x, RK.floor - RK.rows * RK.ch); ctx.stroke(); }
    for (let r = 0; r <= RK.rows; r++) { const y = RK.floor - r * RK.ch; ctx.beginPath(); ctx.moveTo(RK.x0, y); ctx.lineTo(RK.x0 + RK.cols * RK.cw, y); ctx.stroke(); }
    // rails bas et haut
    ctx.fillStyle = '#9FB7CF'; ctx.fillRect(120, RK.floor + 6, 1700, 6); ctx.fillRect(120, RK.floor - RK.rows * RK.ch - 22, 1700, 5);
    // convoyeurs d'entrée / sortie
    ctx.fillStyle = '#5F7FA0'; ctx.fillRect(80, RK.floor - 8, 230, 10); ctx.fillRect(RK.x0 + RK.cols * RK.cw + 20, RK.floor - 8, 260, 10);
    ctx.restore();
    // transstockeur (crane)
    if (inv < 1) {
      ctx.save(); ctx.globalAlpha = 1 - inv;
      const cx = RK.x0 + cr.x * RK.cw + RK.cw / 2;
      const top = RK.floor - RK.rows * RK.ch - 22;
      ctx.fillStyle = C.yellow; ctx.fillRect(cx - 7, top, 14, RK.floor - top + 8);
      ctx.fillStyle = C.yellowD; ctx.fillRect(cx - 28, RK.floor, 56, 14); ctx.fillRect(cx - 20, top - 6, 40, 10);
      const [, cy] = cellXY(0, cr.y);
      ctx.fillStyle = '#F2C200'; ctx.fillRect(cx - RK.cw / 2 + 2, cy + RK.ch - 6, RK.cw - 4, 8);
      if (cr.load !== 'none') this.palletFront(ctx, cx - RK.cw / 2, cy - 2, cr.load === 'token');
      ctx.restore();
    }
    // palette entrante sur convoyeur (avant prise)
    if (t < 2.0) { const p = eo(prog(t, 0.3, 1.9)); this.palletFront(ctx, lerp(40, RK.x0 - 1.2 * RK.cw, p), RK.floor - RK.ch - 2, true); }
    // palette sortante
    if (t > 12.4 && inv < 1) { const p = eio(prog(t, 12.4, 14.0)); ctx.save(); ctx.globalAlpha = 1 - inv; this.palletFront(ctx, lerp(RK.x0 + 16.4 * RK.cw, 2000, p), RK.floor - RK.ch - 2, false); ctx.restore(); }
    // repérage de la cellule cible
    if (t > 6.4 && t < 9.0) {
      const [x, y] = cellXY(...this.target); const a = inout(t, 6.4, 6.9, 8.4, 9.0);
      ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = C.yellow; ctx.lineWidth = 3;
      const m = 6 + 10 * (1 - eo(prog(t, 6.4, 7.0))); ctx.strokeRect(x - m, y - m, RK.cw + 2 * m, RK.ch + 2 * m); ctx.restore();
    }
    // Titres
    const tq = prog(t, 4.3, 4.9);
    reveal(ctx, S.s05.big1, 120, 170, { size: 92, weight: 800, color: C.white, ls: 1 }, prog(t, 0.9, 1.7), tq);
    reveal(ctx, S.s05.big2, 120, 262, { size: 92, weight: 800, color: C.white, ls: 1 }, prog(t, 1.2, 2.0), tq);
    const aq = prog(t, 12.0, 12.5);
    reveal(ctx, S.s05.short, 116, 230, { size: 150, weight: 800, color: C.yellow, ls: 4 }, prog(t, 4.7, 5.4), aq);
    reveal(ctx, S.s05.sub, 560, 222, { size: 34, weight: 600, color: C.white }, prog(t, 5.1, 5.8), aq);
    // fonctions
    const chips = [[S.s05.in, 6.0], [S.s05.store, 6.9], [S.s05.out, 7.9]];
    let cx2 = 560;
    chips.forEach(([s, t0], i) => {
      const p = inout(t, t0, t0 + 0.4, 11.8, 12.3);
      const w = textW(ctx, s, 24, 700) + 44;
      if (p > 0) {
        ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = 'rgba(255,255,255,0.10)'; rrect(ctx, cx2, 262, w, 46, 23); ctx.fill();
        ctx.fillStyle = C.yellow; ctx.beginPath(); ctx.arc(cx2 + 20, 285, 5, 0, 7); ctx.fill(); ctx.restore();
        text(ctx, s, cx2 + 32, 294, { size: 24, weight: 700, color: C.white, alpha: p });
      }
      cx2 += w + 14;
    });
    // inventaire numérique
    if (inv > 0) {
      reveal(ctx, S.s05.inv, 120, 230, { size: 64, weight: 800, color: C.white }, prog(t, 12.6, 13.3));
    }
    text(ctx, S.schematic, 1840, 1046, { size: 16, weight: 500, color: 'rgba(255,255,255,0.55)', align: 'right', alpha: eo(prog(t, 1, 1.6)) });
  }
};

// =============== S06 — La commande entre dans le système ===============
const G6 = { cols: 10, rows: 7, cw: 58, ch: 52, x0: 120, y0: 330 };
const g6xy = (c, r) => [G6.x0 + c * G6.cw, G6.y0 + r * G6.ch];
const PICKS = [[2, 1], [7, 3], [4, 5]];
const STATION = { x: 1380, y: 800 };
function itemIcon(ctx, x, y, s, i, a = 1) {
  ctx.save(); ctx.globalAlpha *= a; ctx.translate(x, y); ctx.fillStyle = C.blue; ctx.strokeStyle = C.blue; ctx.lineWidth = s * 0.1;
  if (i === 0) { ctx.beginPath(); ctx.moveTo(-s * .35, s * .1); ctx.lineTo(s * .35, s * .1); ctx.lineTo(s * .2, -s * .35); ctx.lineTo(-s * .2, -s * .35); ctx.closePath(); ctx.fill(); ctx.fillRect(-s * .04, s * .1, s * .08, s * .25); ctx.fillRect(-s * .2, s * .33, s * .4, s * .06); }
  if (i === 1) { ctx.beginPath(); ctx.arc(0, 0, s * .35, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, s * .14, 0, Math.PI * 2); ctx.fill(); }
  if (i === 2) { rrect(ctx, -s * .35, -s * .3, s * .7, s * .6, s * .08); ctx.stroke(); ctx.fillRect(-s * .35, -s * .08, s * .7, s * .08); }
  ctx.restore();
}
function tote(ctx, x, y, w, h, i, a = 1) {
  ctx.save(); ctx.globalAlpha *= a;
  ctx.fillStyle = C.blueM; rrect(ctx, x - w / 2, y - h / 2, w, h, 6); ctx.fill();
  ctx.fillStyle = C.blue; ctx.fillRect(x - w / 2, y - h / 2, w, 7);
  ctx.restore();
  if (i >= 0) itemIcon(ctx, x, y + 3, h * 0.6, i, a);
}
const S06 = {
  dur: 14.5,
  totePath(i, t) {
    // aller : de la cellule au poste ; retour sous le convoyeur
    const t0 = 5.0 + i * 1.25;
    const [cx, cy] = g6xy(...PICKS[i]);
    const sx = cx + G6.cw / 2, sy = cy + G6.ch / 2;
    const exit = [G6.x0 + G6.cols * G6.cw + 30, 720];
    const st = [STATION.x - 170, 720];
    const p1 = eio(prog(t, t0, t0 + 0.6)), p2 = eio(prog(t, t0 + 0.6, t0 + 1.7));
    const back = eio(prog(t, t0 + 2.6, t0 + 3.6));
    if (t < t0) return null;
    if (back > 0) return { x: lerp(st[0], exit[0], back), y: 780, a: 1 - prog(t, t0 + 3.3, t0 + 3.6), back: true };
    if (p2 > 0) return { x: lerp(exit[0], st[0], p2), y: 720 };
    return { x: lerp(sx, exit[0], p1), y: lerp(sy, 720, p1) };
  },
  draw(ctx, t) {
    paperBg(ctx);
    // barre de flux
    const steps = S.s06.flow; const act = t < 2.6 ? 0 : t < 5.0 ? 1 : t < 11.2 ? 2 : 3;
    let x = 120; const fy = 150;
    steps.forEach((s, i) => {
      const a = eo(prog(t, 0.2 + i * 0.12, 0.7 + i * 0.12));
      const on = i <= act;
      const w = textW(ctx, s.toUpperCase(), 22, 700, 3) + 50;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = i === act ? C.blue : on ? C.blueL : C.paper2; rrect(ctx, x, fy - 34, w, 50, 25); ctx.fill(); ctx.restore();
      text(ctx, s.toUpperCase(), x + 25, fy, { size: 22, weight: 700, ls: 3, color: i === act ? C.white : on ? C.blue : C.grey, alpha: a });
      x += w;
      if (i < steps.length - 1) { text(ctx, '→', x + 18, fy, { size: 28, weight: 600, color: C.grey2, alpha: a }); x += 56; }
    });
    // grille d'inventaire / stockage de bacs
    const ga = eo(prog(t, 0, 0.6));
    text(ctx, t < 5 ? S.s05.inv : S.s06.totes, G6.x0, G6.y0 - 30, { size: 24, weight: 700, color: C.ink2, alpha: ga });
    for (let c = 0; c < G6.cols; c++) for (let r = 0; r < G6.rows; r++) {
      const [gx, gy] = g6xy(c, r); const pi = PICKS.findIndex(p => p[0] === c && p[1] === r);
      ctx.save(); ctx.globalAlpha = ga;
      const hl = pi >= 0 ? eo(prog(t, 3.0 + pi * 0.35, 3.4 + pi * 0.35)) : 0;
      const gone = pi >= 0 && t > 5.0 + pi * 1.25 && t < 5.0 + pi * 1.25 + 3.6;
      ctx.fillStyle = hl > 0 ? (gone ? C.paper2 : C.yellow) : (rnd(c * 13 + r * 5) < 0.8 ? C.blueL : C.paper2);
      rrect(ctx, gx + 4, gy + 4, G6.cw - 8, G6.ch - 8, 5); ctx.fill();
      ctx.restore();
      if (hl > 0 && !gone && t < 5.0 + pi * 1.25) { ctx.save(); ctx.globalAlpha = hl * (1 - prog(t, 4.6, 5)); ctx.strokeStyle = C.yellowD; ctx.lineWidth = 2.5; const m = 10 * (1 - hl); ctx.strokeRect(gx - m, gy - m, G6.cw + 2 * m, G6.ch + 2 * m); ctx.restore(); }
    }
    // carte de commande
    const ca = inout(t, 0.6, 1.3, 4.6, 5.2);
    if (ca > 0) {
      const cxp = lerp(1500, 1180, eo(prog(t, 0.6, 1.3)));
      card(ctx, cxp, 300, 440, 330, { alpha: ca });
      ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = C.yellow; ctx.fillRect(cxp, 300, 440, 8); ctx.restore();
      text(ctx, S.s06.order, cxp + 32, 360, { size: 30, weight: 800, alpha: ca });
      S.s06.items.forEach((s, i) => {
        const fly = eio(prog(t, 2.8 + i * 0.35, 3.4 + i * 0.35));
        const y = 420 + i * 62;
        ctx.save(); ctx.globalAlpha = ca; ctx.fillStyle = C.paper; rrect(ctx, cxp + 28, y - 4, 384, 52, 10); ctx.fill(); ctx.restore();
        text(ctx, s, cxp + 100, y + 30, { size: 24, weight: 600, alpha: ca * (1 - fly * 0.5) });
        // l'icône vole vers la cellule
        const [gx, gy] = g6xy(...PICKS[i]);
        const ix = lerp(cxp + 62, gx + G6.cw / 2, fly), iy = lerp(y + 22, gy + G6.ch / 2, fly) - Math.sin(fly * Math.PI) * 80;
        if (fly < 1) itemIcon(ctx, ix, iy, 34, i, ca);
      });
    }
    // convoyeur et poste
    const sa = eo(prog(t, 4.6, 5.4));
    if (sa > 0) {
      ctx.save(); ctx.globalAlpha = sa;
      ctx.fillStyle = C.paper3; ctx.fillRect(G6.x0 + G6.cols * G6.cw + 10, 744, STATION.x - 170 - (G6.x0 + G6.cols * G6.cw) + 40, 12);
      ctx.fillStyle = C.paper2; ctx.fillRect(G6.x0 + G6.cols * G6.cw + 10, 806, STATION.x - 170 - (G6.x0 + G6.cols * G6.cw) + 40, 10);
      // rouleaux animés
      ctx.fillStyle = C.grey2;
      for (let k = 0; k < 40; k++) { const rx = G6.x0 + G6.cols * G6.cw + 20 + ((k * 22 + t * 60) % 880); if (rx < STATION.x - 140) ctx.fillRect(rx, 746, 3, 8); }
      // table du poste
      ctx.fillStyle = C.ink2; ctx.fillRect(STATION.x - 220, 744, 260, 12); ctx.fillRect(STATION.x - 210, 756, 10, 110); ctx.fillRect(STATION.x + 20, 756, 10, 110);
      // bac de commande (destination)
      ctx.strokeStyle = C.yellowD; ctx.lineWidth = 4; ctx.strokeRect(STATION.x - 60, 690, 90, 54);
      ctx.restore();
      person(ctx, STATION.x + 110, 866, 1.15, { arm: Math.sin(Math.max(0, t - 5) * 3.2) * 0.6 - 0.4 });
      text(ctx, S.s06.station, STATION.x - 90, 920, { size: 22, weight: 700, color: C.ink2, align: 'center', alpha: sa });
    }
    // bacs en mouvement + articles déposés
    for (let i = 0; i < 3; i++) {
      const tp = this.totePath(i, t); if (!tp) continue;
      const t0 = 5.0 + i * 1.25;
      const picked = t > t0 + 2.0;
      tote(ctx, tp.x, tp.y, 74, 50, picked ? -1 : i, tp.a === undefined ? 1 : tp.a);
      // saut de l'article vers le bac de commande
      const j = prog(t, t0 + 1.8, t0 + 2.4);
      if (j > 0) {
        const jx = lerp(STATION.x - 170, STATION.x - 15 + (i - 1) * 24, eio(j)), jy = lerp(705, 712, j) - Math.sin(j * Math.PI) * 90;
        itemIcon(ctx, jx, jy, 26, i);
      }
    }
    // goods-to-person
    const gq = prog(t, 14.0, 14.5);
    reveal(ctx, S.s06.gtp, 960, 300, { size: 72, weight: 800, color: C.blue, align: 'center' }, prog(t, 9.0, 9.7), gq);
    reveal(ctx, S.s06.gtpFr, 960, 360, { size: 34, weight: 600, color: C.ink, align: 'center' }, prog(t, 9.4, 10.1), gq);
    if (t > 9.4) { // flèche marchandise → personne
      const p = eio(prog(t, 9.6, 10.6));
      ctx.save(); ctx.globalAlpha = 1 - gq; ctx.strokeStyle = C.yellowD; ctx.lineWidth = 5; ctx.lineCap = 'round';
      const ax = 860, bx = lerp(860, 1180, p); ctx.beginPath(); ctx.moveTo(ax, 430); ctx.lineTo(bx, 430); ctx.stroke();
      if (p > 0.05) { ctx.beginPath(); ctx.moveTo(bx - 14, 418); ctx.lineTo(bx, 430); ctx.lineTo(bx - 14, 442); ctx.stroke(); }
      ctx.restore();
      tote(ctx, 820, 430, 54, 38, 1, 1 - gq); person(ctx, 1230, 470, 0.38, {});
    }
  }
};

// =============== S07 — Préparation et expédition ===============
const S07 = {
  dur: 12.5,
  boxPos(t) {
    const p1 = eio(prog(t, 5.4, 7.4)), p2 = eio(prog(t, 7.4, 8.6));
    let x = lerp(560, 1100, p1), y = 640;
    if (p2 > 0) { x = lerp(1100, 1460, p2); y = lerp(640, 760, p2); }
    return [x, y];
  },
  draw(ctx, t) {
    paperBg(ctx);
    // suivi de commande
    const steps = S.s07.track;
    const done = [-1, -1, 0.6, 4.6, 9.6];
    const ca = eo(prog(t, 0, 0.5));
    card(ctx, 120, 100, 1180, 140, { alpha: ca });
    steps.forEach((s2, i) => {
      const x = 210 + i * 230, cy = 148;
      const dp = done[i] < 0 ? 1 : prog(t, done[i], done[i] + 0.5);
      ctx.save(); ctx.globalAlpha = ca;
      if (i < steps.length - 1) { ctx.fillStyle = C.paper2; ctx.fillRect(x + 26, cy - 2, 178, 4); ctx.fillStyle = C.blue; const np = done[i + 1] < 0 ? 1 : prog(t, done[i + 1] - 0.6, done[i + 1]); ctx.fillRect(x + 26, cy - 2, 178 * np, 4); }
      ctx.fillStyle = dp >= 1 ? C.blue : C.paper2; ctx.beginPath(); ctx.arc(x, cy, 18, 0, 7); ctx.fill();
      ctx.restore();
      if (dp > 0) check(ctx, x, cy, 22, dp, C.white);
      text(ctx, s2, x, cy + 56, { size: 22, weight: 700, color: dp >= 1 ? C.ink : C.grey, alpha: ca, align: 'center' });
    });
    token(ctx, 1250, 148, 30, { alpha: ca });
    // articles regroupés par commande
    const items = [0, 1, 2];
    const boxS = 1 - eio(prog(t, 3.2, 4.6)); // grand → ajusté
    const bw = lerp(170, 360, boxS), bh = lerp(110, 230, boxS);
    const close = eo(prog(t, 4.7, 5.3));
    const [bx, by] = this.boxPos(t);
    const inTruck = 1 - prog(t, 8.3, 8.6);
    const ga = eo(prog(t, 0.2, 0.8));
    // convoyeurs
    ctx.save(); ctx.globalAlpha = ga; ctx.fillStyle = C.paper3;
    ctx.fillRect(380, 700, 760, 14);
    // aiguillage : deux voies
    ctx.save(); ctx.translate(1140, 707); ctx.rotate(-0.38); ctx.fillRect(0, -7, 420, 14); ctx.restore();
    ctx.save(); ctx.translate(1140, 707); ctx.rotate(0.24); ctx.fillRect(0, -7, 400, 14); ctx.restore();
    ctx.fillStyle = C.grey2; for (let k = 0; k < 34; k++) { const rx = 390 + ((k * 23 + t * 120) % 740); ctx.fillRect(rx, 703, 3, 8); }
    ctx.restore();
    text(ctx, S.s07.sort, 1140, 790, { size: 22, weight: 700, color: C.ink2, align: 'center', alpha: eo(prog(t, 5.6, 6.2)) });
    text(ctx, S.s07.lanes[0], 1530, 520, { size: 24, weight: 700, color: C.blue, alpha: eo(prog(t, 5.8, 6.4)) });
    text(ctx, S.s07.lanes[1], 1250, 880, { size: 24, weight: 700, color: C.ink, alpha: eo(prog(t, 6.0, 6.6)) });
    // flux magasins (palettes sur la voie haute)
    for (let k = 0; k < 3; k++) {
      const p = ((t - 6 + k * 0.9) / 2.7); if (p < 0 || p > 1 || t < 6) continue;
      const px = 1150 + p * 380 * Math.cos(-0.38), py = 707 + p * 380 * Math.sin(-0.38);
      ctx.save(); ctx.globalAlpha = eo(prog(t, 6, 6.4)) * (1 - prog(t, 9.8, 10.4));
      ctx.fillStyle = C.wood; ctx.fillRect(px - 30, py - 10, 60, 8); ctx.fillStyle = C.kraft; ctx.fillRect(px - 27, py - 52, 54, 42);
      ctx.fillStyle = C.blue; ctx.fillRect(px - 7, py - 38, 14, 14); ctx.restore();
    }
    // articles qui tombent dans la boîte
    items.forEach(i => {
      const p = eio(prog(t, 0.6 + i * 0.5, 1.4 + i * 0.5));
      if (p <= 0 || close >= 1) return;
      const x = lerp(260 + i * 90, bx - 60 + i * 60, p), y = lerp(320, by - 12, p);
      itemIcon(ctx, x, y, 44, i);
    });
    // boîte
    ctx.save(); ctx.globalAlpha = ga;
    if (close < 1) { ctx.strokeStyle = C.kraftD; ctx.lineWidth = 4; ctx.setLineDash(boxS > 0.02 ? [12, 8] : []); ctx.strokeRect(bx - bw / 2, by + 50 - bh, bw, bh); }
    ctx.setLineDash([]);
    if (close > 0) { ctx.globalAlpha = close * inTruck; ctx.fillStyle = C.kraft; ctx.fillRect(bx - bw / 2, by + 50 - bh, bw, bh); ctx.fillStyle = C.kraftD; ctx.fillRect(bx - bw / 2, by + 50 - bh, bw, 10); ctx.fillStyle = C.kraftL; ctx.fillRect(bx - 4, by + 50 - bh, 8, bh); }
    ctx.restore();
    if (close > 0.5 && inTruck > 0) token(ctx, bx + bw / 2 - 30, by + 50 - bh + 34, 30 * eoBack(prog(t, 5.0, 5.4)), { alpha: inTruck });
    // étiquette boîte ajustée
    const la = inout(t, 3.4, 3.9, 5.4, 5.9);
    if (la > 0) {
      text(ctx, S.s07.box, bx, by - 210, { size: 28, weight: 700, align: 'center', alpha: la });
      ctx.save(); ctx.globalAlpha = la; ctx.strokeStyle = C.blue; ctx.lineWidth = 2;
      const aw = bw / 2 + 24; ctx.beginPath(); ctx.moveTo(bx - aw, by - 160); ctx.lineTo(bx + aw, by - 160); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx - aw, by - 170); ctx.lineTo(bx - aw, by - 150); ctx.moveTo(bx + aw, by - 170); ctx.lineTo(bx + aw, by - 150); ctx.stroke(); ctx.restore();
    }
    // quai et camion
    const qa = eo(prog(t, 7.0, 7.6));
    if (qa > 0) {
      const drive = ei(prog(t, 9.8, 11.8));
      const tx = 1500 + drive * 900;
      ctx.save(); ctx.globalAlpha = qa;
      ctx.fillStyle = C.ink2; ctx.fillRect(1420, 812, 70, 160); // quai
      ctx.fillStyle = '#E9EDF1'; ctx.strokeStyle = '#B7C0CA'; ctx.lineWidth = 2;
      rrect(ctx, tx, 690, 380, 230, 8); ctx.fill(); ctx.stroke();
      ctx.fillStyle = C.blue; ctx.fillRect(tx, 690, 380, 16);
      ctx.fillStyle = '#2C3E57'; rrect(ctx, tx + 390, 760, 110, 160, 14); ctx.fill();
      ctx.fillStyle = C.ink; for (const wx of [tx + 60, tx + 120, tx + 300, tx + 450]) { ctx.beginPath(); ctx.arc(wx, 930, 26, 0, 7); ctx.fill(); }
      // lignes de vitesse
      if (drive > 0) { ctx.strokeStyle = 'rgba(0,0,0,0.15)'; ctx.lineWidth = 3; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(tx - 40 - k * 30, 740 + k * 40); ctx.lineTo(tx - 160 - k * 30, 740 + k * 40); ctx.stroke(); } }
      ctx.restore();
      text(ctx, S.s07.dock, 1455, 668, { size: 22, weight: 700, color: C.ink2, align: 'center', alpha: qa * (1 - prog(t, 11.5, 12)) });
    }
  }
};

// =============== S08 — Les équipes ===============
const S08 = {
  dur: 11.5,
  draw(ctx, t) {
    paperBg(ctx);
    // silhouettes de rayonnages en fond
    ctx.save(); ctx.globalAlpha = 0.07; ctx.strokeStyle = C.blue; ctx.lineWidth = 2;
    for (let c = 0; c <= 30; c++) { ctx.beginPath(); ctx.moveTo(c * 66, 80); ctx.lineTo(c * 66, 1000); ctx.stroke(); }
    for (let r = 0; r <= 14; r++) { ctx.beginPath(); ctx.moveTo(0, 80 + r * 66); ctx.lineTo(W, 80 + r * 66); ctx.stroke(); }
    ctx.restore();
    reveal(ctx, S.s08.big, 120, 470, { size: 230, weight: 800, color: C.blue, ls: -4 }, prog(t, 0.5, 1.2));
    reveal(ctx, S.s08.bigSub, 128, 540, { size: 34, weight: 600, color: C.ink }, prog(t, 1.0, 1.7));
    // cartes fonctions
    const cols = [[C.blue, C.yellow], [C.blueM, C.yellow], [C.blueD, C.yellow], [C.yellowD, C.blue]];
    S.s08.roles.forEach((r, i) => {
      const t0 = 2.8 + i * 0.45; const p = eo(prog(t, t0, t0 + 0.6));
      if (p <= 0) return;
      const x = 980 + (i % 2) * 430, y = 200 + Math.floor(i / 2) * 330 + (1 - p) * 40;
      card(ctx, x, y, 400, 300, { alpha: p });
      ctx.save(); ctx.globalAlpha = p; ctx.fillStyle = C.blueXL; rrect(ctx, x + 20, y + 20, 360, 170, 12); ctx.fill(); ctx.restore();
      ctx.save(); ctx.globalAlpha = p;
      person(ctx, x + 200, y + 186, 0.95, { body: cols[i][0], acc: cols[i][1], arm: Math.sin(t * 2 + i) * 0.3 - 0.3, skin: ['#C99A74', '#8D5B3C', '#E2B894', '#A8754F'][i] });
      ctx.restore();
      const words = r.split(' '); let l1 = r, l2 = '';
      if (textW(ctx, r, 26, 700) > 350) { const k = Math.ceil(words.length / 2); l1 = words.slice(0, k).join(' '); l2 = words.slice(k).join(' '); }
      text(ctx, l1, x + 24, y + 236, { size: 26, weight: 700, alpha: p });
      if (l2) text(ctx, l2, x + 24, y + 270, { size: 26, weight: 700, alpha: p });
    });
    // verbes
    const verbs = S.s08.verbs;
    let vx = 128;
    verbs.forEach((v, i) => {
      const t0 = 7.4 + i * 0.75;
      reveal(ctx, v, vx, 700, { size: 46, weight: 800, color: i === 2 ? C.blue : C.ink }, prog(t, t0, t0 + 0.6));
      vx += textW(ctx, v, 46, 800);
      if (i < 2) { ctx.save(); ctx.globalAlpha = eo(prog(t, t0 + 0.4, t0 + 0.8)); ctx.fillStyle = C.yellow; ctx.fillRect(vx + 22, 676, 12, 12); ctx.restore(); vx += 56; }
    });
    footnote(ctx, S.s08.source, eo(prog(t, 3, 3.6)));
  }
};

// =============== S09 — Durabilité ===============
const S09 = {
  dur: 10,
  draw(ctx, t) {
    paperBg(ctx);
    const o = { ox: 470, oy: 360, s: 0.34 };
    o.s *= 1 + 0.03 * prog(t, 0, 10);
    // stationnement
    poly(ctx, [iso(o, -40, BLD.D + 120, 0), iso(o, 900, BLD.D + 120, 0), iso(o, 900, BLD.D + 420, 0), iso(o, -40, BLD.D + 420, 0)]);
    ctx.fillStyle = C.paper2; ctx.fill();
    drawBuilding(ctx, o, 1, { roof: true });
    // 20 bornes
    let shown = 0;
    for (let i = 0; i < 20; i++) {
      const t0 = 3.3 + i * 0.12; const p = eoBack(prog(t, t0, t0 + 0.35));
      if (p <= 0) continue; shown++;
      const x = 20 + (i % 10) * 85, y = BLD.D + 170 + Math.floor(i / 10) * 160;
      // place
      ctx.save(); ctx.strokeStyle = C.white; ctx.lineWidth = 2;
      const a = iso(o, x, y, 0), b = iso(o, x, y + 110, 0); ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.stroke(); ctx.restore();
      isoBox(ctx, o, x + 30, y - 6, 0, 18, 12, 40 * clamp(p, 0, 1.2), { top: C.yellow, l: C.yellowD, r: C.green });
    }
    // carte LEED
    const la = eo(prog(t, 0.6, 1.3));
    card(ctx, 1200, 170, 620, 300, { alpha: la });
    reveal(ctx, S.s09.leed, 1250, 320, { size: 104, weight: 800, color: C.ink, ls: 4 }, prog(t, 0.8, 1.5));
    reveal(ctx, S.s09.leedLvl, 1250 + textW(ctx, S.s09.leed, 104, 800, 4) + 26, 320, { size: 60, weight: 700, color: C.blue }, prog(t, 1.1, 1.8));
    text(ctx, S.s09.leedSub, 1254, 400, { size: 26, weight: 600, color: C.grey, alpha: eo(prog(t, 1.4, 2.0)) });
    ctx.save(); ctx.globalAlpha = la; ctx.fillStyle = '#B9BEC6'; ctx.fillRect(1254, 425, 520 * eo(prog(t, 1.4, 2.2)), 6); ctx.restore();
    // compteur bornes
    const ea = eo(prog(t, 3.0, 3.6));
    card(ctx, 1200, 520, 620, 300, { alpha: ea });
    if (ea > 0) {
      reveal(ctx, '20', 1250, 690, { size: 140, weight: 800, color: C.ink }, prog(t, 3.0, 3.6));
      text(ctx, S.s09.ev, 1450, 650, { size: 30, weight: 700, alpha: ea });
      const sub = S.s09.evSub; const k = sub.indexOf(', ');
      text(ctx, sub.slice(0, k + 1), 1254, 750, { size: 22, weight: 500, color: C.grey, alpha: ea });
      text(ctx, sub.slice(k + 2), 1254, 782, { size: 22, weight: 500, color: C.grey, alpha: ea });
    }
    footnote(ctx, S.s09.source, eo(prog(t, 1.5, 2.1)));
  }
};

// =============== S10 — Final ===============
const S10 = {
  dur: 12,
  cam(t) { const c = camLerp(CAM.local2, CAM.net, 1); const z = 1 + 0.045; c.s *= lerp(z, z * 0.94, eioQ(prog(t, 0, 8))); return c; },
  draw(ctx, t) {
    const c = this.cam(t);
    drawMap(ctx, c, { qc: 0.4 });
    networkLayer(ctx, c, t, { speed: 0.35 });
    // carton final
    const pa = eio(prog(t, 7.6, 8.5));
    if (pa > 0) { ctx.save(); ctx.globalAlpha = pa; ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    reveal(ctx, S.s10.line, 960, 420, { size: 54, weight: 700, color: C.ink, align: 'center' }, prog(t, 8.0, 8.8));
    if (t > 9.0) { ctx.fillStyle = C.yellow; const w = 120 * eo(prog(t, 9.0, 9.6)); ctx.fillRect(960 - w / 2, 486, w, 8); }
    reveal(ctx, S.s10.brand, 960, 640, { size: 150, weight: 800, color: C.blue, align: 'center', ls: 4 }, prog(t, 9.3, 10.1));
    reveal(ctx, S.s10.place, 960, 712, { size: 44, weight: 700, color: C.ink, align: 'center', ls: 18 }, prog(t, 9.7, 10.5));
    const fb = prog(t, 11.2, 12.0);
    if (fb > 0) { ctx.save(); ctx.globalAlpha = eio(fb); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
  }
};

const SCENES = [['S01', S01], ['S02', S02], ['S03', S03], ['S04', S04], ['S05', S05], ['S06', S06], ['S07', S07], ['S08', S08], ['S09', S09], ['S10', S10]];
