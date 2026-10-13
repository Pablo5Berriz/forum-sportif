# PRODUCTION_PLAN — technical architecture, rendering method, and QA

## 1. Choosing the pipeline

| Option | Advantages | Drawbacks | Decision |
|---|---|---|---|
| After Effects / Cinema 4D | Industry standard, rich effects | Not available in the production environment; not reproducible by script; licenses | Rejected for this phase |
| Remotion (React → video) | Code-driven, well suited to data | npm dependency and the full bundler; adds complexity without visual gain here | Rejected |
| Hosted AI video generation service | Fast | Does its own research and visuals: incompatible with the fact-check rule (risk of invented or generic warehouse footage) | Rejected |
| **2D canvas written in code + Chromium + ffmpeg** | Deterministic (frame = f(t)), 100 % reproducible, every visual tied to a fact, single-file text for adaptation, no rights to clear | Hand-drawn 2D/isometric rendering, less rich than a 3D render | **Chosen** |

## 2. Architecture

```
ikea-beauharnois-film/
├── docs/                 RESEARCH_REPORT, FACT_SHEET, SCRIPT_FR, STORYBOARD, ASSET_MANIFEST, PRODUCTION_PLAN
├── data/                 Natural Earth (public domain) + geo.json (simplified layers)
├── src/
│   ├── build_geo.py      Builds geo.json (far and near layers)
│   ├── script.fr.json    Voice-over script + timing + fact IDs per scene (single source of truth)
│   ├── make_vo.py        Reference voice (espeak-ng/MBROLA) + duration check per scene
│   ├── audio.py          Synthesized music, sound design cues, ducking, loudness normalization, limiter, stems
│   ├── subs.py           SRT + ASS (1080p) generated from the script and the measured voice durations
│   ├── render.mjs        Frame-by-frame rendering via Playwright/Chromium → ffmpeg (H.264)
│   ├── sheet.py          Contact sheets for visual QA
│   └── film/
│       ├── index.html    Real-time preview, or ?t=SECONDS for a still frame
│       ├── strings.fr.js All on-screen text (translation = one file)
│       ├── core.js       Palette, easing, text, isometrics, Mercator map, token
│       ├── scenes.js     Scenes S01 → S10 (local time)
│       └── main.js       Timeline, token/crossfade transitions, chapter labels, journey rail, labels
├── audio/                vo/ (reference voice per scene), stems/, mix_master.wav, mix_novo.wav
└── render/               Final MP4s, subtitles, stills
```

Principles:
- **Determinism**: each frame depends only on `t`. Two renders produce the same images. No browser randomness (`rnd()` is seeded).
- **Traceability**: each scene in `script.fr.json` lists its `F..` facts. The on-screen text lives only in `strings.fr.js`.
- **No counters on facts**: figures appear through a mask, already at their final value. A paused frame never shows a false number.

## 3. Reproducing the render

```bash
cd ikea-beauharnois-film
python3 src/build_geo.py data                  # once
python3 src/make_vo.py 156                     # reference voice + timing check
python3 src/audio.py                           # music, sound effects, mixes, stems
python3 src/subs.py render/IKEA_Beauharnois_fr-CA.srt
python3 -m http.server 8765 --bind 127.0.0.1 & # serves the page
export CHROME=/opt/pw-browsers/chromium-1194/chrome-linux/chrome
for i in 0 1 2 3; do node src/render.mjs render/seg/seg$i.mp4 $((i*30)) $((i*30+30)) 30 & done; wait
ffmpeg -f concat -safe 0 -i render/concat.txt -c copy render/video_only.mp4
ffmpeg -i render/video_only.mp4 -i audio/mix_master.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 320k -movflags +faststart render/IKEA_Beauharnois_master_1080p30.mp4
```
Measured time: about 2.5 min for the video (4 parallel workers), under 1 min for the audio.

## 4. Master specifications

