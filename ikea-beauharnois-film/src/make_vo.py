"""Voix témoin (scratch) via espeak-ng + MBROLA fr4. Ne remplace PAS une voix professionnelle."""
import json, subprocess, sys, re
s = json.load(open('src/script.fr.json'))
speed = int(sys.argv[1]) if len(sys.argv) > 1 else 150
tot = 0
for sc in s['scenes']:
    out = f"audio/vo/{sc['id']}.wav"
    subprocess.run(['mkdir', '-p', 'audio/vo'])
    subprocess.run(['espeak-ng', '-v', 'mb-fr4', '-s', str(speed), '-g', '4', '-w', out + '.raw.wav', sc['vo']], stderr=subprocess.DEVNULL)
    # 48 kHz, légère égalisation, normalisation
    subprocess.run(['sox', out + '.raw.wav', '-r', '48000', '-c', '1', out, 'highpass', '80', 'lowpass', '9000', 'norm', '-3'], check=True)
    d = float(subprocess.check_output(['soxi', '-D', out]))
    avail = sc['end'] - sc['start'] - sc['vo_at'] - (2.6 if sc['id']=='S10' else 0.3)
    words = len(re.findall(r"[\w'’-]+", sc['vo']))
    tot += words
    print(f"{sc['id']} mots={words:3d} durée={d:5.2f}s dispo={avail:5.2f}s {'OK' if d <= avail else 'TROP LONG'}")
print('total mots', tot)
