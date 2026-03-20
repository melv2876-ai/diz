from PIL import Image
import numpy as np
import os

src = Image.open("logo/2026-03-19 16.12.47.jpg")
w, h = src.size
print(f"Source: {w}x{h}")

arr = np.array(src)
bright = arr.max(axis=2) > 30

rows = np.any(bright, axis=1)
cols = np.any(bright, axis=0)
rmin, rmax = np.where(rows)[0][[0, -1]]
cmin, cmax = np.where(cols)[0][[0, -1]]
print(f"Content bounds: y={rmin}-{rmax}, x={cmin}-{cmax}")

# Find icon-text gap
col_sums = bright.sum(axis=0)
in_content = False
gap_start = None
for i in range(cmin, cmax + 1):
    if col_sums[i] > 10:
        in_content = True
    if in_content and col_sums[i] < 5:
        gap_start = i
        break

print(f"Gap starts at x={gap_start}")

# Icon bounds
icon_region = arr[:, cmin:gap_start, :]
icon_bright = icon_region.max(axis=2) > 30
icon_rows = np.any(icon_bright, axis=1)
icon_rmin, icon_rmax = np.where(icon_rows)[0][[0, -1]]
icon_w = gap_start - cmin
icon_h = icon_rmax - icon_rmin + 1
print(f"Icon bounds: y={icon_rmin}-{icon_rmax}, x={cmin}-{gap_start}")
print(f"Icon area: {icon_w}x{icon_h}")

# Crop icon as square
icon_size = max(icon_w, icon_h)
icon_cx = cmin + icon_w // 2
icon_cy = icon_rmin + icon_h // 2
half = icon_size // 2 + 4

icon_crop = src.crop((icon_cx - half, icon_cy - half, icon_cx + half, icon_cy + half))

os.makedirs("public", exist_ok=True)

# Save icon at multiple sizes (as PNG with transparency removed - just square crop)
icon_crop.resize((512, 512), Image.LANCZOS).save("public/icon-512.png", "PNG")
icon_crop.resize((192, 192), Image.LANCZOS).save("public/icon-192.png", "PNG")
icon_crop.resize((64, 64), Image.LANCZOS).save("public/icon-64.png", "PNG")
icon_crop.resize((32, 32), Image.LANCZOS).save("public/icon-32.png", "PNG")

# Full logo (icon + text)
pad = 8
logo_crop = src.crop((cmin - pad, rmin - pad, cmax + pad, rmax + pad))
logo_crop.save("public/logo-full.png", "PNG")

# Sized for header usage (height ~80px)
lw, lh = logo_crop.size
target_h = 80
target_w = int(lw * target_h / lh)
logo_crop.resize((target_w, target_h), Image.LANCZOS).save("public/logo-80h.png", "PNG")

# Also create a 2x version for retina
target_h2 = 160
target_w2 = int(lw * target_h2 / lh)
logo_crop.resize((target_w2, target_h2), Image.LANCZOS).save("public/logo-160h.png", "PNG")

print("DONE!")
print(f"  icon-512.png: 512x512")
print(f"  icon-192.png: 192x192")
print(f"  icon-64.png:  64x64")
print(f"  icon-32.png:  32x32")
print(f"  logo-full.png: {logo_crop.size}")
print(f"  logo-80h.png: {target_w}x{target_h}")
print(f"  logo-160h.png: {target_w2}x{target_h2}")
