#!/usr/bin/env python3
"""Convert an OTF/TTF into three.js typeface JSON.

three's FontLoader wants glyph outlines as a command string per character, and
its curve commands list the END point first and the control points after — which
is the reverse of every drawing API — so the pen below emits them in that order
deliberately. Run it when the face or the character set changes; the JSON is
committed and loaded by <Text3D>.

    python3 scripts/otf-to-typeface.py <font.otf> <out.json>
"""

import json
import sys

from fontTools.pens.basePen import BasePen
from fontTools.ttLib import TTFont


class ThreePen(BasePen):
    """Emits three.js outline commands. BasePen turns quadratics into cubics for
    us, so only the cubic case needs handling."""

    def __init__(self, glyphSet):
        super().__init__(glyphSet)
        self.parts = []

    def _moveTo(self, pt):
        self.parts += ["m", r(pt[0]), r(pt[1])]

    def _lineTo(self, pt):
        self.parts += ["l", r(pt[0]), r(pt[1])]

    def _curveToOne(self, c1, c2, pt):
        self.parts += ["b", r(pt[0]), r(pt[1]), r(c1[0]), r(c1[1]), r(c2[0]), r(c2[1])]

    def _closePath(self):
        pass


def r(v):
    return int(round(v))


def main(src, dst):
    font = TTFont(src)
    glyph_set = font.getGlyphSet()
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    head = font["head"]
    hhea = font["hhea"]
    units = head.unitsPerEm

    glyphs = {}
    missing = []
    for code in range(32, 127):
        char = chr(code)
        name = cmap.get(code)
        if name is None:
            missing.append(char)
            continue
        pen = ThreePen(glyph_set)
        glyph_set[name].draw(pen)
        advance = hmtx[name][0]
        entry = {"ha": advance, "x_min": 0, "x_max": advance}
        if pen.parts:
            entry["o"] = " ".join(str(p) for p in pen.parts)
        glyphs[char] = entry

    data = {
        "glyphs": glyphs,
        "familyName": font["name"].getDebugName(1) or "Converted",
        "ascender": hhea.ascent,
        "descender": hhea.descent,
        "underlinePosition": -100,
        "underlineThickness": 50,
        "boundingBox": {
            "xMin": head.xMin,
            "xMax": head.xMax,
            "yMin": head.yMin,
            "yMax": head.yMax,
        },
        "resolution": units,
        "original_font_information": {},
    }

    with open(dst, "w") as fh:
        json.dump(data, fh, separators=(",", ":"))

    print(f"{len(glyphs)} glyphs, unitsPerEm={units} -> {dst}")
    if missing:
        print("missing from cmap:", "".join(missing))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
