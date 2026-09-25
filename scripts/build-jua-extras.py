# /// script
# requires-python = ">=3.10"
# dependencies = ["fonttools>=4.50", "brotli"]
# ///
"""
Builds static/fonts/jua-extras.woff2, the characters Jua is missing.

Jua only covers ASCII and Hangul: no accented letters, no curly apostrophe, no
dashes, no euro sign. Left alone, the browser draws those in whatever system
font it finds, so "café" gets a lone é in Helvetica. This font goes in front of
Jua, limited by unicode-range to what it adds, and fills the gap:

- accented letters are Jua's own letter with an accent from Nunito (whose 700
  weight has about Jua's stroke width), placed the way Nunito places it;
- everything else (ß, æ, ø, quotes, dashes, symbols) is Nunito's glyph, scaled
  to Jua's x-height where it is a lowercase letter;
- Jua's own curly double quotes, which are drawn as single ticks, are replaced.

It keeps Jua's vertical metrics, so a line that falls back to it does not get
taller. Run it with `uv run scripts/build-jua-extras.py`, then paste the
unicode-range it prints into the @font-face in src/app.css.
"""

import unicodedata
import urllib.request
from pathlib import Path
from tempfile import gettempdir

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

SOURCES = {
    "jua": "https://github.com/google/fonts/raw/main/ofl/jua/Jua-Regular.ttf",
    "nunito": "https://github.com/google/fonts/raw/main/ofl/nunito/Nunito%5Bwght%5D.ttf",
}
OUT = Path(__file__).resolve().parent.parent / "static" / "fonts" / "jua-extras.woff2"

# Nunito weights: marks and capitals at 700 match Jua's stroke as-is; lowercase
# letters are shrunk to Jua's x-height, so they start from 800 to end up there.
MARK_WEIGHT = 700
SHRUNK_WEIGHT = 800


def wanted() -> list[int]:
    chars = [*range(0xA1, 0x180)]  # Latin-1 Supplement, Latin Extended-A
    chars += [0x18F, 0x192, *range(0x1CD, 0x1DD), *range(0x218, 0x21C), 0x237, 0x259]
    chars += [*range(0x2C6, 0x2DE)]  # spacing accents: ˆ ˇ ˘ ˙ ˚ ˛ ˜ ˝
    chars += [0x1E9E, *range(0x1EA0, 0x1EFA)]  # ẞ, Vietnamese
    chars += [0x60, *range(0x2010, 0x2023), 0x2026, 0x2030, 0x2032, 0x2033]
    chars += [0x2039, 0x203A, 0x2044, 0x20AC, 0x20B9, 0x2122]
    chars += [*range(0x2190, 0x2194), 0x2212, 0x2248, 0x2260, 0x2264, 0x2265]
    return [c for c in chars if c != 0xAD]  # the browser handles soft hyphens


# Characters Jua has but draws wrong: its “ and ” look like ‘ and ’.
REPLACED = {0x201C, 0x201D}


def fetch(name: str) -> TTFont:
    path = Path(gettempdir()) / f"haven-{name}.ttf"
    if not path.exists():
        urllib.request.urlretrieve(SOURCES[name], path)
    return TTFont(path)


def nunito(weight: int) -> TTFont:
    return instantiateVariableFont(fetch("nunito"), {"wght": weight})


class Source:
    """One font's glyphs, drawable by codepoint or glyph name."""

    def __init__(self, font: TTFont):
        self.font = font
        self.glyphs = font.getGlyphSet()
        self.cmap = font.getBestCmap()
        self.glyf = font["glyf"] if "glyf" in font else None

    def name(self, char: int) -> str | None:
        return self.cmap.get(char)

    def record(self, name: str) -> DecomposingRecordingPen:
        pen = DecomposingRecordingPen(self.glyphs)
        self.glyphs[name].draw(pen)
        return pen

    def bounds(self, name: str):
        pen = BoundsPen(self.glyphs)
        self.glyphs[name].draw(pen)
        return pen.bounds

    def width(self, name: str) -> int:
        return self.glyphs[name].width


def dotless(jua: Source, name: str) -> DecomposingRecordingPen:
    """Jua's i or j with the dot (every contour starting above the x-height) removed."""
    pen = jua.record(name)
    contours, current = [], []
    for op in pen.value:
        current.append(op)
        if op[0] in ("closePath", "endPath"):
            contours.append(current)
            current = []
    xheight = jua.font["OS/2"].sxHeight
    keep = [
        c for c in contours if min(p[1] for _, pts in c for p in pts) < xheight
    ]
    pen.value = [op for c in keep for op in c]
    return pen


def draw(out, recording, dx=0.0, dy=0.0, scale=1.0):
    recording.replay(TransformPen(out, (scale, 0, 0, scale, dx, dy)))


