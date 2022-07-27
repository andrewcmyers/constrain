(() => {

  class MathJaxImage extends Constrain.GraphicalObject {
    constructor(figure, input, displayMath) {
        super(figure)
        MathJax.texReset()
        const s = document.createElement('span')
        const options = MathJax.getMetricsFor(s)
        options.display = displayMath
        this.svg = MathJax.tex2svg(input, displayMath).childNodes[0]
        const data = new XMLSerializer().serializeToString(this.svg);
        this.img = document.createElement('img')
        this.img.src = "data:image/svg+xml;base64, " + window.btoa(unescape(encodeURIComponent(data)));
        figure.equal(this.x1(), figure.plus(this.x0(), this.img.width))
        figure.equal(this.y1(), figure.plus(this.y0(), this.img.height))
        // console.log(`MathJax figure size: ${this.img.width} x ${this.img.height}`)
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
