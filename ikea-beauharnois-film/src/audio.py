"""Musique, sound design et mixage, 100 % synthétisés (aucune ressource tierce, aucun droit à libérer).
Sorties : audio/stems/{vo,music,sfx}.wav, audio/mix_master.wav (-16 LUFS intégré, crête vraie ≤ -1,5 dBTP visée),
          audio/mix_novo.wav (version sans voix).
Les repères (CUES) suivent les temps d'animation de src/film/scenes.js."""
import json, numpy as np, soundfile as sf, pyloudnorm as pyln
from scipy.signal import butter, sosfilt, resample_poly

SR = 48000; DUR = 120.0; N = int(SR * DUR)
rng = np.random.default_rng(7)
T = np.arange(N) / SR

def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, r, sus=1.0):
    e = np.ones(n) * sus; na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, sus, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def place(buf, x, t, g=1.0):
    i = int(t * SR); j = min(N, i + len(x))
    if i < N and j > i: buf[i:j] += x[:j - i] * g
def noise(d): return rng.standard_normal(int(d * SR))
def tone(f, d, kind='sine'):
    t = np.arange(int(d * SR)) / SR
    ph = 2 * np.pi * (np.cumsum(f) / SR if np.ndim(f) else f * t)
    if kind == 'sine': return np.sin(ph)
    if kind == 'tri': return 2 / np.pi * np.arcsin(np.sin(ph))
    if kind == 'saw': return 2 * ((ph / (2 * np.pi)) % 1) - 1
def db(x): return 10 ** (x / 20)

# ---------------- MUSIQUE ----------------
music = np.zeros(N)
BPM = 96; BEAT = 60 / BPM; BAR = 4 * BEAT
mtof = lambda m: 440 * 2 ** ((m - 69) / 12)
# Ré majeur : Dmaj7 – Bm7 – Gmaj7 – Asus4/A
CH = [[50, 57, 61, 64, 66], [47, 54, 57, 62, 66], [43, 50, 54, 59, 62], [45, 52, 57, 62, 64]]
def pad_note(m, d, g):
    f = mtof(m); x = sum(tone(f * (1 + dt), d, 'saw') for dt in (-0.004, 0, 0.0035)) / 3
    return lp(x, 1400) * env(len(x), 0.9, 1.2) * g
nb = int(np.ceil(DUR / BAR))
for b in range(nb):
    t0 = b * BAR; ch = CH[b % 4]
    if t0 >= 116: ch = CH[0]
    for m in ch: place(music, pad_note(m, BAR + 1.0, 0.07), t0)
    place(music, pad_note(ch[0] - 12, BAR + 0.8, 0.10), t0)
# intensité de la pulsation selon les séquences
def pulse_gain(t):
    if t < 32.5: return 0.0
    if t < 45: return 0.55
    if t < 59.5: return 0.8
    if t < 74: return 0.85
    if t < 86.5: return 1.0
    if t < 98: return 0.35
    if t < 108: return 0.25
    if t < 116: return 0.6
    return 0.0
def pluck(f, g):
    d = 0.35; x = tone(f, d, 'tri') * np.exp(-np.arange(int(d * SR)) / SR * 11)
    return lp(x, 3200) * g
