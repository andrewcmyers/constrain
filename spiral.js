const canvas = document.getElementsByTagName("canvas")[0]

fullWindowCanvas(canvas)

const figure = new Figure(canvas)

with (figure) {
var border = rectangle("gray", "white", 1, 500, 500, 1000, 1000),
    h = handle("yellow", 300, 300)

// makeEq(border.h(), canvas.height/2, 0.01)
    makeEq(border.x(), figure.canvasSize().x())
    makeEq(border.y(), figure.canvasSize().y())
    align("left", "top", h, border)

class SpiralPiece extends Square {
    constructor(figure, style, side) {
       super(figure, style, "white", 1, 300, 300, 300)
       this.side = side
    }
    render(valuation) {
        super.render(valuation)
        let [x0, x1, y0, y1] = evaluate([this.x0(), this.x1(), this.y0(), this.y1()], valuation)
        let ax = x0, ay = y0, bx = x0, by = y1, cx = x1, cy = y1, dx = x1, dy = y0, s = this.side
        while (s--) {
            const tx = ax, ty = ay
            ax = bx; ay = by; bx = cx; by = cy; cx = dx; cy = dy; dx = tx; dy = ty
        }
        const ctx = this.figure.ctx
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.quadraticCurveTo(bx, by, cx, cy)
        ctx.strokeStyle = "yellow"
        ctx.lineWidth = scale*Math.sqrt(x1-x0)/5
        ctx.stroke()
    }
}
var leftE = border.x0(), rightE = border.x1(), topE = border.y0(), bottomE = border.y1(), steps = 16
for (let i = 0; i < steps; i++) {
    let b2 = new SpiralPiece(figure, rgbStyle(Math.sqrt((i+1)/steps)*255,0,0), i%4)
    let le = leftE, re = rightE, te = topE, be = bottomE

    if (i%4 == 0) le = b2.x1()
      else makeEq(b2.x1(), rightE)
    if (i%4 == 1) be = b2.y0()
      else makeEq(b2.y0(), topE)
    if (i%4 == 2) re = b2.x0()
      else makeEq(b2.x0(), leftE)
    if (i%4 == 3) te = b2.y1()
      else makeEq(b2.y1(), bottomE)
    leftE = le
    rightE = re
    topE = te
    bottomE = be
}

figure.tempConstraints.push(new Constraint(new Minus(border.w(), canvasSize().x())))
figure.currentValuation = updateValuation()
figure.tempConstraints = []

let phi = evaluate(new DividedBy(border.w(), border.h()), figure.currentValuation),
    t = text("The Golden Ratio is approximately " + phi, 30, "Palatino", "yellow", undefined, 1, canvas.width/2, 100)
align("center", "none", t, border)
align("none", "top", t, figure.canvasSize())

}
figure.start()
