#!/usr/bin/env python3
"""Present-Service vector lettering reconstructed from the user's official 212x33 logo.
The uploaded PNG has too few pixels for a faithful auto-trace of lettering.
This builds genuine clean Lato OFL glyph outlines, preserving the original
wording, colors, placement and 212:33 proportions. Icon contours are smoothed
from the uploaded magenta logo mark's alpha mask. No fonts/raster data are
embedded in the final SVG. This is not a brand master file.
"""
from pathlib import Path
from base64 import b85decode
from zlib import decompress
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
import cv2
import numpy as np

ROOT=Path(__file__).resolve().parent.parent
TARGET=ROOT/"assets"/"present-service-logo.svg"
USER_UPLOADED_MARK_ALPHA_B85="c-oy)%Z<b!40Q>VKm}0>*p)c1<}k;R_LB3SD8VIA0wqv_OP~ZwpaV}JkN}A^%DzM7n1}K62cUvvF@zUzftg*gke4fhWquYW`|;3`!N?qQXwS@Oh}w4+-e48XSZwS<Q1S9^g+5VvBB&t?90+bqa~TLY62ka|?9bI?JA#{r974pIc0y1~j8z3C_~Olk!u9z??%CzIW+kNW4zu;3BBBJD;#5#>ZsS<H)bNWGY#jC*rtUupY_31-nge~&;nJzoMMczlQ^EL~$`-PUB31;pk8srC564ofm+LA?Kg*|Hh!5S=aC08!(?mVt)=cV)sW#nSI81x7-AXYKEs67HsXF2Guib<rriVLt0}CqE+W"
mark=np.frombuffer(decompress(b85decode(USER_UPLOADED_MARK_ALPHA_B85)),dtype=np.uint8).reshape((32,33))

SCALE=12
scaled=cv2.resize(mark,None,fx=SCALE,fy=SCALE,interpolation=cv2.INTER_CUBIC)
blurred=cv2.GaussianBlur(scaled,(0,0),2.25)
_,thresholded=cv2.threshold(blurred,117,255,cv2.THRESH_BINARY)
contours,_=cv2.findContours(thresholded,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
mark_paths=[]
for contour in contours:
    if cv2.contourArea(contour)<35*SCALE*SCALE:
        continue
    nodes=cv2.approxPolyDP(contour,epsilon=SCALE*0.42,closed=True).reshape(-1,2)/SCALE
    mark_paths.append("M"+"L".join(f"{x:.2f},{y:.2f}" for x,y in nodes)+"Z")
assert len(mark_paths)==2,"Expected two halves of the original snowflake icon"

def outlined_text(font_path,content,x,y,width,height,fill):
    font=TTFont(font_path)
    glyph_set=font.getGlyphSet()
    glyph_map=font.getBestCmap()
    advances=font["hmtx"].metrics
    kerning={}
    if "kern" in font:
        for table in font["kern"].kernTables:
            if getattr(table,"version",None)==0:
                kerning.update(table.kernTable)
    svg_pen=SVGPathPen(glyph_set)
    bounds_pen=BoundsPen(glyph_set)
    advance=0
    bbox_advance=0
    last=None
    for char in content:
        glyph_name=glyph_map[ord(char)]
        if last is not None:
            advance+=kerning.get((last,glyph_name),0)
        glyph_set[glyph_name].draw(TransformPen(svg_pen,(1,0,0,1,advance,0)))
        glyph_set[glyph_name].draw(TransformPen(bounds_pen,(1,0,0,1,bbox_advance,0)))
        advance+=advances[glyph_name][0]
        bbox_advance+=advances[glyph_name][0]
        last=glyph_name
    x_min,y_min,x_max,y_max=bounds_pen.bounds
    scale_x=width/(x_max-x_min)
    scale_y=height/(y_max-y_min)
    offset_x=x-scale_x*x_min
    offset_y=y+height+scale_y*y_min
    matrix=f"matrix({scale_x:.9f} 0 0 {-scale_y:.9f} {offset_x:.8f} {offset_y:.8f})"
    return f'<path fill="{fill}" transform="{matrix}" d="{svg_pen.getCommands()}"/>'

main_font="/usr/share/fonts/truetype/lato/Lato-Regular.ttf"
sub_font="/usr/share/fonts/truetype/lato/Lato-Medium.ttf"
assert Path(main_font).exists() and Path(sub_font).exists(),"Install fonts-lato"
svg="".join([
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 212 33" width="212" height="33" role="img" aria-labelledby="logoTitle">',
    '<title id="logoTitle">Present Service – Marketing Communication</title>',
    '<path fill="#C21875" d="'+"".join(mark_paths)+'"/>',
    outlined_text(main_font,"PRESENT SERVICE",35,3,176,14,"#C21875"),
    outlined_text(sub_font,"Marketing Communication",35,20,176,12,"#6C6867"),
    '</svg>\n'
])
TARGET.write_text(svg,encoding="utf-8")
print("Vector logo generated from user-supplied logo mask:",TARGET.name,len(svg),"bytes")
assert "<image" not in svg and "base64" not in svg