def main():
    jua = Source(fetch("jua"))
    marks = Source(nunito(MARK_WEIGHT))
    shrunk = Source(nunito(SHRUNK_WEIGHT))
    xscale = jua.font["OS/2"].sxHeight / marks.font["OS/2"].sxHeight

    def jua_base(nunito_base: str):
        """The Jua glyph standing in for a Nunito composite's base glyph."""
        if nunito_base in ("idotless", "dotlessi"):
            return dotless(jua, jua.name(ord("i"))), jua.name(ord("i"))
        if nunito_base in ("jdotless", "dotlessj", "uni0237"):
            return dotless(jua, jua.name(ord("j"))), jua.name(ord("j"))
        char = next((c for c, n in marks.cmap.items() if n == nunito_base), None)
        if char is None or jua.name(char) is None:
            return None
        return jua.record(jua.name(char)), jua.name(char)

    def composed(char: int):
        """An accented letter as a Jua base plus Nunito marks, if Nunito builds it that way."""
        glyph = marks.glyf[marks.name(char)]
        if not glyph.isComposite():
            return None
        base, *accents = glyph.components
        found = jua_base(base.glyphName)
        if found is None or base.x or base.y:
            return None
        base_pen, base_name = found

        nb = marks.bounds(base.glyphName)
        jb = BoundsPen(None)
        base_pen.replay(jb)
        jb = jb.bounds

        pen = TTGlyphPen(None)
        draw(pen, base_pen)
        for accent in accents:
            mb = marks.bounds(accent.glyphName)
            if mb is None:
                continue
            # Keep the accent where it sits across the base's width, and its
            # gap above the top (or below the bottom) of the base.
            left, bottom = mb[0] + accent.x, mb[1] + accent.y
            across = (left - nb[0]) / (nb[2] - nb[0])
            dx = jb[0] + across * (jb[2] - jb[0]) - left
            above = bottom > (nb[1] + nb[3]) / 2
            dy = (jb[3] - nb[3]) if above else (jb[1] - nb[1])
            draw(pen, marks.record(accent.glyphName), accent.x + dx, accent.y + dy)
        return pen.glyph(), jua.width(base_name)

    def joined(char: int):
        """A ligature Nunito lacks that is just two Jua letters side by side."""
        parts = unicodedata.normalize("NFKD", chr(char))
        names = [jua.name(ord(c)) for c in parts]
        if len(parts) < 2 or None in names:
            return None
        pen, x = TTGlyphPen(None), 0
        for name in names:
            draw(pen, jua.record(name), dx=x)
            x += jua.width(name)
        return pen.glyph(), x

    def borrowed(char: int):
        """Nunito's own glyph, shrunk to Jua's x-height when it is a lowercase letter."""
        lower = unicodedata.category(chr(char)) == "Ll"
        src = shrunk if lower else marks
        name = src.name(char)
        if name is None:
            return None
        scale = xscale if lower else 1.0
        pen = TTGlyphPen(None)
        draw(pen, src.record(name), scale=scale)
        return pen.glyph(), round(src.width(name) * scale)

    order, cmap, glyphs, metrics = [".notdef"], {}, {}, {}
    glyphs[".notdef"] = TTGlyphPen(None).glyph()
    metrics[".notdef"] = (500, 0)
    for char in sorted({*wanted(), *REPLACED}):
        if jua.name(char) and char not in REPLACED:
            continue
        if marks.name(char):
            built = composed(char) or borrowed(char)
        else:
            built = joined(char)
        if built is None:
            continue
        glyph, width = built
        name = f"uni{char:04X}"
        order.append(name)
        cmap[char] = name
        glyphs[name] = glyph
        glyph.recalcBounds(None)
        metrics[name] = (width, getattr(glyph, "xMin", 0))

    os2 = jua.font["OS/2"]
    hhea = jua.font["hhea"]
    fb = FontBuilder(jua.font["head"].unitsPerEm, isTTF=True)
    fb.setupGlyphOrder(order)
    fb.setupCharacterMap(cmap)
    fb.setupGlyf(glyphs)
    fb.setupHorizontalMetrics(metrics)
    fb.setupHorizontalHeader(
        ascent=hhea.ascent, descent=hhea.descent, lineGap=hhea.lineGap
    )
    fb.setupNameTable(
        {
            "familyName": "Jua Extras",
            "styleName": "Regular",
            "copyright": "Copyright 2018 The Jua Project Authors; "
            "Copyright 2014 The Nunito Project Authors",
            "licenseDescription": "SIL Open Font License, Version 1.1",
            "licenseInfoURL": "https://openfontlicense.org",
        }
    )
    fb.setupOS2(
        version=4,
        sTypoAscender=os2.sTypoAscender,
        sTypoDescender=os2.sTypoDescender,
        sTypoLineGap=os2.sTypoLineGap,
        usWinAscent=os2.usWinAscent,
        usWinDescent=os2.usWinDescent,
        sxHeight=os2.sxHeight,
        sCapHeight=os2.sCapHeight,
        fsSelection=os2.fsSelection,
    )
    fb.setupPost()
    fb.font.flavor = "woff2"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    fb.save(OUT)

    print(f"{len(cmap)} glyphs, {OUT.stat().st_size} bytes -> {OUT}")
    print("unicode-range:", unicode_range(sorted(cmap)))


def unicode_range(chars: list[int]) -> str:
    runs, start = [], chars[0]
    for prev, cur in zip(chars, chars[1:] + [None]):
        if cur is None or cur != prev + 1:
            runs.append(f"U+{start:X}" if start == prev else f"U+{start:X}-{prev:X}")
            start = cur
    return ", ".join(runs)


if __name__ == "__main__":
    main()
