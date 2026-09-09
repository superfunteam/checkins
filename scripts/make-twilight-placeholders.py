#!/usr/bin/env python3
"""
Generate placeholder badge art and PWA icons for the Twilight passport.

Creates missing assets only; never overwrites an existing sample or final image.
Run: python3 scripts/make-twilight-placeholders.py
"""
from pathlib import Path
import json
import textwrap
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent / "public/passports/twilight/assets/images"
BADGES = ROOT / "badges"
ICONS = ROOT / "icons"
BADGES.mkdir(parents=True, exist_ok=True)
ICONS.mkdir(parents=True, exist_ok=True)

NAVY = (29, 42, 55)
NAVY_DEEP = (15, 23, 42)
MIST = (226, 232, 240)
RED = (200, 38, 43)
GOLD = (201, 162, 39)

TYPE_RING = {
    "movie": (77, 111, 141),   # overcast blue
    "meal": (200, 38, 43),     # apple red
    "scene": (201, 162, 39),   # golden eyes
    "secret": (124, 58, 237),  # violet
}

# id, type, label lines
BADGE_SPECS = [
    ("twilight", "movie", ["TWILIGHT"]),
    ("new-moon", "movie", ["NEW", "MOON"]),
    ("eclipse", "movie", ["ECLIPSE"]),
    ("breaking-dawn-1", "movie", ["BREAKING", "DAWN I"]),
    ("breaking-dawn-2", "movie", ["BREAKING", "DAWN II"]),
    ("breakfast", "meal", ["BREAKFAST"]),
    ("lunch", "meal", ["LUNCH"]),
    ("dinner", "meal", ["DINNER"]),
    ("late-night-snack", "meal", ["LATE", "SNACK"]),
    ("vampire-baseball", "scene", ["VAMPIRE", "BASEBALL"]),
    ("volterra", "scene", ["VOLTERRA"]),
    ("the-tent", "scene", ["THE", "TENT"]),
    ("the-wedding", "scene", ["THE", "WEDDING"]),
    ("the-battle", "scene", ["THE", "BATTLE"]),
    ("secret-movies", "secret", ["ALL", "FILMS"]),
    ("secret-meals", "secret", ["ALL", "MEALS"]),
    ("secret-scenes", "secret", ["ALL", "SCENES"]),
    ("secret-immortal", "secret", ["IMMORTAL"]),
]

FONT_CANDIDATES = [
    "/System/Library/Fonts/Supplemental/Georgia Bold.ttf",
    "/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf",
    "/Library/Fonts/Georgia Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
]


def font(size):
    for path in FONT_CANDIDATES:
        try:
            return ImageFont.truetype(path, size)
        except OSError:
            continue
    return ImageFont.load_default()


def vertical_gradient(size, top, bottom):
    img = Image.new("RGB", (size, size), top)
    px = img.load()
    for y in range(size):
        t = y / (size - 1)
        c = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(size):
            px[x, y] = c
    return img


def crescent(draw, cx, cy, r, color, bg):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=color)
    off = int(r * 0.45)
    draw.ellipse((cx - r + off, cy - r - off // 2, cx + r + off, cy + r - off // 2), fill=bg)


def badge(badge_id, kind, lines, size=512):
    ring = TYPE_RING[kind]
    img = vertical_gradient(size, NAVY, NAVY_DEEP)
    mask = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask).ellipse((0, 0, size - 1, size - 1), fill=255)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(img, (0, 0), mask)
    d = ImageDraw.Draw(out)

    # ring
    w = int(size * 0.045)
    d.ellipse((w // 2, w // 2, size - w // 2 - 1, size - w // 2 - 1), outline=ring, width=w)

    # crescent moon motif (a red apple dot for meals)
    cx, cy = size // 2, int(size * 0.40)
    r = int(size * 0.16)
    if kind == "meal":
        d.ellipse((cx - r, cy - r, cx + r, cy + r), fill=RED)
        d.rounded_rectangle((cx - 6, cy - r - 26, cx + 6, cy - r + 6), radius=6, fill=(90, 60, 30))
    else:
        moon = MIST if kind != "secret" else (196, 181, 253)
        crescent(d, cx, cy, r, moon, _sample(out, cx + r + 8, cy))

    # label
    f = font(int(size * 0.085))
    y = int(size * 0.62)
    for line in lines:
        bbox = d.textbbox((0, 0), line, font=f)
        tw = bbox[2] - bbox[0]
        d.text(((size - tw) / 2, y), line, font=f, fill=MIST)
        y += int(size * 0.10)

    # tiny "placeholder" tag so it can't be mistaken for final art
    f2 = font(int(size * 0.045))
    tag = "PLACEHOLDER"
    bbox = d.textbbox((0, 0), tag, font=f2)
    d.text(((size - (bbox[2] - bbox[0])) / 2, int(size * 0.84)), tag, font=f2, fill=(120, 134, 150))

    out.save(BADGES / f"badge-{badge_id}.webp", "WEBP", quality=88)


def _sample(img, x, y):
    return img.getpixel((x, y))[:3]


def icon(size, maskable):
    img = vertical_gradient(size, NAVY, NAVY_DEEP)
    d = ImageDraw.Draw(img)
    # maskable icons keep content inside the central 80% safe zone
    scale = 0.62 if maskable else 0.78
    r = int(size * scale / 2 * 0.62)
    cx, cy = size // 2, size // 2
    crescent(d, cx, cy, r, MIST, _sample(img, cx + r + 4, cy))
    ar = int(size * 0.07)
    d.ellipse((cx + r * 0.55 - ar, cy + r * 0.55 - ar, cx + r * 0.55 + ar, cy + r * 0.55 + ar), fill=RED)
    if not maskable:
        # rounded corners for the plain icon
        mask = Image.new("L", (size, size), 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, size - 1, size - 1), radius=int(size * 0.22), fill=255)
        out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
        out.paste(img, (0, 0), mask)
        img = out
    name = f"icon-maskable-{size}.png" if maskable else f"icon-{size}.png"
    img.save(ICONS / name, "PNG")


if __name__ == "__main__":
    passport = json.loads((ROOT.parent.parent / "passport.json").read_text())
    written = 0
    for item in passport["badges"]:
        if (BADGES / f"badge-{item['id']}.webp").exists():
            continue
        lines = textwrap.wrap(item["name"].upper(), width=16)
        if len(lines) > 2:
            lines = [item["type"].upper(), "ART PENDING"]
        badge(item["id"], item["type"], lines)
        written += 1
    for s in (192, 512):
        for maskable in (False, True):
            name = f"icon-maskable-{s}.png" if maskable else f"icon-{s}.png"
            if not (ICONS / name).exists():
                icon(s, maskable)
    print(f"wrote {written} missing badge placeholders to {ROOT}; existing art preserved")
