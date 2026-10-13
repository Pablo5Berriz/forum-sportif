// Orchestrateur : timeline, transitions, surimpressions. window.renderFrame(T) dessine l'image au temps T (s).
const BOUNDS = [0, 10, 22, 33, 45, 59.5, 74, 86.5, 98, 108, 120];
// Transitions aux frontières : 'token' = le jeton jaune couvre puis révèle ; 'fade' = fondu enchaîné.
const TRANS = {
  1: { type: 'token', P: T => S01.beauPos(T - 0), Q: () => S02.tokenPos() },
  2: { type: 'fade', d: 0.7 },
  3: { type: 'token', P: T => S03.beauPos(T - 22), Q: () => [960, 560] },
  4: { type: 'token', P: T => S04.tokenScreen(T - 33), Q: () => [RK.x0 - 1.2 * RK.cw + 41, RK.floor - RK.ch / 2] },
  5: { type: 'fade', d: 0.6 }, 6: { type: 'fade', d: 0.5 }, 7: { type: 'fade', d: 0.6 },
  8: { type: 'fade', d: 0.6 }, 9: { type: 'fade', d: 0.8 }
};
const WIPE = 0.5;
const DARK = { S05: true };
const ILLU = { S02: 1, S04: 1, S06: 1, S07: 1, S09: 1 };

const cv = document.getElementById('c'); const ctx = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = W; off.height = H; const octx = off.getContext('2d');

function sceneAt(T) { for (let i = BOUNDS.length - 2; i >= 0; i--) if (T >= BOUNDS[i]) return i; return 0; }
const DRIFT = { S02: 1, S06: 1, S07: 1, S08: 1, S09: 1 };
function drawScene(c, i, T) {
  const [id, sc] = SCENES[i]; const t = T - BOUNDS[i];
  c.save();
  if (DRIFT[id]) { const k = 1 + 0.03 * clamp(t / sc.dur, -0.1, 1.1); c.translate(W / 2, H / 2); c.scale(k, k); c.translate(-W / 2, -H / 2); c.fillStyle = C.paper; c.fillRect(0, 0, W, H); }
  sc.draw(c, t); c.restore(); overlays(c, i, T);
}

function overlays(c, i, T) {
  const [id, sc] = SCENES[i]; const t = T - BOUNDS[i]; const dark = DARK[id];
  const lbl = S.chapters[id];
  if (lbl && !(id === 'S01')) {
    const a = inout(t, 0.4, 1.0, sc.dur - 0.7, sc.dur - 0.2);
    c.save(); c.globalAlpha = a; c.fillStyle = C.yellow; c.fillRect(80, 58, 14, 14); c.restore();
    text(c, lbl.toUpperCase(), 108, 72, { size: 19, weight: 700, ls: 4, color: dark ? C.white : C.ink2, alpha: a });
  }
  if (ILLU[id]) text(c, S.illustrative, 1840, 1046, { size: 16, weight: 500, color: C.grey, align: 'right', alpha: inout(t, 0.6, 1.2, sc.dur - 0.6, sc.dur - 0.1) });
  // rail du parcours (S04 → S07)
  if (T > 33 && T < 86.5) {
    const a = inout(T, 33.4, 34.0, 85.8, 86.4);
    const seg = [[33, 45], [45, 59.5], [59.5, 67], [67, 79], [79, 86.5]];
    let pos = 4; for (let k = 0; k < 5; k++) if (T < seg[k][1]) { pos = k + (k < 4 ? eio(prog(T, seg[k][1] - 1.2, seg[k][1])) : 0); break; }
    const x0 = 640, x1 = 1280, y = 1000, n = 5;
    c.save(); c.globalAlpha = a;
    c.strokeStyle = dark ? 'rgba(255,255,255,0.3)' : C.line; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
    c.strokeStyle = dark ? C.yellow : C.blue; c.beginPath(); c.moveTo(x0, y); c.lineTo(lerp(x0, x1, pos / (n - 1)), y); c.stroke();
    c.restore();
    S.rail.forEach((s, k) => {
      const x = lerp(x0, x1, k / (n - 1)); const on = k <= Math.round(pos);
      c.save(); c.globalAlpha = a; c.fillStyle = on ? (dark ? C.yellow : C.blue) : (dark ? 'rgba(255,255,255,0.35)' : C.line);
      c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); c.restore();
      text(c, s, x, y + 32, { size: 17, weight: on ? 700 : 500, align: 'center', color: dark ? (on ? C.white : 'rgba(255,255,255,0.55)') : (on ? C.ink : C.grey), alpha: a });
    });
    token(c, lerp(x0, x1, pos / (n - 1)), y, 20, { alpha: a, shadow: false });
  }
}

// carré du jeton plein écran : yellow, centre bleu qui s'efface en grandissant
function bigToken(c, x, y, s, inner) {
  c.save(); c.fillStyle = C.yellow; rrect(c, x - s / 2, y - s / 2, s, s, Math.min(s * 0.14, 40)); c.fill();
  if (inner > 0) { c.globalAlpha = inner; c.fillStyle = C.blue; const k = s * 0.32; rrect(c, x - k / 2, y - k / 2, k, k, k * 0.15); c.fill(); }
  c.restore();
}
function coverSize(P) { return 2 * Math.max(P[0], W - P[0], P[1], H - P[1]) + 80; }

window.renderFrame = function (T) {
  T = Math.min(T, DUR - 1e-6);
  const i = sceneAt(T);
  // transition à la frontière suivante (avant) ou précédente (après)
  const nb = i + 1, pb = i;
  const tn = TRANS[nb], tp = TRANS[pb];
  if (tn && tn.type === 'fade' && T > BOUNDS[nb] - tn.d) {
    drawScene(ctx, i, T);
    octx.clearRect(0, 0, W, H); drawScene(octx, nb, T);
    ctx.save(); ctx.globalAlpha = eioQ(prog(T, BOUNDS[nb] - tn.d, BOUNDS[nb])); ctx.drawImage(off, 0, 0); ctx.restore();
    return;
  }
  drawScene(ctx, i, T);
  if (tn && tn.type === 'token' && T > BOUNDS[nb] - WIPE) {
    const P = tn.P(T); const p = ei(prog(T, BOUNDS[nb] - WIPE, BOUNDS[nb]));
    bigToken(ctx, P[0], P[1], lerp(30, coverSize(P), p), 1 - p);
  }
  if (tp && tp.type === 'token' && T < BOUNDS[pb] + WIPE) {
    const Q = tp.Q(); const p = eo(prog(T, BOUNDS[pb], BOUNDS[pb] + WIPE));
    bigToken(ctx, Q[0], Q[1], lerp(coverSize(Q), 30, p), p);
  }
};
window.ready = (async () => {
  const raw = await (await fetch('../../data/geo.json')).json(); prepGeo(raw);
  await document.fonts.load('800 40px Inter'); await document.fonts.load('600 40px Inter'); await document.fonts.load('500 40px Inter'); await document.fonts.load('700 40px Inter');
  return true;
})();
