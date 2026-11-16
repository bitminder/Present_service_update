#!/usr/bin/env python3
"""Vectorize the EXISTING low-resolution logo pixels without changing brand geometry.
This is a faithful outline trace, not the original brand-master vector artwork.
Run: python3 scripts/vectorize-logo.py
Requires: pillow, numpy, opencv-python-headless.
"""
from pathlib import Path
from PIL import Image
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets" / "present-service-logo.png"
TARGET = ROOT / "assets" / "present-service-logo.svg"
image = np.asarray(Image.open(SOURCE).convert("RGBA"))
assert image.shape[:2] == (33, 212), "Inspect new logo dimensions before tracing"
rgb = image[:, :, :3].astype(np.float64)
alpha = image[:, :, 3]
yy, xx = np.indices(alpha.shape)
# Magenta and gray are the two original corporate colors.
# The small magenta symbol extends into the gray wordmark's vertical span.
magenta = ((rgb[:, :, 0] > rgb[:, :, 1] * 1.3) &
           (rgb[:, :, 2] > rgb[:, :, 1] * 1.2)) | (xx < 33)
mag_alpha = np.where(magenta, alpha, 0).astype(np.uint8)
gray_alpha = np.where(~magenta, alpha, 0).astype(np.uint8)

SCALE = 8
def outline(mask):
    expanded = cv2.resize(mask, None, fx=SCALE, fy=SCALE,
                          interpolation=cv2.INTER_CUBIC)
    _, bw = cv2.threshold(expanded, 127, 255, cv2.THRESH_BINARY)
    contours, _ = cv2.findContours(bw, cv2.RETR_LIST,
                                   cv2.CHAIN_APPROX_SIMPLE)
    paths = []
    for contour in contours:
        if cv2.contourArea(contour) < 3 * (SCALE ** 2) / 12:
            continue
        points = cv2.approxPolyDP(contour, epsilon=2.2, closed=True)
        points = points.reshape(-1, 2) / SCALE
        if len(points) < 3:
            continue
        coords = "L".join(f"{px:.3f},{py:.3f}" for px, py in points)
        paths.append("M" + coords + "Z")
    return "".join(paths)

mag_path = outline(mag_alpha)
gray_path = outline(gray_alpha)
assert mag_path and gray_path, "Missing color paths"
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="212" height="33" '
       f'viewBox="0 0 212 33" role="img" aria-labelledby="logoTitle">'
       f'<title id="logoTitle">Present-Service – Marketing Communication</title>'
       f'<path fill="#C21875" fill-rule="evenodd" d="{mag_path}"/>'
       f'<path fill="#6C6766" fill-rule="evenodd" d="{gray_path}"/>'
       '</svg>\n')
TARGET.write_text(svg, encoding="utf-8")
print(f"VECTOR LOGO: {TARGET.relative_to(ROOT)} ({len(svg)} bytes); "
      "212 x 33 viewBox; two real vector paths; no embedded raster")
