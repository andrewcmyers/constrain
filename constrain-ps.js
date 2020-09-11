/* Requires: Constrain */

Constrain.PS = function() {

var colorTable = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred ": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "rebeccapurple": "#663399",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
}

var PSFonts = {
    "Apple Chancery" : [],
    "Arial" : ["Regular", "Italic", "Bold", "Bold Italic"],
    "Bodoni" : ["Roman", "Italic", "Bold", "Bold Italic", "Poster", "Poster Compressed"],
    "Carta" : [],
    "Chicago" : [],
    "Clarendon" : ["Light", "Roman", "Bold"],
    "Cooper Black" : [],
    "Cooper Black Italic" : [],
    "Copperplate Gothic" : [],
    "Coronet" : [],
    "Eurostile" : ["Medium", "Bold", "Extended No.2", "Bold Extended No.2"],
    "Geneva" : [],
    "Gill Sans" : ["Light", "Light Italic", "Book", "Book Italic",
                    "Bold", "Bold Italic", "Extra Bold", "Condensed",
                    "Condensed Bold"],
    "Goudy" : ["Oldstyle", "Oldstyle Italic", "Bold", "Bold Italic", "Extra Bold"],
    "Helvetica" : ["Narrow", "Narrow Oblique", "Narrow Bold", "Narrow Bold Oblique"],
    "Hoefler Text" : ["Roman", "Italic", "Black", "Black Italic"],
    "Hoefler Ornaments" : [],
    "Joanna" : ["Regular", "Italic", "Bold", "Bold Italic"],
    "Letter Gothic" : ["Regular", "Slanted", "Bold", "Bold Slanted"],
    "ITC Lubalin Graph" : ["Book", "Oblique", "Demi", "Demi Oblique"],
    "ITC Mona Lisa Recut" : [],
    "Marigold" : [],
    "Monaco" : [],
    "New York" : [],
    "Optima" : ["Roman", "Italic", "Bold", "Bold Italic"],
    "Oxford" : [],
    "Stempel Garamond" : ["Roman", "Italic", "Bold", "Bold Italic"],
    "Tekton" : ["Regular"],
    "Times New Roman" : ["Regular", "Italic", "Bold", "Bold Italic"],
    "Wingdings" : [],
}

function colorToRGB(s) {
  let hex
  if (s[0] == "#") {
    hex = s
  } else {
    hex = colorTable[s.toLowerCase()]
    if (!hex) return [128, 128, 128]
  }
  let r, g, b
  if (hex.length == 4) {
    r = parseInt(hex[1], 16) * 17
    g = parseInt(hex[2], 16) * 17
    b = parseInt(hex[3], 16) * 17
  } else {
    r = parseInt(hex.substr(1, 2), 16)
    g = parseInt(hex.substr(3, 2), 16)
    b = parseInt(hex.substr(5, 2), 16)
  }
  return [r, g, b]
}

class PrintButton extends Constrain.Button {
    constructor(figure) {
        super(figure)
    }
    render() {
        const figure = this.figure, ctx = figure.ctx, valuation = figure.currentValuation
        if (ctx.constructor == PrintContext) return
        const s = this.size
        ctx.beginPath()
        const x = Constrain.evaluate(this.x(), valuation),
              y = Constrain.evaluate(this.y(), valuation)
        ctx.save()
        ctx.translate(x - s * 0.5, y - s*0.3)
        Constrain.Paths.roundedRect(ctx, 0, s, 0, s*0.8, s*0.1)
        if (this.pressed)
            ctx.fillStyle = "#888"
        else
            ctx.fillStyle = this.fillStyle
        ctx.fill()
        ctx.strokeStyle = this.strokeStyle
        ctx.lineWidth = s/10
        ctx.setLineDash([])
        ctx.stroke()

        ctx.translate(s * 0.5, s*0.4)
        ctx.fillStyle = "white"
        ctx.beginPath()
        ctx.fillRect(-8, -8, 16, 16)
        ctx.strokeStyle = "black"
        ctx.lineWidth = 1
        ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-4, -3); ctx.lineTo(6, -3); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(6, 0); ctx.stroke()
        ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(4, 3); ctx.stroke()
        ctx.restore()
    }
    activate() {
        this.figure.print()
    }
}

function PSquote(s) {
    return "(" + s.replace(")", "\\)") + ")" // TODO
}
function mround(x) {
    return Math.round(x * 1000)/1000;
}

class PrintContext {
    constructor(figure, ctx2d) {
        this.figure = figure
        this.ctx2d = ctx2d
        this.output = ""
        this.append("%!PS-Adobe-2.0")
        this.append("%%Creator: Constrain PostScript Renderer")
        this.append("%%Pages: 1")
        this.append("%%PageOrder: Ascend")
        this.append(`%%BoundingBox: 0 0 ${Math.round(figure.width)} ${Math.round(figure.height)}`)
        this.append(`%%HiResBoundingBox: 0 0 ${figure.width} ${(figure.height)}`)
        this.append(`%%PageSize: 0 0 ${Math.round(figure.width)} ${Math.round(figure.height)}`)
        this.append("%%EndComments")
        this.append("%%BeginProlog")
        this.append("%%EndProlog")
        this.append("%%BeginSetup")
        this.append("%%EndSetup")
        this.append("%%Page: 1 1")
        this.append("/Helvetica findfont 12 scalefont setfont")
        this.activeFillStyle = null
        this.activeStrokeStyle = null
        this.activeLineWidth = null
        this.activeFont = null
        this.fillStyle = "black"
        this.strokeStyle = "black"
        this.lineWidth = 1
        figure.font.setContextFont(this)
    }

