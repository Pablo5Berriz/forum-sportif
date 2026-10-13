"""Sous-titres SRT depuis le script + durées réelles de la voix (≤ 42 caractères par ligne, 2 lignes max)."""
import json, re, subprocess, sys
sc = json.load(open('src/script.fr.json'))
def ts(t):
    h, r = divmod(t, 3600); m, s = divmod(r, 60); return f"{int(h):02}:{int(m):02}:{int(s):02},{int(round((s % 1) * 1000)):03}"
def chunks(text, maxc=84):
    out = []
    for p in re.split(r'(?<=[.:;])\s+', text):
        stack = [p]
        while stack:
            q = stack.pop(0)
            if len(q) <= maxc: out.append(q); continue
            mid = len(q) // 2
            cands = [m.end() for m in re.finditer(r',\s', q)]
            k = min(cands, key=lambda c: abs(c - mid)) if cands and min(abs(c - mid) for c in cands) < len(q) * 0.3 else None
            if k is None: k = min([m.start() for m in re.finditer(' ', q)], key=lambda c: abs(c - mid)) + 1
            stack[:0] = [q[:k].strip(), q[k:].strip()]
    return out
def two_lines(c, maxl=42):
    if len(c) <= maxl: return c
    k = c.rfind(' ', 0, len(c) // 2 + 6); return c[:k] + '\n' + c[k + 1:]
i = 1; lines = []
for s in sc['scenes']:
    d = float(subprocess.check_output(['soxi', '-D', f"audio/vo/{s['id']}.wav"]))
    txt = s['vo'].replace('deux cent quarante-quatre mille', '244 000').replace('trois cent quatre-vingts', '380').replace('vingt bornes', '20 bornes')
    t0 = s['start'] + s['vo_at']; cs = chunks(txt); tot = sum(len(c) for c in cs)
    for c in cs:
        dur = d * len(c) / tot
        lines.append(f"{i}\n{ts(t0)} --> {ts(t0 + dur - 0.04)}\n{two_lines(c)}\n"); i += 1; t0 += dur
open(sys.argv[1] if len(sys.argv) > 1 else 'render/IKEA_Beauharnois_fr-CA.srt', 'w').write('\n'.join(lines))
print(i - 1, 'sous-titres')

# Version ASS (rendu exact en 1920×1080 pour l'incrustation)
def ass_t(t):
    h, r = divmod(t, 3600); m, s2 = divmod(r, 60); return f"{int(h)}:{int(m):02}:{s2:05.2f}"
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Inter,40,&H00FFFFFF,&H00FFFFFF,&H7014181D,&H7014181D,1,0,0,0,100,100,0,0,4,14,0,2,200,200,118,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ev = []
for blk in '\n'.join(lines).strip().split('\n\n'):
    L = blk.split('\n'); a, b = L[1].split(' --> ')
    conv = lambda x: int(x[:2]) * 3600 + int(x[3:5]) * 60 + float(x[6:].replace(',', '.'))
    ev.append(f"Dialogue: 0,{ass_t(conv(a))},{ass_t(conv(b))},Default,,0,0,0,," + '\\N'.join(L[2:]))
open((sys.argv[1] if len(sys.argv) > 1 else 'render/IKEA_Beauharnois_fr-CA.srt').replace('.srt', '.ass'), 'w').write(hdr + '\n'.join(ev) + '\n')
