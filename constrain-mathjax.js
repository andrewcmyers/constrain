(() => {

  function svg_length(len, figure) {
    const s = figure.getFontSize(), v = len.valueInSpecifiedUnits
    switch (len.unitType) {
        case 0: return v
        case 1: return v
        case 2: return v
        case 3: return v * s
        case 4: return v * s / 2
        case 5: return v
        case 6: return v * (96/2.54)
        case 7: return v * (96/25.4)
        case 8: return v * 96
        case 9: return v * (4/3)
        case 10: return v * 16
    }
  }

  class MathJaxImage extends Constrain.Graphic {
    constructor(figure, input, displayMath) {
        super(figure)
        MathJax.texReset()
        const svg = MathJax.tex2svg(input, displayMath).childNodes[0],
              data = new XMLSerializer().serializeToString(svg)
        this.img = document.createElement('img')
        this.img.src = "data:image/svg+xml;base64, " + window.btoa(unescape(encodeURIComponent(data)))
        const w = svg_length(svg.width.baseVal, figure),
              h = svg_length(svg.height.baseVal, figure)

        figure.equal(this.x1(), figure.plus(this.x0(), w))
        figure.equal(this.y1(), figure.plus(this.y0(), h))
        // console.log(`MathJax figure size: ${this.img.width} x ${this.img.height}: ${data}`)
    }
    render() {
        const figure = this.figure, ctx = figure.ctx, valuation = figure.currentValuation
        const [x0, x1, y0, y1] = Constrain.evaluate([this.x0(), this.x1(), this.y0(), this.y1()], valuation)

        // console.log(`Rendering MathJax content at (${x0}, ${y0})`)
        ctx.drawImage(this.img, x0, y0, x1 - x0, y1 - y0)
    }
  }

  Constrain.Figure.prototype.mathJax = function(texmath) {
    return new MathJaxImage(this, texmath)
  }

})()