| Parameter | Value | Check |
|---|---|---|
| Resolution / ratio | 1920 × 1080, 16:9 | ffprobe |
| Frame rate | 30 fps, 3,600 frames | ffprobe: 4 × 900 frames |
| Duration | 2:00.00 | ffprobe |
| Video | H.264 High, yuv420p, CRF 14 (master) | — |
| Audio | AAC 320 kb/s, 48 kHz, stereo | ffprobe |
| Loudness | −16.0 LUFS integrated, LRA 7.4 LU | ffmpeg ebur128 |
| Peak | −1.8 dBFS (target ≤ −1.5 dBTP) | ffmpeg ebur128 peak |

−16 LUFS is a common target for web and social-media playback. For broadcast TV in Canada, run a separate mix pass at the network's specification (often −24 LKFS / ATSC A/85). I cannot confirm each network's exact requirement.

## 5. Planned adaptations

| Version | Status | Method |
|---|---|---|
| Subtitled (FR) | **Delivered** | `subs.py` → ASS 1080p, burned in with ffmpeg; SRT provided |
| No voice | **Delivered** | `mix_novo.wav` (music + sound effects raised) |
| English | Prepared | Translate `strings.fr.js` → `strings.en.js`, write `script.en.json`, record the VO, adjust `BOUNDS` if the timing changes |
| 1:1 (1080 × 1080) | Partial | The maps and the S05, S08 and S10 titles hold up in a center crop. S02, S06 and S07 place information on the right and need a layout variant (`W`/`H` parameters + per-format positions) |
| 9:16 | To build | A center crop does not work (608 px of width). Needs a dedicated per-scene layout: stacked text, cards below the illustration. The code allows this (positions computed in `scenes.js`), but it is real design work, about 1 to 2 days |
| Short clips | Easy | Each scene is independent: `node src/render.mjs clip.mp4 45 59.5` renders the ASRS segment, for example |

## 6. Quality gate: results

### 6.1 FACT CHECK

| Check | Result |
|---|---|
| Every figure on screen is in FACT_SHEET | ✅ 1,000,000+ sq ft (F05), 244,000 (F06), 380+ (F07), 61 rinks (C1), 20 chargers (F19), 2023 (F02) |
| Contradictory figure excluded | ✅ 1.2 M sq ft not shown |
| Dated information shown with its date | ✅ "at opening, in 2023" (380+), "announced at opening (2023)" (chargers) |
| Undocumented internal organization | ✅ "functions" taken from job postings, never "departments" |
| Equipment shown as real | ✅ "Schematic" and "Illustrative representation" on every visual |
| Greenwashing | ✅ Only LEED Silver + 20 chargers, with no leaf or "green" claim |
| **Facts marked OK-R** (F06, F10, F11, F13, F16) | ⚠️ **To confirm**: sources found by search, but their pages could not be read in full (network blocked). Mandatory validation before broadcast |

### 6.2 VISUAL CHECK

Method: contact sheets of 40+ frames at key timecodes, with fixes applied.

| Point | Result |
|---|---|
| Legibility / hierarchy | ✅ Body text ≥ 21 px; rail labels 17 px; source notes 16 px |
| Contrast | ✅ Ink #15181D on paper #F5F3EE; white and yellow on night blue in S05 |
| Collisions | ✅ Fixed during production: progress line struck through the labels (S07), "LEED/Argent" overlap (S09), truck/label (S07), subtitles in the middle of the frame |
| Safe areas | ⚠️ Titles, figures and subtitles within the 90 % action-safe area. Source notes and "Illustrative representation" sit 34 px from the bottom edge: fine for web, but move them up for broadcast TV (overscan) |
| Image quality | ✅ Native vector rendering at 1080p, no scaling |
| Intermediate false figures | ✅ Fixed: animated counters (which showed "925,675", "377") replaced with reveals |

### 6.3 MOTION CHECK

