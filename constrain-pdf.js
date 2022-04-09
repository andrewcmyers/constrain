/* Requires: Constrain */

Constrain.PDF = function() {

const colorTable = {
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

const PSFontStyles = {
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
    "Palatino" : ["Roman", "Italic", "Bold", "Bold Italic"],
    "Stempel Garamond" : ["Roman", "Italic", "Bold", "Bold Italic"],
    "Tekton" : ["Regular"],
    "Times New Roman" : ["Regular", "Italic", "Bold", "Bold Italic"],
    "Times" : ["Roman", "Italic", "Bold", "Bold Italic"],
    "Wingdings" : [],
}

/** Maps Unicode code points to the corresponding Symbol font position. */
const UnicodeToSymbol = {
    0x0020: 0x20, 0x00A0: 0x20, 0x0021: 0x21, 0x2200: 0x22, 0x0023: 0x23,
    0x2203: 0x24, 0x0025: 0x25, 0x0026: 0x26, 0x220B: 0x27, 0x0028: 0x28,
    0x0029: 0x29, 0x2217: 0x2A, 0x002B: 0x2B, 0x002C: 0x2C, 0x2212: 0x2D,
    0x002E: 0x2E, 0x002F: 0x2F, 0x0030: 0x30, 0x0031: 0x31, 0x0032: 0x32,
    0x0033: 0x33, 0x0034: 0x34, 0x0035: 0x35, 0x0036: 0x36, 0x0037: 0x37,
    0x0038: 0x38, 0x0039: 0x39, 0x003A: 0x3A, 0x003B: 0x3B, 0x003C: 0x3C,
    0x003D: 0x3D, 0x003E: 0x3E, 0x003F: 0x3F, 0x2245: 0x40, 0x0391: 0x41,
    0x0392: 0x42, 0x03A7: 0x43, 0x0394: 0x44, 0x2206: 0x44, 0x0395: 0x45,
    0x03A6: 0x46, 0x0393: 0x47, 0x0397: 0x48, 0x0399: 0x49, 0x03D1: 0x4A,
    0x039A: 0x4B, 0x039B: 0x4C, 0x039C: 0x4D, 0x039D: 0x4E, 0x039F: 0x4F,
    0x03A0: 0x50, 0x0398: 0x51, 0x03A1: 0x52, 0x03A3: 0x53, 0x03A4: 0x54,
    0x03A5: 0x55, 0x03C2: 0x56, 0x03A9: 0x57, 0x2126: 0x57, 0x039E: 0x58,
    0x03A8: 0x59, 0x0396: 0x5A, 0x005B: 0x5B, 0x2234: 0x5C, 0x005D: 0x5D,
    0x22A5: 0x5E, 0x005F: 0x5F, 0xF8E5: 0x60, 0x03B1: 0x61, 0x03B2: 0x62,
    0x03C7: 0x63, 0x03B4: 0x64, 0x03B5: 0x65, 0x03C6: 0x66, 0x03B3: 0x67,
    0x03B7: 0x68, 0x03B9: 0x69, 0x03D5: 0x6A, 0x03BA: 0x6B, 0x03BB: 0x6C,
    0x00B5: 0x6D, 0x03BC: 0x6D, 0x03BD: 0x6E, 0x03BF: 0x6F, 0x03C0: 0x70,
    0x03B8: 0x71, 0x03C1: 0x72, 0x03C3: 0x73, 0x03C4: 0x74, 0x03C5: 0x75,
    0x03D6: 0x76, 0x03C9: 0x77, 0x03BE: 0x78, 0x03C8: 0x79, 0x03B6: 0x7A,
    0x007B: 0x7B, 0x007C: 0x7C, 0x007D: 0x7D, 0x223C: 0x7E, 0x20AC: 0xA0,
    0x03D2: 0xA1, 0x2032: 0xA2, 0x2264: 0xA3, 0x2044: 0xA4, 0x2215: 0xA4,
    0x221E: 0xA5, 0x0192: 0xA6, 0x2663: 0xA7, 0x2666: 0xA8, 0x2665: 0xA9,
    0x2660: 0xAA, 0x2194: 0xAB, 0x2190: 0xAC, 0x2191: 0xAD, 0x2192: 0xAE,
    0x2193: 0xAF, 0x00B0: 0xB0, 0x00B1: 0xB1, 0x2033: 0xB2, 0x2265: 0xB3,
    0x00D7: 0xB4, 0x221D: 0xB5, 0x2202: 0xB6, 0x2022: 0xB7, 0x00F7: 0xB8,
    0x2260: 0xB9, 0x2261: 0xBA, 0x2248: 0xBB, 0x2026: 0xBC, 0xF8E6: 0xBD,
    0xF8E7: 0xBE, 0x21B5: 0xBF, 0x2135: 0xC0, 0x2111: 0xC1, 0x211C: 0xC2,
    0x2118: 0xC3, 0x2297: 0xC4, 0x2295: 0xC5, 0x2205: 0xC6, 0x2229: 0xC7,
    0x222A: 0xC8, 0x2283: 0xC9, 0x2287: 0xCA, 0x2284: 0xCB, 0x2282: 0xCC,
    0x2286: 0xCD, 0x2208: 0xCE, 0x2209: 0xCF, 0x2220: 0xD0, 0x2207: 0xD1,
    0xF6DA: 0xD2, 0xF6D9: 0xD3, 0xF6DB: 0xD4, 0x220F: 0xD5, 0x221A: 0xD6,
    0x22C5: 0xD7, 0x00AC: 0xD8, 0x2227: 0xD9, 0x2228: 0xDA, 0x21D4: 0xDB,
    0x21D0: 0xDC, 0x21D1: 0xDD, 0x21D2: 0xDE, 0x21D3: 0xDF, 0x25CA: 0xE0,
    0x2329: 0xE1, 0xF8E8: 0xE2, 0xF8E9: 0xE3, 0xF8EA: 0xE4, 0x2211: 0xE5,
    0xF8EB: 0xE6, 0xF8EC: 0xE7, 0xF8ED: 0xE8, 0xF8EE: 0xE9, 0xF8EF: 0xEA,
    0xF8F0: 0xEB, 0xF8F1: 0xEC, 0xF8F2: 0xED, 0xF8F3: 0xEE, 0xF8F4: 0xEF,
    0x232A: 0xF1, 0x222B: 0xF2, 0x2320: 0xF3, 0xF8F5: 0xF4, 0x2321: 0xF5,
    0xF8F6: 0xF6, 0xF8F7: 0xF7, 0xF8F8: 0xF8, 0xF8F9: 0xF9, 0xF8FA: 0xFA,
    0xF8FB: 0xFB, 0xF8FC: 0xFC, 0xF8FD: 0xFD, 0xF8FE: 0xFE
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

function override_jsPDF(jspdf, ctx, figure) {
    const prototype = jspdf.context2d.constructor.prototype,
        Point = jspdf.internal.Point

    // Allow recognizing special contexts
    prototype.printMedia = true

    // setLineDash() is not implemented correctly by jsPDF.Context2d
    prototype.setLineDash = function(pattern) {
        this.ctx.lineDash = pattern
        jspdf.setLineDashPattern(pattern.map(x => x * figure.scale))
    }
    // getLineDash() is not implemented by jsPDF.context2d
    prototype.getLineDash = function() {
        const r = this.ctx.lineDash
        if (!r) return []
        if (r.length % 2 == 0) return r
        else return r.concat(r)
    }

    // Need to use original context to make text measurements correct
    prototype.measureText = function(s) {
        ctx.font = this.font
        return ctx.measureText(s)
    }
    // Remove extra path segment that Context2d.closePath() adds for
    // some reason.
    prototype.closePath = function() {
        let pathBegin = new Point(0, 0)
        for (let i = this.path.length - 1; i >= 0; i--) {
        if (this.path[i].type === "begin") {
            if (typeof this.path[i + 1] === "object" && typeof this.path[i + 1].x === "number") {
                pathBegin = new Point(this.path[i + 1].x, this.path[i + 1].y)
                this.path.push({
                    type: "lt",
                    x: pathBegin.x,
                    y: pathBegin.y
                })
                break
            }
        }
        }
        this.path.push({ type: "close" })
        this.ctx.lastPoint = new Point(pathBegin.x, pathBegin.y)
    }
    prototype.rect = function(x, y, w, h) {
        if (isNaN(x) || isNaN(y) || isNaN(w) || isNaN(h)) {
        console.error("jsPDF.context2d.rect: Invalid arguments", arguments)
        throw new Error("Invalid arguments passed to jsPDF.context2d.rect")
        }
        this.moveTo(x, y)
        this.lineTo(x + w, y)
        this.lineTo(x + w, y + h)
        this.lineTo(x, y + h)
        this.closePath()
    }
    prototype.clip = function(rule) {
        jspdf.clip(rule)
    }
}

class PrintJob {
    constructor(figure) {
        this.figure = figure
        this.fonts = []
        this.fontFiles = []
    }
    addFont(filename, family, variant, fontWeight, encoding) {
        this.fonts.push([filename, family, variant, fontWeight, encoding])
        return this
    }
    addFontFile(filename, data) {
        this.fontFiles.push([filename, data])
        return this
    }
    print() {
        const figure = this.figure
        const save_ctx = figure.ctx
        const orientation = (figure.width > figure.height) ? "l" : "p"
        const unit = "px"
        const output = new jspdf.jsPDF({
               orientation,
               unit,
               format: [figure.width * figure.scale, figure.height * figure.scale],
               hot_fixes: ["px_scaling"]
            })
        for (let [filename, data] of this.fontFiles) {
            output.addFileToVFS(filename, data)
        }
        for (let [filename, family, variant, fontWeight, encoding] of this.fonts) {
            output.addFont(filename, family, variant, fontWeight, encoding)
        }
        const pc = output.context2d
        override_jsPDF(output, save_ctx, figure)
        figure.ctx = pc

        figure.render(false)
        output.save("constrain-figure.pdf")

        figure.ctx = save_ctx;
        figure.render(false)
    }
}


class PrintButton extends Constrain.Button {
    constructor(figure) {
        super(figure)
        this.printJob = new PrintJob(figure)
    }
    render() {
        const figure = this.figure, ctx = figure.ctx, valuation = figure.currentValuation
        if (ctx.printMedia) return
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
        ctx.fillStyle = "#444"
        ctx.font = "10px Helvetica, Arial"
        ctx.fillText("PDF", -8, 0)
        ctx.restore()
    }
    activate() {
        this.printJob.print()
    }
    addFont(filename, family, variant, fontWeight, encoding) {
        this.printJob.addFont(filename, family, variant, fontWeight, encoding)
        return this
    }
    addFontFile(filename, data) {
        this.printJob.addFontFile(filename, data)
        return this
    }
}

function PSquote(s) {
    return "(" + s.replace(")", "\\)") + ")" // TODO
}
function mround(x) {
    return Math.round(x * 1000)/1000;
}

let PX_TO_PT = 96/72

function mapStyle(fontname, style) {
    if (!style) {
        const styles = PSFontStyles[fontname]
        if (!styles) return undefined;
        if (styles.length > 0) {
            return styles[0]
        }
    }
    return style[0].toUpperCase() + style.substr(1)
}

  return {
     PrintJob,
     PrintButton,
     colorTable
  }
}()
