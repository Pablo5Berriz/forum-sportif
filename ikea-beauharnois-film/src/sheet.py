import sys
from PIL import Image, ImageDraw
files = sys.argv[2:]; out = sys.argv[1]
w, h = 960, 540; cols = 2; rows = (len(files) + 1) // 2
sheet = Image.new('RGB', (w * cols, h * rows), 'black')
d = ImageDraw.Draw(sheet)
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize((w, h), Image.LANCZOS)
    sheet.paste(im, ((i % cols) * w, (i // cols) * h))
    d.rectangle([(i % cols) * w, (i // cols) * h, (i % cols) * w + 150, (i // cols) * h + 26], fill='black')
    d.text(((i % cols) * w + 6, (i // cols) * h + 6), f.split('/')[-1], fill='white')
sheet.save(out)
