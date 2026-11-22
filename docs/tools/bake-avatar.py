"""Bake the tape filter into the profile picture so the browser doesn't have to do it live.

    python tools/bake-avatar.py path/to/original.jpg assets/avatar-tape.webp

Needs Pillow and numpy. Re-run it if you swap in a different or larger photo.
"""
import sys
import numpy as np
from PIL import Image

src, out = sys.argv[1], sys.argv[2]
SIZE = 920
PINK = np.array([255, 42, 127]) / 255
CYAN = np.array([0, 224, 255]) / 255

g = np.asarray(Image.open(src).convert('L').resize((SIZE, SIZE), Image.LANCZOS), dtype=np.float64) / 255


def contrast(a, c, b=1.0):
    return np.clip(((a - 0.5) * c + 0.5) * b, 0, 1)


base = contrast(g, 1.3, 1.12)[..., None] * PINK                      # photocopy: black ink on pink paper
ghost = np.roll(contrast(g, 1.8), (int(SIZE * 0.005), -int(SIZE * 0.013)), axis=(0, 1))
img = 1 - (1 - base) * (1 - ghost[..., None] * CYAN * 0.32)          # cyan ghost, screened on top

yy, xx = np.mgrid[0:SIZE, 0:SIZE]                                    # halftone dots
dots = ((xx % 10 - 5) ** 2 + (yy % 10 - 5) ** 2) < 2.3 ** 2
img[dots] *= 0.6

for y0, y1, colour, a in ((0.61, 0.616, np.ones(3), 0.5), (0.83, 0.844, CYAN, 0.45)):   # two tracking lines
    rows = slice(int(SIZE * y0), int(SIZE * y1))
    img[rows] = 1 - (1 - img[rows]) * (1 - colour * a)

Image.fromarray((np.clip(img, 0, 1) * 255).astype(np.uint8)).save(out, quality=80, method=6)
print('wrote', out)