    append(s) {
        this.output += s
        this.output += "\n"
    }
    updateLineWidth() {
        if (this.lineWidth != this.activeLineWidth) {
            this.activeLineWidth = this.lineWidth
            this.append(`${this.lineWidth} setlinewidth`)
        }
    }
    updateFillStyle() {
        if (this.fillStyle != this.activeFillStyle) {
            this.activeFillStyle = this.fillStyle
            this.activeStrokeStyle = this.fillStyle
            const [r, g, b] = colorToRGB(this.fillStyle)
            this.append(`${mround(r/255)} ${mround(g/255)} ${mround(b/255)} setrgbcolor`)
        }
    }
    updateStrokeStyle() {
        if (this.strokeStyle && this.strokeStyle != this.activeStrokeStyle) {
            this.activeFillStyle = this.strokeStyle
            this.activeStrokeStyle = this.strokeStyle
            const [r, g, b] = colorToRGB(this.strokeStyle)
            this.append(`${mround(r/255)} ${mround(g/255)} ${mround(b/255)} setrgbcolor`)
        }
    }
    updateFont() {
        if (this.font && this.font != this.activeFont) {
            this.activeFont = this.font
            let ignore, style, size
            let fontname = this.font
            let nostyle = fontname.match("^([0-9]+pt) ([A-Za-z-]+)$")
            if (nostyle) {
                [ignore, size, name] = nostyle
            } else {
               let with_style = fontname.match("^([A-Za-z]+) ([0-9]+)pt ([A-Z][A-Za-z- ]*)$")
               if (!with_style) return;
               [ignore, style, size, fontname] = with_style
               style = style[0].toUpperCase() + style.substr(1)
            }
            fontname = fontname.replace(" ", "")
            if (style) {
                fontname += "-" + style
            }
            this.append(`/${fontname} findfont ${size} scalefont setfont`)
        }
    }

    pt(x, y) {
        return `${mround(x)} ${mround(figure.height - y)}`
    }

    setTransform() {
    }
    clearRect(x, y, w, h) {
        this.append("1 setgray")
        this.append(`${this.pt(x,y-h)} ${w} ${h} rectfill`)
        this.append("0 setgray")
    }
    save() {
        this.append("gsave")
    }
    restore() {
        this.append("grestore")
        this.activeStrokeStyle = null
        this.activeFillStyle = null
        this.activeLineWidth = null
    }
    translate(x, y) {
        this.append(`${mround(x)} ${mround(-y)} translate`)
    }
    beginPath() {
        this.append("newpath")
    }
    closePath() {
        this.append("closepath")
    }
    moveTo(x, y) {
        this.append(`${this.pt(x,y)} moveto`)
    }
    lineTo(x, y) {
        this.append(`${this.pt(x,y)} lineto`)
    }
    stroke() {
        this.updateStrokeStyle()
        this.updateLineWidth()
        this.append("gsave stroke grestore")
    }
    fill() {
        this.updateFillStyle()
        this.append("gsave fill grestore")
    }
    setLineDash(s) {
        this.append("[")
        for (let i = 0; i < s.length; i++) {
            this.append(" ${s[i]}")
        }
        this.append(" ] 0 setdash")
    }
    measureText(s) {
        this.ctx2d.font = this.font
        return this.ctx2d.measureText(s)
    }
    fillText(s, x, y) {
        this.updateFont()
        this.append(`${this.pt(x,y)} moveto`)
        this.append(`${PSquote(s)} show`)
    }
    rotate(r) { 
        if (r != 0) {
            this.append(`0 ${figure.height} translate`)
            this.append(`${mround(r * -57.29578)} rotate`)
            this.append(`0 ${-figure.height} translate`)
        }
    }
    bezierCurveTo(x1, y1, x2, y2, x3, y3) {
        this.append(`${this.pt(x1,y1)} ${this.pt(x2,y2)} ${this.pt(x3,y3)} curveto`)
    }
    fillRect(x, y, w, h) {
        this.append(`${this.pt(x,y-h)} ${w} ${h} rectfill`)
    }
    getOutput() {
        return this.output + "\nshowpage\n%%EOF\n"
    }
}

// export string data as file of type ty.
function exportData(data, filename, ty) {
    var blob = new Blob([data], {type: ty });
    if (window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    } else {
        var elem = document.createElement("a")
        elem.href = window.URL.createObjectURL(blob)
        elem.download = filename
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

Constrain.Figure.prototype.print = function() {
    const save_ctx = this.ctx
    const pc = new PrintContext(this, this.ctx)
    this.ctx = pc

    this.render(false)
    exportData(pc.getOutput(), "constrain-figure.ps", "application/postscript")

    this.ctx = save_ctx;
    this.render(false)
}

  return {
     PrintButton: PrintButton,
     PrintContext: PrintContext,
     colorTable: colorTable
  }
}()