| Point | Result |
|---|---|
| Dead frames | ✅ `freezedetect` (n = 0.0008, d = 1.5 s): **0 detections** after adding camera drift. The final hold on IKEA BEAUHARNOIS is intentional |
| Transitions | ✅ 3 transitions where the token covers the frame (map → building, map → dock, tracked unit → ASRS), 6 motivated crossfades, fade to black |
| Easing | ✅ Cubic and exponential ease-in/ease-out; exponential map zoom with a coupled center |
| Sync | ⚠️ Synced to the reference voice. To adjust after the final recording (±0.5 s per block) |

### 6.4 AUDIO CHECK

| Point | Result |
|---|---|
| Loudness | ✅ −16.0 LUFS (master and no-voice version) |
| Clipping | ✅ Peak −1.8 dBFS, look-ahead limiter on the 4× oversampled peak |
| Music under the voice | ✅ Ducking of about −7 dB driven by the voice envelope; music −13 LU below the voice |
| Intelligibility | ⚠️ **The reference voice is synthetic and robotic.** Good for timing, not acceptable for broadcast |
| Ending | ✅ Music resolves on D major, complete fade at 2:00 |

## 7. Acceptance criteria (section 15 of the brief)

| Question | Answered by | Assessment |
|---|---|---|
| What is the Beauharnois center? | S01 + S02 (DC + CDC, location, scale) | Covered |
| What is it for? | S02 (two roles) + S03 (network) | Covered |
| How does a product move through it? | S04 → S07 + rail + token | Covered |
| How does automation come in? | S05 (ASRS) + S06 (goods-to-person) | Covered, schematic only |
| How is an order prepared? | S06 + S07 | Covered |
| How does it support stores and customers? | S03 + S07 (sorting into 2 streams) + S10 | Covered |
| What role do co-workers play? | S08 | Partially: functions taken from job postings, with no real testimony |
| Which environmental elements are documented? | S09 | Covered (limited to what is documented) |

**Assessment.** This version validates the narrative, the facts, the rhythm and the art direction. It does not yet give the feeling of having "actually visited" the site: no authentic image of Beauharnois could be obtained. That requires the steps in section 9.

## 8. Before broadcast (blocking)

1. **Fact check**: have someone read sources S1, S2, S4 and S5 in full, and confirm the OK-R facts (F06, F10, F11, F13, F16). Remove or rephrase any fact that is not confirmed.
2. **Legal approval from IKEA Canada**: use of the name, colors, the "IKEA" wordmark in the end card; the logo if they want it.
3. **Professional voice**: record a Quebec voice talent (see SCRIPT_FR.md), replace `audio/vo/S0x.wav`, rerun `audio.py` and `subs.py`, then re-mux. MBROLA voices are distributed under a non-commercial license: **the reference voice must not be broadcast**.
4. **Re-timing**: if a block runs over its margin, shift `BOUNDS` (main.js) and the `CUES` (audio.py).

## 9. Recommendations for a premium version

| Need | Request from IKEA Canada | Impact |
|---|---|---|
| Authentic scale | Aerial view or drone footage of the site (or the right to film it) | Replaces the illustrative building in S02 and S09 |
| Accurate automation | Real footage of the ASRS and the goods-to-person stations, plus a technical review of the schematics | Makes S05/S06 credible |
| Human dimension | 2 or 3 short shots of co-workers (with consent), approved list of functions | Makes S08 concrete |
| Brand | Official logo, typography guide | Final brand compliance |
| Current facts | Confirmation of headcount, chargers, and status of the 900 Turnbull Street warehouse (2026) | Avoids out-of-date figures |

The architecture lets you mix in this footage: insert video clips through ffmpeg (overlay) or as an image layer in `drawScene`, without touching the rest of the film.

## 10. Rollback

Every step regenerates from the sources. To roll back a scene, revert `scenes.js`/`strings.fr.js` to the previous version (git) and re-render only the affected segment (`render.mjs` with t0/t1), then concatenate again.