step = BEAT / 2
for k in range(int(DUR / step)):
    t0 = k * step; g = pulse_gain(t0)
    if g <= 0: continue
    ch = CH[int(t0 // BAR) % 4]; m = ch[[1, 2, 3, 4, 3, 2, 1, 2][k % 8]] + 12
    place(music, pluck(mtof(m), 0.05 * g), t0)
    if k % 2 == 0 and t0 >= 45 and t0 < 98:  # sub doux sur les temps
        d = 0.5; x = tone(mtof(ch[0] - 12), d) * np.exp(-np.arange(int(d * SR)) / SR * 6)
        place(music, x * 0.10 * g, t0)
# finale : accord tenu et fondu

fade = np.ones(N); fade[:int(1.5 * SR)] = np.linspace(0, 1, int(1.5 * SR))
fade[int(117.2 * SR):] = np.linspace(1, 0, N - int(117.2 * SR)) ** 1.5
music *= fade

# ---------------- SOUND DESIGN ----------------
sfx = np.zeros(N)
def whoosh(d=0.9, f0=300, f1=3000, g=0.25):
    x = noise(d); n = len(x); out = np.zeros(n); seg = 2048
    for i in range(0, n, seg):
        p = i / n; fc = f0 + (f1 - f0) * np.sin(np.pi * p) ** 1.2
        out[i:i + seg] = bp(x[i:i + seg] if i == 0 else x[max(0, i - 512):i + seg], fc * 0.6, min(fc * 1.6, 20000))[-len(x[i:i + seg]):]
    return out * np.sin(np.linspace(0, np.pi, n)) ** 2 * g
def thump(f=55, d=0.6, g=0.5):
    t = np.arange(int(d * SR)) / SR; fs = f * (1 + 1.5 * np.exp(-t * 30))
    return tone(fs, d) * np.exp(-t * 7) * g
def tick(f=2400, d=0.05, g=0.12): return tone(f, d) * np.exp(-np.arange(int(d * SR)) / SR * 90) * g
def beep(f=2350, d=0.11, g=0.12): x = tone(f, d); return x * env(len(x), 0.004, 0.03) * g
def chime(fs=(1318.5, 1975.5, 2637), d=1.4, g=0.08):
    t = np.arange(int(d * SR)) / SR
    return sum(np.sin(2 * np.pi * f * t) * np.exp(-t * (3 + i)) for i, f in enumerate(fs)) * g
def rumble(d, g=0.2, f=120, rise=False):
    x = lp(noise(d), f, 4); e = env(len(x), d * (0.6 if rise else 0.25), d * 0.3)
    return x * e * g * 4
def whirr(d, g=0.08):
    t = np.arange(int(d * SR)) / SR; f = 180 + 70 * np.sin(np.pi * t / d)
    x = tone(f, d, 'saw') * 0.4 + bp(noise(d), 600, 2200) * 0.3
    return lp(x, 2500) * env(len(x), 0.25, 0.3) * g
def clunk(g=0.35):
    x = thump(90, 0.35, g); c = hp(noise(0.06), 1500) * np.exp(-np.arange(int(0.06 * SR)) / SR * 60) * g * 0.4
    x[:len(c)] += c; return x
def rattle(d, g=0.07):
    x = bp(noise(d), 800, 3000); am = (np.sin(2 * np.pi * 26 * np.arange(len(x)) / SR) > 0.3).astype(float)
    return lp(x * am, 4000) * env(len(x), 0.05, 0.15) * g
def hiss(d=0.7, g=0.12): x = hp(noise(d), 3000); return x * np.exp(-np.arange(len(x)) / SR * 4) * g
def card(d=0.25, g=0.12): x = bp(noise(d), 300, 1800); return x * np.exp(-np.arange(len(x)) / SR * 18) * g

CUES = [
    # transitions
    (whoosh(1.0, 250, 2800, 0.22), 9.45), (whoosh(1.0, 250, 2800, 0.22), 32.45), (whoosh(1.0, 250, 2800, 0.22), 44.45),
    (whoosh(0.9, 400, 2000, 0.10), 21.2), (whoosh(0.8, 400, 2000, 0.09), 58.9), (whoosh(0.7, 400, 2000, 0.08), 73.5),
    (whoosh(0.8, 400, 2000, 0.09), 85.9), (whoosh(0.8, 400, 2000, 0.09), 97.4), (whoosh(1.0, 300, 1800, 0.10), 107.2),
    # S01
    (tick(1800, 0.06, 0.15), 4.65), (thump(50, 0.9, 0.35), 6.4), (tick(2600, 0.04, 0.06), 7.0),
    # S02
    (rumble(1.8, 0.10, 90, rise=True), 10.2), (thump(48, 0.8, 0.32), 15.4), (thump(48, 0.8, 0.32), 17.6), (thump(48, 0.8, 0.32), 19.4),
    # S03
    (whoosh(1.2, 600, 3000, 0.06), 24.4), (whoosh(1.0, 600, 3000, 0.06), 24.9), (whoosh(1.0, 600, 3000, 0.05), 26.6),
    # S04
    (rumble(3.0, 0.16, 140, rise=True), 33.4), (hiss(0.8, 0.10), 35.9), (rattle(0.8, 0.08), 35.8), (rumble(1.8, 0.06, 300), 36.8),
    (beep(), 38.45), (beep(2350, 0.08), 39.0), (chime((1568, 2349), 1.0, 0.06), 39.6), (whoosh(1.4, 800, 3500, 0.05), 41.0),
    # S05
    (whirr(3.4), 47.6), (clunk(), 51.2), (whirr(2.2), 52.2), (clunk(0.3), 55.0), (whirr(2.2), 55.4), (clunk(0.25), 57.4),
    (tick(2000, 0.05, 0.08), 51.0), (tick(2000, 0.05, 0.08), 51.9), (tick(2000, 0.05, 0.08), 52.9), (chime((1046.5, 1568, 2093), 1.5, 0.05), 57.2),
    # S06
    (chime((1760, 2637), 0.8, 0.07), 60.1), (tick(2200, 0.05, 0.1), 62.3), (tick(2400, 0.05, 0.1), 62.65), (tick(2600, 0.05, 0.1), 63.0),
    (rumble(8.5, 0.05, 250), 64.5), (card(0.2, 0.10), 66.2), (card(0.2, 0.10), 67.45), (card(0.2, 0.10), 68.7),
    (tick(3000, 0.04, 0.08), 66.3), (tick(3000, 0.04, 0.08), 67.55), (tick(3000, 0.04, 0.08), 68.8), (thump(55, 0.6, 0.22), 68.5),
    # S07
    (card(0.2, 0.10), 75.4), (card(0.2, 0.10), 75.9), (card(0.2, 0.10), 76.4), (whoosh(1.2, 300, 1200, 0.07), 77.2), (thump(70, 0.4, 0.3), 78.75),
    (tick(2200, 0.05, 0.09), 74.6), (tick(2200, 0.05, 0.09), 78.6), (tick(2600, 0.05, 0.09), 83.6),
    (rumble(3.2, 0.06, 260), 79.4), (rumble(2.6, 0.15, 120, rise=True), 83.6),
    # S08
    (thump(45, 0.9, 0.3), 87.0), (tick(1600, 0.05, 0.08), 89.3), (tick(1700, 0.05, 0.08), 89.75), (tick(1800, 0.05, 0.08), 90.2), (tick(1900, 0.05, 0.08), 90.65),
    (thump(60, 0.4, 0.16), 93.9), (thump(60, 0.4, 0.16), 94.65), (thump(60, 0.4, 0.18), 95.4),
    # S09
    (chime((1318.5, 1975.5), 1.6, 0.07), 98.9),
    # S10
    (whoosh(1.6, 500, 2500, 0.06), 108.8), (thump(44, 1.2, 0.32), 117.3), (chime((587.3, 880, 1174.7), 2.5, 0.06), 117.35),
]
for i in range(20): CUES.append((tick(1500 + i * 40, 0.04, 0.05), 101.3 + i * 0.12))
for i in range(0, 61, 3): CUES.append((tick(3200, 0.03, 0.03), 16.2 + i * 2.2 / 61))
for i in range(16): CUES.append((tick(2800 + i * 30, 0.03, 0.035), 28.3 + i * 0.07))
for x, t in CUES: place(sfx, x, t)
# ambiance d'entrepôt discrète (S04 → S08)
amb = lp(noise(65), 400, 2) * 0.05 + bp(noise(65), 1800, 4000) * 0.004
amb *= env(len(amb), 1.5, 2.0); place(sfx, amb, 33.0)

# ---------------- VOIX (témoin) ----------------
vo = np.zeros(N)
sc = json.load(open('src/script.fr.json'))
for s in sc['scenes']:
    x, sr = sf.read(f"audio/vo/{s['id']}.wav")
    if x.ndim > 1: x = x.mean(1)
    if sr != SR: x = resample_poly(x, SR, sr)
    place(vo, x, s['start'] + s['vo_at'])
vo = hp(vo, 90) * db(-3)

# ---------------- MIXAGE ----------------
# ducking de la musique sous la voix (enveloppe RMS lissée)
e = np.sqrt(lp(vo ** 2, 6, 1).clip(0)); e = e / (e.max() + 1e-9)
duck = 1 - 0.55 * np.clip(e * 4, 0, 1)
duck = lp(duck, 3, 1)
music_d = music * duck
meter = pyln.Meter(SR)
def norm(x, target):
    # mesure sur le signal stéréo final (mono dupliqué sur L et R), conforme à ITU-R BS.1770
    l = meter.integrated_loudness(np.stack([x, x], 1)); return x * db(target - l)
vo_n = norm(vo, -18.0)
mus_n = norm(music_d, -31.0)
sfx_n = norm(sfx, -29.0)
from scipy.ndimage import minimum_filter1d, uniform_filter1d
def limit(x, ceil_db):
    """Limiteur à anticipation (5 ms) sur la crête vraie approchée (suréchantillonnage x4)."""
    c = db(ceil_db)
    pk = np.abs(resample_poly(x, 4, 1)).reshape(-1, 4).max(1)[:len(x)]
    g = np.minimum(1.0, c / np.maximum(pk, 1e-9))
    w = int(0.005 * SR)
    g = minimum_filter1d(g, 2 * w + 1)
    g = uniform_filter1d(g, w)
    return x * np.minimum(g, 1.0)
def finish(x, target=-16.0, tp=-1.5):
    for _ in range(4):
        x = norm(x, target); x = limit(x, tp - 0.3)
    return x
import os; os.makedirs('audio/stems', exist_ok=True)
sf.write('audio/stems/vo.wav', vo_n.astype(np.float32), SR, subtype='PCM_24')
sf.write('audio/stems/music.wav', mus_n.astype(np.float32), SR, subtype='PCM_24')
sf.write('audio/stems/sfx.wav', sfx_n.astype(np.float32), SR, subtype='PCM_24')
mix = finish(vo_n + mus_n + sfx_n)
novo = finish(norm(music, -24) + sfx_n * db(3))
for name, x in (('mix_master', mix), ('mix_novo', novo)):
    st = np.stack([x, x], 1).astype(np.float32)
    sf.write(f'audio/{name}.wav', st, SR, subtype='PCM_24')
    print(name, 'LUFS', round(meter.integrated_loudness(np.stack([x, x], 1)), 2), 'crête échantillon dBFS', round(20 * np.log10(np.max(np.abs(x))), 2),
          'crête vraie x4 dBTP', round(20 * np.log10(np.max(np.abs(resample_poly(x, 4, 1)))), 2))
